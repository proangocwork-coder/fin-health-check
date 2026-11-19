// T-008: warning flags F01–F18 (FLAG_RULES 0.2, D-002).
// company: { years: [{ year, values }], companyType, industry: string|string[]|null, auditOpinions: { year: opinion } }
// opinion: 'unqualified' | 'emphasis' | 'qualified' | 'adverse' | 'disclaimer' | 'going-concern'
// Output: { [year]: { flags: [{ code, name, level, reason, note? }], counts: { red, yellow } } }
// level: 'red' | 'yellow' | 'none' | 'missing' (Không tính được) | 'not-applicable'.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) {
    ['./lines.js', './format.js', './ratios.js', './altman.js', './beneish.js', './piotroski.js'].forEach(function (p) { require(p); });
  }

  var DISCLAIMER = 'Tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu';

  var NAMES = {
    F01: 'Thanh toán hiện hành thấp', F02: 'Thanh toán nhanh thấp', F03: 'Khó trả lãi vay',
    F04: 'Nợ vay quá cao so với khả năng tạo tiền', F05: 'Vốn chủ âm hoặc lỗ luỹ kế', F06: 'Có lãi mà không có tiền',
    F07: 'Lợi nhuận ít chuyển thành tiền', F08: 'Lợi nhuận dồn tích cao', F09: 'Lãi nhờ hoạt động phụ',
    F10: 'Phải thu tăng nhanh hơn doanh thu', F11: 'Tồn kho tăng nhanh hơn giá vốn', F12: 'Chu kỳ tiền mặt kéo dài',
    F13: 'Biên gộp giảm mạnh', F14: 'Doanh thu giảm mạnh', F15: 'Altman Z', F16: 'Beneish M', F17: 'Piotroski F',
    F18: 'Ý kiến kiểm toán'
  };

  var NOTES = {
    'real-estate': { codes: ['F01', 'F02', 'F11', 'F12'],
      text: 'Bất động sản: HTK là dự án dở dang, người mua trả tiền trước nằm trong Nợ NH; cờ này dễ bật mà chưa chắc là xấu' },
    'conglomerate': { codes: ['F10', 'F11', 'F16'],
      text: 'Tập đoàn đa ngành, có mua bán công ty con trong năm: tăng trưởng nhảy vọt có thể làm cờ này bật sai' },
    'infrastructure-low': { codes: ['F02', 'F11'], text: 'Dịch vụ hạ tầng: tài sản cố định lớn, HTK nhỏ; cờ này ít ý nghĩa' },
    'infrastructure-watch': { codes: ['F04', 'F06'], text: 'Dịch vụ hạ tầng: chú ý cờ này' }
  };

  var n = function (x, d) { return FHC.format.number(x, d === undefined ? 2 : d); };
  var pct = function (x) { return n(x * 100, 1) + '%'; };
  var pts = function (x) { return n(x, 1) + ' điểm %'; };
  function isNum(x) { return typeof x === 'number' && !isNaN(x); }

  // Result helpers -------------------------------------------------------
  function missing(text) { return { level: 'missing', text: 'Không tính được: ' + text }; }
  function result(level, expr, rules) {
    var rule = level === 'red' ? rules.red : level === 'yellow' ? rules.yellow : [rules.yellow, rules.red].filter(Boolean).join('; ');
    return { level: level, text: expr + ' · ' + rule };
  }
  function need(values, keys, suffix) {
    var gaps = keys.filter(function (k) { return !isNum(values && values[k]); })
      .map(function (k) { return FHC.lines.label(k) + (suffix || ''); });
    return gaps.length ? gaps : null;
  }
  function ratioOf(list, key) { return list ? list.filter(function (r) { return r.key === key; })[0] : null; }
  function growth(now, before) { return before > 0 ? now / before - 1 : NaN; }

  // Flag rules -----------------------------------------------------------
  var RULES = {
    F01: function (c) {
      var r = ratioOf(c.ratios, 'currentRatio');
      if (r.status !== 'ok') return missing(r.reason.replace('Không tính được: ', ''));
      var v = r.value;
      var expr = 'TSNH ' + n(c.v.currentAssets) + ' / Nợ NH ' + n(c.v.currentLiabilities) + ' = ' + n(v);
      return result(v < 1 ? 'red' : v < 1.2 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi 1,0 – < 1,2', red: 'Đỏ khi < 1,0' });
    },
    F02: function (c) {
      var r = ratioOf(c.ratios, 'quickRatio');
      if (r.status !== 'ok') return missing(r.reason.replace('Không tính được: ', ''));
      var expr = '(TSNH ' + n(c.v.currentAssets) + ' − HTK ' + n(c.v.inventories) + ') / Nợ NH ' + n(c.v.currentLiabilities) + ' = ' + n(r.value);
      return result(r.value < 0.5 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi < 0,5' });
    },
    F03: function (c) {
      var gaps = need(c.v, ['profitBeforeTax', 'interest']);
      if (gaps) return missing(gaps.join(', '));
      var rules = { yellow: 'Vàng khi 1,5 – < 3', red: 'Đỏ khi < 1,5 hoặc EBIT âm có vay' };
      if (c.v.interest === 0) return { level: 'none', text: 'Không có chi phí lãi vay' };
      var ebit = c.v.profitBeforeTax + c.v.interest;
      var v = ebit / c.v.interest;
      var expr = 'EBIT ' + n(ebit) + ' / Lãi vay ' + n(c.v.interest) + ' = ' + n(v);
      return result(ebit < 0 || v < 1.5 ? 'red' : v < 3 ? 'yellow' : 'none', expr, rules);
    },
    F04: function (c) {
      var gaps = need(c.v, ['shortBorrowings', 'longBorrowings', 'profitBeforeTax', 'interest', 'depreciation']);
      if (gaps) return missing(gaps.join(', '));
      var debt = c.v.shortBorrowings + c.v.longBorrowings;
      var ebitda = c.v.profitBeforeTax + c.v.interest + c.v.depreciation;
      var rules = { yellow: 'Vàng khi > 4', red: 'Đỏ khi > 6 hoặc EBITDA ≤ 0 có vay' };
      if (debt === 0) return { level: 'none', text: 'Không có nợ vay' };
      if (ebitda <= 0) return result('red', 'Nợ vay ' + n(debt) + ', EBITDA ' + n(ebitda) + ' ≤ 0', rules);
      var v = debt / ebitda;
      return result(v > 6 ? 'red' : v > 4 ? 'yellow' : 'none', 'Nợ vay ' + n(debt) + ' / EBITDA ' + n(ebitda) + ' = ' + n(v), rules);
    },
    F05: function (c) {
      var gaps = need(c.v, ['equity', 'retainedEarnings']);
      if (gaps) return missing(gaps.join(', '));
      var expr = 'VCSH ' + n(c.v.equity) + '; LNST chưa phân phối ' + n(c.v.retainedEarnings);
      var level = c.v.equity <= 0 ? 'red' : c.v.retainedEarnings < 0 ? 'yellow' : 'none';
      return result(level, expr, { yellow: 'Vàng khi LNST chưa phân phối < 0', red: 'Đỏ khi VCSH ≤ 0' });
    },
    F06: function (c) {
      var gaps = need(c.v, ['profitAfterTax', 'cfo']);
      if (gaps) return missing(gaps.join(', '));
      var hit = function (v) { return v.profitAfterTax > 0 && v.cfo < 0; };
      var expr = 'LNST ' + n(c.v.profitAfterTax) + ', CFO ' + n(c.v.cfo);
      var rules = { yellow: 'Vàng khi LNST > 0 và CFO < 0 một năm', red: 'Đỏ khi hai năm liền' };
      if (!hit(c.v)) return result('none', expr, rules);
      var priorHit = c.p && isNum(c.p.profitAfterTax) && isNum(c.p.cfo) && hit(c.p);
      if (priorHit) expr += '; năm trước LNST ' + n(c.p.profitAfterTax) + ', CFO ' + n(c.p.cfo);
      return result(priorHit ? 'red' : 'yellow', expr, rules);
    },
    F07: function (c) {
      var gaps = need(c.v, ['profitAfterTax', 'cfo']);
      if (gaps) return missing(gaps.join(', '));
      var rules = { yellow: 'Vàng khi CFO / LNST < 0,5 hai năm liền (LNST > 0)' };
      var low = function (v) { return v.profitAfterTax > 0 && v.cfo / v.profitAfterTax < 0.5; };
      var expr = 'CFO / LNST = ' + (c.v.profitAfterTax > 0 ? n(c.v.cfo / c.v.profitAfterTax) : 'không áp dụng (LNST ≤ 0)');
      if (!low(c.v)) return result('none', expr, rules);
      var pg = need(c.p, ['profitAfterTax', 'cfo'], ' năm trước');
      if (pg) return missing(pg.join(', '));
      expr += '; năm trước ' + (c.p.profitAfterTax > 0 ? n(c.p.cfo / c.p.profitAfterTax) : 'LNST ≤ 0');
      return result(low(c.p) ? 'yellow' : 'none', expr, rules);
    },
    F08: function (c) {
      var gaps = need(c.v, ['profitAfterTax', 'cfo', 'totalAssets']);
      if (gaps) return missing(gaps.join(', '));
      var start = c.p && isNum(c.p.totalAssets) ? c.p.totalAssets : null;
      var avg = start === null ? c.v.totalAssets : (start + c.v.totalAssets) / 2;
      if (avg === 0) return missing('Tổng cộng tài sản bằng 0');
      var v = (c.v.profitAfterTax - c.v.cfo) / avg;
      var expr = '(LNST ' + n(c.v.profitAfterTax) + ' − CFO ' + n(c.v.cfo) + ') / Tổng TS bq ' + n(avg) + ' = ' + pct(v) +
        (start === null ? ' (dùng số cuối năm)' : '');
      return result(v > 0.1 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi > 10%' });
    },
    F09: function (c) {
      var gaps = need(c.v, ['operatingProfit', 'otherProfit', 'profitBeforeTax', 'profitAfterTax']);
      if (gaps) return missing(gaps.join(', '));
      var share = c.v.profitBeforeTax > 0 ? c.v.otherProfit / c.v.profitBeforeTax : NaN;
      var hit = (c.v.operatingProfit < 0 && c.v.profitAfterTax > 0) || share > 0.5;
      var expr = 'LN thuần HĐKD ' + n(c.v.operatingProfit) + '; LN khác / LNTT = ' + (isNum(share) ? pct(share) : 'không áp dụng');
      return result(hit ? 'yellow' : 'none', expr, { yellow: 'Vàng khi LN thuần HĐKD < 0 mà LNST > 0, hoặc LN khác / LNTT > 50%' });
    },
    F10: function (c) {
      var gaps = (need(c.v, ['tradeReceivables', 'revenue']) || []).concat(need(c.p, ['tradeReceivables', 'revenue'], ' năm trước') || []);
      if (gaps.length) return missing(gaps.join(', '));
      var gr = growth(c.v.tradeReceivables, c.p.tradeReceivables);
      var gs = growth(c.v.revenue, c.p.revenue);
      if (!isNum(gr) || !isNum(gs)) return missing('số năm trước ≤ 0');
      var d = (gr - gs) * 100;
      var expr = 'Phải thu KH ' + pct(gr) + ' − Doanh thu ' + pct(gs) + ' = ' + pts(d);
      return result(d > 50 ? 'red' : d > 20 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi > 20 điểm %', red: 'Đỏ khi > 50 điểm %' });
    },
    F11: function (c) {
      var gaps = (need(c.v, ['inventories', 'cogs']) || []).concat(need(c.p, ['inventories', 'cogs'], ' năm trước') || []);
      if (gaps.length) return missing(gaps.join(', '));
      var gi = growth(c.v.inventories, c.p.inventories);
      var gc = growth(c.v.cogs, c.p.cogs);
      if (!isNum(gi) || !isNum(gc)) return missing('số năm trước ≤ 0');
      var d = (gi - gc) * 100;
      return result(d > 20 ? 'yellow' : 'none', 'HTK ' + pct(gi) + ' − Giá vốn ' + pct(gc) + ' = ' + pts(d), { yellow: 'Vàng khi > 20 điểm %' });
    },
    F12: function (c) {
      var now = ratioOf(c.ratios, 'cashConversionCycle');
      var before = ratioOf(c.prevRatios, 'cashConversionCycle');
      if (now.status !== 'ok') return missing(now.reason.replace('Không tính được: ', ''));
      if (!before || before.status !== 'ok') return missing('chu kỳ tiền mặt năm trước');
      var d = now.value - before.value;
      var expr = 'Chu kỳ tiền mặt ' + n(now.value, 0) + ' ngày, năm trước ' + n(before.value, 0) + ' ngày, tăng ' + n(d, 0) + ' ngày';
      return result(d > 90 ? 'red' : d > 30 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi tăng > 30 ngày', red: 'Đỏ khi tăng > 90 ngày' });
    },
    F13: function (c) {
      var now = ratioOf(c.ratios, 'grossMargin');
      var before = ratioOf(c.prevRatios, 'grossMargin');
      if (now.status !== 'ok') return missing(now.reason.replace('Không tính được: ', ''));
      if (!before || before.status !== 'ok') return missing('biên gộp năm trước');
      var drop = (before.value - now.value) * 100;
      var expr = 'Biên gộp ' + pct(now.value) + ', năm trước ' + pct(before.value);
      return result(drop > 10 ? 'red' : drop > 5 ? 'yellow' : 'none', expr, { yellow: 'Vàng khi giảm > 5 điểm %', red: 'Đỏ khi giảm > 10 điểm %' });
    },
    F14: function (c) {
      var r = ratioOf(c.ratios, 'revenueGrowth');
      if (r.status !== 'ok') return missing(r.reason.replace(/^Không (tính được|áp dụng): /, ''));
      return result(r.value < -0.4 ? 'red' : r.value < -0.2 ? 'yellow' : 'none', 'Tăng trưởng doanh thu ' + pct(r.value),
        { yellow: 'Vàng khi < −20%', red: 'Đỏ khi < −40%' });
    },
    F15: function (c) {
      var z = c.altman;
      if (z.status !== 'ok') return missing(z.reason.replace('Không tính được: ', ''));
      var level = z.zone === 'nguy hiểm' ? 'red' : z.zone === 'xám' ? 'yellow' : 'none';
      var rules = z.variant === "Z'" ? { yellow: 'Vàng khi 1,23 – 2,9 (vùng xám)', red: 'Đỏ khi < 1,23' }
        : { yellow: 'Vàng khi 1,1 – 2,6 (vùng xám)', red: 'Đỏ khi < 1,1' };
      return result(level, z.variant + ' = ' + n(z.value) + ' (vùng ' + z.zone + ')', rules);
    },
    F16: function (c) {
      var m = c.beneish;
      if (m.status !== 'ok') return missing(m.reason.replace('Không tính được: ', ''));
      var level = m.value > -1.78 ? 'red' : m.value >= -2.22 ? 'yellow' : 'none';
      return result(level, 'M = ' + n(m.value), { yellow: 'Vàng khi −2,22 – −1,78', red: 'Đỏ khi > −1,78' });
    },
    F17: function (c) {
      var f = c.piotroski;
      if (f.computable < 9) return missing('chỉ tính được ' + f.computable + '/9 tiêu chí');
      return result(f.value <= 3 ? 'yellow' : 'none', 'F = ' + f.value + '/9', { yellow: 'Vàng khi ≤ 3' });
    },
    F18: function (c) {
      var o = c.opinion;
      var text = { unqualified: 'chấp nhận toàn phần', emphasis: 'có đoạn vấn đề cần nhấn mạnh', qualified: 'ngoại trừ',
        adverse: 'trái ngược', disclaimer: 'từ chối đưa ra ý kiến', 'going-concern': 'nghi ngờ khả năng hoạt động liên tục' }[o];
      if (!text) return missing('chưa chọn ý kiến kiểm toán');
      var level = o === 'unqualified' ? 'none' : o === 'emphasis' ? 'yellow' : 'red';
      return result(level, 'Ý kiến kiểm toán: ' + text,
        { yellow: 'Vàng khi có đoạn nhấn mạnh', red: 'Đỏ khi ngoại trừ, trái ngược, từ chối hoặc nghi ngờ hoạt động liên tục' });
    }
  };

  function notesFor(industry) {
    var list = Array.isArray(industry) ? industry : industry ? [industry] : [];
    var keys = [];
    list.forEach(function (i) {
      if (i === 'infrastructure') keys.push('infrastructure-low', 'infrastructure-watch');
      else keys.push(i);
    });
    var byCode = {};
    keys.forEach(function (k) {
      var note = NOTES[k];
      if (!note) return;
      note.codes.forEach(function (code) { byCode[code] = byCode[code] ? byCode[code] + ' · ' + note.text : note.text; });
    });
    return byCode;
  }

  function evaluate(company) {
    var years = company.years.slice().sort(function (a, b) { return a.year - b.year; });
    var ratios = FHC.ratios.compute(years);
    var altman = FHC.scores.altman(years, company.companyType);
    var beneish = FHC.scores.beneish(years);
    var piotroski = FHC.scores.piotroski(years);
    var notes = notesFor(company.industry);
    var opinions = company.auditOpinions || {};
    var out = {};
    years.forEach(function (y, i) {
      var prior = i > 0 && years[i - 1].year === y.year - 1 ? years[i - 1] : null;
      var ctx = {
        v: y.values, p: prior ? prior.values : null, ratios: ratios[y.year], prevRatios: prior ? ratios[prior.year] : null,
        altman: altman[y.year], beneish: beneish[y.year], piotroski: piotroski[y.year], opinion: opinions[y.year]
      };
      var flags = Object.keys(RULES).map(function (code) {
        var f = { code: code, name: NAMES[code] };
        if (company.companyType === 'financial') {
          f.level = 'not-applicable';
          f.reason = code + ' · Không áp dụng: ngân hàng, bảo hiểm, chứng khoán';
          return f;
        }
        var r = RULES[code](ctx);
        f.level = r.level;
        f.reason = code + ' · ' + r.text;
        if (notes[code]) f.note = notes[code];
        return f;
      });
      out[y.year] = {
        flags: flags,
        counts: {
          red: flags.filter(function (f) { return f.level === 'red'; }).length,
          yellow: flags.filter(function (f) { return f.level === 'yellow'; }).length
        }
      };
    });
    return out;
  }

  FHC.flags = { evaluate: evaluate, DISCLAIMER: DISCLAIMER, NAMES: NAMES };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
