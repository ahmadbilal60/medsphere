/* ═══════════════════════════════════════
   MedSphere — د اپ دماغ
   ═══════════════════════════════════════ */

let DATA = [];
let LANG = localStorage.getItem('lang') || 'ps';
let CAT = 'ټول';

const $ = id => document.getElementById(id);

// ژباړې
const T = {
  ps: {
    search: 'لټون... د ناروغۍ یا درملو نوم ولیکه',
    all: 'ټول',
    back: '← بیرته',
    disc: '⚠️ دا معلومات یوازې د پوهاوي لپاره دي او د ډاکټر مشوره نه بدلوي. هر وخت د خپل ډاکټر سره مشوره وکړه.',
    none: 'هیڅ پیدا نه شو'
  },
  fa: {
    search: 'جستجو... نام بیماری یا دارو را بنویسید',
    all: 'همه',
    back: '← بازگشت',
    disc: '⚠️ این معلومات فقط برای آگاهی است و جای مشوره داکتر را نمی‌گیرد. همیشه با داکتر خود مشوره کنید.',
    none: 'چیزی پیدا نشد'
  }
};

function t(k) { return T[LANG][k]; }

// د معلوماتو راوړل
async function load() {
  try {
    const res = await fetch('articles.json');
    DATA = await res.json();
    applyLang();
    buildCats();
    render();
  } catch (e) {
    $('list').innerHTML = '<p class="empty">د معلوماتو په راوړلو کې ستونزه</p>';
  }
}

// ژبه بدلول
function applyLang() {
  $('search').placeholder = t('search');
  $('backBtn').textContent = t('back');
  document.querySelector('.disclaimer').textContent = t('disc');
  document.documentElement.lang = LANG === 'ps' ? 'ps' : 'fa';
  document.documentElement.dir = 'rtl';
  $('langBtn').textContent = LANG === 'ps' ? 'دری' : 'پښتو';
}

// کټګوري جوړول
function buildCats() {
  const cats = [t('all'), ...new Set(DATA.map(a => a.cat[LANG]))];
  $('cats').innerHTML = cats.map(c =>
    `<button class="${c === CAT ? 'active' : ''}" data-c="${c}">${c}</button>`
  ).join('');
  $('cats').querySelectorAll('button').forEach(b => {
    b.onclick = () => { CAT = b.dataset.c; buildCats(); render(); };
  });
}

// لیست ښودل
function render() {
  const q = $('search').value.trim().toLowerCase();
  const list = DATA.filter(a => {
    const okCat = CAT === t('all') || a.cat[LANG] === CAT;
    const okQ = !q ||
      a.title[LANG].toLowerCase().includes(q) ||
      a.title.ps.toLowerCase().includes(q) ||
      a.title.fa.toLowerCase().includes(q) ||
      a.summary[LANG].toLowerCase().includes(q);
    return okCat && okQ;
  });

  if (!list.length) {
    $('list').innerHTML = `<p class="empty">${t('none')}</p>`;
    return;
  }

  $('list').innerHTML = list.map(a => `
    <div class="card" data-i="${DATA.indexOf(a)}" data-cat="${a.cat[LANG]}">
      <h3>${a.title[LANG]}</h3>
      <span>${a.cat[LANG]}</span>
      <p>${a.summary[LANG]}</p>
    </div>
  `).join('');

  $('list').querySelectorAll('.card').forEach(c => {
    c.onclick = () => openArticle(+c.dataset.i);
  });
}

// مقاله پرانیستل
function openArticle(i) {
  const a = DATA[i];
  $('rTitle').textContent = a.title[LANG];
  $('rBody').innerHTML = a.body[LANG];
  $('reader').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// پیښې
$('backBtn').onclick = () => $('reader').classList.add('hidden');
$('search').oninput = render;
$('langBtn').onclick = () => {
  LANG = LANG === 'ps' ? 'fa' : 'ps';
  localStorage.setItem('lang', LANG);
  CAT = t('all');
  applyLang();
  buildCats();
  render();
};

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

load();
