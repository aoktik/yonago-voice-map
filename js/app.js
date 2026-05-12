// === Cookie同意管理 & GA4初期化（CSP対応: インラインスクリプト不使用） ===
(function() {
  var consent = localStorage.getItem('yonago_cookie_consent');

  // 拒否済みならGA4を無効化
  if (consent === 'declined') {
    window['ga-disable-G-759KNPK2B6'] = true;
  }

  // GA4初期化（インラインスクリプトからここに移動）
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'G-759KNPK2B6');

  // 未選択ならバナー表示
  if (!consent) {
    document.addEventListener('DOMContentLoaded', function() {
      var banner = document.getElementById('cookieConsent');
      if (banner) banner.classList.add('active');
    });
  }
})();

var SUPABASE_URL = 'https://pqnuxkdfegydungyfnsq.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxbnV4a2RmZWd5ZHVuZ3lmbnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzUyMTgsImV4cCI6MjA5Mzg1MTIxOH0.exGLJP3uiCvLzyOhKrsxeDpXgdQyllBXjL5n8HASB7c';

var CATEGORIES = [
  { id: 'traffic',   icon: 'images/icons/traffic.svg',   name: '交通・渋滞',     color: '#ef4444' },
  { id: 'shop',      icon: 'images/icons/shop.svg',      name: '商業施設・誘致',  color: '#f59e0b' },
  { id: 'nature',    icon: 'images/icons/nature.svg',     name: '環境・景観',      color: '#10b981' },
  { id: 'child',     icon: 'images/icons/child.svg',      name: '子育て・教育',    color: '#ec4899' },
  { id: 'medical',   icon: 'images/icons/medical.svg',    name: '医療・福祉',      color: '#6366f1' },
  { id: 'transport', icon: 'images/icons/transport.svg',  name: '公共交通',        color: '#0ea5e9' },
  { id: 'infra',     icon: 'images/icons/infra.svg',      name: '住環境・インフラ', color: '#8b5cf6' },
  { id: 'idea',      icon: 'images/icons/idea.svg',       name: 'その他提案',      color: '#64748b' },
];

// カテゴリアイコンHTML生成（色付き背景上で使用）
function catIconHtml(cat, size) {
  return '<img src="' + cat.icon + '" alt="" class="cat-icon" style="width:' + size + 'px;height:' + size + 'px;">';
}

// 明るい背景用: アイコンを小さな色付き丸の中に表示
function catIconCircle(cat, size) {
  var cs = size + 8;
  return '<span class="cat-icon-circle" style="background:' + cat.color + ';width:' + cs + 'px;height:' + cs + 'px;">' +
    '<img src="' + cat.icon + '" alt="" class="cat-icon" style="width:' + size + 'px;height:' + size + 'px;">' +
    '</span>';
}

// UIアイコンパス
var UI_ICONS = {
  location:    'images/icons/location.svg',
  thumbsup:    'images/icons/thumbsup.svg',
  thumbsdown:  'images/icons/thumbsdown.svg',
  note:        'images/icons/note.svg',
  celebrate:   'images/icons/celebrate.svg',
  pushpin:     'images/icons/pushpin.svg',
  send:        'images/icons/send.svg',
  chart:       'images/icons/chart.svg',
  seedling:    'images/icons/seedling.svg',
  check:       'images/icons/check.svg',
  reject:      'images/icons/reject.svg',
  warning:     'images/icons/warning.svg',
  search:      'images/icons/search.svg',
  fire:        'images/icons/fire.svg',
  trophy:      'images/icons/trophy.svg',
  trending:    'images/icons/trending.svg',
  speech:      'images/icons/speech.svg',
  clipboard:   'images/icons/clipboard.svg',
  circleOk:    'images/icons/circle-ok.svg',
  map:         'images/icons/map-icon.svg',
  shareVoice:  'images/icons/share-voice.svg',
};

// UIアイコンHTML生成（インライン用、カラーアイコン）
function uiIcon(name, size) {
  return '<img src="' + UI_ICONS[name] + '" alt="" class="ui-icon" style="width:' + size + 'px;height:' + size + 'px;">';
}

// 白色UIアイコン（色付き背景上で使用）
function uiIconWhite(name, size) {
  return '<img src="' + UI_ICONS[name] + '" alt="" class="ui-icon ui-icon-white" style="width:' + size + 'px;height:' + size + 'px;">';
}

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
let youtubeTopics = [];
let agreedSet = new Set();
let topicVotes = {};  // { topicId: 'like' | 'dislike' }
let activeFilter = 'all';
let pendingLatLng = null;
let selectedCategory = null;
let pendingResolvePostId = null;
let pendingApproveReportId = null;
let resolveReports = [];

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
  initSidebarTabs();
  initSearch();
  initLocate();
  renderFilterButtons();
  await loadData();
  var mapLoading = document.getElementById('mapLoading');
  if (mapLoading) mapLoading.classList.add('hidden');
  await migrateLocalStorageToSupabase();
  renderPosts();
  renderMarkers();
  renderYoutubeTopics();
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
      return p && p.id && !existingIds.has(p.id)
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
    console.error('Migration failed');
  }
}

// 米子市の境界ポリゴン（yonago-boundary.jsで定義）
var yonagoBoundaryPolygon = null;

function isInYonago(latlng) {
  if (!yonagoBoundaryPolygon) return true;
  // Ray casting algorithm for point-in-polygon
  var point = [latlng.lat, latlng.lng];
  var coords = YONAGO_BOUNDARY;
  var inside = false;
  for (var i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    var yi = coords[i][0], xi = coords[i][1];
    var yj = coords[j][0], xj = coords[j][1];
    if (((yi > point[0]) !== (yj > point[0])) &&
        (point[1] < (xj - xi) * (point[0] - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function initMap() {
  var boundsRect = L.latLngBounds(
    L.latLng(35.35, 133.20),
    L.latLng(35.52, 133.48)
  );
  map = L.map('map', {
    zoomControl: false,
    maxBounds: boundsRect.pad(0.05),
    maxBoundsViscosity: 0.8,
    minZoom: 12,
  }).setView([35.428, 133.331], 14);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    detectRetina: true,
  }).addTo(map);

  // 米子市の境界線を描画
  if (typeof YONAGO_BOUNDARY !== 'undefined') {
    yonagoBoundaryPolygon = L.polygon(YONAGO_BOUNDARY, {
      color: '#2563eb',
      weight: 2.5,
      opacity: 0.6,
      fillColor: '#2563eb',
      fillOpacity: 0.03,
      dashArray: '8, 6',
      interactive: false,
    }).addTo(map);
  }

  map.on('click', function(e) {
    if (!isInYonago(e.latlng)) {
      showToast('米子市内の場所をクリックしてください', 'info');
      return;
    }
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

  // Resolve form events (citizen report)
  document.getElementById('cancelResolve').addEventListener('click', closeResolveForm);
  document.getElementById('resolveFormOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeResolveForm();
  });
  document.getElementById('submitResolve').addEventListener('click', submitResolve);
  var resolveMsg = document.getElementById('resolveMessage');
  resolveMsg.addEventListener('input', function() {
    document.getElementById('resolveCharCount').textContent = this.value.length + '/200';
  });

  // Approve form events (admin)
  document.getElementById('cancelApprove').addEventListener('click', closeApproveForm);
  document.getElementById('approveFormOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeApproveForm();
  });
  document.getElementById('approveReport').addEventListener('click', function() { processReport('approve'); });
  document.getElementById('rejectReport').addEventListener('click', function() { processReport('reject'); });

  // Topic detail modal events
  document.getElementById('closeTopicDetail').addEventListener('click', closeTopicDetail);
  document.getElementById('topicDetailOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeTopicDetail();
  });

  // よな坊プロフィールモーダル
  document.getElementById('logoMascot').addEventListener('click', openYonaboProfile);
  document.getElementById('logoMascot').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openYonaboProfile(); }
  });
  document.getElementById('closeYonaboProfile').addEventListener('click', closeYonaboProfile);
  document.getElementById('yonaboProfileOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeYonaboProfile();
  });

  // 防災情報モーダル
  document.getElementById('openDisaster').addEventListener('click', openDisasterModal);
  document.getElementById('closeDisaster').addEventListener('click', closeDisasterModal);
  document.getElementById('disasterOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeDisasterModal();
  });

  // YouTube準備中モーダル
  document.getElementById('openYoutubeModal').addEventListener('click', function(e) {
    e.preventDefault();
    openYoutubeModal();
  });
  document.getElementById('openYoutubeModalLg').addEventListener('click', function(e) {
    e.preventDefault();
    openYoutubeModal();
  });
  document.getElementById('closeYoutubeModal').addEventListener('click', closeYoutubeModal);
  document.getElementById('youtubeModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeYoutubeModal();
  });
  document.getElementById('ytModalScrollToVote').addEventListener('click', function() {
    closeYoutubeModal();
    // ダッシュボードが開いていたら閉じる
    var dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.classList.contains('active')) {
      dashboard.classList.remove('active');
    }
    // 討論テーマタブに切り替え
    var tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var ytTab = document.querySelector('.sidebar-tab[data-tab="youtube"]');
    if (ytTab) ytTab.classList.add('active');
    document.querySelectorAll('.sidebar-panel').forEach(function(p) { p.classList.remove('active'); });
    var ytPanel = document.getElementById('youtubePanel');
    if (ytPanel) ytPanel.classList.add('active');
    // スクロール
    setTimeout(function() {
      var voteSection = document.getElementById('youtubeTopicsList');
      if (voteSection) {
        voteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  });

  // Cookie consent events
  var cookieAcceptBtn = document.getElementById('cookieAccept');
  var cookieDeclineBtn = document.getElementById('cookieDecline');
  if (cookieAcceptBtn) {
    cookieAcceptBtn.addEventListener('click', function() {
      localStorage.setItem('yonago_cookie_consent', 'accepted');
      document.getElementById('cookieConsent').classList.remove('active');
    });
  }
  if (cookieDeclineBtn) {
    cookieDeclineBtn.addEventListener('click', function() {
      localStorage.setItem('yonago_cookie_consent', 'declined');
      window['ga-disable-G-759KNPK2B6'] = true;
      document.getElementById('cookieConsent').classList.remove('active');
    });
  }

  // Report form events
  document.getElementById('cancelReport').addEventListener('click', closeReportForm);
  document.getElementById('reportFormOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeReportForm();
  });
  document.getElementById('submitReport').addEventListener('click', submitReportForm);
  var reportDetail = document.getElementById('reportDetail');
  reportDetail.addEventListener('input', function() {
    document.getElementById('reportCharCount').textContent = this.value.length + '/200';
  });

  // Share sheet events
  document.getElementById('closeShareSheet').addEventListener('click', closeShareSheet);
  document.getElementById('shareSheetOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeShareSheet();
  });
  document.getElementById('shareToX').addEventListener('click', shareToX);
  document.getElementById('shareToThreads').addEventListener('click', shareToThreads);
  document.getElementById('shareCopyText').addEventListener('click', shareCopyText);

  // Post thanks modal events
  document.getElementById('closePostThanks').addEventListener('click', closePostThanksModal);
  document.getElementById('postThanksSkip').addEventListener('click', closePostThanksModal);
  document.getElementById('postThanksGoToTopics').addEventListener('click', postThanksGoToTopics);
  document.getElementById('postThanksOverlay').addEventListener('click', function(e) {
    if (e.target === this) closePostThanksModal();
  });

  var msgInput = document.getElementById('message');
  msgInput.addEventListener('input', function() {
    document.getElementById('charCount').textContent = this.value.length + '/200';
  });

  var catSelect = document.getElementById('categorySelect');
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('div');
    btn.className = 'category-option';
    btn.dataset.category = cat.id;
    btn.innerHTML = '<span class="cat-emoji">' + catIconCircle(cat, 16) + '</span>' + cat.name;
    btn.addEventListener('click', function() {
      catSelect.querySelectorAll('.category-option').forEach(function(el) { el.classList.remove('selected'); });
      btn.classList.add('selected');
      selectedCategory = cat.id;
    });
    catSelect.appendChild(btn);
  });

  // Escapeキーでモーダルを閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalStack.length > 0) {
      var top = modalStack[modalStack.length - 1];
      var closeFns = {
        postFormOverlay: closePostForm,
        resolveFormOverlay: closeResolveForm,
        approveFormOverlay: closeApproveForm,
        dashboardOverlay: closeDashboard,
        topicDetailOverlay: closeTopicDetail,
        yonaboProfileOverlay: closeYonaboProfile,
        disasterOverlay: closeDisasterModal,
        youtubeModalOverlay: closeYoutubeModal,
        reportFormOverlay: closeReportForm,
        shareSheetOverlay: closeShareSheet,
        postThanksOverlay: closePostThanksModal,
      };
      if (closeFns[top.overlayId]) {
        closeFns[top.overlayId]();
      }
    }
  });
}

