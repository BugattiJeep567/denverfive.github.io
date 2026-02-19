/* =============================================
   DENVER NEWS STATION 5 — APP LOGIC
   ============================================= */

let articles = [];
let currentImageData = null;
let currentImageName = '';

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  loadArticles();
  renderHomepage();
  setupDragDrop();
});

function updateDate() {
  const el = document.getElementById('headerDate');
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.innerHTML = now.toLocaleDateString('en-US', opts).toUpperCase() + '<br>' + now.toLocaleTimeString('en-US');
  setInterval(() => {
    const n = new Date();
    el.innerHTML = n.toLocaleDateString('en-US', opts).toUpperCase() + '<br>' + n.toLocaleTimeString('en-US');
  }, 1000);
}

// =============================================
// TABS
// =============================================
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  const map = { home: 0, write: 1, apply: 2 };
  if (map[tab] !== undefined) btns[map[tab]].classList.add('active');
}

// =============================================
// LOCAL STORAGE (articles stored as JSON, images as base64)
// =============================================
function loadArticles() {
  try {
    const stored = localStorage.getItem('dns5_articles');
    articles = stored ? JSON.parse(stored) : [];
  } catch(e) {
    articles = [];
  }
}

function saveArticles() {
  try {
    localStorage.setItem('dns5_articles', JSON.stringify(articles));
  } catch(e) {
    // Storage full — warn user
    showMsg('Storage full! Try removing old articles or use smaller images.', 'error');
  }
}

// =============================================
// IMAGE UPLOAD
// =============================================
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  loadImageFile(file);
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    currentImageName = file.name;
    document.getElementById('previewImg').src = currentImageData;
    document.getElementById('imagePreview').style.display = 'block';
    document.getElementById('imageDropZone').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  currentImageData = null;
  currentImageName = '';
  document.getElementById('artImage').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('imageDropZone').style.display = 'block';
}

function setupDragDrop() {
  const zone = document.getElementById('imageDropZone');
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  });
}

// =============================================
// TEXT FORMATTING
// =============================================
function formatText(cmd) {
  document.getElementById('artBody').focus();
  document.execCommand(cmd, false, null);
}

function insertBreak() {
  const editor = document.getElementById('artBody');
  editor.focus();
  document.execCommand('insertParagraph', false, null);
}

// =============================================
// PUBLISH ARTICLE
// =============================================
function publishArticle() {
  const headline = document.getElementById('artHeadline').value.trim();
  const reporter = document.getElementById('artReporter').value.trim();
  const category = document.getElementById('artCategory').value;
  const caption = document.getElementById('artCaption').value.trim();
  const bodyEl = document.getElementById('artBody');
  const bodyHTML = bodyEl.innerHTML.trim();
  const bodyText = bodyEl.innerText.trim();

  if (!headline) { showMsg('Please enter a headline.', 'error'); return; }
  if (!reporter) { showMsg('Please enter a reporter name.', 'error'); return; }
  if (!bodyText) { showMsg('Please write the article body.', 'error'); return; }

  const article = {
    id: Date.now(),
    headline,
    reporter,
    category,
    caption,
    bodyHTML,
    image: currentImageData || null,
    date: new Date().toISOString(),
  };

  articles.unshift(article);
  saveArticles();
  renderHomepage();
  clearForm();
  showMsg('✓ Article published successfully!', 'success');
  setTimeout(() => showTab('home'), 1500);
}

function clearForm() {
  document.getElementById('artHeadline').value = '';
  document.getElementById('artReporter').value = '';
  document.getElementById('artCaption').value = '';
  document.getElementById('artBody').innerHTML = '';
  document.getElementById('artCategory').selectedIndex = 0;
  removeImage();
  document.getElementById('publishMsg').style.display = 'none';
}

function showMsg(text, type) {
  const el = document.getElementById('publishMsg');
  el.textContent = text;
  el.className = 'publish-msg ' + type;
  el.style.display = 'block';
}

