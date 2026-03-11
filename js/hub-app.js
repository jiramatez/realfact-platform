/* ================================================================
   Hub App Router — Tenant Console
   Simplified routing for Tenant Admin (no Context Switcher)
   ================================================================ */

(function () {
  'use strict';

  // ─── Route Map (Hub pages only) ───
  var routes = {
    'hub-dashboard':     { title: 'Dashboard',        module: 'hubDashboard' },
    'hub-subscriptions': { title: 'Subscriptions',    module: 'hubSubscriptions' },
    'hub-billing':       { title: 'Billing',          module: 'hubBilling' },
    'hub-team':          { title: 'Team',             module: 'hubTeam' },
    'hub-usage':         { title: 'Usage Report',     module: 'hubUsage' },
    'hub-settings':      { title: 'Settings',         module: 'hubSettings' },
  };

  var content = document.getElementById('content');
  var pageTitle = document.getElementById('page-title');
  var _currentModule = null;

  // ─── Navigate ───
  function navigate(page) {
    if (window.Auth && !Auth.isAuthenticated()) {
      Auth.guard();
      return;
    }

    var route = routes[page];
    if (!route) { page = 'hub-dashboard'; }
    var r = routes[page];

    // Update sidebar active
    document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update topbar
    pageTitle.textContent = r.title;

    // Render page
    var mod = window.HubPages && window.HubPages[r.module];
    if (_currentModule && _currentModule.cleanup) {
      try { _currentModule.cleanup(); } catch (e) { /* ignore */ }
    }
    if (mod && mod.render) {
      _currentModule = mod;
      content.innerHTML = mod.render();
      content.style.animation = 'none';
      content.offsetHeight;
      content.style.animation = '';
      if (mod.init) mod.init();
    } else {
      content.innerHTML =
        '<div class="empty-state">' +
          '<i class="fa-solid fa-hammer"></i>' +
          '<p>Page "' + r.title + '" is loading...</p>' +
        '</div>';
    }
  }

  // ─── Hash Router ───
  function onHashChange() {
    var hash = location.hash.replace('#', '') || 'hub-dashboard';
    navigate(hash);
  }
  window.addEventListener('hashchange', onHashChange);

  // ─── Sidebar Click ───
  document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      location.hash = el.dataset.page;
    });
  });

  // ─── Sidebar Lock ───
  var sidebar = document.getElementById('sidebar');
  var lockBtn = document.getElementById('sidebar-lock');
  var sidebarLocked = false;

  if (lockBtn) {
    lockBtn.addEventListener('click', function () {
      sidebarLocked = !sidebarLocked;
      sidebar.classList.toggle('locked', sidebarLocked);
      lockBtn.querySelector('i').style.color = sidebarLocked ? 'var(--primary)' : '';
    });
  }

  // ─── Theme Toggle ───
  var themeToggle = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');
  var isDark = localStorage.getItem('rfaTheme') !== 'light';

  function applyTheme() {
    document.body.classList.toggle('light-mode', !isDark);
    themeIcon.textContent = isDark ? '\u{1F319}' : '\u{2600}\u{FE0F}';
    localStorage.setItem('rfaTheme', isDark ? 'dark' : 'light');
    var favicon = document.getElementById('favicon');
    var brandLogo = document.getElementById('brand-logo-img');
    var logoSrc = isDark ? 'assets/Favicon-DarkMode.svg' : 'assets/Favicon-LightMode.svg';
    if (favicon) favicon.href = logoSrc;
    if (brandLogo) brandLogo.src = logoSrc;
  }
  applyTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      isDark = !isDark;
      applyTheme();
    });
  }

  // ─── Update Hub UI with tenant info ───
  function updateHubUI() {
    if (!window.Auth || !Auth.isAuthenticated()) return;
    var ctx = Auth.activeContext();
    if (!ctx) return;

    var tenants = (window.MockData && window.MockData.tenants) || [];
    var tenant = ctx.tenantId ? tenants.find(function (t) { return t.id === ctx.tenantId; }) : null;
    var tenantName = tenant ? tenant.name : 'Tenant';

    // Update topbar tenant switcher
    var topbarTenant = document.getElementById('hub-topbar-tenant');
    if (topbarTenant) topbarTenant.textContent = tenantName;

    // Update sidebar tenant label
    var sidebarLabel = document.getElementById('hub-tenant-label');
    if (sidebarLabel) sidebarLabel.textContent = tenantName.toUpperCase();

    // Show switch arrow if user has multiple tenants
    var memberships = Auth.getUserMemberships();
    var tenantMemberships = memberships.filter(function (m) { return m.role === 'tenant_admin'; });
    var switcherBtn = document.getElementById('hub-tenant-switcher');
    var switchArrow = document.getElementById('hub-switch-arrow');
    if (tenantMemberships.length > 1) {
      if (switcherBtn) switcherBtn.setAttribute('data-switchable', 'true');
      if (switchArrow) switchArrow.style.display = '';
    } else {
      if (switcherBtn) switcherBtn.removeAttribute('data-switchable');
      if (switchArrow) switchArrow.style.display = 'none';
    }
  }

  // ─── Bind Tenant Switcher (top-left) ───
  var _hubSwitcher = document.getElementById('hub-tenant-switcher');
  if (_hubSwitcher) {
    _hubSwitcher.addEventListener('click', function () {
      if (_hubSwitcher.getAttribute('data-switchable') !== 'true') return;
      if (window.Auth && Auth.showHub) {
        Auth.showHub();
      }
    });
  }

  // ─── Global Helpers (minimal App-like API for Hub) ───
  window.App = {
    navigate: function (page) { location.hash = page; },
    rerenderPage: function () {
      if (_currentModule && _currentModule.render) {
        content.innerHTML = _currentModule.render();
        if (_currentModule.init) _currentModule.init();
      }
    },
    showModal: function (html) {
      var overlay = document.getElementById('global-modal');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-modal';
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) App.closeModal();
        });
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = html;
      overlay.classList.remove('hidden');
    },
    closeModal: function () {
      var overlay = document.getElementById('global-modal');
      if (overlay) overlay.classList.add('hidden');
    },
    _toastCounter: 0,
    toast: function (message, type) {
      type = type || 'success';
      var icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
      var colors = { success: 'var(--success)', error: 'var(--error)', warning: '#f59e0b', info: '#3b82f6' };
      var icon = icons[type] || icons.info;
      var color = colors[type] || colors.info;
      var id = 'app-toast-' + (++App._toastCounter);
      var toast = document.createElement('div');
      toast.id = id;
      toast.className = 'app-toast';
      toast.style.borderLeftColor = color;
      toast.innerHTML =
        '<div class="app-toast-icon"><i class="fa-solid ' + icon + '" style="color:' + color + '"></i></div>' +
        '<div class="app-toast-body">' + message.replace(/\n/g, '<br>') + '</div>' +
        '<button class="app-toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>';
      document.body.appendChild(toast);
      setTimeout(function () {
        var el = document.getElementById(id);
        if (el) { el.classList.add('app-toast-exit'); setTimeout(function () { if (el.parentNode) el.remove(); }, 300); }
      }, 4000);
    },
    confirm: function (message, options) {
      options = options || {};
      var title = options.title || 'ยืนยันการดำเนินการ';
      var confirmText = options.confirmText || 'ยืนยัน';
      var cancelText = options.cancelText || 'ยกเลิก';
      var type = options.type || 'primary';
      var btnClass = type === 'danger' ? 'btn-danger' : type === 'success' ? 'btn-success' : 'btn-primary';
      var iconMap = { danger: 'fa-triangle-exclamation', success: 'fa-circle-check', primary: 'fa-circle-question' };
      var colorMap = { danger: 'var(--error)', success: 'var(--success)', primary: 'var(--primary)' };
      var icon = iconMap[type] || iconMap.primary;
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
  if (window.Auth) {
    Auth.init();
    Auth.initProfileDropdown();
    if (!Auth.isAuthenticated()) {
      Auth.guard();
    } else if (Auth.activeContext && !Auth.activeContext()) {
      Auth.guard();
    } else {
      // Zone check: only tenant_admin belongs here
      var ctx = Auth.activeContext();
      if (ctx && ctx.role === 'super_admin') {
        // Owner should be on Admin BO
        window.location.href = 'index.html';
      } else if (ctx && (ctx.role === 'subplatform_admin' || ctx.role === 'subplatform_member')) {
        // SP Admin/Member should go to SP App (for now, redirect to index.html)
        window.location.href = 'index.html';
      } else {
        // Tenant Admin — correct zone
        Auth.updateProfileUI();
        updateHubUI();
        onHashChange();
      }
    }
  } else {
    onHashChange();
  }

  // Bind demo account quick-fill (delegated)
  document.addEventListener('click', function (e) {
    var row = e.target.closest('.login-demo-row');
    if (row) {
      var emailInput = document.getElementById('login-email');
      var pwInput = document.getElementById('login-password');
      if (emailInput) emailInput.value = row.dataset.email || '';
      if (pwInput) pwInput.value = row.dataset.pw || '';
    }
  });

})();
