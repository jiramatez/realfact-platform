/* ================================================================
   Hub Wallet — Token Balance breakdown + Transaction history
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubWallet = (function () {
  'use strict';

  var _filter = 'all';

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;
    var tenant = (d.tenants || []).find(function (t) { return t.id === tid; });
    var uWallet = (d.universalWallet || {})[tid] || [];
    var sAlloc  = (d.subscriptionAlloc || {})[tid] || [];
    var activities = (d.tokenActivities || {})[tid] || [];
    return { tenant: tenant, uWallet: uWallet, sAlloc: sAlloc, activities: activities };
  }

  function _fmt(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('th-TH');
  }

  function _fmtDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + (d.getFullYear() + 543);
  }

  function _daysUntil(dateStr) {
    var now = new Date(); now.setHours(0,0,0,0);
    var exp = new Date(dateStr); exp.setHours(0,0,0,0);
    return Math.ceil((exp - now) / 86400000);
  }

  var _uColors  = { purchased: '#22c55e', bonus: '#f59e0b', promo: '#a855f7' };
  var _uIcons   = { purchased: 'fa-cart-shopping', bonus: 'fa-gift', promo: 'fa-ticket' };
  var _spColors = { avatar: '#f15b26', booking: '#3b82f6', devportal: '#8b5cf6' };
  var _spIcons  = { avatar: 'fa-robot', booking: 'fa-calendar-check', devportal: 'fa-code' };

  function _pill(color, label, amount, expiry) {
    var exp = _fmtDate(expiry);
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:4px 12px;border-radius:6px;background:' + color + '12;border:1px solid ' + color + '25;">' +
      '<span style="width:7px;height:7px;border-radius:2px;background:' + color + ';flex-shrink:0;"></span>' +
      '<span style="color:' + color + ';font-weight:600;">' + label + '</span>' +
      '<span class="font-700">' + _fmt(amount) + '</span>' +
      (exp ? '<span class="text-muted" style="font-size:10px;"><i class="fa-regular fa-clock" style="margin-right:2px;"></i>' + exp + '</span>' : '') +
    '</span>';
  }

  function _breakdownCard(icon, color, label, amount, expiry) {
    var expiryChip = '';
    if (expiry) {
      var days = _daysUntil(expiry);
      if (days <= 7) expiryChip = '<span class="chip chip-red" style="font-size:9px;">หมดใน ' + days + ' วัน</span>';
      else if (days <= 30) expiryChip = '<span class="chip chip-yellow" style="font-size:9px;">หมดใน ' + days + ' วัน</span>';
    }
    return '<div class="card" style="padding:18px;flex:1;min-width:180px;">' +
      '<div class="flex items-center gap-10 mb-10">' +
        '<div style="width:34px;height:34px;border-radius:9px;background:' + color + '15;display:flex;align-items:center;justify-content:center;">' +
          '<i class="fa-solid ' + icon + '" style="font-size:15px;color:' + color + ';"></i>' +
        '</div>' +
        '<div class="text-xs text-muted uppercase font-600">' + label + '</div>' +
        expiryChip +
      '</div>' +
      '<div class="font-700" style="font-size:22px;line-height:1;">' + _fmt(amount) + '</div>' +
      (expiry ? '<div class="text-xs text-muted mt-6"><i class="fa-regular fa-clock" style="margin-right:3px;"></i>' + _fmtDate(expiry) + '</div>' : '') +
    '</div>';
  }

  function render() {
    var data = _getData();
    if (!data || !data.tenant) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';
    }

    var t = data.tenant;
    var uTotal = data.uWallet.reduce(function (s, b) { return s + b.amount; }, 0);
    var sTotal = data.sAlloc.reduce(function (s, a) { return s + a.amount; }, 0);

    // ─── Universal Wallet Card ───
    var uPills = data.uWallet.map(function (b) {
      return _pill(_uColors[b.type] || '#888', b.label, b.amount, b.expiry);
    }).join('');

    var universalCard =
      '<div class="card" style="padding:24px;">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<div class="text-xs text-muted uppercase font-600 mb-6"><i class="fa-solid fa-wallet" style="margin-right:4px;"></i> Universal Wallet</div>' +
            '<div class="font-700" style="font-size:32px;line-height:1;">' + _fmt(uTotal) + ' <span class="text-sm font-400 text-muted">tokens</span></div>' +
            (uPills ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">' + uPills + '</div>' : '') +
          '</div>' +
          '<div style="width:56px;height:56px;border-radius:14px;background:var(--primary)15;display:flex;align-items:center;justify-content:center;">' +
            '<i class="fa-solid fa-wallet" style="font-size:24px;color:var(--primary);"></i>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ─── Subscription Alloc Card ───
    var aPills = data.sAlloc.map(function (a) {
      return _pill(_spColors[a.sp] || '#888', a.spName + ' ' + a.plan, a.amount, a.expiry);
    }).join('');

    var allocCard =
      '<div class="card" style="padding:24px;">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<div class="text-xs text-muted uppercase font-600 mb-6"><i class="fa-solid fa-calendar-check" style="margin-right:4px;"></i> รายเดือน (Sub-Platform)</div>' +
            '<div class="font-700" style="font-size:32px;line-height:1;">' + _fmt(sTotal) + ' <span class="text-sm font-400 text-muted">tokens</span></div>' +
            (aPills ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">' + aPills + '</div>' : '<div class="text-xs text-muted mt-8">ไม่มี Subscription Alloc</div>') +
          '</div>' +
          '<div style="width:56px;height:56px;border-radius:14px;background:#3b82f615;display:flex;align-items:center;justify-content:center;">' +
            '<i class="fa-solid fa-calendar-check" style="font-size:24px;color:#3b82f6;"></i>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ─── Breakdown cards ───
    var uBreakdown = data.uWallet.map(function (b) {
      return _breakdownCard(_uIcons[b.type] || 'fa-coins', _uColors[b.type] || '#888', b.label, b.amount, b.expiry);
    }).join('');
    var sBreakdown = data.sAlloc.map(function (a) {
      return _breakdownCard(_spIcons[a.sp] || 'fa-cubes', _spColors[a.sp] || '#888', a.spName + ' ' + a.plan, a.amount, a.expiry);
    }).join('');

    // Transaction History — filter
    var types = ['all'];
    var typeSet = {};
    data.activities.forEach(function (a) {
      if (!typeSet[a.type]) { typeSet[a.type] = true; types.push(a.type); }
    });

    var filterHtml = '';
    if (types.length > 2) {
      filterHtml = '<div class="flex gap-6 mb-14" style="flex-wrap:wrap;">' +
        types.map(function (tp) {
          var label = tp === 'all' ? 'ทั้งหมด' : tp;
          var cls = _filter === tp ? 'btn-primary' : 'btn-outline';
          return '<button class="btn btn-sm ' + cls + '" data-wallet-filter="' + tp + '">' + label + '</button>';
        }).join('') +
      '</div>';
    }

    var filtered = _filter === 'all'
      ? data.activities
      : data.activities.filter(function (a) { return a.type === _filter; });

    var rows = filtered.map(function (a) {
      var amtClass = a.amount >= 0 ? 'text-success' : '';
      var amtPrefix = a.amount >= 0 ? '+' : '';
      return '<tr>' +
        '<td class="text-sm" style="white-space:nowrap;">' + a.date + '</td>' +
        '<td><span class="chip ' + (a.typeClass || 'chip-gray') + '" style="font-size:9px;">' + a.type + '</span></td>' +
        '<td class="text-sm">' + a.description + '</td>' +
        '<td class="text-right font-600 ' + amtClass + '" style="white-space:nowrap;">' + amtPrefix + _fmt(a.amount) + '</td>' +
        '<td class="text-right text-sm text-muted" style="white-space:nowrap;">' + _fmt(a.balance) + '</td>' +
      '</tr>';
    }).join('');

    if (!rows) {
      rows = '<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">ยังไม่มีรายการ</td></tr>';
    }

    return '<div style="max-width:1200px;margin:0 auto;">' +
      // Two wallet cards side by side
      '<div class="flex gap-16 mb-16" style="flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:300px;">' + universalCard + '</div>' +
        '<div style="flex:1;min-width:300px;">' + allocCard + '</div>' +
      '</div>' +
      // Breakdown cards
      (uBreakdown || sBreakdown ?
        '<div class="flex gap-14 mb-20" style="flex-wrap:wrap;">' + uBreakdown + sBreakdown + '</div>' : '') +
      // Transaction History
      '<div class="card" style="padding:0;">' +
        '<div style="padding:14px 20px;border-bottom:1px solid var(--border);">' +
          '<div class="font-600"><i class="fa-solid fa-clock-rotate-left text-muted"></i> ประวัติธุรกรรม</div>' +
        '</div>' +
        '<div style="padding:12px 20px 0;">' + filterHtml + '</div>' +
        '<div class="table-wrap">' +
          '<table>' +
            '<thead><tr><th>วันที่</th><th>ประเภท</th><th>รายละเอียด</th><th class="text-right">จำนวน</th><th class="text-right">คงเหลือ</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function init() {
    document.querySelectorAll('[data-wallet-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _filter = btn.dataset.walletFilter;
        App.rerenderPage();
      });
    });
  }

  function cleanup() {
    _filter = 'all';
  }

  return { render: render, init: init, cleanup: cleanup };
})();
