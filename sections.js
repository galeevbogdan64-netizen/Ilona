'use strict';
/* =========================================================
   Разделы «Финансы», «Готовка», «Саморазвитие».
   Используют общие помощники из index.html (state, save, render, esc, fmt, today…),
   которые объявлены позже, но вызываются только во время работы.
   ========================================================= */

function ensureState() {
  state.money ||= { tx: [] };
  state.food ||= { fridge: [], profile: null, log: {} };
  state.food.log ||= {}; state.food.fridge ||= []; state.food.custom ||= [];
  state.brain ||= { start: null, read: {}, quiz: {} };
  if (!state.brain.start) { state.brain.start = today(); save(); }
}

/* ---------- общий блок «Спросить ИИ» ---------- */
function aiPanel(id, title, prompt, desc) {
  const hasKey = !!state.settings.apiKey;
  return `<div class="panel ai-panel"><h2>${esc(title)}</h2>
    <p>${esc(desc || 'Запрос собран из твоих данных. Ничего не отправляется само.')}</p>
    <details><summary>Показать текст запроса</summary><textarea class="prompt" id="prompt-${id}">${esc(prompt)}</textarea></details>
    <div class="btnrow">
      ${hasKey ? `<button class="btn hot" data-act="ask" data-src="${id}">Спросить ИИ</button>` : ''}
      <button class="btn ${hasKey ? 'light' : 'hot'}" data-act="copy" data-src="${id}">Скопировать запрос</button>
      <a class="btn light" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Открыть Claude ↗</a>
    </div>
    <div class="note"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="6.5"/><path d="M8 7v4.5M8 4.6v.1"/></svg><span>${hasKey ? 'Отправится только этот текст и только по нажатию.' : 'Скопируй и вставь в чат с любым ИИ. Приложение Claude ставить не нужно — подойдёт и сайт в браузере.'}</span></div>
    <div id="answer-${id}">${aiAnswers[id] ? `<div class="answer">${esc(aiAnswers[id])}</div>` : ''}</div></div>`;
}
const aiAnswers = {}; // ответы ИИ живут, пока приложение открыто, и не пропадают при обновлении экрана

/* =========================================================
   ДЕНЬГИ
   ========================================================= */
const IN_RE = /(^|\s)\+|заработ|получил|зарплат|(^|[^а-яё])зп([^а-яё]|$)|доход|преми|аванс|кэшб|кешб|вернули|возврат|продал|заплатили|пришл[аио]|подарили|перевели мне|гонорар|оплата от|скинули/;
const NUM_RE = /(\d+(?:[  ]\d{3})*(?:[.,]\d+)?)\s*(тыс\.?|т\.?\s?р\.?|млн|k|к)?(?![а-яёa-z])/i;

function parseOne(raw) {
  const low = raw.toLowerCase().replace(/ё/g, 'е');
  const m = low.match(NUM_RE);
  if (!m) return null;
  let amount = parseFloat(m[1].replace(/[  ]/g, '').replace(',', '.'));
  const suf = (m[2] || '').replace(/\s/g, '');
  if (/^(тыс|т\.?р|k|к)/.test(suf)) amount *= 1000;
  if (suf.startsWith('млн')) amount *= 1e6;
  if (!(amount > 0)) return null;
  const kind = (/^\s*-/.test(low) ? false : IN_RE.test(low)) ? 'in' : 'out';
  const dict = kind === 'in' ? INCOME_CATS : MONEY_CATS;
  let cat = 'other';
  for (const [k, c] of Object.entries(dict)) if (c.kw.some(w => low.includes(w.replace(/ё/g, 'е')))) { cat = k; break; }
  let note = raw.replace(m[0].trim(), ' ')
    .replace(/^\s*[+\-]/, '')
    .replace(/(потратил[аи]?|заработал[аи]?|получил[аи]?|купил[аи]?|заплатил[аи]?|сегодня|руб(лей|ля|\.)?|₽|р\.)/gi, ' ')
    .replace(/(^|\s)(на|за)(\s|$)/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  if (!note) note = (kind === 'in' ? INCOME_CATS : MONEY_CATS)[cat].n;
  return { kind, amount: Math.round(amount * 100) / 100, cat, note: note.charAt(0).toUpperCase() + note.slice(1) };
}
function parseTx(text) {
  return text.split(/\n|;|,\s+(?=[^\d\s])|\s+и\s+(?=[^\n]*\d)/i).map(s => s.trim()).filter(Boolean).map(parseOne).filter(Boolean);
}

const monthKey = d => d.slice(0, 7);
function periodRange(p) {
  const t = today();
  if (p === 'week') return [addDays(t, -6), t];
  if (p === 'prev') { const d = parse(t); d.setDate(1); d.setDate(0); const end = iso(d); return [end.slice(0, 8) + '01', end]; }
  return [t.slice(0, 8) + '01', t];
}
function moneyStats(from, to) {
  const tx = state.money.tx.filter(x => x.d >= from && x.d <= to);
  const inc = tx.filter(x => x.kind === 'in').reduce((s, x) => s + x.amount, 0);
  const out = tx.filter(x => x.kind === 'out').reduce((s, x) => s + x.amount, 0);
  const byCat = {};
  tx.filter(x => x.kind === 'out').forEach(x => byCat[x.cat] = (byCat[x.cat] || 0) + x.amount);
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  return { tx, inc, out, bal: inc - out, cats };
}
const money = (n, sign) => (sign && n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n)) + ' ₽';

