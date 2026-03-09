/* ================================================================
   Page Module — Avatar Tenants (Avatar Sub-Platform View)
   Shows only TenantIDs that subscribe to the Avatar Sub-Platform
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.avatarTenants = {

  // ─── Plan badge helper ───
  _planChip(plan) {
    const map = {
      Pro:     { cls: 'chip-orange', icon: 'fa-crown' },
      Starter: { cls: 'chip-blue',   icon: 'fa-rocket' },
      Free:    { cls: 'chip-gray',   icon: 'fa-gift' },
    };
    const p = map[plan] || { cls: 'chip-gray', icon: 'fa-circle' };
    return `<span class="chip ${p.cls}"><i class="fa-solid ${p.icon}"></i> ${plan}</span>`;
  },

  // ─── Status chip helper ───
  _statusChip(status) {
    if (status === 'Active')    return `<span class="chip chip-green">Active</span>`;
    if (status === 'Pending')   return `<span class="chip chip-yellow">Pending</span>`;
    if (status === 'Suspended') return `<span class="chip chip-red">Suspended</span>`;
    return `<span class="chip chip-gray">${status}</span>`;
  },

  // ─── Get Avatar subscription for a tenant ───
  _avatarSub(tenantId) {
    return ((window.MockData.tenantSubscriptions || {})[tenantId] || [])
      .find(s => s.subPlatformCode === 'avatar') || null;
  },

  // ─── Count devices sold to tenant ───
  _deviceCount(tenantId) {
    return window.MockData.devices.filter(
      d => d.soldTo === tenantId && d.status !== 'Decommissioned'
    ).length;
  },

  // ─── Presets assigned to tenant ───
  _tenantPresets(tenantId) {
    return window.MockData.presets.filter(
      p => p.assignedTenants.includes(tenantId) && p.status === 'Active'
    );
  },

  // ─── Current preset running on a device (latest assign log) ───
  _currentPreset(deviceSn) {
    let latest = null;
    (window.MockData.assignLogs || []).forEach(al => {
      if (al.deviceSn === deviceSn && (!latest || al.timestamp > latest.timestamp)) latest = al;
    });
    return latest ? latest.newPresetName : null;
  },

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.avatarTenants.render();
    window.Pages.avatarTenants.init();
  },

  // ═══════════════════════════════════════════════════════════
  render() {
    const d    = window.MockData;
    const self = window.Pages.avatarTenants;

    // Only tenants with an Avatar subscription
    const avatarTenants = d.tenants.filter(t => !!self._avatarSub(t.id));

    // Stats
    const totalAv    = avatarTenants.length;
    const activeAv   = avatarTenants.filter(t => self._avatarSub(t.id)?.status === 'Active').length;
    const pendingAv  = avatarTenants.filter(t => self._avatarSub(t.id)?.status === 'Pending').length;
    const suspendedAv = avatarTenants.filter(t => self._avatarSub(t.id)?.status === 'Suspended').length;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">AVATAR TENANTS</h1>
          <div class="text-sm text-muted mt-2">TenantID ที่สมัครใช้งาน Live Interact Avatar</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" onclick="location.hash='service-builder'">
            <i class="fa-solid fa-link"></i> Assign Avatar
          </button>
          <button class="btn btn-primary" onclick="location.hash='devices'">
            <i class="fa-solid fa-display"></i> จัดการ Devices
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Avatar Subscribers</span>
            <div class="stat-icon orange"><i class="fa-solid fa-robot"></i></div>
          </div>
          <div class="stat-value mono">${totalAv}</div>
          <div class="stat-change up">จาก ${d.formatNumber(d.stats.totalTenants)} Tenants ทั้งหมด</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Active</span>
            <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
          </div>
          <div class="stat-value mono">${activeAv}</div>
          <div class="stat-change up">ใช้งานได้ปกติ</div>
        </div>
        <div class="stat-card" style="${pendingAv > 0 ? 'border:1.5px solid var(--warning);' : ''}">
          <div class="stat-header">
            <span class="stat-label">Pending Approval</span>
            <div class="stat-icon ${pendingAv > 0 ? 'yellow' : 'gray'}"><i class="fa-solid fa-clock"></i></div>
          </div>
          <div class="stat-value mono ${pendingAv > 0 ? 'text-warning' : ''}">${pendingAv}</div>
          <div class="stat-change ${pendingAv > 0 ? 'down' : 'up'}">${pendingAv > 0 ? 'รอตรวจสอบการชำระ' : 'ไม่มีรายการรอ'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Suspended</span>
            <div class="stat-icon red"><i class="fa-solid fa-ban"></i></div>
          </div>
          <div class="stat-value mono">${suspendedAv}</div>
          <div class="stat-change ${suspendedAv > 0 ? 'down' : 'up'}">${suspendedAv > 0 ? 'ต้องตรวจสอบ' : 'ปกติ'}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-12 mb-16">
        <div class="form-group" style="margin:0;min-width:150px;">
          <select id="av-filter-plan" class="form-input">
            <option value="">All Plans</option>
            <option value="Pro">Pro</option>
            <option value="Starter">Starter</option>
            <option value="Free">Free</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select id="av-filter-status" class="form-input">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="av-tenant-search" class="form-input" placeholder="Search by company name or ID...">
        </div>
      </div>

      <!-- Avatar Tenant Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TENANT</th>
              <th>AVATAR PLAN</th>
              <th>DEVICES</th>
              <th>TOKEN BALANCE</th>
              <th>RENEW DATE</th>
              <th>STATUS</th>
              <th>แก้ไขล่าสุด</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody id="av-tenant-table-body">
            ${avatarTenants.map(t => {
              const sub      = self._avatarSub(t.id);
              const devCount = self._deviceCount(t.id);
              const presets  = self._tenantPresets(t.id);
              return `
              <tr data-tenant-id="${t.id}"
                  data-plan="${sub.plan}"
                  data-status="${sub.status.toLowerCase()}"
                  data-name="${t.name.toLowerCase()}"
                  data-id-lower="${t.id.toLowerCase()}">
                <td>
                  <div class="flex items-center gap-12">
                    <div class="user-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0;">${t.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <a href="#" class="av-tenant-name-link font-600 text-primary" data-id="${t.id}">${t.name}</a>
                      <div class="text-xs text-muted mono">${t.id}</div>
                    </div>
                  </div>
                </td>
                <td>${self._planChip(sub.plan)}</td>
                <td>
                  <div class="flex items-center gap-6">
                    <span class="mono font-700">${devCount}</span>
                    <span class="text-xs text-muted">unit${devCount !== 1 ? 's' : ''}</span>
                    ${devCount > 0 ? `<button class="btn btn-sm btn-outline" style="padding:2px 8px;font-size:10px;" onclick="location.hash='devices'" title="ดู Devices"><i class="fa-solid fa-arrow-right"></i></button>` : ''}
                  </div>
                </td>
                <td>
                  <span class="mono font-600 ${t.tokenBalance < 500 ? 'text-error' : t.tokenBalance < 2000 ? 'text-warning' : ''}">${d.formatNumber(t.tokenBalance)}</span>
                  <span class="text-xs text-muted"> tokens</span>
                </td>
                <td class="text-sm text-muted mono">${sub.renewDate || '—'}</td>
                <td>${self._statusChip(sub.status)}</td>
                <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${t.modifiedDate || '-'}</div>${t.modifiedBy ? `<div class="text-xs text-dim">${t.modifiedBy.split('@')[0]}</div>` : ''}</td>
                <td>
                  <div class="flex gap-4 justify-end">
                    <button class="btn btn-sm btn-outline av-tenant-detail-btn" data-id="${t.id}" title="ดูรายละเอียด"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline" onclick="location.hash='service-builder'" title="Assign Avatar"><i class="fa-solid fa-link"></i></button>
                    ${sub.status === 'Pending' && (!window.Auth || Auth.hasPermission('canApprove')) ? `
                      <button class="btn btn-sm btn-success av-approve-btn" data-id="${t.id}" title="อนุมัติ"><i class="fa-solid fa-check"></i></button>
                      <button class="btn btn-sm btn-danger  av-reject-btn"  data-id="${t.id}" title="ปฏิเสธ"><i class="fa-solid fa-xmark"></i></button>` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="text-sm text-muted p-16">Showing ${avatarTenants.length} Avatar subscribers</div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════
  init() {
    const d    = window.MockData;
    const self = window.Pages.avatarTenants;

    // ─── Filters ───
    const searchEl  = document.getElementById('av-tenant-search');
    const filterPlan = document.getElementById('av-filter-plan');
    const filterSt  = document.getElementById('av-filter-status');

    function applyFilters() {
      const query  = (searchEl?.value || '').toLowerCase();
      const plan   = filterPlan?.value || '';
      const status = filterSt?.value || '';

      document.querySelectorAll('#av-tenant-table-body tr').forEach(row => {
        const name      = row.dataset.name    || '';
        const idLower   = row.dataset.idLower || '';
        const rowPlan   = row.dataset.plan    || '';
        const rowStatus = row.dataset.status  || '';

        const matchSearch = !query  || name.includes(query) || idLower.includes(query);
        const matchPlan   = !plan   || rowPlan === plan;
        const matchStatus = !status || rowStatus === status;

        row.style.display = (matchSearch && matchPlan && matchStatus) ? '' : 'none';
      });
    }

    searchEl?.addEventListener('input', applyFilters);
    filterPlan?.addEventListener('change', applyFilters);
    filterSt?.addEventListener('change', applyFilters);

    // ─── Detail modal ───
    document.querySelectorAll('.av-tenant-name-link, .av-tenant-detail-btn').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); self._showModal(el.dataset.id); });
    });

    // ─── Approve ───
    document.querySelectorAll('.av-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = self._avatarSub(btn.dataset.id);
        const tenant = d.tenants.find(t => t.id === btn.dataset.id);
        if (sub) {
          sub.status    = 'Active';
          sub.renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        }
        if (tenant) {
          tenant.modifiedDate = new Date().toISOString().split('T')[0];
          tenant.modifiedBy   = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
        }
        App.toast('อนุมัติ Avatar subscription แล้ว', 'success');
        self._rerender();
      });
    });

    // ─── Reject ───
    document.querySelectorAll('.av-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.confirm('ยืนยันการปฏิเสธ Avatar subscription?', {
          title: 'ปฏิเสธ Subscription', confirmText: 'ปฏิเสธ', type: 'danger',
        }).then(ok => {
          if (!ok) return;
          const subs = (d.tenantSubscriptions || {})[btn.dataset.id] || [];
          const idx  = subs.findIndex(s => s.subPlatformCode === 'avatar');
          if (idx !== -1) subs.splice(idx, 1);
          const tenant = d.tenants.find(t => t.id === btn.dataset.id);
          if (tenant) {
            tenant.modifiedDate = new Date().toISOString().split('T')[0];
            tenant.modifiedBy   = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
          }
          App.toast('ปฏิเสธ Avatar subscription แล้ว', 'error');
          self._rerender();
        });
      });
    });
  },

  // ═══════════════════════════════════════════════════════════
  _showModal(tenantId) {
    const d       = window.MockData;
    const t       = d.tenants.find(x => x.id === tenantId);
    if (!t) return;

    const self     = window.Pages.avatarTenants;
    const sub      = self._avatarSub(tenantId);
    const presets  = self._tenantPresets(tenantId);
    const devList  = d.devices.filter(dv => dv.soldTo === tenantId && dv.status !== 'Decommissioned');
    const acts     = (d.tokenActivities || {})[tenantId] || [];
    const meta     = (d.tenantMeta || {})[tenantId] || {};

    const presetRows = presets.map(p => `
      <div class="flex items-center gap-12 p-10 mb-8" style="background:var(--surface2);border-radius:8px;">
        <div style="width:32px;height:32px;border-radius:8px;background:#f15b26;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">AV</div>
        <div class="flex-1">
          <div class="font-600 text-sm">${p.name}</div>
          <div class="text-xs text-muted">${p.kbName ? `KB: ${p.kbName}` : 'ไม่มี Knowledge Base'}</div>
        </div>
        <span class="chip chip-green" style="font-size:10px;">${p.status}</span>
      </div>`).join('');

    const deviceRows = devList.map(dv => {
      const runningPreset = self._currentPreset(dv.sn);
      return `
      <div class="flex items-center gap-12 p-10 mb-8" style="background:var(--surface2);border-radius:8px;">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-dim);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-display" style="font-size:13px;color:var(--primary);"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-600 text-sm truncate">${dv.name}</div>
          <div class="text-xs text-muted mono">${dv.sn} · ${dv.modelName}</div>
          <div class="text-xs mt-3">
            <i class="fa-solid fa-robot" style="color:var(--primary);margin-right:4px;opacity:.8;"></i>
            ${runningPreset
              ? `<span class="font-500">${runningPreset}</span>`
              : '<span class="text-muted">ยังไม่มี Preset ที่ใช้งาน</span>'}
          </div>
        </div>
        <div class="flex gap-4 items-center flex-shrink-0">
          <span class="chip ${dv.online ? 'chip-green' : 'chip-gray'}" style="font-size:10px;">
            ${dv.online ? 'Online' : 'Offline'}
          </span>
          <span class="chip chip-blue" style="font-size:10px;">${dv.status}</span>
        </div>
      </div>`;
    }).join('');

    const actRows = acts.map(act => `
      <tr>
        <td class="mono text-sm">${act.date}</td>
        <td><span class="chip ${act.typeClass}" style="font-size:10px;">${act.type}</span></td>
        <td class="text-sm">${act.description}</td>
        <td class="mono text-sm text-right ${act.amount > 0 ? 'text-success' : 'text-error'}">${act.amount > 0 ? '+' : ''}${d.formatNumber(act.amount)}</td>
        <td class="mono text-sm text-right">${d.formatNumber(act.balance)}</td>
      </tr>`).join('');

    window.App.showModal(`
      <div class="modal modal-wide">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>

        <!-- Header -->
        <div class="flex items-center gap-16 mb-20">
          <div class="user-avatar" style="width:52px;height:52px;font-size:20px;flex-shrink:0;">${t.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="modal-title">${t.name}</div>
            <div class="text-sm text-muted">${t.email}</div>
          </div>
          <div class="flex-1"></div>
          ${sub ? self._planChip(sub.plan) : ''}
          ${sub ? self._statusChip(sub.status) : ''}
          <span class="mono text-xs text-muted">${t.id}</span>
        </div>

        <!-- Contact Strip -->
        <div class="flex gap-24 p-16 mb-16" style="background:var(--surface2);border-radius:10px;flex-wrap:wrap;">
          <div><div class="text-xs text-muted uppercase">Contact</div><div class="font-600 text-sm mt-2">${meta.contactPerson || '—'}</div></div>
          <div><div class="text-xs text-muted uppercase">Phone</div><div class="font-600 text-sm mt-2 mono">${t.phone}</div></div>
          <div><div class="text-xs text-muted uppercase">Joined</div><div class="font-600 text-sm mt-2 mono">${t.regDate}</div></div>
          <div><div class="text-xs text-muted uppercase">Renew Date</div><div class="font-600 text-sm mt-2 mono">${sub?.renewDate || '—'}</div></div>
        </div>

        <!-- Token Wallet -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-coins text-primary"></i>
            <span class="font-700 text-sm uppercase">Token Wallet</span>
          </div>
          <div class="grid-3 gap-16">
            <div>
              <div class="text-xs text-muted uppercase mb-4">Total Balance</div>
              <div class="mono font-700" style="font-size:26px;">${d.formatNumber(t.tokenBalance)}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">Subscription Tokens</div>
              <div class="mono font-700 text-primary" style="font-size:26px;">${d.formatNumber(t.bonusTokens)}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">Purchased Tokens</div>
              <div class="mono font-700 text-success" style="font-size:26px;">${d.formatNumber(t.purchasedTokens)}</div>
            </div>
          </div>
        </div>

        <!-- Presets Assigned -->
        <div class="card p-16 mb-16">
          <div class="flex items-center justify-between mb-12">
            <div class="flex items-center gap-8">
              <i class="fa-solid fa-robot" style="color:var(--primary);"></i>
              <span class="font-700 text-sm uppercase">Avatar Presets ที่ใช้ได้ (${presets.length})</span>
              <span class="chip chip-gray" style="font-size:10px;">pool</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="location.hash='service-builder';App.closeModal()">
              <i class="fa-solid fa-link"></i> Assign Avatar
            </button>
          </div>
          ${presets.length === 0 ? '<div class="text-sm text-muted">ยังไม่มี Preset ที่ assign</div>' : presetRows}
        </div>

        <!-- Devices -->
        <div class="card p-16 mb-16">
          <div class="flex items-center justify-between mb-12">
            <div class="flex items-center gap-8 flex-wrap">
              <i class="fa-solid fa-display text-muted"></i>
              <span class="font-700 text-sm uppercase">Devices (${devList.length})</span>
              <span class="text-xs text-muted" style="font-weight:400;">— แต่ละเครื่องใช้ 1 Preset ขณะ runtime</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="location.hash='devices';App.closeModal()">
              <i class="fa-solid fa-arrow-right"></i> Device Operations
            </button>
          </div>
          ${devList.length === 0 ? '<div class="text-sm text-muted">ยังไม่มี Device</div>' : deviceRows}
        </div>

        <!-- Recent Token Activity -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-clock-rotate-left text-muted"></i>
            <span class="font-700 text-sm uppercase">Recent Token Activity</span>
          </div>
          ${acts.length === 0 ? '<div class="text-sm text-muted">ไม่มีประวัติ</div>' : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th class="text-right">Amount</th><th class="text-right">Balance</th></tr></thead>
              <tbody>${actRows}</tbody>
            </table>
          </div>`}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" onclick="location.hash='billing';App.closeModal()">
            <i class="fa-solid fa-receipt"></i> ดู Invoice
          </button>
          ${sub?.status === 'Pending' && (!window.Auth || Auth.hasPermission('canApprove')) ? `
            <button class="btn btn-success btn-sm" id="modal-av-approve-btn">
              <i class="fa-solid fa-check"></i> อนุมัติ Subscription
            </button>
            <button class="btn btn-danger btn-sm" id="modal-av-reject-btn">
              <i class="fa-solid fa-xmark"></i> ปฏิเสธ
            </button>` : ''}
        </div>
      </div>
    `);

    // Approve from modal
    document.getElementById('modal-av-approve-btn')?.addEventListener('click', () => {
      const s = self._avatarSub(tenantId);
      if (s) { s.status = 'Active'; s.renewDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10); }
      App.toast('อนุมัติ Avatar subscription แล้ว', 'success');
      App.closeModal();
      self._rerender();
    });

    // Reject from modal
    document.getElementById('modal-av-reject-btn')?.addEventListener('click', () => {
      App.confirm('ยืนยันการปฏิเสธ Avatar subscription?', {
        title: 'ปฏิเสธ', confirmText: 'ปฏิเสธ', type: 'danger',
      }).then(ok => {
        if (!ok) return;
        const subs = (d.tenantSubscriptions || {})[tenantId] || [];
        const idx  = subs.findIndex(s => s.subPlatformCode === 'avatar');
        if (idx !== -1) subs.splice(idx, 1);
        App.toast('ปฏิเสธ subscription แล้ว', 'error');
        App.closeModal();
        self._rerender();
      });
    });
  },
};
