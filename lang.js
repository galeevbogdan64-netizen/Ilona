'use strict';
/* =========================================================
   ИИ-репетитор языков: цель N слов за период, новые слова каждый день,
   интервальные повторения, грамматика дня, мини-тест, произношение.
   Встроенный стартовый словарь — 60 базовых слов; дальше слова даёт ИИ.
   ========================================================= */
const LANGS = {
  en: { n: 'Английский', f: '🇬🇧', tts: 'en-US' }, de: { n: 'Немецкий', f: '🇩🇪', tts: 'de-DE' }, es: { n: 'Испанский', f: '🇪🇸', tts: 'es-ES' },
  tr: { n: 'Турецкий', f: '🇹🇷', tts: 'tr-TR' }, zh: { n: 'Китайский', f: '🇨🇳', tts: 'zh-CN' }, fr: { n: 'Французский', f: '🇫🇷', tts: 'fr-FR' }, it: { n: 'Итальянский', f: '🇮🇹', tts: 'it-IT' }
};
const RU_CORE = ['привет', 'спасибо', 'пожалуйста', 'да', 'нет', 'извините', 'хороший', 'плохой', 'вода', 'еда', 'хлеб', 'кофе', 'чай', 'дом', 'работа', 'деньги', 'время', 'день', 'ночь', 'утро', 'сегодня', 'завтра', 'вчера', 'друг', 'семья', 'мама', 'папа', 'человек', 'город', 'улица', 'магазин', 'машина', 'книга', 'телефон', 'большой', 'маленький', 'новый', 'старый', 'красивый', 'быстро', 'медленно', 'один', 'два', 'три', 'четыре', 'пять', 'десять', 'сто', 'есть (кушать)', 'пить', 'идти', 'говорить', 'знать', 'хотеть', 'любить', 'видеть', 'понимать', 'учить', 'работать', 'жить'];
const CORE = {
  en: ['hello', 'thank you', 'please', 'yes', 'no', 'sorry', 'good', 'bad', 'water', 'food', 'bread', 'coffee', 'tea', 'house', 'work', 'money', 'time', 'day', 'night', 'morning', 'today', 'tomorrow', 'yesterday', 'friend', 'family', 'mother', 'father', 'person', 'city', 'street', 'shop', 'car', 'book', 'phone', 'big', 'small', 'new', 'old', 'beautiful', 'quickly', 'slowly', 'one', 'two', 'three', 'four', 'five', 'ten', 'hundred', 'to eat', 'to drink', 'to go', 'to speak', 'to know', 'to want', 'to love', 'to see', 'to understand', 'to learn', 'to work', 'to live'],
  de: ['Hallo', 'danke', 'bitte', 'ja', 'nein', 'Entschuldigung', 'gut', 'schlecht', 'das Wasser', 'das Essen', 'das Brot', 'der Kaffee', 'der Tee', 'das Haus', 'die Arbeit', 'das Geld', 'die Zeit', 'der Tag', 'die Nacht', 'der Morgen', 'heute', 'morgen', 'gestern', 'der Freund', 'die Familie', 'die Mutter', 'der Vater', 'der Mensch', 'die Stadt', 'die Straße', 'das Geschäft', 'das Auto', 'das Buch', 'das Telefon', 'groß', 'klein', 'neu', 'alt', 'schön', 'schnell', 'langsam', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'zehn', 'hundert', 'essen', 'trinken', 'gehen', 'sprechen', 'wissen', 'wollen', 'lieben', 'sehen', 'verstehen', 'lernen', 'arbeiten', 'leben'],
  es: ['hola', 'gracias', 'por favor', 'sí', 'no', 'perdón', 'bueno', 'malo', 'el agua', 'la comida', 'el pan', 'el café', 'el té', 'la casa', 'el trabajo', 'el dinero', 'el tiempo', 'el día', 'la noche', 'la mañana', 'hoy', 'mañana', 'ayer', 'el amigo', 'la familia', 'la madre', 'el padre', 'la persona', 'la ciudad', 'la calle', 'la tienda', 'el coche', 'el libro', 'el teléfono', 'grande', 'pequeño', 'nuevo', 'viejo', 'bonito', 'rápido', 'despacio', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'diez', 'cien', 'comer', 'beber', 'ir', 'hablar', 'saber', 'querer', 'amar', 'ver', 'entender', 'aprender', 'trabajar', 'vivir'],
  tr: ['merhaba', 'teşekkürler', 'lütfen', 'evet', 'hayır', 'özür dilerim', 'iyi', 'kötü', 'su', 'yemek (еда)', 'ekmek', 'kahve', 'çay', 'ev', 'iş', 'para', 'zaman', 'gün', 'gece', 'sabah', 'bugün', 'yarın', 'dün', 'arkadaş', 'aile', 'anne', 'baba', 'insan', 'şehir', 'sokak', 'mağaza', 'araba', 'kitap', 'telefon', 'büyük', 'küçük', 'yeni', 'eski', 'güzel', 'hızlı', 'yavaş', 'bir', 'iki', 'üç', 'dört', 'beş', 'on', 'yüz', 'yemek (есть)', 'içmek', 'gitmek', 'konuşmak', 'bilmek', 'istemek', 'sevmek', 'görmek', 'anlamak', 'öğrenmek', 'çalışmak', 'yaşamak'],
  zh: ['你好 nǐ hǎo', '谢谢 xièxie', '请 qǐng', '是 shì', '不 bù', '对不起 duìbuqǐ', '好 hǎo', '坏 huài', '水 shuǐ', '食物 shíwù', '面包 miànbāo', '咖啡 kāfēi', '茶 chá', '房子 fángzi', '工作 gōngzuò', '钱 qián', '时间 shíjiān', '天 tiān', '夜晚 yèwǎn', '早上 zǎoshang', '今天 jīntiān', '明天 míngtiān', '昨天 zuótiān', '朋友 péngyou', '家庭 jiātíng', '妈妈 māma', '爸爸 bàba', '人 rén', '城市 chéngshì', '街道 jiēdào', '商店 shāngdiàn', '汽车 qìchē', '书 shū', '手机 shǒujī', '大 dà', '小 xiǎo', '新 xīn', '旧 jiù', '漂亮 piàoliang', '快 kuài', '慢 màn', '一 yī', '二 èr', '三 sān', '四 sì', '五 wǔ', '十 shí', '一百 yìbǎi', '吃 chī', '喝 hē', '去 qù', '说 shuō', '知道 zhīdào', '想要 xiǎngyào', '爱 ài', '看 kàn', '明白 míngbai', '学习 xuéxí', '工作 gōngzuò (гл.)', '生活 shēnghuó'],
  fr: ['bonjour', 'merci', "s'il vous plaît", 'oui', 'non', 'pardon', 'bon', 'mauvais', "l'eau", 'la nourriture', 'le pain', 'le café', 'le thé', 'la maison', 'le travail', "l'argent", 'le temps', 'le jour', 'la nuit', 'le matin', "aujourd'hui", 'demain', 'hier', "l'ami", 'la famille', 'la mère', 'le père', 'la personne', 'la ville', 'la rue', 'le magasin', 'la voiture', 'le livre', 'le téléphone', 'grand', 'petit', 'nouveau', 'vieux', 'beau', 'vite', 'lentement', 'un', 'deux', 'trois', 'quatre', 'cinq', 'dix', 'cent', 'manger', 'boire', 'aller', 'parler', 'savoir', 'vouloir', 'aimer', 'voir', 'comprendre', 'apprendre', 'travailler', 'vivre'],
  it: ['ciao', 'grazie', 'per favore', 'sì', 'no', 'scusa', 'buono', 'cattivo', "l'acqua", 'il cibo', 'il pane', 'il caffè', 'il tè', 'la casa', 'il lavoro', 'i soldi', 'il tempo', 'il giorno', 'la notte', 'la mattina', 'oggi', 'domani', 'ieri', "l'amico", 'la famiglia', 'la madre', 'il padre', 'la persona', 'la città', 'la strada', 'il negozio', 'la macchina', 'il libro', 'il telefono', 'grande', 'piccolo', 'nuovo', 'vecchio', 'bello', 'velocemente', 'lentamente', 'uno', 'due', 'tre', 'quattro', 'cinque', 'dieci', 'cento', 'mangiare', 'bere', 'andare', 'parlare', 'sapere', 'volere', 'amare', 'vedere', 'capire', 'imparare', 'lavorare', 'vivere']
};
// грамматика: [тема, правило, [пример, перевод], задание, ответ]
const GRAMMAR = {
  en: [['to be: am / is / are', 'Глагол «быть» меняется по лицам: I am, he/she/it is, we/you/they are.', ['They are friends.', 'Они друзья.'], 'They ___ friends.', 'are'], ['Present Simple', 'Регулярные действия. С he/she/it к глаголу добавляется -s.', ['She works in a bank.', 'Она работает в банке.'], 'She ___ (work) in a bank.', 'works'], ['Вопросы с do / does', 'Вопрос в Present Simple: Do + I/you/we/they, Does + he/she/it.', ['Do you like coffee?', 'Ты любишь кофе?'], '___ you like coffee?', 'do'], ['Артикли a / an', 'a — перед согласным звуком, an — перед гласным.', ['an apple, a car', 'яблоко, машина'], 'I have ___ apple.', 'an'], ['Present Continuous', 'Действие прямо сейчас: am/is/are + глагол с -ing.', ['I am reading now.', 'Я сейчас читаю.'], 'I ___ reading now.', 'am'], ['Past Simple', 'Прошедшее: правильные глаголы + -ed, неправильные — особая форма (go → went).', ['Yesterday I went to the shop.', 'Вчера я ходил в магазин.'], 'Yesterday I ___ (go) to the shop.', 'went'], ['Future: will', 'Будущее: will + глагол.', ['I will call you tomorrow.', 'Я позвоню тебе завтра.'], 'I ___ call you tomorrow.', 'will'], ['Множественное число', 'Обычно + -s, но есть исключения: child → children, man → men.', ['two children', 'двое детей'], 'one child — two ___', 'children']],
  de: [['Артикли der / die / das', 'У каждого существительного свой род: der (м.), die (ж.), das (ср.). Учи слово сразу с артиклем.', ['das Haus, die Stadt', 'дом, город'], '___ Haus', 'das'], ['Глагол sein', 'ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind.', ['Ich bin müde.', 'Я устал.'], 'Ich ___ müde.', 'bin'], ['Окончания в Präsens', 'ich -e, du -st, er -t, wir -en, ihr -t, sie -en.', ['Du lernst Deutsch.', 'Ты учишь немецкий.'], 'Du ___ (lernen) Deutsch.', 'lernst'], ['Глагол на втором месте', 'В повествовательном предложении спрягаемый глагол всегда второй.', ['Heute gehe ich ins Kino.', 'Сегодня я иду в кино.'], 'Heute ___ ich ins Kino. (gehen)', 'gehe'], ['Отрицание kein', 'kein — перед существительным без определённого артикля, nicht — в остальных случаях.', ['Ich habe kein Auto.', 'У меня нет машины.'], 'Ich habe ___ Auto.', 'kein'], ['Глагол haben', 'ich habe, du hast, er hat, wir haben.', ['Wir haben Zeit.', 'У нас есть время.'], 'Wir ___ Zeit.', 'haben'], ['Модальный глагол können', 'ich kann, du kannst, er kann + инфинитив в конце.', ['Ich kann schwimmen.', 'Я умею плавать.'], 'Ich ___ schwimmen.', 'kann'], ['Perfekt', 'Прошедшее время в речи: haben/sein + Partizip II.', ['Ich habe Kaffee getrunken.', 'Я выпил кофе.'], 'Ich ___ Kaffee getrunken.', 'habe']],
  es: [['ser и estar', 'ser — постоянные качества, estar — состояние и место.', ['Estoy cansado.', 'Я устал.'], 'Yo ___ cansado. (estar)', 'estoy'], ['Род и артикль', 'el — мужской род, la — женский. Слова на -a обычно женские.', ['la casa, el libro', 'дом, книга'], '___ casa', 'la'], ['Глаголы на -ar', 'hablar: hablo, hablas, habla, hablamos, habláis, hablan.', ['Tú hablas español.', 'Ты говоришь по-испански.'], 'Tú ___ (hablar) español.', 'hablas'], ['Множественное число', 'После гласной + -s, после согласной + -es.', ['libros, ciudades', 'книги, города'], 'libro → ___', 'libros'], ['tener', 'Возраст говорят через «иметь»: Tengo 25 años.', ['Tengo 25 años.', 'Мне 25 лет.'], 'Yo ___ 25 años.', 'tengo'], ['gustar', 'Me gusta + ед. число, me gustan + мн. число.', ['Me gusta el café.', 'Мне нравится кофе.'], 'Me ___ el café.', 'gusta'], ['ir a + инфинитив', 'Ближайшее будущее: voy a comer — я собираюсь поесть.', ['Voy a comer.', 'Я собираюсь поесть.'], 'Voy ___ comer.', 'a'], ['Отрицание no', 'no ставится перед глаголом.', ['No hablo alemán.', 'Я не говорю по-немецки.'], 'Yo ___ hablo alemán.', 'no']],
  tr: [['Множественное число -lar/-ler', 'Гармония гласных: после a, ı, o, u → -lar; после e, i, ö, ü → -ler.', ['evler, kitaplar', 'дома, книги'], 'ev → ___', 'evler'], ['«Я — студент»', 'Личные окончания: öğrenciyim — я студент.', ['Ben öğrenciyim.', 'Я студент.'], 'Ben öğrenci___', 'yim'], ['Настоящее время -iyor', 'gel + iyor + um = geliyorum (я иду/прихожу).', ['Ben geliyorum.', 'Я иду.'], 'Ben gel___', 'iyorum'], ['Отрицание değil', 'değil — «не» для существительных и прилагательных.', ['Bu kahve değil.', 'Это не кофе.'], 'Bu kahve ___.', 'değil'], ['Принадлежность', 'Окончание «мой»: ev → evim, araba → arabam.', ['Benim evim.', 'Мой дом.'], 'ev → «мой дом» = ___', 'evim'], ['var / yok', 'var — есть, yok — нет.', ['Param yok.', 'У меня нет денег.'], 'Param ___. (нет)', 'yok'], ['Вопрос mı/mi', 'Частица вопроса пишется отдельно и следует гармонии: çay mı?', ['Bu çay mı?', 'Это чай?'], 'Bu çay ___?', 'mı'], ['Местный падеж -de/-da', '«в, на»: evde — дома, okulda — в школе.', ['Ben evdeyim.', 'Я дома.'], 'ev → «дома» = ___', 'evde']],
  zh: [['Связка 是', '是 (shì) связывает два существительных: 我是学生 — я студент.', ['我是学生。', 'Я студент.'], '我___学生。', '是'], ['Отрицание 不', '不 (bù) ставится перед глаголом или прилагательным.', ['我不喝咖啡。', 'Я не пью кофе.'], '我___喝咖啡。', '不'], ['Вопрос с 吗', 'Добавь 吗 (ma) в конец утверждения — получится вопрос.', ['你好吗？', 'Как дела?'], '你好___？', '吗'], ['Принадлежность 的', '的 (de) — «чей»: 我的书 — моя книга.', ['我的书', 'моя книга'], '我___书', '的'], ['Счётное слово 个', 'Между числом и существительным нужно счётное слово, самое частое — 个 (gè).', ['一个人', 'один человек'], '一___人', '个'], ['Завершённость 了', '了 (le) после глагола — действие завершено.', ['我吃了。', 'Я поел.'], '我吃___。', '了'], ['在 — «находиться»', '在 (zài) + место: 我在家 — я дома.', ['我在家。', 'Я дома.'], '我___家。', '在'], ['很 + прилагательное', 'Прилагательное-сказуемое обычно идёт с 很 (hěn).', ['她很漂亮。', 'Она красивая.'], '她___漂亮。', '很']],
  fr: [['être', 'je suis, tu es, il est, nous sommes, vous êtes, ils sont.', ['Je suis fatigué.', 'Я устал.'], 'Je ___ fatigué.', 'suis'], ['avoir', "j'ai, tu as, il a, nous avons, vous avez, ils ont.", ["J'ai un chat.", 'У меня есть кошка.'], "J'___ un chat.", 'ai'], ['Артикли le / la / les', 'le — м. р., la — ж. р., les — мн. ч.; перед гласной — l’.', ['la maison, le livre', 'дом, книга'], '___ maison', 'la'], ['Глаголы на -er', 'parler: je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.', ['Nous parlons français.', 'Мы говорим по-французски.'], 'Nous ___ (parler) français.', 'parlons'], ['Отрицание ne … pas', 'Глагол «обнимают» ne и pas.', ['Je ne parle pas allemand.', 'Я не говорю по-немецки.'], "Je ___ parle pas allemand.", 'ne'], ['Ближайшее будущее', 'aller + инфинитив: je vais manger.', ['Je vais manger.', 'Я собираюсь поесть.'], 'Je ___ manger.', 'vais'], ['Множественное число', 'Обычно + -s (на слух не меняется).', ['des livres', 'книги'], 'livre → ___', 'livres'], ['Вопрос est-ce que', 'Est-ce que + утверждение = вопрос.', ['Est-ce que tu aimes le café ?', 'Ты любишь кофе?'], '___ que tu aimes le café ?', 'est-ce']],
  it: [['essere', 'io sono, tu sei, lui è, noi siamo, voi siete, loro sono.', ['Io sono stanco.', 'Я устал.'], 'Io ___ stanco.', 'sono'], ['avere', 'io ho, tu hai, lui ha, noi abbiamo.', ['Io ho un gatto.', 'У меня есть кот.'], 'Io ___ un gatto.', 'ho'], ['Артикли il / la', 'il — м. р., la — ж. р.; lo — перед s+согласная, z.', ['la casa, il libro', 'дом, книга'], '___ casa', 'la'], ['Глаголы на -are', 'parlare: parlo, parli, parla, parliamo, parlate, parlano.', ['Tu parli italiano.', 'Ты говоришь по-итальянски.'], 'Tu ___ (parlare) italiano.', 'parli'], ['Множественное число', 'м. р. -o → -i, ж. р. -a → -e.', ['libri, case', 'книги, дома'], 'libro → ___', 'libri'], ['Отрицание non', 'non ставится перед глаголом.', ['Non parlo tedesco.', 'Я не говорю по-немецки.'], 'Io ___ parlo tedesco.', 'non'], ['piacere', 'Mi piace + ед. ч., mi piacciono + мн. ч.', ['Mi piace il caffè.', 'Мне нравится кофе.'], 'Mi ___ il caffè.', 'piace'], ['passato prossimo', 'avere/essere + причастие: ho mangiato.', ['Ho mangiato.', 'Я поел.'], 'Io ___ mangiato.', 'ho']]
};
const SRS = [1, 3, 7, 14, 30, 60]; // интервалы повторения, дни

