/* ================================================================
   Page Module — Hardware Inventory
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.hardware = {

  // ─── Helper: re-render this page in-place ───
  _refresh() {
    const content = document.getElementById('content');
    if (content) {
      content.innerHTML = window.Pages.hardware.render();
      window.Pages.hardware.init();
    }
  },

  // ─── Helper: generate random AV-XXXXXX code ───
  _genRegisterCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'AV-';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  },

  render() {
    const d = window.MockData;
    const devices = d.devices;
    const models = d.deviceModels;

    const registered    = devices.filter(dv => dv.status === 'Registered').length;
    const sold          = devices.filter(dv => dv.status === 'Sold').length;
    const activated     = devices.filter(dv => dv.status === 'Activated').length;
    const decommissioned = devices.filter(dv => dv.status === 'Decommissioned').length;

    // Unique tenants for filter dropdown
    const hwTenantMap = {};
    devices.filter(dv => dv.soldTo).forEach(dv => { hwTenantMap[dv.soldTo] = dv.soldToName; });
    const hwTenantOptions = Object.entries(hwTenantMap)
      .map(([id, name]) => `<option value="${id}">${name}</option>`).join('');

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">HARDWARE INVENTORY</h1>
        <div class="flex gap-10">
          <button class="btn btn-primary" id="btn-add-device">
            <i class="fa-solid fa-plus"></i> เพิ่มอุปกรณ์
          </button>
          <button class="btn btn-outline" id="btn-record-sale">
            <i class="fa-solid fa-receipt"></i> บันทึกการขาย
          </button>
          <button class="btn btn-outline" id="btn-bulk-import">
            <i class="fa-solid fa-file-import"></i> นำเข้าจำนวนมาก
          </button>
          <button class="btn btn-outline" id="btn-export-csv">
            <i class="fa-solid fa-file-csv"></i> ส่งออก CSV
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ลงทะเบียนแล้ว</span>
            <div class="stat-icon blue"><i class="fa-solid fa-clipboard-check"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(registered)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ขายแล้ว</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-truck"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(sold)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">เปิดใช้งานแล้ว</span>
            <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(activated)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ปลดระวาง</span>
            <div class="stat-icon red"><i class="fa-solid fa-ban"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(decommissioned)}</div>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar mb-20" id="hw-tabs">
        <div class="tab-item active" data-tab="all-devices">อุปกรณ์ทั้งหมด</div>
        <div class="tab-item" data-tab="device-models">รุ่นอุปกรณ์</div>
      </div>

      <!-- All Devices Tab Content -->
      <div id="tab-all-devices">
        <!-- Search / Filter -->
        <div class="flex items-center gap-12 mb-16">
          <div class="search-bar flex-1">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="hw-search" placeholder="ค้นหา S/N, ชื่ออุปกรณ์, Register Code...">
          </div>
          <select class="form-input" id="hw-status-filter" style="width:160px;">
            <option value="">ทุกสถานะ</option>
            <option value="Registered">Registered</option>
            <option value="Sold">Sold</option>
            <option value="Activated">Activated</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
          <select class="form-input" id="hw-tenant-filter" style="width:180px;">
            <option value="">Tenant ทั้งหมด</option>
            ${hwTenantOptions}
          </select>
        </div>

        <!-- Device Table -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>ชื่ออุปกรณ์</th>
                <th>รุ่น</th>
                <th>Register Code</th>
                <th>สถานะ</th>
                <th>ขายให้</th>
                <th>วันที่เปิดใช้</th>
                <th>ออนไลน์</th>
                <th>แก้ไขล่าสุด</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody id="hw-device-tbody">
              ${devices.map(dv => `
                <tr data-sn="${dv.sn}" data-status="${dv.status}" data-tenant="${dv.soldTo || ''}" data-search="${dv.sn} ${dv.name} ${dv.registerCode} ${dv.soldToName || ''}">
                  <td class="mono">${dv.sn}</td>
                  <td>
                    <span class="font-600 hw-edit-name" data-sn="${dv.sn}" style="cursor:pointer;border-bottom:1px dashed var(--text-dim);" title="คลิกเพื่อแก้ไขชื่อ">${dv.name}</span>
                  </td>
                  <td>${dv.modelName}</td>
                  <td><span class="mono text-primary">${dv.registerCode}</span></td>
                  <td>${d.statusChip(dv.status)}</td>
                  <td>${dv.soldToName || '<span class="text-muted">-</span>'}</td>
                  <td class="mono text-sm">${dv.activationDate || '<span class="text-muted">-</span>'}</td>
                  <td>
                    ${dv.online
                      ? '<span class="status-badge online"><span class="status-dot"></span> Online</span>'
                      : '<span class="status-badge offline"><span class="status-dot"></span> Offline</span>'}
                  </td>
                  <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${dv.modifiedDate || '-'}</div>${dv.modifiedBy ? `<div class="text-xs text-dim">${dv.modifiedBy.split('@')[0]}</div>` : ''}</td>
                  <td>
                    <div class="flex gap-6">
                      ${dv.status === 'Sold' ? `
                        <button class="btn btn-sm btn-success hw-btn-activate" data-sn="${dv.sn}">
                          <i class="fa-solid fa-bolt"></i> Activate
                        </button>
                      ` : ''}
                      ${dv.status === 'Activated' ? `
                        <button class="btn btn-sm btn-danger hw-btn-decommission" data-sn="${dv.sn}">
                          <i class="fa-solid fa-ban"></i> ปลดประจำการ
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Device Models Tab Content -->
      <div id="tab-device-models" class="hidden">
        <div class="flex justify-end mb-16">
          <button class="btn btn-primary" id="btn-create-model">
            <i class="fa-solid fa-plus"></i> สร้างรุ่นใหม่
          </button>
        </div>
        <div class="grid-3" id="hw-models-grid">
          ${models.map(m => `
            <div class="entity-card" data-model-id="${m.id}">
              <div class="entity-thumb">
                <i class="fa-solid fa-display" style="color:${m.status === 'Discontinued' ? 'var(--text-dim)' : 'var(--primary)'};"></i>
              </div>
              <div class="entity-body">
                <div class="font-600 mb-4">${m.name}</div>
                <div class="text-sm text-muted mb-8">
                  <span class="mono">${m.id}</span>
                </div>
                <div class="flex-col gap-6 text-sm">
                  <div><span class="text-muted uppercase">ขนาด:</span> ${m.size}</div>
                  <div><span class="text-muted uppercase">ความละเอียด:</span> ${m.resolution}</div>
                  <div><span class="text-muted uppercase">สเปค:</span> ${m.spec}</div>
                </div>
              </div>
              <div class="entity-footer">
                ${d.statusChip(m.status)}
                <span class="text-sm text-muted">${devices.filter(dv => dv.model === m.id).length} อุปกรณ์</span>
                <div class="flex gap-6">
                  <button class="btn btn-sm btn-outline hw-btn-edit-model" data-model-id="${m.id}">
                    <i class="fa-solid fa-pen"></i> แก้ไข
                  </button>
                  ${m.status !== 'Discontinued' ? `
                    <button class="btn btn-sm btn-danger hw-btn-discontinue-model" data-model-id="${m.id}">
                      <i class="fa-solid fa-ban"></i> ยกเลิก
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  init() {
    const d = window.MockData;
    const self = window.Pages.hardware;

    // ─── Tab switching ───
    const tabs = document.querySelectorAll('#hw-tabs .tab-item');
    const tabAllDevices   = document.getElementById('tab-all-devices');
    const tabDeviceModels = document.getElementById('tab-device-models');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        if (target === 'all-devices') {
          tabAllDevices.classList.remove('hidden');
          tabDeviceModels.classList.add('hidden');
        } else {
          tabAllDevices.classList.add('hidden');
          tabDeviceModels.classList.remove('hidden');
        }
      });
    });

    // ─── Search / Filter ───
    const searchInput  = document.getElementById('hw-search');
    const statusFilter = document.getElementById('hw-status-filter');
    const tenantFilter = document.getElementById('hw-tenant-filter');
    const rows         = document.querySelectorAll('#hw-device-tbody tr');

    function filterDevices() {
      const term   = (searchInput.value || '').toLowerCase();
      const status = statusFilter.value;
      const tenant = tenantFilter ? tenantFilter.value : '';
      rows.forEach(row => {
        const matchSearch = !term   || row.dataset.search.toLowerCase().includes(term);
        const matchStatus = !status || row.dataset.status === status;
        const matchTenant = !tenant || row.dataset.tenant === tenant;
        row.style.display = (matchSearch && matchStatus && matchTenant) ? '' : 'none';
      });
    }
    searchInput.addEventListener('input', filterDevices);
    statusFilter.addEventListener('change', filterDevices);
    if (tenantFilter) tenantFilter.addEventListener('change', filterDevices);

    // ─── 1. Add Device Modal ───
    document.getElementById('btn-add-device').addEventListener('click', () => {
      const activeModels = d.deviceModels.filter(m => m.status === 'Active');
      window.App.showModal(`
        <div class="modal">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title heading">เพิ่มอุปกรณ์ใหม่</div>
          <div class="modal-subtitle">กรอกข้อมูลอุปกรณ์เพื่อลงทะเบียนเข้าระบบ</div>
          <div class="flex-col gap-16">
            <div class="form-group">
              <label class="form-label">รุ่นอุปกรณ์</label>
              <select class="form-input" id="modal-model">
                <option value="">-- เลือกรุ่น --</option>
                ${activeModels.map(m => `<option value="${m.id}" data-name="${m.name}">${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Serial Number (S/N)</label>
              <input class="form-input" id="modal-sn" placeholder="RF-2025-XXXXX">
            </div>
            <div class="form-group">
              <label class="form-label">ชื่ออุปกรณ์</label>
              <input class="form-input" id="modal-name" placeholder="เช่น ตู้ล็อบบี้ ชั้น 1">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="modal-submit-device">
              <i class="fa-solid fa-plus"></i> ลงทะเบียน
            </button>
          </div>
        </div>
      `);

      setTimeout(() => {
        const submitBtn = document.getElementById('modal-submit-device');
        if (!submitBtn) return;
        submitBtn.addEventListener('click', () => {
          const snVal    = document.getElementById('modal-sn').value.trim();
          const nameVal  = document.getElementById('modal-name').value.trim();
          const modelSel = document.getElementById('modal-model');
          const modelId  = modelSel.value;
          const modelName = modelSel.selectedOptions[0]?.dataset.name || '';

          if (!snVal || !nameVal || !modelId) {
            App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
            return;
          }
          if (d.devices.find(dv => dv.sn === snVal)) {
            App.toast('S/N นี้มีอยู่ในระบบแล้ว', 'error');
            return;
          }

          const regCode = self._genRegisterCode();
          const today   = new Date().toISOString().split('T')[0];

          d.devices.push({
            sn: snVal,
            name: nameVal,
            model: modelId,
            modelName: modelName,
            registerCode: regCode,
            status: 'Registered',
            soldTo: null,
            soldToName: null,
            activatedBy: null,
            regDate: today,
            soldDate: null,
            activationDate: null,
            online: false,
            modifiedDate: today,
            modifiedBy: 'admin@realfact.ai',
          });

          window.App.closeModal();
          self._refresh();
          App.toast(`ลงทะเบียนอุปกรณ์สำเร็จ!\nS/N: ${snVal}\nRegister Code: ${regCode}`, 'success');
        });
      }, 50);
    });

    // ─── 2. Record Sale Modal ───
    document.getElementById('btn-record-sale').addEventListener('click', () => {
      const registeredDevices = d.devices.filter(dv => dv.status === 'Registered');
      if (registeredDevices.length === 0) {
        App.toast('ไม่มีอุปกรณ์ที่พร้อมขาย (สถานะ Registered)', 'warning');
        return;
      }
      window.App.showModal(`
        <div class="modal modal-wide">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title heading">บันทึกการขาย</div>
          <div class="modal-subtitle">เลือกอุปกรณ์และ Tenant ที่จะขายให้</div>
          <div class="flex-col gap-16">
            <div class="form-group">
              <label class="form-label">อุปกรณ์ (สถานะ Registered)</label>
              <select class="form-input" id="sale-device">
                <option value="">-- เลือกอุปกรณ์ --</option>
                ${registeredDevices.map(dv => `<option value="${dv.sn}">${dv.name} (${dv.sn})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tenant</label>
              <select class="form-input" id="sale-tenant">
                <option value="">-- เลือก Tenant --</option>
                ${d.tenants.map(t => `<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">วันที่ขาย</label>
              <input type="date" class="form-input" id="sale-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="modal-submit-sale">
              <i class="fa-solid fa-receipt"></i> บันทึกการขาย
            </button>
          </div>
        </div>
      `);

      setTimeout(() => {
        const submitBtn = document.getElementById('modal-submit-sale');
        if (!submitBtn) return;
        submitBtn.addEventListener('click', () => {
          const devSn      = document.getElementById('sale-device').value;
          const tenantSel  = document.getElementById('sale-tenant');
          const tenantId   = tenantSel.value;
          const tenantName = tenantSel.selectedOptions[0]?.dataset.name || '';
          const saleDate   = document.getElementById('sale-date').value;

          if (!devSn || !tenantId || !saleDate) {
            App.toast('กรุณาเลือกข้อมูลให้ครบถ้วน', 'error');
            return;
          }

          const dev = d.devices.find(dv => dv.sn === devSn);
          if (dev) {
            dev.status       = 'Sold';
            dev.soldTo       = tenantId;
            dev.soldToName   = tenantName;
            dev.soldDate     = saleDate;
            dev.modifiedDate = new Date().toISOString().split('T')[0];
            dev.modifiedBy   = 'admin@realfact.ai';
          }

          window.App.closeModal();
          self._refresh();
          App.toast(`บันทึกการขายสำเร็จ!\nอุปกรณ์: ${devSn}\nTenant: ${tenantName}`, 'success');
        });
      }, 50);
    });

    // ─── 3. Bulk Import CSV ───
    document.getElementById('btn-bulk-import').addEventListener('click', () => {
      window.App.showModal(`
        <div class="modal modal-wide">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title heading">นำเข้าอุปกรณ์จำนวนมาก (CSV)</div>
          <div class="modal-subtitle">รองรับไฟล์ CSV รูปแบบ: sn, name, model, registerCode</div>
          <div class="flex-col gap-16">
            <div class="form-group">
              <label class="form-label">อัปโหลดไฟล์ CSV</label>
              <div style="border:2px dashed var(--border);border-radius:8px;padding:32px;text-align:center;cursor:pointer;" id="csv-drop-zone">
                <i class="fa-solid fa-cloud-upload-alt" style="font-size:2rem;color:var(--text-dim);margin-bottom:8px;display:block;"></i>
                <div class="text-muted text-sm">คลิกหรือลากไฟล์ CSV มาวางที่นี่</div>
                <input type="file" id="csv-file-input" accept=".csv" style="display:none;">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ตัวอย่าง / วางข้อมูล CSV</label>
              <textarea class="form-input" id="csv-preview" rows="6" placeholder="sn,name,model,registerCode\nRF-2025-00101,ตู้ชั้น 1,DM-001,AV-ABC123\nRF-2025-00102,ตู้ชั้น 2,DM-002,AV-XYZ789" style="font-family:monospace;font-size:12px;"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="modal-submit-import">
              <i class="fa-solid fa-file-import"></i> นำเข้า
            </button>
          </div>
        </div>
      `);

      setTimeout(() => {
        // Wire drop zone to file input
        const dropZone   = document.getElementById('csv-drop-zone');
        const fileInput  = document.getElementById('csv-file-input');
        const previewTA  = document.getElementById('csv-preview');

        if (dropZone) {
          dropZone.addEventListener('click', () => fileInput && fileInput.click());
          fileInput && fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => { if (previewTA) previewTA.value = ev.target.result; };
            reader.readAsText(file, 'UTF-8');
          });
        }

        const submitBtn = document.getElementById('modal-submit-import');
        if (!submitBtn) return;
        submitBtn.addEventListener('click', () => {
          const raw   = (previewTA ? previewTA.value : '').trim();
          const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('sn'));
          let imported = 0;

          lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 2) return;
            const [sn, name, model, regCode] = parts;
            if (!sn || d.devices.find(dv => dv.sn === sn)) return;
            const modelObj  = d.deviceModels.find(m => m.id === model);
            const today     = new Date().toISOString().split('T')[0];
            d.devices.push({
              sn,
              name: name || sn,
              model: model || '',
              modelName: modelObj ? modelObj.name : (model || ''),
              registerCode: regCode || self._genRegisterCode(),
              status: 'Registered',
              soldTo: null, soldToName: null, activatedBy: null,
              regDate: today, soldDate: null, activationDate: null,
              online: false,
              modifiedDate: today,
              modifiedBy: 'admin@realfact.ai',
            });
            imported++;
          });

          window.App.closeModal();
          self._refresh();
          App.toast(`นำเข้าสำเร็จ ${imported} รายการ`, 'success');
        });
      }, 50);
    });

    // ─── 4. Export CSV ───
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      const headers = ['sn', 'name', 'model', 'modelName', 'registerCode', 'status', 'soldTo', 'soldToName', 'regDate', 'soldDate', 'activationDate'];
      const rows = [
        headers.join(','),
        ...d.devices.map(dv =>
          headers.map(h => {
            const val = dv[h] != null ? String(dv[h]) : '';
            return val.includes(',') ? `"${val}"` : val;
          }).join(',')
        ),
      ];
      const csv  = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `hardware-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // ─── 5. Activate Device (on Sold rows) ───
    document.querySelectorAll('.hw-btn-activate').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const sn  = btn.dataset.sn;
        const dev = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        const preFilled = dev.soldTo || '';
        const preName   = dev.soldToName || '';

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">เปิดใช้งานอุปกรณ์</div>
            <div class="modal-subtitle">S/N: <span class="mono">${sn}</span> — ${dev.name}</div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">Tenant</label>
                <select class="form-input" id="activate-tenant">
                  ${d.tenants.map(t => `<option value="${t.id}" data-name="${t.name}" ${t.id === preFilled ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">วันที่เปิดใช้งาน</label>
                <input type="date" class="form-input" id="activate-date" value="${new Date().toISOString().split('T')[0]}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-success" id="modal-submit-activate">
                <i class="fa-solid fa-bolt"></i> ยืนยันเปิดใช้งาน
              </button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-activate');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const tenantSel  = document.getElementById('activate-tenant');
            const tenantId   = tenantSel.value;
            const tenantName = tenantSel.selectedOptions[0]?.dataset.name || '';
            const actDate    = document.getElementById('activate-date').value;

            dev.status         = 'Activated';
            dev.soldTo         = dev.soldTo || tenantId;
            dev.soldToName     = dev.soldToName || tenantName;
            dev.activatedBy    = tenantId;
            dev.activationDate = actDate;
            dev.online         = false;

            window.App.closeModal();
            self._refresh();
            App.toast(`เปิดใช้งานสำเร็จ!\nS/N: ${sn}`, 'success');
          });
        }, 50);
      });
    });

    // ─── 6. Decommission Device (on Activated rows) ───
    document.querySelectorAll('.hw-btn-decommission').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const sn  = btn.dataset.sn;
        const dev = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        App.confirm(`ยืนยันปลดประจำการอุปกรณ์?\nS/N: ${sn}\nชื่อ: ${dev.name}\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`, {
          title: 'ยืนยันการดำเนินการ',
          confirmText: 'ยืนยัน',
          cancelText: 'ยกเลิก',
          type: 'danger'
        }).then(ok => {
          if (!ok) return;
          dev.status       = 'Decommissioned';
          dev.online       = false;
          dev.modifiedDate = new Date().toISOString().split('T')[0];
          dev.modifiedBy   = 'admin@realfact.ai';
          self._refresh();
          App.toast(`ปลดประจำการอุปกรณ์สำเร็จ: ${sn}`, 'success');
        });
      });
    });

    // ─── 7. Edit Device Name (click on name) ───
    document.querySelectorAll('.hw-edit-name').forEach(nameEl => {
      nameEl.addEventListener('click', e => {
        e.stopPropagation();
        const sn  = nameEl.dataset.sn;
        const dev = d.devices.find(dv => dv.sn === sn);
        if (!dev) return;

        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">แก้ไขชื่ออุปกรณ์</div>
            <div class="modal-subtitle">S/N: <span class="mono">${sn}</span></div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">ชื่ออุปกรณ์</label>
                <input class="form-input" id="edit-name-input" value="${dev.name}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-edit-name">
                <i class="fa-solid fa-check"></i> บันทึก
              </button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const input     = document.getElementById('edit-name-input');
          const submitBtn = document.getElementById('modal-submit-edit-name');
          if (!submitBtn || !input) return;
          if (input) input.focus();
          submitBtn.addEventListener('click', () => {
            const newName = input.value.trim();
            if (!newName) { App.toast('กรุณากรอกชื่ออุปกรณ์', 'error'); return; }
            dev.name = newName;
            window.App.closeModal();
            self._refresh();
          });
        }, 50);
      });
    });

    // ─── 8a. Create Device Model ───
    const btnCreateModel = document.getElementById('btn-create-model');
    if (btnCreateModel) {
      btnCreateModel.addEventListener('click', () => {
        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">สร้างรุ่นอุปกรณ์ใหม่</div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">ชื่อรุ่น</label>
                <input class="form-input" id="cm-name" placeholder="เช่น AvatarRealfact Pro 75&quot;">
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">ขนาด</label>
                  <input class="form-input" id="cm-size" placeholder='เช่น 55"'>
                </div>
                <div class="form-group">
                  <label class="form-label">ความละเอียด</label>
                  <input class="form-input" id="cm-resolution" placeholder="เช่น 4K (3840x2160)">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">สเปค</label>
                <input class="form-input" id="cm-spec" placeholder="เช่น Intel i7, 32GB RAM, 512GB SSD">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-model">
                <i class="fa-solid fa-plus"></i> สร้างรุ่น
              </button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-model');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const name       = document.getElementById('cm-name').value.trim();
            const size       = document.getElementById('cm-size').value.trim();
            const resolution = document.getElementById('cm-resolution').value.trim();
            const spec       = document.getElementById('cm-spec').value.trim();

            if (!name || !size || !resolution || !spec) {
              App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
              return;
            }

            const newId = 'DM-' + String(d.deviceModels.length + 1).padStart(3, '0');
            d.deviceModels.push({ id: newId, name, size, resolution, spec, status: 'Active', thumbnail: null });

            window.App.closeModal();
            self._refresh();
            // Switch to models tab after refresh
            setTimeout(() => {
              const modelsTab = document.querySelector('#hw-tabs .tab-item[data-tab="device-models"]');
              if (modelsTab) modelsTab.click();
            }, 50);
          });
        }, 50);
      });
    }

    // ─── 8b. Edit Device Model ───
    document.querySelectorAll('.hw-btn-edit-model').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const modelId = btn.dataset.modelId;
        const m = d.deviceModels.find(md => md.id === modelId);
        if (!m) return;

        window.App.showModal(`
          <div class="modal modal-wide">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title heading">แก้ไขรุ่นอุปกรณ์</div>
            <div class="modal-subtitle"><span class="mono">${m.id}</span></div>
            <div class="flex-col gap-16">
              <div class="form-group">
                <label class="form-label">ชื่อรุ่น</label>
                <input class="form-input" id="em-name" value="${m.name}">
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">ขนาด</label>
                  <input class="form-input" id="em-size" value="${m.size}">
                </div>
                <div class="form-group">
                  <label class="form-label">ความละเอียด</label>
                  <input class="form-input" id="em-resolution" value="${m.resolution}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">สเปค</label>
                <input class="form-input" id="em-spec" value="${m.spec}">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="modal-submit-edit-model">
                <i class="fa-solid fa-check"></i> บันทึก
              </button>
            </div>
          </div>
        `);

        setTimeout(() => {
          const submitBtn = document.getElementById('modal-submit-edit-model');
          if (!submitBtn) return;
          submitBtn.addEventListener('click', () => {
            const name       = document.getElementById('em-name').value.trim();
            const size       = document.getElementById('em-size').value.trim();
            const resolution = document.getElementById('em-resolution').value.trim();
            const spec       = document.getElementById('em-spec').value.trim();

            if (!name || !size || !resolution || !spec) {
              App.toast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
              return;
            }
            m.name       = name;
            m.size       = size;
            m.resolution = resolution;
            m.spec       = spec;

            window.App.closeModal();
            self._refresh();
            setTimeout(() => {
              const modelsTab = document.querySelector('#hw-tabs .tab-item[data-tab="device-models"]');
              if (modelsTab) modelsTab.click();
            }, 50);
          });
        }, 50);
      });
    });

    // ─── 8c. Discontinue Device Model ───
    document.querySelectorAll('.hw-btn-discontinue-model').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const modelId = btn.dataset.modelId;
        const m = d.deviceModels.find(md => md.id === modelId);
        if (!m) return;

        App.confirm(`ยืนยันยกเลิกรุ่น "${m.name}"?\nรุ่นนี้จะถูกทำเครื่องหมายว่า Discontinued`, {
          title: 'ยืนยันการดำเนินการ',
          confirmText: 'ยืนยัน',
          cancelText: 'ยกเลิก',
          type: 'danger'
        }).then(ok => {
          if (!ok) return;
          m.status = 'Discontinued';
          self._refresh();
          setTimeout(() => {
            const modelsTab = document.querySelector('#hw-tabs .tab-item[data-tab="device-models"]');
            if (modelsTab) modelsTab.click();
          }, 50);
        });
      });
    });
  }
};
