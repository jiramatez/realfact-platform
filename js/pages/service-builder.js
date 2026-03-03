/* ================================================================
   Page Module — Assign Avatar
   Avatars are pushed from AI Framework; Admin assigns them to Tenants
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.serviceBuilder = {

  _rerender() {
    const ct = document.getElementById('content');
    if (ct) {
      ct.innerHTML = window.Pages.serviceBuilder.render();
      window.Pages.serviceBuilder.init();
    }
  },

  render() {
    const d = window.MockData;
    const avatars = d.presets;
    const totalAvatars  = avatars.length;
    const activeAvatars = avatars.filter(p => p.status === 'Active').length;
    const defaultCount = avatars.filter(p => p.isDefault).length;

    const avatarIcons = {
      'Female Thai Professional': 'fa-user-tie',
      'Male Thai Formal':         'fa-user',
      'Female Thai Casual':       'fa-face-smile',
      'Female Thai Medical':      'fa-user-doctor',
      'Male Thai Hospitality':    'fa-concierge-bell',
    };

    function renderAvatarCard(p) {
      const iconClass = avatarIcons[p.avatarName] || 'fa-user-circle';

      // Assigned tenant chips (max 2 visible + overflow)
      const tenantChips = p.assignedTenants.map(tid => {
        const t = d.tenants.find(tn => tn.id === tid);
        return t ? `<span class="chip chip-gray" style="font-size:10px;">${t.name}</span>` : '';
      });
      const visibleChips = tenantChips.slice(0, 2).join('');
      const overflowChip = tenantChips.length > 2
        ? `<span class="chip chip-gray" style="font-size:10px;">+${tenantChips.length - 2}</span>` : '';

      return `
        <div class="card p-16 card-hover" data-avatar-id="${p.id}"
          style="${p.status === 'Draft' ? 'opacity:0.65;' : ''}cursor:pointer;
            border-left:3px solid ${p.status === 'Active' ? 'var(--primary)' : 'var(--border)'};">

          <!-- Top row: icon + name + status + default toggle -->
          <div class="flex items-start gap-10 mb-10">
            <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;
              background:var(--primary-dim);
              display:flex;align-items:center;justify-content:center;">
              <i class="fa-solid ${iconClass}" style="font-size:15px;color:var(--primary);"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-700 truncate mb-2" style="font-size:13px;">${p.name}</div>
              <div class="flex items-center gap-6 flex-wrap">
                ${d.statusChip(p.status)}
                ${p.suggested ? '<span class="chip chip-blue" style="font-size:10px;">Suggested</span>' : ''}
              </div>
            </div>
            <button class="avatar-toggle-default btn btn-sm"
              data-id="${p.id}" onclick="event.stopPropagation()"
              title="${p.isDefault ? 'ยกเลิก System Default' : 'ตั้งเป็น System Default'}"
              style="flex-shrink:0;padding:4px 8px;
                ${p.isDefault
                  ? 'background:rgba(251,146,60,.15);color:#fb923c;border:1px solid rgba(251,146,60,.4);'
                  : 'opacity:.4;'}">
              <i class="fa-solid fa-star"></i>
            </button>
          </div>

          <!-- Meta row -->
          <div class="flex-col gap-4 mb-10" style="font-size:11px;color:var(--text-muted);">
            <div class="truncate">
              <i class="fa-solid fa-user" style="width:13px;"></i> ${p.avatarName}
            </div>
            <div class="truncate">
              <i class="fa-solid fa-microphone" style="width:13px;"></i> ${p.voiceName}
            </div>
            <div class="truncate">
              <i class="fa-solid fa-book" style="width:13px;color:var(--primary);opacity:.8;"></i>
              ${p.kbName || '<span style="opacity:.5;">ไม่มี KB</span>'}
            </div>
          </div>

          <!-- Divider -->
          <div style="height:1px;background:var(--border);margin:8px 0;"></div>

          <!-- Bottom row: assigned tenants + assign button -->
          <div class="flex items-center justify-between gap-8">
            <div class="flex items-center gap-4 flex-wrap" style="min-width:0;flex:1;">
              ${p.assignedTenants.length === 0
                ? '<span style="font-size:11px;color:var(--text-dim);">ยังไม่ Assign</span>'
                : visibleChips + overflowChip}
            </div>
            <button class="btn btn-sm btn-primary avatar-assign-btn" data-id="${p.id}"
              onclick="event.stopPropagation()" style="flex-shrink:0;">
              <i class="fa-solid fa-link"></i> Assign
            </button>
          </div>
        </div>`;
    }

    // Build tenant options for filter
    const allTenantIds = [...new Set(avatars.flatMap(p => p.assignedTenants))];
    const tenantOptions = d.tenants
      .filter(t => allTenantIds.includes(t.id))
      .map(t => `<option value="${t.id}">${t.name} (${t.id})</option>`)
      .join('');

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">ASSIGN AVATAR</h1>
          <div class="text-sm text-muted mt-2">มอบหมาย Avatar ให้ Tenant — Avatar ถูกส่งมาจาก AI Framework</div>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="banner-info mb-20">
        <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
        <div class="flex-1 text-sm">
          Avatar ทั้งหมดถูก <strong>sync จาก AI Framework</strong> อัตโนมัติ
          — Admin เพียงเลือก Assign ให้ TenantID ที่ต้องการ
        </div>
      </div>

      <!-- Stats (compact) -->
      <div class="grid-3 gap-16 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Avatar ทั้งหมด</span>
            <div class="stat-icon blue"><i class="fa-solid fa-robot"></i></div>
          </div>
          <div class="stat-value mono">${totalAvatars}</div>
          <div class="stat-change up">${activeAvatars} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Tenants ที่ Assign แล้ว</span>
            <div class="stat-icon green"><i class="fa-solid fa-building"></i></div>
          </div>
          <div class="stat-value mono">${new Set(avatars.flatMap(p => p.assignedTenants)).size}</div>
          <div class="stat-change up">Unique Tenants</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">System Default</span>
            <div class="stat-icon orange"><i class="fa-solid fa-star"></i></div>
          </div>
          <div class="stat-value mono">${defaultCount}</div>
          <div class="stat-change up">Demo Avatar${defaultCount !== 1 ? 's' : ''} พร้อมใช้</div>
        </div>
      </div>

      <!-- Filter Row: Tab + Tenant filter -->
      <div class="flex items-center gap-12 mb-16 flex-wrap">
        <div class="tab-bar">
          <div class="tab-item active" data-tab="all">ทั้งหมด</div>
          <div class="tab-item" data-tab="assigned">Assign แล้ว</div>
          <div class="tab-item" data-tab="unassigned">ยังไม่ Assign</div>
          <div class="tab-item" data-tab="default">System Default</div>
        </div>
        <div class="flex items-center gap-8 ml-auto">
          <i class="fa-solid fa-filter text-muted text-sm"></i>
          <select class="form-input" id="avatar-tenant-filter" style="min-width:200px;">
            <option value="">Tenant ทั้งหมด</option>
            ${tenantOptions}
          </select>
        </div>
      </div>

      <!-- Avatar Grid -->
      <div class="grid-3 gap-14" id="avatar-grid">
        ${avatars.map(p => renderAvatarCard(p)).join('')}
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.serviceBuilder;

    // ─── Combined filter: Tab + Tenant ───
    let activeTab    = 'all';
    let activeTenant = '';

    function applyFilters() {
      document.querySelectorAll('#avatar-grid .card').forEach(card => {
        const p = d.presets.find(pr => pr.id === card.dataset.avatarId);
        if (!p) return;
        let show = true;
        if (activeTab === 'assigned')   show = p.assignedTenants.length > 0;
        if (activeTab === 'unassigned') show = p.assignedTenants.length === 0;
        if (activeTab === 'default')    show = !!p.isDefault;
        if (show && activeTenant)       show = p.assignedTenants.includes(activeTenant);
        card.style.display = show ? '' : 'none';
      });
    }

    document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item[data-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        applyFilters();
      });
    });

    document.getElementById('avatar-tenant-filter')?.addEventListener('change', function () {
      activeTenant = this.value;
      // Auto-switch to "assigned" tab when a tenant is selected
      if (activeTenant && activeTab === 'unassigned') {
        activeTab = 'all';
        document.querySelectorAll('.tab-item[data-tab]').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === 'all');
        });
      }
      applyFilters();
    });

    // ─── Open Detail Modal (card click, not button) ───
    document.querySelectorAll('#avatar-grid .card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const p = d.presets.find(pr => pr.id === card.dataset.avatarId);
        if (p) openDetailModal(p);
      });
    });

    // ─── Assign Button on card ───
    document.querySelectorAll('.avatar-assign-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = d.presets.find(pr => pr.id === btn.dataset.id);
        if (p) openAssignModal(p);
      });
    });

    // ─── Toggle System Default ───
    document.querySelectorAll('.avatar-toggle-default').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = d.presets.find(pr => pr.id === btn.dataset.id);
        if (!p) return;
        p.isDefault = !p.isDefault;
        self._rerender();
        App.toast(
          p.isDefault
            ? `<i class="fa-solid fa-star" style="color:#fb923c;"></i> ตั้ง "${p.name}" เป็น System Default แล้ว`
            : `ยกเลิก Default ของ "${p.name}" แล้ว`,
          p.isDefault ? 'success' : 'info'
        );
      });
    });

    // ─── Detail Modal (read-only info) ───
    function openDetailModal(p) {
      const avatarIcons = {
        'Female Thai Professional': 'fa-user-tie',
        'Male Thai Formal':         'fa-user',
        'Female Thai Casual':       'fa-face-smile',
        'Female Thai Medical':      'fa-user-doctor',
        'Male Thai Hospitality':    'fa-concierge-bell',
      };
      const iconClass = avatarIcons[p.avatarName] || 'fa-user-circle';

      const tenantNames = p.assignedTenants.map(tid => {
        const t = d.tenants.find(tn => tn.id === tid);
        return t ? `<span class="chip chip-blue" style="margin-bottom:4px;">${t.name}</span>` : '';
      }).join(' ');

      const modelNames = p.compatibleModels.map(mid => {
        const m = d.deviceModels.find(dm => dm.id === mid);
        return m ? `<span class="chip chip-gray" style="margin-bottom:4px;">${m.name}</span>` : '';
      }).join(' ');

      window.App.showModal(`
        <div class="modal modal-wide">
          <button class="modal-close" onclick="App.closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-16 mb-4">
            <div style="width:52px;height:52px;border-radius:14px;background:var(--primary-dim);
              display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid ${iconClass}" style="font-size:22px;color:var(--primary);"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="modal-title" style="margin-bottom:0;">${p.name}</div>
              <div class="mono text-xs text-muted">${p.id}</div>
            </div>
            <div>${d.statusChip(p.status)}</div>
          </div>
          <div class="modal-subtitle">
            ${p.suggested ? '<span class="chip chip-blue" style="margin-right:6px;">Suggested</span>' : ''}
            ${p.isDefault ? '<span class="chip chip-orange">System Default</span>' : ''}
          </div>

          <!-- Info rows -->
          <div class="grid-2 gap-12 mb-16">
            <div class="card p-16">
              <div class="text-xs text-muted uppercase mb-6">Avatar</div>
              <div class="font-600 text-sm">
                <i class="fa-solid fa-user text-primary" style="margin-right:6px;"></i>${p.avatarName}
              </div>
            </div>
            <div class="card p-16">
              <div class="text-xs text-muted uppercase mb-6">Voice</div>
              <div class="font-600 text-sm">
                <i class="fa-solid fa-microphone text-primary" style="margin-right:6px;"></i>${p.voiceName}
              </div>
            </div>
          </div>

          <div class="card p-16 mb-16">
            <div class="text-xs text-muted uppercase mb-6">Agent Prompt</div>
            <div class="text-sm" style="line-height:1.7;color:var(--text);">${p.agentPrompt}</div>
          </div>

          <div class="card p-16 mb-16">
            <div class="text-xs text-muted uppercase mb-6">Knowledge Base</div>
            <div class="font-600 text-sm">
              ${p.kbName
                ? `<i class="fa-solid fa-book text-primary" style="margin-right:6px;"></i>${p.kbName}`
                : '<span class="text-muted">ไม่มี KB</span>'}
            </div>
          </div>

          <div class="card p-16 mb-16">
            <div class="text-xs text-muted uppercase mb-8">Tenants ที่ Assign แล้ว
              <span class="chip chip-gray" style="font-size:10px;margin-left:6px;">${p.assignedTenants.length}</span>
            </div>
            ${tenantNames || '<span class="text-muted text-sm">ยังไม่มี Tenant</span>'}
          </div>

          <div class="card p-16 mb-20">
            <div class="text-xs text-muted uppercase mb-8">รุ่นอุปกรณ์ที่รองรับ</div>
            ${modelNames || '<span class="text-muted text-sm">ไม่มีข้อมูล</span>'}
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
            <button class="btn btn-primary" id="detail-open-assign">
              <i class="fa-solid fa-link"></i> Assign ให้ Tenant
            </button>
          </div>
        </div>
      `);

      setTimeout(() => {
        document.getElementById('detail-open-assign')?.addEventListener('click', () => {
          App.closeModal();
          openAssignModal(p);
        });
      }, 50);
    }

    // ─── Assign Modal (with Tenant search) ───
    function openAssignModal(p) {
      const planSlots    = { 'Free': 1, 'Starter': 5, 'Pro': null };
      const activeTenants = d.tenants.filter(t => t.status === 'Active');

      const tenantItemsHtml = activeTenants.map(t => {
        const isAssigned  = p.assignedTenants.includes(t.id);
        const slotLimit   = planSlots[t.plan];
        const slotLabel   = slotLimit === null ? 'ไม่จำกัด' : `${slotLimit} Avatar`;
        const currentCount = d.presets.filter(pr => pr.id !== p.id && pr.assignedTenants.includes(t.id)).length;
        const wouldExceed  = slotLimit !== null && !isAssigned && (currentCount + 1) > slotLimit;

        return `
          <label class="flex items-center gap-12 assign-tenant-item"
            data-name="${t.name.toLowerCase()}"
            style="padding:12px 16px;border-radius:10px;
              border:1px solid ${isAssigned ? 'var(--primary)' : 'var(--border)'};
              background:${isAssigned ? 'var(--primary-dim)' : 'var(--surface2)'};
              cursor:pointer;transition:border-color .15s,background .15s;">
            <input type="checkbox" name="assignTenant" value="${t.id}"
              ${isAssigned ? 'checked' : ''}
              style="width:16px;height:16px;accent-color:var(--primary);flex-shrink:0;">
            <div class="flex-1 min-w-0">
              <div class="font-600 text-sm">${t.name}</div>
              <div class="text-xs text-muted mono">${t.id}</div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-xs font-600">${t.plan}</div>
              <div class="text-xs ${wouldExceed ? 'text-warning' : 'text-muted'}">${slotLabel}</div>
            </div>
          </label>`;
      }).join('');

      window.App.showModal(`
        <div class="modal modal-wide">
          <button class="modal-close" onclick="App.closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-title">
            <i class="fa-solid fa-link text-primary"></i> Assign Avatar ให้ Tenant
          </div>
          <div class="modal-subtitle">
            Avatar: <strong>${p.name}</strong>
            <span class="chip chip-gray" style="margin-left:8px;font-size:11px;">
              Assign แล้ว ${p.assignedTenants.length} Tenant
            </span>
          </div>

          <!-- Slot Info -->
          <div class="alert-warning mb-16">
            <i class="fa-solid fa-circle-info"></i>
            <span class="text-sm">
              <strong>Free</strong> = 1 Avatar &nbsp;·&nbsp;
              <strong>Starter</strong> = 5 Avatars &nbsp;·&nbsp;
              <strong>Pro</strong> = ไม่จำกัด
            </span>
          </div>

          <!-- Search -->
          <div class="search-bar mb-12">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="assign-tenant-search" placeholder="ค้นหา Tenant...">
          </div>

          <!-- Tenant List -->
          <div class="flex-col gap-8 mb-4" id="assign-tenant-list"
            style="max-height:320px;overflow-y:auto;padding-right:2px;">
            ${tenantItemsHtml || '<div class="text-muted text-sm p-16 text-center">ไม่มี Tenant ที่ Active</div>'}
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="btn-save-assign">
              <i class="fa-solid fa-check"></i> บันทึก
            </button>
          </div>
        </div>
      `);

      setTimeout(() => {
        // ─── Live search filter ───
        const searchInput = document.getElementById('assign-tenant-search');
        if (searchInput) {
          searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            document.querySelectorAll('.assign-tenant-item').forEach(item => {
              item.style.display = (!q || item.dataset.name.includes(q)) ? '' : 'none';
            });
          });
        }

        // ─── Checkbox border highlight ───
        document.querySelectorAll('input[name="assignTenant"]').forEach(chk => {
          chk.addEventListener('change', () => {
            const label = chk.closest('label');
            if (label) {
              label.style.borderColor = chk.checked ? 'var(--primary)' : 'var(--border)';
              label.style.background  = chk.checked ? 'var(--primary-dim)' : 'var(--surface2)';
            }
          });
        });

        // ─── Save ───
        document.getElementById('btn-save-assign')?.addEventListener('click', () => {
          const selected = [...document.querySelectorAll('input[name="assignTenant"]:checked')]
            .map(c => c.value);

          // Validate slot limits
          for (const tid of selected) {
            const tenant = d.tenants.find(t => t.id === tid);
            if (!tenant) continue;
            const limit = planSlots[tenant.plan];
            if (limit === null) continue;
            const currentCount = d.presets.filter(pr => pr.id !== p.id && pr.assignedTenants.includes(tid)).length;
            if (!p.assignedTenants.includes(tid) && (currentCount + 1) > limit) {
              App.toast(`${tenant.name} (${tenant.plan}) เกินขีดจำกัด ${limit} Avatar แล้ว`, 'warning');
              return;
            }
          }

          p.assignedTenants = selected;
          App.closeModal();
          self._rerender();
          App.toast(`Assign Avatar สำเร็จ — ${selected.length} Tenant`, 'success');
        });
      }, 50);
    }
  },
};
