'use strict';
/* =========================================================
   Оформление: свой фон из галереи, картины художников как фон
   (Wikimedia Commons, общественное достояние), подстройка цветов под картинку,
   стиль и размер шрифта.
   ========================================================= */

/* ---------- шрифты ---------- */
const FONTS = {
  modern: { n: 'Современный', head: 'Unbounded', body: 'Manrope', q: 'family=Unbounded:wght@500;700;800&family=Manrope:wght@400;500;600;700' },
  classic: { n: 'Классический', head: 'Playfair Display', body: 'PT Serif', q: 'family=Playfair+Display:wght@600;700;800&family=PT+Serif:wght@400;700' },
  strict: { n: 'Строгий', head: 'Oswald', body: 'Rubik', q: 'family=Oswald:wght@500;600;700&family=Rubik:wght@400;500;600;700' },
  soft: { n: 'Мягкий', head: 'Comfortaa', body: 'Nunito', q: 'family=Comfortaa:wght@600;700&family=Nunito:wght@400;600;700' },
  hand: { n: 'Рукописный', head: 'Caveat', body: 'Nunito', q: 'family=Caveat:wght@600;700&family=Nunito:wght@400;600;700' },
  tech: { n: 'Технический', head: 'Russo One', body: 'JetBrains Mono', q: 'family=Russo+One&family=JetBrains+Mono:wght@400;500;700' }
};
/* Свои шрифты: файл кладётся в папку fonts/ рядом с index.html (woff2, woff, ttf или otf) — и шрифт появляется в настройках.
   Это декоративные шрифты, поэтому ими пишутся только заголовки, а обычный текст остаётся читаемым (Manrope). */
