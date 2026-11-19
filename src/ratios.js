// T-004: ratio table per year (REQ-004, spec 001 §2).
// Input: years sorted or unsorted, each { year, values: { catalogueKey: number|null } } in one unit.
// Output: { [year]: [ { key, group, name, formula, value, status, reason?, note?, inputs } ] }.
// status: 'ok' | 'missing' (Không tính được) | 'not-applicable' (Không áp dụng). Missing is never 0.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) require('./lines.js');

  var SHORT = {
    revenue: 'Doanh thu thuần', grossProfit: 'Lợi nhuận gộp', profitAfterTax: 'LNST',
    profitBeforeTax: 'LNTT', cfo: 'LCTT thuần từ HĐKD', depreciation: 'Khấu hao',
    totalAssets: 'Tổng cộng tài sản', tradeReceivables: 'Phải thu ngắn hạn của khách hàng'
  };
  function label(key) {
    if (SHORT[key]) return SHORT[key];
    var e = FHC.lines.get(key);
    return e ? e.names[0] : key;
  }
  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  // Evaluation context for one ratio in one year.
  function makeCtx(current, prior) {
    var ctx = { missing: [], zero: [], notApplicable: null, notes: [], inputs: {} };
    ctx.v = function (key) {
      var x = current.values[key];
      if (!isNum(x)) { ctx.missing.push(label(key)); return NaN; }
      ctx.inputs[key] = x;
      return x;
    };
    ctx.prev = function (key) {
      var x = prior ? prior.values[key] : undefined;
      if (!isNum(x)) { ctx.missing.push(label(key) + ' năm trước'); return NaN; }
      ctx.inputs[key + ' (năm trước)'] = x;
      return x;
    };
    ctx.avg = function (key) {
      var end = ctx.v(key);
      var start = prior ? prior.values[key] : undefined;
      if (isNum(start)) {
        ctx.inputs[key + ' (đầu năm)'] = start;
        return (start + end) / 2;
      }
      if (ctx.notes.indexOf('dùng số cuối năm') < 0) ctx.notes.push('dùng số cuối năm');
      return end;
    };
    ctx.div = function (a, b, bName) {
      if (isNum(b) && b === 0) { ctx.zero.push(bName); return NaN; }
      return a / b;
    };
    ctx.na = function (reason) { ctx.notApplicable = reason; return NaN; };
    // Derived lines (spec §1)
    ctx.debt = function () { return ctx.v('shortBorrowings') + ctx.v('longBorrowings'); };
    ctx.ebit = function () { return ctx.v('profitBeforeTax') + ctx.v('interest'); };
    ctx.ebitda = function () { return ctx.ebit() + ctx.v('depreciation'); };
    return ctx;
  }

  // [key, group, name, formula text, calc]
  var DEFS = [
    ['currentRatio', 'Thanh khoản', 'Thanh toán hiện hành', 'TSNH / Nợ NH',
      function (c) { return c.div(c.v('currentAssets'), c.v('currentLiabilities'), 'Nợ ngắn hạn'); }],
    ['quickRatio', 'Thanh khoản', 'Thanh toán nhanh', '(TSNH − HTK) / Nợ NH',
      function (c) { return c.div(c.v('currentAssets') - c.v('inventories'), c.v('currentLiabilities'), 'Nợ ngắn hạn'); }],
    ['cashRatio', 'Thanh khoản', 'Thanh toán tiền mặt', 'Tiền / Nợ NH',
      function (c) { return c.div(c.v('cash'), c.v('currentLiabilities'), 'Nợ ngắn hạn'); }],
    ['liabilitiesToAssets', 'Đòn bẩy', 'Nợ phải trả / Tổng TS', 'Nợ phải trả / Tổng TS',
      function (c) { return c.div(c.v('liabilities'), c.v('totalAssets'), 'Tổng cộng tài sản'); }],
    ['debtToEquity', 'Đòn bẩy', 'Nợ vay / VCSH', '(Vay NH + Vay DH) / VCSH',
      function (c) { return c.div(c.debt(), c.v('equity'), 'Vốn chủ sở hữu'); }],
    ['debtToEbitda', 'Đòn bẩy', 'Nợ vay / EBITDA', '(Vay NH + Vay DH) / (LNTT + Lãi vay + Khấu hao)',
      function (c) {
        var debt = c.debt(); var e = c.ebitda();
        if (isNum(e) && e <= 0) return c.na('Không áp dụng: EBITDA ≤ 0');
        return c.div(debt, e, 'EBITDA');
      }],
    ['interestCoverage', 'Đòn bẩy', 'Khả năng trả lãi', '(LNTT + Lãi vay) / Lãi vay',
      function (c) { return c.div(c.ebit(), c.v('interest'), 'Chi phí lãi vay'); }],
    ['roa', 'Hiệu quả', 'ROA', 'LNST / Tổng TS bình quân',
      function (c) { return c.div(c.v('profitAfterTax'), c.avg('totalAssets'), 'Tổng cộng tài sản'); }],
    ['roe', 'Hiệu quả', 'ROE', 'LNST / VCSH bình quân',
      function (c) { return c.div(c.v('profitAfterTax'), c.avg('equity'), 'Vốn chủ sở hữu'); }],
    ['assetTurnover', 'Hiệu quả', 'Vòng quay tổng TS', 'Doanh thu thuần / Tổng TS bình quân',
      function (c) { return c.div(c.v('revenue'), c.avg('totalAssets'), 'Tổng cộng tài sản'); }],
    ['dso', 'Vốn lưu động', 'Số ngày thu tiền (DSO)', 'Phải thu KH bình quân / Doanh thu thuần × 365',
      function (c) { return c.div(c.avg('tradeReceivables'), c.v('revenue'), 'Doanh thu thuần') * 365; }],
    ['dio', 'Vốn lưu động', 'Số ngày tồn kho (DIO)', 'HTK bình quân / Giá vốn × 365',
      function (c) { return c.div(c.avg('inventories'), c.v('cogs'), 'Giá vốn hàng bán') * 365; }],
    ['dpo', 'Vốn lưu động', 'Số ngày trả tiền (DPO)', 'Phải trả người bán NH bình quân / Giá vốn × 365',
      function (c) { return c.div(c.avg('tradePayables'), c.v('cogs'), 'Giá vốn hàng bán') * 365; }],
    ['cashConversionCycle', 'Vốn lưu động', 'Chu kỳ tiền mặt', 'DSO + DIO − DPO',
      function (c) {
        var dso = c.div(c.avg('tradeReceivables'), c.v('revenue'), 'Doanh thu thuần') * 365;
        var dio = c.div(c.avg('inventories'), c.v('cogs'), 'Giá vốn hàng bán') * 365;
        var dpo = c.div(c.avg('tradePayables'), c.v('cogs'), 'Giá vốn hàng bán') * 365;
        return dso + dio - dpo;
      }],
    ['grossMargin', 'Biên lợi nhuận', 'Biên gộp', 'Lợi nhuận gộp / Doanh thu thuần',
      function (c) { return c.div(c.v('grossProfit'), c.v('revenue'), 'Doanh thu thuần'); }],
    ['ebitdaMargin', 'Biên lợi nhuận', 'Biên EBITDA', 'EBITDA / Doanh thu thuần',
      function (c) { return c.div(c.ebitda(), c.v('revenue'), 'Doanh thu thuần'); }],
    ['netMargin', 'Biên lợi nhuận', 'Biên ròng', 'LNST / Doanh thu thuần',
      function (c) { return c.div(c.v('profitAfterTax'), c.v('revenue'), 'Doanh thu thuần'); }],
    ['cfoToProfit', 'Dòng tiền', 'CFO / LNST', 'LCTT thuần từ HĐKD / LNST (khi LNST > 0)',
      function (c) {
        var cfo = c.v('cfo'); var p = c.v('profitAfterTax');
        if (isNum(p) && p <= 0) return c.na('Không áp dụng: LNST ≤ 0');
        return c.div(cfo, p, 'LNST');
      }],
    ['cfoToCurrentLiabilities', 'Dòng tiền', 'CFO / Nợ NH', 'LCTT thuần từ HĐKD / Nợ NH',
      function (c) { return c.div(c.v('cfo'), c.v('currentLiabilities'), 'Nợ ngắn hạn'); }],
    ['revenueGrowth', 'Tăng trưởng', 'Tăng trưởng doanh thu', 'Doanh thu thuần năm nay / năm trước − 1',
      function (c) {
        var now = c.v('revenue'); var before = c.prev('revenue');
        if (isNum(before) && before <= 0) return c.na('Không áp dụng: năm trước ≤ 0');
        return c.div(now, before, 'Doanh thu thuần năm trước') - 1;
      }],
    ['profitGrowth', 'Tăng trưởng', 'Tăng trưởng LNST', 'LNST năm nay / năm trước − 1',
      function (c) {
        var now = c.v('profitAfterTax'); var before = c.prev('profitAfterTax');
        if (isNum(before) && before <= 0) return c.na('Không áp dụng: năm trước ≤ 0');
        return c.div(now, before, 'LNST năm trước') - 1;
      }]
  ];

  function unique(list) {
    return list.filter(function (x, i) { return list.indexOf(x) === i; });
  }

  function evaluate(def, current, prior) {
    var c = makeCtx(current, prior);
    var raw = def[4](c);
    var out = { key: def[0], group: def[1], name: def[2], formula: def[3], value: null, inputs: c.inputs };
    if (c.missing.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + unique(c.missing).join(', ');
    } else if (c.zero.length) {
      out.status = 'missing';
      out.reason = 'Không tính được: ' + unique(c.zero).join(', ') + ' bằng 0';
    } else if (c.notApplicable) {
      out.status = 'not-applicable';
      out.reason = c.notApplicable;
    } else {
      out.status = 'ok';
      out.value = raw;
      if (c.notes.length) out.note = c.notes.join('; ');
    }
    return out;
  }

  function compute(years) {
    var sorted = years.slice().sort(function (a, b) { return a.year - b.year; });
    var result = {};
    sorted.forEach(function (current, i) {
      var prior = i > 0 && sorted[i - 1].year === current.year - 1 ? sorted[i - 1] : null;
      result[current.year] = DEFS.map(function (d) { return evaluate(d, current, prior); });
    });
    return result;
  }

  FHC.ratios = { compute: compute, definitions: DEFS.map(function (d) { return { key: d[0], group: d[1], name: d[2], formula: d[3] }; }) };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
