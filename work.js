'use strict';
/* =========================================================
   «Работа» — заказы с фриланс-бирж от будущего бота
   «Бизнес-партнёр» — идея дня и библиотека идей
   ========================================================= */

function ensureWork() {
  state.work ||= { orders: [], feedUrl: '', profile: { skills: 'Сайты (WordPress, лендинги), Telegram-боты, логотипы', rate: 1500, min: 3000 }, lastFetch: null };
  state.work.sources ||= SOURCES.map(x => x[0]);
  state.partner ||= { fav: [], seen: [], budget: 0 };
  migratePartner();
}

/* ---------- РАБОТА ---------- */
// площадки, где бот ищет заказы
const SOURCES = [
  ['alot', 'Alot.pro', 'https://alot.pro/', 'Агрегаторы'], ['kadrof', 'Kadrof', 'https://kadrof.ru/', 'Агрегаторы'],
  ['kwork', 'Kwork', 'https://kwork.ru/', 'Главные'], ['fl', 'FL.ru', 'https://www.fl.ru/', 'Главные'], ['habr', 'Хабр Фриланс', 'https://freelance.habr.com/', 'Главные'],
  ['workzilla', 'Workzilla', 'https://work-zilla.com/', 'Главные'], ['weblancer', 'Weblancer', 'https://www.weblancer.net/', 'Главные'], ['freelanceru', 'Freelance.ru', 'https://freelance.ru/', 'Главные'],
  ['workspace', 'Workspace.ru', 'https://workspace.ru/', 'Главные'], ['avito', 'Авито Услуги', 'https://www.avito.ru/', 'Главные'], ['yandex', 'Яндекс Услуги', 'https://uslugi.yandex.ru/', 'Главные'], ['profi', 'Profi.ru', 'https://profi.ru/', 'Главные'],
  ['youdo', 'YouDo', 'https://youdo.com/', 'Универсальные'], ['fjob', 'Freelancejob.ru', 'https://www.freelancejob.ru/', 'Универсальные'], ['pchel', 'Pchel.net', 'https://pchel.net/', 'Универсальные'],
  ['hh', 'hh.ru', 'https://hh.ru/', 'Универсальные'], ['career', 'Хабр Карьера', 'https://career.habr.com/', 'Универсальные'], ['superjob', 'SuperJob', 'https://www.superjob.ru/', 'Универсальные'],
  ['1clancer', '1CLancer', 'https://www.1clancer.ru/', 'Узкие и тендеры'], ['dprofile', 'Dprofile', 'https://dprofile.ru/', 'Узкие и тендеры'], ['illustrators', 'Illustrators.ru', 'https://illustrators.ru/', 'Узкие и тендеры'],
  ['zakupki', 'Госзакупки (ЕИС)', 'https://zakupki.gov.ru/', 'Узкие и тендеры'], ['b2b', 'B2B-Center', 'https://www.b2b-center.ru/', 'Узкие и тендеры'],
  ['advego', 'Advego', 'https://advego.com/', 'Тексты'], ['etxt', 'eTXT', 'https://www.etxt.ru/', 'Тексты'], ['textru', 'Text.ru', 'https://text.ru/', 'Тексты'], ['turbotext', 'Turbotext', 'https://www.turbotext.ru/', 'Тексты'], ['miralinks', 'Miralinks', 'https://www.miralinks.ru/', 'Тексты'],
  ['tgjobs', 'Telegram-каналы с заказами', 'https://t.me/', 'Telegram и чаты'], ['tgsellers', 'Чаты селлеров маркетплейсов', 'https://t.me/', 'Telegram и чаты'], ['tgpro', 'Профильные чаты (WordPress, боты, дизайн)', 'https://t.me/', 'Telegram и чаты']
];
function sourcesPanel() {
  const on = new Set(state.work.sources), groups = {};
  SOURCES.forEach(src => (groups[src[3]] ||= []).push(src));
  return `<div class="panel"><h2>Где ищем · ${on.size} из ${SOURCES.length}</h2><p>Бот будет просматривать включённые площадки. Нажми на название, чтобы выключить или включить; ↗ открывает сайт.</p>
    ${Object.entries(groups).map(([g, list]) => `<div class="fgroup"><h4>${g}</h4><div class="chips">${list.map(([id, n, url]) => `<span class="srcchip ${on.has(id) ? 'on' : ''}"><button data-act="wsrc" data-v="${id}">${esc(n)}</button><a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Открыть ${esc(n)}">↗</a></span>`).join('')}</div></div>`).join('')}
    <div class="btnrow"><button class="btn small light" data-act="wsrcall" data-v="1">Включить все</button><button class="btn small light" data-act="wsrcall" data-v="0">Выключить все</button></div></div>`;
}
const ORDER_STATUS = { new: 'Новый', sent: 'Откликнулся', progress: 'В работе', done: 'Готово', skip: 'Пропущен' };
const DEMO_ORDERS = [
  { title: 'Лендинг для школы английского на Tilda или WordPress', source: 'Kwork', url: 'https://kwork.ru/', budget: '10–15 тыс. ₽', price: 14000, hours: 10, fit: 92, why: 'Типовой лендинг — твой профиль. 8–10 часов работы, можно уложиться в 3 дня.' },
  { title: 'Telegram-бот записи клиентов в барбершоп', source: 'FL.ru', url: 'https://www.fl.ru/', budget: 'до 20 тыс. ₽', price: 18000, hours: 12, fit: 88, why: 'Кнопочный бот с расписанием и уведомлениями — похоже на прошлые проекты.' },
  { title: 'Логотип и фирменные цвета для кофейни', source: 'Habr Freelance', url: 'https://freelance.habr.com/', budget: '5–8 тыс. ₽', price: 7000, hours: 5, fit: 81, why: 'Логотип + мини-гайд по цветам; 3 варианта на выбор.' },
  { title: 'Парсер цен конкурентов с выгрузкой в Google Таблицу', source: 'Kwork', url: 'https://kwork.ru/', budget: 'договорная', price: 9000, hours: 7, fit: 64, why: 'Выполнимо, но у сайтов может быть защита от парсинга — уточни список.' }
];
let workFilter = 'new', workNote = '';
function orderCard(o) {
  const btn = (st, label, cls = 'light') => `<button class="btn small ${cls}" data-act="ostatus" data-id="${o.id}" data-v="${st}">${label}</button>`;
  return `<div class="ocard ${o.status}">
    <div class="otop"><span class="tag">${esc(o.source || 'биржа')}</span>${o.demo ? '<span class="tag">пример</span>' : ''}<span class="ofit" title="Насколько подходит">${o.fit != null ? o.fit + '%' : ''}</span></div>
    <h3>${esc(o.title)}</h3>
    <div class="oprice"><b>${fmt(o.price || 0)} ₽</b><span>можно предложить${o.hours ? ` · ~${o.hours} ч` : ''}${o.budget ? ` · бюджет клиента: ${esc(o.budget)}` : ''}</span></div>
    ${o.why ? `<p class="owhy">${esc(o.why)}</p>` : ''}
    <div class="btnrow">${o.url ? `<a class="btn small hot" href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">Открыть заказ ↗</a>` : ''}
      ${o.status === 'new' ? btn('sent', 'Откликнулся') + btn('skip', 'Пропустить') : ''}
      ${o.status === 'sent' ? btn('progress', 'Взял в работу') + btn('skip', 'Отказали') : ''}
      ${o.status === 'progress' ? btn('done', 'Готово → в доход', 'hot') : ''}
      <button class="btn small light" data-act="oprompt" data-id="${o.id}">Текст отклика</button>
      <button class="x small" data-act="odel" data-id="${o.id}" aria-label="Удалить">×</button></div>
  </div>`;
}
let lastFeedTry = 0;
function viewWork() {
  if (state.work.feedUrl && Date.now() - lastFeedTry > 15 * 60e3 && Date.now() - (state.work.lastFetch || 0) > 15 * 60e3) { lastFeedTry = Date.now(); setTimeout(fetchFeed, 300); }
  const w = state.work, list = w.orders.filter(o => workFilter === 'all' || o.status === workFilter).sort((a, b) => (b.fit || 0) - (a.fit || 0));
  const counts = Object.fromEntries(Object.keys(ORDER_STATUS).map(k => [k, w.orders.filter(o => o.status === k).length]));
  const m = today().slice(0, 7), doneM = w.orders.filter(o => o.status === 'done' && (o.doneAt || '').startsWith(m));
  const earned = doneM.reduce((s, o) => s + (o.price || 0), 0);
  const sent = w.orders.filter(o => ['sent', 'progress', 'done'].includes(o.status)).length, won = w.orders.filter(o => ['progress', 'done'].includes(o.status)).length;
  return `<div class="top"><div><div class="date">заказы · отклики · доход</div><h1>Работа</h1></div></div>
  <div class="panel bot ${w.feedUrl ? 'on' : ''}">
    <div class="botrow"><div class="botava"><svg viewBox="0 0 40 40"><rect x="7" y="11" width="26" height="20" rx="7" fill="currentColor"/><circle cx="15" cy="21" r="3" fill="var(--card)"/><circle cx="25" cy="21" r="3" fill="var(--card)"><animate attributeName="r" values="3;.6;3" dur="3s" repeatCount="indefinite"/></circle><path d="M20 5v6" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="5" r="2.5" fill="currentColor"/></svg></div>
      <div><h2>Бот-поисковик заказов</h2><p style="margin:2px 0 0">${w.feedUrl ? `Подключён · обновлено ${w.lastFetch ? new Date(w.lastFetch).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'ещё не было'}` : 'Ещё не подключён — мы создадим его следующим шагом. Пока можно добавлять заказы вручную или посмотреть пример.'}</p></div></div>
    ${workNote ? `<div class="bubble" style="margin-top:12px">${workNote}</div>` : ''}
    <div class="btnrow">${w.feedUrl ? '<button class="btn hot" data-act="wfetch">Проверить новые заказы</button>' : ''}<button class="btn" data-act="wadd">+ Заказ вручную</button><button class="btn light" data-act="wpaste">Вставить от бота</button>${!w.orders.length ? '<button class="btn light" data-act="wdemo">Показать пример</button>' : ''}</div>
    <details style="margin-top:14px"><summary>Подключение бота</summary>
      <label class="f" for="feedurl">Адрес ленты заказов (выдаст бот)</label>
      <div class="txform"><input class="inp" id="feedurl" placeholder="https://…/orders.json" value="${esc(w.feedUrl)}"><button class="btn small" data-act="wsaveurl">Сохранить</button></div>
      <p class="hint">Приложение будет само запрашивать этот адрес — больше никуда. Площадки для поиска бот возьмёт из списка «Где ищем» (кнопка ниже копирует его настройки). Формат, который должен отдавать бот:</p>
      <button class="btn small light" data-act="wcfg" style="margin-bottom:10px">Скопировать настройки для бота</button>
      <textarea class="prompt" readonly style="min-height:150px">{ "orders": [ {
  "id": "kwork-123456",
  "title": "Лендинг для школы английского",
  "source": "Kwork",
  "url": "https://kwork.ru/projects/123456",
  "budget": "10–15 тыс. ₽",
  "price": 14000,        // сколько предложить, ₽
  "hours": 10,           // оценка трудозатрат
  "fit": 92,             // насколько подходит, %
  "why": "Типовой лендинг — твой профиль"
} ] }</textarea></details>
  </div>
  <div class="grid2">
    <div class="panel"><h2>Этот месяц</h2><div class="kpis"><div class="big pos"><span>Заработано</span><b>${fmt(earned)} ₽</b></div><div><span>Откликов</span><b>${sent}</b></div><div><span>Взяли</span><b>${sent ? Math.round(won / sent * 100) : 0}%</b></div></div>
      <div class="flasks" style="grid-template-columns:repeat(2,1fr)">${flask(Math.min(1, earned / Math.max(1, w.profile.goal || 100000)), { label: 'План месяца', sub: `${fmt(earned)} из ${fmt(w.profile.goal || 100000)} ₽` })}${flask(sent ? won / sent : 0, { round: true, color: 'var(--blue)', label: 'Конверсия', sub: `${won} из ${sent}` })}</div></div>
    <div class="panel"><h2>Мой профиль для бота</h2><p>По нему бот будет выбирать заказы и считать цену.</p>
      <form id="wprof"><label class="f">Что умею</label><textarea class="inp" id="wp-skills" style="min-height:70px">${esc(w.profile.skills)}</textarea>
      <div class="two"><div><label class="f">Ставка, ₽/час</label><input class="inp" id="wp-rate" type="number" min="100" value="${w.profile.rate}"></div><div><label class="f">Мин. заказ, ₽</label><input class="inp" id="wp-min" type="number" min="0" value="${w.profile.min}"></div></div>
      <label class="f">План дохода с заказов на месяц, ₽</label><input class="inp" id="wp-goal" type="number" min="0" value="${w.profile.goal || 100000}">
      <div class="btnrow"><button class="btn small" type="submit">Сохранить</button></div></form>
      <h4 class="sh">Калькулятор цены</h4>
      <div class="calc"><input class="inp" id="calc-h" type="number" min="1" placeholder="часов" value="8"><select class="inp" id="calc-k"><option value="1">обычная</option><option value="1.3">сложная</option><option value="1.6">срочная</option></select><b id="calc-out">${fmt(Math.max(w.profile.min, 8 * w.profile.rate))} ₽</b></div>
    </div>
  </div>
  ${sourcesPanel()}
  <div class="seg">${[['new', 'Новые'], ['sent', 'Отклики'], ['progress', 'В работе'], ['done', 'Готово'], ['all', 'Все']].map(([k, n]) => `<button class="${workFilter === k ? 'on' : ''}" data-act="wfilter" data-v="${k}">${n}${counts[k] ? ` · ${counts[k]}` : ''}</button>`).join('')}</div>
  ${list.length ? `<div class="grid2">${list.map(orderCard).join('')}</div>` : `<div class="empty"><p style="margin:0">${w.orders.length ? 'В этом разделе пусто.' : 'Заказов пока нет.'}</p></div>`}
  ${aiPanel('work', 'ИИ-помощник фрилансера', workPrompt(), 'Какие заказы брать первыми, какую цену ставить и как поднять конверсию откликов.')}`;
}
function workPrompt() {
  const w = state.work, fresh = w.orders.filter(o => o.status === 'new').sort((a, b) => (b.fit || 0) - (a.fit || 0)).slice(0, 12);
  const sent = w.orders.filter(o => ['sent', 'progress', 'done', 'lost'].includes(o.status)).length, won = w.orders.filter(o => ['progress', 'done'].includes(o.status)).length;
  return `Я фрилансер: ${w.profile.skills || 'сайты, Telegram-боты, логотипы'}. Ставка ~${w.profile.rate} ₽/час, минимальный заказ ${w.profile.min} ₽, план на месяц ${w.profile.goal || 100000} ₽.
Отправлено откликов: ${sent}, взято в работу: ${won}.
Новые заказы:
${fresh.map(o => `- ${o.title} | бюджет: ${o.budget || '—'} | моя цена: ${o.price} ₽ | ${o.source}`).join('\n') || '- пока нет'}
1) Выбери 3 заказа, за которые стоит взяться первыми, и объясни почему. 2) Проверь, не занижены ли мои цены. 3) Дай 3 конкретных совета, как поднять процент ответов на отклики. Коротко, по-русски.`;
}
function proposalPrompt(o) {
  const p = state.work.profile;
  return `Напиши короткий цепляющий отклик на заказ на фриланс-бирже ${o.source || ''}.
