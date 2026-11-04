/* =========================================================
   «30 уроков в день»: каждый урок — избранная или хорошая статья русской Википедии
   (это проверенные сообществом статьи, их ~6 000 → хватит больше чем на 5 месяцев без повторов).
   К каждому уроку — настоящее фото со свободной лицензией с Wikimedia Commons и подпись автора.
   Текст: Википедия, CC BY-SA. Всё сохраняется на устройстве и потом работает без интернета.
   ========================================================= */
const WAPI = 'https://ru.wikipedia.org/w/api.php?format=json&origin=*&';
const CAPI = 'https://commons.wikimedia.org/w/api.php?format=json&origin=*&';
const W_PER_DAY = 30;
let wTried = {}, wPool = null, wDayCache = {}, wLoading = {}, wView = null;

function ensureW() { const b = state.brain; b.wday ||= {}; b.wused ||= {}; b.wread ||= {}; }

async function wPoolLoad() {
  if (wPool) return wPool;
  const cached = await idb.get('wpool');
  if (cached && cached.titles?.length > 1000 && Date.now() - cached.ts < 60 * 864e5) return (wPool = cached.titles);
  if (!navigator.onLine) return (wPool = cached?.titles || []);
  const titles = new Set();
  const byCat = async cat => {
    let cont = '';
    for (let i = 0; i < 20; i++) {
      const j = await fetch(WAPI + `action=query&list=categorymembers&cmtitle=${encodeURIComponent('Категория:' + cat)}&cmnamespace=0&cmtype=page&cmlimit=500${cont}`).then(r => r.json()).catch(() => null);
      (j?.query?.categorymembers || []).forEach(p => titles.add(p.title));
      if (!j?.continue) break; cont = '&cmcontinue=' + encodeURIComponent(j.continue.cmcontinue);
    }
  };
  const byTpl = async tpl => { // запасной путь — поиск статей с шаблоном
    for (let off = 0; off < 9500; off += 500) {
      const j = await fetch(WAPI + `action=query&list=search&srsearch=${encodeURIComponent(`hastemplate:"${tpl}"`)}&srnamespace=0&srlimit=500&sroffset=${off}&srprop=`).then(r => r.json()).catch(() => null);
      const hits = j?.query?.search || []; hits.forEach(p => titles.add(p.title)); if (hits.length < 500) break;
    }
  };
  await byCat('Википедия:Избранные статьи по алфавиту'); await byCat('Википедия:Хорошие статьи по алфавиту');
  if (titles.size < 1000) { await byTpl('Избранная статья'); await byTpl('Хорошая статья'); }
  // одинаковый «перемешанный» порядок на всех устройствах — у тебя и у девушки уроки дня совпадут
  const arr = [...titles].sort(), rnd = rng('ilona-lessons');
  for (let i = arr.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [arr[i], arr[k]] = [arr[k], arr[i]]; }
  if (arr.length) await idb.set('wpool', { ts: Date.now(), titles: arr });
  return (wPool = arr.length ? arr : cached?.titles || []);
}

