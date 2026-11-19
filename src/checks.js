// T-003: checks on entered numbers before any calculation (REQ-003).
// Issues: { level: 'error' | 'warning', code, message, label? }.
// Only "assets vs resources" marks the year as unbalanced ("số chưa cân", AC-003.1).
// Missing numbers (null) skip a check; they never count as a pass or a fail.
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) {
    require('./format.js');
    require('./lines.js');
  }

  // Tolerance in the entered unit: public sites round each line to 2 decimals,
  // so sums of rounded lines can differ by a few hundredths [ASSUMPTION, review at T-013].
  var TOLERANCE = 0.05;

  function num(x) { return FHC.format.number(x); }
  function has(x) { return typeof x === 'number' && !isNaN(x); }
  function differs(a, b) { return Math.abs(a - b) > TOLERANCE; }

  function groupMessage(name, sum, total) {
    return 'Nhóm "' + name + '": các dòng con cộng lại ' + num(sum) + ', khác dòng tổng ' + num(total) +
      ' (lệch ' + num(Math.abs(sum - total)) + ')';
  }

  // Identities between catalogue lines: [code, total key, part keys, group name for the message]
  var SUMS = [
    ['sum:totalAssets', 'totalAssets', ['currentAssets', 'nonCurrentAssets'], 'Tổng cộng tài sản'],
    ['sum:liabilities', 'liabilities', ['currentLiabilities', 'nonCurrentLiabilities'], 'Nợ phải trả'],
    ['sum:totalResources', 'totalResources', ['liabilities', 'equity'], 'Tổng cộng nguồn vốn']
  ];

  function catalogueChecks(v) {
    var issues = [];
    if (has(v.totalAssets) && has(v.totalResources) && differs(v.totalAssets, v.totalResources)) {
      issues.push({ level: 'error', code: 'assets-vs-resources',
        message: 'Lệch ' + num(Math.abs(v.totalAssets - v.totalResources)) + ': tài sản ≠ nguồn vốn' });
    }
    SUMS.forEach(function (s) {
      var total = v[s[1]];
      var parts = s[2].map(function (k) { return v[k]; });
      if (!has(total) || !parts.every(has)) return;
      var sum = parts.reduce(function (a, b) { return a + b; }, 0);
      if (differs(sum, total)) issues.push({ level: 'warning', code: s[0], message: groupMessage(s[3], sum, total) });
    });
    if (has(v.profitBeforeTax) && has(v.cfProfitBeforeTax) && differs(v.profitBeforeTax, v.cfProfitBeforeTax)) {
      issues.push({ level: 'warning', code: 'pbt-b02-vs-b03',
        message: 'LNTT ở B02 (' + num(v.profitBeforeTax) + ') khác "Lợi nhuận trước thuế" ở đầu B03 (' +
          num(v.cfProfitBeforeTax) + '), lệch ' + num(Math.abs(v.profitBeforeTax - v.cfProfitBeforeTax)) });
    }
    return issues;
  }

  // Level of a pasted B01 row from its numbering: A. = 1, I. = 2, 1. = 3, a) = 4, "-" = 5,
  // anything else (totals, headers) = 0 and ends the current group.
  function levelOf(label) {
    var s = String(label == null ? '' : label).replace(/^\s+/, '');
    if (/^[-–]/.test(s)) return 5;
    if (/^[a-z]\)/.test(s)) return 4;
    if (/^\d+\s*[\.\)]/.test(s)) return 3;
    if (/^(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\s*\./.test(s)) return 2;
    if (/^[A-E](?:\.|\s)\s*\S/.test(s)) return 1;
    return 0;
  }

  // AC-003.2: each numbered group must equal the sum of its direct sub-lines.
  function hierarchy(rows) {
    var issues = [];
    var levels = rows.map(function (r) { return levelOf(r[0]); });
    rows.forEach(function (row, i) {
      var level = levels[i];
      if (level === 0 || !has(row[1])) return;
      var descendants = [];
      for (var j = i + 1; j < rows.length && levels[j] > level; j++) descendants.push(j);
      if (descendants.length === 0) return;
      var childLevel = Math.min.apply(null, descendants.map(function (j) { return levels[j]; }));
      var values = descendants.filter(function (j) { return levels[j] === childLevel && has(rows[j][1]); })
        .map(function (j) { return rows[j][1]; });
      if (values.length === 0) return;
      var sum = values.reduce(function (a, b) { return a + b; }, 0);
      if (differs(sum, row[1])) {
        issues.push({ level: 'warning', code: 'sub-lines', label: row[0], message: groupMessage(row[0], sum, row[1]) });
      }
    });
    return issues;
  }

  // AC-003.3: asset allowances are negative; a positive one usually means a shifted row.
  // "Dự phòng phải trả" (provisions, a liability) is positive by nature and is not checked.
  function allowanceSigns(rows) {
    var issues = [];
    rows.forEach(function (row) {
      var name = FHC.lines.normalize(row[0]);
      if (name.indexOf('du phong') === 0 && name.indexOf('du phong phai tra') !== 0 && has(row[1]) && row[1] > 0) {
        issues.push({ level: 'warning', code: 'allowance-positive', label: row[0],
          message: 'Dòng "' + row[0] + '" là ' + num(row[1]) + ': dự phòng thường là số âm, có thể lệch dòng' });
      }
    });
    return issues;
  }

  // year: { values: { key: number|null }, rows?: { B01: [[label, value]], B02: [...], B03: [...] } }
  function runYear(year) {
    var values = (year && year.values) || {};
    var rows = (year && year.rows) || {};
    var issues = catalogueChecks(values);
    if (rows.B01) issues = issues.concat(hierarchy(rows.B01));
    ['B01', 'B02', 'B03'].forEach(function (st) {
      if (rows[st]) issues = issues.concat(allowanceSigns(rows[st]));
    });
    var unbalanced = issues.some(function (i) { return i.code === 'assets-vs-resources'; });
    return { issues: issues, unbalanced: unbalanced };
  }

  FHC.checks = { runYear: runYear, hierarchy: hierarchy, allowanceSigns: allowanceSigns, levelOf: levelOf, TOLERANCE: TOLERANCE };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
