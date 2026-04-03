/* ================================================================
   Hub Billing — Invoice ของ Tenant (grouped by Sub-Platform)
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubBilling = (function () {
  'use strict';

  var _spIconMap = { 'Avatar': 'fa-robot', 'AI Booking': 'fa-calendar-check', 'Developer Portal': 'fa-code' };
  var _spColorMap = { 'Avatar': '#f15b26', 'AI Booking': '#3b82f6', 'Developer Portal': '#8b5cf6' };
  var _activeFilter = 'all';

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;
    var invoices = (d.invoices || []).filter(function (i) { return i.tenantId === tid; });
    return { invoices: invoices };
  }

  function _fmt(n) {
    return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var statusMap = {
    'Paid': '<span class="chip chip-green" style="font-size:10px;">ชำระแล้ว</span>',
    'Issued': '<span class="chip chip-yellow" style="font-size:10px;">รอชำระ</span>',
    'Pending Verification': '<span class="chip chip-blue" style="font-size:10px;">รอตรวจสอบ</span>',
    'Overdue': '<span class="chip chip-red" style="font-size:10px;">ค้างชำระ</span>',
  };

  function render() {
    var data = _getData();
    if (!data) return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';

    // Collect unique sub-platforms
    var spList = [];
    var spSet = {};
    data.invoices.forEach(function (inv) {
      var sp = inv.subPlatform || 'อื่นๆ';
      if (!spSet[sp]) { spSet[sp] = true; spList.push(sp); }
    });

    // Filter
    var filtered = _activeFilter === 'all'
      ? data.invoices
      : data.invoices.filter(function (i) { return i.subPlatform === _activeFilter; });

    // Summary
    var paid = filtered.filter(function (i) { return i.status === 'Paid'; });
    var pending = filtered.filter(function (i) { return i.status !== 'Paid'; });
    var totalPaid = paid.reduce(function (s, i) { return s + i.total; }, 0);
    var totalPending = pending.reduce(function (s, i) { return s + i.total; }, 0);

    // Filter tabs (only show if > 1 SP)
    var filterHtml = '';
    if (spList.length > 1) {
      var tabs = '<button class="btn btn-sm ' + (_activeFilter === 'all' ? 'btn-primary' : 'btn-outline') + '" data-billing-filter="all">ทั้งหมด (' + data.invoices.length + ')</button>';
      spList.forEach(function (sp) {
        var icon = _spIconMap[sp] || 'fa-cubes';
        var count = data.invoices.filter(function (i) { return i.subPlatform === sp; }).length;
        tabs += ' <button class="btn btn-sm ' + (_activeFilter === sp ? 'btn-primary' : 'btn-outline') + '" data-billing-filter="' + sp + '">' +
          '<i class="fa-solid ' + icon + '"></i> ' + sp + ' (' + count + ')</button>';
      });
      filterHtml = '<div class="flex gap-8 mb-16" style="flex-wrap:wrap;">' + tabs + '</div>';
    }

    // Table rows — grouped by SP when showing all
    var rows = '';
    if (_activeFilter === 'all' && spList.length > 1) {
      // Group by SP
      spList.forEach(function (sp) {
        var spInvs = filtered.filter(function (i) { return i.subPlatform === sp; });
        if (spInvs.length === 0) return;
        var spIcon = _spIconMap[sp] || 'fa-cubes';
        var spColor = _spColorMap[sp] || 'var(--primary)';
        rows += '<tr><td colspan="8" style="padding:10px 12px 6px;background:var(--surface2);border-bottom:1px solid var(--border);">' +
          '<div class="flex items-center gap-8">' +
            '<i class="fa-solid ' + spIcon + '" style="color:' + spColor + ';font-size:13px;"></i>' +
            '<span class="font-600 text-sm">' + sp + '</span>' +
            '<span class="text-xs text-muted">(' + spInvs.length + ' รายการ)</span>' +
          '</div>' +
        '</td></tr>';
        spInvs.forEach(function (inv) { rows += _renderRow(inv); });
      });
    } else {
      filtered.forEach(function (inv) { rows += _renderRow(inv); });
    }

    if (filtered.length === 0) {
      rows = '<tr><td colspan="8" class="text-center text-muted" style="padding:24px;">ยังไม่มี Invoice</td></tr>';
    }

    return '<div>' +
      // Page header with back button
      '<div class="flex items-center gap-12 mb-20">' +
        '<a href="#hub-dashboard" class="btn btn-outline btn-sm" style="padding:6px 10px;"><i class="fa-solid fa-arrow-left"></i></a>' +
        '<div class="font-700" style="font-size:18px;">Billing & Invoice</div>' +
      '</div>' +
      // Summary cards
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;" class="mb-20">' +
        '<div class="card" style="padding:20px;">' +
          '<div class="text-xs text-muted uppercase font-600 mb-6">ชำระแล้ว</div>' +
          '<div class="font-700 text-success" style="font-size:24px;">฿' + _fmt(totalPaid) + '</div>' +
          '<div class="text-xs text-muted mt-4">' + paid.length + ' รายการ</div>' +
        '</div>' +
        '<div class="card" style="padding:20px;">' +
          '<div class="text-xs text-muted uppercase font-600 mb-6">ค้างชำระ</div>' +
          '<div class="font-700" style="font-size:24px;color:#f59e0b;">฿' + _fmt(totalPending) + '</div>' +
          '<div class="text-xs text-muted mt-4">' + pending.length + ' รายการ</div>' +
        '</div>' +
        '<div class="card" style="padding:20px;">' +
          '<div class="text-xs text-muted uppercase font-600 mb-6">รวมทั้งหมด</div>' +
          '<div class="font-700" style="font-size:24px;">฿' + _fmt(totalPaid + totalPending) + '</div>' +
          '<div class="text-xs text-muted mt-4">' + filtered.length + ' รายการ</div>' +
        '</div>' +
      '</div>' +
      // Filter tabs
      filterHtml +
      // Table
      '<div class="card" style="padding:0;">' +
        '<div style="padding:14px 20px;border-bottom:1px solid var(--border);">' +
          '<div class="font-600"><i class="fa-solid fa-file-invoice-dollar text-muted"></i> Invoice ทั้งหมด</div>' +
        '</div>' +
        '<div class="table-wrap">' +
          '<table>' +
            '<thead><tr>' +
              '<th>Invoice #</th>' +
              '<th>รายการ</th>' +
              '<th>Sub-Platform</th>' +
              '<th class="text-right">จำนวน</th>' +
              '<th>สถานะ</th>' +
              '<th>วันที่ออก</th>' +
              '<th>ครบกำหนด</th>' +
              '<th>ชำระวันที่</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _renderRow(inv) {
    var spIcon = _spIconMap[inv.subPlatform] || 'fa-cubes';
    var spColor = _spColorMap[inv.subPlatform] || 'var(--primary)';
    var rowStyle = inv.status === 'Overdue' ? ' style="background:rgba(239,68,68,0.08);border-left:3px solid var(--error);"' : '';
    return '<tr' + rowStyle + '>' +
      '<td class="mono text-sm" style="white-space:nowrap;">' + inv.id + '</td>' +
      '<td>' + inv.description + '</td>' +
      '<td style="white-space:nowrap;"><i class="fa-solid ' + spIcon + '" style="color:' + spColor + ';font-size:11px;margin-right:4px;"></i>' + inv.subPlatform + '</td>' +
      '<td class="text-right" style="white-space:nowrap;">฿' + _fmt(inv.total) + '</td>' +
      '<td>' + (statusMap[inv.status] || inv.status) + '</td>' +
      '<td class="text-sm text-muted" style="white-space:nowrap;">' + inv.issuedDate + '</td>' +
      '<td class="text-sm text-muted" style="white-space:nowrap;">' + inv.dueDate + '</td>' +
      '<td class="text-sm" style="white-space:nowrap;">' + (inv.paidDate || '—') + '</td>' +
    '</tr>';
  }

  function init() {
    // Bind filter tabs
    document.querySelectorAll('[data-billing-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _activeFilter = btn.dataset.billingFilter;
        App.rerenderPage();
      });
    });
  }

  function cleanup() {
    _activeFilter = 'all';
  }

  return { render: render, init: init, cleanup: cleanup };
})();
