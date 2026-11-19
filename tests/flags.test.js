// T-008: flag engine F01–F18 (REQ-008, REQ-010, FLAG_RULES 0.2).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/flags.js') : T.load();
  var A = T.assert;
  var FL = function () {
    A.ok(FHC && FHC.flags, 'FHC.flags should exist');
    return FHC.flags;
  };

  function hpg() {
    return {
      companyType: 'manufacturing', industry: null, auditOpinions: { 2025: 'unqualified' },
      years: [
        { year: 2024, values: {
          currentAssets: 86674.28, cash: 6887.65, inventories: 46091.22, totalAssets: 224489.71, totalResources: 224489.71,
          currentLiabilities: 75225.24, equity: 114647.46, revenue: 138855.11, cogs: 120357.56,
          grossProfit: 18497.55, profitAfterTax: 12020.02, tradeReceivables: 5000 } },
        { year: 2025, values: {
          currentAssets: 103682.04, cash: 8300.89, inventories: 52828.23, totalAssets: 257899.20, totalResources: 257899.20,
          liabilities: 126679.19, currentLiabilities: 94208.65, shortBorrowings: 64694.96, longBorrowings: 27479.19,
          equity: 131220.01, retainedEarnings: 51037.90, revenue: 156116.09, cogs: 131618.31, grossProfit: 24497.79,
          interest: 3114.86, profitBeforeTax: 18040.59, profitAfterTax: 15514.93, operatingProfit: 17905.83,
          otherProfit: 134.76, depreciation: 8468.26, cfo: 15693.90, tradeReceivables: 10994.15 } }
      ]
    };
  }
  function flag(result, year, code) {
    var f = result[year].flags.filter(function (x) { return x.code === code; })[0];
    A.ok(f, code + ' present');
    return f;
  }

  T.test('AC-008.1 HPG 2025: F01 yellow with the exact reason line', function () {
    var f = flag(FL().evaluate(hpg()), 2025, 'F01');
    A.equal(f.level, 'yellow');
    A.equal(f.reason, 'F01 · TSNH 103.682,04 / Nợ NH 94.208,65 = 1,10 · Vàng khi 1,0 – < 1,2');
  });

  T.test('HPG 2025: F03, F04 not raised; F10 red on trade receivables; F15 grey zone yellow', function () {
    var r = FL().evaluate(hpg());
    A.equal(flag(r, 2025, 'F03').level, 'none');
    A.equal(flag(r, 2025, 'F04').level, 'none');
    var f10 = flag(r, 2025, 'F10');
    A.equal(f10.level, 'red', 'receivables 5000 → 10994 (+119.9%) vs revenue +12.4%');
    A.ok(f10.reason.indexOf('Phải thu KH') >= 0, 'F10 uses trade receivables (D-002)');
    A.equal(flag(r, 2025, 'F15').level, 'yellow');
  });

  T.test('AC-008.2 missing data: "Không tính được" with the line, never "none"', function () {
    var c = hpg();
    c.years[1].values.currentLiabilities = null;
    var f = flag(FL().evaluate(c), 2025, 'F01');
    A.equal(f.level, 'missing');
    A.equal(f.reason, 'F01 · Không tính được: Nợ ngắn hạn');
  });

  T.test('F03 red when EBIT is negative with interest; F04 red when EBITDA ≤ 0 with debt', function () {
    var c = hpg();
    c.years[1].values.profitBeforeTax = -20000;
    var r = FL().evaluate(c);
    A.equal(flag(r, 2025, 'F03').level, 'red');
    A.equal(flag(r, 2025, 'F04').level, 'red');
  });

  T.test('F05: negative retained earnings yellow, equity ≤ 0 red', function () {
    var c = hpg();
    c.years[1].values.retainedEarnings = -5;
    A.equal(flag(FL().evaluate(c), 2025, 'F05').level, 'yellow');
    c.years[1].values.equity = -1;
    A.equal(flag(FL().evaluate(c), 2025, 'F05').level, 'red');
  });

  T.test('F06: profit without cash, one year yellow, two years red', function () {
    var c = hpg();
    c.years[1].values.cfo = -100;
    A.equal(flag(FL().evaluate(c), 2025, 'F06').level, 'yellow');
    c.years[0].values.cfo = -50;
    A.equal(flag(FL().evaluate(c), 2025, 'F06').level, 'red');
  });

  T.test('F09: other profit above half of pre-tax profit', function () {
    var c = hpg();
    c.years[1].values.otherProfit = 10000;
    A.equal(flag(FL().evaluate(c), 2025, 'F09').level, 'yellow');
  });

  T.test('F13, F14: gross margin and revenue drops', function () {
    var c = hpg();
    c.years[1].values.revenue = 70000;   // -49.6%
    c.years[1].values.grossProfit = 2000; // margin 2.9% vs 13.3%
    var r = FL().evaluate(c);
    A.equal(flag(r, 2025, 'F14').level, 'red');
    A.equal(flag(r, 2025, 'F13').level, 'red');
  });

  T.test('F16 needs two years; first year is not computable', function () {
    A.equal(flag(FL().evaluate(hpg()), 2024, 'F16').level, 'missing');
  });

  T.test('F17 on a partial Piotroski score (FLAG_RULES note, Owner "Vẫn bật"): threshold applied to the computable criteria', function () {
    var c = hpg();
    c.years.unshift({ year: 2023, values: { totalAssets: 187782.59 } });
    c.years[1].values.cfo = 6600; c.years[1].values.shareIssue = 0;
    c.years[1].values.longBorrowings = 30000; c.years[1].values.currentLiabilities = 75225.24;
    var f = flag(FL().evaluate(c), 2024, 'F17');
    var p = FHC.scores.piotroski(c.years)[2024];
    A.ok(p.computable > 0 && p.computable < 9, 'partial score: ' + p.display);
    A.equal(f.level, p.value <= 3 ? 'yellow' : 'none');
    A.ok(f.reason.indexOf(p.value + '/' + p.computable + ' tiêu chí tính được') >= 0, f.reason);
  });

  T.test('F17 with no computable criterion stays "Không tính được"', function () {
    var c = hpg();
    c.years[0].values = { totalAssets: 1 };
    A.equal(flag(FL().evaluate(c), 2024, 'F17').level, 'missing');
  });

  T.test('AC-010.1 audit opinion: qualified red, emphasis yellow, unset not computable', function () {
    var c = hpg();
    c.auditOpinions = { 2025: 'qualified' };
    A.equal(flag(FL().evaluate(c), 2025, 'F18').level, 'red');
    c.auditOpinions = { 2025: 'emphasis' };
    A.equal(flag(FL().evaluate(c), 2025, 'F18').level, 'yellow');
    c.auditOpinions = {};
    var f = flag(FL().evaluate(c), 2025, 'F18');
    A.equal(f.level, 'missing');
    A.equal(f.reason, 'F18 · Không tính được: chưa chọn ý kiến kiểm toán');
  });

  T.test('financial firms: every flag not applicable', function () {
    var c = hpg();
    c.companyType = 'financial';
    var flags = FL().evaluate(c)[2025].flags;
    A.equal(flags.length, 18);
    flags.forEach(function (f) { A.equal(f.level, 'not-applicable', f.code); });
  });

  T.test('D-002 Q4: red and yellow counts, no total score', function () {
    var y = FL().evaluate(hpg())[2025];
    var red = y.flags.filter(function (f) { return f.level === 'red'; }).length;
    var yellow = y.flags.filter(function (f) { return f.level === 'yellow'; }).length;
    A.equal(y.counts.red, red);
    A.equal(y.counts.yellow, yellow);
    A.equal(y.score, undefined);
  });

  T.test('AC-008.3 industry note attached to related flags only', function () {
    var c = hpg();
    c.industry = 'real-estate';
    var y = FL().evaluate(c)[2025];
    var f01 = y.flags.filter(function (f) { return f.code === 'F01'; })[0];
    var f03 = y.flags.filter(function (f) { return f.code === 'F03'; })[0];
    A.ok(f01.note && f01.note.indexOf('Bất động sản') === 0, 'F01 has the real-estate note');
    A.equal(f03.note, undefined);
  });

  T.test('AC-008.4 disclaimer text', function () {
    A.equal(FL().DISCLAIMER, 'Tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu');
  });

  T.test('all 18 flags produced in order', function () {
    var codes = FL().evaluate(hpg())[2025].flags.map(function (f) { return f.code; });
    A.equal(codes.join(','), 'F01,F02,F03,F04,F05,F06,F07,F08,F09,F10,F11,F12,F13,F14,F15,F16,F17,F18');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
