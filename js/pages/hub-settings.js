/* ================================================================
   Hub Settings — ตั้งค่า Tenant
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubSettings = (function () {
  'use strict';

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;
    var tenant = (d.tenants || []).find(function (t) { return t.id === tid; });
    return { tenant: tenant };
  }

  function render() {
    var data = _getData();
    if (!data || !data.tenant) {
      return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';
    }
    var t = data.tenant;

    return '<div style="max-width:720px;margin:0 auto;">' +
      '<div class="text-xs uppercase text-muted font-600 mb-12"><i class="fa-solid fa-building"></i> ข้อมูลบริษัท</div>' +
      '<div class="card" style="padding:24px;margin-bottom:20px;">' +
        '<div class="flex-col gap-14">' +
          '<div class="form-group" style="margin-bottom:0;">' +
            '<label class="form-label">ชื่อบริษัท</label>' +
            '<input class="form-input" value="' + t.name + '" id="setting-name">' +
          '</div>' +
          '<div class="flex gap-12">' +
            '<div style="flex:1;" class="form-group" style="margin-bottom:0;">' +
              '<label class="form-label">Email</label>' +
              '<input class="form-input" value="' + t.email + '" id="setting-email">' +
            '</div>' +
            '<div style="flex:1;" class="form-group" style="margin-bottom:0;">' +
              '<label class="form-label">โทรศัพท์</label>' +
              '<input class="form-input" value="' + t.phone + '" id="setting-phone">' +
            '</div>' +
          '</div>' +
          '<div class="flex gap-12">' +
            '<div style="flex:1;">' +
              '<label class="form-label">แพ็กเกจ</label>' +
              '<div class="form-input" style="background:var(--surface2);cursor:not-allowed;">' + t.plan + ' (฿' + Number(t.planPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 }) + '/เดือน)</div>' +
            '</div>' +
            '<div style="flex:1;">' +
              '<label class="form-label">สถานะ</label>' +
              '<div class="form-input" style="background:var(--surface2);cursor:not-allowed;">' + t.status + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:16px;text-align:right;">' +
          '<button class="btn btn-primary" id="setting-save"><i class="fa-solid fa-save"></i> บันทึก</button>' +
        '</div>' +
      '</div>' +

      '<div class="text-xs uppercase text-muted font-600 mb-12"><i class="fa-solid fa-bell"></i> การแจ้งเตือน</div>' +
      '<div class="card" style="padding:24px;">' +
        '<div class="flex-col gap-12">' +
          '<label class="flex items-center gap-10" style="cursor:pointer;">' +
            '<input type="checkbox" checked> <span class="text-sm">แจ้งเตือนเมื่อ Invoice ใหม่</span>' +
          '</label>' +
          '<label class="flex items-center gap-10" style="cursor:pointer;">' +
            '<input type="checkbox" checked> <span class="text-sm">แจ้งเตือนเมื่อ Token เหลือน้อย</span>' +
          '</label>' +
          '<label class="flex items-center gap-10" style="cursor:pointer;">' +
            '<input type="checkbox"> <span class="text-sm">สรุปการใช้งานรายสัปดาห์ทาง Email</span>' +
          '</label>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function init() {
    var saveBtn = document.getElementById('setting-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (window.App) App.toast('บันทึกการตั้งค่าสำเร็จ', 'success');
      });
    }
  }

  return { render: render, init: init };
})();