// === 検索機能 ===
var searchMarker = null;

// ローカル地名辞書（Nominatimで見つからない場所も即座にヒットさせる）
var LOCAL_PLACES = [
  // 駅
  { name: '米子駅', kw: ['よなご駅', 'JR米子'], lat: 35.4228, lng: 133.3354 },
  { name: '東山公園駅', kw: ['ひがしやまこうえん'], lat: 35.4308, lng: 133.3516 },
  { name: '博労町駅', kw: ['ばくろうまち'], lat: 35.4311, lng: 133.3402 },
  { name: '富士見町駅', kw: ['ふじみちょう'], lat: 35.4348, lng: 133.3364 },
  { name: '後藤駅', kw: ['ごとう駅'], lat: 35.4396, lng: 133.3315 },
  { name: '三本松口駅', kw: ['さんぼんまつぐち'], lat: 35.4463, lng: 133.3228 },
  { name: '河崎口駅', kw: ['かわさきぐち'], lat: 35.4567, lng: 133.3055 },
  { name: '伯耆大山駅', kw: ['ほうきだいせん'], lat: 35.4297, lng: 133.3836 },
  { name: '淀江駅', kw: ['よどえ駅'], lat: 35.4570, lng: 133.4297 },
  // 温泉・観光
  { name: '皆生温泉', kw: ['かいけ温泉', 'かいけおんせん', '皆生'], lat: 35.4514, lng: 133.3576 },
  { name: '皆生海岸', kw: ['かいけ海岸', '皆生海水浴場', '皆生ビーチ'], lat: 35.4560, lng: 133.3580 },
  { name: '米子城跡', kw: ['米子城', '湊山城'], lat: 35.4250, lng: 133.3245 },
  { name: '湊山公園', kw: ['みなとやま公園'], lat: 35.4281, lng: 133.3213 },
  { name: '弓ヶ浜公園', kw: ['ゆみがはま'], lat: 35.4625, lng: 133.3213 },
  // 公共施設
  { name: '米子市役所', kw: ['市役所'], lat: 35.4279, lng: 133.3310 },
  { name: '米子市立図書館', kw: ['図書館'], lat: 35.4284, lng: 133.3317 },
  { name: '米子コンベンションセンター', kw: ['ビッグシップ', 'BigShip'], lat: 35.4211, lng: 133.3332 },
  { name: '米子空港', kw: ['鬼太郎空港', '米子鬼太郎空港'], lat: 35.5019, lng: 133.2478 },
  // 商業施設
  { name: '米子高島屋', kw: ['高島屋', 'たかしまや'], lat: 35.4318, lng: 133.3330 },
  { name: 'イオンモール日吉津', kw: ['イオン', 'イオンモール', '日吉津'], lat: 35.4456, lng: 133.3875 },
  // 高校
  { name: '米子東高校', kw: ['米子東高等学校', '米東'], lat: 35.4335, lng: 133.3439 },
  { name: '米子西高校', kw: ['米子西高等学校', '米西'], lat: 35.4162, lng: 133.3284 },
  { name: '米子北高校', kw: ['米子北高等学校', '米北'], lat: 35.4450, lng: 133.3368 },
  { name: '米子松蔭高校', kw: ['米子松蔭高等学校', '松蔭'], lat: 35.4282, lng: 133.3892 },
  { name: '米子工業高等専門学校', kw: ['米子高専', '高専'], lat: 35.4551, lng: 133.2889 },
  // 大学・病院
  { name: '鳥取大学医学部附属病院', kw: ['鳥大病院', '大学病院', '医学部'], lat: 35.4283, lng: 133.3243 },
  { name: '山陰労災病院', kw: ['労災病院'], lat: 35.4519, lng: 133.3646 },
  // 中学校
  { name: '福米中学校', kw: ['福米中'], lat: 35.4562, lng: 133.3463 },
  { name: '後藤ヶ丘中学校', kw: ['後藤ヶ丘中', 'ごとうがおか'], lat: 35.4423, lng: 133.3193 },
  { name: '東山中学校', kw: ['東山中'], lat: 35.4269, lng: 133.3552 },
  { name: '湊山中学校', kw: ['湊山中'], lat: 35.4211, lng: 133.3299 },
  { name: '淀江中学校', kw: ['淀江中'], lat: 35.4533, lng: 133.4210 },
  { name: '箕蚊屋中学校', kw: ['箕蚊屋中', 'みのかや'], lat: 35.4203, lng: 133.3879 },
  // 小学校
  { name: '就将小学校', kw: ['就将小', 'しゅうしょう'], lat: 35.4208, lng: 133.3308 },
  { name: '明道小学校', kw: ['明道小', 'めいどう'], lat: 35.4263, lng: 133.3484 },
  { name: '啓成小学校', kw: ['啓成小', 'けいせい'], lat: 35.4366, lng: 133.3413 },
  { name: '義方小学校', kw: ['義方小', 'よしかた'], lat: 35.4387, lng: 133.3235 },
  { name: '住吉小学校', kw: ['住吉小'], lat: 35.4445, lng: 133.3131 },
  { name: '加茂小学校', kw: ['加茂小'], lat: 35.4596, lng: 133.3192 },
  { name: '車尾小学校', kw: ['車尾小', 'くずも'], lat: 35.4321, lng: 133.3571 },
  { name: '彦名小学校', kw: ['彦名小', 'ひこな'], lat: 35.4562, lng: 133.2917 },
  { name: '崎津小学校', kw: ['崎津小', 'さきつ'], lat: 35.4765, lng: 133.2587 },
  { name: '淀江小学校', kw: ['淀江小'], lat: 35.4510, lng: 133.4223 },
  { name: '福生東小学校', kw: ['福生東小', 'ふくいけひがし'], lat: 35.4476, lng: 133.3600 },
  { name: '成実小学校', kw: ['成実小', 'なるみ'], lat: 35.4018, lng: 133.3473 },
  { name: '五千石小学校', kw: ['五千石小', 'ごせんごく'], lat: 35.3972, lng: 133.3769 },
  { name: '大篠津小学校', kw: ['大篠津小', 'おおしのづ'], lat: 35.4903, lng: 133.2613 },
  { name: '和田小学校', kw: ['和田小'], lat: 35.4885, lng: 133.2721 },
  { name: '福米東小学校', kw: ['福米東小'], lat: 35.4449, lng: 133.3440 },
  // エリア・自然
  { name: '角盤町', kw: ['かくばんちょう', '角盤'], lat: 35.4317, lng: 133.3325 },
  { name: '加茂川', kw: ['かもがわ'], lat: 35.4237, lng: 133.3485 },
  { name: '日野川', kw: ['ひのがわ'], lat: 35.4210, lng: 133.3685 },
];

function searchLocalPlaces(query) {
  var q = query.toLowerCase();
  var results = [];
  for (var i = 0; i < LOCAL_PLACES.length; i++) {
    var p = LOCAL_PLACES[i];
    if (p.name.indexOf(q) !== -1 || q.indexOf(p.name) !== -1) {
      results.push(p);
      continue;
    }
    for (var j = 0; j < p.kw.length; j++) {
      if (p.kw[j].indexOf(q) !== -1 || q.indexOf(p.kw[j]) !== -1) {
        results.push(p);
        break;
      }
    }
  }
  return results;
}

function initSearch() {
  var input = document.getElementById('searchInput');
  var btn = document.getElementById('searchBtn');

  btn.addEventListener('click', function() { doSearch(); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
}

async function doSearch() {
  var input = document.getElementById('searchInput');
  var btn = document.getElementById('searchBtn');
  var query = input.value.trim();
  if (!query) return;

  btn.disabled = true;
  btn.textContent = '...';

  // ローカル辞書を先に検索（高速・確実）
  var localResults = searchLocalPlaces(query);
  if (localResults.length > 0) {
    var place = localResults[0];
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background:#2563eb;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">' + uiIconWhite('search', 20) + '</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      })
    }).addTo(map);
    searchMarker.bindPopup('<div class="search-result-popup">' + uiIcon('search', 14) + ' ' + escapeHtml(place.name) + '</div>').openPopup();
    map.setView([place.lat, place.lng], 16);
    gtag('event', 'search', { search_term: query, source: 'local' });
    btn.disabled = false;
    btn.innerHTML = uiIconWhite('search', 16);
    return;
  }

  // ローカルになければNominatimで検索
  try {
    var url = 'https://nominatim.openstreetmap.org/search?' +
      'q=' + encodeURIComponent(query + ' 米子市 鳥取県') +
      '&format=json&limit=1&countrycodes=jp&accept-language=ja';
    var res = await fetch(url, {
      headers: { 'User-Agent': 'YonagoVoiceMap/1.0' }
    });
    var data = await res.json();

    if (data.length > 0) {
      var result = data[0];
      var lat = parseFloat(result.lat);
      var lng = parseFloat(result.lon);
      var name = result.display_name.split(',')[0];

      if (searchMarker) map.removeLayer(searchMarker);
      searchMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:#2563eb;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:3px solid white;">' + uiIconWhite('search', 20) + '</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        })
      }).addTo(map);
      searchMarker.bindPopup('<div class="search-result-popup">' + uiIcon('search', 14) + ' ' + escapeHtml(name) + '</div>').openPopup();
      map.setView([lat, lng], 16);
      gtag('event', 'search', { search_term: query, source: 'nominatim' });
    } else {
      showToast('「' + query + '」が見つかりませんでした', 'info');
    }
  } catch (e) {
    console.error('Search failed');
    showToast('検索に失敗しました', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = uiIconWhite('search', 16);
  }
}

// === 現在地機能 ===
var locationMarker = null;
var locationCircle = null;

