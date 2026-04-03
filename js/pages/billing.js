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
    const scopedTid   = window.Auth ? Auth.scopedTenantId() : null;
    const invoices    = scopedTid ? d.invoices.filter(i => i.tenantId === scopedTid) : d.invoices;
    const purchaseLog = scopedTid ? d.purchaseLog.filter(p => {
      const tenant = (d.tenants || []).find(t => t.id === scopedTid);
      return tenant && p.tenantName === tenant.name;
    }) : d.purchaseLog;

    const pendingCount      = invoices.filter(i => i.status === 'Issued' || i.status === 'Pending').length;
    const overdueCount      = invoices.filter(i => i.status === 'Overdue').length;
    const verificationCount = invoices.filter(i => i.status === 'Pending Verification').length;
    const totalRevenue      = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);

    const invSubPlatforms = [...new Set(invoices.map(i => i.subPlatform).filter(Boolean))];
    const subPlatforms    = [...new Set(purchaseLog.map(p => p.subPlatform))];
    const logTypes        = [...new Set(purchaseLog.map(p => p.type))];
    const logStatuses     = [...new Set(purchaseLog.map(p => p.status))];

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
        <div class="flex items-center gap-12 mb-16" style="flex-wrap:wrap;">
          <div class="search-bar" style="min-width:200px;flex:1;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="inv-search" class="form-input" placeholder="ค้นหา Invoice ID หรือ Tenant...">
          </div>
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="inv-filter-platform" class="form-input">
              <option value="">Sub-Platform ทั้งหมด</option>
              ${invSubPlatforms.map(sp => `<option value="${sp}">${sp}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:150px;">
            <select id="inv-filter-type" class="form-input">
              <option value="">ประเภททั้งหมด</option>
              <option value="Subscription">Subscription</option>
              <option value="Token Top-up">Token Top-up</option>
              <option value="Credit Line">Credit Line</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:190px;">
            <select id="inv-filter-status" class="form-input">
              <option value="">สถานะทั้งหมด</option>
              <option value="Paid">ชำระแล้ว</option>
              <option value="Issued">ออกแล้ว</option>
              <option value="Pending Verification">รอตรวจสอบ</option>
              <option value="Overdue">เกินกำหนด</option>
            </select>
          </div>
          <div class="date-range-group">
            <input type="date" id="inv-date-from" class="form-input" title="ตั้งแต่วันที่">
            <span class="date-sep">ถึง</span>
            <input type="date" id="inv-date-to" class="form-input" title="ถึงวันที่">
          </div>
          <div class="flex gap-8">
            <button class="btn btn-outline btn-sm" id="inv-export-csv"><i class="fa-solid fa-file-csv"></i> Export CSV</button>
            <button class="btn btn-outline btn-sm" id="inv-export-pdf"><i class="fa-solid fa-file-pdf"></i> Export PDF</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เลขที่ใบแจ้งหนี้</th><th>TENANT</th><th>ประเภท</th><th>รายละเอียด</th>
                <th>จำนวนเงิน</th><th>VAT</th><th>รวมทั้งสิ้น</th><th>สถานะ</th><th>วันครบกำหนด</th><th>ช่องทาง</th><th>รอบที่ชำระ</th><th>จัดการ</th>
              </tr>
            </thead>
            <tbody id="inv-table-body">
              ${invoices.map(inv => {
                const typeChip = inv.type === 'Token Top-up'
                  ? '<span class="chip chip-orange">Token Top-up</span>'
                  : inv.type === 'Credit Line'
                    ? '<span class="chip chip-purple">Credit Line</span>'
                    : '<span class="chip chip-blue">Subscription</span>';
                const cycles = d.billingCyclesPaid(inv.tenantId);
                return `
                <tr data-platform="${inv.subPlatform || ''}" data-type="${inv.type}" data-status="${inv.status}" data-date="${inv.issuedDate}" data-search="${inv.id.toLowerCase()} ${inv.tenantName.toLowerCase()}"${inv.status === 'Overdue' ? ' style="background:rgba(239,68,68,0.08);border-left:3px solid var(--error);"' : ''}>
                  <td class="mono text-sm">${inv.id}</td>
                  <td class="font-600">${inv.tenantName}<br><span class="text-xs text-muted">${inv.subPlatform || '-'}</span></td>
                  <td>${typeChip}</td>
                  <td class="text-sm">${inv.description}</td>
                  <td class="mono">${d.formatCurrency(inv.amount)}</td>
                  <td class="mono text-sm">${d.formatCurrency(inv.vat)}</td>
                  <td class="mono font-600">${d.formatCurrency(inv.total)}</td>
                  <td>${d.statusChip(inv.status)}</td>
                  <td class="text-sm text-muted">${inv.dueDate}</td>
                  <td class="text-sm">${inv.method || '-'}</td>
                  <td class="mono text-center">${cycles > 0 ? '<span class="chip chip-green">' + cycles + ' รอบ</span>' : '<span class="text-muted">—</span>'}</td>
                  <td>
                    <button class="btn btn-outline btn-sm inv-detail-btn" data-id="${inv.id}" title="ดูรายละเอียด">
                      <i class="fa-solid fa-file-lines"></i> ดู
                    </button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination" id="inv-pagination">
          <div class="pagination-info" id="inv-page-info"></div>
          <div class="pagination-controls" id="inv-page-controls"></div>
          <div class="pagination-size">
            <span>แสดง</span>
            <select id="inv-page-size"><option value="10">10</option><option value="25" selected>25</option><option value="50">50</option><option value="100">100</option></select>
            <span>รายการ/หน้า</span>
          </div>
        </div>
      </div>

      <!-- Purchase Log -->
      <div id="billing-tab-purchase-log" class="hidden">
        <div class="flex items-center gap-12 mb-16" style="flex-wrap:wrap;">
          <div class="search-bar" style="min-width:200px;flex:1;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="pl-search" class="form-input" placeholder="ค้นหา Tenant หรือ Ref...">
          </div>
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="pl-filter-platform" class="form-input">
              <option value="">Sub-Platform ทั้งหมด</option>
              ${subPlatforms.map(sp => `<option value="${sp}">${sp}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:150px;">
            <select id="pl-filter-type" class="form-input">
              <option value="">ประเภททั้งหมด</option>
              ${logTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;min-width:160px;">
            <select id="pl-filter-status" class="form-input">
              <option value="">สถานะทั้งหมด</option>
              ${logStatuses.map(s => `<option value="${s}">${d.thaiStatus(s)}</option>`).join('')}
            </select>
          </div>
          <div class="date-range-group">
            <input type="date" id="pl-date-from" class="form-input" title="ตั้งแต่วันที่">
            <span class="date-sep">ถึง</span>
            <input type="date" id="pl-date-to" class="form-input" title="ถึงวันที่">
          </div>
          <div class="flex gap-8">
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
                <tr data-platform="${p.subPlatform}" data-type="${p.type}" data-status="${p.status}" data-date="${p.date}" data-search="${p.tenantName.toLowerCase()} ${p.ref.toLowerCase()}">
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
        <div class="pagination" id="pl-pagination">
          <div class="pagination-info" id="pl-page-info"></div>
          <div class="pagination-controls" id="pl-page-controls"></div>
          <div class="pagination-size">
            <span>แสดง</span>
            <select id="pl-page-size"><option value="10">10</option><option value="25" selected>25</option><option value="50">50</option><option value="100">100</option></select>
            <span>รายการ/หน้า</span>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const d = window.MockData;
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;
    const _scopedPL = scopedTid ? d.purchaseLog.filter(p => {
      const tenant = (d.tenants || []).find(t => t.id === scopedTid);
      return tenant && p.tenantName === tenant.name;
    }) : d.purchaseLog;

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

    // ─── Shared pagination renderer ───
    function renderPagination(containerId, infoId, currentPage, totalPages, totalFiltered, pageSize, onPageChange) {
      var infoEl = document.getElementById(infoId);
      var ctrlEl = document.getElementById(containerId);
      if (!ctrlEl) return;
      var start = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
      var end = Math.min(currentPage * pageSize, totalFiltered);
      if (infoEl) infoEl.textContent = totalFiltered === 0 ? 'ไม่พบรายการ' : 'แสดง ' + start + '–' + end + ' จาก ' + totalFiltered + ' รายการ';
      if (totalPages <= 1) { ctrlEl.innerHTML = ''; return; }
      var btns = '';
      btns += '<button ' + (currentPage <= 1 ? 'disabled' : '') + ' data-p="' + (currentPage - 1) + '"><i class="fa-solid fa-chevron-left" style="font-size:10px;"></i></button>';
      var startP = Math.max(1, currentPage - 2);
      var endP = Math.min(totalPages, startP + 4);
      if (endP - startP < 4) startP = Math.max(1, endP - 4);
      for (var i = startP; i <= endP; i++) {
        btns += '<button ' + (i === currentPage ? 'class="active"' : '') + ' data-p="' + i + '">' + i + '</button>';
      }
      btns += '<button ' + (currentPage >= totalPages ? 'disabled' : '') + ' data-p="' + (currentPage + 1) + '"><i class="fa-solid fa-chevron-right" style="font-size:10px;"></i></button>';
      ctrlEl.innerHTML = btns;
      ctrlEl.querySelectorAll('button[data-p]').forEach(function(b) {
        b.addEventListener('click', function() { if (!b.disabled) onPageChange(parseInt(b.dataset.p)); });
      });
    }

    // ─── Invoice filters + pagination ───
    var invPage = 1;
    var invSearch = document.getElementById('inv-search');
    var invFP    = document.getElementById('inv-filter-platform');
    var invFT    = document.getElementById('inv-filter-type');
    var invFS    = document.getElementById('inv-filter-status');
    var invDF    = document.getElementById('inv-date-from');
    var invDT    = document.getElementById('inv-date-to');
    var invPS    = document.getElementById('inv-page-size');

    function applyInvFilters(resetPage) {
      if (resetPage) invPage = 1;
      var query    = (invSearch?.value || '').toLowerCase();
      var platform = invFP?.value || '';
      var type     = invFT?.value || '';
      var status   = invFS?.value || '';
      var dateFrom = invDF?.value || '';
      var dateTo   = invDT?.value || '';
      var pageSize = parseInt(invPS?.value || '25');
      var allRows = document.querySelectorAll('#inv-table-body tr');
      var matched = [];
      allRows.forEach(function(row) {
        var rowDate = row.dataset.date || '';
        var match =
          (!query    || (row.dataset.search || '').includes(query)) &&
          (!platform || row.dataset.platform === platform)          &&
          (!type     || row.dataset.type     === type)              &&
          (!status   || row.dataset.status   === status)            &&
          (!dateFrom || rowDate >= dateFrom)                         &&
          (!dateTo   || rowDate <= dateTo);
        if (match) matched.push(row); else row.style.display = 'none';
      });
      var totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
      if (invPage > totalPages) invPage = totalPages;
      var start = (invPage - 1) * pageSize;
      var end = start + pageSize;
      matched.forEach(function(row, idx) {
        row.style.display = (idx >= start && idx < end) ? '' : 'none';
      });
      renderPagination('inv-page-controls', 'inv-page-info', invPage, totalPages, matched.length, pageSize, function(p) { invPage = p; applyInvFilters(false); });
    }
    invSearch?.addEventListener('input',  function() { applyInvFilters(true); });
    invFP?.addEventListener('change', function() { applyInvFilters(true); });
    invFT?.addEventListener('change', function() { applyInvFilters(true); });
    invFS?.addEventListener('change', function() { applyInvFilters(true); });
    invDF?.addEventListener('change', function() { applyInvFilters(true); });
    invDT?.addEventListener('change', function() { applyInvFilters(true); });
    invPS?.addEventListener('change', function() { applyInvFilters(true); });
    applyInvFilters(false);

    // Invoice Export CSV
    document.getElementById('inv-export-csv')?.addEventListener('click', () => {
      const headers = ['เลขที่ใบแจ้งหนี้','Tenant','Sub-Platform','ประเภท','รายละเอียด','จำนวนเงิน','VAT','รวมทั้งสิ้น','สถานะ','วันครบกำหนด','ช่องทาง','รอบที่ชำระ'];
      const visible = [...document.querySelectorAll('#inv-table-body tr')].filter(r => r.style.display !== 'none');
      const ids     = visible.map(r => r.querySelector('td.mono')?.textContent.trim());
      const rows    = d.invoices.filter(i => ids.includes(i.id));
      const csv = [headers, ...rows.map(i => [
        i.id, i.tenantName, i.subPlatform || '-', i.type, i.description, i.amount, i.vat, i.total, i.status, i.dueDate, i.method || '-', d.billingCyclesPaid(i.tenantId),
      ])].map(r => r.map(v => _billingCsvCell(v)).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `invoices_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });

    // Invoice Export PDF
    document.getElementById('inv-export-pdf')?.addEventListener('click', () => {
      const visible = [...document.querySelectorAll('#inv-table-body tr')].filter(r => r.style.display !== 'none');
      const ids     = visible.map(r => r.querySelector('td.mono')?.textContent.trim());
      const rows    = d.invoices.filter(i => ids.includes(i.id)).map(i =>
        `<tr><td>${i.id}</td><td>${i.tenantName}</td><td>${i.subPlatform || '-'}</td><td>${i.type}</td>
         <td>${i.description}</td><td>${i.total.toLocaleString('th-TH',{minimumFractionDigits:2})} THB</td>
         <td>${i.status}</td><td>${i.dueDate}</td><td>${i.method || '-'}</td><td>${d.billingCyclesPaid(i.tenantId)}</td></tr>`
      ).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoices</title>
        <style>body{font-family:sans-serif;font-size:12px;padding:20px;}
        table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px 8px;}
        th{background:#f5f5f5;}</style></head><body>
        <h2>ใบแจ้งหนี้ — ${new Date().toLocaleDateString('th-TH')}</h2>
        <table><thead><tr><th>เลขที่</th><th>Tenant</th><th>Sub-Platform</th><th>ประเภท</th>
        <th>รายละเอียด</th><th>รวมทั้งสิ้น</th><th>สถานะ</th><th>ครบกำหนด</th><th>ช่องทาง</th><th>รอบที่ชำระ</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.onload=function(){window.print();}<\/script></body></html>`;
      const w = window.open('', '_blank'); w.document.write(html); w.document.close();
    });

    // Invoice Detail Modal (matching Developer Portal template)
    document.querySelectorAll('.inv-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = d.invoices.find(i => i.id === btn.dataset.id);
        if (!inv) return;
        const meta = (d.tenantMeta || {})[inv.tenantId] || {};
        const isPaid = inv.status === 'Paid';
        const docTitle = isPaid ? 'ใบเสร็จรับเงิน/ใบกำกับภาษี' : 'ใบแจ้งหนี้/ใบกำกับภาษี';
        const docTitleEn = isPaid ? 'RECEIPT / TAX INVOICE' : 'INVOICE / TAX INVOICE';
        const statusBadge = isPaid
          ? '<span class="chip chip-green" style="font-size:11px">ชำระแล้ว</span>'
          : inv.status === 'Overdue'
            ? '<span class="chip chip-red" style="font-size:11px">เกินกำหนด</span>'
            : '<span class="chip chip-yellow" style="font-size:11px">รอชำระ</span>';
        const fmtAmt = d.formatCurrency(inv.amount);
        const fmtVat = d.formatCurrency(inv.vat);
        const fmtTotal = d.formatCurrency(inv.total);

        // Payment info section
        var paidSection = '';
        var isBankTransfer = (inv.method || '').toLowerCase().indexOf('bank') >= 0 || (inv.method || '').toLowerCase().indexOf('transfer') >= 0 || (inv.method || '').toLowerCase().indexOf('โอน') >= 0;
        var isPendingVerify = inv.status === 'Pending Verification';
        var refCode = 'TRF-' + inv.id.replace(/[^0-9]/g, '').slice(-6) + Math.floor(Math.random() * 900 + 100);
        var slipFilename = 'slip_' + inv.id.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.jpg';
        var slipDate = inv.paidDate || inv.issuedDate || '-';

        // Slip attachment block (for Bank Transfer — both pending and paid)
        var slipBlock = '';
        if (isBankTransfer) {
          slipBlock = ''
            + '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">'
            + '<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:8px;font-weight:600;">หลักฐานการชำระเงิน</div>'
            + '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);">'
            + '<div style="width:40px;height:40px;border-radius:8px;background:var(--surface);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
            + '<i class="fa-solid fa-image" style="color:var(--text-muted);"></i></div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div class="text-sm font-600" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + slipFilename + '</div>'
            + '<div class="text-xs" style="color:var(--text-muted);">245 KB · อัปโหลดเมื่อ ' + slipDate + '</div></div>'
            + '<button class="btn btn-outline btn-sm inv-modal-view-slip" data-id="' + inv.id + '"><i class="fa-solid fa-eye"></i> ดูสลิป</button>'
            + '</div></div>';
        }

        if (isPaid) {
          paidSection = ''
            + '<div class="inv-paid-banner"><i class="fa-solid fa-circle-check" style="font-size:18px;"></i><span>ชำระเงินเรียบร้อยแล้ว</span></div>'
            + '<div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px;">'
            + '<div class="inv-paid-details" style="margin-bottom:0;border-radius:0;">'
            + '<div><div class="inv-pd-label">วันที่ชำระ</div><div class="inv-pd-value">' + (inv.paidDate || '-') + '</div></div>'
            + '<div><div class="inv-pd-label">ช่องทาง</div><div class="inv-pd-value">' + (inv.method || '-') + '</div></div>'
            + '<div><div class="inv-pd-label">เลข Ref.</div><div class="inv-pd-value mono" style="font-size:12px;">' + refCode + '</div></div>'
            + '<div><div class="inv-pd-label">ตรวจสอบโดย</div><div class="inv-pd-value">ระบบอัตโนมัติ</div><div class="inv-pd-sub">' + (inv.paidDate || '-') + '</div></div>'
            + '</div>'
            + slipBlock
            + '</div>';
        } else if (isPendingVerify && isBankTransfer) {
          paidSection = ''
            + '<div style="padding:12px 16px;display:flex;align-items:center;gap:8px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);border-radius:12px;margin-bottom:16px;">'
            + '<i class="fa-solid fa-clock" style="color:var(--warning);font-size:16px;"></i>'
            + '<span class="text-sm font-600" style="color:var(--warning);">รอตรวจสอบสลิปการโอนเงิน</span></div>'
            + '<div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px;">'
            + '<div class="inv-paid-details" style="margin-bottom:0;border-radius:0;">'
            + '<div><div class="inv-pd-label">ช่องทาง</div><div class="inv-pd-value">' + (inv.method || 'Bank Transfer') + '</div></div>'
            + '<div><div class="inv-pd-label">เลข Ref.</div><div class="inv-pd-value mono" style="font-size:12px;">' + refCode + '</div></div>'
            + '<div><div class="inv-pd-label">สถานะ</div><div class="inv-pd-value"><span class="chip chip-yellow">รอตรวจสอบ</span></div></div>'
            + '<div><div class="inv-pd-label">ครบกำหนด</div><div class="inv-pd-value">' + inv.dueDate + '</div></div>'
            + '</div>'
            + slipBlock
            + '</div>';
        }

        App.showModal(
          '<div class="modal" style="max-width:720px;padding:0;overflow:hidden;">'
          + '<div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">'
          + '<div style="display:flex;align-items:center;gap:10px;">'
          + '<div class="font-700" style="font-size:16px;">รายละเอียดใบแจ้งหนี้</div>'
          + statusBadge
          + '</div>'
          + '<div style="display:flex;align-items:center;gap:8px;">'
          + '<button class="btn btn-outline btn-sm inv-modal-print-btn"><i class="fa-solid fa-download"></i> ดาวน์โหลด PDF</button>'
          + '<button class="btn btn-sm" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:18px;" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>'
          + '</div>'
          + '</div>'
          + '<div style="padding:24px;max-height:70vh;overflow-y:auto;">'
          // Paid section
          + paidSection
          // Invoice Card
          + '<div class="inv-card">'
          + '<div class="inv-head">'
          + '<div>'
          + '<div class="inv-brand-name">REALFACT</div>'
          + '<div class="inv-brand-sub">บริษัท เรียลแฟกต์ เอไอ จำกัด<br>เลขประจำตัวผู้เสียภาษี: 0-1055-68005-12-3<br>123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย<br>กรุงเทพฯ 10110<br>โทร: 02-XXX-XXXX</div>'
          + '</div>'
          + '<div class="inv-doc-info">'
          + '<div class="inv-doc-title">' + docTitle + '</div>'
          + '<div style="font-size:10px;color:var(--text-dim);letter-spacing:1px;">' + docTitleEn + '</div>'
          + '<div style="font-size:11px;margin-top:8px;color:var(--text-muted);">' + inv.description + '</div>'
          + '<div class="inv-doc-num">' + inv.id + '</div>'
          + '<div class="inv-doc-date">วันที่ออก: ' + inv.issuedDate + '</div>'
          + '<div class="inv-doc-date">' + (isPaid ? 'วันที่ชำระ: ' + (inv.paidDate || '-') : 'ครบกำหนดชำระ: ' + inv.dueDate) + '</div>'
          + '<div style="margin-top:6px;">' + statusBadge + '</div>'
          + '</div>'
          + '</div>'
          // Parties
          + '<div class="inv-parties">'
          + '<div class="inv-party">'
          + '<div class="inv-party-label">ผู้ขาย / Seller</div>'
          + '<div class="inv-party-name">บริษัท เรียลแฟกต์ เอไอ จำกัด</div>'
          + '<div class="inv-party-detail">เลขประจำตัวผู้เสียภาษี: 0-1055-68005-12-3<br>123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย<br>กรุงเทพฯ 10110<br>โทร: 02-XXX-XXXX</div>'
          + '</div>'
          + '<div class="inv-party">'
          + '<div class="inv-party-label">ผู้ซื้อ / Bill To</div>'
          + '<div class="inv-party-name">' + inv.tenantName + '</div>'
          + '<div class="inv-party-detail">'
          + (meta.taxId ? 'เลขประจำตัวผู้เสียภาษี: ' + meta.taxId + '<br>' : '')
          + (meta.billingAddress || '-')
          + (meta.contactPerson ? '<br>ผู้ติดต่อ: ' + meta.contactPerson : '')
          + '</div>'
          + '</div>'
          + '</div>'
          // Items Table
          + '<table class="inv-items">'
          + '<thead><tr><th style="width:40px;">ลำดับ</th><th>รายการ</th><th style="text-align:center;">Sub-Platform</th><th style="text-align:right;width:100px;">จำนวนเงิน</th></tr></thead>'
          + '<tbody>'
          + '<tr><td style="text-align:center;">1</td>'
          + '<td><div class="inv-item-name">' + inv.description + '</div><div class="inv-item-desc">' + inv.type + '</div></td>'
          + '<td style="text-align:center;font-size:12px;">' + (inv.subPlatform || '-') + '</td>'
          + '<td style="text-align:right;font-family:var(--font-mono);">' + fmtAmt + '</td></tr>'
          + '</tbody></table>'
          // Summary
          + '<div class="inv-summary">'
          + '<div class="inv-summary-table">'
          + '<div class="inv-summary-row"><span class="isl">ยอดรวมก่อนภาษี</span><span class="isv">' + fmtAmt + '</span></div>'
          + '<div class="inv-summary-row"><span class="isl">ภาษีมูลค่าเพิ่ม 7%</span><span class="isv">' + fmtVat + '</span></div>'
          + '<div class="inv-summary-total"><span class="isl">ยอดรวมสุทธิ</span><span class="isv">' + fmtTotal + '</span></div>'
          + '</div></div>'
          // Footer
          + '<div class="inv-footer">'
          + '<div><div class="inv-footer-item">ช่องทางชำระ: <strong>' + (inv.method || 'รอชำระ') + '</strong></div>'
          + '<div class="inv-footer-item">Sub-Platform: <strong>' + (inv.subPlatform || '-') + '</strong></div></div>'
          + '<div class="inv-footer-item" style="text-align:right;">ใบกำกับภาษีออกโดยระบบอัตโนมัติ<br>สามารถใช้ได้โดยไม่ต้องลงนาม</div>'
          + '</div>'
          + '</div>' // end inv-card
          + '</div>' // end padding container
          + '</div>' // end modal
        );

        // Print handler
        setTimeout(function() {
          document.querySelector('.inv-modal-print-btn')?.addEventListener('click', function() {
            var stampColor = isPaid ? '#059669' : '#f59e0b';
            var stampText = isPaid ? 'PAID' : 'UNPAID';
            var fmtT = inv.total.toLocaleString('th-TH', {minimumFractionDigits: 2});
            var fmtV = inv.vat.toLocaleString('th-TH', {minimumFractionDigits: 2});
            var fmtA = inv.amount.toLocaleString('th-TH', {minimumFractionDigits: 2});
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + inv.id + '</title>'
              + '<style>body{font-family:Sarabun,sans-serif;font-size:13px;padding:30px;max-width:700px;margin:auto;color:#333;}'
              + '.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:3px solid #f15b26;margin-bottom:16px;}'
              + '.brand{font-size:24px;font-weight:700;letter-spacing:3px;color:#f15b26;}'
              + '.meta{font-size:11px;color:#999;line-height:1.8;}'
              + '.doc-title{font-size:18px;font-weight:700;letter-spacing:2px;text-align:right;}'
              + '.parties{display:flex;gap:40px;margin:16px 0;}'
              + '.party-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;font-weight:600;}'
              + '.party-name{font-weight:700;font-size:13px;margin-bottom:2px;}'
              + '.party-detail{font-size:11px;color:#666;line-height:1.7;}'
              + 'table{width:100%;border-collapse:collapse;margin:16px 0;}'
              + 'th{background:#f8f8f8;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;text-align:left;}'
              + 'td{padding:10px 12px;border-bottom:1px solid #eee;}'
              + '.right{text-align:right;}'
              + '.summary{display:flex;justify-content:flex-end;margin:0 0 16px;}'
              + '.summary-table{width:260px;}'
              + '.sum-row{display:flex;justify-content:space-between;font-size:13px;padding:3px 0;}'
              + '.sum-total{display:flex;justify-content:space-between;font-size:16px;font-weight:700;padding:8px 0 4px;border-top:2px solid #333;margin-top:6px;}'
              + '.stamp{display:inline-block;padding:6px 20px;border:3px solid ' + stampColor + ';color:' + stampColor + ';border-radius:4px;font-weight:700;font-size:16px;transform:rotate(-5deg);letter-spacing:2px;}'
              + '.footer{border-top:1px solid #ddd;padding-top:12px;font-size:11px;color:#999;display:flex;justify-content:space-between;}'
              + '</style></head><body>'
              + '<div class="hdr"><div><div class="brand">REALFACT</div><div class="meta">บริษัท เรียลแฟกต์ เอไอ จำกัด<br>Tax ID: 0-1055-68005-12-3<br>123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</div></div>'
              + '<div><div class="doc-title">' + (isPaid ? 'ใบเสร็จรับเงิน/ใบกำกับภาษี' : 'ใบแจ้งหนี้/ใบกำกับภาษี') + '</div>'
              + '<div style="text-align:right;font-size:10px;color:#999;letter-spacing:1px;">' + (isPaid ? 'RECEIPT / TAX INVOICE' : 'INVOICE / TAX INVOICE') + '</div>'
              + '<div style="text-align:right;margin-top:8px;font-size:12px;color:#f15b26;font-weight:700;">' + inv.id + '</div>'
              + '<div style="text-align:right;" class="meta">วันที่ออก: ' + inv.issuedDate + '</div>'
              + '<div style="text-align:right;" class="meta">' + (isPaid ? 'วันที่ชำระ: ' + (inv.paidDate || '-') : 'ครบกำหนด: ' + inv.dueDate) + '</div></div></div>'
              + '<div class="parties"><div><div class="party-label">ผู้ขาย / Seller</div><div class="party-name">บริษัท เรียลแฟกต์ เอไอ จำกัด</div><div class="party-detail">Tax ID: 0-1055-68005-12-3<br>123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</div></div>'
              + '<div><div class="party-label">ผู้ซื้อ / Bill To</div><div class="party-name">' + inv.tenantName + '</div><div class="party-detail">'
              + (meta.taxId ? 'Tax ID: ' + meta.taxId + '<br>' : '') + (meta.billingAddress || '') + '</div></div></div>'
              + '<table><thead><tr><th style="width:40px">ลำดับ</th><th>รายการ</th><th>ประเภท</th><th>Sub-Platform</th><th class="right">จำนวนเงิน</th></tr></thead>'
              + '<tbody><tr><td style="text-align:center">1</td><td>' + inv.description + '</td><td>' + inv.type + '</td><td style="text-align:center">' + (inv.subPlatform || '-') + '</td><td class="right" style="font-weight:600">' + fmtA + ' THB</td></tr></tbody></table>'
              + '<div class="summary"><div class="summary-table">'
              + '<div class="sum-row"><span style="color:#999">ยอดรวมก่อนภาษี</span><span>' + fmtA + '</span></div>'
              + '<div class="sum-row"><span style="color:#999">ภาษีมูลค่าเพิ่ม 7%</span><span>' + fmtV + '</span></div>'
              + '<div class="sum-total"><span>ยอดรวมสุทธิ</span><span style="color:#f15b26">' + fmtT + ' THB</span></div>'
              + '</div></div>'
              + '<div style="text-align:center;margin:20px 0;"><span class="stamp">' + stampText + '</span></div>'
              + '<div class="footer"><div>ช่องทางชำระ: ' + (inv.method || 'รอชำระ') + ' · Sub-Platform: ' + (inv.subPlatform || '-') + '</div><div style="text-align:right">ใบกำกับภาษีออกโดยระบบอัตโนมัติ<br>สามารถใช้ได้โดยไม่ต้องลงนาม</div></div>'
              + '<script>window.onload=function(){window.print();}<\/script></body></html>';
            var w = window.open('', '_blank'); w.document.write(html); w.document.close();
          });
          // View Slip handler inside invoice detail modal
          document.querySelector('.inv-modal-view-slip')?.addEventListener('click', function() {
            var slipInvId = this.dataset.id;
            var slipInv = d.invoices.find(function(i) { return i.id === slipInvId; });
            if (!slipInv) return;
            var slipMeta = (d.tenantMeta || {})[slipInv.tenantId] || {};
            var tDate = slipInv.paidDate || slipInv.issuedDate || new Date().toISOString().slice(0, 10);
            var tTime = '10:' + String(Math.floor(Math.random() * 50 + 10));
            var tRef = 'TRF-' + slipInv.id.replace(/[^0-9]/g, '').slice(-6) + Math.floor(Math.random() * 900 + 100);
            App.showModal(
              '<div class="modal" style="max-width:480px;">'
              + '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>'
              + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">'
              + '<div style="width:40px;height:40px;border-radius:10px;background:rgba(234,179,8,0.1);display:flex;align-items:center;justify-content:center;">'
              + '<i class="fa-solid fa-receipt" style="font-size:18px;color:var(--warning);"></i></div>'
              + '<div><div class="modal-title" style="margin:0;">สลิปการโอนเงิน</div>'
              + '<div class="mono text-xs text-muted">' + slipInv.id + '</div></div></div>'
              + '<div class="divider mb-16"></div>'
              + '<div class="card p-20 mb-16" style="background:linear-gradient(135deg,var(--surface2),var(--surface));text-align:center;">'
              + '<div style="width:64px;height:64px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">'
              + '<i class="fa-solid fa-building-columns" style="font-size:24px;"></i></div>'
              + '<div class="font-700 mb-4">' + (slipInv.method || 'Bank Transfer') + '</div>'
              + '<div class="mono font-700" style="font-size:22px;color:var(--primary);margin:8px 0;">' + d.formatCurrency(slipInv.total) + '</div>'
              + '<div class="divider mb-12 mt-12"></div>'
              + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;">'
              + '<div><div class="text-xs text-muted">จาก (ผู้โอน)</div><div class="text-sm font-600">' + slipInv.tenantName + '</div>'
              + (slipMeta.contactPerson ? '<div class="text-xs text-muted">' + slipMeta.contactPerson + '</div>' : '') + '</div>'
              + '<div><div class="text-xs text-muted">ไปยัง (ผู้รับ)</div><div class="text-sm font-600">RealfactAI Platform</div>'
              + '<div class="text-xs text-muted">บจก.เรียลแฟ็กท์ เอไอ</div></div>'
              + '<div><div class="text-xs text-muted">วันที่โอน</div><div class="mono text-sm">' + tDate + '</div></div>'
              + '<div><div class="text-xs text-muted">เวลา</div><div class="mono text-sm">' + tTime + '</div></div>'
              + '<div style="grid-column:span 2;"><div class="text-xs text-muted">เลขอ้างอิง</div>'
              + '<div class="mono text-sm font-600">' + tRef + '</div></div></div></div>'
              + '<div class="text-xs text-muted text-center mb-12">'
              + '<i class="fa-solid fa-circle-info"></i> สลิปนี้แนบมาโดย Tenant เพื่อยืนยันการชำระเงิน</div>'
              + '<div class="modal-actions"><button class="btn btn-outline" onclick="App.closeModal()">ปิด</button></div></div>'
            );
          });
        }, 50);
      });
    });

    // ─── Purchase Log filters + pagination ───
    var plPage = 1;
    var plSearch = document.getElementById('pl-search');
    var plFP    = document.getElementById('pl-filter-platform');
    var plFT    = document.getElementById('pl-filter-type');
    var plFS    = document.getElementById('pl-filter-status');
    var plDF    = document.getElementById('pl-date-from');
    var plDT    = document.getElementById('pl-date-to');
    var plPS    = document.getElementById('pl-page-size');

    function applyPLFilters(resetPage) {
      if (resetPage) plPage = 1;
      var query    = (plSearch?.value || '').toLowerCase();
      var platform = plFP?.value || '';
      var type     = plFT?.value || '';
      var status   = plFS?.value || '';
      var dateFrom = plDF?.value || '';
      var dateTo   = plDT?.value || '';
      var pageSize = parseInt(plPS?.value || '25');
      var allRows = document.querySelectorAll('#pl-table-body tr');
      var matched = [];
      allRows.forEach(function(row) {
        var rowDate = row.dataset.date || '';
        var match =
          (!query    || (row.dataset.search || '').includes(query)) &&
          (!platform || row.dataset.platform === platform)          &&
          (!type     || row.dataset.type     === type)              &&
          (!status   || row.dataset.status   === status)            &&
          (!dateFrom || rowDate >= dateFrom)                         &&
          (!dateTo   || rowDate <= dateTo);
        if (match) matched.push(row); else row.style.display = 'none';
      });
      var totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
      if (plPage > totalPages) plPage = totalPages;
      var start = (plPage - 1) * pageSize;
      var end = start + pageSize;
      matched.forEach(function(row, idx) {
        row.style.display = (idx >= start && idx < end) ? '' : 'none';
      });
      renderPagination('pl-page-controls', 'pl-page-info', plPage, totalPages, matched.length, pageSize, function(p) { plPage = p; applyPLFilters(false); });
    }
    plSearch?.addEventListener('input',  function() { applyPLFilters(true); });
    if (plFP) plFP.addEventListener('change', function() { applyPLFilters(true); });
    if (plFT) plFT.addEventListener('change', function() { applyPLFilters(true); });
    if (plFS) plFS.addEventListener('change', function() { applyPLFilters(true); });
    if (plDF) plDF.addEventListener('change', function() { applyPLFilters(true); });
    if (plDT) plDT.addEventListener('change', function() { applyPLFilters(true); });
    if (plPS) plPS.addEventListener('change', function() { applyPLFilters(true); });
    applyPLFilters(false);

    // Export CSV
    document.getElementById('pl-export-csv')?.addEventListener('click', () => {
      const headers = ['วันที่','Tenant','Sub-Platform','ประเภท','รายละเอียด','ช่องทาง','จำนวนเงิน','สถานะ','อ้างอิง'];
      const csv = [headers, ..._scopedPL.map(p => [
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
      const rows = _scopedPL.map(p =>
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
    const d         = window.MockData;
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;
    const allInv    = scopedTid ? d.invoices.filter(i => i.tenantId === scopedTid) : d.invoices;
    const pending   = allInv.filter(i => i.status === 'Pending Verification');
    const vlog      = scopedTid ? (d.verificationLog || []).filter(v => v.tenantId === scopedTid) : (d.verificationLog || []);

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
        : `<div class="table-wrap mb-8">
            <table>
              <thead>
                <tr>
                  <th>INV ID</th><th>TENANT</th><th>รายละเอียด</th>
                  <th>จำนวนเงิน</th><th>ช่องทาง</th><th>ครบกำหนด</th>
                  <th>สลิป</th><th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(inv => `
                  <tr>
                    <td class="mono text-sm">${inv.id}</td>
                    <td class="font-600">${inv.tenantName}</td>
                    <td class="text-sm text-muted">${inv.description}</td>
                    <td class="mono font-700" style="color:var(--primary);">${d.formatCurrency(inv.total)}</td>
                    <td class="text-sm">${inv.method || 'Bank Transfer'}</td>
                    <td class="mono text-sm text-muted">${inv.dueDate}</td>
                    <td>
                      <span class="chip chip-yellow slip-view-btn" style="cursor:pointer;" title="ดูสลิป" data-id="${inv.id}">
                        <i class="fa-solid fa-receipt"></i> ดูสลิป
                      </span>
                    </td>
                    <td>
                      <div class="flex gap-6">
                        ${(!window.Auth || Auth.hasPermission('canApprove')) ? `<button class="btn btn-danger btn-sm verify-reject-btn" data-id="${inv.id}" title="ปฏิเสธ">
                          <i class="fa-solid fa-xmark"></i> ปฏิเสธ
                        </button>
                        <button class="btn btn-success btn-sm verify-approve-btn" data-id="${inv.id}" title="อนุมัติ">
                          <i class="fa-solid fa-check"></i> อนุมัติ
                        </button>` : ''}
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}

      <!-- Verification Log -->
      <div class="mt-28">
        <div class="text-sm uppercase text-muted font-600 mb-12">
          <i class="fa-solid fa-clock-rotate-left"></i>&nbsp; ประวัติการตรวจสอบ
        </div>
        <div class="flex items-center gap-12 mb-16">
          <div class="search-bar flex-1">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="vlog-search" placeholder="ค้นหา INV ID / Tenant...">
          </div>
          <div class="form-group" style="margin:0;min-width:150px;">
            <select class="form-input" id="vlog-status-filter">
              <option value="all">All</option>
              <option value="Approved">อนุมัติ</option>
              <option value="Rejected">ปฏิเสธ</option>
            </select>
          </div>
        </div>
        <div class="table-wrap" id="vlog-table-wrap"></div>
      </div>
    `;
  },

  _renderVerificationLog() {
    const d = window.MockData;
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;
    let vlog = scopedTid ? (d.verificationLog || []).filter(v => v.tenantId === scopedTid) : (d.verificationLog || []);
    const search = (document.getElementById('vlog-search') || {}).value.trim().toLowerCase();
    const status = (document.getElementById('vlog-status-filter') || {}).value;

    if (search) {
      vlog = vlog.filter(vl =>
        vl.invoiceId.toLowerCase().includes(search) || vl.tenantName.toLowerCase().includes(search)
      );
    }
    if (status !== 'all') vlog = vlog.filter(vl => vl.action === status);

    const wrap = document.getElementById('vlog-table-wrap');
    if (!wrap) return;

    if (!vlog.length) {
      wrap.innerHTML = '<div class="text-sm text-muted p-8">ยังไม่มีประวัติการตรวจสอบที่ตรงกับเงื่อนไข</div>';
      return;
    }

    wrap.innerHTML = `<table><thead><tr>
      <th>INV ID</th><th>TENANT</th><th>จำนวนเงิน</th>
      <th>ผล</th><th>เหตุผล</th><th>ตรวจสอบโดย</th><th>วันที่ · เวลา</th>
    </tr></thead><tbody>${vlog.map(vl => `<tr>
      <td class="mono text-sm">${vl.invoiceId}</td>
      <td class="font-600">${vl.tenantName}</td>
      <td class="mono">${d.formatCurrency(vl.amount)}</td>
      <td>${vl.action === 'Approved'
        ? '<span class="chip chip-green"><i class="fa-solid fa-check"></i> อนุมัติ</span>'
        : '<span class="chip chip-red"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</span>'}</td>
      <td class="text-sm text-muted">${vl.reason || '—'}</td>
      <td style="white-space:nowrap;"><div class="text-sm font-600">${vl.verifiedBy.split('@')[0]}</div></td>
      <td class="mono text-sm text-muted" style="white-space:nowrap;">${vl.verifiedDate}${vl.verifiedTime ? ' · ' + vl.verifiedTime : ''}</td>
    </tr>`).join('')}</tbody></table>`;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.billingVerify;

    // ─── Verification Log Filter ───
    self._renderVerificationLog();
    const vlogSearch = document.getElementById('vlog-search');
    const vlogStatus = document.getElementById('vlog-status-filter');
    if (vlogSearch) vlogSearch.addEventListener('input', () => self._renderVerificationLog());
    if (vlogStatus) vlogStatus.addEventListener('change', () => self._renderVerificationLog());

    // Slip/Receipt View Modal
    document.querySelectorAll('.slip-view-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const invId = chip.dataset.id;
        const inv = d.invoices.find(i => i.id === invId);
        if (!inv) return;
        const meta = (d.tenantMeta || {})[inv.tenantId] || {};
        const transferDate = inv.paidDate || new Date().toISOString().slice(0, 10);
        const transferTime = '10:' + String(Math.floor(Math.random() * 50 + 10));
        const refCode = 'TRF-' + inv.id.replace(/[^0-9]/g, '').slice(-6) + Math.floor(Math.random() * 900 + 100);

        App.showModal(`
          <div class="modal" style="max-width:480px;">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <div style="width:40px;height:40px;border-radius:10px;background:var(--warning-bg,#fff3e0);display:flex;align-items:center;justify-content:center;">
                <i class="fa-solid fa-receipt" style="font-size:18px;color:var(--warning);"></i>
              </div>
              <div>
                <div class="modal-title" style="margin:0;">สลิปการโอนเงิน</div>
                <div class="mono text-xs text-muted">${inv.id}</div>
              </div>
            </div>

            <div class="divider mb-16"></div>

            <!-- Mock Slip Content -->
            <div class="card p-20 mb-16" style="background:linear-gradient(135deg,#f8f9fa,#e9ecef);text-align:center;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                <i class="fa-solid fa-building-columns" style="font-size:24px;"></i>
              </div>
              <div class="font-700 mb-4">${inv.method || 'Bank Transfer'}</div>
              <div class="mono text-xl font-700" style="color:var(--primary);margin:8px 0;">${d.formatCurrency(inv.total)}</div>

              <div class="divider mb-12 mt-12"></div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;">
                <div>
                  <div class="text-xs text-muted">จาก (ผู้โอน)</div>
                  <div class="text-sm font-600">${inv.tenantName}</div>
                  ${meta.contactPerson ? '<div class="text-xs text-muted">' + meta.contactPerson + '</div>' : ''}
                </div>
                <div>
                  <div class="text-xs text-muted">ไปยัง (ผู้รับ)</div>
                  <div class="text-sm font-600">RealfactAI Platform</div>
                  <div class="text-xs text-muted">บจก.เรียลแฟ็กท์ เอไอ</div>
                </div>
                <div>
                  <div class="text-xs text-muted">วันที่โอน</div>
                  <div class="mono text-sm">${transferDate}</div>
                </div>
                <div>
                  <div class="text-xs text-muted">เวลา</div>
                  <div class="mono text-sm">${transferTime}</div>
                </div>
                <div style="grid-column:span 2;">
                  <div class="text-xs text-muted">เลขอ้างอิง</div>
                  <div class="mono text-sm font-600">${refCode}</div>
                </div>
              </div>
            </div>

            <div class="text-xs text-muted text-center mb-12">
              <i class="fa-solid fa-circle-info"></i> สลิปนี้แนบมาโดย Tenant เพื่อยืนยันการชำระเงิน
            </div>

            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
            </div>
          </div>`);
      });
    });

    document.querySelectorAll('.verify-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inv = d.invoices.find(i => i.id === btn.dataset.id);
        if (!inv) return;
        const now  = new Date();
        const date = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 5);
        inv.status       = 'Paid';
        inv.paidDate     = date;
        inv.verifiedBy   = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
        inv.verifiedDate = date;
        d.verificationLog = d.verificationLog || [];
        d.verificationLog.unshift({
          id: 'VL-' + Date.now(),
          invoiceId: inv.id, tenantId: inv.tenantId, tenantName: inv.tenantName,
          amount: inv.total, action: 'Approved', reason: null,
          verifiedBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), verifiedDate: date, verifiedTime: time,
        });
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
            const now  = new Date();
            const date = now.toISOString().slice(0, 10);
            const time = now.toTimeString().slice(0, 5);
            inv.status       = 'Issued';
            inv.rejectReason = reason;
            inv.rejectedBy   = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
            inv.rejectedDate = date;
            d.verificationLog = d.verificationLog || [];
            d.verificationLog.unshift({
              id: 'VL-' + Date.now(),
              invoiceId: inv.id, tenantId: inv.tenantId, tenantName: inv.tenantName,
              amount: inv.total, action: 'Rejected', reason,
              verifiedBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), verifiedDate: date, verifiedTime: time,
            });
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
    const scopedTid          = window.Auth ? Auth.scopedTenantId() : null;
    const creditLines        = scopedTid ? (d.creditLines || []).filter(c => c.tenantId === scopedTid) : (d.creditLines || []);
    const creditLineRequests = scopedTid ? (d.creditLineRequests || []).filter(c => c.tenantId === scopedTid) : (d.creditLineRequests || []);
    const refundRequests     = scopedTid ? (d.refundRequests || []).filter(r => r.tenantId === scopedTid) : (d.refundRequests || []);
    const clLog              = scopedTid ? (d.creditLineApprovalLog || []).filter(l => l.tenantId === scopedTid) : (d.creditLineApprovalLog || []);
    const pendingRefunds     = refundRequests.filter(r => r.status !== 'Approved').length;

    // Unique tenant lists for filters
    const clTenants  = [...new Set(creditLines.map(c => c.tenantName))].sort();
    const refTenants = [...new Set(refundRequests.map(r => r.tenantName))].sort();
    const logTenants = [...new Set(clLog.map(l => l.tenantName))].sort();

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
        <div class="tab-item" data-tab="cl-log">
          <i class="fa-solid fa-clock-rotate-left"></i> ประวัติการอนุมัติ
          ${clLog.length > 0 ? `<span class="text-xs text-muted" style="margin-left:4px;">(${clLog.length})</span>` : ''}
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
                <thead><tr><th>ID</th><th>TENANT</th><th>วงเงินที่ขอ</th><th>วันที่ขอ</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr></thead>
                <tbody>
                  ${creditLineRequests.map(req => `
                    <tr>
                      <td class="mono text-sm">${req.id}</td>
                      <td><a href="#" class="font-600 text-primary tenant-peek-link" data-id="${req.tenantId}">${req.tenantName}</a></td>
                      <td class="mono font-600">${d.formatCurrency(req.requestedLimit)}</td>
                      <td class="text-sm text-muted">${req.requestDate}</td>
                      <td>${d.statusChip(req.status)}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${req.modifiedDate || '-'}</div>${req.modifiedBy ? `<div class="text-xs text-dim">${req.modifiedBy.split('@')[0]}</div>` : ''}</td>
                      <td style="white-space:nowrap;">
                        <div class="flex items-center gap-6">
                          <button class="btn btn-outline btn-sm cl-view-docs-btn" data-id="${req.id}"><i class="fa-solid fa-file-lines"></i> เอกสาร (${req.documents})</button>
                          ${(!window.Auth || Auth.hasPermission('canApprove')) ? `<button class="btn btn-success btn-sm cl-approve-req-btn" data-id="${req.id}"><i class="fa-solid fa-check"></i> อนุมัติ</button>
                          <button class="btn btn-danger btn-sm cl-reject-req-btn ml-4" data-id="${req.id}"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>` : ''}
                        </div>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}

        <!-- Filter: Credit Lines -->
        <div class="flex items-center gap-10 mb-16" style="flex-wrap:wrap;">
          <div class="search-bar flex-1" style="min-width:180px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="cl-filter-search" placeholder="ค้นหา Tenant...">
          </div>
          <select id="cl-filter-tenant" class="form-input" style="width:auto;min-width:160px;">
            <option value="">Tenant: ทั้งหมด</option>
            ${clTenants.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <select id="cl-filter-source" class="form-input" style="width:auto;min-width:140px;">
            <option value="">แหล่งที่มา: ทั้งหมด</option>
            <option value="Developer Portal">Developer Portal</option>
            <option value="Platform">Platform</option>
          </select>
          <select id="cl-filter-status" class="form-input" style="width:auto;min-width:130px;">
            <option value="">สถานะ: ทั้งหมด</option>
            <option value="Active">ใช้งาน</option>
            <option value="Suspended">ระงับ</option>
          </select>
        </div>

        <div class="text-sm uppercase text-muted font-600 mb-12">วงเงินเครดิตที่อนุมัติแล้ว <span id="cl-count" class="text-xs font-400">(${creditLines.length} รายการ)</span></div>
        <div class="table-wrap" id="cl-table-body">
          <table>
            <thead><tr><th>ID</th><th>TENANT</th><th>แหล่งที่มา</th><th>วงเงินสูงสุด</th><th>ใช้ไปแล้ว</th><th>คงเหลือ</th><th>การใช้งาน</th><th>รอบบิล</th><th>เงื่อนไข</th><th>รอบที่ชำระ</th><th>สถานะ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr></thead>
            <tbody>
              ${creditLines.length === 0
                ? '<tr><td colspan="13" class="text-center text-muted p-20">ยังไม่มีวงเงินเครดิตที่อนุมัติ</td></tr>'
                : creditLines.map(cl => {
                    const usedPct  = Math.min(100, Math.round(cl.usedAmount / cl.creditLimit * 100));
                    const barColor = usedPct > 80 ? 'var(--error)' : usedPct > 50 ? 'var(--warning)' : 'var(--success)';
                    const cycles   = d.billingCyclesPaid(cl.tenantId);
                    const srcChip  = cl.source === 'Developer Portal'
                      ? '<span class="chip chip-purple">Dev Portal</span>'
                      : '<span class="chip chip-blue">Platform</span>';
                    return `<tr data-source="${cl.source || 'Platform'}" data-status="${cl.status}" data-tenant="${cl.tenantName.toLowerCase()}">
                      <td class="mono text-sm">${cl.id}</td>
                      <td><a href="#" class="font-600 text-primary tenant-peek-link" data-id="${cl.tenantId}">${cl.tenantName}</a></td>
                      <td>${srcChip}</td>
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
                      <td class="text-sm">${cl.paymentTerms || '-'}</td>
                      <td class="mono text-center">${cycles > 0 ? '<span class="chip chip-green">' + cycles + ' รอบ</span>' : '<span class="text-muted">—</span>'}</td>
                      <td>${d.statusChip(cl.status)}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${cl.modifiedDate || '-'}</div>${cl.modifiedBy ? `<div class="text-xs text-dim">${cl.modifiedBy.split('@')[0]}</div>` : ''}</td>
                      <td><button class="btn btn-sm btn-outline cl-edit-btn" data-id="${cl.id}"><i class="fa-solid fa-pen"></i></button></td>
                    </tr>`;
                  }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Refunds -->
      <div id="credit-tab-refunds" class="hidden">
        <!-- Filter: Refunds -->
        <div class="flex items-center gap-10 mb-16" style="flex-wrap:wrap;">
          <div class="search-bar flex-1" style="min-width:180px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="ref-filter-search" placeholder="ค้นหา Tenant หรือ Invoice...">
          </div>
          <select id="ref-filter-tenant" class="form-input" style="width:auto;min-width:160px;">
            <option value="">Tenant: ทั้งหมด</option>
            ${refTenants.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('')}
          </select>
          <select id="ref-filter-status" class="form-input" style="width:auto;min-width:140px;">
            <option value="">สถานะ: ทั้งหมด</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
          </select>
        </div>

        ${refundRequests.length === 0
          ? '<div class="empty-state"><i class="fa-solid fa-circle-check"></i><p>ไม่มีคำขอคืนเงิน</p></div>'
          : `<div class="table-wrap" id="ref-table-body">
              <table>
                <thead><tr><th>ID</th><th>TENANT</th><th>ใบแจ้งหนี้</th><th>จำนวนเงิน</th><th>เหตุผล</th><th>สถานะ</th><th>Dual Approval</th><th>วันที่ขอ</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr></thead>
                <tbody>
                  ${refundRequests.map(r => {
                    const isApproved = r.superAdminApproved && r.financeApproved;
                    return `<tr data-status="${isApproved ? 'approved' : 'pending'}" data-tenant="${r.tenantName.toLowerCase()}" data-invoice="${r.invoiceId.toLowerCase()}">
                      <td class="mono text-sm">${r.id}</td>
                      <td class="font-600">${r.tenantName}</td>
                      <td class="mono text-sm">${r.invoiceId}</td>
                      <td class="mono font-600">${d.formatCurrency(r.amount)}</td>
                      <td class="text-sm">${r.reason}</td>
                      <td>${d.statusChip(r.status)}</td>
                      <td>
                        <div class="flex gap-6 items-center">
                          <span class="chip ${r.superAdminApproved ? 'chip-green' : 'chip-gray'}" title="Owner">
                            <i class="fa-solid fa-crown"></i> ${r.superAdminApproved ? '✓' : '✗'}
                          </span>
                          <span class="chip ${r.financeApproved ? 'chip-green' : 'chip-gray'}" title="Finance">
                            <i class="fa-solid fa-coins"></i> ${r.financeApproved ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td class="text-sm text-muted">${r.requestDate}</td>
                      <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${r.modifiedDate || '-'}</div>${r.modifiedBy ? `<div class="text-xs text-dim">${r.modifiedBy.split('@')[0]}</div>` : ''}</td>
                      <td>
                        ${!isApproved
                          ? ((!window.Auth || Auth.hasPermission('canApprove')) ? `<button class="btn btn-success btn-sm refund-approve-btn" data-id="${r.id}"><i class="fa-solid fa-check"></i> อนุมัติ</button>` : '')
                          : '<span class="chip chip-green">สมบูรณ์</span>'}
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`}
      </div>

      <!-- Credit Line Approval Log (Tab) -->
      <div id="credit-tab-cl-log" class="hidden">
        <!-- Filter: Log -->
        <div class="flex items-center gap-10 mb-16" style="flex-wrap:wrap;">
          <div class="search-bar flex-1" style="min-width:180px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="clog-filter-search" placeholder="ค้นหา Credit Line ID...">
          </div>
          <select id="clog-filter-tenant" class="form-input" style="width:auto;min-width:160px;">
            <option value="">Tenant: ทั้งหมด</option>
            ${logTenants.map(t => `<option value="${t.toLowerCase()}">${t}</option>`).join('')}
          </select>
          <select id="clog-filter-action" class="form-input" style="width:auto;min-width:150px;">
            <option value="">การดำเนินการ: ทั้งหมด</option>
            <option value="Approved">อนุมัติ</option>
            <option value="Rejected">ปฏิเสธ</option>
            <option value="Edited">แก้ไข</option>
            <option value="Suspended">ระงับ</option>
          </select>
        </div>

        ${clLog.length === 0
          ? '<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><p>ยังไม่มีประวัติการอนุมัติ</p></div>'
          : `<div class="table-wrap" id="clog-table-body">
              <table>
                <thead>
                  <tr>
                    <th>Credit Line</th><th>TENANT</th><th>การดำเนินการ</th>
                    <th>รายละเอียด</th><th>ดำเนินการโดย</th><th>วันที่ · เวลา</th>
                  </tr>
                </thead>
                <tbody>
                  ${clLog.slice().sort((a,b) => (b.actionDate+b.actionTime).localeCompare(a.actionDate+a.actionTime)).map(log => {
                    const actionChip = log.action === 'Approved'
                      ? '<span class="chip chip-green"><i class="fa-solid fa-check"></i> อนุมัติ</span>'
                      : log.action === 'Rejected'
                      ? '<span class="chip chip-red"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</span>'
                      : log.action === 'Suspended'
                      ? '<span class="chip chip-orange"><i class="fa-solid fa-pause"></i> ระงับ</span>'
                      : '<span class="chip chip-blue"><i class="fa-solid fa-pen"></i> แก้ไข</span>';
                    return `<tr data-action="${log.action}" data-tenant="${log.tenantName.toLowerCase()}" data-clid="${log.creditLineId.toLowerCase()}">
                      <td class="mono text-sm">${log.creditLineId}</td>
                      <td class="font-600">${log.tenantName}</td>
                      <td>${actionChip}</td>
                      <td class="text-sm">${log.detail}</td>
                      <td style="white-space:nowrap;">
                        <div class="text-sm font-600">${log.actionBy.split('@')[0]}</div>
                      </td>
                      <td class="mono text-sm text-muted" style="white-space:nowrap;">${log.actionDate}${log.actionTime ? ' · ' + log.actionTime : ''}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`}
      </div>
    `;
  },

  init(activeTab) {
    const d    = window.MockData;
    const self = window.Pages.billingCredit;

    // Sub-tab switching (3 tabs)
    const tabPanels = ['credit', 'refunds', 'cl-log'];
    const tabs = document.querySelectorAll('#credit-tabs .tab-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const active = tab.dataset.tab;
        tabPanels.forEach(p => {
          const el = document.getElementById('credit-tab-' + p);
          if (el) el.classList.toggle('hidden', p !== active);
        });
      });
    });
    if (activeTab) {
      const target = document.querySelector('#credit-tabs .tab-item[data-tab="' + activeTab + '"]');
      if (target) target.click();
    }

    // ─── Filter: Credit Lines ───
    const clFilterApply = () => {
      const search = (document.getElementById('cl-filter-search')?.value || '').trim().toLowerCase();
      const tenant = (document.getElementById('cl-filter-tenant')?.value || '').toLowerCase();
      const source = document.getElementById('cl-filter-source')?.value || '';
      const status = document.getElementById('cl-filter-status')?.value || '';
      const rows = document.querySelectorAll('#cl-table-body tbody tr[data-source]');
      let visible = 0;
      rows.forEach(row => {
        const matchSearch = !search || row.dataset.tenant.includes(search);
        const matchTenant = !tenant || row.dataset.tenant === tenant;
        const matchSource = !source || row.dataset.source === source;
        const matchStatus = !status || row.dataset.status === status;
        const show = matchSearch && matchTenant && matchSource && matchStatus;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      const countEl = document.getElementById('cl-count');
      if (countEl) countEl.textContent = '(' + visible + ' รายการ)';
    };
    document.getElementById('cl-filter-search')?.addEventListener('input', clFilterApply);
    document.getElementById('cl-filter-tenant')?.addEventListener('change', clFilterApply);
    document.getElementById('cl-filter-source')?.addEventListener('change', clFilterApply);
    document.getElementById('cl-filter-status')?.addEventListener('change', clFilterApply);

    // ─── Filter: Refunds ───
    const refFilterApply = () => {
      const search = (document.getElementById('ref-filter-search')?.value || '').trim().toLowerCase();
      const tenant = (document.getElementById('ref-filter-tenant')?.value || '');
      const status = document.getElementById('ref-filter-status')?.value || '';
      const rows = document.querySelectorAll('#ref-table-body tbody tr[data-status]');
      rows.forEach(row => {
        const matchSearch = !search || row.dataset.tenant.includes(search) || row.dataset.invoice.includes(search);
        const matchTenant = !tenant || row.dataset.tenant === tenant;
        const matchStatus = !status || row.dataset.status === status;
        row.style.display = matchSearch && matchTenant && matchStatus ? '' : 'none';
      });
    };
    document.getElementById('ref-filter-search')?.addEventListener('input', refFilterApply);
    document.getElementById('ref-filter-tenant')?.addEventListener('change', refFilterApply);
    document.getElementById('ref-filter-status')?.addEventListener('change', refFilterApply);

    // ─── Filter: Approval Log ───
    const clogFilterApply = () => {
      const search = (document.getElementById('clog-filter-search')?.value || '').trim().toLowerCase();
      const tenant = (document.getElementById('clog-filter-tenant')?.value || '');
      const action = document.getElementById('clog-filter-action')?.value || '';
      const rows = document.querySelectorAll('#clog-table-body tbody tr[data-action]');
      rows.forEach(row => {
        const matchSearch = !search || row.dataset.clid.includes(search);
        const matchTenant = !tenant || row.dataset.tenant === tenant;
        const matchAction = !action || row.dataset.action === action;
        row.style.display = matchSearch && matchTenant && matchAction ? '' : 'none';
      });
    };
    document.getElementById('clog-filter-search')?.addEventListener('input', clogFilterApply);
    document.getElementById('clog-filter-tenant')?.addEventListener('change', clogFilterApply);
    document.getElementById('clog-filter-action')?.addEventListener('change', clogFilterApply);

    // Tenant name → open Tenant detail modal
    document.querySelectorAll('.tenant-peek-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        window.Pages.tenants?._showModal(a.dataset.id);
      });
    });

    // Credit Line: View Documents
    document.querySelectorAll('.cl-view-docs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = (d.creditLineRequests || []).find(r => r.id === btn.dataset.id);
        if (!req) return;
        const files = req.documentFiles || [];
        const fileIcon = (type) => {
          if (type === 'pdf') return 'fa-file-pdf text-error';
          if (type === 'image' || type === 'jpg' || type === 'png') return 'fa-file-image text-primary';
          return 'fa-file text-muted';
        };
        App.showModal(`
          <div class="modal" style="max-width:520px;">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-4">เอกสารประกอบคำขอวงเงินเครดิต</div>
            <div class="text-sm text-muted mb-16">${req.tenantName} · ${req.id} · ขอวงเงิน ${d.formatCurrency(req.requestedLimit)}</div>
            ${files.length === 0 ? `<div class="text-sm text-muted p-20 text-center">ไม่มีเอกสารแนบ</div>` : `
              <div class="flex-col gap-8">
                ${files.map((f, i) => `
                  <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;">
                    <div class="flex items-center gap-10">
                      <i class="fa-solid ${fileIcon(f.type)}" style="font-size:20px;width:24px;text-align:center;"></i>
                      <div>
                        <div class="font-600 text-sm">${f.name}</div>
                        <div class="text-xs text-muted">${f.size} · อัปโหลด ${f.uploadedAt}</div>
                      </div>
                    </div>
                    <div class="flex gap-6">
                      <button class="btn btn-outline btn-sm" onclick="App.toast('เปิดดูเอกสาร: ${f.name}','info')"><i class="fa-solid fa-eye"></i> ดู</button>
                      <button class="btn btn-outline btn-sm" onclick="App.toast('ดาวน์โหลด: ${f.name}','info')"><i class="fa-solid fa-download"></i></button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="text-xs text-muted mt-12" style="text-align:right;">ทั้งหมด ${files.length} ไฟล์</div>
            `}
            <div class="modal-actions mt-16">
              <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
            </div>
          </div>`);
      });
    });

    // Credit Line: Approve (pre-fill from Billing Terms Config)
    document.querySelectorAll('.cl-approve-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = (d.creditLineRequests || []).find(r => r.id === btn.dataset.id);
        if (!req) return;
        const resolved = d.resolveBillingTerms('devportal');
        const rc = resolved.billingCycle;
        const rt = resolved.paymentTerms;
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
              <label class="form-label">รอบบิล (วัน) <span class="text-xs text-muted">— pre-filled จาก Billing Terms Config</span></label>
              <select id="cl-cycle" class="form-input">
                <option value="15" ${rc===15?'selected':''}>15 วัน</option>
                <option value="30" ${rc===30?'selected':''}>30 วัน</option>
                <option value="60" ${rc===60?'selected':''}>60 วัน</option>
                <option value="90" ${rc===90?'selected':''}>90 วัน</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">เงื่อนไขการชำระ <span class="text-xs text-muted">— pre-filled จาก Billing Terms Config</span></label>
              <select id="cl-terms" class="form-input">
                <option value="Net 15" ${rt==='Net 15'?'selected':''}>Net 15</option>
                <option value="Net 30" ${rt==='Net 30'?'selected':''}>Net 30</option>
                <option value="Net 60" ${rt==='Net 60'?'selected':''}>Net 60</option>
                <option value="Net 90" ${rt==='Net 90'?'selected':''}>Net 90</option>
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
            const now = new Date();
            const dateStr = now.toISOString().slice(0,10);
            const timeStr = now.toTimeString().slice(0,5);
            const newClId = 'CL-' + Date.now();
            d.creditLines = d.creditLines || [];
            d.creditLines.push({
              id: newClId, tenantId: req.tenantId, tenantName: req.tenantName,
              creditLimit: limit, usedAmount: 0, availableCredit: limit,
              billingCycle: cycle, paymentTerms: terms, status: 'Active',
              approvedDate: dateStr, approvedBy: 'Finance Admin', lastInvoice: null,
            });
            d.creditLineApprovalLog = d.creditLineApprovalLog || [];
            d.creditLineApprovalLog.unshift({
              id: 'CLOG-' + Date.now(), creditLineId: newClId, tenantId: req.tenantId, tenantName: req.tenantName,
              action: 'Approved', detail: 'อนุมัติวงเงิน ' + d.formatCurrency(limit) + ' · รอบบิล ' + cycle + ' วัน · ' + terms,
              actionBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), actionDate: dateStr, actionTime: timeStr,
            });
            d.creditLineRequests = (d.creditLineRequests || []).filter(r => r.id !== req.id);
            App.closeModal();
            App.toast('อนุมัติวงเงินเครดิตสำเร็จ','success');
            self._rerender('credit');
          });
        }, 50);
      });
    });

    // Credit Line: Reject (with reason)
    document.querySelectorAll('.cl-reject-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const req = (d.creditLineRequests || []).find(r => r.id === btn.dataset.id);
        if (!req) return;
        App.showModal(`
          <div class="modal" style="max-width:480px;">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-4" style="color:var(--error);">ปฏิเสธคำขอวงเงิน</div>
            <div class="text-sm text-muted mb-16">Tenant: <strong>${req.tenantName}</strong> · ขอวงเงิน ${d.formatCurrency(req.requestedLimit)}</div>
            <div class="form-group">
              <label class="form-label">เหตุผลในการปฏิเสธ <span class="text-error">*</span></label>
              <select id="cl-reject-reason-select" class="form-input mb-8">
                <option value="">— เลือกเหตุผล —</option>
                <option value="เอกสารไม่ครบถ้วน">เอกสารไม่ครบถ้วน</option>
                <option value="วงเงินที่ขอสูงเกินไป">วงเงินที่ขอสูงเกินไป</option>
                <option value="ประวัติการชำระเงินไม่ผ่านเกณฑ์">ประวัติการชำระเงินไม่ผ่านเกณฑ์</option>
                <option value="ข้อมูลบริษัทไม่ตรงกับเอกสาร">ข้อมูลบริษัทไม่ตรงกับเอกสาร</option>
                <option value="other">อื่นๆ (ระบุ)</option>
              </select>
              <textarea id="cl-reject-reason-text" class="form-input" rows="3" placeholder="รายละเอียดเพิ่มเติม..." style="display:none;"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-danger" id="cl-reject-confirm"><i class="fa-solid fa-xmark"></i> ยืนยันปฏิเสธ</button>
            </div>
          </div>`);
        setTimeout(() => {
          const selEl = document.getElementById('cl-reject-reason-select');
          const txtEl = document.getElementById('cl-reject-reason-text');
          selEl?.addEventListener('change', () => {
            txtEl.style.display = selEl.value === 'other' ? '' : 'none';
            if (selEl.value !== 'other') txtEl.value = '';
          });
          document.getElementById('cl-reject-confirm')?.addEventListener('click', () => {
            const selVal = selEl.value;
            const txtVal = txtEl.value.trim();
            const reason = selVal === 'other' ? txtVal : selVal;
            if (!reason) { App.toast('กรุณาระบุเหตุผลในการปฏิเสธ','error'); return; }
            const now = new Date();
            d.creditLineApprovalLog = d.creditLineApprovalLog || [];
            d.creditLineApprovalLog.unshift({
              id: 'CLOG-' + Date.now(), creditLineId: '-', tenantId: req.tenantId, tenantName: req.tenantName,
              action: 'Rejected', detail: 'ปฏิเสธคำขอวงเงิน ' + d.formatCurrency(req.requestedLimit) + ' — เหตุผล: ' + reason,
              actionBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), actionDate: now.toISOString().slice(0,10), actionTime: now.toTimeString().slice(0,5),
            });
            d.creditLineRequests = (d.creditLineRequests || []).filter(r => r.id !== req.id);
            App.closeModal();
            App.toast('ปฏิเสธคำขอวงเงินแล้ว','error');
            self._rerender('credit');
          });
        }, 50);
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
                <span class="chip ${ref.superAdminApproved ? 'chip-green' : 'chip-gray'}"><i class="fa-solid fa-crown"></i> Owner ${ref.superAdminApproved ? '✓' : '✗'}</span>
                <span class="chip ${ref.financeApproved ? 'chip-green' : 'chip-gray'}"><i class="fa-solid fa-coins"></i> Finance ${ref.financeApproved ? '✓' : '✗'}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">อนุมัติในฐานะ</label>
              <select id="refund-role" class="form-input">
                ${!ref.superAdminApproved ? '<option value="superAdmin">Owner</option>' : ''}
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

    // Credit Line: Edit existing
    document.querySelectorAll('.cl-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cl = (d.creditLines || []).find(c => c.id === btn.dataset.id);
        if (!cl) return;
        App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">แก้ไข Credit Line</div>
            <div class="modal-subtitle mb-16">${cl.tenantName} · ${cl.id}</div>
            <div class="form-group">
              <label class="form-label">วงเงินสูงสุด (THB)</label>
              <input type="number" id="cl-edit-limit" class="form-input" value="${cl.creditLimit}" min="1">
            </div>
            <div class="grid-2 gap-12">
              <div class="form-group">
                <label class="form-label">รอบบิล (วัน)</label>
                <select id="cl-edit-cycle" class="form-input">
                  <option value="15" ${cl.billingCycle===15?'selected':''}>15 วัน</option>
                  <option value="30" ${cl.billingCycle===30?'selected':''}>30 วัน</option>
                  <option value="60" ${cl.billingCycle===60?'selected':''}>60 วัน</option>
                  <option value="90" ${cl.billingCycle===90?'selected':''}>90 วัน</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">เงื่อนไขการชำระ</label>
                <select id="cl-edit-terms" class="form-input">
                  <option value="Net 15" ${cl.paymentTerms==='Net 15'?'selected':''}>Net 15</option>
                  <option value="Net 30" ${cl.paymentTerms==='Net 30'?'selected':''}>Net 30</option>
                  <option value="Net 60" ${cl.paymentTerms==='Net 60'?'selected':''}>Net 60</option>
                  <option value="Net 90" ${cl.paymentTerms==='Net 90'?'selected':''}>Net 90</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">สถานะ</label>
              <select id="cl-edit-status" class="form-input">
                <option value="Active" ${cl.status==='Active'?'selected':''}>ใช้งาน</option>
                <option value="Suspended" ${cl.status==='Suspended'?'selected':''}>ระงับ</option>
              </select>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="cl-edit-save"><i class="fa-solid fa-save"></i> บันทึก</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('cl-edit-save')?.addEventListener('click', () => {
            const newLimit = parseFloat(document.getElementById('cl-edit-limit').value);
            if (!newLimit || newLimit <= 0) { App.toast('กรุณากรอกวงเงิน','error'); return; }
            const oldLimit = cl.creditLimit;
            const oldCycle = cl.billingCycle;
            const oldTerms = cl.paymentTerms;
            const oldStatus = cl.status;
            cl.creditLimit    = newLimit;
            cl.availableCredit = newLimit - cl.usedAmount;
            cl.billingCycle   = parseInt(document.getElementById('cl-edit-cycle').value);
            cl.paymentTerms   = document.getElementById('cl-edit-terms').value;
            cl.status         = document.getElementById('cl-edit-status').value;
            cl.modifiedDate   = new Date().toISOString().slice(0,10);
            cl.modifiedBy     = ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system');
            // Build change detail
            const changes = [];
            if (oldLimit !== cl.creditLimit) changes.push('วงเงิน ' + d.formatCurrency(oldLimit) + ' → ' + d.formatCurrency(cl.creditLimit));
            if (oldCycle !== cl.billingCycle) changes.push('รอบบิล ' + oldCycle + ' → ' + cl.billingCycle + ' วัน');
            if (oldTerms !== cl.paymentTerms) changes.push('เงื่อนไข ' + oldTerms + ' → ' + cl.paymentTerms);
            if (oldStatus !== cl.status) changes.push('สถานะ ' + oldStatus + ' → ' + cl.status);
            const logAction = cl.status !== oldStatus && cl.status === 'Suspended' ? 'Suspended' : 'Edited';
            const now = new Date();
            d.creditLineApprovalLog = d.creditLineApprovalLog || [];
            d.creditLineApprovalLog.unshift({
              id: 'CLOG-' + Date.now(), creditLineId: cl.id, tenantId: cl.tenantId, tenantName: cl.tenantName,
              action: logAction, detail: changes.length ? changes.join(' · ') : 'ไม่มีการเปลี่ยนแปลง',
              actionBy: ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'), actionDate: now.toISOString().slice(0,10), actionTime: now.toTimeString().slice(0,5),
            });
            // Sync to dpTenants if Developer Portal
            if (cl.source === 'Developer Portal') {
              const dpt = (d.dpTenants || []).find(t => t.id === cl.tenantId);
              if (dpt && dpt.creditLine) {
                dpt.creditLine.creditLimit = cl.creditLimit;
                dpt.creditLine.availableCredit = cl.availableCredit;
                dpt.creditLine.billingCycle = cl.billingCycle;
                dpt.creditLine.paymentTerms = cl.paymentTerms;
                dpt.creditLine.status = cl.status;
              }
            }
            App.closeModal();
            App.toast('บันทึก Credit Line สำเร็จ','success');
            self._rerender('credit');
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
    const scopedTid         = window.Auth ? Auth.scopedTenantId() : null;
    const agingReport       = scopedTid ? (d.agingReport || []).filter(r => r.tenantId === scopedTid) : (d.agingReport || []);
    const collectionNotices = scopedTid ? (d.collectionNotices || []).filter(n => n.tenantId === scopedTid) : (d.collectionNotices || []);

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
                <tr><th>TENANT</th><th>ยอดค้างชำระ</th><th>จำนวนวัน</th><th>Invoice ที่ค้าง</th><th>แจ้งเตือนล่าสุด</th><th>สถานะเครดิต</th><th>แก้ไขล่าสุด</th><th>จัดการ</th></tr>
              </thead>
              <tbody>
                ${agingReport.map(row => `<tr>
                    <td class="font-600">${row.tenantName}</td>
                    <td class="mono font-600 text-error">${d.formatCurrency(row.totalOverdue)}</td>
                    <td><span class="chip ${row.daysOverdue > 30 ? 'chip-red' : row.daysOverdue > 14 ? 'chip-orange' : 'chip-yellow'}">${row.daysOverdue} วัน</span></td>
                    <td class="mono text-sm">${(row.invoiceIds || []).map(id => `<a href="#" class="text-primary invoice-link" data-id="${id}" style="text-decoration:underline;">${id}</a>`).join(', ') || row.invoiceCount + ' รายการ'}</td>
                    <td class="text-sm text-muted">${row.lastNotice || '-'}</td>
                    <td>${d.statusChip(row.creditStatus)}</td>
                    <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${row.modifiedDate || '-'}</div>${row.modifiedBy ? `<div class="text-xs text-dim">${row.modifiedBy.split('@')[0]}</div>` : ''}</td>
                    <td style="white-space:nowrap;">
                      <div class="flex items-center gap-6">
                        ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-primary btn-sm send-notice-btn" data-id="${row.tenantId}"><i class="fa-solid fa-envelope"></i> ติดตามหนี้</button>` : ''}
                        ${row.creditStatus !== 'Suspended' && (!window.Auth || Auth.hasPermission('canEdit'))
                          ? `<button class="btn btn-danger btn-sm suspend-tenant-btn" data-id="${row.tenantId}"><i class="fa-solid fa-ban"></i> ระงับ</button>`
                          : ''}
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <div class="divider mb-16"></div>
          <div class="section-title mb-12"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติการติดตามหนี้</div>
          ${collectionNotices.length === 0
            ? '<div class="text-sm text-muted">ยังไม่มีประวัติการติดตาม</div>'
            : `<div class="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>TENANT</th><th>Invoice</th><th>จำนวน</th><th>วันที่ส่ง</th><th>ช่องทาง</th><th>รายละเอียด</th><th>ผู้ดำเนินการ</th><th>สถานะ</th></tr></thead>
                  <tbody>
                    ${collectionNotices.map(cn => `<tr>
                        <td class="mono text-sm">${cn.id}</td>
                        <td class="font-600">${cn.tenantName}</td>
                        <td class="mono text-sm">${cn.invoiceId || '-'}</td>
                        <td class="mono font-600">${d.formatCurrency(cn.amount)}</td>
                        <td class="text-sm text-muted" style="white-space:nowrap;">${cn.sentDate}<br><span class="text-xs">${cn.sentTime || ''}</span></td>
                        <td class="text-sm">${cn.channel}</td>
                        <td class="text-sm">${cn.detail || '-'}</td>
                        <td class="text-sm text-muted">${cn.modifiedBy ? cn.modifiedBy.split('@')[0] : '-'}</td>
                        <td>${d.statusChip(cn.status)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>`}
        `}
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.billingOverdue;

    // Invoice link — navigate to billing tab and highlight
    document.querySelectorAll('.invoice-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        location.hash = 'billing';
        setTimeout(() => {
          const search = document.getElementById('inv-filter-search');
          if (search) { search.value = a.dataset.id; search.dispatchEvent(new Event('input')); }
        }, 150);
      });
    });

    document.querySelectorAll('.send-notice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tenantId = btn.dataset.id;
        const row      = (d.agingReport || []).find(r => r.tenantId === tenantId);
        if (!row) return;
        const meta = d.tenantMeta?.[tenantId] || {};
        const tenant = (d.tenants || []).find(t => t.id === tenantId);
        const tEmail = tenant?.email || '-';
        const tPhone = tenant?.phone || '-';
        App.showModal(`
          <div class="modal" style="max-width:520px;">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-8">ติดตามหนี้ / ส่งใบทวงหนี้</div>
            <div class="text-sm text-muted mb-12">
              Tenant: <strong>${row.tenantName}</strong><br>
              ยอดค้างชำระ: <strong class="text-error">${d.formatCurrency(row.totalOverdue)}</strong> (ค้างมา ${row.daysOverdue} วัน)
              ${row.creditStatus === 'Suspended' ? '<br><span class="chip chip-red" style="font-size:10px;margin-top:4px;"><i class="fa-solid fa-ban"></i> Tenant ถูกระงับแล้ว</span>' : ''}
            </div>
            <div class="card p-12 mb-12" style="background:var(--surface2);border-radius:8px;">
              <div class="text-xs text-muted uppercase mb-6">ข้อมูลติดต่อ Tenant</div>
              <div class="flex-col gap-4 text-sm">
                <div><i class="fa-solid fa-user" style="width:16px;text-align:center;"></i> ${meta.contactPerson || '-'}</div>
                <div><i class="fa-solid fa-envelope" style="width:16px;text-align:center;"></i> ${tEmail}</div>
                <div><i class="fa-solid fa-phone" style="width:16px;text-align:center;"></i> ${tPhone}</div>
              </div>
            </div>
            <div class="form-group mb-12">
              <label class="form-label">ช่องทางการติดตาม <span class="text-error">*</span></label>
              <div class="flex-col gap-6" id="notice-channels">
                <label class="flex items-center gap-8" style="cursor:pointer;"><input type="checkbox" value="Email (${tEmail})" ${tEmail !== '-' ? 'checked' : 'disabled'}> <i class="fa-solid fa-envelope text-primary" style="width:16px;text-align:center;"></i> Email <span class="text-xs text-muted">${tEmail}</span></label>
                <label class="flex items-center gap-8" style="cursor:pointer;"><input type="checkbox" value="โทรศัพท์ (${tPhone})" ${tPhone !== '-' ? '' : 'disabled'}> <i class="fa-solid fa-phone text-success" style="width:16px;text-align:center;"></i> โทรศัพท์ <span class="text-xs text-muted">${tPhone}</span></label>
                <label class="flex items-center gap-8" style="cursor:pointer;"><input type="checkbox" value="จดหมายทางการ"> <i class="fa-solid fa-file-signature text-warning" style="width:16px;text-align:center;"></i> จดหมายทางการ</label>
              </div>
            </div>
            <div class="form-group mb-12">
              <label class="form-label">รายละเอียดการติดตาม</label>
              <textarea id="notice-detail" class="form-input" rows="3" placeholder="เช่น นัดชำระภายในวันที่..., ขอผ่อนชำระ, ติดต่อไม่ได้..."></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="notice-confirm-btn"><i class="fa-solid fa-paper-plane"></i> ยืนยันส่ง</button>
            </div>
          </div>`);
        setTimeout(() => {
          document.getElementById('notice-confirm-btn')?.addEventListener('click', () => {
            const checks = document.querySelectorAll('#notice-channels input[type=checkbox]:checked');
            if (checks.length === 0) { App.toast('กรุณาเลือกช่องทางการติดตามอย่างน้อย 1 ช่องทาง','error'); return; }
            const channels = [...checks].map(c => c.value).join(' + ');
            const detail = document.getElementById('notice-detail')?.value.trim() || '';
            const today = new Date('2026-03-03');
            const todayStr = today.toISOString().slice(0,10);
            const actor = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
            d.collectionNotices = d.collectionNotices || [];
            // Always append new record (history log, not upsert)
            d.collectionNotices.push({
              id: 'CN-' + Date.now(), tenantId, tenantName: row.tenantName,
              invoiceId: (row.invoiceIds || [])[0] || '-', amount: row.totalOverdue,
              sentDate: todayStr, sentTime: today.toTimeString().slice(0,5), channel: channels, detail,
              status: 'Sent', modifiedDate: todayStr, modifiedBy: actor,
            });
            row.lastNotice = todayStr;
            row.modifiedDate = todayStr;
            row.modifiedBy = actor;
            App.closeModal();
            App.toast(`ส่งใบทวงหนี้ให้ ${row.tenantName} ผ่าน ${channels} สำเร็จ`, 'success');
            self._rerender();
          });
        }, 50);
      });
    });

    // Suspend tenant from overdue report
    document.querySelectorAll('.suspend-tenant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tenantId = btn.dataset.id;
        const row = (d.agingReport || []).find(r => r.tenantId === tenantId);
        if (!row) return;
        App.showModal(`
          <div class="modal" style="max-width:480px;">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title mb-4" style="color:var(--error);"><i class="fa-solid fa-ban"></i> ระงับการใช้งาน Tenant</div>
            <div class="text-sm text-muted mb-16">
              Tenant: <strong>${row.tenantName}</strong><br>
              ยอดค้างชำระ: <strong class="text-error">${d.formatCurrency(row.totalOverdue)}</strong> (ค้างมา ${row.daysOverdue} วัน)
            </div>
            <div class="card p-16 mb-16" style="border-left:3px solid var(--error);background:rgba(239,68,68,0.06);">
              <div class="text-sm"><i class="fa-solid fa-triangle-exclamation text-error"></i> การระงับจะทำให้ Tenant ไม่สามารถใช้บริการได้จนกว่าจะชำระยอดค้าง</div>
            </div>
            <div class="form-group">
              <label class="form-label">เหตุผลในการระงับ <span class="text-error">*</span></label>
              <select id="suspend-reason-select" class="form-input mb-8">
                <option value="">— เลือกเหตุผล —</option>
                <option value="ค้างชำระเกินกำหนด">ค้างชำระเกินกำหนด</option>
                <option value="ไม่ตอบสนองใบทวงหนี้">ไม่ตอบสนองใบทวงหนี้</option>
                <option value="ละเมิดเงื่อนไขการใช้งาน">ละเมิดเงื่อนไขการใช้งาน</option>
                <option value="other">อื่นๆ (ระบุ)</option>
              </select>
              <textarea id="suspend-reason-text" class="form-input" rows="2" placeholder="รายละเอียดเพิ่มเติม..." style="display:none;"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-danger" id="suspend-confirm-btn"><i class="fa-solid fa-ban"></i> ยืนยันระงับ</button>
            </div>
          </div>`);
        setTimeout(() => {
          const selEl = document.getElementById('suspend-reason-select');
          const txtEl = document.getElementById('suspend-reason-text');
          selEl?.addEventListener('change', () => {
            txtEl.style.display = selEl.value === 'other' ? '' : 'none';
            if (selEl.value !== 'other') txtEl.value = '';
          });
          document.getElementById('suspend-confirm-btn')?.addEventListener('click', () => {
            const selVal = selEl.value;
            const txtVal = txtEl.value.trim();
            const reason = selVal === 'other' ? txtVal : selVal;
            if (!reason) { App.toast('กรุณาระบุเหตุผลในการระงับ','error'); return; }
            const now = new Date();
            const dateStr = now.toISOString().slice(0,10);
            const timeStr = now.toTimeString().slice(0,5);
            const actor = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';

            // Update aging report
            row.creditStatus = 'Suspended';
            row.modifiedDate = dateStr;
            row.modifiedBy = actor;

            // Update tenant status
            const tenant = (d.tenants || []).find(t => t.id === tenantId);
            if (tenant) { tenant.status = 'Suspended'; }

            // Update credit line status
            const cl = (d.creditLines || []).find(c => c.tenantId === tenantId);
            if (cl) { cl.status = 'Suspended'; }

            // Log to approval log
            d.creditLineApprovalLog = d.creditLineApprovalLog || [];
            d.creditLineApprovalLog.unshift({
              id: 'CLOG-' + Date.now(), creditLineId: cl ? cl.id : '-', tenantId, tenantName: row.tenantName,
              action: 'Suspended', detail: 'ระงับ Tenant เนื่องจากค้างชำระ — ' + reason,
              actionBy: actor, actionDate: dateStr, actionTime: timeStr,
            });

            App.closeModal();
            App.toast(`ระงับ ${row.tenantName} สำเร็จ`, 'error');
            self._rerender();
          });
        }, 50);
      });
    });
  },
};
