/* ================================================================
   Auth + RBAC Module
   Mock authentication with role-based access control
   ================================================================ */

window.Auth = (function () {
  'use strict';

  // ─── Users: read from MockData.platformMembers (fallback for safety) ───
  function _getUsers() {
    return (window.MockData && window.MockData.platformMembers) || [];
  }

  // ─── RBAC Permission Matrix (reads from MockData for live editing) ───
  function _getRoles() {
    return (window.MockData && window.MockData.rolePermissions) || {};
  }

  var SESSION_KEY = 'rfa_session';
  var _currentUser = null;

  // ─── Init: check localStorage for existing session ───
  function init() {
    var stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        var session = JSON.parse(stored);
        var user = _getUsers().find(function (u) { return u.email === session.email && u.status === 'Active'; });
        if (user) {
          _currentUser = user;
          return true;
        }
      } catch (e) { /* invalid session */ }
      localStorage.removeItem(SESSION_KEY);
    }
    return false;
  }

  // ─── Login ───
  // Returns: true (success), 'invited' (needs set password), or string (error message)
  function login(email, password) {
    var user = _getUsers().find(function (u) { return u.email === email; });
    if (!user) return 'ไม่พบบัญชีนี้ในระบบ';
    if (user.status === 'Suspended') return 'บัญชีนี้ถูกระงับการใช้งาน';
    if (user.status === 'Invited' && !user.password) return 'invited';
    if (user.password !== password) return 'Email หรือ Password ไม่ถูกต้อง';
    _currentUser = user;
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: user.email, role: user.role, loginTime: new Date().toISOString(),
    }));
    return true;
  }

  // ─── Set Password (for Invited users) ───
  function setPassword(email, newPassword) {
    var user = _getUsers().find(function (u) { return u.email === email; });
    if (!user) return false;
    user.password = newPassword;
    user.status = 'Active';
    user.modifiedDate = new Date().toISOString().slice(0, 10);
    user.modifiedBy = email;
    // Auto-login after set password
    _currentUser = user;
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: user.email, role: user.role, loginTime: new Date().toISOString(),
    }));
    return true;
  }

  // ─── Logout ───
  function logout() {
    _currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    // Hide main UI, show login
    _hideApp();
    _showLogin();
  }

  // ─── Getters ───
  function isAuthenticated() { return !!_currentUser; }
  function currentUser() { return _currentUser; }

  // ─── Permission Checks ───
  function hasPermission(perm) {
    if (!_currentUser) return false;
    var roleConfig = _getRoles()[_currentUser.role];
    if (!roleConfig) return false;
    return !!roleConfig[perm];
  }

  function canAccessPage(page) {
    if (!_currentUser) return false;
    var roleConfig = _getRoles()[_currentUser.role];
    if (!roleConfig) return false;
    if (roleConfig.pages === '*') return true;
    return roleConfig.pages.indexOf(page) !== -1;
  }

  // Context→pages mapping (derived from route map)
  var _contextPages = {
    backoffice: ['dashboard', 'sub-platforms', 'tenants', 'cost-pricing', 'cost-margin', 'cost-snapshots', 'cost-change-requests', 'plans-packages', 'plans-tokens', 'plans-bonus', 'payment-settings', 'platform-members', 'analytics-revenue', 'analytics-usage', 'analytics-customers', 'billing', 'billing-verify', 'billing-credit', 'billing-overdue'],
    avatar: ['avatar-dashboard', 'avatar-tenants', 'hardware', 'devices', 'service-builder', 'knowledge-base'],
    devportal: ['dp-dashboard', 'dp-tenants', 'dp-api-presets', 'dp-assign-endpoint'],
  };

  function canAccessContext(ctx) {
    if (!_currentUser) return false;
    var roleConfig = _getRoles()[_currentUser.role];
    if (!roleConfig) return false;
    if (roleConfig.pages === '*') return true;
    var pagesInCtx = _contextPages[ctx] || [];
    return pagesInCtx.some(function (p) { return roleConfig.pages.indexOf(p) !== -1; });
  }

  // ─── Auth Guard (called from router) ───
  function guard() {
    if (isAuthenticated()) {
      _hideLogin();
      _showApp();
      _updateProfileUI();
      return true;
    }
    _hideApp();
    _showLogin();
    return false;
  }

  // ─── Show/Hide App ───
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

    // Bind events after render
    setTimeout(function () {
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

          // Validate
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
            // Navigate to appropriate default page
            var hash = location.hash.replace('#', '') || 'dashboard';
            if (!canAccessPage(hash)) {
              location.hash = 'dashboard';
            } else {
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
          } else if (result === 'invited') {
            // Show set password screen
            _showSetPassword(email);
          } else {
            errorEl.textContent = result;
            errorEl.classList.remove('hidden');
            if (card) {
              card.classList.remove('login-shake');
              void card.offsetWidth; // trigger reflow
              card.classList.add('login-shake');
            }
          }
        });
      }
    }, 50);
  }

  function _hideLogin() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // ─── Set Password Screen (for Invited members) ───
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
          var valid = true;

          if (!pw1 || pw1.length < 6) {
            newPw.classList.add('is-invalid');
            errorEl.querySelector('span').textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
            errorEl.classList.remove('hidden');
            valid = false;
          } else { newPw.classList.remove('is-invalid'); }

          if (pw1 !== pw2) {
            confirmPw.classList.add('is-invalid');
            errorEl.querySelector('span').textContent = 'รหัสผ่านไม่ตรงกัน';
            errorEl.classList.remove('hidden');
            valid = false;
          } else { confirmPw.classList.remove('is-invalid'); }

          if (!valid) return;

          if (setPassword(email, pw1)) {
            _hideLogin();
            _showApp();
            _updateProfileUI();
            _filterSidebar();
            _filterContextSwitcher();
            if (window.App) App.toast('ตั้งรหัสผ่านสำเร็จ! ยินดีต้อนรับ ' + user.name, 'success');
            location.hash = 'dashboard';
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        });
      }
    }, 50);
  }

  // ─── Render Login Page HTML ───
  function renderLoginPage() {
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
          '<div class="text-xs text-dim" style="margin-top:20px;text-align:center;">Demo Accounts</div>' +
          '<div class="login-demo-accounts">' +
            '<div class="login-demo-row" data-email="admin@realfact.ai" data-pw="admin123">' +
              '<span class="chip chip-orange" style="font-size:10px;">Super Admin</span>' +
              '<span class="mono text-xs">admin@realfact.ai</span>' +
            '</div>' +
            '<div class="login-demo-row" data-email="platform@realfact.ai" data-pw="platform123">' +
              '<span class="chip chip-blue" style="font-size:10px;">Platform</span>' +
              '<span class="mono text-xs">platform@realfact.ai</span>' +
            '</div>' +
            '<div class="login-demo-row" data-email="finance@realfact.ai" data-pw="finance123">' +
              '<span class="chip chip-green" style="font-size:10px;">Finance</span>' +
              '<span class="mono text-xs">finance@realfact.ai</span>' +
            '</div>' +
            '<div class="login-demo-row" data-email="viewer@realfact.ai" data-pw="viewer123">' +
              '<span class="chip chip-gray" style="font-size:10px;">Viewer</span>' +
              '<span class="mono text-xs">viewer@realfact.ai</span>' +
            '</div>' +
            '<div class="login-demo-row" data-email="new.member@realfact.ai" data-pw="">' +
              '<span class="chip chip-blue" style="font-size:10px;">Invited</span>' +
              '<span class="mono text-xs">new.member@realfact.ai</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ─── Update Profile in Topbar ───
  var _roleLabels = {
    super_admin: 'Super Admin', platform_admin: 'Platform Admin',
    finance: 'Finance', viewer: 'Viewer',
  };
  var _roleChipClasses = {
    super_admin: 'chip-orange', platform_admin: 'chip-blue',
    finance: 'chip-green', viewer: 'chip-gray',
  };

  function _updateProfileUI() {
    if (!_currentUser) return;
    var u = _currentUser;
    var rl = _roleLabels[u.role] || u.role;
    var rc = _roleChipClasses[u.role] || 'chip-gray';

    // Topbar
    var avatarEl = document.getElementById('user-profile-btn');
    if (avatarEl) { avatarEl.textContent = u.initials; avatarEl.title = u.name + ' (' + u.role + ')'; }
    var nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.textContent = u.name;
    var roleEl = document.getElementById('user-role-badge');
    if (roleEl) { roleEl.className = 'chip ' + rc; roleEl.style.fontSize = '10px'; roleEl.textContent = rl; }

    // Dropdown
    var pdAvatar = document.getElementById('pd-avatar');
    if (pdAvatar) pdAvatar.textContent = u.initials;
    var pdName = document.getElementById('pd-name');
    if (pdName) pdName.textContent = u.name;
    var pdEmail = document.getElementById('pd-email');
    if (pdEmail) pdEmail.textContent = u.email;
    var pdRole = document.getElementById('pd-role');
    if (pdRole) pdRole.innerHTML = '<span class="chip ' + rc + '" style="font-size:9px;">' + rl + '</span>';
  }

  // ─── Profile Dropdown Toggle ───
  function _initProfileDropdown() {
    var wrap = document.getElementById('user-profile-wrap');
    if (!wrap) return;

    wrap.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });

    // Account Settings button
    var settingsBtn = document.getElementById('pd-account-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.classList.remove('open');
        showProfileModal();
      });
    }

    // Logout button
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
    var roleLabel = {
      super_admin: 'Super Admin', platform_admin: 'Platform Admin',
      finance: 'Finance', viewer: 'Viewer (Read-Only)',
    };
    var roleChip = {
      super_admin: 'chip-orange', platform_admin: 'chip-blue',
      finance: 'chip-green', viewer: 'chip-gray',
    };
    var perms = _getRoles()[u.role] || {};

    // Build accessible pages list grouped by context
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

        // ── Profile Section ──
        '<div class="text-xs uppercase text-muted font-600" style="margin:16px 0 8px;">' +
          '<i class="fa-solid fa-user"></i> ข้อมูลส่วนตัว' +
        '</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div class="flex items-center gap-14 mb-14">' +
            '<div class="user-avatar" id="acct-avatar" style="width:52px;height:52px;font-size:20px;">' + u.initials + '</div>' +
            '<div style="flex:1;">' +
              '<div class="form-group" style="margin-bottom:0;">' +
                '<label class="form-label">ชื่อ</label>' +
                '<input class="form-input" id="acct-name" value="' + u.name + '" style="font-size:15px;">' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex gap-10">' +
            '<div style="flex:1;">' +
              '<div class="text-xs text-muted">Email</div>' +
              '<div class="mono text-sm" style="margin-top:2px;">' + u.email + '</div>' +
            '</div>' +
            '<div>' +
              '<div class="text-xs text-muted">Role</div>' +
              '<div style="margin-top:2px;"><span class="chip ' + (roleChip[u.role] || 'chip-gray') + '">' + (roleLabel[u.role] || u.role) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:12px;text-align:right;">' +
            '<button class="btn btn-sm btn-primary" id="acct-save-profile"><i class="fa-solid fa-save"></i> บันทึกชื่อ</button>' +
          '</div>' +
        '</div>' +

        // ── Change Password Section ──
        '<div class="text-xs uppercase text-muted font-600" style="margin-bottom:8px;">' +
          '<i class="fa-solid fa-lock"></i> เปลี่ยนรหัสผ่าน' +
        '</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div id="acct-pw-error" class="hidden" style="background:rgba(239,68,68,.1);border:1px solid var(--error);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:13px;color:var(--error);">' +
            '<i class="fa-solid fa-circle-exclamation"></i> <span></span>' +
          '</div>' +
          '<div id="acct-pw-success" class="hidden" style="background:rgba(34,197,94,.1);border:1px solid var(--success);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:13px;color:var(--success);">' +
            '<i class="fa-solid fa-circle-check"></i> เปลี่ยนรหัสผ่านสำเร็จ' +
          '</div>' +
          '<div class="flex-col gap-10">' +
            '<div class="form-group" style="margin-bottom:0;">' +
              '<label class="form-label">รหัสผ่านปัจจุบัน</label>' +
              '<input type="password" class="form-input" id="acct-pw-current" placeholder="กรอกรหัสผ่านปัจจุบัน" autocomplete="current-password">' +
            '</div>' +
            '<div class="form-group" style="margin-bottom:0;">' +
              '<label class="form-label">รหัสผ่านใหม่</label>' +
              '<input type="password" class="form-input" id="acct-pw-new" placeholder="อย่างน้อย 6 ตัวอักษร" autocomplete="new-password">' +
            '</div>' +
            '<div class="form-group" style="margin-bottom:0;">' +
              '<label class="form-label">ยืนยันรหัสผ่านใหม่</label>' +
              '<input type="password" class="form-input" id="acct-pw-confirm" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" autocomplete="new-password">' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:12px;text-align:right;">' +
            '<button class="btn btn-sm btn-primary" id="acct-change-pw"><i class="fa-solid fa-shield-halved"></i> เปลี่ยนรหัสผ่าน</button>' +
          '</div>' +
        '</div>' +

        // ── Role & Permissions Section ──
        '<div class="text-xs uppercase text-muted font-600" style="margin-bottom:8px;">' +
          '<i class="fa-solid fa-shield-halved"></i> สิทธิ์การใช้งาน' +
        '</div>' +
        '<div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px;">' +
          '<div class="flex gap-16 mb-12" style="flex-wrap:wrap;">' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canEdit) + '<span class="text-sm">แก้ไขข้อมูล</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canDelete) + '<span class="text-sm">ลบข้อมูล</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canApprove) + '<span class="text-sm">อนุมัติ</span></div>' +
            '<div class="flex items-center gap-6">' + permIcon(perms.canManageMembers) + '<span class="text-sm">จัดการสมาชิก</span></div>' +
          '</div>' +
          '<div style="border-top:1px solid var(--border);padding-top:10px;">' +
            '<div class="text-xs text-muted font-600 mb-6">การเข้าถึง Context</div>' +
            accessSummary +
          '</div>' +
        '</div>' +

        // ── Actions ──
        '<div class="modal-actions">' +
          '<button class="btn btn-outline" onclick="App.closeModal()">ปิด</button>' +
          '<button class="btn btn-danger" id="modal-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>' +
        '</div>' +
      '</div>'
    );

    setTimeout(function () {
      // ── Save Profile (name) ──
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
          u.modifiedDate = new Date().toISOString().slice(0, 10);
          u.modifiedBy = u.email;

          // Update avatar in modal
          var avatarEl = document.getElementById('acct-avatar');
          if (avatarEl) avatarEl.textContent = u.initials;

          // Update topbar
          _updateProfileUI();

          App.toast('อัปเดตชื่อเป็น "' + newName + '" สำเร็จ', 'success');
        });
      }

      // ── Change Password ──
      var changePwBtn = document.getElementById('acct-change-pw');
      if (changePwBtn) {
        changePwBtn.addEventListener('click', function () {
          var currentPw = document.getElementById('acct-pw-current');
          var newPw = document.getElementById('acct-pw-new');
          var confirmPw = document.getElementById('acct-pw-confirm');
          var errorEl = document.getElementById('acct-pw-error');
          var successEl = document.getElementById('acct-pw-success');

          // Reset states
          currentPw.classList.remove('is-invalid');
          newPw.classList.remove('is-invalid');
          confirmPw.classList.remove('is-invalid');
          errorEl.classList.add('hidden');
          successEl.classList.add('hidden');

          function showError(msg) {
            errorEl.querySelector('span').textContent = msg;
            errorEl.classList.remove('hidden');
          }

          // Validate current password
          if (!currentPw.value) { currentPw.classList.add('is-invalid'); showError('กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
          if (currentPw.value !== u.password) { currentPw.classList.add('is-invalid'); showError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }

          // Validate new password
          if (!newPw.value || newPw.value.length < 6) { newPw.classList.add('is-invalid'); showError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
          if (newPw.value === currentPw.value) { newPw.classList.add('is-invalid'); showError('รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน'); return; }
          if (newPw.value !== confirmPw.value) { confirmPw.classList.add('is-invalid'); showError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }

          // Save
          u.password = newPw.value;
          u.modifiedDate = new Date().toISOString().slice(0, 10);
          u.modifiedBy = u.email;

          // Clear fields
          currentPw.value = '';
          newPw.value = '';
          confirmPw.value = '';
          successEl.classList.remove('hidden');
        });
      }

      // ── Logout ──
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
    // Also hide sub-menu headers if all children hidden
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

  // ─── Public API ───
  return {
    init: init,
    login: login,
    logout: logout,
    setPassword: setPassword,
    isAuthenticated: isAuthenticated,
    currentUser: currentUser,
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
  };
})();
