'use strict';
/* =========================================================
   Фото со свободной лицензией из Wikimedia Commons / Википедии.
   f: — конкретный файл на Commons, w: — главное фото статьи Википедии (ru:/en:).
   В запрос уходит только название файла/статьи — никаких твоих данных.
   Если нет интернета или фото не найдено — показывается нарисованная иллюстрация.
   ========================================================= */
const PHOTOS = {
  // рецепты
  omelet: 'f:Omelett.jpg', 'grechka-chicken': 'w:ru:Гречневая каша', oatmeal: 'f:Banana oatmeal.jpg', syrniki: 'f:Syrniki6.jpg',
  'veg-salad': 'w:en:Israeli salad', 'pasta-chicken': 'w:en:Pasta primavera', 'cabbage-beef': 'w:en:Bigos', 'makarony-flot': 'w:ru:Макароны по-флотски',
  'fried-rice': 'w:en:Fried rice', 'salmon-broccoli': 'w:en:Salmon as food', 'fish-potato': 'w:en:Fish as food', 'tuna-salad': 'w:en:Tuna salad',
  chili: 'w:en:Chili con carne', 'chicken-soup': 'w:en:Chicken soup', shakshuka: 'f:Shakshuka (Unsplash).jpg', 'grechka-mush': 'w:en:Kasha',
  'tvorog-berries': 'w:ru:Творог', 'avocado-toast': 'w:en:Avocado toast', 'chicken-veg': 'w:en:Stir frying', 'pasta-tomato': 'w:en:Spaghetti',
  smoothie: 'w:en:Smoothie', greek: 'f:Greek salad.jpg', 'pork-potato': 'w:en:Home fries', 'spinach-omelet': 'w:en:Frittata',
  borsch: 'f:Borscht served.jpg', shawarma: 'w:en:Shawarma', 'lentil-soup': 'w:en:Lentil soup', bliny: 'f:Масленичные блины 01.jpg',
  caesar: 'w:en:Caesar salad', 'millet-pumpkin': 'w:ru:Пшённая каша', 'turkey-bulgur': 'w:en:Bulgur', 'shrimp-pasta': 'w:en:Shrimp scampi',
  'eggplant-bake': 'w:en:Parmigiana', 'sausage-eggs': 'w:en:Fried egg',
  // уроки (по мотиву)
  fortress: 'w:ru:Петропавловская крепость', sky: 'w:en:Diffuse sky radiation', curvehill: 'w:en:Dunning–Kruger effect', timer2: 'w:en:Stopwatch',
  rocket: 'w:en:Vostok (spacecraft)', growth: 'w:en:Compound interest', forget: 'w:en:Forgetting curve', book: 'w:en:Gutenberg Bible',
  moon: 'w:en:Night sky', road: 'w:en:Appian Way', ticket: 'w:en:Ticket (admission)', battle: 'w:en:Battle of Borodino',
  neurons: 'w:en:Neuron', tomato: 'w:en:Pomodoro Technique', dunes: 'w:en:Silk Road', razor: 'w:en:Razor',
  wall: 'w:en:Fall of the Berlin Wall', light: 'w:en:Sunlight', anchor: 'w:en:Price tag', table: 'w:en:Periodic table',
  loop: '', pyramid: 'w:en:Great Pyramid of Giza', ice: 'w:en:Iceberg', pareto: 'w:en:Pareto principle',
  letters: 'w:en:Glagolitic script', shield: 'w:en:Piggy bank', checklist: 'w:en:Checklist', ship: 'w:en:Victoria (ship)',
  runner: 'w:en:Running', greatwall: 'w:en:Great Wall of China'
};

const PHOTO_CACHE_KEY = 'plan-photos.v1';
let photoCache = {};
try { photoCache = JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY) || '{}'); } catch (e) {}
const savePhotoCache = () => { try { localStorage.setItem(PHOTO_CACHE_KEY, JSON.stringify(photoCache)); } catch (e) {} };
const photosOn = () => state.settings.photos !== false && navigator.onLine !== false;

async function resolvePhoto(spec) {
  if (!spec) return null;
  if (photoCache[spec] !== undefined) return photoCache[spec];
  let res = null;
  if (spec.startsWith('f:')) {
    const name = spec.slice(2).replace(/ /g, '_');
    res = { src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=800`, page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name)}` };
  } else if (spec.startsWith('w:')) {
    const [, lang, ...rest] = spec.split(':'), title = rest.join(':');
    try {
      const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { headers: { accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json(), orig = j.originalimage?.source || '', th = j.thumbnail?.source || '';
        // берём только файлы с Commons (там всё под свободными лицензиями)
        if (orig.includes('/wikipedia/commons/')) {
          const file = decodeURIComponent(orig.split('/').pop());
          const src = th.includes('/thumb/') ? th.replace(/\/\d+px-/, '/800px-') : orig;
          res = { src, page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` };
        }
      }
    } catch (e) { return null; } // сеть недоступна — не кэшируем, попробуем позже
  }
  photoCache[spec] = res; savePhotoCache();
  return res;
}

/* HTML-обёртка: иллюстрация + фото поверх, когда загрузится */
function photoBox(key, fallbackSVG, cls = '') {
  const spec = PHOTOS[key];
  return `<div class="pbox ${cls}">${fallbackSVG}${spec ? `<img alt="" loading="lazy" decoding="async" data-photo="${esc(spec)}" referrerpolicy="no-referrer"><a class="pcredit" data-pcredit target="_blank" rel="noopener noreferrer" hidden>Фото: Wikimedia Commons ↗</a>` : ''}</div>`;
}
function hydratePhotos(root = document) {
  if (!photosOn()) return;
  root.querySelectorAll('img[data-photo]:not([data-done])').forEach(async img => {
    img.dataset.done = '1';
    const info = await resolvePhoto(img.dataset.photo);
    if (!info) return;
    img.onload = () => { img.classList.add('on'); const c = img.parentElement.querySelector('[data-pcredit]'); if (c) { c.href = info.page; c.hidden = false; } };
    img.onerror = () => { img.remove(); };
    img.src = info.src;
  });
}
