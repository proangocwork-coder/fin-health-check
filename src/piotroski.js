// T-007: Piotroski F-score, 9 criteria (Piotroski 2000; spec 001 §5).
// "TS đầu năm" of year t = total assets at the end of year t-1. Criteria 3, 5, 9 also need year t-2's total assets.
// Output per year: { value, computable, display, criteria: [{ n, name, status: pass|fail|missing, reason? }], status }.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) require('./lines.js');

  var BALANCE_KEYS = ['totalAssets', 'longBorrowings', 'currentAssets', 'currentLiabilities'];

  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  function one(byYear, t) {
    function getter(missing) {
      return function (year, key) {
        var y = byYear[year];
        var x = y ? y.values[key] : undefined;
        if (isNum(x)) return x;
        var suffix = year === t ? '' : (BALANCE_KEYS.indexOf(key) >= 0 ? ' cuối năm ' : ' năm ') + year;
        missing.push(FHC.lines.label(key) + suffix);
        return NaN;
      };
    }
    var p = t - 1, pp = t - 2;
    var defs = [
      ['ROA dương', function (g) { return g(t, 'profitAfterTax') / g(p, 'totalAssets') > 0; }],
      ['CFO dương', function (g) { return g(t, 'cfo') > 0; }],
      ['ROA tăng', function (g) {
        return g(t, 'profitAfterTax') / g(p, 'totalAssets') > g(p, 'profitAfterTax') / g(pp, 'totalAssets');
      }],
      ['Chất lượng lợi nhuận', function (g) {
        var ta = g(p, 'totalAssets');
        return g(t, 'cfo') / ta > g(t, 'profitAfterTax') / ta;
      }],
      ['Đòn bẩy giảm', function (g) {
        var now = g(t, 'longBorrowings') / ((g(t, 'totalAssets') + g(p, 'totalAssets')) / 2);
        var before = g(p, 'longBorrowings') / ((g(p, 'totalAssets') + g(pp, 'totalAssets')) / 2);
        return now < before;
      }],
      ['Thanh khoản tăng', function (g) {
        return g(t, 'currentAssets') / g(t, 'currentLiabilities') > g(p, 'currentAssets') / g(p, 'currentLiabilities');
      }],
      ['Không phát hành thêm cổ phiếu', function (g) { return g(t, 'shareIssue') <= 0; }],
      ['Biên gộp tăng', function (g) {
        return g(t, 'grossProfit') / g(t, 'revenue') > g(p, 'grossProfit') / g(p, 'revenue');
      }],
      ['Vòng quay tài sản tăng', function (g) {
        return g(t, 'revenue') / g(p, 'totalAssets') > g(p, 'revenue') / g(pp, 'totalAssets');
      }]
    ];

    var criteria = defs.map(function (d, i) {
      var missing = [];
      var passed = d[1](getter(missing));
      var c = { n: i + 1, name: d[0] };
      if (missing.length) {
        c.status = 'missing';
        c.reason = 'Không tính được: ' + missing.filter(function (m, j) { return missing.indexOf(m) === j; }).join(', ');
      } else {
        c.status = passed ? 'pass' : 'fail';
      }
      return c;
    });
    // A division by 0 gives Infinity or NaN, which would read as pass or fail; report it as not computable.
    criteria.forEach(function (c, i) {
      if (c.status !== 'missing' && hasZeroDenominator(byYear, t, i)) {
        c.status = 'missing';
        c.reason = 'Không tính được: mẫu số bằng 0';
      }
    });

    var computable = criteria.filter(function (c) { return c.status !== 'missing'; }).length;
    var value = criteria.filter(function (c) { return c.status === 'pass'; }).length;
    return {
      value: computable ? value : null,
      computable: computable,
      display: computable === 9 ? value + '/9' : value + '/' + computable + ' tiêu chí tính được',
      criteria: criteria,
      status: computable ? 'ok' : 'missing'
    };
  }

  function hasZeroDenominator(byYear, t, index) {
    var dens = {
      0: [[t - 1, 'totalAssets']], 2: [[t - 1, 'totalAssets'], [t - 2, 'totalAssets']], 3: [[t - 1, 'totalAssets']],
      4: [[t, 'totalAssets'], [t - 1, 'totalAssets'], [t - 2, 'totalAssets']],
      5: [[t, 'currentLiabilities'], [t - 1, 'currentLiabilities']], 7: [[t, 'revenue'], [t - 1, 'revenue']],
      8: [[t - 1, 'totalAssets'], [t - 2, 'totalAssets']]
    }[index] || [];
    return dens.some(function (d) { return byYear[d[0]] && byYear[d[0]].values[d[1]] === 0; });
  }

  function piotroski(years) {
    var byYear = {};
    years.forEach(function (y) { byYear[y.year] = y; });
    var result = {};
    years.forEach(function (y) { result[y.year] = one(byYear, y.year); });
    return result;
  }

  FHC.scores = FHC.scores || {};
  FHC.scores.piotroski = piotroski;
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
