'use strict';
/* =========================================================
   «Саморазвитие»: урок дня без повторов, «В этот день в истории» (Википедия),
   задания для мозга (генерируются каждый день заново), архив.
   Языковой репетитор — в lang.js.
   ========================================================= */
let brainTab = 'today', brainView = null, brainNote = '';

function ensureBrain() {
  const b = state.brain;
  b.read ||= {}; b.quiz ||= {}; b.day ||= {}; b.extra ||= []; b.puz ||= {};
  // перенос старых номеров уроков (0..29) в новые id (b0..b29)
  for (const k of Object.keys(b.read)) if (/^\d+$/.test(k)) { b.read['b' + k] = b.read[k]; delete b.read[k]; }
  for (const k of Object.keys(b.quiz)) if (/^\d+$/.test(k)) { b.quiz['b' + k] = b.quiz[k]; delete b.quiz[k]; }
}
const allLessons = () => [...state.brain.extra, ...LESSONS.map((l, i) => ({ ...l, id: 'b' + i }))];
const lessonById = id => allLessons().find(l => l.id === id);
function nextUnread(skip = []) {
  // «Свежий» урок: не прочитан и ещё ни разу не был уроком дня (даже если в тот день его не открыли)
  const d = today(), shown = new Set(Object.entries(state.brain.day || {}).filter(([k]) => k !== d).map(([, v]) => v));
  return allLessons().find(l => !state.brain.read[l.id] && !shown.has(l.id) && !skip.includes(l.id)) || null;
}
function lessonOfDay() {
  const d = today(), b = state.brain;
  let L = b.day[d] && lessonById(b.day[d]);
  if (!L) { L = nextUnread(); if (L) { b.day[d] = L.id; save(); } }
  return L || { id: '_none', t: 'Новые уроки закончились', cat: 'Саморазвитие', p: ['Ты прочитал все встроенные уроки. Получи свежие от ИИ — кнопка ниже.'], key: '', o: [], m: 'book' };
}
const unreadCount = () => { const d = today(), shown = new Set(Object.entries(state.brain.day || {}).filter(([k]) => k !== d).map(([, v]) => v)); return allLessons().filter(l => !state.brain.read[l.id] && !shown.has(l.id)).length; };
function brainStreak() {
  const days = new Set(Object.values(state.brain.read)); let n = 0, d = today(); if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d) && n < 999) { n++; d = addDays(d, -1); } return n;
}

/* ---------- уроки от ИИ / бота ---------- */
function addLessons(arr) {
  const known = new Set(allLessons().map(l => l.id)), titles = new Set(allLessons().map(l => l.t));
  const ok = (arr || []).filter(l => l && l.t && Array.isArray(l.p) && !titles.has(l.t)).map((l, i) => ({
    id: String(l.id || `ai-${Date.now()}-${i}`), cat: l.cat || 'Факт', t: String(l.t), p: l.p.map(String).slice(0, 6), key: l.key || '',
    q: l.q || '', o: Array.isArray(l.o) ? l.o.map(String).slice(0, 4) : [], a: Number.isInteger(l.a) ? l.a : 0, m: LART[l.m] ? l.m : ['book', 'neurons', 'light', 'growth', 'dunes', 'ship'][i % 6], src: 'ai'
  })).filter(l => !known.has(l.id));
  state.brain.extra.push(...ok); save(); return ok.length;
}
async function fetchLessonsFeed() {
  const b = state.brain, url = (state.work?.feedUrl || '').replace(/orders\.json.*$/i, 'lessons.json');
  if (!/lessons\.json$/.test(url) || b.lessonsFetched === today()) return;
  try { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) return; const j = await r.json(); b.lessonsFetched = today(); save(); const n = addLessons(j.lessons || j); if (n && tab === 'brain') { brainNote = `Бот прислал новых уроков: ${n}.`; render(); } } catch (e) {}
}
function mentorPrompt(L) {
  return `Я прочитал короткий урок «${L.t}» (${L.cat}).
Суть: ${(L.p || []).join(' ')}
Объясни тему глубже простыми словами (5–7 предложений), приведи 2 неожиданных связанных факта, задай мне 3 вопроса на понимание (ответы спрячь в конце) и посоветуй одну книгу или видео по теме. Только проверенные факты.`;
}
function lessonsGenPrompt() {
  const read = allLessons().filter(l => state.brain.read[l.id]).map(l => l.t).slice(-80);
  return `Придумай 10 коротких уроков для саморазвития (по 2 минуты чтения) — интересные проверенные факты из истории, науки, психологии, мышления, финансов, географии, искусства. Чередуй темы. Только достоверные факты.
Не повторяй: ${read.join('; ') || 'ничего'}.
Ответь ТОЛЬКО JSON-массивом: [{"cat":"История|Наука|Психология|Мышление|Финансы|Саморазвитие|География|Искусство","t":"заголовок","p":["абзац 1","абзац 2","абзац 3"],"key":"главная мысль одной фразой","q":"вопрос для проверки","o":["вариант 1","вариант 2","вариант 3"],"a":номер правильного варианта с 0}]`;
}

