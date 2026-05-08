const CATEGORIES = [
  { id: 'traffic',   emoji: '🚗', name: '交通・渋滞',     color: '#ef4444' },
  { id: 'shop',      emoji: '🏪', name: '商業施設・誘致',  color: '#f59e0b' },
  { id: 'nature',    emoji: '🏞️', name: '環境・景観',      color: '#10b981' },
  { id: 'child',     emoji: '👶', name: '子育て・教育',    color: '#ec4899' },
  { id: 'medical',   emoji: '🏥', name: '医療・福祉',      color: '#6366f1' },
  { id: 'transport', emoji: '🚃', name: '公共交通',        color: '#0ea5e9' },
  { id: 'infra',     emoji: '🏠', name: '住環境・インフラ', color: '#8b5cf6' },
  { id: 'idea',      emoji: '💡', name: 'その他提案',      color: '#64748b' },
];

const STORAGE_KEY = 'yonago_voice_posts';
const AGREED_KEY = 'yonago_voice_agreed';

let map;
let markers = {};
let posts = [];
let agreedSet = new Set();
let activeFilter = 'all';
let pendingLatLng = null;
let selectedCategory = null;

function init() {
  loadData();
  initMap();
  initUI();
  renderFilterButtons();
  renderPosts();
  renderMarkers();

  if (posts.length === 0) {
    loadSampleData();
    renderPosts();
    renderMarkers();
  }
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView([35.428, 133.331], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  map.on('click', function(e) {
    pendingLatLng = e.latlng;
    openPostForm(e.latlng);
  });
}

function initUI() {
  document.getElementById('toggleDashboard').addEventListener('click', openDashboard);
  document.getElementById('closeDashboard').addEventListener('click', closeDashboard);
  document.getElementById('dashboardOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeDashboard();
  });
  document.getElementById('cancelPost').addEventListener('click', closePostForm);
  document.getElementById('postFormOverlay').addEventListener('click', function(e) {
    if (e.target === this) closePostForm();
  });
  document.getElementById('submitPost').addEventListener('click', submitPost);

  const msgInput = document.getElementById('message');
  msgInput.addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length + '/200';
  });

  const catSelect = document.getElementById('categorySelect');
  CATEGORIES.forEach(function(cat) {
    const btn = document.createElement('div');
    btn.className = 'category-option';
    btn.dataset.category = cat.id;
    btn.innerHTML = '<span class="cat-emoji">' + cat.emoji + '</span>' + cat.name;
    btn.addEventListener('click', function() {
      catSelect.querySelectorAll('.category-option').forEach(function(el) { el.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedCategory = cat.id;
    });
    catSelect.appendChild(btn);
  });
}

function renderFilterButtons() {
  var container = document.getElementById('categoryFilter');
  container.innerHTML = '<button class="filter-btn active" data-category="all">すべて</button>';
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat.id;
    btn.textContent = cat.emoji + ' ' + cat.name;
    container.appendChild(btn);
  });

  container.addEventListener('click', function(e) {
    var btn = e.target.closest('.filter-btn');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    activeFilter = btn.dataset.category;
    renderPosts();
    renderMarkers();
  });
}

function openPostForm(latlng) {
  document.getElementById('formLocation').textContent =
    '📍 緯度: ' + latlng.lat.toFixed(5) + ' / 経度: ' + latlng.lng.toFixed(5);
  document.getElementById('nickname').value = '';
  document.getElementById('message').value = '';
  document.getElementById('charCount').textContent = '0/200';
  selectedCategory = null;
  document.querySelectorAll('.category-option').forEach(function(el) { el.classList.remove('selected'); });
  document.getElementById('postFormOverlay').classList.add('active');
}

function closePostForm() {
  document.getElementById('postFormOverlay').classList.remove('active');
  pendingLatLng = null;
  selectedCategory = null;
}

