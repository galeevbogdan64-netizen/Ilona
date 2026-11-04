/* =========================================================
   «Мировая кухня»: ~600 рецептов с настоящими фото из TheMealDB (бесплатный API для личного использования).
   Каталог хранится на устройстве (IndexedDB) и обновляется раз в 2 недели.
   Перевод на русский делает ИИ по ключу из настроек: названия — пачками, рецепт — при открытии; всё сохраняется.
   ========================================================= */
const MDB = 'https://www.themealdb.com/api/json/v1/1/';
const MDB_CAT = { Beef: 'Говядина', Chicken: 'Курица', Dessert: 'Десерты', Lamb: 'Баранина', Miscellaneous: 'Разное', Pasta: 'Паста', Pork: 'Свинина', Seafood: 'Рыба и морепродукты', Side: 'Гарниры', Starter: 'Закуски', Vegan: 'Веганское', Vegetarian: 'Вегетарианское', Breakfast: 'Завтраки', Goat: 'Козлятина' };
const MDB_AREA = { American: 'американская', British: 'британская', Canadian: 'канадская', Chinese: 'китайская', Croatian: 'хорватская', Dutch: 'голландская', Egyptian: 'египетская', Filipino: 'филиппинская', French: 'французская', Greek: 'греческая', Indian: 'индийская', Irish: 'ирландская', Italian: 'итальянская', Jamaican: 'ямайская', Japanese: 'японская', Kenyan: 'кенийская', Malaysian: 'малайзийская', Mexican: 'мексиканская', Moroccan: 'марокканская', Polish: 'польская', Portuguese: 'португальская', Russian: 'русская', Spanish: 'испанская', Thai: 'тайская', Tunisian: 'тунисская', Turkish: 'турецкая', Ukrainian: 'украинская', Vietnamese: 'вьетнамская', Uruguayan: 'уругвайская', Argentinian: 'аргентинская', Australian: 'австралийская', Norwegian: 'норвежская', Algerian: 'алжирская', Syrian: 'сирийская', Venezulan: 'венесуэльская', Slovakian: 'словацкая', 'Saudi Arabian': 'саудовская', Indonesian: 'индонезийская', Georgian: 'грузинская' };
const MDB_ING = Object.fromEntries('chicken:курица|chicken breast:куриная грудка|chicken breasts:куриные грудки|chicken thighs:куриные бёдра|chicken legs:куриные ножки|chicken stock:куриный бульон|beef:говядина|minced beef:говяжий фарш|beef brisket:говяжья грудинка|beef stock:говяжий бульон|beef fillet:говяжья вырезка|pork:свинина|pork chops:свиные отбивные|bacon:бекон|ham:ветчина|sausages:колбаски|lamb:баранина|lamb mince:бараний фарш|salmon:лосось|cod:треска|tuna:тунец|prawns:креветки|king prawns:королевские креветки|shrimp:креветки|mussels:мидии|squid:кальмар|fish:рыба|white fish:белая рыба|eggs:яйца|egg:яйцо|egg yolks:яичные желтки|egg white:яичный белок|milk:молоко|butter:сливочное масло|unsalted butter:несолёное сливочное масло|cream:сливки|double cream:жирные сливки|heavy cream:жирные сливки|sour cream:сметана|yogurt:йогурт|greek yogurt:греческий йогурт|cheese:сыр|cheddar cheese:сыр чеддер|parmesan:пармезан|parmesan cheese:пармезан|mozzarella:моцарелла|feta:фета|cream cheese:сливочный сыр|ricotta:рикотта|flour:мука|plain flour:пшеничная мука|self-raising flour:мука с разрыхлителем|sugar:сахар|caster sugar:мелкий сахар|brown sugar:коричневый сахар|icing sugar:сахарная пудра|honey:мёд|salt:соль|sea salt:морская соль|pepper:перец|black pepper:чёрный перец|olive oil:оливковое масло|vegetable oil:растительное масло|sunflower oil:подсолнечное масло|sesame oil:кунжутное масло|oil:масло|water:вода|onion:лук|onions:лук|red onion:красный лук|spring onions:зелёный лук|shallots:лук-шалот|garlic:чеснок|garlic clove:зубчик чеснока|ginger:имбирь|tomato:помидор|tomatoes:помидоры|chopped tomatoes:резаные томаты|tomato puree:томатная паста|tomato ketchup:кетчуп|potatoes:картофель|potato:картофель|carrots:морковь|carrot:морковь|celery:сельдерей|cabbage:капуста|broccoli:брокколи|cauliflower:цветная капуста|spinach:шпинат|lettuce:салат|cucumber:огурец|courgettes:кабачки|zucchini:цукини|aubergine:баклажан|eggplant:баклажан|mushrooms:грибы|peas:горошек|green beans:стручковая фасоль|sweetcorn:кукуруза|red pepper:красный перец|green pepper:зелёный перец|peppers:сладкий перец|chilli:острый перец|chilli powder:молотый чили|red chilli:красный чили|lemon:лимон|lemons:лимоны|lemon juice:лимонный сок|lime:лайм|lime juice:сок лайма|orange:апельсин|apple:яблоко|apples:яблоки|banana:банан|bananas:бананы|strawberries:клубника|raspberries:малина|blueberries:черника|raisins:изюм|almonds:миндаль|walnuts:грецкие орехи|peanuts:арахис|peanut butter:арахисовая паста|chocolate:шоколад|dark chocolate:тёмный шоколад|cocoa:какао|vanilla extract:ванильный экстракт|baking powder:разрыхлитель|bicarbonate of soda:сода|yeast:дрожжи|rice:рис|basmati rice:рис басмати|risotto rice:рис для ризотто|pasta:паста|spaghetti:спагетти|penne:пенне|noodles:лапша|egg noodles:яичная лапша|bread:хлеб|breadcrumbs:панировочные сухари|tortillas:тортильи|lentils:чечевица|chickpeas:нут|kidney beans:красная фасоль|beans:фасоль|soy sauce:соевый соус|fish sauce:рыбный соус|worcestershire sauce:вустерширский соус|vinegar:уксус|white wine vinegar:винный уксус|red wine:красное вино|white wine:белое вино|mustard:горчица|dijon mustard:дижонская горчица|mayonnaise:майонез|stock:бульон|vegetable stock:овощной бульон|parsley:петрушка|coriander:кинза|basil:базилик|thyme:тимьян|rosemary:розмарин|oregano:орегано|bay leaf:лавровый лист|bay leaves:лавровый лист|mint:мята|dill:укроп|cumin:зира|paprika:паприка|turmeric:куркума|cinnamon:корица|nutmeg:мускатный орех|cloves:гвоздика|garam masala:гарам масала|curry powder:карри|cardamom:кардамон|cayenne pepper:кайенский перец|sesame seeds:кунжут|coconut milk:кокосовое молоко|cornflour:кукурузный крахмал|gelatine:желатин|puff pastry:слоёное тесто|shortcrust pastry:песочное тесто'.split('|').map(x => x.split(':')));
const MDB_MEAS = [[/\btbsp?s?\b|\btablespoons?\b|\btbls\b/gi,'ст. л.'],[/\btsp?s?\b|\bteaspoons?\b/gi,'ч. л.'],[/\bcups?\b/gi,'стак.'],[/\bpinch\b/gi,'щепотка'],[/\bhandful\b/gi,'горсть'],[/\bcloves?\b/gi,'зубч.'],[/\bslices?\b/gi,'ломт.'],[/\bcans?\b|\btins?\b/gi,'банка'],[/\bto taste\b|\bdash\b/gi,'по вкусу'],[/\bchopped\b/gi,'нарезанный'],[/\bsliced\b/gi,'нарезанный'],[/\bdiced\b/gi,'кубиками'],[/\bminced\b/gi,'измельчённый'],[/\bgrated\b/gi,'тёртый'],[/\blarge\b/gi,'крупн.'],[/\bsmall\b/gi,'мелк.'],[/\bmedium\b/gi,'средн.'],[/\bjuice of\b/gi,'сок'],[/(\d+(?:\.\d+)?)\s*lbs?\b/gi,(m,n)=>Math.round(n*454)+' г'],[/(\d+(?:\.\d+)?)\s*oz\b/gi,(m,n)=>Math.round(n*28)+' г'],[/(\d+)\s*g\b/gi,'$1 г'],[/(\d+)\s*ml\b/gi,'$1 мл'],[/(\d+(?:\.\d+)?)\s*kg\b/gi,'$1 кг'],[/\bl\b/g,'л']];
const ingRu = n => MDB_ING[n.toLowerCase().trim()] || MDB_ING[n.toLowerCase().replace(/s$/, '')] || n;
const measRu = q => MDB_MEAS.reduce((s, [re, to]) => s.replace(re, to), q || '');
const gTranslate = text => 'https://translate.google.com/?sl=en&tl=ru&op=translate&text=' + encodeURIComponent(text.slice(0, 4500));
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
  if (tab === 'food' && foodTab === 'world' && mdb) render();
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
  mdbBusy = true;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const todo = mdb.meals.filter(m => !mdbRu[m.id]?.t);
      if (!todo.length) break;
      for (let i = 0; i < todo.length; i += 60) {
        const part = todo.slice(i, i + 60);
        try {
          const out = await aiJSON(`Переведи названия блюд на русский так, как их назвали бы в русском меню (известные блюда — общепринятым названием: Lasagne → Лазанья). Переведи ВСЕ ${part.length} названий. Ответь ТОЛЬКО JSON-объектом {"id":"название"}.\n${JSON.stringify(Object.fromEntries(part.map(m => [m.id, m.t])))}`, 6000);
          for (const [id, t] of Object.entries(out)) if (typeof t === 'string' && t.trim()) mdbRu[id] = { ...(mdbRu[id] || {}), t: t.trim() };
          await mdbSaveRu();
          if (tab === 'food' && foodTab === 'world' && !$('#scrim').classList.contains('open')) render();
        } catch (e) { if (!navigator.onLine || /api key|401|403|credit/i.test(e.message)) { mdbNote = 'Перевод остановлен: ' + e.message; break; } }
      }
    }
  } finally { mdbBusy = false; }
}
let mdbNote = '', mdbAll = null;
/* перевести все рецепты целиком (в фоне, по 3 одновременно) */
async function translateAll() {
  if (mdbAll || !mdb || !state.settings.apiKey) return;
  const todo = mdb.meals.filter(m => !mdbRu[m.id]?.full);
  mdbAll = { done: 0, total: todo.length };
  render();
  const worker = async () => {
    while (todo.length && mdbAll) {
      const m = todo.shift();
      try { await translateMeal(m); } catch (e) { if (/api key|401|403|credit/i.test(e.message)) { mdbNote = 'Перевод остановлен: ' + e.message; mdbAll = null; break; } }
      if (mdbAll) { mdbAll.done++; if (mdbAll.done % 5 === 0 && tab === 'food' && foodTab === 'world' && !$('#scrim').classList.contains('open')) render(); }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  mdbAll = null; if (tab === 'food') render(); toast('Все рецепты переведены');
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
    (!q || mdbTitle(m).toLowerCase().includes(q) || m.t.toLowerCase().includes(q) || m.ing.some(([n]) => n.toLowerCase().includes(q) || ingRu(n).toLowerCase().includes(q)) || (mdbRu[m.id]?.ing || []).some(x => x.toLowerCase().includes(q))));
}
function foodWorld() {
  if (!mdb && mdbState === 'idle') loadMealDB();
  if (!mdb) return `<div class="panel"><h2>Мировая кухня</h2><p>${mdbState === 'offline' ? 'Каталог загрузится, когда появится интернет. Потом он будет работать и без сети.' : mdbState === 'error' ? 'Не удалось загрузить каталог. <button class="btn small light" data-act="mdbreload">Попробовать ещё раз</button>' : 'Загружаю около 600 рецептов с фото… это нужно один раз.'}</p></div>`;
  const list = mdbFiltered(), hasKey = !!state.settings.apiKey;
  const left = mdb.meals.filter(m => !mdbRu[m.id]?.t).length;
  return `<div class="panel"><h2>Мировая кухня · ${mdb.meals.length} рецептов</h2>
    <p>Настоящие фото блюд из TheMealDB — бесплатно. Ингредиенты и меры переведены на русский встроенным словарём, а текст рецепта можно бесплатно открыть в Google Переводчике.</p>
    <input class="inp" id="mdbq" placeholder="Поиск: курица, говядина, рис, chicken…" value="${esc(mdbQ)}" autocomplete="off">
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
    const ing = full ? ru.ing : m.ing.map(([n, q]) => `${ingRu(n)}${q ? ' — ' + measRu(q) : ''}`);
    const steps = full ? ru.steps : m.ins.split(/\r?\n+/).map(x => x.replace(/^\s*(step\s*\d+[:.)]?|\d+[.)])\s*/i, '').trim()).filter(x => x.length > 3);
    $('#sheet').innerHTML = `<div class="pbox big"><img class="on" alt="" src="${esc(m.img)}"></div>
      <div class="sheet-h"><h2>${esc(ru.t || m.t)}</h2><button class="x" data-act="close">×</button></div>
      <div class="rmeta">${MDB_CAT[m.cat] || esc(m.cat || '')}${m.area && m.area !== 'Unknown' ? ` · ${MDB_AREA[m.area] || esc(m.area)} кухня` : ''}${full ? ` · ${ru.serv || '?'} порц. · ~${ru.time || '?'} мин` : ''}</div>
      ${full && ru.kcal ? `<div class="kpis" style="margin:12px 0"><div><span>Ккал</span><b>${ru.kcal}</b></div><div><span>Белки</span><b>${ru.p} г</b></div><div><span>Жиры</span><b>${ru.f} г</b></div><div><span>Углеводы</span><b>${ru.c} г</b></div></div><p class="hint" style="margin-top:0">КБЖУ на порцию — оценка ИИ.</p>` : ''}
      ${note ? `<div class="bubble">${note}</div>` : ''}
      <h4 class="sh">Ингредиенты</h4><ul class="ingl">${ing.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <h4 class="sh">Как готовить</h4><ol class="steps">${steps.map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ol>
      ${ru.tip ? `<div class="bubble">💡 ${esc(ru.tip)}</div>` : ''}
      <div class="btnrow">${full && ru.kcal ? `<button class="btn hot" data-act="mdbeat" data-v="${m.id}">Записать в дневник</button>` : ''}${full ? '' : `<a class="btn hot" href="${gTranslate((m.t + '\n\n' + m.ins))}" target="_blank" rel="noopener noreferrer">Перевести шаги (Google, бесплатно) ↗</a>`}${m.yt ? `<a class="btn light" href="${esc(m.yt)}" target="_blank" rel="noopener noreferrer">Видео ↗</a>` : ''}<button class="btn light" data-act="close">Закрыть</button></div>
      <p class="hint">Источник: TheMealDB${m.src ? ` · <a href="${esc(m.src)}" target="_blank" rel="noopener noreferrer">оригинал ↗</a>` : ''}</p>`;
  };
  draw(); $('#scrim').classList.add('open');
}
function mdbClick(act, el) {
  switch (act) {
    case 'mdbcat': mdbCat = el.dataset.v; mdbShow = 24; render(); return true;
    case 'mdbmore': { const y = window.scrollY; mdbShow += 24; render(); window.scrollTo(0, y); return true; }
    case 'mdbopen': openMeal(el.dataset.v); return true;
    case 'mdball': mdbNote = ''; translateAll(); return true;
    case 'mdbtitles': mdbNote = ''; translateTitles().then(render); render(); return true;
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