Заказ: «${o.title}». ${o.url ? 'Ссылка: ' + o.url : ''}
Мои навыки: ${p.skills}.
Предлагаю цену ${fmt(o.price || 0)} ₽, срок — ${o.hours ? Math.max(1, Math.ceil(o.hours / 5)) + ' дн.' : 'обсудим'}.
Тон: уверенный, без воды, 4–6 предложений; задай 1–2 уточняющих вопроса по задаче. По-русски.`;
}
function addOrders(arr, demo) {
  let n = 0;
  for (const o of arr) {
    if (!o || !o.title) continue;
    const id = String(o.id || o.url || o.title);
    if (state.work.orders.some(x => x.id === id)) continue;
    state.work.orders.push({ id, title: String(o.title), source: o.source || '', url: /^https?:\/\//.test(o.url || '') ? o.url : '', budget: o.budget || '', price: +o.price || 0, hours: +o.hours || 0, fit: o.fit != null ? Math.max(0, Math.min(100, +o.fit)) : null, why: o.why || '', status: 'new', ts: Date.now(), demo: !!demo });
    n++;
  }
  save(); return n;
}
function parseOrdersText(raw) {
  try { const j = JSON.parse(raw); return Array.isArray(j) ? j : j.orders || []; } catch (e) {}
  // простой текст от бота: «Название — 15000 ₽ — https://...» по строкам
  return raw.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const url = (l.match(/https?:\/\/\S+/) || [''])[0], price = +((l.replace(url, '').match(/(\d[\d\s]{2,})\s*(₽|руб|р\b)/) || [])[1] || '0').replace(/\s/g, '');
    const title = l.replace(url, '').replace(/(\d[\d\s]{2,})\s*(₽|руб\.?|р\b)/, '').replace(/[—\-|·]+\s*$/g, '').replace(/\s[—\-|·]\s/g, ' ').trim();
    return title ? { title, url, price } : null;
  }).filter(Boolean);
}
async function fetchFeed() {
  const url = state.work.feedUrl; if (!url) return;
  workNote = 'Проверяю…'; render();
  try {
    const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error('ответ ' + r.status);
    const j = await r.json(); const n = addOrders(Array.isArray(j) ? j : j.orders || []);
    state.work.lastFetch = Date.now(); save();
    workNote = n ? `Новых заказов: <b>${n}</b>.` : 'Новых заказов нет.';
    if (n && typeof deviceNotify === 'function') deviceNotify('Ilona · новые заказы', `Новых заказов: ${n}. Открой «Работу».`);
  } catch (e) { workNote = `Не удалось получить заказы: ${esc(e.message)}. Проверь адрес и что бот разрешает запросы из браузера (CORS).`; }
  workFilter = 'new'; render();
}
function workClick(act, el) {
  const o = state.work.orders.find(x => x.id === el.dataset.id);
  switch (act) {
    case 'wfilter': workFilter = el.dataset.v; render(); return true;
    case 'wsrc': { const s2 = new Set(state.work.sources); s2.has(el.dataset.v) ? s2.delete(el.dataset.v) : s2.add(el.dataset.v); state.work.sources = SOURCES.map(x => x[0]).filter(id => s2.has(id)); save(); el.parentElement.classList.toggle('on'); const h = el.closest('.panel').querySelector('h2'); if (h) h.textContent = `Где ищем · ${state.work.sources.length} из ${SOURCES.length}`; return true; }
    case 'wsrcall': state.work.sources = el.dataset.v === '1' ? SOURCES.map(x => x[0]) : []; save(); render(); return true;
    case 'wcfg': textSheet('Настройки для бота', JSON.stringify({ skills: state.work.profile.skills, rate: state.work.profile.rate, min_price: state.work.profile.min, sources: SOURCES.filter(x => state.work.sources.includes(x[0])).map(([id, n, url]) => ({ id, name: n, url })) }, null, 2)); return true;
    case 'wdemo': addOrders(DEMO_ORDERS.map((d, i) => ({ ...d, id: 'demo' + i })), true); workNote = 'Это пример того, как бот будет присылать заказы. Удалить можно крестиком.'; render(); return true;
    case 'wfetch': fetchFeed(); return true;
    case 'wsaveurl': state.work.feedUrl = $('#feedurl').value.trim(); save(); workNote = state.work.feedUrl ? 'Адрес сохранён.' : 'Адрес удалён.'; render(); return true;
    case 'wpaste': textSheet('Вставь заказы от бота', '', raw => { const n = addOrders(parseOrdersText(raw)); closeSheet(); workNote = n ? `Добавлено заказов: <b>${n}</b>.` : 'Не нашёл заказов в тексте. Подойдёт JSON или строки «Название — 15000 ₽ — ссылка».'; workFilter = 'new'; render(); }); return true;
    case 'wadd': openOrderForm(); return true;
    case 'ostatus':
      o.status = el.dataset.v;
      if (o.status === 'done') { o.doneAt = today(); state.money.tx.push({ id: 't' + Date.now().toString(36), d: today(), ts: Date.now(), kind: 'in', amount: o.price || 0, cat: 'side', note: 'Заказ: ' + o.title }); toast(`+${fmt(o.price || 0)} ₽ записано в «Финансы»`); }
      save(); render(); return true;
    case 'odel': state.work.orders = state.work.orders.filter(x => x !== o); save(); render(); return true;
    case 'oprompt': textSheet('Отклик — запрос для ИИ', proposalPrompt(o)); return true;
  }
  return false;
}
function openOrderForm() {
  $('#sheet').innerHTML = `<div class="sheet-h"><h2>Новый заказ</h2><button class="x" data-act="close">×</button></div>
  <form id="oform"><label class="f">Что нужно сделать</label><input class="inp" id="of-t" required placeholder="Лендинг для автосервиса">
  <label class="f">Ссылка на заказ</label><input class="inp" id="of-u" type="url" placeholder="https://kwork.ru/projects/…">
  <div class="two"><div><label class="f">Биржа</label><input class="inp" id="of-s" placeholder="Kwork"></div><div><label class="f">Часов работы</label><input class="inp" id="of-h" type="number" min="0" placeholder="8"></div></div>
  <label class="f">Цена, ₽ <span class="hint">(пусто — посчитаю по ставке)</span></label><input class="inp" id="of-p" type="number" min="0">
  <div class="btnrow"><button class="btn hot wide" type="submit">Добавить</button></div></form>`;
  $('#scrim').classList.add('open');
}
document.addEventListener('submit', e => {
  if (e.target.id === 'oform') {
    e.preventDefault(); const p = state.work.profile, h = +$('#of-h').value || 0;
    addOrders([{ id: 'm' + Date.now(), title: $('#of-t').value.trim(), url: $('#of-u').value.trim(), source: $('#of-s').value.trim() || 'вручную', hours: h, price: +$('#of-p').value || Math.max(p.min, Math.round(h * p.rate / 500) * 500) }]);
    closeSheet(); workFilter = 'new'; render(); toast('Заказ добавлен');
  }
  if (e.target.id === 'wprof') { e.preventDefault(); Object.assign(state.work.profile, { skills: $('#wp-skills').value.trim(), rate: +$('#wp-rate').value || 1000, min: +$('#wp-min').value || 0, goal: +$('#wp-goal').value || 0 }); save(); render(); toast('Профиль сохранён'); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'calc-h' || e.target.id === 'calc-k') { const p = state.work.profile, v = Math.max(p.min, Math.round((+$('#calc-h').value || 0) * p.rate * +$('#calc-k').value / 500) * 500); $('#calc-out').textContent = fmt(v) + ' ₽'; }
});
document.addEventListener('change', e => { if (e.target.id === 'calc-k') e.target.dispatchEvent(new Event('input', { bubbles: true })); });

/* ---------- БИЗНЕС-ПАРТНЁР ---------- */
// Каждую неделю — 20 идей (10 физических + 10 с Claude). Не добавленные в избранное исчезают навсегда.
const IDEA_KIND = { ai: 'С Claude и нейросетями', phys: 'Физическое' };
let ideaFilter = 'all', partnerTab = 'week', partnerNote = '';
const isoWeek = (d = parse(today())) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); return `${y}-W${String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)).padStart(2, '0')}`; };
const daysToNextWeek = () => { const d = parse(today()).getDay(); return d === 0 ? 1 : 8 - d; };
function ideaMap() { const m = {}; IDEA_LIB.forEach(i => m[i.id] = i); (state.partner.extra || []).forEach(i => m[i.id] = i); Object.values(state.partner.favData || {}).forEach(i => m[i.id] ||= i); return m; }
const getIdea = id => ideaMap()[id];
function migratePartner() {
  const p = state.partner;
  if (!Array.isArray(p.seen)) p.seen = [];
  p.fav = (p.fav || []).filter(x => typeof x === 'string');
  p.favData ||= {}; p.extra ||= []; p.batch ||= []; p.seenDay ||= {};
}
function pickBatch(exclude) {
  const p = state.partner, m = ideaMap(), seen = new Set(p.seen), fav = new Set(p.fav);
  const fresh = Object.values(m).filter(i => !seen.has(i.id) && !fav.has(i.id) && !exclude.has(i.id));
  // сначала свежие идеи от ИИ, потом встроенные; если закончились — повторяем самые старые из просмотренных
  const order = [...fresh.filter(i => i.src === 'ai-feed'), ...fresh.filter(i => i.src !== 'ai-feed')];
  const take = k => { let a = order.filter(i => (i.k === 'ai' ? 'ai' : 'phys') === k).slice(0, 10); if (a.length < 10) a = a.concat(p.seen.map(id => m[id]).filter(i => i && (i.k === 'ai' ? 'ai' : 'phys') === k && !fav.has(i.id) && !exclude.has(i.id) && !a.includes(i)).slice(0, 10 - a.length).map(i => ({ ...i, repeat: true }))); return a.map(i => i.id); };
  return [...take('phys'), ...take('ai')];
}
function rotateWeek(force) {
  const p = state.partner, wk = isoWeek();
  if (!force && p.week === wk && p.batch.length) return;
  const fav = new Set(p.fav), prev = p.batch || [];
  prev.filter(id => !fav.has(id)).forEach(id => { if (!p.seen.includes(id)) p.seen.push(id); });
  p.seen = p.seen.filter(id => !fav.has(id));
  if (p.seen.length > 400) p.seen = p.seen.slice(-400);
  p.batch = pickBatch(new Set(prev));
  p.rep = p.batch.filter(id => p.seen.includes(id)); // идеи, которые уже были раньше
  p.week = wk; save();
}
function addAIIdeas(arr, src) {
  const p = state.partner, known = new Set(Object.keys(ideaMap()));
  const ok = (arr || []).filter(i => i && i.t && Array.isArray(i.cost) && Array.isArray(i.profit)).map((i, n) => ({ ...i, id: String(i.id || `ai-${Date.now()}-${n}`), k: i.k === 'ai' ? 'ai' : 'phys', src: 'ai-feed', buy: i.buy || [], sell: i.sell || [], tools: i.tools || [], plan: i.plan || [], risks: i.risks || [] })).filter(i => !known.has(i.id));
  if (!ok.length) return 0;
  p.extra = [...p.extra.filter(i => p.fav.includes(i.id) || p.batch.includes(i.id)), ...ok].slice(-120);
  rotateWeek(true); // новые идеи сразу становятся идеями недели, старые (кроме избранного) уходят
  return ok.length;
}
async function fetchIdeasFeed() {
  const p = state.partner, url = (state.work.feedUrl || '').replace(/orders\.json.*$/i, 'ideas.json');
  if (!url || !/ideas\.json$/.test(url) || p.ideasFetched === isoWeek()) return;
  try { const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) return; const j = await r.json(); p.ideasFetched = isoWeek(); save(); const n = addAIIdeas(j.ideas || j, 'feed'); if (n) { partnerNote = `Бот прислал новые идеи: ${n}.`; if (tab === 'partner') render(); } } catch (e) {}
}
const ideaOfDayObj = () => { rotateWeek(); const b = state.partner.batch, dow = (parse(today()).getDay() + 6) % 7; return getIdea(b[(dow * 3) % Math.max(1, b.length)]) || IDEA_LIB[0]; };
const rub = n => n >= 1e6 ? (n / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн' : n >= 1e3 ? Math.round(n / 1e3) + ' тыс.' : String(n);
const range = ([a, b]) => a === b ? rub(a) + ' ₽' : `${rub(a)}–${rub(b)} ₽`;
function ideaArt(k, id) {
  const r = rng('idea' + id), hue = k === 'ai' ? 'var(--accent)' : 'var(--pink)';
  const icon = k === 'ai' ? `<g transform="translate(200 70)"><rect x="-34" y="-28" width="68" height="56" rx="14" fill="${hue}"/><circle cx="-12" cy="-2" r="6" fill="var(--card)"><animate attributeName="r" values="6;1;6" dur="3s" repeatCount="indefinite"/></circle><circle cx="12" cy="-2" r="6" fill="var(--card)"/><path d="M-10 14h20" stroke="var(--card)" stroke-width="4" stroke-linecap="round"/><path d="M0-28v-12" stroke="${hue}" stroke-width="4"/><circle cy="-44" r="5" fill="${hue}"><animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite"/></circle></g>`
    : `<g transform="translate(200 72)"><g><animateTransform attributeName="transform" type="rotate" values="-12;12;-12" dur="1.4s" repeatCount="indefinite"/><rect x="-6" y="-10" width="12" height="54" rx="4" fill="${hue}"/><rect x="-28" y="-30" width="56" height="24" rx="6" fill="${hue}"/></g></g>`;
  let dots = ''; for (let j = 0; j < 14; j++) dots += `<circle cx="${R(r() * 400)}" cy="${R(r() * 140)}" r="${R(1 + r() * 3)}" fill="${hue}" opacity="${R(.15 + r() * .4, 2)}"/>`;
  return `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice"><rect width="400" height="140" fill="var(--card2)"/>${dots}<circle cx="200" cy="70" r="58" fill="${hue}" opacity=".12"><animate attributeName="r" values="52;64;52" dur="4s" repeatCount="indefinite"/></circle>${icon}</svg>`;
}
function ideaCard(d, hero) {
  const fav = state.partner.fav.includes(d.id);
  return `<article class="idea ${hero ? 'big' : ''}">${hero ? `<div class="idea-art">${ideaArt(d.k, d.id)}</div>` : ''}
    <div class="idea-b"><div class="otop"><span class="tag ${d.k === 'ai' ? 'money' : 'split'}">${IDEA_KIND[d.k === 'ai' ? 'ai' : 'phys']}</span><span class="tag">риск: ${esc(d.risk || '—')}</span>${d.repeat || (state.partner.rep || []).includes(d.id) ? '<span class="tag">повтор</span>' : ''}${d.src === 'ai-feed' ? '<span class="tag">от ИИ</span>' : ''}<button class="fav ${fav ? 'on' : ''}" data-act="ifav" data-id="${esc(d.id)}" aria-label="${fav ? 'Убрать из избранного' : 'В избранное'}">${fav ? '★' : '☆'}</button></div>
    <h3>${esc(d.t)}</h3>
    <div class="nums"><div><span>Вложения</span><b>${range(d.cost)}</b></div><div><span>Прибыль / ${esc(d.per || 'мес')}</span><b class="pos">${range(d.profit)}</b></div></div>
    <button class="btn small ${hero ? 'hot' : 'light'}" data-act="iopen" data-id="${esc(d.id)}">Подробный план →</button></div></article>`;
}
function openIdea(id) {
  const d = getIdea(id); if (!d) return;
  const fav = state.partner.fav.includes(d.id);
  $('#sheet').innerHTML = `<div class="idea-art sheet-art">${ideaArt(d.k, d.id)}</div>
  <div class="sheet-h"><h2>${esc(d.t)}</h2><button class="x" data-act="close">×</button></div>
  <div class="otop" style="margin-bottom:10px"><span class="tag ${d.k === 'ai' ? 'money' : 'split'}">${IDEA_KIND[d.k === 'ai' ? 'ai' : 'phys']}</span><span class="tag">риск: ${esc(d.risk || '—')}</span></div>
  <div class="nums n4"><div><span>Вложения</span><b>${range(d.cost)}</b></div><div><span>Прибыль / ${esc(d.per || 'мес')}</span><b class="pos">${range(d.profit)}</b></div><div style="grid-column:1/-1"><span>До первых денег</span><b style="font-size:14px">${esc(d.time || '—')}</b></div></div>
  <h4 class="sh">Как оформиться</h4><p class="ip">${esc(REG[d.reg] || REG.npd)}</p><p class="hint">${esc(REG_ABROAD)}</p>
  ${d.buy.length ? `<h4 class="sh">Что купить и где</h4><div class="buy">${d.buy.map(([w, where, price]) => `<div class="buyrow"><b>${esc(w)}</b><span>${esc(where)}</span><em>${esc(price || '')}</em></div>`).join('')}</div>` : ''}
  ${d.sell.length ? `<h4 class="sh">Где брать клиентов и продавать</h4><ul class="advice">${d.sell.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  ${d.tools.length ? `<h4 class="sh">Инструменты и сервисы</h4><div class="chips">${d.tools.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>` : ''}
  ${d.plan.length ? `<h4 class="sh">План по неделям</h4><ol class="steps">${d.plan.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>` : ''}
  ${d.ai ? `<div class="tipbox"><b>Чем поможет Claude</b>${esc(d.ai)}</div>` : ''}
  ${d.risks.length ? `<h4 class="sh">Риски и как их снизить</h4><ul class="advice">${d.risks.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
  <p class="hint">Цифры — грубая оценка: сильно зависят от города, сезона и твоих усилий. Это не гарантия дохода и не финансовая или юридическая консультация.</p>
  <div class="btnrow"><button class="btn ${fav ? 'light' : 'hot'}" data-act="ifav" data-id="${esc(d.id)}">${fav ? '★ В избранном' : '☆ В избранное'}</button><button class="btn" data-act="igoal" data-id="${esc(d.id)}">Сделать целью</button><button class="btn light" data-act="iprompt" data-id="${esc(d.id)}">Разобрать с ИИ</button></div>`;
  $('#scrim').classList.add('open'); $('#sheet').scrollTop = 0;
}
function viewPartner() {
  rotateWeek(); fetchIdeasFeed();
  const p = state.partner, day = ideaOfDayObj();
  const batch = p.batch.map(getIdea).filter(Boolean), favs = p.fav.map(getIdea).filter(Boolean);
  const src = partnerTab === 'fav' ? favs : batch;
  const list = src.filter(d => ideaFilter === 'all' || (d.k === 'ai' ? 'ai' : 'phys') === ideaFilter).filter(d => !p.budget || d.cost[0] <= p.budget);
  const left = daysToNextWeek();
  return `<div class="top"><div><div class="date">неделя ${p.week.split('-W')[1]} · новые идеи через ${left} ${plural(left, 'день', 'дня', 'дней')}</div><h1>Бизнес-<br>партнёр</h1></div></div>
  ${partnerNote ? `<div class="bubble">${partnerNote}</div>` : ''}
  <h4 class="sh" style="margin-top:0">Идея дня</h4>${ideaCard(day, true)}
  <div class="seg"><button class="${partnerTab === 'week' ? 'on' : ''}" data-act="ptab" data-v="week">Идеи недели · ${batch.length}</button><button class="${partnerTab === 'fav' ? 'on' : ''}" data-act="ptab" data-v="fav">★ Избранное · ${favs.length}</button></div>
  <div class="panel"><p style="margin-top:0">${partnerTab === 'week' ? 'Каждый понедельник приходят 20 новых идей: 10 физических и 10 с Claude. Всё, что не отмечено ☆, в следующий понедельник исчезнет и больше не вернётся.' : 'Здесь хранятся идеи, которые ты отметил ☆. Они остаются навсегда, пока ты сам их не уберёшь.'}</p>
    <div class="chips">${[['all', 'Все'], ['phys', 'Физические'], ['ai', 'С Claude']].map(([k, n]) => `<button class="chip ${ideaFilter === k ? 'on' : ''}" data-act="ifilter" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="chips" style="margin-top:8px">${[[0, 'Любой бюджет'], [10e3, 'до 10 тыс.'], [50e3, 'до 50 тыс.'], [150e3, 'до 150 тыс.'], [300e3, 'до 300 тыс.']].map(([v, n]) => `<button class="chip ${p.budget === v ? 'on' : ''}" data-act="ibudget" data-v="${v}">${n}</button>`).join('')}</div></div>
  <div class="grid2 rlist">${list.map(d => ideaCard(d)).join('') || `<div class="empty"><p style="margin:0">${partnerTab === 'fav' ? 'Пока пусто — отмечай понравившиеся идеи звёздочкой ☆.' : 'Под эти фильтры идей нет.'}</p></div>`}</div>
  <div class="panel ai-panel"><h2>Ещё идеи от ИИ</h2><p>Встроенных идей хватит на пару недель, дальше они начнут повторяться (с пометкой «повтор»). Свежие 20 идей каждую неделю можно получать двумя способами:</p>
    <ol class="steps"><li><span><b>Автоматически.</b> Бот из раздела «Работа» с ключом Claude API каждый понедельник сам генерирует идеи, и приложение их подхватывает.</span></li><li><span><b>Вручную.</b> Скопируй запрос, вставь в чат с Claude, а ответ вставь сюда.</span></li></ol>
    <div class="btnrow"><button class="btn hot" data-act="icopygen">${state.settings.apiKey ? 'Получить 20 идей от ИИ' : 'Скопировать запрос'}</button><button class="btn light" data-act="ipaste">Вставить идеи от ИИ</button><a class="btn light" href="https://claude.ai/new" target="_blank" rel="noopener noreferrer">Открыть Claude ↗</a></div></div>
  ${aiPanel('partner', 'Спросить бизнес-партнёра', advisorPrompt(favs.length ? favs : batch.slice(0, 6)), favs.length ? 'Сравнит идеи из избранного и скажет, с какой начать.' : 'Отметь идеи ☆ — и ИИ сравнит именно их.')}`;
}
function advisorPrompt(list) {
  return `Ты мой бизнес-партнёр. Я фрилансер-разработчик (сайты, боты, логотипы), сейчас живу в Германии, заработок в рублях.
Идеи, которые я рассматриваю:
${list.map(d => `- ${d.t}: вложения ${range(d.cost)}, прибыль ${range(d.profit)}/${d.per || 'мес'}, риск ${d.risk}`).join('\n')}
Сравни их честно: с какой начать при ограниченном времени и бюджете, что можно делать удалённо, где цифры выглядят слишком оптимистично. В конце — план первых 7 дней по лучшей идее.`;
}
function ideasGenPrompt() {
  const p = state.work?.profile, seen = [...state.partner.batch, ...state.partner.seen.slice(-60)].map(getIdea).filter(Boolean).map(i => i.t);
  return `Ты мой бизнес-партнёр. Придумай 20 новых реалистичных идей заработка в России: ровно 10 физических (k="phys": производство, услуги, тендеры на zakupki.gov.ru, торговля) и ровно 10 с Claude и нейросетями (k="ai").
Мои навыки: ${p?.skills || 'не указаны'}. Я фрилансер-разработчик, могу работать удалённо.
Не повторяй: ${seen.join('; ') || 'нет'}.
Цифры — честные вилки без завышения. Указывай конкретику: где купить (Авито, Ozon, WB, Леруа Мерлен, металлобазы, 1688 через карго и т.д.), где продавать и искать клиентов, как оформиться.
Ответь ТОЛЬКО JSON-массивом из 20 объектов:
{"id":"строка","t":"название","k":"phys|ai","cost":[мин,макс],"profit":[мин,макс],"per":"мес|сделка","time":"срок до первых денег","risk":"низкий|средний|высокий","reg":"npd|ip|tender","buy":[["что","где купить","цена"]],"sell":["где брать клиентов"],"tools":["сервисы"],"plan":["Неделя 1: …","Неделя 2: …","Неделя 3–4: …"],"ai":"что поручить Claude","risks":["риск и как снизить"]}`;
}
function partnerPrompt(id) {
  const d = getIdea(id), p = state.work?.profile;
  return `Ты мой бизнес-партнёр. Разбери подробно идею «${d.t}» для меня (Россия; сейчас я за границей, но работать буду с российскими клиентами).
Мои навыки: ${p?.skills || 'не указаны'}. Вложения по моей оценке: ${range(d.cost)}.
Дай: 1) пошаговый план первых 30 дней по дням с конкретными действиями; 2) точный список покупок — что, где купить (конкретные магазины и площадки), сколько стоит; 3) где и как найти первых 10 клиентов — тексты объявлений и сообщений; 4) как оформиться (самозанятость/ИП/тендеры) и какие разрешения нужны; 5) реалистичный расчёт прибыли по месяцам на полгода; 6) риски и как их снизить; 7) что конкретно я могу поручить Claude. Кратко, по пунктам, с цифрами.`;
}
function partnerClick(act, el) {
  const id = el.dataset.id;
  switch (act) {
    case 'iopen': openIdea(id); return true;
    case 'ptab': partnerTab = el.dataset.v; render(); return true;
    case 'ifilter': ideaFilter = el.dataset.v; render(); return true;
    case 'ibudget': state.partner.budget = +el.dataset.v; save(); render(); return true;
    case 'ifav': {
      const p = state.partner, k = p.fav.indexOf(id), d = getIdea(id);
      if (k >= 0) { p.fav.splice(k, 1); delete p.favData[id]; if (!p.batch.includes(id) && !p.seen.includes(id)) p.seen.push(id); toast('Убрано из избранного'); }
      else { p.fav.push(id); if (d && d.src === 'ai-feed') p.favData[id] = d; toast('★ Добавлено в избранное'); }
      save();
      if ($('#scrim').classList.contains('open')) openIdea(id);
      render(); return true;
    }
    case 'iprompt': textSheet('Подробный разбор — запрос для ИИ', partnerPrompt(id)); return true;
    case 'icopygen': textSheet('Запрос: 20 новых идей', ideasGenPrompt(), null, txt => { let arr = []; try { arr = JSON.parse(txt.match(/\[[\s\S]*\]/)[0]); } catch (e) {} const n = addAIIdeas(arr, 'ai'); closeSheet(); partnerNote = n ? `ИИ прислал идей: <b>${n}</b>. Они стали идеями этой недели.` : 'Не нашёл идей в ответе ИИ — попробуй ещё раз.'; partnerTab = 'week'; render(); }); return true;
    case 'ipaste': textSheet('Вставь ответ ИИ с идеями', '', raw => { let arr = []; try { const m = raw.match(/\[[\s\S]*\]/); arr = JSON.parse(m ? m[0] : raw); } catch (e) {} const n = addAIIdeas(Array.isArray(arr) ? arr : arr.ideas, 'paste'); closeSheet(); partnerNote = n ? `Добавлено идей: <b>${n}</b>. Они стали идеями этой недели, а старые (кроме избранного) ушли.` : 'Не нашёл идей в тексте. Нужен JSON-массив, который вернёт ИИ по запросу.'; partnerTab = 'week'; render(); }); return true;
    case 'igoal': { const d = getIdea(id), t = today(); state.goals.push({ id: 'g' + Date.now().toString(36), type: 'custom', title: d.t, target: '', unit: '', start: t, end: addDays(t, 29), steps: (d.plan.length ? d.plan : ['Сделать первый шаг по идее']).slice(0, 3).map(s => s.length > 80 ? s.slice(0, 78) + '…' : s), log: {} }); save(); closeSheet(); toast('Цель создана — шаги появятся на «Сегодня»'); return true; }
  }
  return false;
}
