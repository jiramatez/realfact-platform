/* ================================================================
   M-BE-10: Analytics Dashboard
   F-A10.1 Revenue & Billing (MT-BE10 enhanced)
   F-A10.2 API Usage Analytics
   F-A10.3 Active Customers & Services
   F-A10.4 Refresh & Export (on every page)
   ================================================================ */

(function () {
  'use strict';

  window.Pages = window.Pages || {};

  /* ── Shared utilities ─────────────────────────────────────────── */
  function _mode()    { return document.body.classList.contains('light-mode') ? 'light' : 'dark'; }
  function _fmt(n,d)  { return (n||0).toLocaleString('th-TH',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}); }
  function _thb(n)    { return _fmt(n,2) + ' THB'; }
  function _now()     { return new Date().toLocaleString('th-TH',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  function _set(id,v) { var e=document.getElementById(id); if(e) e.textContent=v; }
  function _kill(a)   { a.forEach(function(c){try{c.destroy();}catch(e){}}); a.length=0; }
  function _grid(m)   { return {borderColor:m==='dark'?'#2a2a3a':'#e0e0e8',strokeDashArray:3}; }
  function _base(m)   { return {background:'transparent',fontFamily:'Noto Sans Thai, sans-serif',toolbar:{show:false},zoom:{enabled:false},animations:{enabled:true,speed:300}}; }

  function _hdr(title, sub, pfx) {
    return '<div class="page-header">' +
      '<div><h1 class="heading">' + title + '</h1>' +
      '<p class="text-sm text-muted" style="margin-top:4px;">' + sub + '</p></div>' +
      '<div class="page-header-actions" style="align-items:center;">' +
        '<span class="text-xs text-muted" id="' + pfx + '-ts"></span>' +
        '<button class="btn btn-outline btn-sm" id="' + pfx + '-refresh"><i class="fa-solid fa-rotate-right"></i> Refresh</button>' +
        '<button class="btn btn-outline btn-sm" id="' + pfx + '-export"><i class="fa-solid fa-file-csv"></i> Export CSV</button>' +
      '</div></div>';
  }

  function _stat(lbl, id, sub, trend, color, icon) {
    return '<div class="stat-card">' +
      '<div class="stat-header"><span class="stat-label">' + lbl + '</span>' +
      '<div class="stat-icon ' + color + '"><i class="fa-solid fa-' + icon + '"></i></div></div>' +
      '<div class="stat-value mono" id="' + id + '">—</div>' +
      '<div class="stat-change ' + (trend||'') + '">' + sub + '</div>' +
    '</div>';
  }

  function _csv(fn, rows) {
    var csv = rows.map(function(r) {
      return r.map(function(v) { return '"' + String(v==null?'':v).replace(/"/g,'""') + '"'; }).join(',');
    }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
    a.download = fn;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    App.toast('Downloaded: ' + fn, 'success');
  }

  /* ── Safeguard Alerts helper ─────────────────────────────────── */
  function _renderAlerts() {
    var d = window.MockData;
    if (!d || !d.safeguardAlerts || !d.safeguardAlerts.length) return '';
    var active = d.safeguardAlerts.filter(function(a) { return a.status === 'active'; });
    if (!active.length) return '';

    var severityStyles = {
      critical: 'border-left:4px solid var(--error);background:rgba(239,68,68,0.08);',
      warning:  'border-left:4px solid var(--warning,#f59e0b);background:rgba(245,158,11,0.08);',
      info:     'border-left:4px solid var(--primary);background:rgba(59,130,246,0.08);',
    };
    var severityBtnStyles = {
      critical: 'color:var(--error);border-color:var(--error);',
      warning:  'color:var(--warning,#f59e0b);border-color:var(--warning,#f59e0b);',
      info:     'color:var(--primary);border-color:var(--primary);',
    };

    var cards = active.map(function(a) {
      var style = severityStyles[a.severity] || severityStyles.info;
      var btnStyle = severityBtnStyles[a.severity] || severityBtnStyles.info;
      return '<div class="alert-card" data-alert-id="' + a.id + '" style="' + style +
        'display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:8px;margin-bottom:8px;">' +
        '<i class="fa-solid ' + (a.icon || 'fa-circle-info') + '" style="font-size:18px;flex-shrink:0;opacity:0.85;"></i>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="font-600" style="font-size:14px;">' + a.title + '</div>' +
          '<div class="text-sm text-muted" style="margin-top:2px;">' + a.message + '</div>' +
        '</div>' +
        (a.action ? '<button class="btn btn-sm btn-outline alert-action-btn" data-route="' + a.action.route + '" style="flex-shrink:0;' + btnStyle + '">' + a.action.label + '</button>' : '') +
        '<button class="alert-dismiss-btn" data-alert-id="' + a.id + '" style="background:none;border:none;cursor:pointer;padding:4px 6px;opacity:0.5;font-size:14px;" title="ปิด">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</div>';
    }).join('');

    return '<div class="safeguard-alerts mb-16" id="safeguard-alerts-container">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<i class="fa-solid fa-shield-halved" style="color:var(--error);"></i>' +
        '<span class="font-700" style="font-size:14px;">Safeguard Alerts</span>' +
        '<span class="text-muted text-xs">(' + active.length + ')</span>' +
      '</div>' +
      cards +
    '</div>';
  }

  function _bindAlerts() {
    var container = document.getElementById('safeguard-alerts-container');
    if (!container) return;

    // Dismiss buttons
    container.querySelectorAll('.alert-dismiss-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = btn.closest('.alert-card');
        if (card) {
          card.style.transition = 'opacity 0.3s, max-height 0.3s';
          card.style.opacity = '0';
          card.style.maxHeight = card.offsetHeight + 'px';
          setTimeout(function() {
            card.style.maxHeight = '0';
            card.style.padding = '0';
            card.style.margin = '0';
            card.style.overflow = 'hidden';
          }, 50);
          setTimeout(function() {
            card.remove();
            // Hide entire section if no more cards
            var remaining = container.querySelectorAll('.alert-card');
            if (!remaining.length) container.remove();
          }, 350);
        }
      });
    });

    // Action buttons — navigate
    container.querySelectorAll('.alert-action-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var route = btn.dataset.route;
        if (route) App.navigate(route);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     F-A10.1  Revenue & Billing  (MT-BE10 cross-sub-platform view)
     ═══════════════════════════════════════════════════════════════ */
  window.Pages.analyticsRevenue = {
    _ch: [],

    render() {
      return _renderAlerts() +
      _hdr('REVENUE &amp; BILLING', 'Cross-sub-platform revenue overview · MT-BE10', 'rev') +

      // KPI row
      '<div class="grid-4 mb-20">' +
        _stat('Revenue MTD',   'kpi-rev-mtd',    'March 2026',   'up', 'orange', 'baht-sign') +
        _stat('Revenue YTD',   'kpi-rev-ytd',    'Jan–Mar 2026', 'up', 'green',  'chart-line') +
        _stat('Subscriptions', 'kpi-rev-subs',   'This month',   'up', 'blue',   'file-contract') +
        _stat('Token Top-ups', 'kpi-rev-topups', 'This month',   '',   'purple', 'coins') +
      '</div>' +

      // Row 1: Revenue Trend (wide) + By Sub-Platform donut (narrow)
      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;">' +
        '<div class="card p-20">' +
          '<div class="font-700">Revenue Trend</div>' +
          '<div class="text-xs text-muted mb-8">Subscription vs Token Top-up revenue</div>' +
          '<div id="ch-rev-trend" style="min-height:240px;"></div>' +
        '</div>' +
        '<div class="card p-20">' +
          '<div class="font-700 mb-8">By Sub-Platform</div>' +
          '<div id="ch-sp-donut" style="min-height:180px;"></div>' +
          '<div id="sp-donut-legend" style="margin-top:8px;"></div>' +
        '</div>' +
      '</div>' +

      // Row 2: Revenue by Sub-Platform + Daily Revenue
      '<div class="grid-2 mb-16">' +
        '<div class="card p-20">' +
          '<div class="font-700">Revenue by Sub-Platform</div>' +
          '<div class="text-xs text-muted mb-8">Monthly breakdown</div>' +
          '<div id="ch-rev-by-sp" style="min-height:220px;"></div>' +
        '</div>' +
        '<div class="card p-20">' +
          '<div class="font-700">Daily Revenue</div>' +
          '<div class="text-xs text-muted mb-8">February 2026</div>' +
          '<div id="ch-daily-rev" style="min-height:220px;"></div>' +
        '</div>' +
      '</div>' +

      // Row 3: Revenue by Plan Tier + Top Tenants by Spend
      '<div class="grid-2">' +
        '<div class="card p-20"><div id="sec-plan-tier"></div></div>' +
        '<div class="card p-20"><div id="sec-top-tenants"></div></div>' +
      '</div>';
    },

    init() {
      var d = window.MockData, self = this;
      _kill(this._ch);
      _bindAlerts();
      _set('rev-ts', 'Updated: ' + _now());

      // KPI values
      var sp  = d.subPlatformRevenue || [];
      var mtd = sp.reduce(function(s,x){return s+x.revenue;},0);
      var tr  = d.revenueTrend || [];
      var feb = tr[tr.length-1] || {};
      var kpi = d.analyticsKPIs || {};
      _set('kpi-rev-mtd',    _thb(mtd));
      _set('kpi-rev-ytd',    _thb((kpi.revenueYTD||0) + mtd));
      _set('kpi-rev-subs',   _thb(feb.subscriptions||0));
      _set('kpi-rev-topups', _thb(feb.tokenTopups||0));

      var m = _mode();

      // Chart 1: Revenue Trend — area multi-series
      var c1 = new ApexCharts(document.getElementById('ch-rev-trend'), {
        chart: Object.assign(_base(m), {type:'area', height:240}),
        theme:{mode:m}, grid:_grid(m), dataLabels:{enabled:false},
        series:[
          {name:'Subscriptions', data:tr.map(function(r){return r.subscriptions;})},
          {name:'Token Top-ups', data:tr.map(function(r){return r.tokenTopups;})},
        ],
        xaxis:{categories:tr.map(function(r){return r.month;}), labels:{style:{fontSize:'11px'}}},
        yaxis:{labels:{formatter:function(v){return (v/1000).toFixed(2)+'k';}, style:{fontSize:'11px'}}},
        stroke:{curve:'smooth', width:2},
        fill:{type:'gradient', gradient:{shadeIntensity:1, opacityFrom:0.25, opacityTo:0.02}},
        colors:['#3b82f6','#f59e0b'],
        legend:{position:'top', horizontalAlign:'right', fontSize:'12px'},
        tooltip:{theme:m, y:{formatter:function(v){return _thb(v);}}},
      });
      c1.render(); this._ch.push(c1);

      // Chart 2: By Sub-Platform — donut
      var spClr = sp.map(function(x){return x.code==='avatar'?'#f15b26':x.code==='devportal'?'#8b5cf6':'#3b82f6';});
      var c2 = new ApexCharts(document.getElementById('ch-sp-donut'), {
        chart: Object.assign(_base(m), {type:'donut', height:180}),
        theme:{mode:m},
        series:sp.map(function(x){return x.revenue;}),
        labels:sp.map(function(x){return x.name;}),
        colors:spClr, legend:{show:false},
        plotOptions:{pie:{donut:{size:'65%'}}}, dataLabels:{enabled:false},
        tooltip:{theme:m, y:{formatter:function(v){return _thb(v);}}},
      });
      c2.render(); this._ch.push(c2);

      // Sub-platform legend with amounts
      var legEl = document.getElementById('sp-donut-legend');
      if (legEl) {
        legEl.innerHTML = sp.map(function(x,i){
          return '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">' +
            '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + spClr[i] + ';margin-right:8px;"></span>' + x.name + '</span>' +
            '<span class="mono font-600">' + _fmt(x.revenue,0) + ' <span class="text-muted" style="font-size:11px;font-weight:400;">THB</span></span>' +
          '</div>';
        }).join('');
      }

      // Chart 3: Revenue by Sub-Platform — grouped bar
      var bySP = d.revenueBySubPlatform || [];
      var c3 = new ApexCharts(document.getElementById('ch-rev-by-sp'), {
        chart: Object.assign(_base(m), {type:'bar', height:220}),
        theme:{mode:m}, grid:_grid(m), dataLabels:{enabled:false},
        series:[
          {name:'Avatar',          data:bySP.map(function(r){return r.avatar;})},
          {name:'AI Booking',      data:bySP.map(function(r){return r.booking;})},
          {name:'Developer Portal',data:bySP.map(function(r){return r.devportal||0;})},
        ],
        xaxis:{categories:bySP.map(function(r){return r.month;}), labels:{style:{fontSize:'11px'}}},
        yaxis:{labels:{formatter:function(v){return (v/1000).toFixed(2)+'k';}, style:{fontSize:'11px'}}},
        plotOptions:{bar:{columnWidth:'60%', borderRadius:2}},
        colors:['#f15b26','#3b82f6','#8b5cf6'],
        legend:{position:'top', horizontalAlign:'right', fontSize:'12px'},
        tooltip:{theme:m, y:{formatter:function(v){return _thb(v);}}},
      });
      c3.render(); this._ch.push(c3);

      // Chart 4: Daily Revenue Feb — bar
      var daily = d.dailyRevenueFeb || [];
      var c4 = new ApexCharts(document.getElementById('ch-daily-rev'), {
        chart: Object.assign(_base(m), {type:'bar', height:220}),
        theme:{mode:m}, grid:_grid(m), dataLabels:{enabled:false},
        series:[{name:'Revenue', data:daily.map(function(r){return r.revenue;})}],
        xaxis:{categories:daily.map(function(r){return r.date;}), labels:{style:{fontSize:'11px'}}},
        yaxis:{labels:{formatter:function(v){return (v/1000).toFixed(2)+'k';}, style:{fontSize:'11px'}}},
        plotOptions:{bar:{columnWidth:'50%', borderRadius:2}},
        colors:['#22c55e'],
        tooltip:{theme:m, y:{formatter:function(v){return _thb(v);}}},
      });
      c4.render(); this._ch.push(c4);

      // Section 5: Revenue by Plan Tier — progress bars
      var tiers = d.revenueByPlanTier || [];
      var tMax  = Math.max.apply(null, tiers.map(function(t){return t.revenue;})) || 1;
      var tEl   = document.getElementById('sec-plan-tier');
      if (tEl) {
        tEl.innerHTML = '<div class="font-700 mb-16">Revenue by Plan Tier</div>' +
          tiers.map(function(t) {
            var pct = Math.round(t.revenue / tMax * 100);
            return '<div style="margin-bottom:14px;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                '<span style="font-size:13px;">' +
                  '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + t.color + ';margin-right:7px;vertical-align:middle;"></span>' +
                  t.label + ' <span class="text-muted" style="font-size:11px;">(' + t.subs + ' sub)</span>' +
                '</span>' +
                '<span class="mono font-600" style="font-size:13px;">' + _fmt(t.revenue,0) + ' THB</span>' +
              '</div>' +
              '<div style="height:4px;background:var(--border);border-radius:2px;">' +
                '<div style="height:4px;width:' + pct + '%;background:' + t.color + ';border-radius:2px;transition:width .4s;"></div>' +
              '</div>' +
            '</div>';
          }).join('');
      }

      // Section 6: Top Tenants by Spend
      var tops  = d.topTenantsBySpend || [];
      var rkClr = ['#f59e0b','#9ca3af','#b45309','#6b7280','#6b7280','#6b7280','#6b7280','#6b7280'];
      var tpEl  = document.getElementById('sec-top-tenants');
      if (tpEl) {
        tpEl.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<div class="font-700"><i class="fa-solid fa-crown" style="color:#f59e0b;margin-right:6px;"></i>Top Tenants by Spend</div>' +
            '<a href="#tenants" onclick="App.navigate(\'tenants\')" class="text-xs" style="color:var(--primary);text-decoration:none;cursor:pointer;">View All ↗</a>' +
          '</div>' +
          tops.map(function(t, i) {
            var isDp = t.source === 'devportal';
            var dpBadge = isDp ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:10px;background:#8b5cf615;border:1px solid #8b5cf640;font-size:9px;font-weight:700;color:#8b5cf6;margin-left:6px;"><i class="fa-solid fa-code" style="font-size:8px;"></i> DP</span>' : '';
            var subLabel = isDp ? t.subscriptions : t.subscriptions + ' subscription(s)';
            return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">' +
              '<div style="width:28px;height:28px;border-radius:50%;background:' + (isDp ? '#8b5cf6' : (rkClr[i]||'var(--border)')) + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0;">' + t.rank + '</div>' +
              '<div style="flex:1;min-width:0;"><div class="font-600" style="font-size:14px;">' + t.name + dpBadge + '</div>' +
              '<div class="text-muted" style="font-size:11px;">' + subLabel + '</div></div>' +
              '<div class="mono font-600" style="font-size:13px;white-space:nowrap;">' + _fmt(t.revenue,0) + ' <span class="text-muted" style="font-size:11px;font-weight:400;">THB/mo</span></div>' +
            '</div>';
          }).join('');
      }

      document.getElementById('rev-refresh').onclick = function() { _kill(self._ch); self.init(); App.toast('Revenue refreshed','success'); };
      document.getElementById('rev-export').onclick  = function() { self._exportCSV(); };
    },

    _exportCSV() {
      var d = window.MockData;
      var rows = [['Month','Subscriptions (THB)','Token Top-ups (THB)']];
      (d.revenueTrend||[]).forEach(function(r){rows.push([r.month,r.subscriptions,r.tokenTopups]);});
      rows.push([]); rows.push(['Date','Revenue (THB)']);
      (d.dailyRevenueFeb||[]).forEach(function(r){rows.push([r.date,r.revenue]);});
      rows.push([]); rows.push(['Plan Tier','Subscriptions','Revenue (THB)']);
      (d.revenueByPlanTier||[]).forEach(function(t){rows.push([t.label,t.subs,t.revenue]);});
      rows.push([]); rows.push(['Tenant','Subscriptions','Revenue/mo (THB)']);
      (d.topTenantsBySpend||[]).forEach(function(t){rows.push([t.name,t.subscriptions,t.revenue]);});
      _csv('revenue-billing.csv', rows);
    },
  };

  /* ═══════════════════════════════════════════════════════════════
     F-A10.2  API Usage Analytics
     ═══════════════════════════════════════════════════════════════ */
  window.Pages.analyticsUsage = {
    _ch: [],

    render() {
      return _hdr('API USAGE ANALYTICS', 'API call trends and top customers by usage · F-A10.2', 'usage') +
      '<div class="grid-4 mb-20">' +
        _stat('API Calls Today', 'kpi-calls-today',  'March 3, 2026', 'up', 'blue',   'bolt') +
        _stat('This Week',       'kpi-calls-week',   'Mar 2–3',       'up', 'blue',   'calendar-week') +
        _stat('This Month',      'kpi-calls-month',  'March 2026',    'up', 'purple', 'calendar') +
        _stat('Total Tokens',    'kpi-tokens-month', 'Input+Output',  'up', 'orange', 'coins') +
      '</div>' +
      '<div class="section-title"><i class="fa-solid fa-chart-line text-primary"></i> Daily API Calls ' +
        '<span class="text-muted" style="font-size:13px;font-family:var(--font-body);letter-spacing:0;text-transform:none;">(last 7 days)</span></div>' +
      '<div class="card p-20 mb-20"><div id="ch-calls-trend" style="min-height:240px;"></div></div>' +
      '<div class="section-title"><i class="fa-solid fa-ranking-star text-primary"></i> Top 10 Customers by API Calls ' +
        '<span class="text-muted" style="font-size:13px;font-family:var(--font-body);letter-spacing:0;text-transform:none;">(this month)</span></div>' +
      '<div class="card p-20"><div id="ch-top-customers" style="min-height:320px;"></div></div>';
    },

    init() {
      var d = window.MockData, self = this;
      _kill(this._ch);
      _set('usage-ts', 'Updated: ' + _now());

      var kpi = d.analyticsKPIs || {};
      _set('kpi-calls-today',  (kpi.apiCallsToday||0).toLocaleString('th-TH'));
      _set('kpi-calls-week',   (kpi.apiCallsThisWeek||0).toLocaleString('th-TH'));
      _set('kpi-calls-month',  (kpi.apiCallsThisMonth||0).toLocaleString('th-TH'));
      _set('kpi-tokens-month', (kpi.totalTokensThisMonth||0).toLocaleString('th-TH'));

      var calls = d.dailyApiCalls || [], m = _mode();

      var c1 = new ApexCharts(document.getElementById('ch-calls-trend'), {
        chart: Object.assign(_base(m), {type:'line', height:240}),
        theme:{mode:m}, grid:_grid(m), dataLabels:{enabled:false},
        series:[{name:'API Calls', data:calls.map(function(r){return r.calls;})}],
        xaxis:{categories:calls.map(function(r){return r.date;}), labels:{style:{fontSize:'11px'}}},
        yaxis:{labels:{formatter:function(v){return (v||0).toLocaleString('th-TH');}, style:{fontSize:'11px'}}},
        stroke:{curve:'smooth', width:2}, markers:{size:5}, colors:['#7c6cf6'],
        tooltip:{theme:m, y:{formatter:function(v){return v.toLocaleString('th-TH') + ' calls';}}},
      });
      c1.render(); this._ch.push(c1);

      var cust = (d.topCustomers||[]).slice().sort(function(a,b){return b.apiCalls-a.apiCalls;});
      var c2 = new ApexCharts(document.getElementById('ch-top-customers'), {
        chart: Object.assign(_base(m), {type:'bar', height:320}),
        theme:{mode:m}, grid:_grid(m), dataLabels:{enabled:false},
        plotOptions:{bar:{horizontal:true, barHeight:'55%', borderRadius:4}},
        series:[{name:'API Calls', data:cust.map(function(c){return c.apiCalls;})}],
        xaxis:{categories:cust.map(function(c){return c.tenantName;}), labels:{formatter:function(v){return v.toLocaleString('th-TH');}, style:{fontSize:'11px'}}},
        yaxis:{labels:{style:{fontSize:'11px'}}},
        colors:['#7c6cf6'],
        tooltip:{theme:m, y:{formatter:function(v){return v.toLocaleString('th-TH') + ' calls';}}},
      });
      c2.render(); this._ch.push(c2);

      document.getElementById('usage-refresh').onclick = function() { _kill(self._ch); self.init(); App.toast('Usage refreshed','success'); };
      document.getElementById('usage-export').onclick  = function() { self._exportCSV(); };
    },

    _exportCSV() {
      var d = window.MockData;
      var rows = [['Date','API Calls','Input Tokens','Output Tokens']];
      (d.dailyApiCalls||[]).forEach(function(r){rows.push([r.date,r.calls,r.inputTokens||0,r.outputTokens||0]);});
      rows.push([]); rows.push(['Customer','API Calls']);
      (d.topCustomers||[]).slice().sort(function(a,b){return b.apiCalls-a.apiCalls;}).forEach(function(c){rows.push([c.tenantName,c.apiCalls]);});
      _csv('api-usage.csv', rows);
    },
  };

  /* ═══════════════════════════════════════════════════════════════
     F-A10.3  Active Customers & Services
     ═══════════════════════════════════════════════════════════════ */
  window.Pages.analyticsCustomers = {
    _ch: [],

    render() {
      return _hdr('CUSTOMERS &amp; SERVICES', 'Active customers, status breakdown, and service categories · F-A10.3', 'cust') +
      '<div class="grid-4 mb-20">' +
        _stat('Total Tenants',   'kpi-total-t',    'All statuses',     '',   'blue',   'building') +
        _stat('Active Tenants',  'kpi-active-t',   'Subscribed',       'up', 'green',  'building-circle-check') +
        _stat('Active Services', 'kpi-active-svc', 'Service configs',  'up', 'purple', 'gears') +
        _stat('Categories',      'kpi-cats',       'Agent categories', 'up', 'orange', 'tags') +
      '</div>' +
      '<div class="grid-2">' +
        '<div>' +
          '<div class="section-title"><i class="fa-solid fa-chart-pie text-primary"></i> Customer Status</div>' +
          '<div class="card p-20"><div id="ch-cust-status" style="min-height:290px;"></div></div>' +
        '</div>' +
        '<div>' +
          '<div class="section-title"><i class="fa-solid fa-chart-pie text-primary"></i> Services by Category</div>' +
          '<div class="card p-20"><div id="ch-svc-cats" style="min-height:290px;"></div></div>' +
        '</div>' +
      '</div>';
    },

    init() {
      var d = window.MockData, self = this;
      _kill(this._ch);
      _set('cust-ts', 'Updated: ' + _now());

      var tenants = (d.tenants || []).concat(d.dpTenants || []), cats = d.serviceCategories || [];
      var activeT  = tenants.filter(function(t){return t.status==='Active';}).length;
      var totalSvc = cats.reduce(function(s,c){return s+c.count;},0);
      _set('kpi-total-t',    tenants.length.toLocaleString('th-TH'));
      _set('kpi-active-t',   activeT.toLocaleString('th-TH'));
      _set('kpi-active-svc', totalSvc.toLocaleString('th-TH'));
      _set('kpi-cats',       cats.length.toLocaleString('th-TH'));

      var m = _mode();
      var donutCfg = {
        theme:{mode:m}, legend:{position:'bottom', fontSize:'12px'},
        plotOptions:{pie:{donut:{size:'60%'}}},
        dataLabels:{enabled:true, formatter:function(v){return v.toFixed(2)+'%';}},
      };

      // Customer status donut
      var sMap = {};
      tenants.forEach(function(t) {
        var s = (t.status==='Pending Verification') ? 'Pending' : t.status;
        sMap[s] = (sMap[s]||0) + 1;
      });
      var sKeys = Object.keys(sMap);
      var sClrs = sKeys.map(function(k){ return k==='Active'?'#22c55e':k==='Suspended'?'#ef4444':'#f59e0b'; });

      var c1 = new ApexCharts(document.getElementById('ch-cust-status'), Object.assign({
        chart: Object.assign(_base(m), {type:'donut', height:290}),
        series:sKeys.map(function(k){return sMap[k];}), labels:sKeys, colors:sClrs,
        tooltip:{theme:m, y:{formatter:function(v){return v+' tenants';}}},
      }, donutCfg));
      c1.render(); this._ch.push(c1);

      // Service categories donut
      var c2 = new ApexCharts(document.getElementById('ch-svc-cats'), Object.assign({
        chart: Object.assign(_base(m), {type:'donut', height:290}),
        series:cats.map(function(c){return c.count;}),
        labels:cats.map(function(c){return c.category;}),
        colors:['#7c6cf6','#f15b26','#22c55e','#3b82f6','#f59e0b'],
        tooltip:{theme:m, y:{formatter:function(v){return v+' service'+(v!==1?'s':'');}}},
      }, donutCfg));
      c2.render(); this._ch.push(c2);

      document.getElementById('cust-refresh').onclick = function() { _kill(self._ch); self.init(); App.toast('Customer data refreshed','success'); };
      document.getElementById('cust-export').onclick  = function() { self._exportCSV(); };
    },

    _exportCSV() {
      var d = window.MockData;
      var rows = [['Tenant','Status','Plan']];
      (d.tenants||[]).forEach(function(t){rows.push([t.name,t.status,t.plan||'']);});
      rows.push([]); rows.push(['Category','Count']);
      (d.serviceCategories||[]).forEach(function(c){rows.push([c.category,c.count]);});
      _csv('customers-services.csv', rows);
    },
  };

})();
