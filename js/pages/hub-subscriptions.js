/* ================================================================
   Hub Subscriptions — แพ็กเกจของฉัน
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubSubscriptions = (function () {
  'use strict';

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;
    var tenant = (d.tenants || []).find(function (t) { return t.id === tid; });
    var subs = (d.tenantSubscriptions || {})[tid] || [];
    var activities = (d.tokenActivities || {})[tid] || [];
    return { tenant: tenant, subs: subs, activities: activities };
  }

  function render() {
    var data = _getData();
    if (!data || !data.tenant) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';
    }
    var t = data.tenant;

    // Token Balance Card
    var tokenCard =
      '<div class="card" style="padding:24px;margin-bottom:20px;">' +
        '<div class="text-xs uppercase text-muted font-600 mb-12"><i class="fa-solid fa-coins"></i> Token Balance</div>' +
        '<div class="flex gap-24" style="flex-wrap:wrap;">' +
          '<div><div class="text-xs text-muted">คงเหลือ</div><div class="font-700" style="font-size:32px;color:var(--primary);">' + Number(t.tokenBalance).toLocaleString('th-TH') + '</div></div>' +
          '<div><div class="text-xs text-muted">Bonus</div><div class="font-600" style="font-size:18px;">' + Number(t.bonusTokens).toLocaleString('th-TH') + '</div></div>' +
          '<div><div class="text-xs text-muted">ซื้อเพิ่ม</div><div class="font-600" style="font-size:18px;">' + Number(t.purchasedTokens).toLocaleString('th-TH') + '</div></div>' +
        '</div>' +
      '</div>';

    // Subscriptions List
    var subsHtml = data.subs.map(function (sub) {
      var chipCls = sub.status === 'Active' ? 'chip-green' : sub.status === 'Pending' ? 'chip-yellow' : 'chip-red';
      return '<div class="card" style="padding:16px;margin-bottom:8px;">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<div class="font-600">' + sub.subPlatformName + '</div>' +
            '<div class="text-sm text-muted mt-2">Plan: ' + sub.plan + ' &middot; ฿' + Number(sub.price).toLocaleString('th-TH', { minimumFractionDigits: 2 }) + '/เดือน</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<span class="chip ' + chipCls + '" style="font-size:10px;">' + sub.status + '</span>' +
            (sub.renewDate ? '<div class="text-xs text-muted mt-4">ต่ออายุ: ' + sub.renewDate + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    // Token Activity
    var activityRows = data.activities.map(function (a) {
      var amountClass = a.amount >= 0 ? 'text-success' : '';
      var prefix = a.amount >= 0 ? '+' : '';
      return '<tr>' +
        '<td class="text-sm">' + a.date + '</td>' +
        '<td><span class="chip ' + a.typeClass + '" style="font-size:10px;">' + a.type + '</span></td>' +
        '<td class="text-sm">' + a.description + '</td>' +
        '<td class="text-right font-600 ' + amountClass + '">' + prefix + Number(a.amount).toLocaleString('th-TH') + '</td>' +
        '<td class="text-right mono text-sm">' + Number(a.balance).toLocaleString('th-TH') + '</td>' +
      '</tr>';
    }).join('');

    return '<div style="max-width:1000px;margin:0 auto;">' +
      tokenCard +
      '<div class="text-xs uppercase text-muted font-600 mb-8"><i class="fa-solid fa-box-open"></i> แพ็กเกจที่สมัคร</div>' +
      subsHtml +
      '<div class="card" style="padding:0;margin-top:20px;">' +
        '<div style="padding:14px 20px;border-bottom:1px solid var(--border);"><div class="font-600"><i class="fa-solid fa-clock-rotate-left text-muted"></i> Token Activity</div></div>' +
        '<div style="overflow-x:auto;">' +
          '<table class="data-table"><thead><tr><th>วันที่</th><th>ประเภท</th><th>รายการ</th><th class="text-right">จำนวน</th><th class="text-right">คงเหลือ</th></tr></thead>' +
          '<tbody>' + (activityRows || '<tr><td colspan="5" class="text-center text-muted" style="padding:24px;">ยังไม่มีรายการ</td></tr>') + '</tbody></table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  return { render: render };
})();