function ensureLang() { state.lang ||= null; }
const L$ = () => state.lang;
const wordsArr = () => Object.values(L$()?.words || {});
const learnedCount = () => wordsArr().filter(w => w.learned).length;
function langDaily() {
  const l = L$(), d = today(), left = Math.max(1, diff(d, l.end) + 1), remain = Math.max(0, l.target - learnedCount());
  const learnedToday = wordsArr().filter(w => w.learned === d).length;
  const perDay = Math.ceil((remain + learnedToday) / left);
  return { perDay, learnedToday, remain, left, due: wordsArr().filter(w => w.learned && w.learned !== d && w.due <= d) };
}
function newWordsToday() {
  const { perDay, learnedToday } = langDaily(), need = Math.max(0, perDay - learnedToday);
  return wordsArr().filter(w => !w.learned).slice(0, need);
}
function startLang(code, target, days = 30) {
  const t = today(), end = addDays(t, Math.max(1, days) - 1), words = {};
  CORE[code].forEach((w, i) => { words[code + i] = { id: code + i, w, tr: RU_CORE[i], lvl: 0, due: t, learned: null }; });
  const gid = 'g' + Date.now().toString(36);
  state.goals.push({ id: gid, type: 'count', title: `Выучить ${target} слов (${LANGS[code].n.toLowerCase()})`, target, unit: 'слов', start: t, end, steps: [], log: {}, langGoal: true });
  state.lang = { lang: code, target, start: t, end, words, grammar: {}, quiz: {}, goalId: gid };
  save();
}
function syncLangGoal() {
  const l = L$(); if (!l) return; const g = state.goals.find(x => x.id === l.goalId); if (!g) return;
  const d = today(), n = wordsArr().filter(w => w.learned === d).length;
  const lg = (g.log[d] ||= { value: 0, done: [] }); lg.value = n; if (n > 0 && !lg.done.includes('main')) lg.done.push('main');
}
function speak(text) {
  try { let t = text.replace(/\s*\(.*?\)\s*/g, ''); if (L$().lang === 'zh') t = (t.match(/[\u4e00-\u9fff]+/g) || [t]).join(''); const u = new SpeechSynthesisUtterance(t); u.lang = LANGS[L$().lang].tts; u.rate = 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { toast('Озвучка недоступна на этом устройстве'); }
}
let langMode = null, reveal = {};
function wordCard(w, kind) {
  const open = reveal[w.id];
  return `<div class="wcard"><div class="wtop"><b class="word">${esc(w.w)}</b><button class="x small" data-act="lsay" data-id="${w.id}" aria-label="Произнести">🔊</button></div>
    ${open ? `<div class="wtr">${esc(w.tr)}</div>` : `<button class="chip" data-act="lreveal" data-id="${w.id}">Показать перевод</button>`}
    <div class="btnrow" style="margin-top:10px">${kind === 'new' ? `<button class="btn small hot" data-act="llearn" data-id="${w.id}">Запомнил ✓</button>` : `<button class="btn small hot" data-act="lok" data-id="${w.id}">Помню</button><button class="btn small light" data-act="lfail" data-id="${w.id}">Забыл</button>`}</div></div>`;
}
function viewLang() {
  ensureLang(); const l = L$();
  if (!l || langMode === 'setup') return `<div class="panel"><h2>ИИ-репетитор</h2><p>Выбери язык и цель — я разобью её на ежедневные задания: новые слова, повторение, грамматика и мини-тест. Прогресс попадёт в «Цели».</p>
    <label class="f">Язык</label><div class="langs">${Object.entries(LANGS).map(([k, x]) => `<button class="langopt ${l?.lang === k ? 'on' : ''}" data-act="lpick" data-v="${k}"><span>${x.f}</span>${x.n}</button>`).join('')}</div>
    <label class="f">Сколько слов выучить</label><div class="chips">${[50, 100, 300, 500, 1000].map(n => `<button class="chip ${langPickN === n ? 'on' : ''}" data-act="lnum" data-v="${n}">${n}</button>`).join('')}</div>
    <input class="inp" id="lnum-own" type="number" min="5" max="10000" inputmode="numeric" placeholder="или своё число слов" value="${[50, 100, 300, 500, 1000].includes(langPickN) ? '' : langPickN}" style="margin-top:8px">
    <label class="f">За какой срок</label><div class="chips">${[[7, 'неделя'], [14, '2 недели'], [30, 'месяц'], [90, '3 месяца'], [180, 'полгода']].map(([n, t]) => `<button class="chip ${langPickD === n ? 'on' : ''}" data-act="ldays" data-v="${n}">${t}</button>`).join('')}</div>
    <input class="inp" id="ldays-own" type="number" min="1" max="730" inputmode="numeric" placeholder="или своё число дней" value="${[7, 14, 30, 90, 180].includes(langPickD) ? '' : langPickD}" style="margin-top:8px">
    <p class="hint">≈ ${Math.ceil(langPickN / langPickD)} новых слов в день${langPickN / langPickD > 40 ? ' — это очень много, лучше взять срок подольше' : ''}.</p>
    <div class="btnrow"><button class="btn hot" data-act="lstart">Начать</button>${l ? '<button class="btn light" data-act="lcancel">Отмена</button>' : ''}</div>
    ${l ? '<p class="hint">При смене языка текущий прогресс по словам будет заменён.</p>' : ''}</div>`;
  return tutorView(l);
}
let langPickN = 500, langPickD = 30, langPick = 'en';
function langPrompt() {
  const l = L$(), L = LANGS[l.lang], known = wordsArr().map(w => w.w).slice(-150);
  const g = GRAMMAR[l.lang][(diff(l.start, today()) % GRAMMAR[l.lang].length + GRAMMAR[l.lang].length) % GRAMMAR[l.lang].length][0];
  return `Ты мой репетитор (${L.n.toLowerCase()} язык). Моя цель — выучить ${l.target} слов до ${human(l.end)}, сейчас выучено ${learnedCount()}.
1) Дай 50 новых полезных слов уровня A1–A2 по темам: быт, работа, путешествия, еда, эмоции. Не повторяй: ${known.join(', ')}.
Слова верни ТОЛЬКО одним JSON-массивом: [{"w":"слово на языке (с артиклем, если есть${l.lang === 'zh' ? '; иероглифы + пиньинь через пробел' : ''})","tr":"перевод на русский"}]
2) После JSON дай 3 коротких упражнения на тему «${g}» с ответами в конце.`;
}
function addWords(arr) {
  const l = L$(), have = new Set(wordsArr().map(w => w.w.toLowerCase())); let n = 0;
  for (const x of arr || []) { if (!x || !x.w || !x.tr || have.has(String(x.w).toLowerCase())) continue; const id = 'u' + Date.now().toString(36) + n; l.words[id] = { id, w: String(x.w).slice(0, 60), tr: String(x.tr).slice(0, 80), lvl: 0, due: today(), learned: null }; have.add(String(x.w).toLowerCase()); n++; }
  save(); return n;
}
function langClick(act, el) {
  const l = L$(), d = today(), w = l?.words?.[el.dataset.id];
  switch (act) {
    case 'lpick': langPick = el.dataset.v; document.querySelectorAll('.langopt').forEach(b => b.classList.toggle('on', b.dataset.v === langPick)); return true;
    case 'lnum': langPickN = +el.dataset.v; render(); return true;
    case 'ldays': langPickD = +el.dataset.v; render(); return true;
    case 'lsetup': langMode = 'setup'; langPick = l?.lang || 'en'; render(); return true;
    case 'lcancel': langMode = null; render(); return true;
    case 'lstart': if (l) { const g = state.goals.find(x => x.id === l.goalId); if (g) state.goals = state.goals.filter(x => x !== g); } startLang(langPick, langPickN, langPickD); langMode = null; toast('План создан — он появился и в «Целях»'); render(); return true;
    case 'lsay': speak(w.w); return true;
    case 'lreveal': reveal[el.dataset.id] = true; render(); return true;
    case 'llearn': w.learned = d; w.lvl = 1; w.due = addDays(d, SRS[0]); syncLangGoal(); save(); render(); return true;
    case 'lok': w.lvl = Math.min(SRS.length, (w.lvl || 1) + 1); w.due = addDays(d, SRS[w.lvl - 1]); delete reveal[w.id]; save(); render(); return true;
    case 'lfail': w.lvl = 1; w.due = addDays(d, 1); delete reveal[w.id]; save(); render(); return true;
    case 'gshow': l.grammar[d] = true; save(); render(); return true;
    case 'lq': l.quiz[d + el.dataset.id] = el.dataset.v; save(); render(); return true;
    case 'lwpaste': textSheet('Вставь ответ ИИ со словами', '', raw => { let arr = []; try { const m = raw.match(/\[[\s\S]*?\]/); arr = JSON.parse(m ? m[0] : raw); } catch (e) {} const n = addWords(arr); closeSheet(); toast(n ? `Добавлено слов: ${n}` : 'Не нашёл слов — нужен JSON-массив из ответа ИИ'); render(); }); return true;
    case 'lwadd': $('#sheet').innerHTML = `<div class="sheet-h"><h2>Своё слово</h2><button class="x" data-act="close">×</button></div><form id="wform"><label class="f">Слово (${LANGS[l.lang].n.toLowerCase()})</label><input class="inp" id="wf-w" required><label class="f">Перевод</label><input class="inp" id="wf-t" required><div class="btnrow"><button class="btn hot wide" type="submit">Добавить</button></div></form>`; $('#scrim').classList.add('open'); return true;
  }
  return false;
}
document.addEventListener('submit', e => {
  if (e.target.id === 'wform') { e.preventDefault(); const n = addWords([{ w: $('#wf-w').value.trim(), tr: $('#wf-t').value.trim() }]); closeSheet(); toast(n ? 'Слово добавлено' : 'Такое слово уже есть'); render(); }
  const f = e.target.closest('.gram-f'); if (!f) return; e.preventDefault();
  const l = L$(), d = today(), g = GRAMMAR[l.lang][(diff(l.start, d) % GRAMMAR[l.lang].length + GRAMMAR[l.lang].length) % GRAMMAR[l.lang].length];
  const ok = norm(f.querySelector('input').value) === norm(g[4]);
  if (ok) { l.grammar[d] = true; save(); toast('Верно! 🎉'); render(); } else toast('Пока не то — попробуй ещё или посмотри ответ');
});

document.addEventListener('change', e => {
  if (e.target.id === 'lnum-own' && +e.target.value >= 5) { langPickN = Math.min(10000, Math.round(+e.target.value)); render(); }
  if (e.target.id === 'ldays-own' && +e.target.value >= 1) { langPickD = Math.min(730, Math.round(+e.target.value)); render(); }
});
