/* ================================================================
   Page Module — Device Operations
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.devices = {

  // ─── Helper: re-render this page in-place ───
  _refresh() {
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = window.Pages.devices.render();
      window.Pages.devices.init();
    }
  },

  render() {
    const d = window.MockData;
    const activatedDevices = d.devices.filter(dv => dv.status === 'Activated');
    const offlineDevices   = d.devices.filter(dv => dv.status === 'Activated' && !dv.online);
    const sessions         = d.sessions;
    const assignLogs       = d.assignLogs;

    // Unique tenant names for log filters
    const sessionTenants = [...new Set(sessions.map(se => se.tenantName).filter(Boolean))].sort();
    const assignTenants  = [...new Set(assignLogs.map(al => al.tenantName).filter(Boolean))].sort();

    // Build a lookup for latest session per device
    const latestSessionByDevice = {};
    sessions.forEach(se => {
      if (!latestSessionByDevice[se.deviceSn] || se.start > latestSessionByDevice[se.deviceSn].start) {
        latestSessionByDevice[se.deviceSn] = se;
      }
    });

    // Build lookup for current preset per device (from latest assign log)
    const currentPresetByDevice = {};
    assignLogs.forEach(al => {
      if (!currentPresetByDevice[al.deviceSn] || al.timestamp > currentPresetByDevice[al.deviceSn].timestamp) {
        currentPresetByDevice[al.deviceSn] = { name: al.newPresetName, preset: al.newPreset, timestamp: al.timestamp };
      }
    });

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">DEVICE OPERATIONS</h1>
        <div class="flex items-center gap-12">
          <div class="live-indicator"><div class="live-dot"></div> <span class="mono">${activatedDevices.filter(dv => dv.online).length} ONLINE</span></div>
        </div>
      </div>

      <!-- Offline Warning Banner -->
      ${offlineDevices.length > 0
        ? `<div class="alert-warning mb-20">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>
              <span class="font-600 mono">${offlineDevices.length}</span> อุปกรณ์ออฟไลน์ &mdash;
              ${offlineDevices.map(dv => dv.name).join(', ')}
            </span>
          </div>`
        : ''}

      <!-- Device Compact List -->
      <div class="flex items-center justify-between mb-12">
        <div class="section-title" style="margin:0;">
          <i class="fa-solid fa-server text-primary"></i> อุปกรณ์ที่เปิดใช้งาน
          <span class="chip chip-gray" style="font-size:11px;margin-left:6px;">${activatedDevices.length} เครื่อง</span>
        </div>
      </div>
      <div class="grid-2 mb-20" id="dev-device-grid">
        ${activatedDevices.map(dv => {
          const isOnline      = dv.online;
          const lastSession   = latestSessionByDevice[dv.sn];
          const currentPreset = currentPresetByDevice[dv.sn];
          const activeSession = sessions.find(se => se.deviceSn === dv.sn && se.status === 'active');
          const tenantName    = dv.soldToName || '-';
          const presetName    = currentPreset ? currentPreset.name : (lastSession ? lastSession.presetName : '—');
          const borderColor   = isOnline ? 'var(--primary)' : 'var(--border)';

          return `
            <div class="card p-14" data-device-sn="${dv.sn}" style="cursor:pointer;border-left:3px solid ${borderColor};transition:border-color .2s;">
              <div class="flex items-center gap-12">
                <!-- Icon -->
                <div style="width:38px;height:38px;border-radius:10px;flex-shrink:0;
                  background:${isOnline ? 'var(--primary-dim)' : 'rgba(107,114,128,.1)'};
                  display:flex;align-items:center;justify-content:center;">
                  <i class="fa-solid fa-display" style="font-size:15px;color:${isOnline ? 'var(--primary)' : 'var(--text-dim)'};"></i>
                </div>
                <!-- Info -->
                <div class="flex-1" style="min-width:0;">
                  <div class="flex items-center gap-8 mb-3">
                    <span class="font-600 truncate">${dv.name}</span>
                    ${isOnline
                      ? `<span class="status-badge online" style="font-size:10px;"><span class="status-dot"></span> Online</span>`
                      : `<span class="status-badge offline" style="font-size:10px;"><span class="status-dot"></span> Offline</span>`}
                    ${activeSession ? `<span class="status-badge session" style="font-size:10px;"><span class="status-dot"></span> Session</span>` : ''}
                  </div>
                  <div class="text-xs text-muted truncate">
                    <span class="mono">${dv.sn}</span>
                    <span style="margin:0 4px;opacity:.4;">·</span>${dv.modelName}
                    <span style="margin:0 4px;opacity:.4;">·</span><i class="fa-solid fa-building" style="margin-right:3px;"></i>${tenantName}
                  </div>
                </div>
                <!-- Preset -->
                <div class="text-xs" style="min-width:110px;max-width:130px;text-align:right;flex-shrink:0;">
                  <div class="text-dim uppercase" style="font-size:10px;letter-spacing:.5px;margin-bottom:2px;">Preset</div>
                  <div class="font-600 truncate" style="font-size:12px;">${presetName}</div>
                </div>
                <!-- Actions -->
                <div class="flex gap-6" style="flex-shrink:0;">
                  <button class="btn btn-sm btn-outline dev-btn-assign-preset"
                    data-sn="${dv.sn}" data-model="${dv.model}"
                    title="Assign Preset">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                  </button>
                  <button class="btn btn-sm btn-outline dev-btn-transfer"
                    data-sn="${dv.sn}"
                    title="โอนอุปกรณ์">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar mb-20" id="dev-tabs">
        <div class="tab-item active" data-tab="session-log">บันทึกเซสชัน</div>
        <div class="tab-item" data-tab="assign-log">บันทึกการมอบหมาย</div>
      </div>

      <!-- Session Log Tab -->
      <div id="tab-session-log">
        <!-- Date Range + Tenant Filter -->
        <div class="flex items-center gap-12 mb-12 flex-wrap">
          <div class="flex items-center gap-8">
            <label class="form-label" style="margin:0;white-space:nowrap;">ตั้งแต่:</label>
            <input type="date" class="form-input" id="session-date-from" style="width:150px;">
          </div>
          <div class="flex items-center gap-8">
            <label class="form-label" style="margin:0;white-space:nowrap;">ถึง:</label>
            <input type="date" class="form-input" id="session-date-to" style="width:150px;">
          </div>
          <select class="form-input" id="session-tenant-filter" style="width:190px;">
            <option value="">Tenant ทั้งหมด</option>
            ${sessionTenants.map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-outline" id="session-date-clear">
            <i class="fa-solid fa-xmark"></i> ล้างตัวกรอง
          </button>
        </div>
        <!-- Session Summary Row -->
        <div class="card mb-12" id="session-summary" style="padding:12px 20px;">
          <div class="flex gap-24 text-sm">
            <div><span class="text-muted">เซสชันทั้งหมด:</span> <span class="font-600 mono" id="sum-total-sessions">-</span></div>
            <div><span class="text-muted">ระยะเวลารวม:</span> <span class="font-600 mono" id="sum-total-duration">-</span> นาที</div>
            <div><span class="text-muted">Tokens รวม:</span> <span class="font-600 mono" id="sum-total-tokens">-</span></div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>อุปกรณ์</th>
                <th>Tenant</th>
                <th>Preset</th>
                <th>เริ่มต้น</th>
                <th>สิ้นสุด</th>
                <th>ระยะเวลา</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody id="session-tbody">
              ${sessions.map(se => `
                <tr data-date="${se.start ? se.start.split(' ')[0] : ''}" data-tenant="${se.tenantName || ''}">
                  <td class="mono">${se.id}</td>
                  <td>
                    <div class="font-600">${se.deviceName}</div>
                    <div class="text-sm text-muted mono">${se.deviceSn}</div>
                  </td>
                  <td>${se.tenantName}</td>
                  <td>${se.presetName}</td>
                  <td class="mono text-sm">${se.start}</td>
                  <td class="mono text-sm">${se.end || '<span class="live-indicator"><span class="live-dot"></span> กำลังใช้</span>'}</td>
                  <td class="mono">${se.duration != null ? se.duration + ' นาที' : '<span class="text-muted">-</span>'}</td>
                  <td class="mono">${se.tokens != null ? d.formatNumber(se.tokens) : '<span class="text-muted">-</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assign Log Tab -->
      <div id="tab-assign-log" class="hidden">
        <!-- Date Range + Tenant Filter -->
        <div class="flex items-center gap-12 mb-12 flex-wrap">
          <div class="flex items-center gap-8">
            <label class="form-label" style="margin:0;white-space:nowrap;">ตั้งแต่:</label>
            <input type="date" class="form-input" id="assign-date-from" style="width:150px;">
          </div>
          <div class="flex items-center gap-8">
            <label class="form-label" style="margin:0;white-space:nowrap;">ถึง:</label>
            <input type="date" class="form-input" id="assign-date-to" style="width:150px;">
          </div>
          <select class="form-input" id="assign-tenant-filter" style="width:190px;">
            <option value="">Tenant ทั้งหมด</option>
            ${assignTenants.map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-outline" id="assign-date-clear">
            <i class="fa-solid fa-xmark"></i> ล้างตัวกรอง
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>เวลา</th>
                <th>อุปกรณ์</th>
                <th>Preset ใหม่</th>
                <th>Preset เดิม</th>
                <th>ผู้ดำเนินการ</th>
                <th>Tenant</th>
              </tr>
            </thead>
            <tbody id="assign-tbody">
              ${assignLogs.map(al => `
                <tr data-date="${al.timestamp ? al.timestamp.split(' ')[0] : ''}" data-tenant="${al.tenantName || ''}">
                  <td class="mono">${al.id}</td>
                  <td class="mono text-sm">${al.timestamp}</td>
                  <td>
                    <div class="font-600">${al.deviceName}</div>
                    <div class="text-sm text-muted mono">${al.deviceSn}</div>
                  </td>
                  <td><span class="chip chip-green">${al.newPresetName}</span></td>
                  <td><span class="chip chip-gray">${al.oldPresetName}</span></td>
                  <td class="text-sm">${al.actor}</td>
                  <td>${al.tenantName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.devices;

    // ─── Tab switching ───
    const tabs         = document.querySelectorAll('#dev-tabs .tab-item');
    const tabSessionLog = document.getElementById('tab-session-log');
    const tabAssignLog  = document.getElementById('tab-assign-log');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        if (target === 'session-log') {
          tabSessionLog.classList.remove('hidden');
          tabAssignLog.classList.add('hidden');
        } else {
          tabSessionLog.classList.add('hidden');
          tabAssignLog.classList.remove('hidden');
        }
      });
    });

    // ─── Session date filter + summary ───
    function computeSessionSummary() {
      const rows = document.querySelectorAll('#session-tbody tr');
      let total = 0, totalDuration = 0, totalTokens = 0;
      rows.forEach(row => {
        if (row.style.display !== 'none') {
          total++;
          // Read text from duration and tokens cells
          const durationCell = row.cells[6] && row.cells[6].textContent.replace(' นาที', '').trim();
          const tokensCell   = row.cells[7] && row.cells[7].textContent.replace(/,/g, '').trim();
          const dur = parseFloat(durationCell);
          const tok = parseFloat(tokensCell);
          if (!isNaN(dur)) totalDuration += dur;
          if (!isNaN(tok)) totalTokens  += tok;
        }
      });
      const sumEl = document.getElementById('sum-total-sessions');
      const durEl = document.getElementById('sum-total-duration');
      const tokEl = document.getElementById('sum-total-tokens');
      if (sumEl) sumEl.textContent = d.formatNumber(total);
      if (durEl) durEl.textContent = d.formatNumber(totalDuration);
      if (tokEl) tokEl.textContent = d.formatNumber(totalTokens);
    }

    function filterSessions() {
      const fromVal  = document.getElementById('session-date-from').value;
      const toVal    = document.getElementById('session-date-to').value;
      const tenant   = document.getElementById('session-tenant-filter')?.value || '';
      const rows     = document.querySelectorAll('#session-tbody tr');
      rows.forEach(row => {
        const rowDate = row.dataset.date || '';
        const afterFrom   = !fromVal || rowDate >= fromVal;
        const beforeTo    = !toVal   || rowDate <= toVal;
        const matchTenant = !tenant  || row.dataset.tenant === tenant;
        row.style.display = (afterFrom && beforeTo && matchTenant) ? '' : 'none';
      });
      computeSessionSummary();
    }

    const sessionFrom   = document.getElementById('session-date-from');
    const sessionTo     = document.getElementById('session-date-to');
    const sessionTenantF = document.getElementById('session-tenant-filter');
    const sessionClear  = document.getElementById('session-date-clear');

    if (sessionFrom)   sessionFrom.addEventListener('change', filterSessions);
    if (sessionTo)     sessionTo.addEventListener('change', filterSessions);
    if (sessionTenantF) sessionTenantF.addEventListener('change', filterSessions);
    if (sessionClear) {
      sessionClear.addEventListener('click', () => {
        if (sessionFrom)   sessionFrom.value   = '';
        if (sessionTo)     sessionTo.value     = '';
        if (sessionTenantF) sessionTenantF.value = '';
        filterSessions();
      });
    }

    // Initial summary on load
    computeSessionSummary();

    // ─── Assign Log filter (date + tenant) ───
    function filterAssigns() {
      const fromVal  = document.getElementById('assign-date-from').value;
      const toVal    = document.getElementById('assign-date-to').value;
      const tenant   = document.getElementById('assign-tenant-filter')?.value || '';
      const rows     = document.querySelectorAll('#assign-tbody tr');
      rows.forEach(row => {
        const rowDate = row.dataset.date || '';
        const afterFrom   = !fromVal || rowDate >= fromVal;
        const beforeTo    = !toVal   || rowDate <= toVal;
        const matchTenant = !tenant  || row.dataset.tenant === tenant;
        row.style.display = (afterFrom && beforeTo && matchTenant) ? '' : 'none';
      });
    }

    const assignFrom    = document.getElementById('assign-date-from');
    const assignTo      = document.getElementById('assign-date-to');
    const assignTenantF = document.getElementById('assign-tenant-filter');
    const assignClear   = document.getElementById('assign-date-clear');

    if (assignFrom)    assignFrom.addEventListener('change', filterAssigns);
    if (assignTo)      assignTo.addEventListener('change', filterAssigns);
    if (assignTenantF) assignTenantF.addEventListener('change', filterAssigns);
    if (assignClear) {
      assignClear.addEventListener('click', () => {
        if (assignFrom)    assignFrom.value    = '';
        if (assignTo)      assignTo.value      = '';
        if (assignTenantF) assignTenantF.value = '';
        filterAssigns();
      });
    }

    // ─── 1. Transfer Device ───
    document.querySelectorAll('.dev-btn-transfer').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const sn  = btn.dataset.sn;
        const dev = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">โอนอุปกรณ์ไปยัง Tenant ใหม่</div>
            <div class="modal-subtitle">S/N: <span class="mono">${sn}</span> — ${dev.name}</div>
            <div class="card mb-16" style="padding:12px 16px;background:var(--bg-secondary);">
              <div class="text-sm text-muted">Tenant ปัจจุบัน</div>
              <div class="font-600">${dev.soldToName || '-'}</div>
            </div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">โอนไปยัง Tenant</label>
                <select class="form-input" id="transfer-tenant">
                  <option value="">-- เลือก Tenant ปลายทาง --</option>
                  ${d.tenants.filter(t => t.id !== dev.soldTo).map(t => `<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-transfer">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> ยืนยันโอน
              </button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-transfer');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const tenantSel  = document.getElementById('transfer-tenant');
            const newTenantId   = tenantSel.value;
            const newTenantName = tenantSel.selectedOptions[0]?.dataset.name || '';
            if (!newTenantId) { App.toast('กรุณาเลือก Tenant ปลายทาง', 'error'); return; }

            const oldTenantName = dev.soldToName;

            // Update device
            dev.soldTo      = newTenantId;
            dev.soldToName  = newTenantName;
            dev.activatedBy = newTenantId;

            // Add assign log entry
            const now   = new Date();
            const nowStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            const lastPreset = (() => {
              let latest = null;
              d.assignLogs.forEach(al => {
                if (al.deviceSn === sn && (!latest || al.timestamp > latest.timestamp)) latest = al;
              });
              return latest;
            })();

            const newLogId = 'AL-' + String(d.assignLogs.length + 1).padStart(3, '0');
            d.assignLogs.unshift({
              id: newLogId,
              timestamp: nowStr,
              deviceSn: sn,
              deviceName: dev.name,
              newPreset: lastPreset ? lastPreset.newPreset : null,
              newPresetName: lastPreset ? lastPreset.newPresetName : '(ไม่มี)',
              oldPreset: lastPreset ? lastPreset.newPreset : null,
              oldPresetName: lastPreset ? lastPreset.newPresetName : '(ไม่มี)',
              actor: 'Platform Admin',
              tenantName: newTenantName,
            });

            window.App.closeModal();
            self._refresh();
            App.toast(`โอนอุปกรณ์สำเร็จ! จาก: ${oldTenantName} ไปยัง: ${newTenantName}`, 'success');
          });
        }, 50);
      });
    });

    // ─── 2. Assign Preset to Device ───
    document.querySelectorAll('.dev-btn-assign-preset').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const sn      = btn.dataset.sn;
        const modelId = btn.dataset.model;
        const dev     = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        // Filter presets compatible with this device model
        const compatiblePresets = d.presets.filter(p =>
          p.status === 'Active' && (p.compatibleModels.length === 0 || p.compatibleModels.includes(modelId))
        );

        // Get current preset from assign logs
        let currentPreset = null;
        d.assignLogs.forEach(al => {
          if (al.deviceSn === sn && (!currentPreset || al.timestamp > currentPreset.timestamp)) {
            currentPreset = al;
          }
        });

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">มอบหมาย Preset</div>
            <div class="modal-subtitle">S/N: <span class="mono">${sn}</span> — ${dev.name}</div>
            ${currentPreset ? `
              <div class="card mb-16" style="padding:12px 16px;background:var(--bg-secondary);">
                <div class="text-sm text-muted">Preset ปัจจุบัน</div>
                <div class="font-600">${currentPreset.newPresetName}</div>
              </div>
            ` : ''}
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">เลือก Preset ใหม่</label>
                ${compatiblePresets.length === 0
                  ? `<div class="text-muted text-sm">ไม่มี Preset ที่รองรับรุ่นอุปกรณ์นี้</div>`
                  : `<select class="form-input" id="assign-preset-select">
                      <option value="">-- เลือก Preset --</option>
                      ${compatiblePresets.map(p => `<option value="${p.id}" data-name="${p.name}">${p.name}</option>`).join('')}
                    </select>`
                }
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              ${compatiblePresets.length > 0 ? `
                <button class="btn btn-primary" id="modal-submit-assign-preset">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> มอบหมาย
                </button>
              ` : ''}
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-assign-preset');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const presetSel  = document.getElementById('assign-preset-select');
            const newPresetId   = presetSel.value;
            const newPresetName = presetSel.selectedOptions[0]?.dataset.name || '';
            if (!newPresetId) { App.toast('กรุณาเลือก Preset', 'error'); return; }

            const now    = new Date();
            const nowStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            const newLogId = 'AL-' + String(d.assignLogs.length + 1).padStart(3, '0');

            d.assignLogs.unshift({
              id: newLogId,
              timestamp: nowStr,
              deviceSn: sn,
              deviceName: dev.name,
              newPreset: newPresetId,
              newPresetName: newPresetName,
              oldPreset: currentPreset ? currentPreset.newPreset : null,
              oldPresetName: currentPreset ? currentPreset.newPresetName : '(ไม่มี)',
              actor: 'Platform Admin',
              tenantName: dev.soldToName || '-',
            });

            window.App.closeModal();
            self._refresh();
            App.toast(`มอบหมาย Preset สำเร็จ! อุปกรณ์: ${dev.name} Preset: ${newPresetName}`, 'success');
          });
        }, 50);
      });
    });

    // ─── 5. Device Detail Modal (click on card body, not buttons) ───
    document.querySelectorAll('#dev-device-grid .entity-card').forEach(card => {
      card.addEventListener('click', e => {
        // Ignore clicks originating from action buttons
        if (e.target.closest('button')) return;

        const sn  = card.dataset.deviceSn;
        const dev = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        const devSessions = d.sessions.filter(se => se.deviceSn === sn);
        const devAssigns  = d.assignLogs.filter(al => al.deviceSn === sn);

        // Current preset
        let currentPreset = null;
        devAssigns.forEach(al => {
          if (!currentPreset || al.timestamp > currentPreset.timestamp) currentPreset = al;
        });

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">${dev.name}</div>
            <div class="modal-subtitle"><span class="mono">${dev.sn}</span></div>

            <!-- Device Info -->
            <div class="grid-2 mb-20">
              <div class="card" style="padding:16px;">
                <div class="text-sm text-muted mb-12 uppercase font-600">ข้อมูลอุปกรณ์</div>
                <div class="flex-col gap-8 text-sm">
                  <div><span class="text-muted">รุ่น:</span> <span class="font-600">${dev.modelName}</span></div>
                  <div><span class="text-muted">Register Code:</span> <span class="mono text-primary">${dev.registerCode}</span></div>
                  <div><span class="text-muted">สถานะ:</span> ${d.statusChip(dev.status)}</div>
                  <div><span class="text-muted">Tenant:</span> <span class="font-600">${dev.soldToName || '-'}</span></div>
                  <div><span class="text-muted">วันที่เปิดใช้:</span> <span class="mono">${dev.activationDate || '-'}</span></div>
                  <div><span class="text-muted">ออนไลน์:</span>
                    ${dev.online
                      ? '<span class="status-badge online" style="display:inline-flex;"><span class="status-dot"></span> Online</span>'
                      : '<span class="status-badge offline" style="display:inline-flex;"><span class="status-dot"></span> Offline</span>'}
                  </div>
                </div>
              </div>
              <div class="card" style="padding:16px;">
                <div class="text-sm text-muted mb-12 uppercase font-600">Preset & สถานะ</div>
                <div class="flex-col gap-8 text-sm">
                  <div><span class="text-muted">Preset ปัจจุบัน:</span> <span class="font-600">${currentPreset ? currentPreset.newPresetName : '-'}</span></div>
                  <div><span class="text-muted">มอบหมายเมื่อ:</span> <span class="mono">${currentPreset ? currentPreset.timestamp : '-'}</span></div>
                  <div><span class="text-muted">เซสชันทั้งหมด:</span> <span class="font-600 mono">${devSessions.length}</span></div>
                  <div><span class="text-muted">Heartbeat:</span>
                    ${dev.online
                      ? '<span class="chip chip-green">ปกติ</span>'
                      : '<span class="chip chip-red">ไม่ตอบสนอง</span>'}
                  </div>
                </div>
              </div>
            </div>

            <!-- Session History -->
            <div class="text-sm text-muted uppercase font-600 mb-8">ประวัติเซสชัน (${devSessions.length} รายการ)</div>
            ${devSessions.length > 0
              ? `<div class="table-wrap mb-16" style="max-height:180px;overflow-y:auto;">
                  <table>
                    <thead>
                      <tr><th>Session ID</th><th>Preset</th><th>เริ่มต้น</th><th>ระยะเวลา</th><th>Tokens</th></tr>
                    </thead>
                    <tbody>
                      ${devSessions.map(se => `
                        <tr>
                          <td class="mono">${se.id}</td>
                          <td>${se.presetName}</td>
                          <td class="mono text-sm">${se.start}</td>
                          <td class="mono">${se.duration != null ? se.duration + ' นาที' : '-'}</td>
                          <td class="mono">${se.tokens != null ? d.formatNumber(se.tokens) : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>`
              : '<div class="text-muted text-sm mb-16">ยังไม่มีประวัติเซสชัน</div>'
            }

            <!-- Assign History -->
            <div class="text-sm text-muted uppercase font-600 mb-8">ประวัติการมอบหมาย (${devAssigns.length} รายการ)</div>
            ${devAssigns.length > 0
              ? `<div class="table-wrap" style="max-height:180px;overflow-y:auto;">
                  <table>
                    <thead>
                      <tr><th>เวลา</th><th>Preset ใหม่</th><th>Preset เดิม</th><th>ผู้ดำเนินการ</th></tr>
                    </thead>
                    <tbody>
                      ${devAssigns.map(al => `
                        <tr>
                          <td class="mono text-sm">${al.timestamp}</td>
                          <td><span class="chip chip-green">${al.newPresetName}</span></td>
                          <td><span class="chip chip-gray">${al.oldPresetName}</span></td>
                          <td class="text-sm">${al.actor}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>`
              : '<div class="text-muted text-sm">ยังไม่มีประวัติการมอบหมาย</div>'
            }

            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
            </div>
          </div>
        `);
      });
    });
  }
};