function initLocate() {
  document.getElementById('locateBtn').addEventListener('click', function() {
    if (!navigator.geolocation) {
      showToast('お使いのブラウザは位置情報に対応していません', 'error');
      return;
    }

    var btn = this;
    btn.classList.add('locating');
    btn.textContent = '⏳';

    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        var accuracy = pos.coords.accuracy;

        // 米子市外の場合はマップを移動せずトーストを表示
        if (!isInYonago({ lat: lat, lng: lng })) {
          btn.classList.remove('locating');
          btn.innerHTML = uiIcon('location', 18);
          showOutOfAreaToast();
          gtag('event', 'locate_outside');
          return;
        }

        if (locationMarker) map.removeLayer(locationMarker);
        if (locationCircle) map.removeLayer(locationCircle);

        locationMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="width:18px;height:18px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.3),0 2px 6px rgba(0,0,0,0.3);"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })
        }).addTo(map);

        locationCircle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(map);

        map.setView([lat, lng], 16);
        gtag('event', 'locate');
        btn.classList.remove('locating');
        btn.innerHTML = uiIcon('location', 18);
      },
      function(err) {
        btn.classList.remove('locating');
        btn.innerHTML = uiIcon('location', 18);
        if (err.code === 1) {
          showToast('位置情報の使用が許可されていません', 'error');
        } else {
          showToast('現在地を取得できませんでした', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function initSidebarTabs() {
  var tabs = document.querySelectorAll('.sidebar-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      document.querySelectorAll('.sidebar-panel').forEach(function(p) { p.classList.remove('active'); });
      document.getElementById(target === 'youtube' ? 'youtubePanel' : 'voicesPanel').classList.add('active');
    });
  });
}

function renderFilterButtons() {
  var container = document.getElementById('categoryFilter');
  container.innerHTML = '<button class="filter-btn active" data-category="all">すべて</button>';
  CATEGORIES.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat.id;
    btn.innerHTML = catIconCircle(cat, 11) + ' ' + cat.name;
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
  var locationEl = document.getElementById('formLocation');
  locationEl.innerHTML = uiIcon('location', 14) + ' 場所を取得中...';
  reverseGeocode(latlng.lat, latlng.lng, function(address) {
    locationEl.innerHTML = uiIcon('location', 14) + ' ' + escapeHtml(address);
  });
  document.getElementById('nickname').value = '';
  document.getElementById('message').value = '';
  document.getElementById('charCount').textContent = '0/200';
  selectedCategory = null;
  document.querySelectorAll('.category-option').forEach(function(el) { el.classList.remove('selected'); });
  openModal('postFormOverlay');
}

function reverseGeocode(lat, lng, callback) {
  var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' +
    lat + '&lon=' + lng + '&zoom=18&addressdetails=1&accept-language=ja';
  fetch(url, {
    headers: { 'User-Agent': 'YonagoVoiceMap/1.0' }
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data && data.address) {
      var addr = data.address;
      var parts = [];
      // 町名・番地レベルの表示
      if (addr.neighbourhood) parts.push(addr.neighbourhood);
      else if (addr.quarter) parts.push(addr.quarter);
      else if (addr.suburb) parts.push(addr.suburb);
      // 近くの施設名があれば「〇〇付近」
      if (data.name && data.name !== parts[0]) {
        callback(data.name + ' 付近');
      } else if (parts.length > 0) {
        callback('米子市 ' + parts[0] + ' 付近');
      } else if (addr.city || addr.town) {
        callback((addr.city || addr.town) + ' 付近');
      } else {
        callback('米子市内');
      }
    } else {
      callback('米子市内');
    }
  })
  .catch(function() {
    callback('米子市内');
  });
}

function closePostForm() {
  closeModal('postFormOverlay');
  pendingLatLng = null;
  selectedCategory = null;
}

// === 改善報告フォーム（市民用） ===
function openResolveForm(postId) {
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  pendingResolvePostId = postId;
  document.getElementById('resolveTarget').innerHTML = uiIcon('location', 14) + ' 「' + escapeHtml(post.message.slice(0, 40)) + (post.message.length > 40 ? '...' : '') + '」';
  document.getElementById('resolveNickname').value = '';
  document.getElementById('resolveMessage').value = '';
  document.getElementById('resolveCharCount').textContent = '0/200';
  openModal('resolveFormOverlay');
}

function closeResolveForm() {
  closeModal('resolveFormOverlay');
  pendingResolvePostId = null;
}

async function submitResolve() {
  var message = sanitizeText(document.getElementById('resolveMessage').value, 200);
  var nickname = sanitizeText(document.getElementById('resolveNickname').value, 20) || '匿名さん';

  if (!message) {
    showToast('改善内容を入力してください', 'info');
    return;
  }
  if (!pendingResolvePostId) return;

  var modResult = moderateContent(message);
  if (!modResult.ok) {
    showModerationAlert(modResult.reason);
    return;
  }

  var submitBtn = document.getElementById('submitResolve');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中...';

  try {
    await supabaseRequest('POST', 'resolve_reports', {
      post_id: pendingResolvePostId,
      message: message,
      nickname: nickname,
    });

    closeResolveForm();
    gtag('event', 'resolve_report_submit');
    showToast('改善報告を送信しました', 'success');
  } catch (e) {
    console.error('Resolve report failed');
    showToast('送信に失敗しました', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = uiIcon('send', 14) + ' 報告を送る';
  }
}

// === 管理者承認フォーム ===
function openApproveForm(reportId) {
  var report = resolveReports.find(function(r) { return r.id === reportId; });
  if (!report) return;
  pendingApproveReportId = reportId;
  var post = posts.find(function(p) { return p.id === report.post_id; });
  var postMsg = post ? post.message.slice(0, 30) + (post.message.length > 30 ? '...' : '') : '(不明)';
  document.getElementById('approveTarget').innerHTML =
    '<strong>元の声:</strong> ' + escapeHtml(postMsg) + '<br>' +
    '<strong>報告者:</strong> ' + escapeHtml(report.nickname) + '<br>' +
    '<strong>改善内容:</strong> ' + escapeHtml(report.message);
  document.getElementById('approvePassword').value = '';
  openModal('approveFormOverlay');
}

function closeApproveForm() {
  closeModal('approveFormOverlay');
  pendingApproveReportId = null;
}

async function processReport(action) {
  var password = document.getElementById('approvePassword').value.trim();
  if (!password) {
    showToast('管理者パスワードを入力してください', 'info');
    return;
  }
  if (!pendingApproveReportId) return;

  var rpcName = action === 'approve' ? 'rpc/approve_report' : 'rpc/reject_report';
  var approveBtn = document.getElementById('approveReport');
  var rejectBtn = document.getElementById('rejectReport');
  approveBtn.disabled = true;
  rejectBtn.disabled = true;

  try {
    await supabaseRequest('POST', rpcName, {
      report_id: pendingApproveReportId,
      password: password,
    });

    if (action === 'approve') {
      // Update local data
      var report = resolveReports.find(function(r) { return r.id === pendingApproveReportId; });
      if (report) {
        report.status = 'approved';
        var post = posts.find(function(p) { return p.id === report.post_id; });
        if (post) {
          post.resolved = true;
          post.resolvedMessage = report.message;
        }
      }
      showToast('承認しました！改善済みとして反映されます', 'success');
    } else {
      var rpt = resolveReports.find(function(r) { return r.id === pendingApproveReportId; });
      if (rpt) rpt.status = 'rejected';
      showToast('却下しました', 'info');
    }

    closeApproveForm();
    gtag('event', 'report_process', { action: action });
    renderPosts();
    renderMarkers();
    renderPendingReports();
  } catch (e) {
    console.error('Process report failed');
    showToast('処理に失敗しました。パスワードを確認してください', 'error');
  } finally {
    approveBtn.disabled = false;
    rejectBtn.disabled = false;
  }
}

// === 未承認レポート一覧（ダッシュボード内） ===
function renderPendingReports() {
  var container = document.getElementById('pendingReportsSection');
  if (!container) return;

  var pending = resolveReports.filter(function(r) { return r.status === 'pending'; });

  if (pending.length === 0) {
    container.innerHTML = '';
    return;
  }

  var html = '<div class="dashboard-section-title">📬 未承認の改善報告 <span class="pending-count">' + pending.length + '件</span></div>';
  html += '<div class="pending-reports-list">';

  pending.forEach(function(report) {
    var post = posts.find(function(p) { return p.id === report.post_id; });
    var postMsg = post ? escapeHtml(post.message) : '(不明な投稿)';
    var cat = post ? CATEGORIES.find(function(c) { return c.id === post.category; }) : null;
    var catBadge = cat ? '<span class="post-category-badge" style="background:' + cat.color + '">' + catIconHtml(cat, 12) + ' ' + cat.name + '</span>' : '';

    html +=
      '<div class="pending-report-card">' +
        '<div class="pending-report-original">' +
          catBadge +
          '<p class="pending-original-msg">' + postMsg + '</p>' +
        '</div>' +
        '<div class="pending-report-arrow">↓ 改善報告</div>' +
        '<div class="pending-report-content">' +
          '<p class="pending-report-msg">' + escapeHtml(report.message) + '</p>' +
          '<span class="pending-report-meta">報告者: ' + escapeHtml(report.nickname) + ' | ' + formatDate(report.created_at) + '</span>' +
        '</div>' +
        '<div class="pending-report-actions">' +
          '<button class="btn-pending-approve" data-report-id="' + escapeHtml(report.id) + '">' + uiIcon('check', 14) + ' 承認</button>' +
          '<button class="btn-pending-reject" data-report-id="' + escapeHtml(report.id) + '">' + uiIcon('reject', 14) + ' 却下</button>' +
        '</div>' +
      '</div>';
  });

  html += '</div>';
  container.innerHTML = html;

  // Attach event listeners
  container.querySelectorAll('.btn-pending-approve').forEach(function(btn) {
    btn.addEventListener('click', function() { openApproveForm(btn.dataset.reportId); });
  });
  container.querySelectorAll('.btn-pending-reject').forEach(function(btn) {
    btn.addEventListener('click', function() { openApproveForm(btn.dataset.reportId); });
  });
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
        '<div class="moderation-icon">' + uiIcon('seedling', 32) + '</div>' +
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
    showToast('カテゴリを選択してください', 'info');
    return;
  }
  if (!msg) {
    showToast('声を入力してください', 'info');
    return;
  }

  // 利用規約同意チェック
  var termsCheckbox = document.getElementById('termsAgree');
  if (termsCheckbox && !termsCheckbox.checked) {
    showToast('利用規約への同意が必要です', 'info');
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
    showPostThanksModal();
    gtag('event', 'post_submit', { category: selectedCategory });
  } catch (e) {
    showToast('投稿に失敗しました', 'error');
    console.error('Post submit failed');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '投稿する';
  }
}

// 旧カテゴリIDを現行IDに正規化
var CATEGORY_ALIAS = {
  infrastructure: 'infra',
  education: 'child',
  economy: 'shop',
  welfare: 'medical',
  environment: 'nature',
  community: 'idea',
};

// 旧サンプル投稿のID（賛同数をリセット対象）
var LEGACY_SAMPLE_IDS = [
  'sample_01','sample_02','sample_03','sample_04','sample_05','sample_06','sample_07',
  'sv2_01','sv2_02','sv2_03','sv2_04','sv2_05','sv2_06','sv2_07','sv2_08','sv2_09','sv2_10','sv2_11','sv2_12'
];

