/* ================================================================
   Page Module — Developer Portal Assign Endpoint
   N:N mapping: API Preset → Tenants (like Assign Avatar)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.dpAssignEndpoint = {

  render() {
    return `
      <div class="page-header">
        <h1 class="heading">ASSIGN ENDPOINT</h1>
      </div>
      <div class="text-sm text-muted mb-20">มอบหมาย API Preset ให้ Tenant — Preset ถูกส่งมาจาก AI Framework</div>

      <!-- KPI Cards -->
      <div class="grid-3 mb-20" id="dp-assign-stats"></div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-10 mb-16">
        <div class="tab-bar" id="dp-assign-tabs">
          <div class="tab-item active" data-tab="all">All</div>
          <div class="tab-item" data-tab="assigned">Assigned</div>
          <div class="tab-item" data-tab="unassigned">Unassigned</div>
        </div>
      </div>

      <!-- Assignment Grid -->
      <div id="dp-assign-grid"></div>
    `;
  },

  init() {
    var self = this;
    self._renderStats();
    self._renderGrid('all');

    document.querySelectorAll('#dp-assign-tabs .tab-item').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('#dp-assign-tabs .tab-item').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        self._renderGrid(tab.dataset.tab);
      });
    });
  },

  _renderStats() {
    var d = window.MockData;
    var assigned = d.apiPresets.filter(function(p) { return p.assignedTenants.length > 0; }).length;
    var unassigned = d.apiPresets.length - assigned;
    var totalAssignments = d.apiPresets.reduce(function(sum, p) { return sum + p.assignedTenants.length; }, 0);

    document.getElementById('dp-assign-stats').innerHTML =
      '<div class="stat-card">' +
        '<div class="stat-header"><span class="stat-label">Total API Presets</span><div class="stat-icon blue"><i class="fa-solid fa-puzzle-piece"></i></div></div>' +
        '<div class="stat-value mono">' + d.apiPresets.length + '</div>' +
      '</div>' +
      '<div class="stat-card">' +
        '<div class="stat-header"><span class="stat-label">Total Assignments</span><div class="stat-icon green"><i class="fa-solid fa-link"></i></div></div>' +
        '<div class="stat-value mono">' + totalAssignments + '</div>' +
      '</div>' +
      '<div class="stat-card">' +
        '<div class="stat-header"><span class="stat-label">Unassigned Presets</span><div class="stat-icon red"><i class="fa-solid fa-circle-exclamation"></i></div></div>' +
        '<div class="stat-value mono">' + unassigned + '</div>' +
      '</div>';
  },

  _renderGrid(filter) {
    var d = window.MockData;

    var presets = d.apiPresets.filter(function(p) {
      if (filter === 'assigned') return p.assignedTenants.length > 0;
      if (filter === 'unassigned') return p.assignedTenants.length === 0;
      return true;
    });

    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1rem;">';

    presets.forEach(function(p) {
      // Resolve tenant names
      var tenantBadges = '';
      p.assignedTenants.forEach(function(tid) {
        var t = d.dpTenants.find(function(x) { return x.id === tid; });
        if (t) {
          var cl = t.creditLine;
          var pct = cl.creditLimit ? Math.round(cl.availableCredit / cl.creditLimit * 100) : 0;
          var dotColor = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--error)';
          tenantBadges += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></span>' +
            '<span style="font-size:.8rem;">' + t.name + '</span>' +
            '<span class="mono text-muted" style="font-size:.7rem;">(' + t.id + ')</span>' +
          '</div>';
        }
      });
      if (!tenantBadges) {
        tenantBadges = '<p class="text-muted" style="font-size:.8rem;margin:4px 0;">ยังไม่มี Tenant</p>';
      }

      html += '<div class="card p-16" style="border:1px solid var(--border);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<div>' +
              '<strong>' + p.name + '</strong> ' +
              '<span class="mono text-muted" style="font-size:.8rem;">v' + p.version + '</span>' +
            '</div>' +
            d.statusChip(p.status) +
          '</div>' +
          '<p class="text-muted" style="font-size:.8rem;margin:0 0 8px;">' + p.description + '</p>' +
          '<div style="font-size:.75rem;color:var(--text-muted);margin-bottom:8px;">' +
            '<i class="fa-solid fa-robot"></i> ' + p.agents.length + ' agents · ' +
            '<i class="fa-solid fa-users"></i> ' + p.assignedTenants.length + ' tenants' +
          '</div>' +
          '<div style="border-top:1px solid var(--border);padding-top:8px;">' +
            '<div style="font-size:.75rem;font-weight:600;color:var(--text-muted);margin-bottom:4px;">ASSIGNED TENANTS</div>' +
            tenantBadges +
          '</div>' +
          ((!window.Auth || Auth.hasPermission('canEdit'))
            ? '<button class="btn btn-sm btn-primary" style="width:100%;margin-top:8px;" onclick="Pages.dpAssignEndpoint._showAssignModal(\'' + p.id + '\')"><i class="fa-solid fa-link"></i> Assign to Tenants</button>'
            : '') +
      '</div>';
    });

    html += '</div>';

    if (!presets.length) {
      html = '<div style="text-align:center;padding:3rem;color:var(--text-muted);">' +
        '<i class="fa-solid fa-link-slash" style="font-size:2rem;margin-bottom:.5rem;display:block;"></i>' +
        '<p>ไม่พบ API Preset</p></div>';
    }

    document.getElementById('dp-assign-grid').innerHTML = html;
  },

  _showAssignModal(presetId) {
    var d = window.MockData;
    var p = d.apiPresets.find(function(x) { return x.id === presetId; });
    if (!p) return;

    var tenantCheckboxes = '';
    d.dpTenants.forEach(function(t) {
      var checked = p.assignedTenants.indexOf(t.id) !== -1 ? 'checked' : '';
      var cl = t.creditLine;
      var pct = cl.creditLimit ? Math.round(cl.availableCredit / cl.creditLimit * 100) : 0;
      var warning = pct === 0 ? '<span class="chip chip-red" style="font-size:.65rem;margin-left:4px;">Credit Exhausted</span>' : '';

      tenantCheckboxes += '<label style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--border);cursor:pointer;">' +
        '<input type="checkbox" value="' + t.id + '" ' + checked + ' style="width:18px;height:18px;">' +
        '<div style="flex:1;">' +
          '<strong>' + t.name + '</strong>' + warning +
          '<br><span class="mono text-muted" style="font-size:.75rem;">' + t.id + '</span>' +
        '</div>' +
        '<span class="text-muted" style="font-size:.8rem;">Credit: ' + pct + '%</span>' +
      '</label>';
    });

    var html =
      '<div class="modal">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title"><i class="fa-solid fa-link"></i> Assign "' + p.name + '"</div>' +
        '<div class="modal-subtitle">เลือก Tenants ที่จะเข้าถึง API Preset นี้</div>' +
        '<div id="dp-assign-checkboxes" style="max-height:50vh;overflow-y:auto;">' + tenantCheckboxes + '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>' +
          '<button class="btn btn-primary" onclick="Pages.dpAssignEndpoint._saveAssignment(\'' + p.id + '\')">' +
            '<i class="fa-solid fa-check"></i> บันทึก' +
          '</button>' +
        '</div>' +
      '</div>';

    App.showModal(html);
  },

  _saveAssignment(presetId) {
    var d = window.MockData;
    var p = d.apiPresets.find(function(x) { return x.id === presetId; });
    if (!p) return;

    var selected = [];
    document.querySelectorAll('#dp-assign-checkboxes input[type="checkbox"]:checked').forEach(function(cb) {
      selected.push(cb.value);
    });

    p.assignedTenants = selected;
    App.closeModal();
    App.toast('บันทึก Assignment สำเร็จ — ' + p.name + ' → ' + selected.length + ' Tenants', 'success');

    // Re-render
    this._renderStats();
    var activeTab = document.querySelector('#dp-assign-tabs .tab-item.active');
    this._renderGrid(activeTab ? activeTab.dataset.tab : 'all');
  },
};
