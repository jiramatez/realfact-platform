/* ================================================================
   Page Modules — Billing & Payments
   Split into 4 sub-pages:
     billing        — Overview, Invoices, Purchase Log
     billingVerify  — Payment Verification
     billingCredit  — Credit Lines & Refunds
     billingOverdue — Aging Report & Collection Notices
   ================================================================ */

window.Pages = window.Pages || {};

// ─── Shared CSV helper ───
function _billingCsvCell(val) {
  if (val == null) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"` : str;
}

// ══════════════════════════════════════════════════════════════
// 1. Overview & Invoices
// ══════════════════════════════════════════════════════════════
window.Pages.billing = {

  render() {
    const d           = window.MockData;
    const invoices    = d.invoices;
    const purchaseLog = d.purchaseLog;

    const pendingCount      = invoices.filter(i => i.status === 'Issued' || i.status === 'Pending').length;
    const overdueCount      = invoices.filter(i => i.status === 'Overdue').length;
    const verificationCount = invoices.filter(i => i.status === 'Pending Verification').length;
    const totalRevenue      = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);

    const subPlatforms = [...new Set(purchaseLog.map(p => p.subPlatform))];
    const logTypes     = [...new Set(purchaseLog.map(p => p.type))];
    const logStatuses  = [...new Set(purchaseLog.map(p => p.status))];

    return `
      <div class="page-header">
        <h1 class="heading">BILLING & PAYMENTS</h1>
      </div>

      ${verificationCount > 0 ? `
        <div class="alert-warning mb-12" style="cursor:pointer;" onclick="location.hash='billing-verify'">
          <i class="fa-solid fa-clipboard-check"></i>
          <span><strong>${verificationCount} รายการ</strong> รอตรวจสอบสลิปการชำระ — <u>คลิกเพื่อตรวจสอบ</u></span>
          <i class="fa-solid fa-arrow-right" style="margin-left:auto;"></i>
        </div>` : ''}
      ${overdueCount > 0 ? `
        <div class="alert-error mb-12" style="cursor:pointer;" onclick="location.hash='billing-overdue'">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span><strong>${overdueCount} รายการ</strong> ค้างชำระที่ต้องติดตาม — <u>คลิกเพื่อดูรายงาน</u></span>
          <i class="fa-solid fa-arrow-right" style="margin-left:auto;"></i>
        </div>` : ''}

      <!-- Stats -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">รายได้รายเดือน</span>
            <div class="stat-icon green"><i class="fa-solid fa-baht-sign"></i></div>
          </div>
          <div class="stat-value mono">${d.formatCurrency(totalRevenue)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> +8% จากเดือนก่อน</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ใบแจ้งหนี้รอชำระ</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-file-invoice"></i></div>
          </div>
          <div class="stat-value mono">${pendingCount}</div>
          <div class="stat-change down">รอดำเนินการ</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">ค้างชำระ</span>
            <div class="stat-icon red"><i class="fa-solid fa-triangle-exclamation"></i></div>
          </div>
          <div class="stat-value mono">${overdueCount}</div>
          <div class="stat-change down">ต้องติดตาม</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">รอตรวจสอบการชำระ</span>
            <div class="stat-icon orange"><i class="fa-solid fa-clipboard-check"></i></div>
          </div>
          <div class="stat-value mono">${verificationCount}</div>
          <div class="stat-change down">รอยืนยันสลิป</div>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar mb-20" id="billing-inv-tabs">
        <div class="tab-item active" data-tab="invoices"><i class="fa-solid fa-file-invoice"></i> ใบแจ้งหนี้</div>
        <div class="tab-item" data-tab="purchase-log"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติการซื้อ</div>
      </div>

      <!-- Invoices Table -->
      <div id="billing-tab-invoices">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เลขที่ใบแจ้งหนี้</th><th>TENANT</th><th>ประเภท</th><th>รายละเอียด</th>
                <th>จำนวนเงิน</th><th>VAT</th><th>รวมทั้งสิ้น</th><th>สถานะ</th><th>วันครบกำหนด</th><th>ช่องทาง</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr>
                  <td class="mono text-sm">${inv.id}</td>
                  <td class="font-600">${inv.tenantName}</td>
                  <td>${inv.type === 'Token Top-up' ? '<span class="chip chip-orange">Token Top-up</span>' : '<span class="chip chip-blue">Subscription</span>'}</td>
                  <td class="text-sm">${inv.description}</td>
                  <td class="mono">${d.formatCurrency(inv.amount)}</td>
                  <td class="mono text-sm">${d.formatCurrency(inv.vat)}</td>
                  <td class="mono font-600">${d.formatCurrency(inv.total)}</td>
                  <td>${d.statusChip(inv.status)}</td>
                  <td class="text-sm text-muted">${inv.dueDate}</td>
                  <td class="text-sm">${inv.method || '-'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Purchase Log -->
      <div id="billing-tab-purchase-log" class="hidden">
        <div class="flex items-center gap-12 mb-16" style="flex-wrap:wrap;">
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="pl-filter-platform" class="form-input">
              <option value="">Sub-Platform ทั้งหมด</option>
              ${subPlatforms.map(sp => `<option value="${sp}">${sp}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="pl-filter-type" class="form-input">
              <option value="">ประเภททั้งหมด</option>
              ${logTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="pl-filter-status" class="form-input">
              <option value="">สถานะทั้งหมด</option>
              ${logStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="flex gap-8 ml-auto">
            <button class="btn btn-outline btn-sm" id="pl-export-csv"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
            <button class="btn btn-outline btn-sm" id="pl-export-pdf"><i class="fa-solid fa-file-pdf"></i> Export PDF</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>วันที่</th><th>TENANT</th><th>SUB-PLATFORM</th><th>ประเภท</th>
                <th>รายละเอียด</th><th>ช่องทาง</th><th>จำนวนเงิน</th><th>สถานะ</th><th>อ้างอิง</th>
              </tr>
            </thead>
            <tbody id="pl-table-body">
              ${purchaseLog.map(p => `
                <tr data-platform="${p.subPlatform}" data-type="${p.type}" data-status="${p.status}">
                  <td class="text-sm text-muted">${p.date}</td>
                  <td class="font-600">${p.tenantName}</td>
                  <td class="text-sm">${p.subPlatform}</td>
                  <td>${p.type === 'Token Top-up' ? '<span class="chip chip-orange">Token Top-up</span>' : '<span class="chip chip-blue">Subscription</span>'}</td>
                  <td class="text-sm">${p.description}</td>
                  <td class="text-sm">${p.method}</td>
                  <td class="mono font-600">${d.formatCurrency(p.amount)}</td>
                  <td>${d.statusChip(p.status)}</td>
                  <td class="mono text-xs">${p.ref}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    const d = window.MockData;

    // Tab switching
    const tabs = document.querySelectorAll('#billing-inv-tabs .tab-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const t = tab.dataset.tab;
        document.getElementById('billing-tab-invoices').classList.toggle('hidden', t !== 'invoices');
        document.getElementById('billing-tab-purchase-log').classList.toggle('hidden', t !== 'purchase-log');
      });
    });

    // Purchase Log filters
    const plFP = document.getElementById('pl-filter-platform');
    const plFT = document.getElementById('pl-filter-type');
    const plFS = document.getElementById('pl-filter-status');
    function applyPLFilters() {
      const platform = plFP ? plFP.value : '';
      const type     = plFT ? plFT.value : '';
      const status   = plFS ? plFS.value : '';
      document.querySelectorAll('#pl-table-body tr').forEach(row => {
        row.style.display =
          (!platform || row.dataset.platform === platform) &&
          (!type     || row.dataset.type     === type)     &&
          (!status   || row.dataset.status   === status)   ? '' : 'none';
      });
    }
    if (plFP) plFP.addEventListener('change', applyPLFilters);
    if (plFT) plFT.addEventListener('change', applyPLFilters);
    if (plFS) plFS.addEventListener('change', applyPLFilters);

    // Export CSV
    document.getElementById('pl-export-csv')?.addEventListener('click', () => {
      const headers = ['วันที่','Tenant','Sub-Platform','ประเภท','รายละเอียด','ช่องทาง','จำนวนเงิน','สถานะ','อ้างอิง'];
      const csv = [headers, ...d.purchaseLog.map(p => [
        p.date, p.tenantName, p.subPlatform, p.type, p.description, p.method, p.amount, p.status, p.ref,
      ])].map(r => r.map(v => _billingCsvCell(v)).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `purchase_log_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    // Export PDF
    document.getElementById('pl-export-pdf')?.addEventListener('click', () => {
      const rows = d.purchaseLog.map(p =>
        `<tr><td>${p.date}</td><td>${p.tenantName}</td><td>${p.subPlatform}</td><td>${p.type}</td>
         <td>${p.description}</td><td>${p.method}</td>
         <td>${p.amount.toLocaleString('th-TH',{minimumFractionDigits:2})} THB</td>
         <td>${p.status}</td><td>${p.ref}</td></tr>`
      ).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Purchase Log</title>
        <style>body{font-family:sans-serif;font-size:12px;padding:20px;}
        table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px 8px;}
        th{background:#f5f5f5;}</style></head><body>
        <h2>Purchase Log — ${new Date().toLocaleDateString('th-TH')}</h2>
        <table><thead><tr><th>วันที่</th><th>Tenant</th><th>Sub-Platform</th><th>ประเภท</th>
        <th>รายละเอียด</th><th>ช่องทาง</th><th>จำนวนเงิน</th><th>สถานะ</th><th>อ้างอิง</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.onload=function(){window.print();}<\/script></body></html>`;
      const w = window.open('','_blank'); w.document.write(html); w.document.close();
    });
  },
};

// ══════════════════════════════════════════════════════════════
// 2. Payment Verification
// ══════════════════════════════════════════════════════════════
window.Pages.billingVerify = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.billingVerify.render();
    window.Pages.billingVerify.init();
    if (window.App && window.App.updateBillingBadges) window.App.updateBillingBadges();
  },

  render() {
    const d       = window.MockData;
    const pending = d.invoices.filter(i => i.status === 'Pending Verification');

    return `
      <div class="page-header">
        <h1 class="heading">ตรวจสอบการชำระเงิน</h1>
        <div class="text-sm text-muted mt-2">ตรวจสอบสลิปและอนุมัติการชำระจาก Tenant</div>
      </div>

      ${pending.length > 0 ? `
        <div class="alert-warning mb-20">
          <i class="fa-solid fa-clock"></i>
          <span><strong>${pending.length} รายการ</strong> รอการตรวจสอบสลิปโอนเงิน</span>
        </div>` : ''}

      ${pending.length === 0
        ? `<div class="empty-state">
            <i class="fa-solid fa-circle-check"></i>
            <p>ไม่มีรายการรอตรวจสอบ</p>
           </div>`
        : `<div class="grid-2 gap-16">
            ${pending.map(inv => `
              <div class="card-accent p-20">
                <div class="flex justify-between items-center mb-12">
                  <div class="mono font-600 text-sm">${inv.id}</div>
                  ${d.statusChip(inv.status)}
                </div>
                <div class="flex-col gap-8 mb-16">
                  <div class="flex justify-between">
                    <span class="text-sm text-muted uppercase">Tenant</span>
                    <span class="font-600">${inv.tenantName}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted uppercase">จำนวนเงิน</span>
                    <span class="mono font-700" style="font-size:18px;color:var(--primary);">${d.formatCurrency(inv.total)}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted uppercase">ช่องทาง</span>
                    <span class="text-sm">${inv.method || 'Bank Transfer'}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-muted uppercase">วันครบกำหนด</span>
                    <span class="text-sm mono">${inv.dueDate}</span>
                  </div>
                </div>
                <div class="card p-16 mb-16" style="border-style:dashed;">
                  <div class="flex-col items-center gap-8">
                    <i class="fa-solid fa-receipt text-muted" style="font-size:24px;"></i>
                    <div class="text-sm text-muted">สลิปการโอนเงิน</div>
                    <div class="text-xs text-muted">อัปโหลดโดย Tenant</div>
                    <span class="chip chip-yellow">รอตรวจสอบ</span>
                  </div>
                </div>
                <div class="flex gap-10 justify-end">
                  <button class="btn btn-danger btn-sm verify-reject-btn" data-id="${inv.id}">
                    <i class="fa-solid fa-xmark"></i> ปฏิเสธ
                  </button>
                  <button class="btn btn-success btn-sm verify-approve-btn" data-id="${inv.id}">
                    <i class="fa-solid fa-check"></i> อนุมัติ
                  </button>
                </div>
              </div>`).join('')}
          </div>`}
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.billingVerify;

    document.querySelectorAll('.verify-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = d.invoices.find(i => i.id === btn.dataset.id);
        if (inv) { inv.status = 'Paid'; inv.paidDate = new Date().toISOString().slice(0,10); }
        App.toast('อนุมัติการชำระเงินสำเร็จ', 'success');
        self._rerender();
      });
    });

    document.querySelectorAll('.verify-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = d.invoices.find(i => i.id === btn.dataset.id);
        if (!inv) return;
        App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">ปฏิเสธการชำระเงิน</div>
            <div class="text-sm text-muted mb-16">ใบแจ้งหนี้: <strong>${inv.id}</strong> — ${inv.tenantName}</div>
            <div class="form-group">
              <label class="form-label">เหตุผลในการปฏิเสธ <span style="color:var(--error)">*</span></label>
              <textarea id="reject-reason" class="form-input" rows="3" placeholder="ระบุเหตุผล..."></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-danger" id="reject-confirm-btn"><i class="fa-solid fa-xmark"></i> ยืนยันปฏิเสธ</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('reject-confirm-btn')?.addEventListener('click', () => {
            const reason = document.getElementById('reject-reason').value.trim();
            if (!reason) { App.toast('กรุณาระบุเหตุผล','error'); return; }
            inv.status = 'Issued'; inv.rejectReason = reason;
            App.closeModal();
            App.toast('ปฏิเสธการชำระเงินแล้ว','error');
            self._rerender();
          });
        }, 50);
      });
    });
  },
};