function normalizePost(row) {
  var cat = row.category;
  if (CATEGORY_ALIAS[cat]) cat = CATEGORY_ALIAS[cat];
  if (VALID_CATEGORY_IDS.indexOf(cat) === -1) cat = 'idea';
  var agrees = row.agrees;
  if (LEGACY_SAMPLE_IDS.indexOf(row.id) !== -1) agrees = 1;
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    category: cat,
    nickname: row.nickname,
    message: row.message,
    agrees: agrees,
    isSample: false,
    resolved: row.resolved || false,
    resolvedMessage: row.resolved_message || null,
    createdAt: row.created_at,
  };
}


function createMarkerIcon(cat, resolved) {
  var resolvedBadge = resolved ? '<div style="position:absolute;top:-4px;right:-4px;background:white;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">' + uiIcon('check', 14) + '</div>' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: '<div style="position:relative;"><div style="background:' + cat.color + ';width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">' + catIconHtml(cat, 18) + '</div>' + resolvedBadge + '</div>',
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

    var popupResolved = '';
    if (post.resolved && post.resolvedMessage) {
      popupResolved = '<div class="popup-resolved">' +
        '<div class="popup-resolved-label">' + uiIcon('check', 14) + ' 改善されました</div>' +
        '<div class="popup-resolved-msg">' + escapeHtml(post.resolvedMessage) + '</div>' +
        '</div>';
    }
    var popupResolveBtn = '';
    if (!post.resolved) {
      popupResolveBtn = '<button class="popup-resolve-btn" data-post-id="' + escapeHtml(post.id) + '">' + uiIcon('celebrate', 14) + ' 改善報告</button>';
    }
    var popupHtml = '<div class="popup-content">' +
      '<span class="popup-category" style="background:' + cat.color + '">' + catIconHtml(cat, 12) + ' ' + cat.name + '</span>' +
      '<p class="popup-message">' + escapeHtml(post.message) + '</p>' +
      popupResolved +
      '<span class="popup-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '<br><button class="popup-agree-btn" data-post-id="' + escapeHtml(post.id) + '">' +
      uiIcon('thumbsup', 14) + ' 賛同 <span class="popup-agree-count">' + post.agrees + '</span></button>' +
      popupResolveBtn +
      '<button class="popup-report-btn" data-post-id="' + escapeHtml(post.id) + '">' + uiIcon('warning', 14) + ' 通報</button>' +
      '</div>';

    marker.bindPopup(popupHtml);
    marker.on('popupopen', function() {
      var btn = document.querySelector('.popup-agree-btn[data-post-id="' + CSS.escape(post.id) + '"]');
      if (btn) {
        btn.addEventListener('click', function() { toggleAgree(post.id); });
      }
      var resolveBtn = document.querySelector('.popup-resolve-btn[data-post-id="' + CSS.escape(post.id) + '"]');
      if (resolveBtn) {
        resolveBtn.addEventListener('click', function() { openResolveForm(post.id); });
      }
      var reportBtn = document.querySelector('.popup-report-btn[data-post-id="' + CSS.escape(post.id) + '"]');
      if (reportBtn) {
        reportBtn.addEventListener('click', function() { openReportForm(post.id); });
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
  var promoInserted = false;
  filtered.forEach(function(post, index) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    if (!cat) return;

    var item = document.createElement('div');
    item.className = 'post-item';
    var resolvedBadge = post.resolved ? '<span class="resolved-badge">' + uiIcon('check', 12) + ' 改善済み</span>' : '';
    var resolvedSection = '';
    if (post.resolved && post.resolvedMessage) {
      resolvedSection =
        '<div class="resolved-section">' +
          '<div class="resolved-label">' + uiIcon('check', 14) + ' 改善されました</div>' +
          '<div class="resolved-message">' + escapeHtml(post.resolvedMessage) + '</div>' +
        '</div>';
    }
    var resolveButton = !post.resolved ?
      '<button class="btn-resolve" data-id="' + post.id + '">' + uiIcon('celebrate', 14) + ' 改善報告</button>' : '';
    item.innerHTML =
      '<div class="post-item-header">' +
        '<span class="post-category-badge" style="background:' + cat.color + '">' + catIconHtml(cat, 12) + ' ' + cat.name + '</span>' +
        resolvedBadge +
        '<span class="post-nickname">' + escapeHtml(post.nickname) + '</span>' +
      '</div>' +
      '<p class="post-message">' + escapeHtml(post.message) + '</p>' +
      buildRelatedTopicHint(post.category) +
      resolvedSection +
      '<div class="post-footer">' +
        '<span class="post-date">' + formatDate(post.createdAt) + '</span>' +
        '<div class="post-agree">' +
          '<button class="btn-report-post" data-id="' + post.id + '" title="通報">' + uiIcon('warning', 13) + '</button>' +
          '<button class="btn-share-voice" data-id="' + post.id + '" title="シェア">' + uiIcon('shareVoice', 14) + ' シェア</button>' +
          resolveButton +
          '<button class="btn-agree ' + (agreedSet.has(post.id) ? 'agreed' : '') + '" data-id="' + post.id + '">' +
            uiIcon('thumbsup', 14) + ' <span class="agree-count">' + post.agrees + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    item.addEventListener('click', function(e) {
      if (e.target.closest('.btn-agree') || e.target.closest('.btn-resolve') || e.target.closest('.btn-report-post') || e.target.closest('.btn-share-voice') || e.target.closest('.related-topic-hint')) return;
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

    var resBtn = item.querySelector('.btn-resolve');
    if (resBtn) {
      resBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openResolveForm(post.id);
      });
    }

    var reportPostBtn = item.querySelector('.btn-report-post');
    if (reportPostBtn) {
      reportPostBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openReportForm(post.id);
      });
    }

    var shareBtn = item.querySelector('.btn-share-voice');
    if (shareBtn) {
      shareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openShareSheet(post);
      });
    }

    var relatedHint = item.querySelector('.related-topic-hint');
    if (relatedHint) {
      relatedHint.addEventListener('click', function(e) {
        e.stopPropagation();
        var tid = relatedHint.dataset.topicId;
        if (tid) {
          voteTopic(tid, 'like');
          relatedHint.querySelector('.related-topic-action').textContent = '✓ 投票済み';
          relatedHint.classList.add('voted');
          gtag('event', 'related_topic_vote', { topic: tid });
        }
      });
    }

    container.appendChild(item);

    // 5件目の後にトピックプロモカードを挿入
    if (index === 4 && !promoInserted && youtubeTopics.length > 0) {
      promoInserted = true;
      var promo = buildTopicPromoCard();
      if (promo) container.appendChild(promo);
    }
  });
}

function buildRelatedTopicHint(postCategory) {
  if (youtubeTopics.length === 0) return '';
  // カテゴリが一致するテーマを検索
  var matched = youtubeTopics.filter(function(t) { return t.category === postCategory; });
  if (matched.length === 0) return '';
  // 最も投票の多いものを選択
  var topic = matched.sort(function(a, b) { return (b.likes + b.dislikes) - (a.likes + a.dislikes); })[0];
  var design = TOPIC_DESIGNS[topic.id] || {};
  var plainTitle = (design.titleHtml || topic.title || '').replace(/<[^>]+>/g, '');
  var userVote = topicVotes[topic.id] || null;
  var actionText = userVote === 'like' ? '✓ 投票済み' : '投票する →';
  var votedClass = userVote === 'like' ? ' voted' : '';

  return '<div class="related-topic-hint' + votedClass + '" data-topic-id="' + topic.id + '">' +
    (design.photo ? '<div class="related-topic-thumb"><img src="' + design.photo + '" alt=""></div>' : '') +
    '<div class="related-topic-info">' +
      '<div class="related-topic-label">💡 あなたの声に関連するテーマ</div>' +
      '<div class="related-topic-title">' + escapeHtml(plainTitle) + '</div>' +
    '</div>' +
    '<div class="related-topic-action">' + actionText + '</div>' +
  '</div>';
}

function buildTopicPromoCard() {
  // 最も投票数の多いテーマを選択
  var topTopic = youtubeTopics.slice().sort(function(a, b) {
    return (b.likes + b.dislikes) - (a.likes + a.dislikes);
  })[0];
  if (!topTopic) return null;

  var design = TOPIC_DESIGNS[topTopic.id] || {};
  var plainTitle = (design.titleHtml || topTopic.title || '').replace(/<[^>]+>/g, '');
  var userVote = topicVotes[topTopic.id] || null;
  var totalVotes = topTopic.likes + topTopic.dislikes;

  var card = document.createElement('div');
  card.className = 'topic-promo-card';
  card.innerHTML =
    '<div class="topic-promo-header">' +
      '<div class="topic-promo-header-icon"><img src="images/icons/megaphone.svg" alt="" style="width:16px;height:16px;"></div>' +
      '<span class="topic-promo-header-text">YouTube討論テーマ 投票受付中</span>' +
    '</div>' +
    '<div class="topic-promo-body">' +
      (design.photo ?
        '<div class="topic-promo-thumb">' +
          '<img src="' + design.photo + '" alt="">' +
          '<div class="topic-promo-thumb-overlay" style="background:' + (design.overlay || '') + '"></div>' +
        '</div>' : '') +
      '<div class="topic-promo-info">' +
        '<div class="topic-promo-title">' + escapeHtml(plainTitle) + '</div>' +
        '<div class="topic-promo-meta">' + totalVotes + '票 · ' + (design.hook || '') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="topic-promo-actions">' +
      '<button class="topic-promo-vote-btn' + (userVote === 'like' ? ' voted' : '') + '" data-topic="' + topTopic.id + '">' +
        uiIcon('thumbsup', 14) + (userVote === 'like' ? ' 投票済み' : ' 見たい！') +
      '</button>' +
      '<button class="topic-promo-link" id="promoSeeAll">他のテーマも見る →</button>' +
    '</div>';

  var voteBtn = card.querySelector('.topic-promo-vote-btn');
  voteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    voteTopic(topTopic.id, 'like');
    // 投票後にカードを再描画
    var newCard = buildTopicPromoCard();
    if (newCard) card.replaceWith(newCard);
  });

  var seeAllBtn = card.querySelector('.topic-promo-link');
  seeAllBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('youtubePanel').scrollIntoView({ behavior: 'smooth' });
  });

  return card;
}

async function toggleAgree(postId) {
  if (typeof postId !== 'string') return;
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;

  if (agreedSet.has(postId)) {
    agreedSet.delete(postId);
    post.agrees = Math.max(0, post.agrees - 1);
    gtag('event', 'agree_toggle', { action: 'cancel' });
  } else {
    agreedSet.add(postId);
    post.agrees += 1;
    gtag('event', 'agree_toggle', { action: 'agree' });
  }

  // Save agreed set to localStorage (per-user preference)
  localStorage.setItem('yonago_voice_agreed', JSON.stringify(Array.from(agreedSet)));

  // Update agrees count in Supabase via RPC (delta only: +1 or -1)
  var delta = agreedSet.has(postId) ? 1 : -1;
  try {
    await supabaseRequest('POST', 'rpc/toggle_agree', { p_post_id: postId, p_delta: delta });
  } catch (e) {
    console.error('Failed to update agrees');
  }

  renderPosts();

  var btn = document.querySelector('.popup-agree-btn[data-post-id="' + CSS.escape(postId) + '"]');
  if (btn) {
    var countEl = btn.querySelector('.popup-agree-count');
    if (countEl) countEl.textContent = post.agrees;
  }
}

function openDashboard() {
  gtag('event', 'dashboard_open');
  renderDashboard();
  openModal('dashboardOverlay');
}

