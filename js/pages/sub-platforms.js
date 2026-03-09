/* ================================================================
   Page Module — Sub-Platform Management
   ================================================================ */

// ─── Exchange Rate Helpers ───
const EXCHANGE_RATE_UNITS = [
  { value: 'Minute',    label: 'Minute (นาที)' },
  { value: 'Request',   label: 'Request (คำขอ)' },
  { value: 'Session',   label: 'Session (เซสชัน)' },
  { value: 'Call',      label: 'Call (การเรียก API)' },
  { value: 'Message',   label: 'Message (ข้อความ)' },
  { value: 'Character', label: 'Character (ตัวอักษร)' },
];

function buildExchangeRateString(value, unit) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return '1 Token = 1 Unit';
  const display = num % 1 === 0 ? String(Math.round(num)) : num.toFixed(2).replace(/0+$/, '');
  return `1 Token = ${display} ${unit}`;
}

function parseExchangeRate(str) {
  if (!str) return { value: 1, unit: 'Minute' };
  const match = str.match(/1\s*Token\s*=\s*([\d.]+)\s*(\w+)/i);
  if (!match) return { value: 1, unit: 'Minute' };
  const val = parseFloat(match[1]);
  const rawUnit = match[2];
  const found = EXCHANGE_RATE_UNITS.find(u => u.value.toLowerCase() === rawUnit.toLowerCase());
  return { value: isNaN(val) ? 1 : val, unit: found ? found.value : rawUnit };
}

function renderExchangeRateInputs(prefix, currentValue, currentUnit) {
  const val = currentValue || 1;
  const unit = currentUnit || 'Minute';
  const options = EXCHANGE_RATE_UNITS.map(u =>
    `<option value="${u.value}" ${u.value === unit ? 'selected' : ''}>${u.label}</option>`
  ).join('');

  return `
    <div class="flex items-center gap-8 mb-6">
      <span class="text-sm mono font-600" style="white-space:nowrap;">1 Token =</span>
      <input type="number" class="form-input" id="${prefix}-rate-value" value="${val}" min="0.01" max="10000" step="0.01" style="width:100px;">
      <select class="form-input" id="${prefix}-rate-unit" style="width:200px;">
        ${options}
      </select>
    </div>
    <div id="${prefix}-rate-preview" class="text-xs text-muted mt-2" style="padding-left:2px;">
      <i class="fa-solid fa-eye"></i> ตัวอย่าง: ${buildExchangeRateString(val, unit)}
    </div>
  `;
}

function bindExchangeRatePreview(prefix) {
  const valInput = document.getElementById(`${prefix}-rate-value`);
  const unitSelect = document.getElementById(`${prefix}-rate-unit`);
  const preview = document.getElementById(`${prefix}-rate-preview`);
  if (!valInput || !unitSelect || !preview) return;

  const update = () => {
    preview.innerHTML = `<i class="fa-solid fa-eye"></i> ตัวอย่าง: ${buildExchangeRateString(valInput.value, unitSelect.value)}`;
  };
  valInput.addEventListener('input', update);
  unitSelect.addEventListener('change', update);
}

function validateExchangeRate(prefix) {
  const valInput = document.getElementById(`${prefix}-rate-value`);
  if (!valInput) return null;
  const num = parseFloat(valInput.value);
  if (isNaN(num) || num <= 0) {
    App.toast('อัตราแลกเปลี่ยนต้องมากกว่า 0', 'error');
    valInput.focus();
    return null;
  }
  if (num > 10000) {
    App.toast('อัตราแลกเปลี่ยนต้องไม่เกิน 10,000', 'error');
    valInput.focus();
    return null;
  }
  // Check max 2 decimal places
  const parts = valInput.value.split('.');
  if (parts[1] && parts[1].length > 2) {
    App.toast('ทศนิยมไม่เกิน 2 ตำแหน่ง', 'error');
    valInput.focus();
    return null;
  }
  const unit = document.getElementById(`${prefix}-rate-unit`).value;
  return { value: num, unit };
}