// ══════════════════════════════════════════════════════════════
// 3. Credit Lines & Refunds
// ══════════════════════════════════════════════════════════════
window.Pages.billingCredit = {

  _rerender(tab) {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.billingCredit.render();
    window.Pages.billingCredit.init(tab);
    if (window.App && window.App.updateBillingBadges) window.App.updateBillingBadges();
  },

  render() {
    const d                  = window.MockData;
    const creditLines        = d.creditLines        || [];
    const creditLineRequests = d.creditLineRequests || [];
    const refundRequests     = d.refundRequests     || [];
    const pendingRefunds     = refundRequests.filter(r => r.status !== 'Approved').length;

    return `
      <div class="page-header">
        <h1 class="heading">CREDIT & REFUNDS</h1>
      </div>

      ${creditLineRequests.length > 0 ? `
        <div class="alert-warning mb-12">
          <i class="fa-solid fa-bell"></i>
          <span><strong>${creditLineRequests.length}</strong> คำขอวงเงินเครดิตรอการอนุมัติ</span>
        </div>` : ''}
      ${pendingRefunds > 0 ? `
        <div class="alert-warning mb-12">
          <i class="fa-solid fa-rotate-left"></i>
          <span><strong>${pendingRefunds}</strong> คำขอคืนเงินรอ Dual Approval</span>
        </div>` : ''}

      <!-- Sub-tabs -->
      <div class="tab-bar mb-20" id="credit-tabs">
        <div class="tab-item active" data-tab="credit">
          <i class="fa-solid fa-credit-card"></i> วงเงินเครดิต
          ${creditLineRequests.length > 0 ? `<span class="nav-badge" style="margin-left:6px;position:relative;">${creditLineRequests.length}</span>` : ''}
        </div>
        <div class="tab-item" data-tab="refunds">
          <i class="fa-solid fa-rotate-left"></i> คืนเงิน
          ${pendingRefunds > 0 ? `<span class="nav-badge" style="margin-left:6px;position:relative;">${pendingRefunds}</span>` : ''}
        </div>
      </div>

      <!-- Credit Lines -->
      <div id="credit-tab-credit">
        ${creditLineRequests.length > 0 ? `
          <div class="card p-20 mb-20" style="border-left:3px solid var(--warning);">
            <div class="text-sm uppercase text-muted font-600 mb-12">
              <i class="fa-solid fa-bell text-warning"></i> คำขอวงเงินเครดิตใหม่ (${creditLineRequests.length} รายการ)
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>TENANT</th><th>วงเงินที่ขอ</th><th>เอกสาร</th><th>วันที่ขอ</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr></thead>
                <tbody>
                  ${creditLineRequests.map(req => `
                    <tr>
                      <td class="mono text-sm">${req.id}</td>
                      <td><a href="#" class="font-600 text-primary tenant-peek-link" data-id="${req.tenantId}">${req.tenantName}</a></td>
                      <td class="mono font-600">${d.formatCurrency(req.requestedLimit)}</td>
                      <td class="text-sm">${req.documents} ไฟล์</td>
                      <td class="text-sm text-muted">${req.requestDate}</td>
                      <td>${d.statusChip(req.status)}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${req.modifiedDate || '-'}</div>${req.modifiedBy ? `<div class="text-xs text-dim">${req.modifiedBy.split('@')[0]}</div>` : ''}</td>
                      <td>
                        <button class="btn btn-success btn-sm cl-approve-req-btn" data-id="${req.id}"><i class="fa-solid fa-check"></i> อนุมัติ</button>
                        <button class="btn btn-danger btn-sm cl-reject-req-btn ml-4" data-id="${req.id}"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}

        <div class="text-sm uppercase text-muted font-600 mb-12">วงเงินเครดิตที่อนุมัติแล้ว</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>TENANT</th><th>วงเงินสูงสุด</th><th>ใช้ไปแล้ว</th><th>คงเหลือ</th><th>การใช้งาน</th><th>รอบบิล</th><th>สถานะ</th><th>แก้ไขล่าสุด</th></tr></thead>
            <tbody>
              ${creditLines.length === 0
                ? '<tr><td colspan="10" class="text-center text-muted p-20">ยังไม่มีวงเงินเครดิตที่อนุมัติ</td></tr>'
                : creditLines.map(cl => {
                    const usedPct  = Math.min(100, Math.round(cl.usedAmount / cl.creditLimit * 100));
                    const barColor = usedPct > 80 ? 'var(--error)' : usedPct > 50 ? 'var(--warning)' : 'var(--success)';
                    return `<tr>
                      <td class="mono text-sm">${cl.id}</td>
                      <td><a href="#" class="font-600 text-primary tenant-peek-link" data-id="${cl.tenantId}">${cl.tenantName}</a></td>
                      <td class="mono">${d.formatCurrency(cl.creditLimit)}</td>
                      <td class="mono text-warning">${d.formatCurrency(cl.usedAmount)}</td>
                      <td class="mono text-success">${d.formatCurrency(cl.availableCredit)}</td>
                      <td style="min-width:120px;">
                        <div class="progress-bar" style="margin-bottom:4px;">
                          <div class="progress-fill" style="width:${usedPct}%;background:${barColor};"></div>
                        </div>
                        <span class="text-xs text-muted">${usedPct}% ใช้ไป</span>
                      </td>
                      <td class="text-sm">${cl.billingCycle} วัน</td>
                      <td>${d.statusChip(cl.status)}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${cl.modifiedDate || '-'}</div>${cl.modifiedBy ? `<div class="text-xs text-dim">${cl.modifiedBy.split('@')[0]}</div>` : ''}</td>
                    </tr>`;
                  }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Refunds -->
      <div id="credit-tab-refunds" class="hidden">
        ${refundRequests.length === 0
          ? '<div class="empty-state"><i class="fa-solid fa-circle-check"></i><p>ไม่มีคำขอคืนเงิน</p></div>'
          : `<div class="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>TENANT</th><th>ใบแจ้งหนี้</th><th>จำนวนเงิน</th><th>เหตุผล</th><th>สถานะ</th><th>Dual Approval</th><th>วันที่ขอ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr></thead>
                <tbody>
                  ${refundRequests.map(r => `
                    <tr>
                      <td class="mono text-sm">${r.id}</td>
                      <td class="font-600">${r.tenantName}</td>
                      <td class="mono text-sm">${r.invoiceId}</td>
                      <td class="mono font-600">${d.formatCurrency(r.amount)}</td>
                      <td class="text-sm">${r.reason}</td>
                      <td>${d.statusChip(r.status)}</td>
                      <td>
                        <div class="flex gap-6 items-center">
                          <span class="chip ${r.superAdminApproved ? 'chip-green' : 'chip-gray'}" title="Super Admin">
                            <i class="fa-solid fa-shield-halved"></i> ${r.superAdminApproved ? '✓' : '✗'}
                          </span>
                          <span class="chip ${r.financeApproved ? 'chip-green' : 'chip-gray'}" title="Finance">
                            <i class="fa-solid fa-coins"></i> ${r.financeApproved ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td class="text-sm text-muted">${r.requestDate}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${r.modifiedDate || '-'}</div>${r.modifiedBy ? `<div class="text-xs text-dim">${r.modifiedBy.split('@')[0]}</div>` : ''}</td>
                      <td>
                        ${!r.superAdminApproved || !r.financeApproved
                          ? `<button class="btn btn-success btn-sm refund-approve-btn" data-id="${r.id}"><i class="fa-solid fa-check"></i> อนุมัติ</button>`
                          : '<span class="chip chip-green">สมบูรณ์</span>'}
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
      </div>
    `;
  },

  init(activeTab) {
    const d    = window.MockData;
    const self = window.Pages.billingCredit;

    // Sub-tab switching
    const tabs = document.querySelectorAll('#credit-tabs .tab-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const t = tab.dataset.tab;
        document.getElementById('credit-tab-credit').classList.toggle('hidden',  t !== 'credit');
        document.getElementById('credit-tab-refunds').classList.toggle('hidden', t !== 'refunds');
      });
    });
    if (activeTab === 'refunds') {
      document.querySelector('#credit-tabs .tab-item[data-tab="refunds"]')?.click();
    }

    // Tenant name → open Tenant detail modal
    document.querySelectorAll('.tenant-peek-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        window.Pages.tenants?._showModal(a.dataset.id);
      });
    });

    // Credit Line: Approve
    document.querySelectorAll('.cl-approve-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = (d.creditLineRequests || []).find(r => r.id === btn.dataset.id);
        if (!req) return;
        App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">อนุมัติวงเงินเครดิต</div>
            <div class="text-sm text-muted mb-16">Tenant: <strong>${req.tenantName}</strong> (ขอ ${req.requestedLimit.toLocaleString('th-TH')} THB)</div>
            <div class="form-group">
              <label class="form-label">วงเงินที่อนุมัติ (THB)</label>
              <input type="number" id="cl-limit" class="form-input" value="${req.requestedLimit}" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">รอบบิล (วัน)</label>
              <select id="cl-cycle" class="form-input">
                <option value="30">30 วัน</option><option value="60">60 วัน</option><option value="90">90 วัน</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">เงื่อนไขการชำระ</label>
              <select id="cl-terms" class="form-input">
                <option value="Net 30">Net 30</option><option value="Net 60">Net 60</option><option value="Net 15">Net 15</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-success" id="cl-approve-confirm"><i class="fa-solid fa-check"></i> อนุมัติวงเงิน</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('cl-approve-confirm')?.addEventListener('click', () => {
            const limit = parseFloat(document.getElementById('cl-limit').value);
            const cycle = parseInt(document.getElementById('cl-cycle').value);
            const terms = document.getElementById('cl-terms').value;
            if (!limit || limit <= 0) { App.toast('กรุณากรอกวงเงิน','error'); return; }
            d.creditLines = d.creditLines || [];
            d.creditLines.push({
              id: 'CL-' + Date.now(), tenantId: req.tenantId, tenantName: req.tenantName,
              creditLimit: limit, usedAmount: 0, availableCredit: limit,
              billingCycle: cycle, paymentTerms: terms, status: 'Active',
              approvedDate: new Date().toISOString().slice(0,10), approvedBy: 'Finance Admin', lastInvoice: null,
            });
            d.creditLineRequests = (d.creditLineRequests || []).filter(r => r.id !== req.id);
            App.closeModal();
            App.toast('อนุมัติวงเงินเครดิตสำเร็จ','success');
            self._rerender('credit');
          });
        }, 50);
      });
    });

    // Credit Line: Reject
    document.querySelectorAll('.cl-reject-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = (d.creditLineRequests || []).find(r => r.id === btn.dataset.id);
        if (!req) return;
        App.confirm(`ยืนยันการปฏิเสธคำขอวงเงินของ ${req.tenantName}?`, {
          title: 'ปฏิเสธคำขอวงเงิน', confirmText: 'ปฏิเสธ', cancelText: 'ยกเลิก', type: 'danger',
        }).then(ok => {
          if (!ok) return;
          d.creditLineRequests = (d.creditLineRequests || []).filter(r => r.id !== req.id);
          App.toast('ปฏิเสธคำขอวงเงินแล้ว','error');
          self._rerender('credit');
        });
      });
    });

    // Refund: Approve
    document.querySelectorAll('.refund-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = (d.refundRequests || []).find(r => r.id === btn.dataset.id);
        if (!ref) return;
        App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">อนุมัติคำขอคืนเงิน</div>
            <div class="text-sm text-muted mb-4">Tenant: <strong>${ref.tenantName}</strong></div>
            <div class="text-sm text-muted mb-16">จำนวนเงิน: <strong>${d.formatCurrency(ref.amount)}</strong> | เหตุผล: ${ref.reason}</div>
            <div class="card p-16 mb-16">
              <div class="text-sm font-600 mb-10">สถานะ Dual Approval</div>
              <div class="flex gap-12">
                <span class="chip ${ref.superAdminApproved ? 'chip-green' : 'chip-gray'}"><i class="fa-solid fa-shield-halved"></i> Super Admin ${ref.superAdminApproved ? '✓' : '✗'}</span>
                <span class="chip ${ref.financeApproved ? 'chip-green' : 'chip-gray'}"><i class="fa-solid fa-coins"></i> Finance ${ref.financeApproved ? '✓' : '✗'}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">อนุมัติในฐานะ</label>
              <select id="refund-role" class="form-input">
                ${!ref.superAdminApproved ? '<option value="superAdmin">Super Admin</option>' : ''}
                ${!ref.financeApproved    ? '<option value="finance">Finance</option>'         : ''}
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-success" id="refund-confirm-btn"><i class="fa-solid fa-check"></i> อนุมัติ</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('refund-confirm-btn')?.addEventListener('click', () => {
            const role   = document.getElementById('refund-role').value;
            const refund = (d.refundRequests || []).find(r => r.id === ref.id);
            if (refund) {
              if (role === 'superAdmin') refund.superAdminApproved = true;
              if (role === 'finance')    refund.financeApproved    = true;
              if (refund.superAdminApproved && refund.financeApproved) refund.status = 'Approved';
            }
            App.closeModal();
            App.toast('อนุมัติคืนเงินสำเร็จ','success');
            self._rerender('refunds');
          });
        }, 50);
      });
    });
  },
};