function closeDashboard() {
  closeModal('dashboardOverlay');
}

function renderDashboard() {
  renderPendingReports();
  renderDashboardSummary();
  renderCategoryChart();
  renderResolvedChart();
  renderTopRanking();
  renderResolvedRanking();
  renderMonthlyChart();
  renderHotTopics();
  initDataExplorer();
}

function renderCategoryChart() {
  var container = document.getElementById('categoryChart');
  var realPosts = posts;
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
      '<span class="chart-label">' + catIconCircle(cat, 12) + ' ' + cat.name + '</span>' +
      '<div class="chart-bar-wrap"><div class="chart-bar" style="width:' + pct + '%;background:' + cat.color + '"></div></div>' +
      '<span class="chart-value">' + count + '</span>';
    container.appendChild(row);
  });
}

function renderTopRanking() {
  var container = document.getElementById('topRanking');
  var realPosts = posts;
  var sorted = realPosts.slice().sort(function(a, b) { return b.agrees - a.agrees; });
  var top5 = sorted.slice(0, 5);

  if (top5.length === 0) {
    container.innerHTML = '<div class="empty-state"><img src="images/yonabou_peeking.png" alt="よな坊" class="empty-mascot">まだ投稿がありません</div>';
    return;
  }

  container.innerHTML = '';
  top5.forEach(function(post) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    var li = document.createElement('li');
    li.innerHTML =
      '<div class="rank-content">' +
        '<span class="rank-message">' + escapeHtml(post.message) + '</span>' +
        '<span class="rank-meta">' + (cat ? catIconCircle(cat, 11) + ' ' + cat.name : '') +
          ' | ' + uiIcon('thumbsup', 12) + ' ' + post.agrees + ' | ' + escapeHtml(post.nickname) + '</span>' +
      '</div>';
    container.appendChild(li);
  });
}

function renderHotTopics() {
  var container = document.getElementById('hotTopics');
  var realPosts = posts;

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
      '<div class="hot-topic-area">' + (cat ? catIconCircle(cat, 12) : '') + ' ' + (topCat ? topCat[0] : '') + '</div>' +
      '<div class="hot-topic-summary">' + escapeHtml(topPost.message) + '</div>' +
      '<div class="hot-topic-count">' + area.posts.length + '件の声 | ' + uiIcon('thumbsup', 12) + ' ' + area.totalAgrees + '</div>';
    container.appendChild(card);
  });
}

// === C. サイト活動サマリー ===
function renderDashboardSummary() {
  var container = document.getElementById('dashboardSummary');
  var realPosts = posts;
  var totalPosts = realPosts.length;
  var totalAgrees = realPosts.reduce(function(sum, p) { return sum + p.agrees; }, 0);
  var resolvedPosts = realPosts.filter(function(p) { return p.resolved; });
  var resolvedCount = resolvedPosts.length;

  // 今月の投稿数
  var now = new Date();
  var thisMonth = realPosts.filter(function(p) {
    var d = new Date(p.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  container.innerHTML =
    '<div class="summary-card">' +
      '<div class="summary-number">' + totalPosts + '</div>' +
      '<div class="summary-label">総投稿数</div>' +
    '</div>' +
    '<div class="summary-card">' +
      '<div class="summary-number">' + totalAgrees + '</div>' +
      '<div class="summary-label">総賛同数</div>' +
    '</div>' +
    '<div class="summary-card accent">' +
      '<div class="summary-number">' + resolvedCount + '</div>' +
      '<div class="summary-label">改善達成数</div>' +
    '</div>' +
    '<div class="summary-card">' +
      '<div class="summary-number">' + thisMonth + '</div>' +
      '<div class="summary-label">今月の投稿</div>' +
    '</div>';
}

// === A. 改善達成状況 ===
function renderResolvedChart() {
  var container = document.getElementById('resolvedChart');
  var realPosts = posts;
  var total = realPosts.length;
  var resolved = realPosts.filter(function(p) { return p.resolved; }).length;
  var unresolved = total - resolved;
  var pct = total > 0 ? Math.round(resolved / total * 100) : 0;

  // カテゴリ別の改善状況
  var catStats = {};
  CATEGORIES.forEach(function(c) { catStats[c.id] = { resolved: 0, total: 0 }; });
  realPosts.forEach(function(p) {
    if (catStats[p.category]) {
      catStats[p.category].total++;
      if (p.resolved) catStats[p.category].resolved++;
    }
  });

  var progressHtml =
    '<div class="resolved-progress">' +
      '<div class="resolved-ring" style="background:conic-gradient(#10b981 ' + pct + '%, #e2e8f0 0%)">' +
        '<div class="resolved-pct">' + pct + '%</div>' +
        '<div class="resolved-pct-label">改善率</div>' +
      '</div>' +
      '<div class="resolved-stats">' +
        '<div class="resolved-stat"><span class="stat-dot resolved-dot"></span>改善済み ' + resolved + '件</div>' +
        '<div class="resolved-stat"><span class="stat-dot unresolved-dot"></span>未改善 ' + unresolved + '件</div>' +
      '</div>' +
    '</div>';

  var catHtml = '<div class="resolved-by-cat">';
  CATEGORIES.forEach(function(cat) {
    var s = catStats[cat.id];
    if (s.total === 0) return;
    var catPct = Math.round(s.resolved / s.total * 100);
    catHtml +=
      '<div class="resolved-cat-row">' +
        '<span class="resolved-cat-label">' + catIconCircle(cat, 12) + ' ' + cat.name + '</span>' +
        '<div class="resolved-cat-bar-wrap">' +
          '<div class="resolved-cat-bar" style="width:' + catPct + '%;background:' + cat.color + '"></div>' +
        '</div>' +
        '<span class="resolved-cat-value">' + s.resolved + '/' + s.total + '</span>' +
      '</div>';
  });
  catHtml += '</div>';

  container.innerHTML = progressHtml + catHtml;
}

// === A. 改善された声ランキング ===
function renderResolvedRanking() {
  var container = document.getElementById('resolvedRanking');
  var realPosts = posts;
  var resolvedPosts = realPosts.filter(function(p) { return p.resolved; })
    .sort(function(a, b) { return b.agrees - a.agrees; })
    .slice(0, 3);

  if (resolvedPosts.length === 0) {
    container.innerHTML = '<div class="empty-state">まだ改善された声はありません</div>';
    return;
  }

  container.innerHTML = '';
  resolvedPosts.forEach(function(post) {
    var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
    var card = document.createElement('div');
    card.className = 'resolved-rank-card';
    card.innerHTML =
      '<div class="resolved-rank-voice">' +
        '<span class="post-category-badge" style="background:' + (cat ? cat.color : '#999') + '">' + (cat ? catIconHtml(cat, 12) + ' ' + cat.name : '') + '</span>' +
        '<p>' + escapeHtml(post.message) + '</p>' +
      '</div>' +
      '<div class="resolved-rank-result">' +
        '<span class="resolved-rank-arrow">→</span>' +
        '<p>' + uiIcon('check', 14) + ' ' + escapeHtml(post.resolvedMessage) + '</p>' +
      '</div>' +
      '<div class="resolved-rank-meta">' + uiIcon('thumbsup', 13) + ' ' + post.agrees + ' 賛同</div>';
    container.appendChild(card);
  });
}

// === A. 月別投稿数の推移 ===
function renderMonthlyChart() {
  var container = document.getElementById('monthlyChart');
  var realPosts = posts;

  if (realPosts.length === 0) {
    container.innerHTML = '<div class="empty-state">投稿が集まるとグラフが表示されます</div>';
    return;
  }

  var monthMap = {};
  realPosts.forEach(function(p) {
    var d = new Date(p.createdAt);
    var key = d.getFullYear() + '/' + (d.getMonth() + 1);
    monthMap[key] = (monthMap[key] || 0) + 1;
  });

  var months = Object.keys(monthMap).sort();
  var max = Math.max.apply(null, Object.values(monthMap).concat([1]));

  container.innerHTML = '';
  var chartDiv = document.createElement('div');
  chartDiv.className = 'monthly-bars';
  months.forEach(function(m) {
    var count = monthMap[m];
    var pct = (count / max * 100).toFixed(0);
    var bar = document.createElement('div');
    bar.className = 'monthly-bar-col';
    bar.innerHTML =
      '<div class="monthly-bar-value">' + count + '</div>' +
      '<div class="monthly-bar-track"><div class="monthly-bar-fill" style="height:' + pct + '%"></div></div>' +
      '<div class="monthly-bar-label">' + m.split('/')[1] + '月</div>';
    chartDiv.appendChild(bar);
  });
  container.appendChild(chartDiv);
}

// === データエクスプローラー ===
var DATA_TABS = {
  population: {
    title: '人口・世帯',
    render: renderPopulationData,
  },
  medical: {
    title: '医療・福祉',
    render: renderMedicalData,
  },
  education: {
    title: '教育・保育',
    render: renderEducationData,
  },
  business: {
    title: '商業・産業',
    render: renderBusinessData,
  },
  transport: {
    title: '交通',
    render: renderTransportData,
  },
  tourism: {
    title: '観光',
    render: renderTourismData,
  },
};

function initDataExplorer() {
  var tabs = document.getElementById('dataTabs');
  var panel = document.getElementById('dataPanel');
  if (!tabs || !panel) return;

  tabs.addEventListener('click', function(e) {
    var tab = e.target.closest('.data-tab');
    if (!tab) return;
    tabs.querySelectorAll('.data-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    var key = tab.dataset.tab;
    if (DATA_TABS[key]) DATA_TABS[key].render(panel);
  });

  // 初期表示
  renderPopulationData(panel);
}

function renderBarChart(items, unit) {
  var max = Math.max.apply(null, items.map(function(a) { return a.count; }));
  var html = '';
  items.forEach(function(a) {
    var pct = (a.count / max * 100).toFixed(0);
    html +=
      '<div class="chart-row">' +
        '<span class="chart-label" style="width:auto;min-width:90px;">' + a.name + '</span>' +
        '<div class="chart-bar-wrap"><div class="chart-bar" style="width:' + pct + '%;background:' + (a.color || '#2563eb') + '"></div></div>' +
        '<span class="chart-value">' + a.count.toLocaleString() + (unit || '') + '</span>' +
      '</div>';
  });
  return html;
}

function renderPopulationData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('location', 16) + ' 米子市の人口・世帯</h4>' +
    '<p class="card-desc">鳥取県推計人口（2025年4月1日現在）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">143,066</div><div class="data-stat-label">総人口</div><div class="data-stat-sub">前年比 −1,126人</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">64,954</div><div class="data-stat-label">世帯数</div><div class="data-stat-sub">前年比 +293世帯</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">31.3%</div><div class="data-stat-label">高齢化率</div><div class="data-stat-sub">65歳以上の割合</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">12.1%</div><div class="data-stat-label">年少人口比率</div><div class="data-stat-sub">15歳未満の割合</div></div>' +
    '</div>' +
    '<h4>人口推移（国勢調査＋推計）</h4>' +
    '<div class="data-chart-area monthly-chart">' +
      (function() {
        var data = [
          { year: '2000', pop: 149975 },
          { year: '2005', pop: 149584 },
          { year: '2010', pop: 148271 },
          { year: '2015', pop: 148271 },
          { year: '2020', pop: 145014 },
          { year: '2025', pop: 143066 },
        ];
        var max = 155000; var min = 138000; var range = max - min;
        var html = '<div class="monthly-bars">';
        data.forEach(function(d) {
          var pct = ((d.pop - min) / range * 100).toFixed(0);
          var popStr = (d.pop / 10000).toFixed(1) + '万';
          html += '<div class="monthly-bar-col"><div class="monthly-bar-value">' + popStr + '</div><div class="monthly-bar-track"><div class="monthly-bar-fill pop-bar" style="height:' + pct + '%"></div></div><div class="monthly-bar-label">' + d.year + '</div></div>';
        });
        return html + '</div>';
      })() +
    '</div>' +
    '<p class="data-note">' + uiIcon('warning', 14) + ' 25年間で約7,000人減少。世帯数は増加（核家族・単身世帯の増加）</p>' +
    '<p class="data-source">出典：総務省 国勢調査 / 鳥取県推計人口（2025年4月）</p>';
}

function renderMedicalData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('check', 16) + ' 医療・福祉施設</h4>' +
    '<p class="card-desc">米子市内の医療施設数（2025年時点）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">13</div><div class="data-stat-label">病院</div><div class="data-stat-sub">20床以上の医療機関</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">141</div><div class="data-stat-label">一般診療所</div><div class="data-stat-sub">クリニック・医院</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">87</div><div class="data-stat-label">歯科診療所</div><div class="data-stat-sub">歯科医院</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">60</div><div class="data-stat-label">薬局</div><div class="data-stat-sub">調剤薬局</div></div>' +
    '</div>' +
    '<h4>エリア別 診療所数</h4>' +
    renderBarChart([
      { name: '米子駅周辺', count: 58, color: '#6366f1' },
      { name: '車尾・福米', count: 24, color: '#2563eb' },
      { name: '皆生エリア', count: 18, color: '#0ea5e9' },
      { name: '弓ヶ浜', count: 8, color: '#ef4444' },
      { name: '淀江・大篠津', count: 12, color: '#f59e0b' },
      { name: '南部（大山側）', count: 10, color: '#10b981' },
    ]) +
    '<h4 style="margin-top:16px;">介護施設</h4>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">18</div><div class="data-stat-label">特別養護老人ホーム</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">26</div><div class="data-stat-label">デイサービス</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">12</div><div class="data-stat-label">グループホーム</div></div>' +
    '</div>' +
    '<p class="data-note">' + uiIcon('warning', 14) + ' 弓ヶ浜エリアは診療所が少なく、特に小児科が不足</p>' +
    '<p class="data-source">出典：鳥取県 医療施設一覧 / 介護事業所検索（2025年）</p>';
}

function renderEducationData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('note', 16) + ' 教育・保育施設</h4>' +
    '<p class="card-desc">米子市内の学校・保育施設数（2025年度）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">23</div><div class="data-stat-label">小学校</div><div class="data-stat-sub">市立23校</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">11</div><div class="data-stat-label">中学校</div><div class="data-stat-sub">市立10校 / 私立1校</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">7</div><div class="data-stat-label">高等学校</div><div class="data-stat-sub">県立5校 / 私立2校</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">3</div><div class="data-stat-label">大学・高専</div><div class="data-stat-sub">鳥取大医学部 他</div></div>' +
    '</div>' +
    '<h4>保育施設</h4>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">26</div><div class="data-stat-label">認可保育所</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">14</div><div class="data-stat-label">認定こども園</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">5</div><div class="data-stat-label">幼稚園</div></div>' +
      '<div class="data-stat-card" style="background:#dcfce7;"><div class="data-stat-value" style="color:#16a34a;">0人</div><div class="data-stat-label">待機児童数</div><div class="data-stat-sub">5年連続ゼロ達成</div></div>' +
    '</div>' +
    '<h4>児童生徒数の推移</h4>' +
    renderBarChart([
      { name: '2015年', count: 8542, color: '#94a3b8' },
      { name: '2018年', count: 8210, color: '#94a3b8' },
      { name: '2021年', count: 7836, color: '#94a3b8' },
      { name: '2024年', count: 7420, color: '#2563eb' },
    ], '人') +
    '<p class="data-note">' + uiIcon('trending', 14) + ' 児童生徒数は減少傾向。小規模校の統合議論も</p>' +
    '<p class="data-source">出典：米子市教育委員会 / 鳥取県教育委員会（2025年度）</p>';
}

function renderBusinessData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('chart', 16) + ' 商業・産業</h4>' +
    '<p class="card-desc">米子市の経済指標（2024年 経済センサス等）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">6,780</div><div class="data-stat-label">事業所数</div><div class="data-stat-sub">民営事業所</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">65,400</div><div class="data-stat-label">従業者数</div><div class="data-stat-sub">鳥取県内最多</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">2.85%</div><div class="data-stat-label">有効求人倍率</div><div class="data-stat-sub">鳥取県平均 1.42倍</div></div>' +
    '</div>' +
    '<h4>産業別 従業者数</h4>' +
    renderBarChart([
      { name: '卸売・小売業', count: 14200, color: '#f59e0b' },
      { name: '医療・福祉', count: 12800, color: '#6366f1' },
      { name: '製造業', count: 7600, color: '#64748b' },
      { name: '宿泊・飲食', count: 5900, color: '#ec4899' },
      { name: '建設業', count: 4800, color: '#8b5cf6' },
      { name: '運輸・郵便', count: 3200, color: '#0ea5e9' },
      { name: '情報通信', count: 1100, color: '#10b981' },
    ], '人') +
    '<h4 style="margin-top:16px;">近年の商業動向</h4>' +
    '<div class="shop-timeline">' +
      '<div class="shop-event positive"><span class="shop-year">2025</span><span class="shop-badge open">オープン</span><span class="shop-name">コストコ米子倉庫店（崎津）</span></div>' +
      '<div class="shop-event positive"><span class="shop-year">2024</span><span class="shop-badge open">オープン</span><span class="shop-name">KAIKEテラス（皆生温泉）</span></div>' +
      '<div class="shop-event positive"><span class="shop-year">2024</span><span class="shop-badge open">オープン</span><span class="shop-name">スターバックス米子皆生店</span></div>' +
      '<div class="shop-event negative"><span class="shop-year">2023</span><span class="shop-badge close">閉店</span><span class="shop-name">TSUTAYA 角盤町店</span></div>' +
      '<div class="shop-event negative"><span class="shop-year">2022</span><span class="shop-badge close">閉店</span><span class="shop-name">米子しんまち天満屋</span></div>' +
    '</div>' +
    '<p class="data-source">出典：経済センサス / ハローワーク米子（2024年）</p>';
}

