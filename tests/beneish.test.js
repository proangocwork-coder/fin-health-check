// T-006: Beneish M, 8 variables (REQ-006, spec 001 §4).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/beneish.js') : T.load();
  var A = T.assert;
  var M = function () {
    A.ok(FHC && FHC.scores && FHC.scores.beneish, 'FHC.scores.beneish should exist');
    return FHC.scores.beneish;
  };

  function base() {
    return { tradeReceivables: 100, revenue: 1000, grossProfit: 200, currentAssets: 300, tangibleFixedAssets: 400,
      totalAssets: 1000, depreciation: 50, sellingExpense: 30, adminExpense: 20, profitAfterTax: 60, cfo: 60,
      currentLiabilities: 250, longBorrowings: 100 };
  }
  function twoYears(changes) {
    var now = base();
    Object.keys(changes || {}).forEach(function (k) { now[k] = changes[k]; });
    return [{ year: 2024, values: base() }, { year: 2025, values: now }];
  }

  T.test('AC-006.2 identical years: all indices 1, TATA 0, M = -2.48', function () {
    var r = M()(twoYears())[2025];
    A.equal(r.status, 'ok');
    A.near(r.value, -2.48, 1e-9);
    ['DSRI', 'GMI', 'AQI', 'SGI', 'DEPI', 'SGAI', 'LVGI'].forEach(function (k) {
      A.near(r.components[k], 1, 1e-12, k);
    });
    A.near(r.components.TATA, 0, 1e-12, 'TATA');
  });

  T.test('AC-006.2 receivables doubling moves DSRI to 2 and M to -1.56', function () {
    var r = M()(twoYears({ tradeReceivables: 200 }))[2025];
    A.near(r.components.DSRI, 2, 1e-12);
    A.near(r.value, -1.56, 1e-9);
  });

  T.test('TATA: profit above operating cash flow', function () {
    var r = M()(twoYears({ cfo: 10 }))[2025];
    A.near(r.components.TATA, 0.05, 1e-12);
    A.near(r.value, -2.48 + 4.679 * 0.05, 1e-9);
  });

  T.test('AC-006.1 one year only: needs 2 years', function () {
    var years = twoYears();
    var r = M()(years.slice(1))[2025];
    A.equal(r.status, 'missing');
    A.equal(r.reason, 'Cần 2 năm');
  });

  T.test('zero denominator in one index: that index and M not computable', function () {
    var years = twoYears();
    years[0].values.tradeReceivables = 0;
    var r = M()(years)[2025];
    A.equal(r.status, 'missing');
    A.equal(r.value, null);
    A.equal(r.reason, 'Không tính được: DSRI');
  });

  T.test('missing line in either year is named', function () {
    var years = twoYears();
    years[0].values.depreciation = null;
    var r = M()(years)[2025];
    A.equal(r.status, 'missing');
    A.equal(r.reason, 'Không tính được: Khấu hao năm trước');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