/* ---------- «В этот день» из Википедии ---------- */
async function loadOnThisDay() {
  const d = today(), b = state.brain; b.wiki ||= {};
  if (b.wiki[d] || state.settings.photos === false) return;
  const [, mm, dd] = d.split('-');
  try {
    const r = await fetch(`https://ru.wikipedia.org/api/rest_v1/feed/onthisday/selected/${mm}/${dd}`, { headers: { accept: 'application/json' } });
    if (!r.ok) return;
    const j = await r.json(), rnd = rng('otd' + d);
    const ev = (j.selected || []).map(e => ({ y: e.year, t: e.text, url: e.pages?.[0]?.content_urls?.desktop?.page || '', img: e.pages?.find(p => p.thumbnail?.source?.includes('/commons/'))?.thumbnail?.source || '' }));
    ev.sort(() => rnd() - 0.5);
    b.wiki = { [d]: ev.slice(0, 5) }; save();
    if (tab === 'brain' && brainTab === 'today') render();
  } catch (e) {}
}

/* ---------- задания для мозга: каждый день новые ---------- */
const ANAGRAM_WORDS = ['апельсин', 'библиотека', 'вертолёт', 'географ', 'дельфин', 'журналист', 'звезда', 'инженер', 'календарь', 'лаборатория', 'магнит', 'носорог', 'облако', 'пирамида', 'ракета', 'самолёт', 'телескоп', 'учебник', 'фонарик', 'хамелеон', 'цитата', 'черепаха', 'шоколад', 'экватор', 'ящерица', 'автобус', 'балкон', 'вулкан', 'гитара', 'девочка', 'жираф', 'зеркало', 'карандаш', 'лимонад', 'мельница', 'ноутбук', 'огурец', 'палатка', 'радуга', 'светофор', 'тарелка', 'улитка', 'фабрика', 'художник', 'цирк', 'чемодан', 'шахматы', 'электрон', 'юбилей', 'ярмарка', 'алфавит', 'бабочка', 'виноград', 'глобус', 'директор', 'жемчуг', 'земляника', 'капитан', 'лестница', 'малина', 'неделя', 'орехи', 'паровоз', 'ромашка', 'сапоги', 'трамвай', 'утюг', 'футбол', 'хоккей', 'часовщик', 'шиповник', 'эскимо', 'якорь', 'компас', 'маяк', 'кактус', 'планета', 'мозаика', 'ковёр', 'бумага', 'пианино', 'клубника', 'медведь', 'пингвин', 'кенгуру', 'страница', 'картина', 'механик', 'граница', 'столица', 'профессор', 'монитор', 'батарея', 'корабль', 'гримёр', 'оркестр', 'сказка', 'подушка', 'фестиваль', 'снеговик'];
const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, '').replace(',', '.');
function makePuzzle(type, rnd) {
  const I = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  if (type === 'seq') {
    const k = I(0, 4); let s, ans;
    if (k === 0) { const a = I(2, 30), d = I(3, 15); s = [0, 1, 2, 3, 4].map(i => a + d * i); ans = a + d * 5; }
    else if (k === 1) { const a = I(1, 5), r = I(2, 3); s = [0, 1, 2, 3, 4].map(i => a * r ** i); ans = a * r ** 5; }
    else if (k === 2) { const o = I(1, 6); s = [0, 1, 2, 3, 4].map(i => (i + o) ** 2); ans = (5 + o) ** 2; }
    else if (k === 3) { let a = I(1, 5), b = I(2, 7); s = [a, b]; for (let i = 0; i < 3; i++) s.push(s[s.length - 1] + s[s.length - 2]); ans = s[3] + s[4]; }
    else { const a = I(10, 40), x = I(5, 12), y = I(2, 4); s = [a]; for (let i = 1; i < 5; i++) s.push(i % 2 ? s[i - 1] + x : s[i - 1] - y); ans = s[4] + x; }
    return { ic: '🔢', t: 'Продолжи ряд', q: s.join(', ') + ', ?', a: String(ans), hint: 'Посмотри на разницу или отношение соседних чисел' };
  }
  if (type === 'math') { const a = I(12, 49), b = I(3, 9), c = I(11, 99); return { ic: '🧮', t: 'Посчитай в уме', q: `${a} × ${b} + ${c} = ?`, a: String(a * b + c), hint: `Сначала ${a} × ${b}` }; }
  if (type === 'pct') { const p = I(5, 90) * 100, d = [10, 15, 20, 25, 30, 40, 50][I(0, 6)]; return { ic: '🏷', t: 'Скидка', q: `Товар стоит ${fmt(p)} ₽, скидка ${d}%. Сколько заплатить?`, a: String(p * (100 - d) / 100), hint: `${d}% от ${p} — это ${p} × ${d} / 100` }; }
  if (type === 'anagram') {
    const w = ANAGRAM_WORDS[I(0, ANAGRAM_WORDS.length - 1)], ch = [...w];
    let sh = w; for (let t = 0; t < 10 && sh === w; t++) { for (let i = ch.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ch[i], ch[j]] = [ch[j], ch[i]]; } sh = ch.join(''); }
    return { ic: '🔤', t: 'Анаграмма', q: `Составь слово из букв: ${sh.toUpperCase().split('').join(' ')}`, a: w, hint: `Начинается на «${w[0].toUpperCase()}», ${w.length} букв` };
  }
  if (type === 'age') { const x = I(14, 40), y = I(2, 9), z = I(3, 15); return { ic: '🧩', t: 'Логика', q: `Брату сейчас ${x} лет, сестра младше его на ${y} года. Сколько лет будет сестре через ${z} лет?`, a: String(x - y + z), hint: 'Сначала узнай, сколько ей сейчас' }; }
  const h = I(5, 22), m = I(0, 11) * 5, dh = I(1, 9), dm = I(1, 11) * 5, tot = h * 60 + m + dh * 60 + dm;
  const out = `${pad(Math.floor(tot / 60) % 24)}:${pad(tot % 60)}`;
  return { ic: '🕑', t: 'Время в пути', q: `Поезд отправился в ${pad(h)}:${pad(m)} и ехал ${dh} ч ${dm} мин. Во сколько он прибыл? (ЧЧ:ММ)`, a: out, hint: 'Сложи сначала минуты, потом часы' };
}
function puzzlesFor(d) {
  const rnd = rng('puz' + d), types = ['seq', 'math', 'pct', 'anagram', 'age', 'time'];
  for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
  return types.slice(0, 3).map(t => makePuzzle(t, rnd));
}

