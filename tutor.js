'use strict';
/* =========================================================
   Репетитор в духе Duolingo — полностью встроенный, без ИИ и платных ключей.
   Путь из 10 тем → уроки из коротких заданий: новое слово, выбор перевода, на слух, ввод,
   пары, сборка предложения, грамматика. Ошибки повторяются в конце урока.
   ========================================================= */
let tSess = null, tTab = 'path', tDictQ = '', tGramOpen = null;

/* темы для языка: 10 базовых + «Частые слова» по 50 (если для языка загружен частотный словарь) */
const _ul = {};
function UL(code) {
  if (_ul[code]) return _ul[code];
  const list = UNITS.slice(), f = (window.FREQ || {})[code];
  if (f) {
    const rows = f.split('\n').map(r => r.split('|')).filter(r => r.length === 2);
    for (let i = 0; i < rows.length; i += 50) {
      const part = rows.slice(i, i + 50);
      list.push({ t: `Частые слова ${i / 50 + 1}`, ic: '📚', freq: true, ru: part.map(r => r[1]), [code]: part.map(r => r[0]), s: [] });
    }
  }
  return (_ul[code] = list);
}
function ensureUnits(l) {
  if (!l) return;
  const code = l.lang;
  if (l.v !== 2) { // перенос со старого формата
    const old = l.words || {}, byText = {};
    l.words = {};
    UNITS.forEach((U, u) => (U[code] || []).forEach((w, i) => { const id = `${code}:${u}:${i}`; l.words[id] = { id, w, tr: U.ru[i], unit: u, lvl: 0, due: today(), learned: null }; byText[tnorm(w)] = id; }));
    Object.values(old).forEach(o => {
      const hit = byText[tnorm(o.w)];
      if (hit) { if (o.learned) Object.assign(l.words[hit], { learned: o.learned, lvl: o.lvl || 1, due: o.due || today() }); }
      else if (!/^[a-z]{2}\d+$/.test(o.id) || o.learned) l.words[o.id] = { ...o, unit: -1 };
    });
    l.v = 2; l.xp ||= {}; l.gdone ||= {}; save();
  }
  // новые темы (например, частотный словарь) добавляются, прогресс не трогаем
  let added = 0;
  UL(code).forEach((U, u) => (U[code] || []).forEach((w, i) => { const id = `${code}:${u}:${i}`; if (!l.words[id]) { l.words[id] = { id, w, tr: U.ru[i], unit: u, lvl: 0, due: today(), learned: null }; added++; } }));
  if (added) save();
}

