// T-002: catalogue of the report lines the tool needs, with codes per template.
// Codes: TT200/2014 and TT99/2025 (spec 001 §1). TT99 codes from an unofficial copy
// of Phụ lục IV (expertis.vn), not yet checked against the official gazette (RISKS PR-02).
// Matching is by line NAME first; codes are secondary (REQ-002).
(function (root) {
  'use strict';
  var FHC = typeof require === 'function' && typeof module !== 'undefined' ? require('./fhc.js') : root.FHC;

  var TT99_START = '2026-01-01';

  // [key, statement, TT200 code, TT99 code, parent key, names...]
  // "parent" = the group the line belongs to on the form. It is NOT always additive:
  // `interest` is a "trong đó" part of `financialExpense`, and B02 lines carry signs.
  // Sum checks (T-003) must define their own formulas, not just add children.
  var ROWS = [
    // B01 statement of financial position
    ['currentAssets', 'B01', '100', '100', null, 'Tài sản ngắn hạn'],
    ['cash', 'B01', '110', '110', 'currentAssets', 'Tiền và các khoản tương đương tiền', 'Tiền và tương đương tiền'],
    ['shortReceivables', 'B01', '130', '130', 'currentAssets', 'Các khoản phải thu ngắn hạn', 'Phải thu ngắn hạn'],
    ['tradeReceivables', 'B01', '131', '131', 'shortReceivables', 'Phải thu ngắn hạn của khách hàng'],
    ['inventories', 'B01', '140', '140', 'currentAssets', 'Hàng tồn kho'],
    ['shortBiological', 'B01', null, '150', 'currentAssets', 'Tài sản sinh học ngắn hạn'],
    ['nonCurrentAssets', 'B01', '200', '200', null, 'Tài sản dài hạn'],
    ['tangibleFixedAssets', 'B01', '221', '221', 'nonCurrentAssets', 'Tài sản cố định hữu hình'],
    ['longBiological', 'B01', null, '230', 'nonCurrentAssets', 'Tài sản sinh học dài hạn'],
    ['otherNonCurrentAssets', 'B01', '260', '270', 'nonCurrentAssets', 'Tài sản dài hạn khác'],
    ['totalAssets', 'B01', '270', '280', null, 'Tổng cộng tài sản', 'Tổng tài sản'],
    ['liabilities', 'B01', '300', '300', null, 'Nợ phải trả'],
    ['currentLiabilities', 'B01', '310', '310', 'liabilities', 'Nợ ngắn hạn'],
    ['tradePayables', 'B01', '311', '311', 'currentLiabilities', 'Phải trả người bán ngắn hạn'],
    ['dividendsPayable', 'B01', null, '313', 'currentLiabilities', 'Phải trả cổ tức, lợi nhuận'],
    ['shortBorrowings', 'B01', '320', '321', 'currentLiabilities', 'Vay và nợ thuê tài chính ngắn hạn'],
    ['nonCurrentLiabilities', 'B01', '330', '330', 'liabilities', 'Nợ dài hạn'],
    ['longBorrowings', 'B01', '338', '339', 'nonCurrentLiabilities', 'Vay và nợ thuê tài chính dài hạn'],
    ['equity', 'B01', '400', '400', null, 'Vốn chủ sở hữu'],
    ['contributedCapital', 'B01', '411', '411', 'equity', 'Vốn góp của chủ sở hữu', 'Vốn đầu tư của chủ sở hữu'],
    ['retainedEarnings', 'B01', '421', '420', 'equity', 'Lợi nhuận sau thuế chưa phân phối', 'LNST chưa phân phối'],
    ['totalResources', 'B01', '440', '440', null, 'Tổng cộng nguồn vốn', 'Tổng nguồn vốn'],
    // B02 income statement
    ['revenue', 'B02', '10', '10', null, 'Doanh thu thuần về bán hàng và cung cấp dịch vụ', 'Doanh thu thuần'],
    ['cogs', 'B02', '11', '11', null, 'Giá vốn hàng bán'],
    ['grossProfit', 'B02', '20', '20', null, 'Lợi nhuận gộp về bán hàng và cung cấp dịch vụ', 'Lợi nhuận gộp'],
    ['investmentPropertyGain', 'B02', null, '21', 'operatingProfit', 'Lãi, lỗ từ hoạt động bán, thanh lý bất động sản đầu tư', 'Lãi/lỗ từ hoạt động bán, thanh lý bất động sản đầu tư'],
    ['financialIncome', 'B02', '21', '22', 'operatingProfit', 'Doanh thu hoạt động tài chính'],
    ['financialExpense', 'B02', '22', '23', 'operatingProfit', 'Chi phí tài chính'],
    ['interest', 'B02', '23', '24', 'financialExpense', 'Chi phí lãi vay', 'Chi phí đi vay'],
    ['sellingExpense', 'B02', '25', '25', 'operatingProfit', 'Chi phí bán hàng'],
    ['adminExpense', 'B02', '26', '26', 'operatingProfit', 'Chi phí quản lý doanh nghiệp'],
    ['operatingProfit', 'B02', '30', '30', null, 'Lợi nhuận thuần từ hoạt động kinh doanh'],
    ['otherProfit', 'B02', '40', '40', null, 'Lợi nhuận khác'],
    ['profitBeforeTax', 'B02', '50', '50', null, 'Tổng lợi nhuận kế toán trước thuế'],
    ['profitAfterTax', 'B02', '60', '60', null, 'Lợi nhuận sau thuế thu nhập doanh nghiệp', 'Lợi nhuận sau thuế'],
    // B03 cash flow statement (indirect method)
    ['cfProfitBeforeTax', 'B03', '01', '01', null, 'Lợi nhuận trước thuế'],
    ['depreciation', 'B03', '02', '02', null, 'Khấu hao TSCĐ và BĐSĐT', 'Khấu hao tài sản cố định và bất động sản đầu tư'],
    ['cfo', 'B03', '20', '20', null, 'Lưu chuyển tiền thuần từ hoạt động kinh doanh'],
    ['shareIssue', 'B03', '31', '31', null, 'Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu']
  ];

  // Lower case, no Vietnamese accents, no numbering prefix, no "(...)", single spaces.
  function normalize(label) {
    var s = String(label == null ? '' : label).toLowerCase();
    s = s.replace(/đ/g, 'd');
    if (s.normalize) s = s.normalize('NFD');
    s = s.replace(/[̀-ͯ]/g, '');
    s = s.replace(/\([^)]*\)/g, ' ');
    s = s.replace(/^[\s\-–•*+]+/, '');
    s = s.replace(/^trong do\s*:?\s*/, '');
    s = s.replace(/^(?:[ivxlcdm]+|[a-z]|\d+)\s*[\.\)]\s*/, '');
    s = s.replace(/^trong do\s*:?\s*/, '');
    s = s.replace(/[^a-z0-9\/,]+/g, ' ');
    s = s.replace(/\s*,\s*/g, ', ');
    return s.replace(/\s+/g, ' ').trim();
  }

  var byKey = {};
  var byName = { B01: {}, B02: {}, B03: {} };
  var list = ROWS.map(function (r) {
    var entry = { key: r[0], statement: r[1], codes: { TT200: r[2], TT99: r[3] }, parent: r[4], names: r.slice(5) };
    byKey[entry.key] = entry;
    entry.names.forEach(function (n) { byName[entry.statement][normalize(n)] = entry.key; });
    return entry;
  });

  function checkTemplate(template) {
    if (template !== 'TT200' && template !== 'TT99') throw new Error('Unknown template: ' + template);
  }

  var lines = {
    all: list,
    normalize: normalize,

    // fiscalYear: a calendar year number (FY = calendar year) or the FY start date 'YYYY-MM-DD'.
    defaultTemplate: function (fiscalYear) {
      var start = typeof fiscalYear === 'number' ? fiscalYear + '-01-01' : String(fiscalYear);
      return start >= TT99_START ? 'TT99' : 'TT200';
    },

    get: function (key) {
      return byKey[key] || null;
    },

    codeFor: function (key, template) {
      checkTemplate(template);
      var e = byKey[key];
      return e ? e.codes[template] : null;
    },

    keyForCode: function (statement, code, template) {
      checkTemplate(template);
      for (var i = 0; i < list.length; i++) {
        if (list[i].statement === statement && list[i].codes[template] === String(code)) return list[i].key;
      }
      return null;
    },

    childrenOf: function (parentKey, template) {
      checkTemplate(template);
      return list.filter(function (e) { return e.parent === parentKey && e.codes[template] !== null; })
        .map(function (e) { return e.key; });
    },

    // rows: [[label, value], ...] in report order. First row matching a key wins;
    // later rows with the same name and rows not in the catalogue go to `unknown`.
    matchRows: function (rows, statement) {
      var names = byName[statement];
      if (!names) throw new Error('Unknown statement: ' + statement);
      var matched = {};
      var unknown = [];
      rows.forEach(function (row) {
        var key = names[normalize(row[0])];
        if (key && !Object.prototype.hasOwnProperty.call(matched, key)) {
          matched[key] = row[1];
        } else {
          unknown.push(row[0]);
        }
      });
      return { matched: matched, unknown: unknown };
    }
  };

  FHC.lines = lines;
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
