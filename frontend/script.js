/* ═══════════════════════════════════════════
   ADVENTURE PRO — script.js
═══════════════════════════════════════════ */

let API = 'http://localhost:8080/products';
let allProducts = [];
let currentView = 'grid';
let deleteTargetId = null;

// ── BOOT ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  checkStatus();
  bindPreviewListeners();
  bindKeyboard();

  // restore saved API url
  const saved = localStorage.getItem('apiUrl');
  if (saved) { API = saved; document.getElementById('apiUrl').value = saved; }
});

// ── STATUS CHECK ─────────────────────────────
function checkStatus() {
  const dot  = document.getElementById('statusDot');
  const lbl  = document.getElementById('statusLabel');
  const pill = document.getElementById('statusPill');
  dot.className = 'status-dot';
  lbl.textContent = 'Connecting…';

  fetch(API)
    .then(r => {
      if (r.ok) {
        dot.classList.add('on');
        lbl.textContent = 'API Connected';
      } else throw new Error();
    })
    .catch(() => {
      dot.classList.add('off');
      lbl.textContent = 'Offline';
    });
}

// ── TABS ──────────────────────────────────────
function switchTab(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (el) el.classList.add('active');

  const titles = { dashboard:'Dashboard', catalog:'Product Catalog', add:'Add Product', analytics:'Analytics', settings:'Settings' };
  document.getElementById('pageHeading').textContent = titles[name] || name;

  if (name === 'analytics') buildAnalytics();
  if (name === 'catalog') applyFilters();
}

// ── LOAD PRODUCTS ────────────────────────────
function loadProducts() {
  showSkeletons();
  fetch(API)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      allProducts = data;
      document.getElementById('navBadge').textContent = data.length;
      renderAll();
      buildDashboard();
      populateCatFilter();
    })
    .catch(() => {
      document.getElementById('productContainer').innerHTML = '';
      document.getElementById('emptyState').classList.remove('hidden');
      toast('Cannot reach backend. Is it running?', 'error');
    });
}

function renderAll() {
  applyFilters();
  buildDashboard();
}

// ── FILTER + SORT + SEARCH ───────────────────
function applyFilters() {
  let list = [...allProducts];

  // category
  const cat = document.getElementById('catFilter')?.value || '';
  if (cat) list = list.filter(p => p.category === cat);

  // search
  const q = (document.getElementById('globalSearch')?.value || '').toLowerCase().trim();
  if (q) list = list.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    String(p.id).includes(q)
  );

  // sort
  const sort = document.getElementById('sortBy')?.value || 'id';
  if (sort === 'name')       list.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'price_asc')  list.sort((a,b) => a.price - b.price);
  else if (sort === 'price_desc') list.sort((a,b) => b.price - a.price);
  else list.sort((a,b) => a.id - b.id);

  renderProducts(list);
  const rc = document.getElementById('resultCount');
  if (rc) rc.textContent = list.length + ' product' + (list.length !== 1 ? 's' : '');
}

function liveSearch() {
  applyFilters();
  // also sync overlay if open
  if (!document.getElementById('searchOverlay').classList.contains('hidden')) {
    document.getElementById('overlaySearch').value = document.getElementById('globalSearch').value;
    overlayFilter();
  }
}