/* ---------- сравнение ответов ---------- */
const ARTS = /^(the|a|an|to|der|die|das|den|ein|eine|einen|el|la|los|las|un|una|le|les|l'|l’|il|lo|gli|i|une|des)\s+/;
function tnorm(s) {
  return String(s || '').toLowerCase().replace(/\(.*?\)/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[¿¡!?.,;:"«»…]/g, '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}
const bare = s => tnorm(s).replace(ARTS, '').replace(/^l'/, '').trim();
function sameAnswer(input, target) {
  const a = bare(input), variants = [bare(target)];
  const py = (target.match(/\((.*?)\)/) || [])[1]; // китайский: можно иероглифами или пиньинем без тонов
  if (py) variants.push(tnorm(py).replace(/\s/g, ''));
  return variants.some(v => v === a || v === a.replace(/\s/g, '') || (v.length > 5 && lev(a, v) <= 1));
}
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
const fw = w => { const m = String(w).match(/^(.*?)\s*\((.*)\)\s*$/); return m ? `<span class="hz">${esc(m[1])}</span><small class="py">${esc(m[2])}</small>` : esc(w); };

/* ---------- сборка урока ---------- */
function shuffle(a, seed) { const r = rng(seed || String(Math.random())); a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function unitWords(l, u) { return Object.values(l.words).filter(w => w.unit === u); }
function curUnit(l) { const n = UL(l.lang).length; for (let u = 0; u < n; u++) if (unitWords(l, u).some(w => !w.learned)) return u; return n - 1; }
function distractors(l, w, n, field) { const pool = Object.values(l.words).filter(x => x.id !== w.id && x[field] !== w[field]); const same = pool.filter(x => x.unit === w.unit); return shuffle(same.length >= n ? same : pool, w.id + Date.now()).slice(0, n); }

function buildSession(l, opts = {}) {
  const d = today(), steps = [];
  if (opts.grammar != null) { // тренировка одной темы грамматики
    const T = GR[l.lang][opts.grammar];
    shuffle(T.q.map((_, qi) => ({ type: 'gram', topic: opts.grammar, qi }))).forEach(s => steps.push(s));
    return { steps, i: 0, xp: 0, ok: 0, total: 0, title: T.t, grammarTopic: opts.grammar };
  }
  const u = opts.unit ?? curUnit(l), plan = langDaily(), needToday = Math.max(3, plan.perDay - plan.learnedToday);
  const fresh = unitWords(l, u).filter(w => !w.learned).slice(0, Math.min(5, needToday));
  const due = opts.review ? Object.values(l.words).filter(w => w.learned && w.due <= d).slice(0, 10) : Object.values(l.words).filter(w => w.learned && w.due <= d).slice(0, 4);
  const voice = 'speechSynthesis' in window;
  fresh.forEach((w, k) => { steps.push({ type: 'intro', id: w.id }); steps.push({ type: 'pick', id: w.id, dir: k % 2 ? 'f2ru' : 'ru2f' }); });
  due.forEach((w, k) => steps.push({ type: ['type', 'pick', voice ? 'listen' : 'pick'][k % 3], id: w.id, dir: 'ru2f', review: true }));
  const known = Object.values(l.words).filter(w => w.unit === u && (w.learned || fresh.includes(w)));
  if (known.length >= 4) steps.push({ type: 'match', ids: shuffle(known, 'm' + d).slice(0, 5).map(w => w.id) });
  fresh.slice(0, 2).forEach(w => steps.push({ type: voice ? 'listen' : 'type', id: w.id }));
  fresh.slice(2, 4).forEach(w => steps.push({ type: 'type', id: w.id }));
  const sents = (UL(l.lang)[u].s || []).filter(s => s[l.lang]); if (sents.length && !opts.review) steps.push({ type: 'build', unit: u, si: (l.xp[d] || 0) % sents.length });
  const gi = (diff(l.start, d) % GR[l.lang].length + GR[l.lang].length) % GR[l.lang].length;
  if (!opts.review) steps.push({ type: 'gram', topic: gi, qi: Math.floor(Math.random() * GR[l.lang][gi].q.length) });
  return { steps, i: 0, xp: 0, ok: 0, total: 0, title: opts.review ? 'Повторение' : UL(l.lang)[u].t, unit: u, fresh: fresh.map(w => w.id) };
}

/* ---------- отрисовка задания ---------- */
function stepView(s, l) {
  const w = s.id ? l.words[s.id] : null, a = tSess.ans || {}, done = tSess.checked;
  const optBtn = (val, label, extra = '') => `<button class="topt ${a.v === val ? 'sel' : ''} ${done ? (val === tSess.right ? 'ok' : a.v === val ? 'bad' : '') : ''}" data-act="tsel" data-v="${esc(val)}" ${done ? 'disabled' : ''}>${label}${extra}</button>`;
  switch (s.type) {
    case 'intro': return `<p class="tq">Новое слово</p><div class="tintro"><div class="tw">${fw(w.w)}</div><button class="tsay" data-act="tsay" data-v="${esc(w.w)}">🔊</button><div class="ttr">${esc(w.tr)}</div></div>`;
    case 'pick': {
      tSess.right ??= s.dir === 'ru2f' ? w.w : w.tr;
      tSess.opts ??= shuffle([w, ...distractors(l, w, 3, s.dir === 'ru2f' ? 'w' : 'tr')], w.id + tSess.i).map(x => s.dir === 'ru2f' ? x.w : x.tr);
      return `<p class="tq">${s.dir === 'ru2f' ? 'Как сказать' : 'Что значит'}</p><div class="tprompt">${s.dir === 'ru2f' ? esc(w.tr) : fw(w.w)}${s.dir === 'f2ru' ? `<button class="tsay sm" data-act="tsay" data-v="${esc(w.w)}">🔊</button>` : ''}</div><div class="topts">${tSess.opts.map(o => optBtn(o, s.dir === 'ru2f' ? fw(o) : esc(o))).join('')}</div>`;
    }
    case 'listen': {
      tSess.right ??= w.tr;
      tSess.opts ??= shuffle([w, ...distractors(l, w, 3, 'tr')], w.id + 'l' + tSess.i).map(x => x.tr);
      if (!tSess.spoke) { tSess.spoke = 1; setTimeout(() => speak(w.w), 250); }
      return `<p class="tq">Послушай и выбери перевод</p><div class="tprompt"><button class="tsay big" data-act="tsay" data-v="${esc(w.w)}">🔊</button>${done ? `<div>${fw(w.w)}</div>` : ''}</div><div class="topts">${tSess.opts.map(o => optBtn(o, esc(o))).join('')}</div>`;
    }
    case 'type': return `<p class="tq">Напиши по-${({ en: 'английски', de: 'немецки', es: 'испански', tr: 'турецки', zh: 'китайски (можно пиньинем без тонов)', fr: 'французски', it: 'итальянски' })[l.lang]}</p><div class="tprompt">${esc(w.tr)}</div>
      <form id="ttype"><input class="inp tinp" id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(a.v || '')}" ${done ? 'disabled' : ''} placeholder="ответ"></form>`;
    case 'match': {
      tSess.mt ??= { L: shuffle(s.ids, 'L' + tSess.i), R: shuffle(s.ids, 'R' + tSess.i), done: [], pick: null, bad: null };
      const m = tSess.mt;
      const cell = (id, side) => `<button class="tm ${m.done.includes(id) ? 'gone' : ''} ${m.pick && m.pick.side === side && m.pick.id === id ? 'sel' : ''} ${m.bad && m.bad.includes(side + id) ? 'bad' : ''}" data-act="tmatch" data-side="${side}" data-id="${id}" ${m.done.includes(id) ? 'disabled' : ''}>${side === 'L' ? fw(l.words[id].w) : esc(l.words[id].tr)}</button>`;
      return `<p class="tq">Найди пары</p><div class="tmatch"><div>${m.L.map(id => cell(id, 'L')).join('')}</div><div>${m.R.map(id => cell(id, 'R')).join('')}</div></div>`;
    }
    case 'build': {
      const S = UL(l.lang)[s.unit].s[s.si], target = S[l.lang], toks = tokenize(target, l.lang);
      tSess.right ??= toks.join(' ');
      if (!tSess.bank) {
        const others = UL(l.lang)[s.unit].s.filter(x => x !== S).flatMap(x => tokenize(x[l.lang], l.lang)).filter(t => !toks.includes(t));
        tSess.bank = shuffle([...toks, ...shuffle(others, 'o' + tSess.i).slice(0, 3)].map((t, k) => ({ t, k })), 'b' + tSess.i); tSess.built = [];
      }
      return `<p class="tq">Составь предложение</p><div class="tprompt">${esc(S.ru)}</div>
        <div class="tbuilt">${tSess.built.map(k => `<button class="ttile" data-act="tunbuild" data-k="${k}" ${done ? 'disabled' : ''}>${esc(tSess.bank.find(b => b.k === k).t)}</button>`).join('') || '<span class="hint">нажимай на слова ниже</span>'}</div>
        <div class="tbank">${tSess.bank.map(b => `<button class="ttile ${tSess.built.includes(b.k) ? 'used' : ''}" data-act="tbuild" data-k="${b.k}" ${done || tSess.built.includes(b.k) ? 'disabled' : ''}>${esc(b.t)}</button>`).join('')}</div>`;
    }
    case 'gram': {
      const T = GR[l.lang][s.topic], Q = T.q[s.qi];
      tSess.right ??= Q.o[Q.a];
      return `<p class="tq">Грамматика · ${esc(T.t)}</p><div class="tprompt gram">${esc(Q.s).replace('___', `<span class="gap">${a.v ? esc(a.v) : '___'}</span>`)}</div><p class="hint" style="text-align:center">${esc(Q.ru)}</p><div class="topts">${Q.o.map(o => optBtn(o, esc(o))).join('')}</div>
        ${tSess.i === 0 && tSess.grammarTopic != null ? '' : `<details class="tgr"><summary>Подсказка: правило</summary><p>${esc(T.r)}</p></details>`}`;
    }
  }
  return '';
}
const tokenize = (s, lang) => lang === 'zh' ? s.split(/\s+/).filter(t => t && !/^[，。？！]$/.test(t)) : s.replace(/[¿¡]/g, '').split(/\s+/).map(t => t.replace(/[.,!?;:]+$/, '')).filter(Boolean);

function sessionView(l) {
  const s = tSess.steps[tSess.i], pct = tSess.i / tSess.steps.length, done = tSess.checked;
  const canCheck = s.type === 'intro' || (s.type === 'build' ? tSess.built?.length : s.type === 'match' ? false : (tSess.ans?.v ?? '') !== '');
  return `<div class="tsess">
    <div class="ttop"><button class="x" data-act="tquit" aria-label="Выйти">×</button><div class="bar"><i style="width:${pct * 100}%"></i></div><b class="txp">⚡ ${tSess.xp}</b></div>
    <div class="tbody">${stepView(s, l)}</div>
    <div class="tfoot ${done ? (tSess.good ? 'good' : 'bad') : ''}">
      ${done ? `<div class="tfb"><b>${tSess.good ? pickPraise() : 'Правильный ответ:'}</b>${tSess.good ? '' : `<div>${fw(tSess.right)}</div>`}${s.type === 'gram' ? `<small>${esc(GR[l.lang][s.topic].q[s.qi].ru)}</small>` : s.type === 'build' ? `<small>${esc(UL(l.lang)[s.unit].s[s.si].ru)}</small>` : ''}</div>` : ''}
      <button class="btn hot tgo" data-act="${done || s.type === 'intro' ? 'tnext' : 'tcheck'}" ${!done && !canCheck ? 'disabled' : ''}>${done || s.type === 'intro' ? 'Дальше' : 'Проверить'}</button>
    </div></div>`;
}
const pickPraise = () => ['Отлично!', 'Верно!', 'Супер!', 'Так держать!', 'Молодец!'][Math.floor(Math.random() * 5)];
function finishView(l) {
  const acc = tSess.total ? Math.round(tSess.ok / tSess.total * 100) : 100;
  return `<div class="panel tfinish"><div class="tbig">🎉</div><h2>Урок пройден!</h2>
    <div class="kpis"><div><span>Опыт</span><b>+${tSess.xp}</b></div><div><span>Точность</span><b>${acc}%</b></div><div><span>Новых слов</span><b>${(tSess.fresh || []).length}</b></div></div>
    <div class="btnrow" style="justify-content:center"><button class="btn hot" data-act="tstart">Следующий урок</button><button class="btn light" data-act="tquit">Готово</button></div></div>`;
}

/* ---------- главный экран репетитора ---------- */
function tutorView(l) {
  ensureUnits(l);
  if (tSess) return tSess.finished ? finishView(l) : sessionView(l);
  const L = LANGS[l.lang], st = langDaily(), d = today(), xpToday = l.xp[d] || 0, streak = tStreak(l);
  const dueN = Object.values(l.words).filter(w => w.learned && w.due <= d).length;
  const hero = `<div class="panel lhero"><div class="gbody">${flask(learnedCount() / l.target, { kind: 'flag', lang: l.lang })}
    <div class="ginfo"><h2>${L.f} ${L.n}</h2><div class="stats" style="margin-top:6px">${learnedCount()} из ${l.target} слов · осталось ${st.left} дн.</div>
    <p style="margin:4px 0 0">Сегодня: <b>${st.learnedToday}/${st.perDay}</b> новых слов · ⚡ ${xpToday} опыта${streak ? ` · 🔥 ${streak} ${plural(streak, 'день', 'дня', 'дней')}` : ''}</p></div></div>
    <div class="btnrow"><button class="btn hot" data-act="tstart">${st.learnedToday >= st.perDay ? 'Ещё урок' : 'Начать урок'}</button>${dueN ? `<button class="btn light" data-act="treview">Повторить · ${dueN}</button>` : ''}<button class="btn small light" data-act="lsetup">Сменить язык или цель</button></div></div>
    <div class="seg">${[['path', 'Путь'], ['gram', 'Грамматика'], ['dict', 'Словарь']].map(([k, n]) => `<button class="${tTab === k ? 'on' : ''}" data-act="ttab" data-v="${k}">${n}</button>`).join('')}</div>`;
  if (tTab === 'gram') return hero + gramView(l);
  if (tTab === 'dict') return hero + dictView(l);
  const cu = curUnit(l);
  const extra = Object.values(l.words).filter(w => w.unit === -1);
  const total = Object.values(l.words).filter(w => w.unit >= 0).length;
  return hero + `<div class="tpath">${UL(l.lang).map((U, u) => { const ws = unitWords(l, u), k = ws.filter(w => w.learned).length, p = ws.length ? k / ws.length : 0;
      return `<button class="tunit ${u === cu ? 'cur' : ''} ${p === 1 ? 'full' : ''}" data-act="tunit" data-v="${u}" style="--p:${p}"><span class="tring"><i>${U.ic}</i></span><span><b>${u + 1}. ${U.t}</b><small>${k}/${ws.length} слов${p === 1 ? ' · пройдено ✓' : u === cu ? ' · сейчас' : ''}</small></span></button>`; }).join('')}</div>
    ${learnedCount() >= total - 4 || l.target > total ? `<div class="panel"><h2>Больше слов</h2><p>Во встроенном курсе ${total} слов. Если цель больше, добавляй свои слова — они попадут в уроки и повторение. ${extra.length ? `Сейчас своих слов: <b>${extra.length}</b>.` : ''}</p>
      <div class="btnrow"><button class="btn light" data-act="lwadd">+ Своё слово</button><button class="btn light" data-act="lwpaste">Вставить список слов</button></div>
      <p class="hint">Список можно бесплатно получить в обычном чате Claude: скопируй запрос ниже и вставь ответ сюда.</p></div>` : ''}
    ${aiPanel('lang', 'Слова и практика из чата Claude', langPrompt(), 'Бесплатно: скопируй запрос, вставь в обычный чат Claude, а слова из ответа вставь кнопкой «Вставить список слов».')}`;
}
function tStreak(l) { let n = 0, d = today(); if (!l.xp[d]) d = addDays(d, -1); while (l.xp[d] && n < 999) { n++; d = addDays(d, -1); } return n; }
function gramView(l) {
  return `<div class="tgrams">${GR[l.lang].map((T, i) => `<div class="panel tgram ${tGramOpen === i ? 'open' : ''}">
    <button class="tgh" data-act="tgopen" data-v="${i}"><b>${i + 1}. ${esc(T.t)}</b><span>${l.gdone[i] ? `✓ ${l.gdone[i]}/${T.q.length}` : ''} ${tGramOpen === i ? '▲' : '▼'}</span></button>
    ${tGramOpen === i ? `<p>${esc(T.r)}</p><div class="tex">${T.e.map(([f, r]) => `<div><button class="tsay sm" data-act="tsay" data-v="${esc(f)}">🔊</button><b>${esc(f)}</b><span>${esc(r)}</span></div>`).join('')}</div>
      <div class="btnrow"><button class="btn hot" data-act="tgram" data-v="${i}">Тренировать · ${T.q.length} задания</button></div>` : ''}</div>`).join('')}</div>`;
}
function dictView(l) {
  const q = tnorm(tDictQ), all = Object.values(l.words).filter(w => !q || tnorm(w.w).includes(q) || tnorm(w.tr).includes(q));
  const learned = all.filter(w => w.learned), rest = all.filter(w => !w.learned);
  const row = w => `<li class="${w.learned ? '' : 'dim'}"><button class="tsay sm" data-act="tsay" data-v="${esc(w.w)}">🔊</button><b>${fw(w.w)}</b><span>${esc(w.tr)}</span>${w.learned ? `<i class="lvl">${'●'.repeat(Math.min(5, w.lvl || 1))}${'○'.repeat(Math.max(0, 5 - (w.lvl || 1)))}</i>` : ''}</li>`;
  return `<div class="panel"><input class="inp" id="tdq" placeholder="Поиск по словарю" value="${esc(tDictQ)}" autocomplete="off">
    <h4 class="sh">Выучено · ${learned.length}</h4>${learned.length ? `<ul class="tdict">${learned.map(row).join('')}</ul>` : '<p class="hint">Пройди первый урок — слова появятся здесь.</p>'}
    <details ${q ? 'open' : ''}><summary>Впереди · ${rest.length}</summary><ul class="tdict">${rest.map(row).join('')}</ul></details></div>`;
}

/* ---------- логика ---------- */
function tMark(l, w, good) {
  const d = today();
  if (good) { if (!w.learned) { w.learned = d; w.lvl = 1; w.due = addDays(d, SRS[0]); } else { w.lvl = Math.min(SRS.length, (w.lvl || 1) + 1); w.due = addDays(d, SRS[w.lvl - 1]); } }
  else if (w.learned) { w.lvl = Math.max(1, (w.lvl || 1) - 1); w.due = addDays(d, 1); }
}
function tCheck(l) {
  const s = tSess.steps[tSess.i], a = tSess.ans || {};
  let good;
  if (s.type === 'type') good = sameAnswer($('#tin')?.value || a.v || '', l.words[s.id].w), tSess.ans = { v: $('#tin')?.value || a.v || '' }, tSess.right = l.words[s.id].w;
  else if (s.type === 'build') { const got = tSess.built.map(k => tSess.bank.find(b => b.k === k).t).join(' '); good = tnorm(got) === tnorm(tSess.right); }
  else good = a.v === tSess.right;
  tSess.checked = true; tSess.good = good; tSess.total++;
  if (good) { tSess.ok++; tSess.xp += 2; } else if (!s.retry) tSess.steps.push({ ...s, retry: true });
  if (s.id && s.type !== 'intro') tMark(l, l.words[s.id], good);
  if (s.type === 'gram' && good && tSess.grammarTopic != null) l.gdone[s.topic] = Math.min(GR[l.lang][s.topic].q.length, (l.gdone[s.topic] || 0) + 1);
  if (good && l.lang && s.id) speak(l.words[s.id].w);
  save(); render();
}
function tNext(l) {
  const s = tSess.steps[tSess.i];
  if (s.type === 'intro') speak(l.words[s.id].w);
  tSess.i++; ['ans', 'checked', 'good', 'right', 'opts', 'spoke', 'mt', 'bank', 'built'].forEach(k => delete tSess[k]);
  if (tSess.i >= tSess.steps.length) {
    const d = today(); l.xp[d] = (l.xp[d] || 0) + tSess.xp + 5; tSess.xp += 5; tSess.finished = true; syncLangGoal(); save();
  }
  render();
}
function tutorClick(act, el) {
  const l = L$(); if (!l) return false;
  switch (act) {
    case 'tstart': tSess = buildSession(l); if (!tSess.steps.length) { tSess = null; toast('Все слова курса пройдены — добавь свои или повтори'); } render(); return true;
    case 'treview': tSess = buildSession(l, { review: true }); render(); return true;
    case 'tunit': tSess = buildSession(l, { unit: +el.dataset.v }); if (!tSess.steps.length) { tSess = buildSession(l, { unit: +el.dataset.v, review: true }); } render(); return true;
    case 'tgram': tSess = buildSession(l, { grammar: +el.dataset.v }); render(); return true;
    case 'tquit': tSess = null; render(); return true;
    case 'ttab': tTab = el.dataset.v; render(); return true;
    case 'tgopen': tGramOpen = tGramOpen === +el.dataset.v ? null : +el.dataset.v; render(); return true;
    case 'tsay': speak(el.dataset.v); return true;
    case 'tsel': if (!tSess.checked) { tSess.ans = { v: el.dataset.v }; const st = tSess.steps[tSess.i]; if (st.type === 'pick' && st.dir === 'ru2f') speak(el.dataset.v); render(); } return true;
    case 'tcheck': tCheck(l); return true;
    case 'tnext': tNext(l); return true;
    case 'tbuild': tSess.built.push(+el.dataset.k); render(); return true;
    case 'tunbuild': tSess.built = tSess.built.filter(k => k !== +el.dataset.k); render(); return true;
    case 'tmatch': {
      const m = tSess.mt, side = el.dataset.side, id = el.dataset.id;
      if (side === 'L') speak(l.words[id].w);
      if (!m.pick || m.pick.side === side) { m.pick = { side, id }; m.bad = null; render(); return true; }
      if (m.pick.id === id) { m.done.push(id); tMark(l, l.words[id], true); tSess.xp += 1; }
      else { m.bad = [m.pick.side + m.pick.id, side + id]; tSess.mistake = true; }
      m.pick = null;
      if (m.done.length === tSess.steps[tSess.i].ids.length) { tSess.checked = true; tSess.good = !tSess.mistake; tSess.right = ''; tSess.total++; if (tSess.good) tSess.ok++; delete tSess.mistake; save(); }
      render(); return true;
    }
  }
  return false;
}
document.addEventListener('submit', e => { if (e.target.id === 'ttype') { e.preventDefault(); const l = L$(); if (tSess && !tSess.checked && $('#tin').value.trim()) tCheck(l); } });
document.addEventListener('input', e => {
  if (e.target.id === 'tin' && tSess) { tSess.ans = { v: e.target.value }; const b = document.querySelector('.tgo'); if (b) b.disabled = !e.target.value.trim(); }
  if (e.target.id === 'tdq') { tDictQ = e.target.value; clearTimeout(tutorClick.t); tutorClick.t = setTimeout(() => { const pos = e.target.selectionStart; render(); const i = $('#tdq'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }, 250); }
});
