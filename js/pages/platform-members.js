/* ================================================================
   Page Module — Platform Members
   CRUD for platform member management with RBAC
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
    super_admin:    { label: 'Super Admin',    chip: 'chip-orange', icon: 'fa-shield-halved' },
    platform_admin: { label: 'Platform Admin', chip: 'chip-blue',   icon: 'fa-user-gear' },
    finance:        { label: 'Finance',        chip: 'chip-green',  icon: 'fa-coins' },
    viewer:         { label: 'Viewer',         chip: 'chip-gray',   icon: 'fa-eye' },
  },

  _roleChip(role) {
    const m = this._roleMeta[role] || { label: role, chip: 'chip-gray', icon: 'fa-user' };
    return `<span class="chip ${m.chip}"><i class="fa-solid ${m.icon}"></i> ${m.label}</span>`;
  },

  // ─── Render ───
  render() {
    const d = window.MockData;
    const members = d.platformMembers || [];
    const self = window.Pages.platformMembers;

    const total     = members.length;
    const active    = members.filter(m => m.status === 'Active').length;
    const suspended = members.filter(m => m.status === 'Suspended').length;
    const invited   = members.filter(m => m.status === 'Invited').length;

    const canManage = !window.Auth || Auth.hasPermission('canManageMembers');
    const isSuperAdmin = window.Auth && Auth.currentUser() && Auth.currentUser().role === 'super_admin';

    return `
      <div class="page-header">
        <h1 class="heading">PLATFORM MEMBERS</h1>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-view-roles">
            <i class="fa-solid fa-table-cells"></i> สิทธิ์ตาม Role
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
          <option value="super_admin">Super Admin</option>
          <option value="platform_admin">Platform Admin</option>
          <option value="finance">Finance</option>
          <option value="viewer">Viewer</option>
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
                <th>สถานะ</th>
                <th>Login ล่าสุด</th>
                <th>เพิ่มเมื่อ</th>
                ${canManage ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="member-table-body">
              ${members.map(m => {
                const currentUserEmail = window.Auth && Auth.currentUser() ? Auth.currentUser().email : '';
                const isTargetSuperAdmin = m.role === 'super_admin';
                const canEditThis = canManage && (isSuperAdmin || !isTargetSuperAdmin);
                const canRemoveThis = isSuperAdmin && m.email !== currentUserEmail;
                return `
                  <tr data-id="${m.id}" data-role="${m.role}" data-status="${m.status}" data-search="${(m.name + ' ' + m.email).toLowerCase()}">
                    <td>
                      <div class="user-avatar" style="width:34px;height:34px;font-size:12px;" title="${m.name}">${m.initials}</div>
                    </td>
                    <td>
                      <div class="font-600">${m.name}</div>
                      ${m.email === currentUserEmail ? '<span class="chip chip-blue" style="font-size:9px;">คุณ</span>' : ''}
                    </td>
                    <td class="mono text-sm">${m.email}</td>
                    <td>${self._roleChip(m.role)}</td>
                    <td>${d.statusChip(m.status)}</td>
                    <td class="text-sm text-muted mono">${m.lastLogin || '-'}</td>
                    <td>
                      <div class="text-sm text-muted">${m.createdDate}</div>
                      ${m.invitedBy ? `<div class="text-xs text-dim">${m.invitedBy.split('@')[0]}</div>` : ''}
                    </td>
                    ${canManage ? `<td>
                      <div class="flex gap-4">
                        ${canEditThis ? `<button class="btn btn-sm btn-outline member-edit-btn" data-id="${m.id}" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>` : ''}
                        ${canEditThis && m.status === 'Active' ? `<button class="btn btn-sm btn-outline member-suspend-btn" data-id="${m.id}" title="ระงับ"><i class="fa-solid fa-ban"></i></button>` : ''}
                        ${canEditThis && m.status === 'Suspended' ? `<button class="btn btn-sm btn-outline member-reactivate-btn" data-id="${m.id}" title="เปิดใช้งาน" style="color:var(--success);"><i class="fa-solid fa-rotate-right"></i></button>` : ''}
                        ${canRemoveThis ? `<button class="btn btn-sm btn-outline member-remove-btn" data-id="${m.id}" title="ลบ" style="color:var(--error);"><i class="fa-solid fa-trash"></i></button>` : ''}
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

    // ─── View Roles Permission Matrix ───
    document.getElementById('btn-view-roles')?.addEventListener('click', () => {
      self._showRolesMatrix();
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
        const m = d.platformMembers.find(x => x.id === btn.dataset.id);
        if (!m) return;
        const ok = await App.confirm(`ต้องการระงับบัญชี "${m.name}" (${m.email}) ?`, { type: 'danger', title: 'ระงับสมาชิก', confirmText: 'ระงับ' });
        if (!ok) return;
        m.status = 'Suspended';
        m.modifiedDate = new Date().toISOString().slice(0, 10);
        m.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
        App.toast('ระงับบัญชี ' + m.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    });

    // ─── Reactivate Member ───
    document.querySelectorAll('.member-reactivate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = d.platformMembers.find(x => x.id === btn.dataset.id);
        if (!m) return;
        m.status = 'Active';
        m.modifiedDate = new Date().toISOString().slice(0, 10);
        m.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
        App.toast('เปิดใช้งาน ' + m.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    });

    // ─── Remove Member ───
    document.querySelectorAll('.member-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const m = d.platformMembers.find(x => x.id === btn.dataset.id);
        if (!m) return;
        const ok = await App.confirm(`ต้องการลบบัญชี "${m.name}" (${m.email}) ออกจากระบบ?\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`, { type: 'danger', title: 'ลบสมาชิก', confirmText: 'ลบ' });
        if (!ok) return;
        const idx = d.platformMembers.indexOf(m);
        if (idx !== -1) d.platformMembers.splice(idx, 1);
        App.toast('ลบ ' + m.name + ' ออกจากระบบแล้ว', 'success');
        self._rerender();
      });
    });
  },

  // ─── Invite Modal ───
  _showInviteModal() {
    const self = this;
    const d = window.MockData;
    const isSuperAdmin = window.Auth && Auth.currentUser() && Auth.currentUser().role === 'super_admin';
    const roleOptions = isSuperAdmin
      ? ['super_admin', 'platform_admin', 'finance', 'viewer']
      : ['platform_admin', 'finance', 'viewer'];

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
              ${roleOptions.map(r => {
                const m = self._roleMeta[r] || {};
                return `<option value="${r}">${m.label || r}</option>`;
              }).join('')}
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

        // Validate
        if (!name)  { document.getElementById('invite-name').classList.add('is-invalid'); return; }
        if (!email) { document.getElementById('invite-email').classList.add('is-invalid'); return; }
        if (d.platformMembers.find(m => m.email === email)) {
          App.toast('Email นี้มีอยู่ในระบบแล้ว', 'error'); return;
        }

        // Generate initials
        const parts = name.split(' ');
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();

        const newId = 'MEM-' + String(d.platformMembers.length + 1).padStart(3, '0');
        d.platformMembers.push({
          id: newId,
          email: email,
          password: null,
          name: name,
          initials: initials,
          role: role,
          status: 'Invited',
          lastLogin: null,
          createdDate: new Date().toISOString().slice(0, 10),
          invitedBy: (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system',
          modifiedDate: new Date().toISOString().slice(0, 10),
          modifiedBy: (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system',
        });

        App.closeModal();
        App.toast('ส่งคำเชิญไปยัง ' + email + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Edit Modal ───
  _showEditModal(memberId) {
    const self = this;
    const d = window.MockData;
    const m = d.platformMembers.find(x => x.id === memberId);
    if (!m) return;

    const isSuperAdmin = window.Auth && Auth.currentUser() && Auth.currentUser().role === 'super_admin';
    const roleOptions = isSuperAdmin
      ? ['super_admin', 'platform_admin', 'finance', 'viewer']
      : ['platform_admin', 'finance', 'viewer'];

    App.showModal(
      `<div class="modal" style="max-width:480px;">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-user-pen text-primary"></i> แก้ไขสมาชิก</div>
        <div class="flex items-center gap-12 mt-12 mb-16" style="background:var(--surface2);padding:12px;border-radius:10px;">
          <div class="user-avatar" style="width:40px;height:40px;font-size:14px;">${m.initials}</div>
          <div>
            <div class="font-600">${m.name}</div>
            <div class="mono text-sm text-muted">${m.email}</div>
          </div>
        </div>
        <div class="flex-col gap-14">
          <div class="form-group">
            <label class="form-label">ชื่อ</label>
            <input class="form-input" id="edit-member-name" value="${m.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input" id="edit-member-role">
              ${roleOptions.map(r => {
                const meta = self._roleMeta[r] || {};
                return `<option value="${r}" ${r === m.role ? 'selected' : ''}>${meta.label || r}</option>`;
              }).join('')}
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
        const newRole = document.getElementById('edit-member-role').value;

        if (!newName) { document.getElementById('edit-member-name').classList.add('is-invalid'); return; }

        m.name = newName;
        m.role = newRole;
        const parts = newName.split(' ');
        m.initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : newName.slice(0, 2).toUpperCase();
        m.modifiedDate = new Date().toISOString().slice(0, 10);
        m.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';

        App.closeModal();
        App.toast('อัปเดต ' + m.name + ' สำเร็จ', 'success');
        self._rerender();
      });
    }, 50);
  },

  // ─── Roles Permission Matrix (Editable) ───
  _pageGroups: [
    { label: 'PLATFORM', icon: 'fa-building', pages: [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'sub-platforms', name: 'Sub-Platforms' },
      { id: 'tenants', name: 'Tenants' },
    ]},
    { label: 'COST & PRICING', icon: 'fa-calculator', pages: [
      { id: 'cost-pricing', name: 'Cost Configuration' },
      { id: 'cost-margin', name: 'Margin Config' },
      { id: 'cost-snapshots', name: 'Snapshots' },
      { id: 'cost-change-requests', name: 'Change Requests' },
    ]},
    { label: 'PLANS & PACKAGES', icon: 'fa-tags', pages: [
      { id: 'plans-packages', name: 'Subscription Plans' },
      { id: 'plans-tokens', name: 'Token Packages' },
      { id: 'plans-bonus', name: 'Welcome Bonus' },
    ]},
    { label: 'BILLING', icon: 'fa-file-invoice-dollar', pages: [
      { id: 'billing', name: 'Overview & Invoices' },
      { id: 'billing-verify', name: 'ตรวจสอบการชำระ' },
      { id: 'billing-credit', name: 'Credit & Refunds' },
      { id: 'billing-overdue', name: 'ค้างชำระ' },
    ]},
    { label: 'SETTINGS', icon: 'fa-sliders', pages: [
      { id: 'payment-settings', name: 'Payment Settings' },
      { id: 'platform-members', name: 'Platform Members' },
    ]},
    { label: 'ANALYTICS', icon: 'fa-chart-column', pages: [
      { id: 'analytics-revenue', name: 'Revenue & Billing' },
      { id: 'analytics-usage', name: 'API Usage' },
      { id: 'analytics-customers', name: 'Customers & Services' },
    ]},
    { label: 'AVATAR', icon: 'fa-robot', pages: [
      { id: 'avatar-dashboard', name: 'Dashboard' },
      { id: 'avatar-tenants', name: 'Tenants' },
      { id: 'hardware', name: 'Hardware' },
      { id: 'devices', name: 'Devices' },
      { id: 'service-builder', name: 'Assign Avatar' },
      { id: 'knowledge-base', name: 'Knowledge Base' },
    ]},
    { label: 'DEVELOPER PORTAL', icon: 'fa-code', pages: [
      { id: 'dp-dashboard', name: 'Dashboard' },
      { id: 'dp-tenants', name: 'Tenants' },
      { id: 'dp-api-presets', name: 'API Presets' },
      { id: 'dp-assign-endpoint', name: 'Assign Endpoint' },
    ]},
  ],

  _editableRoles: [
    { key: 'platform_admin', label: 'Platform Admin', chip: 'chip-blue' },
    { key: 'finance',        label: 'Finance',        chip: 'chip-green' },
    { key: 'viewer',         label: 'Viewer',         chip: 'chip-gray' },
  ],

  _showRolesMatrix() {
    const self = this;
    const d = window.MockData;
    const rp = d.rolePermissions;
    const isSuperAdmin = window.Auth && Auth.currentUser() && Auth.currentUser().role === 'super_admin';
    const canEdit = isSuperAdmin;
    const perms = ['canEdit', 'canDelete', 'canApprove', 'canManageMembers'];
    const permLabels = {
      canEdit: '<i class="fa-solid fa-pen text-muted" style="width:18px;"></i> แก้ไขข้อมูล (Edit)',
      canDelete: '<i class="fa-solid fa-trash text-muted" style="width:18px;"></i> ลบข้อมูล (Delete)',
      canApprove: '<i class="fa-solid fa-check-double text-muted" style="width:18px;"></i> อนุมัติ (Approve)',
      canManageMembers: '<i class="fa-solid fa-users-gear text-muted" style="width:18px;"></i> จัดการสมาชิก',
    };

    const allRoles = [
      { key: 'super_admin', label: 'Super Admin', chip: 'chip-orange', locked: true },
      ...self._editableRoles.map(r => ({ ...r, locked: false })),
    ];

    function canAccess(roleKey, pageId) {
      const r = rp[roleKey];
      if (!r) return false;
      if (r.pages === '*') return true;
      return r.pages.indexOf(pageId) !== -1;
    }

    function cbx(name, checked, disabled) {
      return `<input type="checkbox" class="rbac-cb" data-name="${name}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} style="width:16px;height:16px;accent-color:var(--primary);cursor:${disabled ? 'not-allowed' : 'pointer'};">`;
    }

    // Build permission rows
    let permRows = '';
    perms.forEach(p => {
      permRows += `<tr>
        <td class="text-sm" style="white-space:nowrap;">${permLabels[p]}</td>
        ${allRoles.map(r => {
          const val = !!(rp[r.key] && rp[r.key][p]);
          const dis = r.locked || !canEdit;
          return `<td class="text-center">${cbx('perm|' + r.key + '|' + p, val, dis)}</td>`;
        }).join('')}
      </tr>`;
    });

    // Build page access rows
    let pageRows = '';
    self._pageGroups.forEach(group => {
      // Group header with select-all per group per role
      pageRows += `<tr class="grp-row">
        <td class="text-xs uppercase font-700" style="letter-spacing:.8px;">
          <i class="fa-solid ${group.icon}" style="margin-right:5px;opacity:.5;"></i>${group.label}
        </td>
        ${allRoles.map(r => {
          if (r.locked || !canEdit) return '<td></td>';
          const groupPageIds = group.pages.map(p => p.id);
          const allChecked = groupPageIds.every(pid => canAccess(r.key, pid));
          return `<td class="text-center">
            <label style="cursor:pointer;user-select:none;font-size:10px;color:var(--text-muted);display:inline-flex;align-items:center;gap:3px;">
              <input type="checkbox" class="rbac-group-toggle" data-role="${r.key}" data-pages="${groupPageIds.join(',')}" ${allChecked ? 'checked' : ''} style="width:14px;height:14px;accent-color:var(--primary);cursor:pointer;">ทั้งหมด
            </label>
          </td>`;
        }).join('')}
      </tr>`;
      group.pages.forEach(p => {
        pageRows += `<tr class="pg-row">
          <td class="text-sm">${p.name}</td>
          ${allRoles.map(r => {
            const val = canAccess(r.key, p.id);
            const dis = r.locked || !canEdit;
            return `<td class="text-center">${cbx('page|' + r.key + '|' + p.id, val, dis)}</td>`;
          }).join('')}
        </tr>`;
      });
    });

    App.showModal(
      `<div class="modal modal-xl">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-sliders text-primary"></i> ตั้งค่าสิทธิ์ตาม Role</div>
        ${!canEdit ? '<div class="text-xs text-muted" style="margin-top:2px;"><i class="fa-solid fa-lock"></i> เฉพาะ Super Admin สามารถแก้ไขสิทธิ์ได้</div>' : ''}

        <!-- Permission Summary -->
        <div class="text-xs uppercase text-muted font-600" style="margin:14px 0 6px;">
          <i class="fa-solid fa-shield-halved"></i> สิทธิ์การดำเนินการ
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:14px;">
          <table class="rbac-table">
            <thead>
              <tr>
                <th style="width:200px;">Permission</th>
                ${allRoles.map(r => `<th class="text-center" style="width:140px;"><span class="chip ${r.chip}" style="font-size:10px;">${r.label}</span>${r.locked ? ' <i class="fa-solid fa-lock" style="font-size:8px;opacity:.35;"></i>' : ''}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${permRows}</tbody>
          </table>
        </div>

        <!-- Page Access -->
        <div class="text-xs uppercase text-muted font-600" style="margin-bottom:6px;">
          <i class="fa-solid fa-key"></i> การเข้าถึงหน้าต่างๆ
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;max-height:420px;overflow-y:auto;">
          <table class="rbac-table" id="rbac-page-table">
            <thead style="position:sticky;top:0;z-index:1;background:var(--surface);">
              <tr>
                <th style="width:200px;">หน้า</th>
                ${allRoles.map(r => `<th class="text-center" style="width:140px;"><span class="chip ${r.chip}" style="font-size:10px;">${r.label}</span></th>`).join('')}
              </tr>
            </thead>
            <tbody>${pageRows}</tbody>
          </table>
        </div>

        <div style="margin-top:8px;font-size:11px;color:var(--text-muted);line-height:1.5;">
          <i class="fa-solid fa-circle-info" style="opacity:.5;"></i>
          <strong>Super Admin</strong> สิทธิ์สูงสุด (ล็อก) &nbsp;&bull;&nbsp;
          <strong>Viewer</strong> เข้าได้ทุกหน้าแบบ read-only
        </div>

        <div class="modal-actions" style="margin-top:12px;">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          ${canEdit ? '<button class="btn btn-primary" id="rbac-save-btn"><i class="fa-solid fa-save"></i> บันทึก</button>' : ''}
        </div>
      </div>`
    );

    // ─── Wire up interactions ───
    setTimeout(() => {
      // Group toggle: check/uncheck all pages in group
      document.querySelectorAll('.rbac-group-toggle').forEach(toggle => {
        toggle.addEventListener('change', () => {
          const role = toggle.dataset.role;
          const pages = toggle.dataset.pages.split(',');
          pages.forEach(pid => {
            const cb = document.querySelector(`.rbac-cb[data-name="page|${role}|${pid}"]`);
            if (cb && !cb.disabled) cb.checked = toggle.checked;
          });
        });
      });

      // Save button
      document.getElementById('rbac-save-btn')?.addEventListener('click', () => {
        // Collect permission checkboxes
        document.querySelectorAll('.rbac-cb[data-name^="perm|"]').forEach(cb => {
          const parts = cb.dataset.name.split('|'); // perm|role|permName
          const roleKey = parts[1], permName = parts[2];
          if (rp[roleKey] && rp[roleKey].pages !== '*') {
            rp[roleKey][permName] = cb.checked;
          }
        });

        // Collect page access checkboxes
        self._editableRoles.forEach(r => {
          const checkedPages = [];
          document.querySelectorAll(`.rbac-cb[data-name^="page|${r.key}|"]`).forEach(cb => {
            if (cb.checked) {
              checkedPages.push(cb.dataset.name.split('|')[2]);
            }
          });
          // Viewer special: if all pages checked → use '*'
          const allPageIds = self._pageGroups.flatMap(g => g.pages.map(p => p.id));
          if (r.key === 'viewer' && checkedPages.length === allPageIds.length) {
            rp[r.key].pages = '*';
          } else {
            rp[r.key].pages = checkedPages;
          }
        });

        App.closeModal();
        App.toast('บันทึกสิทธิ์สำเร็จ', 'success');
        // Re-apply sidebar filter if user is logged in
        if (window.Auth && Auth.isAuthenticated()) {
          Auth.filterSidebar();
        }
        self._rerender();
      });
    }, 50);
  },
};
