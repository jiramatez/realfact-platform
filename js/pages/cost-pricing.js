/* ================================================================
   Page Modules — Cost & Pricing (split into 4 separate modules)
   ================================================================ */

window.Pages = window.Pages || {};

/* ================================================================
   1. window.Pages.costPricing — Cost Configuration
   ================================================================ */
window.Pages.costPricing = {

  // ─── State: display unit for Per Token rows ───
  _displayUnit: 'per-token',  // 'per-token' | 'per-1m'

  // ─── Helper: re-render page ───
  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.costPricing.render();
    window.Pages.costPricing.init();
  },

  // ─── Shared Helper: format cost with precision (non-token) ───
  _fmtCost(n) {
    if (n == null) return '—';
    return n.toFixed(2) + ' THB';
  },

  // ─── Format a per-token value in the selected display unit ───
  _fmtToken(n, unit) {
    if (n == null) return '—';
    const v = (unit === 'per-1m') ? n * 1e6 : n;
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (v >= 0.01) return v.toFixed(2);
    if (v >= 0.0001) return v.toFixed(4);
    if (v === 0) return '0.00';
    return v.toPrecision(3);
  },

  // ─── Build cost cell HTML for a row ───
  _costCell(c) {
    const self = window.Pages.costPricing;
    const unit = self._displayUnit;
    if (c.billingType !== 'Per Token') {
      const suffix = c.billingType === 'Per Minute' ? '/min' : '/req';
      return `<span class="mono font-600">${c.costPerUnit.toFixed(2)}</span><span class="text-xs text-muted"> THB ${suffix}</span>`;
    }
    const unitLabel = unit === 'per-1m' ? '/1M token' : '/token';
    const inpStr = self._fmtToken(c.costPerUnit, unit);
    if (c.outputCostPerUnit != null) {
      const outStr = self._fmtToken(c.outputCostPerUnit, unit);
      return `<div style="display:flex;flex-direction:column;gap:3px;">
        <div style="display:flex;align-items:baseline;gap:4px;"><span class="text-xs text-muted" style="min-width:36px;">Input</span><span class="mono font-600">${inpStr}</span><span class="text-xs text-muted"> THB${unitLabel}</span></div>
        <div style="display:flex;align-items:baseline;gap:4px;"><span class="text-xs text-muted" style="min-width:36px;">Output</span><span class="mono font-600">${outStr}</span><span class="text-xs text-muted"> THB${unitLabel}</span></div>
      </div>`;
    }
    return `<span class="mono font-600">${inpStr}</span><span class="text-xs text-muted"> THB${unitLabel}</span>`;
  },

  // ─── Shared Helper: provider chip ───
  _providerChip(provider) {
    const map = {
      'Anthropic':   'chip-orange',
      'OpenAI':      'chip-green',
      'Google':      'chip-blue',
      'ElevenLabs':  'chip-purple',
      'RealfactAI':  'chip-yellow',
    };
    return `<span class="chip ${map[provider] || 'chip-gray'}">${provider}</span>`;
  },

  // ─── Shared Helper: billing type chip ───
  _billingChip(type) {
    const map = {
      'Per Minute':  'chip-blue',
      'Per Request': 'chip-orange',
      'Per Token':   'chip-purple',
    };
    return `<span class="chip ${map[type] || 'chip-gray'}">${type}</span>`;
  },

  // ─── Shared Helper: snapshot type chip ───
  _snapTypeChip(type) {
    return type === 'Default'
      ? '<span class="chip chip-blue">Default</span>'
      : '<span class="chip chip-orange">Custom</span>';
  },

  render() {
    const d = window.MockData;
    const costConfig = d.costConfig;
    const mc = d.marginConfig;
    const snapshots = d.snapshots;
    const priceLocks = d.priceLocks;
    const ccr = d.costChangeRequests;
    const mcr = d.marginChangeRequests;
    const self = window.Pages.costPricing;
    const unit = self._displayUnit;

    // Stats
    const totalServices = costConfig.length;
    const activeServices = costConfig.filter(c => c.status === 'Active').length;
    const pendingCCR = ccr.filter(r => r.status === 'Pending').length;
    const pendingMCR = mcr.filter(r => r.status === 'Pending').length;
    const totalPendingRequests = pendingCCR + pendingMCR;
    const activeSnapshots = snapshots.filter(s => s.isActive).length;
    const activeLocks = priceLocks.filter(pl => pl.status === 'Active').length;

    // ─── Safeguard Alerts data ───
    const alerts = d.safeguardAlerts || [];
    const severityStyles = {
      critical: { border: 'var(--error)', bg: 'rgba(239,68,68,0.08)', icon: 'var(--error)' },
      warning:  { border: '#f59e0b',      bg: 'rgba(245,158,11,0.08)', icon: '#f59e0b' },
      info:     { border: 'var(--primary)', bg: 'rgba(59,130,246,0.08)', icon: 'var(--primary)' },
    };

    // ─── Settlement summary for Package Price Guard ───
    const settlements = d.settlements || [];
    const grandTotalCost = settlements.reduce((s, stl) => s + stl.summary.totalCost, 0);
    const grandTotalTokens = settlements.reduce((s, stl) => s + stl.summary.tokensToDeduct, 0);
    const avgCostPerToken = grandTotalTokens > 0 ? grandTotalCost / grandTotalTokens : 0;
    const packages = d.tokenPackages || [];

    // ─── Profit Dashboard from settlements ───
    const grandTotalSell = settlements.reduce((s, stl) => s + stl.summary.totalSell, 0);
    const grandProfit = grandTotalSell - grandTotalCost;
    const grandBlendedMargin = grandTotalSell > 0 ? ((1 - grandTotalCost / grandTotalSell) * 100) : 0;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">COST & PRICING</h1>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-pricing"><i class="fa-solid fa-file-export"></i> ส่งออกข้อมูล</button>
        </div>
      </div>

      <!-- Safeguard Alerts Section -->
      ${alerts.length ? `
        <div class="section-title mb-12"><i class="fa-solid fa-bell"></i> การแจ้งเตือน</div>
        <div class="flex-col gap-12 mb-24">
          ${alerts.map(a => {
            const sty = severityStyles[a.severity] || severityStyles.info;
            return `
              <div class="card p-16" style="border-left:4px solid ${sty.border};background:${sty.bg};">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-12">
                    <i class="fa-solid ${a.icon}" style="color:${sty.icon};font-size:18px;"></i>
                    <div>
                      <div class="font-600">${a.title}</div>
                      <div class="text-sm text-muted mt-2">${a.message}</div>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline alert-action-btn" data-section="${a.action.section}">
                    ${a.action.label} <i class="fa-solid fa-arrow-right" style="margin-left:4px;font-size:10px;"></i>
                  </button>
                </div>
              </div>`;
          }).join('')}
        </div>
      ` : ''}

      <!-- Stats Row -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Service Codes</span>
            <div class="stat-icon blue"><i class="fa-solid fa-cubes"></i></div>
          </div>
          <div class="stat-value mono">${totalServices}</div>
          <div class="stat-change up"><i class="fa-solid fa-circle-check"></i> ${activeServices} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Global Margin</span>
            <div class="stat-icon green"><i class="fa-solid fa-percent"></i></div>
          </div>
          <div class="stat-value mono">${mc.global}%</div>
          <div class="stat-change up">อัตรากำไรมาตรฐาน</div>
        </div>
        <div class="stat-card clickable" onclick="App.navigate('cost-change-requests')" style="cursor:pointer;">
          <div class="stat-header">
            <span class="stat-label">คำขอรอดำเนินการ</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-clock-rotate-left"></i></div>
          </div>
          <div class="stat-value mono">${totalPendingRequests}</div>
          <div class="stat-change ${totalPendingRequests > 0 ? 'down' : 'up'}">${pendingCCR} Cost / ${pendingMCR} Margin</div>
        </div>
        <div class="stat-card clickable" onclick="App.navigate('cost-snapshots')" style="cursor:pointer;">
          <div class="stat-header">
            <span class="stat-label">Snapshots & Price Locks</span>
            <div class="stat-icon purple"><i class="fa-solid fa-camera"></i></div>
          </div>
          <div class="stat-value mono">${activeSnapshots}</div>
          <div class="stat-change up"><i class="fa-solid fa-lock"></i> ${activeLocks} Price Lock</div>
        </div>
      </div>

      <!-- Profit Dashboard (from Settlements) -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-coins"></i> สรุปต้นทุน &amp; กำไร (Token Economy)</div>
      <div class="text-xs text-muted mb-16">คำนวณจาก Settlement records | Token ที่หัก = Sell Price (THB) — ไม่มี conversion</div>

      <div class="grid-3 gap-16 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Sessions ทั้งหมด</span>
            <div class="stat-icon blue"><i class="fa-solid fa-list-check"></i></div>
          </div>
          <div class="stat-value mono">${settlements.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Tokens หัก (= Sell THB)</span>
            <div class="stat-icon purple"><i class="fa-solid fa-coins"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(parseFloat(grandTotalTokens.toFixed(3)))}</div>
          <div class="stat-change up">= ${grandTotalSell.toFixed(2)} THB</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ต้นทุนรวม</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-receipt"></i></div>
          </div>
          <div class="stat-value mono" style="color:var(--error);">${grandTotalCost.toFixed(2)}</div>
          <div class="stat-change up">THB</div>
        </div>
      </div>
      <div class="grid-3 gap-16 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ราคาขายรวม / Tokens หัก</span>
            <div class="stat-icon green"><i class="fa-solid fa-money-bill-trend-up"></i></div>
          </div>
          <div class="stat-value mono" style="color:var(--primary);">${grandTotalSell.toFixed(2)}</div>
          <div class="stat-change up">THB</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">กำไรรวม</span>
            <div class="stat-icon green"><i class="fa-solid fa-chart-line"></i></div>
          </div>
          <div class="stat-value mono" style="color:var(--success);">${grandProfit.toFixed(2)}</div>
          <div class="stat-change up">THB</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Blended Margin</span>
            <div class="stat-icon green"><i class="fa-solid fa-percent"></i></div>
          </div>
          <div class="stat-value mono" style="color:var(--success);">${grandBlendedMargin.toFixed(1)}%</div>
        </div>
      </div>

      <!-- Per-platform breakdown table -->
      <div class="table-wrap mb-24">
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Sessions</th>
              <th>Tokens หัก</th>
              <th>ต้นทุนรวม (THB)</th>
              <th>ราคาขายรวม (THB)</th>
              <th>กำไร (THB)</th>
              <th>Blended Margin</th>
            </tr>
          </thead>
          <tbody>
            ${d.subPlatforms.map(sp => {
              const spSettlements = settlements.filter(stl => stl.subPlatform === sp.code);
              if (!spSettlements.length) {
                return '<tr>' +
                  '<td><div class="flex items-center gap-8"><div style="width:10px;height:10px;border-radius:3px;background:' + sp.primaryColor + ';"></div><span class="font-600">' + sp.name + '</span></div></td>' +
                  '<td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td>' +
                  '</tr>';
              }
              const spCost = spSettlements.reduce((s, stl) => s + stl.summary.totalCost, 0);
              const spSell = spSettlements.reduce((s, stl) => s + stl.summary.totalSell, 0);
              const spTokens = spSettlements.reduce((s, stl) => s + stl.summary.tokensToDeduct, 0);
              const spProfit = spSell - spCost;
              const spMargin = spSell > 0 ? ((1 - spCost / spSell) * 100) : 0;
              return '<tr>' +
                '<td><div class="flex items-center gap-8"><div style="width:10px;height:10px;border-radius:3px;background:' + sp.primaryColor + ';"></div><span class="font-600">' + sp.name + '</span></div></td>' +
                '<td class="mono">' + spSettlements.length + '</td>' +
                '<td class="mono">' + d.formatNumber(parseFloat(spTokens.toFixed(3))) + '</td>' +
                '<td class="mono" style="color:var(--error);">' + spCost.toFixed(2) + '</td>' +
                '<td class="mono" style="color:var(--primary);">' + spSell.toFixed(2) + '</td>' +
                '<td class="mono font-700" style="color:var(--success);">' + spProfit.toFixed(2) + '</td>' +
                '<td><span class="chip ' + (spMargin >= 30 ? 'chip-green' : 'chip-orange') + ' text-xs mono">' + spMargin.toFixed(1) + '%</span></td>' +
                '</tr>';
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Settlement Log Section -->
      <div class="divider mb-20"></div>
      <div class="flex items-center justify-between mb-12" id="settlement-log">
        <div class="section-title"><i class="fa-solid fa-scroll"></i> Settlement Log (ประวัติการคำนวณต่อ Session)</div>
        <a href="#cost-settlement-log" class="text-sm font-600" style="color:var(--primary);text-decoration:none;">ดู Settlement Log ทั้งหมด <i class="fa-solid fa-arrow-right"></i></a>
      </div>
      <div class="text-xs text-muted mb-16">คลิกแถวเพื่อดูรายละเอียด breakdown ทุก service | Token ที่หัก = Sell Price</div>
      <div class="table-wrap mb-24">
        <table>
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Tenant</th>
              <th>วันที่</th>
              <th>ต้นทุนรวม</th>
              <th>ราคาขายรวม</th>
              <th>Token หัก</th>
              <th>กำไร</th>
              <th>Margin%</th>
            </tr>
          </thead>
          <tbody>
            ${settlements.map(stl => `
              <tr class="settlement-row" data-settlement-id="${stl.settlementId}" style="cursor:pointer;">
                <td class="mono text-primary font-600" title="${stl.sessionId}">${stl.sessionId.substring(0, 10)}...</td>
                <td class="font-600">${stl.tenantName}</td>
                <td class="mono text-sm">${stl.date}</td>
                <td class="mono" style="color:var(--error);">${stl.summary.totalCost.toFixed(2)}</td>
                <td class="mono" style="color:var(--primary);">${stl.summary.totalSell.toFixed(2)}</td>
                <td class="mono font-600">${stl.summary.tokensToDeduct.toFixed(3)}</td>
                <td class="mono font-700" style="color:var(--success);">${stl.summary.profit.toFixed(2)}</td>
                <td><span class="chip ${stl.summary.blendedMargin >= 30 ? 'chip-green' : 'chip-orange'} text-xs mono">${stl.summary.blendedMargin.toFixed(1)}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Package Price Guard Section -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12" id="package-guard"><i class="fa-solid fa-shield-halved"></i> Package Price Guard</div>
      <div class="card p-16 mb-16" style="background:rgba(59,130,246,0.06);border:1px solid var(--border);">
        <div class="flex items-center gap-8 mb-8">
          <i class="fa-solid fa-chart-simple" style="color:var(--primary);"></i>
          <span class="font-600">avgCostPerToken (จาก ${settlements.length} settlements)</span>
        </div>
        <div class="mono font-700" style="font-size:24px;color:var(--primary);">${avgCostPerToken.toFixed(4)} THB</div>
        <div class="text-xs text-muted mt-4">avgCostPerToken = totalCost (${grandTotalCost.toFixed(2)}) / totalTokensDeducted (${grandTotalTokens.toFixed(3)})</div>
      </div>
      <div class="table-wrap mb-24">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Tokens</th>
              <th>ราคา (THB)</th>
              <th>ราคา/Token</th>
              <th>avgCost/Token</th>
              <th>Margin vs Cost</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${packages.map(pkg => {
              const pricePerToken = pkg.tokens > 0 ? pkg.price / pkg.tokens : 0;
              const isSafe = pricePerToken >= avgCostPerToken;
              const marginVsCost = avgCostPerToken > 0 ? ((pricePerToken - avgCostPerToken) / avgCostPerToken * 100) : 0;
              return '<tr>' +
                '<td class="font-600">' + pkg.name + ' <span class="text-xs text-muted">(' + pkg.id + ')</span></td>' +
                '<td class="mono">' + d.formatNumber(pkg.tokens) + '</td>' +
                '<td class="mono">' + d.formatNumber(pkg.price) + '</td>' +
                '<td class="mono font-600">' + pricePerToken.toFixed(2) + '</td>' +
                '<td class="mono text-muted">' + avgCostPerToken.toFixed(4) + '</td>' +
                '<td class="mono font-600" style="color:' + (isSafe ? 'var(--success)' : 'var(--error)') + ';">' + (marginVsCost >= 0 ? '+' : '') + marginVsCost.toFixed(1) + '%</td>' +
                '<td><span class="chip ' + (isSafe ? 'chip-green' : 'chip-red') + '">' + (isSafe ? '<i class="fa-solid fa-check"></i> Safe' : '<i class="fa-solid fa-xmark"></i> Danger') + '</span></td>' +
                '</tr>';
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Cost Configuration Table -->
      <div class="divider mb-20"></div>
      <div class="flex justify-between items-center mb-16">
        <div class="flex items-center gap-12">
          <div class="section-title">ตารางต้นทุนบริการ</div>
          <!-- Per Token unit display toggle -->
          <div style="display:flex;border:1px solid var(--border);border-radius:6px;overflow:hidden;">
            <button id="unit-toggle-token" style="padding:3px 10px;font-size:11px;border:none;cursor:pointer;background:${unit === 'per-token' ? 'var(--primary)' : 'transparent'};color:${unit === 'per-token' ? '#fff' : 'var(--text-muted)'};">/Token</button>
            <button id="unit-toggle-1m" style="padding:3px 10px;font-size:11px;border:none;cursor:pointer;border-left:1px solid var(--border);background:${unit === 'per-1m' ? 'var(--primary)' : 'transparent'};color:${unit === 'per-1m' ? '#fff' : 'var(--text-muted)'};">/1M Tokens</button>
          </div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="App.navigate('cost-margin')"><i class="fa-solid fa-percent"></i> Margin Config</button>
          <button class="btn btn-primary btn-sm" id="btn-add-cost"><i class="fa-solid fa-plus"></i> เพิ่ม Service Code</button>
        </div>
      </div>
      <!-- Cost Table Filter Bar -->
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="cost-search" placeholder="ค้นหา Service Code / ชื่อบริการ...">
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select class="form-input" id="cost-provider-filter">
            <option value="all">All Provider</option>
            <option value="Anthropic">Anthropic</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Google">Google</option>
            <option value="ElevenLabs">ElevenLabs</option>
            <option value="RealfactAI">RealfactAI</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select class="form-input" id="cost-status-filter">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div class="table-wrap" id="cost-table-wrap"></div>
    `;
  },

  _renderCostTable() {
    const d = window.MockData;
    const self = window.Pages.costPricing;
    const costConfig = d.costConfig;
    const search = (document.getElementById('cost-search') || {}).value.trim().toLowerCase();
    const provider = (document.getElementById('cost-provider-filter') || {}).value;
    const status = (document.getElementById('cost-status-filter') || {}).value;

    let filtered = costConfig;
    if (search) {
      filtered = filtered.filter(c =>
        c.serviceCode.toLowerCase().includes(search) || c.name.toLowerCase().includes(search)
      );
    }
    if (provider !== 'all') filtered = filtered.filter(c => c.provider === provider);
    if (status !== 'all') filtered = filtered.filter(c => c.status === status);

    const wrap = document.getElementById('cost-table-wrap');
    if (!wrap) return;

    let html = `<table><thead><tr>
      <th>Service Code</th><th>ชื่อบริการ</th><th>Provider</th><th>Model</th>
      <th>Billing Type</th><th>Cost / Unit</th><th>วันที่มีผล</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th>
    </tr></thead><tbody>`;
    filtered.forEach((c, idx) => {
      const origIdx = costConfig.indexOf(c);
      html += `<tr>
        <td class="mono text-primary font-600">${c.serviceCode}</td>
        <td class="font-600">${c.name}</td>
        <td>${self._providerChip(c.provider)}</td>
        <td class="mono text-sm text-muted">${c.model}</td>
        <td>${self._billingChip(c.billingType)}</td>
        <td>${self._costCell(c)}</td>
        <td class="text-sm text-muted">${c.effectiveDate}</td>
        <td>${d.statusChip(c.status)}</td>
        <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${c.modifiedDate || '-'}</div>${c.modifiedBy ? `<div class="text-xs text-dim">${c.modifiedBy.split('@')[0]}</div>` : ''}</td>
        <td>${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-sm btn-outline cost-edit-btn" data-idx="${origIdx}"><i class="fa-solid fa-pen"></i> แก้ไข</button>` : ''}</td>
      </tr>`;
    });
    if (!filtered.length) html += '<tr><td colspan="10" style="text-align:center;padding:2rem;" class="text-muted">ไม่พบรายการ</td></tr>';
    html += '</tbody></table>';
    wrap.innerHTML = html;
  },

  // ─── Wire up Per Token modal dynamics (show/hide fields, unit conversion) ───
  _setupTokenFields(prefix, initBilling, initUnit, initInput, initOutput) {
    const billingEl   = document.getElementById(prefix + '-billing');
    const unitWrap    = document.getElementById(prefix + '-unit-wrap');
    const unitModeEl  = document.getElementById(prefix + '-unit-mode');
    const singleWrap  = document.getElementById(prefix + '-single-wrap');
    const tokenWrap   = document.getElementById(prefix + '-token-wrap');
    const labelInp    = document.getElementById(prefix + '-label-input');
    const labelOut    = document.getElementById(prefix + '-label-output');
    const inputEl     = document.getElementById(prefix + '-cost-input');
    const outputEl    = document.getElementById(prefix + '-cost-output');

    function unitLabel() {
      return unitModeEl.value === 'per-1m' ? 'THB / 1M Tokens' : 'THB / Token';
    }
    function updateLabels() {
      const ul = unitLabel();
      if (labelInp) labelInp.textContent = 'Input Cost (' + ul + ')';
      if (labelOut) labelOut.textContent = 'Output Cost (' + ul + ')';
    }
    function applyVisibility() {
      const isToken = billingEl.value === 'Per Token';
      unitWrap.style.display   = isToken ? '' : 'none';
      singleWrap.style.display = isToken ? 'none' : '';
      tokenWrap.style.display  = isToken ? '' : 'none';
      updateLabels();
    }

    // Convert input values when unit mode changes
    let prevUnit = unitModeEl.value;
    unitModeEl.addEventListener('change', function() {
      const factor = (unitModeEl.value === 'per-1m') ? 1e6 : 1e-6;
      if (inputEl.value  !== '') inputEl.value  = (parseFloat(inputEl.value)  * factor).toFixed(unitModeEl.value === 'per-1m' ? 4 : 10);
      if (outputEl.value !== '') outputEl.value = (parseFloat(outputEl.value) * factor).toFixed(unitModeEl.value === 'per-1m' ? 4 : 10);
      prevUnit = unitModeEl.value;
      updateLabels();
    });

    billingEl.addEventListener('change', applyVisibility);
    applyVisibility();
  },

  init() {
    const d = window.MockData;
    const self = window.Pages.costPricing;

    // ─── Unit toggle ───
    const btnToken = document.getElementById('unit-toggle-token');
    const btn1M    = document.getElementById('unit-toggle-1m');
    if (btnToken) btnToken.addEventListener('click', function() { self._displayUnit = 'per-token'; self._rerender(); });
    if (btn1M)    btn1M.addEventListener('click',    function() { self._displayUnit = 'per-1m';    self._rerender(); });

    // ─── Cost Table Filter ───
    self._renderCostTable();
    const costSearch = document.getElementById('cost-search');
    const costProvider = document.getElementById('cost-provider-filter');
    const costStatus = document.getElementById('cost-status-filter');
    if (costSearch) costSearch.addEventListener('input', () => self._renderCostTable());
    if (costProvider) costProvider.addEventListener('change', () => self._renderCostTable());
    if (costStatus) costStatus.addEventListener('change', () => self._renderCostTable());

    // ─── Add Cost Modal ───
    const btnAddCost = document.getElementById('btn-add-cost');
    if (btnAddCost) {
      btnAddCost.addEventListener('click', () => {
        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">เพิ่ม Service Code ใหม่</div>
            <div class="modal-subtitle">กำหนดต้นทุนบริการใหม่เข้าระบบ</div>
            <div class="flex-col gap-16">
              <div class="grid-2 gap-16">
                <div class="form-group">
                  <label class="form-label">Service Code</label>
                  <input type="text" class="form-input" id="add-cost-code" placeholder="เช่น avatar-stt">
                </div>
                <div class="form-group">
                  <label class="form-label">ชื่อบริการ</label>
                  <input type="text" class="form-input" id="add-cost-name" placeholder="เช่น Speech-to-Text">
                </div>
              </div>
              <div class="grid-2 gap-16">
                <div class="form-group">
                  <label class="form-label">Billing Type</label>
                  <select class="form-input" id="add-billing">
                    <option value="Per Minute">Per Minute</option>
                    <option value="Per Request">Per Request</option>
                    <option value="Per Token">Per Token</option>
                  </select>
                </div>
                <div class="form-group" id="add-unit-wrap" style="display:none;">
                  <label class="form-label">หน่วยที่ใช้กรอก</label>
                  <select class="form-input" id="add-unit-mode">
                    <option value="per-token">per Token</option>
                    <option value="per-1m">per 1M Tokens</option>
                  </select>
                </div>
              </div>
              <!-- Single cost (Per Minute / Per Request) -->
              <div id="add-single-wrap">
                <div class="form-group">
                  <label class="form-label">Cost per Unit (THB)</label>
                  <input type="number" class="form-input" id="add-cost-single" step="any" min="0" placeholder="0.0000">
                </div>
              </div>
              <!-- Token costs (Per Token) -->
              <div id="add-token-wrap" style="display:none;">
                <div class="grid-2 gap-16">
                  <div class="form-group">
                    <label class="form-label" id="add-label-input">Input Cost (THB / Token)</label>
                    <input type="number" class="form-input" id="add-cost-input" step="any" min="0" placeholder="0.000000">
                  </div>
                  <div class="form-group">
                    <label class="form-label" id="add-label-output">Output Cost (THB / Token)</label>
                    <input type="number" class="form-input" id="add-cost-output" step="any" min="0" placeholder="0.000000">
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">วันที่มีผล</label>
                <input type="date" class="form-input" id="add-cost-date" value="${new Date().toISOString().split('T')[0]}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-add-cost"><i class="fa-solid fa-plus"></i> เพิ่ม Service Code</button>
            </div>
          </div>
        `);

        setTimeout(() => {
          self._setupTokenFields('add', 'Per Minute', 'per-token', '', '');

          const submitBtn = document.getElementById('modal-submit-add-cost');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const code    = document.getElementById('add-cost-code').value.trim();
            const name    = document.getElementById('add-cost-name').value.trim();
            const billing = document.getElementById('add-billing').value;
            const dateVal = document.getElementById('add-cost-date').value;
            const unitMode = document.getElementById('add-unit-mode').value;
            const factor   = unitMode === 'per-1m' ? 1e-6 : 1;

            if (!code || !name || !dateVal) {
              App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return;
            }
            if (d.costConfig.find(c => c.serviceCode === code)) {
              App.toast('Service Code นี้มีอยู่ในระบบแล้ว', 'error'); return;
            }

            const entry = {
              serviceCode: code, name, billingType: billing,
              currency: 'THB', effectiveDate: dateVal, status: 'Active',
              modifiedDate: new Date().toISOString().split('T')[0],
              modifiedBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'),
            };

            if (billing === 'Per Token') {
              const inp = parseFloat(document.getElementById('add-cost-input').value);
              const out = parseFloat(document.getElementById('add-cost-output').value);
              if (isNaN(inp)) { App.toast('กรุณากรอก Input Cost', 'error'); return; }
              entry.costPerUnit = inp * factor;
              if (!isNaN(out)) entry.outputCostPerUnit = out * factor;
            } else {
              const costVal = parseFloat(document.getElementById('add-cost-single').value);
              if (isNaN(costVal)) { App.toast('กรุณากรอก Cost per Unit', 'error'); return; }
              entry.costPerUnit = costVal;
            }

            d.costConfig.push(entry);
            window.App.closeModal();
            self._rerender();
          });
        }, 50);
      });
    }

    // ─── Edit Cost Modal ───
    document.querySelectorAll('.cost-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const c = d.costConfig[idx];
        if (!c) return;

        const isToken = c.billingType === 'Per Token';

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">แก้ไขต้นทุนบริการ</div>
            <div class="modal-subtitle"><span class="mono">${c.serviceCode}</span> — ${c.name}</div>
            <div class="flex-col gap-16">
              <div class="grid-2 gap-16">
                <div class="form-group">
                  <label class="form-label">ชื่อบริการ</label>
                  <input type="text" class="form-input" id="edit-cost-name" value="${c.name}">
                </div>
                <div class="form-group">
                  <label class="form-label">Billing Type</label>
                  <select class="form-input" id="edit-billing">
                    <option value="Per Minute" ${c.billingType === 'Per Minute' ? 'selected' : ''}>Per Minute</option>
                    <option value="Per Request" ${c.billingType === 'Per Request' ? 'selected' : ''}>Per Request</option>
                    <option value="Per Token" ${c.billingType === 'Per Token' ? 'selected' : ''}>Per Token</option>
                  </select>
                </div>
              </div>
              <div class="grid-2 gap-16">
                <div class="form-group" id="edit-unit-wrap" style="display:${isToken ? '' : 'none'};">
                  <label class="form-label">หน่วยที่ใช้กรอก</label>
                  <select class="form-input" id="edit-unit-mode">
                    <option value="per-token">per Token</option>
                    <option value="per-1m">per 1M Tokens</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">สถานะ</label>
                  <select class="form-input" id="edit-cost-status">
                    <option value="Active" ${c.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Inactive" ${c.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                  </select>
                </div>
              </div>
              <!-- Single cost -->
              <div id="edit-single-wrap" style="display:${isToken ? 'none' : ''};">
                <div class="form-group">
                  <label class="form-label">Cost per Unit (THB)</label>
                  <input type="number" class="form-input" id="edit-cost-single" step="any" min="0" value="${!isToken ? c.costPerUnit : ''}">
                </div>
              </div>
              <!-- Token costs -->
              <div id="edit-token-wrap" style="display:${isToken ? '' : 'none'};">
                <div class="grid-2 gap-16">
                  <div class="form-group">
                    <label class="form-label" id="edit-label-input">Input Cost (THB / Token)</label>
                    <input type="number" class="form-input" id="edit-cost-input" step="any" min="0" value="${isToken ? c.costPerUnit : ''}">
                  </div>
                  <div class="form-group">
                    <label class="form-label" id="edit-label-output">Output Cost (THB / Token)</label>
                    <input type="number" class="form-input" id="edit-cost-output" step="any" min="0" value="${isToken && c.outputCostPerUnit != null ? c.outputCostPerUnit : ''}">
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">วันที่มีผล</label>
                <input type="date" class="form-input" id="edit-cost-date" value="${c.effectiveDate}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-edit-cost"><i class="fa-solid fa-floppy-disk"></i> บันทึก</button>
            </div>
          </div>
        `);

        setTimeout(() => {
          self._setupTokenFields('edit', c.billingType, 'per-token',
            isToken ? c.costPerUnit : '',
            isToken && c.outputCostPerUnit != null ? c.outputCostPerUnit : '');

          const submitBtn = document.getElementById('modal-submit-edit-cost');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const name    = document.getElementById('edit-cost-name').value.trim();
            const billing = document.getElementById('edit-billing').value;
            const dateVal = document.getElementById('edit-cost-date').value;
            const status  = document.getElementById('edit-cost-status').value;
            const unitMode = document.getElementById('edit-unit-mode').value;
            const factor   = unitMode === 'per-1m' ? 1e-6 : 1;

            if (!name || !dateVal) {
              App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return;
            }

            c.name        = name;
            c.billingType = billing;
            c.effectiveDate = dateVal;
            c.status      = status;
            c.modifiedDate = new Date().toISOString().split('T')[0];
            c.modifiedBy   = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');

            if (billing === 'Per Token') {
              const inp = parseFloat(document.getElementById('edit-cost-input').value);
              const out = parseFloat(document.getElementById('edit-cost-output').value);
              if (isNaN(inp)) { App.toast('กรุณากรอก Input Cost', 'error'); return; }
              c.costPerUnit = inp * factor;
              c.outputCostPerUnit = isNaN(out) ? null : out * factor;
            } else {
              const costVal = parseFloat(document.getElementById('edit-cost-single').value);
              if (isNaN(costVal)) { App.toast('กรุณากรอก Cost per Unit', 'error'); return; }
              c.costPerUnit = costVal;
              delete c.outputCostPerUnit;
            }

            window.App.closeModal();
            self._rerender();
          });
        }, 50);
      });
    });

    // ─── Settlement Row Click — show breakdown modal ───
    document.querySelectorAll('.settlement-row').forEach(row => {
      row.addEventListener('click', () => {
        const stlId = row.dataset.settlementId;
        const settlements = d.settlements || [];
        const stl = settlements.find(s => s.settlementId === stlId);
        if (!stl) return;

        // Thai date formatter
        const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        const dt = new Date(stl.createdAt);
        const thaiDate = dt.getDate() + ' ' + thaiMonths[dt.getMonth()] + ' ' + (dt.getFullYear() + 543) + ' เวลา ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0');

        const categoryChip = (cat) => {
          const colors = { TEXT: 'chip-blue', AUDIO: 'chip-orange', VIDEO: 'chip-purple' };
          return '<span class="chip ' + (colors[cat] || 'chip-gray') + ' text-xs">' + (cat || '-') + '</span>';
        };

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">รายละเอียดการคำนวณ (Settlement Breakdown)</div>

            <!-- Header grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;margin-bottom:20px;">
              <div>
                <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">Session ID</div>
                <div class="mono font-600 text-sm flex items-center gap-6">${stl.sessionId} <button class="btn-icon" onclick="navigator.clipboard.writeText('${stl.sessionId}');App.toast('Copied!','success')" title="Copy"><i class="fa-regular fa-copy" style="font-size:12px;opacity:0.5;cursor:pointer;"></i></button></div>
              </div>
              <div>
                <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">ลูกค้า (Tenant)</div>
                <div class="font-600">${stl.tenantName}</div>
              </div>
              <div>
                <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">Sub-Platform</div>
                <div><span class="chip chip-gray text-xs font-600" style="text-transform:uppercase;">${stl.subPlatform}</span></div>
              </div>
              <div>
                <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">วันที่</div>
                <div class="font-600">${thaiDate}</div>
              </div>
            </div>

            <!-- Summary cards -->
            <div class="grid-4 gap-12 mb-20">
              <div class="card p-12">
                <div class="text-xs text-muted mb-4">ต้นทุนรวม (TOTAL COST)</div>
                <div class="mono font-700" style="font-size:18px;color:var(--error);">\u0E3F${stl.summary.totalCost.toFixed(4)}</div>
              </div>
              <div class="card p-12">
                <div class="text-xs text-muted mb-4">รายรับรวม (TOTAL SELL)</div>
                <div class="mono font-700" style="font-size:18px;">\u0E3F${stl.summary.totalSell.toFixed(4)}</div>
              </div>
              <div class="card p-12">
                <div class="text-xs text-muted mb-4">TOKEN หัก (TOKENS DEDUCTED)</div>
                <div class="mono font-700" style="font-size:18px;">${stl.summary.tokensToDeduct.toFixed(4)}</div>
              </div>
              <div class="card p-12">
                <div class="text-xs text-muted mb-4">กำไร (PROFIT)</div>
                <div class="mono font-700" style="font-size:18px;color:var(--success);">\u0E3F${stl.summary.profit.toFixed(4)}</div>
                <div class="text-xs text-muted">Margin ${stl.summary.blendedMargin.toFixed(2)}%</div>
              </div>
            </div>

            <!-- Breakdown table -->
            <div class="font-600 mb-8">รายละเอียดตามบริการ (Breakdown by Service)</div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>บริการ</th>
                    <th>หมวด</th>
                    <th>Variant</th>
                    <th>จำนวน</th>
                    <th>ต้นทุน/หน่วย</th>
                    <th>Margin%</th>
                    <th>ราคา/หน่วย</th>
                    <th>ต้นทุนรวม</th>
                    <th>รายรับรวม</th>
                  </tr>
                </thead>
                <tbody>
                  ${stl.breakdown.map(b => `
                    <tr>
                      <td class="mono text-sm font-600">${b.serviceCode}</td>
                      <td>${categoryChip(b.category)}</td>
                      <td><span class="chip chip-gray text-xs">${b.type.toUpperCase()}</span></td>
                      <td class="mono">${d.formatNumber(b.quantity)}</td>
                      <td class="mono text-sm">${b.costPerUnit.toFixed(4)}</td>
                      <td class="mono font-600">${(b.effectiveMargin * 100).toFixed(0)}%</td>
                      <td class="mono text-sm">${b.sellPerUnit.toFixed(4)}</td>
                      <td class="mono" style="color:var(--error);">${b.totalCost.toFixed(4)}</td>
                      <td class="mono" style="color:var(--primary);">${b.totalSell.toFixed(4)}</td>
                    </tr>
                  `).join('')}
                  <tr style="border-top:2px solid var(--border);font-weight:700;">
                    <td colspan="7" style="text-align:right;" class="text-muted">รวมทั้งหมด (TOTAL)</td>
                    <td class="mono" style="color:var(--error);">${stl.summary.totalCost.toFixed(4)}</td>
                    <td class="mono" style="color:var(--primary);">${stl.summary.totalSell.toFixed(4)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
            </div>
          </div>
        `);
      });
    });

    // ─── Alert Action Buttons — scroll to relevant section ───
    document.querySelectorAll('.alert-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (section === 'margin-config') {
          App.navigate('cost-margin');
          return;
        }
        const target = document.getElementById(section);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ─── Export Button ───
    const btnExport = document.getElementById('btn-export-pricing');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const rows = [
          ['Service Code', 'Name', 'Billing Type', 'Input Cost (THB/token)', 'Output Cost (THB/token)', 'Currency', 'Effective Date', 'Status'],
          ...d.costConfig.map(c => [
            c.serviceCode,
            `"${c.name}"`,
            c.billingType,
            c.costPerUnit,
            c.outputCostPerUnit != null ? c.outputCostPerUnit : '',
            c.currency,
            c.effectiveDate,
            c.status,
          ]),
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cost-pricing_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  },
};

