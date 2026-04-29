// State
let currentTab = 'query';
let historyData = [...INIT_HISTORY];
let savedData = [...INIT_SAVED];
let schemaData = [...SCHEMAS];

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.getElementById(`tab-${tabId}`).style.display = tabId === 'schema' ? 'flex' : 'block';
  currentTab = tabId;

  if (tabId === 'history') renderHistory();
  if (tabId === 'saved') renderSaved();
  if (tabId === 'schema') renderSchemas();
}

// Query Builder
const queryForm = document.getElementById('queryForm');
const queryInput = document.getElementById('queryInput');
const queryBtn = document.getElementById('queryBtn');

queryInput.addEventListener('input', () => {
  queryBtn.disabled = !queryInput.value.trim();
});

queryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    if (!queryBtn.disabled) submitQuery();
  }
});

queryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitQuery();
});

function setExample(btn) {
  queryInput.value = btn.innerText;
  queryBtn.disabled = false;
  submitQuery();
}

async function submitQuery() {
  const text = queryInput.value.trim();
  if (!text) return;

  document.getElementById('examplePrompts').style.display = 'none';
  document.getElementById('sqlResult').style.display = 'none';
  document.getElementById('resultsTable').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';
  queryBtn.disabled = true;

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naturalLanguage: text })
    });
    const data = await res.json();
    
    document.getElementById('loadingState').style.display = 'none';
    
    // Show SQL
    document.getElementById('sqlResult').style.display = 'block';
    document.getElementById('sqlCode').innerText = data.sql;
    document.getElementById('sqlMeta').innerText = `${data.rowCount} rows · ${data.executionTime}ms`;
    
    // Update Stats & History
    historyData.unshift({
      id: Date.now().toString(),
      naturalLanguage: text,
      sql: data.sql,
      timestamp: new Date().toISOString(),
      executionTime: data.executionTime,
      rowCount: data.rowCount,
      status: 'success'
    });
    document.getElementById('historyBadge').innerText = historyData.length;
    document.getElementById('statQueries').innerText = parseInt(document.getElementById('statQueries').innerText) + 1;
    
    renderResults(data);
  } catch (err) {
    console.error(err);
    alert("Query failed");
    document.getElementById('loadingState').style.display = 'none';
  }
  queryBtn.disabled = false;
}

function renderResults(data) {
  const container = document.getElementById('resultsTable');
  if (!data.columns || !data.rows) return;

  let html = `<div class="res-table-wrap">
    <div class="res-header">
      <div class="res-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="9" y2="21"/></svg> Results <span class="res-badge">${data.rowCount} rows</span></div>
    </div>
    <div style="overflow-x:auto;">
    <table class="res-table">
      <thead><tr>${data.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>
        ${data.rows.map(r => `<tr>${data.columns.map(c => `<td>${r[c] !== null ? r[c] : '<i>NULL</i>'}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
    </div>
  </div>`;
  container.innerHTML = html;
  container.style.display = 'block';
}

function resetQuery() {
  queryInput.value = '';
  queryBtn.disabled = true;
  document.getElementById('sqlResult').style.display = 'none';
  document.getElementById('resultsTable').style.display = 'none';
  document.getElementById('examplePrompts').style.display = 'block';
}

function copySQL() {
  const sql = document.getElementById('sqlCode').innerText;
  navigator.clipboard.writeText(sql);
  const btn = document.getElementById('copyBtn');
  btn.innerText = '✓ Copied';
  setTimeout(() => btn.innerText = '📋 Copy', 2000);
}

// Modal
function openSaveModal() {
  document.getElementById('saveModal').style.display = 'flex';
  document.getElementById('saveName').value = '';
  document.getElementById('saveTags').value = '';
  document.getElementById('saveName').focus();
}
function closeSaveModal() { document.getElementById('saveModal').style.display = 'none'; }

async function saveQuery() {
  const name = document.getElementById('saveName').value.trim();
  const tagsStr = document.getElementById('saveTags').value.trim();
  const sql = document.getElementById('sqlCode').innerText;
  const nl = queryInput.value.trim();
  
  if (!name) return alert('Name required');
  
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, naturalLanguage: nl, sql, tags })
  });
  const data = await res.json();
  if (data.success) {
    savedData.unshift(data.query);
    document.getElementById('savedBadge').innerText = savedData.length;
    closeSaveModal();
  }
}

// History Tab
function renderHistory() {
  const search = document.getElementById('historySearch').value.toLowerCase();
  const list = document.getElementById('historyList');
  const filtered = historyData.filter(h => h.naturalLanguage.toLowerCase().includes(search));
  
  document.getElementById('historyCount').innerText = filtered.length;
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No history found</p></div>';
    return;
  }
  
  list.innerHTML = filtered.map(h => `
    <div class="list-item" onclick="toggleSql(this)">
      <div class="item-head">
        <div>
          <div class="item-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${h.status==='success'?'#34d399':'#ef4444'}" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ${h.naturalLanguage}
          </div>
          <div class="item-sub">
            <span>${new Date(h.timestamp).toLocaleString()}</span>
            ${h.status === 'success' ? `<span>${h.rowCount} rows</span><span>${h.executionTime}ms</span>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn" onclick="event.stopPropagation(); loadQuery(\`${h.naturalLanguage.replace(/`/g, "'")}\`)">▶ Load</button>
          <button class="action-btn" onclick="event.stopPropagation(); deleteHistory('${h.id}')">🗑</button>
        </div>
      </div>
      <div class="item-sql"><pre>${h.sql}</pre></div>
    </div>
  `).join('');
}
function filterHistory() { renderHistory(); }

