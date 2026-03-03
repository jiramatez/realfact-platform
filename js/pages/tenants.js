/* ================================================================
   Page Module — Tenant Management (Multi-Platform Central View)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.tenants = {

  // ─── Sub-Platform color map ───
  _spColors: { avatar: '#f15b26', booking: '#3b82f6' },

  // ─── Subscription chips for table row ───
  _subChips(tenantId) {
    const d    = window.MockData;
    const subs = (d.tenantSubscriptions || {})[tenantId] || [];
    if (!subs.length) return '<span class="text-muted text-sm">—</span>';

    const chips = subs.map(sub => {
      const c        = window.Pages.tenants._spColors[sub.subPlatformCode] || '#6b7280';
      const dotColor = sub.status === 'Active' ? c : sub.status === 'Pending' ? '#f59e0b' : '#ef4444';
      const badge    = sub.status === 'Pending'
        ? `<span style="background:#f59e0b;color:#000;font-size:9px;padding:1px 5px;border-radius:3px;font-weight:700;margin-left:3px;">PENDING</span>`
        : '';
      return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid ${c}50;background:${c}15;font-size:11px;font-weight:600;color:${c};">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;"></span>
        ${sub.label}&nbsp;(${sub.plan})${badge}
      </span>`;
    });
    return `<div style="flex-direction:column;gap:5px;">${chips.join('')}</div>`;
  },

  // ─── Monthly revenue from active subscriptions ───
  _monthlyRevenue(tenantId) {
    const d = window.MockData;
    return ((d.tenantSubscriptions || {})[tenantId] || [])
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + s.price, 0);
  },

  // ─── Action buttons: view + approve/reject per pending sub ───
  _actionBtns(tenantId) {
    const d       = window.MockData;
    const pending = ((d.tenantSubscriptions || {})[tenantId] || []).filter(s => s.status === 'Pending');
    let html = `<button class="btn btn-sm btn-outline tenant-detail-btn" data-id="${tenantId}" title="ดูรายละเอียด"><i class="fa-solid fa-eye"></i></button>`;
    pending.forEach(sub => {
      html += `
        <button class="btn btn-sm btn-success sub-approve-btn" data-tenant="${tenantId}" data-sub="${sub.subPlatformCode}" title="อนุมัติ ${sub.label}"><i class="fa-solid fa-check"></i></button>
        <button class="btn btn-sm btn-danger sub-reject-btn"   data-tenant="${tenantId}" data-sub="${sub.subPlatformCode}" title="ปฏิเสธ ${sub.label}"><i class="fa-solid fa-xmark"></i></button>`;
    });
    return `<div class="flex gap-4 justify-end">${html}</div>`;
  },

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.tenants.render();
    window.Pages.tenants.init();
  },

  // ═══════════════════════════════════════════════════════════
  render() {
    const d    = window.MockData;
    const s    = d.stats;
    const self = window.Pages.tenants;

    // Aggregate subscription stats
    const allSubs       = Object.values(d.tenantSubscriptions || {}).flat();
    const pendingCount  = allSubs.filter(s => s.status === 'Pending').length;
    const activeSubsCnt = allSubs.filter(s => s.status === 'Active').length;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">TENANT MANAGEMENT</h1>
          <div class="text-sm text-muted mt-2">View, approve, and manage tenants across all Sub-Platforms</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-tenants"><i class="fa-solid fa-file-export"></i> Export CSV</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Tenants</span>
            <div class="stat-icon blue"><i class="fa-solid fa-building-user"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.totalTenants)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> +3 เดือนนี้</div>
        </div>
        <div class="stat-card" style="${pendingCount > 0 ? 'border:1.5px solid var(--warning);' : ''}">
          <div class="stat-header">
            <span class="stat-label">Pending Approval</span>
            <div class="stat-icon ${pendingCount > 0 ? 'yellow' : 'gray'}"><i class="fa-solid fa-clock"></i></div>
          </div>
          <div class="stat-value mono ${pendingCount > 0 ? 'text-warning' : ''}">${pendingCount}</div>
          <div class="stat-change ${pendingCount > 0 ? 'down' : 'up'}">${pendingCount > 0 ? 'รอตรวจสอบการชำระ' : 'ไม่มีรายการรอ'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Active Subscriptions</span>
            <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
          </div>
          <div class="stat-value mono">${activeSubsCnt}</div>
          <div class="stat-change up">ข้าม Sub-Platforms ทั้งหมด</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Suspended</span>
            <div class="stat-icon red"><i class="fa-solid fa-ban"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.suspendedTenants)}</div>
          <div class="stat-change ${s.suspendedTenants > 0 ? 'down' : 'up'}">${s.suspendedTenants > 0 ? 'ต้องตรวจสอบ' : 'ปกติ'}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-12 mb-16">
        <div class="form-group" style="margin:0;min-width:170px;">
          <select id="filter-subplatform" class="form-input">
            <option value="">All Sub-Platforms</option>
            <option value="avatar">Avatar</option>
            <option value="booking">AI Booking</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select id="filter-status" class="form-input">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="tenant-search" class="form-input" placeholder="Search by company name, email, or ID...">
        </div>
      </div>

      <!-- Tenant Table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TENANT</th>
              <th>SUBSCRIPTIONS</th>
              <th>TOKEN BALANCE</th>
              <th>MONTHLY REVENUE</th>
              <th>JOINED</th>
              <th>แก้ไขล่าสุด</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody id="tenant-table-body">
            ${d.tenants.map(t => {
              const subs = (d.tenantSubscriptions || {})[t.id] || [];
              const rev  = self._monthlyRevenue(t.id);
              return `
              <tr data-tenant-id="${t.id}"
                  data-status="${t.status.toLowerCase()}"
                  data-subs="${subs.map(s => s.subPlatformCode).join(',')}"
                  data-name="${t.name.toLowerCase()}"
                  data-email="${t.email.toLowerCase()}"
                  data-haspending="${subs.some(s => s.status === 'Pending') ? '1' : '0'}">
                <td>
                  <div class="flex items-center gap-12">
                    <div class="user-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0;">${t.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <a href="#" class="tenant-name-link font-600 text-primary" data-id="${t.id}">${t.name}</a>
                      <div class="text-xs text-muted">${t.email}</div>
                    </div>
                  </div>
                </td>
                <td>${self._subChips(t.id)}</td>
                <td>
                  <span class="mono font-600 ${t.tokenBalance < 500 ? 'text-error' : t.tokenBalance < 2000 ? 'text-warning' : ''}">${d.formatNumber(t.tokenBalance)}</span>
                  <span class="text-xs text-muted"> tokens</span>
                </td>
                <td>
                  <span class="mono font-600">${d.formatNumber(rev)}</span>
                  <span class="text-xs text-muted"> THB</span>
                </td>
                <td class="text-sm text-muted mono">${t.regDate}</td>
                <td style="white-space:nowrap;"><div class="mono text-sm text-muted">${t.modifiedDate || '-'}</div>${t.modifiedBy ? `<div class="text-xs text-dim">${t.modifiedBy.split('@')[0]}</div>` : ''}</td>
                <td>${self._actionBtns(t.id)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="text-sm text-muted p-16">Showing ${d.tenants.length} of ${d.formatNumber(s.totalTenants)} tenants</div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════
  init() {
    const d    = window.MockData;
    const self = window.Pages.tenants;

    // ─── Filter + Search ───
    const searchEl = document.getElementById('tenant-search');
    const filterSP = document.getElementById('filter-subplatform');
    const filterSt = document.getElementById('filter-status');

    function applyFilters() {
      const query  = (searchEl?.value || '').toLowerCase();
      const sp     = filterSP?.value || '';
      const status = filterSt?.value || '';

      document.querySelectorAll('#tenant-table-body tr').forEach(row => {
        const name       = row.dataset.name  || '';
        const email      = row.dataset.email || '';
        const id         = row.dataset.tenantId || '';
        const rowSubs    = row.dataset.subs  || '';
        const rowStatus  = row.dataset.status || '';
        const hasPending = row.dataset.haspending === '1';

        const matchSearch = !query  || name.includes(query) || email.includes(query) || id.toLowerCase().includes(query);
        const matchSP     = !sp     || rowSubs.split(',').includes(sp);
        const matchStatus = !status
          || (status === 'pending'   && hasPending)
          || (status === 'suspended' && rowStatus === 'suspended')
          || (status === 'active'    && rowStatus === 'active');

        row.style.display = (matchSearch && matchSP && matchStatus) ? '' : 'none';
      });
    }

    searchEl?.addEventListener('input', applyFilters);
    filterSP?.addEventListener('change', applyFilters);
    filterSt?.addEventListener('change', applyFilters);

    // ─── Tenant Detail (table link + eye button) ───
    document.querySelectorAll('.tenant-name-link, .tenant-detail-btn').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); self._showModal(el.dataset.id); });
    });

    // ─── Approve Subscription ───
    document.querySelectorAll('.sub-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = ((d.tenantSubscriptions || {})[btn.dataset.tenant] || []).find(s => s.subPlatformCode === btn.dataset.sub);
        if (sub) {
          sub.status    = 'Active';
          sub.renewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        }
        App.toast(`อนุมัติ ${btn.dataset.sub} subscription แล้ว`, 'success');
        self._rerender();
      });
    });

    // ─── Reject Subscription ───
    document.querySelectorAll('.sub-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.confirm(`ยืนยันการปฏิเสธ <strong>${btn.dataset.sub}</strong> subscription?`, {
          title: 'ปฏิเสธ Subscription', confirmText: 'ปฏิเสธ', type: 'danger',
        }).then(ok => {
          if (!ok) return;
          const subs = (d.tenantSubscriptions || {})[btn.dataset.tenant] || [];
          const idx  = subs.findIndex(s => s.subPlatformCode === btn.dataset.sub);
          if (idx !== -1) subs.splice(idx, 1);
          App.toast(`ปฏิเสธ ${btn.dataset.sub} subscription แล้ว`, 'error');
          self._rerender();
        });
      });
    });

    // ─── Export CSV ───
    document.getElementById('btn-export-tenants')?.addEventListener('click', () => {
      const rows = [
        ['ID', 'Name', 'Email', 'Subscriptions', 'Token Balance', 'Monthly Revenue (THB)', 'Status', 'Joined'],
        ...d.tenants.map(t => {
          const subs = ((d.tenantSubscriptions || {})[t.id] || []).map(s => `${s.label}:${s.plan}:${s.status}`).join('|');
          return [t.id, `"${t.name}"`, t.email, `"${subs}"`, t.tokenBalance, self._monthlyRevenue(t.id), t.status, t.regDate];
        }),
      ];
      const csv  = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `tenants_${new Date().toISOString().slice(0,10)}.csv` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  },

  // ═══════════════════════════════════════════════════════════
  _showModal(tenantId) {
    const d          = window.MockData;
    const t          = d.tenants.find(x => x.id === tenantId);
    if (!t) return;

    const subs       = (d.tenantSubscriptions || {})[tenantId] || [];
    const activities = (d.tokenActivities     || {})[tenantId] || [];
    const meta       = (d.tenantMeta          || {})[tenantId] || {};
    const cl         = (d.creditLines         || []).find(x => x.tenantId === tenantId) || null;
    const spColor    = window.Pages.tenants._spColors;
    const spIcon     = { avatar: 'AV', booking: 'BK' };

    const subRows = subs.map(sub => {
      const c      = spColor[sub.subPlatformCode] || '#6b7280';
      const icon   = spIcon[sub.subPlatformCode] || '??';
      const chip   = sub.status === 'Active'   ? `<span class="chip chip-green">Active</span>`
                   : sub.status === 'Pending'  ? `<span class="chip chip-yellow">Pending</span>`
                   :                             `<span class="chip chip-red">${sub.status}</span>`;
      const approveRejectBtns = sub.status === 'Pending' ? `
        <button class="btn btn-sm btn-success modal-approve-btn" data-tenant="${t.id}" data-sub="${sub.subPlatformCode}"><i class="fa-solid fa-check"></i> อนุมัติ</button>
        <button class="btn btn-sm btn-danger  modal-reject-btn"  data-tenant="${t.id}" data-sub="${sub.subPlatformCode}"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>` : `
        <button class="btn btn-sm btn-outline" title="หยุดชั่วคราว"><i class="fa-solid fa-pause"></i></button>`;
      return `
        <div class="flex items-center gap-12 p-12 mb-8" style="background:var(--surface2);border-radius:8px;border-left:3px solid ${c};">
          <div style="width:36px;height:36px;border-radius:8px;background:${c};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0;">${icon}</div>
          <div class="flex-1">
            <div class="font-600">${sub.subPlatformName} — ${sub.plan}</div>
            <div class="text-xs text-muted">${sub.price > 0 ? d.formatCurrency(sub.price) + '/mo' : 'Free'}${sub.renewDate ? '  ·  Renews: ' + sub.renewDate : ''}</div>
          </div>
          ${chip}
          <div class="flex gap-6">${approveRejectBtns}</div>
        </div>`;
    }).join('');

    const activityRows = activities.map(act => `
      <tr>
        <td class="mono text-sm">${act.date}</td>
        <td><span class="chip ${act.typeClass}" style="font-size:10px;">${act.type}</span></td>
        <td class="text-sm">${act.description}</td>
        <td class="mono text-sm text-right ${act.amount > 0 ? 'text-success' : 'text-error'}">${act.amount > 0 ? '+' : ''}${d.formatNumber(act.amount)}</td>
        <td class="mono text-sm text-right">${d.formatNumber(act.balance)}</td>
      </tr>`).join('');

    window.App.showModal(`
      <div class="modal modal-wide">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>

        <!-- Header -->
        <div class="flex items-center gap-16 mb-20">
          <div class="user-avatar" style="width:52px;height:52px;font-size:20px;flex-shrink:0;">${t.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="modal-title">${t.name}</div>
            <div class="text-sm text-muted">${t.email}</div>
          </div>
          <div class="flex-1"></div>
          ${d.statusChip(t.status)}
          <span class="mono text-xs text-muted">${t.id}</span>
        </div>

        <!-- Contact Strip -->
        <div class="flex gap-24 p-16 mb-16" style="background:var(--surface2);border-radius:10px;flex-wrap:wrap;">
          <div><div class="text-xs text-muted uppercase">Company</div><div class="font-600 text-sm mt-2">${t.name}</div></div>
          <div><div class="text-xs text-muted uppercase">Contact</div><div class="font-600 text-sm mt-2">${meta.contactPerson || '—'}</div></div>
          <div><div class="text-xs text-muted uppercase">Phone</div><div class="font-600 text-sm mt-2 mono">${t.phone}</div></div>
          <div><div class="text-xs text-muted uppercase">Joined</div><div class="font-600 text-sm mt-2 mono">${t.regDate}</div></div>
        </div>

        <!-- Token Wallet -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-coins text-primary"></i>
            <span class="font-700 text-sm uppercase">Token Wallet</span>
          </div>
          <div class="grid-3 gap-16">
            <div>
              <div class="text-xs text-muted uppercase mb-4">Total Balance</div>
              <div class="mono font-700" style="font-size:26px;">${d.formatNumber(t.tokenBalance)}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">Subscription Tokens</div>
              <div class="mono font-700 text-primary" style="font-size:26px;">${d.formatNumber(t.bonusTokens)}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">Purchased Tokens</div>
              <div class="mono font-700 text-success" style="font-size:26px;">${d.formatNumber(t.purchasedTokens)}</div>
            </div>
          </div>
        </div>

        <!-- Credit Line -->
        <div class="card p-16 mb-16" ${cl && cl.status === 'Suspended' ? 'style="border-left:3px solid var(--error);"' : cl ? 'style="border-left:3px solid #8b5cf6;"' : ''}>
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-handshake-angle" style="color:#8b5cf6"></i>
            <span class="font-700 text-sm uppercase">Credit Line</span>
            <span style="margin-left:auto;">${
              cl
                ? (cl.status === 'Active'
                    ? '<span class="chip chip-green">Active</span>'
                    : '<span class="chip chip-red">Suspended</span>')
                : '<span class="text-sm text-muted">ไม่มีวงเงินเครดิต</span>'
            }</span>
          </div>
          ${cl ? (() => {
            const usedPct  = Math.min(100, Math.round(cl.usedAmount / cl.creditLimit * 100));
            const barColor = usedPct > 80 ? 'var(--error)' : usedPct > 50 ? 'var(--warning)' : 'var(--success)';
            return `
            <div class="grid-3 gap-16 mb-10">
              <div>
                <div class="text-xs text-muted uppercase mb-4">วงเงินสูงสุด</div>
                <div class="mono font-700" style="font-size:22px;">${d.formatCurrency(cl.creditLimit)}</div>
              </div>
              <div>
                <div class="text-xs text-muted uppercase mb-4">ใช้ไปแล้ว</div>
                <div class="mono font-700 text-warning" style="font-size:22px;">${d.formatCurrency(cl.usedAmount)}</div>
              </div>
              <div>
                <div class="text-xs text-muted uppercase mb-4">คงเหลือ</div>
                <div class="mono font-700 ${cl.availableCredit === 0 ? 'text-error' : 'text-success'}" style="font-size:22px;">${d.formatCurrency(cl.availableCredit)}</div>
              </div>
            </div>
            <div class="progress-bar mb-8">
              <div class="progress-fill" style="width:${usedPct}%;background:${barColor};"></div>
            </div>
            <div class="flex gap-20 text-xs text-muted">
              <span>รอบบิล: <strong>${cl.billingCycle} วัน</strong></span>
              <span>เงื่อนไข: <strong>${cl.paymentTerms}</strong></span>
              <span>อนุมัติเมื่อ: <strong class="mono">${cl.approvedDate}</strong></span>
            </div>`;
          })() : '<div class="text-sm text-muted">Tenant นี้ไม่ได้ใช้งาน Credit Line</div>'}
        </div>

        <!-- Subscriptions -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-credit-card" style="color:#3b82f6"></i>
            <span class="font-700 text-sm uppercase">Subscriptions (${subs.length})</span>
          </div>
          ${subs.length === 0 ? '<div class="text-sm text-muted">ไม่มี Subscription</div>' : subRows}
        </div>

        <!-- Recent Token Activity -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-clock-rotate-left text-muted"></i>
            <span class="font-700 text-sm uppercase">Recent Token Activity</span>
          </div>
          ${activities.length === 0 ? '<div class="text-sm text-muted">ไม่มีประวัติ</div>' : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th class="text-right">Amount</th><th class="text-right">Balance</th></tr></thead>
              <tbody>${activityRows}</tbody>
            </table>
          </div>`}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" onclick="location.hash='billing';App.closeModal()">
            <i class="fa-solid fa-receipt"></i> ดู Invoice
          </button>
          ${t.status === 'Active'
            ? `<button class="btn btn-danger btn-sm" id="modal-suspend-btn"><i class="fa-solid fa-ban"></i> ระงับ Tenant</button>`
            : `<button class="btn btn-success btn-sm" id="modal-restore-btn"><i class="fa-solid fa-circle-check"></i> คืนสถานะ</button>`}
        </div>
      </div>
    `);

    // Approve from modal
    document.querySelectorAll('.modal-approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = ((d.tenantSubscriptions || {})[btn.dataset.tenant] || []).find(s => s.subPlatformCode === btn.dataset.sub);
        if (sub) { sub.status = 'Active'; sub.renewDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10); }
        App.toast('อนุมัติ subscription แล้ว', 'success');
        App.closeModal();
        window.Pages.tenants._rerender();
      });
    });

    // Reject from modal
    document.querySelectorAll('.modal-reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subs = (d.tenantSubscriptions || {})[btn.dataset.tenant] || [];
        const idx  = subs.findIndex(s => s.subPlatformCode === btn.dataset.sub);
        if (idx !== -1) subs.splice(idx, 1);
        App.toast('ปฏิเสธ subscription แล้ว', 'error');
        App.closeModal();
        window.Pages.tenants._rerender();
      });
    });

    // Suspend
    document.getElementById('modal-suspend-btn')?.addEventListener('click', () => {
      App.confirm(`ระงับ Tenant <strong>${t.name}</strong>?`, { type: 'danger', confirmText: 'ระงับ' }).then(ok => {
        if (!ok) return;
        const tenant = d.tenants.find(x => x.id === tenantId);
        if (tenant) { tenant.status = 'Suspended'; d.stats.activeTenants = Math.max(0, d.stats.activeTenants - 1); d.stats.suspendedTenants++; tenant.modifiedDate = new Date().toISOString().split('T')[0]; tenant.modifiedBy = 'admin@realfact.ai'; }
        App.toast('ระงับ Tenant แล้ว', 'error');
        App.closeModal();
        window.Pages.tenants._rerender();
      });
    });

    // Restore
    document.getElementById('modal-restore-btn')?.addEventListener('click', () => {
      const tenant = d.tenants.find(x => x.id === tenantId);
      if (tenant) { tenant.status = 'Active'; d.stats.activeTenants++; d.stats.suspendedTenants = Math.max(0, d.stats.suspendedTenants - 1); tenant.modifiedDate = new Date().toISOString().split('T')[0]; tenant.modifiedBy = 'admin@realfact.ai'; }
      App.toast('คืนสถานะ Tenant แล้ว', 'success');
      App.closeModal();
      window.Pages.tenants._rerender();
    });
  },
};