/* ---------- отрисовка ---------- */
function lessonBlock(L, isToday) {
  const ans = state.brain.quiz[L.id], read = !!state.brain.read[L.id], none = L.id === '_none';
  const tagCls = L.cat === 'История' ? 'split' : L.cat === 'Наука' ? 'count' : L.cat === 'Финансы' ? 'money' : 'custom';
  return `<article class="lesson">${none ? lessonArt(L.m) : photoHero(L, lessonArt(L.m))}<div class="lesson-b">
    <div class="lhead"><span class="tag ${tagCls}">${esc(L.cat)}</span><span class="hint">${L.src === 'ai' ? 'от ИИ · ' : ''}≈ 2 минуты</span></div>
    <h2 class="ltitle">${esc(L.t)}</h2>
    ${L.p.map(x => `<p>${esc(x)}</p>`).join('')}
    ${L.key ? `<div class="tipbox"><b>Главное</b>${esc(L.key)}</div>` : ''}
    ${L.o && L.o.length ? `<div class="quiz"><h4 class="sh">Проверь себя</h4><p class="qq">${esc(L.q)}</p>
      ${L.o.map((o, k) => `<button class="qopt ${ans === undefined ? '' : k === L.a ? 'right' : k === ans ? 'wrong' : 'dim'}" data-act="lquiz" data-id="${L.id}" data-v="${k}" ${ans !== undefined ? 'disabled' : ''}>${esc(o)}</button>`).join('')}
      ${ans !== undefined ? `<p class="qres">${ans === L.a ? 'Верно! 👏' : 'Не совсем — правильный ответ отмечен зелёным.'}</p>` : ''}</div>` : ''}
    <div class="btnrow">${none ? '<button class="btn hot" data-act="lgen">Получить уроки от ИИ</button>' : read ? '<span class="ok-t" style="align-self:center">✓ Урок прочитан</span>' : `<button class="btn hot" data-act="lread" data-id="${L.id}">Прочитал ✓</button>`}
      ${!none && nextUnread([L.id, lessonOfDay().id]) ? '<button class="btn light" data-act="lnext">Ещё урок →</button>' : ''}${!isToday ? '<button class="btn light" data-act="ltoday">К уроку дня</button>' : ''}</div>
  </div></article>`;
}
function viewBrain() {
  ensureBrain(); fetchLessonsFeed();
  const st = brainStreak();
  const head = `<div class="top"><div><div class="date">${brainTab === 'lang' ? 'репетитор' : 'каждый день новое · ' + human(today())}</div><h1>Само&shy;развитие</h1></div>${st ? `<div class="streak"><b>${st}</b> ${plural(st, 'день', 'дня', 'дней')} подряд</div>` : ''}</div>
    <div class="seg">${[['today', 'Сегодня'], ['lang', 'Языки'], ['archive', 'Архив']].map(([k, n]) => `<button class="${brainTab === k ? 'on' : ''}" data-act="btab" data-v="${k}">${n}</button>`).join('')}</div>
    ${brainNote ? `<div class="bubble">${brainNote}</div>` : ''}`;
  if (brainTab === 'lang') return head + viewLang();
  if (brainTab === 'archive') return head + viewArchive();
  loadOnThisDay();
  const d = today(), Lday = lessonOfDay(), L = brainView ? lessonById(brainView) || Lday : Lday;
  const wiki = state.brain.wiki?.[d] || [];
  const puz = puzzlesFor(d), ps = state.brain.puz[d] || {};
  const left = unreadCount();
  ensureW();
  return head + lessonBlock(L, L.id === Lday.id) + wDaySection() + `
  <div class="grid2">
  <div class="panel"><h2>Разминка для мозга</h2><p>Три новых задания каждый день — генерируются заново и не повторяются.</p>
    ${puz.map((z, i) => { const s = ps[i] || {}; return `<div class="puz ${s.ok ? 'ok' : s.shown ? 'shown' : ''}"><div class="puz-h"><span>${z.ic}</span><b>${z.t}</b>${s.ok ? '<em class="pos">✓ решено</em>' : ''}</div><p>${esc(z.q)}</p>
      ${s.ok || s.shown ? `<p class="hint">Ответ: <b>${esc(z.a)}</b></p>` : `<form class="puz-f" data-i="${i}"><input class="inp" placeholder="ответ" autocomplete="off" inputmode="${/^\d/.test(z.a) ? 'decimal' : 'text'}"><button class="btn small hot" type="submit">Проверить</button></form><div class="btnrow" style="margin-top:6px"><button class="chip" data-act="phint" data-i="${i}">Подсказка</button><button class="chip" data-act="pshow" data-i="${i}">Показать ответ</button></div>${s.hint ? `<p class="hint">💡 ${esc(z.hint)}</p>` : ''}${s.wrong ? '<p class="hint" style="color:var(--bad)">Пока не то — попробуй ещё</p>' : ''}`}</div>`; }).join('')}
  </div>
  <div class="panel"><h2>В этот день в истории</h2>
    ${wiki.length ? `<ul class="otd">${wiki.map(e => `<li><b>${e.y}</b><span>${esc(e.t)}${e.url ? ` <a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">↗</a>` : ''}</span></li>`).join('')}</ul><p class="hint">Источник: Википедия. Каждый день — другие события.</p>`
      : `<p>${state.settings.photos === false ? 'Включи «Загружать фото и материалы из Википедии» в настройках.' : 'Загрузится из Википедии, когда будет интернет.'}</p>`}
  </div>
  </div>
  ${L.id !== '_none' ? aiPanel('brain', 'ИИ-наставник', mentorPrompt(L), 'Разберёт урок глубже, задаст вопросы и посоветует, что почитать.') : ''}
  <div class="panel ai-panel"><h2>Уроков в запасе: ${left}</h2>
    <p>Уроки не повторяются. Когда встроенные закончатся, свежие можно получать от ИИ: автоматически через бота (каждый день) или вручную.</p>
    <div class="btnrow"><button class="btn hot" data-act="lgen">Скопировать запрос на 10 уроков</button><button class="btn light" data-act="lpaste">Вставить уроки от ИИ</button><a class="btn light" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Открыть Claude ↗</a></div>
  </div>`;
}
function viewArchive() {
  const read = Object.entries(state.brain.read).sort((a, b) => b[1].localeCompare(a[1])).map(([id, d]) => [lessonById(id), d]).filter(x => x[0]);
  const right = Object.entries(state.brain.quiz).filter(([id, v]) => lessonById(id)?.a === v).length;
  return `<div class="panel"><div class="kpis"><div><span>Прочитано</span><b>${read.length}</b></div><div><span>Верных ответов</span><b>${right}</b></div><div><span>В запасе</span><b>${unreadCount()}</b></div></div></div>
  ${read.length ? `<div class="panel"><ul class="arch">${read.map(([L, d]) => `<li><button data-act="lopen" data-id="${L.id}"><span>${esc(L.t)}</span><small>${esc(L.cat)} · ${human(d)}</small></button></li>`).join('')}</ul></div>` : '<div class="empty"><p style="margin:0">Прочитанные уроки появятся здесь.</p></div>'}`;
}
function brainClick(act, el) {
  const d = today();
  switch (act) {
    case 'btab': brainTab = el.dataset.v; brainView = null; brainNote = ''; render(); return true;
    case 'lquiz': state.brain.quiz[el.dataset.id] = +el.dataset.v; save(); render(); return true;
    case 'lread': state.brain.read[el.dataset.id] = d; save(); toast('Урок засчитан 🧠'); render(); return true;
    case 'lnext': { const cur = brainView || lessonOfDay().id; const n = nextUnread([cur, lessonOfDay().id]); if (n) { brainView = n.id; render(); } return true; }
    case 'ltoday': brainView = null; render(); return true;
    case 'lopen': brainView = el.dataset.id; brainTab = 'today'; render(); return true;
    case 'lgen': textSheet('Запрос: 10 новых уроков', lessonsGenPrompt(), null, txt => { try { const n = addLessons(JSON.parse(txt.match(/\[[\s\S]*\]/)[0])); brainNote = `ИИ прислал новых уроков: ${n}.`; closeSheet(); render(); } catch (e) { toast('Не нашёл уроки в ответе'); } }); return true;
    case 'lpaste': textSheet('Вставь ответ ИИ с уроками', '', raw => { let arr = []; try { const m = raw.match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : raw); } catch (e) {} const n = addLessons(Array.isArray(arr) ? arr : arr.lessons); closeSheet(); brainNote = n ? `Добавлено уроков: <b>${n}</b>.` : 'Не нашёл уроков в тексте — нужен JSON-массив из ответа ИИ.'; render(); }); return true;
    case 'phint': case 'pshow': { const ps = (state.brain.puz[d] ||= {}), i = el.dataset.i; ps[i] = { ...(ps[i] || {}), [act === 'phint' ? 'hint' : 'shown']: true }; save(); render(); return true; }
  }
  return false;
}
document.addEventListener('submit', e => {
  const f = e.target.closest('.puz-f'); if (!f) return;
  e.preventDefault();
  const d = today(), i = f.dataset.i, z = puzzlesFor(d)[i], v = f.querySelector('input').value;
  const ps = (state.brain.puz[d] ||= {}); const ok = norm(v) === norm(z.a);
  ps[i] = { ...(ps[i] || {}), ok, wrong: !ok }; save(); if (ok) toast('Верно! 🧠'); render();
});
