/* ================================================================
   Page Module — Payment Settings (Global)
   Bank Accounts, PromptPay/QR, Payment Channels per Sub-Platform
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.paymentSettings = {

  _bankLogos: {
    scb:   { color: '#4e2d8c', abbr: 'SCB'  },
    kbank: { color: '#138f2d', abbr: 'KBank' },
    bbl:   { color: '#1b4fac', abbr: 'BBL'  },
    ktb:   { color: '#009FDA', abbr: 'KTB'  },
    bay:   { color: '#ffc72c', abbr: 'BAY'  },
    gsb:   { color: '#f68b1e', abbr: 'GSB'  },
  },

  _rerender(activeTab) {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.paymentSettings.render();
    window.Pages.paymentSettings.init(activeTab);
  },

  render() {
    const d      = window.MockData;
    const banks  = d.bankAccounts   || [];
    const pp     = d.promptPayConfig || [];
    const ch     = d.paymentChannels || {};
    const sps    = d.subPlatforms   || [];
    const btCfg  = d.billingTermsConfig;
    const self   = window.Pages.paymentSettings;

    const activeBanks  = banks.filter(b => b.status === 'Active').length;
    const activePP     = pp.filter(p => p.status === 'Active').length;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">PAYMENT SETTINGS</h1>
          <div class="text-sm text-muted mt-2">
            ตั้งค่าบัญชีธนาคาร, PromptPay และช่องทางรับชำระเงินสำหรับแต่ละ Sub-Platform
          </div>
        </div>
        <div class="page-header-actions">
          ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-primary" id="btn-add-bank">
            <i class="fa-solid fa-plus"></i> เพิ่มบัญชีธนาคาร
          </button>` : ''}
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Bank Accounts</span>
            <div class="stat-icon blue"><i class="fa-solid fa-building-columns"></i></div>
          </div>
          <div class="stat-value mono">${banks.length}</div>
          <div class="stat-change up">${activeBanks} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">PromptPay / QR</span>
            <div class="stat-icon green"><i class="fa-solid fa-qrcode"></i></div>
          </div>
          <div class="stat-value mono">${pp.length}</div>
          <div class="stat-change up">${activePP} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Sub-Platforms ที่ตั้งค่าแล้ว</span>
            <div class="stat-icon orange"><i class="fa-solid fa-layer-group"></i></div>
          </div>
          <div class="stat-value mono">${Object.keys(ch).length}</div>
          <div class="stat-change up">จาก ${sps.length} ทั้งหมด</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ช่องทางที่เปิดใช้งาน</span>
            <div class="stat-icon green"><i class="fa-solid fa-check-double"></i></div>
          </div>
          <div class="stat-value mono">
            ${Object.values(ch).reduce((sum, c) => sum + Object.values(c).filter(Boolean).length, 0)}
          </div>
          <div class="stat-change up">รวมทุก Sub-Platform</div>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar mb-20">
        <div class="tab-item active" data-tab="bank-accounts">
          <i class="fa-solid fa-building-columns"></i> Bank Accounts
        </div>
        <div class="tab-item" data-tab="promptpay">
          <i class="fa-solid fa-qrcode"></i> PromptPay / QR
        </div>
        <div class="tab-item" data-tab="channels">
          <i class="fa-solid fa-sliders"></i> Payment Channels
        </div>
        <div class="tab-item" data-tab="billing-terms">
          <i class="fa-solid fa-calendar-days"></i> Billing Terms
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Tab: Bank Accounts
      ══════════════════════════════════════════ -->
      <div id="tab-bank-accounts" class="ps-tab-content">
        <div class="banner-info mb-16">
          <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
          <div class="text-sm flex-1">
            บัญชีที่ Assign ให้ Sub-Platform จะแสดงในใบแจ้งหนี้และหน้ายืนยันการโอนเงินให้ Tenant เห็น
          </div>
        </div>

        <div class="flex-col gap-16" id="bank-cards-wrap">
          ${banks.map(b => {
            const logo = self._bankLogos[b.bankCode] || { color: '#6b7280', abbr: '??' };
            return `
            <div class="card p-20" id="bank-card-${b.id}">
              <div class="flex items-center gap-20">
                <!-- Bank Logo -->
                <div style="width:52px;height:52px;border-radius:12px;background:${logo.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex-shrink:0;letter-spacing:0.5px;">
                  ${logo.abbr}
                </div>

                <!-- Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-10 mb-4">
                    <span class="font-700">${b.bankName}</span>
                    ${b.isDefault ? '<span class="chip chip-orange" style="font-size:10px;"><i class="fa-solid fa-star"></i> Default</span>' : ''}
                    ${b.status === 'Active' ? '<span class="chip chip-green">Active</span>' : '<span class="chip chip-red">Inactive</span>'}
                  </div>
                  <div class="text-sm font-600 mono">${b.accountNumber}</div>
                  <div class="text-sm text-muted">${b.accountName} · ${b.branch}</div>
                </div>

                <!-- Sub-Platforms assigned -->
                <div class="flex-col gap-6" style="min-width:200px;">
                  <div class="text-xs text-muted uppercase mb-4">Assigned Sub-Platforms</div>
                  <div class="flex gap-6 flex-wrap">
                    ${b.assignedSubPlatforms.length > 0
                      ? b.assignedSubPlatforms.map(sp =>
                          `<span class="chip chip-blue" style="font-size:10px;">${sp}</span>`
                        ).join('')
                      : '<span class="text-sm text-muted">ไม่ได้ assign</span>'}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-6">
                  ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-sm btn-outline bank-edit-btn" data-id="${b.id}" title="แก้ไข">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline bank-toggle-btn" data-id="${b.id}"
                    title="${b.status === 'Active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}">
                    <i class="fa-solid ${b.status === 'Active' ? 'fa-eye-slash' : 'fa-eye'}"></i>
                  </button>
                  ${!b.isDefault && b.status === 'Active'
                    ? `<button class="btn btn-sm btn-outline bank-set-default-btn" data-id="${b.id}" title="ตั้งเป็น Default">
                        <i class="fa-solid fa-star"></i>
                       </button>` : ''}` : ''}
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Tab: PromptPay / QR
      ══════════════════════════════════════════ -->
      <div id="tab-promptpay" class="ps-tab-content hidden">
        <div class="flex items-center justify-between mb-16">
          <div class="text-sm text-muted">ตั้งค่า PromptPay สำหรับรับชำระเงินผ่าน QR Code</div>
          ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-outline" id="btn-add-promptpay">
            <i class="fa-solid fa-plus"></i> เพิ่ม PromptPay
          </button>` : ''}
        </div>

        <div class="flex-col gap-16">
          ${pp.map(p => `
            <div class="card p-20">
              <div class="flex items-center gap-20">
                <!-- QR Icon -->
                <div style="width:52px;height:52px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i class="fa-solid fa-qrcode" style="font-size:24px;color:var(--primary);"></i>
                </div>

                <!-- Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-10 mb-4">
                    <span class="font-700">${p.label}</span>
                    ${p.status === 'Active' ? '<span class="chip chip-green">Active</span>' : '<span class="chip chip-red">Inactive</span>'}
                  </div>
                  <div class="text-sm font-600 mono">${p.value}</div>
                  <div class="text-sm text-muted">${p.qrNote}</div>
                </div>

                <!-- Assigned SPs -->
                <div class="flex-col gap-6" style="min-width:200px;">
                  <div class="text-xs text-muted uppercase mb-4">Assigned Sub-Platforms</div>
                  <div class="flex gap-6 flex-wrap">
                    ${p.assignedSubPlatforms.map(sp =>
                      `<span class="chip chip-blue" style="font-size:10px;">${sp}</span>`
                    ).join('')}
                  </div>
                </div>

                <!-- QR Preview placeholder -->
                <div style="width:80px;height:80px;border-radius:8px;background:var(--surface2);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;"
                  title="QR Preview">
                  <div class="text-center">
                    <i class="fa-solid fa-qrcode text-muted" style="font-size:28px;"></i>
                    <div class="text-xs text-muted mt-2">Preview</div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-6">
                  ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-sm btn-outline pp-edit-btn" data-id="${p.id}" title="แก้ไข">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline pp-toggle-btn" data-id="${p.id}"
                    title="${p.status === 'Active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}">
                    <i class="fa-solid ${p.status === 'Active' ? 'fa-eye-slash' : 'fa-eye'}"></i>
                  </button>` : ''}
                </div>
              </div>
            </div>
          `).join('')}

          ${pp.length === 0 ? '<div class="empty-state"><i class="fa-solid fa-qrcode"></i><p>ยังไม่มีการตั้งค่า PromptPay</p></div>' : ''}
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Tab: Payment Channels
      ══════════════════════════════════════════ -->
      <div id="tab-channels" class="ps-tab-content hidden">
        <div class="banner-info mb-16">
          <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
          <div class="text-sm flex-1">
            เปิด/ปิดช่องทางรับชำระเงินสำหรับแต่ละ Sub-Platform ช่องทางที่ปิดจะไม่แสดงให้ Tenant เห็นในขั้นตอนชำระเงิน
          </div>
        </div>

        <div class="flex-col gap-16">
          ${sps.map(sp => {
            const spCh = ch[sp.code] || {};
            const spColor = sp.primaryColor || '#6b7280';
            return `
            <div class="card p-20">
              <div class="flex items-center gap-16 mb-16">
                <div style="width:10px;height:10px;border-radius:50%;background:${spColor};flex-shrink:0;"></div>
                <div class="font-700">${sp.name}</div>
                <span class="mono text-xs text-muted">${sp.domain}</span>
                ${sp.status === 'Active' ? '<span class="chip chip-green">Active</span>' : `<span class="chip chip-yellow">${sp.status}</span>`}
              </div>

              <div class="flex gap-12 flex-wrap">
                <!-- Card 2C2P -->
                <div class="flex items-center gap-12 p-16 flex-1"
                  style="background:var(--surface2);border-radius:10px;min-width:180px;border:2px solid ${spCh.card2c2p ? 'var(--success)' : 'var(--border)'};">
                  <div style="width:40px;height:40px;border-radius:8px;background:#1a1aff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-credit-card" style="color:#fff;"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-600 text-sm">Card (2C2P)</div>
                    <div class="text-xs text-muted">Visa, Mastercard, JCB</div>
                  </div>
                  <label class="channel-toggle-wrap">
                    <input type="checkbox" class="channel-toggle" data-sp="${sp.code}" data-ch="card2c2p" ${spCh.card2c2p ? 'checked' : ''}>
                    <span class="channel-toggle-slider"></span>
                  </label>
                </div>

                <!-- Bank Transfer -->
                <div class="flex items-center gap-12 p-16 flex-1"
                  style="background:var(--surface2);border-radius:10px;min-width:180px;border:2px solid ${spCh.bankTransfer ? 'var(--success)' : 'var(--border)'};">
                  <div style="width:40px;height:40px;border-radius:8px;background:#138f2d;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-building-columns" style="color:#fff;"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-600 text-sm">Bank Transfer</div>
                    <div class="text-xs text-muted">โอนเงินพร้อมแนบสลิป</div>
                  </div>
                  <label class="channel-toggle-wrap">
                    <input type="checkbox" class="channel-toggle" data-sp="${sp.code}" data-ch="bankTransfer" ${spCh.bankTransfer ? 'checked' : ''}>
                    <span class="channel-toggle-slider"></span>
                  </label>
                </div>

                <!-- PromptPay -->
                <div class="flex items-center gap-12 p-16 flex-1"
                  style="background:var(--surface2);border-radius:10px;min-width:180px;border:2px solid ${spCh.promptPay ? 'var(--success)' : 'var(--border)'};">
                  <div style="width:40px;height:40px;border-radius:8px;background:#4e2d8c;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-qrcode" style="color:#fff;"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-600 text-sm">PromptPay</div>
                    <div class="text-xs text-muted">QR Code / พร้อมเพย์</div>
                  </div>
                  <label class="channel-toggle-wrap">
                    <input type="checkbox" class="channel-toggle" data-sp="${sp.code}" data-ch="promptPay" ${spCh.promptPay ? 'checked' : ''}>
                    <span class="channel-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Tab: Billing Terms (Credit Line)
      ══════════════════════════════════════════ -->
      <div id="tab-billing-terms" class="ps-tab-content hidden">
        <div class="banner-info mb-16">
          <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
          <div class="text-sm flex-1">
            ตั้งค่านี้ใช้กับ <strong>ลูกค้าแบบ Credit Line เท่านั้น</strong> (เช่น Developer Portal) —
            ลูกค้าแบบ Subscription (เช่น Avatar) ใช้รอบบิลตาม Plan ที่สมัคร
          </div>
        </div>

        <!-- Layer 1: Platform Default -->
        <div class="section-title mb-12"><i class="fa-solid fa-globe text-primary"></i> Platform Default</div>
        <div class="card p-20 mb-24">
          <div class="text-sm text-muted mb-16">ค่าเริ่มต้นสำหรับ Credit Line ใหม่ทุกรายการ ถ้าไม่มี Per-Context override</div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Default Billing Cycle</label>
              <select class="form-input" id="bt-default-cycle">
                <option value="15" ${btCfg.platformDefault.billingCycle === 15 ? 'selected' : ''}>15 วัน</option>
                <option value="30" ${btCfg.platformDefault.billingCycle === 30 ? 'selected' : ''}>30 วัน</option>
                <option value="60" ${btCfg.platformDefault.billingCycle === 60 ? 'selected' : ''}>60 วัน</option>
                <option value="90" ${btCfg.platformDefault.billingCycle === 90 ? 'selected' : ''}>90 วัน</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Default Payment Terms</label>
              <select class="form-input" id="bt-default-terms">
                <option value="Net 15" ${btCfg.platformDefault.paymentTerms === 'Net 15' ? 'selected' : ''}>Net 15</option>
                <option value="Net 30" ${btCfg.platformDefault.paymentTerms === 'Net 30' ? 'selected' : ''}>Net 30</option>
                <option value="Net 60" ${btCfg.platformDefault.paymentTerms === 'Net 60' ? 'selected' : ''}>Net 60</option>
                <option value="Net 90" ${btCfg.platformDefault.paymentTerms === 'Net 90' ? 'selected' : ''}>Net 90</option>
              </select>
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <label class="flex items-center gap-10" style="cursor:pointer;">
              <input type="checkbox" id="bt-auto-invoice" ${btCfg.platformDefault.autoGenerateInvoice ? 'checked' : ''} style="width:18px;height:18px;">
              <div>
                <div class="font-600 text-sm">Auto-generate Invoice</div>
                <div class="text-xs text-muted">ออกใบแจ้งหนี้อัตโนมัติเมื่อครบรอบบิล</div>
              </div>
            </label>
            <label class="flex items-center gap-10" style="cursor:pointer;">
              <input type="checkbox" id="bt-hard-block" ${btCfg.platformDefault.hardBlockAtZero ? 'checked' : ''} style="width:18px;height:18px;">
              <div>
                <div class="font-600 text-sm">Hard Block at 0 Credit</div>
                <div class="text-xs text-muted">ระงับการใช้งานทันทีเมื่อ Available Credit = 0</div>
              </div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-xs text-muted">แก้ไขล่าสุด: ${btCfg.platformDefault.modifiedDate} โดย ${btCfg.platformDefault.modifiedBy}</div>
            <button class="btn btn-primary btn-sm" id="bt-save-default"><i class="fa-solid fa-save"></i> บันทึก Platform Default</button>
          </div>
        </div>

      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════
  init(activeTab) {
    const d    = window.MockData;
    const self = window.Pages.paymentSettings;

    // ─── Tab Switching ───
    const tabs   = document.querySelectorAll('.tab-bar .tab-item');
    const tabIds = { 'bank-accounts': 'tab-bank-accounts', 'promptpay': 'tab-promptpay', 'channels': 'tab-channels', 'billing-terms': 'tab-billing-terms' };

    function activateTab(key) {
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(tabIds).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
      document.querySelector(`.tab-bar .tab-item[data-tab="${key}"]`)?.classList.add('active');
      document.getElementById(tabIds[key])?.classList.remove('hidden');
    }
    tabs.forEach(t => t.addEventListener('click', () => activateTab(t.dataset.tab)));
    if (activeTab && tabIds[activeTab]) activateTab(activeTab);

    // ─── Bank: Toggle Active ───
    document.querySelectorAll('.bank-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bank = (d.bankAccounts || []).find(b => b.id === btn.dataset.id);
        if (!bank) return;
        bank.status = bank.status === 'Active' ? 'Inactive' : 'Active';
        App.toast(`${bank.bankName} ${bank.status === 'Active' ? 'เปิด' : 'ปิด'}ใช้งานแล้ว`, 'success');
        self._rerender('bank-accounts');
      });
    });

    // ─── Bank: Set Default ───
    document.querySelectorAll('.bank-set-default-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const banks = d.bankAccounts || [];
        banks.forEach(b => { b.isDefault = false; });
        const bank = banks.find(b => b.id === btn.dataset.id);
        if (bank) bank.isDefault = true;
        App.toast(`ตั้ง ${bank?.bankName} เป็น Default แล้ว`, 'success');
        self._rerender('bank-accounts');
      });
    });

    // ─── Bank: Edit Modal ───
    document.querySelectorAll('.bank-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bank = (d.bankAccounts || []).find(b => b.id === btn.dataset.id);
        if (!bank) return;
        const spOpts = (d.subPlatforms || []).map(sp =>
          `<label class="flex items-center gap-8" style="cursor:pointer;">
            <input type="checkbox" class="bank-sp-check" value="${sp.code}" ${bank.assignedSubPlatforms.includes(sp.code) ? 'checked' : ''}>
            <span class="text-sm">${sp.name} (${sp.code})</span>
           </label>`
        ).join('');
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title"><i class="fa-solid fa-building-columns text-primary"></i> แก้ไขบัญชีธนาคาร</div>
            <div class="form-group">
              <label class="form-label">ธนาคาร</label>
              <input class="form-input" id="edit-bank-name" value="${bank.bankName}">
            </div>
            <div class="form-group">
              <label class="form-label">เลขบัญชี</label>
              <input class="form-input" id="edit-bank-no" value="${bank.accountNumber}">
            </div>
            <div class="form-group">
              <label class="form-label">ชื่อบัญชี</label>
              <input class="form-input" id="edit-bank-name-acct" value="${bank.accountName}">
            </div>
            <div class="form-group">
              <label class="form-label">สาขา</label>
              <input class="form-input" id="edit-bank-branch" value="${bank.branch}">
            </div>
            <div class="form-group">
              <label class="form-label">Assign ให้ Sub-Platform</label>
              <div class="flex-col gap-8 p-12" style="background:var(--surface2);border-radius:8px;">
                ${spOpts}
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="save-bank-btn"><i class="fa-solid fa-save"></i> บันทึก</button>
            </div>
          </div>
        `);
        document.getElementById('save-bank-btn')?.addEventListener('click', () => {
          bank.bankName       = document.getElementById('edit-bank-name').value.trim() || bank.bankName;
          bank.accountNumber  = document.getElementById('edit-bank-no').value.trim() || bank.accountNumber;
          bank.accountName    = document.getElementById('edit-bank-name-acct').value.trim() || bank.accountName;
          bank.branch         = document.getElementById('edit-bank-branch').value.trim() || bank.branch;
          bank.assignedSubPlatforms = [...document.querySelectorAll('.bank-sp-check:checked')].map(el => el.value);
          App.toast('บันทึกบัญชีธนาคารแล้ว', 'success');
          App.closeModal();
          self._rerender('bank-accounts');
        });
      });
    });

    // ─── Bank: Add Modal ───
    document.getElementById('btn-add-bank')?.addEventListener('click', () => {
      const bankOptions = Object.entries(self._bankLogos).map(([code, l]) =>
        `<option value="${code}">${l.abbr}</option>`
      ).join('');
      const spOpts = (d.subPlatforms || []).map(sp =>
        `<label class="flex items-center gap-8" style="cursor:pointer;">
          <input type="checkbox" class="new-bank-sp-check" value="${sp.code}">
          <span class="text-sm">${sp.name} (${sp.code})</span>
         </label>`
      ).join('');
      window.App.showModal(`
        <div class="modal">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title"><i class="fa-solid fa-plus text-primary"></i> เพิ่มบัญชีธนาคาร</div>
          <div class="form-group">
            <label class="form-label">ธนาคาร <span style="color:var(--error)">*</span></label>
            <div class="flex gap-10">
              <select class="form-input" id="new-bank-code" style="max-width:130px;">${bankOptions}</select>
              <input class="form-input flex-1" id="new-bank-name" placeholder="เช่น ธนาคารไทยพาณิชย์ (SCB)">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">เลขบัญชี <span style="color:var(--error)">*</span></label>
            <input class="form-input" id="new-bank-no" placeholder="เช่น 111-2-33456-7">
          </div>
          <div class="form-group">
            <label class="form-label">ชื่อบัญชี <span style="color:var(--error)">*</span></label>
            <input class="form-input" id="new-bank-acct-name" placeholder="เช่น บริษัท เรียลแฟค จำกัด">
          </div>
          <div class="form-group">
            <label class="form-label">สาขา</label>
            <input class="form-input" id="new-bank-branch" placeholder="เช่น สาขาสีลม">
          </div>
          <div class="form-group">
            <label class="form-label">Assign ให้ Sub-Platform</label>
            <div class="flex-col gap-8 p-12" style="background:var(--surface2);border-radius:8px;">
              ${spOpts}
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="create-bank-btn"><i class="fa-solid fa-plus"></i> เพิ่มบัญชี</button>
          </div>
        </div>
      `);
      document.getElementById('create-bank-btn')?.addEventListener('click', () => {
        const bankName  = document.getElementById('new-bank-name').value.trim();
        const bankNo    = document.getElementById('new-bank-no').value.trim();
        const acctName  = document.getElementById('new-bank-acct-name').value.trim();
        if (!bankName || !bankNo || !acctName) { App.toast('กรุณากรอกข้อมูลที่จำเป็น', 'error'); return; }
        d.bankAccounts = d.bankAccounts || [];
        d.bankAccounts.push({
          id: 'BA-' + Date.now(),
          bankCode:   document.getElementById('new-bank-code').value,
          bankName,
          accountNumber: bankNo,
          accountName: acctName,
          branch: document.getElementById('new-bank-branch').value.trim() || '-',
          assignedSubPlatforms: [...document.querySelectorAll('.new-bank-sp-check:checked')].map(el => el.value),
          isDefault: false,
          status: 'Active',
        });
        App.toast('เพิ่มบัญชีธนาคารแล้ว', 'success');
        App.closeModal();
        self._rerender('bank-accounts');
      });
    });

    // ─── PromptPay: Toggle ───
    document.querySelectorAll('.pp-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = (d.promptPayConfig || []).find(p => p.id === btn.dataset.id);
        if (!entry) return;
        entry.status = entry.status === 'Active' ? 'Inactive' : 'Active';
        App.toast(`PromptPay ${entry.status === 'Active' ? 'เปิด' : 'ปิด'}ใช้งานแล้ว`, 'success');
        self._rerender('promptpay');
      });
    });

    // ─── PromptPay: Add Modal ───
    document.getElementById('btn-add-promptpay')?.addEventListener('click', () => {
      const spOpts = (d.subPlatforms || []).map(sp =>
        `<label class="flex items-center gap-8" style="cursor:pointer;">
          <input type="checkbox" class="new-pp-sp-check" value="${sp.code}">
          <span class="text-sm">${sp.name}</span>
         </label>`
      ).join('');
      window.App.showModal(`
        <div class="modal">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title"><i class="fa-solid fa-qrcode text-primary"></i> เพิ่ม PromptPay</div>
          <div class="form-group">
            <label class="form-label">ประเภท</label>
            <select class="form-input" id="new-pp-type">
              <option value="taxId">Tax ID (นิติบุคคล)</option>
              <option value="phone">เบอร์โทรศัพท์</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">หมายเลข <span style="color:var(--error)">*</span></label>
            <input class="form-input" id="new-pp-value" placeholder="เช่น 0105560012345 หรือ 0812345678">
          </div>
          <div class="form-group">
            <label class="form-label">หมายเหตุ / ชื่อบัญชี</label>
            <input class="form-input" id="new-pp-note" placeholder="เช่น RealFact Co., Ltd.">
          </div>
          <div class="form-group">
            <label class="form-label">Assign ให้ Sub-Platform</label>
            <div class="flex-col gap-8 p-12" style="background:var(--surface2);border-radius:8px;">
              ${spOpts}
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="create-pp-btn"><i class="fa-solid fa-plus"></i> เพิ่ม</button>
          </div>
        </div>
      `);
      document.getElementById('create-pp-btn')?.addEventListener('click', () => {
        const val = document.getElementById('new-pp-value').value.trim();
        if (!val) { App.toast('กรุณากรอกหมายเลข', 'error'); return; }
        const type = document.getElementById('new-pp-type').value;
        d.promptPayConfig = d.promptPayConfig || [];
        d.promptPayConfig.push({
          id: 'PP-' + Date.now(),
          type,
          value: val,
          label: type === 'taxId' ? 'Tax ID (นิติบุคคล)' : 'เบอร์โทรศัพท์',
          qrNote: document.getElementById('new-pp-note').value.trim() || '',
          assignedSubPlatforms: [...document.querySelectorAll('.new-pp-sp-check:checked')].map(el => el.value),
          status: 'Active',
        });
        App.toast('เพิ่ม PromptPay แล้ว', 'success');
        App.closeModal();
        self._rerender('promptpay');
      });
    });

    // ─── Payment Channels: Toggle ───
    document.querySelectorAll('.channel-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const sp = chk.dataset.sp;
        const ch = chk.dataset.ch;
        d.paymentChannels = d.paymentChannels || {};
        d.paymentChannels[sp] = d.paymentChannels[sp] || {};
        d.paymentChannels[sp][ch] = chk.checked;
        const label = { card2c2p: 'Card (2C2P)', bankTransfer: 'Bank Transfer', promptPay: 'PromptPay' }[ch] || ch;
        App.toast(`${label} สำหรับ ${sp} ${chk.checked ? 'เปิด' : 'ปิด'}ใช้งานแล้ว`, 'success');
        // Update border color without full re-render
        const card = chk.closest('.flex.items-center.gap-12.p-16');
        if (card) card.style.borderColor = chk.checked ? 'var(--success)' : 'var(--border)';
      });
    });

    // ─── Billing Terms: Save Platform Default ───
    document.getElementById('bt-save-default')?.addEventListener('click', () => {
      const cfg = d.billingTermsConfig.platformDefault;
      cfg.billingCycle = parseInt(document.getElementById('bt-default-cycle').value);
      cfg.paymentTerms = document.getElementById('bt-default-terms').value;
      cfg.autoGenerateInvoice = document.getElementById('bt-auto-invoice').checked;
      cfg.hardBlockAtZero = document.getElementById('bt-hard-block').checked;
      cfg.modifiedDate = new Date().toISOString().slice(0, 10);
      cfg.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
      App.toast('บันทึก Platform Default สำเร็จ', 'success');
      self._rerender('billing-terms');
    });

  },
};
