/* =========================================================
   «Мировая кухня»: ~600 рецептов с настоящими фото из TheMealDB (бесплатный API для личного использования).
   Каталог хранится на устройстве (IndexedDB) и обновляется раз в 2 недели.
   Перевод на русский делает ИИ по ключу из настроек: названия — пачками, рецепт — при открытии; всё сохраняется.
   ========================================================= */
const MDB = 'https://www.themealdb.com/api/json/v1/1/';
const MDB_CAT = { Beef: 'Говядина', Chicken: 'Курица', Dessert: 'Десерты', Lamb: 'Баранина', Miscellaneous: 'Разное', Pasta: 'Паста', Pork: 'Свинина', Seafood: 'Рыба и морепродукты', Side: 'Гарниры', Starter: 'Закуски', Vegan: 'Веганское', Vegetarian: 'Вегетарианское', Breakfast: 'Завтраки', Goat: 'Козлятина' };
const MDB_AREA = { American: 'американская', British: 'британская', Canadian: 'канадская', Chinese: 'китайская', Croatian: 'хорватская', Dutch: 'голландская', Egyptian: 'египетская', Filipino: 'филиппинская', French: 'французская', Greek: 'греческая', Indian: 'индийская', Irish: 'ирландская', Italian: 'итальянская', Jamaican: 'ямайская', Japanese: 'японская', Kenyan: 'кенийская', Malaysian: 'малайзийская', Mexican: 'мексиканская', Moroccan: 'марокканская', Polish: 'польская', Portuguese: 'португальская', Russian: 'русская', Spanish: 'испанская', Thai: 'тайская', Tunisian: 'тунисская', Turkish: 'турецкая', Ukrainian: 'украинская', Vietnamese: 'вьетнамская', Uruguayan: 'уругвайская', Argentinian: 'аргентинская', Australian: 'австралийская', Norwegian: 'норвежская', Algerian: 'алжирская', Syrian: 'сирийская', Venezulan: 'венесуэльская', Slovakian: 'словацкая', 'Saudi Arabian': 'саудовская', Indonesian: 'индонезийская', Georgian: 'грузинская' };
let mdb = null, mdbRu = {}, mdbState = 'idle', mdbCat = 'all', mdbQ = '', mdbShow = 24, mdbBusy = false;

function mdbCompact(m) {
  const ing = [];
  for (let i = 1; i <= 20; i++) { const n = (m['strIngredient' + i] || '').trim(); if (n) ing.push([n, (m['strMeasure' + i] || '').trim()]); }
  return { id: m.idMeal, t: m.strMeal, cat: m.strCategory, area: m.strArea, img: m.strMealThumb, ing, ins: m.strInstructions || '', yt: m.strYoutube || '', src: m.strSource || '' };
}
async function loadMealDB(force) {
  if (mdbState === 'loading') return;
  mdbState = 'loading';
  try {
    if (!mdb) { mdb = await idb.get('mealdb'); mdbRu = (await idb.get('mealdb-ru')) || {}; }
    const fresh = mdb && Date.now() - mdb.ts < 14 * 864e5 && mdb.meals.length > 100;
    if ((fresh && !force) || !navigator.onLine) { mdbState = mdb ? 'ok' : 'offline'; return; }
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split(''), all = new Map();
    for (let i = 0; i < letters.length; i += 6) {
      const res = await Promise.all(letters.slice(i, i + 6).map(l => fetch(MDB + 'search.php?f=' + l).then(r => r.json()).catch(() => null)));
      res.forEach(j => (j?.meals || []).forEach(m => all.set(m.idMeal, mdbCompact(m))));
    }
    if (all.size) { mdb = { ts: Date.now(), meals: [...all.values()].sort((a, b) => a.t.localeCompare(b.t)) }; await idb.set('mealdb', mdb); }
    mdbState = mdb ? 'ok' : 'error';
  } catch (e) { mdbState = mdb ? 'ok' : 'error'; }
  if (tab === 'food' && foodTab === 'world') render();
  translateTitles();
}
const mdbTitle = m => mdbRu[m.id]?.t || m.t;
const mdbSaveRu = () => idb.set('mealdb-ru', mdbRu);

