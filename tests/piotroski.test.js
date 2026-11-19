// T-007: Piotroski F, 9 criteria (REQ-007, spec 001 §5).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/piotroski.js') : T.load();
  var A = T.assert;
  var F = function () {
    A.ok(FHC && FHC.scores && FHC.scores.piotroski, 'FHC.scores.piotroski should exist');
    return FHC.scores.piotroski;
  };

  function threeYears() {
    return [
      { year: 2023, values: { totalAssets: 900 } },
      { year: 2024, values: { totalAssets: 1000, profitAfterTax: 50, cfo: 40, longBorrowings: 200, currentAssets: 300,
        currentLiabilities: 250, grossProfit: 200, revenue: 1000, shareIssue: 0 } },
      { year: 2025, values: { totalAssets: 1100, profitAfterTax: 80, cfo: 120, longBorrowings: 150, currentAssets: 360,
        currentLiabilities: 240, grossProfit: 260, revenue: 1200, shareIssue: 0 } }
    ];
  }

  T.test('all nine criteria pass: F = 9/9', function () {
    var r = F()(threeYears())[2025];
    A.equal(r.status, 'ok');
    A.equal(r.value, 9);
    A.equal(r.computable, 9);
    A.equal(r.display, '9/9');
    A.equal(r.criteria.length, 9);
    r.criteria.forEach(function (c) { A.equal(c.status, 'pass', 'criterion ' + c.n); });
  });

  T.test('criterion 7: issuing shares fails it', function () {
    var years = threeYears();
    years[2].values.shareIssue = 50;
    var r = F()(years)[2025];
    A.equal(r.value, 8);
    A.equal(r.display, '8/9');
    A.equal(r.criteria[6].status, 'fail');
  });

  T.test('criterion 4: profit not backed by cash fails it; criterion 1 fails on a loss', function () {
    var years = threeYears();
    years[2].values.cfo = 50; // 50/1000 = 0.05 < ROA 0.08
    A.equal(F()(years)[2025].criteria[3].status, 'fail');
    years[2].values.profitAfterTax = -10;
    A.equal(F()(years)[2025].criteria[0].status, 'fail');
  });

  T.test('AC-007.1 missing year t-2: criteria 3, 5, 9 not computable; shown as "6/6 tiêu chí tính được"', function () {
    var years = threeYears().slice(1);
    var r = F()(years)[2025];
    A.equal(r.computable, 6);
    A.equal(r.value, 6);
    A.equal(r.display, '6/6 tiêu chí tính được');
    [2, 4, 8].forEach(function (i) { A.equal(r.criteria[i].status, 'missing', 'criterion ' + (i + 1)); });
    A.equal(r.criteria[2].reason, 'Không tính được: Tổng cộng tài sản cuối năm 2023');
  });

  T.test('zero denominator: criterion not computable, never pass or fail', function () {
    var years = threeYears();
    years[1].values.totalAssets = 0;
    var r = F()(years)[2025];
    A.equal(r.criteria[0].status, 'missing', 'criterion 1 with assets at start of year = 0');
    A.equal(r.criteria[0].reason, 'Không tính được: mẫu số bằng 0');
  });

  T.test('AC-007.1 a missing criterion never counts as 0 points silently', function () {
    var years = threeYears();
    years[2].values.cfo = null;
    var r = F()(years)[2025];
    A.equal(r.computable, 7, 'criteria 2 and 4 need CFO');
    A.equal(r.display, '7/7 tiêu chí tính được');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