/* ================================================================
   2. window.Pages.costMargin — Margin Configuration
   ================================================================ */
window.Pages.costMargin = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.costMargin.render();
    window.Pages.costMargin.init();
  },

  // ─── Formula helpers ───
  _sell(cost, margin) {
    return margin >= 100 ? 0 : cost / (1 - margin / 100);
  },
  _margin(cost, sell) {
    return sell <= 0 ? 0 : (1 - cost / sell) * 100;
  },
  _fmt(n, decimals) {
    if (n == null) return '—';
    return n.toFixed(decimals != null ? decimals : 2);
  },

  // ─── Build enriched row data ───
  _buildRows(d) {
    const mc = d.marginConfig;
    const providerMap = {};
    mc.providers.forEach(function(p) { providerMap[p.name] = p.margin; });
    const overrideMap = {};
    mc.serviceCodes.forEach(function(sc) { overrideMap[sc.code] = sc; });

    return d.costConfig.map(function(c) {
      const override = overrideMap[c.serviceCode];
      const provMargin = providerMap[c.provider];
      var effectiveMargin, overrideLabel;
      if (override) {
        effectiveMargin = override.margin;
        overrideLabel   = 'override';
      } else if (provMargin != null) {
        effectiveMargin = provMargin;
        overrideLabel   = 'provider';
      } else {
        effectiveMargin = mc.global;
        overrideLabel   = 'global';
      }
      return {
        serviceCode:      c.serviceCode,
        name:             c.name,
        provider:         c.provider,
        billingType:      c.billingType,
        costPerUnit:      c.costPerUnit,
        outputCostPerUnit:c.outputCostPerUnit != null ? c.outputCostPerUnit : null,
        status:           c.status,
        effectiveMargin:  effectiveMargin,
        overrideLabel:    overrideLabel,
        isOverride:       !!override,
        effectiveDate:    override ? (override.effectiveDate || '—') : '—',
        lastUpdate:       override ? (override.modifiedDate || override.lastUpdate || '—') : '—',
        updatedBy:        override ? (override.modifiedBy  || override.updatedBy  || '—') : '—',
      };
    });
  },

  render() {
    const d   = window.MockData;
    const mc  = d.marginConfig;
    const self = window.Pages.costMargin;
    const rows = self._buildRows(d);

    const billingTypeChip = window.Pages.costPricing._billingChip.bind(window.Pages.costPricing);

    function billingUnit(type) {
      if (type === 'Per Token')   return 'per 1K tokens';
      if (type === 'Per Minute')  return 'per minute';
      if (type === 'Per Request') return 'per request';
      return '';
    }

    function fmtCost(n) {
      if (n == null) return '—';
      if (n === 0) return '0.00';
      if (Math.abs(n) >= 0.01) return n.toFixed(2);
      if (Math.abs(n) >= 0.0001) return n.toFixed(4);
      return n.toPrecision(3);
    }

    function fmtSell(cost, margin) {
      const s = self._sell(cost, margin);
      if (s === 0) return '0.00';
      if (Math.abs(s) >= 0.01) return s.toFixed(2);
      if (Math.abs(s) >= 0.0001) return s.toFixed(4);
      return s.toPrecision(3);
    }

    function overrideBadge(row) {
      if (row.overrideLabel === 'override') {
        return `<span class="chip chip-purple" style="font-size:11px;white-space:nowrap;">
          <i class="fa-solid fa-circle-dot"></i> Override Active</span>`;
      }
      if (row.overrideLabel === 'provider') {
        return `<span class="text-xs text-muted" style="line-height:1.6;">Using<br>Provider</span>`;
      }
      return `<span class="text-xs text-muted" style="line-height:1.6;">Using<br>Global</span>`;
    }

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="flex items-center gap-12">
          <a href="#cost-pricing" onclick="event.preventDefault();App.navigate('cost-pricing')" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-arrow-left"></i> Cost Config
          </a>
          <h1 class="heading">MARGIN CONFIGURATION</h1>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline btn-sm" onclick="App.navigate('cost-change-requests')">
            <i class="fa-solid fa-code-pull-request"></i> Change Requests
          </button>
        </div>
      </div>

      <!-- Global Margin -->
      <div class="card-accent p-20 mb-20">
        <div class="flex justify-between items-center mb-12">
          <div>
            <div class="section-title mb-4">Global Margin</div>
            <div class="text-sm text-muted">อัตรากำไรมาตรฐาน (ใช้เมื่อไม่มี Provider หรือ Service Override)</div>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-edit-global-margin"><i class="fa-solid fa-pen"></i> แก้ไข</button>
        </div>
        <div class="flex items-center gap-16">
          <div class="mono font-700" style="font-size:48px;color:var(--primary);">${mc.global}%</div>
          <div class="flex-col gap-4">
            <div class="text-sm text-muted">ตัวอย่าง: ต้นทุน 1.00 THB</div>
            <div class="text-sm">ราคาขาย = <span class="mono font-600 text-success">${(1 / (1 - mc.global / 100)).toFixed(2)} THB</span></div>
            ${mc.effectiveDate ? `<div class="text-xs text-muted"><i class="fa-solid fa-calendar-check"></i> Effective: <span class="mono">${mc.effectiveDate}</span></div>` : ''}
          </div>
        </div>
      </div>

      <!-- Provider Margins -->
      <div class="section-title mb-12">Provider Margins</div>
      <div class="table-wrap mb-28">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Margin %</th>
              <th>ส่วนต่างจาก Global</th>
              <th>Effective Date</th>
              <th>แก้ไขล่าสุด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${mc.providers.map((p, idx) => `
              <tr>
                <td class="font-600">${p.name}</td>
                <td class="mono font-600">${p.margin}%</td>
                <td>
                  ${p.margin > mc.global
                    ? `<span class="text-success">+${p.margin - mc.global}%</span>`
                    : p.margin < mc.global
                      ? `<span class="text-error">${p.margin - mc.global}%</span>`
                      : '<span class="text-muted">เท่ากับ Global</span>'}
                </td>
                <td class="mono text-sm">${p.effectiveDate || '-'}</td>
                <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${p.modifiedDate || '-'}</div>${p.modifiedBy ? `<div class="text-xs text-dim">${p.modifiedBy.split('@')[0]}</div>` : ''}</td>
                <td>
                  <button class="btn btn-sm btn-outline provider-margin-edit-btn" data-idx="${idx}">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Service Code Margins — inline bidirectional editing -->
      <div class="flex justify-between items-center mb-12">
        <div>
          <div class="section-title">Service Code Margins</div>
          <div class="text-xs text-muted mt-2">
            คลิก <i class="fa-solid fa-pen" style="font-size:10px;"></i> เพื่อตั้งค่า Override — Margin % และ Sell Price อัปเดตหากันทันที
          </div>
        </div>
      </div>
      <div class="table-wrap mb-28" style="overflow-x:auto;">
        <table style="min-width:860px;">
          <thead>
            <tr>
              <th>SERVICE CODE</th>
              <th>TYPE</th>
              <th>REAL COST<br><span class="font-400 text-muted" style="font-size:10px;">(from Cost Config)</span></th>
              <th>MARGIN % <i class="fa-solid fa-pen" style="font-size:9px;opacity:.4;"></i></th>
              <th>SELL PRICE (THB) <i class="fa-solid fa-pen" style="font-size:9px;opacity:.4;"></i></th>
              <th>OVERRIDE?</th>
              <th>Effective Date</th>
              <th>STATUS</th>
              <th>แก้ไขล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => {
              const hasOutput = row.billingType === 'Per Token' && row.outputCostPerUnit != null;
              const sellIn  = self._sell(row.costPerUnit,      row.effectiveMargin);
              const sellOut = hasOutput ? self._sell(row.outputCostPerUnit, row.effectiveMargin) : null;
              return `
              <tr class="sc-row"
                data-sc="${row.serviceCode}"
                data-cost="${row.costPerUnit}"
                ${hasOutput ? `data-output-cost="${row.outputCostPerUnit}"` : ''}
                data-billing="${row.billingType}"
                data-margin="${row.effectiveMargin}"
                data-is-override="${row.isOverride ? '1' : '0'}">

                <td>
                  <div class="mono font-600 text-primary" style="font-size:12px;">${row.serviceCode}</div>
                  <div class="text-xs text-muted mt-2">${row.name}</div>
                  <div class="text-xs text-dim">${row.provider}</div>
                </td>

                <td>${billingTypeChip(row.billingType)}</td>

                <td style="font-size:12px;">
                  ${hasOutput ? `
                    <div class="text-muted" style="line-height:1.8;">
                      <span class="text-xs">Input:</span>  <span class="mono">${fmtCost(row.costPerUnit)}</span><br>
                      <span class="text-xs">Output:</span> <span class="mono">${fmtCost(row.outputCostPerUnit)}</span>
                    </div>
                    <div class="text-xs text-dim">per 1K tokens</div>
                  ` : `
                    <span class="mono">${fmtCost(row.costPerUnit)}</span>
                    <div class="text-xs text-dim">${billingUnit(row.billingType)}</div>
                  `}
                </td>

                <!-- MARGIN % cell -->
                <td>
                  <div class="sc-margin-view flex items-center gap-6">
                    <span class="mono font-600" style="font-size:14px;">${row.effectiveMargin.toFixed(2)}%</span>
                    <button class="btn btn-ghost btn-sm sc-edit-trigger"
                      style="opacity:0.35;padding:2px 5px;" title="แก้ไข Margin">
                      <i class="fa-solid fa-pen" style="font-size:10px;"></i>
                    </button>
                  </div>
                  <div class="sc-margin-edit hidden">
                    <div class="flex items-center gap-4" style="flex-wrap:nowrap;">
                      <input type="number" class="form-input sc-margin-inp"
                        value="${row.effectiveMargin.toFixed(2)}"
                        step="0.1" min="0" max="99.99"
                        style="width:68px;padding:4px 8px;font-size:13px;">
                      <span class="text-muted" style="font-size:12px;">%</span>
                      <button class="btn btn-sm sc-save-btn"
                        style="background:var(--success);color:#fff;padding:4px 8px;min-width:26px;" title="บันทึก">
                        <i class="fa-solid fa-check" style="font-size:11px;"></i>
                      </button>
                      <button class="btn btn-sm btn-outline sc-cancel-btn"
                        style="padding:4px 8px;min-width:26px;" title="ยกเลิก">
                        <i class="fa-solid fa-xmark" style="font-size:11px;"></i>
                      </button>
                    </div>
                  </div>
                </td>

                <!-- SELL PRICE cell -->
                <td>
                  <div class="sc-sell-view" style="font-size:12px;line-height:2;">
                    ${hasOutput ? `
                      <span class="text-muted text-xs">Input:</span>
                      <span class="mono font-600 text-success">${fmtSell(row.costPerUnit, row.effectiveMargin)}</span>
                      <span class="text-dim text-xs">(${row.effectiveMargin.toFixed(2)}%)</span><br>
                      <span class="text-muted text-xs">Output:</span>
                      <span class="mono font-600 text-success">${fmtSell(row.outputCostPerUnit, row.effectiveMargin)}</span>
                      <span class="text-dim text-xs">(${row.effectiveMargin.toFixed(2)}%)</span><br>
                      <span class="text-xs text-dim">per 1K tokens</span>
                    ` : `
                      <span class="mono font-600 text-success">${fmtSell(row.costPerUnit, row.effectiveMargin)}</span>
                      <span class="text-dim text-xs" style="margin-left:4px;">(${row.effectiveMargin.toFixed(2)}%)</span>
                      <div class="text-xs text-dim">${billingUnit(row.billingType)}</div>
                    `}
                  </div>
                  <div class="sc-sell-edit hidden" style="font-size:12px;">
                    ${hasOutput ? `
                      <div class="flex-col gap-4">
                        <div class="flex items-center gap-4" style="flex-wrap:nowrap;">
                          <span class="text-xs text-muted" style="min-width:38px;">Input:</span>
                          <input type="number" class="form-input sc-sell-inp-in"
                            value="${fmtSell(row.costPerUnit, row.effectiveMargin)}"
                            step="0.0000001" min="0"
                            style="width:108px;padding:4px 8px;font-size:12px;">
                          <button class="btn btn-sm sc-save-btn"
                            style="background:var(--success);color:#fff;padding:4px 8px;min-width:26px;" title="บันทึก">
                            <i class="fa-solid fa-check" style="font-size:11px;"></i>
                          </button>
                          <button class="btn btn-sm btn-outline sc-cancel-btn"
                            style="padding:4px 8px;min-width:26px;">
                            <i class="fa-solid fa-xmark" style="font-size:11px;"></i>
                          </button>
                        </div>
                        <div class="flex items-center gap-4" style="flex-wrap:nowrap;">
                          <span class="text-xs text-muted" style="min-width:38px;">Output:</span>
                          <input type="number" class="form-input sc-sell-inp-out"
                            value="${fmtSell(row.outputCostPerUnit, row.effectiveMargin)}"
                            step="0.0000001" min="0"
                            style="width:108px;padding:4px 8px;font-size:12px;">
                          <button class="btn btn-sm sc-save-btn"
                            style="background:var(--success);color:#fff;padding:4px 8px;min-width:26px;" title="บันทึก">
                            <i class="fa-solid fa-check" style="font-size:11px;"></i>
                          </button>
                          <button class="btn btn-sm btn-outline sc-cancel-btn"
                            style="padding:4px 8px;min-width:26px;">
                            <i class="fa-solid fa-xmark" style="font-size:11px;"></i>
                          </button>
                        </div>
                        <div class="text-xs text-dim">per 1K tokens</div>
                      </div>
                    ` : `
                      <div class="flex items-center gap-4" style="flex-wrap:nowrap;">
                        <input type="number" class="form-input sc-sell-inp-single"
                          value="${fmtSell(row.costPerUnit, row.effectiveMargin)}"
                          step="0.0000001" min="0"
                          style="width:108px;padding:4px 8px;font-size:12px;">
                        <button class="btn btn-sm sc-save-btn"
                          style="background:var(--success);color:#fff;padding:4px 8px;min-width:26px;" title="บันทึก">
                          <i class="fa-solid fa-check" style="font-size:11px;"></i>
                        </button>
                        <button class="btn btn-sm btn-outline sc-cancel-btn"
                          style="padding:4px 8px;min-width:26px;">
                          <i class="fa-solid fa-xmark" style="font-size:11px;"></i>
                        </button>
                      </div>
                      <div class="text-xs text-dim mt-4">${billingUnit(row.billingType)}</div>
                    `}
                  </div>
                </td>

                <td>${overrideBadge(row)}</td>
                <td class="mono text-sm">${row.effectiveDate !== '—' ? row.effectiveDate : '<span class="text-dim">—</span>'}</td>
                <td>${d.statusChip(row.status)}</td>
                <td style="white-space:nowrap;">
                  ${row.lastUpdate !== '—'
                    ? `<div class="mono text-sm text-muted">${row.lastUpdate}</div><div class="text-xs text-dim">${row.updatedBy.split('@')[0]}</div>`
                    : '<span class="text-dim">—</span>'}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pricing Calculator -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-calculator"></i> Bidirectional Calculator</div>
      <div class="banner-info mb-16">
        <div class="banner-icon"><i class="fa-solid fa-circle-info"></i></div>
        <div class="text-sm">สูตร: <span class="mono font-600">Sell Price = Cost ÷ (1 − Margin% ÷ 100)</span> — Token ที่หัก = Sell Price</div>
      </div>
      <div class="card p-20">
        <div class="grid-3 gap-20">
          <div class="form-group">
            <label class="form-label">Cost (ต้นทุน THB)</label>
            <input type="number" id="calc-cost" class="form-input" value="1.00" step="0.0001" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Margin %</label>
            <input type="number" id="calc-margin" class="form-input" value="${mc.global}" step="0.1" min="0" max="99.99">
          </div>
          <div class="form-group">
            <label class="form-label">Sell Price = Token ที่หัก (THB)</label>
            <input type="number" id="calc-sell" class="form-input" value="${(1 / (1 - mc.global / 100)).toFixed(2)}" step="0.0001" min="0">
          </div>
        </div>
        <div class="flex items-center gap-16 mt-16">
          <div class="card p-16 flex-1" style="text-align:center;">
            <div class="text-sm text-muted mb-4">กำไรต่อหน่วย</div>
            <div class="mono font-700 text-success" id="calc-profit" style="font-size:20px;">
              ${((1 / (1 - mc.global / 100)) - 1).toFixed(2)} THB
            </div>
          </div>
          <div class="card p-16 flex-1" style="text-align:center;">
            <div class="text-sm text-muted mb-4">Markup %</div>
            <div class="mono font-700 text-primary" id="calc-markup" style="font-size:20px;">
              ${(((1 / (1 - mc.global / 100)) - 1) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Token Profit Summary (from Settlements) -->
      <div class="divider mb-20 mt-28"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-coins"></i> สรุปต้นทุน &amp; กำไรต่อ Platform</div>
      <div class="text-xs text-muted mb-16">คำนวณจาก Settlement records | Token ที่หัก = Sell Price (THB) — ไม่มี conversion step</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Sessions</th>
              <th>Tokens หัก</th>
              <th>ต้นทุนรวม (THB)</th>
              <th>ราคาขายรวม (THB)</th>
              <th>กำไร (THB)</th>
              <th>Blended Margin</th>
            </tr>
          </thead>
          <tbody>
            ${d.subPlatforms.map(sp => {
              const settlements = (d.settlements || []).filter(stl => stl.subPlatform === sp.code);
              if (!settlements.length) {
                return '<tr>' +
                  '<td><div class="flex items-center gap-8"><div style="width:10px;height:10px;border-radius:3px;background:' + sp.primaryColor + ';"></div><span class="font-600">' + sp.name + '</span></div></td>' +
                  '<td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td><td class="text-muted">—</td>' +
                  '</tr>';
              }

              const totalCost = settlements.reduce((s, stl) => s + stl.summary.totalCost, 0);
              const totalSell = settlements.reduce((s, stl) => s + stl.summary.totalSell, 0);
              const totalTokens = settlements.reduce((s, stl) => s + stl.summary.tokensToDeduct, 0);
              const profit = totalSell - totalCost;
              const blendedM = totalSell > 0 ? ((1 - totalCost / totalSell) * 100) : 0;

              return '<tr>' +
                '<td><div class="flex items-center gap-8"><div style="width:10px;height:10px;border-radius:3px;background:' + sp.primaryColor + ';"></div><span class="font-600">' + sp.name + '</span></div></td>' +
                '<td class="mono">' + settlements.length + '</td>' +
                '<td class="mono">' + d.formatNumber(parseFloat(totalTokens.toFixed(3))) + '</td>' +
                '<td class="mono" style="color:var(--error);">' + totalCost.toFixed(2) + '</td>' +
                '<td class="mono" style="color:var(--primary);">' + totalSell.toFixed(2) + '</td>' +
                '<td class="mono font-700" style="color:var(--success);">' + profit.toFixed(2) + '</td>' +
                '<td><span class="chip ' + (blendedM >= 30 ? 'chip-green' : 'chip-orange') + ' text-xs mono">' + blendedM.toFixed(1) + '%</span></td>' +
                '</tr>';
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const mc   = d.marginConfig;
    const self = window.Pages.costMargin;

    // ─── Edit Global Margin ───
    const btnEditGlobal = document.getElementById('btn-edit-global-margin');
    if (btnEditGlobal) {
      btnEditGlobal.addEventListener('click', () => {
        const todayISO = new Date().toISOString().split('T')[0];
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">แก้ไข Global Margin</div>
            <div class="modal-subtitle">อัตรากำไรมาตรฐานที่ใช้กับทุกบริการ</div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">Global Margin (%)</label>
                <input type="number" class="form-input" id="edit-global-margin" value="${mc.global}" step="0.1" min="0" max="99.99">
              </div>
              <div class="form-group">
                <label class="form-label">Effective Date <span class="text-xs text-muted">— วันที่เริ่มมีผลบังคับใช้</span></label>
                <input type="date" class="form-input" id="edit-global-effective" value="${todayISO}" min="${todayISO}">
              </div>
              <div class="alert-warning">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span class="text-sm">การเปลี่ยนแปลงจะมีผลกับทุกบริการที่ไม่มี Override</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-global-margin"><i class="fa-solid fa-floppy-disk"></i> บันทึก</button>
            </div>
          </div>
        `);
        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-global-margin');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const val = parseFloat(document.getElementById('edit-global-margin').value);
            const effDate = document.getElementById('edit-global-effective').value;
            if (isNaN(val) || val < 0 || val >= 100) { App.toast('กรุณากรอก Margin ที่ถูกต้อง', 'error'); return; }
            if (!effDate) { App.toast('กรุณาระบุ Effective Date', 'error'); return; }
            mc.global = val;
            mc.effectiveDate = effDate;
            mc.modifiedDate = new Date().toISOString().split('T')[0];
            mc.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
            App.closeModal();
            App.toast('บันทึก Global Margin สำเร็จ — มีผล ' + effDate, 'success');
            self._rerender();
          });
        }, 50);
      });
    }

    // ─── Edit Provider Margin ───
    document.querySelectorAll('.provider-margin-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const p = mc.providers[idx];
        if (!p) return;
        const todayP = new Date().toISOString().split('T')[0];
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">แก้ไข Provider Margin</div>
            <div class="modal-subtitle">Provider: <span class="font-600">${p.name}</span></div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">Margin (%)</label>
                <input type="number" class="form-input" id="edit-provider-margin" value="${p.margin}" step="0.1" min="0" max="99.99">
              </div>
              <div class="form-group">
                <label class="form-label">Effective Date <span class="text-xs text-muted">— วันที่เริ่มมีผลบังคับใช้</span></label>
                <input type="date" class="form-input" id="edit-provider-effective" value="${todayP}" min="${todayP}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-provider-margin"><i class="fa-solid fa-floppy-disk"></i> บันทึก</button>
            </div>
          </div>
        `);
        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-provider-margin');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const val = parseFloat(document.getElementById('edit-provider-margin').value);
            const effDate = document.getElementById('edit-provider-effective').value;
            if (isNaN(val) || val < 0 || val >= 100) { App.toast('กรุณากรอก Margin ที่ถูกต้อง', 'error'); return; }
            if (!effDate) { App.toast('กรุณาระบุ Effective Date', 'error'); return; }
            p.margin = val;
            p.effectiveDate = effDate;
            p.modifiedDate = new Date().toISOString().split('T')[0];
            p.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
            App.closeModal();
            App.toast('บันทึก Provider Margin สำเร็จ — มีผล ' + effDate, 'success');
            self._rerender();
          });
        }, 50);
      });
    });

    // ─── Inline editing for Service Code Margin rows ───
    document.querySelectorAll('.sc-row').forEach(row => {
      const code       = row.dataset.sc;
      const cost       = parseFloat(row.dataset.cost);
      const outputCost = row.dataset.outputCost ? parseFloat(row.dataset.outputCost) : null;

      const marginView  = row.querySelector('.sc-margin-view');
      const marginEdit  = row.querySelector('.sc-margin-edit');
      const sellView    = row.querySelector('.sc-sell-view');
      const sellEdit    = row.querySelector('.sc-sell-edit');
      const marginInp   = row.querySelector('.sc-margin-inp');
      const sellSingle  = row.querySelector('.sc-sell-inp-single');
      const sellInpIn   = row.querySelector('.sc-sell-inp-in');
      const sellInpOut  = row.querySelector('.sc-sell-inp-out');

      // Enter edit mode
      row.querySelector('.sc-edit-trigger').addEventListener('click', () => {
        marginView.classList.add('hidden');
        marginEdit.classList.remove('hidden');
        sellView.classList.add('hidden');
        sellEdit.classList.remove('hidden');
        marginInp.focus();
      });

      // Exit edit mode (cancel)
      function exitEdit() {
        marginEdit.classList.add('hidden');
        marginView.classList.remove('hidden');
        sellEdit.classList.add('hidden');
        sellView.classList.remove('hidden');
      }

      row.querySelectorAll('.sc-cancel-btn').forEach(btn => btn.addEventListener('click', exitEdit));

      // ─── Bidirectional real-time calculation ───

      // Margin changed → update sell price(s)
      marginInp.addEventListener('input', () => {
        const m = parseFloat(marginInp.value);
        if (isNaN(m) || m >= 100) return;
        if (sellSingle)  sellSingle.value  = self._fmt(self._sell(cost, m));
        if (sellInpIn)   sellInpIn.value   = self._fmt(self._sell(cost, m));
        if (sellInpOut && outputCost) sellInpOut.value = self._fmt(self._sell(outputCost, m));
      });

      // Input sell price changed → update margin + output sell
      if (sellSingle) {
        sellSingle.addEventListener('input', () => {
          const s = parseFloat(sellSingle.value);
          if (isNaN(s) || s <= 0) return;
          const m = self._margin(cost, s);
          marginInp.value = m.toFixed(2);
          if (sellInpOut && outputCost) sellInpOut.value = self._fmt(self._sell(outputCost, m));
        });
      }
      if (sellInpIn) {
        sellInpIn.addEventListener('input', () => {
          const s = parseFloat(sellInpIn.value);
          if (isNaN(s) || s <= 0) return;
          const m = self._margin(cost, s);
          marginInp.value = m.toFixed(2);
          if (sellInpOut && outputCost) sellInpOut.value = self._fmt(self._sell(outputCost, m));
        });
      }
      // Output sell price changed → update margin + input sell
      if (sellInpOut && outputCost) {
        sellInpOut.addEventListener('input', () => {
          const s = parseFloat(sellInpOut.value);
          if (isNaN(s) || s <= 0) return;
          const m = self._margin(outputCost, s);
          marginInp.value = m.toFixed(2);
          if (sellInpIn) sellInpIn.value = self._fmt(self._sell(cost, m));
          if (sellSingle) sellSingle.value = self._fmt(self._sell(cost, m));
        });
      }

      // ─── Save override (with Effective Date modal) ───
      row.querySelectorAll('.sc-save-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const m = parseFloat(marginInp.value);
          if (isNaN(m) || m < 0 || m >= 100) {
            App.toast('กรุณากรอก Margin ที่ถูกต้อง (0–99.99%)', 'error');
            return;
          }
          const todaySC = new Date().toISOString().split('T')[0];
          App.showModal(`
            <div class="modal">
              <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
              <div class="modal-title heading">ยืนยันบันทึก Override</div>
              <div class="modal-subtitle">Service Code: <span class="mono font-600">${code}</span> → Margin ${m.toFixed(2)}%</div>
              <div class="form-group">
                <label class="form-label">Effective Date <span class="text-xs text-muted">— วันที่เริ่มมีผลบังคับใช้</span></label>
                <input type="date" class="form-input" id="sc-save-effective" value="${todaySC}" min="${todaySC}">
              </div>
              <div class="modal-actions">
                <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
                <button class="btn btn-primary" id="sc-save-confirm"><i class="fa-solid fa-floppy-disk"></i> บันทึก</button>
              </div>
            </div>
          `);
          setTimeout(() => {
            document.getElementById('sc-save-confirm')?.addEventListener('click', () => {
              const effDate = document.getElementById('sc-save-effective').value;
              if (!effDate) { App.toast('กรุณาระบุ Effective Date', 'error'); return; }
              const existing = mc.serviceCodes.find(sc => sc.code === code);
              const todayStr = new Date().toISOString().split('T')[0];
              if (existing) {
                existing.margin        = m;
                existing.effectiveDate = effDate;
                existing.modifiedDate  = todayStr;
                existing.modifiedBy    = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
              } else {
                mc.serviceCodes.push({ code, margin: m, effectiveDate: effDate, modifiedDate: todayStr, modifiedBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system') });
              }
              App.closeModal();
              App.toast(`บันทึก Override: ${code} = ${m.toFixed(2)}% — มีผล ${effDate}`, 'success');
              self._rerender();
            });
          }, 50);
        });
      });
    });

    // ─── Bidirectional Calculator ───
    const calcCost   = document.getElementById('calc-cost');
    const calcMargin = document.getElementById('calc-margin');
    const calcSell   = document.getElementById('calc-sell');
    const calcProfit = document.getElementById('calc-profit');
    const calcMarkup = document.getElementById('calc-markup');

    function updateCalcDisplay(cost, margin, sell) {
      const profit = sell - cost;
      const markup = cost > 0 ? ((sell - cost) / cost * 100) : 0;
      if (calcProfit) calcProfit.textContent = profit.toFixed(2) + ' THB';
      if (calcMarkup) calcMarkup.textContent = markup.toFixed(2) + '%';
    }

    if (calcCost && calcMargin && calcSell) {
      calcCost.addEventListener('input', () => {
        const cost = parseFloat(calcCost.value) || 0;
        const margin = parseFloat(calcMargin.value) || 0;
        if (margin >= 100) return;
        const sell = cost / (1 - margin / 100);
        calcSell.value = sell.toFixed(2);
        updateCalcDisplay(cost, margin, sell);
      });
      calcMargin.addEventListener('input', () => {
        const cost = parseFloat(calcCost.value) || 0;
        const margin = parseFloat(calcMargin.value) || 0;
        if (margin >= 100) return;
        const sell = cost / (1 - margin / 100);
        calcSell.value = sell.toFixed(2);
        updateCalcDisplay(cost, margin, sell);
      });
      calcSell.addEventListener('input', () => {
        const cost = parseFloat(calcCost.value) || 0;
        const sell = parseFloat(calcSell.value) || 0;
        if (sell <= 0) return;
        const margin = (1 - cost / sell) * 100;
        calcMargin.value = margin.toFixed(2);
        updateCalcDisplay(cost, margin, sell);
      });
    }
  },
};

