/* ================================================================
   Page Module — Platform Members
   Multi-Tenant RBAC with Custom Roles
   ================================================================ */

window.Pages = window.Pages || {};

window.Pages.platformMembers = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = this.render();
    this.init();
  },

  // ─── Role meta ───
  _roleMeta: {
    super_admin:       { label: 'Owner',           chip: 'chip-orange', icon: 'fa-crown' },
    bo_admin:          { label: 'BO Admin',        chip: 'chip-purple', icon: 'fa-shield-halved' },
    bo_member:         { label: 'BO Staff',        chip: 'chip-gray',   icon: 'fa-user-shield' },
    tenant_admin:      { label: 'Tenant Admin',    chip: 'chip-blue',   icon: 'fa-building' },
    subplatform_admin: { label: 'SP Admin',        chip: 'chip-green',  icon: 'fa-cubes' },
    subplatform_member:{ label: 'Member',          chip: 'chip-gray',   icon: 'fa-user' },
  },

  _roleChip(role) {
    const m = this._roleMeta[role] || { label: role, chip: 'chip-gray', icon: 'fa-user' };
    return `<span class="chip ${m.chip}"><i class="fa-solid ${m.icon}"></i> ${m.label}</span>`;
  },

  // ─── Role hierarchy rank (higher = more privileged) ───
  _roleRank: { super_admin: 6, bo_admin: 5, bo_member: 4, tenant_admin: 3, subplatform_admin: 2, subplatform_member: 1 },

  // ─── Roles visible to each role level ───
  _visibleRoles: {
    super_admin:       ['super_admin', 'bo_admin', 'bo_member', 'tenant_admin', 'subplatform_admin', 'subplatform_member'],
    bo_admin:          ['bo_admin', 'bo_member', 'tenant_admin', 'subplatform_admin', 'subplatform_member'],
    bo_member:         ['bo_member', 'tenant_admin', 'subplatform_admin', 'subplatform_member'],
    tenant_admin:      ['tenant_admin', 'subplatform_admin', 'subplatform_member'],
    subplatform_admin: ['subplatform_admin', 'subplatform_member'],
    subplatform_member: ['subplatform_member'],
  },

  // ─── Build member list — grouped by user, with all memberships ───
  _getMembers() {
    const d = window.MockData;
    const users = d.users || [];
    const memberships = d.userMemberships || [];
    const customRoles = d.customRoles || [];
    const tenants = d.tenants || [];
    const subPlatforms = d.subPlatforms || [];

    const ctx = window.Auth ? Auth.activeContext() : null;
    const currentRole = ctx ? ctx.role : null;
    const allowedRoles = this._visibleRoles[currentRole] || [];

    // Collect visible memberships
    const visibleMbs = memberships.filter(mb => {
      const user = users.find(u => u.id === mb.userId);
      if (!user) return false;
      if (currentRole && allowedRoles.indexOf(mb.role) === -1) return false;
      if (currentRole === 'tenant_admin') {
        if (mb.role !== 'super_admin' && mb.tenantId && mb.tenantId !== ctx.tenantId) return false;
      } else if (currentRole === 'subplatform_admin') {
        if (mb.tenantId && mb.tenantId !== ctx.tenantId) return false;
        if (mb.subPlatformId && mb.subPlatformId !== ctx.subPlatformId) return false;
      } else if (currentRole === 'subplatform_member') {
        const currentUserId = window.Auth && Auth.currentUser() ? Auth.currentUser().id : null;
        if (mb.userId !== currentUserId) return false;
      }
      return true;
    });

    // Group by userId
    const grouped = {};
    visibleMbs.forEach(mb => {
      if (!grouped[mb.userId]) grouped[mb.userId] = [];
      const tenant = mb.tenantId ? tenants.find(t => t.id === mb.tenantId) : null;
      const sp = mb.subPlatformId ? subPlatforms.find(s => s.id === mb.subPlatformId) : null;
      const cr = mb.customRoleId ? customRoles.find(r => r.id === mb.customRoleId) : null;
      grouped[mb.userId].push({
        ...mb,
        tenantName: tenant ? tenant.name : null,
        subPlatformName: sp ? sp.name : null,
        customRoleName: cr ? cr.name : null,
      });
    });

    return Object.keys(grouped).map(userId => {
      const user = users.find(u => u.id === userId);
      if (!user) return null;
      const mbs = grouped[userId];
      // Highest role for this user
      const self = this;
      const highestRole = mbs.reduce((best, mb) => (self._roleRank[mb.role] || 0) > (self._roleRank[best] || 0) ? mb.role : best, mbs[0].role);
      // Collect unique tenants, SPs, roles, custom roles
      const tenantIds = [...new Set(mbs.map(m => m.tenantId).filter(Boolean))];
      const spIds = [...new Set(mbs.map(m => m.subPlatformId).filter(Boolean))];
      const roles = [...new Set(mbs.map(m => m.role))];
      const crNames = [...new Set(mbs.map(m => m.customRoleName).filter(Boolean))];
      const hasActive = mbs.some(m => m.status === 'Active');
      const hasSuspended = mbs.some(m => m.status === 'Suspended');
      const hasInvited = mbs.some(m => m.status === 'Invited');

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        lastLogin: user.lastLogin,
        memberships: mbs,
        highestRole,
        roles,
        crNames,
        tenantIds,
        tenantNames: tenantIds.map(id => (tenants.find(t => t.id === id) || {}).name || id),
        spIds,
        spNames: spIds.map(id => (subPlatforms.find(s => s.id === id) || {}).name || id),
        status: hasSuspended ? 'Suspended' : hasInvited && !hasActive ? 'Invited' : 'Active',
        hasActive, hasSuspended, hasInvited,
      };
    }).filter(Boolean);
  },

  // ─── Render ───
  render() {
    const d = window.MockData;
    const self = window.Pages.platformMembers;
    const members = self._getMembers();

    const total     = members.length;
    const active    = members.filter(m => m.status === 'Active').length;
    const suspended = members.filter(m => m.status === 'Suspended').length;
    const invited   = members.filter(m => m.status === 'Invited').length;

    const canManage = !window.Auth || Auth.hasPermission('canManageMembers');
    const ctx = window.Auth ? Auth.activeContext() : null;
    const currentRole = ctx ? ctx.role : null;
    const isSuperAdmin = currentRole === 'super_admin';

    // Build role filter options based on what current user can see
    const visibleRoles = self._visibleRoles[currentRole] || ['super_admin', 'tenant_admin', 'subplatform_admin', 'subplatform_member'];
    const roleFilterOptions = [
      { value: 'super_admin', label: 'Owner' },
      { value: 'bo_admin', label: 'BO Admin' },
      { value: 'bo_member', label: 'BO Staff' },
      { value: 'tenant_admin', label: 'Tenant Admin' },
      { value: 'subplatform_admin', label: 'SP Admin' },
      { value: 'subplatform_member', label: 'Member' },
    ].filter(r => visibleRoles.indexOf(r.value) !== -1)
     .map(r => `<option value="${r.value}">${r.label}</option>`).join('');

    return `
      <div class="page-header">
        <h1 class="heading">PLATFORM MEMBERS</h1>
        <div class="page-header-actions">
          ${canManage ? `<button class="btn btn-primary btn-sm" id="btn-invite-member">
            <i class="fa-solid fa-user-plus"></i> เชิญสมาชิก
          </button>` : ''}
        </div>
      </div>

      <!-- Inline Summary -->
      <div class="flex items-center gap-16 mb-16">
        <span class="text-sm">ทั้งหมด <strong>${total}</strong></span>
        <span class="text-sm" style="color:var(--success);">Active <strong>${active}</strong></span>
        ${suspended > 0 ? `<span class="text-sm" style="color:var(--error);">Suspended <strong>${suspended}</strong></span>` : ''}
        ${invited > 0 ? `<span class="text-sm" style="color:#3b82f6;">Invited <strong>${invited}</strong></span>` : ''}
      </div>

      <!-- Tabs -->
      ${(() => {
        const boRoles = ['super_admin', 'bo_admin', 'bo_member'];
        const boMembers = members.filter(m => m.roles.some(r => boRoles.includes(r)));
        const pfMembers = members.filter(m => !m.roles.some(r => boRoles.includes(r)));
        return `
      <div class="tab-bar mb-16">
        <div class="tab-item active" data-tab="backoffice"><i class="fa-solid fa-shield-halved"></i> Backoffice <span class="text-xs text-muted">(${boMembers.length})</span></div>
        <div class="tab-item" data-tab="platform"><i class="fa-solid fa-layer-group"></i> Sub-Platform <span class="text-xs text-muted">(${pfMembers.length})</span></div>
        <div class="tab-item" data-tab="audit-log"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติ <span class="text-xs text-muted">(${(d.memberAuditLog || []).length})</span></div>
      </div>

      <!-- Tab: Backoffice -->
      <div id="pm-tab-backoffice">
        <div class="flex items-center justify-between mb-12">
          <div class="text-sm text-muted">สมาชิกระดับ Backoffice — Owner และ Admin ที่จัดการทั้งระบบ</div>
          <button class="btn btn-outline btn-sm btn-view-roles" data-scope="global"><i class="fa-solid fa-table-cells"></i> Custom Roles (Backoffice)</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>สมาชิก</th><th>Role</th><th>สถานะ</th><th>Login ล่าสุด</th><th>แก้ไขล่าสุด</th>${canManage ? '<th>จัดการ</th>' : ''}</tr></thead>
            <tbody>
              ${boMembers.length === 0 ? '<tr><td colspan="' + (canManage ? 6 : 5) + '" class="text-center text-muted p-20">ไม่มีสมาชิก Backoffice</td></tr>' : boMembers.map(m => {
                const currentUserEmail = window.Auth && Auth.currentUser() ? Auth.currentUser().email : '';
                const myRank = self._roleRank[currentRole] || 0;
                const theirRank = self._roleRank[m.highestRole] || 0;
                const canEditThis = canManage && myRank > theirRank;
                return '<tr data-user-id="' + m.userId + '" data-roles="' + m.roles.join(',') + '" data-status="' + m.status + '" data-search="' + (m.name + ' ' + m.email).toLowerCase() + '">' +
                  '<td><div class="flex items-center gap-10"><div class="user-avatar" style="width:32px;height:32px;font-size:11px;">' + m.initials + '</div><div><div class="font-600 member-detail-link" data-user-id="' + m.userId + '" style="cursor:pointer;color:var(--primary);">' + m.name + (m.email === currentUserEmail ? ' <span class="chip chip-blue" style="font-size:9px;">คุณ</span>' : '') + '</div><div class="text-xs text-muted mono">' + m.email + '</div></div></div></td>' +
                  '<td class="text-sm">' + (self._roleMeta[m.highestRole]?.label || m.highestRole) + '</td>' +
                  '<td>' + d.statusChip(m.status) + '</td>' +
                  '<td class="text-sm text-muted mono" style="white-space:nowrap;">' + (m.lastLogin || '—') + '</td>' +
                  '<td style="white-space:nowrap;">' + (() => { const log = (d.memberAuditLog || []).find(e => e.userId === m.userId); if (!log) return '<span class="text-xs text-muted">—</span>'; return '<div class="text-xs text-muted mono">' + log.actionDate + '</div><div class="text-xs text-dim">' + (log.actionBy ? log.actionBy.split('@')[0] : '') + '</div>'; })() + '</td>' +
                  (canManage ? '<td><div class="flex gap-4"><button class="btn btn-sm btn-outline member-detail-link" data-user-id="' + m.userId + '" title="จัดการ"><i class="fa-solid fa-pen"></i></button>' + (canEditThis ? '<button class="btn btn-sm btn-outline member-remove-user" data-user-id="' + m.userId + '" title="ลบ" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button>' : '') + '</div></td>' : '') +
                '</tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
      })()}

      <!-- Tab: Platform -->
      <div id="pm-tab-platform" class="hidden">
        <div class="flex items-center justify-between mb-12">
          <div class="text-sm text-muted">สมาชิกระดับ Tenant และ Sub-Platform</div>
          <button class="btn btn-outline btn-sm btn-view-roles" data-scope="platform"><i class="fa-solid fa-table-cells"></i> Custom Roles (Platform)</button>
        </div>
        <!-- Filter Bar -->
        ${(() => {
          const allTenantNames = [...new Set(members.flatMap(m => m.tenantNames))].sort();
          const allSpNames = [...new Set(members.flatMap(m => m.spNames))].sort();
          const allCrNames = [...new Set(members.flatMap(m => m.crNames))].sort();
          return `
        <div class="flex items-center gap-8 mb-12" style="flex-wrap:wrap;">
          <div class="search-bar flex-1" style="min-width:160px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="member-search" placeholder="ค้นหาชื่อ / email...">
          </div>
          <select id="member-filter-role" class="form-input" style="width:auto;min-width:120px;">
            <option value="">ทุก Role</option>
            ${roleFilterOptions}
          </select>
          <select id="member-filter-tenant" class="form-input" style="width:auto;min-width:130px;">
            <option value="">ทุก Tenant</option>
            ${allTenantNames.map(t => '<option value="' + t + '">' + t + '</option>').join('')}
          </select>
          <select id="member-filter-sp" class="form-input" style="width:auto;min-width:130px;">
            <option value="">ทุก Sub-Platform</option>
            ${allSpNames.map(s => '<option value="' + s + '">' + s + '</option>').join('')}
          </select>
          <select id="member-filter-cr" class="form-input" style="width:auto;min-width:120px;">
            <option value="">ทุก Custom Role</option>
            ${allCrNames.map(c => '<option value="' + c + '">' + c + '</option>').join('')}
          </select>
          <select id="member-filter-status" class="form-input" style="width:auto;min-width:100px;">
            <option value="">ทุกสถานะ</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Invited">Invited</option>
          </select>
        </div>`;
        })()}

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>Roles</th>
                <th>Sub-Platforms</th>
                <th>สถานะ</th>
                <th>Login ล่าสุด</th>
                <th>แก้ไขล่าสุด</th>
                ${canManage ? '<th>จัดการ</th>' : ''}
              </tr>
            </thead>
            <tbody id="member-table-body">
              ${members.filter(m => !m.roles.some(r => ['super_admin','bo_admin','bo_member'].includes(r))).map(m => {
                const currentUserEmail = window.Auth && Auth.currentUser() ? Auth.currentUser().email : '';
                const myRank = self._roleRank[currentRole] || 0;
                const theirRank = self._roleRank[m.highestRole] || 0;
                const canEditThis = canManage && myRank > theirRank;
                const hasMulti = m.memberships.length > 1;
                const uid = m.userId;

                // Expandable sub-rows — all memberships detail
                const subRows = m.memberships.map((mb, idx) => {
                  const isLast = idx === m.memberships.length - 1;
                  const branch = isLast ? '└' : '├';
                  const tenant = mb.tenantName || '—';
                  const sp = mb.subPlatformName && mb.subPlatformName !== '-' ? mb.subPlatformName : '';
                  const cr = mb.customRoleName || '';
                  return `
                  <tr class="member-sub-row member-sub-${uid}" style="display:none;">
                    <td style="padding-left:70px;" colspan="${canManage ? 6 : 5}">
                      <div class="flex items-center gap-12" style="flex-wrap:wrap;">
                        <span class="text-muted mono" style="font-size:12px;">${branch}</span>
                        <span class="text-xs"><span class="text-dim">Role:</span> <strong>${self._roleMeta[mb.role]?.label || mb.role}</strong></span>
                        <span class="text-xs"><span class="text-dim">Tenant:</span> ${tenant}</span>
                        ${sp ? '<span class="text-xs"><span class="text-dim">SP:</span> ' + sp + '</span>' : ''}
                        ${cr ? '<span class="text-xs"><span class="text-dim">สิทธิ์:</span> ' + cr + '</span>' : ''}
                        ${d.statusChip(mb.status)}
                      </div>
                    </td>
                    ${canManage ? '<td></td>' : ''}
                  </tr>`;
                }).join('');

                return `
                  <tr data-user-id="${uid}" data-roles="${m.roles.join(',')}" data-status="${m.status}" data-tenants="${m.tenantNames.join(',').toLowerCase()}" data-sps="${m.spNames.join(',').toLowerCase()}" data-crs="${m.crNames.join(',').toLowerCase()}" data-search="${(m.name + ' ' + m.email).toLowerCase()}">
                    <td>
                      <div class="flex items-center gap-10">
                        <button class="btn btn-sm btn-outline member-expand-btn" data-uid="${uid}" style="padding:2px 5px;min-width:auto;"><i class="fa-solid fa-chevron-right" style="font-size:10px;transition:transform 0.15s;"></i></button>
                        <div class="user-avatar" style="width:32px;height:32px;font-size:11px;">${m.initials}</div>
                        <div>
                          <div class="font-600 member-detail-link" data-user-id="${uid}" style="cursor:pointer;color:var(--primary);">${m.name}${m.email === currentUserEmail ? ' <span class="chip chip-blue" style="font-size:9px;">คุณ</span>' : ''}${hasMulti ? ' <span class="text-xs text-muted ml-4">[' + m.memberships.length + ']</span>' : ''}</div>
                          <div class="text-xs text-muted mono">${m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-sm mono">${m.roles.length} <span class="text-xs text-muted">Role${m.roles.length > 1 ? 's' : ''}</span></td>
                    <td class="text-sm mono">${m.spNames.length} <span class="text-xs text-muted">SP${m.spNames.length > 1 ? 's' : ''}</span></td>
                    <td>${d.statusChip(m.status)}</td>
                    <td class="text-sm text-muted mono" style="white-space:nowrap;">${m.lastLogin || '—'}</td>
                    <td style="white-space:nowrap;">${(() => {
                      const log = (d.memberAuditLog || []).find(e => e.userId === uid);
                      if (!log) return '<span class="text-xs text-muted">—</span>';
                      return '<div class="text-xs text-muted mono">' + log.actionDate + '</div><div class="text-xs text-dim">' + (log.actionBy ? log.actionBy.split('@')[0] : '') + '</div>';
                    })()}</td>
                    ${canManage ? `<td style="white-space:nowrap;">
                      <div class="flex gap-4">
                        <button class="btn btn-sm btn-outline member-detail-link" data-user-id="${uid}" title="จัดการ"><i class="fa-solid fa-pen"></i></button>
                        ${canEditThis && m.hasActive ? `<button class="btn btn-sm btn-outline member-suspend-user" data-user-id="${uid}" title="ระงับ"><i class="fa-solid fa-ban"></i></button>` : ''}
                        ${canEditThis && m.hasSuspended && !m.hasActive ? `<button class="btn btn-sm btn-outline member-reactivate-user" data-user-id="${uid}" title="เปิดใช้งาน" style="color:var(--success);"><i class="fa-solid fa-rotate-right"></i></button>` : ''}
                        ${canEditThis ? `<button class="btn btn-sm btn-outline member-remove-user" data-user-id="${uid}" title="ลบ" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button>` : ''}
                      </div>
                    </td>` : ''}
                  </tr>${subRows}`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Audit Log -->
      <div id="pm-tab-audit-log" class="hidden">
        ${(() => {
          const log = (d.memberAuditLog || []).slice(0, 30);
          if (log.length === 0) return '<div class="text-sm text-muted p-20 text-center">ยังไม่มีประวัติ</div>';
          return '<div class="table-wrap"><table><thead><tr><th>สมาชิก</th><th>Email</th><th>การดำเนินการ</th><th>รายละเอียด</th><th>โดย</th><th>วันที่</th></tr></thead><tbody>' +
            log.map(e => {
              const chipMap = { Invited: 'chip-blue', Edited: 'chip-gray', Suspended: 'chip-orange', Reactivated: 'chip-green', Removed: 'chip-red' };
              return '<tr>' +
                '<td class="font-600 text-sm">' + e.userName + '</td>' +
                '<td class="mono text-sm text-muted">' + (e.userEmail || '-') + '</td>' +
                '<td><span class="chip ' + (chipMap[e.action] || 'chip-gray') + '">' + e.action + '</span></td>' +
                '<td class="text-sm">' + (e.detail || '-') + '</td>' +
                '<td class="text-sm text-muted">' + (e.actionBy ? e.actionBy.split('@')[0] : '-') + '</td>' +
                '<td class="text-sm text-muted mono" style="white-space:nowrap;">' + e.actionDate + ' ' + (e.actionTime || '') + '</td>' +
              '</tr>';
            }).join('') +
            '</tbody></table></div>';
        })()}
      </div>
    `;
  },

  // ─── Init ───
  init() {
    const self = this;
    const d = window.MockData;

    // ─── Filter logic ───
    const searchInput  = document.getElementById('member-search');
    const roleFilter   = document.getElementById('member-filter-role');
    const tenantFilter = document.getElementById('member-filter-tenant');
    const spFilter     = document.getElementById('member-filter-sp');
    const crFilter     = document.getElementById('member-filter-cr');
    const statusFilter = document.getElementById('member-filter-status');

    function applyFilters() {
      const q      = (searchInput?.value || '').toLowerCase();
      const role   = roleFilter?.value || '';
      const tenant = (tenantFilter?.value || '').toLowerCase();
      const sp     = (spFilter?.value || '').toLowerCase();
      const cr     = (crFilter?.value || '').toLowerCase();
      const status = statusFilter?.value || '';
      document.querySelectorAll('#member-table-body tr').forEach(tr => {
        const matchSearch = !q      || (tr.dataset.search || '').includes(q);
        const matchRole   = !role   || (tr.dataset.roles || '').includes(role);
        const matchTenant = !tenant || (tr.dataset.tenants || '').includes(tenant);
        const matchSp     = !sp     || (tr.dataset.sps || '').includes(sp);
        const matchCr     = !cr     || (tr.dataset.crs || '').includes(cr);
        const matchStatus = !status || tr.dataset.status === status;
        tr.style.display = (matchSearch && matchRole && matchTenant && matchSp && matchCr && matchStatus) ? '' : 'none';
      });
    }

    // ─── Tab switching ───
    document.querySelectorAll('.tab-bar .tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-bar .tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.dataset.tab;
        ['backoffice', 'platform', 'audit-log'].forEach(k => {
          const el = document.getElementById('pm-tab-' + k);
          if (el) el.classList.toggle('hidden', key !== k);
        });
      });
    });

    [searchInput, roleFilter, tenantFilter, spFilter, crFilter, statusFilter].forEach(el => {
      if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', applyFilters);
    });

    // ─── View Custom Roles (scoped) ───
    document.querySelectorAll('.btn-view-roles').forEach(btn => {
      btn.addEventListener('click', () => {
        self._showCustomRolesModal(btn.dataset.scope);
      });
    });

    // ─── Invite Member ───
    document.getElementById('btn-invite-member')?.addEventListener('click', () => {
      self._showInviteModal();
    });

    // ─── Expand/Collapse sub-rows ───
    document.querySelectorAll('.member-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const icon = btn.querySelector('i');
        const rows = document.querySelectorAll('.member-sub-' + uid);
        const isOpen = rows[0]?.style.display !== 'none';
        rows.forEach(r => { r.style.display = isOpen ? 'none' : ''; });
        if (icon) icon.style.transform = isOpen ? '' : 'rotate(90deg)';
      });
    });

    // ─── Member Detail ───
    document.querySelectorAll('.member-detail-link').forEach(el => {
      el.addEventListener('click', () => self._showMemberDetailModal(el.dataset.userId));
    });

    // ─── Suspend all memberships for user ───
    document.querySelectorAll('.member-suspend-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const mbs = (d.userMemberships || []).filter(x => x.userId === userId && x.status === 'Active');
        if (!mbs.length) return;
        // Use first membership to open suspend modal — will suspend all
        self._showSuspendAllModal(userId);
      });
    });

    // ─── Reactivate all memberships for user ───
    document.querySelectorAll('.member-reactivate-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const user = (d.users || []).find(u => u.id === userId);
        const mbs = (d.userMemberships || []).filter(x => x.userId === userId && x.status === 'Suspended');
        mbs.forEach(mb => { mb.status = 'Active'; });
        self._pushAuditLog(userId, user ? user.name : '', user ? user.email : '', 'Reactivated', 'เปิดใช้งานทุก membership (' + mbs.length + ' รายการ)');
        App.toast('เปิดใช้งาน ' + (user ? user.name : '') + ' สำเร็จ', 'success');
        self._rerender();
      });
    });

    // ─── Remove all memberships for user ───
    document.querySelectorAll('.member-remove-user').forEach(btn => {
      btn.addEventListener('click', () => {
        self._showRemoveAllModal(btn.dataset.userId);
      });
    });

  },

  // ─── Determine what roles current user can assign ───
  _getAssignableRoles() {
    const ctx = window.Auth ? Auth.activeContext() : null;
    if (!ctx) return [];
    switch (ctx.role) {
      case 'super_admin':       return ['tenant_admin'];
      case 'tenant_admin':      return ['subplatform_admin'];
      case 'subplatform_admin': return ['subplatform_member'];
      default: return [];
    }
  },

  // ─── Get custom roles available for a target level ───
  _getCustomRolesForLevel(targetLevel) {
    const d = window.MockData;
    const ctx = window.Auth ? Auth.activeContext() : null;
    return (d.customRoles || []).filter(cr => {
      if (cr.targetLevel !== targetLevel) return false;
      if (cr.scopeType === 'global') return true;
      if (cr.scopeType === 'tenant' && ctx && cr.scopeId === ctx.tenantId) return true;
      if (cr.scopeType === 'subplatform' && ctx && cr.scopeId === ctx.subPlatformId) return true;
      return false;
    });
  },

  // ─── Invite Modal (existingUser = optional, for adding membership to existing user) ───
  _showInviteModal(existingUser) {
    const self = this;
    const d = window.MockData;
    const ctx = window.Auth ? Auth.activeContext() : null;
    const assignableRoles = self._getAssignableRoles();

    if (assignableRoles.length === 0) {
      App.toast('คุณไม่มีสิทธิ์เชิญสมาชิก', 'error');
      return;
    }

    const targetRole = assignableRoles[0]; // default to first assignable
    const customRoles = self._getCustomRolesForLevel(targetRole);

    // Build scope options
    let scopeHtml = '';
    if (targetRole === 'tenant_admin') {
      // Super admin picks tenant
      const tenants = d.tenants || [];
      scopeHtml = `<div class="form-group">
        <label class="form-label">Tenant</label>
        <select class="form-input" id="invite-tenant">
          ${tenants.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
        </select>
      </div>`;
    } else if (targetRole === 'subplatform_admin' || targetRole === 'subplatform_member') {
      // Pick sub-platform within current tenant
      const sps = window.Auth ? Auth.getVisibleSubPlatforms() : [];
      scopeHtml = `<div class="form-group">
        <label class="form-label">Sub-Platform</label>
        <select class="form-input" id="invite-sp">
          ${sps.map(sp => `<option value="${sp.id}">${sp.name}</option>`).join('')}
        </select>
      </div>`;
    }

    App.showModal(
      `<div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-user-plus text-primary"></i> ${existingUser ? 'เพิ่ม Membership — ' + existingUser.name : 'เชิญสมาชิกใหม่'}</div>
        <div class="flex-col gap-14 mt-16">
          ${existingUser ? `
          <div class="flex items-center gap-10 p-10" style="background:var(--surface2);border-radius:8px;">
            <div class="user-avatar" style="width:32px;height:32px;font-size:11px;">${existingUser.initials}</div>
            <div><div class="font-600 text-sm">${existingUser.name}</div><div class="text-xs text-muted mono">${existingUser.email}</div></div>
          </div>
          <input type="hidden" id="invite-name" value="${existingUser.name}">
          <input type="hidden" id="invite-email" value="${existingUser.email}">
          ` : `
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input class="form-input" id="invite-name" placeholder="ชื่อ-นามสกุล">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="invite-email" placeholder="email@company.com">
          </div>`}
          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input" id="invite-role">
              ${assignableRoles.map(r => {
                const m = self._roleMeta[r] || {};
                return `<option value="${r}">${m.label || r}</option>`;
              }).join('')}
            </select>
          </div>
          ${scopeHtml}
          <div class="form-group">
            <label class="form-label">Custom Role (สิทธิ์)</label>
            <select class="form-input" id="invite-custom-role">
              <option value="">(ใช้สิทธิ์พื้นฐานของ Role)</option>
              ${customRoles.map(cr => `<option value="${cr.id}">${cr.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-primary" id="invite-save-btn"><i class="fa-solid fa-paper-plane"></i> ส่งคำเชิญ</button>
        </div>
      </div>`
    );

    setTimeout(() => {
      document.getElementById('invite-save-btn')?.addEventListener('click', () => {
        const name  = document.getElementById('invite-name').value.trim();
        const email = document.getElementById('invite-email').value.trim();
        const role  = document.getElementById('invite-role').value;
        const customRoleId = document.getElementById('invite-custom-role').value || null;

        if (!name)  { document.getElementById('invite-name').classList.add('is-invalid'); return; }
        if (!email) { document.getElementById('invite-email').classList.add('is-invalid'); return; }

        // Determine scope
        let tenantId = ctx ? ctx.tenantId : null;
        let subPlatformId = ctx ? ctx.subPlatformId : null;

        if (role === 'tenant_admin') {
          const tenantSelect = document.getElementById('invite-tenant');
          tenantId = tenantSelect ? tenantSelect.value : null;
          subPlatformId = null;
        } else if (role === 'subplatform_admin' || role === 'subplatform_member') {
          const spSelect = document.getElementById('invite-sp');
          subPlatformId = spSelect ? spSelect.value : subPlatformId;
        }

        // Check if user already exists
        let user = d.users.find(u => u.email === email);
        if (!user) {
          // Create new user
          const parts = name.split(' ');
          const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
          const newId = 'USR-' + String(d.users.length + 1).padStart(3, '0');
          user = {
            id: newId, email, password: null, name, initials,
            avatar: null, status: 'Invited', lastLogin: null,
            createdDate: new Date().toISOString().slice(0, 10),
          };
          d.users.push(user);
        }

        // Create membership
        const mbId = 'MB-' + String(d.userMemberships.length + 1).padStart(3, '0');
        const currentUserId = window.Auth && Auth.currentUser() ? Auth.currentUser().id : null;
        d.userMemberships.push({
          id: mbId, userId: user.id, role,
          tenantId, subPlatformId, customRoleId,
          status: 'Invited',
          invitedBy: currentUserId,
          createdDate: new Date().toISOString().slice(0, 10),
        });

        const roleMeta = self._roleMeta[role] || {};
        const tenantObj = tenantId ? (d.tenants || []).find(t => t.id === tenantId) : null;
        const spObj = subPlatformId ? (d.subPlatforms || []).find(s => s.id === subPlatformId) : null;
        let invDetail = 'เชิญเป็น ' + (roleMeta.label || role);
        if (tenantObj) invDetail += ' ของ ' + tenantObj.name;
        if (spObj) invDetail += ' / ' + spObj.name;
        self._pushAuditLog(user.id, name, email, 'Invited', invDetail);
        App.closeModal();
        App.toast('ส่งคำเชิญไปยัง ' + email + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },


  // ─── Audit Log Helper ───
  _pushAuditLog(userId, userName, userEmail, action, detail) {
    const d = window.MockData;
    d.memberAuditLog = d.memberAuditLog || [];
    const now = new Date();
    d.memberAuditLog.unshift({
      id: 'MAL-' + Date.now(), userId, userName, userEmail, action, detail,
      actionBy: (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system',
      actionDate: now.toISOString().slice(0, 10),
      actionTime: now.toTimeString().slice(0, 5),
    });
  },

  // ─── Member Detail + Edit Modal (unified) ───
  _showMemberDetailModal(userId) {
    const self = this;
    const d = window.MockData;
    const user = (d.users || []).find(u => u.id === userId);
    if (!user) return;

    const ctx = window.Auth ? Auth.activeContext() : null;
    const currentRole = ctx ? ctx.role : null;
    const myRank = self._roleRank[currentRole] || 0;
    const canManage = !window.Auth || Auth.hasPermission('canManageMembers');
    const assignableRoles = self._getAssignableRoles();

    const memberships = (d.userMemberships || []).filter(mb => mb.userId === userId).map(mb => {
      const tenant = (d.tenants || []).find(t => t.id === mb.tenantId);
      const sp = (d.subPlatforms || []).find(s => s.id === mb.subPlatformId);
      const theirRank = self._roleRank[mb.role] || 0;
      const editable = canManage && myRank > theirRank;
      return { ...mb, tenantName: tenant ? tenant.name : '-', subPlatformName: sp ? sp.name : '-', editable };
    });

    const allRoles = [
      { value: 'super_admin', label: 'Owner' },
      { value: 'tenant_admin', label: 'Tenant Admin' },
      { value: 'subplatform_admin', label: 'SP Admin' },
      { value: 'subplatform_member', label: 'Member' },
    ];
    const tenants = d.tenants || [];
    const sps = d.subPlatforms || [];

    App.showModal(`
      <div class="modal" style="max-width:700px;width:95vw;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title mb-12">จัดการสมาชิก</div>

        <!-- User Header -->
        <div class="flex items-center gap-16 mb-20" style="padding:16px;background:var(--surface2);border-radius:10px;">
          <div class="user-avatar" style="width:48px;height:48px;font-size:16px;">${user.initials}</div>
          <div class="flex-1">
            <div class="form-group" style="margin:0 0 6px 0;">
              <label class="form-label" style="margin-bottom:2px;">ชื่อ</label>
              <input id="md-name" class="form-input font-600" value="${user.name}" style="font-size:14px;">
            </div>
            <div class="mono text-sm text-muted">${user.email}</div>
          </div>
          <div class="flex-col items-end gap-6">
            ${d.statusChip(user.status)}
            <div class="text-xs text-muted">สมัคร: ${user.createdDate || '-'}</div>
          </div>
        </div>

        <!-- Memberships -->
        <div class="flex items-center justify-between mb-12">
          <div class="text-sm font-600">Memberships (${memberships.length})</div>
          ${canManage && assignableRoles.length > 0 ? `<button class="btn btn-outline btn-sm" id="md-add-membership"><i class="fa-solid fa-plus"></i> เพิ่ม Membership</button>` : ''}
        </div>
        <div id="md-memberships" class="flex-col gap-10">
        ${memberships.map(mb => {
          const customRoles = self._getCustomRolesForLevel(mb.role);
          const borderColor = mb.status === 'Suspended' ? 'var(--error)' : mb.status === 'Invited' ? 'var(--primary)' : 'var(--border)';
          return `
          <div style="padding:16px 20px;background:var(--surface2);border-radius:10px;border-left:3px solid ${borderColor};">
            <div class="flex items-center gap-8 mb-12">
              ${d.statusChip(mb.status)}
              <span class="text-sm text-muted flex-1">${mb.tenantName || '—'}${mb.subPlatformName !== '-' ? ' / ' + mb.subPlatformName : ''}</span>
              ${mb.editable ? `<div class="flex gap-6">
                ${mb.status === 'Active' ? `<button class="btn btn-sm btn-outline md-suspend-mb" data-id="${mb.id}" title="ระงับ"><i class="fa-solid fa-ban"></i></button>` : ''}
                ${mb.status === 'Suspended' ? `<button class="btn btn-sm btn-outline md-reactivate-mb" data-id="${mb.id}" title="เปิดใช้งาน" style="color:var(--success);"><i class="fa-solid fa-rotate-right"></i></button>` : ''}
                <button class="btn btn-sm btn-outline md-remove-mb" data-id="${mb.id}" title="ลบ membership นี้" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button>
              </div>` : ''}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <label class="text-xs text-muted" style="display:block;margin-bottom:3px;">Role</label>
                <select class="form-input md-role" data-mb-id="${mb.id}" ${!mb.editable ? 'disabled' : ''}>
                  ${allRoles.map(r => '<option value="' + r.value + '"' + (r.value === mb.role ? ' selected' : '') + '>' + r.label + '</option>').join('')}
                </select>
              </div>
              <div>
                <label class="text-xs text-muted" style="display:block;margin-bottom:3px;">Tenant</label>
                <select class="form-input md-tenant" data-mb-id="${mb.id}" ${!mb.editable ? 'disabled' : ''}>
                  <option value="">—</option>
                  ${tenants.map(t => '<option value="' + t.id + '"' + (t.id === mb.tenantId ? ' selected' : '') + '>' + t.name + '</option>').join('')}
                </select>
              </div>
              <div>
                <label class="text-xs text-muted" style="display:block;margin-bottom:3px;">Sub-Platform</label>
                <select class="form-input md-sp" data-mb-id="${mb.id}" ${!mb.editable ? 'disabled' : ''}>
                  <option value="">—</option>
                  ${sps.map(s => '<option value="' + s.id + '"' + (s.id === mb.subPlatformId ? ' selected' : '') + '>' + s.name + '</option>').join('')}
                </select>
              </div>
              <div>
                <label class="text-xs text-muted" style="display:block;margin-bottom:3px;">Custom Role</label>
                <select class="form-input md-custom-role" data-mb-id="${mb.id}" ${!mb.editable ? 'disabled' : ''}>
                  <option value="">สิทธิ์พื้นฐาน</option>
                  ${customRoles.map(cr => '<option value="' + cr.id + '"' + (cr.id === mb.customRoleId ? ' selected' : '') + '>' + cr.name + '</option>').join('')}
                </select>
              </div>
            </div>
          </div>`;
        }).join('')}
        </div>

        <div class="modal-actions mt-20">
          <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
          <button class="btn btn-primary" id="md-save"><i class="fa-solid fa-save"></i> บันทึก</button>
        </div>
      </div>`);

    setTimeout(() => {
      // Save all changes
      document.getElementById('md-save')?.addEventListener('click', () => {
        const newName = document.getElementById('md-name').value.trim();
        if (!newName) { App.toast('กรุณากรอกชื่อ', 'error'); return; }

        const oldName = user.name;
        user.name = newName;
        const parts = newName.split(' ');
        user.initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : newName.slice(0, 2).toUpperCase();

        const changes = [];
        document.querySelectorAll('#md-memberships .p-12').forEach(card => {
          const mbId = card.querySelector('.md-role')?.dataset.mbId;
          const mb = d.userMemberships.find(x => x.id === mbId);
          if (!mb) return;
          const newRole = card.querySelector('.md-role')?.value;
          const newCrId = card.querySelector('.md-custom-role')?.value || null;
          const newTenant = card.querySelector('.md-tenant')?.value || null;
          const newSp = card.querySelector('.md-sp')?.value || null;
          if (newRole && newRole !== mb.role) { changes.push('Role → ' + (self._roleMeta[newRole]?.label || newRole)); mb.role = newRole; }
          if (newCrId !== mb.customRoleId) { const crN = newCrId ? ((d.customRoles || []).find(c => c.id === newCrId) || {}).name : 'พื้นฐาน'; changes.push('Custom Role → ' + crN); mb.customRoleId = newCrId; }
          if (newTenant !== mb.tenantId) { const tN = newTenant ? (tenants.find(t => t.id === newTenant) || {}).name : '-'; changes.push('Tenant → ' + tN); mb.tenantId = newTenant; }
          if (newSp !== mb.subPlatformId) { const sN = newSp ? (sps.find(s => s.id === newSp) || {}).name : '-'; changes.push('SP → ' + sN); mb.subPlatformId = newSp; }
        });

        let detail = oldName !== newName ? 'เปลี่ยนชื่อ → ' + newName : '';
        if (changes.length) detail += (detail ? ' / ' : '') + changes.join(', ');
        if (!detail) detail = 'ไม่มีการเปลี่ยนแปลง';
        if (detail !== 'ไม่มีการเปลี่ยนแปลง') {
          self._pushAuditLog(user.id, user.name, user.email, 'Edited', detail);
        }
        App.closeModal();
        App.toast('อัปเดต ' + user.name + ' สำเร็จ', 'success');
        self._rerender();
      });

      // Suspend per membership
      document.querySelectorAll('.md-suspend-mb').forEach(btn => {
        btn.addEventListener('click', () => { App.closeModal(); self._showSuspendReasonModal(btn.dataset.id); });
      });

      // Reactivate per membership
      document.querySelectorAll('.md-reactivate-mb').forEach(btn => {
        btn.addEventListener('click', () => {
          const mb = d.userMemberships.find(x => x.id === btn.dataset.id);
          if (!mb) return;
          mb.status = 'Active';
          self._pushAuditLog(userId, user.name, user.email, 'Reactivated', 'เปิดใช้งานอีกครั้ง');
          App.closeModal();
          App.toast('เปิดใช้งานสำเร็จ', 'success');
          self._rerender();
        });
      });

      // Remove per membership
      document.querySelectorAll('.md-remove-mb').forEach(btn => {
        btn.addEventListener('click', () => { App.closeModal(); self._showRemoveReasonModal(btn.dataset.id); });
      });

      // Add new membership
      document.getElementById('md-add-membership')?.addEventListener('click', () => {
        App.closeModal();
        self._showInviteModal(user);
      });
    }, 50);
  },

  // ─── Suspend ALL memberships for user ───
  _showSuspendAllModal(userId) {
    const self = this;
    const d = window.MockData;
    const user = (d.users || []).find(u => u.id === userId);
    if (!user) return;
    const mbs = (d.userMemberships || []).filter(x => x.userId === userId && x.status === 'Active');

    App.showModal(`
      <div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title mb-8" style="color:var(--error);"><i class="fa-solid fa-ban"></i> ระงับสมาชิก</div>
        <div class="text-sm text-muted mb-12">${user.name} · <span class="mono">${user.email}</span> · จะระงับ <strong>${mbs.length}</strong> membership</div>
        <div class="form-group mb-12">
          <label class="form-label">เหตุผล <span class="text-error">*</span></label>
          <select id="suspend-all-sel" class="form-input mb-8">
            <option value="">— เลือกเหตุผล —</option>
            <option value="ละเมิดนโยบาย">ละเมิดนโยบาย</option>
            <option value="ร้องขอจากผู้จัดการ">ร้องขอจากผู้จัดการ</option>
            <option value="ไม่ได้ใช้งาน">ไม่ได้ใช้งาน</option>
            <option value="other">อื่นๆ (ระบุ)</option>
          </select>
          <textarea id="suspend-all-txt" class="form-input" rows="2" placeholder="ระบุเหตุผล..." style="display:none;"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-danger" id="suspend-all-confirm"><i class="fa-solid fa-ban"></i> ยืนยันระงับ</button>
        </div>
      </div>`);
    setTimeout(() => {
      const selEl = document.getElementById('suspend-all-sel');
      const txtEl = document.getElementById('suspend-all-txt');
      selEl?.addEventListener('change', () => { txtEl.style.display = selEl.value === 'other' ? '' : 'none'; });
      document.getElementById('suspend-all-confirm')?.addEventListener('click', () => {
        const reason = selEl.value === 'other' ? txtEl.value.trim() : selEl.value;
        if (!reason) { App.toast('กรุณาระบุเหตุผล', 'error'); return; }
        mbs.forEach(mb => { mb.status = 'Suspended'; });
        self._pushAuditLog(userId, user.name, user.email, 'Suspended', 'ระงับทุก membership (' + mbs.length + ' รายการ) — เหตุผล: ' + reason);
        App.closeModal();
        App.toast('ระงับ ' + user.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Remove ALL memberships for user ───
  _showRemoveAllModal(userId) {
    const self = this;
    const d = window.MockData;
    const user = (d.users || []).find(u => u.id === userId);
    if (!user) return;
    const mbs = (d.userMemberships || []).filter(x => x.userId === userId);

    App.showModal(`
      <div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title mb-8" style="color:var(--error);"><i class="fa-solid fa-trash"></i> ลบสมาชิก</div>
        <div class="text-sm text-muted mb-8">${user.name} · <span class="mono">${user.email}</span> · จะลบ <strong>${mbs.length}</strong> membership</div>
        <div class="card p-10 mb-12" style="border-left:3px solid var(--error);background:rgba(239,68,68,0.06);">
          <div class="text-xs"><i class="fa-solid fa-triangle-exclamation text-error"></i> การลบไม่สามารถย้อนกลับได้</div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">เหตุผล <span class="text-error">*</span></label>
          <select id="remove-all-sel" class="form-input mb-8">
            <option value="">— เลือกเหตุผล —</option>
            <option value="ลาออก">ลาออก</option>
            <option value="สิ้นสุดสัญญา">สิ้นสุดสัญญา</option>
            <option value="ละเมิดนโยบายร้ายแรง">ละเมิดนโยบายร้ายแรง</option>
            <option value="other">อื่นๆ (ระบุ)</option>
          </select>
          <textarea id="remove-all-txt" class="form-input" rows="2" placeholder="ระบุเหตุผล..." style="display:none;"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-danger" id="remove-all-confirm"><i class="fa-solid fa-trash"></i> ยืนยันลบ</button>
        </div>
      </div>`);
    setTimeout(() => {
      const selEl = document.getElementById('remove-all-sel');
      const txtEl = document.getElementById('remove-all-txt');
      selEl?.addEventListener('change', () => { txtEl.style.display = selEl.value === 'other' ? '' : 'none'; });
      document.getElementById('remove-all-confirm')?.addEventListener('click', () => {
        const reason = selEl.value === 'other' ? txtEl.value.trim() : selEl.value;
        if (!reason) { App.toast('กรุณาระบุเหตุผล', 'error'); return; }
        self._pushAuditLog(userId, user.name, user.email, 'Removed', 'ลบทุก membership (' + mbs.length + ' รายการ) — เหตุผล: ' + reason);
        mbs.forEach(mb => {
          const idx = d.userMemberships.indexOf(mb);
          if (idx !== -1) d.userMemberships.splice(idx, 1);
        });
        App.closeModal();
        App.toast('ลบ ' + user.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Suspend with Reason Modal (per membership, from detail modal) ───
  _showSuspendReasonModal(membershipId) {
    const self = this;
    const d = window.MockData;
    const mb = d.userMemberships.find(x => x.id === membershipId);
    if (!mb) return;
    const user = d.users.find(u => u.id === mb.userId);
    if (!user) return;

    App.showModal(`
      <div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title mb-4" style="color:var(--error);"><i class="fa-solid fa-ban"></i> ระงับสมาชิก</div>
        <div class="flex items-center gap-10 mb-16" style="background:var(--surface2);padding:10px;border-radius:8px;">
          <div class="user-avatar" style="width:34px;height:34px;font-size:12px;">${user.initials}</div>
          <div>
            <div class="font-600 text-sm">${user.name}</div>
            <div class="text-xs text-muted">${user.email} · ${self._roleChip(mb.role)}</div>
          </div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">เหตุผลในการระงับ <span class="text-error">*</span></label>
          <select id="suspend-m-reason-sel" class="form-input mb-8">
            <option value="">— เลือกเหตุผล —</option>
            <option value="ละเมิดนโยบาย">ละเมิดนโยบาย</option>
            <option value="ร้องขอจากผู้จัดการ">ร้องขอจากผู้จัดการ</option>
            <option value="ไม่ได้ใช้งาน">ไม่ได้ใช้งาน</option>
            <option value="other">อื่นๆ (ระบุ)</option>
          </select>
          <textarea id="suspend-m-reason-txt" class="form-input" rows="2" placeholder="ระบุเหตุผล..." style="display:none;"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-danger" id="suspend-m-confirm"><i class="fa-solid fa-ban"></i> ยืนยันระงับ</button>
        </div>
      </div>`);
    setTimeout(() => {
      const selEl = document.getElementById('suspend-m-reason-sel');
      const txtEl = document.getElementById('suspend-m-reason-txt');
      selEl?.addEventListener('change', () => { txtEl.style.display = selEl.value === 'other' ? '' : 'none'; });
      document.getElementById('suspend-m-confirm')?.addEventListener('click', () => {
        const reason = selEl.value === 'other' ? txtEl.value.trim() : selEl.value;
        if (!reason) { App.toast('กรุณาระบุเหตุผล', 'error'); return; }
        mb.status = 'Suspended';
        const roleMeta = self._roleMeta[mb.role] || {};
        self._pushAuditLog(mb.userId, user.name, user.email, 'Suspended', 'ระงับ ' + (roleMeta.label || mb.role) + ' — เหตุผล: ' + reason);
        App.closeModal();
        App.toast('ระงับบัญชี ' + user.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Remove with Reason Modal ───
  _showRemoveReasonModal(membershipId) {
    const self = this;
    const d = window.MockData;
    const mb = d.userMemberships.find(x => x.id === membershipId);
    if (!mb) return;
    const user = d.users.find(u => u.id === mb.userId);
    if (!user) return;

    App.showModal(`
      <div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title mb-4" style="color:var(--error);"><i class="fa-solid fa-trash"></i> ลบสมาชิก</div>
        <div class="flex items-center gap-10 mb-12" style="background:var(--surface2);padding:10px;border-radius:8px;">
          <div class="user-avatar" style="width:34px;height:34px;font-size:12px;">${user.initials}</div>
          <div>
            <div class="font-600 text-sm">${user.name}</div>
            <div class="text-xs text-muted">${user.email} · ${self._roleChip(mb.role)}</div>
          </div>
        </div>
        <div class="card p-12 mb-12" style="border-left:3px solid var(--error);background:rgba(239,68,68,0.06);">
          <div class="text-sm"><i class="fa-solid fa-triangle-exclamation text-error"></i> การลบไม่สามารถย้อนกลับได้</div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">เหตุผลในการลบ <span class="text-error">*</span></label>
          <select id="remove-m-reason-sel" class="form-input mb-8">
            <option value="">— เลือกเหตุผล —</option>
            <option value="ลาออก">ลาออก</option>
            <option value="สิ้นสุดสัญญา">สิ้นสุดสัญญา</option>
            <option value="ละเมิดนโยบายร้ายแรง">ละเมิดนโยบายร้ายแรง</option>
            <option value="other">อื่นๆ (ระบุ)</option>
          </select>
          <textarea id="remove-m-reason-txt" class="form-input" rows="2" placeholder="ระบุเหตุผล..." style="display:none;"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-danger" id="remove-m-confirm"><i class="fa-solid fa-trash"></i> ยืนยันลบ</button>
        </div>
      </div>`);
    setTimeout(() => {
      const selEl = document.getElementById('remove-m-reason-sel');
      const txtEl = document.getElementById('remove-m-reason-txt');
      selEl?.addEventListener('change', () => { txtEl.style.display = selEl.value === 'other' ? '' : 'none'; });
      document.getElementById('remove-m-confirm')?.addEventListener('click', () => {
        const reason = selEl.value === 'other' ? txtEl.value.trim() : selEl.value;
        if (!reason) { App.toast('กรุณาระบุเหตุผล', 'error'); return; }
        const roleMeta = self._roleMeta[mb.role] || {};
        self._pushAuditLog(mb.userId, user.name, user.email, 'Removed', 'ลบ ' + (roleMeta.label || mb.role) + ' — เหตุผล: ' + reason);
        const idx = d.userMemberships.indexOf(mb);
        if (idx !== -1) d.userMemberships.splice(idx, 1);
        App.closeModal();
        App.toast('ลบ ' + user.name + ' ออกจากบทบาทนี้แล้ว', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Custom Roles Modal (List + Create + Edit) ───
  _permDefs: [
    { key: 'canEdit',          icon: 'fa-pen',          label: 'แก้ไขข้อมูล' },
    { key: 'canDelete',        icon: 'fa-trash',        label: 'ลบข้อมูล' },
    { key: 'canApprove',       icon: 'fa-check-double', label: 'อนุมัติ' },
    { key: 'canManageMembers', icon: 'fa-users-gear',   label: 'จัดการสมาชิก' },
    { key: 'canViewBilling',   icon: 'fa-file-invoice', label: 'ดู Billing' },
    { key: 'canViewAnalytics', icon: 'fa-chart-column', label: 'ดู Analytics' },
  ],

  _pageGroups: [
    { label: 'PLATFORM', pages: ['dashboard','tenants','sub-platforms'] },
    { label: 'COST & PRICING', pages: ['cost-pricing','cost-margin','cost-snapshots','cost-change-requests'] },
    { label: 'PLANS', pages: ['plans-packages','plans-tokens','plans-bonus'] },
    { label: 'BILLING', pages: ['billing','billing-verify','billing-credit','billing-overdue'] },
    { label: 'SETTINGS', pages: ['payment-settings','platform-members'] },
    { label: 'ANALYTICS', pages: ['analytics-revenue','analytics-usage','analytics-customers'] },
    { label: 'AVATAR', pages: ['avatar-dashboard','avatar-tenants','hardware','devices','service-builder','knowledge-base'] },
    { label: 'DEV PORTAL', pages: ['dp-dashboard','dp-tenants','dp-api-presets','dp-assign-endpoint'] },
  ],

  _showCustomRolesModal(scopeFilter) {
    const self = this;
    const d = window.MockData;
    const allCustomRoles = d.customRoles || [];
    const users = d.users || [];
    const ctx = window.Auth ? Auth.activeContext() : null;
    const canManage = ctx && (ctx.role === 'super_admin' || ctx.role === 'tenant_admin' || ctx.role === 'subplatform_admin');
    const currentRole = ctx ? ctx.role : null;

    // Filter custom roles by scope (global = backoffice, platform = tenant+subplatform)
    const visibleRoles = self._visibleRoles[currentRole] || [];
    const customRoles = allCustomRoles.filter(cr => {
      if (visibleRoles.indexOf(cr.targetLevel) === -1) return false;
      if (currentRole === 'tenant_admin' && cr.scopeType === 'tenant' && cr.scopeId !== ctx.tenantId) return false;
      if (currentRole === 'subplatform_admin' && cr.scopeType === 'subplatform' && cr.scopeId !== ctx.subPlatformId) return false;
      // Scope tab filter
      if (scopeFilter === 'global' && cr.scopeType !== 'global') return false;
      if (scopeFilter === 'platform' && cr.scopeType === 'global') return false;
      return true;
    });
    self._currentRolesScope = scopeFilter;

    const _levelLabels = {
      tenant_admin: 'Tenant Admin', subplatform_admin: 'SP Admin', subplatform_member: 'Member',
    };
    const _scopeLabels = { global: 'Global', tenant: 'Tenant', subplatform: 'Sub-Platform' };

    const rows = customRoles.map(cr => {
      const creator = users.find(u => u.id === cr.createdBy);
      const permIcons = self._permDefs.map(p => {
        const has = cr.permissions && cr.permissions[p.key];
        return has
          ? `<i class="fa-solid ${p.icon} text-success" title="${p.label}" style="font-size:12px;"></i>`
          : `<i class="fa-solid ${p.icon}" title="${p.label}" style="font-size:12px;opacity:.2;"></i>`;
      }).join(' ');
      const pageCount = Array.isArray(cr.permissions.pages) ? cr.permissions.pages.length : 'All';

      return `<tr>
        <td class="font-600" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cr.name}</td>
        <td><span class="chip chip-blue" style="font-size:9px;">${_levelLabels[cr.targetLevel] || cr.targetLevel}</span></td>
        <td><span class="text-xs text-muted">${_scopeLabels[cr.scopeType] || cr.scopeType}</span></td>
        <td style="white-space:nowrap;"><div style="display:flex;gap:6px;align-items:center;">${permIcons}</div></td>
        <td class="text-center"><span class="chip chip-gray" style="font-size:9px;">${pageCount} pages</span></td>
        <td class="text-xs text-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${creator ? creator.name : '-'}</td>
        ${canManage ? `<td class="text-center" style="white-space:nowrap;">
          <button class="btn btn-sm btn-outline cr-edit-btn" data-id="${cr.id}" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline cr-delete-btn" data-id="${cr.id}" title="ลบ" style="color:var(--error);margin-left:4px;"><i class="fa-solid fa-trash"></i></button>
        </td>` : ''}
      </tr>`;
    }).join('');

    App.showModal(
      `<div class="modal modal-xl">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-sliders text-primary"></i> Custom Roles — ${scopeFilter === 'global' ? 'Backoffice' : 'Platform'}</div>
        <div class="text-sm text-muted mb-12">
          แต่ละ Level สามารถสร้าง Custom Role เพื่อกำหนดสิทธิ์ให้ Level ถัดไปได้
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <colgroup>
              <col style="width:140px;">
              <col style="width:120px;">
              <col style="width:100px;">
              <col style="width:150px;">
              <col style="width:80px;">
              <col style="width:120px;">
              ${canManage ? '<col style="width:100px;">' : ''}
            </colgroup>
            <thead>
              <tr>
                <th>ชื่อ Role</th>
                <th>สำหรับ Level</th>
                <th>Scope</th>
                <th>Permissions</th>
                <th class="text-center">Pages</th>
                <th>สร้างโดย</th>
                ${canManage ? '<th class="text-center">Actions</th>' : ''}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="modal-actions" style="margin-top:12px;">
          <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
          ${canManage ? '<button class="btn btn-primary" id="cr-create-btn"><i class="fa-solid fa-plus"></i> สร้าง Custom Role</button>' : ''}
        </div>
      </div>`
    );

    setTimeout(() => {
      document.getElementById('cr-create-btn')?.addEventListener('click', () => {
        self._showCustomRoleForm(null);
      });
      document.querySelectorAll('.cr-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => self._showCustomRoleForm(btn.dataset.id));
      });
      document.querySelectorAll('.cr-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cr = d.customRoles.find(r => r.id === btn.dataset.id);
          if (!cr) return;
          const ok = await App.confirm(`ต้องการลบ Custom Role "${cr.name}"?\nสมาชิกที่ใช้ Role นี้จะกลับไปใช้สิทธิ์พื้นฐาน`, { type: 'danger', title: 'ลบ Custom Role', confirmText: 'ลบ' });
          if (!ok) return;
          // Remove customRoleId from memberships using this role
          d.userMemberships.forEach(mb => { if (mb.customRoleId === cr.id) mb.customRoleId = null; });
          const idx = d.customRoles.indexOf(cr);
          if (idx !== -1) d.customRoles.splice(idx, 1);
          App.toast('ลบ Custom Role "' + cr.name + '" แล้ว', 'success');
          self._showCustomRolesModal(self._currentRolesScope); // re-render list
        });
      });
    }, 50);
  },

  // ─── Custom Role Create/Edit Form ───
  _showCustomRoleForm(roleId) {
    const self = this;
    const d = window.MockData;
    const ctx = window.Auth ? Auth.activeContext() : null;
    const isEdit = !!roleId;
    const cr = isEdit ? d.customRoles.find(r => r.id === roleId) : null;

    // Determine assignable target levels based on current role
    const assignableTargets = self._getAssignableRoles();
    if (assignableTargets.length === 0) { App.toast('ไม่มีสิทธิ์สร้าง Role', 'error'); return; }

    const targetLevel = isEdit ? cr.targetLevel : assignableTargets[0];
    const roleName = isEdit ? cr.name : '';
    const perms = isEdit ? cr.permissions : {};
    const selectedPages = isEdit && Array.isArray(cr.permissions.pages) ? cr.permissions.pages : [];

    const _levelLabels = {
      tenant_admin: 'Tenant Admin', subplatform_admin: 'SP Admin', subplatform_member: 'Member',
    };

    // Permission checkboxes
    const permCheckboxes = self._permDefs.map(p => {
      const checked = perms[p.key] ? 'checked' : '';
      return `<label class="flex items-center gap-6" style="cursor:pointer;">
        <input type="checkbox" class="cr-perm-cb" data-key="${p.key}" ${checked} style="width:16px;height:16px;accent-color:var(--primary);">
        <i class="fa-solid ${p.icon} text-muted" style="width:16px;"></i>
        <span class="text-sm">${p.label}</span>
      </label>`;
    }).join('');

    // Page checkboxes grouped
    const pageGroupsHtml = self._pageGroups.map(g => {
      const allChecked = g.pages.every(p => selectedPages.indexOf(p) !== -1);
      const pagesCbs = g.pages.map(p => {
        const checked = selectedPages.indexOf(p) !== -1 ? 'checked' : '';
        return `<label class="flex items-center gap-4" style="cursor:pointer;padding:2px 0;">
          <input type="checkbox" class="cr-page-cb" data-page="${p}" ${checked} style="width:14px;height:14px;accent-color:var(--primary);">
          <span class="text-xs">${p}</span>
        </label>`;
      }).join('');
      return `<div style="margin-bottom:10px;">
        <label class="flex items-center gap-4 mb-4" style="cursor:pointer;">
          <input type="checkbox" class="cr-page-group" data-pages="${g.pages.join(',')}" ${allChecked ? 'checked' : ''} style="width:14px;height:14px;accent-color:var(--primary);">
          <span class="text-xs uppercase font-700">${g.label}</span>
        </label>
        <div style="padding-left:20px;">${pagesCbs}</div>
      </div>`;
    }).join('');

    App.showModal(
      `<div class="modal" style="max-width:600px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-shield-halved text-primary"></i> ${isEdit ? 'แก้ไข' : 'สร้าง'} Custom Role</div>

        <div class="flex-col gap-14 mt-16">
          <div class="form-group">
            <label class="form-label">ชื่อ Role</label>
            <input class="form-input" id="cr-name" value="${roleName}" placeholder="เช่น Editor, Billing Only, Viewer...">
          </div>

          <div class="form-group">
            <label class="form-label">สำหรับ Level</label>
            <select class="form-input" id="cr-target-level" ${isEdit ? 'disabled' : ''}>
              ${assignableTargets.map(t => `<option value="${t}" ${t === targetLevel ? 'selected' : ''}>${_levelLabels[t] || t}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label">Permissions</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;border:1px solid var(--border);border-radius:8px;">
              ${permCheckboxes}
            </div>
          </div>

          <div>
            <label class="form-label">เข้าถึงหน้า</label>
            <div style="max-height:280px;overflow-y:auto;padding:10px;border:1px solid var(--border);border-radius:8px;">
              ${pageGroupsHtml}
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" id="cr-form-back"><i class="fa-solid fa-arrow-left"></i> กลับ</button>
          <button class="btn btn-primary" id="cr-form-save"><i class="fa-solid fa-save"></i> ${isEdit ? 'บันทึก' : 'สร้าง'}</button>
        </div>
      </div>`
    );

    setTimeout(() => {
      // Group toggle
      document.querySelectorAll('.cr-page-group').forEach(toggle => {
        toggle.addEventListener('change', () => {
          const pages = toggle.dataset.pages.split(',');
          pages.forEach(p => {
            const cb = document.querySelector(`.cr-page-cb[data-page="${p}"]`);
            if (cb) cb.checked = toggle.checked;
          });
        });
      });

      // Back to list
      document.getElementById('cr-form-back')?.addEventListener('click', () => {
        self._showCustomRolesModal(self._currentRolesScope);
      });

      // Save
      document.getElementById('cr-form-save')?.addEventListener('click', () => {
        const name = document.getElementById('cr-name').value.trim();
        const target = document.getElementById('cr-target-level').value;
        if (!name) { document.getElementById('cr-name').classList.add('is-invalid'); return; }

        // Collect permissions
        const newPerms = {};
        document.querySelectorAll('.cr-perm-cb').forEach(cb => {
          newPerms[cb.dataset.key] = cb.checked;
        });

        // Collect pages
        const newPages = [];
        document.querySelectorAll('.cr-page-cb').forEach(cb => {
          if (cb.checked) newPages.push(cb.dataset.page);
        });
        newPerms.pages = newPages;

        // Determine scope
        let scopeType = 'global';
        let scopeId = null;
        if (ctx) {
          if (ctx.role === 'tenant_admin') { scopeType = 'tenant'; scopeId = ctx.tenantId; }
          else if (ctx.role === 'subplatform_admin') { scopeType = 'subplatform'; scopeId = ctx.subPlatformId; }
        }

        if (isEdit) {
          // Update existing
          cr.name = name;
          cr.permissions = newPerms;
          App.toast('อัปเดต Custom Role "' + name + '" สำเร็จ', 'success');
        } else {
          // Create new
          const newId = 'CR-' + String(d.customRoles.length + 1).padStart(3, '0');
          d.customRoles.push({
            id: newId, name, targetLevel: target,
            scopeType, scopeId,
            createdBy: window.Auth && Auth.currentUser() ? Auth.currentUser().id : null,
            createdDate: new Date().toISOString().slice(0, 10),
            permissions: newPerms,
          });
          App.toast('สร้าง Custom Role "' + name + '" สำเร็จ', 'success');
        }

        self._showCustomRolesModal(self._currentRolesScope); // back to list
      });
    }, 50);
  },
};
