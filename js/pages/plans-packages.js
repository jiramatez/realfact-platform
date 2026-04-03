/* ================================================================
   Page Modules — Plans & Packages (split into 3 modules)

   1. window.Pages.plansPackages  — Subscription Plans  (data-tab="sub-plans")
   2. window.Pages.plansTokens    — Token Packages       (data-tab="token-pkgs")
   3. window.Pages.plansBonus     — Welcome Bonus &
                                    Token Priority       (data-tab="welcome-bonus")

   Shared helpers (_spMeta, _getSpMeta, _spHeader) live on
   window.Pages.plansPackages and are referenced by the other two
   modules via window.Pages.plansPackages.<helper>.
   ================================================================ */

window.Pages = window.Pages || {};

/* ════════════════════════════════════════════════════════════════
   MODULE 1 — Subscription Plans
   ════════════════════════════════════════════════════════════════ */
window.Pages.plansPackages = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.plansPackages.render();
    window.Pages.plansPackages.init();
  },

  // ─── SP meta (colors, icons, labels) ───
  _spMeta: {
    'avatar':    { color: 'var(--primary)', bg: 'rgba(241,91,38,.15)',   icon: 'fa-robot',          abbr: 'AVATAR'     },
    'booking':   { color: '#3b82f6',         bg: 'rgba(59,130,246,.15)',  icon: 'fa-calendar-check', abbr: 'BOOKING'    },
    'devportal': { color: '#8b5cf6',         bg: 'rgba(139,92,246,.15)',  icon: 'fa-code',           abbr: 'DEV PORTAL' },
  },
  _getSpMeta(code) {
    return window.Pages.plansPackages._spMeta[code] || {
      color: 'var(--text-muted)', bg: 'rgba(156,163,175,.1)', icon: 'fa-layer-group', abbr: code.toUpperCase(),
    };
  },

  // ─── Feature display (for plan cards) ───
  _renderFeatureList(sp, feats) {
    var catalog = ((window.MockData || {}).featureCatalog || {})[sp] || [];
    if (!catalog.length || !feats) return '<span class="text-xs text-muted">—</span>';
    return catalog.map(function(f) {
      var v = feats[f.key];
      if (f.type === 'number') {
        var display = v === -1 ? 'Unlimited' : (v || 0);
        var icon = (v && v !== 0) ? 'fa-check text-success' : 'fa-minus text-dim';
        return '<div class="flex items-center gap-8"><i class="fa-solid ' + icon + ' text-xs"></i><span class="text-sm">' + f.label + ': <strong>' + display + '</strong>' + (v !== -1 && f.unit ? ' ' + f.unit : '') + '</span></div>';
      }
      if (f.type === 'toggle') {
        var icon = v ? 'fa-check text-success' : 'fa-xmark text-dim';
        return '<div class="flex items-center gap-8"><i class="fa-solid ' + icon + ' text-xs"></i><span class="text-sm">' + f.label + '</span></div>';
      }
      if (f.type === 'select') {
        return '<div class="flex items-center gap-8"><i class="fa-solid fa-check text-success text-xs"></i><span class="text-sm">' + f.label + ': <strong>' + (v || '—') + '</strong></span></div>';
      }
      return '';
    }).join('');
  },

  // ─── Feature form (for modals) ───
  _renderFeatureForm(sp, feats, prefix) {
    var catalog = ((window.MockData || {}).featureCatalog || {})[sp] || [];
    if (!catalog.length) return '<div class="text-xs text-muted">ไม่มี Feature Catalog สำหรับ Sub-Platform นี้</div>';
    feats = feats || {};
    return '<div class="flex-col gap-10">' + catalog.map(function(f) {
      var v = feats[f.key];
      if (f.type === 'number') {
        var isUnlimited = v === -1;
        var numVal = isUnlimited ? '' : (v || 0);
        return '<div class="flex items-center gap-8">' +
          '<label class="text-sm" style="min-width:130px;">' + f.label + '</label>' +
          '<input type="number" class="form-input feat-inp" data-key="' + f.key + '" data-type="number"' +
          ' value="' + numVal + '" min="0" style="width:70px;padding:4px 8px;"' + (isUnlimited ? ' disabled' : '') + '>' +
          (f.unit ? '<span class="text-xs text-muted">' + f.unit + '</span>' : '') +
          (f.unlimited ? '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;margin-left:6px;">' +
            '<input type="checkbox" class="feat-unlim" data-key="' + f.key + '"' + (isUnlimited ? ' checked' : '') + ' style="accent-color:var(--primary);"> Unlimited</label>' : '') +
        '</div>';
      }
      if (f.type === 'toggle') {
        return '<div class="flex items-center gap-8">' +
          '<label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">' +
          '<input type="checkbox" class="feat-inp" data-key="' + f.key + '" data-type="toggle"' + (v ? ' checked' : '') + ' style="accent-color:var(--primary);">' +
          f.label + '</label></div>';
      }
      if (f.type === 'select') {
        return '<div class="flex items-center gap-8">' +
          '<label class="text-sm" style="min-width:130px;">' + f.label + '</label>' +
          '<select class="form-input feat-inp" data-key="' + f.key + '" data-type="select" style="width:auto;padding:4px 8px;">' +
          (f.options || []).map(function(o) { return '<option value="' + o + '"' + (v === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
          '</select></div>';
      }
      return '';
    }).join('') + '</div>';
  },

  // ─── Read feature values from form ───
  _readFeatureForm(container) {
    var feats = {};
    container.querySelectorAll('.feat-inp').forEach(function(inp) {
      var key = inp.dataset.key;
      var type = inp.dataset.type;
      if (type === 'number') {
        var unlimCb = container.querySelector('.feat-unlim[data-key="' + key + '"]');
        feats[key] = (unlimCb && unlimCb.checked) ? -1 : (parseInt(inp.value) || 0);
      } else if (type === 'toggle') {
        feats[key] = inp.checked;
      } else if (type === 'select') {
        feats[key] = inp.value;
      }
    });
    return feats;
  },

  // ─── Bind unlimited checkbox toggle ───
  _bindUnlimitedToggle(container) {
    container.querySelectorAll('.feat-unlim').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var inp = container.querySelector('.feat-inp[data-key="' + cb.dataset.key + '"]');
        if (inp) { inp.disabled = cb.checked; if (cb.checked) inp.value = ''; }
      });
    });
  },

  // ─── SP section header HTML ───
  _spHeader(sp, count, countLabel, unit) {
    const meta = window.Pages.plansPackages._getSpMeta(sp.code);
    const statusChip = sp.status === 'Active'
      ? `<span class="chip chip-green" style="font-size:11px;"><i class="fa-solid fa-circle-dot"></i> Active</span>`
      : `<span class="chip chip-yellow" style="font-size:11px;"><i class="fa-solid fa-clock"></i> ${sp.status}</span>`;
    return `
      <div class="flex items-center justify-between mb-14">
        <div class="flex items-center gap-12 flex-wrap">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:8px;
            background:${meta.bg};color:${meta.color};border:1px solid ${meta.color};
            font-size:12px;font-weight:700;letter-spacing:1px;">
            <i class="fa-solid ${meta.icon}" style="font-size:11px;"></i> ${meta.abbr}
          </div>
          <span class="font-600">${sp.name}</span>
          <span class="chip ${count > 0 ? 'chip-blue' : 'chip-gray'}" style="font-size:11px;">
            ${count} ${unit}
          </span>
          ${statusChip}
        </div>
        <button class="btn btn-outline btn-sm ${countLabel}" data-sp="${sp.code}">
          <i class="fa-solid fa-plus"></i> เพิ่ม
        </button>
      </div>
      <div class="divider mb-12"></div>`;
  },

  render() {
    const d     = window.MockData;
    const plans = d.plans || [];
    const pkgs  = d.tokenPackages || [];
    const av    = d.avatarDefaults;
    const self  = window.Pages.plansPackages;

    // Stats
    const activeSubPlans    = plans.filter(p => p.status === 'Active').length;
    const activePkgs        = pkgs.filter(p => p.status === 'Active').length;
    const totalRevPotential = plans.filter(p => p.price > 0).reduce((s, p) => s + p.price, 0);

    // Group plans by sub-platform
    const plansBySP = {};
    d.subPlatforms.forEach(sp => { plansBySP[sp.code] = []; });
    plans.forEach(p => { (plansBySP[p.subPlatform] = plansBySP[p.subPlatform] || []).push(p); });

    const iconMap = { Pro: 'fa-crown', Starter: 'fa-rocket', Free: 'fa-gift', Basic: 'fa-bolt', Premium: 'fa-gem' };

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">SUBSCRIPTION PLANS</h1>
          <div class="text-sm text-muted mt-2">จัดการ Subscription Plans ทั้งหมดตาม Sub-Platform</div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Subscription Plans</span>
            <div class="stat-icon blue"><i class="fa-solid fa-tags"></i></div>
          </div>
          <div class="stat-value mono">${plans.length}</div>
          <div class="stat-change up">${activeSubPlans} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Token Packages</span>
            <div class="stat-icon orange"><i class="fa-solid fa-coins"></i></div>
          </div>
          <div class="stat-value mono">${pkgs.length}</div>
          <div class="stat-change up">${activePkgs} Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Welcome Bonus (ปัจจุบัน)</span>
            <div class="stat-icon green"><i class="fa-solid fa-gift"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(av.welcomeBonusTokens)}</div>
          <div class="stat-change up">Tokens / Tenant</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Revenue Potential/mo</span>
            <div class="stat-icon green"><i class="fa-solid fa-baht-sign"></i></div>
          </div>
          <div class="stat-value mono" style="font-size:18px;">${d.formatCurrency(totalRevPotential)}</div>
          <div class="stat-change up">หากทุก Paid Plan ใช้งาน</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="plan-search" placeholder="ค้นหา Plan...">
        </div>
        <div class="form-group" style="margin:0;min-width:150px;">
          <select class="form-input" id="plan-status-filter">
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Subscription Plans (grouped by SP)
      ══════════════════════════════════════════ -->
      ${d.subPlatforms.filter(sp => sp.code !== 'devportal').map(sp => {
        const spPlans = plansBySP[sp.code] || [];
        return `
        <div class="sp-section mb-20" data-sp-section="${sp.code}">
          ${self._spHeader(sp, spPlans.length, 'btn-add-plan-sp', 'Plans')}

          ${spPlans.length === 0 ? `
            <div class="p-16 text-center"
              style="background:var(--surface2);border-radius:10px;border:1px dashed var(--border);">
              <div class="text-sm text-muted"><i class="fa-solid fa-circle-plus" style="opacity:.4;margin-right:4px;"></i> ยังไม่มี Plan — กด <strong>เพิ่ม</strong> เพื่อสร้าง</div>
            </div>
          ` : `
            <div class="grid-3 gap-16">
              ${spPlans.map(plan => {
                const isAccent   = plan.name === 'Pro' || plan.name === 'Premium';
                const borderLeft = (plan.name === 'Starter' || plan.name === 'Basic')
                  ? 'border-left:3px solid #3b82f6;' : '';
                const icon = iconMap[plan.name] || 'fa-circle';
                return `
                <div class="${isAccent ? 'card-accent' : 'card'} p-20 plan-card"
                  style="${borderLeft}" data-sp="${plan.subPlatform}"
                  data-plan-name="${plan.name.toLowerCase()}" data-plan-status="${plan.status}">
                  <div class="flex justify-between items-start mb-8">
                    <div class="flex items-center gap-10">
                      <i class="fa-solid ${icon} text-primary"></i>
                      <div class="heading" style="font-size:20px;">${plan.name}</div>
                    </div>
                    <div class="flex gap-6">
                      ${d.statusChip(plan.status)}
                      ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-ghost btn-sm plan-edit-btn"
                        data-id="${plan.id}" title="แก้ไข">
                        <i class="fa-solid fa-pen"></i>
                      </button>` : ''}
                      ${(!window.Auth || Auth.hasPermission('canDelete')) ? `<button class="btn btn-ghost btn-sm plan-delete-btn"
                        data-id="${plan.id}" data-name="${plan.name}" data-sp="${plan.subPlatform}" title="ลบ"
                        style="color:var(--error);">
                        <i class="fa-solid fa-trash"></i>
                      </button>` : ''}
                    </div>
                  </div>

                  <div class="mb-16">
                    <span class="mono font-700" style="font-size:36px;color:var(--primary);">
                      ${plan.price === 0 ? 'ฟรี' : d.formatNumber(plan.price)}
                    </span>
                    ${plan.price > 0 ? '<span class="text-sm text-muted"> THB/เดือน</span>' : ''}
                  </div>

                  <div class="p-10 mb-12" style="background:var(--surface2);border-radius:8px;">
                    <div class="flex items-center gap-6">
                      <i class="fa-solid fa-coins text-warning"></i>
                      <span class="mono font-700">${d.formatNumber((plan.monthlyTokens || 0) + (plan.bonusTokens || 0))}</span>
                      <span class="text-sm text-muted">tokens/เดือน</span>
                    </div>
                    ${plan.bonusTokens ? `<div class="text-xs text-muted mt-4" style="padding-left:22px;">${d.formatNumber(plan.monthlyTokens || 0)} + <span class="text-success font-600">Bonus ${d.formatNumber(plan.bonusTokens)}</span></div>` : ''}
                  </div>

                  <div class="divider mb-12"></div>
                  <div class="text-xs text-muted uppercase font-600 mb-8">Features</div>
                  <div class="flex-col gap-6">
                    ${self._renderFeatureList(plan.subPlatform, plan.features)}
                  </div>
                </div>`;
              }).join('')}
            </div>
          `}
        </div>`;
      }).join('')}

      <!-- Developer Portal Info Banner -->
      <div class="card p-20 mb-20" style="border-left:4px solid #8b5cf6;background:rgba(139,92,246,.04);">
        <div class="flex items-center gap-12 mb-12">
          <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:8px;
            background:rgba(139,92,246,.15);color:#8b5cf6;border:1px solid #8b5cf6;
            font-size:12px;font-weight:700;letter-spacing:1px;">
            <i class="fa-solid fa-code" style="font-size:11px;"></i> DEV PORTAL
          </div>
          <span class="font-700">Developer Portal</span>
          <span class="chip chip-purple" style="font-size:11px;background:rgba(139,92,246,.15);color:#8b5cf6;border:1px solid #8b5cf640;">Credit Line Model</span>
        </div>
        <div class="text-sm mb-12" style="line-height:1.6;">
          Developer Portal ไม่ใช้ระบบ Subscription Plans แต่ใช้ <strong>Credit Line</strong> เป็นโมเดลการเรียกเก็บเงิน
          Tenant ของ DP จะได้รับวงเงินเครดิตและถูกเรียกเก็บตามการใช้งาน API จริง
        </div>
        <div class="flex gap-12 flex-wrap">
          <a href="#billing-credit" onclick="App.navigate('billing-credit')" class="btn btn-sm btn-outline" style="border-color:#8b5cf6;color:#8b5cf6;">
            <i class="fa-solid fa-handshake-angle"></i> Billing & Credit
          </a>
          <a href="#dp-tenants" onclick="App.navigate('dp-tenants')" class="btn btn-sm btn-outline" style="border-color:#8b5cf6;color:#8b5cf6;">
            <i class="fa-solid fa-users"></i> DP Tenants
          </a>
        </div>
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.plansPackages;

    // ─── Plan Filter/Search ───
    function filterPlanCards() {
      const search = (document.getElementById('plan-search') || {}).value.trim().toLowerCase();
      const status = (document.getElementById('plan-status-filter') || {}).value;
      document.querySelectorAll('.plan-card').forEach(card => {
        const name = card.dataset.planName || '';
        const cardStatus = card.dataset.planStatus || '';
        const matchSearch = !search || name.includes(search);
        const matchStatus = status === 'all' || cardStatus === status;
        card.style.display = (matchSearch && matchStatus) ? '' : 'none';
      });
      // Hide SP sections where no cards are visible
      document.querySelectorAll('.sp-section[data-sp-section]').forEach(section => {
        const visibleCards = section.querySelectorAll('.plan-card:not([style*="display: none"])');
        const emptyPlaceholder = section.querySelector('.p-24.text-center');
        if (emptyPlaceholder) return; // section already has empty state
        section.style.display = visibleCards.length > 0 ? '' : 'none';
      });
    }
    const planSearchEl = document.getElementById('plan-search');
    const planStatusEl = document.getElementById('plan-status-filter');
    if (planSearchEl) planSearchEl.addEventListener('input', filterPlanCards);
    if (planStatusEl) planStatusEl.addEventListener('change', filterPlanCards);

    // ─── Edit Plan Modal ───
    document.querySelectorAll('.plan-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const plan = d.plans.find(p => p.id === btn.dataset.id);
        if (!plan) return;
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title"><i class="fa-solid fa-pen text-primary"></i> แก้ไข Plan: ${plan.name}</div>
            <div class="modal-subtitle">Sub-Platform: <strong>${plan.subPlatform}</strong></div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">ชื่อ Plan</label>
                <input class="form-input" id="edit-plan-name" value="${plan.name}">
              </div>
              <div class="form-group">
                <label class="form-label">ราคา (THB/เดือน)</label>
                <input type="number" class="form-input" id="edit-plan-price" value="${plan.price}" min="0">
              </div>
              <div class="form-row" style="display:flex;gap:12px;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Token รายเดือน</label>
                  <input type="number" class="form-input" id="edit-plan-tokens" value="${plan.monthlyTokens || 0}" min="0">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Bonus Token / เดือน</label>
                  <input type="number" class="form-input" id="edit-plan-bonus" value="${plan.bonusTokens || 0}" min="0">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Features</label>
                <div id="edit-features-form">
                  ${self._renderFeatureForm(plan.subPlatform, plan.features, 'edit')}
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="save-plan-btn"><i class="fa-solid fa-save"></i> บันทึก</button>
            </div>
          </div>
        `);
        self._bindUnlimitedToggle(document.getElementById('edit-features-form'));
        document.getElementById('save-plan-btn').addEventListener('click', () => {
          plan.name          = document.getElementById('edit-plan-name').value.trim() || plan.name;
          plan.price         = parseFloat(document.getElementById('edit-plan-price').value) || 0;
          plan.monthlyTokens = parseInt(document.getElementById('edit-plan-tokens').value) || 0;
          plan.bonusTokens   = parseInt(document.getElementById('edit-plan-bonus').value) || 0;
          plan.features      = self._readFeatureForm(document.getElementById('edit-features-form'));
          plan.modifiedDate = new Date().toISOString().split('T')[0];
          plan.modifiedBy   = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
          App.toast('บันทึกการเปลี่ยนแปลงแล้ว', 'success');
          App.closeModal();
          self._rerender();
        });
      });
    });

    // ─── Delete Plan ───
    document.querySelectorAll('.plan-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = btn.dataset.id;
        const planName = btn.dataset.name;
        const planSP = btn.dataset.sp;

        // Check if any tenant is subscribed to this plan
        const subs = Object.values(d.tenantSubscriptions || {}).flat();
        const hasSubscribers = subs.some(s => s.plan === planName && s.subPlatformCode === planSP && s.status === 'Active');
        if (hasSubscribers) {
          App.toast('ไม่สามารถลบได้ — มี Tenant subscribe Plan นี้อยู่', 'error');
          return;
        }

        App.confirm(
          `ลบ Plan "<strong>${planName}</strong>" (${planSP}) หรือไม่?`,
          { title: 'ลบ Plan', confirmText: 'ลบ', cancelText: 'ยกเลิก', type: 'danger' }
        ).then(ok => {
          if (!ok) return;
          const idx = d.plans.findIndex(p => p.id === planId);
          if (idx !== -1) d.plans.splice(idx, 1);
          App.toast('ลบ Plan แล้ว', 'success');
          self._rerender();
        });
      });
    });

    // ─── Add Plan (per-SP buttons) ───
    document.querySelectorAll('.btn-add-plan-sp').forEach(btn => {
      btn.addEventListener('click', () => {
        const preselectedSP = btn.dataset.sp || '';
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title"><i class="fa-solid fa-plus text-primary"></i> เพิ่ม Plan ใหม่</div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">ชื่อ Plan <span style="color:var(--error)">*</span></label>
                <input class="form-input" id="new-plan-name" placeholder="เช่น Business">
              </div>
              <div class="form-group">
                <label class="form-label">Sub-Platform <span style="color:var(--error)">*</span></label>
                <select class="form-input" id="new-plan-sp">
                  ${d.subPlatforms.filter(sp => sp.code !== 'devportal').map(sp =>
                    `<option value="${sp.code}" ${sp.code === preselectedSP ? 'selected' : ''}>${sp.name}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ราคา (THB/เดือน)</label>
                <input type="number" class="form-input" id="new-plan-price" value="0" min="0">
              </div>
              <div class="form-row" style="display:flex;gap:12px;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Token รายเดือน</label>
                  <input type="number" class="form-input" id="new-plan-tokens" value="0" min="0">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Bonus Token / เดือน</label>
                  <input type="number" class="form-input" id="new-plan-bonus" value="0" min="0">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Features</label>
                <div id="new-features-form"></div>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="create-plan-btn"><i class="fa-solid fa-plus"></i> สร้าง Plan</button>
            </div>
          </div>
        `);
        // Render feature form based on selected SP
        function renderNewFeatForm() {
          var sp = document.getElementById('new-plan-sp').value;
          var container = document.getElementById('new-features-form');
          if (!container) return;
          container.innerHTML = self._renderFeatureForm(sp, {}, 'new');
          self._bindUnlimitedToggle(container);
        }
        renderNewFeatForm();
        document.getElementById('new-plan-sp').addEventListener('change', renderNewFeatForm);

        document.getElementById('create-plan-btn').addEventListener('click', () => {
          const name = document.getElementById('new-plan-name').value.trim();
          if (!name) { App.toast('กรุณากรอกชื่อ Plan', 'error'); return; }
          d.plans.push({
            id: 'PL-' + Date.now(),
            name,
            subPlatform: document.getElementById('new-plan-sp').value,
            price: parseFloat(document.getElementById('new-plan-price').value) || 0,
            monthlyTokens: parseInt(document.getElementById('new-plan-tokens').value) || 0,
            bonusTokens: parseInt(document.getElementById('new-plan-bonus').value) || 0,
            features: self._readFeatureForm(document.getElementById('new-features-form')),
            status: 'Active',
            modifiedDate: new Date().toISOString().split('T')[0],
            modifiedBy: (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system',
          });
          App.toast('เพิ่ม Plan ใหม่แล้ว', 'success');
          App.closeModal();
          self._rerender();
        });
      });
    });
  },
};