function moneyAdvice(s, period) {
  const adv = [];
  if (!s.tx.length) return ['Пиши всё подряд хотя бы неделю — тогда я смогу показать, куда уходят деньги.'];
  if (!s.inc) adv.push('За этот период не записано доходов. Добавь зарплату или заказы (например: «+60000 зарплата»), чтобы видеть, в плюсе ты или в минусе.');
  if (s.inc && s.bal < 0) adv.push(`Ты в минусе на ${fmt(-s.bal)} ₽. Главные статьи расходов — ниже; начни с той, что не относится к обязательным.`);
  if (s.inc > 0) {
    const rate = s.bal / s.inc;
    if (rate >= 0.2) adv.push(`Ты откладываешь ${Math.round(rate * 100)}% дохода — это отличный уровень (ориентир — от 20%).`);
    else if (rate >= 0) adv.push(`Остаётся ${Math.round(rate * 100)}% дохода. Попробуй дойти до 10–20%: переводи эту часть в день зарплаты, а не «что останется».`);
  }
  for (const [cat, sum] of s.cats.slice(0, 4)) {
    const c = MONEY_CATS[cat]; if (!c || c.need) continue;
    const share = s.out ? sum / s.out : 0;
    if (share >= 0.15) { adv.push(`«${c.n}» — ${Math.round(share * 100)}% всех трат (${fmt(sum)} ₽). Если урезать на треть, сэкономишь около ${fmt(sum / 3)} ₽.`); }
  }
  const small = s.tx.filter(x => x.kind === 'out' && x.amount <= 400);
  if (small.length >= 5) adv.push(`Мелкие покупки до 400 ₽: ${small.length} шт. на ${fmt(small.reduce((a, x) => a + x.amount, 0))} ₽. Мелочи незаметно съедают бюджет.`);
  const cafe = s.cats.find(c => c[0] === 'cafe')?.[1] || 0, food = s.cats.find(c => c[0] === 'food')?.[1] || 0;
  if (cafe > food && cafe > 1500) adv.push('На кафе и доставку уходит больше, чем на продукты. Готовить дома — один из самых быстрых способов сэкономить (рецепты — во вкладке «Готовка»).');
  const taxi = s.cats.find(c => c[0] === 'taxi')?.[1] || 0;
  if (taxi > 2000) adv.push(`Такси — ${fmt(taxi)} ₽. Часть поездок можно заменить транспортом.`);
  if (s.cats.find(c => c[0] === 'subs')) adv.push('Есть подписки — проверь, всеми ли пользуешься. Отмена одной ненужной — экономия каждый месяц.');
  return adv;
}

function investBlock(s) {
  if (!(s.bal > 0)) return '';
  const monthOut = Math.max(s.out, 1);
  const goals = (state.goals || []).filter(g => g.type === 'money' && g.end >= today());
  return `<div class="panel"><h2>Куда направить плюс</h2>
    <p>Общие принципы, а не инвестиционная рекомендация — решение всегда за тобой.</p>
    <ol class="steps">
      <li><span><b>Подушка безопасности.</b> Ориентир — 3–6 месяцев расходов. По твоим тратам это примерно ${fmt(monthOut * 3)}–${fmt(monthOut * 6)} ₽. Держат её на накопительном счёте или вкладе, откуда деньги можно быстро снять.</span></li>
      ${goals.length ? `<li><span><b>Твои цели.</b> ${goals.map(g => `«${esc(g.title)}» — осталось ${fmt(Math.max(0, g.target - sumAll(g)))} ₽`).join('; ')}. Плюс этого периода — ${fmt(s.bal)} ₽.</span></li>` : ''}
      <li><span><b>Дорогие долги.</b> Если есть кредиты или кредитка под высокий процент — гасить их обычно выгоднее любых вложений.</span></li>
      <li><span><b>Вложение в себя.</b> Навык, который повышает доход, часто окупается быстрее любых процентов.</span></li>
      <li><span><b>Долгосрочно, после подушки.</b> Облигации (например, ОФЗ) — ниже риск; фонды на широкий индекс акций — выше риск, но и выше потенциал на горизонте от 3 лет. Не вкладывай то, что может понадобиться в ближайший год.</span></li>
    </ol></div>`;
}

