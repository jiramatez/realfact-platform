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
    super_admin:       { label: 'Owner',        chip: 'chip-orange', icon: 'fa-crown' },
    tenant_admin:      { label: 'Tenant Admin', chip: 'chip-blue',   icon: 'fa-building' },
    subplatform_admin: { label: 'SP Admin',     chip: 'chip-green',  icon: 'fa-cubes' },
    subplatform_member:{ label: 'Member',       chip: 'chip-gray',   icon: 'fa-user' },
  },

  _roleChip(role) {
    const m = this._roleMeta[role] || { label: role, chip: 'chip-gray', icon: 'fa-user' };
    return `<span class="chip ${m.chip}"><i class="fa-solid ${m.icon}"></i> ${m.label}</span>`;
  },

  // ─── Role hierarchy rank (higher = more privileged) ───
  _roleRank: { super_admin: 4, tenant_admin: 3, subplatform_admin: 2, subplatform_member: 1 },

  // ─── Roles visible to each role level ───
  _visibleRoles: {
    super_admin:       ['super_admin', 'tenant_admin', 'subplatform_admin', 'subplatform_member'],
    tenant_admin:      ['tenant_admin', 'subplatform_admin', 'subplatform_member'],
    subplatform_admin: ['subplatform_admin', 'subplatform_member'],
    subplatform_member: ['subplatform_member'],
  },

  // ─── Build member list — scoped by current user's role + scope ───
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

    return memberships.map(mb => {
      const user = users.find(u => u.id === mb.userId);
      if (!user) return null;

      // ── RBAC Scope Filter ──
      // Only show members whose role is within allowed visibility
      if (currentRole && allowedRoles.indexOf(mb.role) === -1) return null;

      // Scope filter: non-owner roles only see members in their own scope
      if (currentRole === 'tenant_admin') {
        // Tenant Admin sees: own tenant's members + self
        if (mb.role !== 'super_admin' && mb.tenantId && mb.tenantId !== ctx.tenantId) return null;
      } else if (currentRole === 'subplatform_admin') {
        // SP Admin sees: own SP's members + self (same tenant + same SP or no SP)
        if (mb.tenantId && mb.tenantId !== ctx.tenantId) return null;
        if (mb.subPlatformId && mb.subPlatformId !== ctx.subPlatformId) return null;
      } else if (currentRole === 'subplatform_member') {
        // Member sees only self
        const currentUserId = window.Auth && Auth.currentUser() ? Auth.currentUser().id : null;
        if (mb.userId !== currentUserId) return null;
      }

      const tenant = mb.tenantId ? tenants.find(t => t.id === mb.tenantId) : null;
      const sp = mb.subPlatformId ? subPlatforms.find(s => s.id === mb.subPlatformId) : null;
      const cr = mb.customRoleId ? customRoles.find(r => r.id === mb.customRoleId) : null;
      const inviter = mb.invitedBy ? users.find(u => u.id === mb.invitedBy) : null;

      return {
        membershipId: mb.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        role: mb.role,
        customRoleName: cr ? cr.name : null,
        tenantId: mb.tenantId,
        tenantName: tenant ? tenant.name : null,
        subPlatformId: mb.subPlatformId,
        subPlatformName: sp ? sp.name : null,
        status: mb.status === 'Active' && user.status !== 'Active' ? user.status : mb.status,
        lastLogin: user.lastLogin,
        createdDate: mb.createdDate,
        invitedByEmail: inviter ? inviter.email : null,
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
      { value: 'tenant_admin', label: 'Tenant Admin' },
      { value: 'subplatform_admin', label: 'SP Admin' },
      { value: 'subplatform_member', label: 'Member' },
    ].filter(r => visibleRoles.indexOf(r.value) !== -1)
     .map(r => `<option value="${r.value}">${r.label}</option>`).join('');

    return `
      <div class="page-header">
        <h1 class="heading">PLATFORM MEMBERS</h1>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-view-roles">
            <i class="fa-solid fa-table-cells"></i> Custom Roles
          </button>
          ${canManage ? `<button class="btn btn-primary" id="btn-invite-member">
            <i class="fa-solid fa-user-plus"></i> เชิญสมาชิก
          </button>` : ''}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid-4 gap-16 mb-24">
        <div class="card p-20 text-center">
          <div class="text-xs text-muted uppercase mb-4">ทั้งหมด</div>
          <div class="heading" style="font-size:28px;">${total}</div>
        </div>
        <div class="card p-20 text-center">
          <div class="text-xs text-muted uppercase mb-4">Active</div>
          <div class="heading" style="font-size:28px;color:var(--success);">${active}</div>
        </div>
        <div class="card p-20 text-center">
          <div class="text-xs text-muted uppercase mb-4">Suspended</div>
          <div class="heading" style="font-size:28px;color:var(--error);">${suspended}</div>
        </div>
        <div class="card p-20 text-center">
          <div class="text-xs text-muted uppercase mb-4">Invited</div>
          <div class="heading" style="font-size:28px;color:#3b82f6;">${invited}</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-10 mb-16" style="flex-wrap:wrap;">
        <div class="search-bar flex-1" style="min-width:200px;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="member-search" placeholder="ค้นหาชื่อ / email...">
        </div>
        <select id="member-filter-role" class="form-input" style="width:auto;min-width:140px;">
          <option value="">ทุก Role</option>
          ${roleFilterOptions}
        </select>
        <select id="member-filter-status" class="form-input" style="width:auto;min-width:120px;">
          <option value="">ทุกสถานะ</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Invited">Invited</option>
        </select>
      </div>

      <!-- Member Table -->
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width:44px;"></th>
                <th>ชื่อ</th>
                <th>Email</th>
                <th>Role</th>
                <th>Scope</th>
                <th>สถานะ</th>
                <th>Login ล่าสุด</th>
                ${canManage ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="member-table-body">
              ${members.map(m => {
                const currentUserEmail = window.Auth && Auth.currentUser() ? Auth.currentUser().email : '';
                const myRank = self._roleRank[currentRole] || 0;
                const theirRank = self._roleRank[m.role] || 0;
                const canEditThis = canManage && myRank > theirRank;
                const canRemoveThis = canManage && myRank > theirRank && m.email !== currentUserEmail;

                // Scope display
                let scopeHtml = '-';
                if (m.role === 'super_admin') {
                  scopeHtml = '<span class="text-xs text-muted">All Tenants</span>';
                } else if (m.tenantName) {
                  scopeHtml = '<span class="text-xs">' + m.tenantName + '</span>';
                  if (m.subPlatformName) {
                    scopeHtml += '<br><span class="text-xs text-muted">' + m.subPlatformName + '</span>';
                  }
                }

                // Custom role badge
                const crBadge = m.customRoleName
                  ? ` <span class="chip chip-blue" style="font-size:9px;">${m.customRoleName}</span>`
                  : '';

                return `
                  <tr data-id="${m.membershipId}" data-role="${m.role}" data-status="${m.status}" data-search="${(m.name + ' ' + m.email).toLowerCase()}">
                    <td>
                      <div class="user-avatar" style="width:34px;height:34px;font-size:12px;" title="${m.name}">${m.initials}</div>
                    </td>
                    <td>
                      <div class="font-600">${m.name}</div>
                      ${m.email === currentUserEmail ? '<span class="chip chip-blue" style="font-size:9px;">คุณ</span>' : ''}
                    </td>
                    <td class="mono text-sm">${m.email}</td>
                    <td>${self._roleChip(m.role)}${crBadge}</td>
                    <td>${scopeHtml}</td>
                    <td>${d.statusChip(m.status)}</td>
                    <td class="text-sm text-muted mono">${m.lastLogin || '-'}</td>
                    ${canManage ? `<td>
                      <div class="flex gap-4">
                        ${canEditThis ? `<button class="btn btn-sm btn-outline member-edit-btn" data-id="${m.membershipId}" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>` : ''}
                        ${canEditThis && m.status === 'Active' ? `<button class="btn btn-sm btn-outline member-suspend-btn" data-id="${m.membershipId}" title="ระงับ"><i class="fa-solid fa-ban"></i></button>` : ''}
                        ${canEditThis && m.status === 'Suspended' ? `<button class="btn btn-sm btn-outline member-reactivate-btn" data-id="${m.membershipId}" title="เปิดใช้งาน" style="color:var(--success);"><i class="fa-solid fa-rotate-right"></i></button>` : ''}
                        ${canRemoveThis ? `<button class="btn btn-sm btn-outline member-remove-btn" data-id="${m.membershipId}" title="ลบ" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button>` : ''}
                      </div>
                    </td>` : ''}
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ─── Init ───
  init() {
    const self = this;
    const d = window.MockData;

    // ─── Filter logic ───
    const searchInput = document.getElementById('member-search');
    const roleFilter  = document.getElementById('member-filter-role');
    const statusFilter = document.getElementById('member-filter-status');

    function applyFilters() {
      const q = (searchInput.value || '').toLowerCase();
      const role = roleFilter.value;
      const status = statusFilter.value;
      document.querySelectorAll('#member-table-body tr').forEach(tr => {
        const matchSearch = !q || (tr.dataset.search || '').indexOf(q) !== -1;
        const matchRole   = !role || tr.dataset.role === role;
        const matchStatus = !status || tr.dataset.status === status;
        tr.style.display = (matchSearch && matchRole && matchStatus) ? '' : 'none';
      });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (roleFilter)  roleFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);

    // ─── View Custom Roles ───
    document.getElementById('btn-view-roles')?.addEventListener('click', () => {
      self._showCustomRolesModal();
    });

    // ─── Invite Member ───
    document.getElementById('btn-invite-member')?.addEventListener('click', () => {
      self._showInviteModal();
    });

    // ─── Edit Member ───
    document.querySelectorAll('.member-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => self._showEditModal(btn.dataset.id));
    });

    // ─── Suspend Member ───
    document.querySelectorAll('.member-suspend-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mb = d.userMemberships.find(x => x.id === btn.dataset.id);
        if (!mb) return;
        const user = d.users.find(u => u.id === mb.userId);
        const name = user ? user.name : mb.userId;
        const ok = await App.confirm(`ต้องการระงับบัญชี "${name}" ในบทบาทนี้?`, { type: 'danger', title: 'ระงับสมาชิก', confirmText: 'ระงับ' });
        if (!ok) return;
        mb.status = 'Suspended';
        App.toast('ระงับบัญชี ' + name + ' สำเร็จ', 'success');
        self._rerender();
      });
    });

    // ─── Reactivate Member ───
    document.querySelectorAll('.member-reactivate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mb = d.userMemberships.find(x => x.id === btn.dataset.id);
        if (!mb) return;
        mb.status = 'Active';
        const user = d.users.find(u => u.id === mb.userId);
        App.toast('เปิดใช้งาน ' + (user ? user.name : '') + ' สำเร็จ', 'success');
        self._rerender();
      });
    });

    // ─── Remove Member ───
    document.querySelectorAll('.member-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const mb = d.userMemberships.find(x => x.id === btn.dataset.id);
        if (!mb) return;
        const user = d.users.find(u => u.id === mb.userId);
        const name = user ? user.name : mb.userId;
        const ok = await App.confirm(`ต้องการลบ "${name}" ออกจากบทบาทนี้?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`, { type: 'danger', title: 'ลบสมาชิก', confirmText: 'ลบ' });
        if (!ok) return;
        const idx = d.userMemberships.indexOf(mb);
        if (idx !== -1) d.userMemberships.splice(idx, 1);
        App.toast('ลบ ' + name + ' ออกจากบทบาทนี้แล้ว', 'success');
        self._rerender();
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

  // ─── Invite Modal ───
  _showInviteModal() {
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
        <div class="modal-title"><i class="fa-solid fa-user-plus text-primary"></i> เชิญสมาชิกใหม่</div>
        <div class="flex-col gap-14 mt-16">
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input class="form-input" id="invite-name" placeholder="ชื่อ-นามสกุล">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="invite-email" placeholder="email@company.com">
          </div>
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

        App.closeModal();
        App.toast('ส่งคำเชิญไปยัง ' + email + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Edit Modal ───
  _showEditModal(membershipId) {
    const self = this;
    const d = window.MockData;
    const mb = d.userMemberships.find(x => x.id === membershipId);
    if (!mb) return;
    const user = d.users.find(u => u.id === mb.userId);
    if (!user) return;

    const customRoles = self._getCustomRolesForLevel(mb.role);

    App.showModal(
      `<div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-user-pen text-primary"></i> แก้ไขสมาชิก</div>
        <div class="flex items-center gap-12 mt-12 mb-16" style="background:var(--surface2);padding:12px;border-radius:10px;">
          <div class="user-avatar" style="width:40px;height:40px;font-size:14px;">${user.initials}</div>
          <div>
            <div class="font-600">${user.name}</div>
            <div class="mono text-sm text-muted">${user.email}</div>
            <div style="margin-top:4px;">${self._roleChip(mb.role)}</div>
          </div>
        </div>
        <div class="flex-col gap-14">
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input class="form-input" id="edit-member-name" value="${user.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Custom Role (สิทธิ์)</label>
            <select class="form-input" id="edit-member-custom-role">
              <option value="">(ใช้สิทธิ์พื้นฐานของ Role)</option>
              ${customRoles.map(cr => `<option value="${cr.id}" ${cr.id === mb.customRoleId ? 'selected' : ''}>${cr.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-primary" id="edit-member-save"><i class="fa-solid fa-save"></i> บันทึก</button>
        </div>
      </div>`
    );

    setTimeout(() => {
      document.getElementById('edit-member-save')?.addEventListener('click', () => {
        const newName = document.getElementById('edit-member-name').value.trim();
        const newCustomRoleId = document.getElementById('edit-member-custom-role').value || null;

        if (!newName) { document.getElementById('edit-member-name').classList.add('is-invalid'); return; }

        user.name = newName;
        const parts = newName.split(' ');
        user.initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : newName.slice(0, 2).toUpperCase();
        mb.customRoleId = newCustomRoleId;

        App.closeModal();
        App.toast('อัปเดต ' + user.name + ' สำเร็จ', 'success');
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

  _showCustomRolesModal() {
    const self = this;
    const d = window.MockData;
    const allCustomRoles = d.customRoles || [];
    const users = d.users || [];
    const ctx = window.Auth ? Auth.activeContext() : null;
    const canManage = ctx && (ctx.role === 'super_admin' || ctx.role === 'tenant_admin' || ctx.role === 'subplatform_admin');
    const currentRole = ctx ? ctx.role : null;

    // Filter custom roles: only show roles for levels visible to current user
    const visibleRoles = self._visibleRoles[currentRole] || [];
    const customRoles = allCustomRoles.filter(cr => {
      if (visibleRoles.indexOf(cr.targetLevel) === -1) return false;
      // Scope filter
      if (currentRole === 'tenant_admin' && cr.scopeType === 'tenant' && cr.scopeId !== ctx.tenantId) return false;
      if (currentRole === 'subplatform_admin' && cr.scopeType === 'subplatform' && cr.scopeId !== ctx.subPlatformId) return false;
      return true;
    });

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
        <div class="modal-title"><i class="fa-solid fa-sliders text-primary"></i> Custom Roles</div>
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
          self._showCustomRolesModal(); // re-render list
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
        self._showCustomRolesModal();
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

        self._showCustomRolesModal(); // back to list
      });
    }, 50);
  },
};
