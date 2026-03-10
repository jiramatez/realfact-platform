/* ================================================================
   Auth + RBAC Module — Hierarchical Multi-Tenant
   Supports: Owner → Tenant Admin → SP Admin → Member
   with Custom Roles and Context Switching (Hub)
   ================================================================ */

window.Auth = (function () {
  'use strict';

  // ─── Data accessors ───
  function _getUsers() { return (window.MockData && window.MockData.users) || []; }
  function _getMemberships() { return (window.MockData && window.MockData.userMemberships) || []; }
  function _getCustomRoles() { return (window.MockData && window.MockData.customRoles) || []; }
  function _getBaseRoles() { return (window.MockData && window.MockData.rolePermissions) || {}; }
  function _getTenants() { return (window.MockData && window.MockData.tenants) || []; }
  function _getSubPlatforms() { return (window.MockData && window.MockData.subPlatforms) || []; }
  function _getTenantSubs() { return (window.MockData && window.MockData.tenantSubscriptions) || {}; }

  var SESSION_KEY = 'rfa_session';
  var _currentUser = null;
  var _activeContext = null;  // { membershipId, role, tenantId, subPlatformId, customRoleId }

  // ─── Role hierarchy (higher number = higher rank) ───
  var _roleRank = { super_admin: 4, tenant_admin: 3, subplatform_admin: 2, subplatform_member: 1 };

  // ─── Init: restore session from localStorage ───
  function init() {
    var stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        var session = JSON.parse(stored);
        var user = _getUsers().find(function (u) { return u.email === session.email && u.status === 'Active'; });
        if (user) {
          _currentUser = user;
          if (session.activeContext) {
            var mb = _getMemberships().find(function (m) { return m.id === session.activeContext.membershipId; });
            if (mb && mb.status === 'Active') {
              _activeContext = session.activeContext;
            }
          }
          return true;
        }
      } catch (e) { /* invalid session */ }
      localStorage.removeItem(SESSION_KEY);
    }
    return false;
  }

  // ─── Login ───
  function login(email, password) {
    var user = _getUsers().find(function (u) { return u.email === email; });
    if (!user) return 'ไม่พบบัญชีนี้ในระบบ';
    if (user.status === 'Suspended') return 'บัญชีนี้ถูกระงับการใช้งาน';
    if (user.status === 'Invited' && !user.password) return 'invited';
    if (user.password !== password) return 'Email หรือ Password ไม่ถูกต้อง';
    _currentUser = user;
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');

    var memberships = _getUserMemberships(user.id);
    if (memberships.length === 0) return 'ไม่มีสิทธิ์เข้าใช้งานระบบ';

    // High-level roles always show Hub (per design: Owner / Tenant Admin choose scope first)
    var hasHighLevel = memberships.some(function (m) {
      return m.role === 'super_admin' || m.role === 'tenant_admin';
    });

    if (memberships.length === 1 && !hasHighLevel) {
      // Low-level with single membership → auto-select, skip Hub
      _setActiveContext(memberships[0]);
      _saveSession();
      return true;
    }

    // Multiple memberships OR high-level role → show Hub
    _saveSession();
    return 'hub';
  }

  // ─── Set Password (for Invited users) ───
  function setPassword(email, newPassword) {
    var user = _getUsers().find(function (u) { return u.email === email; });
    if (!user) return false;
    user.password = newPassword;
    user.status = 'Active';
    _getMemberships().forEach(function (m) {
      if (m.userId === user.id && m.status === 'Invited') m.status = 'Active';
    });
    _currentUser = user;
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');
    var memberships = _getUserMemberships(user.id);
    if (memberships.length >= 1) {
      _setActiveContext(memberships[0]);
    }
    _saveSession();
    return true;
  }

  // ─── Logout ───
  function logout() {
    _currentUser = null;
    _activeContext = null;
    localStorage.removeItem(SESSION_KEY);
    _hideApp();
    _showLogin();
  }

  // ─── Session persistence ───
  function _saveSession() {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: _currentUser.email,
      activeContext: _activeContext,
      loginTime: new Date().toISOString(),
    }));
  }

  // ─── Context Management ───
  function _setActiveContext(membership) {
    _activeContext = {
      membershipId: membership.id,
      role: membership.role,
      tenantId: membership.tenantId,
      subPlatformId: membership.subPlatformId,
      customRoleId: membership.customRoleId,
    };
  }

  function switchContext(membershipId) {
    var mb = _getMemberships().find(function (m) { return m.id === membershipId && m.status === 'Active'; });
    if (!mb || mb.userId !== _currentUser.id) return false;
    _setActiveContext(mb);
    _saveSession();
    return true;
  }

  function activeContext() { return _activeContext; }

  function _getUserMemberships(userId) {
    return _getMemberships().filter(function (m) {
      return m.userId === userId && m.status === 'Active';
    });
  }

  function getUserMemberships(userId) {
    return _getUserMemberships(userId || (_currentUser ? _currentUser.id : null));
  }

  // ─── Getters ───
  function isAuthenticated() { return !!_currentUser; }
  function currentUser() { return _currentUser; }

  // ─── Permission Resolution ───
  function _getEffectivePermissions() {
    if (!_currentUser || !_activeContext) return {};
    var role = _activeContext.role;
    if (role === 'super_admin') {
      return _getBaseRoles().super_admin || {};
    }
    if (_activeContext.customRoleId) {
      var cr = _getCustomRoles().find(function (r) { return r.id === _activeContext.customRoleId; });
      if (cr && cr.permissions) return cr.permissions;
    }
    return _getBaseRoles()[role] || {};
  }

  function hasPermission(perm) {
    if (!_currentUser || !_activeContext) return false;
    var perms = _getEffectivePermissions();
    return !!perms[perm];
  }

  function canAccessPage(page) {
    if (!_currentUser || !_activeContext) return false;
    var perms = _getEffectivePermissions();
    if (perms.pages === '*') return true;
    if (Array.isArray(perms.pages)) return perms.pages.indexOf(page) !== -1;
    return false;
  }

  var _contextPages = {
    backoffice: ['dashboard', 'sub-platforms', 'tenants', 'cost-pricing', 'cost-margin', 'cost-snapshots', 'cost-change-requests', 'plans-packages', 'plans-tokens', 'plans-bonus', 'payment-settings', 'platform-members', 'analytics-revenue', 'analytics-customers', 'billing', 'billing-verify', 'billing-credit', 'billing-overdue'],
    avatar: ['avatar-dashboard', 'avatar-tenants', 'hardware', 'devices', 'service-builder', 'knowledge-base', 'analytics-usage', 'platform-members'],
    devportal: ['dp-dashboard', 'dp-tenants', 'dp-api-presets', 'dp-assign-endpoint'],
  };

  // Pages that uniquely identify each context (used to determine visibility of context switcher)
  var _contextIdentifiers = {
    backoffice: ['dashboard', 'tenants', 'sub-platforms', 'cost-pricing', 'billing'],
    avatar: ['avatar-dashboard', 'hardware', 'devices', 'service-builder'],
    devportal: ['dp-dashboard', 'dp-tenants', 'dp-api-presets'],
  };

  function canAccessContext(ctx) {
    if (!_currentUser || !_activeContext) return false;
    var perms = _getEffectivePermissions();
    if (perms.pages === '*') return true;
    // Use identifier pages to determine context access (avoids overlap issues)
    var identifiers = _contextIdentifiers[ctx] || [];
    return identifiers.some(function (p) {
      return Array.isArray(perms.pages) && perms.pages.indexOf(p) !== -1;
    });
  }

  // ─── Scoped Data Access ───
  function getVisibleTenants() {
    if (!_activeContext) return [];
    var tenants = _getTenants();
    if (_activeContext.role === 'super_admin') return tenants;
    var myMemberships = _getUserMemberships(_currentUser.id);
    var tenantIds = [];
    myMemberships.forEach(function (m) {
      if (m.tenantId && tenantIds.indexOf(m.tenantId) === -1) {
        tenantIds.push(m.tenantId);
      }
    });
    return tenants.filter(function (t) { return tenantIds.indexOf(t.id) !== -1; });
  }

  function getVisibleSubPlatforms(tenantId) {
    var tid = tenantId || (_activeContext ? _activeContext.tenantId : null);
    if (!tid && _activeContext && _activeContext.role === 'super_admin') {
      return _getSubPlatforms();
    }
    if (!tid) return [];
    var subs = _getTenantSubs()[tid] || [];
    var spCodes = subs.map(function (s) { return s.subPlatformCode; });
    var allSPs = _getSubPlatforms();
    if (_activeContext && _activeContext.subPlatformId) {
      return allSPs.filter(function (sp) { return sp.id === _activeContext.subPlatformId; });
    }
    return allSPs.filter(function (sp) { return spCodes.indexOf(sp.code) !== -1; });
  }

  function highestRole() {
    if (!_currentUser) return null;
    var memberships = _getUserMemberships(_currentUser.id);
    var highest = null;
    memberships.forEach(function (m) {
      if (!highest || (_roleRank[m.role] || 0) > (_roleRank[highest.role] || 0)) {
        highest = m;
      }
    });
    return highest ? highest.role : null;
  }

  function needsHub() {
    if (!_currentUser) return false;
    var memberships = _getUserMemberships(_currentUser.id);
    return memberships.length > 1;
  }

  // ─── Auth Guard ───
  function guard() {
    if (isAuthenticated()) {
      if (!_activeContext) {
        _hideLogin();
        _showHub();
        return true;
      }
      _hideLogin();
      _showApp();
      _updateProfileUI();
      _filterSidebar();
      _filterContextSwitcher();
      return true;
    }
    _hideApp();
    _showLogin();
    return false;
  }

  // ─── Show/Hide Layers ───
  function _showApp() {
    var layout = document.querySelector('.app-layout');
    if (layout) layout.style.display = '';
  }
  function _hideApp() {
    var layout = document.querySelector('.app-layout');
    if (layout) layout.style.display = 'none';
  }

  // ─── Login UI ───
  function _showLogin() {
    var overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.innerHTML = renderLoginPage();
    setTimeout(function () { _bindLoginEvents(); }, 50);
  }
  function _hideLogin() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function _bindLoginEvents() {
    var form = document.getElementById('login-form');
    var emailInput = document.getElementById('login-email');
    var pwInput = document.getElementById('login-password');
    var errorEl = document.getElementById('login-error');
    var card = document.querySelector('.login-card');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = emailInput.value.trim();
        var pw = pwInput.value;

        var valid = true;
        if (!email) { emailInput.classList.add('is-invalid'); valid = false; }
        else { emailInput.classList.remove('is-invalid'); }
        if (!pw) { pwInput.classList.add('is-invalid'); valid = false; }
        else { pwInput.classList.remove('is-invalid'); }
        if (!valid) return;

        var result = login(email, pw);
        if (result === true) {
          _hideLogin();
          _showApp();
          _updateProfileUI();
          _filterSidebar();
          _filterContextSwitcher();
          var hash = location.hash.replace('#', '') || defaultPage();
          if (!canAccessPage(hash)) {
            location.hash = defaultPage();
          } else {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        } else if (result === 'invited') {
          _showSetPassword(email);
        } else if (result === 'hub') {
          _showHub();
        } else {
          errorEl.textContent = result;
          errorEl.classList.remove('hidden');
          if (card) {
            card.classList.remove('login-shake');
            void card.offsetWidth;
            card.classList.add('login-shake');
          }
        }
      });
    }

    // Demo account quick-fill
    setTimeout(function () {
      document.querySelectorAll('.login-demo-row').forEach(function (row) {
        row.addEventListener('click', function () {
          if (emailInput) emailInput.value = row.dataset.email || '';
          if (pwInput) pwInput.value = row.dataset.pw || '';
        });
      });
    }, 10);
  }

  // ─── Set Password Screen ───
  function _showSetPassword(email) {
    var user = _getUsers().find(function (u) { return u.email === email; });
    if (!user) return;
    var overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    overlay.innerHTML =
      '<div class="login-container">' +
        '<div class="login-card">' +
          '<div class="login-brand">' +
            '<img src="assets/Favicon-DarkMode.svg" alt="RealFact" style="width:48px;height:48px;object-fit:contain;">' +
            '<div class="login-brand-text">REALFACT</div>' +
            '<div class="login-brand-sub">ตั้งรหัสผ่าน</div>' +
          '</div>' +
          '<div style="text-align:center;margin-bottom:16px;">' +
            '<div class="text-sm text-muted">ยินดีต้อนรับ</div>' +
            '<div class="font-700" style="font-size:18px;">' + user.name + '</div>' +
            '<div class="mono text-sm text-muted">' + user.email + '</div>' +
          '</div>' +
          '<form id="set-password-form" class="login-form">' +
            '<div id="set-pw-error" class="login-error hidden">' +
              '<i class="fa-solid fa-circle-exclamation"></i> <span></span>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">รหัสผ่านใหม่</label>' +
              '<input type="password" id="set-pw-new" class="form-input" placeholder="อย่างน้อย 6 ตัวอักษร" autocomplete="new-password">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">ยืนยันรหัสผ่าน</label>' +
              '<input type="password" id="set-pw-confirm" class="form-input" placeholder="กรอกรหัสผ่านอีกครั้ง" autocomplete="new-password">' +
            '</div>' +
            '<button type="submit" class="btn btn-primary w-full" style="margin-top:8px;">' +
              '<i class="fa-solid fa-shield-halved"></i> ตั้งรหัสผ่านและเข้าใช้งาน' +
            '</button>' +
          '</form>' +
          '<div style="text-align:center;margin-top:12px;">' +
            '<a href="#" id="set-pw-back" class="text-sm text-muted" style="text-decoration:underline;">กลับหน้า Login</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    setTimeout(function () {
      var form = document.getElementById('set-password-form');
      var newPw = document.getElementById('set-pw-new');
      var confirmPw = document.getElementById('set-pw-confirm');
      var errorEl = document.getElementById('set-pw-error');
      var backBtn = document.getElementById('set-pw-back');

      if (backBtn) {
        backBtn.addEventListener('click', function (e) {
          e.preventDefault();
          _showLogin();
        });
      }

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var pw1 = newPw.value;
          var pw2 = confirmPw.value;
          var formValid = true;

          if (!pw1 || pw1.length < 6) {
            newPw.classList.add('is-invalid');
            errorEl.querySelector('span').textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
            errorEl.classList.remove('hidden');
            formValid = false;
          } else { newPw.classList.remove('is-invalid'); }

          if (pw1 !== pw2) {
            confirmPw.classList.add('is-invalid');
            errorEl.querySelector('span').textContent = 'รหัสผ่านไม่ตรงกัน';
            errorEl.classList.remove('hidden');
            formValid = false;
          } else { confirmPw.classList.remove('is-invalid'); }

          if (!formValid) return;

          if (setPassword(email, pw1)) {
            _hideLogin();
            _showApp();
            _updateProfileUI();
            _filterSidebar();
            _filterContextSwitcher();
            if (window.App) App.toast('ตั้งรหัสผ่านสำเร็จ! ยินดีต้อนรับ ' + user.name, 'success');
            location.hash = defaultPage();
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        });
      }
    }, 50);
  }

  // ─── Hub: Context Picker ───
  function _showHub() {
    var overlay = document.getElementById('login-overlay');
    if (!overlay) return;
    _hideApp();
    overlay.classList.remove('hidden');
    overlay.innerHTML = _renderHub();
    setTimeout(function () { _bindHubEvents(); }, 50);
  }

  function _renderHub() {
    var memberships = _getUserMemberships(_currentUser.id);
    var tenants = _getTenants();
    var subPlatforms = _getSubPlatforms();

    var _rl = {
      super_admin: 'Owner', tenant_admin: 'Tenant Admin',
      subplatform_admin: 'SP Admin', subplatform_member: 'Member',
    };
    var _ri = {
      super_admin: 'fa-crown', tenant_admin: 'fa-building',
      subplatform_admin: 'fa-cubes', subplatform_member: 'fa-user',
    };
    var _rc = {
      super_admin: 'chip-orange', tenant_admin: 'chip-blue',
      subplatform_admin: 'chip-green', subplatform_member: 'chip-gray',
    };

    var cards = memberships.map(function (mb) {
      var tenant = mb.tenantId ? tenants.find(function (t) { return t.id === mb.tenantId; }) : null;
      var sp = mb.subPlatformId ? subPlatforms.find(function (s) { return s.id === mb.subPlatformId; }) : null;
      var cr = mb.customRoleId ? _getCustomRoles().find(function (r) { return r.id === mb.customRoleId; }) : null;

      var title = '';
      if (mb.role === 'super_admin') {
        title = 'ทุก Tenant (Global)';
      } else if (tenant) {
        title = tenant.name;
        if (sp) title += ' &rsaquo; ' + sp.name;
      }

      var crBadge = cr ? ' <span class="chip chip-blue" style="font-size:9px;">' + cr.name + '</span>' : '';

      return '<div class="hub-card" data-mb-id="' + mb.id + '" tabindex="0" style="border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;transition:all .15s;">' +
        '<div class="flex items-center gap-12">' +
          '<div style="width:42px;height:42px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;">' +
            '<i class="fa-solid ' + (_ri[mb.role] || 'fa-user') + '" style="font-size:18px;color:var(--primary);"></i>' +
          '</div>' +
          '<div style="flex:1;">' +
            '<div class="font-600" style="font-size:15px;">' + title + '</div>' +
            '<div class="flex items-center gap-6 mt-4" style="flex-wrap:wrap;">' +
              '<span class="chip ' + (_rc[mb.role] || 'chip-gray') + '" style="font-size:9px;">' + (_rl[mb.role] || mb.role) + '</span>' +
              crBadge +
            '</div>' +
          '</div>' +
          '<i class="fa-solid fa-chevron-right text-muted"></i>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="login-container">' +
      '<div class="login-card" style="max-width:520px;">' +
        '<div class="login-brand">' +
          '<img src="assets/Favicon-DarkMode.svg" alt="RealFact" style="width:48px;height:48px;object-fit:contain;">' +
          '<div class="login-brand-text">REALFACT</div>' +
          '<div class="login-brand-sub">เลือก Context เข้าใช้งาน</div>' +
        '</div>' +
        '<div style="text-align:center;margin-bottom:16px;">' +
          '<div class="text-sm text-muted">สวัสดี</div>' +
          '<div class="font-700" style="font-size:18px;">' + _currentUser.name + '</div>' +
          '<div class="mono text-sm text-muted">' + _currentUser.email + '</div>' +
        '</div>' +
        '<div class="text-xs uppercase text-muted font-600 mb-8">' +
          '<i class="fa-solid fa-building"></i> คุณมีสิทธิ์ใน ' + memberships.length + ' Tenant — เลือกเพื่อเข้าจัดการ' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          cards +
        '</div>' +
        '<div style="margin-top:16px;text-align:center;">' +
          '<a href="#" id="hub-logout" class="text-sm text-muted" style="text-decoration:underline;"><i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function _bindHubEvents() {
    document.querySelectorAll('.hub-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var mbId = card.dataset.mbId;
        if (switchContext(mbId)) {
          _hideLogin();
          _showApp();
          _updateProfileUI();
          _filterSidebar();
          _filterContextSwitcher();
          location.hash = defaultPage();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
          if (window.App) App.toast('เข้าใช้งานสำเร็จ', 'success');
        }
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') card.click();
      });
    });

    var logoutBtn = document.getElementById('hub-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  // ─── Build Demo Popover HTML for a user email ───
  function _buildDemoPopover(email) {
    var d = window.MockData;
    if (!d) return '';
    var user = (d.users || []).find(function (u) { return u.email === email; });
    if (!user) return '';
    var memberships = (d.userMemberships || []).filter(function (m) { return m.userId === user.id && m.status !== 'Suspended'; });
    if (!memberships.length) return '';

    var roleLabels = { super_admin: 'Owner', tenant_admin: 'Tenant Admin', subplatform_admin: 'SP Admin', subplatform_member: 'Member' };
    var roleChips = { super_admin: 'chip-orange', tenant_admin: 'chip-blue', subplatform_admin: 'chip-green', subplatform_member: 'chip-purple' };
    var permLabels = {
      canEdit: '<i class="fa-solid fa-pen"></i> แก้ไข',
      canDelete: '<i class="fa-solid fa-trash"></i> ลบ',
      canApprove: '<i class="fa-solid fa-check-double"></i> อนุมัติ',
      canManageMembers: '<i class="fa-solid fa-users-gear"></i> จัดการสมาชิก',
      canViewBilling: '<i class="fa-solid fa-file-invoice"></i> Billing',
      canViewAnalytics: '<i class="fa-solid fa-chart-column"></i> Analytics',
    };

    var mb = memberships[0];
    var role = mb.role;
    var basePerm = d.rolePermissions[role] || {};
    var customRole = mb.customRoleId ? (d.customRoles || []).find(function (c) { return c.id === mb.customRoleId; }) : null;
    var effectivePerm = customRole ? customRole.permissions : basePerm;

    // Scope info
    var scopeParts = [];
    if (role === 'super_admin') {
      scopeParts.push('<span class="chip chip-orange" style="font-size:9px;">Global — ทุก Tenant</span>');
    } else {
      memberships.forEach(function (m) {
        var tenant = m.tenantId ? (d.tenants || []).find(function (t) { return t.id === m.tenantId; }) : null;
        var sp = m.subPlatformId ? (d.subPlatforms || []).find(function (s) { return s.id === m.subPlatformId; }) : null;
        var label = tenant ? tenant.name : '';
        if (sp) label += ' → ' + sp.name;
        scopeParts.push('<span class="chip chip-gray" style="font-size:9px;">' + label + '</span>');
      });
    }

    // Permissions list
    var permHtml = '';
    Object.keys(permLabels).forEach(function (key) {
      var has = effectivePerm[key];
      permHtml += '<span class="demo-popover-perm ' + (has ? 'active' : 'denied') + '">' + permLabels[key] + '</span>';
    });

    // Pages count
    var pages = effectivePerm.pages;
    var pageText = pages === '*' ? 'ทุกหน้า (All Pages)' : (Array.isArray(pages) ? pages.length + ' หน้า' : '-');

    var html = '<div class="demo-popover">' +
      '<div class="demo-popover-name">' + user.name + '</div>' +
      '<div class="demo-popover-section">Scope</div>' +
      '<div class="demo-popover-scope">' + scopeParts.join('') + '</div>' +
      (customRole ? '<div class="demo-popover-section">Custom Role</div><div style="font-size:11px;color:var(--text);">' + customRole.name + '</div>' : '') +
      '<div class="demo-popover-section">สิทธิ์การใช้งาน</div>' +
      '<div class="demo-popover-perms">' + permHtml + '</div>' +
      '<div class="demo-popover-section">เข้าถึงหน้า</div>' +
      '<div class="demo-popover-pages">' + pageText + '</div>' +
    '</div>';
    return html;
  }

  // ─── Render Login Page HTML ───
  function renderLoginPage() {
    var demoAccounts = [
      { email: 'admin@realfact.ai',       pw: 'admin123',  chip: 'chip-orange', label: 'Owner' },
      { email: 'somphon@realfact.ai',      pw: 'tenant123', chip: 'chip-blue',   label: 'Tenant Admin' },
      { email: 'wichai@realfact.ai',       pw: 'spadmin123', chip: 'chip-green',  label: 'SP Admin' },
      { email: 'napa@realfact.ai',         pw: 'member123', chip: 'chip-purple',  label: 'Member' },
      { email: 'new.member@realfact.ai',   pw: '',          chip: 'chip-blue',    label: 'Invited' },
    ];

    var demoRows = demoAccounts.map(function (acc) {
      return '<div class="login-demo-row" data-email="' + acc.email + '" data-pw="' + acc.pw + '">' +
        '<span class="chip ' + acc.chip + '" style="font-size:10px;">' + acc.label + '</span>' +
        '<span class="mono text-xs">' + acc.email + '</span>' +
        _buildDemoPopover(acc.email) +
      '</div>';
    }).join('');

    return '<div class="login-container">' +
      '<div class="login-card">' +
        '<div class="login-brand">' +
          '<img src="assets/Favicon-DarkMode.svg" alt="RealFact" style="width:48px;height:48px;object-fit:contain;">' +
          '<div class="login-brand-text">REALFACT</div>' +
          '<div class="login-brand-sub">Avatar Backoffice</div>' +
        '</div>' +
        '<form id="login-form" class="login-form">' +
          '<div id="login-error" class="login-error hidden">' +
            '<i class="fa-solid fa-circle-exclamation"></i> <span>Email หรือ Password ไม่ถูกต้อง</span>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Email</label>' +
            '<input type="email" id="login-email" class="form-input" placeholder="email@realfact.ai" autocomplete="username">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Password</label>' +
            '<input type="password" id="login-password" class="form-input" placeholder="Password" autocomplete="current-password">' +
          '</div>' +
          '<button type="submit" class="btn btn-primary w-full" style="margin-top:8px;">' +
            '<i class="fa-solid fa-right-to-bracket"></i> Login' +
          '</button>' +
        '</form>' +
        '<div class="login-footer">' +
          '<div class="text-xs text-dim" style="margin-top:20px;text-align:center;">Demo Accounts <span class="text-dim" style="font-size:9px;opacity:.5;">(hover เพื่อดูสิทธิ์)</span></div>' +
          '<div class="login-demo-accounts">' +
            demoRows +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── Update Profile in Topbar ───
  var _roleLabels = {
    super_admin: 'Owner', tenant_admin: 'Tenant Admin',
    subplatform_admin: 'SP Admin', subplatform_member: 'Member',
  };
  var _roleChipClasses = {
    super_admin: 'chip-orange', tenant_admin: 'chip-blue',
    subplatform_admin: 'chip-green', subplatform_member: 'chip-gray',
  };

  function _updateProfileUI() {
    if (!_currentUser) return;
    var u = _currentUser;
    var role = _activeContext ? _activeContext.role : 'unknown';
    var rl = _roleLabels[role] || role;
    var rc = _roleChipClasses[role] || 'chip-gray';

    var contextLabel = '';
    if (_activeContext) {
      if (_activeContext.role === 'super_admin') {
        contextLabel = 'All Tenants';
      } else {
        var tenant = _activeContext.tenantId ? _getTenants().find(function (t) { return t.id === _activeContext.tenantId; }) : null;
        var sp = _activeContext.subPlatformId ? _getSubPlatforms().find(function (s) { return s.id === _activeContext.subPlatformId; }) : null;
        if (tenant) contextLabel = tenant.name;
        if (sp) contextLabel += ' > ' + sp.name;
      }
    }

    var avatarEl = document.getElementById('user-profile-btn');
    if (avatarEl) { avatarEl.textContent = u.initials; avatarEl.title = u.name + ' (' + rl + ')'; }
    var nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.textContent = u.name;
    var roleEl = document.getElementById('user-role-badge');
    if (roleEl) { roleEl.className = 'chip ' + rc; roleEl.style.fontSize = '10px'; roleEl.textContent = rl; }

    var ctxEl = document.getElementById('user-context-badge');
    if (ctxEl) {
      ctxEl.textContent = contextLabel;
      ctxEl.style.display = contextLabel ? '' : 'none';
    }

    var pdAvatar = document.getElementById('pd-avatar');
    if (pdAvatar) pdAvatar.textContent = u.initials;
    var pdName = document.getElementById('pd-name');
    if (pdName) pdName.textContent = u.name;
    var pdEmail = document.getElementById('pd-email');
    if (pdEmail) pdEmail.textContent = u.email;
    var pdRole = document.getElementById('pd-role');
    if (pdRole) pdRole.innerHTML = '<span class="chip ' + rc + '" style="font-size:9px;">' + rl + '</span>';
    var pdContext = document.getElementById('pd-context');
    if (pdContext) pdContext.textContent = contextLabel;

    // Show/hide switch button and context section based on membership count
    var memberships = _getUserMemberships(_currentUser.id);
    var switchBtn = document.getElementById('pd-switch-context');
    if (switchBtn) switchBtn.style.display = memberships.length > 1 ? '' : 'none';
    var ctxSection = document.getElementById('pd-context-section');
    if (ctxSection) ctxSection.style.display = contextLabel ? '' : 'none';
  }

  // ─── Profile Dropdown Toggle ───
  function _initProfileDropdown() {
    var wrap = document.getElementById('user-profile-wrap');
    if (!wrap) return;

    wrap.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });

    var switchBtn = document.getElementById('pd-switch-context');
    if (switchBtn) {
      switchBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.classList.remove('open');
        _showHub();
      });
    }

    var settingsBtn = document.getElementById('pd-account-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.classList.remove('open');
        showProfileModal();
      });
    }

    var logoutBtn = document.getElementById('pd-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.classList.remove('open');
        logout();
      });
    }
  }

  // ─── Account Settings Modal ───
  function showProfileModal() {
    if (!_currentUser) return;
    var u = _currentUser;
    var role = _activeContext ? _activeContext.role : 'unknown';
    var roleLabel = _roleLabels[role] || role;
    var roleChipCls = _roleChipClasses[role] || 'chip-gray';
    var perms = _getEffectivePermissions();

    var customRoleInfo = '';
    if (_activeContext && _activeContext.customRoleId) {
      var cr = _getCustomRoles().find(function (r) { return r.id === _activeContext.customRoleId; });
      if (cr) customRoleInfo = '<span class="chip chip-blue" style="font-size:9px;margin-left:4px;">' + cr.name + '</span>';
    }

    var accessiblePages = [];
    var ctxLabels = { backoffice: 'Backoffice', avatar: 'Avatar', devportal: 'Developer Portal' };
    ['backoffice', 'avatar', 'devportal'].forEach(function (ctx) {
      if (!canAccessContext(ctx)) return;
      var pagesInCtx = _contextPages[ctx] || [];
      var accessible = [];
      pagesInCtx.forEach(function (p) {
        if (canAccessPage(p)) accessible.push(p);
      });
      if (accessible.length > 0) {
        accessiblePages.push({ ctx: ctx, label: ctxLabels[ctx], count: accessible.length, total: pagesInCtx.length });
      }
    });

    var accessSummary = accessiblePages.map(function (a) {
      return '<div class="flex items-center gap-8" style="padding:6px 0;">' +
        '<i class="fa-solid ' + (a.ctx === 'backoffice' ? 'fa-building' : a.ctx === 'avatar' ? 'fa-robot' : 'fa-code') + ' text-muted" style="width:18px;"></i>' +
        '<span class="text-sm font-600">' + a.label + '</span>' +
        '<span class="chip chip-blue" style="font-size:10px;margin-left:auto;">' + a.count + '/' + a.total + ' หน้า</span>' +
      '</div>';
    }).join('');

    var permIcon = function (val) {
      return val
        ? '<i class="fa-solid fa-circle-check text-success"></i>'
        : '<i class="fa-solid fa-circle-xmark" style="opacity:.3;"></i>';
    };

    window.App.showModal(
      '<div class="modal" style="max-width:520px;">' +
        '<button class="modal-close" onclick="App.closeModal()"><i class="fa-solid fa-xmark"></i></button>' +
        '<div class="modal-title"><i class="fa-solid fa-gear text-primary"></i> ตั้งค่าบัญชี</div>' +
        '<div class="text-xs uppercase text-muted font-600" style="margin:16px 0 8px;"><i class="fa-solid fa-user"></i> ข้อมูลส่วนตัว</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div class="flex items-center gap-14 mb-14">' +
            '<div class="user-avatar" id="acct-avatar" style="width:52px;height:52px;font-size:20px;">' + u.initials + '</div>' +
            '<div style="flex:1;"><div class="form-group" style="margin-bottom:0;"><label class="form-label">ชื่อ</label><input class="form-input" id="acct-name" value="' + u.name + '" style="font-size:15px;"></div></div>' +
          '</div>' +
          '<div class="flex gap-10">' +
            '<div style="flex:1;"><div class="text-xs text-muted">Email</div><div class="mono text-sm" style="margin-top:2px;">' + u.email + '</div></div>' +
            '<div><div class="text-xs text-muted">Role</div><div style="margin-top:2px;"><span class="chip ' + roleChipCls + '">' + roleLabel + '</span>' + customRoleInfo + '</div></div>' +
          '</div>' +
          '<div style="margin-top:12px;text-align:right;"><button class="btn btn-sm btn-primary" id="acct-save-profile"><i class="fa-solid fa-save"></i> บันทึกชื่อ</button></div>' +
        '</div>' +
        '<div class="text-xs uppercase text-muted font-600" style="margin-bottom:8px;"><i class="fa-solid fa-lock"></i> เปลี่ยนรหัสผ่าน</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div id="acct-pw-error" class="hidden" style="background:rgba(239,68,68,.1);border:1px solid var(--error);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:13px;color:var(--error);"><i class="fa-solid fa-circle-exclamation"></i> <span></span></div>' +
          '<div id="acct-pw-success" class="hidden" style="background:rgba(34,197,94,.1);border:1px solid var(--success);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:13px;color:var(--success);"><i class="fa-solid fa-circle-check"></i> เปลี่ยนรหัสผ่านสำเร็จ</div>' +
          '<div class="flex-col gap-10">' +
            '<div class="form-group" style="margin-bottom:0;"><label class="form-label">รหัสผ่านปัจจุบัน</label><input type="password" class="form-input" id="acct-pw-current" placeholder="กรอกรหัสผ่านปัจจุบัน" autocomplete="current-password"></div>' +
            '<div class="form-group" style="margin-bottom:0;"><label class="form-label">รหัสผ่านใหม่</label><input type="password" class="form-input" id="acct-pw-new" placeholder="อย่างน้อย 6 ตัวอักษร" autocomplete="new-password"></div>' +
            '<div class="form-group" style="margin-bottom:0;"><label class="form-label">ยืนยันรหัสผ่านใหม่</label><input type="password" class="form-input" id="acct-pw-confirm" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" autocomplete="new-password"></div>' +
          '</div>' +
          '<div style="margin-top:12px;text-align:right;"><button class="btn btn-sm btn-primary" id="acct-change-pw"><i class="fa-solid fa-shield-halved"></i> เปลี่ยนรหัสผ่าน</button></div>' +
        '</div>' +
        '<div class="text-xs uppercase text-muted font-600" style="margin-bottom:8px;"><i class="fa-solid fa-shield-halved"></i> สิทธิ์การใช้งาน</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div class="flex gap-16 mb-12" style="flex-wrap:wrap;">' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canEdit) + '<span class="text-sm">แก้ไขข้อมูล</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canDelete) + '<span class="text-sm">ลบข้อมูล</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canApprove) + '<span class="text-sm">อนุมัติ</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canManageMembers) + '<span class="text-sm">จัดการสมาชิก</span></div>' +
          '</div>' +
          '<div style="border-top:1px solid var(--border);padding-top:10px;"><div class="text-xs text-muted font-600 mb-6">การเข้าถึง Context</div>' + accessSummary + '</div>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>' +
          '<button class="btn btn-danger" id="modal-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>' +
        '</div>' +
      '</div>'
    );

    setTimeout(function () {
      var saveProfileBtn = document.getElementById('acct-save-profile');
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function () {
          var nameInput = document.getElementById('acct-name');
          var newName = nameInput.value.trim();
          if (!newName) { nameInput.classList.add('is-invalid'); return; }
          nameInput.classList.remove('is-invalid');
          u.name = newName;
          var parts = newName.split(' ');
          u.initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : newName.slice(0, 2).toUpperCase();
          var avatarEl = document.getElementById('acct-avatar');
          if (avatarEl) avatarEl.textContent = u.initials;
          _updateProfileUI();
          App.toast('อัปเดตชื่อเป็น "' + newName + '" สำเร็จ', 'success');
        });
      }

      var changePwBtn = document.getElementById('acct-change-pw');
      if (changePwBtn) {
        changePwBtn.addEventListener('click', function () {
          var currentPw = document.getElementById('acct-pw-current');
          var newPwEl = document.getElementById('acct-pw-new');
          var confirmPwEl = document.getElementById('acct-pw-confirm');
          var errorEl = document.getElementById('acct-pw-error');
          var successEl = document.getElementById('acct-pw-success');
          currentPw.classList.remove('is-invalid');
          newPwEl.classList.remove('is-invalid');
          confirmPwEl.classList.remove('is-invalid');
          errorEl.classList.add('hidden');
          successEl.classList.add('hidden');
          function showError(msg) { errorEl.querySelector('span').textContent = msg; errorEl.classList.remove('hidden'); }
          if (!currentPw.value) { currentPw.classList.add('is-invalid'); showError('กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
          if (currentPw.value !== u.password) { currentPw.classList.add('is-invalid'); showError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }
          if (!newPwEl.value || newPwEl.value.length < 6) { newPwEl.classList.add('is-invalid'); showError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
          if (newPwEl.value === currentPw.value) { newPwEl.classList.add('is-invalid'); showError('รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน'); return; }
          if (newPwEl.value !== confirmPwEl.value) { confirmPwEl.classList.add('is-invalid'); showError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
          u.password = newPwEl.value;
          currentPw.value = '';
          newPwEl.value = '';
          confirmPwEl.value = '';
          successEl.classList.remove('hidden');
        });
      }

      var logoutBtn = document.getElementById('modal-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          App.closeModal();
          logout();
        });
      }
    }, 50);
  }

  // ─── Filter Sidebar Items by Role ───
  function _filterSidebar() {
    if (!_currentUser) return;
    document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
      var page = el.dataset.page;
      var hidden = !canAccessPage(page);
      el.style.display = hidden ? 'none' : '';
      if (hidden) el.setAttribute('data-rbac-hidden', '');
      else el.removeAttribute('data-rbac-hidden');
    });
    document.querySelectorAll('.nav-sub-group').forEach(function (group) {
      var visible = group.querySelectorAll('.nav-item[data-page]:not([data-rbac-hidden])');
      var header = document.querySelector('[data-toggle="' + group.id + '"]');
      if (header) header.style.display = visible.length > 0 ? '' : 'none';
      if (visible.length === 0) group.style.display = 'none';
      else group.style.display = '';
    });
  }

  // ─── Filter Context Switcher by Role ───
  function _filterContextSwitcher() {
    if (!_currentUser) return;
    document.querySelectorAll('.ctx-dropdown-item[data-ctx]').forEach(function (item) {
      item.style.display = canAccessContext(item.dataset.ctx) ? '' : 'none';
    });
  }

  // ─── Default Landing Page (first accessible page) ───
  function defaultPage() {
    if (!_activeContext) return 'dashboard';
    var perms = _getEffectivePermissions();
    if (perms.pages === '*') return 'dashboard';
    if (Array.isArray(perms.pages) && perms.pages.length > 0) return perms.pages[0];
    return 'dashboard';
  }

  // ─── Tenant Scoping Helpers ───
  // Returns active tenantId, or null if Owner (sees all)
  function scopedTenantId() {
    if (!_activeContext) return null;
    if (_activeContext.role === 'super_admin') return null; // Owner sees all
    return _activeContext.tenantId || null;
  }

  // Returns active subPlatformId, or null if not SP-scoped
  function scopedSubPlatformId() {
    if (!_activeContext) return null;
    return _activeContext.subPlatformId || null;
  }

  // Returns true if current user is Owner (sees everything)
  function isOwner() {
    return _activeContext && _activeContext.role === 'super_admin';
  }

  // ─── Public API ───
  return {
    init: init,
    login: login,
    logout: logout,
    setPassword: setPassword,
    isAuthenticated: isAuthenticated,
    currentUser: currentUser,
    activeContext: activeContext,
    switchContext: switchContext,
    getUserMemberships: getUserMemberships,
    getVisibleTenants: getVisibleTenants,
    getVisibleSubPlatforms: getVisibleSubPlatforms,
    highestRole: highestRole,
    needsHub: needsHub,
    hasPermission: hasPermission,
    canAccessPage: canAccessPage,
    canAccessContext: canAccessContext,
    guard: guard,
    renderLoginPage: renderLoginPage,
    showProfileModal: showProfileModal,
    initProfileDropdown: _initProfileDropdown,
    filterSidebar: _filterSidebar,
    filterContextSwitcher: _filterContextSwitcher,
    updateProfileUI: _updateProfileUI,
    defaultPage: defaultPage,
    scopedTenantId: scopedTenantId,
    scopedSubPlatformId: scopedSubPlatformId,
    isOwner: isOwner,
  };
})();