/* ════════════════════════════════════════════════════════════════
   MODULE 2 — Universal Token Packages
   ════════════════════════════════════════════════════════════════ */
window.Pages.plansTokens = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.plansTokens.render();
    window.Pages.plansTokens.init();
  },

  // ─── Compute avgCostPerToken from settlements (same as cost-pricing) ───
  _avgCost() {
    const d = window.MockData;
    const stls = d.settlements || [];
    const totalCost = stls.reduce((s, stl) => s + stl.summary.totalCost, 0);
    const totalTok  = stls.reduce((s, stl) => s + stl.summary.tokensToDeduct, 0);
    return totalTok > 0 ? totalCost / totalTok : 0;
  },

  render() {
    const d    = window.MockData;
    const pkgs = d.tokenPackages || [];
    const avgCost = window.Pages.plansTokens._avgCost();
    const basePkg = pkgs.find(p => p.status === 'Active') || pkgs[0];
    const baseRate = basePkg ? basePkg.price / basePkg.tokens : 1;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">UNIVERSAL TOKEN PACKAGES</h1>
          <div class="text-sm text-muted mt-2">Token ที่ซื้อใช้ได้ข้ามทุก Sub-Platform · ราคาเทียบกับ Avg Cost จาก Settlement</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline btn-sm" onclick="App.navigate('cost-pricing')"><i class="fa-solid fa-calculator"></i> Cost & Pricing</button>
          <button class="btn btn-primary btn-sm" id="btn-add-pkg"><i class="fa-solid fa-plus"></i> เพิ่ม Package</button>
        </div>
      </div>

      <!-- Cost Reference -->
      <div class="card-accent p-16 mb-20">
        <div class="flex items-center gap-16 flex-wrap">
          <div>
            <div class="text-xs text-muted uppercase mb-4">Avg Cost / Token</div>
            <div class="mono font-700" style="font-size:22px;color:var(--error);">${avgCost > 0 ? avgCost.toFixed(4) : '—'} <span class="text-sm font-400">THB</span></div>
            <div class="text-xs text-muted mt-2">จาก Settlement (Cost & Pricing)</div>
          </div>
          <div style="width:1px;height:40px;background:var(--border);"></div>
          <div>
            <div class="text-xs text-muted uppercase mb-4">Base Rate (${basePkg ? basePkg.name : '—'})</div>
            <div class="mono font-700" style="font-size:22px;color:var(--primary);">${baseRate.toFixed(2)} <span class="text-sm font-400">THB/token</span></div>
          </div>
          <div style="width:1px;height:40px;background:var(--border);"></div>
          <div>
            <div class="text-xs text-muted uppercase mb-4">Base Margin</div>
            <div class="mono font-700" style="font-size:22px;color:var(--success);">${avgCost > 0 ? ((1 - avgCost / baseRate) * 100).toFixed(1) : '—'}%</div>
          </div>
        </div>
      </div>

      <!-- Packages Table -->
      <div class="table-wrap mb-20">
        <table>
          <thead>
            <tr>
              <th>PACKAGE</th>
              <th>TOKENS</th>
              <th>BONUS</th>
              <th>TOTAL</th>
              <th>ราคา (THB)</th>
              <th>ราคา/Token</th>
              <th>Margin vs Cost</th>
              <th>ส่วนลด vs Base</th>
              <th>POPULAR</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${pkgs.map(pkg => {
              const perToken = pkg.price / pkg.tokens;
              const total = pkg.tokens + pkg.bonus;
              const margin = avgCost > 0 ? ((1 - avgCost / perToken) * 100) : 0;
              const discount = Math.round((1 - perToken / baseRate) * 100);
              const isSafe = avgCost > 0 ? perToken >= avgCost : true;
              return `
              <tr>
                <td class="font-600">${pkg.name}</td>
                <td class="mono">${d.formatNumber(pkg.tokens)}</td>
                <td class="mono ${pkg.bonus > 0 ? 'text-success' : 'text-muted'}">${pkg.bonus > 0 ? '+' + d.formatNumber(pkg.bonus) : '—'}</td>
                <td class="mono font-700">${d.formatNumber(total)}${pkg.bonus > 0 ? ' <span class="chip chip-green" style="font-size:9px;">+Bonus</span>' : ''}</td>
                <td class="mono font-700">${d.formatCurrency(pkg.price)}</td>
                <td class="mono">${perToken.toFixed(2)}</td>
                <td><span class="chip ${isSafe ? 'chip-green' : 'chip-red'} mono" style="font-size:11px;">${avgCost > 0 ? margin.toFixed(1) + '%' : '—'}</span></td>
                <td class="mono text-muted">${discount > 0 ? '-' + discount + '%' : discount === 0 ? 'Base' : '+' + Math.abs(discount) + '%'}</td>
                <td>${pkg.popular ? '<span class="chip chip-orange"><i class="fa-solid fa-fire"></i> Popular</span>' : '<span class="text-muted">—</span>'}</td>
                <td>${d.statusChip(pkg.status)}</td>
                <td>
                  <div class="flex gap-4">
                    <button class="btn btn-sm btn-outline pkg-edit-btn" data-id="${pkg.id}" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline pkg-toggle-btn" data-id="${pkg.id}" title="${pkg.status === 'Active' ? 'ปิด' : 'เปิด'}"><i class="fa-solid ${pkg.status === 'Active' ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.plansTokens;

    // ─── Toggle Status ───
    document.querySelectorAll('.pkg-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pkg = d.tokenPackages.find(p => p.id === btn.dataset.id);
        if (!pkg) return;
        pkg.status = pkg.status === 'Active' ? 'Inactive' : 'Active';
        pkg.modifiedDate = new Date().toISOString().split('T')[0];
        pkg.modifiedBy = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
        App.toast(`${pkg.name} ${pkg.status === 'Active' ? 'เปิด' : 'ปิด'}ใช้งานแล้ว`, 'success');
        self._rerender();
      });
    });

    // ─── Edit Package ───
    document.querySelectorAll('.pkg-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pkg = d.tokenPackages.find(p => p.id === btn.dataset.id);
        if (!pkg) return;
        window.App.showModal(`
          <div class="modal">
            <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="modal-title"><i class="fa-solid fa-pen text-primary"></i> แก้ไข Package: ${pkg.name}</div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="form-group">
                <label class="form-label">ชื่อ Package</label>
                <input class="form-input" id="edit-pkg-name" value="${pkg.name}">
              </div>
              <div class="form-row" style="display:flex;gap:12px;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">จำนวน Tokens</label>
                  <input type="number" class="form-input" id="edit-pkg-tokens" value="${pkg.tokens}" min="1">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Bonus Tokens</label>
                  <input type="number" class="form-input" id="edit-pkg-bonus" value="${pkg.bonus}" min="0">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">ราคา (THB)</label>
                <input type="number" class="form-input" id="edit-pkg-price" value="${pkg.price}" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">แสดงป้าย "Popular"</label>
                <select class="form-input" id="edit-pkg-popular">
                  <option value="true"  ${pkg.popular ? 'selected' : ''}>ใช่</option>
                  <option value="false" ${!pkg.popular ? 'selected' : ''}>ไม่</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="save-pkg-btn"><i class="fa-solid fa-save"></i> บันทึก</button>
            </div>
          </div>
        `);
        document.getElementById('save-pkg-btn').addEventListener('click', () => {
          pkg.name         = document.getElementById('edit-pkg-name').value.trim() || pkg.name;
          pkg.tokens       = parseInt(document.getElementById('edit-pkg-tokens').value) || pkg.tokens;
          pkg.bonus        = parseInt(document.getElementById('edit-pkg-bonus').value) || 0;
          pkg.price        = parseFloat(document.getElementById('edit-pkg-price').value) || pkg.price;
          pkg.popular      = document.getElementById('edit-pkg-popular').value === 'true';
          pkg.modifiedDate = new Date().toISOString().split('T')[0];
          pkg.modifiedBy   = (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system';
          App.toast('บันทึกแล้ว', 'success');
          App.closeModal();
          self._rerender();
        });
      });
    });

    // ─── Add Package ───
    var addBtn = document.getElementById('btn-add-pkg');
    if (addBtn) addBtn.addEventListener('click', () => {
      window.App.showModal(`
        <div class="modal">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title"><i class="fa-solid fa-plus text-primary"></i> เพิ่ม Token Package</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group">
              <label class="form-label">ชื่อ Package <span style="color:var(--error)">*</span></label>
              <input class="form-input" id="new-pkg-name" placeholder="เช่น 20,000 Tokens">
            </div>
            <div class="form-row" style="display:flex;gap:12px;">
              <div class="form-group" style="flex:1;">
                <label class="form-label">จำนวน Tokens <span style="color:var(--error)">*</span></label>
                <input type="number" class="form-input" id="new-pkg-tokens" placeholder="เช่น 20000" min="1">
              </div>
              <div class="form-group" style="flex:1;">
                <label class="form-label">Bonus Tokens</label>
                <input type="number" class="form-input" id="new-pkg-bonus" value="0" min="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ราคา (THB) <span style="color:var(--error)">*</span></label>
              <input type="number" class="form-input" id="new-pkg-price" placeholder="เช่น 7000" min="0">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="create-pkg-btn"><i class="fa-solid fa-plus"></i> สร้าง Package</button>
          </div>
        </div>
      `);
      document.getElementById('create-pkg-btn').addEventListener('click', () => {
        const name   = document.getElementById('new-pkg-name').value.trim();
        const tokens = parseInt(document.getElementById('new-pkg-tokens').value) || 0;
        const price  = parseFloat(document.getElementById('new-pkg-price').value) || 0;
        if (!name || !tokens || !price) { App.toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
        d.tokenPackages.push({
          id: 'TP-' + Date.now(),
          name,
          tokens,
          price,
          bonus: parseInt(document.getElementById('new-pkg-bonus').value) || 0,
          popular: false,
          status: 'Active',
          modifiedDate: new Date().toISOString().split('T')[0],
          modifiedBy: (window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system',
        });
        App.toast('เพิ่ม Token Package แล้ว', 'success');
        App.closeModal();
        self._rerender();
      });
    });
  },
};

/* ════════════════════════════════════════════════════════════════
   MODULE 3 — Welcome Bonus & Token Deduction Priority
   ════════════════════════════════════════════════════════════════ */
window.Pages.plansBonus = {

  _rerender() {
    const ct = document.getElementById('content');
    ct.innerHTML = window.Pages.plansBonus.render();
    window.Pages.plansBonus.init();
  },

  render() {
    const d  = window.MockData;
    const av = d.avatarDefaults;

    return `
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="heading">WELCOME BONUS & PRIORITY</h1>
          <div class="text-sm text-muted mt-2">จัดการ Welcome Bonus Tokens และลำดับการหัก Token</div>
        </div>
      </div>

      <!-- Welcome Bonus -->
      <div class="section-title mb-16">
        <i class="fa-solid fa-gift text-primary"></i> WELCOME BONUS TOKENS
      </div>

      <div class="banner-info mb-16">
        <div class="banner-icon"><i class="fa-solid fa-circle-info text-primary"></i></div>
        <div class="flex-1">
          <div class="text-sm">
            Welcome Bonus เติมเข้า <strong>Universal Token Wallet</strong> อัตโนมัติเมื่อ Tenant subscribe Avatar ครั้งแรก
            <span class="chip chip-gray" style="margin-left:4px;">ครั้งเดียวต่อ Tenant</span>
          </div>
        </div>
      </div>

      <div class="card-accent p-24 mb-16">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-muted uppercase mb-6">ค่าปัจจุบัน</div>
            <div class="mono font-700" style="font-size:48px;color:var(--primary);">
              ${d.formatNumber(av.welcomeBonusTokens)}
            </div>
            <div class="text-sm text-muted mt-6">Tokens / Tenant</div>
          </div>
          <div class="flex-col gap-8" style="text-align:right;">
            <div class="text-xs text-muted uppercase">อัปเดตล่าสุด</div>
            <div class="mono text-sm font-600">${av.welcomeBonusLastUpdated}</div>
            <div class="text-xs text-muted">โดย ${av.welcomeBonusUpdatedBy}</div>
            ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-primary btn-sm mt-8" id="btn-edit-welcome-bonus">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>` : ''}
          </div>
        </div>
      </div>

      <div class="text-sm uppercase text-muted font-600 mb-10">ประวัติการเปลี่ยนแปลง</div>
      <div class="table-wrap mb-32">
        <table>
          <thead>
            <tr><th>วันที่</th><th>ค่าเดิม</th><th>ค่าใหม่</th><th>เปลี่ยนโดย</th></tr>
          </thead>
          <tbody>
            ${av.welcomeBonusHistory.map(h => `
              <tr>
                <td class="mono text-sm">${h.date}</td>
                <td class="mono">${d.formatNumber(h.oldValue)}</td>
                <td class="mono font-600 text-primary">${d.formatNumber(h.newValue)}</td>
                <td class="text-sm">${h.changedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Token Deduction Priority -->
      <div class="divider mb-28"></div>
      <div class="section-title mb-16">
        <i class="fa-solid fa-layer-group text-primary"></i> TOKEN DEDUCTION PRIORITY
      </div>
      <div class="text-sm text-muted mb-20">ลำดับการหักโทเค็นเมื่อมีการใช้งาน (อ่านอย่างเดียว)</div>

      <div class="flex items-stretch mb-32" style="gap:0;">
        <div class="card p-20 flex-1" style="border-left:4px solid var(--primary);position:relative;">
          <div style="position:absolute;top:-12px;left:16px;background:var(--primary);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">1</div>
          <div class="text-xs text-muted uppercase mb-8 mt-8">ลำดับแรก</div>
          <div class="font-700 mb-6"><i class="fa-solid fa-calendar-check text-primary"></i> Subscription Tokens</div>
          <div class="text-xs text-muted">reset ทุก billing cycle</div>
          <div class="chip chip-blue mt-10">หมดอายุตาม cycle</div>
        </div>
        <div class="flex items-center" style="padding:0 8px;color:var(--text-muted);">
          <i class="fa-solid fa-arrow-right" style="font-size:20px;"></i>
        </div>
        <div class="card p-20 flex-1" style="border-left:4px solid var(--warning);position:relative;">
          <div style="position:absolute;top:-12px;left:16px;background:var(--warning);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">2</div>
          <div class="text-xs text-muted uppercase mb-8 mt-8">ลำดับสอง</div>
          <div class="font-700 mb-6"><i class="fa-solid fa-gift" style="color:var(--warning);"></i> Welcome Bonus Tokens</div>
          <div class="text-xs text-muted">ไม่หมดอายุ, ได้ครั้งเดียว</div>
          <div class="chip chip-orange mt-10">ครั้งเดียว / ไม่หมดอายุ</div>
        </div>
        <div class="flex items-center" style="padding:0 8px;color:var(--text-muted);">
          <i class="fa-solid fa-arrow-right" style="font-size:20px;"></i>
        </div>
        <div class="card p-20 flex-1" style="border-left:4px solid var(--success);position:relative;">
          <div style="position:absolute;top:-12px;left:16px;background:var(--success);color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">3</div>
          <div class="text-xs text-muted uppercase mb-8 mt-8">ลำดับสาม</div>
          <div class="font-700 mb-6"><i class="fa-solid fa-coins" style="color:var(--success);"></i> Purchased Tokens</div>
          <div class="text-xs text-muted">สะสมได้ ไม่หมดอายุ</div>
          <div class="chip chip-green mt-10">สะสมได้ / ไม่หมดอายุ</div>
        </div>
      </div>
    `;
  },

  init() {
    const d    = window.MockData;
    const self = window.Pages.plansBonus;

    // ─── Welcome Bonus Edit ───
    document.getElementById('btn-edit-welcome-bonus')?.addEventListener('click', () => {
      const current       = d.avatarDefaults.welcomeBonusTokens;
      const maxPlanTk     = d.plans.reduce((mx, p) => Math.max(mx, p.monthlyTokens || 0), 0);
      const warnThreshold = maxPlanTk * 10;
      window.App.showModal(`
        <div class="modal">
          <button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          <div class="modal-title"><i class="fa-solid fa-gift text-primary"></i> แก้ไข Welcome Bonus Tokens</div>
          <div class="modal-subtitle">ค่าปัจจุบัน: <strong>${d.formatNumber(current)}</strong> Tokens</div>
          <div class="form-group mb-16">
            <label class="form-label">จำนวน Tokens ใหม่</label>
            <input type="number" class="form-input" id="new-bonus-value" value="${current}" min="0" step="50">
          </div>
          <div id="bonus-warning" class="hidden mb-16 p-12"
            style="background:#fef3c7;border-radius:8px;border-left:3px solid #f59e0b;">
            <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i>
            <strong> คำเตือน:</strong> ค่าที่กรอกมากกว่า 10 เท่าของ Token สูงสุดของแพลน
            (${d.formatNumber(warnThreshold)} tokens)
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="confirm-bonus-save">
              <i class="fa-solid fa-save"></i> บันทึก
            </button>
          </div>
        </div>
      `);
      const inp = document.getElementById('new-bonus-value');
      inp?.addEventListener('input', () => {
        document.getElementById('bonus-warning')?.classList.toggle('hidden', !(+inp.value > warnThreshold));
      });
      document.getElementById('confirm-bonus-save')?.addEventListener('click', () => {
        const newVal = Number(inp.value);
        if (isNaN(newVal) || newVal < 0) { App.toast('กรุณากรอกจำนวนที่ถูกต้อง', 'error'); return; }
        if (newVal === current) { App.toast('ค่าใหม่เหมือนค่าเดิม', 'warning'); return; }
        const doSave = () => {
          const today = new Date().toISOString().slice(0, 10);
          d.avatarDefaults.welcomeBonusHistory.unshift({
            date: today, oldValue: current, newValue: newVal, changedBy: 'Admin',
          });
          d.avatarDefaults.welcomeBonusTokens     = newVal;
          d.avatarDefaults.welcomeBonusLastUpdated = today;
          d.avatarDefaults.welcomeBonusUpdatedBy   = 'Admin';
          App.toast('บันทึก Welcome Bonus แล้ว', 'success');
          App.closeModal();
          self._rerender();
        };
        if (newVal > warnThreshold) {
          App.confirm(
            `ค่าที่กรอก (${d.formatNumber(newVal)}) มากกว่า 10 เท่าของ Token สูงสุด\nคุณแน่ใจหรือไม่?`,
            { type: 'danger', confirmText: 'ยืนยัน' }
          ).then(ok => { if (ok) doSave(); });
        } else {
          doSave();
        }
      });
    });
  },
};