function submitPost() {
  var msg = document.getElementById('message').value.trim();
  if (!selectedCategory) {
    alert('カテゴリを選択してください');
    return;
  }
  if (!msg) {
    alert('声を入力してください');
    return;
  }

  var post = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    lat: pendingLatLng.lat,
    lng: pendingLatLng.lng,
    category: selectedCategory,
    nickname: document.getElementById('nickname').value.trim() || '匿名さん',
    message: msg,
    agrees: 0,
    createdAt: new Date().toISOString(),
  };

  posts.unshift(post);
  saveData();
  closePostForm();
  renderPosts();
  renderMarkers();
  document.getElementById('mapHint').style.display = 'none';
}

function createMarkerIcon(cat) {
  return L.divIcon({
    className: 'custom-marker',
    html: '<div style="background:' + cat.color + ';width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">' + cat.emoji + '</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

function renderMarkers() {
  Object.values(markers).forEach(function(m) { map.removeLayer(m); });
  markers = {};

  var filtered = activeFilter === 'all' ? posts : posts.filter(function(p) { return p.category === activeFilter; });

  filtered.forEach(function(post) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    if (!cat) return;

    var marker = L.marker([post.lat, post.lng], { icon: createMarkerIcon(cat) }).addTo(map);

    var popupHtml = '<div class="popup-content">' +
      '<span class="popup-category" style="background:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>' +
      '<p class="popup-message">' + escapeHtml(post.message) + '</p>' +
      '<span class="popup-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '<br><button class="popup-agree-btn" onclick="toggleAgree(\'' + post.id + '\')">' +
      '👍 賛同 <span id="popup-agree-' + post.id + '">' + post.agrees + '</span></button>' +
      '</div>';

    marker.bindPopup(popupHtml);
    markers[post.id] = marker;
  });
}

function renderPosts() {
  var container = document.getElementById('postList');
  var filtered = activeFilter === 'all' ? posts : posts.filter(function(p) { return p.category === activeFilter; });

  document.getElementById('postCount').textContent = filtered.length + '件';

  if (filtered.length === 0) {
    container.innerHTML = '<div class="post-list-empty">まだ投稿がありません。<br>地図をクリックして最初の声を投稿しよう！</div>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach(function(post) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    if (!cat) return;

    var item = document.createElement('div');
    item.className = 'post-item';
    item.innerHTML =
      '<div class="post-item-header">' +
        '<span class="post-category-badge" style="background:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>' +
        '<span class="post-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '</div>' +
      '<p class="post-message">' + escapeHtml(post.message) + '</p>' +
      '<div class="post-footer">' +
        '<span class="post-date">' + formatDate(post.createdAt) + '</span>' +
        '<div class="post-agree">' +
          '<button class="btn-agree ' + (agreedSet.has(post.id) ? 'agreed' : '') + '" data-id="' + post.id + '">' +
            '👍 <span class="agree-count">' + post.agrees + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    item.addEventListener('click', function(e) {
      if (e.target.closest('.btn-agree')) return;
      if (markers[post.id]) {
        map.setView([post.lat, post.lng], 16);
        markers[post.id].openPopup();
      }
    });

    var agreeBtn = item.querySelector('.btn-agree');
    agreeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleAgree(post.id);
    });

    container.appendChild(item);
  });
}

function toggleAgree(postId) {
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;

  if (agreedSet.has(postId)) {
    agreedSet.delete(postId);
    post.agrees = Math.max(0, post.agrees - 1);
  } else {
    agreedSet.add(postId);
    post.agrees += 1;
  }

  saveData();
  renderPosts();

  var popupEl = document.getElementById('popup-agree-' + postId);
  if (popupEl) popupEl.textContent = post.agrees;
}

function openDashboard() {
  renderDashboard();
  document.getElementById('dashboardOverlay').classList.add('active');
}

function closeDashboard() {
  document.getElementById('dashboardOverlay').classList.remove('active');
}