// ══════════════════════════════════════════════════════════════
// 4. Aging & Overdue
// ══════════════════════════════════════════════════════════════
window.Pages.billingOverdue = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.billingOverdue.render();
    window.Pages.billingOverdue.init();
    if (window.App && window.App.updateBillingBadges) window.App.updateBillingBadges();
  },

  render() {
    const d                 = window.MockData;
    const agingReport       = d.agingReport       || [];
    const collectionNotices = d.collectionNotices || [];

    return `
      <div class="page-header">
        <h1 class="heading">รายงานค้างชำระ</h1>
        <div class="text-sm text-muted mt-2">ติดตามและส่งใบทวงหนี้</div>
      </div>

      ${agingReport.length > 0 ? `
        <div class="alert-error mb-20">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span><strong>${agingReport.length} Tenant</strong> มียอดค้างชำระที่ต้องติดตาม</span>
        </div>` : ''}

      ${agingReport.length === 0
        ? '<div class="empty-state"><i class="fa-solid fa-circle-check"></i><p>ไม่มีรายการค้างชำระ</p></div>'
        : `
          <div class="section-title mb-12"><i class="fa-solid fa-calendar-xmark"></i> รายงานค้างชำระ</div>
          <div class="table-wrap mb-20">
            <table>
              <thead>
                <tr><th>TENANT</th><th>ยอดค้างชำระ</th><th>จำนวนวัน</th><th>จำนวนใบแจ้งหนี้</th><th>แจ้งเตือนล่าสุด</th><th>สถานะเครดิต</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr>
              </thead>
              <tbody>
                ${agingReport.map(row => {
                  const notice = collectionNotices.find(n => n.tenantId === row.tenantId);
                  let cooldownDays = 0, inCooldown = false;
                  if (notice && notice.cooldownUntil) {
                    const diff = Math.ceil((new Date(notice.cooldownUntil) - new Date('2026-03-03')) / 86400000);
                    if (diff > 0) { inCooldown = true; cooldownDays = diff; }
                  }
                  return `<tr>
                    <td class="font-600">${row.tenantName}</td>
                    <td class="mono font-600 text-error">${d.formatCurrency(row.totalOverdue)}</td>
                    <td><span class="chip ${row.daysOverdue > 30 ? 'chip-red' : row.daysOverdue > 14 ? 'chip-orange' : 'chip-yellow'}">${row.daysOverdue} วัน</span></td>
                    <td class="mono text-center">${row.invoiceCount}</td>
                    <td class="text-sm text-muted">${row.lastNotice || '-'}</td>
                    <td>${d.statusChip(row.creditStatus)}</td>
                    <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${row.modifiedDate || '-'}</div>${row.modifiedBy ? `<div class="text-xs text-dim">${row.modifiedBy.split('@')[0]}</div>` : ''}</td>
                    <td>
                      ${inCooldown
                        ? `<button class="btn btn-outline btn-sm" disabled title="Cooldown อีก ${cooldownDays} วัน"><i class="fa-solid fa-clock"></i> อีก ${cooldownDays} วัน</button>`
                        : `<button class="btn btn-primary btn-sm send-notice-btn" data-id="${row.tenantId}"><i class="fa-solid fa-envelope"></i> ส่งใบทวงหนี้</button>`}
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="divider mb-16"></div>
          <div class="section-title mb-12"><i class="fa-solid fa-envelope"></i> ประวัติใบทวงหนี้</div>
          ${collectionNotices.length === 0
            ? '<div class="text-sm text-muted">ยังไม่มีประวัติใบทวงหนี้</div>'
            : `<div class="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>TENANT</th><th>ใบแจ้งหนี้</th><th>จำนวน</th><th>วันที่ส่ง</th><th>ช่องทาง</th><th>Cooldown</th><th>สถานะ</th></tr></thead>
                  <tbody>
                    ${collectionNotices.map(cn => {
                      let cooldownLabel = '-';
                      if (cn.cooldownUntil) {
                        const diff = Math.ceil((new Date(cn.cooldownUntil) - new Date('2026-03-03')) / 86400000);
                        cooldownLabel = diff > 0
                          ? `<span class="chip chip-yellow">อีก ${diff} วัน</span>`
                          : '<span class="chip chip-green">พร้อมส่ง</span>';
                      }
                      return `<tr>
                        <td class="mono text-sm">${cn.id}</td>
                        <td class="font-600">${cn.tenantName}</td>
                        <td class="mono text-sm">${cn.invoiceId || '-'}</td>
                        <td class="mono font-600">${d.formatCurrency(cn.amount)}</td>
                        <td class="text-sm text-muted">${cn.sentDate}</td>
                        <td class="text-sm">${cn.channel}</td>
                        <td>${cooldownLabel}</td>
                        <td>${d.statusChip(cn.status)}</td>
                      </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>`}
        `}
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.billingOverdue;

    document.querySelectorAll('.send-notice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tenantId = btn.dataset.id;
        const row      = (d.agingReport || []).find(r => r.tenantId === tenantId);
        if (!row) return;
        App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">ส่งใบทวงหนี้</div>
            <div class="text-sm text-muted mb-16">
              Tenant: <strong>${row.tenantName}</strong><br>
              ยอดค้างชำระ: <strong class="text-error">${d.formatCurrency(row.totalOverdue)}</strong> (ค้างมา ${row.daysOverdue} วัน)
            </div>
            <div class="card p-16 mb-16">
              <div class="text-sm text-muted">หลังส่งใบทวงหนี้จะมี Cooldown 7 วัน ก่อนส่งได้อีกครั้ง</div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="notice-confirm-btn"><i class="fa-solid fa-envelope"></i> ยืนยันส่งใบทวงหนี้</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('notice-confirm-btn')?.addEventListener('click', () => {
            const today       = new Date('2026-03-03');
            const cooldownDate = new Date(today);
            cooldownDate.setDate(cooldownDate.getDate() + 7);
            const cooldownStr = cooldownDate.toISOString().slice(0,10);
            d.collectionNotices = d.collectionNotices || [];
            const existing = d.collectionNotices.find(n => n.tenantId === tenantId);
            const todayStr = today.toISOString().slice(0,10);
            if (existing) {
              existing.sentDate = todayStr;
              existing.cooldownUntil = cooldownStr;
              existing.status = 'Sent';
              existing.modifiedDate = todayStr;
              existing.modifiedBy = 'admin@realfact.ai';
            } else {
              d.collectionNotices.push({
                id: 'CN-' + Date.now(), tenantId, tenantName: row.tenantName,
                sentDate: todayStr, channel: 'Email + Telegram',
                cooldownUntil: cooldownStr, status: 'Sent',
                modifiedDate: todayStr, modifiedBy: 'admin@realfact.ai',
              });
            }
            row.lastNotice = todayStr;
            row.modifiedDate = todayStr;
            row.modifiedBy = 'admin@realfact.ai';
            App.closeModal();
            App.toast(`ส่งใบทวงหนี้ให้ ${row.tenantName} สำเร็จ`, 'success');
            self._rerender();
          });
        }, 50);
      });
    });
  },
};