// ── RENDER PRODUCTS ──────────────────────────
function renderProducts(list) {
  const container = document.getElementById('productContainer');
  const empty = document.getElementById('emptyState');

  if (!list || list.length === 0) {
    container.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  if (currentView === 'grid') {
    container.innerHTML = list.map((p, i) => `
      <div class="product-card" style="animation-delay:${i * 0.03}s">
        <div class="pc-top">
          <span class="pc-id">ID #${p.id}</span>
          <span class="pc-badge">${esc(p.category)}</span>
        </div>
        <div class="pc-name">${esc(p.name)}</div>
        <div class="pc-desc">${esc(p.description || 'No description provided.')}</div>
        <div class="pc-footer">
          <span class="pc-price">₹${fmt(p.price)}</span>
          <div class="pc-actions">
            <button class="ic-btn edit" title="Edit" onclick="fillEditForm(${p.id},${j(p.name)},${j(p.category)},${p.price},${j(p.description||'')})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="ic-btn del" title="Delete" onclick="promptDelete(${p.id},${j(p.name)})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    // list view
    container.innerHTML = list.map((p, i) => `
      <div class="product-card" style="animation-delay:${i*0.025}s; display:flex; align-items:center; gap:14px; padding:12px 18px;">
        <span style="font-family:var(--f-mono);font-size:11px;color:var(--txt3);min-width:50px;">#${p.id}</span>
        <span style="font-size:10.5px;padding:2px 8px;border-radius:20px;background:var(--surface3);color:var(--txt2);border:1px solid var(--border2);white-space:nowrap;">${esc(p.category)}</span>
        <span style="font-size:13.5px;color:var(--txt);font-weight:500;flex:1;">${esc(p.name)}</span>
        <span style="font-family:var(--f-mono);color:var(--accent);font-weight:700;font-size:13px;min-width:90px;text-align:right;">₹${fmt(p.price)}</span>
        <div style="display:flex;gap:6px;">
          <button class="ic-btn edit" onclick="fillEditForm(${p.id},${j(p.name)},${j(p.category)},${p.price},${j(p.description||'')})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="ic-btn del" onclick="promptDelete(${p.id},${j(p.name)})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }
}

function setView(v) {
  currentView = v;
  const container = document.getElementById('productContainer');
  container.className = 'product-grid' + (v === 'list' ? ' list-view' : '');
  document.getElementById('btnGrid').classList.toggle('active', v === 'grid');
  document.getElementById('btnList').classList.toggle('active', v === 'list');
  applyFilters();
}

// ── DASHBOARD ─────────────────────────────────
function buildDashboard() {
  if (!allProducts.length) {
    ['kTotal','kCats','kAvg','kTotal2'].forEach(id => document.getElementById(id).textContent = '0');
    document.getElementById('kTotalSub').textContent = 'No products yet';
    document.getElementById('kCatsSub').textContent = '—';
    document.getElementById('recentBody').innerHTML = '<tr><td colspan="5" style="color:var(--txt3);font-size:12px;padding:20px;text-align:center;">No products found</td></tr>';
    document.getElementById('catBreakdown').innerHTML = '<p style="font-size:12.5px;color:var(--txt3);">No data</p>';
    return;
  }

  const cats = {};
  allProducts.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  const catArr = Object.entries(cats).sort((a,b) => b[1]-a[1]);

  document.getElementById('kTotal').textContent = allProducts.length;
  document.getElementById('kTotalSub').textContent = allProducts.length + ' items in inventory';
  document.getElementById('kCats').textContent = catArr.length;
  document.getElementById('kCatsSub').textContent = catArr.slice(0,2).map(c=>c[0]).join(', ') + (catArr.length > 2 ? '…' : '');

  const avg = allProducts.reduce((s,p) => s + p.price, 0) / allProducts.length;
  document.getElementById('kAvg').textContent = '₹' + Math.round(avg).toLocaleString('en-IN');

  const total = allProducts.reduce((s,p) => s + p.price, 0);
  document.getElementById('kTotal2').textContent = '₹' + total.toLocaleString('en-IN');

  // recent table
  const recent = [...allProducts].slice(-5).reverse();
  document.getElementById('recentBody').innerHTML = recent.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>${esc(p.name)}</td>
      <td><span class="badge">${esc(p.category)}</span></td>
      <td><span class="price-tag">₹${fmt(p.price)}</span></td>
      <td><button class="tbl-action" onclick="fillEditForm(${p.id},${j(p.name)},${j(p.category)},${p.price},${j(p.description||'')})">Edit</button></td>
    </tr>
  `).join('');

  // category breakdown
  const maxCnt = catArr[0][1];
  document.getElementById('catBreakdown').innerHTML = catArr.map(([cat, cnt]) => `
    <div class="cat-row">
      <div class="cat-row-top">
        <span class="cat-name">${esc(cat)}</span>
        <span class="cat-count">${cnt} item${cnt>1?'s':''}</span>
      </div>
      <div class="cat-bar-wrap">
        <div class="cat-bar" style="width:${Math.round((cnt/maxCnt)*100)}%"></div>
      </div>
    </div>
  `).join('');
}

// ── ANALYTICS ─────────────────────────────────
function buildAnalytics() {
  if (!allProducts.length) {
    ['chartBars','topItems','catShare','priceRanges'].forEach(id => {
      document.getElementById(id).innerHTML = '<p style="color:var(--txt3);font-size:13px;padding:10px 0;">No data available. Add products first.</p>';
    });
    return;
  }

  // Price distribution by category
  const catData = {};
  allProducts.forEach(p => {
    if (!catData[p.category]) catData[p.category] = [];
    catData[p.category].push(p.price);
  });
  const catAvgs = Object.entries(catData)
    .map(([cat, prices]) => [cat, Math.round(prices.reduce((a,b)=>a+b,0)/prices.length)])
    .sort((a,b) => b[1]-a[1]);
  const maxAvg = catAvgs[0][1];
  document.getElementById('chartBars').innerHTML = catAvgs.map(([cat, avg]) => `
    <div class="chart-row">
      <span class="chart-label">${esc(cat)}</span>
      <div class="chart-bar-wrap">
        <div class="chart-fill" style="width:${Math.round((avg/maxAvg)*100)}%"></div>
      </div>
      <span class="chart-val">₹${avg.toLocaleString('en-IN')} avg</span>
    </div>
  `).join('');

  // Top priced
  const top = [...allProducts].sort((a,b)=>b.price-a.price).slice(0,5);
  document.getElementById('topItems').innerHTML = top.map((p,i) => `
    <div class="top-row">
      <span class="top-rank${i===0?' gold':''}">${i+1}</span>
      <span class="top-name">${esc(p.name)}</span>
      <span class="top-price">₹${fmt(p.price)}</span>
    </div>
  `).join('');

  // Category share
  const total = allProducts.length;
  const COLORS = ['dot-c0','dot-c1','dot-c2','dot-c3','dot-c4','dot-c5','dot-c6'];
  const catCounts = Object.entries(catData).sort((a,b)=>b[1].length-a[1].length);
  document.getElementById('catShare').innerHTML = catCounts.map(([cat,prices],i) => `
    <div class="share-row">
      <span class="share-dot ${COLORS[i%COLORS.length]}"></span>
      <span class="share-name">${esc(cat)}</span>
      <span class="share-pct">${Math.round((prices.length/total)*100)}%</span>
    </div>
  `).join('');

  // Price ranges
  const ranges = [
    { label: 'Under ₹500',     min:0,    max:499  },
    { label: '₹500 – ₹1,999', min:500,  max:1999 },
    { label: '₹2,000 – ₹4,999', min:2000, max:4999 },
    { label: '₹5,000+',        min:5000, max:Infinity }
  ];
  document.getElementById('priceRanges').innerHTML = ranges.map(r => {
    const count = allProducts.filter(p => p.price >= r.min && p.price <= r.max).length;
    return `
      <div class="range-card">
        <div class="range-label">${r.label}</div>
        <div class="range-count">${count}</div>
        <div class="range-sub">${count === 1 ? 'product' : 'products'}</div>
      </div>`;
  }).join('');
}

// ── POPULATE CATEGORY FILTER ──────────────────
function populateCatFilter() {
  const cats = [...new Set(allProducts.map(p => p.category))].sort();
  const sel = document.getElementById('catFilter');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${esc(c)}" ${c===cur?'selected':''}>${esc(c)}</option>`).join('');

  // datalist for add form
  const dl = document.getElementById('catSuggestions');
  if (dl) dl.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
}

// ── LIVE PREVIEW ──────────────────────────────
function bindPreviewListeners() {
  const fields = [
    ['f-id',       'prevId',    v => v ? `ID #${v}` : 'ID #—'],
    ['f-name',     'prevName',  v => v || 'Product Name'],
    ['f-category', 'prevCat',   v => v || 'Category'],
    ['f-price',    'prevPrice', v => v ? `₹${Number(v).toLocaleString('en-IN')}` : '₹ —'],
    ['f-desc',     'prevDesc',  v => v || 'Description will appear here…'],
  ];
  fields.forEach(([inputId, outputId, fn]) => {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', () => {
      document.getElementById(outputId).textContent = fn(el.value.trim());
    });
  });
}

