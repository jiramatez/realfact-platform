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

  // SP entry URLs — link to the correct app page per SP
  var _spEntryUrls = {
    avatar:    'index.html#avatar-dashboard',
    booking:   'index.html#avatar-dashboard',   // Booking shares Avatar app for now
    devportal: 'index.html#dp-dashboard',
  };
  function _spEntryUrl(code) {
    return _spEntryUrls[code] || 'index.html';
  }

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

    // Monthly cost — use mock date 2026-03 as reference
    var monthKey = '2026-03';
    var monthlyInvoices = invoices.filter(function (i) { return i.issuedDate && i.issuedDate.slice(0, 7) === monthKey; });
    var monthlyCost = monthlyInvoices.reduce(function (sum, i) { return sum + (i.total || 0); }, 0);

    // Active sessions
    var activeSessions = sessions.filter(function (s) { return s.status === 'Active'; }).length;

    // Pending invoices
    var pendingInvoices = invoices.filter(function (i) { return i.status === 'Issued' || i.status === 'Pending Verification'; }).length;
    var overdueInvoices = invoices.filter(function (i) { return i.status === 'Overdue'; }).length;

    return {
      tenant: tenant,
      subs: subs,
      invoices: invoices,
      recentInvoices: invoices.slice(0, 10),
      sessions: sessions,
      devices: devices,
      subPlatforms: subPlatforms,
      monthlyCost: monthlyCost,
      monthlyInvoiceCount: monthlyInvoices.length,
      activeSessions: activeSessions,
      pendingInvoices: pendingInvoices,
      overdueInvoices: overdueInvoices,
    };
  }

  function render() {
    var data = _getData();
    if (!data || !data.tenant) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล Tenant</p></div>';
    }
    var t = data.tenant;

    // Wallet data
    var _d = window.MockData || {};
    var _tid = (window.Auth && Auth.activeContext()) ? Auth.activeContext().tenantId : '';
    var uWallet = (_d.universalWallet || {})[_tid] || [];
    var sAlloc  = (_d.subscriptionAlloc || {})[_tid] || [];
    var uTotal  = uWallet.reduce(function (s, b) { return s + b.amount; }, 0);

    // KPI Cards
    var kpis = [
      {
        icon: 'fa-wallet', color: 'var(--primary)',
        label: 'Universal Wallet',
        value: _fmt(uTotal),
        sub: _walletLegend(uWallet),
        link: '#hub-wallet',
      },
      {
        icon: 'fa-calendar-check', color: '#3b82f6',
        label: 'รายเดือน (Sub-Platform)',
        value: sAlloc.length > 0 ? sAlloc.length + ' แพลน' : '—',
        sub: _allocLegend(sAlloc),
        link: '#hub-wallet',
      },
      {
        icon: 'fa-file-invoice-dollar', color: 'var(--success)',
        label: 'Billing เดือนนี้',
        value: '฿' + _fmt(data.monthlyCost, true),
        sub: data.monthlyInvoiceCount + ' invoice' +
          (data.overdueInvoices > 0 ? ' · <span style="color:var(--error);">' + data.overdueInvoices + ' ค้างชำระ</span>' : '') +
          (data.pendingInvoices > 0 ? ' · <span style="color:var(--warning);">' + data.pendingInvoices + ' รอตรวจสอบ</span>' : '') +
          (data.overdueInvoices === 0 && data.pendingInvoices === 0 ? ' · ชำระครบ' : ''),
        link: '#hub-billing',
        linkText: 'ดูทั้งหมด',
      },
    ];

    var kpiHtml = kpis.map(function (k) {
      return '<div class="card" style="padding:16px 20px;display:flex;flex-direction:column;">' +
        '<div class="flex items-center justify-between mb-10">' +
          '<div class="flex items-center gap-8">' +
            '<div style="width:32px;height:32px;border-radius:8px;background:' + k.color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
              '<i class="fa-solid ' + k.icon + '" style="font-size:14px;color:' + k.color + ';"></i>' +
            '</div>' +
            '<div class="text-xs text-muted uppercase font-600">' + k.label + '</div>' +
          '</div>' +
          (k.linkText && k.link ? '<a href="' + k.link + '" class="text-xs text-primary" style="text-decoration:none;white-space:nowrap;">' + k.linkText + ' <i class="fa-solid fa-arrow-right" style="font-size:9px;"></i></a>' : '') +
        '</div>' +
        '<div class="font-700" style="font-size:24px;line-height:1;">' + k.value + '</div>' +
        '<div class="mt-8" style="flex:1;">' + k.sub + '</div>' +
      '</div>';
    }).join('');

    // Sub-Platform Cards — metrics per type
    var spHtml = data.subs.map(function (sub) {
      var sp = data.subPlatforms.find(function (s) { return s.code === sub.subPlatformCode; });
      var icon = _spIcons[sub.subPlatformCode] || 'fa-cubes';
      var color = _spColors[sub.subPlatformCode] || 'var(--primary)';
      var domain = sp ? sp.domain : sub.subPlatformCode + '.realfact.ai';
      var chipCls = _statusChip[sub.status] || 'chip-gray';
      var spSessions = data.sessions.filter(function (s) { return s.subPlatform === sub.subPlatformCode; });
      var spActiveSessions = spSessions.filter(function (s) { return s.status === 'Active'; }).length;
      var spDevices = data.devices.filter(function (dv) { return dv.subPlatform === sub.subPlatformCode; }).length || data.devices.length;

      // Metrics differ by SP type
      var metricsHtml = '';
      if (sub.subPlatformCode === 'avatar') {
        metricsHtml =
          '<div><div class="text-xs text-muted">Devices</div><div class="font-600 mono">' + spDevices + '</div></div>' +
          '<div><div class="text-xs text-muted">Sessions</div><div class="font-600 mono">' + spActiveSessions + ' active</div></div>' +
          '<div><div class="text-xs text-muted">Plan</div><div class="font-600">' + sub.plan + '</div></div>' +
          '<div><div class="text-xs text-muted">ราคา/เดือน</div><div class="font-600 mono">' + (sub.price > 0 ? '฿' + _fmt(sub.price, true) : 'Free') + '</div></div>';
      } else if (sub.subPlatformCode === 'booking') {
        metricsHtml =
          '<div><div class="text-xs text-muted">Reservations</div><div class="font-600 mono">—</div></div>' +
          '<div><div class="text-xs text-muted">Rooms/Services</div><div class="font-600 mono">—</div></div>' +
          '<div><div class="text-xs text-muted">Plan</div><div class="font-600">' + sub.plan + '</div></div>' +
          '<div><div class="text-xs text-muted">ราคา/เดือน</div><div class="font-600 mono">' + (sub.price > 0 ? '฿' + _fmt(sub.price, true) : 'Free') + '</div></div>';
      } else if (sub.subPlatformCode === 'devportal') {
        metricsHtml =
          '<div><div class="text-xs text-muted">API Calls</div><div class="font-600 mono">—</div></div>' +
          '<div><div class="text-xs text-muted">Credit Usage</div><div class="font-600 mono">—</div></div>' +
          '<div><div class="text-xs text-muted">Billing</div><div class="font-600">Credit Line</div></div>' +
          '<div><div class="text-xs text-muted">ราคา/เดือน</div><div class="font-600 mono">' + (sub.price > 0 ? '฿' + _fmt(sub.price, true) : 'Free') + '</div></div>';
      } else {
        metricsHtml =
          '<div><div class="text-xs text-muted">Plan</div><div class="font-600">' + sub.plan + '</div></div>' +
          '<div><div class="text-xs text-muted">ราคา/เดือน</div><div class="font-600 mono">' + (sub.price > 0 ? '฿' + _fmt(sub.price, true) : 'Free') + '</div></div>';
      }

      return '<div class="card" style="padding:0;overflow:hidden;">' +
        '<div style="padding:16px 20px;border-bottom:1px solid var(--border);">' +
          '<div class="flex items-center gap-12">' +
            '<div style="width:40px;height:40px;border-radius:10px;background:' + color + ';display:flex;align-items:center;justify-content:center;">' +
              '<i class="fa-solid ' + icon + '" style="font-size:18px;color:#fff;"></i>' +
            '</div>' +
            '<div style="flex:1;">' +
              '<div class="font-600" style="font-size:14px;">' + (sp ? sp.name : sub.subPlatformName) + '</div>' +
              '<div class="flex items-center gap-6 mt-2">' +
                '<span class="chip ' + chipCls + '" style="font-size:9px;">' + sub.status + '</span>' +
                '<span class="text-xs text-muted">' + sub.plan + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 20px;">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:12px;">' + metricsHtml + '</div>' +
          (sub.renewDate ? '<div class="text-xs text-muted mb-10"><i class="fa-solid fa-calendar"></i> ต่ออายุ: ' + sub.renewDate + '</div>' : '') +
          '<div class="flex gap-8">' +
            '<a href="#hub-subscriptions/' + sub.subPlatformCode + '" class="btn btn-outline btn-sm" style="flex:1;text-align:center;">' +
              '<i class="fa-solid fa-gear"></i> จัดการ' +
            '</a>' +
            '<a href="' + _spEntryUrl(sub.subPlatformCode) + '" class="btn btn-primary btn-sm" style="flex:1;text-align:center;">' +
              '<i class="fa-solid fa-arrow-right"></i> เข้าใช้งาน' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    if (data.subs.length === 0) {
      spHtml = '<div class="card" style="padding:24px;text-align:center;">' +
        '<i class="fa-solid fa-cubes text-muted" style="font-size:32px;opacity:.3;"></i>' +
        '<p class="text-muted mt-8">ยังไม่มี Sub-Platform ที่สมัครใช้งาน</p>' +
      '</div>';
    }

    return '<div>' +
      // Welcome
      '<div class="mb-20">' +
        '<div class="font-700" style="font-size:22px;line-height:1.3;">' +
          '<i class="fa-solid fa-building text-primary"></i> ' + t.name +
        '</div>' +
        '<div class="text-sm text-muted mt-4">แพ็กเกจ: <span class="chip chip-blue" style="font-size:10px;">' + t.plan + '</span> &middot; สมาชิก ' + t.members + ' คน &middot; สถานะ <span class="chip ' + (_statusChip[t.status] || 'chip-gray') + '" style="font-size:10px;">' + t.status + '</span></div>' +
      '</div>' +

      // KPI Cards
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;" class="mb-24">' + kpiHtml + '</div>' +

      // Sub-Platforms Section
      '<div class="mb-24">' +
        '<div class="text-xs uppercase text-muted font-600 mb-12"><i class="fa-solid fa-cubes"></i> Sub-Platforms ของฉัน</div>' +
        '<div style="display:grid;grid-template-columns:repeat(' + Math.min(data.subs.length, 3) + ',1fr);gap:16px;">' + spHtml + '</div>' +
      '</div>' +

    '</div>';
  }

  var _walletColors = { subscription: '#3b82f6', purchased: '#22c55e', bonus: '#f59e0b', promo: '#a855f7' };

  function _fmtExpiry(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return d.getDate() + ' ' + m[d.getMonth()] + ' ' + (d.getFullYear() + 543);
  }

  var _spIcMap = { avatar: 'fa-robot', booking: 'fa-calendar-check', devportal: 'fa-code' };
  var _spClMap = { avatar: '#f15b26', booking: '#3b82f6', devportal: '#8b5cf6' };

  function _pill(color, label, amount, expiry) {
    var exp = _fmtExpiry(expiry);
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;padding:3px 10px;border-radius:6px;background:' + color + '12;border:1px solid ' + color + '25;">' +
      '<span style="width:7px;height:7px;border-radius:2px;background:' + color + ';flex-shrink:0;"></span>' +
      '<span style="color:' + color + ';font-weight:600;">' + label + '</span>' +
      '<span class="font-700">' + _fmt(amount) + '</span>' +
      (exp ? '<span class="text-muted" style="font-size:10px;"><i class="fa-regular fa-clock" style="margin-right:2px;"></i>' + exp + '</span>' : '') +
    '</span>';
  }

  function _walletLegend(balances) {
    if (!balances || !balances.length) return '<span class="text-xs text-muted">ไม่มี</span>';
    return '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
      balances.map(function (b) {
        return _pill(_walletColors[b.type] || '#888', b.label, b.amount, b.expiry);
      }).join('') +
    '</div>';
  }

  function _allocLegend(allocs) {
    if (!allocs || !allocs.length) return '<span class="text-xs text-muted">ไม่มี</span>';
    return '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
      allocs.map(function (a) {
        var color = _spClMap[a.sp] || '#888';
        return _pill(color, a.spName + ' ' + a.plan, a.amount, a.expiry);
      }).join('') +
    '</div>';
  }

  function _fmt(n, decimal) {
    if (n === null || n === undefined) return '—';
    if (decimal) return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return Number(n).toLocaleString('th-TH');
  }

  return { render: render };
})();