function renderDashboard() {
  renderCategoryChart();
  renderTopRanking();
  renderHotTopics();
}

function renderCategoryChart() {
  var container = document.getElementById('categoryChart');
  var counts = {};
  CATEGORIES.forEach(function(c) { counts[c.id] = 0; });
  posts.forEach(function(p) { if (counts[p.category] !== undefined) counts[p.category]++; });

  var max = Math.max.apply(null, Object.values(counts).concat([1]));

  container.innerHTML = '';
  CATEGORIES.forEach(function(cat) {
    var count = counts[cat.id];
    var pct = (count / max * 100).toFixed(0);
    var row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML =
      '<span class="chart-label">' + cat.emoji + ' ' + cat.name + '</span>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="width:' + pct + '%;background:' + cat.color + '"></div></div>' +
      '<span class="chart-value">' + count + '</span>';
    container.appendChild(row);
  });
}

function renderTopRanking() {
  var container = document.getElementById('topRanking');
  var sorted = posts.slice().sort(function(a, b) { return b.agrees - a.agrees; });
  var top5 = sorted.slice(0, 5);

  if (top5.length === 0) {
    container.innerHTML = '<div class="empty-state">まだ投稿がありません</div>';
    return;
  }

  container.innerHTML = '';
  top5.forEach(function(post) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    var li = document.createElement('li');
    li.innerHTML =
      '<div class="rank-content">' +
        '<span class="rank-message">' + escapeHtml(post.message) + '</span>' +
        '<span class="rank-meta">' + (cat ? cat.emoji + ' ' + cat.name : '') +
          ' | 👍 ' + post.agrees + ' | ' + escapeHtml(post.nickname) + '</span>' +
      '</div>';
    container.appendChild(li);
  });
}

function renderHotTopics() {
  var container = document.getElementById('hotTopics');

  var areaMap = {};
  posts.forEach(function(post) {
    var areaKey = Math.round(post.lat * 100) / 100 + ',' + Math.round(post.lng * 100) / 100;
    if (!areaMap[areaKey]) {
      areaMap[areaKey] = { lat: post.lat, lng: post.lng, posts: [], totalAgrees: 0 };
    }
    areaMap[areaKey].posts.push(post);
    areaMap[areaKey].totalAgrees += post.agrees;
  });

  var areas = Object.values(areaMap)
    .filter(function(a) { return a.posts.length >= 1; })
    .sort(function(a, b) { return b.totalAgrees - a.totalAgrees || b.posts.length - a.posts.length; })
    .slice(0, 4);

  if (areas.length === 0) {
    container.innerHTML = '<div class="empty-state">投稿が集まるとホットトピックが表示されます</div>';
    return;
  }

  container.innerHTML = '';
  areas.forEach(function(area) {
    var topPost = area.posts.sort(function(a, b) { return b.agrees - a.agrees; })[0];
    var cat = CATEGORIES.find(function(c) { return c.id === topPost.category; });
    var catCounts = {};
    area.posts.forEach(function(p) {
      var c = CATEGORIES.find(function(ct) { return ct.id === p.category; });
      if (c) catCounts[c.name] = (catCounts[c.name] || 0) + 1;
    });
    var topCat = Object.entries(catCounts).sort(function(a, b) { return b[1] - a[1]; })[0];

    var card = document.createElement('div');
    card.className = 'hot-topic-card';
    card.innerHTML =
      '<div class="hot-topic-area">' + (cat ? cat.emoji : '') + ' ' + (topCat ? topCat[0] : '') + '</div>' +
      '<div class="hot-topic-summary">' + escapeHtml(topPost.message) + '</div>' +
      '<div class="hot-topic-count">' + area.posts.length + '件の声 | 👍 ' + area.totalAgrees + '</div>';
    container.appendChild(card);
  });
}

