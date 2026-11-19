// T-005: Altman Z' (manufacturing) and Z'' (non-manufacturing) on book values (spec 001 §3, D-002).
// companyType: 'manufacturing' | 'non-manufacturing' | 'financial'.
// Output per year: { variant, value, zone, components, status, reason?, inputs }.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) require('./lines.js');

  var VARIANTS = {
    "Z'": { weights: { X1: 0.717, X2: 0.847, X3: 3.107, X4: 0.420, X5: 0.998 }, safe: 2.9, distress: 1.23 },
    "Z''": { weights: { X1: 6.56, X2: 3.26, X3: 6.72, X4: 1.05 }, safe: 2.6, distress: 1.1 }
  };

  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  // Grey zone includes both boundaries.
  function zone(variant, value) {
    var v = VARIANTS[variant];
    if (value > v.safe) return 'an toàn';
    if (value < v.distress) return 'nguy hiểm';
    return 'xám';
  }

  function one(values, variant) {
    var needed = ['currentAssets', 'currentLiabilities', 'totalAssets', 'retainedEarnings',
      'profitBeforeTax', 'interest', 'equity', 'liabilities'];
    if (variant === "Z'") needed.push('revenue');
    var missing = needed.filter(function (k) { return !isNum(values[k]); });
    var out = { variant: variant, value: null, inputs: {} };
    if (missing.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + missing.map(FHC.lines.label).join(', ');
      return out;
    }
    needed.forEach(function (k) { out.inputs[k] = values[k]; });
    var zeros = [];
    if (values.totalAssets === 0) zeros.push(FHC.lines.label('totalAssets'));
    if (values.liabilities === 0) zeros.push(FHC.lines.label('liabilities'));
    if (zeros.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + zeros.join(', ') + ' bằng 0';
      return out;
    }
    var ta = values.totalAssets;
    var x = {
      X1: (values.currentAssets - values.currentLiabilities) / ta,
      X2: values.retainedEarnings / ta,
      X3: (values.profitBeforeTax + values.interest) / ta,
      X4: values.equity / values.liabilities
    };
    if (variant === "Z'") x.X5 = values.revenue / ta;
    var w = VARIANTS[variant].weights;
    out.value = Object.keys(w).reduce(function (sum, k) { return sum + w[k] * x[k]; }, 0);
    out.components = x;
    out.zone = zone(variant, out.value);
    out.status = 'ok';
    return out;
  }

  function altman(years, companyType) {
    var result = {};
    years.forEach(function (y) {
      if (companyType === 'financial') {
        result[y.year] = { variant: null, value: null, status: 'not-applicable',
          reason: 'Không áp dụng: ngân hàng, bảo hiểm, chứng khoán' };
      } else if (companyType === 'manufacturing' || companyType === 'non-manufacturing') {
        result[y.year] = one(y.values, companyType === 'manufacturing' ? "Z'" : "Z''");
      } else {
        result[y.year] = { variant: null, value: null, status: 'missing', reason: 'Không tính được: chưa chọn loại doanh nghiệp' };
      }
    });
    return result;
  }
  altman.zone = zone;

  FHC.scores = FHC.scores || {};
  FHC.scores.altman = altman;
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