const strip = h => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
async function wFetchPages(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 20) {
    const part = titles.slice(i, i + 20);
    const j = await fetch(WAPI + `action=query&prop=extracts|pageimages|description&exintro=1&explaintext=1&exlimit=20&piprop=thumbnail|name&pithumbsize=1280&pilimit=20&pilicense=free&redirects=1&titles=${encodeURIComponent(part.join('|'))}`).then(r => r.json()).catch(() => null);
    Object.values(j?.query?.pages || {}).forEach(p => { if (p.pageid) out.push(p); });
  }
  // авторы фото с Commons
  const files = out.filter(p => p.pageimage).map(p => 'File:' + p.pageimage), meta = {};
  for (let i = 0; i < files.length; i += 40) {
    const j = await fetch(CAPI + `action=query&prop=imageinfo&iiprop=extmetadata|url&iiextmetadatafilter=Artist|LicenseShortName|Credit&titles=${encodeURIComponent(files.slice(i, i + 40).join('|'))}`).then(r => r.json()).catch(() => null);
    const norm = Object.fromEntries((j?.query?.normalized || []).map(n => [n.to, n.from]));
    Object.values(j?.query?.pages || {}).forEach(p => { const ii = p.imageinfo?.[0]; if (ii) meta[(norm[p.title] || p.title).replace(/^File:|^Файл:/, '').replace(/ /g, '_')] = { a: strip(ii.extmetadata?.Artist?.value) || strip(ii.extmetadata?.Credit?.value), l: strip(ii.extmetadata?.LicenseShortName?.value), page: ii.descriptionurl }; });
  }
  return out.map(p => {
    const m = meta[(p.pageimage || '').replace(/ /g, '_')] || {};
    const paras = (p.extract || '').split(/\n+/).map(x => x.trim()).filter(x => x.length > 40);
    return { id: 'w' + p.pageid, t: p.title, d: p.description || '', p: paras.slice(0, 5), img: p.thumbnail?.source || '', author: (m.a || '').slice(0, 80), lic: m.l || '', imgPage: m.page || '', url: 'https://ru.wikipedia.org/wiki/' + encodeURIComponent(p.title.replace(/ /g, '_')) };
  }).filter(L => L.img && L.p.join(' ').length > 160);
}

/* 30 уроков на дату: берём следующие неиспользованные статьи; без фото или слишком короткие — пропускаем */
async function wLessonsFor(d) {
  ensureW();
  if (wDayCache[d]) return wDayCache[d];
  const stored = await idb.get('wday:' + d);
  if (stored?.length) return (wDayCache[d] = stored);
  if (wLoading[d] || !navigator.onLine || state.settings.photos === false) return null;
  wLoading[d] = true;
  try {
    const pool = await wPoolLoad(), b = state.brain, got = [];
    let idx = b.wnext || 0;
    for (let round = 0; round < 4 && got.length < W_PER_DAY && idx < pool.length; round++) {
      const batch = [];
      while (batch.length < (W_PER_DAY - got.length) + 12 && idx < pool.length) { const t = pool[idx++]; if (!b.wused[t]) batch.push(t); }
      const pages = await wFetchPages(batch);
      batch.forEach(t => { b.wused[t] = 1; });
      for (const L of pages) if (got.length < W_PER_DAY && !got.some(x => x.id === L.id)) got.push(L);
    }
    b.wnext = idx; b.wday[d] = got.map(L => L.id); save();
    if (got.length) { await idb.set('wday:' + d, got); wDayCache[d] = got; }
    return got;
  } catch (e) { return null; } finally { wLoading[d] = false; }
}
const wPoolLeft = () => wPool ? Math.max(0, wPool.length - (state.brain.wnext || 0)) : null;

/* фото для встроенного урока: ищем подходящую статью по заголовку */
const wImgCache = {}, wImgTried = {};
async function wImageFor(q) {
  if (q in wImgCache) return wImgCache[q];
  const key = 'wimg:' + q, c = await idb.get(key); if (c) return (wImgCache[q] = c);
  if (!navigator.onLine) return null;
  try {
    const j = await fetch(WAPI + `action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=0&gsrlimit=3&prop=pageimages&piprop=thumbnail|name&pithumbsize=1280&pilicense=free`).then(r => r.json());
    const p = Object.values(j?.query?.pages || {}).sort((a, b) => a.index - b.index).find(x => x.thumbnail);
    if (!p) return (wImgCache[q] = null);
    const m = await fetch(CAPI + `action=query&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&titles=${encodeURIComponent('File:' + p.pageimage)}`).then(r => r.json());
    const ii = Object.values(m?.query?.pages || {})[0]?.imageinfo?.[0];
    const res = { img: p.thumbnail.source, author: strip(ii?.extmetadata?.Artist?.value).slice(0, 80), lic: strip(ii?.extmetadata?.LicenseShortName?.value), page: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(p.pageimage) };
    await idb.set(key, res); return (wImgCache[q] = res);
  } catch (e) { return null; }
}
const credit = (a, l, page) => `<a class="pcredit on" href="${esc(page || '#')}" target="_blank" rel="noopener noreferrer">Фото: ${esc(a || 'автор на Wikimedia Commons')}${l ? ' · ' + esc(l) : ''}</a>`;
function photoHero(L, fallback) {
  // для встроенных уроков — фото по теме; пока грузится, показываем рисунок
  const c = wImgCache[L.t];
  if (c) return `<div class="pbox hero"><img class="on" alt="" src="${esc(c.img)}" referrerpolicy="no-referrer">${credit(c.author, c.lic, c.page)}</div>`;
  if (c === undefined && state.settings.photos !== false && !wImgTried[L.t]) { wImgTried[L.t] = 1; wImageFor(L.t).then(r => { if (r && tab === 'brain') render(); }); }
  return fallback;
}

