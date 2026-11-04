/* Уведомления: Telegram-бот (приходят даже когда приложение закрыто) + уведомления устройства (пока приложение открыто/свернуто). */
const N_KINDS = [
  ['orders', '🆕 Новые заказы', 'бот присылает подходящие заказы с ценой, раз в ~20 минут'],
  ['lessons', '🧠 Урок дня', 'утреннее напоминание про «Саморазвитие»'],
  ['ideas', '💡 Идеи недели', 'по понедельникам: 20 новых идей в «Партнёре»'],
];
function nState() {
  const s = state.settings;
  s.notify = s.notify || {};
  s.notify.tg = { orders: true, lessons: true, ideas: true, ...(s.notify.tg || {}) };
  if (s.notify.bot === undefined) s.notify.bot = '';
  if (!Array.isArray(s.notify.people)) s.notify.people = [{ who: 'Мой Telegram', tg: 'GaleevBogdan' }, { who: 'Telegram девушки', tg: '' }];
  return s.notify;
}
function botName() { return (nState().bot || '').trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').replace(/[^\w]/g, ''); }
const nick = v => (v || '').trim().replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').replace(/[^\w]/g, '');
function tgLink(cmd) { return `https://t.me/${botName()}?start=${cmd}`; }

function notifyPanel() {
  const n = nState(), b = botName(), people = n.people, nicks = people.map(x => nick(x.tg)).filter(Boolean);
  const devOk = 'Notification' in window, perm = devOk ? Notification.permission : 'unsupported';
  const yaml = `notify:\n  users:\n${nicks.map(x => `    - ${x}`).join('\n')}`;
  return `<div class="panel" id="notifpanel"><h2>Уведомления в Telegram</h2>
    <p>Приходят даже когда приложение закрыто: новые заказы, урок дня и идеи недели.</p>
    <ol class="steps">
      <li><span><b>Бот.</b> Имя бота, которого ты создал у @BotFather.</span></li>
      <li><span><b>Кому присылать.</b> Ники в Telegram — твой и девушки.</span></li>
      <li><span><b>Подключить — один раз.</b> Telegram запрещает ботам писать первыми, поэтому каждый нажимает «Подключить» и в боте «Start». Бот ответит «Готово» в течение ~20 минут.</span></li>
    </ol>
    <label class="f">Имя бота</label>
    <input class="inp" id="tgbot" placeholder="@ilona_orders_bot" value="${esc(n.bot)}">
    ${people.map((x, i) => `<label class="f">${esc(x.who)}</label>
      <div class="txform"><input class="inp" data-np="${i}" placeholder="@ник" value="${x.tg ? '@' + esc(nick(x.tg)) : ''}">${b && nick(x.tg) ? `<button class="btn small light" data-act="nconnect">Подключить</button>` : ''}</div>`).join('')}
    <div class="btnrow"><button class="btn small" data-act="nsave">Сохранить</button></div>
    ${nicks.length ? `<details class="nyaml"><summary>Эти ники должны быть и в настройках бота</summary>
      <p class="hint">Бот пишет только людям из своего списка — чтобы чужие не получали твои заказы. @GaleevBogdan там уже вписан. Когда добавишь ник девушки, замени этот блок в файле <b>config.yaml</b> бота на GitHub (карандаш ✏️ → Commit changes):</p>
      <textarea class="prompt" readonly style="min-height:90px">${esc(yaml)}</textarea>
      <div class="btnrow"><button class="btn small light" data-act="nyamlcopy">Скопировать</button></div></details>` : ''}
    ${b ? `<h3 style="margin:18px 0 6px">Что присылать</h3>
      <p class="hint" style="margin-top:0">У каждого свои переключатели: нажатие меняет настройки того, кто жмёт «Start» в своём Telegram.</p>
      <div class="nlist">${N_KINDS.map(([k, t, d]) => `<label class="switch nrow"><input type="checkbox" data-act="ntg" data-k="${k}" ${n.tg[k] ? 'checked' : ''}><span></span><div><b>${t}</b><small>${d}</small></div></label>`).join('')}</div>
      <div class="btnrow"><button class="btn small light" data-act="nall" data-v="1">Включить всё</button><button class="btn small light" data-act="nall" data-v="0">Выключить всё</button><a class="btn small light" href="${tgLink('status')}" target="_blank" rel="noopener">Что сейчас включено?</a></div>`
      : `<p class="hint">Впиши имя бота — появятся кнопки «Подключить» и переключатели.</p>`}
    <h3 style="margin:18px 0 6px">На этом устройстве</h3>
    <label class="switch"><input type="checkbox" data-act="ndev" ${n.device && perm === 'granted' ? 'checked' : ''} ${devOk ? '' : 'disabled'}><span></span>Показывать уведомление о новых заказах, пока приложение открыто или свернуто</label>
    <p class="hint">${!devOk ? 'Этот браузер не поддерживает уведомления. На iPhone они работают только у приложения, добавленного на экран «Домой» (iOS 16.4+).'
      : perm === 'denied' ? 'Уведомления запрещены в настройках браузера для этого сайта — разреши их там, если передумаешь.'
      : 'Браузер спросит разрешение один раз. Закрытое приложение будит только Telegram.'}</p>
  </div>`;
}

function deviceNotify(title, body) {
  const n = nState();
  if (!n.device || !('Notification' in window) || Notification.permission !== 'granted') return;
  const opt = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'ilona-' + title };
  navigator.serviceWorker?.getRegistration?.().then(r => r ? r.showNotification(title, opt) : new Notification(title, opt)).catch(() => { try { new Notification(title, opt); } catch (e) {} });
}

function notifyClick(act, el) {
  const n = nState();
  switch (act) {
    case 'nsave': {
      n.bot = $('#tgbot').value.trim();
      document.querySelectorAll('[data-np]').forEach(inp => { n.people[+inp.dataset.np].tg = nick(inp.value); });
      save(); render(); toast('Сохранено'); return true;
    }
    case 'nconnect': window.open(tgLink('hi'), '_blank', 'noopener'); toast('Нажми «Start» в боте'); return true;
    case 'nyamlcopy': copy(el.closest('details').querySelector('textarea').value); return true;
    case 'nall': { const on = el.dataset.v === '1'; for (const [k] of N_KINDS) n.tg[k] = on; save(); window.open(tgLink(on ? 'all_on' : 'all_off'), '_blank', 'noopener'); render(); toast('Нажми «Start» в боте'); return true; }
  }
  return false;
}
document.addEventListener('change', async e => {
  const el = e.target, n = state && state.settings && nState();
  if (el.dataset.act === 'ntg') {
    const k = el.dataset.k; n.tg[k] = el.checked; save();
    window.open(tgLink(`${k}_${el.checked ? 'on' : 'off'}`), '_blank', 'noopener');
    toast(`${el.checked ? 'Включаю' : 'Выключаю'} — нажми «Start» в боте`);
  }
  if (el.dataset.act === 'ndev') {
    if (el.checked && Notification.permission !== 'granted') {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { el.checked = false; n.device = false; save(); toast('Разрешение не дано'); return; }
    }
    n.device = el.checked; save();
    if (el.checked) deviceNotify('Ilona', 'Уведомления включены ✓');
  }
});