/* ================================================================
   3. window.Pages.costSnapshots — Pricing Snapshots
   ================================================================ */
window.Pages.costSnapshots = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.costSnapshots.render();
    window.Pages.costSnapshots.init();
  },

  render() {
    const d = window.MockData;
    const snapshots = d.snapshots;
    const priceLocks = d.priceLocks;
    const self = window.Pages.costPricing;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="flex items-center gap-12">
          <a href="#cost-pricing" onclick="event.preventDefault();App.navigate('cost-pricing')" class="btn btn-outline btn-sm"><i class="fa-solid fa-arrow-left"></i> Cost Config</a>
          <h1 class="heading">PRICING SNAPSHOTS</h1>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary btn-sm" id="btn-create-snapshot"><i class="fa-solid fa-plus"></i> สร้าง Snapshot ใหม่</button>
        </div>
      </div>

      <!-- Snapshots Grid -->
      <div class="grid-3 gap-16 mb-24">
        ${snapshots.map(snap => {
          const isDefault = snap.type === 'Default';
          const tenant = snap.tenantId ? d.tenants.find(t => t.id === snap.tenantId) : null;
          return `
            <div class="${isDefault ? 'card-accent' : 'card'} p-20">
              <div class="flex justify-between items-center mb-12">
                ${self._snapTypeChip(snap.type)}
                ${snap.isActive ? '<span class="chip chip-green">Active</span>' : '<span class="chip chip-gray">Inactive</span>'}
              </div>
              <div class="font-700 mb-8" style="font-size:16px;">${snap.name}</div>
              <div class="flex-col gap-6 mb-12">
                <div class="flex justify-between">
                  <span class="text-sm text-muted">ID</span>
                  <span class="text-sm mono">${snap.id}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted">สร้างเมื่อ</span>
                  <span class="text-sm mono">${snap.createdDate}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted">Global Margin</span>
                  <span class="text-sm mono font-600">${snap.data.globalMargin}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted">ลูกค้าที่ผูก</span>
                  <span class="text-sm mono font-600">${snap.assignedCustomers} ราย</span>
                </div>
                ${tenant ? `
                  <div class="flex justify-between">
                    <span class="text-sm text-muted">Tenant</span>
                    <span class="text-sm font-600">${tenant.name}</span>
                  </div>
                ` : ''}
              </div>
              ${snap.modifiedDate ? `
                <div class="divider mb-8"></div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted"><i class="fa-solid fa-clock"></i> แก้ไขล่าสุด</span>
                  <div style="text-align:right;">
                    <div class="mono text-xs text-muted">${snap.modifiedDate}</div>
                    ${snap.modifiedBy ? `<div class="text-xs text-dim">${snap.modifiedBy.split('@')[0]}</div>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Price Locks -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-lock"></i> Price Locks</div>
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="pl-search" placeholder="ค้นหา Tenant / Snapshot ID...">
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select class="form-input" id="pl-status-filter">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>
      <div class="table-wrap" id="pl-table-wrap"></div>
    `;
  },

  _renderPriceLocks() {
    const d = window.MockData;
    let priceLocks = d.priceLocks;
    const search = (document.getElementById('pl-search') || {}).value.trim().toLowerCase();
    const status = (document.getElementById('pl-status-filter') || {}).value;

    if (search) {
      priceLocks = priceLocks.filter(pl =>
        pl.tenantName.toLowerCase().includes(search) || pl.snapshotId.toLowerCase().includes(search)
      );
    }
    if (status !== 'all') priceLocks = priceLocks.filter(pl => pl.status === status);

    const wrap = document.getElementById('pl-table-wrap');
    if (!wrap) return;

    if (!priceLocks.length) {
      wrap.innerHTML = '<div class="text-sm text-muted p-16" style="text-align:center;">ไม่พบ Price Lock ที่ตรงกับเงื่อนไข</div>';
      return;
    }

    wrap.innerHTML = `<table><thead><tr>
      <th>ID</th><th>Tenant</th><th>Snapshot</th><th>เริ่มต้น</th><th>สิ้นสุด</th>
      <th>เหลืออีก (วัน)</th><th>สถานะ</th><th>แจ้งเตือน 30 วัน</th><th>แก้ไขล่าสุด</th>
    </tr></thead><tbody>${priceLocks.map(pl => `<tr>
      <td class="mono text-sm">${pl.id}</td>
      <td class="font-600">${pl.tenantName}</td>
      <td class="mono text-sm">${pl.snapshotId}</td>
      <td class="text-sm mono">${pl.startDate}</td>
      <td class="text-sm mono">${pl.endDate}</td>
      <td>
        <span class="mono font-700 ${pl.daysRemaining <= 30 ? 'text-warning' : 'text-success'}">${pl.daysRemaining}</span>
        ${pl.daysRemaining <= 30 ? '<span class="chip chip-yellow" style="font-size:10px;padding:1px 4px;margin-left:4px;">ใกล้หมดอายุ</span>' : ''}
      </td>
      <td>${d.statusChip(pl.status)}</td>
      <td>${pl.notified30d ? '<span class="chip chip-green">แจ้งแล้ว</span>' : '<span class="chip chip-gray">ยังไม่แจ้ง</span>'}</td>
      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${pl.modifiedDate || '-'}</div>${pl.modifiedBy ? `<div class="text-xs text-dim">${pl.modifiedBy.split('@')[0]}</div>` : ''}</td>
    </tr>`).join('')}</tbody></table>`;
  },

  init() {
    const d = window.MockData;
    const self = window.Pages.costSnapshots;

    // ─── Price Locks Filter ───
    self._renderPriceLocks();
    const plSearch = document.getElementById('pl-search');
    const plStatus = document.getElementById('pl-status-filter');
    if (plSearch) plSearch.addEventListener('input', () => self._renderPriceLocks());
    if (plStatus) plStatus.addEventListener('change', () => self._renderPriceLocks());

    // ─── Create Snapshot ───
    const btnCreateSnapshot = document.getElementById('btn-create-snapshot');
    if (btnCreateSnapshot) {
      btnCreateSnapshot.addEventListener('click', () => {
        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">สร้าง Pricing Snapshot ใหม่</div>
            <div class="modal-subtitle">บันทึกสำเนาราคาปัจจุบันเพื่อกำหนดให้ลูกค้าเฉพาะกลุ่ม</div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">ชื่อ Snapshot</label>
                <input type="text" class="form-input" id="snap-name" placeholder="เช่น Enterprise Q2 2026">
              </div>
              <div class="grid-2 gap-16">
                <div class="form-group">
                  <label class="form-label">ประเภท</label>
                  <select class="form-input" id="snap-type">
                    <option value="Custom">Custom</option>
                    <option value="Default">Default</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Global Margin (%)</label>
                  <input type="number" class="form-input" id="snap-margin" value="${d.marginConfig.global}" step="0.1" min="0" max="99.99">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">ผูกกับ Tenant (ถ้ามี)</label>
                <select class="form-input" id="snap-tenant">
                  <option value="">-- ไม่ระบุ (ใช้ทั่วไป) --</option>
                  ${d.tenants.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-snapshot"><i class="fa-solid fa-camera"></i> สร้าง Snapshot</button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-snapshot');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const name = document.getElementById('snap-name').value.trim();
            const type = document.getElementById('snap-type').value;
            const margin = parseFloat(document.getElementById('snap-margin').value);
            const tenantId = document.getElementById('snap-tenant').value || null;

            if (!name || isNaN(margin)) {
              App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
              return;
            }

            const newId = 'SNAP-' + String(d.snapshots.length + 1).padStart(3, '0');
            const today = new Date().toISOString().split('T')[0];

            d.snapshots.push({
              id: newId,
              name: name,
              type: type,
              createdDate: today,
              assignedCustomers: tenantId ? 1 : 0,
              isActive: true,
              tenantId: tenantId,
              data: { globalMargin: margin },
              modifiedDate: today,
              modifiedBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'),
            });

            window.App.closeModal();
            self._rerender();
          });
        }, 50);
      });
    }
  },
};