function renderTransportData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('warning', 16) + ' 交通インフラ</h4>' +
    '<p class="card-desc">米子市の交通機関データ（2024年度）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">4,068</div><div class="data-stat-label">米子駅 乗車人員/日</div><div class="data-stat-sub">JR西日本（2023年度）</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">92万</div><div class="data-stat-label">米子空港 年間利用者</div><div class="data-stat-sub">2024年度 回復傾向</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">1.42台</div><div class="data-stat-label">自家用車保有/世帯</div><div class="data-stat-sub">車社会の象徴</div></div>' +
    '</div>' +
    '<h4>公共交通路線</h4>' +
    '<div class="transport-list">' +
      '<div class="transport-item"><div class="transport-name">' + catIconCircle(CATEGORIES.find(function(c){return c.id==="transport";}), 10) + ' だんだんバス</div><div class="transport-detail">市内循環 / 約60分間隔 / 運賃150〜300円</div><div class="transport-issue">' + uiIcon('warning', 13) + ' 本数少なく通勤利用困難・日曜運休</div></div>' +
      '<div class="transport-item"><div class="transport-name">' + catIconCircle(CATEGORIES.find(function(c){return c.id==="transport";}), 10) + ' 日交路線バス</div><div class="transport-detail">米子駅〜皆生温泉・境港・大山など</div><div class="transport-issue">' + uiIcon('warning', 13) + ' 郊外路線は減便・廃止傾向</div></div>' +
      '<div class="transport-item"><div class="transport-name">' + catIconCircle(CATEGORIES.find(function(c){return c.id==="transport";}), 10) + ' JR境線</div><div class="transport-detail">米子駅〜境港 / 鬼太郎列車が人気</div><div class="transport-issue">△ 日中は1時間に1〜2本</div></div>' +
      '<div class="transport-item"><div class="transport-name">' + catIconCircle(CATEGORIES.find(function(c){return c.id==="transport";}), 10) + ' JR山陰本線</div><div class="transport-detail">米子〜松江・倉吉 / 特急やくも運行</div><div class="transport-issue">' + uiIcon('check', 13) + ' 2024年 新型やくも導入</div></div>' +
    '</div>' +
    '<p class="data-note">' + uiIcon('warning', 14) + ' 高齢者の免許返納後の移動手段確保が課題</p>' +
    '<p class="data-source">出典：JR西日本 / 日本交通 / 米子市（2024年度）</p>';
}

function renderTourismData(panel) {
  panel.innerHTML =
    '<h4>' + uiIcon('fire', 16) + ' 観光データ</h4>' +
    '<p class="card-desc">米子市・圏域の観光統計（2024年）</p>' +
    '<div class="data-grid">' +
      '<div class="data-stat-card"><div class="data-stat-value">320万</div><div class="data-stat-label">年間観光入込客数</div><div class="data-stat-sub">米子市＋周辺エリア</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">37万</div><div class="data-stat-label">皆生温泉 宿泊者数</div><div class="data-stat-sub">コロナ前比 約85%回復</div></div>' +
      '<div class="data-stat-card"><div class="data-stat-value">58万</div><div class="data-stat-label">大山エリア 来場者</div><div class="data-stat-sub">登山・スキー・キャンプ</div></div>' +
    '</div>' +
    '<h4>皆生温泉 宿泊者数の推移</h4>' +
    renderBarChart([
      { name: '2019年', count: 43, color: '#94a3b8' },
      { name: '2020年', count: 21, color: '#ef4444' },
      { name: '2021年', count: 26, color: '#f59e0b' },
      { name: '2022年', count: 31, color: '#f59e0b' },
      { name: '2023年', count: 35, color: '#0ea5e9' },
      { name: '2024年', count: 37, color: '#10b981' },
    ], '万人') +
    '<h4 style="margin-top:16px;">主要観光スポット</h4>' +
    renderBarChart([
      { name: '皆生温泉', count: 37, color: '#0ea5e9' },
      { name: '大山（だいせん）', count: 58, color: '#10b981' },
      { name: '水木しげるロード', count: 180, color: '#8b5cf6' },
      { name: '花回廊', count: 42, color: '#ec4899' },
      { name: '米子城跡', count: 12, color: '#64748b' },
    ], '万人') +
    '<p class="data-note">' + uiIcon('trending', 14) + ' コロナ後の回復傾向。インバウンドも増加中</p>' +
    '<p class="data-source">出典：鳥取県観光入込客数調査 / 皆生温泉旅館組合（2024年）</p>';
}

