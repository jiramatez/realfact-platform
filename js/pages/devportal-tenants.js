/* ================================================================
   Page Module — Developer Portal Tenants
   Shows only Tenants that subscribe to Developer Portal
   Credit Line detail inside Tenant detail modal
   No Subscription Plan — Credit Line only
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.dpTenants = {

  _creditHealth(cl) {
    if (!cl || !cl.creditLimit) return '<span class="chip chip-gray">N/A</span>';
    var pct = Math.round(cl.availableCredit / cl.creditLimit * 100);
    if (pct > 50) return '<span class="chip chip-green">' + pct + '% Available</span>';
    if (pct > 20) return '<span class="chip chip-yellow">' + pct + '% Available</span>';
    return '<span class="chip chip-red">' + pct + '% Available</span>';
  },

  render() {
    return `
      <div class="page-header">
        <h1 class="heading">DEVELOPER PORTAL — TENANTS</h1>
      </div>
      <div class="text-sm text-muted mb-20">Tenant ที่ subscribe Developer Portal พร้อม Credit Line</div>

      <div class="flex items-center gap-10 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="dp-tenant-search" placeholder="ค้นหา Tenant...">
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select class="form-input" id="dp-tenant-status-filter">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:170px;">
          <select class="form-input" id="dp-tenant-credit-filter">
            <option value="all">All Credit Health</option>
            <option value="healthy">Healthy (&gt;50%)</option>
            <option value="at-risk">At Risk (20-50%)</option>
            <option value="critical">Critical (&lt;20%)</option>
          </select>
        </div>
      </div>

      <div class="table-wrap" id="dp-tenant-list"></div>
    `;
  },

  init() {
    var self = this;
    self._renderTable();
    document.getElementById('dp-tenant-search').addEventListener('input', function() {
      self._renderTable();
    });
    document.getElementById('dp-tenant-status-filter').addEventListener('change', function() {
      self._renderTable();
    });
    document.getElementById('dp-tenant-credit-filter').addEventListener('change', function() {
      self._renderTable();
    });
  },

  _renderTable() {
    var self = this;
    var d = window.MockData;
    var tenants = d.dpTenants;

    var searchEl = document.getElementById('dp-tenant-search');
    var filter = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var statusFilter = (document.getElementById('dp-tenant-status-filter') || {}).value || 'all';
    var creditFilter = (document.getElementById('dp-tenant-credit-filter') || {}).value || 'all';

    if (filter) {
      tenants = tenants.filter(function(t) {
        return t.name.toLowerCase().indexOf(filter) !== -1 || t.id.toLowerCase().indexOf(filter) !== -1;
      });
    }
    if (statusFilter !== 'all') {
      tenants = tenants.filter(function(t) { return t.status === statusFilter; });
    }
    if (creditFilter !== 'all') {
      tenants = tenants.filter(function(t) {
        var cl = t.creditLine;
        var pct = cl.creditLimit ? Math.round(cl.availableCredit / cl.creditLimit * 100) : 0;
        if (creditFilter === 'healthy') return pct > 50;
        if (creditFilter === 'at-risk') return pct > 20 && pct <= 50;
        if (creditFilter === 'critical') return pct <= 20;
        return true;
      });
    }

    var html = '<table><thead><tr>' +
      '<th>Tenant</th><th>Status</th><th>API Presets</th>' +
      '<th>Credit Limit</th><th>Credit Used</th><th>Credit Health</th><th>API Calls/Mo</th><th>แก้ไขล่าสุด</th><th></th>' +
      '</tr></thead><tbody>';

    tenants.forEach(function(t) {
      var cl = t.creditLine;
      html += '<tr>' +
        '<td><strong>' + t.name + '</strong><br><span class="text-muted mono text-xs">' + t.id + '</span></td>' +
        '<td>' + d.statusChip(t.status) + '</td>' +
        '<td>' + t.assignedPresets.length + '</td>' +
        '<td class="mono">' + d.formatCurrency(cl.creditLimit) + '</td>' +
        '<td class="mono">' + d.formatCurrency(cl.usedAmount) + '</td>' +
        '<td>' + self._creditHealth(cl) + '</td>' +
        '<td class="mono">' + d.formatNumber(t.apiCallsMonth) + '</td>' +
        '<td style="white-space:nowrap;"><div class="mono text-sm text-muted">' + (t.modifiedDate || '-') + '</div>' + (t.modifiedBy ? '<div class="text-xs text-dim">' + t.modifiedBy.split('@')[0] + '</div>' : '') + '</td>' +
        '<td><button class="btn btn-sm btn-outline" onclick="Pages.dpTenants._showDetail(\'' + t.id + '\')"><i class="fa-solid fa-eye"></i></button></td>' +
        '</tr>';
    });

    if (!tenants.length) {
      html += '<tr><td colspan="9" style="text-align:center;padding:2rem;" class="text-muted">ไม่พบ Tenant</td></tr>';
    }

    html += '</tbody></table>';
    document.getElementById('dp-tenant-list').innerHTML = html;
  },

  _showDetail(tenantId) {
    var d = window.MockData;
    var t = d.dpTenants.find(function(x) { return x.id === tenantId; });
    if (!t) return;

    var cl = t.creditLine;
    var creditPct = cl.creditLimit ? Math.round(cl.availableCredit / cl.creditLimit * 100) : 0;
    var creditColor = creditPct > 50 ? 'var(--success)' : creditPct > 20 ? 'var(--warning)' : 'var(--error)';

    // Assigned presets
    var presetsHtml = '';
    t.assignedPresets.forEach(function(pid) {
      var p = d.apiPresets.find(function(x) { return x.id === pid; });
      if (p) {
        presetsHtml += '<div class="flex items-center gap-8" style="padding:8px 0;border-bottom:1px solid var(--border);">' +
          '<i class="fa-solid fa-puzzle-piece text-primary"></i>' +
          '<div class="flex-1"><strong>' + p.name + '</strong> <span class="mono text-muted text-xs">v' + p.version + '</span></div>' +
          '<span class="text-muted text-sm">' + p.agents.length + ' agents</span>' +
        '</div>';
      }
    });
    if (!presetsHtml) presetsHtml = '<p class="text-muted">ยังไม่มี API Preset ที่ assign</p>';

    // Invoice history
    var invoiceHtml = '';
    if (t.invoices.length) {
      invoiceHtml = '<div class="table-wrap mt-8"><table><thead><tr><th>Invoice ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      t.invoices.forEach(function(inv) {
        invoiceHtml += '<tr>' +
          '<td class="mono">' + inv.id + '</td>' +
          '<td class="mono">' + d.formatCurrency(inv.amount) + '</td>' +
          '<td>' + d.statusChip(inv.status) + '</td>' +
          '<td>' + inv.date + '</td>' +
          '</tr>';
      });
      invoiceHtml += '</tbody></table></div>';
    } else {
      invoiceHtml = '<p class="text-muted mt-8">ยังไม่มี Invoice</p>';
    }

    var html =
      '<div class="modal modal-wide">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title">' + t.name + '</div>' +
        '<div class="modal-subtitle">' + t.id + ' · ' + d.statusChip(t.status) + '</div>' +

        '<!-- General Info -->' +
        '<div class="grid-4 gap-12 mb-20">' +
          '<div><span class="text-muted text-xs uppercase">Subscribed</span><br>' + t.subscribedDate + '</div>' +
          '<div><span class="text-muted text-xs uppercase">API Calls Today</span><br><span class="mono">' + d.formatNumber(t.apiCallsToday) + '</span></div>' +
          '<div><span class="text-muted text-xs uppercase">API Calls Month</span><br><span class="mono">' + d.formatNumber(t.apiCallsMonth) + '</span></div>' +
          '<div><span class="text-muted text-xs uppercase">แก้ไขล่าสุด</span><br><span class="mono text-sm">' + (t.modifiedDate || '-') + '</span>' + (t.modifiedBy ? '<br><span class="text-xs text-dim">' + t.modifiedBy.split('@')[0] + '</span>' : '') + '</div>' +
        '</div>' +

        '<!-- Credit Line -->' +
        '<div class="section-title flex justify-between items-center"><div><i class="fa-solid fa-credit-card text-primary"></i> Credit Line</div>' +
          ((!window.Auth || Auth.hasPermission('canEdit')) ? '<button class="btn btn-sm btn-outline" onclick="Pages.dpTenants._editCreditLine(\'' + t.id + '\')"><i class="fa-solid fa-pen-to-square"></i> แก้ไข</button>' : '') +
        '</div>' +
        '<div style="background:var(--surface2);border-radius:12px;padding:16px;" class="mb-20">' +
          '<div class="grid-3 gap-12 mb-12">' +
            '<div><span class="text-muted text-xs">Credit Limit</span><br><strong class="mono">' + d.formatCurrency(cl.creditLimit) + '</strong></div>' +
            '<div><span class="text-muted text-xs">Used</span><br><strong class="mono" style="color:var(--error);">' + d.formatCurrency(cl.usedAmount) + '</strong></div>' +
            '<div><span class="text-muted text-xs">Available</span><br><strong class="mono" style="color:' + creditColor + ';">' + d.formatCurrency(cl.availableCredit) + '</strong></div>' +
          '</div>' +
          '<div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;" class="mb-8">' +
            '<div style="height:100%;width:' + (100 - creditPct) + '%;background:' + creditColor + ';border-radius:4px;"></div>' +
          '</div>' +
          '<div class="grid-4 gap-12 text-sm">' +
            '<div><span class="text-muted">Billing Cycle</span><br>' + cl.billingCycle + ' วัน</div>' +
            '<div><span class="text-muted">Payment Terms</span><br>' + cl.paymentTerms + '</div>' +
            '<div><span class="text-muted">Status</span><br>' + d.statusChip(cl.status) + '</div>' +
            '<div><span class="text-muted">Approved By</span><br>' + cl.approvedBy + '</div>' +
          '</div>' +
        '</div>' +

        '<!-- Assigned API Presets -->' +
        '<div class="section-title"><i class="fa-solid fa-puzzle-piece text-muted"></i> Assigned API Presets</div>' +
        '<div class="mb-20">' + presetsHtml + '</div>' +

        '<!-- Invoice History -->' +
        '<div class="section-title"><i class="fa-solid fa-file-invoice-dollar text-muted"></i> Invoice History</div>' +
        invoiceHtml +

        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>' +
        '</div>' +
      '</div>';

    App.showModal(html);
  },

  _editCreditLine(tenantId) {
    var d = window.MockData;
    var t = d.dpTenants.find(function(x) { return x.id === tenantId; });
    if (!t) return;
    var cl = t.creditLine;
    var resolved = d.resolveBillingTerms('devportal');

    var html =
      '<div class="modal">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title">แก้ไข Credit Line</div>' +
        '<div class="modal-subtitle">' + t.name + ' · ' + t.id + '</div>' +

        '<div style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:8px;padding:10px 14px;margin-bottom:16px;" class="text-sm">' +
          '<i class="fa-solid fa-circle-info" style="color:#3b82f6"></i> ค่า Default จาก Billing Terms: รอบบิล ' + resolved.billingCycle + ' วัน / ' + resolved.paymentTerms +
        '</div>' +

        '<div class="flex-col gap-16">' +
          '<div>' +
            '<label class="text-sm font-600 mb-4 block">Credit Limit (฿)</label>' +
            '<input type="number" id="dp-cl-edit-limit" class="form-input" value="' + cl.creditLimit + '">' +
          '</div>' +
          '<div class="grid-2 gap-12">' +
            '<div>' +
              '<label class="text-sm font-600 mb-4 block">Billing Cycle</label>' +
              '<select id="dp-cl-edit-cycle" class="form-input">' +
                '<option value="7"' + (cl.billingCycle === 7 ? ' selected' : '') + '>7 วัน</option>' +
                '<option value="14"' + (cl.billingCycle === 14 ? ' selected' : '') + '>14 วัน</option>' +
                '<option value="30"' + (cl.billingCycle === 30 ? ' selected' : '') + '>30 วัน</option>' +
                '<option value="60"' + (cl.billingCycle === 60 ? ' selected' : '') + '>60 วัน</option>' +
                '<option value="90"' + (cl.billingCycle === 90 ? ' selected' : '') + '>90 วัน</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="text-sm font-600 mb-4 block">Payment Terms</label>' +
              '<select id="dp-cl-edit-terms" class="form-input">' +
                '<option value="Net 7"' + (cl.paymentTerms === 'Net 7' ? ' selected' : '') + '>Net 7</option>' +
                '<option value="Net 15"' + (cl.paymentTerms === 'Net 15' ? ' selected' : '') + '>Net 15</option>' +
                '<option value="Net 30"' + (cl.paymentTerms === 'Net 30' ? ' selected' : '') + '>Net 30</option>' +
                '<option value="Net 45"' + (cl.paymentTerms === 'Net 45' ? ' selected' : '') + '>Net 45</option>' +
                '<option value="Net 60"' + (cl.paymentTerms === 'Net 60' ? ' selected' : '') + '>Net 60</option>' +
                '<option value="Net 90"' + (cl.paymentTerms === 'Net 90' ? ' selected' : '') + '>Net 90</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<label class="text-sm font-600 mb-4 block">Status</label>' +
            '<select id="dp-cl-edit-status" class="form-input">' +
              '<option value="Active"' + (cl.status === 'Active' ? ' selected' : '') + '>Active</option>' +
              '<option value="Suspended"' + (cl.status === 'Suspended' ? ' selected' : '') + '>Suspended</option>' +
              '<option value="Under Review"' + (cl.status === 'Under Review' ? ' selected' : '') + '>Under Review</option>' +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>' +
          '<button class="btn btn-primary" onclick="Pages.dpTenants._saveCreditLine(\'' + tenantId + '\')"><i class="fa-solid fa-check"></i> บันทึก</button>' +
        '</div>' +
      '</div>';

    App.showModal(html);
  },

  _saveCreditLine(tenantId) {
    var d = window.MockData;
    var t = d.dpTenants.find(function(x) { return x.id === tenantId; });
    if (!t) return;

    var newLimit = parseInt(document.getElementById('dp-cl-edit-limit').value) || t.creditLine.creditLimit;
    var newCycle = parseInt(document.getElementById('dp-cl-edit-cycle').value);
    var newTerms = document.getElementById('dp-cl-edit-terms').value;
    var newStatus = document.getElementById('dp-cl-edit-status').value;

    // Update modified tracking
    t.modifiedDate = new Date().toISOString().split('T')[0];
    t.modifiedBy = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');

    // Update dpTenants credit line
    var cl = t.creditLine;
    var oldLimit = cl.creditLimit;
    var oldCycle = cl.billingCycle;
    var oldTerms = cl.paymentTerms;
    var oldStatus = cl.status;
    var diff = newLimit - cl.creditLimit;
    cl.creditLimit = newLimit;
    cl.availableCredit = Math.max(0, cl.availableCredit + diff);
    cl.billingCycle = newCycle;
    cl.paymentTerms = newTerms;
    cl.status = newStatus;

    // Find central credit line for sync + log
    var centralCL = (d.creditLines || []).find(function(c) { return c.tenantId === tenantId && c.source === 'Developer Portal'; });

    // Log the change
    var changes = [];
    if (oldLimit !== cl.creditLimit) changes.push('วงเงิน ' + d.formatCurrency(oldLimit) + ' → ' + d.formatCurrency(cl.creditLimit));
    if (oldCycle !== cl.billingCycle) changes.push('รอบบิล ' + oldCycle + ' → ' + cl.billingCycle + ' วัน');
    if (oldTerms !== cl.paymentTerms) changes.push('เงื่อนไข ' + oldTerms + ' → ' + cl.paymentTerms);
    if (oldStatus !== cl.status) changes.push('สถานะ ' + oldStatus + ' → ' + cl.status);
    var logAction = cl.status !== oldStatus && cl.status === 'Suspended' ? 'Suspended' : 'Edited';
    var now = new Date();
    d.creditLineApprovalLog = d.creditLineApprovalLog || [];
    d.creditLineApprovalLog.unshift({
      id: 'CLOG-' + Date.now(),
      creditLineId: centralCL ? centralCL.id : t.id,
      tenantId: tenantId, tenantName: t.name,
      action: logAction, detail: changes.length ? changes.join(' · ') : 'ไม่มีการเปลี่ยนแปลง',
      actionBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), actionDate: now.toISOString().slice(0,10), actionTime: now.toTimeString().slice(0,5),
    });

    // Sync to central creditLines array
    if (centralCL) {
      centralCL.creditLimit = cl.creditLimit;
      centralCL.availableCredit = cl.availableCredit;
      centralCL.billingCycle = cl.billingCycle;
      centralCL.paymentTerms = cl.paymentTerms;
      centralCL.status = cl.status;
    }

    App.closeModal();
    App.toast('บันทึก Credit Line เรียบร้อย');
    this._renderTable();

    // Re-open detail modal to show updated data
    this._showDetail(tenantId);
  },
};
