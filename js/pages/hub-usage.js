/* ================================================================
   Hub Usage Report — สถิติการใช้งาน
   ================================================================ */

window.HubPages = window.HubPages || {};
window.HubPages.hubUsage = (function () {
  'use strict';

  function _getData() {
    var d = window.MockData;
    var ctx = window.Auth ? Auth.activeContext() : null;
    if (!d || !ctx || !ctx.tenantId) return null;
    var tid = ctx.tenantId;

    var sessions = (d.sessions || []).filter(function (s) { return s.tenantId === tid; });
    var completed = sessions.filter(function (s) { return s.status === 'Completed'; });
    var active = sessions.filter(function (s) { return s.status === 'Active'; });
    var totalTokens = completed.reduce(function (sum, s) { return sum + (s.tokens || 0); }, 0);
    var totalDuration = completed.reduce(function (sum, s) { return sum + (s.duration || 0); }, 0);

    return {
      sessions: sessions,
      completed: completed,
      active: active,
      totalTokens: totalTokens,
      totalDuration: totalDuration,
    };
  }

  function render() {
    var data = _getData();
    if (!data) return '<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>ไม่พบข้อมูล</p></div>';

    // KPI
    var kpiHtml =
      '<div class="flex gap-16 mb-20" style="flex-wrap:wrap;">' +
        '<div class="card" style="padding:20px;flex:1;min-width:160px;">' +
          '<div class="text-xs text-muted uppercase font-600">Sessions ทั้งหมด</div>' +
          '<div class="font-700" style="font-size:28px;">' + data.sessions.length + '</div>' +
          '<div class="text-xs text-muted">' + data.active.length + ' กำลังทำงาน</div>' +
        '</div>' +
        '<div class="card" style="padding:20px;flex:1;min-width:160px;">' +
          '<div class="text-xs text-muted uppercase font-600">Token ใช้ไป</div>' +
          '<div class="font-700" style="font-size:28px;">' + Number(data.totalTokens).toLocaleString('th-TH') + '</div>' +
          '<div class="text-xs text-muted">จาก ' + data.completed.length + ' sessions</div>' +
        '</div>' +
        '<div class="card" style="padding:20px;flex:1;min-width:160px;">' +
          '<div class="text-xs text-muted uppercase font-600">เวลารวม</div>' +
          '<div class="font-700" style="font-size:28px;">' + data.totalDuration + ' <span class="text-sm font-400 text-muted">นาที</span></div>' +
          '<div class="text-xs text-muted">เฉลี่ย ' + (data.completed.length > 0 ? Math.round(data.totalDuration / data.completed.length) : 0) + ' นาที/session</div>' +
        '</div>' +
      '</div>';

    // Session Table
    var rows = data.sessions.map(function (s) {
      var statusChip = s.status === 'Active'
        ? '<span class="chip chip-green" style="font-size:10px;"><i class="fa-solid fa-circle" style="font-size:6px;"></i> Active</span>'
        : '<span class="chip chip-gray" style="font-size:10px;">Completed</span>';
      return '<tr>' +
        '<td class="mono text-sm">' + s.id + '</td>' +
        '<td class="text-sm">' + s.deviceName + '</td>' +
        '<td class="text-sm">' + s.presetName + '</td>' +
        '<td class="text-sm">' + s.start + '</td>' +
        '<td class="text-sm">' + (s.duration ? s.duration + ' นาที' : '—') + '</td>' +
        '<td class="text-right">' + (s.tokens ? Number(s.tokens).toLocaleString('th-TH') : '—') + '</td>' +
        '<td>' + statusChip + '</td>' +
      '</tr>';
    }).join('');

    if (!rows) rows = '<tr><td colspan="7" class="text-center text-muted" style="padding:24px;">ยังไม่มี Session</td></tr>';

    return '<div style="max-width:1200px;margin:0 auto;">' +
      kpiHtml +
      '<div class="card" style="padding:0;">' +
        '<div style="padding:14px 20px;border-bottom:1px solid var(--border);"><div class="font-600"><i class="fa-solid fa-clock-rotate-left text-muted"></i> Session Log</div></div>' +
        '<div style="overflow-x:auto;">' +
          '<table class="data-table"><thead><tr><th>Session</th><th>Device</th><th>Avatar</th><th>เริ่ม</th><th>ระยะเวลา</th><th class="text-right">Token</th><th>สถานะ</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  return { render: render };
})();
