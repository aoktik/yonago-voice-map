var SUPABASE_URL = 'https://pqnuxkdfegydungyfnsq.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbnV4a2RmZWd5ZHVuZ3lmbnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyMTgsImV4cCI6MjA5Mzg1MTIxOH0.exGLJP3uiCvLzyOhKrsxeDpXgdQyllBXjL5n8HASB7c';

var CATEGORIES = [
  { id: 'traffic',   emoji: '🚗', name: '交通・渋滞',     color: '#ef4444' },
  { id: 'shop',      emoji: '🏪', name: '商業施設・誘致',  color: '#f59e0b' },
  { id: 'nature',    emoji: '🏞️', name: '環境・景観',      color: '#10b981' },
  { id: 'child',     emoji: '👶', name: '子育て・教育',    color: '#ec4899' },
  { id: 'medical',   emoji: '🏥', name: '医療・福祉',      color: '#6366f1' },
  { id: 'transport', emoji: '🚃', name: '公共交通',        color: '#0ea5e9' },
  { id: 'infra',     emoji: '🏠', name: '住環境・インフラ', color: '#8b5cf6' },
  { id: 'idea',      emoji: '💡', name: 'その他提案',      color: '#64748b' },
];

var VALID_CATEGORY_IDS = CATEGORIES.map(function(c) { return c.id; });

var NG_WORDS = [
  '死ね', '殺す', '殺せ', 'ころす', 'ころせ', 'しね',
  'バカ', 'ばか', '馬鹿', 'アホ', 'あほ', '阿呆',
  'クソ', 'くそ', '糞', 'カス', 'かす', 'ゴミ', 'ごみ',
  'キモい', 'きもい', 'キモ', 'きも', 'ウザい', 'うざい', 'ウザ',
  'ブス', 'ぶす', 'デブ', 'でぶ', 'ハゲ', 'はげ',
  '消えろ', 'きえろ', '失せろ', 'うせろ',
  'ムカつく', 'むかつく', 'イラつく', 'いらつく',
  '嫌い', 'きらい', '大嫌い',
  'クズ', 'くず', '屑',
  'うんこ', 'うんち',
  'ざまあ', 'ザマア', 'ざまぁ',
  'ボケ', 'ぼけ',
  'ガイジ', 'がいじ',
  '障害者', '知障',
  'チビ', 'ちび',
  '在日', '反日',
  '犯罪者',
];

var NG_PATTERNS = [
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+が悪い/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+のせい/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+は無能/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+やめろ/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+辞めろ/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+が嫌/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+なんか/,
  /[ぁ-んァ-ヶ一-龥a-zA-Z]+ごとき/,
  /市[長議].*無能/,
  /市[長議].*やめ/,
  /市[長議].*辞め/,
  /誰.*得/,
  /税金.*無駄/,
  /税金.*泥棒/,
];

var REJECTION_MESSAGES = [
  'この投稿には不適切な表現が含まれています。\n\nこのサイトは米子市をもっと良くするための前向きな声を集める場です。\n「〇〇してほしい」「〇〇があるといいな」のような建設的な表現に書き換えてみてください！',
  'この投稿には個人攻撃や否定的な表現が含まれているようです。\n\n例えば：\n❌「〇〇が悪い」→ ⭕「〇〇を改善してほしい」\n❌「〇〇のせいで…」→ ⭕「〇〇の状況を良くしてほしい」\n\n前向きな声に書き換えて再投稿してください！',
];

let map;
let markers = {};
let posts = [];
let agreedSet = new Set();
let activeFilter = 'all';
let pendingLatLng = null;
let selectedCategory = null;

