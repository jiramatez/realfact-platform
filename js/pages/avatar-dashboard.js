/* ================================================================
   Page Module — Avatar Dashboard (Avatar Sub-Platform)
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.avatarDashboard = {
  render() {
    const d = window.MockData;
    const s = d.stats;
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    const activeSessions = d.sessions.filter(se => se.status === 'active');
    const completedSessions = d.sessions.filter(se => se.status === 'completed');

    return `
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="heading">AVATAR DASHBOARD</h1>
        <div class="flex items-center gap-12">
          <span class="text-sm text-muted"><i class="fa-solid fa-calendar-day"></i> ${today}</span>
          <button class="btn btn-outline btn-sm" onclick="location.reload()"><i class="fa-solid fa-rotate"></i> รีเฟรช</button>
        </div>
      </div>

      <!-- Stat Row 1: 4 cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">อุปกรณ์ทั้งหมด</span>
            <div class="stat-icon orange"><i class="fa-solid fa-microchip"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.totalDevices)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> +5 เดือนนี้</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">อุปกรณ์ออนไลน์</span>
            <div class="stat-icon green"><i class="fa-solid fa-wifi"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.activeDevices)}</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> ${Math.round(s.activeDevices / s.totalDevices * 100)}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">รอเปิดใช้งาน</span>
            <div class="stat-icon red"><i class="fa-solid fa-clock"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.pendingActivations)}</div>
          <div class="stat-change down">Activation Rate <span class="mono">${s.activationRate}%</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">เซสชันวันนี้</span>
            <div class="stat-icon purple"><i class="fa-solid fa-comments"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.sessionsToday)}</div>
          <div class="stat-change up">เฉลี่ย <span class="mono">${s.avgSessionMinutes}</span> นาที</div>
        </div>
      </div>

      <!-- Stat Row 2: 4 cards -->
      <div class="grid-4 mb-20">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Tokens วันนี้</span>
            <div class="stat-icon yellow"><i class="fa-solid fa-coins"></i></div>
          </div>
          <div class="stat-value mono">${d.formatNumber(s.tokensConsumedToday)}</div>
          <div class="stat-change up">เดือนนี้ <span class="mono">${d.formatNumber(s.tokensConsumedMonth)}</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Preset ที่ใช้งาน</span>
            <div class="stat-icon blue"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          </div>
          <div class="stat-value mono">${s.presetsActive}<span class="text-muted" style="font-size:16px;">/${s.presetsCreated}</span></div>
          <div class="stat-change up">Utilization ${Math.round(s.presetsActive / s.presetsCreated * 100)}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">KB Upload Success</span>
            <div class="stat-icon green"><i class="fa-solid fa-database"></i></div>
          </div>
          <div class="stat-value mono">${s.kbUploadSuccess}%</div>
          <div class="stat-change up"><i class="fa-solid fa-arrow-up"></i> เป้าหมาย &gt;95%</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Self-Activate Rate</span>
            <div class="stat-icon blue"><i class="fa-solid fa-user-check"></i></div>
          </div>
          <div class="stat-value mono">${s.selfActivateRatio}%</div>
          <div class="stat-change up">Tenant เปิดใช้เอง</div>
        </div>
      </div>

      <!-- Banner Info -->
      <div class="banner-info mb-20">
        <div class="banner-icon"><i class="fa-solid fa-bolt text-primary"></i></div>
        <div class="flex-1">
          <div class="text-sm text-muted uppercase mb-4">สรุปสถานะ Avatar Sub-Platform</div>
          <div class="flex items-center gap-24">
            <div>
              <span class="text-sm text-muted">เซสชัน LIVE</span>
              <div class="banner-value">${activeSessions.length}</div>
            </div>
            <div>
              <span class="text-sm text-muted">Tenant ใช้งาน</span>
              <div class="banner-value">${d.formatNumber(s.activeTenants)}</div>
            </div>
            <div>
              <span class="text-sm text-muted">อุปกรณ์ออกไลน์</span>
              <div class="banner-value">${d.formatNumber(s.offlineDevices)}</div>
            </div>
            <div>
              <span class="text-sm text-muted">Knowledge Bases</span>
              <div class="banner-value">${d.knowledgeBases.length}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="section-title"><i class="fa-solid fa-tower-broadcast text-primary"></i> เซสชันที่กำลังใช้งาน</div>
      <div class="card-accent mb-24">
        ${activeSessions.length === 0
          ? '<div class="empty-state"><i class="fa-solid fa-moon"></i><p>ไม่มีเซสชันที่กำลังใช้งาน</p></div>'
          : `<div class="flex-col gap-12">
              ${activeSessions.map(se => `
                <div class="flex items-center justify-between p-16" style="background:var(--surface2);border-radius:10px;">
                  <div class="flex items-center gap-12">
                    <div class="live-indicator"><div class="live-dot"></div> LIVE</div>
                    <div>
                      <div class="font-600">${se.deviceName}</div>
                      <div class="text-sm text-muted">${se.tenantName}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-20">
                    <div class="text-sm">
                      <span class="text-muted uppercase">Preset</span>
                      <div class="font-600">${se.presetName}</div>
                    </div>
                    <div class="text-sm">
                      <span class="text-muted uppercase">เริ่มต้น</span>
                      <div class="mono">${se.start}</div>
                    </div>
                    <span class="chip chip-orange">กำลังสนทนา</span>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
      </div>

      <!-- Recent Sessions Table -->
      <div class="section-title"><i class="fa-solid fa-clock-rotate-left text-muted"></i> เซสชันล่าสุด</div>
      <div class="flex items-center gap-12 mb-16">
        <div class="search-bar flex-1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="session-search" placeholder="ค้นหา Tenant / อุปกรณ์ / Preset...">
        </div>
        <div class="tab-bar" id="session-tabs">
          <div class="tab-item active" data-tab="all">All</div>
          <div class="tab-item" data-tab="active">Active</div>
          <div class="tab-item" data-tab="completed">Completed</div>
        </div>
      </div>
      <div class="table-wrap mb-24" id="session-table-wrap"></div>

      <!-- Quick Actions -->
      <div class="section-title"><i class="fa-solid fa-bolt text-muted"></i> ลัดไปยัง</div>
      <div class="flex gap-12">
        <button class="btn btn-primary" onclick="location.hash='hardware'">
          <i class="fa-solid fa-warehouse"></i> Hardware Inventory
        </button>
        <button class="btn btn-outline" onclick="location.hash='devices'">
          <i class="fa-solid fa-tower-broadcast"></i> Device Operations
        </button>
        <button class="btn btn-outline" onclick="location.hash='service-builder'">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Service Builder
        </button>
        <button class="btn btn-outline" onclick="location.hash='knowledge-base'">
          <i class="fa-solid fa-book"></i> Knowledge Base
        </button>
      </div>
    `;
  },

  _renderSessions() {
    const d = window.MockData;
    const searchEl = document.getElementById('session-search');
    const activeTab = document.querySelector('#session-tabs .tab-item.active');
    const search = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const tab = activeTab ? activeTab.dataset.tab : 'all';

    let sessions = d.sessions;
    if (tab === 'active') sessions = sessions.filter(se => se.status === 'active');
    else if (tab === 'completed') sessions = sessions.filter(se => se.status === 'completed');

    if (search) {
      sessions = sessions.filter(se =>
        se.tenantName.toLowerCase().includes(search) ||
        se.deviceName.toLowerCase().includes(search) ||
        se.presetName.toLowerCase().includes(search)
      );
    }

    const wrap = document.getElementById('session-table-wrap');
    if (!wrap) return;

    if (!sessions.length) {
      wrap.innerHTML = '<div class="empty-state"><i class="fa-solid fa-filter"></i><p>ไม่พบเซสชันที่ตรงกับเงื่อนไข</p></div>';
      return;
    }

    wrap.innerHTML = `<table>
      <thead><tr>
        <th>Session ID</th><th>อุปกรณ์</th><th>Tenant</th><th>Preset</th>
        <th>สถานะ</th><th>ระยะเวลา</th><th>Tokens</th><th>เวลา</th>
      </tr></thead>
      <tbody>${sessions.map(se => `<tr>
        <td class="mono">${se.id}</td>
        <td>${se.deviceName}</td>
        <td>${se.tenantName}</td>
        <td>${se.presetName}</td>
        <td>${d.statusChip ? d.statusChip(se.status === 'active' ? 'Active' : 'Completed') : se.status}</td>
        <td class="mono">${se.duration ? se.duration + ' นาที' : '-'}</td>
        <td class="mono">${se.tokens ? d.formatNumber(se.tokens) : '-'}</td>
        <td class="text-sm text-muted">${se.start}${se.end ? ' - ' + se.end.split(' ')[1] : ''}</td>
      </tr>`).join('')}</tbody></table>`;
  },

  init() {
    const self = window.Pages.avatarDashboard;
    self._renderSessions();

    const searchEl = document.getElementById('session-search');
    if (searchEl) searchEl.addEventListener('input', () => self._renderSessions());

    document.querySelectorAll('#session-tabs .tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#session-tabs .tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        self._renderSessions();
      });
    });
  }
};
