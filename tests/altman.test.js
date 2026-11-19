// T-005: Altman Z' / Z'' by company type (REQ-005, spec 001 §3, D-002 Q3 Q5).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/altman.js') : T.load();
  var A = T.assert;
  var Z = function () {
    A.ok(FHC && FHC.scores && FHC.scores.altman, 'FHC.scores.altman should exist');
    return FHC.scores.altman;
  };

  var hpg2025 = { year: 2025, values: {
    currentAssets: 103682.04, currentLiabilities: 94208.65, totalAssets: 257899.20, retainedEarnings: 51037.90,
    profitBeforeTax: 18040.59, interest: 3114.86, equity: 131220.01, liabilities: 126679.19, revenue: 156116.09 } };

  T.test("AC-005.1 manufacturer uses Z' (HPG 2025, grey zone)", function () {
    var r = Z()([hpg2025], 'manufacturing')[2025];
    var v = hpg2025.values;
    var x1 = (v.currentAssets - v.currentLiabilities) / v.totalAssets;
    var x2 = v.retainedEarnings / v.totalAssets;
    var x3 = (v.profitBeforeTax + v.interest) / v.totalAssets;
    var x4 = v.equity / v.liabilities;
    var x5 = v.revenue / v.totalAssets;
    A.equal(r.status, 'ok');
    A.equal(r.variant, "Z'");
    A.near(r.value, 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5, 1e-9);
    A.near(r.value, 1.49, 0.01, 'hand value');
    A.equal(r.zone, 'xám');
    A.near(r.components.X5, x5, 1e-12);
  });

  T.test("AC-005.1 non-manufacturing uses Z'' with its own zones", function () {
    var y = { year: 2025, values: { currentAssets: 400, currentLiabilities: 200, totalAssets: 1000, retainedEarnings: 100,
      profitBeforeTax: 30, interest: 20, equity: 600, liabilities: 400, revenue: 900 } };
    var r = Z()([y], 'non-manufacturing')[2025];
    A.equal(r.variant, "Z''");
    A.near(r.value, 6.56 * 0.2 + 3.26 * 0.1 + 6.72 * 0.05 + 1.05 * 1.5, 1e-9);
    A.equal(r.zone, 'an toàn');
    A.equal(r.components.X5, undefined, "Z'' has no X5");
  });

  T.test('zone boundaries', function () {
    A.equal(Z().zone("Z'", 1.22), 'nguy hiểm');
    A.equal(Z().zone("Z'", 1.23), 'xám');
    A.equal(Z().zone("Z'", 2.9), 'xám');
    A.equal(Z().zone("Z'", 2.91), 'an toàn');
    A.equal(Z().zone("Z''", 1.09), 'nguy hiểm');
    A.equal(Z().zone("Z''", 2.6), 'xám');
    A.equal(Z().zone("Z''", 2.61), 'an toàn');
  });

  T.test('AC-005.2 financial firms: not applicable', function () {
    var r = Z()([hpg2025], 'financial')[2025];
    A.equal(r.status, 'not-applicable');
    A.equal(r.reason, 'Không áp dụng: ngân hàng, bảo hiểm, chứng khoán');
    A.equal(r.value, null);
  });

  T.test('missing line: not computable with the line name', function () {
    var y = { year: 2025, values: JSON.parse(JSON.stringify(hpg2025.values)) };
    y.values.retainedEarnings = null;
    var r = Z()([y], 'manufacturing')[2025];
    A.equal(r.status, 'missing');
    A.equal(r.reason, 'Không tính được: Lợi nhuận sau thuế chưa phân phối');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
