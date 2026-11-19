// T-002: line catalogue TT200 / TT99 (REQ-002, AC-001.3 matching part).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/lines.js') : T.load();
  var A = T.assert;
  var L = function () {
    A.ok(FHC && FHC.lines, 'FHC.lines should exist');
    return FHC.lines;
  };

  T.test('AC-002.1 FY2025 defaults to TT200, FY2026 to TT99', function () {
    A.equal(L().defaultTemplate(2025), 'TT200');
    A.equal(L().defaultTemplate(2026), 'TT99');
    A.equal(L().defaultTemplate(2030), 'TT99');
  });

  T.test('AC-002.1 non-calendar fiscal year uses its start date', function () {
    A.equal(L().defaultTemplate('2025-04-01'), 'TT200', 'FY starting 1 Apr 2025');
    A.equal(L().defaultTemplate('2026-01-01'), 'TT99', 'FY starting 1 Jan 2026');
  });

  T.test('AC-002.2 interest uses TT200 code 23 and TT99 code 24, never TT99 code 23', function () {
    A.equal(L().codeFor('interest', 'TT200'), '23');
    A.equal(L().codeFor('interest', 'TT99'), '24');
    A.equal(L().keyForCode('B02', '23', 'TT200'), 'interest');
    A.equal(L().keyForCode('B02', '23', 'TT99'), 'financialExpense');
    A.equal(L().keyForCode('B02', '24', 'TT99'), 'interest');
  });

  T.test('AC-002.2 balance sheet codes that moved in TT99', function () {
    A.equal(L().codeFor('totalAssets', 'TT200'), '270');
    A.equal(L().codeFor('totalAssets', 'TT99'), '280');
    A.equal(L().codeFor('shortBorrowings', 'TT99'), '321');
    A.equal(L().codeFor('longBorrowings', 'TT99'), '339');
    A.equal(L().codeFor('retainedEarnings', 'TT200'), '421');
    A.equal(L().codeFor('retainedEarnings', 'TT99'), '420');
    A.equal(L().keyForCode('B01', '270', 'TT99'), 'otherNonCurrentAssets');
  });

  T.test('AC-002.3 TT99-only lines exist only in TT99 and belong to a group', function () {
    var cases = [
      ['shortBiological', '150', 'currentAssets'],
      ['longBiological', '230', 'nonCurrentAssets'],
      ['dividendsPayable', '313', 'currentLiabilities'],
      ['investmentPropertyGain', '21', 'operatingProfit']
    ];
    cases.forEach(function (c) {
      A.equal(L().codeFor(c[0], 'TT99'), c[1], c[0] + ' TT99 code');
      A.equal(L().codeFor(c[0], 'TT200'), null, c[0] + ' has no TT200 code');
      A.equal(L().get(c[0]).parent, c[2], c[0] + ' parent');
    });
    A.ok(L().childrenOf('currentAssets', 'TT99').indexOf('shortBiological') >= 0, 'TT99 children include shortBiological');
    A.ok(L().childrenOf('currentAssets', 'TT200').indexOf('shortBiological') < 0, 'TT200 children exclude shortBiological');
  });

  T.test('AC-001.3 pasted rows match by line name; unknown rows listed', function () {
    var rows = [
      ['A. TÀI SẢN NGẮN HẠN', 103682.04],
      ['I. Tiền và các khoản tương đương tiền', 8300.89],
      ['IV. Hàng tồn kho', 52828.23],
      ['1. Hàng tồn kho', 52892.27],
      ['TỔNG CỘNG TÀI SẢN', 257921.58],
      ['11. Vay và nợ thuê tài chính ngăn hạn', 64694.96],
      ['10. Lợi nhuận sau thuế chưa phân phối', 51034.81],
      ['8. Quỹ đầu tư phát triển', 1388.44]
    ];
    var r = L().matchRows(rows, 'B01');
    A.equal(r.matched.currentAssets, 103682.04, 'group with letter prefix');
    A.equal(r.matched.cash, 8300.89, 'roman numeral prefix');
    A.equal(r.matched.inventories, 52828.23, 'first "Hàng tồn kho" (the group) wins');
    A.equal(r.matched.totalAssets, 257921.58, 'upper case');
    A.equal(r.matched.shortBorrowings, 64694.96, 'site typo "ngăn hạn" still matches');
    A.equal(r.matched.retainedEarnings, 51034.81);
    A.equal(r.unknown.length, 2, 'unknown rows: second "Hàng tồn kho" and "Quỹ đầu tư phát triển"');
    A.equal(r.unknown[1], '8. Quỹ đầu tư phát triển');
  });

  T.test('AC-001.3 matching is per statement; both interest names accepted', function () {
    var b02 = L().matchRows([['- Trong đó: Chi phí lãi vay', 3114.86]], 'B02');
    A.equal(b02.matched.interest, 3114.86, 'TT200 name with "Trong đó"');
    var b02new = L().matchRows([['Chi phí đi vay', 10]], 'B02');
    A.equal(b02new.matched.interest, 10, 'TT99 name');
    var b03 = L().matchRows([['1. Lợi nhuận trước thuế', 18040.59], ['- Chi phí lãi vay', 3114.86], ['- Khấu hao TSCĐ và BĐSĐT', 8468.26]], 'B03');
    A.equal(b03.matched.cfProfitBeforeTax, 18040.59);
    A.equal(b03.matched.depreciation, 8468.26);
    A.equal(b03.unknown.length, 1, 'B03 interest line is not a catalogue line');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