async function aiJSON(prompt, maxTokens = 4000) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': state.settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: state.settings.model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
  });
  const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || 'Ошибка ' + r.status);
  const txt = j.content.map(c => c.text || '').join('');
  return JSON.parse(txt.match(/[\[{][\s\S]*[\]}]/)[0]);
}
/* названия — пачками по 150, один раз */
async function translateTitles() {
  if (mdbBusy || !mdb || !state.settings.apiKey || !navigator.onLine) return;
  const todo = mdb.meals.filter(m => !mdbRu[m.id]?.t);
  if (!todo.length) return;
  mdbBusy = true;
  try {
    for (let i = 0; i < todo.length; i += 150) {
      const part = todo.slice(i, i + 150);
      const out = await aiJSON(`Переведи названия блюд на русский так, как их назвали бы в русском меню (известные блюда — общепринятым названием: Lasagne → Лазанья). Ответь ТОЛЬКО JSON-объектом {"id":"название"}.\n${JSON.stringify(Object.fromEntries(part.map(m => [m.id, m.t])))}`);
      for (const [id, t] of Object.entries(out)) if (typeof t === 'string') mdbRu[id] = { ...(mdbRu[id] || {}), t };
      await mdbSaveRu();
      if (tab === 'food' && foodTab === 'world' && !$('#sheet.open, #scrim.open')) render();
    }
  } catch (e) { /* без интернета или без ключа — останутся английские названия */ }
  mdbBusy = false;
}
/* полный рецепт — при открытии */
async function translateMeal(m) {
  const out = await aiJSON(`Переведи рецепт на русский и адаптируй для русской кухни: меры — в граммы, мл, ложки и штуки; шаги — короткие, понятные, по порядку. Оцени КБЖУ одной порции.
Ответь ТОЛЬКО JSON: {"t":"название","serv":число порций,"time":минут всего,"ing":["200 г говяжьего фарша", ...],"steps":["шаг", ...],"kcal":число,"p":белки г,"f":жиры г,"c":углеводы г,"tip":"один совет повара"}
Рецепт: ${JSON.stringify({ name: m.t, category: m.cat, ingredients: m.ing.map(([n, q]) => `${q} ${n}`.trim()), instructions: m.ins })}`);
  mdbRu[m.id] = { ...(mdbRu[m.id] || {}), ...out, full: 1 };
  await mdbSaveRu();
}