async function loadData() {
  // Load agreed set from localStorage (per-user)
  try {
    var agreed = localStorage.getItem('yonago_voice_agreed');
    if (agreed) agreedSet = new Set(JSON.parse(agreed));
  } catch(e) {
    agreedSet = new Set();
  }

  // Load topic votes from localStorage
  try {
    var storedVotes = localStorage.getItem('yonago_topic_votes');
    if (storedVotes) topicVotes = JSON.parse(storedVotes);
  } catch(e) {
    topicVotes = {};
  }

  // Load from Supabase in parallel
  var results = await Promise.allSettled([
    supabaseRequest('GET', 'posts?order=created_at.desc&limit=500'),
    supabaseRequest('GET', 'youtube_topics?order=likes.desc'),
    supabaseRequest('GET', 'resolve_reports?order=created_at.desc'),
  ]);

  // posts
  if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
    posts = results[0].value.map(normalizePost);
  } else {
    console.error('Failed to load posts');
    posts = [];
  }

  // youtube topics
  if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
    youtubeTopics = results[1].value;
  } else {
    console.error('Failed to load YouTube topics');
    youtubeTopics = [];
  }

  // resolve reports
  if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
    resolveReports = results[2].value;
  } else {
    console.error('Failed to load resolve reports');
    resolveReports = [];
  }
}

// === モーダルフォーカス管理 ===
var modalStack = [];

function openModal(overlayId, focusTarget) {
  var overlay = document.getElementById(overlayId);
  if (!overlay) return;
  var trigger = document.activeElement;
  modalStack.push({ overlayId: overlayId, trigger: trigger });
  overlay.classList.add('active');
  if (focusTarget) {
    setTimeout(function() { focusTarget.focus(); }, 50);
  } else {
    var first = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (first) setTimeout(function() { first.focus(); }, 50);
  }
}

function closeModal(overlayId) {
  var overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('active');
  var entry = modalStack.pop();
  if (entry && entry.trigger && typeof entry.trigger.focus === 'function') {
    try { entry.trigger.focus(); } catch(e) {}
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

// === YouTube Topics ===
// ReHacQ/PIVOT style thumbnail designs per topic
var TOPIC_DESIGNS = {
  topic_01: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Kaike_onsen01n3200.jpg/960px-Kaike_onsen01n3200.jpg',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(120,40,0,0.75) 100%)',
    hook: '温泉街のリアル',
    titleHtml: '皆生温泉は<span class="yt-keyword">復活</span>できるのか？',
    accent: '徹底討論',
    stripe: 'linear-gradient(90deg, #ea580c, #fbbf24)',
    summary: 'かつて山陰屈指の温泉街として栄えた皆生温泉。しかし近年は旅館の廃業が相次ぎ、空き建物が目立つように。一方でKAIKEテラスなど新しい動きも。温泉街は「観光地」として再生すべきか、「住民の暮らしの場」として進化すべきか？ データと市民の声から皆生の未来を討論します。',
    noteUrl: 'https://note.com/aoktik/n/n161d83a87e75',
  },
  topic_02: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Yonago_station_South_exit.jpg/960px-Yonago_station_South_exit.jpg',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(30,10,10,0.8) 100%)',
    hook: '通勤ラッシュの闘',
    titleHtml: '米子の<span class="yt-keyword-red">渋滞</span>、なぜ解消されない？',
    accent: '激白',
    stripe: 'linear-gradient(90deg, #dc2626, #f59e0b)',
    summary: '431号線、日野川東IC付近、内浜産業道路——米子市民なら誰もが経験する朝夕の渋滞。付加車線の整備で一部改善されたものの、根本的な解決には至っていません。なぜ渋滞は解消されないのか？ 道路構造・信号制御・都市計画の観点から、市民の不満と改善策を掘り下げます。',
    noteUrl: '',
  },
  topic_03: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Yonago_station_South_exit.jpg/960px-Yonago_station_South_exit.jpg',
    overlay: 'linear-gradient(180deg, rgba(0,20,50,0.3) 0%, rgba(0,40,80,0.8) 100%)',
    hook: '1時間に1本…市民の本音',
    titleHtml: 'だんだんバス、<br>本当に<span class="yt-keyword">使える</span>の？',
    accent: 'なぜ？',
    stripe: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
    summary: '米子市の循環バス「だんだんバス」。運賃150円で市内を回れる便利な存在のはずが、「本数が少なすぎる」「ルートが分かりにくい」と市民の不満は根強い。高齢者の足としても、若者の移動手段としても課題だらけ。利用者数データと市民の声から、公共交通のあるべき姿を考えます。',
    noteUrl: '',
  },
  topic_04: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Yonago_Takashimaya_ac.jpg/960px-Yonago_Takashimaya_ac.jpg',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(50,20,0,0.8) 100%)',
    hook: 'TSUTAYA閉店、天満屋撤退…',
    titleHtml: '角盤町商店街は<br><span class="yt-keyword-red">生き残れる</span>か',
    accent: '衝撃',
    stripe: 'linear-gradient(90deg, #d97706, #fbbf24)',
    summary: '米子の中心市街地・角盤町。天満屋の撤退、TSUTAYA閉店と、象徴的な店舗が次々と姿を消しています。イオンモールや郊外店舗に客足を奪われる中、商店街に未来はあるのか？ 空き店舗率のデータ、新規出店の動き、そして商店街で商売する人たちのリアルな声を集めて討論します。',
    noteUrl: '',
  },
  topic_05: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Yonago_Castle_01.JPG/960px-Yonago_Castle_01.JPG',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(15,15,30,0.85) 100%)',
    hook: '人口14万人割れ目前',
    titleHtml: '米子から若者が<br><span class="yt-keyword-red">消える</span>本当の理由',
    accent: '大激論',
    stripe: 'linear-gradient(90deg, #ef4444, #8b5cf6)',
    summary: '米子市の人口は減少の一途。特に20代の県外流出が深刻で、日本海新聞の調査では20代の約7割が県外移住を考えているという結果も。「娯楽がない」「給料が低い」——若者が去る本当の理由は何か？ そして、残る選択をした若者たちは何を求めているのか？ データと当事者の声で迫ります。',
    noteUrl: '',
  },
  topic_06: {
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Mount_Daisen_2015-05-03_%2817214768368%29.jpg/960px-Mount_Daisen_2015-05-03_%2817214768368%29.jpg',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(30,10,50,0.8) 100%)',
    hook: '内科クリニック3件の現実',
    titleHtml: '弓ヶ浜に<span class="yt-keyword-red">病院がない</span>問題',
    accent: '衝撃事実',
    stripe: 'linear-gradient(90deg, #7c3aed, #ec4899)',
    summary: '弓ヶ浜半島エリアは人口密集地にもかかわらず、内科・小児科クリニックがわずか数件。子どもの急な発熱で米子市街地まで車を走らせる親たちの現実。医師不足？ 採算の問題？ 行政の対応は？ 住民アンケートと医療データから、地域医療の危機的状況を可視化します。',
    noteUrl: '',
  },
};

function renderYoutubeTopics() {
  var container = document.getElementById('youtubeTopicsList');
  if (!container) return;

  if (youtubeTopics.length === 0) {
    container.innerHTML = '<div class="empty-state"><img src="images/yonabou_peeking.png" alt="よな坊" class="empty-mascot">討論テーマを準備中です</div>';
    return;
  }

  container.innerHTML = '';
  youtubeTopics.forEach(function(topic) {
    var design = TOPIC_DESIGNS[topic.id] || {
      photo: '',
      overlay: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
      hook: '',
      titleHtml: escapeHtml(topic.title),
      accent: '討論',
      stripe: 'linear-gradient(90deg, #ef4444, #f59e0b)',
    };
    var cat = CATEGORIES.find(function(c) { return c.id === topic.category; });
    var userVote = topicVotes[topic.id] || null;
    var total = topic.likes + topic.dislikes;
    var likePct = total > 0 ? Math.round(topic.likes / total * 100) : 0;

    var card = document.createElement('div');
    card.className = 'yt-topic-card';

    card.innerHTML =
      '<div class="yt-thumb">' +
        '<div class="yt-thumb-bg"' + (design.photo ? ' style="background-image:url(\'' + design.photo + '\')"' : '') + '></div>' +
        '<div class="yt-thumb-overlay" style="background:' + design.overlay + '"></div>' +
        '<div class="yt-thumb-tag" style="background:' + (cat ? cat.color : '#666') + '">' + (cat ? catIconHtml(cat, 12) + ' ' + cat.name : '') + '</div>' +
        '<div class="yt-thumb-accent">' + design.accent + '</div>' +
        '<div class="yt-thumb-content">' +
          '<div class="yt-thumb-hook">' + design.hook + '</div>' +
          '<div class="yt-thumb-title">' + design.titleHtml + '</div>' +
        '</div>' +
        '<div class="yt-thumb-stripe" style="background:' + design.stripe + '"></div>' +
      '</div>' +
      '<div class="yt-topic-body">' +
        '<p class="yt-topic-subtitle">' + escapeHtml(topic.subtitle || '') + '</p>' +
        '<div class="yt-card-actions">' +
          '<div class="yt-vote-inline">' +
            '<div class="yt-vote-bar-wrap">' +
              '<div class="yt-vote-bar-fill" style="width:' + likePct + '%"></div>' +
            '</div>' +
            '<div class="yt-vote-actions">' +
              '<button class="yt-vote-btn yt-like' + (userVote === 'like' ? ' voted' : '') + '" data-topic="' + topic.id + '" data-vote="like">' +
                uiIcon('thumbsup', 14) + ' 見たい <span>' + topic.likes + '</span>' +
              '</button>' +
              '<button class="yt-vote-btn yt-dislike' + (userVote === 'dislike' ? ' voted' : '') + '" data-topic="' + topic.id + '" data-vote="dislike">' +
                uiIcon('thumbsdown', 14) + ' <span>' + topic.dislikes + '</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<button class="yt-detail-btn" data-topic="' + topic.id + '">' + uiIcon('note', 14) + ' 詳しく</button>' +
        '</div>' +
      '</div>';

    var detailBtn = card.querySelector('.yt-detail-btn');
    if (detailBtn) {
      detailBtn.addEventListener('click', function() {
        openTopicDetail(topic.id);
      });
    }

    card.querySelector('.yt-thumb').addEventListener('click', function() {
      openTopicDetail(topic.id);
    });

    card.querySelectorAll('.yt-vote-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        voteTopic(btn.dataset.topic, btn.dataset.vote);
      });
    });

    container.appendChild(card);
  });
}

