/* ================================================================
   Hub Subscriptions — Subscription Plan ของ SP ที่เลือก
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubSubscriptions = (function () {
  'use strict';

  var _spIcons = { avatar: 'fa-robot', booking: 'fa-calendar-check', devportal: 'fa-code' };
  var _spColors = { avatar: '#f15b26', booking: '#3b82f6', devportal: '#8b5cf6' };

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;
    var subs = (d.tenantSubscriptions || {})[tid] || [];
    var plans = d.plans || [];
    var subPlatforms = d.subPlatforms || [];
    return { subs: subs, plans: plans, subPlatforms: subPlatforms };
  }

  function _fmt(n) {
    return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render() {
    var data = _getData();
    if (!data) return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';

    var spCode = window._hubPageParam || null;
    var sub = spCode ? data.subs.find(function (s) { return s.subPlatformCode === spCode; }) : null;

    // If no SP selected or not found, show SP picker
    if (!sub) {
      var pickerHtml = '<div>' +
        '<div class="flex items-center gap-12 mb-20">' +
          '<a href="#hub-dashboard" class="btn btn-outline btn-sm" style="padding:6px 10px;"><i class="fa-solid fa-arrow-left"></i></a>' +
          '<div class="font-700" style="font-size:18px;">เลือก Sub-Platform</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(' + Math.min(data.subs.length || 1, 3) + ',1fr);gap:16px;">';

      data.subs.forEach(function (s) {
        var icon = _spIcons[s.subPlatformCode] || 'fa-cubes';
        var color = _spColors[s.subPlatformCode] || 'var(--primary)';
        var sp = data.subPlatforms.find(function (p) { return p.code === s.subPlatformCode; });
        var chipCls = s.status === 'Active' ? 'chip-green' : s.status === 'Pending' ? 'chip-yellow' : 'chip-red';
        pickerHtml += '<a href="#hub-subscriptions/' + s.subPlatformCode + '" class="card" style="padding:20px;text-decoration:none;color:inherit;cursor:pointer;">' +
          '<div class="flex items-center gap-12 mb-12">' +
            '<div style="width:40px;height:40px;border-radius:10px;background:' + color + ';display:flex;align-items:center;justify-content:center;">' +
              '<i class="fa-solid ' + icon + '" style="font-size:18px;color:#fff;"></i>' +
            '</div>' +
            '<div>' +
              '<div class="font-600">' + (sp ? sp.name : s.subPlatformName) + '</div>' +
              '<div class="flex items-center gap-6 mt-2"><span class="chip ' + chipCls + '" style="font-size:9px;">' + s.status + '</span><span class="text-xs text-muted">' + s.plan + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="text-sm text-muted">฿' + _fmt(s.price) + '/เดือน</div>' +
        '</a>';
      });

      pickerHtml += '</div></div>';
      return pickerHtml;
    }

    // Single SP view
    var sp = data.subPlatforms.find(function (s) { return s.code === spCode; });
    var icon = _spIcons[spCode] || 'fa-cubes';
    var color = _spColors[spCode] || 'var(--primary)';
    var chipCls = sub.status === 'Active' ? 'chip-green' : sub.status === 'Pending' ? 'chip-yellow' : 'chip-red';
    var spPlans = data.plans.filter(function (p) { return p.subPlatform === spCode; });
    var availablePlans = sp ? sp.plans || [] : [];

    var html = '<div>' +
      '<div class="flex items-center gap-12 mb-20">' +
        '<a href="#hub-dashboard" class="btn btn-outline btn-sm" style="padding:6px 10px;"><i class="fa-solid fa-arrow-left"></i></a>' +
        '<div style="width:36px;height:36px;border-radius:8px;background:' + color + ';display:flex;align-items:center;justify-content:center;">' +
          '<i class="fa-solid ' + icon + '" style="font-size:16px;color:#fff;"></i>' +
        '</div>' +
        '<div>' +
          '<div class="font-700" style="font-size:18px;">' + (sp ? sp.name : sub.subPlatformName) + '</div>' +
          '<div class="flex items-center gap-6"><span class="chip ' + chipCls + '" style="font-size:9px;">' + sub.status + '</span><span class="text-sm text-muted">ปัจจุบัน: <strong>' + sub.plan + '</strong> · ฿' + _fmt(sub.price) + '/เดือน</span>' + (sub.renewDate ? '<span class="text-xs text-muted"><i class="fa-solid fa-calendar"></i> ต่ออายุ: ' + sub.renewDate + '</span>' : '') + '</div>' +
        '</div>' +
      '</div>' +
      // Available Plans
      '<div class="text-xs uppercase text-muted font-600 mb-12">แพ็กเกจที่เลือกได้</div>' +
      '<div style="display:grid;grid-template-columns:repeat(' + Math.min(availablePlans.length || 1, 4) + ',1fr);gap:16px;">';

    availablePlans.forEach(function (planName) {
      var planData = spPlans.find(function (p) { return p.name === planName; });
      var isCurrent = planName === sub.plan;
      var price = planData ? planData.price : 0;
      var tokens = planData ? planData.monthlyTokens : 0;
      var bonus = planData ? planData.bonusTokens : 0;

      html += '<div class="card" style="padding:20px;border:' + (isCurrent ? '2px solid ' + color : '1px solid var(--border)') + ';background:' + (isCurrent ? color + '08' : 'transparent') + ';position:relative;">' +
        (isCurrent ? '<div style="position:absolute;top:-1px;right:16px;background:' + color + ';color:#fff;font-size:9px;padding:2px 10px;border-radius:0 0 6px 6px;font-weight:600;">ปัจจุบัน</div>' : '') +
        '<div class="font-700 mb-6" style="font-size:18px;">' + planName + '</div>' +
        '<div class="font-700 mono" style="font-size:28px;color:' + (price > 0 ? color : 'var(--text)') + ';">' + (price > 0 ? '฿' + _fmt(price) : 'ฟรี') + '</div>' +
        '<div class="text-xs text-muted mb-2">/เดือน</div>' +
        '<div class="divider mb-12 mt-12"></div>' +
        '<div class="flex-col gap-6 text-sm">' +
          '<div><i class="fa-solid fa-coins" style="width:16px;color:' + color + ';"></i> ' + Number(tokens).toLocaleString('th-TH') + ' tokens/เดือน</div>' +
          (bonus > 0 ? '<div><i class="fa-solid fa-gift" style="width:16px;color:' + color + ';"></i> +' + Number(bonus).toLocaleString('th-TH') + ' bonus tokens</div>' : '<div><i class="fa-solid fa-gift" style="width:16px;opacity:0.3;"></i> <span class="text-muted">ไม่มี bonus</span></div>') +
        '</div>' +
        '<div class="mt-16">' +
          (isCurrent
            ? '<div class="text-center text-sm text-muted">แพ็กเกจปัจจุบัน</div>'
            : '<button class="btn ' + (price > sub.price ? 'btn-primary' : 'btn-outline') + ' btn-sm w-full" style="text-align:center;" disabled>' + (price > sub.price ? '<i class="fa-solid fa-arrow-up"></i> อัปเกรด' : price < sub.price ? '<i class="fa-solid fa-arrow-down"></i> ดาวน์เกรด' : 'เปลี่ยน') + '</button>'
          ) +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
    return html;
  }

  return { render: render };
})();
