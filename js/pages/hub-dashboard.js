/* ================================================================
   Hub Dashboard — Tenant Console Main Page
   Shows: KPI cards, Sub-Platform cards, recent invoices
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubDashboard = (function () {
  'use strict';

  var _spIcons = {
    avatar:  'fa-robot',
    booking: 'fa-calendar-check',
    devportal: 'fa-code',
  };
  var _spColors = {
    avatar:  '#f15b26',
    booking: '#3b82f6',
    devportal: '#8b5cf6',
  };
  var _statusChip = {
    Active:    'chip-green',
    Pending:   'chip-yellow',
    Suspended: 'chip-red',
  };

  function _getData() {
    var d = window.MockData;
    if (!d) return null;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;

    var tenant = (d.tenants || []).find(function (t) { return t.id === tid; });
    var subs = (d.tenantSubscriptions || {})[tid] || [];
    var invoices = (d.invoices || []).filter(function (i) { return i.tenantId === tid; });
    var sessions = (d.sessions || []).filter(function (s) { return s.tenantId === tid; });
    var devices = (d.devices || []).filter(function (dv) { return dv.soldTo === tid && dv.status === 'Activated'; });
    var subPlatforms = d.subPlatforms || [];

    // Monthly cost from invoices this month
    var now = new Date();
    var monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    var monthlyInvoices = invoices.filter(function (i) { return i.issuedDate && i.issuedDate.slice(0, 7) === monthKey; });
    var monthlyCost = monthlyInvoices.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);

    // Active sessions
    var activeSessions = sessions.filter(function (s) { return s.status === 'Active'; }).length;

    // Pending invoices
    var pendingInvoices = invoices.filter(function (i) { return i.status === 'Issued' || i.status === 'Pending Verification'; }).length;

    return {
      tenant: tenant,
      subs: subs,
      invoices: invoices,
      recentInvoices: invoices.slice(0, 10),
      sessions: sessions,
      devices: devices,
      subPlatforms: subPlatforms,
      monthlyCost: monthlyCost,
      activeSessions: activeSessions,
      pendingInvoices: pendingInvoices,
    };
  }

  function render() {
    var data = _getData();
    if (!data || !data.tenant) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล Tenant</p></div>';
    }
    var t = data.tenant;

    // KPI Cards
    var kpis = [
      {
        icon: 'fa-coins', color: 'var(--primary)',
        label: 'Token คงเหลือ',
        value: _fmt(t.tokenBalance),
        sub: 'Bonus ' + _fmt(t.bonusTokens) + ' + ซื้อ ' + _fmt(t.purchasedTokens),
      },
      {
        icon: 'fa-baht-sign', color: 'var(--success)',
        label: 'ค่าใช้จ่ายเดือนนี้',
        value: '฿' + _fmt(data.monthlyCost, true),
        sub: data.recentInvoices.length + ' invoice(s)',
      },
      {
        icon: 'fa-display', color: '#3b82f6',
        label: 'Devices ใช้งาน',
        value: data.devices.length,
        sub: data.activeSessions + ' session กำลังทำงาน',
      },
      {
        icon: 'fa-file-invoice', color: '#f59e0b',
        label: 'Invoice รอดำเนินการ',
        value: data.pendingInvoices,
        sub: data.pendingInvoices > 0 ? 'รอชำระ/ตรวจสอบ' : 'ไม่มีรายการค้าง',
      },
    ];

    var kpiHtml = kpis.map(function (k) {
      return '<div class="card" style="padding:20px;flex:1;min-width:200px;">' +
        '<div class="flex items-center gap-12 mb-12">' +
          '<div style="width:40px;height:40px;border-radius:10px;background:' + k.color + '15;display:flex;align-items:center;justify-content:center;">' +
            '<i class="fa-solid ' + k.icon + '" style="font-size:18px;color:' + k.color + ';"></i>' +
          '</div>' +
          '<div class="text-xs text-muted uppercase font-600">' + k.label + '</div>' +
        '</div>' +
        '<div class="font-700" style="font-size:28px;line-height:1;">' + k.value + '</div>' +
        '<div class="text-xs text-muted mt-6">' + k.sub + '</div>' +
      '</div>';
    }).join('');

    // Sub-Platform Cards
    var spHtml = data.subs.map(function (sub) {
      var sp = data.subPlatforms.find(function (s) { return s.code === sub.subPlatformCode; });
      var icon = _spIcons[sub.subPlatformCode] || 'fa-cubes';
      var color = _spColors[sub.subPlatformCode] || 'var(--primary)';
      var domain = sp ? sp.domain : sub.subPlatformCode + '.realfact.ai';
      var chipCls = _statusChip[sub.status] || 'chip-gray';

      // Count devices for this SP
      var spDevices = data.devices.length;
      var spSessions = data.sessions.filter(function (s) { return s.subPlatform === sub.subPlatformCode; });
      var spActiveSessions = spSessions.filter(function (s) { return s.status === 'Active'; }).length;

      return '<div class="card" style="padding:0;overflow:hidden;min-width:280px;flex:1;">' +
        '<div style="padding:20px 20px 16px;border-bottom:1px solid var(--border);">' +
          '<div class="flex items-center gap-12">' +
            '<div style="width:44px;height:44px;border-radius:12px;background:' + color + ';display:flex;align-items:center;justify-content:center;">' +
              '<i class="fa-solid ' + icon + '" style="font-size:20px;color:#fff;"></i>' +
            '</div>' +
            '<div style="flex:1;">' +
              '<div class="font-600" style="font-size:15px;">' + (sp ? sp.name : sub.subPlatformName) + '</div>' +
              '<div class="flex items-center gap-6 mt-2">' +
                '<span class="chip ' + chipCls + '" style="font-size:9px;">' + sub.status + '</span>' +
                '<span class="text-xs text-muted">' + sub.plan + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;">' +
          '<div class="flex gap-16 mb-12">' +
            '<div><div class="text-xs text-muted">Devices</div><div class="font-600">' + spDevices + '</div></div>' +
            '<div><div class="text-xs text-muted">Sessions</div><div class="font-600">' + spActiveSessions + ' active</div></div>' +
            '<div><div class="text-xs text-muted">Plan</div><div class="font-600">' + sub.plan + ' (' + (sub.price > 0 ? '฿' + _fmt(sub.price, true) : 'Free') + ')</div></div>' +
          '</div>' +
          (sub.renewDate ? '<div class="text-xs text-muted mb-12"><i class="fa-solid fa-calendar"></i> ต่ออายุ: ' + sub.renewDate + '</div>' : '') +
          '<a href="https://' + domain + '" target="_blank" rel="noopener" class="btn btn-primary btn-sm w-full" style="text-align:center;">' +
            '<i class="fa-solid fa-arrow-up-right-from-square"></i> เข้าใช้งาน' +
          '</a>' +
        '</div>' +
      '</div>';
    }).join('');

    if (data.subs.length === 0) {
      spHtml = '<div class="card" style="padding:24px;text-align:center;">' +
        '<i class="fa-solid fa-cubes text-muted" style="font-size:32px;opacity:.3;"></i>' +
        '<p class="text-muted mt-8">ยังไม่มี Sub-Platform ที่สมัครใช้งาน</p>' +
      '</div>';
    }

    // Recent Invoices — group by Sub-Platform
    var _spIconMap = { 'Avatar': 'fa-robot', 'Developer Portal': 'fa-code', 'AI Booking': 'fa-calendar-check' };
    var _spColorMap = { 'Avatar': '#f15b26', 'Developer Portal': '#8b5cf6', 'AI Booking': '#3b82f6' };

    // Collect unique sub-platforms from invoices
    var spGroups = {};
    data.recentInvoices.forEach(function (inv) {
      var sp = inv.subPlatform || 'อื่นๆ';
      if (!spGroups[sp]) spGroups[sp] = [];
      spGroups[sp].push(inv);
    });

    var statusMap = {
      'Paid': '<span class="chip chip-green" style="font-size:10px;">Paid</span>',
      'Issued': '<span class="chip chip-yellow" style="font-size:10px;">Issued</span>',
      'Pending Verification': '<span class="chip chip-blue" style="font-size:10px;">รอตรวจสอบ</span>',
      'Overdue': '<span class="chip chip-red" style="font-size:10px;">Overdue</span>',
    };

    var invoiceRows = '';
    var spKeys = Object.keys(spGroups);
    spKeys.forEach(function (sp) {
      var spIcon = _spIconMap[sp] || 'fa-cubes';
      var spColor = _spColorMap[sp] || 'var(--primary)';
      // SP group header row
      invoiceRows += '<tr><td colspan="5" style="padding:10px 12px 6px;background:var(--surface2);border-bottom:1px solid var(--border);">' +
        '<div class="flex items-center gap-8">' +
          '<i class="fa-solid ' + spIcon + '" style="color:' + spColor + ';font-size:13px;"></i>' +
          '<span class="font-600 text-sm">' + sp + '</span>' +
          '<span class="text-xs text-muted">(' + spGroups[sp].length + ')</span>' +
        '</div>' +
      '</td></tr>';
      // Invoice rows for this SP
      spGroups[sp].forEach(function (inv) {
        invoiceRows += '<tr>' +
          '<td class="mono text-sm" style="white-space:nowrap;">' + inv.id + '</td>' +
          '<td>' + inv.description + '</td>' +
          '<td class="text-right" style="white-space:nowrap;">฿' + _fmt(inv.total, true) + '</td>' +
          '<td>' + (statusMap[inv.status] || inv.status) + '</td>' +
          '<td class="text-sm text-muted" style="white-space:nowrap;">' + inv.issuedDate + '</td>' +
        '</tr>';
      });
    });

    if (data.recentInvoices.length === 0) {
      invoiceRows = '<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">ยังไม่มี Invoice</td></tr>';
    }

    return '<div style="max-width:1200px;margin:0 auto;">' +
      // Welcome
      '<div class="mb-20">' +
        '<div class="font-700" style="font-size:22px;line-height:1.3;">' +
          '<i class="fa-solid fa-building text-primary"></i> ' + t.name +
        '</div>' +
        '<div class="text-sm text-muted mt-4">แพ็กเกจ: <span class="chip chip-blue" style="font-size:10px;">' + t.plan + '</span> &middot; สมาชิก ' + t.members + ' คน &middot; สถานะ <span class="chip ' + (_statusChip[t.status] || 'chip-gray') + '" style="font-size:10px;">' + t.status + '</span></div>' +
      '</div>' +

      // KPI Cards
      '<div class="flex gap-16 mb-24" style="flex-wrap:wrap;">' + kpiHtml + '</div>' +

      // Sub-Platforms Section
      '<div class="mb-24">' +
        '<div class="text-xs uppercase text-muted font-600 mb-12"><i class="fa-solid fa-cubes"></i> Sub-Platforms ของฉัน</div>' +
        '<div class="flex gap-16" style="flex-wrap:wrap;">' + spHtml + '</div>' +
      '</div>' +

      // Recent Invoices
      '<div class="card" style="padding:0;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);">' +
          '<div class="flex items-center justify-between">' +
            '<div class="font-600"><i class="fa-solid fa-file-invoice-dollar text-muted"></i> Invoice ล่าสุด</div>' +
            '<a href="#hub-billing" class="text-sm text-primary" style="text-decoration:none;">ดูทั้งหมด <i class="fa-solid fa-arrow-right"></i></a>' +
          '</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table>' +
            '<thead><tr><th>Invoice #</th><th>รายการ</th><th class="text-right">จำนวน</th><th>สถานะ</th><th>วันที่</th></tr></thead>' +
            '<tbody>' + invoiceRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _fmt(n, decimal) {
    if (n === null || n === undefined) return '—';
    if (decimal) return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return Number(n).toLocaleString('th-TH');
  }

  return { render: render };
})();
