/* ================================================================
   Page Module — Developer Portal App Approval
   Overview: Review, approve, reject developer apps for production
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.dpAppApproval = {

  _statusLabel: function (status) {
    var map = {
      'sandbox': 'Sandbox',
      'pending_approval': 'Pending Approval',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'revoked': 'Revoked',
    };
    return map[status] || status;
  },

  _statusChip: function (status) {
    var map = {
      'sandbox': 'chip-blue',
      'pending_approval': 'chip-yellow',
      'approved': 'chip-green',
      'rejected': 'chip-red',
      'revoked': 'chip-red',
    };
    var cls = map[status] || 'chip-gray';
    var label = this._statusLabel(status);
    return '<span class="chip ' + cls + '">' + label + '</span>';
  },

  _actionChip: function (action) {
    var map = {
      'Approved': 'chip-green',
      'Rejected': 'chip-red',
      'Revoked': 'chip-red',
      'Submitted': 'chip-blue',
    };
    var cls = map[action] || 'chip-gray';
    var icons = {
      'Approved': 'fa-check',
      'Rejected': 'fa-xmark',
      'Revoked': 'fa-ban',
      'Submitted': 'fa-paper-plane',
    };
    var icon = icons[action] || 'fa-circle';
    return '<span class="chip ' + cls + '"><i class="fa-solid ' + icon + '"></i> ' + action + '</span>';
  },

  _daysSince: function (dateStr) {
    if (!dateStr) return '-';
    var diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
    return diff >= 0 ? diff : 0;
  },

  render: function () {
    var d = window.MockData;
    var apps = d.dpApps || [];
    var total = apps.length;
    var pending = apps.filter(function (a) { return a.status === 'pending_approval'; }).length;
    var approved = apps.filter(function (a) { return a.status === 'approved'; }).length;
    var rejected = apps.filter(function (a) { return a.status === 'rejected'; }).length;

    return '' +
      '<div class="page-header">' +
        '<h1 class="heading">DEVELOPER PORTAL — APP APPROVAL</h1>' +
        '<div class="flex items-center gap-12">' +
          '<span class="text-sm text-muted"><i class="fa-solid fa-calendar-day"></i> ' + new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="text-sm text-muted mb-20">จัดการคำขออนุมัติแอปพลิเคชันเข้าสู่ Production</div>' +

      /* ── KPI Cards — รออนุมัติขึ้นก่อน ── */
      '<div class="grid-4 mb-20">' +
        '<div class="stat-card">' +
          '<div class="stat-header"><span class="stat-label">รออนุมัติ</span><div class="stat-icon ' + (pending > 0 ? 'orange' : 'green') + '"><i class="fa-solid fa-clock"></i></div></div>' +
          '<div class="stat-value mono ' + (pending > 0 ? 'text-warning' : '') + '">' + pending + '</div>' +
          (pending > 0 ? '<div class="stat-change down">ต้องดำเนินการ</div>' : '<div class="stat-change up">ไม่มีรายการค้าง</div>') +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-header"><span class="stat-label">แอปทั้งหมด</span><div class="stat-icon blue"><i class="fa-solid fa-cubes"></i></div></div>' +
          '<div class="stat-value mono">' + total + '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-header"><span class="stat-label">อนุมัติแล้ว</span><div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div></div>' +
          '<div class="stat-value mono">' + approved + '</div>' +
        '</div>' +
        '<div class="stat-card">' +
          '<div class="stat-header"><span class="stat-label">ปฏิเสธ</span><div class="stat-icon red"><i class="fa-solid fa-circle-xmark"></i></div></div>' +
          '<div class="stat-value mono">' + rejected + '</div>' +
        '</div>' +
      '</div>' +

      /* ── Section 1: คำขอรออนุมัติ ── */
      '<div class="section-title">' +
        '<i class="fa-solid fa-' + (pending > 0 ? 'triangle-exclamation text-warning' : 'circle-check text-success') + '"></i> ' +
        'คำขอรออนุมัติ' +
        (pending > 0 ? ' <span class="chip chip-yellow" style="margin-left:8px;">' + pending + '</span>' : '') +
      '</div>' +
      '<div class="table-wrap mb-24" id="dp-approval-pending"></div>' +

      /* ── Section 2: แอปพลิเคชันทั้งหมด ── */
      '<div class="section-title"><i class="fa-solid fa-cubes text-primary"></i> แอปพลิเคชันทั้งหมด</div>' +
      '<div class="flex items-center gap-10 mb-16">' +
        '<div class="search-bar flex-1">' +
          '<i class="fa-solid fa-magnifying-glass"></i>' +
          '<input type="text" id="dp-approval-search" placeholder="ค้นหาชื่อแอป / Developer / Tenant...">' +
        '</div>' +
        '<div class="form-group" style="margin:0;min-width:180px;">' +
          '<select class="form-input" id="dp-approval-status-filter">' +
            '<option value="all">All Status</option>' +
            '<option value="approved">Approved</option>' +
            '<option value="rejected">Rejected</option>' +
            '<option value="sandbox">Sandbox</option>' +
            '<option value="revoked">Revoked</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="table-wrap mb-24" id="dp-approval-all"></div>' +

      /* ── Audit Log ── */
      '<div class="section-title"><i class="fa-solid fa-clock-rotate-left text-primary"></i> ประวัติการดำเนินการ</div>' +
      '<div class="table-wrap" id="dp-approval-log"></div>';
  },

  init: function () {
    var self = this;
    self._renderPendingTable();
    self._renderAllTable();
    self._renderAuditLog();

    var searchEl = document.getElementById('dp-approval-search');
    if (searchEl) searchEl.addEventListener('input', function () { self._renderAllTable(); });

    var filterEl = document.getElementById('dp-approval-status-filter');
    if (filterEl) filterEl.addEventListener('change', function () { self._renderAllTable(); });
  },

  _renderPendingTable: function () {
    var self = this;
    var d = window.MockData;
    var pending = (d.dpApps || []).filter(function (a) { return a.status === 'pending_approval'; });

    // FIFO: oldest first
    pending.sort(function (a, b) {
      return (a.submittedDate || '').localeCompare(b.submittedDate || '');
    });

    var canApprove = !window.Auth || Auth.hasPermission('canApprove');

    var html = '<table><thead><tr>' +
      '<th>แอปพลิเคชัน</th><th>Developer / Tenant</th>' +
      '<th>วันที่ยื่น</th><th>รอ (วัน)</th><th></th>' +
      '</tr></thead><tbody>';

    pending.forEach(function (a) {
      var daysWaiting = self._daysSince(a.submittedDate);
      var actions = '<button class="btn btn-sm btn-outline" onclick="Pages.dpAppApproval._showDetail(\'' + a.id + '\')"><i class="fa-solid fa-eye"></i></button>';
      if (canApprove) {
        actions += ' <button class="btn btn-sm btn-success" onclick="Pages.dpAppApproval._approveApp(\'' + a.id + '\')"><i class="fa-solid fa-check"></i> อนุมัติ</button>';
        actions += ' <button class="btn btn-sm btn-danger" onclick="Pages.dpAppApproval._rejectApp(\'' + a.id + '\')"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>';
      }

      html += '<tr>' +
        '<td><strong>' + a.name + '</strong><br><span class="text-muted mono text-xs">' + a.id + '</span></td>' +
        '<td><div class="text-sm font-600">' + a.developerName + '</div><div class="text-xs text-muted">' + a.tenantName + '</div></td>' +
        '<td class="mono text-sm">' + (a.submittedDate || '-') + '</td>' +
        '<td class="mono text-sm ' + (daysWaiting > 2 ? 'text-warning font-600' : '') + '">' + daysWaiting + '</td>' +
        '<td style="white-space:nowrap;">' + actions + '</td>' +
        '</tr>';
    });

    if (!pending.length) {
      html += '<tr><td colspan="5" style="text-align:center;padding:2rem;" class="text-muted"><i class="fa-solid fa-circle-check" style="color:var(--success)"></i> ไม่มีคำขอรออนุมัติ</td></tr>';
    }

    html += '</tbody></table>';
    document.getElementById('dp-approval-pending').innerHTML = html;
  },

  _renderAllTable: function () {
    var self = this;
    var d = window.MockData;
    var apps = (d.dpApps || []).filter(function (a) { return a.status !== 'pending_approval'; });

    // Filters
    var searchEl = document.getElementById('dp-approval-search');
    var filter = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var statusFilter = (document.getElementById('dp-approval-status-filter') || {}).value || 'all';

    if (filter) {
      apps = apps.filter(function (a) {
        return a.name.toLowerCase().indexOf(filter) !== -1 ||
               a.developerName.toLowerCase().indexOf(filter) !== -1 ||
               a.tenantName.toLowerCase().indexOf(filter) !== -1 ||
               a.id.toLowerCase().indexOf(filter) !== -1;
      });
    }
    if (statusFilter !== 'all') {
      apps = apps.filter(function (a) { return a.status === statusFilter; });
    }

    // Sort by modifiedDate desc
    apps.sort(function (a, b) {
      return (b.modifiedDate || '').localeCompare(a.modifiedDate || '');
    });

    var canApprove = !window.Auth || Auth.hasPermission('canApprove');

    var html = '<table><thead><tr>' +
      '<th>แอปพลิเคชัน</th><th>Developer / Tenant</th><th>สถานะ</th>' +
      '<th>วันที่สร้าง</th><th></th>' +
      '</tr></thead><tbody>';

    apps.forEach(function (a) {
      var actions = '<button class="btn btn-sm btn-outline" onclick="Pages.dpAppApproval._showDetail(\'' + a.id + '\')"><i class="fa-solid fa-eye"></i></button>';
      if (canApprove && a.status === 'approved') {
        actions += ' <button class="btn btn-sm btn-outline" style="color:var(--error);border-color:var(--error);" onclick="Pages.dpAppApproval._revokeApp(\'' + a.id + '\')"><i class="fa-solid fa-ban"></i> เพิกถอน</button>';
      }

      html += '<tr>' +
        '<td><strong>' + a.name + '</strong><br><span class="text-muted mono text-xs">' + a.id + '</span></td>' +
        '<td><div class="text-sm font-600">' + a.developerName + '</div><div class="text-xs text-muted">' + a.tenantName + '</div></td>' +
        '<td>' + self._statusChip(a.status) + '</td>' +
        '<td class="mono text-sm">' + (a.createdDate || '-') + '</td>' +
        '<td style="white-space:nowrap;">' + actions + '</td>' +
        '</tr>';
    });

    if (!apps.length) {
      html += '<tr><td colspan="5" style="text-align:center;padding:2rem;" class="text-muted">ไม่พบแอปพลิเคชัน</td></tr>';
    }

    html += '</tbody></table>';
    document.getElementById('dp-approval-all').innerHTML = html;
  },

  _renderAuditLog: function () {
    var self = this;
    var d = window.MockData;
    var log = (d.dpAppApprovalLog || []).slice().sort(function (a, b) {
      return (b.actionDate + b.actionTime).localeCompare(a.actionDate + a.actionTime);
    });

    var html = '<table><thead><tr>' +
      '<th>App ID</th><th>แอป</th><th>การดำเนินการ</th>' +
      '<th>เหตุผล</th><th>ดำเนินการโดย</th><th>วันที่ · เวลา</th>' +
      '</tr></thead><tbody>';

    log.forEach(function (l) {
      html += '<tr>' +
        '<td class="mono text-sm">' + l.appId + '</td>' +
        '<td class="font-600">' + l.appName + '</td>' +
        '<td>' + self._actionChip(l.action) + '</td>' +
        '<td class="text-sm text-muted" style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (l.reason || '—') + '</td>' +
        '<td style="white-space:nowrap;"><div class="text-sm font-600">' + l.actionBy.split('@')[0] + '</div></td>' +
        '<td class="mono text-sm text-muted" style="white-space:nowrap;">' + l.actionDate + (l.actionTime ? ' · ' + l.actionTime : '') + '</td>' +
        '</tr>';
    });

    if (!log.length) {
      html += '<tr><td colspan="6" style="text-align:center;padding:2rem;" class="text-muted">ยังไม่มีประวัติ</td></tr>';
    }

    html += '</tbody></table>';
    document.getElementById('dp-approval-log').innerHTML = html;
  },

  _showDetail: function (appId) {
    var self = this;
    var d = window.MockData;
    var a = (d.dpApps || []).find(function (x) { return x.id === appId; });
    if (!a) return;

    var canApprove = !window.Auth || Auth.hasPermission('canApprove');
    var logs = (d.dpAppApprovalLog || []).filter(function (l) { return l.appId === appId; })
      .sort(function (x, y) { return (y.actionDate + y.actionTime).localeCompare(x.actionDate + x.actionTime); });

    // Documents list
    var docsHtml = '';
    if (a.documents && a.documents.length) {
      a.documents.forEach(function (doc) {
        var icon = doc.type === 'pdf' ? 'fa-file-pdf' : doc.type === 'image' ? 'fa-file-image' : 'fa-file';
        var iconColor = doc.type === 'pdf' ? 'color:var(--error)' : doc.type === 'image' ? 'color:#3b82f6' : '';
        docsHtml += '<div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;">' +
          '<div class="flex items-center gap-10">' +
            '<i class="fa-solid ' + icon + '" style="font-size:1.2rem;' + iconColor + '"></i>' +
            '<div><div class="text-sm font-600">' + doc.name + '</div>' +
            '<div class="text-xs text-muted">' + doc.size + ' · ' + doc.uploadDate + '</div></div>' +
          '</div>' +
          '<button class="btn btn-sm btn-outline"><i class="fa-solid fa-download"></i></button>' +
        '</div>';
      });
    } else {
      docsHtml = '<div class="empty-state"><i class="fa-solid fa-folder-open" style="color:var(--text-muted)"></i><p>ยังไม่มีเอกสาร</p></div>';
    }

    // History timeline
    var historyHtml = '';
    if (logs.length) {
      logs.forEach(function (l) {
        historyHtml += '<div class="flex items-start gap-12 p-12" style="background:var(--surface2);border-radius:8px;">' +
          '<div style="min-width:90px;" class="mono text-xs text-muted">' + l.actionDate + '<br>' + l.actionTime + '</div>' +
          '<div>' + self._actionChip(l.action) +
            '<div class="text-sm mt-4">' + l.actionBy + '</div>' +
            (l.reason ? '<div class="text-xs text-muted mt-4">' + l.reason + '</div>' : '') +
          '</div>' +
        '</div>';
      });
    } else {
      historyHtml = '<div class="text-sm text-muted" style="text-align:center;padding:1rem;">ยังไม่มีประวัติ</div>';
    }

    var html =
      '<div class="modal modal-wide">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title">' + a.name + '</div>' +
        '<div class="modal-subtitle">' + a.id + ' · ' + self._statusChip(a.status) + '</div>' +

        /* Tabs */
        '<div class="flex gap-8 mb-16" style="border-bottom:1px solid var(--border);">' +
          '<button class="btn btn-sm dp-detail-tab" data-tab="overview" style="border-radius:8px 8px 0 0;border-bottom:2px solid var(--primary);font-weight:600;">ภาพรวม</button>' +
          '<button class="btn btn-sm dp-detail-tab" data-tab="documents" style="border-radius:8px 8px 0 0;opacity:0.6;">เอกสาร (' + (a.documents ? a.documents.length : 0) + ')</button>' +
          '<button class="btn btn-sm dp-detail-tab" data-tab="history" style="border-radius:8px 8px 0 0;opacity:0.6;">ประวัติ (' + logs.length + ')</button>' +
        '</div>' +

        /* Tab: Overview */
        '<div class="dp-tab-content" id="dp-tab-overview">' +
          '<div class="section-title text-sm"><i class="fa-solid fa-cube text-primary"></i> ข้อมูลแอป</div>' +
          '<div class="grid-2 gap-12 mb-16">' +
            '<div><span class="text-muted text-xs uppercase">ชื่อแอป</span><br><strong>' + a.name + '</strong></div>' +
            '<div><span class="text-muted text-xs uppercase">Client ID</span><br><span class="mono text-sm">' + a.clientId + '</span></div>' +
            '<div><span class="text-muted text-xs uppercase">คำอธิบาย</span><br><span class="text-sm">' + a.description + '</span></div>' +
            '<div><span class="text-muted text-xs uppercase">Rate Limit</span><br><span class="mono text-sm">' + a.rateLimit + '</span></div>' +
          '</div>' +
          '<div class="section-title text-sm"><i class="fa-solid fa-user text-primary"></i> ข้อมูล Developer</div>' +
          '<div class="grid-2 gap-12 mb-16">' +
            '<div><span class="text-muted text-xs uppercase">ชื่อ</span><br>' + a.developerName + '</div>' +
            '<div><span class="text-muted text-xs uppercase">อีเมล</span><br><span class="mono text-sm">' + a.developerEmail + '</span></div>' +
            '<div><span class="text-muted text-xs uppercase">Tenant</span><br>' + a.tenantName + '</div>' +
            '<div><span class="text-muted text-xs uppercase">Tenant ID</span><br><span class="mono text-sm">' + a.tenantId + '</span></div>' +
          '</div>' +
          '<div class="section-title text-sm"><i class="fa-solid fa-building text-primary"></i> ข้อมูลบริษัท</div>' +
          '<div class="grid-2 gap-12 mb-16">' +
            '<div><span class="text-muted text-xs uppercase">ชื่อบริษัท</span><br>' + a.companyName + '</div>' +
            '<div><span class="text-muted text-xs uppercase">เลขทะเบียนนิติบุคคล</span><br><span class="mono text-sm">' + a.companyRegNumber + '</span></div>' +
            '<div style="grid-column:span 2;"><span class="text-muted text-xs uppercase">ที่อยู่</span><br><span class="text-sm">' + a.companyAddress + '</span></div>' +
          '</div>' +
          '<div class="section-title text-sm"><i class="fa-solid fa-lightbulb text-primary"></i> Use Case</div>' +
          '<div style="background:var(--surface2);border-radius:8px;padding:12px 16px;" class="text-sm mb-16">' + a.useCase + '</div>' +
          (a.rejectionReason ? '<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px 14px;" class="text-sm mb-16"><i class="fa-solid fa-triangle-exclamation" style="color:var(--error)"></i> <strong>เหตุผลที่ปฏิเสธ:</strong> ' + a.rejectionReason + '</div>' : '') +
        '</div>' +

        /* Tab: Documents */
        '<div class="dp-tab-content" id="dp-tab-documents" style="display:none;">' +
          '<div class="flex-col gap-10">' + docsHtml + '</div>' +
        '</div>' +

        /* Tab: History */
        '<div class="dp-tab-content" id="dp-tab-history" style="display:none;">' +
          '<div class="flex-col gap-10">' + historyHtml + '</div>' +
        '</div>' +

        /* Actions */
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>' +
          (canApprove && a.status === 'pending_approval' ?
            '<button class="btn btn-danger" onclick="App.closeModal();Pages.dpAppApproval._rejectApp(\'' + a.id + '\')"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>' +
            '<button class="btn btn-success" onclick="App.closeModal();Pages.dpAppApproval._approveApp(\'' + a.id + '\')"><i class="fa-solid fa-check"></i> อนุมัติ</button>'
          : '') +
          (canApprove && a.status === 'approved' ?
            '<button class="btn btn-danger" onclick="App.closeModal();Pages.dpAppApproval._revokeApp(\'' + a.id + '\')"><i class="fa-solid fa-ban"></i> เพิกถอน</button>'
          : '') +
        '</div>' +
      '</div>';

    App.showModal(html);

    // Tab switching
    setTimeout(function () {
      var tabs = document.querySelectorAll('.dp-detail-tab');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-tab');
          // Toggle active state
          tabs.forEach(function (t) {
            t.style.borderBottom = '2px solid transparent';
            t.style.opacity = '0.6';
            t.style.fontWeight = 'normal';
          });
          tab.style.borderBottom = '2px solid var(--primary)';
          tab.style.opacity = '1';
          tab.style.fontWeight = '600';
          // Toggle content
          document.querySelectorAll('.dp-tab-content').forEach(function (c) { c.style.display = 'none'; });
          var el = document.getElementById('dp-tab-' + target);
          if (el) el.style.display = 'block';
        });
      });
    }, 50);
  },

  _approveApp: function (appId) {
    var self = this;
    var d = window.MockData;
    var a = (d.dpApps || []).find(function (x) { return x.id === appId; });
    if (!a) return;

    App.confirm('ยืนยันอนุมัติแอป "' + a.name + '" เข้าสู่ Production?', {
      title: 'อนุมัติแอปพลิเคชัน',
      confirmText: 'อนุมัติ',
      cancelText: 'ยกเลิก',
      type: 'success',
    }).then(function (ok) {
      if (!ok) return;
      var now = new Date();
      var date = now.toISOString().slice(0, 10);
      var time = now.toTimeString().slice(0, 5);
      var actionBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';

      a.status = 'approved';
      a.approvedDate = date;
      a.rateLimit = '10,000 calls/day';
      a.modifiedDate = date;
      a.modifiedBy = actionBy;

      d.dpAppApprovalLog = d.dpAppApprovalLog || [];
      d.dpAppApprovalLog.unshift({
        id: 'DPAL-' + Date.now(),
        appId: a.id, appName: a.name,
        action: 'Approved', reason: null,
        actionBy: actionBy, actionDate: date, actionTime: time,
      });

      App.toast('อนุมัติแอป ' + a.name + ' สำเร็จ', 'success');
      self._renderPendingTable();
      self._renderAllTable();
      self._renderAuditLog();
      if (App.updateDpBadges) App.updateDpBadges();
    });
  },

  _rejectApp: function (appId) {
    var self = this;
    var d = window.MockData;
    var a = (d.dpApps || []).find(function (x) { return x.id === appId; });
    if (!a) return;

    App.showModal(
      '<div class="modal">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title mb-8">ปฏิเสธแอปพลิเคชัน</div>' +
        '<div class="text-sm text-muted mb-16">แอป: <strong>' + a.name + '</strong> (' + a.id + ') — ' + a.developerName + '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">เหตุผลในการปฏิเสธ <span style="color:var(--error)">*</span></label>' +
          '<textarea id="dp-reject-reason" class="form-input" rows="4" placeholder="ระบุเหตุผล (20-500 ตัวอักษร)..." minlength="20" maxlength="500"></textarea>' +
          '<div class="text-xs text-muted mt-4" id="dp-reject-char-count">0 / 500</div>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>' +
          '<button class="btn btn-danger" id="dp-reject-confirm-btn"><i class="fa-solid fa-xmark"></i> ยืนยันปฏิเสธ</button>' +
        '</div>' +
      '</div>'
    );

    setTimeout(function () {
      var textarea = document.getElementById('dp-reject-reason');
      var charCount = document.getElementById('dp-reject-char-count');
      if (textarea && charCount) {
        textarea.addEventListener('input', function () {
          charCount.textContent = textarea.value.length + ' / 500';
        });
      }

      var confirmBtn = document.getElementById('dp-reject-confirm-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
          var reason = (document.getElementById('dp-reject-reason') || {}).value;
          reason = reason ? reason.trim() : '';
          if (reason.length < 20) {
            App.toast('กรุณาระบุเหตุผลอย่างน้อย 20 ตัวอักษร', 'error');
            return;
          }
          if (reason.length > 500) {
            App.toast('เหตุผลต้องไม่เกิน 500 ตัวอักษร', 'error');
            return;
          }

          var now = new Date();
          var date = now.toISOString().slice(0, 10);
          var time = now.toTimeString().slice(0, 5);
          var actionBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';

          a.status = 'rejected';
          a.rejectedDate = date;
          a.rejectionReason = reason;
          a.modifiedDate = date;
          a.modifiedBy = actionBy;

          d.dpAppApprovalLog = d.dpAppApprovalLog || [];
          d.dpAppApprovalLog.unshift({
            id: 'DPAL-' + Date.now(),
            appId: a.id, appName: a.name,
            action: 'Rejected', reason: reason,
            actionBy: actionBy, actionDate: date, actionTime: time,
          });

          App.closeModal();
          App.toast('ปฏิเสธแอป ' + a.name + ' แล้ว', 'error');
          self._renderTable();
          self._renderAuditLog();
          if (App.updateDpBadges) App.updateDpBadges();
        });
      }
    }, 50);
  },

  _revokeApp: function (appId) {
    var self = this;
    var d = window.MockData;
    var a = (d.dpApps || []).find(function (x) { return x.id === appId; });
    if (!a) return;

    App.confirm('ยืนยันเพิกถอนแอป "' + a.name + '"? แอปจะไม่สามารถเข้าถึง Production ได้อีก', {
      title: 'เพิกถอนแอปพลิเคชัน',
      confirmText: 'เพิกถอน',
      cancelText: 'ยกเลิก',
      type: 'danger',
    }).then(function (ok) {
      if (!ok) return;
      var now = new Date();
      var date = now.toISOString().slice(0, 10);
      var time = now.toTimeString().slice(0, 5);
      var actionBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';

      a.status = 'revoked';
      a.modifiedDate = date;
      a.modifiedBy = actionBy;

      d.dpAppApprovalLog = d.dpAppApprovalLog || [];
      d.dpAppApprovalLog.unshift({
        id: 'DPAL-' + Date.now(),
        appId: a.id, appName: a.name,
        action: 'Revoked', reason: null,
        actionBy: actionBy, actionDate: date, actionTime: time,
      });

      App.toast('เพิกถอนแอป ' + a.name + ' แล้ว', 'error');
      self._renderPendingTable();
      self._renderAllTable();
      self._renderAuditLog();
      if (App.updateDpBadges) App.updateDpBadges();
    });
  },

};