// ── ADD PRODUCT ───────────────────────────────
function addProduct() {
  const id   = parseInt(v('f-id'));
  const name = v('f-name').trim();
  const cat  = v('f-category').trim();
  const price= parseInt(v('f-price'));
  const desc = v('f-desc').trim();

  if (!id || !name || !cat || !price) {
    showMsg('addMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  const payload = { id, name, category: cat, price, description: desc };

  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(r => { if (!r.ok) throw new Error('Server error ' + r.status); return r.json(); })
    .then(() => {
      showMsg('addMsg', `"${name}" added successfully!`, 'success');
      clearAddForm();
      loadProducts();
      toast(`"${name}" added to inventory`, 'success');
    })
    .catch(e => showMsg('addMsg', 'Failed: ' + e.message, 'error'));
}

function clearAddForm() {
  ['f-id','f-name','f-category','f-price','f-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  hideMsg('addMsg');
  resetPreview();
}

function resetPreview() {
  document.getElementById('prevId').textContent = 'ID #—';
  document.getElementById('prevName').textContent = 'Product Name';
  document.getElementById('prevCat').textContent = 'Category';
  document.getElementById('prevPrice').textContent = '₹ —';
  document.getElementById('prevDesc').textContent = 'Description will appear here…';
}

// ── EDIT FORM FILL ────────────────────────────
function fillEditForm(id, name, cat, price, desc) {
  switchTab('settings', document.querySelector('[data-tab=settings]'));
  setTimeout(() => {
    sv('e-id', id); sv('e-name', name); sv('e-cat', cat); sv('e-price', price); sv('e-desc', desc);
    document.getElementById('e-id').scrollIntoView({ behavior: 'smooth', block: 'center' });
    hideMsg('editMsg');
  }, 80);
}

function fetchForEdit() {
  const id = parseInt(v('e-id'));
  if (!id) { showMsg('editMsg','Enter a product ID first.','error'); return; }
  fetch(`${API}/${id}`)
    .then(r => { if (!r.ok) throw new Error('Product not found'); return r.json(); })
    .then(p => { sv('e-name',p.name); sv('e-cat',p.category); sv('e-price',p.price); sv('e-desc',p.description||''); showMsg('editMsg','Product loaded.','success'); })
    .catch(e => showMsg('editMsg', e.message, 'error'));
}

function updateProduct() {
  const id    = parseInt(v('e-id'));
  const name  = v('e-name').trim();
  const cat   = v('e-cat').trim();
  const price = parseInt(v('e-price'));
  const desc  = v('e-desc').trim();

  if (!id) { showMsg('editMsg','Enter a Product ID.','error'); return; }

  const payload = { id, name, category: cat, price, description: desc };
  fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(r => { if (!r.ok) throw new Error('Update failed'); return r.json(); })
    .then(() => { showMsg('editMsg','Product updated!','success'); loadProducts(); toast(`Product #${id} updated`,'success'); })
    .catch(e => showMsg('editMsg', e.message,'error'));
}

// ── DELETE ────────────────────────────────────
function promptDelete(id, name) {
  deleteTargetId = id;
  document.getElementById('modalText').textContent = `Delete "${name}" (ID #${id})? This cannot be undone.`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function openDeleteModal() {
  const id = parseInt(v('e-id'));
  if (!id) { showMsg('editMsg','Enter a Product ID to delete.','error'); return; }
  promptDelete(id, `Product #${id}`);
}

function closeModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  deleteTargetId = null;
}

function confirmDelete() {
  if (!deleteTargetId) return;
  const id = deleteTargetId;
  closeModal();
  fetch(`${API}/${id}`, { method: 'DELETE' })
    .then(r => r.text())
    .then(() => {
      loadProducts();
      toast(`Product #${id} deleted`, 'success');
      showMsg('editMsg', `Product #${id} deleted.`, 'success');
      ['e-id','e-name','e-cat','e-price','e-desc'].forEach(i => { const el=document.getElementById(i); if(el) el.value=''; });
    })
    .catch(() => toast('Delete failed', 'error'));
}

// ── SETTINGS ACTIONS ──────────────────────────
function testConnection() {
  const url = v('apiUrl').trim();
  if (!url) return;
  showMsg('connResult', 'Testing…', '');
  fetch(url)
    .then(r => { if (r.ok) { API = url; localStorage.setItem('apiUrl', url); showMsg('connResult','✓ Connected successfully!','success'); checkStatus(); loadProducts(); } else throw new Error('Status ' + r.status); })
    .catch(e => showMsg('connResult', '✗ Failed: ' + e.message, 'error'));
}

function exportData() {
  if (!allProducts.length) { toast('No data to export', 'error'); return; }
  const blob = new Blob([JSON.stringify(allProducts, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'adventure-products.json';
  a.click();
  toast('Exported ' + allProducts.length + ' products', 'success');
}

function copyApiUrl() {
  navigator.clipboard.writeText(API).then(() => toast('API URL copied!', 'success'));
}

// ── SEARCH OVERLAY ────────────────────────────
function openOverlay() {
  document.getElementById('searchOverlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('overlaySearch').focus(), 50);
}
function closeOverlay() {
  document.getElementById('searchOverlay').classList.add('hidden');
  document.getElementById('overlaySearch').value = '';
}
function overlayFilter() {
  const q = document.getElementById('overlaySearch').value.toLowerCase().trim();
  const res = document.getElementById('overlayResults');
  if (!q) { res.innerHTML = '<div class="overlay-empty">Start typing to search…</div>'; return; }
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    String(p.id).includes(q)
  );
  if (!filtered.length) { res.innerHTML = '<div class="overlay-empty">No products found</div>'; return; }
  res.innerHTML = filtered.slice(0,8).map(p => `
    <div class="overlay-item" onclick="selectOverlayItem(${p.id},${j(p.name)},${j(p.category)},${p.price},${j(p.description||'')})">
      <span class="overlay-item-id">#${p.id}</span>
      <span class="overlay-item-name">${esc(p.name)}</span>
      <span class="overlay-item-cat">${esc(p.category)}</span>
      <span class="overlay-item-price">₹${fmt(p.price)}</span>
    </div>
  `).join('');
}
function selectOverlayItem(id, name, cat, price, desc) {
  closeOverlay();
  fillEditForm(id, name, cat, price, desc);
}

// ── KEYBOARD ──────────────────────────────────
function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openOverlay();
    }
    if (e.key === 'Escape') {
      closeModal();
      closeOverlay();
    }
  });
  document.getElementById('searchOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('searchOverlay')) closeOverlay();
  });
  document.getElementById('deleteModal').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteModal')) closeModal();
  });
  // open overlay from topbar search click
  document.getElementById('globalSearch').addEventListener('focus', () => {
    openOverlay();
    setTimeout(() => document.getElementById('overlaySearch').focus(), 80);
  });
}

