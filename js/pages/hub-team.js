/* ================================================================
   Hub Team — จัดการสมาชิกใน Tenant
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubTeam = (function () {
  'use strict';

  var _roleLabels = {
    tenant_admin: 'Tenant Admin',
    subplatform_admin: 'SP Admin',
    subplatform_member: 'Member',
  };
  var _roleChips = {
    tenant_admin: 'chip-blue',
    subplatform_admin: 'chip-green',
    subplatform_member: 'chip-gray',
  };

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;

    var memberships = (d.userMemberships || []).filter(function (m) {
      return m.tenantId === tid && m.status === 'Active';
    });
    var users = d.users || [];
    var customRoles = d.customRoles || [];

    var members = memberships.map(function (mb) {
      var user = users.find(function (u) { return u.id === mb.userId; });
      var cr = mb.customRoleId ? customRoles.find(function (r) { return r.id === mb.customRoleId; }) : null;
      return {
        membership: mb,
        user: user,
        customRole: cr,
      };
    }).filter(function (m) { return m.user; });

    return { members: members };
  }

  function render() {
    var data = _getData();
    if (!data) return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';

    var rows = data.members.map(function (m) {
      var u = m.user;
      var mb = m.membership;
      var role = _roleLabels[mb.role] || mb.role;
      var chipCls = _roleChips[mb.role] || 'chip-gray';
      var crBadge = m.customRole ? ' <span class="chip chip-blue" style="font-size:9px;">' + m.customRole.name + '</span>' : '';

      return '<tr>' +
        '<td>' +
          '<div class="flex items-center gap-10">' +
            '<div class="user-avatar" style="width:32px;height:32px;font-size:12px;">' + u.initials + '</div>' +
            '<div>' +
              '<div class="font-600 text-sm">' + u.name + '</div>' +
              '<div class="mono text-xs text-muted">' + u.email + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><span class="chip ' + chipCls + '" style="font-size:10px;">' + role + '</span>' + crBadge + '</td>' +
        '<td class="text-sm">' + (u.status || '—') + '</td>' +
        '<td class="text-sm text-muted">' + (u.lastLogin || '—') + '</td>' +
      '</tr>';
    }).join('');

    if (!rows) rows = '<tr><td colspan="4" class="text-center text-muted" style="padding:24px;">ยังไม่มีสมาชิก</td></tr>';

    return '<div style="max-width:1000px;margin:0 auto;">' +
      '<div class="flex items-center justify-between mb-16">' +
        '<div class="font-600"><i class="fa-solid fa-users-gear text-muted"></i> สมาชิกทั้งหมด (' + data.members.length + ')</div>' +
      '</div>' +
      '<div class="card" style="padding:0;">' +
        '<div style="overflow-x:auto;">' +
          '<table class="data-table"><thead><tr><th>สมาชิก</th><th>Role</th><th>สถานะ</th><th>เข้าใช้ล่าสุด</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  return { render: render };
})();
