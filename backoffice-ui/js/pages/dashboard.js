/* ================================================================
   Page Module — Platform Dashboard (Central Backoffice)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.dashboard = {
  render() {
    const d = window.MockData;
    const s = d.stats;
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    // Tenant scoping — Tenant Admin sees only their tenant data; Owner (super_admin) sees all
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;

    // Scoped data sources
    const invoices          = scopedTid ? d.invoices.filter(i => i.tenantId === scopedTid) : d.invoices;
    const creditLineReqs    = scopedTid ? (d.creditLineRequests || []).filter(r => r.tenantId === scopedTid) : (d.creditLineRequests || []);
    const refundReqs        = scopedTid ? (d.refundRequests || []).filter(r => r.tenantId === scopedTid) : (d.refundRequests || []);
    const scopedTenants     = scopedTid ? d.tenants.filter(t => t.id === scopedTid) : d.tenants;

    // Plan distribution from tenants sample
    const planCounts = { Pro: 0, Starter: 0, Free: 0 };
    scopedTenants.forEach(t => { if (planCounts[t.plan] !== undefined) planCounts[t.plan]++; });

    // Action items
    const overdueInvoices  = invoices.filter(inv => inv.status === 'Overdue');
    const pendingVerif     = invoices.filter(inv => inv.status === 'Pending Verification');
    const pendingCL        = creditLineReqs.filter(r => r.status === 'Pending');
    const pendingRefunds   = refundReqs.filter(r => r.status.includes('Pending'));
    const pendingDpApps    = (d.dpApps || []).filter(a => a.status === 'pending_approval');
    const totalActions     = overdueInvoices.length + pendingVerif.length + pendingCL.length + pendingRefunds.length + pendingDpApps.length;

    const activeSPs = d.subPlatforms.filter(sp => sp.status === 'Active').length;

    // Developer Portal stats
    const dpS = d.dpStats;
    const dpCreditPct = dpS.totalCreditLimit ? Math.round(dpS.totalCreditUsed / dpS.totalCreditLimit * 100) : 0;

    // Combined revenue (paid invoices from all sources)
    const totalPaidRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);

    // Combined tenant count — scoped shows only the 1 tenant
    const totalTenantsAll  = scopedTid ? 1 : s.totalTenants + dpS.activeTenants;
    const activeTenantsAll = scopedTid ? 1 : s.activeTenants + dpS.activeTenants;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">PLATFORM DASHBOARD</h1>
        <div class="flex items-center gap-12">
          <span class="text-sm text-muted"><i class="fa-solid fa-calendar-day"></i> ${today}</span>
          <button class="btn btn-outline btn-sm" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> รีเฟรช</button>
        </div>
      </div>

      <!-- Stat Row: 4 KPI cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Sub-Platforms</span>
            <div class="stat-icon blue"><i class="fa-solid fa-layer-group"></i></div>
          </div>
          <div class="stat-value mono">${d.subPlatforms.length}</div>
          <div class="stat-change up">${activeSPs} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Tenant ทั้งหมด</span>
            <div class="stat-icon green"><i class="fa-solid fa-building"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(totalTenantsAll)}</div>
          <div class="stat-change up">${activeTenantsAll} Active · ${s.suspendedTenants} Suspended</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">รายได้รายเดือน</span>
            <div class="stat-icon orange"><i class="fa-solid fa-baht-sign"></i></div>
          </div>
          <div class="stat-value mono">${d.formatCurrency(totalPaidRevenue)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> +12% จากเดือนที่แล้ว</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">รอดำเนินการ</span>
            <div class="stat-icon ${totalActions > 0 ? 'red' : 'green'}"><i class="fa-solid fa-bell"></i></div>
          </div>
          <div class="stat-value mono ${totalActions > 0 ? 'text-error' : 'text-success'}">${totalActions}</div>
          <div class="stat-change ${totalActions > 0 ? 'down' : 'up'}">${totalActions > 0 ? 'รายการต้องตรวจสอบ' : 'ทุกอย่างเรียบร้อย'}</div>
        </div>
      </div>

      <!-- Action Items (moved to top — alerts need immediate attention) -->
      <div class="section-title">
        <i class="fa-solid fa-${totalActions > 0 ? 'triangle-exclamation text-error' : 'circle-check text-success'}"></i>
        รายการที่ต้องดำเนินการ
        ${totalActions > 0 ? `<span class="chip chip-red" style="margin-left:8px;">${totalActions}</span>` : ''}
      </div>
      <div class="card-accent mb-24">
        ${totalActions === 0 ? `
          <div class="empty-state">
            <i class="fa-solid fa-circle-check" style="color:var(--success)"></i>
            <p>ไม่มีรายการค้างอยู่</p>
          </div>
        ` : `<div class="flex-col gap-10">

          ${overdueInvoices.length > 0 ? `
            <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;border-left:3px solid var(--error);">
              <div class="flex items-center gap-10">
                <i class="fa-solid fa-circle-xmark text-error"></i>
                <div>
                  <div class="font-600 text-sm">Invoice เกินกำหนดชำระ${overdueInvoices.length > 1 ? ` <span class="text-muted font-400">(+${overdueInvoices.length - 1} รายการ)</span>` : ''}</div>
                  <div class="text-xs text-muted">${overdueInvoices[0].tenantName} · ${overdueInvoices[0].id} · ค้างมา ${d.agingReport?.find(a => a.tenantId === overdueInvoices[0].tenantId)?.daysOverdue ?? '—'} วัน</div>
                </div>
              </div>
              <div class="flex items-center gap-12">
                <span class="mono text-sm text-error font-600">${d.formatCurrency(overdueInvoices[0].total)}</span>
                <button class="btn btn-sm btn-outline" onclick="location.hash='billing'">ดูรายละเอียด</button>
              </div>
            </div>
          ` : ''}

          ${pendingVerif.length > 0 ? `
            <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;border-left:3px solid var(--warning);">
              <div class="flex items-center gap-10">
                <i class="fa-solid fa-clock" style="color:var(--warning)"></i>
                <div>
                  <div class="font-600 text-sm">รอตรวจสอบการโอนเงิน${pendingVerif.length > 1 ? ` <span class="text-muted font-400">(+${pendingVerif.length - 1} รายการ)</span>` : ''}</div>
                  <div class="text-xs text-muted">${pendingVerif[0].tenantName} · ${pendingVerif[0].id}</div>
                </div>
              </div>
              <div class="flex items-center gap-12">
                <span class="mono text-sm font-600">${d.formatCurrency(pendingVerif[0].total)}</span>
                <button class="btn btn-sm btn-outline" onclick="location.hash='billing'">ตรวจสอบ</button>
              </div>
            </div>
          ` : ''}

          ${pendingCL.length > 0 ? `
            <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;border-left:3px solid #3b82f6;">
              <div class="flex items-center gap-10">
                <i class="fa-solid fa-credit-card" style="color:#3b82f6"></i>
                <div>
                  <div class="font-600 text-sm">คำขอ Credit Line รอพิจารณา${pendingCL.length > 1 ? ` <span class="text-muted font-400">(+${pendingCL.length - 1} รายการ)</span>` : ''}</div>
                  <div class="text-xs text-muted">${pendingCL[0].tenantName} · วงเงินที่ขอ ${d.formatCurrency(pendingCL[0].requestedLimit)}</div>
                </div>
              </div>
              <button class="btn btn-sm btn-outline" onclick="location.hash='billing'">พิจารณา</button>
            </div>
          ` : ''}

          ${pendingRefunds.length > 0 ? `
            <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;border-left:3px solid var(--warning);">
              <div class="flex items-center gap-10">
                <i class="fa-solid fa-rotate-left" style="color:var(--warning)"></i>
                <div>
                  <div class="font-600 text-sm">คำขอ Refund รอ Dual Approval${pendingRefunds.length > 1 ? ` <span class="text-muted font-400">(+${pendingRefunds.length - 1} รายการ)</span>` : ''}</div>
                  <div class="text-xs text-muted">${pendingRefunds[0].tenantName} · ${pendingRefunds[0].invoiceId}</div>
                </div>
              </div>
              <div class="flex items-center gap-12">
                <span class="mono text-sm font-600">${d.formatCurrency(pendingRefunds[0].amount)}</span>
                <button class="btn btn-sm btn-outline" onclick="location.hash='billing'">อนุมัติ</button>
              </div>
            </div>
          ` : ''}

          ${pendingDpApps.length > 0 ? `
            <div class="flex items-center justify-between p-12" style="background:var(--surface2);border-radius:8px;border-left:3px solid #8b5cf6;">
              <div class="flex items-center gap-10">
                <i class="fa-solid fa-clipboard-check" style="color:#8b5cf6"></i>
                <div>
                  <div class="font-600 text-sm">แอปรออนุมัติ (Developer Portal)${pendingDpApps.length > 1 ? ` <span class="text-muted font-400">(+${pendingDpApps.length - 1} รายการ)</span>` : ''}</div>
                  <div class="text-xs text-muted">${pendingDpApps[0].name} · ${pendingDpApps[0].developerName}</div>
                </div>
              </div>
              <button class="btn btn-sm btn-outline" onclick="location.hash='dp-app-approval'" style="border-color:#8b5cf6;color:#8b5cf6;">พิจารณา</button>
            </div>
          ` : ''}

        </div>`}
      </div>

      <!-- Sub-Platform Cards -->
      <div class="section-title"><i class="fa-solid fa-layer-group text-primary"></i> Sub-Platforms</div>
      <div class="grid-2 mb-24">
        ${d.subPlatforms.map(sp => `
          <div class="card p-20">
            <div class="flex justify-between items-start mb-16">
              <div>
                <div class="font-700" style="font-size:15px;">${sp.name}</div>
                <div class="text-sm text-muted mono mt-2">${sp.domain}</div>
              </div>
              ${d.statusChip(sp.status)}
            </div>
            <div class="flex gap-24 mb-12">
              <div>
                <div class="text-xs text-muted uppercase mb-2">Tenants</div>
                <div class="mono font-700">${d.formatNumber(sp.tenants)}</div>
              </div>
              <div>
                <div class="text-xs text-muted uppercase mb-2">Revenue/mo</div>
                <div class="mono font-700">${sp.revenue > 0 ? d.formatCurrency(sp.revenue) : '—'}</div>
              </div>
              <div>
                <div class="text-xs text-muted uppercase mb-2">Tokens/mo</div>
                <div class="mono font-700">${sp.tokenUsage > 0 ? d.formatNumber(sp.tokenUsage) : '—'}</div>
              </div>
              <div>
                <div class="text-xs text-muted uppercase mb-2">Token Rate</div>
                <div class="text-xs font-600 mt-1">${sp.exchangeRate}</div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex gap-6">
                ${sp.plans.map(p => `<span class="chip chip-gray" style="font-size:10px;padding:2px 6px;">${p}</span>`).join('')}
              </div>
              <button class="btn btn-outline btn-sm" onclick="location.hash='sub-platforms'">
                <i class="fa-solid fa-arrow-right"></i> จัดการ
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Developer Portal Overview -->
      <div class="section-title"><i class="fa-solid fa-code text-primary"></i> Developer Portal</div>
      <div class="card p-20 mb-24">
        <div class="flex justify-between items-start mb-16">
          <div>
            <div class="font-700" style="font-size:15px;">Developer Portal — API Management</div>
            <div class="text-sm text-muted mt-2">Credit Line · API Presets · Assign Endpoint</div>
          </div>
          <span class="chip chip-green">Active</span>
        </div>
        <div class="grid-4 gap-16 mb-12">
          <div>
            <div class="text-xs text-muted uppercase mb-2">Active Tenants</div>
            <div class="mono font-700">${dpS.activeTenants}</div>
          </div>
          <div>
            <div class="text-xs text-muted uppercase mb-2">API Presets</div>
            <div class="mono font-700">${dpS.activeApiPresets}<span class="text-muted font-400"> / ${dpS.totalApiPresets}</span></div>
          </div>
          <div>
            <div class="text-xs text-muted uppercase mb-2">API Calls/Month</div>
            <div class="mono font-700">${d.formatNumber(dpS.apiCallsMonth)}</div>
          </div>
          <div>
            <div class="text-xs text-muted uppercase mb-2">Credit Usage</div>
            <div class="mono font-700" style="color:${dpCreditPct > 80 ? 'var(--error)' : dpCreditPct > 50 ? 'var(--warning)' : 'var(--success)'};">${dpCreditPct}%</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-8">
            <div style="flex:1;max-width:200px;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${dpCreditPct}%;background:${dpCreditPct > 80 ? 'var(--error)' : dpCreditPct > 50 ? 'var(--warning)' : 'var(--success)'};border-radius:3px;"></div>
            </div>
            <span class="text-xs text-muted">${d.formatCurrency(dpS.totalCreditUsed)} / ${d.formatCurrency(dpS.totalCreditLimit)}</span>
            ${dpS.tenantsNearLimit > 0 ? '<span class="chip chip-red" style="font-size:10px;">' + dpS.tenantsNearLimit + ' Tenant ใกล้เต็มวงเงิน</span>' : ''}
          </div>
          <button class="btn btn-outline btn-sm" onclick="location.hash='dp-dashboard'">
            <i class="fa-solid fa-arrow-right"></i> จัดการ
          </button>
        </div>
      </div>

      <!-- Plan Distribution -->
      <div class="section-title"><i class="fa-solid fa-chart-pie text-muted"></i> การกระจายตัว Subscription Plan</div>
      <div class="grid-3 mb-24">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Pro Plan</span>
            <div class="stat-icon orange"><i class="fa-solid fa-crown"></i></div>
          </div>
          <div class="stat-value mono">${planCounts.Pro}</div>
          <div class="stat-change up">฿4,990 / Tenant / เดือน</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Starter Plan</span>
            <div class="stat-icon blue"><i class="fa-solid fa-rocket"></i></div>
          </div>
          <div class="stat-value mono">${planCounts.Starter}</div>
          <div class="stat-change up">฿990 / Tenant / เดือน</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Free Plan</span>
            <div class="stat-icon gray"><i class="fa-solid fa-gift"></i></div>
          </div>
          <div class="stat-value mono">${planCounts.Free}</div>
          <div class="stat-change down">฿0 / เดือน</div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="section-title"><i class="fa-solid fa-bolt text-muted"></i> ลัดไปยัง</div>
      <div class="flex gap-12" style="flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="location.hash='sub-platforms'">
          <i class="fa-solid fa-layer-group"></i> Sub-Platforms
        </button>
        <button class="btn btn-outline" onclick="location.hash='tenants'">
          <i class="fa-solid fa-building"></i> Tenant Management
        </button>
        <button class="btn btn-outline" onclick="location.hash='billing'">
          <i class="fa-solid fa-file-invoice-dollar"></i> Billing
        </button>
        <button class="btn btn-outline" onclick="location.hash='cost-pricing'">
          <i class="fa-solid fa-calculator"></i> Cost & Pricing
        </button>
        <button class="btn btn-outline" onclick="location.hash='dp-dashboard'" style="border-color:#8b5cf6;color:#8b5cf6;">
          <i class="fa-solid fa-code"></i> Developer Portal
        </button>
      </div>
    `;
  },

  init() {
    // Platform dashboard is read-only; no special bindings required
  }
};
