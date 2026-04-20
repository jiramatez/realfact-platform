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
    return v.toFixed(2);
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
    const activeSnapshotCount = snapshots.filter(s => d.isSnapshotActive(s)).length;
    const expiringSoon = d.getExpiringSnapshots(30).length;
    const priceGuardCritical = d.getPriceGuardAlerts().filter(a => a.severity === 'critical').length;

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

    // Severity rank for sort: critical > warning > info
    const sevRank = { critical: 0, warning: 1, info: 2 };
    const sortedAlerts = [...alerts].sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
    const critCount = alerts.filter(a => a.severity === 'critical').length;
    const warnCount = alerts.filter(a => a.severity === 'warning').length;
    const infoCount = alerts.filter(a => a.severity === 'info').length;

    return `
      ${alerts.length ? `
        <!-- Safeguard Alerts Strip (top, compact) -->
        <div class="safeguard-strip mb-16" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
          <div class="flex items-center gap-12 px-16 py-12" style="background:var(--surface);border-bottom:1px solid var(--border);">
            <i class="fa-solid fa-shield-halved" style="color:${critCount ? 'var(--error)' : (warnCount ? '#f59e0b' : 'var(--primary)')};font-size:14px;"></i>
            <span class="font-700 text-sm">Safeguard Alerts</span>
            <div class="flex gap-6">
              ${critCount ? `<span class="chip chip-red" style="font-size:10px;">${critCount} critical</span>` : ''}
              ${warnCount ? `<span class="chip chip-yellow" style="font-size:10px;">${warnCount} warning</span>` : ''}
              ${infoCount ? `<span class="chip chip-blue" style="font-size:10px;">${infoCount} info</span>` : ''}
            </div>
            <div class="flex-1"></div>
            <button class="btn-icon" id="safeguard-toggle" title="ยุบ/ขยาย" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px 8px;font-size:12px;">
              <i class="fa-solid fa-chevron-up" id="safeguard-chev"></i>
            </button>
          </div>
          <div id="safeguard-body">
            ${sortedAlerts.map(a => {
              const sty = severityStyles[a.severity] || severityStyles.info;
              return `
                <div class="flex items-center gap-12 px-16 py-12 safeguard-row" data-alert-id="${a.id}" style="border-left:3px solid ${sty.border};border-bottom:1px solid var(--border);font-size:13px;min-height:44px;">
                  <i class="fa-solid ${a.icon}" style="color:${sty.icon};font-size:13px;flex-shrink:0;width:14px;"></i>
                  <span class="font-600" style="flex-shrink:0;">${a.title}</span>
                  <span class="text-muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:0.85;">· ${a.message}</span>
                  <button class="btn btn-sm alert-action-btn" data-section="${a.action.section}" data-route="${a.action.route}" style="font-size:11px;padding:5px 12px;background:transparent;border:1px solid ${sty.border};color:${sty.icon};flex-shrink:0;">
                    ${a.action.label} →
                  </button>
                  <button class="safeguard-dismiss" data-alert-id="${a.id}" title="ปิด" style="flex-shrink:0;background:none;border:none;cursor:pointer;padding:6px 8px;opacity:0.4;font-size:13px;">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>`;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">COST & PRICING</h1>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-pricing"><i class="fa-solid fa-file-export"></i> ส่งออกข้อมูล</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-4 mb-24">
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
            <span class="stat-label">Snapshots</span>
            <div class="stat-icon purple"><i class="fa-solid fa-camera"></i></div>
          </div>
          <div class="stat-value mono">${activeSnapshotCount}</div>
          <div class="stat-change ${(priceGuardCritical || expiringSoon) ? 'down' : 'up'}">${priceGuardCritical > 0 ? `🛡️ ${priceGuardCritical} PriceGuard` : ''}${priceGuardCritical > 0 && expiringSoon > 0 ? ' · ' : ''}${expiringSoon > 0 ? `⏳ ${expiringSoon} ใกล้หมด` : ''}${!priceGuardCritical && !expiringSoon ? 'ทั้งหมดปลอดภัย' : ''}</div>
        </div>
      </div>

      <!-- Profit Dashboard (from Settlements) -->
      <div class="divider" style="margin:8px 0 24px 0;"></div>
      <div class="section-title" style="margin-bottom:6px;"><i class="fa-solid fa-coins"></i> สรุปต้นทุน &amp; กำไร (Token Economy)</div>
      <div class="text-xs text-muted mb-20">คำนวณจาก Settlement records | Token ที่หัก = Sell Price (THB) — ไม่มี conversion</div>

      <div class="grid-3 gap-16 mb-16">
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
      <div class="divider" style="margin:8px 0 24px 0;"></div>
      <div class="section-title" style="margin-bottom:6px;" id="settlement-log"><i class="fa-solid fa-scroll"></i> Settlement Log (ประวัติการคำนวณต่อ Session)</div>
      <div class="text-xs text-muted mb-20">คลิกแถวเพื่อดูรายละเอียด breakdown ทุก service | Token ที่หัก = Sell Price</div>
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
                <td class="mono text-primary font-600">${stl.sessionId}</td>
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

      <!-- Package Price Guard Section (Live Price baseline — separate from Snapshot PriceGuard) -->
      <div class="divider" style="margin:8px 0 24px 0;"></div>
      <div class="section-title" style="margin-bottom:14px;" id="package-guard"><i class="fa-solid fa-shield-halved"></i> Package Price Guard</div>
      <div class="card p-14 mb-14" style="background:var(--surface2);border-left:3px solid #3b82f6;">
        <div class="flex items-center gap-12">
          <i class="fa-solid fa-bolt" style="color:#3b82f6;"></i>
          <div class="flex-1 text-sm">เทียบราคา package กับ <strong>Live Price</strong> (avg cost ปัจจุบันต่อ Token) — สำหรับ tenant ที่ผูก Snapshot ให้ตรวจ <a href="#cost-snapshots" onclick="event.preventDefault();App.navigate('cost-snapshots')" style="text-decoration:underline;">PriceGuard</a> แทน</div>
        </div>
      </div>
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
      <div class="divider" style="margin:8px 0 24px 0;"></div>
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

        const marginSourceLabel = (src) => {
          if (src === 'service_override') return '<span class="chip chip-purple" style="font-size:10px;">Service</span>';
          if (src === 'provider_override') return '<span class="chip chip-orange" style="font-size:10px;">Provider</span>';
          return '<span class="chip chip-gray" style="font-size:10px;">Global</span>';
        };

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">Settlement Breakdown</div>
            <div class="modal-subtitle">
              Session: <span class="mono font-600">${stl.sessionId}</span> —
              ${stl.tenantName} —
              <span class="mono text-muted">${stl.date}</span>
            </div>

            <!-- Summary cards -->
            <div class="grid-4 gap-12 mb-16">
              <div class="card p-12" style="text-align:center;">
                <div class="text-xs text-muted mb-4">ต้นทุนรวม</div>
                <div class="mono font-700" style="color:var(--error);">${stl.summary.totalCost.toFixed(2)} THB</div>
              </div>
              <div class="card p-12" style="text-align:center;">
                <div class="text-xs text-muted mb-4">ราคาขายรวม</div>
                <div class="mono font-700" style="color:var(--primary);">${stl.summary.totalSell.toFixed(2)} THB</div>
              </div>
              <div class="card p-12" style="text-align:center;">
                <div class="text-xs text-muted mb-4">Token หัก</div>
                <div class="mono font-700">${stl.summary.tokensToDeduct.toFixed(3)}</div>
              </div>
              <div class="card p-12" style="text-align:center;">
                <div class="text-xs text-muted mb-4">กำไร (${stl.summary.blendedMargin.toFixed(1)}%)</div>
                <div class="mono font-700" style="color:var(--success);">${stl.summary.profit.toFixed(2)} THB</div>
              </div>
            </div>

            <div class="text-xs text-muted mb-8">Token ที่หัก = Sell Price — ไม่มี conversion</div>

            <!-- Breakdown table -->
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Cost/Unit</th>
                    <th>Margin%</th>
                    <th>Sell/Unit</th>
                    <th>Total Cost</th>
                    <th>Total Sell</th>
                  </tr>
                </thead>
                <tbody>
                  ${stl.breakdown.map(b => `
                    <tr>
                      <td class="mono text-sm font-600">${b.serviceCode}</td>
                      <td><span class="chip chip-gray text-xs">${b.type}</span></td>
                      <td class="mono">${d.formatNumber(b.quantity)}</td>
                      <td class="mono text-sm">${b.costPerUnit.toFixed(4)}</td>
                      <td>
                        <span class="mono font-600">${(b.effectiveMargin * 100).toFixed(0)}%</span>
                        ${marginSourceLabel(b.marginSource)}
                      </td>
                      <td class="mono text-sm">${b.sellPerUnit.toFixed(6)}</td>
                      <td class="mono" style="color:var(--error);">${b.totalCost.toFixed(3)}</td>
                      <td class="mono" style="color:var(--primary);">${b.totalSell.toFixed(3)}</td>
                    </tr>
                  `).join('')}
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

    // ─── Safeguard Strip: collapse/expand ───
    const sfToggle = document.getElementById('safeguard-toggle');
    const sfBody = document.getElementById('safeguard-body');
    const sfChev = document.getElementById('safeguard-chev');
    if (sfToggle && sfBody) {
      sfToggle.addEventListener('click', () => {
        const hidden = sfBody.style.display === 'none';
        sfBody.style.display = hidden ? 'block' : 'none';
        if (sfChev) sfChev.className = hidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      });
    }
    // ─── Safeguard Strip: dismiss row ───
    document.querySelectorAll('.safeguard-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.safeguard-row');
        if (row) {
          row.style.transition = 'opacity 0.2s';
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            const remaining = document.querySelectorAll('.safeguard-row').length;
            if (!remaining) {
              const strip = document.querySelector('.safeguard-strip');
              if (strip) strip.remove();
            }
          }, 220);
        }
      });
    });

        // ─── Alert Action Buttons — navigate off-page or scroll to section ───
    document.querySelectorAll('.alert-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        const route = btn.dataset.route;
        if (section === 'margin-config') {
          App.navigate('cost-margin');
          return;
        }
        if (route && route !== 'cost-pricing') {
          const target0 = document.getElementById(section);
          if (target0) { target0.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
          App.navigate(route);
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
      return n.toFixed(2);
    }

    function fmtSell(cost, margin) {
      const s = self._sell(cost, margin);
      return s.toFixed(2);
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
   3. window.Pages.snapshots — Snapshots + PriceGuard (unified brief)
   ================================================================ */
window.Pages.snapshots = {

  _filters: { status: 'all', search: '' },
  _wizard: null,

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.snapshots.render();
    window.Pages.snapshots.init();
  },

  render() {
    const d = window.MockData;
    const snaps = d.snapshots;
    const active = snaps.filter(s => d.isSnapshotActive(s));
    const scheduled = snaps.filter(s => s.status === 'scheduled');
    const expiring = d.getExpiringSnapshots(30);
    const pgAlerts = d.getPriceGuardAlerts();
    const pgCritical = pgAlerts;

    return `
      ${pgAlerts.length ? this._renderPriceGuard(pgAlerts) : ''}
      ${expiring.length ? this._renderExpiration(expiring) : ''}

      <div class="page-header">
        <div class="flex items-center gap-12">
          <a href="#cost-pricing" onclick="event.preventDefault();App.navigate('cost-pricing')" class="btn btn-outline btn-sm"><i class="fa-solid fa-arrow-left"></i> Cost Config</a>
          <h1 class="heading">SNAPSHOTS</h1>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary btn-sm" id="btn-new-snapshot"><i class="fa-solid fa-plus"></i> สร้าง Snapshot ใหม่</button>
        </div>
      </div>

      <div class="grid-4 mb-24">
        <div class="stat-card">
          <div class="stat-header"><span class="stat-label">Active</span><div class="stat-icon green"><i class="fa-solid fa-camera"></i></div></div>
          <div class="stat-value mono">${active.length}</div>
          <div class="stat-change up">ใช้อยู่ขณะนี้</div>
        </div>
        <div class="stat-card">
          <div class="stat-header"><span class="stat-label">Scheduled</span><div class="stat-icon blue"><i class="fa-solid fa-calendar-plus"></i></div></div>
          <div class="stat-value mono">${scheduled.length}</div>
          <div class="stat-change up">รอวันเริ่ม</div>
        </div>
        <div class="stat-card">
          <div class="stat-header"><span class="stat-label">ใกล้หมดอายุ (≤30d)</span><div class="stat-icon ${expiring.length ? 'yellow' : 'green'}"><i class="fa-solid fa-hourglass-half"></i></div></div>
          <div class="stat-value mono">${expiring.length}</div>
          <div class="stat-change ${expiring.length ? 'down' : 'up'}">${expiring.length ? 'ต้องดำเนินการ' : 'ปลอดภัย'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header"><span class="stat-label">PriceGuard</span><div class="stat-icon ${pgCritical.length ? 'red' : 'green'}"><i class="fa-solid fa-shield-halved"></i></div></div>
          <div class="stat-value mono">${pgCritical.length}</div>
          <div class="stat-change ${pgCritical.length ? 'down' : 'up'}">${pgCritical.length ? 'ขาดทุน (ต้องแก้)' : 'ปลอดภัย'}</div>
        </div>
      </div>

      <div class="flex items-center gap-12 mb-20">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="sn-search" placeholder="ค้นหา Snapshot ID / ชื่อ / Tenant..." value="${this._filters.search}">
        </div>
        <div class="form-group" style="margin:0;min-width:140px;">
          <select class="form-input" id="sn-status-filter">
            <option value="all">ทุกสถานะ</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div class="table-wrap" id="sn-table-wrap"></div>
    `;
  },

  _renderPriceGuard(alerts) {
    const d = window.MockData;
    const critCount = alerts.length;
    const renderRow = (a) => {
      const color = 'var(--error)';
      const bg = 'rgba(239,68,68,0.04)';
      return `<div class="flex items-center gap-14 px-20 py-12 pg-row" style="border-left:3px solid ${color};border-bottom:1px solid var(--border);background:${bg};font-size:13px;">
        <i class="fa-solid fa-shield-halved" style="color:${color};font-size:14px;flex-shrink:0;width:14px;"></i>
        <div class="flex-1" style="min-width:0;">
          <span class="font-600">${a.snapshotName}</span>
          <span class="mono text-xs text-dim" style="margin-left:6px;">${a.snapshotId}</span>
          <span style="margin-left:10px;">กำลังขาดทุน <span class="mono font-700" style="color:${color};">${a.lossPct.toFixed(1)}%</span></span>
        </div>
        <button class="btn btn-sm alert-action-btn btn-view-snap" data-id="${a.snapshotId}" style="font-size:11px;padding:5px 12px;background:transparent;border:1px solid ${color};color:${color};flex-shrink:0;"><i class="fa-solid fa-eye"></i> ดู</button>
      </div>`;
    };
    return `<div class="safeguard-strip mb-16" id="priceguard" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
      <div class="flex items-center gap-12 px-20 py-12" style="background:var(--surface);border-bottom:1px solid var(--border);">
        <i class="fa-solid fa-shield-halved" style="color:var(--error);font-size:14px;"></i>
        <span class="font-700 text-sm">PriceGuard</span>
        <span class="chip chip-red" style="font-size:10px;">${critCount} ขาดทุน</span>
        <div class="flex-1"></div>
        <button class="btn-icon" id="pg-toggle" title="ยุบ/ขยาย" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px 8px;font-size:12px;">
          <i class="fa-solid fa-chevron-up" id="pg-chev"></i>
        </button>
      </div>
      <div id="pg-body">
        ${alerts.map(renderRow).join('')}
      </div>
    </div>`;
  },

  _renderExpiration(list) {
    const d = window.MockData;
    const renderRow = (s) => {
      const rem = d.snapshotDaysRemaining(s);
      const tenants = s.tenantIds.map(tid => (d.tenants.find(t => t.id === tid) || {}).name || tid).join(', ');
      const color = rem <= 7 ? 'var(--error)' : '#f59e0b';
      return `<div class="flex items-center gap-14 px-20 py-12 exp-row" style="border-left:3px solid ${color};border-bottom:1px solid var(--border);background:rgba(245,158,11,0.03);font-size:13px;">
        <i class="fa-solid fa-hourglass-half" style="color:${color};font-size:14px;flex-shrink:0;width:14px;"></i>
        <div class="flex-1" style="min-width:0;">
          <div class="flex items-center gap-8" style="flex-wrap:wrap;">
            <span class="font-600">${s.name}</span>
            <span class="mono text-xs text-dim">${s.id}</span>
            <span class="text-muted">·</span>
            <span class="text-xs text-muted">${tenants}</span>
            <span class="text-muted">·</span>
            <span class="mono text-xs text-muted">${s.startDate} → ${s.endDate}</span>
          </div>
        </div>
        <span class="mono font-700" style="color:${color};font-size:14px;flex-shrink:0;">${rem}d</span>
        <button class="btn btn-sm alert-action-btn btn-view-snap" data-id="${s.id}" style="font-size:11px;padding:5px 12px;background:transparent;border:1px solid ${color};color:${color};flex-shrink:0;"><i class="fa-solid fa-eye"></i> ดู</button>
      </div>`;
    };
    return `<div class="safeguard-strip mb-16" id="expiration-section" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
      <div class="flex items-center gap-12 px-20 py-12" style="background:var(--surface);border-bottom:1px solid var(--border);">
        <i class="fa-solid fa-hourglass-half" style="color:#f59e0b;font-size:14px;"></i>
        <span class="font-700 text-sm">ใกล้หมดอายุ (≤30 วัน) · ${list.length} snapshot</span>
        <div class="flex-1"></div>
        <button class="btn-icon" id="exp-toggle" title="ยุบ/ขยาย" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px 8px;font-size:12px;">
          <i class="fa-solid fa-chevron-up" id="exp-chev"></i>
        </button>
      </div>
      <div id="exp-body">
        ${list.map(renderRow).join('')}
      </div>
    </div>`;
  },

  _renderTable() {
    const d = window.MockData;
    const f = this._filters;
    let list = [...d.snapshots];
    if (f.status !== 'all') list = list.filter(s => s.status === f.status);
    if (f.search) {
      const q = f.search.toLowerCase();
      list = list.filter(s => {
        if (s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) return true;
        return s.tenantIds.some(tid => {
          const t = d.tenants.find(x => x.id === tid);
          return t && t.name.toLowerCase().includes(q);
        });
      });
    }

    const wrap = document.getElementById('sn-table-wrap');
    if (!wrap) return;
    if (!list.length) { wrap.innerHTML = '<div class="text-sm text-muted p-16" style="text-align:center;">ไม่พบ Snapshot</div>'; return; }

    wrap.innerHTML = `<table><thead><tr>
      <th>ID</th><th>ชื่อ</th><th>Tenants</th><th>Services</th><th>Period</th><th>Duration</th><th>เหลือ</th><th>สถานะ</th><th>สร้างเมื่อ</th><th>Actions</th>
    </tr></thead><tbody>${list.map(s => {
      const rem = d.snapshotDaysRemaining(s);
      const dur = Math.max(1, Math.ceil((new Date(s.endDate) - new Date(s.startDate)) / 86400000));
      const firstTenant = s.tenantIds[0] ? ((d.tenants.find(t => t.id === s.tenantIds[0]) || {}).name || s.tenantIds[0]) : '—';
      const extra = s.tenantIds.length > 1 ? ` <span class="chip chip-gray" style="font-size:10px;">+${s.tenantIds.length - 1}</span>` : '';
      const isActive = d.isSnapshotActive(s);
      return `<tr>
        <td class="mono text-sm">${s.id}</td>
        <td class="font-600">${s.name}</td>
        <td>${firstTenant}${extra}</td>
        <td class="mono">${s.services.length}</td>
        <td class="mono text-xs">${s.startDate} → ${s.endDate}</td>
        <td class="mono text-sm">${dur}d</td>
        <td>${s.status === 'scheduled' ? '<span class="text-dim">—</span>' : (rem === null ? '—' : (isActive ? `<span class="mono ${rem <= 30 ? 'text-warning font-700' : 'text-sm'}">${rem}d</span>` : '<span class="text-dim mono">0d</span>'))}</td>
        <td>${d.snapshotStatusChip(s)}</td>
        <td><div class="mono text-xs">${s.createdDate}</div><div class="text-xs text-dim mono" style="margin-top:2px;">${(s.createdBy || '').split('@')[0]}</div></td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-snap" data-id="${s.id}" title="ดูรายละเอียด"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>`;
    }).join('')}</tbody></table>`;
  },

  _showDetail(id) {
    const d = window.MockData;
    const s = d.snapshots.find(x => x.id === id);
    if (!s) return;
    const rem = d.snapshotDaysRemaining(s);
    const dur = Math.max(1, Math.ceil((new Date(s.endDate) - new Date(s.startDate)) / 86400000));
    const tenants = s.tenantIds.map(tid => d.tenants.find(t => t.id === tid)).filter(Boolean);

    const catChipD = (c) => {
      const m = { Text: 'chip-blue', Audio: 'chip-purple', Video: 'chip-orange', Embedding: 'chip-gray', Primary: 'chip-gray' };
      return '<span class="chip ' + (m[c] || 'chip-gray') + '" style="font-size:10px;">' + c + '</span>';
    };
    const varChipD = (v) => {
      const m = { Input: 'chip-blue', Output: 'chip-purple', Primary: 'chip-gray' };
      return '<span class="chip ' + (m[v] || 'chip-gray') + '" style="font-size:10px;">' + v + '</span>';
    };
    // Group snapshot.services by serviceCode
    const groupedDetail = {};
    s.services.forEach(sv => { (groupedDetail[sv.serviceCode] = groupedDetail[sv.serviceCode] || []).push(sv); });
    const svcRows = Object.keys(groupedDetail).map(code => {
      const dimsList = groupedDetail[code];
      const n = dimsList.length;
      return dimsList.map((sv, i) => {
        const cat = sv.category || 'Primary';
        const vrt = sv.variant || 'Primary';
        const liveDims = d.serviceDimensions(sv.serviceCode);
        const liveDim = liveDims.find(x => x.category === cat && x.variant === vrt);
        const liveCost = liveDim ? liveDim.cost : 0;
        const lockedMargin = sv.sell > 0 ? ((sv.sell - sv.cost) / sv.sell) * 100 : 0;
        const currentMargin = sv.sell > 0 ? ((sv.sell - liveCost) / sv.sell) * 100 : 0;
        const marginDelta = currentMargin - lockedMargin;
        const isLoss = currentMargin < 0;
        const costChanged = Math.abs(liveCost - sv.cost) > 1e-9;
        const liveCostColor = isLoss ? 'var(--error)' : (costChanged ? '#f59e0b' : 'var(--text-muted)');
        const marginNowColor = isLoss ? 'var(--error)' : 'var(--success)';
        return `<tr ${i > 0 ? 'style="border-top:1px dashed var(--border);"' : ''}>
          ${i === 0 ? `<td rowspan="${n}" style="vertical-align:top;border-right:1px solid var(--border);" class="mono text-sm font-600">${sv.serviceCode}${n > 1 ? `<div class="text-xs text-dim mt-2">${n} dims</div>` : ''}</td>` : ''}
          <td>${catChipD(cat)}</td>
          <td>${varChipD(vrt)}</td>
          <td class="mono text-sm">${sv.cost.toFixed(6)}</td>
          <td class="mono font-600">${sv.sell.toFixed(6)}</td>
          <td class="mono text-sm" style="color:var(--success);">${lockedMargin.toFixed(1)}%</td>
          <td class="mono text-sm" style="color:${liveCostColor};">${liveCost.toFixed(6)}${costChanged ? ` <span class="text-xs" style="opacity:0.7;">(${liveCost > sv.cost ? '+' : ''}${((liveCost/sv.cost - 1) * 100).toFixed(1)}%)</span>` : ''}</td>
          <td class="mono font-600" style="color:${marginNowColor};">${isLoss ? '⚠ ' : ''}${currentMargin.toFixed(1)}%${marginDelta !== 0 ? ` <span class="text-xs" style="opacity:0.7;">(${marginDelta > 0 ? '+' : ''}${marginDelta.toFixed(1)}pt)</span>` : ''}</td>
        </tr>`;
      }).join('');
    }).join('');

    App.showModal(`
      <div class="modal modal-wide">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title heading">${s.name}</div>
        <div class="modal-subtitle mono">${s.id}</div>
        <div class="flex gap-8 mb-12">
          ${d.snapshotStatusChip(s)}
          ${s.tenantIds.length > 1 ? `<span class="chip chip-purple">${s.tenantIds.length} tenants</span>` : ''}
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="card p-12"><div class="text-xs text-muted mb-4">Period</div><div class="mono text-sm">${s.startDate} → ${s.endDate}</div><div class="text-xs text-dim mt-2">${dur} วัน</div></div>
          <div class="card p-12"><div class="text-xs text-muted mb-4">เหลือ</div><div class="mono font-700" style="font-size:22px;color:${rem !== null && rem <= 30 ? '#f59e0b' : 'var(--text)'};">${rem !== null ? rem + ' วัน' : '—'}</div>${s.status === 'scheduled' ? '<div class="text-xs text-dim mt-2">รอเริ่ม</div>' : ''}</div>
          <div class="card p-12"><div class="text-xs text-muted mb-4">Services</div><div class="mono font-700" style="font-size:22px;">${s.services.length}</div></div>
        </div>
        <div class="section-title mb-8"><i class="fa-solid fa-users"></i> Tenants (${tenants.length})</div>
        <div class="card p-12 mb-16">${tenants.map(t => `<span class="chip chip-blue" style="margin-right:6px;">${t.name} <span class="mono text-xs" style="opacity:0.6;">${t.id}</span></span>`).join('') || '<span class="text-muted">—</span>'}</div>

        <div class="section-title mb-8"><i class="fa-solid fa-list"></i> Frozen Prices vs Live</div>
        <div class="text-xs text-muted mb-10" style="padding:0 2px;">
          <i class="fa-solid fa-circle-info"></i> <strong>Locked</strong> = ราคาที่ freeze ตอนสร้าง · <strong>Live Cost</strong> = ต้นทุนปัจจุบันจาก Cost Config (อัปเดตตาม Cost Change Request) · <strong>Margin (ตอนนี้)</strong> = กำไรถ้าเรายังขายที่ locked sell แต่ต้นทุนเปลี่ยนไปแล้ว
        </div>
        <div class="table-wrap"><table><thead>
          <tr>
            <th rowspan="2" style="vertical-align:bottom;">Service</th>
            <th rowspan="2" style="vertical-align:bottom;">Category</th>
            <th rowspan="2" style="vertical-align:bottom;">Variant</th>
            <th colspan="3" style="text-align:center;border-bottom:1px solid var(--border);background:rgba(34,197,94,0.05);">ตอนสร้าง (Locked)</th>
            <th colspan="2" style="text-align:center;border-bottom:1px solid var(--border);background:rgba(239,68,68,0.05);">ปัจจุบัน (Live)</th>
          </tr>
          <tr>
            <th style="background:rgba(34,197,94,0.05);">Cost</th>
            <th style="background:rgba(34,197,94,0.05);">Sell</th>
            <th style="background:rgba(34,197,94,0.05);">Margin</th>
            <th style="background:rgba(239,68,68,0.05);">Live Cost</th>
            <th style="background:rgba(239,68,68,0.05);">Margin ตอนนี้</th>
          </tr>
        </thead><tbody>${svcRows}</tbody></table></div>

        <div class="modal-actions" style="margin-top:20px;">
          <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
          ${(s.status === 'active' || s.status === 'scheduled') ? `<button class="btn btn-danger" id="detail-cancel-snap" data-id="${s.id}"><i class="fa-solid fa-ban"></i> ยกเลิก Snapshot</button>` : ''}
        </div>
      </div>
    `);
    setTimeout(() => {
      const btn = document.getElementById('detail-cancel-snap');
      if (btn) btn.addEventListener('click', () => { App.closeModal(); setTimeout(() => this._showCancelModal(s.id), 150); });
    }, 50);
  },

  _showWizard() {
    const d = window.MockData;
    const today = new Date().toISOString().split('T')[0];
    const defaultEnd = (() => { const t = new Date(); t.setDate(t.getDate() + 90); return t.toISOString().split('T')[0]; })();

    this._wizard = {
      step: 1,
      name: '',
      tenantIds: [],
      startDate: today,
      endDate: defaultEnd,
      services: (() => {
        const rows = [];
        d.costConfig.filter(c => c.status === 'Active').forEach(c => {
          d.serviceDimensions(c.serviceCode).forEach(dim => {
            const live = d.getLivePrice(c.serviceCode, dim.category, dim.variant);
            rows.push({
              serviceCode: c.serviceCode,
              name: c.name,
              provider: c.provider,
              category: dim.category,
              variant: dim.variant,
              cost: live ? live.cost : dim.cost,
              sell: live ? live.sell : dim.cost,
              margin: live ? live.margin : 0,
            });
          });
        });
        return rows;
      })(),
      _tenantSearch: '',
    };

    this._renderWizard();
  },

  _renderWizard() {
    const d = window.MockData;
    const w = this._wizard;
    if (!w) return;

    const stepPill = (n, label) => `<div class="flex items-center gap-8">
      <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;${w.step >= n ? 'background:var(--primary);color:#fff;' : 'background:var(--surface2);color:var(--text-muted);'}">${w.step > n ? '<i class="fa-solid fa-check"></i>' : n}</div>
      <span class="text-sm ${w.step === n ? 'font-700' : 'text-muted'}">${label}</span>
    </div>`;

    let body = '';
    let nextLabel = 'ถัดไป';
    if (w.step === 1) {
      const catChip = (c) => {
        const m = { Text: 'chip-blue', Audio: 'chip-purple', Video: 'chip-orange', Embedding: 'chip-gray', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[c] || 'chip-gray') + '" style="font-size:10px;">' + c + '</span>';
      };
      const varChip = (v) => {
        const m = { Input: 'chip-blue', Output: 'chip-purple', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[v] || 'chip-gray') + '" style="font-size:10px;">' + v + '</span>';
      };
      // Group by serviceCode
      const grouped = {};
      w.services.forEach(sv => { (grouped[sv.serviceCode] = grouped[sv.serviceCode] || []).push(sv); });
      body = `
        <div class="flex-col gap-12">
        <div class="text-sm text-muted">👉 นี่คือราคาที่คุณกำลังจะ freeze — ณ เวลาปัจจุบัน <span class="text-xs text-dim">(service หลาย dimension รวมเป็นกลุ่มเดียว)</span></div>
        <div class="table-wrap"><table><thead><tr>
          <th>Service</th><th>Provider</th><th>Category</th><th>Variant</th><th class="text-right">Cost</th><th class="text-right">Margin</th><th class="text-right">Sell</th>
        </tr></thead><tbody>
          ${Object.keys(grouped).map(code => {
            const dims = grouped[code];
            const first = dims[0];
            const n = dims.length;
            return dims.map((sv, i) => `<tr ${i > 0 ? 'style="border-top:1px dashed var(--border);"' : ''}>
              ${i === 0 ? `<td rowspan="${n}" style="vertical-align:top;border-right:1px solid var(--border);"><div class="font-600 text-sm">${first.name}</div><div class="text-xs text-dim mono">${first.serviceCode}</div>${n > 1 ? `<div class="text-xs text-dim mt-4">${n} dimensions</div>` : ''}</td><td rowspan="${n}" style="vertical-align:top;" class="text-sm">${first.provider}</td>` : ''}
              <td>${catChip(sv.category)}</td>
              <td>${varChip(sv.variant)}</td>
              <td class="text-right mono text-sm">${sv.cost.toFixed(6)}</td>
              <td class="text-right mono text-sm">${sv.margin}%</td>
              <td class="text-right mono font-700">${sv.sell.toFixed(6)}</td>
            </tr>`).join('');
          }).join('')}
        </tbody></table></div>
        </div>`;
    } else if (w.step === 2) {
      const q = (w._tenantSearch || '').toLowerCase();
      const matches = d.tenants.filter(t => t.status === 'Active').filter(t => !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q));
      // Map tenantId → existing active/scheduled snapshot (first match)
      const tenantSnapMap = {};
      d.snapshots.forEach(s => {
        if (s.status === 'active' || s.status === 'scheduled') {
          s.tenantIds.forEach(tid => { if (!tenantSnapMap[tid]) tenantSnapMap[tid] = s; });
        }
      });
      // Drop any pre-selected tenants that are now disabled
      w.tenantIds = w.tenantIds.filter(tid => !tenantSnapMap[tid]);
      const disabledCount = matches.filter(t => tenantSnapMap[t.id]).length;
      body = `
        <div class="flex-col gap-12">
        <div class="text-sm text-muted">เลือก Tenants ที่จะ apply (อย่างน้อย 1):</div>
        <div class="search-bar">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="wizard-tenant-search" placeholder="ค้นหา tenant (ชื่อ / ID / email)..." value="${w._tenantSearch || ''}">
        </div>
        <div class="card p-12" style="max-height:320px;overflow-y:auto;" id="wizard-tenant-list">
          ${matches.length === 0 ? '<div class="text-sm text-muted p-12" style="text-align:center;">ไม่พบ tenant ที่ตรง</div>' : matches.map(t => {
            const existing = tenantSnapMap[t.id];
            const disabled = !!existing;
            return `
            <label class="flex items-center gap-12" style="cursor:${disabled ? 'not-allowed' : 'pointer'};border-bottom:1px solid var(--border);padding:12px 8px;opacity:${disabled ? '0.55' : '1'};">
              <input type="checkbox" class="wizard-tenant" value="${t.id}" ${w.tenantIds.indexOf(t.id) !== -1 ? 'checked' : ''} ${disabled ? 'disabled' : ''} style="width:16px;height:16px;cursor:${disabled ? 'not-allowed' : 'pointer'};">
              <div class="flex-1">
                <div class="font-600 text-sm">${t.name}</div>
                <div class="mono text-xs text-dim" style="margin-top:2px;">${t.id} · ${t.email}</div>
                ${disabled ? `<div class="text-xs" style="color:#f59e0b;margin-top:4px;"><i class="fa-solid fa-circle-info"></i> มี Snapshot ${existing.id} อยู่แล้ว (${existing.status === 'scheduled' ? 'เริ่ม ' + existing.startDate : 'ถึง ' + existing.endDate}) — ยกเลิกก่อนจึงสร้างใหม่ได้</div>` : ''}
              </div>
              ${disabled ? '' : `<span class="chip chip-gray text-xs">${t.plan}</span>`}
            </label>`;
          }).join('')}
        </div>
        <div class="text-sm"><strong>Selected:</strong> <span id="wizard-selected-count" class="mono font-700">${w.tenantIds.length}</span> tenants${q ? ` · กรองด้วย "${w._tenantSearch}" (เจอ ${matches.length})` : ''}${disabledCount > 0 ? ` · <span class="text-muted">${disabledCount} tenant มี snapshot อยู่แล้ว</span>` : ''}</div>
        </div>`;
    } else if (w.step === 3) {
      const days = Math.max(0, Math.ceil((new Date(w.endDate) - new Date(w.startDate)) / 86400000));
      const presets = [30, 60, 90, 180, 365];
      body = `
        <div class="flex-col gap-16">
          <div class="form-group">
            <label class="form-label">ชื่อ Snapshot</label>
            <input type="text" class="form-input" id="wizard-name" placeholder="เช่น ACME Enterprise Q2 2026" value="${w.name}">
          </div>
          <div class="grid-2 gap-16">
            <div class="form-group">
              <label class="form-label">Start date <span class="text-error">*</span></label>
              <input type="date" class="form-input" id="wizard-start" value="${w.startDate}">
            </div>
            <div class="form-group">
              <label class="form-label">End date <span class="text-error">*</span></label>
              <input type="date" class="form-input" id="wizard-end" value="${w.endDate}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Duration (วัน)</label>
            <div class="flex items-center gap-10">
              <input type="number" class="form-input" id="wizard-duration-input" value="${days}" min="1" max="3650" style="max-width:140px;">
              <div class="flex gap-6" style="flex-wrap:wrap;">
                ${presets.map(p => `<button type="button" class="btn btn-sm btn-outline wizard-preset" data-days="${p}" style="font-size:11px;padding:4px 10px;${p === days ? 'background:var(--primary);color:#fff;border-color:var(--primary);' : ''}">${p}d</button>`).join('')}
              </div>
            </div>
          </div>
        </div>`;
    } else if (w.step === 4) {
      const days = Math.max(0, Math.ceil((new Date(w.endDate) - new Date(w.startDate)) / 86400000));
      const tenantNames = w.tenantIds.map(tid => (d.tenants.find(t => t.id === tid) || {}).name || tid).join(', ');
      body = `
        <div class="text-sm text-muted mb-12">📦 Summary — ตรวจสอบก่อนยืนยัน</div>
        <div class="card p-16 flex-col gap-10">
          <div class="flex justify-between"><span class="text-muted">ชื่อ:</span><span class="font-700">${w.name || '<span class="text-error">(ยังไม่ได้ตั้ง)</span>'}</span></div>
          <div class="flex justify-between"><span class="text-muted">Services × Dimensions:</span><span class="mono font-700">${new Set(w.services.map(s=>s.serviceCode)).size} × avg ${(w.services.length / Math.max(1,new Set(w.services.map(s=>s.serviceCode)).size)).toFixed(1)} dims = ${w.services.length} rows</span></div>
          <div class="flex justify-between"><span class="text-muted">Tenants:</span><span class="font-600">${tenantNames}</span></div>
          <div class="flex justify-between"><span class="text-muted">Period:</span><span class="mono">${w.startDate} → ${w.endDate}</span></div>
          <div class="flex justify-between"><span class="text-muted">Duration:</span><span class="mono font-700">${days} วัน</span></div>
        </div>
        <div class="card p-14 text-xs text-muted" style="background:rgba(59,130,246,0.06);border-left:3px solid var(--primary);margin-top:20px;">
          <i class="fa-solid fa-circle-info"></i> ราคาจะ freeze ณ วันที่คุณกด Confirm — ไม่สามารถแก้ไขหลังสร้างได้ ถ้าต้องการเปลี่ยนต้อง cancel แล้วสร้างใหม่
        </div>`;
      nextLabel = '✓ Confirm';
    }

    App.showModal(`
      <div class="modal modal-wide">
        <button class="modal-close" onclick="App.closeModal();window.Pages.snapshots._wizard=null;"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title heading" style="margin-bottom:12px;">สร้าง Snapshot ใหม่ — Step ${w.step}/4</div>
        <div class="flex items-center gap-16 mb-20" style="padding:10px 14px;background:var(--surface2);border-radius:10px;">
          ${stepPill(1, 'Preview')} <div style="flex:1;height:2px;background:${w.step > 1 ? 'var(--primary)' : 'var(--border)'};"></div>
          ${stepPill(2, 'Tenants')} <div style="flex:1;height:2px;background:${w.step > 2 ? 'var(--primary)' : 'var(--border)'};"></div>
          ${stepPill(3, 'Period')} <div style="flex:1;height:2px;background:${w.step > 3 ? 'var(--primary)' : 'var(--border)'};"></div>
          ${stepPill(4, 'Confirm')}
        </div>
        <div style="min-height:300px;">${body}</div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal();window.Pages.snapshots._wizard=null;">ยกเลิก</button>
          ${w.step > 1 ? '<button class="btn btn-outline" id="wizard-back">← ย้อน</button>' : ''}
          <button class="btn btn-primary" id="wizard-next">${nextLabel}</button>
        </div>
      </div>
    `);

    setTimeout(() => {
      if (w.step === 2) {
        const rebindCheckboxes = () => {
          document.querySelectorAll('.wizard-tenant').forEach(cb => {
            cb.addEventListener('change', () => {
              const currentIds = new Set(w.tenantIds);
              if (cb.checked) currentIds.add(cb.value); else currentIds.delete(cb.value);
              w.tenantIds = Array.from(currentIds);
              const el = document.getElementById('wizard-selected-count');
              if (el) el.textContent = w.tenantIds.length;
            });
          });
        };
        rebindCheckboxes();
        const searchEl = document.getElementById('wizard-tenant-search');
        if (searchEl) {
          searchEl.addEventListener('input', () => {
            w._tenantSearch = searchEl.value;
            // Re-render Step 2 list only, preserving focus + caret
            const caret = searchEl.selectionStart;
            this._renderWizard();
            const restored = document.getElementById('wizard-tenant-search');
            if (restored) { restored.focus(); try { restored.setSelectionRange(caret, caret); } catch(_){} }
          });
        }
      }
      if (w.step === 3) {
        const nameEl = document.getElementById('wizard-name');
        const sEl = document.getElementById('wizard-start');
        const eEl = document.getElementById('wizard-end');
        const durEl = document.getElementById('wizard-duration-input');
        const setEndFromDuration = (d) => {
          if (!sEl || !eEl || !d || d < 1) return;
          const start = new Date(sEl.value);
          start.setDate(start.getDate() + parseInt(d, 10));
          eEl.value = start.toISOString().split('T')[0];
          w.endDate = eEl.value;
        };
        const setDurationFromDates = () => {
          if (!sEl || !eEl || !durEl) return;
          const dd = Math.max(0, Math.ceil((new Date(eEl.value) - new Date(sEl.value)) / 86400000));
          durEl.value = dd;
          // Update preset button highlight
          document.querySelectorAll('.wizard-preset').forEach(b => {
            const isSel = parseInt(b.getAttribute('data-days'), 10) === dd;
            b.style.cssText = 'font-size:11px;padding:4px 10px;' + (isSel ? 'background:var(--primary);color:#fff;border-color:var(--primary);' : '');
          });
        };
        if (nameEl) nameEl.addEventListener('input', () => { w.name = nameEl.value.trim(); });
        if (sEl) sEl.addEventListener('change', () => { w.startDate = sEl.value; setDurationFromDates(); });
        if (eEl) eEl.addEventListener('change', () => { w.endDate = eEl.value; setDurationFromDates(); });
        if (durEl) durEl.addEventListener('input', () => {
          const d = parseInt(durEl.value, 10);
          if (!isNaN(d) && d >= 1) { setEndFromDuration(d); setDurationFromDates(); }
        });
        document.querySelectorAll('.wizard-preset').forEach(btn => {
          btn.addEventListener('click', () => {
            const d = parseInt(btn.getAttribute('data-days'), 10);
            if (durEl) durEl.value = d;
            setEndFromDuration(d);
            setDurationFromDates();
          });
        });
      }
      const nextBtn = document.getElementById('wizard-next');
      if (nextBtn) nextBtn.addEventListener('click', () => this._wizardNext());
      const backBtn = document.getElementById('wizard-back');
      if (backBtn) backBtn.addEventListener('click', () => { w.step--; this._renderWizard(); });
    }, 50);
  },

  _wizardNext() {
    const d = window.MockData;
    const w = this._wizard;
    if (!w) return;

    if (w.step === 2 && w.tenantIds.length === 0) { App.toast('เลือกอย่างน้อย 1 tenant', 'error'); return; }
    if (w.step === 3) {
      if (!w.name) { App.toast('กรุณาตั้งชื่อ Snapshot', 'error'); return; }
      if (!w.startDate || !w.endDate) { App.toast('กรุณากรอกวันที่ให้ครบ', 'error'); return; }
      if (new Date(w.endDate) <= new Date(w.startDate)) { App.toast('End date ต้องอยู่หลัง Start date', 'error'); return; }
    }

    if (w.step < 4) { w.step++; this._renderWizard(); return; }
    this._commitSnapshot();
  },

  _commitSnapshot(effectiveDate) {
    const d = window.MockData;
    const w = this._wizard;
    if (!w) return;
    const today = new Date().toISOString().split('T')[0];
    const user = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
    const maxNum = d.snapshots.reduce((m, s) => { const n = parseInt((s.id.split('-')[1] || '0'), 10); return Math.max(m, isNaN(n) ? 0 : n); }, 0);
    const newId = 'SNAP-' + String(maxNum + 1).padStart(3, '0');
    const startDate = effectiveDate || w.startDate;
    const status = new Date(startDate) > new Date() ? 'scheduled' : 'active';
    d.snapshots.push({
      id: newId, name: w.name,
      tenantIds: w.tenantIds.slice(),
      services: w.services.map(sv => ({ serviceCode: sv.serviceCode, category: sv.category, variant: sv.variant, cost: sv.cost, sell: sv.sell })),
      startDate, endDate: w.endDate,
      status,
      createdDate: today, createdBy: user, modifiedDate: today, modifiedBy: user,
    });
    this._wizard = null;
    App.closeModal();
    App.toast('สร้าง Snapshot ' + newId + ' สำเร็จ', 'success');
    this._rerender();
  },

  _showCancelModal(id) {
    const d = window.MockData;
    const s = d.snapshots.find(x => x.id === id);
    if (!s) return;
    const today = new Date().toISOString().split('T')[0];
    const tenantNames = s.tenantIds.map(tid => (d.tenants.find(t => t.id === tid) || {}).name || tid);

    App.showModal(`
      <div class="modal">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title heading">❓ Cancel Snapshot ${s.id}?</div>
        <div class="modal-subtitle">${s.name}</div>
        <div class="flex-col gap-12 mb-12">
          <label class="flex items-center gap-8" style="cursor:pointer;">
            <input type="radio" name="cancel-mode" value="immediate" checked>
            <span>Cancel ทันที (วันนี้ — ${today})</span>
          </label>
          <label class="flex items-center gap-8" style="cursor:pointer;">
            <input type="radio" name="cancel-mode" value="scheduled">
            <span>Cancel ในวันที่</span>
            <input type="date" class="form-input" id="cancel-date" value="${today}" style="max-width:160px;" disabled>
          </label>
        </div>
        <div class="card p-12 text-sm" style="background:var(--surface2);">
          <div class="font-600 mb-4">หลัง cancel:</div>
          ${tenantNames.map(n => `<div>• ${n} → ใช้ราคา <strong>Live</strong></div>`).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ย้อน</button>
          <button class="btn btn-danger" id="confirm-cancel"><i class="fa-solid fa-ban"></i> Confirm Cancel</button>
        </div>
      </div>
    `);
    setTimeout(() => {
      const dateInput = document.getElementById('cancel-date');
      document.querySelectorAll('input[name="cancel-mode"]').forEach(r => {
        r.addEventListener('change', () => { dateInput.disabled = document.querySelector('input[name="cancel-mode"]:checked').value !== 'scheduled'; });
      });
      document.getElementById('confirm-cancel').addEventListener('click', () => {
        const mode = document.querySelector('input[name="cancel-mode"]:checked').value;
        const cancelDate = mode === 'scheduled' ? dateInput.value : today;
        if (!cancelDate) { App.toast('กรุณาเลือกวัน', 'error'); return; }
        const user = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
        s.status = 'canceled';
        s.canceledDate = cancelDate;
        s.canceledBy = user;
        if (new Date(cancelDate) < new Date(s.endDate)) s.endDate = cancelDate;
        s.modifiedDate = today;
        App.closeModal();
        App.toast('Cancel ' + s.id + ' สำเร็จ', 'success');
        this._rerender();
      });
    }, 50);
  },

  init() {
    const d = window.MockData;
    const self = window.Pages.snapshots;

    self._renderTable();

    const bindFilter = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => { self._filters[key] = el.value; self._renderTable(); });
    };
    bindFilter('sn-search', 'search');
    bindFilter('sn-status-filter', 'status');

    document.addEventListener('click', function snDelegate(e) {
      const viewBtn = e.target.closest('.btn-view-snap');
      const cancelBtn = e.target.closest('.btn-cancel-snap');
      if (viewBtn) { self._showDetail(viewBtn.getAttribute('data-id')); return; }
      if (cancelBtn) { self._showCancelModal(cancelBtn.getAttribute('data-id')); return; }
    }, { once: false });

    // ─── PriceGuard + Expiration strip toggles ───
    const pgToggle = document.getElementById('pg-toggle');
    const pgBody = document.getElementById('pg-body');
    const pgChev = document.getElementById('pg-chev');
    if (pgToggle && pgBody) {
      pgToggle.addEventListener('click', () => {
        const hidden = pgBody.style.display === 'none';
        pgBody.style.display = hidden ? 'block' : 'none';
        if (pgChev) pgChev.className = hidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      });
    }
    const expToggle = document.getElementById('exp-toggle');
    const expBody = document.getElementById('exp-body');
    const expChev = document.getElementById('exp-chev');
    if (expToggle && expBody) {
      expToggle.addEventListener('click', () => {
        const hidden = expBody.style.display === 'none';
        expBody.style.display = hidden ? 'block' : 'none';
        if (expChev) expChev.className = hidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      });
    }

    const btnNew = document.getElementById('btn-new-snapshot');
    if (btnNew) btnNew.addEventListener('click', () => self._showWizard());
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
