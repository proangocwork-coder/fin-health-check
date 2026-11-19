// T-009: entry logic (REQ-001 AC-001.2–5, AC-002.1, REQ-010).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/entry.js') : T.load();
  var A = T.assert;
  var E = function () {
    A.ok(FHC && FHC.entry, 'FHC.entry should exist');
    return FHC.entry;
  };

  T.test('AC-001.5 empty cell is missing, "-" is zero, brackets are negative', function () {
    A.equal(E().parseNumber('', 'vn'), null);
    A.equal(E().parseNumber('   ', 'vn'), null);
    A.equal(E().parseNumber('-', 'vn'), 0);
    A.equal(E().parseNumber('(132,55)', 'vn'), -132.55);
    A.equal(E().parseNumber('-132,55', 'vn'), -132.55);
    A.equal(E().parseNumber('103.682,04', 'vn'), 103682.04);
    A.equal(E().parseNumber('103,682.04', 'en'), 103682.04);
    A.equal(E().parseNumber('abc', 'vn'), undefined, 'not a number → undefined (reported, not stored)');
  });

  T.test('number style detected from the pasted block', function () {
    A.equal(E().detectStyle('A\t8,300.89\t11,455.23'), 'en');
    A.equal(E().detectStyle('A\t8.300,89\t11.455,23'), 'vn');
    A.equal(E().detectStyle('A\t1,10'), 'vn', 'comma followed by 2 digits is a decimal mark');
    A.equal(E().detectStyle('A\t15,064\tB\t2,318.28'), 'en');
    A.equal(E().detectStyle('A\t1.234'), 'vn', 'ambiguous → Vietnamese default');
  });

  T.test('AC-001.3 paste: header row, several value columns, labels kept', function () {
    var text = 'Tài sản\tQ4-2025\tQ1-2026\n' +
      'A. TÀI SẢN NGẮN HẠN\t103,682.04\t104,365.18\n' +
      '1. Chứng khoán kinh doanh\t-\t-\n\n' +
      '8. Tài sản thiếu chờ xử lý\t-132.55\t6.82\n';
    var p = E().parsePaste(text);
    A.equal(p.style, 'en');
    A.equal(p.header.join('|'), 'Tài sản|Q4-2025|Q1-2026');
    A.equal(p.columns, 2);
    A.equal(p.rows.length, 3);
    A.equal(p.rows[0].label, 'A. TÀI SẢN NGẮN HẠN');
    A.equal(p.rows[0].values[1], 104365.18);
    A.equal(p.rows[1].values[0], 0);
    A.equal(p.rows[2].values[0], -132.55);
  });

  T.test('AC-001.3 paste without tabs (copied as text with several spaces)', function () {
    var p = E().parsePaste('Tiền và các khoản tương đương tiền    8.300,89\nHàng tồn kho   52.828,23');
    A.equal(p.rows.length, 2);
    A.equal(p.rows[1].values[0], 52828.23);
  });

  T.test('AC-001.3 apply pasted rows to a year: matched lines and unknown lines', function () {
    var c = E().newCompany();
    var p = E().parsePaste('A. TÀI SẢN NGẮN HẠN\t103.682,04\n8. Quỹ đầu tư phát triển\t1.388,44\nTỔNG CỘNG TÀI SẢN\t257.921,58');
    var r = E().applyPaste(c, 2025, 'B01', p, 0);
    A.equal(r.matched, 2);
    A.equal(r.unknown.join('|'), '8. Quỹ đầu tư phát triển');
    A.equal(c.years['2025'].values.currentAssets, 103682.04);
    A.equal(c.years['2025'].rows.B01.length, 3, 'raw rows kept for the checks (T-003)');
  });

  T.test('AC-001.4 unit conversion', function () {
    A.equal(E().convert(1.5, 'ty', 'trieu'), 1500);
    A.equal(E().convert(1.5, 'ty', 'dong'), 1500000000);
    A.equal(E().convert(2500, 'trieu', 'ty'), 2.5);
  });

  T.test('AC-002.1 new year gets the default template; Owner can change it', function () {
    var c = E().newCompany();
    E().ensureYear(c, 2025);
    E().ensureYear(c, 2026);
    A.equal(c.years['2025'].template, 'TT200');
    A.equal(c.years['2026'].template, 'TT99');
    E().setTemplate(c, 2026, 'TT200');
    A.equal(c.years['2026'].template, 'TT200');
  });

  T.test('manual cell entry: Vietnamese number, empty clears, "-" is zero', function () {
    var c = E().newCompany();
    E().setValue(c, 2025, 'cash', '8.300,89');
    A.equal(c.years['2025'].values.cash, 8300.89);
    E().setValue(c, 2025, 'cash', '-');
    A.equal(c.years['2025'].values.cash, 0);
    E().setValue(c, 2025, 'cash', '');
    A.equal(c.years['2025'].values.cash, null);
    A.equal(E().setValue(c, 2025, 'cash', 'x'), false, 'invalid text rejected');
  });

  T.test('AC-001.2 a year with only opening balances feeds the averages of the next year', function () {
    var c = E().newCompany();
    E().setValue(c, 2024, 'totalAssets', '224.489,71');
    E().setValue(c, 2025, 'totalAssets', '257.899,20');
    E().setValue(c, 2025, 'profitAfterTax', '15.514,93');
    var roa = FHC.ratios.compute(E().toYears(c))[2025].filter(function (r) { return r.key === 'roa'; })[0];
    A.equal(roa.note, undefined, 'average used, not year-end fallback');
    A.near(roa.value, 15514.93 / ((224489.71 + 257899.20) / 2), 1e-9);
  });

  T.test('REQ-010 audit opinion per year feeds the flags', function () {
    var c = E().newCompany();
    E().setAuditOpinion(c, 2025, 'qualified');
    A.equal(E().toCompany(c).auditOpinions[2025], 'qualified');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