// ── SIDEBAR TOGGLE ────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mw = document.querySelector('.main-wrap');
  sb.classList.toggle('collapsed');
  mw.classList.toggle('expanded');
}

// ── SKELETONS ─────────────────────────────────
function showSkeletons() {
  const container = document.getElementById('productContainer');
  if (!container) return;
  document.getElementById('emptyState').classList.add('hidden');
  container.innerHTML = Array(6).fill(`
    <div class="skel-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <div class="skel" style="height:11px;width:40px;"></div>
        <div class="skel" style="height:18px;width:70px;border-radius:20px;"></div>
      </div>
      <div class="skel" style="height:15px;width:80%;margin-bottom:8px;"></div>
      <div class="skel" style="height:12px;width:100%;margin-bottom:4px;"></div>
      <div class="skel" style="height:12px;width:65%;margin-bottom:16px;"></div>
      <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);">
        <div class="skel" style="height:20px;width:80px;"></div>
        <div class="skel" style="height:28px;width:60px;border-radius:7px;"></div>
      </div>
    </div>
  `).join('');
}

// ── TOAST ─────────────────────────────────────
let toastTimer;
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  t.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  t.className = 'toast' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── MSG HELPERS ───────────────────────────────
function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.className = 'inline-msg ' + type;
  el.classList.remove('hidden');
}
function hideMsg(id) { document.getElementById(id)?.classList.add('hidden'); }

// ── DOM / UTILS ───────────────────────────────
const v  = id => document.getElementById(id)?.value || '';
const sv = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
const esc = str => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const j   = val => JSON.stringify(val);
const fmt = n => Number(n).toLocaleString('en-IN');