window.Pages = window.Pages || {};
window.Pages.subPlatforms = {
  render() {
    const d = window.MockData;
    const platforms = d.subPlatforms;

    // NOTE: Cost Configuration and Margin Configuration sections have been
    // moved to the Cost & Pricing page (cost-pricing.js).

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">SUB-PLATFORM MANAGEMENT</h1>
        <div class="page-header-actions">
          ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-primary" id="btn-create-platform">
            <i class="fa-solid fa-plus"></i> สร้าง Sub-Platform
          </button>` : ''}
        </div>
      </div>

      <!-- Sub-Platform Cards -->
      <div class="grid-2 gap-16 mb-28">
        ${platforms.map(sp => `
          <div class="card-accent card-hover p-20" data-sp-id="${sp.id}">
            <!-- Header -->
            <div class="flex items-center justify-between mb-12">
              <div>
                <div class="heading" style="font-size:18px;">${sp.name}</div>
                <div class="flex items-center gap-8 mt-4">
                  <span class="chip chip-gray mono">${sp.code}</span>
                  ${d.statusChip(sp.status)}
                </div>
              </div>
              <div style="width:40px;height:40px;border-radius:10px;background:${sp.primaryColor};display:flex;align-items:center;justify-content:center;">
                <i class="fa-solid fa-cube" style="color:#fff;font-size:18px;"></i>
              </div>
            </div>

            <!-- Domain -->
            <div class="flex items-center gap-6 mb-12">
              <i class="fa-solid fa-globe text-muted text-xs"></i>
              <span class="mono text-primary text-sm">${sp.domain}</span>
            </div>

            <!-- Stats Grid -->
            <div class="grid-2 gap-10 mb-12">
              <div class="card p-16">
                <div class="text-xs text-muted uppercase">TENANT</div>
                <div class="mono font-600">${d.formatNumber(sp.tenants)}</div>
              </div>
              <div class="card p-16">
                <div class="text-xs text-muted uppercase">รายได้</div>
                <div class="mono font-600 text-sm">${d.formatCurrency(sp.revenue)}</div>
              </div>
              <div class="card p-16">
                <div class="text-xs text-muted uppercase">TOKEN ใช้งาน</div>
                <div class="mono font-600">${d.formatNumber(sp.tokenUsage)}</div>
              </div>
              <div class="card p-16">
                <div class="text-xs text-muted uppercase">แพลน</div>
                <div class="mono font-600">${sp.plans.length}</div>
              </div>
            </div>

            <!-- Exchange Rate -->
            <div class="flex items-center gap-8 mb-12">
              <span class="chip chip-orange">
                <i class="fa-solid fa-coins"></i> ${sp.exchangeRate}
              </span>
            </div>

            <!-- Branding Preview -->
            <div class="flex items-center gap-8 mb-16">
              <span class="text-xs text-muted uppercase">สี:</span>
              <div style="width:20px;height:20px;border-radius:4px;background:${sp.primaryColor};border:1px solid var(--border);"></div>
              <span class="mono text-xs">${sp.primaryColor}</span>
              ${sp.logo ? `<span class="chip chip-green text-xs">โลโก้: ตั้งค่าแล้ว</span>` : '<span class="chip chip-gray text-xs">โลโก้: ยังไม่ตั้ง</span>'}
            </div>

            <!-- Footer Actions -->
            <div class="divider mb-12"></div>
            <div class="flex gap-10">
              <button class="btn btn-sm btn-outline sp-manage-btn" data-id="${sp.id}">
                <i class="fa-solid fa-gear"></i> จัดการ
              </button>
              <button class="btn btn-sm btn-ghost sp-health-btn" data-id="${sp.id}">
                <i class="fa-solid fa-heart-pulse"></i> สุขภาพ
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  init() {
    const d = window.MockData;

    // ─── Manage Button — Detail Modal ───
    document.querySelectorAll('.sp-manage-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const spId = btn.dataset.id;
        const sp = d.subPlatforms.find(x => x.id === spId);
        if (!sp) return;
        showManageModal(sp, 'details');
      });
    });

    // ─── Health Button — Opens modal on Health tab ───
    document.querySelectorAll('.sp-health-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const spId = btn.dataset.id;
        const sp = d.subPlatforms.find(x => x.id === spId);
        if (!sp) return;
        showManageModal(sp, 'health');
      });
    });

    // ─── Create Sub-Platform Button ───
    const createBtn = document.getElementById('btn-create-platform');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const html = `
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title">สร้าง Sub-Platform ใหม่</div>
            <div class="modal-subtitle">กรอกข้อมูลเพื่อสร้าง Sub-Platform</div>

            <div class="form-group mb-14">
              <label class="form-label">ชื่อ SUB-PLATFORM</label>
              <input type="text" class="form-input" id="new-sp-name" placeholder="เช่น AI Booking">
            </div>
            <div class="form-group mb-14">
              <label class="form-label">CODE (ตัวพิมพ์เล็ก ไม่มีช่องว่าง)</label>
              <input type="text" class="form-input" id="new-sp-code" placeholder="เช่น booking">
            </div>
            <div class="form-group mb-14">
              <label class="form-label">DOMAIN</label>
              <input type="text" class="form-input" id="new-sp-domain" placeholder="เช่น booking.realfact.ai">
            </div>
            <div class="form-group mb-14">
              <label class="form-label">อัตราแลกเปลี่ยน TOKEN</label>
              ${renderExchangeRateInputs('new-sp', 1, 'Minute')}
            </div>
            <div class="form-group mb-20">
              <label class="form-label">สีหลัก (Primary Color)</label>
              <div class="flex items-center gap-10">
                <input type="color" id="new-sp-color" value="#f15b26" style="width:48px;height:38px;border-radius:6px;border:1px solid var(--border);cursor:pointer;">
                <input type="text" class="form-input flex-1" id="new-sp-color-text" value="#f15b26" placeholder="#f15b26" maxlength="7">
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="confirm-create-sp">
                <i class="fa-solid fa-plus"></i> สร้าง
              </button>
            </div>
          </div>
        `;
        window.App.showModal(html);

        setTimeout(() => {
          // Bind exchange rate preview
          bindExchangeRatePreview('new-sp');

          // Sync color picker and text input
          const colorPicker = document.getElementById('new-sp-color');
          const colorText = document.getElementById('new-sp-color-text');

          if (colorPicker && colorText) {
            colorPicker.addEventListener('input', () => { colorText.value = colorPicker.value; });
            colorText.addEventListener('input', () => {
              if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) colorPicker.value = colorText.value;
            });
          }

          const confirmBtn = document.getElementById('confirm-create-sp');
          if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
              const name = document.getElementById('new-sp-name').value.trim();
              const code = document.getElementById('new-sp-code').value.trim().toLowerCase().replace(/\s+/g, '-');
              const domain = document.getElementById('new-sp-domain').value.trim();
              const color = document.getElementById('new-sp-color-text').value.trim() || '#6366f1';

              if (!name || !code || !domain) {
                App.toast('กรุณากรอกชื่อ, Code และ Domain', 'error');
                return;
              }
              if (d.subPlatforms.find(sp => sp.code === code)) {
                App.toast(`Code "${code}" มีอยู่แล้ว กรุณาใช้ Code อื่น`, 'error');
                return;
              }

              // Validate exchange rate
              const rate = validateExchangeRate('new-sp');
              if (!rate) return;

              // Actually push new Sub-Platform to MockData
              const newId = 'SP-' + String(d.subPlatforms.length + 1).padStart(3, '0');
              d.subPlatforms.push({
                id: newId,
                name,
                code,
                domain,
                status: 'Registered',
                tenants: 0,
                revenue: 0,
                tokenUsage: 0,
                plans: [],
                exchangeRateValue: rate.value,
                exchangeRateUnit: rate.unit,
                exchangeRate: buildExchangeRateString(rate.value, rate.unit),
                logo: null,
                primaryColor: color,
                created: new Date().toISOString().slice(0, 10),
              });

              window.App.closeModal();

              // Re-render the page with the new data
              const ct = document.getElementById('content');
              ct.innerHTML = window.Pages.subPlatforms.render();
              window.Pages.subPlatforms.init();
            });
          }
        }, 50);
      });
    }

    // ─── Manage Modal Function ───
    function showManageModal(sp, activeTab) {
      const lifecycleStages = ['Registered', 'Configured', 'Active', 'Suspended', 'Retired'];
      const currentIndex = lifecycleStages.indexOf(sp.status);

      const preconditions = [
        { label: 'ตั้งค่า Domain', done: !!sp.domain },
        { label: 'กำหนดแพลน', done: sp.plans.length > 0 },
        { label: 'ตั้งค่า Branding (สีหลัก)', done: !!sp.primaryColor },
        { label: 'อัปโหลดโลโก้', done: !!sp.logo },
        { label: 'เปิดใช้ Tenant แรก', done: sp.tenants > 0 },
      ];

      const defaultTab = activeTab || 'details';

      const html = `
        <div class="modal modal-wide">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="flex items-center gap-12 mb-6">
            <div class="modal-title">${sp.name}</div>
            ${d.statusChip(sp.status)}
          </div>
          <div class="modal-subtitle mono">${sp.code} | ${sp.domain}</div>

          <!-- Modal Tab Bar -->
          <div class="tab-bar mb-16">
            <div class="tab-item sp-modal-tab ${defaultTab === 'details' ? 'active' : ''}" data-mtab="details">
              <i class="fa-solid fa-info-circle"></i> รายละเอียด
            </div>
            <div class="tab-item sp-modal-tab ${defaultTab === 'branding' ? 'active' : ''}" data-mtab="branding">
              <i class="fa-solid fa-palette"></i> Branding
            </div>
            <div class="tab-item sp-modal-tab ${defaultTab === 'lifecycle' ? 'active' : ''}" data-mtab="lifecycle">
              <i class="fa-solid fa-rotate"></i> Lifecycle
            </div>
            <div class="tab-item sp-modal-tab ${defaultTab === 'cost' ? 'active' : ''}" data-mtab="cost">
              <i class="fa-solid fa-calculator"></i> ต้นทุน
            </div>
            <div class="tab-item sp-modal-tab ${defaultTab === 'health' ? 'active' : ''}" data-mtab="health">
              <i class="fa-solid fa-heart-pulse"></i> สุขภาพ
            </div>
          </div>

          <!-- Details Tab -->
          <div id="mtab-details" class="sp-modal-content ${defaultTab !== 'details' ? 'hidden' : ''}">
            <!-- Editable Fields -->
            <div class="flex-col gap-10 mb-16">
              <div class="form-group mb-0">
                <label class="form-label">ชื่อ SUB-PLATFORM</label>
                <input type="text" class="form-input" id="sp-edit-name" value="${sp.name}">
              </div>
              <div class="form-group mb-0">
                <label class="form-label">Domain</label>
                <input type="text" class="form-input" id="sp-edit-domain" value="${sp.domain}">
              </div>
            </div>

            <!-- Read-only info -->
            <div class="flex-col gap-8 mb-16">
              <div class="flex justify-between p-16" style="background:var(--surface2);border-radius:8px;">
                <span class="text-sm text-muted uppercase">Code</span>
                <span class="mono">${sp.code}</span>
              </div>
              <div class="flex justify-between p-16" style="background:var(--surface2);border-radius:8px;">
                <span class="text-sm text-muted uppercase">วันที่สร้าง</span>
                <span class="mono">${sp.created}</span>
              </div>
            </div>

            <!-- Editable Exchange Rate -->
            <div class="card p-16 mb-16" style="border-left:3px solid var(--warning);">
              <div class="text-sm uppercase text-muted font-600 mb-8">อัตราแลกเปลี่ยน TOKEN</div>
              <div class="mb-8">
                <span class="chip chip-orange">
                  <i class="fa-solid fa-coins"></i> ${sp.exchangeRate}
                </span>
              </div>
              ${renderExchangeRateInputs('sp-edit', sp.exchangeRateValue || parseExchangeRate(sp.exchangeRate).value, sp.exchangeRateUnit || parseExchangeRate(sp.exchangeRate).unit)}
              <div class="text-xs text-warning mt-6">
                <i class="fa-solid fa-triangle-exclamation"></i> การเปลี่ยนอัตราจะมีผลกับ Token ที่คำนวณหลังบันทึก
              </div>
            </div>

            <div class="mb-16">
              <div class="text-sm uppercase text-muted font-600 mb-8">แพลนที่รองรับ</div>
              <div class="flex gap-8">
                ${sp.plans.length > 0
                  ? sp.plans.map(p => `<span class="chip chip-blue">${p}</span>`).join('')
                  : '<span class="text-sm text-muted">ยังไม่มีแพลน</span>'}
              </div>
            </div>

            <div class="flex justify-end">
              <button class="btn btn-primary btn-sm sp-save-details-btn" data-id="${sp.id}">
                <i class="fa-solid fa-save"></i> บันทึก
              </button>
            </div>
          </div>

          <!-- Branding Tab -->
          <div id="mtab-branding" class="sp-modal-content ${defaultTab !== 'branding' ? 'hidden' : ''}">
            <!-- Primary Color -->
            <div class="card p-16 mb-14">
              <div class="text-sm uppercase text-muted font-600 mb-10">สีหลัก (PRIMARY COLOR)</div>
              <div class="flex items-center gap-12">
                <input type="color" id="sp-color-picker" value="${sp.primaryColor}" style="width:48px;height:48px;border-radius:10px;border:2px solid var(--border);cursor:pointer;">
                <div>
                  <input type="text" class="form-input mono" id="sp-color-text" value="${sp.primaryColor}" maxlength="7" style="width:120px;">
                  <div class="text-xs text-muted mt-4">คลิกเพื่อเปลี่ยนสี</div>
                </div>
                <button class="btn btn-sm btn-outline" id="sp-save-color-btn" data-id="${sp.id}">
                  <i class="fa-solid fa-save"></i> บันทึกสี
                </button>
              </div>
            </div>

            <!-- Logo Upload -->
            <div class="card p-16 mb-14" style="border-style:dashed;">
              <div class="text-sm uppercase text-muted font-600 mb-10">โลโก้</div>
              <div id="logo-preview-area" class="flex-col items-center gap-8 mb-10">
                ${sp.logo
                  ? `<img src="${sp.logo}" alt="Logo" style="max-width:120px;max-height:60px;border-radius:6px;border:1px solid var(--border);">`
                  : '<i class="fa-solid fa-image text-muted" style="font-size:32px;"></i><span class="text-sm text-muted">ยังไม่ได้อัปโหลดโลโก้</span>'}
              </div>
              <input type="file" id="logo-file-input" accept="image/*" style="display:none;">
              <button class="btn btn-sm btn-outline" id="logo-upload-btn" data-id="${sp.id}">
                <i class="fa-solid fa-upload"></i> อัปโหลดโลโก้
              </button>
            </div>

            <!-- Favicon Upload -->
            <div class="card p-16" style="border-style:dashed;">
              <div class="text-sm uppercase text-muted font-600 mb-10">FAVICON</div>
              <div id="favicon-preview-area" class="flex-col items-center gap-8 mb-10">
                ${sp.favicon
                  ? `<img src="${sp.favicon}" alt="Favicon" style="width:32px;height:32px;border-radius:4px;border:1px solid var(--border);">`
                  : '<i class="fa-solid fa-star text-muted" style="font-size:24px;"></i><span class="text-sm text-muted">ยังไม่ได้อัปโหลด Favicon</span>'}
              </div>
              <input type="file" id="favicon-file-input" accept="image/x-icon,image/png,image/gif" style="display:none;">
              <button class="btn btn-sm btn-outline" id="favicon-upload-btn" data-id="${sp.id}">
                <i class="fa-solid fa-upload"></i> อัปโหลด Favicon
              </button>
            </div>
          </div>

          <!-- Lifecycle Tab -->
          <div id="mtab-lifecycle" class="sp-modal-content ${defaultTab !== 'lifecycle' ? 'hidden' : ''}">
            <div class="text-sm uppercase text-muted font-600 mb-12">สถานะ LIFECYCLE ปัจจุบัน</div>

            <!-- Status Flow -->
            <div class="flex items-center gap-6 mb-20 flex-wrap">
              ${lifecycleStages.map((stage, idx) => {
                const isCurrent = stage === sp.status;
                const isPast = idx < currentIndex;
                let chipClass = 'chip-gray';
                if (isCurrent) chipClass = 'chip-green';
                if (isPast) chipClass = 'chip-blue';
                if (stage === 'Suspended' && isCurrent) chipClass = 'chip-red';
                if (stage === 'Retired' && isCurrent) chipClass = 'chip-red';

                return `
                  <span class="chip ${chipClass}" style="${isCurrent ? 'font-weight:700;transform:scale(1.1);' : 'opacity:0.7;'}">${stage}</span>
                  ${idx < lifecycleStages.length - 1 ? '<i class="fa-solid fa-arrow-right text-muted text-xs"></i>' : ''}
                `;
              }).join('')}
            </div>

            <!-- Preconditions Checklist -->
            <div class="text-sm uppercase text-muted font-600 mb-10">เงื่อนไข PRECONDITIONS</div>
            <div class="flex-col gap-8 mb-20">
              ${preconditions.map(pc => `
                <div class="flex items-center gap-10 p-16" style="background:var(--surface2);border-radius:8px;">
                  <i class="fa-solid ${pc.done ? 'fa-circle-check text-success' : 'fa-circle-xmark text-error'}"></i>
                  <span class="text-sm ${pc.done ? '' : 'text-muted'}">${pc.label}</span>
                  ${pc.done
                    ? '<span class="chip chip-green ml-auto">สำเร็จ</span>'
                    : '<span class="chip chip-gray ml-auto">ยังไม่สำเร็จ</span>'}
                </div>
              `).join('')}
            </div>

            <!-- Change Status Button -->
            <div class="divider mb-16"></div>
            <div class="flex items-center gap-12">
              <div class="flex-1">
                <div class="text-sm font-600 mb-4">เปลี่ยนสถานะ Lifecycle</div>
                <div class="text-xs text-muted">บางสถานะอาจมีเงื่อนไขก่อนเปลี่ยน</div>
              </div>
              <button class="btn btn-outline btn-sm" id="sp-change-status-btn" data-id="${sp.id}">
                <i class="fa-solid fa-rotate"></i> เปลี่ยนสถานะ
              </button>
            </div>
          </div>

          <!-- Cost Tab -->
          <div id="mtab-cost" class="sp-modal-content ${defaultTab !== 'cost' ? 'hidden' : ''}">
            ${(() => {
              const platformSessions = d.sessions.filter(s => s.status === 'Completed' && s.subPlatform === sp.code);
              const usageLogs = d.sessionUsageLogs || [];
              const sessionIds = platformSessions.map(s => s.id);
              const relevantLogs = usageLogs.filter(l => sessionIds.includes(l.sessionId));
              const totalTokens = platformSessions.reduce((sum, s) => sum + (s.tokens || 0), 0);

              if (!relevantLogs.length) {
                return '<div class="flex-col items-center gap-8 p-28" style="text-align:center;">' +
                  '<i class="fa-solid fa-chart-pie text-muted" style="font-size:36px;"></i>' +
                  '<div class="text-sm text-muted">ยังไม่มี Usage Log สำหรับ Platform นี้</div>' +
                  '<div class="text-xs text-muted">เมื่อมี Session เสร็จสิ้น ข้อมูลต้นทุนจะแสดงที่นี่</div>' +
                  '</div>';
              }

              const mc = d.marginConfig;
              const providerMap = {};
              mc.providers.forEach(p => { providerMap[p.name] = p.margin; });
              const overrideMap = {};
              mc.serviceCodes.forEach(sc => { overrideMap[sc.code] = sc; });

              function getMarginInfo(serviceCode, provider) {
                const override = overrideMap[serviceCode];
                if (override) return { margin: override.margin, label: 'override' };
                if (providerMap[provider] != null) return { margin: providerMap[provider], label: 'provider' };
                return { margin: mc.global, label: 'global' };
              }
              function sell(cost, margin) { return margin >= 100 ? 0 : cost / (1 - margin / 100); }
              function fmt(n) { return n == null ? '—' : n.toFixed(2); }

              const svcAgg = {};
              relevantLogs.forEach(l => {
                const key = l.serviceCode + '|' + l.type;
                if (!svcAgg[key]) svcAgg[key] = { serviceCode: l.serviceCode, type: l.type, totalQty: 0 };
                svcAgg[key].totalQty += l.quantity;
              });

              let totalCost = 0, totalSell = 0;
              const breakdown = Object.values(svcAgg).map(agg => {
                const svc = d.costConfig.find(c => c.serviceCode === agg.serviceCode);
                if (!svc) return null;
                const mi = getMarginInfo(agg.serviceCode, svc.provider);
                const unitCost = (agg.type === 'output' && svc.outputCostPerUnit != null) ? svc.outputCostPerUnit : svc.costPerUnit;
                const cost = agg.totalQty * unitCost;
                const s = agg.totalQty * sell(unitCost, mi.margin);
                totalCost += cost;
                totalSell += s;
                return { serviceCode: agg.serviceCode, type: agg.type, totalQty: agg.totalQty, unitCost, cost, sell: s, margin: mi.margin, label: mi.label };
              }).filter(Boolean);

              const costPT = totalTokens > 0 ? totalCost / totalTokens : 0;
              const sellPT = totalTokens > 0 ? totalSell / totalTokens : 0;
              const profitPT = sellPT - costPT;
              const blendedM = sellPT > 0 ? ((1 - costPT / sellPT) * 100) : 0;

              return '' +
                '<div class="grid-2 gap-10 mb-16" style="grid-template-columns: repeat(4, 1fr);">' +
                  '<div class="card p-14" style="text-align:center;background:var(--surface2);">' +
                    '<div class="text-xs text-muted uppercase mb-4">ต้นทุน / Token</div>' +
                    '<div class="mono font-700" style="font-size:17px;color:var(--error);">' + fmt(costPT) + ' <span class="text-xs">THB</span></div>' +
                  '</div>' +
                  '<div class="card p-14" style="text-align:center;background:var(--surface2);">' +
                    '<div class="text-xs text-muted uppercase mb-4">ราคาขาย / Token</div>' +
                    '<div class="mono font-700" style="font-size:17px;color:var(--primary);">' + fmt(sellPT) + ' <span class="text-xs">THB</span></div>' +
                  '</div>' +
                  '<div class="card p-14" style="text-align:center;background:var(--surface2);">' +
                    '<div class="text-xs text-muted uppercase mb-4">กำไร / Token</div>' +
                    '<div class="mono font-700" style="font-size:17px;color:var(--success);">' + fmt(profitPT) + ' <span class="text-xs">THB</span></div>' +
                  '</div>' +
                  '<div class="card p-14" style="text-align:center;background:var(--surface2);">' +
                    '<div class="text-xs text-muted uppercase mb-4">Blended Margin</div>' +
                    '<div class="mono font-700" style="font-size:17px;color:' + (blendedM >= 30 ? 'var(--success)' : 'var(--warning)') + ';">' + blendedM.toFixed(1) + '%</div>' +
                  '</div>' +
                '</div>' +
                '<div class="text-xs text-muted mb-10">' +
                  '<i class="fa-solid fa-database"></i> จาก ' + platformSessions.length + ' sessions / ' + d.formatNumber(totalTokens) + ' tokens (Usage Log × Cost Config × Margin)' +
                '</div>' +
                '<div class="table-wrap">' +
                  '<table>' +
                    '<thead><tr>' +
                      '<th>Service Code</th>' +
                      '<th>ประเภท</th>' +
                      '<th>Qty รวม</th>' +
                      '<th>ต้นทุน/หน่วย</th>' +
                      '<th>ต้นทุนรวม</th>' +
                      '<th>Margin</th>' +
                      '<th>ราคาขายรวม</th>' +
                      '<th>สัดส่วน</th>' +
                    '</tr></thead>' +
                    '<tbody>' +
                    breakdown.map(b => {
                      const pct = totalCost > 0 ? (b.cost / totalCost * 100) : 0;
                      const badge = b.label === 'override'
                        ? '<span class="chip chip-purple" style="font-size:10px;">Override</span>'
                        : b.label === 'provider'
                        ? '<span class="chip chip-blue" style="font-size:10px;">Provider</span>'
                        : '<span class="chip chip-gray" style="font-size:10px;">Global</span>';
                      const typeLabel = b.type === 'input' ? '<span class="chip chip-blue" style="font-size:10px;">Input</span>'
                        : b.type === 'output' ? '<span class="chip chip-orange" style="font-size:10px;">Output</span>'
                        : '<span class="chip chip-gray" style="font-size:10px;">Primary</span>';
                      return '<tr>' +
                        '<td class="mono text-sm">' + b.serviceCode + '</td>' +
                        '<td>' + typeLabel + '</td>' +
                        '<td class="mono">' + d.formatNumber(b.totalQty) + '</td>' +
                        '<td class="mono">' + fmt(b.unitCost) + '</td>' +
                        '<td class="mono">' + fmt(b.cost) + '</td>' +
                        '<td class="mono text-sm">' + b.margin.toFixed(1) + '% ' + badge + '</td>' +
                        '<td class="mono text-success">' + fmt(b.sell) + '</td>' +
                        '<td><div style="display:flex;align-items:center;gap:6px;">' +
                          '<div style="width:' + Math.max(4, pct) + '%;height:8px;background:' + sp.primaryColor + ';border-radius:4px;max-width:80px;"></div>' +
                          '<span class="mono text-xs">' + pct.toFixed(1) + '%</span></div></td>' +
                        '</tr>';
                    }).join('') +
                    '</tbody>' +
                    '<tfoot><tr style="font-weight:700;border-top:2px solid var(--border);">' +
                      '<td colspan="4">รวม (' + d.formatNumber(totalTokens) + ' Tokens)</td>' +
                      '<td class="mono" style="color:var(--error);">' + fmt(totalCost) + '</td>' +
                      '<td class="mono">' + blendedM.toFixed(1) + '%</td>' +
                      '<td class="mono text-success">' + fmt(totalSell) + '</td>' +
                      '<td class="mono text-success font-700">กำไร ' + fmt(totalSell - totalCost) + '</td>' +
                    '</tr></tfoot>' +
                  '</table>' +
                '</div>';
            })()}
          </div>

          <!-- Health Tab -->
          <div id="mtab-health" class="sp-modal-content ${defaultTab !== 'health' ? 'hidden' : ''}">
            <div class="grid-2 gap-10 mb-16">
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">TENANT ใช้งาน</span>
                  <div class="stat-icon green"><i class="fa-solid fa-building"></i></div>
                </div>
                <div class="stat-value mono">${d.formatNumber(sp.tenants)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">UPTIME</span>
                  <div class="stat-icon blue"><i class="fa-solid fa-server"></i></div>
                </div>
                <div class="stat-value mono">${sp.status === 'Active' ? '99.95%' : '-'}</div>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">TOKEN ใช้งาน</span>
                  <div class="stat-icon yellow"><i class="fa-solid fa-coins"></i></div>
                </div>
                <div class="stat-value mono">${d.formatNumber(sp.tokenUsage)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-header">
                  <span class="stat-label">ERROR RATE</span>
                  <div class="stat-icon ${sp.status === 'Active' ? 'green' : 'gray'}"><i class="fa-solid fa-bug"></i></div>
                </div>
                <div class="stat-value mono">${sp.status === 'Active' ? '0.12%' : '-'}</div>
              </div>
            </div>

            <!-- Revenue Chart Placeholder -->
            <div class="card p-20">
              <div class="text-sm uppercase text-muted font-600 mb-12">แนวโน้มรายได้</div>
              <div class="flex-col items-center gap-8" style="min-height:120px;justify-content:center;">
                <i class="fa-solid fa-chart-line text-muted" style="font-size:36px;"></i>
                <span class="text-sm text-muted">กราฟรายได้ (จำลอง)</span>
                ${sp.revenue > 0
                  ? `<span class="mono font-600 text-success">${d.formatCurrency(sp.revenue)}</span>`
                  : '<span class="text-sm text-muted">ยังไม่มีข้อมูล</span>'}
              </div>
            </div>
          </div>
        </div>
      `;

      window.App.showModal(html);

      // ─── Bind Modal Tabs ───
      setTimeout(() => {
        document.querySelectorAll('.sp-modal-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            document.querySelectorAll('.sp-modal-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.sp-modal-content').forEach(c => c.classList.add('hidden'));
            const targetId = 'mtab-' + tab.dataset.mtab;
            const target = document.getElementById(targetId);
            if (target) target.classList.remove('hidden');
          });
        });

        // ─── Details Tab: Bind Exchange Rate Preview ───
        bindExchangeRatePreview('sp-edit');

        // ─── Details Tab: Save Name, Domain & Exchange Rate ───
        const saveDetailsBtn = document.querySelector('.sp-save-details-btn');
        if (saveDetailsBtn) {
          saveDetailsBtn.addEventListener('click', () => {
            const newName = document.getElementById('sp-edit-name').value.trim();
            const newDomain = document.getElementById('sp-edit-domain').value.trim();
            if (!newName) { App.toast('กรุณากรอกชื่อ', 'error'); return; }
            if (!newDomain) { App.toast('กรุณากรอก Domain', 'error'); return; }

            // Validate exchange rate
            const rate = validateExchangeRate('sp-edit');
            if (!rate) return;

            const newRateStr = buildExchangeRateString(rate.value, rate.unit);
            const rateChanged = newRateStr !== sp.exchangeRate;

            const doSave = () => {
              sp.name = newName;
              sp.domain = newDomain;
              sp.exchangeRateValue = rate.value;
              sp.exchangeRateUnit = rate.unit;
              sp.exchangeRate = newRateStr;
              window.App.closeModal();
              const ct = document.getElementById('content');
              ct.innerHTML = window.Pages.subPlatforms.render();
              window.Pages.subPlatforms.init();
              App.toast(`บันทึกข้อมูล ${newName} สำเร็จ`, 'success');
            };

            if (rateChanged) {
              App.confirm(
                `ยืนยันเปลี่ยนอัตราแลกเปลี่ยนจาก\n"${sp.exchangeRate}" เป็น "${newRateStr}"?\n\nการเปลี่ยนอัตราจะมีผลกับ Token ที่คำนวณหลังบันทึก`,
                { title: 'เปลี่ยนอัตราแลกเปลี่ยน', confirmText: 'ยืนยัน', cancelText: 'ยกเลิก', type: 'warning' }
              ).then(ok => { if (ok) doSave(); });
            } else {
              doSave();
            }
          });
        }

        // ─── Branding: Color Picker Sync ───
        const colorPicker = document.getElementById('sp-color-picker');
        const colorText = document.getElementById('sp-color-text');
        if (colorPicker && colorText) {
          colorPicker.addEventListener('input', () => {
            colorText.value = colorPicker.value;
          });
          colorText.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) {
              colorPicker.value = colorText.value;
            }
          });
        }

        // ─── Branding: Save Color ───
        const saveColorBtn = document.getElementById('sp-save-color-btn');
        if (saveColorBtn) {
          saveColorBtn.addEventListener('click', () => {
            const newColor = colorText ? colorText.value.trim() : sp.primaryColor;
            if (!/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
              App.toast('กรุณากรอก HEX color ที่ถูกต้อง เช่น #f15b26', 'error');
              return;
            }
            sp.primaryColor = newColor;
            // Update color swatch preview inline
            if (colorPicker) colorPicker.value = newColor;
            App.toast(`บันทึกสีหลัก ${newColor} สำหรับ ${sp.name} สำเร็จ`, 'success');
          });
        }

        // ─── Branding: Logo Upload ───
        const logoUploadBtn = document.getElementById('logo-upload-btn');
        const logoFileInput = document.getElementById('logo-file-input');
        const logoPreview = document.getElementById('logo-preview-area');

        if (logoUploadBtn && logoFileInput) {
          logoUploadBtn.addEventListener('click', () => logoFileInput.click());

          logoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
              App.toast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
              return;
            }

            // Read and preview
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target.result;
              sp.logo = dataUrl; // Store in MockData (base64 for mock purposes)
              if (logoPreview) {
                logoPreview.innerHTML = `
                  <img src="${dataUrl}" alt="Logo" style="max-width:120px;max-height:60px;border-radius:6px;border:1px solid var(--border);">
                  <div class="chip chip-green">อัปโหลดสำเร็จ: ${file.name}</div>
                `;
              }
              if (logoUploadBtn) logoUploadBtn.innerHTML = '<i class="fa-solid fa-check text-success"></i> เปลี่ยนโลโก้';
            };
            reader.readAsDataURL(file);
          });
        }

        // ─── Branding: Favicon Upload ───
        const faviconUploadBtn = document.getElementById('favicon-upload-btn');
        const faviconFileInput = document.getElementById('favicon-file-input');
        const faviconPreview = document.getElementById('favicon-preview-area');

        if (faviconUploadBtn && faviconFileInput) {
          faviconUploadBtn.addEventListener('click', () => faviconFileInput.click());

          faviconFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target.result;
              sp.favicon = dataUrl;
              if (faviconPreview) {
                faviconPreview.innerHTML = `
                  <img src="${dataUrl}" alt="Favicon" style="width:32px;height:32px;border-radius:4px;border:1px solid var(--border);">
                  <div class="chip chip-green">อัปโหลดสำเร็จ: ${file.name}</div>
                `;
              }
              if (faviconUploadBtn) faviconUploadBtn.innerHTML = '<i class="fa-solid fa-check text-success"></i> เปลี่ยน Favicon';
            };
            reader.readAsDataURL(file);
          });
        }

        // ─── Lifecycle: Change Status Button ───
        const changeStatusBtn = document.getElementById('sp-change-status-btn');
        if (changeStatusBtn) {
          changeStatusBtn.addEventListener('click', () => {
            // Valid next states based on current
            const validTransitions = {
              'Registered':  ['Configured'],
              'Configured':  ['Active', 'Registered'],
              'Active':      ['Suspended'],
              'Suspended':   ['Active', 'Retired'],
              'Retired':     [],
            };

            const preconditionsMet = {
              'Configured': () => !!sp.domain,
              'Active':     () => sp.plans.length > 0 && !!sp.primaryColor,
              'Suspended':  () => true,
              'Retired':    () => sp.tenants === 0,
              'Registered': () => true,
            };

            const nextStates = validTransitions[sp.status] || [];

            if (nextStates.length === 0) {
              App.toast(`"${sp.name}" อยู่ในสถานะสุดท้าย (${sp.status}) ไม่สามารถเปลี่ยนได้`, 'error');
              return;
            }

            // Build dropdown of valid next states with precondition check info
            const stateOptions = nextStates.map(state => {
              const canTransition = preconditionsMet[state] ? preconditionsMet[state]() : true;
              return { state, canTransition };
            });

            const statusSelectHtml = stateOptions.map(({ state, canTransition }) =>
              `<option value="${state}" ${!canTransition ? 'disabled' : ''}>${state}${!canTransition ? ' (เงื่อนไขไม่ครบ)' : ''}</option>`
            ).join('');

            // Show inline dropdown within the existing modal content — use a nested confirm
            const nextState = stateOptions.find(s => s.canTransition)?.state;
            if (!nextState) {
              App.toast('เงื่อนไข preconditions ยังไม่ครบ ไม่สามารถเปลี่ยนสถานะได้', 'error');
              return;
            }

            const confirmHtml = `
              <div class="modal">
                <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
                <div class="modal-title"><i class="fa-solid fa-rotate text-primary"></i> เปลี่ยนสถานะ: ${sp.name}</div>
                <div class="modal-subtitle">สถานะปัจจุบัน: <strong>${sp.status}</strong></div>

                <div class="form-group mb-20">
                  <label class="form-label">สถานะใหม่</label>
                  <select class="form-input" id="new-lifecycle-status">
                    ${statusSelectHtml}
                  </select>
                </div>

                <div class="banner-info mb-16">
                  <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
                  <div class="text-sm">การเปลี่ยนสถานะจะมีผลทันที และบันทึกใน Audit Log</div>
                </div>

                <div class="modal-actions">
                  <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
                  <button class="btn btn-primary" id="confirm-lifecycle-change">
                    <i class="fa-solid fa-rotate"></i> ยืนยันเปลี่ยนสถานะ
                  </button>
                </div>
              </div>
            `;

            window.App.showModal(confirmHtml);

            setTimeout(() => {
              const confirmBtn2 = document.getElementById('confirm-lifecycle-change');
              if (confirmBtn2) {
                confirmBtn2.addEventListener('click', () => {
                  const selectedStatus = document.getElementById('new-lifecycle-status').value;
                  if (!selectedStatus) return;

                  // Final precondition check
                  const check = preconditionsMet[selectedStatus];
                  if (check && !check()) {
                    App.toast(`เงื่อนไขสำหรับสถานะ "${selectedStatus}" ยังไม่ครบ`, 'error');
                    return;
                  }

                  sp.status = selectedStatus;
                  window.App.closeModal();

                  // Re-render the main page
                  const ct = document.getElementById('content');
                  ct.innerHTML = window.Pages.subPlatforms.render();
                  window.Pages.subPlatforms.init();
                });
              }
            }, 50);
          });
        }

      }, 50); // end setTimeout
    } // end showManageModal
  }
};
