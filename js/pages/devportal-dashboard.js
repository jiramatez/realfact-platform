/* ================================================================
   Page Module — Developer Portal Dashboard
   Overview: active tenants, API presets, credit usage
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.dpDashboard = {

  render() {
    var d = window.MockData;
    var s = d.dpStats;
    var creditPct = s.totalCreditLimit ? Math.round(s.totalCreditUsed / s.totalCreditLimit * 100) : 0;

    return `
      <div class="page-header">
        <h1 class="heading">DEVELOPER PORTAL DASHBOARD</h1>
      </div>

      <!-- KPI Cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Active Tenants</span>
            <div class="stat-icon orange"><i class="fa-solid fa-users"></i></div>
          </div>
          <div class="stat-value mono">${s.activeTenants}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">API Presets (Active / Total)</span>
            <div class="stat-icon blue"><i class="fa-solid fa-puzzle-piece"></i></div>
          </div>
          <div class="stat-value mono">${s.activeApiPresets}<small class="text-muted"> / ${s.totalApiPresets}</small></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">API Calls Today</span>
            <div class="stat-icon purple"><i class="fa-solid fa-bolt"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.apiCallsToday)}</div>
          <div class="stat-change up">เดือนนี้ <span class="mono">${d.formatNumber(s.apiCallsMonth)}</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Credit Usage</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-credit-card"></i></div>
          </div>
          <div class="stat-value mono">${creditPct}%</div>
          <div class="stat-change ${creditPct > 80 ? 'down' : 'up'}">${d.formatNumber(s.totalCreditUsed)} / ${d.formatNumber(s.totalCreditLimit)}</div>
        </div>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="dp-dash-search" placeholder="ค้นหา Tenant / Preset...">
        </div>
      </div>

      <!-- Credit Line Summary + Top Tenants -->
      <div class="grid-2 mb-20">
        <div>
          <div class="section-title"><i class="fa-solid fa-wallet text-primary"></i> Credit Line Summary</div>
          <div class="table-wrap" id="dp-credit-summary"></div>
        </div>
        <div>
          <div class="section-title"><i class="fa-solid fa-ranking-star text-primary"></i> Top Tenants by API Usage</div>
          <div id="dp-top-tenants"></div>
        </div>
      </div>

      <!-- API Preset Assignment Overview -->
      <div class="section-title"><i class="fa-solid fa-diagram-project text-muted"></i> API Preset Assignment Overview</div>
      <div class="table-wrap" id="dp-preset-overview"></div>
    `;
  },

  _renderTables() {
    var d = window.MockData;
    var searchEl = document.getElementById('dp-dash-search');
    var search = searchEl ? searchEl.value.trim().toLowerCase() : '';

    // Filter tenants
    var tenants = d.dpTenants;
    if (search) {
      tenants = tenants.filter(function(t) {
        return t.name.toLowerCase().indexOf(search) !== -1 || t.id.toLowerCase().indexOf(search) !== -1;
      });
    }

    // Credit Line Summary
    var creditHtml = '<table><thead><tr>' +
      '<th>Tenant</th><th>Credit Limit</th><th>Used</th><th>Available</th><th>Health</th>' +
      '</tr></thead><tbody>';
    tenants.forEach(function(t) {
      var cl = t.creditLine;
      var pct = cl.creditLimit ? Math.round(cl.availableCredit / cl.creditLimit * 100) : 0;
      var color = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--error)';
      creditHtml += '<tr>' +
        '<td><strong>' + t.name + '</strong><br><span class="text-muted mono text-xs">' + t.id + '</span></td>' +
        '<td class="mono">' + d.formatCurrency(cl.creditLimit) + '</td>' +
        '<td class="mono">' + d.formatCurrency(cl.usedAmount) + '</td>' +
        '<td class="mono">' + d.formatCurrency(cl.availableCredit) + '</td>' +
        '<td><div class="flex items-center gap-8">' +
          '<div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">' +
            '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;"></div>' +
          '</div>' +
          '<span class="mono text-xs" style="color:' + color + ';min-width:32px;">' + pct + '%</span>' +
        '</div></td>' +
        '</tr>';
    });
    if (!tenants.length) creditHtml += '<tr><td colspan="5" style="text-align:center;padding:2rem;" class="text-muted">ไม่พบ Tenant</td></tr>';
    creditHtml += '</tbody></table>';
    document.getElementById('dp-credit-summary').innerHTML = creditHtml;

    // Top Tenants by API Usage
    var sorted = tenants.slice().sort(function(a, b) { return b.apiCallsMonth - a.apiCallsMonth; });
    var maxCalls = sorted.length ? sorted[0].apiCallsMonth : 1;
    var topHtml = '';
    sorted.forEach(function(t, i) {
      var pct = Math.round(t.apiCallsMonth / maxCalls * 100);
      topHtml += '<div class="flex items-center gap-12 mb-12">' +
        '<span class="mono font-700 text-muted" style="min-width:24px;">#' + (i + 1) + '</span>' +
        '<div class="flex-1">' +
          '<div class="flex justify-between mb-4">' +
            '<span class="font-600">' + t.name + '</span>' +
            '<span class="mono text-sm">' + d.formatNumber(t.apiCallsMonth) + ' calls</span>' +
          '</div>' +
          '<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">' +
            '<div style="height:100%;width:' + pct + '%;background:var(--primary);border-radius:3px;"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    if (!sorted.length) topHtml = '<div class="text-muted text-sm" style="padding:1rem;">ไม่พบ Tenant</div>';
    document.getElementById('dp-top-tenants').innerHTML = topHtml;

    // Filter presets
    var presets = d.apiPresets;
    if (search) {
      presets = presets.filter(function(p) {
        return p.name.toLowerCase().indexOf(search) !== -1;
      });
    }

    // API Preset Assignment Overview
    var presetHtml = '<table><thead><tr>' +
      '<th>API Preset</th><th>Version</th><th>Agents</th><th>Assigned Tenants</th><th>Status</th>' +
      '</tr></thead><tbody>';
    presets.forEach(function(p) {
      presetHtml += '<tr>' +
        '<td><strong>' + p.name + '</strong></td>' +
        '<td class="mono">v' + p.version + '</td>' +
        '<td>' + p.agents.length + '</td>' +
        '<td>' + p.assignedTenants.length + '</td>' +
        '<td>' + d.statusChip(p.status) + '</td>' +
        '</tr>';
    });
    if (!presets.length) presetHtml += '<tr><td colspan="5" style="text-align:center;padding:2rem;" class="text-muted">ไม่พบ API Preset</td></tr>';
    presetHtml += '</tbody></table>';
    document.getElementById('dp-preset-overview').innerHTML = presetHtml;
  },

  init() {
    var self = this;
    self._renderTables();
    document.getElementById('dp-dash-search').addEventListener('input', function() {
      self._renderTables();
    });
  },
};