const USER_FONTS = [
  ['pilowlava', 'Pilowlava', 'Pilowlava'], ['nauryz', 'NauryzRedKeds', 'NauryzRedKeds'], ['joker', 'Joker', 'Joker'],
  ['gorod', 'Gorod', 'Gorod'], ['handelson', 'Handelson One', 'HandelsonOne'], ['havana', 'Havana', 'Havana'],
  ['drebeden', 'SS Drebeden', 'SS_Drebeden'], ['elowen', 'Elowen Caps', 'ElowenCaps'], ['buyan', 'Buyan', 'Buyan'], ['doppel', 'Doppelganger', 'Doppelganger']
];
USER_FONTS.forEach(([k, n, file]) => { FONTS[k] = { n, head: 'IL-' + file, body: 'Manrope', q: 'family=Manrope:wght@400;500;600;700', file, user: true }; });
const fontOk = {};
(function userFontFaces() {
  const css = USER_FONTS.map(([, , f]) => `@font-face{font-family:'IL-${f}';font-display:swap;src:url('fonts/${f}.woff2') format('woff2'),url('fonts/${f}.woff') format('woff'),url('fonts/${f}.ttf') format('truetype'),url('fonts/${f}.otf') format('opentype')}`).join('');
  const st = document.createElement('style'); st.id = 'user-fonts'; st.textContent = css; document.head.appendChild(st);
})();
async function checkUserFonts() {
  await Promise.all(USER_FONTS.map(async ([k, , f]) => { try { fontOk[k] = (await document.fonts.load(`24px 'IL-${f}'`, 'Аа')).length > 0; } catch (e) { fontOk[k] = false; } }));
}
function applyFont() {
  const s = state.settings, auto = s.fontAuto ?? !s.font, key = (auto && bgFontHint) || s.font || 'modern', f = FONTS[key] || FONTS.modern;
  if (key !== 'modern' && !document.getElementById('font-' + key)) {
    const l = document.createElement('link'); l.id = 'font-' + key; l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?${f.q}&display=swap`; document.head.appendChild(l);
  }
  const r = document.documentElement.style;
  r.setProperty('--head', `'${f.head}',system-ui,sans-serif`); r.setProperty('--body', `'${f.body}',system-ui,sans-serif`);
  document.body.style.zoom = s.fontSize === 'large' ? '1.1' : '';
}

/* ---------- хранилище фото (IndexedDB) ---------- */
const idb = {
  db: null,
  open() { return this.db ||= new Promise((ok, no) => { const r = indexedDB.open('plan-media', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); },
  async get(k) { const db = await this.open(); return new Promise(ok => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => ok(t.result); t.onerror = () => ok(null); }); },
  async set(k, v) { const db = await this.open(); return new Promise(ok => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = ok; t.onerror = ok; }); },
  async del(k) { const db = await this.open(); return new Promise(ok => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = ok; t.onerror = ok; }); }
};

/* ---------- картины художников (Wikimedia Commons) ---------- */
const PAINTERS = {
  bierstadt: { n: 'Альберт Бирштадт', q: 'Albert Bierstadt', cat: 'Paintings by Albert Bierstadt', font: 'classic' },
  shishkin: { q: 'Ivan Shishkin', n: 'Иван Шишкин', cat: 'Paintings by Ivan Shishkin', font: 'classic' },
  aivazovsky: { q: 'Ivan Aivazovsky', n: 'Иван Айвазовский', cat: 'Paintings by Ivan Aivazovsky', font: 'classic' },
  levitan: { q: 'Isaac Levitan', n: 'Исаак Левитан', cat: 'Paintings by Isaac Levitan', font: 'soft' },
  kuindzhi: { q: 'Arkhip Kuindzhi', n: 'Архип Куинджи', cat: 'Paintings by Arkhip Kuindzhi', font: 'classic' },
  monet: { q: 'Claude Monet', n: 'Клод Моне', cat: 'Paintings by Claude Monet', font: 'soft' },
  vangogh: { q: 'Vincent van Gogh', n: 'Винсент Ван Гог', cat: 'Paintings by Vincent van Gogh', font: 'hand' },
  friedrich: { q: 'Caspar David Friedrich', n: 'Каспар Давид Фридрих', cat: 'Paintings by Caspar David Friedrich', font: 'classic' },
  hiroshige: { q: 'Hiroshige', n: 'Утагава Хиросигэ', cat: 'One Hundred Famous Views of Edo', font: 'strict' },
  hokusai: { q: 'Hokusai', n: 'Кацусика Хокусай', cat: 'Thirty-six Views of Mount Fuji', font: 'strict' }
};
const GALLERY_KEY = 'plan-gallery.v2';
let gallery = {}; try { gallery = JSON.parse(localStorage.getItem(GALLERY_KEY) || '{}'); } catch (e) {}
async function loadPainter(id) {
  const g = gallery[id];
  if (g && g.items?.length && Date.now() - g.ts < 14 * 864e5) return g.items;
  const p = PAINTERS[id], items = [];
  let cont = '';
  for (let page = 0; page < 3 && items.length < 120; page++) {
    const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=categorymembers&gcmtitle=${encodeURIComponent('Category:' + p.cat)}&gcmtype=file&gcmlimit=100${cont}&prop=imageinfo&iiprop=url|size|extmetadata&iiextmetadatafilter=ObjectName|DateTimeOriginal|LicenseShortName&iiurlwidth=1600`;
    const r = await fetch(u); if (!r.ok) break;
    const j = await r.json();
    for (const pg of Object.values(j.query?.pages || {})) {
      const ii = pg.imageinfo?.[0]; if (!ii || !/\.(jpe?g|png)$/i.test(pg.title) || ii.width < 1000) continue;
      const lic = ii.extmetadata?.LicenseShortName?.value || '';
      if (lic && !/public domain|pd|cc0/i.test(lic)) continue; // только общественное достояние
      const title = (ii.extmetadata?.ObjectName?.value || pg.title.replace(/^File:/, '').replace(/\.\w+$/, '')).replace(/<[^>]+>/g, '').slice(0, 90);
      const year = ((ii.extmetadata?.DateTimeOriginal?.value || '').replace(/<[^>]+>/g, '').match(/1[5-9]\d\d/) || [''])[0];
      items.push({ src: ii.thumburl || ii.url, page: ii.descriptionurl, title, year, wide: ii.width >= ii.height });
    }
    if (!j.continue) break;
    cont = '&gcmcontinue=' + encodeURIComponent(j.continue.gcmcontinue);
  }
  if (items.length < 10) { // запасной путь: поиск файлов по имени художника
    const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=100&gsrsearch=${encodeURIComponent('"' + p.q + '" painting filetype:bitmap')}&prop=imageinfo&iiprop=url|size|extmetadata&iiextmetadatafilter=ObjectName|DateTimeOriginal|LicenseShortName&iiurlwidth=1600`;
    try { const r = await fetch(u); const j = await r.json(); for (const pg of Object.values(j.query?.pages || {})) { const ii = pg.imageinfo?.[0]; if (!ii || !/\.(jpe?g|png)$/i.test(pg.title) || ii.width < 1000) continue; const lic = ii.extmetadata?.LicenseShortName?.value || ''; if (!/public domain|pd|cc0/i.test(lic)) continue; const title = (ii.extmetadata?.ObjectName?.value || pg.title.replace(/^File:/, '').replace(/\.\w+$/, '')).replace(/<[^>]+>/g, '').slice(0, 90); const year = ((ii.extmetadata?.DateTimeOriginal?.value || '').replace(/<[^>]+>/g, '').match(/1[5-9]\d\d/) || [''])[0]; items.push({ src: ii.thumburl || ii.url, page: ii.descriptionurl, title, year, wide: ii.width >= ii.height }); } } catch (e) {}
  }
  gallery[id] = { ts: Date.now(), items }; try { localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery)); } catch (e) {}
  return items;
}
async function pickPainting(shift = 0) {
  const s = state.settings, ids = (s.painters && s.painters.length ? s.painters : Object.keys(PAINTERS));
  const all = [];
  for (const id of ids) { try { (await loadPainter(id)).forEach(it => all.push({ ...it, painter: id })); } catch (e) {} }
  if (!all.length) return null;
  const dayN = Math.floor(Date.now() / 864e5);
  const idx = ((dayN + (s.bgShift || 0)) % all.length + all.length) % all.length;
  const rnd = rng('gal' + all.length); const order = all.map((_, i) => i).sort(() => rnd() - 0.5); // одинаковый перемешанный порядок
  return all[order[idx]];
}

/* ---------- цвета под картинку ---------- */
function paletteFrom(img) {
  const c = document.createElement('canvas'); c.width = c.height = 48;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 48, 48);
  const d = x.getImageData(0, 0, 48, 48).data, buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  let lum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
    lum += 0.2126 * r + 0.7152 * g + 0.0722 * b; n++;
    if (sat < 0.22 || l < 0.12 || l > 0.92) continue;
    let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
    const B = buckets[Math.floor(h / 30)], w = sat * (1 - Math.abs(l - 0.55));
    B.w += w; B.r += r * w; B.g += g * w; B.b += b * w;
  }
  const best = buckets.reduce((a, b) => b.w > a.w ? b : a);
  let hue = 45;
  if (best.w > 0) { const r = best.r / best.w, g = best.g / best.w, b = best.b / best.w, mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx !== mn) { hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; hue = Math.round((hue * 60 + 360) % 360); } }
  return { hue, light: lum / n > 0.62 };
}
function applyPalette(p) {
  const h = p.hue, r = document.documentElement.style, light = p.light;
  const v = light
    ? { bg: `hsl(${h} 30% 94%)`, card: `hsl(${h} 35% 98%)`, card2: `hsl(${h} 25% 90%)`, text: `hsl(${h} 25% 12%)`, muted: `hsl(${h} 10% 38%)`, line: 'rgba(0,0,0,.09)', accent: `hsl(${h} 75% 45%)`, bar: `hsl(${h} 15% 75%)` }
    : { bg: `hsl(${h} 25% 7%)`, card: `hsl(${h} 22% 12%)`, card2: `hsl(${h} 20% 18%)`, text: `hsl(${h} 30% 96%)`, muted: `hsl(${h} 12% 68%)`, line: 'rgba(255,255,255,.1)', accent: `hsl(${h} 85% 64%)`, bar: `hsl(${h} 12% 35%)` };
  Object.entries(v).forEach(([k, val]) => r.setProperty('--' + k, val));
  r.setProperty('--accent-ink', light ? '#fff' : `hsl(${h} 40% 8%)`);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', light ? '#f5f5f5' : '#111');
}

/* ---------- применение фона ---------- */
let bgFontHint = null, bgInfo = null, bgObjectUrl = null;
async function applyBackground() {
  const s = state.settings, layer = document.getElementById('bgl');
  bgFontHint = null; bgInfo = null;
  if (bgObjectUrl) { URL.revokeObjectURL(bgObjectUrl); bgObjectUrl = null; }
  const off = () => { layer.style.backgroundImage = ''; document.body.classList.remove('hasbg'); applyTheme(); applyFont(); };
  const mode = s.bgMode ?? 'art'; // по умолчанию — картина дня
  if (mode === 'none') return off();
  let url = null;
  if (mode === 'photo') { const blob = await idb.get('bg'); if (!blob) return off(); url = bgObjectUrl = URL.createObjectURL(blob); }
  else if (mode === 'art') {
    if (state.settings.photos === false || navigator.onLine === false) return off();
    const pic = await pickPainting(); if (!pic) return off();
    url = pic.src; bgInfo = pic; bgFontHint = PAINTERS[pic.painter]?.font || null;
  }
  const img = new Image(); if (mode === 'art') img.crossOrigin = 'anonymous';
  img.onload = () => {
    layer.style.backgroundImage = `url("${url}")`;
    document.body.classList.add('hasbg');
    document.documentElement.style.setProperty('--dim', String(s.bgDim ?? 0.3)); document.documentElement.style.setProperty('--glass', String(Math.min(.92, .45 + (s.bgDim ?? 0.3) * .5)));
    if (s.bgAutoColors !== false) { try { applyPalette(paletteFrom(img)); } catch (e) { applyTheme(); } } else applyTheme();
    applyFont(); drawCredit();
  };
  img.onerror = off; img.src = url;
}
function drawCredit() {
  const c = document.getElementById('bgcredit');
  if (!bgInfo) { c.hidden = true; return; }
  c.hidden = false; c.href = bgInfo.page;
  c.textContent = `${PAINTERS[bgInfo.painter].n} · «${bgInfo.title}»${bgInfo.year ? ', ' + bgInfo.year : ''} · Wikimedia Commons`;
}
async function setPhotoFromFile(file) {
  // уменьшаем до 1600 px, чтобы не занимать много места
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(file); });
  const k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.85));
  await idb.set('bg', blob); state.settings.bgMode = 'photo'; save(); await applyBackground(); render(); toast('Фон установлен');
}

/* ---------- панель в настройках ---------- */
function stylePanels() {
  const s = state.settings, mode = s.bgMode ?? 'art', sel = new Set(s.painters && s.painters.length ? s.painters : Object.keys(PAINTERS));
  return `<div class="panel"><h2>Фон</h2>
    <div class="seg" style="margin:10px 0 12px">${[['none', 'Без фона'], ['photo', 'Своё фото'], ['art', 'Картины']].map(([k, n]) => `<button class="${mode === k ? 'on' : ''}" data-act="bgmode" data-v="${k}">${n}</button>`).join('')}</div>
    ${mode === 'photo' || mode === 'none' ? `<label class="btn ${mode === 'photo' ? 'light' : 'hot'}" style="cursor:pointer">Выбрать фото из галереи<input type="file" accept="image/*" data-act="bgfile" hidden></label>
      <p class="hint">Телефон сам покажет галерею и спросит разрешение, если это нужно. Приложение получит только одно выбранное фото, а не всю галерею. Фото хранится только на этом устройстве.</p>` : ''}
    ${mode === 'art' ? `<p>Каждый день — новая картина великого художника. Все картины в общественном достоянии, берутся из Wikimedia Commons; снизу экрана подписаны автор и название.</p>
      <div class="chips">${Object.entries(PAINTERS).map(([id, p]) => `<button class="chip ${sel.has(id) ? 'on' : ''}" data-act="painter" data-v="${id}">${p.n}</button>`).join('')}</div>
      <div class="btnrow"><button class="btn small" data-act="bgnext">Следующая картина →</button>${bgInfo ? `<a class="btn small light" href="${esc(bgInfo.page)}" target="_blank" rel="noopener noreferrer">О картине ↗</a>` : ''}</div>` : ''}
    ${mode !== 'none' ? `<label class="f">Затемнение фона</label><input type="range" min="0" max="0.9" step="0.05" value="${s.bgDim ?? 0.3}" data-act="bgdim" class="range"><div class="rlab"><span>картина ярче</span><span>текст читабельнее</span></div>
      <label class="switch"><input type="checkbox" data-act="bgauto" ${s.bgAutoColors !== false ? 'checked' : ''}><span></span>Подстраивать цвета интерфейса под картинку</label>
      ${mode === 'art' ? `<label class="switch"><input type="checkbox" data-act="fontauto" ${(s.fontAuto ?? !s.font) ? 'checked' : ''}><span></span>Подбирать шрифт под стиль художника</label>` : ''}` : ''}
  </div>
  <div class="panel"><h2>Шрифт</h2>
    <div class="fonts">${Object.entries(FONTS).filter(([, f]) => !f.user).map(([k, f]) => `<button class="fontopt ${(s.font || 'modern') === k ? 'on' : ''}" data-act="font" data-v="${k}"><b style="font-family:'${f.head}',system-ui">Аа Привет</b><span>${f.n}</span></button>`).join('')}</div>
    <h4 class="sh">Декоративные — для заголовков</h4>
    <div class="fonts">${USER_FONTS.map(([k, n, file]) => `<button class="fontopt ${s.font === k ? 'on' : ''} ${fontOk[k] === false ? 'nofile' : ''}" data-act="font" data-v="${k}"><b style="font-family:'IL-${file}',system-ui">Шрифт</b><span>${n}${fontOk[k] === false ? '<small>нет файла</small>' : ''}</span></button>`).join('')}</div>
    <details class="nyaml"><summary>Как добавить эти шрифты</summary><p class="hint">Скачай файл шрифта (.ttf, .otf или .woff2), переименуй ровно так, как указано, и загрузи в репозиторий <b>Ilona</b> на GitHub в папку <b>fonts</b> (Add file → Upload files, в начале имени файла допиши <b>fonts/</b>). Через 1–2 минуты шрифт заработает.</p>
      <p class="hint">${USER_FONTS.map(([, n, f]) => `${n} → <b>fonts/${f}.ttf</b>`).join('<br>')}</p>
      <p class="hint">Pilowlava и NauryzRedKeds бесплатные. Handelson One платный (≈ $29 у автора, Melvastype). У остальных проверь условия на странице скачивания — бери файлы только с сайта автора или с разрешением на использование.</p></details>
    <label class="f">Размер текста</label>
    <div class="chips">${[['normal', 'Обычный'], ['large', 'Крупный']].map(([k, n]) => `<button class="chip ${(s.fontSize || 'normal') === k ? 'on' : ''}" data-act="fontsize" data-v="${k}">${n}</button>`).join('')}</div>
  </div>`;
}
function preloadFontSamples() { if (!preloadFontSamples.done) { preloadFontSamples.done = 1; checkUserFonts().then(() => { if (tab === 'settings') render(); }); } Object.entries(FONTS).forEach(([k, f]) => { if (k !== 'modern' && !document.getElementById('font-' + k)) { const l = document.createElement('link'); l.id = 'font-' + k; l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${f.q}&display=swap`; document.head.appendChild(l); } }); }
function styleClick(act, el) {
  const s = state.settings;
  switch (act) {
    case 'bgmode': s.bgMode = el.dataset.v; save(); applyBackground().then(render); render(); return true;
    case 'painter': { const set = new Set(s.painters && s.painters.length ? s.painters : Object.keys(PAINTERS)); set.has(el.dataset.v) ? set.delete(el.dataset.v) : set.add(el.dataset.v); if (!set.size) return toast('Оставь хотя бы одного художника'), true; s.painters = [...set]; s.bgShift = 0; save(); applyBackground().then(render); render(); return true; }
    case 'bgnext': s.bgShift = (s.bgShift || 0) + 1; save(); applyBackground().then(render); return true;
    case 'font': if (fontOk[el.dataset.v] === false) { toast('Файла этого шрифта нет в папке fonts — см. «Как добавить»'); return true; } s.font = el.dataset.v; s.fontAuto = false; save(); applyFont(); render(); return true;
    case 'fontsize': s.fontSize = el.dataset.v; save(); applyFont(); render(); return true;
  }
  return false;
}
document.addEventListener('change', e => {
  const el = e.target, s = state.settings;
  if (el.dataset.act === 'bgfile' && el.files[0]) setPhotoFromFile(el.files[0]).catch(() => toast('Не получилось открыть фото'));
  if (el.dataset.act === 'bgauto') { s.bgAutoColors = el.checked; save(); applyBackground(); }
  if (el.dataset.act === 'fontauto') { s.fontAuto = el.checked; save(); applyFont(); }
});
document.addEventListener('input', e => { if (e.target.dataset.act === 'bgdim') { const v = +e.target.value; state.settings.bgDim = v; document.documentElement.style.setProperty('--dim', String(v)); document.documentElement.style.setProperty('--glass', String(Math.min(.92, .45 + v * .5))); save(); } });