// =============================================
// RENDER HOMEPAGE
// =============================================
function renderHomepage() {
  loadArticles();
  const heroSlot = document.getElementById('heroSlot');
  const grid = document.getElementById('newsGrid');

  if (articles.length === 0) {
    heroSlot.innerHTML = `<div class="hero-placeholder"><p>No articles yet. Write your first story!</p></div>`;
    grid.innerHTML = '';
    return;
  }

  // Hero = first article
  const hero = articles[0];
  heroSlot.innerHTML = buildHeroHTML(hero);

  // Rest in grid
  grid.innerHTML = articles.slice(1).map(buildCardHTML).join('');
}

function buildHeroHTML(a) {
  const dateStr = formatDate(a.date);
  const imgBlock = a.image
    ? `<img class="hero-img" src="${a.image}" alt="${escapeHTML(a.caption || a.headline)}">`
    : `<div class="hero-no-img"><div class="big-5">5</div></div>`;
  const excerpt = extractExcerpt(a.bodyHTML, 200);
  return `
    <div class="hero-article" onclick="openArticle(${a.id})">
      ${imgBlock}
      <div class="hero-content">
        <span class="article-tag">${escapeHTML(a.category)}</span>
        <h2>${escapeHTML(a.headline)}</h2>
        <div class="article-meta">BY ${escapeHTML(a.reporter).toUpperCase()} &nbsp;|&nbsp; ${dateStr}</div>
        <p class="hero-excerpt">${excerpt}</p>
        <button class="read-more-btn" onclick="event.stopPropagation();openArticle(${a.id})">READ MORE →</button>
      </div>
    </div>`;
}

function buildCardHTML(a) {
  const dateStr = formatDate(a.date);
  const excerpt = extractExcerpt(a.bodyHTML, 120);
  const imgBlock = a.image
    ? `<img class="card-img" src="${a.image}" alt="${escapeHTML(a.caption || a.headline)}">`
    : `<div class="card-no-img">5</div>`;
  return `
    <div class="article-card" onclick="openArticle(${a.id})">
      ${imgBlock}
      <div class="card-body">
        <span class="article-tag">${escapeHTML(a.category)}</span>
        <h3>${escapeHTML(a.headline)}</h3>
        <div class="article-meta">BY ${escapeHTML(a.reporter).toUpperCase()} &nbsp;|&nbsp; ${dateStr}</div>
        <p class="card-excerpt">${excerpt}</p>
      </div>
    </div>`;
}

function openArticle(id) {
  const a = articles.find(x => x.id === id);
  if (!a) return;
  const dateStr = formatDate(a.date);
  const imgBlock = a.image
    ? `<img class="modal-img" src="${a.image}" alt="${escapeHTML(a.caption || a.headline)}">
       ${a.caption ? `<p class="modal-caption" style="padding:8px 40px 0;margin:0;">${escapeHTML(a.caption)}</p>` : ''}`
    : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="position:relative;">
      <button class="modal-close" onclick="closeModal(this)">✕</button>
      <div class="modal-header">${imgBlock}</div>
      <div class="modal-content">
        <span class="article-tag">${escapeHTML(a.category)}</span>
        <h2>${escapeHTML(a.headline)}</h2>
        <div class="article-meta">BY ${escapeHTML(a.reporter).toUpperCase()} &nbsp;|&nbsp; ${dateStr}</div>
        <div class="modal-body">${a.bodyHTML}</div>
      </div>
    </div>`;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

function closeModal(btn) {
  btn.closest('.modal-overlay').remove();
}

// =============================================
// APPLICATION FORM
// =============================================
function submitApplication(e) {
  e.preventDefault();
  document.getElementById('applyForm').style.display = 'none';
  document.getElementById('applySuccess').style.display = 'block';
}

function resetApplication() {
  document.getElementById('applyForm').reset();
  document.getElementById('applyForm').style.display = 'block';
  document.getElementById('applySuccess').style.display = 'none';
}

// =============================================
// HELPERS
// =============================================
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function extractExcerpt(html, maxLen) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.innerText || tmp.textContent || '';
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '...' : text;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Update ticker with article headlines
function updateTicker() {
  const ticker = document.getElementById('breakingTicker');
  if (articles.length > 0) {
    const headlines = articles.map(a => a.headline).join(' &nbsp;&nbsp;•&nbsp;&nbsp; ');
    ticker.innerHTML = headlines;
  }
}

// Refresh ticker when articles change
const origSaveArticles = saveArticles;