function openTopicDetail(topicId) {
  var topic = youtubeTopics.find(function(t) { return t.id === topicId; });
  if (!topic) return;
  var design = TOPIC_DESIGNS[topicId] || {};
  var cat = CATEGORIES.find(function(c) { return c.id === topic.category; });
  var userVote = topicVotes[topicId] || null;
  var total = topic.likes + topic.dislikes;
  var likePct = total > 0 ? Math.round(topic.likes / total * 100) : 0;

  var noteLink = '';
  if (design.noteUrl) {
    noteLink =
      '<a href="' + design.noteUrl + '" target="_blank" rel="noopener noreferrer" class="topic-detail-note-link">' +
        uiIcon('note', 15) + ' noteで詳しく読む' +
      '</a>';
  } else {
    noteLink =
      '<span class="topic-detail-note-link note-coming-soon">' +
        uiIcon('note', 15) + ' note記事 準備中' +
      '</span>';
  }

  var html =
    '<div class="topic-detail-thumb-wrap">' +
      '<div class="yt-thumb">' +
        '<div class="yt-thumb-bg"' + (design.photo ? ' style="background-image:url(\'' + design.photo + '\')"' : '') + '></div>' +
        '<div class="yt-thumb-overlay" style="background:' + (design.overlay || '') + '"></div>' +
        '<div class="yt-thumb-tag" style="background:' + (cat ? cat.color : '#666') + '">' + (cat ? catIconHtml(cat, 12) + ' ' + cat.name : '') + '</div>' +
        '<div class="yt-thumb-accent">' + (design.accent || '討論') + '</div>' +
        '<div class="yt-thumb-content">' +
          '<div class="yt-thumb-hook">' + (design.hook || '') + '</div>' +
          '<div class="yt-thumb-title">' + (design.titleHtml || escapeHtml(topic.title)) + '</div>' +
        '</div>' +
        '<div class="yt-thumb-stripe" style="background:' + (design.stripe || '') + '"></div>' +
      '</div>' +
    '</div>' +
    '<div class="topic-detail-body">' +
      '<p class="topic-detail-summary">' + escapeHtml(design.summary || topic.subtitle || '') + '</p>' +
      noteLink +
      '<div class="topic-detail-vote">' +
        '<div class="yt-vote-bar-wrap">' +
          '<div class="yt-vote-bar-fill" style="width:' + likePct + '%"></div>' +
        '</div>' +
        '<div class="yt-vote-actions">' +
          '<button class="yt-vote-btn yt-like' + (userVote === 'like' ? ' voted' : '') + '" data-topic="' + topicId + '" data-vote="like">' +
            uiIcon('thumbsup', 14) + ' 見たい <span>' + topic.likes + '</span>' +
          '</button>' +
          '<button class="yt-vote-btn yt-dislike' + (userVote === 'dislike' ? ' voted' : '') + '" data-topic="' + topicId + '" data-vote="dislike">' +
            uiIcon('thumbsdown', 14) + ' <span>' + topic.dislikes + '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var content = document.getElementById('topicDetailContent');
  content.innerHTML = html;

  // Attach vote handlers in modal
  content.querySelectorAll('.yt-vote-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      voteTopic(btn.dataset.topic, btn.dataset.vote);
      // Re-render modal after vote
      setTimeout(function() { openTopicDetail(topicId); }, 50);
    });
  });

  openModal('topicDetailOverlay');
  gtag('event', 'topic_detail_open', { topic_id: topicId });
}

function closeTopicDetail() {
  closeModal('topicDetailOverlay');
}

// === よな坊プロフィール ===
function openYonaboProfile() {
  openModal('yonaboProfileOverlay');
}

function closeYonaboProfile() {
  closeModal('yonaboProfileOverlay');
}

// === 防災情報リンク集モーダル ===
function openDisasterModal() {
  openModal('disasterOverlay');
  document.body.style.overflow = 'hidden';
}

function closeDisasterModal() {
  closeModal('disasterOverlay');
  document.body.style.overflow = '';
}

// === YouTube準備中モーダル ===
function openYoutubeModal() {
  openModal('youtubeModalOverlay');
  document.body.style.overflow = 'hidden';
}

function closeYoutubeModal() {
  closeModal('youtubeModalOverlay');
  document.body.style.overflow = '';
}

async function voteTopic(topicId, vote) {
  var topic = youtubeTopics.find(function(t) { return t.id === topicId; });
  if (!topic) return;

  var prev = topicVotes[topicId] || null;

  // If same vote, cancel it
  if (prev === vote) {
    if (vote === 'like') topic.likes = Math.max(0, topic.likes - 1);
    else topic.dislikes = Math.max(0, topic.dislikes - 1);
    delete topicVotes[topicId];
  } else {
    // Remove previous vote
    if (prev === 'like') topic.likes = Math.max(0, topic.likes - 1);
    else if (prev === 'dislike') topic.dislikes = Math.max(0, topic.dislikes - 1);
    // Add new vote
    if (vote === 'like') topic.likes++;
    else topic.dislikes++;
    topicVotes[topicId] = vote;
  }

  // Calculate deltas for RPC call
  var likesDelta = 0;
  var dislikesDelta = 0;
  if (prev === vote) {
    // Cancelled same vote
    if (vote === 'like') likesDelta = -1; else dislikesDelta = -1;
  } else {
    if (prev === 'like') likesDelta = -1;
    else if (prev === 'dislike') dislikesDelta = -1;
    if (vote === 'like') likesDelta += 1; else dislikesDelta += 1;
  }

  localStorage.setItem('yonago_topic_votes', JSON.stringify(topicVotes));
  gtag('event', 'topic_vote', { vote: vote });
  renderYoutubeTopics();

  try {
    await supabaseRequest('POST', 'rpc/update_topic_vote', {
      p_topic_id: topicId,
      p_likes_delta: likesDelta,
      p_dislikes_delta: dislikesDelta,
    });
  } catch (e) {
    console.error('Failed to update topic votes');
  }
}

// === 通報機能 ===
var pendingReportPostId = null;

function openReportForm(postId) {
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;
  pendingReportPostId = postId;
  document.getElementById('reportTarget').textContent =
    '対象: 「' + post.message.slice(0, 50) + (post.message.length > 50 ? '...' : '') + '」';
  document.getElementById('reportDetail').value = '';
  document.getElementById('reportCharCount').textContent = '0/200';
  // Reset radio
  var radios = document.querySelectorAll('input[name="reportReason"]');
  radios.forEach(function(r) { r.checked = false; });
  openModal('reportFormOverlay');
}

function closeReportForm() {
  closeModal('reportFormOverlay');
  pendingReportPostId = null;
}

async function submitReportForm() {
  var reason = document.querySelector('input[name="reportReason"]:checked');
  if (!reason) {
    showToast('通報理由を選択してください', 'info');
    return;
  }

  var detail = sanitizeText(document.getElementById('reportDetail').value, 200);
  if (!pendingReportPostId) return;

  var submitBtn = document.getElementById('submitReport');
  submitBtn.disabled = true;
  submitBtn.textContent = '送信中...';

  try {
    await supabaseRequest('POST', 'post_reports', {
      post_id: pendingReportPostId,
      reason: reason.value,
      detail: detail || null,
    });

    closeReportForm();
    gtag('event', 'post_report', { reason: reason.value });
    showToast('通報を送信しました。ご協力ありがとうございます', 'success');
  } catch (e) {
    console.error('Report failed');
    showToast('通報の送信に失敗しました', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '通報を送信';
  }
}

// === 汎用トースト通知 ===
function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(function() {
    toast.classList.add('show');
  });
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 3500);
}

// === 市外トースト ===
function showOutOfAreaToast() {
  var toast = document.createElement('div');
  toast.className = 'out-of-area-toast';
  toast.innerHTML = '現在地は米子市外のようです。マップから米子市の声をご覧ください ' + uiIconWhite('map', 16);
  document.body.appendChild(toast);
  requestAnimationFrame(function() {
    toast.classList.add('show');
  });
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}


// === SNSシェア機能 ===
var SHARE_INTROS = [
  '「米子市民の声マップ」に声が届きました。',
  '米子市民のリアルな声、聞いてください。',
  'こんな声が届いています。あなたはどう思いますか？',
  '米子のこと、一緒に考えませんか？',
  '今日届いた米子市民の声です。',
  '米子に暮らす人の、ちいさな声。',
  'あなたの街でも同じこと、ありませんか？',
  '米子のまちの声、届いてます。',
];

var SITE_URL = 'https://aoktik.github.io/yonago-voice-map/';
var pendingShareText = '';

function getShareText(post) {
  var intro = SHARE_INTROS[Math.floor(Math.random() * SHARE_INTROS.length)];
  var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
  var catName = cat ? '【' + cat.name + '】' : '';
  var msg = post.message.length > 100 ? post.message.slice(0, 100) + '…' : post.message;
  return intro + '\n\n' + catName + '\n' + msg + '\n\n' + SITE_URL;
}

function openShareSheet(post) {
  pendingShareText = getShareText(post);
  var cat = CATEGORIES.find(function(c) { return c.id === post.category; });
  var catName = cat ? cat.name : '';

  var preview = document.getElementById('shareSheetPreview');
  preview.innerHTML =
    '<div class="share-preview-intro">シェアされる内容</div>' +
    '<div class="share-preview-text">' + escapeHtml(pendingShareText) + '</div>';

  openModal('shareSheetOverlay');
  document.body.style.overflow = 'hidden';
  gtag('event', 'share_sheet_open', { category: catName });
}

function closeShareSheet() {
  closeModal('shareSheetOverlay');
  document.body.style.overflow = '';
}

function shareToX() {
  var url = 'https://x.com/intent/tweet?text=' + encodeURIComponent(pendingShareText);
  window.open(url, '_blank');
  closeShareSheet();
  gtag('event', 'share_action', { platform: 'x' });
}

function shareToThreads() {
  var url = 'https://www.threads.net/intent/post?text=' + encodeURIComponent(pendingShareText);
  window.open(url, '_blank');
  closeShareSheet();
  gtag('event', 'share_action', { platform: 'threads' });
}

function shareCopyText() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(pendingShareText).then(function() {
      var btn = document.getElementById('shareCopyText');
      btn.classList.add('copied');
      btn.querySelector('span').textContent = 'コピーしました！';
      setTimeout(function() {
        btn.classList.remove('copied');
        btn.querySelector('span').textContent = 'テキストをコピー';
      }, 2000);
    });
  } else {
    // fallback
    var ta = document.createElement('textarea');
    ta.value = pendingShareText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    var btn = document.getElementById('shareCopyText');
    btn.classList.add('copied');
    btn.querySelector('span').textContent = 'コピーしました！';
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.querySelector('span').textContent = 'テキストをコピー';
    }, 2000);
  }
  gtag('event', 'share_action', { platform: 'copy' });
}

// === 投稿後ありがとうモーダル（投票誘導） ===
function showPostThanksModal() {
  var overlay = document.getElementById('postThanksOverlay');
  var cardContainer = document.getElementById('postThanksTopicCard');

  // 人気テーマカードを表示
  cardContainer.innerHTML = '';
  if (youtubeTopics.length > 0) {
    var topTopic = youtubeTopics.slice().sort(function(a, b) {
      return (b.likes + b.dislikes) - (a.likes + a.dislikes);
    })[0];
    var design = TOPIC_DESIGNS[topTopic.id] || {};
    var plainTitle = (design.titleHtml || topTopic.title || '').replace(/<[^>]+>/g, '');
    var totalVotes = topTopic.likes + topTopic.dislikes;

    cardContainer.innerHTML =
      '<div class="post-thanks-topic">' +
        (design.photo ?
          '<div class="post-thanks-topic-thumb">' +
            '<img src="' + design.photo + '" alt="">' +
          '</div>' : '') +
        '<div class="post-thanks-topic-info">' +
          '<div class="post-thanks-topic-label">🔥 いま注目のテーマ</div>' +
          '<div class="post-thanks-topic-name">' + escapeHtml(plainTitle) + '</div>' +
          '<div class="post-thanks-topic-votes">' + totalVotes + '票の投票があります</div>' +
        '</div>' +
      '</div>';
  }

  openModal('postThanksOverlay');
  document.body.style.overflow = 'hidden';
  gtag('event', 'post_thanks_modal_show');
}

function closePostThanksModal() {
  closeModal('postThanksOverlay');
  document.body.style.overflow = '';
}

function postThanksGoToTopics() {
  closePostThanksModal();
  gtag('event', 'post_thanks_go_to_topics');
  setTimeout(function() {
    document.getElementById('youtubePanel').scrollIntoView({ behavior: 'smooth' });
  }, 200);
}

document.addEventListener('DOMContentLoaded', init);