async function deleteHistory(id) {
  await fetch(`/api/history/${id}`, { method: 'DELETE' });
  historyData = historyData.filter(h => h.id !== id);
  document.getElementById('historyBadge').innerText = historyData.length;
  renderHistory();
}

// Saved Tab
function renderSaved() {
  const search = document.getElementById('savedSearch').value.toLowerCase();
  const list = document.getElementById('savedList');
  const filtered = savedData.filter(s => s.name.toLowerCase().includes(search) || s.naturalLanguage.toLowerCase().includes(search));
  
  document.getElementById('savedCount').innerText = filtered.length;
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No saved queries found</p></div>';
    return;
  }
  
  list.innerHTML = filtered.map(s => `
    <div class="list-item" onclick="toggleSql(this)">
      <div class="item-head">
        <div>
          <div class="item-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg> ${s.name}</div>
          <div class="item-sub" style="margin-bottom:8px">${s.naturalLanguage}</div>
          <div class="item-sub">
            <span>${new Date(s.createdAt).toLocaleDateString()}</span>
            ${s.tags.map(t => `<span class="badge">${t}</span>`).join('')}
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn" onclick="event.stopPropagation(); loadQuery(\`${s.naturalLanguage.replace(/`/g, "'")}\`)">▶ Load</button>
          <button class="action-btn" onclick="event.stopPropagation(); deleteSaved('${s.id}')">🗑</button>
        </div>
      </div>
      <div class="item-sql"><pre>${s.sql}</pre></div>
    </div>
  `).join('');
}
function filterSaved() { renderSaved(); }

async function deleteSaved(id) {
  await fetch(`/api/saved/${id}`, { method: 'DELETE' });
  savedData = savedData.filter(s => s.id !== id);
  document.getElementById('savedBadge').innerText = savedData.length;
  renderSaved();
}

// Schema Tab
function renderSchemas() {
  const search = document.getElementById('schemaSearch').value.toLowerCase();
  const list = document.getElementById('schemaList');
  const filtered = schemaData.filter(s => s.name.toLowerCase().includes(search));
  
  list.innerHTML = filtered.map(s => `
    <button class="schema-item" onclick="showSchemaDetail('${s.name}', this)">
      <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;margin-right:8px;opacity:0.5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> ${s.name}</span>
      <span style="font-size:10px;opacity:0.5">${s.rowCount >= 1000 ? (s.rowCount/1000).toFixed(0)+'K' : s.rowCount}</span>
    </button>
  `).join('');
}
function filterSchemas() { renderSchemas(); }

function showSchemaDetail(name, btnElement) {
  document.querySelectorAll('.schema-item').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');
  
  const schema = schemaData.find(s => s.name === name);
  const detail = document.getElementById('schemaDetail');
  
  const pkeys = schema.columns.filter(c => c.isPrimary).length;
  const fkeys = schema.columns.filter(c => c.isForeign).length;
  
  detail.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:24px">
      <div><h2 style="font-family:'JetBrains Mono';font-size:20px">${schema.name}</h2><p style="color:var(--text-muted);font-size:14px;margin-top:4px">${schema.description}</p></div>
      <div style="text-align:right"><div style="font-size:24px;font-weight:bold">${schema.rowCount.toLocaleString()}</div><div style="font-size:12px;color:var(--text-muted)">rows</div></div>
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px">
      <div style="background:var(--bg-surface);padding:12px;border-radius:12px;text-align:center"><div style="font-size:18px;font-weight:bold">${schema.columns.length}</div><div style="font-size:12px;color:var(--text-muted)">Columns</div></div>
      <div style="background:var(--bg-surface);padding:12px;border-radius:12px;text-align:center"><div style="font-size:18px;font-weight:bold">${pkeys}</div><div style="font-size:12px;color:var(--text-muted)">Primary Keys</div></div>
      <div style="background:var(--bg-surface);padding:12px;border-radius:12px;text-align:center"><div style="font-size:18px;font-weight:bold">${fkeys}</div><div style="font-size:12px;color:var(--text-muted)">Foreign Keys</div></div>
    </div>
    
    <div class="res-table-wrap" style="margin-top:0">
      <table class="res-table">
        <thead><tr><th>Column</th><th>Type</th><th>Nullable</th><th>References</th></tr></thead>
        <tbody>
          ${schema.columns.map(c => `
            <tr>
              <td style="font-family:'JetBrains Mono';color:${c.isPrimary?'#facc15':c.isForeign?'#60a5fa':'#f3f4f6'}">
                ${c.isPrimary?'🔑 ':c.isForeign?'🔗 ':''}${c.name}
              </td>
              <td style="font-family:'JetBrains Mono';color:#a855f7">${c.type}</td>
              <td>${c.nullable ? '<span class="badge" style="background:rgba(250,204,21,0.2);color:#facc15">YES</span>' : '<span style="color:var(--text-muted)">NO</span>'}</td>
              <td style="font-family:'JetBrains Mono';color:#60a5fa">${c.references || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Utilities
function toggleSql(el) {
  const sqlDiv = el.querySelector('.item-sql');
  sqlDiv.classList.toggle('open');
}

function loadQuery(nl) {
  queryInput.value = nl;
  queryBtn.disabled = false;
  switchTab('query');
  submitQuery();
}
