// T-006: Beneish M-score, 8 variables (Beneish 1999; spec 001 §4).
// Needs year t and year t-1. Output per year: { value, components, status, reason?, inputs }.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) require('./lines.js');

  var KEYS = ['tradeReceivables', 'revenue', 'grossProfit', 'currentAssets', 'tangibleFixedAssets', 'totalAssets',
    'depreciation', 'sellingExpense', 'adminExpense', 'profitAfterTax', 'cfo', 'currentLiabilities', 'longBorrowings'];
  var WEIGHTS = { DSRI: 0.920, GMI: 0.528, AQI: 0.404, SGI: 0.892, DEPI: 0.115, SGAI: -0.172, TATA: 4.679, LVGI: -0.327 };
  var CONSTANT = -4.84;

  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  // Ratio a/b; returns NaN when b is 0 so the index is reported as not computable.
  function q(a, b) { return b === 0 ? NaN : a / b; }

  function indices(t, p) {
    var gm = function (v) { return q(v.grossProfit, v.revenue); };
    var hardAssets = function (v) { return 1 - q(v.currentAssets + v.tangibleFixedAssets, v.totalAssets); };
    var depRate = function (v) { return q(v.depreciation, v.depreciation + v.tangibleFixedAssets); };
    var sga = function (v) { return q(v.sellingExpense + v.adminExpense, v.revenue); };
    var lev = function (v) { return q(v.currentLiabilities + v.longBorrowings, v.totalAssets); };
    return {
      DSRI: q(q(t.tradeReceivables, t.revenue), q(p.tradeReceivables, p.revenue)),
      GMI: q(gm(p), gm(t)),
      AQI: q(hardAssets(t), hardAssets(p)),
      SGI: q(t.revenue, p.revenue),
      DEPI: q(depRate(p), depRate(t)),
      SGAI: q(sga(t), sga(p)),
      TATA: q(t.profitAfterTax - t.cfo, t.totalAssets),
      LVGI: q(lev(t), lev(p))
    };
  }

  function one(current, prior) {
    var out = { value: null, inputs: {} };
    if (!prior) {
      out.status = 'missing';
      out.reason = 'Cần 2 năm';
      return out;
    }
    var missing = [];
    KEYS.forEach(function (k) {
      if (!isNum(current.values[k])) missing.push(FHC.lines.label(k));
    });
    KEYS.forEach(function (k) {
      if (!isNum(prior.values[k])) missing.push(FHC.lines.label(k) + ' năm trước');
    });
    if (missing.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + missing.join(', ');
      return out;
    }
    KEYS.forEach(function (k) {
      out.inputs[k] = current.values[k];
      out.inputs[k + ' (năm trước)'] = prior.values[k];
    });
    var x = indices(current.values, prior.values);
    out.components = x;
    var bad = Object.keys(WEIGHTS).filter(function (k) { return !isFinite(x[k]); });
    if (bad.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + bad.join(', ');
      return out;
    }
    out.value = Object.keys(WEIGHTS).reduce(function (sum, k) { return sum + WEIGHTS[k] * x[k]; }, CONSTANT);
    out.status = 'ok';
    return out;
  }

  function beneish(years) {
    var sorted = years.slice().sort(function (a, b) { return a.year - b.year; });
    var result = {};
    sorted.forEach(function (y, i) {
      var prior = i > 0 && sorted[i - 1].year === y.year - 1 ? sorted[i - 1] : null;
      result[y.year] = one(y, prior);
    });
    return result;
  }

  FHC.scores = FHC.scores || {};
  FHC.scores.beneish = beneish;
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
