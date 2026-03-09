/* ================================================================
   Page Module — Avatar Settings (A-FR37-40)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.avatarSettings = {
  render() {
    const d = window.MockData;
    const av = d.avatarDefaults;
    const activePresets = d.presets.filter(p => p.status === 'Active');
    const defaultPreset = d.presets.find(p => p.id === av.systemDefaultPresetId);
    const pp = window.Pages.plansPackages;

    const onboardingSteps = [
      { step: 1, desc: 'Tenant Registration (self-service)', actor: 'Tenant', page: 'tenants', icon: 'fa-user-plus' },
      { step: 2, desc: 'Subscribe Plan', actor: 'Tenant', page: 'billing', icon: 'fa-tags' },
      { step: 3, desc: 'Hardware Intake', actor: 'Admin', page: 'hardware', icon: 'fa-box-open' },
      { step: 4, desc: 'Record Sale', actor: 'Admin', page: 'hardware', icon: 'fa-receipt' },
      { step: 5, desc: 'Device Activation', actor: 'Tenant/Admin', page: 'devices', icon: 'fa-power-off' },
      { step: 6, desc: 'รับ Document จากลูกค้า', actor: 'Admin', page: 'knowledge-base', icon: 'fa-file-arrow-up' },
      { step: 7, desc: 'สร้าง Knowledge Base', actor: 'Admin', page: 'knowledge-base', icon: 'fa-database' },
      { step: 8, desc: 'สร้าง Avatar Preset', actor: 'Admin', page: 'service-builder', icon: 'fa-robot' },
      { step: 9, desc: 'Assign Preset ให้ Tenant', actor: 'Admin', page: 'devices', icon: 'fa-link' },
      { step: 10, desc: 'ตรวจสอบ & ยืนยัน', actor: 'Admin', page: 'tenants', icon: 'fa-clipboard-check' },
      { step: 11, desc: 'แจ้ง Tenant', actor: 'System', page: 'tenants', icon: 'fa-bell' },
    ];

    const actorChip = actor => {
      if (actor === 'Tenant') return '<span class="chip chip-blue">Tenant</span>';
      if (actor === 'Admin') return '<span class="chip chip-orange">Admin</span>';
      if (actor === 'System') return '<span class="chip chip-green">System</span>';
      return `<span class="chip chip-gray">${actor}</span>`;
    };

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">AVATAR DEFAULTS</h1>
        <div class="text-sm text-muted">การตั้งค่าระบบสำหรับ Avatar Sub-Platform (A-FR37-40)</div>
      </div>

      <!-- Shortcut Banner -->
      <div class="banner-info mb-20">
        <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
        <div class="flex-1 flex items-center justify-between flex-wrap gap-10">
          <div class="text-sm">
            Welcome Bonus Tokens และ Token Packages ย้ายไปที่หน้า <strong>Plans & Packages</strong> แล้ว
          </div>
          <button class="btn btn-outline btn-sm" onclick="location.hash='plans-packages'">
            <i class="fa-solid fa-arrow-right"></i> ไปที่ Plans & Packages
          </button>
        </div>
      </div>

      <!-- ─── Section 2: System Default Preset ─── -->
      <div class="divider mb-28"></div>
      <div class="section-title mb-16">
        <i class="fa-solid fa-star text-primary"></i> SYSTEM DEFAULT PRESET
      </div>

      <div class="banner-info mb-16">
        <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
        <div class="flex-1">
          <div class="text-sm">
            System Default แสดงให้ทุก Tenant ใหม่โดยอัตโนมัติ พร้อม Badge
            <span class="chip chip-orange" style="margin-left:4px;">System Default</span>
          </div>
        </div>
      </div>

      <div class="card-accent p-24 mb-32">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-muted uppercase mb-6">Preset ปัจจุบัน</div>
            <div class="font-700" style="font-size:22px;">${av.systemDefaultPresetName}</div>
            <div class="flex items-center gap-8 mt-8">
              <span class="chip chip-orange">System Default</span>
              <span class="mono text-xs text-muted">${defaultPreset ? defaultPreset.id : '-'}</span>
            </div>
          </div>
          <div class="flex-col gap-8" style="text-align:right;">
            <div class="text-xs text-muted uppercase">ตั้งค่าวันที่</div>
            <div class="mono text-sm font-600">${av.systemDefaultSetDate}</div>
            <div class="text-xs text-muted">โดย ${av.systemDefaultSetBy}</div>
            ${(!window.Auth || Auth.hasPermission('canEdit')) ? '<button class="btn btn-primary btn-sm mt-8" id="btn-change-preset"><i class="fa-solid fa-rotate"></i> เปลี่ยน</button>' : ''}
          </div>
        </div>
      </div>

      <!-- ─── Section 4: Onboarding Checklist ─── -->
      <div class="divider mb-28"></div>
      <div class="section-title mb-16">
        <i class="fa-solid fa-list-check text-primary"></i> ONBOARDING CHECKLIST
      </div>
      <div class="text-sm text-muted mb-20">11 ขั้นตอนในการ Onboard Tenant ใหม่ (อ่านอย่างเดียว)</div>

      <div class="flex-col gap-10 mb-32">
        ${onboardingSteps.map(s => `
          <div class="card p-16" style="border-left:3px solid var(--border);">
            <div class="flex items-center gap-16">
              <div style="min-width:36px;height:36px;border-radius:50%;background:var(--surface2);border:2px solid var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:var(--primary);">${s.step}</div>
              <div class="flex-1">
                <div class="flex items-center gap-10 flex-wrap">
                  <i class="fa-solid ${s.icon} text-muted text-sm"></i>
                  <span class="font-600">${s.desc}</span>
                  ${actorChip(s.actor)}
                </div>
              </div>
              <a class="btn btn-ghost btn-sm" onclick="App.navigate('${s.page}');return false;" href="#${s.page}" style="white-space:nowrap;">
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> ไปหน้า
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  init() {
    const d = window.MockData;

    // ─── Change System Default Preset Modal ───
    const changePresetBtn = document.getElementById('btn-change-preset');
    if (changePresetBtn) {
      changePresetBtn.addEventListener('click', () => {
        const d = window.MockData;
        const activePresets = d.presets.filter(p => p.status === 'Active');
        const currentId = d.avatarDefaults.systemDefaultPresetId;

        const html = `
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title"><i class="fa-solid fa-star text-primary"></i> เปลี่ยน System Default Preset</div>
            <div class="modal-subtitle">Preset ปัจจุบัน: <strong>${d.avatarDefaults.systemDefaultPresetName}</strong></div>

            <div class="form-group mb-20">
              <label class="form-label">เลือก Preset ใหม่ (เฉพาะ Active)</label>
              <select class="form-input" id="new-preset-select">
                <option value="">— เลือก Preset —</option>
                ${activePresets.map(p => `
                  <option value="${p.id}" ${p.id === currentId ? 'selected' : ''}>${p.name}${p.id === currentId ? ' (ปัจจุบัน)' : ''}</option>
                `).join('')}
              </select>
            </div>

            <div class="banner-info mb-16">
              <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
              <div class="text-sm">การเปลี่ยน Preset จะอัปเดต Badge "System Default" บน Preset ทันที</div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="confirm-preset-save">
                <i class="fa-solid fa-save"></i> บันทึก
              </button>
            </div>
          </div>
        `;
        window.App.showModal(html);

        setTimeout(() => {
          const saveBtn = document.getElementById('confirm-preset-save');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              const d = window.MockData;
              const select = document.getElementById('new-preset-select');
              const newId = select.value;
              if (!newId) {
                App.toast('กรุณาเลือก Preset', 'error');
                return;
              }
              if (newId === d.avatarDefaults.systemDefaultPresetId) {
                App.toast('Preset เลือกเป็น Preset ปัจจุบันอยู่แล้ว', 'warning');
                return;
              }

              const newPreset = d.presets.find(p => p.id === newId);
              if (!newPreset) return;

              // Remove isDefault from all presets
              d.presets.forEach(p => { p.isDefault = false; });
              // Set new default
              newPreset.isDefault = true;

              // Update avatarDefaults
              const today = new Date().toISOString().slice(0, 10);
              d.avatarDefaults.systemDefaultPresetId = newId;
              d.avatarDefaults.systemDefaultPresetName = newPreset.name;
              d.avatarDefaults.systemDefaultSetDate = today;
              d.avatarDefaults.systemDefaultSetBy = 'Admin';

              window.App.closeModal();
              // Re-render
              const ct = document.getElementById('content');
              ct.innerHTML = window.Pages.avatarSettings.render();
              window.Pages.avatarSettings.init();
            });
          }
        }, 50);
      });
    }
  }
};
