/* ================================================================
   App Router + Sidebar + Theme Toggle
   ================================================================ */

(function () {
  'use strict';

  // ─── Route Map ───
  const routes = {
    'dashboard':       { title: 'Dashboard',         module: 'dashboard',       ctx: 'backoffice' },
    'sub-platforms':   { title: 'Sub-Platforms',      module: 'subPlatforms',    ctx: 'backoffice' },
    'tenants':         { title: 'Tenant Management',  module: 'tenants',         ctx: 'backoffice' },
    'cost-pricing':        { title: 'Cost Configuration',    module: 'costPricing',        ctx: 'backoffice' },
    'cost-margin':         { title: 'Margin Configuration',  module: 'costMargin',         ctx: 'backoffice' },
    'cost-snapshots':      { title: 'Pricing Snapshots',     module: 'costSnapshots',      ctx: 'backoffice' },
    'cost-change-requests':{ title: 'Change Requests',       module: 'costChangeRequests', ctx: 'backoffice' },
    'plans-packages':      { title: 'Subscription Plans',    module: 'plansPackages',      ctx: 'backoffice' },
    'plans-tokens':        { title: 'Token Packages',        module: 'plansTokens',        ctx: 'backoffice' },
    'plans-bonus':         { title: 'Welcome Bonus',         module: 'plansBonus',         ctx: 'backoffice' },
    'payment-settings':    { title: 'Payment Settings',      module: 'paymentSettings',    ctx: 'backoffice' },
    'analytics-revenue':   { title: 'Revenue & Billing',      module: 'analyticsRevenue',   ctx: 'backoffice' },
    'analytics-usage':     { title: 'API Usage Analytics',    module: 'analyticsUsage',     ctx: 'backoffice' },
    'analytics-customers': { title: 'Customers & Services',   module: 'analyticsCustomers', ctx: 'backoffice' },
    'billing':           { title: 'Billing & Payments', module: 'billing',        ctx: 'backoffice' },
    'billing-verify':    { title: 'ตรวจสอบการชำระ',    module: 'billingVerify',  ctx: 'backoffice' },
    'billing-credit':    { title: 'Credit & Refunds',   module: 'billingCredit',  ctx: 'backoffice' },
    'billing-overdue':   { title: 'ค้างชำระ',           module: 'billingOverdue', ctx: 'backoffice' },
    'avatar-dashboard': { title: 'Avatar Dashboard',    module: 'avatarDashboard', ctx: 'avatar' },
    'avatar-tenants':   { title: 'Avatar Tenants',      module: 'avatarTenants',   ctx: 'avatar' },
    'hardware':         { title: 'Hardware Inventory',  module: 'hardware',        ctx: 'avatar' },
    'devices':          { title: 'Device Operations',   module: 'devices',         ctx: 'avatar' },
    'service-builder':  { title: 'Assign Avatar',        module: 'serviceBuilder',  ctx: 'avatar' },
    'knowledge-base':   { title: 'Knowledge Base',      module: 'knowledgeBase',   ctx: 'avatar' },
  };

  const contextMeta = {
    backoffice: { label: 'Central Backoffice', sub: 'Platform Management',  icon: 'fa-building', defaultPage: 'dashboard' },
    avatar:     { label: 'RealFact Avatar',    sub: 'Sub-Platform Modules', icon: 'fa-robot',    defaultPage: 'avatar-dashboard' },
  };

  const content = document.getElementById('content');
  const pageTitle = document.getElementById('page-title');

  // ─── Navigate ───
  function navigate(page) {
    const route = routes[page];
    if (!route) { page = 'dashboard'; }
    const r = routes[page];

    // Update sidebar active
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Expand/collapse sub-menus based on current page
    document.querySelectorAll('.nav-sub-group').forEach(function(group) {
      var header = document.querySelector('[data-toggle="' + group.id + '"]');
      var hasActive = !!group.querySelector('.nav-item[data-page="' + page + '"]');
      group.classList.toggle('open', hasActive);
      if (header) header.classList.toggle('open', hasActive);
    });

    // Update topbar
    pageTitle.textContent = r.title;

    // Render page
    const mod = window.Pages && window.Pages[r.module];
    if (mod && mod.render) {
      content.innerHTML = mod.render();
      content.style.animation = 'none';
      content.offsetHeight; // trigger reflow
      content.style.animation = '';
      if (mod.init) mod.init();
      App.updateBillingBadges();
      App.updateCostBadges();
    } else {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-hammer"></i>
          <p>Page "${r.title}" is loading...</p>
        </div>`;
    }
  }

  // ─── Context Switcher ───
  const ctxSwitcher  = document.getElementById('ctx-switcher');
  const ctxBtn       = document.getElementById('ctx-switcher-btn');
  const ctxDropdown  = document.getElementById('ctx-dropdown');
  const ctxIcon      = document.getElementById('ctx-icon');
  const ctxLabel     = document.getElementById('ctx-label');
  const ctxSub       = document.getElementById('ctx-sub');
  const ctxArrow     = document.getElementById('ctx-arrow');
  const navGroups    = document.querySelectorAll('.nav-group[data-context]');
  const ctxItems     = document.querySelectorAll('.ctx-dropdown-item[data-ctx]');

  let currentCtx = localStorage.getItem('rfaContext') || 'backoffice';

  function applyContext(ctx, navigateToDefault) {
    currentCtx = ctx;
    localStorage.setItem('rfaContext', ctx);
    const meta = contextMeta[ctx];

    // Update switcher button
    ctxIcon.innerHTML = '<i class="fa-solid ' + meta.icon + '"></i>';
    ctxLabel.textContent = meta.label;
    ctxSub.textContent = meta.sub;

    // Update dropdown active state
    ctxItems.forEach(function (item) {
      item.classList.toggle('active', item.dataset.ctx === ctx);
    });

    // Show/hide nav groups
    navGroups.forEach(function (group) {
      group.classList.toggle('visible', group.dataset.context === ctx);
    });

    // Close dropdown
    ctxSwitcher.classList.remove('open');

    // Navigate to default page for this context
    if (navigateToDefault) {
      location.hash = meta.defaultPage;
    }
  }

  // Toggle dropdown
  ctxBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    ctxSwitcher.classList.toggle('open');
  });

  // Select context
  ctxItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var ctx = item.dataset.ctx;
      if (ctx !== currentCtx) {
        applyContext(ctx, true);
      } else {
        ctxSwitcher.classList.remove('open');
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', function (e) {
    if (!ctxSwitcher.contains(e.target)) {
      ctxSwitcher.classList.remove('open');
    }
  });

  // ─── Hash Router ───
  function onHashChange() {
    const hash = location.hash.replace('#', '') || 'dashboard';
    // Auto-switch context if navigating to a page in another context
    const route = routes[hash];
    if (route && route.ctx !== currentCtx) {
      applyContext(route.ctx, false);
    }
    navigate(hash);
  }
  window.addEventListener('hashchange', onHashChange);

  // ─── Sidebar Click ───
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = el.dataset.page;
    });
  });

  // ─── Sub-menu Toggle (header click) ───
  document.querySelectorAll('.nav-group-header.has-sub').forEach(function(header) {
    header.addEventListener('click', function() {
      var groupId = header.dataset.toggle;
      var group = document.getElementById(groupId);
      if (!group) return;
      var isOpen = group.classList.contains('open');
      group.classList.toggle('open', !isOpen);
      header.classList.toggle('open', !isOpen);
    });
  });

  // ─── Sidebar Lock ───
  const sidebar = document.getElementById('sidebar');
  const lockBtn = document.getElementById('sidebar-lock');
  let sidebarLocked = false;

  lockBtn.addEventListener('click', () => {
    sidebarLocked = !sidebarLocked;
    sidebar.classList.toggle('locked', sidebarLocked);
    lockBtn.querySelector('i').style.color = sidebarLocked ? 'var(--primary)' : '';
  });

  // ─── Theme Toggle ───
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  let isDark = localStorage.getItem('rfaTheme') !== 'light';

  function applyTheme() {
    document.body.classList.toggle('light-mode', !isDark);
    themeIcon.textContent = isDark ? '\u{1F319}' : '\u{2600}\u{FE0F}';
    localStorage.setItem('rfaTheme', isDark ? 'dark' : 'light');
    const favicon    = document.getElementById('favicon');
    const brandLogo  = document.getElementById('brand-logo-img');
    const logoSrc    = isDark ? 'assets/Favicon-DarkMode.svg' : 'assets/Favicon-LightMode.svg';
    if (favicon)   favicon.href = logoSrc;
    if (brandLogo) brandLogo.src = logoSrc;
  }
  applyTheme();

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    applyTheme();
  });

  // ─── Global modal helper ───
  window.App = {
    showModal(html) {
      let overlay = document.getElementById('global-modal');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-modal';
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = html;
      overlay.classList.remove('hidden');
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) App.closeModal();
      });
    },
    closeModal() {
      const overlay = document.getElementById('global-modal');
      if (overlay) overlay.classList.add('hidden');
    },
    navigate(page) {
      location.hash = page;
    },

    // ─── Billing Badge Updater ───
    updateBillingBadges() {
      const d = window.MockData;
      if (!d) return;

      // Verify badge: invoices pending slip verification
      var verifyCount = (d.invoices || []).filter(function(i) {
        return i.status === 'Pending Verification';
      }).length;
      var verifyBadge = document.getElementById('badge-billing-verify');
      if (verifyBadge) {
        verifyBadge.textContent = verifyCount;
        verifyBadge.classList.toggle('hidden', verifyCount === 0);
      }

      // Overdue badge: invoices overdue
      var overdueCount = (d.invoices || []).filter(function(i) {
        return i.status === 'Overdue';
      }).length;
      var overdueBadge = document.getElementById('badge-billing-overdue');
      if (overdueBadge) {
        overdueBadge.textContent = overdueCount;
        overdueBadge.classList.toggle('hidden', overdueCount === 0);
      }

      // Credit badge: pending credit requests + pending refund requests
      var creditCount = ((d.creditRequests || []).filter(function(c) {
        return c.status === 'Pending';
      }).length) + ((d.refundRequests || []).filter(function(r) {
        return r.status === 'Pending';
      }).length);
      var creditBadge = document.getElementById('badge-billing-credit');
      if (creditBadge) {
        creditBadge.textContent = creditCount;
        creditBadge.classList.toggle('hidden', creditCount === 0);
      }

      // Parent billing header badge: sum of all sub-badges
      var billingTotal = verifyCount + overdueCount + creditCount;
      var parentBillingBadge = document.getElementById('badge-parent-billing');
      if (parentBillingBadge) {
        parentBillingBadge.textContent = billingTotal;
        parentBillingBadge.classList.toggle('hidden', billingTotal === 0);
      }
    },

    // ─── Cost Badge Updater ───
    updateCostBadges() {
      const d = window.MockData;
      if (!d) return;
      var pendingCount = ((d.costChangeRequests || []).filter(function(r) {
        return r.status === 'Pending';
      }).length) + ((d.marginChangeRequests || []).filter(function(r) {
        return r.status === 'Pending';
      }).length);
      var badge = document.getElementById('badge-cost-change-requests');
      if (badge) {
        badge.textContent = pendingCount;
        badge.classList.toggle('hidden', pendingCount === 0);
      }

      // Parent cost header badge: same total
      var parentCostBadge = document.getElementById('badge-parent-cost');
      if (parentCostBadge) {
        parentCostBadge.textContent = pendingCount;
        parentCostBadge.classList.toggle('hidden', pendingCount === 0);
      }
    },

    // ─── Toast Notification (replaces alert) ───
    _toastCounter: 0,
    toast(message, type) {
      type = type || 'success';
      const icons = {
        success: 'fa-circle-check',
        error:   'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info:    'fa-circle-info',
      };
      const colors = {
        success: 'var(--success)',
        error:   'var(--error)',
        warning: '#f59e0b',
        info:    '#3b82f6',
      };
      const icon  = icons[type] || icons.info;
      const color = colors[type] || colors.info;
      const id    = 'app-toast-' + (++App._toastCounter);

      const toast = document.createElement('div');
      toast.id = id;
      toast.className = 'app-toast';
      toast.style.borderLeftColor = color;
      toast.innerHTML =
        '<div class="app-toast-icon"><i class="fa-solid ' + icon + '" style="color:' + color + '"></i></div>' +
        '<div class="app-toast-body">' + message.replace(/\n/g, '<br>') + '</div>' +
        '<button class="app-toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>';
      document.body.appendChild(toast);

      // Auto-remove
      setTimeout(function () {
        const el = document.getElementById(id);
        if (el) { el.classList.add('app-toast-exit'); setTimeout(function () { if (el.parentNode) el.remove(); }, 300); }
      }, 4000);
    },

    // ─── Confirm Dialog (replaces confirm) ───
    confirm(message, options) {
      options = options || {};
      var title       = options.title || 'ยืนยันการดำเนินการ';
      var confirmText = options.confirmText || 'ยืนยัน';
      var cancelText  = options.cancelText || 'ยกเลิก';
      var type        = options.type || 'primary';

      var btnClass = type === 'danger' ? 'btn-danger' : type === 'success' ? 'btn-success' : 'btn-primary';
      var iconMap  = { danger: 'fa-triangle-exclamation', success: 'fa-circle-check', primary: 'fa-circle-question' };
      var colorMap = { danger: 'var(--error)', success: 'var(--success)', primary: 'var(--primary)' };
      var icon  = iconMap[type] || iconMap.primary;
      var color = colorMap[type] || colorMap.primary;

      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'app-confirm-overlay';
        overlay.innerHTML =
          '<div class="app-confirm">' +
            '<div class="app-confirm-icon" style="color:' + color + '"><i class="fa-solid ' + icon + '"></i></div>' +
            '<div class="app-confirm-title">' + title + '</div>' +
            '<div class="app-confirm-message">' + message.replace(/\n/g, '<br>') + '</div>' +
            '<div class="app-confirm-actions">' +
              '<button class="btn btn-outline" id="app-confirm-cancel">' + cancelText + '</button>' +
              '<button class="btn ' + btnClass + '" id="app-confirm-ok"><i class="fa-solid fa-check"></i> ' + confirmText + '</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(overlay);

        function cleanup(result) {
          overlay.classList.add('app-confirm-exit');
          setTimeout(function () { if (overlay.parentNode) overlay.remove(); }, 200);
          resolve(result);
        }

        overlay.querySelector('#app-confirm-cancel').addEventListener('click', function () { cleanup(false); });
        overlay.querySelector('#app-confirm-ok').addEventListener('click', function () { cleanup(true); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) cleanup(false); });
      });
    },
  };

  // ─── Init ───
  applyContext(currentCtx, false);
  onHashChange();
  App.updateBillingBadges();
  App.updateCostBadges();

})();