let moneyPeriod = 'month', moneyReply = '';
const CAT_COLORS = ['var(--accent)', '#FF8A3D', '#F472B6', '#60A5FA', '#4ADE80', '#C084FC', '#2DD4BF', '#F87171'];
function moneyGoalsPanel() {
  const gs = (state.goals || []).filter(g => g.type === 'money');
  if (!gs.length) return '';
  return `<div class="panel"><h2>Копилки целей</h2><p>Наполняются тем, что ты откладываешь на «Сегодня».</p><div class="flasks">${gs.map(g => flask(sumAll(g) / g.target, { label: esc(g.title), sub: `${fmt(sumAll(g))} из ${fmt(g.target)} ₽` })).join('')}</div></div>`;
}
function viewMoney() {
  const [from, to] = periodRange(moneyPeriod);
  const s = moneyStats(from, to);
  const t = today();
  // график трат по дням
  const days = []; for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  const outBy = {}, inBy = {};
  s.tx.forEach(x => (x.kind === 'out' ? outBy : inBy)[x.d] = ((x.kind === 'out' ? outBy : inBy)[x.d] || 0) + x.amount);
  const max = Math.max(1, ...days.map(d => outBy[d] || 0));
  const W = 320, H = 110, bw = W / Math.max(days.length, 1);
  const limit = s.inc ? (s.inc * 0.8) / days.length : 0;
  const bars = days.map((d, i) => { const h = ((outBy[d] || 0) / max) * (H - 14); return `<rect x="${(i * bw + bw * 0.15).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" fill="${d === t ? 'var(--accent)' : 'var(--bar)'}"><title>${human(d)}: ${fmt(outBy[d] || 0)} ₽</title></rect>${inBy[d] ? `<circle cx="${(i * bw + bw / 2).toFixed(1)}" cy="5" r="${Math.min(4, bw / 2.5).toFixed(1)}" fill="var(--ok)"><title>доход ${fmt(inBy[d])} ₽</title></circle>` : ''}`; }).join('');
  const limY = limit && limit < max ? H - (limit / max) * (H - 14) : null;
  // прогноз на месяц
  let forecast = '';
  if (moneyPeriod === 'month' && s.out) {
    const d = parse(t), dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), passed = d.getDate();
    const proj = (s.out / passed) * dim;
    forecast = `<div class="hint" style="margin-top:8px">Прогноз: при таком темпе за месяц уйдёт около <b>${fmt(proj)} ₽</b>${s.inc ? `, итог месяца ≈ <b>${money(s.inc - proj, true)}</b>` : ''}.</div>`;
  }
  const todayTx = state.money.tx.filter(x => x.d >= addDays(t, -6)).sort((a, b) => b.ts - a.ts).slice(0, 25);
  return `<div class="top"><div><div class="date">учёт · аналитика · советы</div><h1>Финансы</h1></div></div>
  <div class="panel chat">
    <h2>Что сегодня было?</h2>
    <p>Пиши как другу: «кофе 250, такси 420», «+60000 зарплата», «продукты 1,5к». Можно несколько через запятую.</p>
    ${moneyReply ? `<div class="bubble">${moneyReply}</div>` : ''}
    <form id="txform" class="txform"><input class="inp" id="txinput" autocomplete="off" placeholder="обед 450, +3000 заказ"><button class="btn hot" type="submit">Записать</button></form>
    <div class="quick">${['+ Доход', 'Продукты ', 'Кафе ', 'Транспорт ', 'Такси '].map(q => `<button data-act="quick" data-v="${q}">${q.trim()}</button>`).join('')}</div>
  </div>
  <div class="seg">${[['week', '7 дней'], ['month', 'Этот месяц'], ['prev', 'Прошлый месяц']].map(([k, n]) => `<button class="${moneyPeriod === k ? 'on' : ''}" data-act="mperiod" data-v="${k}">${n}</button>`).join('')}</div>
  <div class="grid2">
  <div class="panel">
    <div class="hero">
      ${flask(s.inc ? Math.max(0, s.bal) / s.inc : 0, { size: 'big', color: s.bal >= 0 ? 'var(--accent)' : 'var(--bad)', text: s.inc ? Math.round(Math.max(0, s.bal) / s.inc * 100) + '%' : '—', sub: 'осталось от дохода' })}
      <div class="kpis">
        <div class="big ${s.bal >= 0 ? 'pos' : 'neg'}"><span>Итог</span><b>${money(s.bal, true)}</b><em>${s.bal >= 0 ? 'в плюсе' : 'в минусе'}</em></div>
        <div><span>Доход</span><b class="pos">${money(s.inc)}</b></div>
        <div><span>Расход</span><b>${money(s.out)}</b></div>
      </div>
    </div>
    <p class="hint" style="margin-top:12px">Колба наполняется доходами и убывает с каждой тратой.</p>
    <svg class="mchart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}${limY ? `<line x1="0" x2="${W}" y1="${limY}" y2="${limY}" stroke="var(--ok)" stroke-width="1.5" stroke-dasharray="4 3"/>` : ''}</svg>
    <div class="legend"><span><i style="background:var(--bar)"></i>траты по дням</span>${limY ? '<span><i class="dash"></i>дневной лимит, чтобы отложить 20%</span>' : ''}<span><i class="dot"></i>доход</span></div>
    ${forecast}
  </div>
  <div class="panel"><h2>Куда уходят деньги</h2><p>Доля каждой категории во всех тратах периода.</p>
    ${s.cats.length ? `<div class="flasks">${s.cats.slice(0, 8).map(([c, v], i) => flask(v / s.out, { size: 'sm', round: true, color: CAT_COLORS[i % CAT_COLORS.length], label: `${MONEY_CATS[c]?.ico || '•'} ${esc(MONEY_CATS[c]?.n || c)}`, sub: fmt(v) + ' ₽' })).join('')}</div>` : '<p>Пока нет трат за этот период.</p>'}
  </div>
  ${moneyGoalsPanel()}
  <div class="panel"><h2>Советы экономиста</h2><ul class="advice">${moneyAdvice(s, moneyPeriod).map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
  ${investBlock(s)}
  <div class="panel"><h2>Последние записи</h2>
    ${todayTx.length ? `<ul class="txlist">${todayTx.map(x => `<li><div class="txm"><b class="${x.kind === 'in' ? 'pos' : ''}">${x.kind === 'in' ? '+' : '−'}${fmt(x.amount)} ₽</b><span>${esc(x.note)}</span><small>${x.d === t ? 'сегодня' : human(x.d)}</small></div>
      <select data-act="txcat" data-id="${x.id}" aria-label="Категория">${Object.entries(x.kind === 'in' ? INCOME_CATS : MONEY_CATS).map(([k, c]) => `<option value="${k}" ${k === x.cat ? 'selected' : ''}>${c.n}</option>`).join('')}</select>
      <button class="x small" data-act="txdel" data-id="${x.id}" aria-label="Удалить">×</button></li>`).join('')}</ul>` : '<p>Записей за неделю пока нет.</p>'}
  </div>
  </div>
  ${aiPanel('money', 'Разбор от ИИ-экономиста', moneyPrompt(s, from, to), 'Подробный разбор твоих трат и доходов за период.')}`;
}

function moneyPrompt(s, from, to) {
  return `Ты мой личный экономист. Доход я получаю в рублях.
Период: ${human(from)} — ${human(to)}.
Доход: ${fmt(s.inc)} ₽. Расход: ${fmt(s.out)} ₽. Итог: ${money(s.bal, true)}.
Траты по категориям:
${s.cats.map(([c, v]) => `• ${MONEY_CATS[c]?.n || c}: ${fmt(v)} ₽`).join('\n') || '• нет данных'}
Отдельные записи:
${s.tx.slice(-40).map(x => `${x.d} ${x.kind === 'in' ? '+' : '-'}${x.amount} ${x.note}`).join('\n')}
${(state.goals || []).filter(g => g.type === 'money').map(g => `Цель: «${g.title}» — ${fmt(g.target)} ₽, накоплено ${fmt(sumAll(g))} ₽, до ${human(g.end)}.`).join('\n')}

Проанализируй: где я переплачиваю, на чём реально сэкономить (конкретные суммы), какой лимит трат на день поставить, и как разумно распорядиться остатком (подушка, цели, вложения — с объяснением рисков). Кратко, по пунктам, по-русски.`;
}