/* ================================================================
   4. window.Pages.costChangeRequests — Change Requests
   ================================================================ */
window.Pages.costChangeRequests = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.costChangeRequests.render();
    window.Pages.costChangeRequests.init();
    if (typeof App !== 'undefined' && typeof App.updateCostBadges === 'function') {
      App.updateCostBadges();
    }
  },

  render() {
    const d = window.MockData;
    const ccr = d.costChangeRequests;
    const mcr = d.marginChangeRequests;
    const self = window.Pages.costPricing;

    const pendingCount = ccr.filter(r => r.status === 'Pending').length + mcr.filter(r => r.status === 'Pending').length;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="flex items-center gap-12">
          <a href="#cost-pricing" onclick="event.preventDefault();App.navigate('cost-pricing')" class="btn btn-outline btn-sm"><i class="fa-solid fa-arrow-left"></i> Cost Config</a>
          <h1 class="heading">CHANGE REQUESTS
            ${pendingCount > 0 ? `<span class="chip chip-yellow" style="font-size:12px;padding:2px 8px;margin-left:8px;">${pendingCount} Pending</span>` : ''}
          </h1>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline btn-sm" onclick="App.navigate('cost-margin')"><i class="fa-solid fa-percent"></i> Margin Config</button>
        </div>
      </div>

      <!-- Cost Change Requests -->
      <div class="section-title mb-12"><i class="fa-solid fa-coins"></i> Cost Change Requests</div>
      <div class="table-wrap mb-24" id="ccr-table-wrap"></div>

      <!-- Margin Change Requests -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-percent"></i> Margin Change Requests</div>
      <div class="table-wrap mb-24" id="mcr-table-wrap"></div>

      <!-- Approval Log -->
      <div class="divider mb-20"></div>
      <div class="section-title mb-12"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติการอนุมัติ/ปฏิเสธ</div>
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="cr-log-search" placeholder="ค้นหา ID / ชื่อบริการ / เป้าหมาย...">
        </div>
        <div class="tab-bar" id="cr-log-tabs">
          <div class="tab-item active" data-tab="all">All</div>
          <div class="tab-item" data-tab="Approved">Approved</div>
          <div class="tab-item" data-tab="Rejected">Rejected</div>
        </div>
      </div>
      <div class="table-wrap" id="cr-log-table-wrap"></div>
    `;
  },

  _renderTables() {
    const d = window.MockData;
    const self2 = window.Pages.costPricing;

    // ── Cost Change Requests (no filter — show all) ──
    const ccr = d.costChangeRequests;

    const ccrWrap = document.getElementById('ccr-table-wrap');
    if (ccrWrap) {
      if (!ccr.length) {
        ccrWrap.innerHTML = '<div class="text-sm text-muted p-16" style="text-align:center;">ไม่พบคำขอเปลี่ยนแปลงต้นทุน</div>';
      } else {
        ccrWrap.innerHTML = `<table><thead><tr>
          <th>ID</th><th>Service Code</th><th>ชื่อบริการ</th><th>ต้นทุนปัจจุบัน</th><th>ต้นทุนใหม่</th>
          <th>เหตุผล</th><th>วันที่มีผล</th><th>สถานะ</th><th>ร้องขอโดย</th><th>จัดการ</th>
        </tr></thead><tbody>${ccr.map(r => {
          const diff = r.newCost - r.currentCost;
          const diffPct = ((diff / r.currentCost) * 100).toFixed(2);
          return `<tr>
            <td class="mono text-sm">${r.id}</td>
            <td class="mono text-primary font-600">${r.serviceCode}</td>
            <td class="font-600">${r.serviceName}</td>
            <td class="mono">${self2._fmtCost(r.currentCost)}</td>
            <td class="mono font-600 ${diff < 0 ? 'text-success' : 'text-error'}">${self2._fmtCost(r.newCost)}
              <span class="text-xs ${diff < 0 ? 'text-success' : 'text-error'}">(${diff < 0 ? '' : '+'}${diffPct}%)</span>
            </td>
            <td class="text-sm">${r.reason}</td>
            <td class="text-sm mono">${r.effectiveDate}</td>
            <td>${d.statusChip(r.status)}</td>
            <td style="white-space:nowrap;">
              <div class="text-sm font-600">${r.requestedBy}</div>
              <div class="mono text-xs text-muted">${r.requestDate}${r.requestTime ? ' · ' + r.requestTime : ''}</div>
            </td>
            <td>${r.status === 'Pending' ? `<div class="flex gap-6">
              <button class="btn btn-sm btn-success ccr-approve-btn" data-id="${r.id}"><i class="fa-solid fa-check"></i></button>
              <button class="btn btn-sm btn-danger ccr-reject-btn" data-id="${r.id}"><i class="fa-solid fa-xmark"></i></button>
            </div>` : `<span class="text-sm text-muted">${r.approvedBy || '-'}</span>`}</td>
          </tr>`;
        }).join('')}</tbody></table>`;
      }
    }

    // ── Margin Change Requests (no filter — show all) ──
    const mcr = d.marginChangeRequests;

    const mcrWrap = document.getElementById('mcr-table-wrap');
    if (mcrWrap) {
      if (!mcr.length) {
        mcrWrap.innerHTML = '<div class="text-sm text-muted p-16" style="text-align:center;">ไม่พบคำขอเปลี่ยนแปลง Margin</div>';
      } else {
        mcrWrap.innerHTML = `<table><thead><tr>
          <th>ID</th><th>ระดับ</th><th>เป้าหมาย</th><th>Margin ปัจจุบัน</th><th>Margin ใหม่</th>
          <th>เหตุผล</th><th>สถานะ</th><th>ร้องขอโดย</th><th>จัดการ</th>
        </tr></thead><tbody>${mcr.map(r => {
          const diff = r.newMargin - r.currentMargin;
          return `<tr>
            <td class="mono text-sm">${r.id}</td>
            <td><span class="chip chip-blue">${r.level}</span></td>
            <td class="mono text-primary font-600">${r.target}</td>
            <td class="mono">${r.currentMargin}%</td>
            <td class="mono font-600 ${diff > 0 ? 'text-success' : 'text-error'}">${r.newMargin}%
              <span class="text-xs ${diff > 0 ? 'text-success' : 'text-error'}">(${diff > 0 ? '+' : ''}${diff}%)</span>
            </td>
            <td class="text-sm">${r.reason}</td>
            <td>${d.statusChip(r.status)}</td>
            <td style="white-space:nowrap;">
              <div class="text-sm font-600">${r.requestedBy}</div>
              <div class="mono text-xs text-muted">${r.requestDate}${r.requestTime ? ' · ' + r.requestTime : ''}</div>
            </td>
            <td>${r.status === 'Pending' ? `<div class="flex gap-6">
              <button class="btn btn-sm btn-success mcr-approve-btn" data-id="${r.id}"><i class="fa-solid fa-check"></i></button>
              <button class="btn btn-sm btn-danger mcr-reject-btn" data-id="${r.id}"><i class="fa-solid fa-xmark"></i></button>
            </div>` : `<span class="text-sm text-muted">${r.approvedBy || '-'}</span>`}</td>
          </tr>`;
        }).join('')}</tbody></table>`;
      }
    }

    // ── Approval Log (filtered) ──
    this._renderLog();
  },

  _renderLog() {
    const d = window.MockData;
    const logSearch = (document.getElementById('cr-log-search') || {}).value.trim().toLowerCase();
    const logTab = document.querySelector('#cr-log-tabs .tab-item.active');
    const logStatus = logTab ? logTab.dataset.tab : 'all';

    let allRequests = [
      ...d.costChangeRequests.filter(r => r.status !== 'Pending').map(r => ({
        id: r.id, type: 'Cost', target: r.serviceName, action: r.status,
        actionBy: r.approvedBy || '-', actionDate: r.modifiedDate, detail: `${r.serviceCode}: ${r.currentCost} → ${r.newCost} THB`
      })),
      ...d.marginChangeRequests.filter(r => r.status !== 'Pending').map(r => ({
        id: r.id, type: 'Margin', target: r.target, action: r.status,
        actionBy: r.approvedBy || '-', actionDate: r.modifiedDate, detail: `${r.currentMargin}% → ${r.newMargin}%`
      }))
    ].sort((a, b) => b.actionDate.localeCompare(a.actionDate));

    if (logSearch) {
      allRequests = allRequests.filter(r =>
        r.id.toLowerCase().includes(logSearch) ||
        r.target.toLowerCase().includes(logSearch) ||
        r.detail.toLowerCase().includes(logSearch)
      );
    }
    if (logStatus !== 'all') allRequests = allRequests.filter(r => r.action === logStatus);

    const logWrap = document.getElementById('cr-log-table-wrap');
    if (!logWrap) return;

    if (!allRequests.length) {
      logWrap.innerHTML = '<div class="text-sm text-muted p-8">ยังไม่มีประวัติการอนุมัติ/ปฏิเสธที่ตรงกับเงื่อนไข</div>';
    } else {
      logWrap.innerHTML = `<table><thead><tr>
        <th>ID</th><th>ประเภท</th><th>เป้าหมาย</th><th>รายละเอียด</th><th>ผล</th><th>ดำเนินการโดย</th><th>วันที่</th>
      </tr></thead><tbody>${allRequests.map(r => `<tr>
        <td class="mono text-sm">${r.id}</td>
        <td><span class="chip ${r.type === 'Cost' ? 'chip-orange' : 'chip-blue'}">${r.type}</span></td>
        <td class="font-600">${r.target}</td>
        <td class="text-sm text-muted">${r.detail}</td>
        <td>${r.action === 'Approved'
          ? '<span class="chip chip-green"><i class="fa-solid fa-check"></i> อนุมัติ</span>'
          : '<span class="chip chip-red"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</span>'}</td>
        <td class="text-sm font-600">${r.actionBy}</td>
        <td class="mono text-sm text-muted">${r.actionDate}</td>
      </tr>`).join('')}</tbody></table>`;
    }
  },

  _bindApprovalButtons() {
    const d = window.MockData;
    const self = window.Pages.costChangeRequests;

    // ─── Approve / Reject Cost Change Requests ───
    document.querySelectorAll('.ccr-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const req = d.costChangeRequests.find(r => r.id === id);
        if (!req) return;
        App.confirm(`อนุมัติคำขอ ${id}?\n${req.serviceName}: ${req.currentCost} -> ${req.newCost} THB\nเหตุผล: ${req.reason}`, { title: 'ยืนยันการอนุมัติ', confirmText: 'อนุมัติ', cancelText: 'ยกเลิก', type: 'success' }).then(ok => {
          if (!ok) return;
          req.status = 'Approved';
          req.approvedBy = 'Owner';
          req.modifiedDate = new Date().toISOString().split('T')[0];
          req.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
          const cost = d.costConfig.find(c => c.serviceCode === req.serviceCode);
          if (cost) { cost.costPerUnit = req.newCost; cost.effectiveDate = req.effectiveDate; cost.modifiedDate = req.modifiedDate; cost.modifiedBy = req.modifiedBy; }
          self._renderTables();
          self._bindApprovalButtons();
          if (typeof App !== 'undefined' && typeof App.updateCostBadges === 'function') App.updateCostBadges();
        });
      });
    });

    document.querySelectorAll('.ccr-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const req = d.costChangeRequests.find(r => r.id === id);
        if (!req) return;
        App.confirm(`ปฏิเสธคำขอ ${id}?\n${req.serviceName}: ${req.currentCost} -> ${req.newCost} THB`, { title: 'ยืนยันการปฏิเสธ', confirmText: 'ปฏิเสธ', cancelText: 'ยกเลิก', type: 'danger' }).then(ok => {
          if (!ok) return;
          req.status = 'Rejected';
          req.approvedBy = 'Owner';
          req.modifiedDate = new Date().toISOString().split('T')[0];
          req.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
          self._renderTables();
          self._bindApprovalButtons();
          if (typeof App !== 'undefined' && typeof App.updateCostBadges === 'function') App.updateCostBadges();
        });
      });
    });

    // ─── Approve / Reject Margin Change Requests ───
    document.querySelectorAll('.mcr-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const req = d.marginChangeRequests.find(r => r.id === id);
        if (!req) return;
        App.confirm(`อนุมัติคำขอ ${id}?\n${req.target}: ${req.currentMargin}% -> ${req.newMargin}%\nเหตุผล: ${req.reason}`, { title: 'ยืนยันการอนุมัติ', confirmText: 'อนุมัติ', cancelText: 'ยกเลิก', type: 'success' }).then(ok => {
          if (!ok) return;
          req.status = 'Approved';
          req.approvedBy = 'Owner';
          req.modifiedDate = new Date().toISOString().split('T')[0];
          req.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
          if (req.level === 'Service Code') {
            const sc = d.marginConfig.serviceCodes.find(s => s.code === req.target);
            if (sc) { sc.margin = req.newMargin; sc.modifiedDate = req.modifiedDate; sc.modifiedBy = req.modifiedBy; }
          } else if (req.level === 'Global') {
            d.marginConfig.global = req.newMargin; d.marginConfig.modifiedDate = req.modifiedDate; d.marginConfig.modifiedBy = req.modifiedBy;
          } else if (req.level === 'Provider') {
            const provider = d.marginConfig.providers.find(p => p.name === req.target);
            if (provider) { provider.margin = req.newMargin; provider.modifiedDate = req.modifiedDate; provider.modifiedBy = req.modifiedBy; }
          }
          self._renderTables();
          self._bindApprovalButtons();
          if (typeof App !== 'undefined' && typeof App.updateCostBadges === 'function') App.updateCostBadges();
        });
      });
    });

    document.querySelectorAll('.mcr-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const req = d.marginChangeRequests.find(r => r.id === id);
        if (!req) return;
        App.confirm(`ปฏิเสธคำขอ ${id}?\n${req.target}: ${req.currentMargin}% -> ${req.newMargin}%`, { title: 'ยืนยันการปฏิเสธ', confirmText: 'ปฏิเสธ', cancelText: 'ยกเลิก', type: 'danger' }).then(ok => {
          if (!ok) return;
          req.status = 'Rejected';
          req.approvedBy = 'Owner';
          req.modifiedDate = new Date().toISOString().split('T')[0];
          req.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
          self._renderTables();
          self._bindApprovalButtons();
          if (typeof App !== 'undefined' && typeof App.updateCostBadges === 'function') App.updateCostBadges();
        });
      });
    });
  },

  init() {
    const d = window.MockData;
    const self = window.Pages.costChangeRequests;

    // ─── Render tables + bind approval buttons ───
    self._renderTables();
    self._bindApprovalButtons();

    // ─── Log filter events ───
    const logSearch = document.getElementById('cr-log-search');
    if (logSearch) logSearch.addEventListener('input', () => self._renderLog());
    document.querySelectorAll('#cr-log-tabs .tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#cr-log-tabs .tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        self._renderLog();
      });
    });
  },
};
