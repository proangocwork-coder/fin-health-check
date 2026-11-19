// T-011: results page (REQ-004 AC-004.3, REQ-008 AC-008.3–4, D-002 Q4, AC-003.1 label) and "no network calls".
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var A = T.assert;

  if (T.isNode) {
    // Static check: no source file uses a network API (ARCHITECTURE "Security risks").
    T.test('security: source files contain no network calls', function () {
      var fs = require('node:fs');
      var path = require('node:path');
      var dir = path.join(__dirname, '..', 'src');
      var banned = /\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|https?:\/\//;
      fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) {
        var text = fs.readFileSync(path.join(dir, f), 'utf8');
        A.ok(!banned.test(text), f + ' contains a network call');
      });
    });
    return;
  }

  var FHC = T.load();
  var doc = root.document;

  function hpgCompany(extra) {
    var c = FHC.entry.newCompany();
    c.name = 'Tập đoàn Hòa Phát';
    c.ticker = 'HPG';
    c.companyType = 'manufacturing';
    var v24 = { currentAssets: 86674.28, inventories: 46091.22, totalAssets: 224489.71, totalResources: 224489.71,
      currentLiabilities: 75225.24, equity: 114647.46, revenue: 138855.11, cogs: 120357.56, grossProfit: 18497.55,
      profitAfterTax: 12020.02, tradeReceivables: 5000 };
    var v25 = { currentAssets: 103682.04, cash: 8300.89, inventories: 52828.23, totalAssets: 257899.20, totalResources: 257899.20,
      liabilities: 126679.19, currentLiabilities: 94208.65, shortBorrowings: 64694.96, longBorrowings: 27479.19,
      equity: 131220.01, retainedEarnings: 51037.90, revenue: 156116.09, cogs: 131618.31, grossProfit: 24497.79,
      interest: 3114.86, profitBeforeTax: 18040.59, profitAfterTax: 15514.93, operatingProfit: 17905.83,
      otherProfit: 134.76, depreciation: 8468.26, cfo: 15693.90, tradeReceivables: 10994.15 };
    FHC.entry.ensureYear(c, 2024).values = v24;
    FHC.entry.ensureYear(c, 2025).values = v25;
    FHC.entry.setAuditOpinion(c, 2025, 'unqualified');
    (extra || function () {})(c);
    return c;
  }
  function mountWith(company) {
    var box = doc.createElement('div');
    box.style.display = 'none';
    doc.body.appendChild(box);
    var app = FHC.ui.mount(box, { storage: null, download: function () {} });
    app.openText(FHC.storage.serialize(company));
    return { box: box, app: app, q: function (s) { return box.querySelector(s); } };
  }
  function text(m, sel) { var e = m.q(sel); A.ok(e, sel + ' present'); return e.textContent; }

  T.test('results: counts of red and yellow flags per year, no total score (D-002 Q4)', function () {
    var m = mountWith(hpgCompany());
    var counts = FHC.flags.evaluate(FHC.entry.toCompany(m.app.company))[2025].counts;
    A.equal(text(m, '[data-test="counts-2025"]'), '2025: ' + counts.red + ' cờ Đỏ, ' + counts.yellow + ' cờ Vàng');
  });

  T.test('AC-008.4 results: disclaimer shown', function () {
    var m = mountWith(hpgCompany());
    A.equal(text(m, '[data-test="disclaimer"]'), FHC.flags.DISCLAIMER);
  });

  T.test('AC-004.3 results: clicking a ratio shows its formula and the numbers used', function () {
    var m = mountWith(hpgCompany());
    A.equal(text(m, '[data-test="ratio-currentRatio-2025"]'), '1,10');
    m.q('[data-test="ratio-currentRatio-2025"]').click();
    var detail = text(m, '[data-test="ratio-detail"]');
    A.ok(detail.indexOf('TSNH / Nợ NH') >= 0, 'formula: ' + detail);
    A.ok(detail.indexOf('103.682,04') >= 0, 'input number: ' + detail);
  });

  T.test('results: missing ratio shows the reason, not 0', function () {
    var m = mountWith(hpgCompany());
    A.equal(text(m, '[data-test="ratio-revenueGrowth-2024"]'), '—');
    A.equal(m.q('[data-test="ratio-revenueGrowth-2024"]').title, 'Không tính được: Doanh thu thuần năm trước');
  });

  T.test('AC-008.1 results: flag line with its reason', function () {
    var m = mountWith(hpgCompany());
    var line = text(m, '[data-test="flag-2025-F01"]');
    A.ok(line.indexOf('Vàng') === 0, line);
    A.ok(line.indexOf('F01 · TSNH 103.682,04 / Nợ NH 94.208,65 = 1,10 · Vàng khi 1,0 – < 1,2') >= 0, line);
  });

  T.test('AC-008.3 results: industry note next to related flags', function () {
    var m = mountWith(hpgCompany(function (c) { c.industry = ['real-estate']; }));
    A.ok(text(m, '[data-test="flag-2025-F01"]').indexOf('Bất động sản') >= 0);
  });

  T.test('results: scores shown (Altman variant and zone, Beneish, Piotroski)', function () {
    var m = mountWith(hpgCompany());
    A.ok(text(m, '[data-test="score-altman-2025"]').indexOf("Z' 1,49 (vùng xám)") === 0, text(m, '[data-test="score-altman-2025"]'));
    A.ok(m.q('[data-test="score-beneish-2025"]'));
    A.ok(m.q('[data-test="score-piotroski-2025"]'));
  });

  T.test('AC-003.1 results: unbalanced year is labelled "số chưa cân"', function () {
    var m = mountWith(hpgCompany(function (c) { c.years['2025'].values.totalResources = 257921.58; }));
    A.ok(text(m, '[data-test="counts-2025"]').indexOf('số chưa cân') >= 0);
  });

  T.test('security: building the page and results makes no network request', function () {
    var calls = 0;
    var origFetch = root.fetch;
    var origOpen = root.XMLHttpRequest && root.XMLHttpRequest.prototype.open;
    root.fetch = function () { calls++; return origFetch.apply(this, arguments); };
    if (origOpen) root.XMLHttpRequest.prototype.open = function () { calls++; return origOpen.apply(this, arguments); };
    try {
      var m = mountWith(hpgCompany());
      m.q('[data-test="ratio-currentRatio-2025"]').click();
    } finally {
      root.fetch = origFetch;
      if (origOpen) root.XMLHttpRequest.prototype.open = origOpen;
    }
    A.equal(calls, 0);
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