function loadSampleData() {
  var samples = [
    {
      lat: 35.4282, lng: 133.3320,
      category: 'traffic',
      nickname: '米子駅ユーザー',
      message: '米子駅前の朝の渋滞がひどい。特に8時台は角盤町方面への信号待ちが長すぎる。右折レーンの延長か、時差式信号の導入を検討してほしい。',
      agrees: 24,
    },
    {
      lat: 35.4410, lng: 133.3580,
      category: 'shop',
      nickname: '皆生住民',
      message: '皆生温泉エリアにおしゃれなカフェや雑貨屋がほしい！観光客だけでなく地元の人も楽しめるお店があると、もっとエリアが活性化すると思う。',
      agrees: 31,
    },
    {
      lat: 35.4350, lng: 133.3250,
      category: 'child',
      nickname: '子育てママ',
      message: '湊山公園の遊具が古くなっている。小さい子が安心して遊べる新しい遊具を設置してほしい。柵も低くて少し心配。',
      agrees: 18,
    },
    {
      lat: 35.4230, lng: 133.3150,
      category: 'transport',
      nickname: '通勤者A',
      message: 'だんだんバスの本数をもう少し増やしてほしい。特に夕方18時以降の便が少なくて、仕事帰りに使えない。',
      agrees: 15,
    },
    {
      lat: 35.4300, lng: 133.3400,
      category: 'nature',
      nickname: '散歩好き',
      message: '加茂川沿いの遊歩道をもっと整備してほしい。桜並木は素晴らしいので、ベンチや照明を増やして夜も安心して歩ける道にしてほしい。',
      agrees: 22,
    },
    {
      lat: 35.4195, lng: 133.3280,
      category: 'medical',
      nickname: 'シニア世代',
      message: '弓ヶ浜エリアに内科のクリニックが少ない。高齢者が多い地域なので、もう少し医療アクセスを改善してほしい。',
      agrees: 12,
    },
    {
      lat: 35.4320, lng: 133.3180,
      category: 'infra',
      nickname: '夜道が不安',
      message: '後藤駅周辺の住宅街は街灯が少なくて夜道が暗い。防犯面でも心配なので、LED街灯を増設してほしい。',
      agrees: 9,
    },
    {
      lat: 35.4380, lng: 133.3450,
      category: 'idea',
      nickname: 'まちづくり応援',
      message: '米子城跡の活用をもっと推進してほしい！ライトアップイベントや、お城マルシェなど、市民が集まれるイベントを定期開催してはどうか。',
      agrees: 27,
    },
    {
      lat: 35.4260, lng: 133.3350,
      category: 'shop',
      nickname: '学生さん',
      message: '角盤町に大きめの書店がほしい。最近どんどん本屋が減っていて寂しい。カフェ併設の書店なら若い人も集まると思う。',
      agrees: 20,
    },
    {
      lat: 35.4450, lng: 133.3500,
      category: 'transport',
      nickname: '観光推進派',
      message: '米子空港からのリムジンバス、皆生温泉経由便をもっと増やしてほしい。観光客にとって温泉直行便があると便利。',
      agrees: 14,
    },
  ];

  var now = Date.now();
  samples.forEach(function(s, i) {
    posts.push({
      id: 'sample_' + i,
      lat: s.lat,
      lng: s.lng,
      category: s.category,
      nickname: s.nickname,
      message: s.message,
      agrees: s.agrees,
      createdAt: new Date(now - (i * 3600000 * 6)).toISOString(),
    });
  });

  saveData();
}

function loadData() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) posts = JSON.parse(stored);
    var agreed = localStorage.getItem(AGREED_KEY);
    if (agreed) agreedSet = new Set(JSON.parse(agreed));
  } catch(e) {
    posts = [];
    agreedSet = new Set();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  localStorage.setItem(AGREED_KEY, JSON.stringify(Array.from(agreedSet)));
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoStr) {
  var d = new Date(isoStr);
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', init);