function addTxFromText(text) {
  const items = parseTx(text);
  if (!items.length) { moneyReply = 'Не нашёл сумму 🤔 Напиши, например: <b>«кофе 250»</b> или <b>«+50000 зарплата»</b>.'; render(); return; }
  const t = today();
  items.forEach((it, k) => state.money.tx.push({ id: 't' + Date.now().toString(36) + k, d: t, ts: Date.now() + k, ...it }));
  save();
  const ms = moneyStats(t.slice(0, 8) + '01', t), ds = moneyStats(t, t);
  let lines = items.map(it => `<div><b class="${it.kind === 'in' ? 'pos' : ''}">${it.kind === 'in' ? '+' : '−'}${fmt(it.amount)} ₽</b> · ${esc((it.kind === 'in' ? INCOME_CATS : MONEY_CATS)[it.cat].n)}${it.note && it.note !== (it.kind === 'in' ? INCOME_CATS : MONEY_CATS)[it.cat].n ? ` — ${esc(it.note)}` : ''}</div>`).join('');
  let comment = '';
  const inc = items.filter(i => i.kind === 'in').reduce((a, i) => a + i.amount, 0);
  if (inc) comment = `Хороший приход! Совет: сразу отложи 10–20% — это ${fmt(inc * 0.1)}–${fmt(inc * 0.2)} ₽.`;
  else {
    const big = items.find(i => { const c = MONEY_CATS[i.cat]; const sum = ms.cats.find(x => x[0] === i.cat)?.[1] || 0; return c && !c.need && ms.out && sum / ms.out > 0.25 && ms.tx.length > 5; });
    if (big) comment = `«${MONEY_CATS[big.cat].n}» уже ${Math.round((ms.cats.find(x => x[0] === big.cat)[1] / ms.out) * 100)}% трат месяца — стоит притормозить.`;
    else comment = `Сегодня потрачено ${fmt(ds.out)} ₽.`;
  }
  moneyReply = `${lines}<div class="sub">${comment} Месяц: <b class="${ms.bal >= 0 ? 'pos' : 'neg'}">${money(ms.bal, true)}</b>. Категорию можно поправить в «Последних записях».</div>`;
  render();
  setTimeout(() => $('#txinput')?.focus(), 50);
}

/* =========================================================
   ЕДА
   ========================================================= */
let foodTab = 'fridge', mealFilter = 'all', fridgeNote = '';
const NONPANTRY = r => r.ing.filter(([id]) => FOOD[id].g !== 'pantry');
function nutr(items, div = 1) { // items: [[id, grams]]
  const r = { k: 0, p: 0, f: 0, c: 0, v: { A: 0, C: 0, D: 0, B12: 0, Fe: 0, Ca: 0 } };
  for (const [id, gr] of items) { const f = FOOD[id]; if (!f) continue; const m = gr / 100 / div; r.k += f.k * m; r.p += f.p * m; r.f += f.f * m; r.c += f.c * m; for (const k in r.v) r.v[k] += f.v[k] * m; }
  return r;
}
function addN(a, b, mult = 1) { a.k += b.k * mult; a.p += b.p * mult; a.f += b.f * mult; a.c += b.c * mult; for (const k in a.v) a.v[k] += (b.v[k] || 0) * mult; return a; }
const zeroN = () => ({ k: 0, p: 0, f: 0, c: 0, v: { A: 0, C: 0, D: 0, B12: 0, Fe: 0, Ca: 0 } });
function matchRecipe(r) {
  const need = NONPANTRY(r), fr = new Set(state.food.fridge);
  const missing = need.filter(([id]) => !fr.has(id)).map(([id]) => id);
  return { missing, have: need.length - missing.length, total: need.length };
}
function targets() {
  const p = state.food.profile; if (!p) return null;
  const male = p.sex === 'm';
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (male ? 5 : -161);
  const tdee = bmr * p.act;
  let k = p.goal === 'lose' ? Math.max(bmr * 1.05, tdee * 0.85) : p.goal === 'gain' ? tdee * 1.1 : tdee;
  const prot = p.weight * (p.goal === 'keep' ? 1.4 : 1.7);
  const fat = (k * 0.3) / 9;
  const carb = Math.max(0, (k - prot * 4 - fat * 9) / 4);
  return { k, p: prot, f: fat, c: carb, Fe: male ? 10 : 18 };
}
function orderTip(r) {
  const ids = NONPANTRY(r).map(([id]) => id);
  const veg = ids.some(id => FOOD[id].g === 'veg' && !['potato', 'corn', 'beans', 'peas', 'tomatopaste'].includes(id));
  const prot = ids.some(id => FOOD[id].g === 'meat' || ['eggs', 'tvorog', 'cheese', 'feta', 'beans', 'yogurt', 'kefir'].includes(id));
  const carb = ids.some(id => FOOD[id].g === 'grain' || ['potato', 'banana', 'honey', 'sugar', 'berries', 'apple', 'corn'].includes(id));
  const sweet = ids.some(id => ['honey', 'sugar', 'banana', 'berries'].includes(id));
  if (veg && carb) return 'Сначала съешь овощи, потом белковую часть, а гарнир или хлеб — в конце. Такой порядок помогает сахару в крови подниматься плавнее и дольше держит сытость.';
  if (prot && carb && !veg) return 'Добавь к блюду овощной салат и съешь его первым, затем белок, а углеводы — в конце.';
  if (sweet) return 'Сладкое лучше есть после белковой еды или вместе с ней (творог, йогурт, яйца), а не отдельно натощак — так меньше скачок сахара.';
  if (veg && prot) return 'Отличное сочетание: овощи и белок. Начни с овощей — клетчатка помогает насытиться.';
  return 'Ешь медленно: сигнал сытости приходит примерно через 15–20 минут.';
}
function vitRows(v, mult = 1, fe = 10) {
  return VIT.map(([k, n, u, norm]) => { const nn = k === 'Fe' ? fe : norm; const val = v[k] * mult, pc = Math.round((val / nn) * 100); return `<div class="vit"><span>${n}</span><div class="bar thin ${pc >= 100 ? 'ok' : ''}"><i style="width:${Math.min(100, pc)}%"></i></div><b>${pc}%</b></div>`; }).join('');
}
function macroLine(n) { return `<div class="macros"><div><b>${fmt(n.k)}</b><span>ккал</span></div><div><b>${n.p.toFixed(0)}</b><span>белки, г</span></div><div><b>${n.f.toFixed(0)}</b><span>жиры, г</span></div><div><b>${n.c.toFixed(0)}</b><span>углев., г</span></div></div>`; }

