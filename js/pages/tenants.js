/* ================================================================
   Page Module — Tenant Management (Multi-Platform Central View)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.tenants = {

  // ─── Sub-Platform color map ───
  _spColors: { avatar: '#f15b26', booking: '#3b82f6', devportal: '#8b5cf6' },

  // ─── Wallet legend helpers ───
  _walletColors: { subscription: '#3b82f6', purchased: '#22c55e', bonus: '#f59e0b', promo: '#a855f7' },
  _fmtExpiry(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return d.getDate() + ' ' + m[d.getMonth()] + ' ' + (d.getFullYear() + 543);
  },
  _spColorMap: { avatar: '#f15b26', booking: '#3b82f6', devportal: '#8b5cf6' },
  _walletLegend(tid) {
    const d = window.MockData || {};
    const uW = (d.universalWallet || {})[tid] || [];
    const sA = (d.subscriptionAlloc || {})[tid] || [];
    if (!uW.length && !sA.length) return '';
    const self = window.Pages.tenants;
    const uPills = uW.map(b => {
      const c = self._walletColors[b.type] || '#888';
      const exp = self._fmtExpiry(b.expiry);
      return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;padding:2px 7px;border-radius:5px;background:${c}12;border:1px solid ${c}25;"><span style="width:6px;height:6px;border-radius:2px;background:${c};flex-shrink:0;"></span><span style="color:${c};font-weight:600;">${b.label}</span><span class="font-700">${Number(b.amount).toLocaleString('th-TH')}</span>${exp ? `<span class="text-muted" style="font-size:9px;"><i class="fa-regular fa-clock" style="margin-right:1px;"></i>${exp}</span>` : ''}</span>`;
    }).join('');
    const sPills = sA.map(a => {
      const c = self._spColorMap[a.sp] || '#888';
      const exp = self._fmtExpiry(a.expiry);
      return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;padding:2px 7px;border-radius:5px;background:${c}12;border:1px solid ${c}25;"><span style="width:6px;height:6px;border-radius:2px;background:${c};flex-shrink:0;"></span><span style="color:${c};font-weight:600;">${a.spName} ${a.plan}</span><span class="font-700">${Number(a.amount).toLocaleString('th-TH')}</span>${exp ? `<span class="text-muted" style="font-size:9px;"><i class="fa-regular fa-clock" style="margin-right:1px;"></i>${exp}</span>` : ''}</span>`;
    }).join('');
    return `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${uPills}${sPills}</div>`;
  },

  // ─── Subscription chips for table row ───
  _subChips(tenantId) {
    const d    = window.MockData;
    const subs = (d.tenantSubscriptions || {})[tenantId] || [];
    if (!subs.length) return '<span class="text-muted text-sm">—</span>';

    const chips = subs.map(sub => {
      const c        = window.Pages.tenants._spColors[sub.subPlatformCode] || '#6b7280';
      const dotColor = sub.status === 'Active' ? c : sub.status === 'Pending' ? '#f59e0b' : '#ef4444';
      const badge    = sub.status === 'Pending'
        ? `<a href="#billing-verify" style="background:#f59e0b;color:#000;font-size:9px;padding:1px 5px;border-radius:3px;font-weight:700;margin-left:3px;text-decoration:none;" title="รอ verify payment">PENDING PAYMENT</a>`
        : '';
      return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid ${c}50;background:${c}15;font-size:11px;font-weight:600;color:${c};">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;"></span>
        ${sub.label}&nbsp;(${sub.plan})${badge}
      </span>`;
    });
    return `<div style="flex-direction:column;gap:5px;">${chips.join('')}</div>`;
  },

  // ─── Developer Portal chip ───
  _dpChip() {
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid #8b5cf650;background:#8b5cf615;font-size:11px;font-weight:600;color:#8b5cf6;">
      <span style="width:6px;height:6px;border-radius:50%;background:#8b5cf6;flex-shrink:0;"></span>
      Developer Portal&nbsp;(Credit Line)
    </span>`;
  },

  // ─── Monthly revenue from active subscriptions ───
  _monthlyRevenue(tenantId) {
    const d = window.MockData;
    return ((d.tenantSubscriptions || {})[tenantId] || [])
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + s.price, 0);
  },

  // ─── Action buttons: view + link to billing-verify if pending payment ───
  _actionBtns(tenantId) {
    const d       = window.MockData;
    const pending = ((d.tenantSubscriptions || {})[tenantId] || []).filter(s => s.status === 'Pending');
    let html = `<button class="btn btn-sm btn-outline tenant-detail-btn" data-id="${tenantId}" data-source="platform" title="ดูรายละเอียด"><i class="fa-solid fa-eye"></i></button>`;
    if (pending.length > 0) {
      html += `<a href="#billing-verify" class="btn btn-sm btn-warning" title="รอตรวจสอบ payment ${pending.length} รายการ" style="font-size:11px;"><i class="fa-solid fa-receipt"></i> Verify</a>`;
    }
    return `<div class="flex gap-4 justify-end">${html}</div>`;
  },

  // ─── DP action buttons (view only) ───
  _dpActionBtns(tenantId) {
    return `<div class="flex gap-4 justify-end">
      <button class="btn btn-sm btn-outline tenant-detail-btn" data-id="${tenantId}" data-source="devportal" title="ดูรายละเอียด"><i class="fa-solid fa-eye"></i></button>
    </div>`;
  },

  // ─── Merge platform tenants + DP tenants into unified array ───
  _mergedTenants() {
    const d = window.MockData;
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;

    let platform = (d.tenants || []);
    if (scopedTid) {
      platform = platform.filter(t => t.id === scopedTid);
    }
    platform = platform.map(t => ({
      id: t.id, name: t.name, email: t.email, phone: t.phone,
      status: t.status, regDate: t.regDate, modifiedDate: t.modifiedDate,
      modifiedBy: t.modifiedBy, tokenBalance: t.tokenBalance,
      source: 'platform',
    }));

    // DP tenants: only show for Owner (no scopedTid)
    const dp = scopedTid ? [] : (d.dpTenants || []).map(t => ({
      id: t.id, name: t.name, email: t.email || '—', phone: t.phone || '—',
      status: t.status, regDate: t.subscribedDate, modifiedDate: null,
      modifiedBy: null, creditUsed: t.creditLine ? t.creditLine.usedAmount : 0,
      creditLimit: t.creditLine ? t.creditLine.creditLimit : 0,
      source: 'devportal',
    }));
    return platform.concat(dp);
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
    const scopedTid = window.Auth ? Auth.scopedTenantId() : null;
    const platformTenants = scopedTid ? (d.tenants || []).filter(t => t.id === scopedTid) : (d.tenants || []);
    const dpTenants = scopedTid ? [] : (d.dpTenants || []);
    const merged    = self._mergedTenants();

    // Aggregate subscription stats
    const allSubs        = Object.values(d.tenantSubscriptions || {}).flat();
    const pendingCount   = (d.invoices || []).filter(i => i.status === 'Pending Verification').length;
    const activeSubsCnt  = allSubs.filter(s => s.status === 'Active').length;
    const totalCount     = s.totalTenants + dpTenants.length;

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
          <div class="stat-value mono">${d.formatNumber(totalCount)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> +3 เดือนนี้</div>
        </div>
        <div class="stat-card" style="${pendingCount > 0 ? 'border:1.5px solid var(--warning);cursor:pointer;' : ''}" onclick="${pendingCount > 0 ? "location.hash='billing-verify'" : ''}">
          <div class="stat-header">
            <span class="stat-label">รอ Verify Payment</span>
            <div class="stat-icon ${pendingCount > 0 ? 'yellow' : 'gray'}"><i class="fa-solid fa-receipt"></i></div>
          </div>
          <div class="stat-value mono ${pendingCount > 0 ? 'text-warning' : ''}">${pendingCount}</div>
          <div class="stat-change ${pendingCount > 0 ? 'down' : 'up'}">${pendingCount > 0 ? 'คลิกเพื่อตรวจสอบ' : 'ไม่มีรายการรอ'}</div>
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
            <option value="devportal">Developer Portal</option>
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
              <th>TOKEN / CREDIT</th>
              <th>MONTHLY REVENUE</th>
              <th>JOINED</th>
              <th>แก้ไขล่าสุด</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody id="tenant-table-body">
            ${platformTenants.map(t => {
              const subs = (d.tenantSubscriptions || {})[t.id] || [];
              const rev  = self._monthlyRevenue(t.id);
              return `
              <tr data-tenant-id="${t.id}"
                  data-source="platform"
                  data-status="${t.status.toLowerCase()}"
                  data-subs="${subs.map(s => s.subPlatformCode).join(',')}"
                  data-name="${t.name.toLowerCase()}"
                  data-email="${t.email.toLowerCase()}"
                  data-haspending="${subs.some(s => s.status === 'Pending') ? '1' : '0'}">
                <td>
                  <div class="flex items-center gap-12">
                    <div class="user-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0;">${t.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <a href="#" class="tenant-name-link font-600 text-primary" data-id="${t.id}" data-source="platform">${t.name}</a>
                      <div class="text-xs text-muted">${t.email}</div>
                    </div>
                  </div>
                </td>
                <td>${self._subChips(t.id)}</td>
                <td>
                  <span class="mono font-600 ${t.tokenBalance < 500 ? 'text-error' : t.tokenBalance < 2000 ? 'text-warning' : ''}">${d.formatNumber(t.tokenBalance)}</span>
                  <span class="text-xs text-muted"> tokens</span>
                  ${window.Pages.tenants._walletLegend(t.id)}
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
            ${dpTenants.map(t => {
              const cl = t.creditLine || {};
              return `
              <tr data-tenant-id="${t.id}"
                  data-source="devportal"
                  data-status="${t.status.toLowerCase()}"
                  data-subs="devportal"
                  data-name="${t.name.toLowerCase()}"
                  data-email="${(t.email || '').toLowerCase()}"
                  data-haspending="0">
                <td>
                  <div class="flex items-center gap-12">
                    <div class="user-avatar" style="width:36px;height:36px;font-size:14px;flex-shrink:0;background:#8b5cf6;">${t.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <a href="#" class="tenant-name-link font-600" style="color:#8b5cf6;" data-id="${t.id}" data-source="devportal">${t.name}</a>
                      <div class="text-xs text-muted">${t.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td>${self._dpChip()}</td>
                <td>
                  <span class="mono font-600" style="color:#8b5cf6;">${d.formatCurrency(cl.availableCredit || 0)}</span>
                  <span class="text-xs text-muted"> credit</span>
                </td>
                <td>
                  <span class="mono font-600">${d.formatCurrency(cl.usedAmount || 0)}</span>
                  <span class="text-xs text-muted"> used</span>
                </td>
                <td class="text-sm text-muted mono">${t.subscribedDate}</td>
                <td style="white-space:nowrap;"><div class="mono text-sm text-muted">—</div></td>
                <td>${self._dpActionBtns(t.id)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="text-sm text-muted p-16">Showing ${merged.length} of ${d.formatNumber(totalCount)} tenants</div>
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
      el.addEventListener('click', e => {
        e.preventDefault();
        const source = el.dataset.source;
        if (source === 'devportal') {
          self._showDpModal(el.dataset.id);
        } else {
          self._showModal(el.dataset.id);
        }
      });
    });

    // ─── Export CSV ───
    document.getElementById('btn-export-tenants')?.addEventListener('click', () => {
      const rows = [
        ['ID', 'Name', 'Email', 'Source', 'Subscriptions / Type', 'Token Balance / Credit Used', 'Monthly Revenue (THB)', 'Status', 'Joined'],
        ...d.tenants.map(t => {
          const subs = ((d.tenantSubscriptions || {})[t.id] || []).map(s => `${s.label}:${s.plan}:${s.status}`).join('|');
          return [t.id, `"${t.name}"`, t.email, 'Platform', `"${subs}"`, t.tokenBalance, self._monthlyRevenue(t.id), t.status, t.regDate];
        }),
        ...(d.dpTenants || []).map(t => {
          const cl = t.creditLine || {};
          return [t.id, `"${t.name}"`, t.email || '', 'Developer Portal', '"Credit Line"', cl.usedAmount || 0, cl.usedAmount || 0, t.status, t.subscribedDate];
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
      const pendingAction = sub.status === 'Pending'
        ? `<a href="#billing-verify" onclick="App.closeModal()" class="btn btn-sm btn-warning" style="font-size:11px;" title="ไปตรวจสอบสลิป"><i class="fa-solid fa-receipt"></i> ตรวจสอบ</a>`
        : '';
      return `
        <div class="flex items-center gap-12 p-12 mb-8" style="background:var(--surface2);border-radius:8px;border-left:3px solid ${c};">
          <div style="width:36px;height:36px;border-radius:8px;background:${c};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0;">${icon}</div>
          <div class="flex-1">
            <div class="font-600">${sub.subPlatformName} — ${sub.plan}</div>
            <div class="text-xs text-muted">${sub.price > 0 ? d.formatCurrency(sub.price) + '/mo' : 'Free'}${sub.renewDate ? '  ·  Renews: ' + sub.renewDate : ''}</div>
          </div>
          ${chip}
          ${pendingAction}
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

        <!-- Contact & Billing Info -->
        <div class="card p-16 mb-16" style="background:var(--surface2);border-radius:10px;">
          <div class="flex gap-24 flex-wrap">
            <div><div class="text-xs text-muted uppercase">Company</div><div class="font-600 text-sm mt-2">${t.name}</div></div>
            <div><div class="text-xs text-muted uppercase">Contact</div><div class="font-600 text-sm mt-2">${meta.contactPerson || '—'}</div></div>
            <div><div class="text-xs text-muted uppercase">Phone</div><div class="font-600 text-sm mt-2 mono">${t.phone}</div></div>
            <div><div class="text-xs text-muted uppercase">Joined</div><div class="font-600 text-sm mt-2 mono">${t.regDate}</div></div>
          </div>
          <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;">
          <div class="flex items-center gap-8 mb-10">
            <i class="fa-solid fa-file-invoice text-primary" style="font-size:13px;"></i>
            <span class="font-700 text-xs uppercase" style="letter-spacing:.5px;">ข้อมูลออกใบกำกับภาษี</span>
          </div>
          <div class="flex gap-24 flex-wrap">
            <div>
              <div class="text-xs text-muted uppercase mb-4">เลขประจำตัวผู้เสียภาษี</div>
              <div class="mono font-700" style="font-size:14px;letter-spacing:1px;">${meta.taxId || '—'}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">ประเภท</div>
              <div>${meta.companyType === 'corporation'
                ? '<span class="chip chip-blue" style="font-size:11px;">นิติบุคคล</span>'
                : meta.companyType === 'individual'
                  ? '<span class="chip chip-yellow" style="font-size:11px;">บุคคลธรรมดา</span>'
                  : '<span class="text-muted">—</span>'}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">สาขา</div>
              <div class="mono font-600 text-sm">${meta.branch ? (meta.branch === '00000' ? meta.branch + ' (สำนักงานใหญ่)' : meta.branch) : '—'}</div>
            </div>
          </div>
          ${meta.billingAddress ? `
          <div class="mt-10">
            <div class="text-xs text-muted uppercase mb-4">ที่อยู่ออกใบกำกับภาษี</div>
            <div class="text-sm font-600">${meta.billingAddress}</div>
          </div>` : ''}
        </div>

        <!-- Token Wallet -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-coins text-primary"></i>
            <span class="font-700 text-sm uppercase">Token Wallet</span>
          </div>
          <div class="mono font-700" style="font-size:26px;">${d.formatNumber(t.tokenBalance)} <span class="text-sm font-400 text-muted">tokens</span></div>
          <div class="mt-8">${window.Pages.tenants._walletLegend(t.id)}</div>
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

        <!-- Active Snapshot (resolver) or Live Price -->
        ${(() => {
          const snap = d.resolveSnapshotForTenant(tenantId);
          const tenantSnaps = d.snapshots.filter(s => s.tenantIds && s.tenantIds.indexOf(tenantId) !== -1);
          const rem = snap ? d.snapshotDaysRemaining(snap) : null;
          const snapLink = snap ? `onclick="App.closeModal();setTimeout(()=>{App.navigate('cost-snapshots');setTimeout(()=>window.Pages.snapshots._showDetail('${snap.id}'),200)},100);"` : '';
          return `
          <div class="card p-16 mb-16" style="border-left:3px solid ${snap ? 'var(--primary)' : '#6b7280'};">
            <div class="flex items-center gap-8 mb-12">
              <i class="fa-solid ${snap ? 'fa-camera' : 'fa-bolt'}" style="color:${snap ? 'var(--primary)' : '#6b7280'}"></i>
              <span class="font-700 text-sm uppercase">Active Price</span>
              <span style="margin-left:auto;">${snap ? '<span class="chip chip-blue">📸 Snapshot</span>' : '<span class="chip chip-gray">💱 Live Price</span>'}</span>
            </div>
            ${snap ? `
              <div class="flex items-center justify-between mb-8">
                <div>
                  <div class="font-600" style="font-size:15px;cursor:pointer;text-decoration:underline;" ${snapLink}>${snap.name}</div>
                  <div class="mono text-xs text-dim">${snap.id} · ${snap.startDate} → ${snap.endDate}</div>
                </div>
                <div style="text-align:right;">
                  <div class="mono font-700" style="font-size:22px;color:${rem !== null && rem <= 30 ? '#f59e0b' : 'var(--text)'};">${rem !== null ? rem + 'd' : '—'}</div>
                  <div class="text-xs text-muted">เหลือ</div>
                </div>
              </div>
              <div class="p-8" style="background:rgba(59,130,246,0.06);border-radius:6px;">
                <div class="flex items-center gap-8 text-sm">
                  <i class="fa-solid fa-list" style="color:var(--primary);"></i>
                  <span class="font-600">${snap.services.length} services frozen</span>
                  ${snap.tenantIds.length > 1 ? `<span class="text-muted">· shared กับ ${snap.tenantIds.length - 1} tenants อื่น</span>` : ''}
                </div>
              </div>
            ` : '<div class="text-sm text-muted">ไม่มี Snapshot active — ใช้ <strong>Live Price</strong> (cost × margin ปัจจุบัน)</div>'}
            ${tenantSnaps.length ? `
              <div class="mt-10">
                <div class="text-xs text-muted uppercase mb-6">ประวัติ Snapshot ของ Tenant นี้ (${tenantSnaps.length})</div>
                ${tenantSnaps.map(sn => `<div class="flex items-center justify-between py-4" style="border-bottom:1px solid var(--border);font-size:12px;">
                  <div class="flex gap-8 items-center">
                    <span class="mono">${sn.id}</span>
                    <span>${sn.name}</span>
                    ${d.snapshotStatusChip(sn)}
                  </div>
                  <div class="text-dim mono">${sn.startDate} → ${sn.endDate}</div>
                </div>`).join('')}
              </div>
            ` : ''}
            <div class="flex gap-8 mt-12">
              <button class="btn btn-outline btn-sm" onclick="App.closeModal();setTimeout(()=>{App.navigate('cost-snapshots');setTimeout(()=>window.Pages.snapshots._showWizard(),200)},100);">
                <i class="fa-solid fa-plus"></i> สร้าง Snapshot ให้ Tenant นี้
              </button>
              ${snap ? `<button class="btn btn-outline btn-sm" style="color:var(--error);border-color:var(--error);" onclick="App.closeModal();setTimeout(()=>{App.navigate('cost-snapshots');setTimeout(()=>window.Pages.snapshots._showCancelModal('${snap.id}'),200)},100);">
                <i class="fa-solid fa-ban"></i> Cancel Snapshot
              </button>` : ''}
            </div>
          </div>`;
        })()}

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
          ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-outline btn-sm" onclick="window.Pages.tenants._editTenant('${tenantId}')"><i class="fa-solid fa-pen"></i> แก้ไข</button>` : ''}
          ${t.status === 'Active'
            ? ((!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-danger btn-sm" id="modal-suspend-btn"><i class="fa-solid fa-ban"></i> ระงับ Tenant</button>` : '')
            : ((!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-success btn-sm" id="modal-restore-btn"><i class="fa-solid fa-circle-check"></i> คืนสถานะ</button>` : '')}
        </div>
      </div>
    `);

    // Suspend
    document.getElementById('modal-suspend-btn')?.addEventListener('click', () => {
      App.confirm(`ระงับ Tenant <strong>${t.name}</strong>?`, { type: 'danger', confirmText: 'ระงับ' }).then(ok => {
        if (!ok) return;
        const tenant = d.tenants.find(x => x.id === tenantId);
        if (tenant) { tenant.status = 'Suspended'; d.stats.activeTenants = Math.max(0, d.stats.activeTenants - 1); d.stats.suspendedTenants++; tenant.modifiedDate = new Date().toISOString().split('T')[0]; tenant.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'; }
        App.toast('ระงับ Tenant แล้ว', 'error');
        App.closeModal();
        window.Pages.tenants._rerender();
      });
    });

    // Restore
    document.getElementById('modal-restore-btn')?.addEventListener('click', () => {
      const tenant = d.tenants.find(x => x.id === tenantId);
      if (tenant) { tenant.status = 'Active'; d.stats.activeTenants++; d.stats.suspendedTenants = Math.max(0, d.stats.suspendedTenants - 1); tenant.modifiedDate = new Date().toISOString().split('T')[0]; tenant.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'; }
      App.toast('คืนสถานะ Tenant แล้ว', 'success');
      App.closeModal();
      window.Pages.tenants._rerender();
    });
  },

  // ═══════════════════════════════════════════════════════════
  // Edit Tenant Modal
  // ═══════════════════════════════════════════════════════════
  _editTenant(tenantId) {
    const d    = window.MockData;
    const self = window.Pages.tenants;
    const t    = d.tenants.find(x => x.id === tenantId);
    if (!t) return;
    const meta = (d.tenantMeta || {})[tenantId] || {};

    window.App.showModal(`
      <div class="modal">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div class="modal-title"><i class="fa-solid fa-pen text-primary"></i> แก้ไข Tenant</div>
        <div class="modal-subtitle">${t.id}</div>
        <div class="form-group mb-12">
          <label class="form-label">ชื่อบริษัท</label>
          <input class="form-input" id="edit-t-name" value="${t.name}">
        </div>
        <div class="form-group mb-12">
          <label class="form-label">ผู้ติดต่อ</label>
          <input class="form-input" id="edit-t-contact" value="${meta.contactPerson || ''}">
        </div>
        <div class="form-group mb-12">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="edit-t-email" value="${t.email}">
        </div>
        <div class="form-group mb-12">
          <label class="form-label">เบอร์โทร</label>
          <input class="form-input" id="edit-t-phone" value="${t.phone}">
        </div>

        <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
        <div class="font-700 text-sm mb-12" style="color:var(--primary);"><i class="fa-solid fa-file-invoice"></i> ข้อมูลออกใบกำกับภาษี</div>

        <div class="form-group mb-12">
          <label class="form-label">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
          <input class="form-input mono" id="edit-t-taxid" value="${meta.taxId || ''}" maxlength="13" pattern="\\d{13}" placeholder="เช่น 0105558012345">
        </div>
        <div class="form-group mb-12">
          <label class="form-label">ประเภทผู้เสียภาษี</label>
          <select class="form-input" id="edit-t-companytype">
            <option value="corporation" ${meta.companyType === 'corporation' ? 'selected' : ''}>นิติบุคคล</option>
            <option value="individual" ${meta.companyType === 'individual' ? 'selected' : ''}>บุคคลธรรมดา</option>
          </select>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">รหัสสาขา</label>
          <input class="form-input mono" id="edit-t-branch" value="${meta.branch || ''}" maxlength="5" placeholder="00000">
          <div class="text-xs text-muted mt-4">00000 = สำนักงานใหญ่</div>
        </div>
        <div class="form-group mb-12">
          <label class="form-label">ที่อยู่ออกใบกำกับภาษี</label>
          <textarea class="form-input" id="edit-t-billingaddr" rows="3" placeholder="ที่อยู่สำหรับออกใบกำกับภาษี">${meta.billingAddress || ''}</textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
          <button class="btn btn-primary" id="save-edit-tenant-btn"><i class="fa-solid fa-save"></i> บันทึก</button>
        </div>
      </div>
    `);

    setTimeout(() => {
      document.getElementById('save-edit-tenant-btn')?.addEventListener('click', () => {
        const newName        = document.getElementById('edit-t-name').value.trim();
        const newContact     = document.getElementById('edit-t-contact').value.trim();
        const newEmail       = document.getElementById('edit-t-email').value.trim();
        const newPhone       = document.getElementById('edit-t-phone').value.trim();
        const newTaxId       = document.getElementById('edit-t-taxid').value.trim();
        const newCompanyType = document.getElementById('edit-t-companytype').value;
        const newBranch      = document.getElementById('edit-t-branch').value.trim();
        const newBillingAddr = document.getElementById('edit-t-billingaddr').value.trim();

        if (!newName || !newEmail) {
          App.toast('กรุณากรอกชื่อบริษัทและ Email', 'error');
          return;
        }

        if (newTaxId && !/^\d{13}$/.test(newTaxId)) {
          App.toast('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก', 'error');
          return;
        }

        const currentEmail = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
        t.name  = newName;
        t.email = newEmail;
        t.phone = newPhone;
        t.modifiedDate = new Date().toISOString().split('T')[0];
        t.modifiedBy   = currentEmail;

        // Update meta
        if (!d.tenantMeta) d.tenantMeta = {};
        if (!d.tenantMeta[tenantId]) d.tenantMeta[tenantId] = {};
        d.tenantMeta[tenantId].contactPerson  = newContact;
        d.tenantMeta[tenantId].taxId          = newTaxId;
        d.tenantMeta[tenantId].companyType    = newCompanyType;
        d.tenantMeta[tenantId].branch         = newBranch;
        d.tenantMeta[tenantId].billingAddress = newBillingAddr;

        App.toast('บันทึกข้อมูล Tenant แล้ว', 'success');
        App.closeModal();
        self._rerender();
      });
    }, 50);
  },

  // ═══════════════════════════════════════════════════════════
  // Developer Portal Tenant Modal
  // ═══════════════════════════════════════════════════════════
  _showDpModal(tenantId) {
    const d = window.MockData;
    const t = (d.dpTenants || []).find(x => x.id === tenantId);
    if (!t) return;

    const cl = t.creditLine || {};
    const presets = (d.apiPresets || []).filter(p => (t.assignedPresets || []).includes(p.id));
    const usedPct  = cl.creditLimit ? Math.min(100, Math.round(cl.usedAmount / cl.creditLimit * 100)) : 0;
    const barColor = usedPct > 80 ? 'var(--error)' : usedPct > 50 ? 'var(--warning)' : 'var(--success)';

    const presetRows = presets.map(p => `
      <div class="flex items-center gap-12 p-12 mb-8" style="background:var(--surface2);border-radius:8px;border-left:3px solid #8b5cf6;">
        <div style="width:36px;height:36px;border-radius:8px;background:#8b5cf6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;color:#fff;flex-shrink:0;">
          <i class="fa-solid fa-cube"></i>
        </div>
        <div class="flex-1">
          <div class="font-600">${p.name} <span class="text-muted text-xs">v${p.version}</span></div>
          <div class="text-xs text-muted">${p.agents.length} agent(s)</div>
        </div>
        ${d.statusChip(p.status)}
      </div>
    `).join('');

    const invoiceRows = (t.invoices || []).map(inv => `
      <tr>
        <td class="mono text-sm">${inv.id}</td>
        <td class="mono text-sm">${inv.date}</td>
        <td class="mono font-600">${d.formatCurrency(inv.amount)}</td>
        <td>${d.statusChip(inv.status)}</td>
      </tr>
    `).join('');

    window.App.showModal(`
      <div class="modal modal-wide">
        <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>

        <!-- Header -->
        <div class="flex items-center gap-16 mb-20">
          <div class="user-avatar" style="width:52px;height:52px;font-size:20px;flex-shrink:0;background:#8b5cf6;">${t.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="modal-title">${t.name}</div>
            <div class="text-sm text-muted">${t.email || '—'}</div>
          </div>
          <div class="flex-1"></div>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;border:1px solid #8b5cf650;background:#8b5cf615;font-size:11px;font-weight:600;color:#8b5cf6;">
            <i class="fa-solid fa-code"></i> Developer Portal
          </span>
          ${d.statusChip(t.status)}
          <span class="mono text-xs text-muted">${t.id}</span>
        </div>

        <!-- Contact Strip -->
        <div class="flex gap-24 p-16 mb-16" style="background:var(--surface2);border-radius:10px;flex-wrap:wrap;">
          <div><div class="text-xs text-muted uppercase">Company</div><div class="font-600 text-sm mt-2">${t.name}</div></div>
          <div><div class="text-xs text-muted uppercase">Email</div><div class="font-600 text-sm mt-2">${t.email || '—'}</div></div>
          <div><div class="text-xs text-muted uppercase">Phone</div><div class="font-600 text-sm mt-2 mono">${t.phone || '—'}</div></div>
          <div><div class="text-xs text-muted uppercase">Subscribed</div><div class="font-600 text-sm mt-2 mono">${t.subscribedDate}</div></div>
        </div>

        <!-- Credit Line -->
        <div class="card p-16 mb-16" style="border-left:3px solid #8b5cf6;">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-handshake-angle" style="color:#8b5cf6"></i>
            <span class="font-700 text-sm uppercase">Credit Line</span>
            <span style="margin-left:auto;">${
              cl.status === 'Active'
                ? '<span class="chip chip-green">Active</span>'
                : '<span class="chip chip-red">Suspended</span>'
            }</span>
          </div>
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
          </div>
        </div>

        <!-- API Usage -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-chart-bar" style="color:#8b5cf6;"></i>
            <span class="font-700 text-sm uppercase">API Usage</span>
          </div>
          <div class="grid-2 gap-16">
            <div>
              <div class="text-xs text-muted uppercase mb-4">API Calls Today</div>
              <div class="mono font-700" style="font-size:22px;">${d.formatNumber(t.apiCallsToday)}</div>
            </div>
            <div>
              <div class="text-xs text-muted uppercase mb-4">API Calls This Month</div>
              <div class="mono font-700" style="font-size:22px;">${d.formatNumber(t.apiCallsMonth)}</div>
            </div>
          </div>
        </div>

        <!-- Assigned Presets -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-cubes" style="color:#8b5cf6;"></i>
            <span class="font-700 text-sm uppercase">Assigned API Presets (${presets.length})</span>
          </div>
          ${presets.length === 0 ? '<div class="text-sm text-muted">ไม่มี Preset ที่ assign</div>' : presetRows}
        </div>

        <!-- Invoices -->
        <div class="card p-16 mb-16">
          <div class="flex items-center gap-8 mb-12">
            <i class="fa-solid fa-file-invoice text-muted"></i>
            <span class="font-700 text-sm uppercase">Invoices</span>
          </div>
          ${(t.invoices || []).length === 0 ? '<div class="text-sm text-muted">ไม่มี Invoice</div>' : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Invoice ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>${invoiceRows}</tbody>
            </table>
          </div>`}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" onclick="location.hash='dp-tenants';App.closeModal()">
            <i class="fa-solid fa-code"></i> ไปที่ DP Tenants
          </button>
        </div>
      </div>
    `);
  },
};