// Supabase REST API helper
function supabaseRequest(method, path, body) {
  var opts = {
    method: method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(SUPABASE_URL + '/rest/v1/' + path, opts).then(function(res) {
    if (!res.ok) throw new Error('API error: ' + res.status);
    var ct = res.headers.get('content-type');
    if (ct && ct.indexOf('json') !== -1) return res.json();
    return null;
  });
}

async function init() {
  initMap();
  initUI();
  renderFilterButtons();
  await loadData();
  await migrateLocalStorageToSupabase();
  renderPosts();
  renderMarkers();
}

async function migrateLocalStorageToSupabase() {
  var MIGRATION_KEY = 'yonago_voice_migrated';
  if (localStorage.getItem(MIGRATION_KEY)) return;

  var stored = localStorage.getItem('yonago_voice_posts');
  if (!stored) {
    localStorage.setItem(MIGRATION_KEY, 'true');
    return;
  }

  try {
    var localPosts = JSON.parse(stored);
    if (!Array.isArray(localPosts)) return;

    var existingIds = new Set(posts.map(function(p) { return p.id; }));
    var toMigrate = localPosts.filter(function(p) {
      return p && p.id && !existingIds.has(p.id) && !isSamplePost(p)
        && typeof p.message === 'string' && p.message.length > 0
        && moderateContent(p.message).ok;
    });

    if (toMigrate.length > 0) {
      var rows = toMigrate.map(function(p) {
        return {
          id: p.id,
          lat: Number(p.lat),
          lng: Number(p.lng),
          category: VALID_CATEGORY_IDS.indexOf(p.category) !== -1 ? p.category : 'idea',
          nickname: (p.nickname || '匿名さん').slice(0, 20),
          message: p.message.slice(0, 200),
          agrees: Number(p.agrees) || 0,
          is_sample: false,
        };
      });

      var result = await supabaseRequest('POST', 'posts', rows);
      if (result) {
        result.forEach(function(row) { posts.push(normalizePost(row)); });
        posts.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      }
    }

    localStorage.setItem(MIGRATION_KEY, 'true');
    localStorage.removeItem('yonago_voice_posts');
  } catch (e) {
    console.error('Migration failed:', e);
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

  var msgInput = document.getElementById('message');
  msgInput.addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length + '/200';
  });

  var catSelect = document.getElementById('categorySelect');
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('div');
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

function sanitizeText(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim().slice(0, maxLen);
}

function moderateContent(text) {
  var normalized = text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); })
    .replace(/[\s　]+/g, '')
    .replace(/[ー\-ー―—–～〜・.．,，、。!！?？\*＊_＿#＃○◯●◎△▲▽▼☆★♪♫→←↑↓]/g, '');

  for (var i = 0; i < NG_WORDS.length; i++) {
    if (normalized.indexOf(NG_WORDS[i]) !== -1) {
      return { ok: false, reason: REJECTION_MESSAGES[0] };
    }
  }
  for (var j = 0; j < NG_PATTERNS.length; j++) {
    if (NG_PATTERNS[j].test(normalized)) {
      return { ok: false, reason: REJECTION_MESSAGES[1] };
    }
  }
  return { ok: true };
}

function showModerationAlert(message) {
  var overlay = document.getElementById('moderationOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'moderationOverlay';
    overlay.className = 'moderation-overlay';
    overlay.innerHTML =
      '<div class="moderation-dialog">' +
        '<div class="moderation-icon">🌱</div>' +
        '<h3 class="moderation-title">前向きな声をお願いします</h3>' +
        '<p class="moderation-message" id="moderationMessage"></p>' +
        '<button class="moderation-btn" id="moderationClose">書き直す</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('moderationClose').addEventListener('click', function() {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }
  document.getElementById('moderationMessage').textContent = message;
  overlay.classList.add('active');
}

async function submitPost() {
  var msg = sanitizeText(document.getElementById('message').value, 200);
  if (!selectedCategory || VALID_CATEGORY_IDS.indexOf(selectedCategory) === -1) {
    alert('カテゴリを選択してください');
    return;
  }
  if (!msg) {
    alert('声を入力してください');
    return;
  }

  var modResult = moderateContent(msg);
  if (!modResult.ok) {
    showModerationAlert(modResult.reason);
    return;
  }

  var nickname = sanitizeText(document.getElementById('nickname').value, 20) || '匿名さん';
  var nickModResult = moderateContent(nickname);
  if (!nickModResult.ok) {
    showModerationAlert('ニックネームに不適切な表現が含まれています。別の名前にしてください。');
    return;
  }

  var post = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    lat: Number(pendingLatLng.lat),
    lng: Number(pendingLatLng.lng),
    category: selectedCategory,
    nickname: nickname,
    message: msg,
    agrees: 0,
    is_sample: false,
    resolved: false,
    resolved_message: null,
  };

  var submitBtn = document.getElementById('submitPost');
  submitBtn.disabled = true;
  submitBtn.textContent = '投稿中...';

  try {
    var result = await supabaseRequest('POST', 'posts', post);
    if (result && result.length > 0) {
      posts.unshift(normalizePost(result[0]));
    } else {
      posts.unshift(post);
    }
    closePostForm();
    renderPosts();
    renderMarkers();
    document.getElementById('mapHint').style.display = 'none';
  } catch (e) {
    alert('投稿に失敗しました。もう一度お試しください。');
    console.error(e);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '投稿する';
  }
}

function normalizePost(row) {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    category: row.category,
    nickname: row.nickname,
    message: row.message,
    agrees: row.agrees,
    isSample: row.is_sample,
    resolved: row.resolved || false,
    resolvedMessage: row.resolved_message || null,
    createdAt: row.created_at,
  };
}

function isSamplePost(p) {
  return p.isSample || (p.id && p.id.indexOf('sample_') === 0);
}

