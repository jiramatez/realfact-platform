/* ================================================================
   Hub Pricing — Tenant-facing Snapshot or Live Price view
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubPricing = (function () {
  'use strict';

  function render() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล Tenant</p></div>';
    }

    var tid = ctx.tenantId;
    var snap = d.resolveSnapshotForTenant(tid);
    var rem = snap ? d.snapshotDaysRemaining(snap) : null;

    var html = '<div class="page-header"><h1 class="heading">PRICING</h1></div>';

    // Banner — 2 types: Snapshot (frozen) or Live Price (dynamic)
    if (snap) {
      html += '<div class="card p-20 mb-20" style="border-left:4px solid var(--primary);background:rgba(59,130,246,0.04);">' +
        '<div class="flex items-center gap-16">' +
          '<div style="width:48px;height:48px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
            '<i class="fa-solid fa-camera" style="color:#fff;font-size:20px;"></i>' +
          '</div>' +
          '<div class="flex-1">' +
            '<div class="font-700" style="font-size:18px;">📸 คุณกำลังใช้: Snapshot (Frozen Pricing)</div>' +
            '<div class="text-sm text-muted mt-4">ราคาถูก freeze ณ วันสร้างและจะใช้จนครบกำหนด — ไม่เปลี่ยนแม้ราคาทั่วไปจะเปลี่ยน</div>' +
            '<div class="text-xs text-dim mt-4 mono">' + snap.name + ' · ' + snap.id + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="mono font-700" style="font-size:28px;color:' + (rem <= 30 ? '#f59e0b' : 'var(--primary)') + ';">' + rem + '</div>' +
            '<div class="text-xs text-muted">วันที่เหลือ</div>' +
            '<div class="text-xs text-dim mono mt-2">หมดอายุ ' + snap.endDate + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      // Timeline
      var start = new Date(snap.startDate);
      var end = new Date(snap.endDate);
      var total = Math.max(1, Math.ceil((end - start) / 86400000));
      var used = total - rem;
      var pct = Math.max(0, Math.min(100, Math.round(used / total * 100)));
      html += '<div class="card p-16 mb-20">' +
        '<div class="flex items-center justify-between mb-8">' +
          '<span class="font-600 text-sm"><i class="fa-solid fa-hourglass-half"></i> Snapshot Timeline</span>' +
          '<span class="text-sm text-muted mono">' + used + ' / ' + total + ' วัน (' + pct + '%)</span>' +
        '</div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:' + (rem <= 30 ? '#f59e0b' : 'var(--primary)') + ';"></div></div>' +
        '<div class="flex justify-between mt-6 text-xs text-dim mono">' +
          '<span>' + snap.startDate + '</span>' +
          '<span>' + snap.endDate + '</span>' +
        '</div>' +
      '</div>';

      html += '<div class="section-title mb-12"><i class="fa-solid fa-list"></i> ราคาที่ freeze ไว้สำหรับคุณ <span class="text-xs text-dim">(LLM แยก input/output)</span></div>';
      var catChipH = function (c) {
        var m = { Text: 'chip-blue', Audio: 'chip-purple', Video: 'chip-orange', Embedding: 'chip-gray', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[c] || 'chip-gray') + '" style="font-size:10px;">' + c + '</span>';
      };
      var varChipH = function (v) {
        var m = { Input: 'chip-blue', Output: 'chip-purple', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[v] || 'chip-gray') + '" style="font-size:10px;">' + v + '</span>';
      };
      var groupedSnap = {};
      snap.services.forEach(function (sv) { (groupedSnap[sv.serviceCode] = groupedSnap[sv.serviceCode] || []).push(sv); });
      html += '<div class="card p-16 mb-20"><div class="table-wrap"><table><thead><tr>' +
        '<th>Service</th><th>Category</th><th>Variant</th><th class="text-right">Cost/หน่วย</th><th class="text-right">ราคาของคุณ</th>' +
      '</tr></thead><tbody>' +
      Object.keys(groupedSnap).map(function (code) {
        var svcInfo = (d.costConfig || []).find(function (c) { return c.serviceCode === code; }) || {};
        var dimsArr = groupedSnap[code];
        var n = dimsArr.length;
        return dimsArr.map(function (sv, i) {
          return '<tr' + (i > 0 ? ' style="border-top:1px dashed var(--border);"' : '') + '>' +
            (i === 0 ? '<td rowspan="' + n + '" style="vertical-align:top;border-right:1px solid var(--border);"><div class="font-600 text-sm">' + (svcInfo.name || code) + '</div><div class="text-xs text-dim mono">' + code + '</div>' + (n > 1 ? '<div class="text-xs text-dim mt-2">' + n + ' dimensions</div>' : '') + '</td>' : '') +
            '<td>' + catChipH(sv.category || 'Primary') + '</td>' +
            '<td>' + varChipH(sv.variant || 'Primary') + '</td>' +
            '<td class="text-right mono text-sm text-muted">฿' + sv.cost.toFixed(6) + '</td>' +
            '<td class="text-right mono font-700">฿' + sv.sell.toFixed(6) + '</td>' +
          '</tr>';
        }).join('');
      }).join('') +
      '</tbody></table></div></div>';

      html += '<div class="card p-12 text-sm text-muted" style="background:var(--surface2);">' +
        '<i class="fa-solid fa-circle-info"></i> Snapshot: ราคาจะคงเดิมจนถึง ' + snap.endDate + ' แม้ว่าราคามาตรฐาน (Live) จะเปลี่ยนไป' +
      '</div>';
    } else {
      // Live Price banner
      html += '<div class="card p-20 mb-20" style="border-left:4px solid #3b82f6;background:rgba(59,130,246,0.04);">' +
        '<div class="flex items-center gap-16">' +
          '<div style="width:48px;height:48px;border-radius:12px;background:#3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
            '<i class="fa-solid fa-bolt" style="color:#fff;font-size:20px;"></i>' +
          '</div>' +
          '<div class="flex-1">' +
            '<div class="font-700" style="font-size:18px;">💱 คุณกำลังใช้: Live Price</div>' +
            '<div class="text-sm text-muted mt-4">ราคาคำนวณจาก cost × margin ปัจจุบัน — อาจเปลี่ยนเมื่อ cost หรือ margin เปลี่ยน</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      html += '<div class="section-title mb-12"><i class="fa-solid fa-list"></i> ราคา Live ปัจจุบัน <span class="text-xs text-dim">(LLM แยก input/output)</span></div>';
      var catChipHL = function (c) {
        var m = { Text: 'chip-blue', Audio: 'chip-purple', Video: 'chip-orange', Embedding: 'chip-gray', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[c] || 'chip-gray') + '" style="font-size:10px;">' + c + '</span>';
      };
      var varChipHL = function (v) {
        var m = { Input: 'chip-blue', Output: 'chip-purple', Primary: 'chip-gray' };
        return '<span class="chip ' + (m[v] || 'chip-gray') + '" style="font-size:10px;">' + v + '</span>';
      };
      html += '<div class="card p-16 mb-20"><div class="table-wrap"><table><thead><tr>' +
        '<th>Service</th><th>Provider</th><th>Category</th><th>Variant</th><th class="text-right">Cost/หน่วย</th><th class="text-right">Margin</th><th class="text-right">ราคาของคุณ</th>' +
      '</tr></thead><tbody>' +
      (d.costConfig || []).filter(function (c) { return c.status === 'Active'; }).map(function (c) {
        var dimsArr = d.serviceDimensions(c.serviceCode);
        var n = dimsArr.length;
        return dimsArr.map(function (dim, i) {
          var lp = d.getLivePrice(c.serviceCode, dim.category, dim.variant);
          return '<tr' + (i > 0 ? ' style="border-top:1px dashed var(--border);"' : '') + '>' +
            (i === 0 ? '<td rowspan="' + n + '" style="vertical-align:top;border-right:1px solid var(--border);"><div class="font-600 text-sm">' + c.name + '</div><div class="text-xs text-dim mono">' + c.serviceCode + '</div>' + (n > 1 ? '<div class="text-xs text-dim mt-2">' + n + ' dimensions</div>' : '') + '</td><td rowspan="' + n + '" style="vertical-align:top;" class="text-sm">' + c.provider + '</td>' : '') +
            '<td>' + catChipHL(dim.category) + '</td>' +
            '<td>' + varChipHL(dim.variant) + '</td>' +
            '<td class="text-right mono text-sm text-muted">฿' + (lp ? lp.cost.toFixed(6) : dim.cost.toFixed(6)) + '</td>' +
            '<td class="text-right mono text-sm">' + (lp ? lp.margin : 0) + '%</td>' +
            '<td class="text-right mono font-700">฿' + (lp ? lp.sell.toFixed(6) : dim.cost.toFixed(6)) + '</td>' +
          '</tr>';
        }).join('');
      }).join('') +
      '</tbody></table></div></div>';

      html += '<div class="card p-12 text-sm text-muted" style="background:var(--surface2);">' +
        '<i class="fa-solid fa-circle-info"></i> หากต้องการ lock ราคาไว้ตามสัญญา กรุณาติดต่อทีมงานเพื่อสร้าง Snapshot ให้กับองค์กรของคุณ' +
      '</div>';
    }

    return html;
  }

  function init() { /* read-only */ }

  return { render: render, init: init };
})();
