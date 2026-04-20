/* ================================================================
   Cost — Settlement Log (Full Page with Pagination)
   ================================================================ */

(function () {
  'use strict';

  const PAGE_SIZE = 20;

  window.Pages = window.Pages || {};
  window.Pages.costSettlementLog = {

    _page: 1,
    _filterTenant: '',
    _dateFrom: '',
    _dateTo: '',
    _search: '',

    _getFiltered() {
      const d = window.MockData;
      let list = (d.settlements || []).slice();

      // Search by sessionId or settlementId
      if (this._search) {
        const q = this._search.toLowerCase();
        list = list.filter(s =>
          s.sessionId.toLowerCase().includes(q) ||
          s.settlementId.toLowerCase().includes(q)
        );
      }

      // Filter by tenant
      if (this._filterTenant) {
        list = list.filter(s => s.tenantId === this._filterTenant);
      }

      // Filter by date range
      if (this._dateFrom) {
        list = list.filter(s => s.date >= this._dateFrom);
      }
      if (this._dateTo) {
        list = list.filter(s => s.date <= this._dateTo);
      }

      // Sort newest first
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return list;
    },

    render() {
      const d = window.MockData;
      const settlements = d.settlements || [];

      // Unique tenants & dates for filters
      const tenantMap = {};
      settlements.forEach(s => {
        tenantMap[s.tenantId] = s.tenantName;
      });
      const tenants = Object.entries(tenantMap).sort((a, b) => a[1].localeCompare(b[1]));

      const filtered = this._getFiltered();
      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (this._page > totalPages) this._page = totalPages;
      const start = (this._page - 1) * PAGE_SIZE;
      const pageItems = filtered.slice(start, start + PAGE_SIZE);

      // Summary stats
      const totalCost = filtered.reduce((s, x) => s + x.summary.totalCost, 0);
      const totalSell = filtered.reduce((s, x) => s + x.summary.totalSell, 0);
      const totalProfit = filtered.reduce((s, x) => s + x.summary.profit, 0);
      const totalTokens = filtered.reduce((s, x) => s + x.summary.tokensToDeduct, 0);
      const avgMargin = totalSell > 0 ? ((1 - totalCost / totalSell) * 100) : 0;

      return `
      <div class="page-header mb-20">
        <div>
          <div class="heading"><i class="fa-solid fa-scroll"></i> Settlement Log</div>
          <div class="text-sm text-muted">ประวัติการคำนวณต้นทุน-ราคาขายทุก Session — คลิกแถวเพื่อดู breakdown</div>
        </div>
        <div class="flex gap-8">
          <a href="#cost-pricing" class="btn btn-outline btn-sm"><i class="fa-solid fa-arrow-left"></i> กลับ Cost Config</a>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid-4 gap-12 mb-20">
        <div class="card p-16" style="text-align:center;">
          <div class="text-xs text-muted mb-4">Sessions</div>
          <div class="mono font-700" style="font-size:22px;">${d.formatNumber(filtered.length)}</div>
        </div>
        <div class="card p-16" style="text-align:center;">
          <div class="text-xs text-muted mb-4">ต้นทุนรวม</div>
          <div class="mono font-700" style="font-size:22px;color:var(--error);">${totalCost.toFixed(2)}</div>
        </div>
        <div class="card p-16" style="text-align:center;">
          <div class="text-xs text-muted mb-4">รายรับรวม</div>
          <div class="mono font-700" style="font-size:22px;color:var(--primary);">${totalSell.toFixed(2)}</div>
        </div>
        <div class="card p-16" style="text-align:center;">
          <div class="text-xs text-muted mb-4">กำไรรวม (${avgMargin.toFixed(1)}%)</div>
          <div class="mono font-700" style="font-size:22px;color:var(--success);">${totalProfit.toFixed(2)}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-16 mb-16">
        <div class="flex items-center gap-12 flex-wrap">
          <div class="flex items-center gap-6">
            <i class="fa-solid fa-magnifying-glass text-muted text-sm"></i>
            <input type="text" id="stl-search" class="form-input" placeholder="ค้นหา Session ID / Settlement ID..." value="${this._search}" style="width:260px;padding:8px 12px;font-size:13px;">
          </div>
          <div class="flex items-center gap-6">
            <span class="text-xs text-muted">Tenant:</span>
            <select id="stl-filter-tenant" class="form-input" style="width:180px;padding:8px 12px;font-size:13px;">
              <option value="">ทั้งหมด</option>
              ${tenants.map(([id, name]) => `<option value="${id}" ${this._filterTenant === id ? 'selected' : ''}>${name}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-center gap-6">
            <span class="text-xs text-muted">จาก:</span>
            <input type="date" id="stl-date-from" class="form-input" value="${this._dateFrom}" style="width:150px;padding:8px 12px;font-size:13px;">
          </div>
          <div class="flex items-center gap-6">
            <span class="text-xs text-muted">ถึง:</span>
            <input type="date" id="stl-date-to" class="form-input" value="${this._dateTo}" style="width:150px;padding:8px 12px;font-size:13px;">
          </div>
          <button class="btn btn-outline btn-sm" id="stl-clear-filters"><i class="fa-solid fa-rotate-left"></i> ล้าง</button>
          <div class="text-xs text-muted" style="margin-left:auto;">แสดง ${pageItems.length} จาก ${filtered.length} รายการ</div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrap mb-16">
        <table>
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Session ID</th>
              <th>Tenant</th>
              <th>Sub-Platform</th>
              <th>วันที่</th>
              <th>ต้นทุนรวม</th>
              <th>ราคาขายรวม</th>
              <th>Token หัก</th>
              <th>กำไร (THB)</th>
              <th>Margin%</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.length === 0 ? `
              <tr><td colspan="10" style="text-align:center;padding:32px;" class="text-muted">ไม่พบข้อมูล Settlement</td></tr>
            ` : pageItems.map(stl => `
              <tr class="stl-row" data-settlement-id="${stl.settlementId}" style="cursor:pointer;">
                <td class="mono text-xs text-muted">${stl.settlementId}</td>
                <td class="mono text-primary font-600" title="${stl.sessionId}">${stl.sessionId.substring(0, 10)}...</td>
                <td class="font-600">${stl.tenantName}</td>
                <td><span class="chip chip-gray text-xs">${stl.subPlatform}</span></td>
                <td class="mono text-sm">${stl.date}</td>
                <td class="mono" style="color:var(--error);">${stl.summary.totalCost.toFixed(2)}</td>
                <td class="mono" style="color:var(--primary);">${stl.summary.totalSell.toFixed(2)}</td>
                <td class="mono font-600">${stl.summary.tokensToDeduct.toFixed(3)}</td>
                <td class="mono font-700" style="color:var(--success);">${stl.summary.profit.toFixed(2)}</td>
                <td><span class="chip ${stl.summary.blendedMargin >= 30 ? 'chip-green' : 'chip-orange'} text-xs mono">${stl.summary.blendedMargin.toFixed(1)}%</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      ${totalPages > 1 ? `
      <div class="flex items-center justify-center gap-8 mb-24">
        <button class="btn btn-outline btn-sm" id="stl-prev" ${this._page <= 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>
        <span class="mono text-sm">หน้า ${this._page} / ${totalPages}</span>
        <button class="btn btn-outline btn-sm" id="stl-next" ${this._page >= totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      ` : ''}
    `;
    },

    _rerender() {
      const content = document.getElementById('content');
      if (content) {
        content.innerHTML = this.render();
        this.init();
      }
    },

    init() {
      const self = this;
      const d = window.MockData;

      // Search
      const searchEl = document.getElementById('stl-search');
      if (searchEl) {
        let debounce;
        searchEl.addEventListener('input', () => {
          clearTimeout(debounce);
          debounce = setTimeout(() => {
            self._search = searchEl.value.trim();
            self._page = 1;
            self._rerender();
          }, 300);
        });
      }

      // Filter tenant
      const tenantEl = document.getElementById('stl-filter-tenant');
      if (tenantEl) {
        tenantEl.addEventListener('change', () => {
          self._filterTenant = tenantEl.value;
          self._page = 1;
          self._rerender();
        });
      }

      // Filter date range
      const dateFromEl = document.getElementById('stl-date-from');
      const dateToEl = document.getElementById('stl-date-to');
      if (dateFromEl) {
        dateFromEl.addEventListener('change', () => {
          self._dateFrom = dateFromEl.value;
          self._page = 1;
          self._rerender();
        });
      }
      if (dateToEl) {
        dateToEl.addEventListener('change', () => {
          self._dateTo = dateToEl.value;
          self._page = 1;
          self._rerender();
        });
      }

      // Clear filters
      const clearBtn = document.getElementById('stl-clear-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          self._search = '';
          self._filterTenant = '';
          self._dateFrom = '';
          self._dateTo = '';
          self._page = 1;
          self._rerender();
        });
      }

      // Pagination
      const prevBtn = document.getElementById('stl-prev');
      const nextBtn = document.getElementById('stl-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (self._page > 1) { self._page--; self._rerender(); }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          self._page++;
          self._rerender();
        });
      }

      // Row click — show breakdown modal
      document.querySelectorAll('.stl-row').forEach(row => {
        row.addEventListener('click', () => {
          const stlId = row.dataset.settlementId;
          const settlements = d.settlements || [];
          const stl = settlements.find(s => s.settlementId === stlId);
          if (!stl) return;

          const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
          const dt = new Date(stl.createdAt);
          const thaiDate = dt.getDate() + ' ' + thaiMonths[dt.getMonth()] + ' ' + (dt.getFullYear() + 543) + ' เวลา ' + String(dt.getHours()).padStart(2,'0') + ':' + String(dt.getMinutes()).padStart(2,'0');

          const categoryChip = (cat) => {
            const colors = { TEXT: 'chip-blue', AUDIO: 'chip-orange', VIDEO: 'chip-purple' };
            return '<span class="chip ' + (colors[cat] || 'chip-gray') + ' text-xs">' + (cat || '-') + '</span>';
          };

          window.App.showModal(`
            <div class="modal modal-wide">
              <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
              <div class="modal-title heading">รายละเอียดการคำนวณ (Settlement Breakdown)</div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;margin-bottom:20px;">
                <div>
                  <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">Session ID</div>
                  <div class="mono font-600 text-sm flex items-center gap-6">${stl.sessionId} <button class="btn-icon" onclick="navigator.clipboard.writeText('${stl.sessionId}');App.toast('Copied!','success')" title="Copy"><i class="fa-regular fa-copy" style="font-size:12px;opacity:0.5;cursor:pointer;"></i></button></div>
                </div>
                <div>
                  <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">ลูกค้า (Tenant)</div>
                  <div class="font-600">${stl.tenantName}</div>
                </div>
                <div>
                  <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">Sub-Platform</div>
                  <div><span class="chip chip-gray text-xs font-600" style="text-transform:uppercase;">${stl.subPlatform}</span></div>
                </div>
                <div>
                  <div class="text-xs text-muted mb-4" style="text-transform:uppercase;">วันที่</div>
                  <div class="font-600">${thaiDate}</div>
                </div>
              </div>

              ${(() => {
                const resolved = d.resolveSnapshotForTenant(stl.tenantId, stl.date);
                if (resolved) {
                  return `<div class="card p-12 mb-20" style="background:var(--surface2);border-left:3px solid var(--primary);">
                    <div class="flex items-center gap-12">
                      <i class="fa-solid fa-camera" style="color:var(--primary);"></i>
                      <div class="flex-1">
                        <div class="text-xs text-muted uppercase">Snapshot ใช้ ณ วันที่ settlement</div>
                        <div class="font-600 text-sm" style="cursor:pointer;text-decoration:underline;" onclick="App.closeModal();setTimeout(()=>{App.navigate('cost-snapshots');setTimeout(()=>window.Pages.snapshots._showDetail('${resolved.id}'),200)},100);">${resolved.name} <span class="mono text-xs text-dim">(${resolved.id})</span></div>
                      </div>
                      <div class="flex gap-6">${d.snapshotStatusChip(resolved)}<span class="chip chip-blue">${resolved.services.length} svc frozen</span></div>
                    </div>
                  </div>`;
                }
                return `<div class="card p-12 mb-20" style="background:var(--surface2);border-left:3px solid #6b7280;">
                  <div class="flex items-center gap-12">
                    <i class="fa-solid fa-bolt" style="color:#6b7280;"></i>
                    <div class="flex-1">
                      <div class="text-xs text-muted uppercase">ใช้ Live Price ณ วันที่ settlement</div>
                      <div class="font-600 text-sm">💱 Live (cost × live margin) — ไม่มี Snapshot active สำหรับ tenant นี้</div>
                    </div>
                  </div>
                </div>`;
              })()}

              <div class="grid-4 gap-12 mb-20">
                <div class="card p-12">
                  <div class="text-xs text-muted mb-4">ต้นทุนรวม (TOTAL COST)</div>
                  <div class="mono font-700" style="font-size:18px;color:var(--error);">\u0E3F${stl.summary.totalCost.toFixed(4)}</div>
                </div>
                <div class="card p-12">
                  <div class="text-xs text-muted mb-4">รายรับรวม (TOTAL SELL)</div>
                  <div class="mono font-700" style="font-size:18px;">\u0E3F${stl.summary.totalSell.toFixed(4)}</div>
                </div>
                <div class="card p-12">
                  <div class="text-xs text-muted mb-4">TOKEN หัก (TOKENS DEDUCTED)</div>
                  <div class="mono font-700" style="font-size:18px;">${stl.summary.tokensToDeduct.toFixed(4)}</div>
                </div>
                <div class="card p-12">
                  <div class="text-xs text-muted mb-4">กำไร (PROFIT)</div>
                  <div class="mono font-700" style="font-size:18px;color:var(--success);">\u0E3F${stl.summary.profit.toFixed(4)}</div>
                  <div class="text-xs text-muted">Margin ${stl.summary.blendedMargin.toFixed(2)}%</div>
                </div>
              </div>

              <div class="font-600 mb-8">รายละเอียดตามบริการ (Breakdown by Service)</div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>บริการ</th>
                      <th>หมวด</th>
                      <th>Variant</th>
                      <th>จำนวน</th>
                      <th>ต้นทุน/หน่วย</th>
                      <th>Margin%</th>
                      <th>ราคา/หน่วย</th>
                      <th>ต้นทุนรวม</th>
                      <th>รายรับรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stl.breakdown.map(b => `
                      <tr>
                        <td class="mono text-sm font-600">${b.serviceCode}</td>
                        <td>${categoryChip(b.category)}</td>
                        <td><span class="chip chip-gray text-xs">${b.type.toUpperCase()}</span></td>
                        <td class="mono">${d.formatNumber(b.quantity)}</td>
                        <td class="mono text-sm">${b.costPerUnit.toFixed(4)}</td>
                        <td class="mono font-600">${(b.effectiveMargin * 100).toFixed(0)}%</td>
                        <td class="mono text-sm">${b.sellPerUnit.toFixed(4)}</td>
                        <td class="mono" style="color:var(--error);">${b.totalCost.toFixed(4)}</td>
                        <td class="mono" style="color:var(--primary);">${b.totalSell.toFixed(4)}</td>
                      </tr>
                    `).join('')}
                    <tr style="border-top:2px solid var(--border);font-weight:700;">
                      <td colspan="7" style="text-align:right;" class="text-muted">รวมทั้งหมด (TOTAL)</td>
                      <td class="mono" style="color:var(--error);">${stl.summary.totalCost.toFixed(4)}</td>
                      <td class="mono" style="color:var(--primary);">${stl.summary.totalSell.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="modal-actions">
                <button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>
              </div>
            </div>
          `);
        });
      });
    },

    cleanup() {
      this._page = 1;
      this._filterTenant = '';
      this._dateFrom = '';
      this._dateTo = '';
      this._search = '';
    }
  };
})();
