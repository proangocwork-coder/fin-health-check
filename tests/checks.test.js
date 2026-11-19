// T-003: input checks before calculation (REQ-003, AC-002.3 group totals).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/checks.js') : T.load();
  var A = T.assert;
  var C = function () {
    A.ok(FHC && FHC.checks, 'FHC.checks should exist');
    return FHC.checks;
  };
  var codes = function (issues) { return issues.map(function (i) { return i.code; }); };

  T.test('format: Vietnamese number style', function () {
    A.ok(FHC.format, 'FHC.format should exist');
    A.equal(FHC.format.number(22.38), '22,38');
    A.equal(FHC.format.number(257921.58), '257.921,58');
    A.equal(FHC.format.number(-132.5), '-132,50');
    A.equal(FHC.format.number(1.1, 2), '1,10');
  });

  T.test('AC-003.1 assets vs resources mismatch 22.38', function () {
    var r = C().runYear({ values: { totalAssets: 257921.58, totalResources: 257899.20 } });
    var issue = r.issues.filter(function (i) { return i.code === 'assets-vs-resources'; })[0];
    A.ok(issue, 'mismatch reported');
    A.equal(issue.level, 'error');
    A.equal(issue.message, 'Lệch 22,38: tài sản ≠ nguồn vốn');
    A.equal(r.unbalanced, true, 'year marked "số chưa cân"');
  });

  T.test('AC-003.1 balanced year has no issue and is not marked', function () {
    var r = C().runYear({ values: { totalAssets: 1000, totalResources: 1000, currentAssets: 400, nonCurrentAssets: 600,
      liabilities: 700, currentLiabilities: 500, nonCurrentLiabilities: 200, equity: 300 } });
    A.equal(r.issues.length, 0, 'issues: ' + codes(r.issues).join(', '));
    A.equal(r.unbalanced, false);
  });

  T.test('AC-003.1 missing totals: check skipped, not reported as balanced or unbalanced', function () {
    var r = C().runYear({ values: { totalAssets: 1000, totalResources: null } });
    A.equal(r.issues.length, 0);
    A.equal(r.unbalanced, false);
  });

  T.test('AC-003.2 group totals from the catalogue: current + non-current = total; liabilities split', function () {
    var r = C().runYear({ values: { totalAssets: 1000, totalResources: 1000, currentAssets: 400, nonCurrentAssets: 590,
      liabilities: 700, currentLiabilities: 500, nonCurrentLiabilities: 150, equity: 300 } });
    var c = codes(r.issues);
    A.ok(c.indexOf('sum:totalAssets') >= 0, 'assets parts mismatch reported');
    A.ok(c.indexOf('sum:liabilities') >= 0, 'liabilities parts mismatch reported');
    A.equal(r.unbalanced, false, 'only assets vs resources marks the year');
  });

  T.test('AC-003.2 pasted sub-lines vs group (real CafeF column, receivables off by 6,74)', function () {
    var rows = [
      ['A. TÀI SẢN NGẮN HẠN', 103682.04],
      ['III. Các khoản phải thu ngắn hạn', 15064.70],
      ['1. Phải thu ngắn hạn của khách hàng', 10994.15],
      ['2. Trả trước cho người bán ngắn hạn', 1878.08],
      ['3. Phải thu nội bộ ngắn hạn', null],
      ['7. Dự phòng phải thu ngắn hạn khó đòi (*)', 2318.28],
      ['8. Tài sản thiếu chờ xử lý', -132.55],
      ['IV. Hàng tồn kho', 52828.23],
      ['1. Hàng tồn kho', 52892.27],
      ['2. Dự phòng giảm giá hàng tồn kho (*)', -64.05]
    ];
    var issues = C().hierarchy(rows);
    var recv = issues.filter(function (i) { return i.label === 'III. Các khoản phải thu ngắn hạn'; })[0];
    A.ok(recv, 'receivables group mismatch reported');
    A.equal(recv.message, 'Nhóm "III. Các khoản phải thu ngắn hạn": các dòng con cộng lại 15.057,96, khác dòng tổng 15.064,70 (lệch 6,74)');
    A.equal(issues.filter(function (i) { return i.label === 'IV. Hàng tồn kho'; }).length, 0, 'inventory group adds up');
  });

  T.test('AC-002.3 TT99-only group (biological assets) is counted inside its group', function () {
    var rows = [
      ['A. TÀI SẢN NGẮN HẠN', 1000],
      ['I. Tiền và các khoản tương đương tiền', 300],
      ['IV. Hàng tồn kho', 500],
      ['V. Tài sản sinh học ngắn hạn', 200],
      ['1. Súc vật nuôi lấy sản phẩm một lần ngắn hạn', 205],
      ['3. Dự phòng tổn thất tài sản sinh học ngắn hạn (*)', -5]
    ];
    A.equal(C().hierarchy(rows).length, 0, 'A = I + IV + V and V = 1 + 3');
  });

  T.test('AC-002.3 nested levels: a) b) and dash lines', function () {
    var rows = [
      ['1. Súc vật nuôi cho sản phẩm định kỳ', 182.95],
      ['a) Súc vật nuôi chưa đến giai đoạn trưởng thành', 53.72],
      ['b) Súc vật nuôi đến giai đoạn trưởng thành', 129.23],
      ['- Nguyên giá', 253.03],
      ['- Giá trị khấu hao lũy kế (*)', -123.80]
    ];
    A.equal(C().hierarchy(rows).length, 0);
  });

  T.test('AC-003.3 positive allowance warning; provisions payable are not warned', function () {
    var rows = [
      ['7. Dự phòng phải thu ngắn hạn khó đòi (*)', 2318.28],
      ['2. Dự phòng giảm giá hàng tồn kho (*)', -64.05],
      ['12. Dự phòng phải trả ngắn hạn', 15.44]
    ];
    var issues = C().allowanceSigns(rows);
    A.equal(issues.length, 1);
    A.equal(issues[0].level, 'warning');
    A.equal(issues[0].message, 'Dòng "7. Dự phòng phải thu ngắn hạn khó đòi (*)" là 2.318,28: dự phòng thường là số âm, có thể lệch dòng');
  });

  T.test('AC-003.4 PBT B02 vs B03', function () {
    var bad = C().runYear({ values: { profitBeforeTax: 18040.59, cfProfitBeforeTax: 18000 } });
    var issue = bad.issues.filter(function (i) { return i.code === 'pbt-b02-vs-b03'; })[0];
    A.ok(issue, 'mismatch reported');
    A.equal(issue.message, 'LNTT ở B02 (18.040,59) khác "Lợi nhuận trước thuế" ở đầu B03 (18.000,00), lệch 40,59');
    var ok = C().runYear({ values: { profitBeforeTax: 18040.59, cfProfitBeforeTax: 18040.59 } });
    A.equal(ok.issues.length, 0);
  });

  T.test('runYear passes pasted rows to hierarchy and allowance checks', function () {
    var r = C().runYear({ values: {}, rows: { B01: [['7. Dự phòng phải thu ngắn hạn khó đòi (*)', 5]] } });
    A.equal(codes(r.issues).join(','), 'allowance-positive');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