function wDaySection() {
  const d = today(), list = wDayCache[d];
  if (!list) {
    if (!wTried[d]) { wTried[d] = 1; wLessonsFor(d).then(r => { if (r && r.length && tab === 'brain' && brainTab === 'today') render(); }); }
    return `<div class="panel"><h2>30 уроков на сегодня</h2><p>${!navigator.onLine ? 'Уроки загрузятся, когда появится интернет. Загруженные дни потом открываются и без сети.' : state.settings.photos === false ? 'Включи загрузку материалов из Википедии в настройках (раздел «Что приложение НЕ делает»).' : 'Подбираю статьи и фото… это несколько секунд.'}</p></div>`;
  }
  const done = list.filter(L => state.brain.wread[L.id]).length;
  return `<div class="panel"><div class="lhead"><h2 style="margin:0">30 уроков на сегодня</h2><span class="tag">${done} / ${list.length}</span></div>
    <div class="bar thin" style="margin:10px 0 4px"><i style="width:${list.length ? done / list.length * 100 : 0}%"></i></div>
    <p class="hint">Каждый день — новые статьи, без повторов. Это избранные и хорошие статьи Википедии: история, наука, природа, люди, города, искусство.</p></div>
  <div class="grid2 wgrid">${list.map((L, i) => `<button class="rcard wcard ${state.brain.wread[L.id] ? 'read' : ''}" data-act="wopen" data-v="${L.id}">
    <div class="pbox"><img class="on" alt="" loading="lazy" src="${esc(L.img)}" referrerpolicy="no-referrer"><span class="wnum">${i + 1}</span>${state.brain.wread[L.id] ? '<span class="wok">✓</span>' : ''}</div>
    <div class="rc-b"><b>${esc(L.t)}</b><div class="rmeta">${esc(L.d || '')}</div></div></button>`).join('')}</div>`;
}
function wOpen(id) {
  const list = wDayCache[today()] || [], i = list.findIndex(L => L.id === id), L = list[i]; if (!L) return;
  state.brain.wread[L.id] = today(); save();
  const next = list.slice(i + 1).find(x => !state.brain.wread[x.id]) || list.find(x => !state.brain.wread[x.id]);
  $('#sheet').innerHTML = `<div class="pbox big"><img class="on" alt="" src="${esc(L.img)}" referrerpolicy="no-referrer">${credit(L.author, L.lic, L.imgPage)}</div>
    <div class="sheet-h"><h2>${esc(L.t)}</h2><button class="x" data-act="close">×</button></div>
    ${L.d ? `<div class="rmeta" style="margin-bottom:10px">${esc(L.d)}</div>` : ''}
    ${L.p.map(x => `<p>${esc(x)}</p>`).join('')}
    <div class="btnrow">${next ? `<button class="btn hot" data-act="wopen" data-v="${next.id}">Следующий урок →</button>` : '<span class="ok-t">Все 30 уроков на сегодня прочитаны 🎉</span>'}<a class="btn light" href="${esc(L.url)}" target="_blank" rel="noopener noreferrer">Читать полностью ↗</a><button class="btn light" data-act="close">Закрыть</button></div>
    <p class="hint">Текст: Википедия, лицензия CC BY-SA. Фото: Wikimedia Commons.</p>`;
  $('#scrim').classList.add('open'); $('#sheet').scrollTop = 0;
  if (tab === 'brain') setTimeout(render, 0);
}
function wClick(act, el) {
  if (act === 'wopen') { wOpen(el.dataset.v); return true; }
  return false;
}