function mdbFiltered() {
  if (!mdb) return [];
  const q = mdbQ.trim().toLowerCase();
  return mdb.meals.filter(m => (mdbCat === 'all' || m.cat === mdbCat) &&
    (!q || mdbTitle(m).toLowerCase().includes(q) || m.t.toLowerCase().includes(q) || m.ing.some(([n]) => n.toLowerCase().includes(q)) || (mdbRu[m.id]?.ing || []).some(x => x.toLowerCase().includes(q))));
}
function foodWorld() {
  if (!mdb && mdbState !== 'loading') loadMealDB();
  if (!mdb) return `<div class="panel"><h2>Мировая кухня</h2><p>${mdbState === 'offline' ? 'Каталог загрузится, когда появится интернет. Потом он будет работать и без сети.' : mdbState === 'error' ? 'Не удалось загрузить каталог. <button class="btn small light" data-act="mdbreload">Попробовать ещё раз</button>' : 'Загружаю около 600 рецептов с фото… это нужно один раз.'}</p></div>`;
  const list = mdbFiltered(), hasKey = !!state.settings.apiKey;
  const left = mdb.meals.filter(m => !mdbRu[m.id]?.t).length;
  return `<div class="panel"><h2>Мировая кухня · ${mdb.meals.length} рецептов</h2>
    <p>Настоящие фото блюд из TheMealDB. ${hasKey ? (left ? `Перевожу названия на русский… осталось ${left}.` : 'Рецепт переводится на русский при открытии — и сохраняется.') : 'Тексты на английском. Добавь ключ Claude API в настройках — и рецепты будут на русском.'}</p>
    <input class="inp" id="mdbq" placeholder="Поиск: курица, паста, chicken…" value="${esc(mdbQ)}" autocomplete="off">
    <div class="chips" style="margin-top:10px"><button class="chip ${mdbCat === 'all' ? 'on' : ''}" data-act="mdbcat" data-v="all">Все</button>${Object.entries(MDB_CAT).filter(([k]) => mdb.meals.some(m => m.cat === k)).map(([k, n]) => `<button class="chip ${mdbCat === k ? 'on' : ''}" data-act="mdbcat" data-v="${k}">${n}</button>`).join('')}</div></div>
  <div class="grid2 rlist mdb">${list.slice(0, mdbShow).map(m => `<button class="rcard" data-act="mdbopen" data-v="${m.id}"><div class="pbox"><img class="on" alt="" loading="lazy" decoding="async" src="${esc(m.img)}/medium" onerror="this.src='${esc(m.img)}'"></div>
    <div class="rc-b"><div class="rtop"><b>${esc(mdbTitle(m))}</b></div><div class="rmeta">${MDB_CAT[m.cat] || esc(m.cat || '')}${m.area && m.area !== 'Unknown' ? ` · ${MDB_AREA[m.area] || esc(m.area)} кухня` : ''}${mdbRu[m.id]?.kcal ? ` · ${mdbRu[m.id].kcal} ккал` : ''}</div></div></button>`).join('') || '<div class="empty"><p style="margin:0">Ничего не нашлось.</p></div>'}</div>
  ${list.length > mdbShow ? `<div class="btnrow" style="justify-content:center"><button class="btn light" data-act="mdbmore">Показать ещё · осталось ${list.length - mdbShow}</button></div>` : ''}
  <p class="hint" style="text-align:center">Рецепты и фото: TheMealDB.com</p>`;
}
async function openMeal(id) {
  const m = mdb?.meals.find(x => x.id === id); if (!m) return;
  const draw = (note = '') => {
    const ru = mdbRu[m.id] || {}, full = ru.full;
    const ing = full ? ru.ing : m.ing.map(([n, q]) => `${q} ${n}`.trim());
    const steps = full ? ru.steps : m.ins.split(/\r?\n+/).map(x => x.replace(/^\s*(step\s*\d+[:.)]?|\d+[.)])\s*/i, '').trim()).filter(x => x.length > 3);
    $('#sheet').innerHTML = `<div class="pbox big"><img class="on" alt="" src="${esc(m.img)}"></div>
      <div class="sheet-h"><h2>${esc(ru.t || m.t)}</h2><button class="x" data-act="close">×</button></div>
      <div class="rmeta">${MDB_CAT[m.cat] || esc(m.cat || '')}${m.area && m.area !== 'Unknown' ? ` · ${MDB_AREA[m.area] || esc(m.area)} кухня` : ''}${full ? ` · ${ru.serv || '?'} порц. · ~${ru.time || '?'} мин` : ''}</div>
      ${full && ru.kcal ? `<div class="kpis" style="margin:12px 0"><div><span>Ккал</span><b>${ru.kcal}</b></div><div><span>Белки</span><b>${ru.p} г</b></div><div><span>Жиры</span><b>${ru.f} г</b></div><div><span>Углеводы</span><b>${ru.c} г</b></div></div><p class="hint" style="margin-top:0">КБЖУ на порцию — оценка ИИ.</p>` : ''}
      ${note ? `<div class="bubble">${note}</div>` : ''}
      <h4 class="sh">Ингредиенты</h4><ul class="ingl">${ing.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <h4 class="sh">Как готовить</h4><ol class="steps">${steps.map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ol>
      ${ru.tip ? `<div class="bubble">💡 ${esc(ru.tip)}</div>` : ''}
      <div class="btnrow">${full && ru.kcal ? `<button class="btn hot" data-act="mdbeat" data-v="${m.id}">Записать в дневник</button>` : ''}${m.yt ? `<a class="btn light" href="${esc(m.yt)}" target="_blank" rel="noopener noreferrer">Видео ↗</a>` : ''}<button class="btn light" data-act="close">Закрыть</button></div>
      <p class="hint">Источник: TheMealDB${m.src ? ` · <a href="${esc(m.src)}" target="_blank" rel="noopener noreferrer">оригинал ↗</a>` : ''}</p>`;
  };
  const ru = mdbRu[m.id];
  if (!ru?.full && state.settings.apiKey && navigator.onLine) {
    draw('Перевожу рецепт на русский…'); $('#scrim').classList.add('open');
    try { await translateMeal(m); draw(); } catch (e) { draw('Не получилось перевести: ' + esc(e.message) + '. Показываю оригинал.'); }
  } else { draw(ru?.full || state.settings.apiKey ? '' : 'Рецепт на английском. С ключом Claude API в настройках он будет переводиться на русский.'); $('#scrim').classList.add('open'); }
}
function mdbClick(act, el) {
  switch (act) {
    case 'mdbcat': mdbCat = el.dataset.v; mdbShow = 24; render(); return true;
    case 'mdbmore': { const y = window.scrollY; mdbShow += 24; render(); window.scrollTo(0, y); return true; }
    case 'mdbopen': openMeal(el.dataset.v); return true;
    case 'mdbreload': mdbState = 'idle'; loadMealDB(true); render(); return true;
    case 'mdbeat': {
      const ru = mdbRu[el.dataset.v]; if (!ru) return true;
      (state.food.log[today()] ||= []).push({ name: ru.t + ' (порция)', n: { ...zeroN(), k: +ru.kcal || 0, p: +ru.p || 0, f: +ru.f || 0, c: +ru.c || 0 } });
      save(); closeSheet(); toast('Записано в дневник'); render(); return true;
    }
  }
  return false;
}
let mdbTimer;
document.addEventListener('input', e => {
  if (e.target.id !== 'mdbq') return;
  mdbQ = e.target.value; mdbShow = 24; clearTimeout(mdbTimer);
  mdbTimer = setTimeout(() => { const pos = e.target.selectionStart; render(); const i = $('#mdbq'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }, 250);
});