function createMarkerIcon(cat, resolved) {
  var resolvedBadge = resolved ? '<div style="position:absolute;top:-4px;right:-4px;font-size:11px;background:white;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">✅</div>' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: '<div style="position:relative;"><div style="background:' + cat.color + ';width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">' + cat.emoji + '</div>' + resolvedBadge + '</div>',
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

    var marker = L.marker([post.lat, post.lng], { icon: createMarkerIcon(cat, post.resolved) }).addTo(map);

    var isPopupSample = isSamplePost(post);
    var popupSampleNote = isPopupSample ? '<div class="popup-sample-note">📌 これは投稿の一例です</div>' : '';
    var popupResolved = '';
    if (post.resolved && post.resolvedMessage) {
      popupResolved = '<div class="popup-resolved">' +
        '<div class="popup-resolved-label">✅ 改善されました</div>' +
        '<div class="popup-resolved-msg">' + escapeHtml(post.resolvedMessage) + '</div>' +
        '</div>';
    }
    var popupHtml = '<div class="popup-content">' +
      popupSampleNote +
      '<span class="popup-category" style="background:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>' +
      '<p class="popup-message">' + escapeHtml(post.message) + '</p>' +
      popupResolved +
      '<span class="popup-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '<br><button class="popup-agree-btn" data-post-id="' + escapeHtml(post.id) + '">' +
      '👍 賛同 <span class="popup-agree-count">' + post.agrees + '</span></button>' +
      '</div>';

    marker.bindPopup(popupHtml);
    marker.on('popupopen', function() {
      var btn = document.querySelector('.popup-agree-btn[data-post-id="' + CSS.escape(post.id) + '"]');
      if (btn) {
        btn.addEventListener('click', function() { toggleAgree(post.id); });
      }
    });
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
    var isSample = isSamplePost(post);
    var sampleBadge = isSample ? '<span class="sample-badge">📌 投稿例</span>' : '';
    var resolvedBadge = post.resolved ? '<span class="resolved-badge">✅ 改善済み</span>' : '';
    var resolvedSection = '';
    if (post.resolved && post.resolvedMessage) {
      resolvedSection =
        '<div class="resolved-section">' +
          '<div class="resolved-label">✅ 改善されました</div>' +
          '<div class="resolved-message">' + escapeHtml(post.resolvedMessage) + '</div>' +
        '</div>';
    }
    item.innerHTML =
      '<div class="post-item-header">' +
        '<span class="post-category-badge" style="background:' + cat.color + '">' + cat.emoji + ' ' + cat.name + '</span>' +
        sampleBadge +
        resolvedBadge +
        '<span class="post-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '</div>' +
      '<p class="post-message">' + escapeHtml(post.message) + '</p>' +
      resolvedSection +
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

async function toggleAgree(postId) {
  if (typeof postId !== 'string') return;
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;

  if (agreedSet.has(postId)) {
    agreedSet.delete(postId);
    post.agrees = Math.max(0, post.agrees - 1);
  } else {
    agreedSet.add(postId);
    post.agrees += 1;
  }

  // Save agreed set to localStorage (per-user preference)
  localStorage.setItem('yonago_voice_agreed', JSON.stringify(Array.from(agreedSet)));

  // Update agrees count in Supabase
  try {
    await supabaseRequest('PATCH', 'posts?id=eq.' + encodeURIComponent(postId), { agrees: post.agrees });
  } catch (e) {
    console.error('Failed to update agrees:', e);
  }

  renderPosts();

  var btn = document.querySelector('.popup-agree-btn[data-post-id="' + CSS.escape(postId) + '"]');
  if (btn) {
    var countEl = btn.querySelector('.popup-agree-count');
    if (countEl) countEl.textContent = post.agrees;
  }
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
  var realPosts = posts.filter(function(p) { return !isSamplePost(p); });
  var counts = {};
  CATEGORIES.forEach(function(c) { counts[c.id] = 0; });
  realPosts.forEach(function(p) { if (counts[p.category] !== undefined) counts[p.category]++; });

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
  var realPosts = posts.filter(function(p) { return !isSamplePost(p); });
  var sorted = realPosts.slice().sort(function(a, b) { return b.agrees - a.agrees; });
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
  var realPosts = posts.filter(function(p) { return !isSamplePost(p); });

  var areaMap = {};
  realPosts.forEach(function(post) {
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

async function loadData() {
  // Load agreed set from localStorage (per-user)
  try {
    var agreed = localStorage.getItem('yonago_voice_agreed');
    if (agreed) agreedSet = new Set(JSON.parse(agreed));
  } catch(e) {
    agreedSet = new Set();
  }

  // Load posts from Supabase
  try {
    var data = await supabaseRequest('GET', 'posts?order=created_at.desc&limit=500');
    if (Array.isArray(data)) {
      posts = data.map(normalizePost);
    }
  } catch (e) {
    console.error('Failed to load posts from Supabase:', e);
    posts = [];
  }
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', init);