function viewFood() {
  const tabs = [['fridge', 'Холодильник'], ['recipes', 'Рецепты'], ['world', 'Мировая кухня'], ['diary', 'Дневник'], ['profile', 'Профиль']];
  const body = ({ fridge: foodFridge, recipes: foodRecipes, world: typeof foodWorld === 'function' ? foodWorld : () => '<div class="panel"><p>Мировая кухня ещё загружается — обнови приложение.</p></div>', diary: foodDiary, profile: foodProfile })[foodTab]();
  return `<div class="top"><div><div class="date">повар · диетолог</div><h1>Готовка</h1></div></div>
    <div class="seg">${tabs.map(([k, n]) => `<button class="${foodTab === k ? 'on' : ''}" data-act="ftab" data-v="${k}">${n}</button>`).join('')}</div>
    ${body}
    ${aiPanel('food', 'Спросить ИИ-повара', foodPrompt(), 'Персональный рацион и рецепты из того, что есть в холодильнике.')}`;
}
function foodFridge() {
  const fr = new Set(state.food.fridge);
  const groups = {};
  Object.values(FOOD).filter(f => f.g !== 'pantry').forEach(f => (groups[f.g] ||= []).push(f));
  const cookable = RECIPES.filter(r => matchRecipe(r).missing.length === 0).length;
  const custom = state.food.custom || [];
  return `<div class="panel"><h2>Что есть дома?</h2><p>Напиши продукты через запятую — я узнаю знакомые и подберу блюда. Соль, перец и масло считаю всегда.</p>
    <form id="fridgeform" class="txform"><input class="inp" id="fridgeinput" autocomplete="off" placeholder="курица, 3 помидора, сыр гауда, кешью"><button class="btn hot" type="submit">Добавить</button></form>
    ${fridgeNote ? `<div class="bubble" style="margin-top:12px">${fridgeNote}</div>` : ''}
    <h4 class="sh">В холодильнике ${fr.size + custom.length ? `· ${fr.size + custom.length}` : ''}</h4>
    ${fr.size + custom.length ? `<div class="chips">${[...fr].map(id => `<button class="chip on x2" data-act="fridge" data-v="${id}">${esc(FOOD[id].n)} <i>×</i></button>`).join('')}${custom.map((c, i) => `<button class="chip custom x2" data-act="fcustomdel" data-v="${i}" title="Нет в базе — учитывается в запросе к ИИ">${esc(c)} <i>×</i></button>`).join('')}</div>${custom.length ? '<p class="hint">Пунктир — продукты, которых нет в базе: они пойдут в запрос к ИИ-повару.</p>' : ''}` : '<p class="hint">Пока пусто.</p>'}
    <details style="margin-top:16px"><summary>Быстрый выбор из списка</summary>
    ${Object.entries(groups).map(([g, list]) => `<div class="fgroup"><h4>${FOOD_GROUPS[g]}</h4><div class="chips">${list.map(f => `<button class="chip ${fr.has(f.id) ? 'on' : ''}" data-act="fridge" data-v="${f.id}">${esc(f.n)}</button>`).join('')}</div></div>`).join('')}</details>
    <div class="btnrow"><button class="btn hot" data-act="ftab" data-v="recipes">Что приготовить? ${fr.size ? `(${cookable} — всё есть)` : ''}</button>${fr.size + custom.length ? '<button class="btn light small" data-act="fridgeclear">Очистить всё</button>' : ''}</div>
  </div>`;
}
function recipeCard(r) {
  const m = matchRecipe(r), n = nutr(r.ing, r.serv);
  const status = !state.food.fridge.length ? '' : m.missing.length === 0 ? '<span class="ok-t">✓ всё есть</span>' : `<span class="miss-t">не хватает: ${m.missing.map(id => FOOD[id].n.toLowerCase()).join(', ')}</span>`;
  return `<button class="rcard" data-act="recipe" data-v="${r.id}">${photoBox(r.id, dishSVG(r))}<div class="rc-b"><div class="rtop"><b>${esc(r.n)}</b><span class="tag">${r.time} мин</span></div>
    <div class="rmeta">${r.meal.map(x => MEALS[x]).join(' · ')} — ${fmt(n.k)} ккал · Б ${n.p.toFixed(0)} · Ж ${n.f.toFixed(0)} · У ${n.c.toFixed(0)} на порцию</div>${status}</div></button>`;
}
function foodRecipes() {
  let list = RECIPES.filter(r => mealFilter === 'all' || r.meal.includes(mealFilter));
  list = list.map(r => [r, matchRecipe(r)]).sort((a, b) => a[1].missing.length - b[1].missing.length || b[1].have - a[1].have).map(x => x[0]);
  const t = targets();
  return `${!state.food.fridge.length ? '<div class="empty" style="margin-bottom:16px"><p style="margin:0 0 12px">Отметь продукты в холодильнике — и рецепты отсортируются по тому, что у тебя есть.</p><button class="btn small" data-act="ftab" data-v="fridge">Открыть холодильник</button></div>' : ''}
    <div class="btnrow" style="margin:0 0 14px"><button class="btn" data-act="dayplan">Собрать рацион на день</button></div>
    <div class="chips" style="margin-bottom:14px">${[['all', 'Все'], ...Object.entries(MEALS)].map(([k, n]) => `<button class="chip ${mealFilter === k ? 'on' : ''}" data-act="meal" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="grid2 rlist g3">${list.map(recipeCard).join('')}</div>`;
}
function openRecipe(id, mult = 1) {
  const r = RECIPES.find(x => x.id === id), n = nutr(r.ing, r.serv), m = matchRecipe(r), fr = new Set(state.food.fridge), t = targets();
  $('#sheet').innerHTML = `${photoBox(r.id, dishSVG(r))}<div class="sheet-h"><h2>${esc(r.n)}</h2><button class="x" data-act="close">×</button></div>
    <div class="hint">${r.time} мин · ${r.serv} ${plural(r.serv, 'порция', 'порции', 'порций')} · ${r.meal.map(x => MEALS[x]).join(', ')}</div>
    <h4 class="sh">На одну порцию</h4>${macroLine(n)}
    ${t ? `<div class="hint">Это ${Math.round((n.k / t.k) * 100)}% твоей дневной нормы калорий.</div>` : ''}
    <div class="vits">${vitRows(n.v, 1, t?.Fe || 10)}</div>
    <h4 class="sh">Ингредиенты (на всё блюдо)</h4>
    <ul class="ings">${r.ing.map(([id, g]) => { const f = FOOD[id], has = f.g === 'pantry' || fr.has(id); return `<li class="${has || !state.food.fridge.length ? '' : 'no'}"><span>${state.food.fridge.length ? (has ? '✓' : '✕') : '•'} ${esc(f.n)}</span><b>${g} г</b></li>`; }).join('')}<li><span>• Соль, перец — по вкусу</span><b></b></li></ul>
    <h4 class="sh">Как готовить</h4>
    <ol class="steps">${r.steps.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
    <div class="tipbox"><b>Как лучше есть</b>${esc(orderTip(r))}</div>
    <div class="btnrow"><button class="btn hot" data-act="ate" data-v="${r.id}">Съел порцию → в дневник</button><button class="btn light" data-act="close">Закрыть</button></div>`;
  $('#scrim').classList.add('open');
  $('#sheet').scrollTop = 0;
  hydratePhotos($('#sheet'));
}
function dayPlan() {
  const t = targets(), target = t?.k || 2000;
  const used = new Set(), plan = [];
  for (const meal of ['breakfast', 'lunch', 'snack', 'dinner']) {
    const cand = RECIPES.filter(r => r.meal.includes(meal) && !used.has(r.id)).map(r => [r, matchRecipe(r).missing.length])
      .sort((a, b) => a[1] - b[1] || (a[0].id.length % 3) - (b[0].id.length % 3));
    if (!cand.length) continue;
    // небольшая вариативность по дню
    const best = cand.filter(c => c[1] === cand[0][1]);
    const pick = best[(parse(today()).getDate() + meal.length) % best.length][0];
    used.add(pick.id); plan.push([meal, pick]);
  }
  const base = plan.reduce((s, [, r]) => s + nutr(r.ing, r.serv).k, 0);
  const factor = Math.min(1.75, Math.max(0.75, Math.round((target / base) * 4) / 4));
  const tot = zeroN(); plan.forEach(([, r]) => addN(tot, nutr(r.ing, r.serv), factor));
  $('#sheet').innerHTML = `<div class="sheet-h"><h2>Рацион на день</h2><button class="x" data-act="close">×</button></div>
    <p class="hint">${t ? `Под твою норму ≈ ${fmt(t.k)} ккал.` : 'Норма 2000 ккал по умолчанию — заполни «Профиль», чтобы рассчитать свою.'} ${state.food.fridge.length ? 'В первую очередь — блюда из того, что есть дома.' : ''}</p>
    ${plan.map(([meal, r]) => { const n = nutr(r.ing, r.serv), mm = matchRecipe(r); return `<button class="rcard" data-act="recipe" data-v="${r.id}" style="display:flex;align-items:stretch">${dishSVG(r).replace('class="dish"', 'class="dish" style="width:110px;flex:none;aspect-ratio:1/1;height:auto" preserveAspectRatio="xMidYMid slice"')}<div class="rc-b" style="flex:1"><div class="rtop"><b>${MEALS[meal]}: ${esc(r.n)}</b><span class="tag">${factor === 1 ? '1 порция' : String(factor).replace('.', ',') + ' порц.'}</span></div><div class="rmeta">${fmt(n.k * factor)} ккал · Б ${(n.p * factor).toFixed(0)} · Ж ${(n.f * factor).toFixed(0)} · У ${(n.c * factor).toFixed(0)}</div>${state.food.fridge.length && mm.missing.length ? `<span class="miss-t">докупить: ${mm.missing.map(id => FOOD[id].n.toLowerCase()).join(', ')}</span>` : ''}</div></button>`; }).join('')}
    <h4 class="sh">Итого за день</h4>${macroLine(tot)}<div class="vits">${vitRows(tot.v, 1, t?.Fe || 10)}</div>
    <div class="tipbox"><b>Порядок</b>Основные калории — в завтрак и обед, ужин легче и за 2–3 часа до сна. В каждом приёме начинай с овощей, затем белок, углеводы — в конце.</div>
    <div class="btnrow"><button class="btn light" data-act="close">Закрыть</button></div>`;
  $('#scrim').classList.add('open');
}
function foodDiary() {
  const d = today(), log = state.food.log[d] || [], t = targets();
  const tot = zeroN(); log.forEach(e => addN(tot, e.n));
  const bar = (v, max, lbl, unit) => { const pc = max ? v / max : 0; return `<div class="dbar"><div class="catn"><span>${lbl}</span><b>${fmt(v)}${max ? ' / ' + fmt(max) : ''} ${unit}</b></div><div class="bar thin ${pc > 1.1 ? '' : pc >= 0.9 ? 'ok' : ''}"><i style="width:${Math.min(100, pc * 100)}%"></i></div></div>`; };
  const opts = Object.entries(FOOD_GROUPS).map(([g, gn]) => `<optgroup label="${gn}">${Object.values(FOOD).filter(f => f.g === g).map(f => `<option value="${f.id}">${esc(f.n)}</option>`).join('')}</optgroup>`).join('') + `<optgroup label="Прочее"><option value="oil">Растительное масло</option></optgroup>`;
  return `<div class="grid2"><div class="panel"><h2>Сегодня съедено</h2>
    ${!t ? '<p>Заполни «Профиль», чтобы видеть свою норму.</p>' : ''}
    ${bar(tot.k, t?.k, 'Калории', 'ккал')}${bar(tot.p, t?.p, 'Белки', 'г')}${bar(tot.f, t?.f, 'Жиры', 'г')}${bar(tot.c, t?.c, 'Углеводы', 'г')}
    <h4 class="sh">Витамины и минералы</h4><div class="vits">${vitRows(tot.v, 1, t?.Fe || 10)}</div>
  </div>
  <div class="panel"><h2>Записи</h2>
    ${log.length ? `<ul class="txlist">${log.map((e, i) => `<li><div class="txm"><b>${fmt(e.n.k)} ккал</b><span>${esc(e.name)}</span><small>Б ${e.n.p.toFixed(0)} · Ж ${e.n.f.toFixed(0)} · У ${e.n.c.toFixed(0)}</small></div><button class="x small" data-act="fdel" data-v="${i}">×</button></li>`).join('')}</ul>` : '<p>Пока пусто. Нажми «Съел порцию» в рецепте или добавь продукт ниже.</p>'}
    <form id="fadd" class="fadd"><select class="inp" id="fa-id">${opts}</select><input class="inp" id="fa-g" type="number" inputmode="numeric" min="1" placeholder="граммы" required><button class="btn small" type="submit">Добавить</button></form>
  </div></div>
  <div class="panel"><h2>Что сначала, что потом</h2><ol class="steps">
    <li><span><b>Овощи и зелень</b> — первыми: клетчатка замедляет усвоение углеводов.</span></li>
    <li><span><b>Белок и жиры</b> — мясо, рыба, яйца, творог, сыр.</span></li>
    <li><span><b>Углеводы в конце</b> — гарнир, хлеб, сладкое. Так сахар в крови поднимается плавнее, а сытость держится дольше.</span></li>
    <li><span><b>Фрукты и сладкое</b> — лучше после основной еды или вместе с белком, чем натощак.</span></li>
  </ol><p class="hint">Цифры приблизительные и не заменяют консультацию врача или диетолога.</p></div>`;
}
function foodProfile() {
  const p = state.food.profile || { sex: 'm', age: '', height: '', weight: '', act: 1.375, goal: 'keep' }, t = targets();
  return `<div class="grid2"><div class="panel"><h2>Мои параметры</h2><p>Нужны, чтобы посчитать норму калорий и БЖУ. Хранятся только на этом устройстве.</p>
    <form id="pform">
      <div class="two"><div><label class="f">Пол</label><select class="inp" id="p-sex"><option value="m" ${p.sex === 'm' ? 'selected' : ''}>Мужской</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>Женский</option></select></div>
      <div><label class="f">Возраст</label><input class="inp" id="p-age" type="number" min="14" max="99" required value="${p.age}"></div></div>
      <div class="two"><div><label class="f">Рост, см</label><input class="inp" id="p-h" type="number" min="120" max="230" required value="${p.height}"></div>
      <div><label class="f">Вес, кг</label><input class="inp" id="p-w" type="number" min="35" max="250" step="0.1" required value="${p.weight}"></div></div>
      <label class="f">Активность</label><select class="inp" id="p-act">${[[1.2, 'Сидячий образ жизни'], [1.375, 'Лёгкая: 1–3 тренировки в неделю'], [1.55, 'Средняя: 3–5 тренировок'], [1.725, 'Высокая: 6–7 тренировок']].map(([v, n]) => `<option value="${v}" ${+p.act === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <label class="f">Цель</label><select class="inp" id="p-goal">${[['lose', 'Снизить вес (плавно)'], ['keep', 'Держать вес'], ['gain', 'Набрать массу']].map(([v, n]) => `<option value="${v}" ${p.goal === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <div class="btnrow"><button class="btn hot" type="submit">Рассчитать</button></div>
    </form></div>
    ${t ? `<div class="panel"><h2>Твоя норма в день</h2>${macroLine(t)}<p class="hint" style="margin-top:12px">Расчёт по формуле Миффлина — Сан Жеора с учётом активности${p.goal === 'lose' ? ', дефицит не больше 15%' : p.goal === 'gain' ? ', профицит 10%' : ''}. Белок — ${p.goal === 'keep' ? '1,4' : '1,7'} г на кг веса. Это ориентир, а не медицинская рекомендация.</p></div>` : ''}
  </div>`;
}
function foodPrompt() {
  const t = targets(), d = today(), log = state.food.log[d] || [];
  const tot = zeroN(); log.forEach(e => addN(tot, e.n));
  const fr = [...state.food.fridge.map(id => FOOD[id].n), ...(state.food.custom || [])].join(', ') || 'не указано';
  return `Ты мой повар и диетолог.
В холодильнике есть: ${fr}. Также соль, перец, растительное масло.
${t ? `Моя норма: ${fmt(t.k)} ккал, белки ${fmt(t.p)} г, жиры ${fmt(t.f)} г, углеводы ${fmt(t.c)} г. Цель: ${({ lose: 'снизить вес', keep: 'держать вес', gain: 'набрать массу' })[state.food.profile.goal]}.` : ''}
${log.length ? `Сегодня уже съел: ${log.map(e => e.name).join('; ')} (≈${fmt(tot.k)} ккал, Б ${fmt(tot.p)}, Ж ${fmt(tot.f)}, У ${fmt(tot.c)}).` : ''}

Предложи рацион на ${log.length ? 'остаток дня' : 'день'} в основном из этих продуктов: для каждого блюда — пошаговый рецепт, граммовки, КБЖУ и главные витамины на порцию. Подскажи, в каком порядке лучше есть блюда и продукты в каждом приёме пищи. Отдельно — что стоит докупить для более сбалансированного питания. Кратко, по-русски.`;
}

/* =========================================================
   события разделов
   ========================================================= */
function sectionClick(act, el) {
  switch (act) {
    case 'go': tab = el.dataset.v; if (el.dataset.f) { if (tab === 'brain') brainTab = el.dataset.f; else foodTab = el.dataset.f; } brainView = null; if (tab === 'partner') { state.partner.seenDay[today()] = 1; save(); } render(); return true;
    case 'mperiod': moneyPeriod = el.dataset.v; render(); return true;
    case 'quick': { const i = $('#txinput'); i.value = el.dataset.v === '+ Доход' ? '+' : el.dataset.v; i.focus(); return true; }
    case 'txdel': state.money.tx = state.money.tx.filter(x => x.id !== el.dataset.id); save(); moneyReply = ''; render(); return true;
    case 'ftab': foodTab = el.dataset.v; closeSheet(); render(); return true;
    case 'fridge': { const s = new Set(state.food.fridge); s.has(el.dataset.v) ? s.delete(el.dataset.v) : s.add(el.dataset.v); state.food.fridge = [...s]; save(); fridgeNote = ''; render(); return true; }
    case 'fcustomdel': state.food.custom.splice(+el.dataset.v, 1); save(); render(); return true;
    case 'fridgeclear': state.food.fridge = []; state.food.custom = []; fridgeNote = ''; save(); render(); return true;
    case 'meal': mealFilter = el.dataset.v; render(); return true;
    case 'recipe': openRecipe(el.dataset.v); return true;
    case 'dayplan': dayPlan(); return true;
    case 'ate': { const r = RECIPES.find(x => x.id === el.dataset.v); (state.food.log[today()] ||= []).push({ name: r.n + ' (порция)', n: nutr(r.ing, r.serv) }); save(); closeSheet(); toast('Записано в дневник'); render(); return true; }
    case 'fdel': (state.food.log[today()] || []).splice(+el.dataset.v, 1); save(); render(); return true;
  }
  return false;
}
function addFridgeText(text) {
  const parts = text.split(/,|;|\n|\s+и\s+/).map(x => x.replace(/^\s*\d+[\s.,]*(шт|кг|г|гр|л|мл|уп|пач\w*)?\.?\s*/i, '').trim()).filter(Boolean);
  const s = new Set(state.food.fridge), known = [], unknown = [];
  for (const p of parts) { const id = matchFood(p); if (id && id !== 'oil') { s.add(id); known.push(FOOD[id].n); } else if (id !== 'oil') { if (!state.food.custom.some(c => c.toLowerCase() === p.toLowerCase())) state.food.custom.push(p); unknown.push(p); } }
  state.food.fridge = [...s]; save();
  const ready = RECIPES.filter(r => matchRecipe(r).missing.length === 0).length;
  fridgeNote = (known.length ? `Узнал: <b>${known.map(esc).join(', ')}</b>.` : '') + (unknown.length ? ` ${known.length ? 'А это' : 'Это'} добавил как есть: ${unknown.map(esc).join(', ')} — учту в запросе к ИИ.` : '') + `<div class="sub">Можно приготовить из того, что есть: ${ready} ${plural(ready, 'блюдо', 'блюда', 'блюд')}.</div>`;
  render(); setTimeout(() => $('#fridgeinput')?.focus(), 50);
}
document.addEventListener('submit', e => {
  if (e.target.id === 'fridgeform') { e.preventDefault(); const v = $('#fridgeinput').value.trim(); if (v) addFridgeText(v); }
  if (e.target.id === 'txform') { e.preventDefault(); const v = $('#txinput').value.trim(); if (v) addTxFromText(v); }
  if (e.target.id === 'fadd') { e.preventDefault(); const id = $('#fa-id').value, g = +$('#fa-g').value; if (!(g > 0)) return; (state.food.log[today()] ||= []).push({ name: `${FOOD[id].n}, ${g} г`, n: nutr([[id, g]]) }); save(); render(); toast('Добавлено'); }
  if (e.target.id === 'pform') { e.preventDefault(); state.food.profile = { sex: $('#p-sex').value, age: +$('#p-age').value, height: +$('#p-h').value, weight: +$('#p-w').value, act: +$('#p-act').value, goal: $('#p-goal').value }; save(); render(); toast('Норма рассчитана'); }
});
document.addEventListener('change', e => {
  if (e.target.dataset.act === 'txcat') { const x = state.money.tx.find(t => t.id === e.target.dataset.id); if (x) { x.cat = e.target.value; save(); render(); } }
});

/* ---------- ежедневные дела для экрана «Сегодня» ---------- */
function dailyBlock() {
  const d = today();
  const tx = state.money.tx.filter(x => x.d === d), ds = moneyStats(d, d), ms = moneyStats(d.slice(0, 8) + '01', d);
  const log = state.food.log[d] || [], kc = log.reduce((s, e) => s + e.n.k, 0), t = targets();
  const L = lessonOfDay(), read = !!state.brain.read[L.id];
  const items = [
    { done: tx.length > 0, main: 'Записать доходы и траты', sub: tx.length ? `Сегодня: −${fmt(ds.out)} ₽${ds.inc ? ` / +${fmt(ds.inc)} ₽` : ''} · месяц ${money(ms.bal, true)}` : `Месяц сейчас: ${money(ms.bal, true)}`, go: 'money' },
    { done: log.length > 0, main: 'Записать, что съел', sub: log.length ? `${fmt(kc)}${t ? ' из ' + fmt(t.k) : ''} ккал` : 'Или выбери рецепт из того, что есть в холодильнике', go: 'food', f: log.length ? 'diary' : 'recipes' },
    { done: read, main: `Урок дня: «${L.t}»`, sub: `${L.cat} · 2 минуты · + задания для мозга`, go: 'brain', f: 'today' },
    { done: !!state.partner.seenDay[d], main: `Идея дня: «${ideaOfDayObj().t}»`, sub: `Бизнес-партнёр · прибыль ${range(ideaOfDayObj().profit)} / ${ideaOfDayObj().per}`, go: 'partner' }
  ];
  if (state.lang) { const st = langDaily(); items.push({ done: st.learnedToday >= st.perDay, main: `${LANGS[state.lang.lang].f} Выучить ${st.perDay} слов`, sub: `Сегодня ${st.learnedToday}/${st.perDay}${st.due.length ? ` · повторить ${st.due.length}` : ''} · всего ${learnedCount()}/${state.lang.target}`, go: 'brain', f: 'lang' }); }
  const nw = state.work.orders.filter(o => o.status === 'new').length;
  if (nw) items.push({ done: false, main: `Новые заказы: ${nw}`, sub: 'Посмотри и откликнись на подходящие', go: 'work' });
  return { items, html: `<section class="goal"><div class="goal-h"><span class="tag">Каждый день</span><h3>Финансы · Готовка · Развитие · Идеи</h3></div><ul class="tasks">${items.map(it => `<li class="task ${it.done ? 'done' : ''}"><span class="chk">${CHECK}</span><button class="t-body linkish" data-act="go" data-v="${it.go}" ${it.f ? `data-f="${it.f}"` : ''}><div class="t-main">${esc(it.main)}</div><div class="t-sub">${esc(it.sub)}</div></button><span class="arrow">→</span></li>`).join('')}</ul></section>` };
}
