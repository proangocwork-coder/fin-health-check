// T-009: entry logic, independent of the page (REQ-001, REQ-002, REQ-010).
// Company record (also the saved file format, T-010):
// { schema: 1, name, ticker, companyType, industry: [], unit: 'dong'|'trieu'|'ty',
//   years: { 'YYYY': { template: 'TT200'|'TT99', values: { key: number|null }, rows: { B01: [[label, value]] }, auditOpinion } } }
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) require('./lines.js');

  var UNIT_FACTORS = { dong: 1, trieu: 1e6, ty: 1e9 };

  // 'vn' = 1.234,56 · 'en' = 1,234.56. Decided from the whole pasted block.
  function detectStyle(text) {
    var tokens = String(text || '').match(/\d[\d.,]*\d/g) || [];
    var i, t, lastDot, lastComma;
    for (i = 0; i < tokens.length; i++) {
      t = tokens[i];
      lastDot = t.lastIndexOf('.');
      lastComma = t.lastIndexOf(',');
      if (lastDot >= 0 && lastComma >= 0) return lastDot > lastComma ? 'en' : 'vn';
    }
    for (i = 0; i < tokens.length; i++) {
      t = tokens[i];
      if ((t.match(/\./g) || []).length > 1) return 'vn';
      if ((t.match(/,/g) || []).length > 1) return 'en';
    }
    for (i = 0; i < tokens.length; i++) {
      t = tokens[i];
      var m = t.match(/([.,])(\d+)$/);
      if (m && m[2].length !== 3) return m[1] === ',' ? 'vn' : 'en';
    }
    return 'vn';
  }

  // null = empty (missing) · 0 = "-" · undefined = not a number (rejected).
  function parseNumber(text, style) {
    var s = String(text == null ? '' : text).trim();
    if (s === '') return null;
    if (s === '-' || s === '–') return 0;
    var negative = false;
    if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1).trim(); }
    if (/^[-–]/.test(s)) { negative = !negative; s = s.slice(1).trim(); }
    s = s.replace(/\s/g, '');
    s = style === 'en' ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(s)) return undefined;
    var v = parseFloat(s);
    return negative ? -v : v;
  }

  function parsePaste(text) {
    var style = detectStyle(text);
    var header = null;
    var rows = [];
    var problems = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) return;
      var cells = line.indexOf('\t') >= 0 ? line.split('\t') : line.trim().split(/\s{2,}/);
      cells = cells.map(function (c) { return c.trim(); });
      while (cells.length > 1 && cells[cells.length - 1] === '') cells.pop();
      var label = cells[0];
      var raw = cells.slice(1);
      var parsed = raw.map(function (c) { return parseNumber(c, style); });
      var allText = raw.length > 0 && parsed.every(function (v) { return v === undefined; });
      if (allText && header === null && rows.length === 0) {
        header = cells;
        return;
      }
      parsed = parsed.map(function (v, i) {
        if (v === undefined) { problems.push(label + ': "' + raw[i] + '"'); return null; }
        return v;
      });
      rows.push({ label: label, values: parsed });
    });
    var columns = rows.reduce(function (m, r) { return Math.max(m, r.values.length); }, 0);
    return { style: style, header: header, columns: columns, rows: rows, problems: problems };
  }

  function newCompany() {
    return { schema: 1, name: '', ticker: '', companyType: null, industry: [], unit: 'ty', years: {} };
  }

  function ensureYear(c, year) {
    var key = String(year);
    if (!c.years[key]) {
      c.years[key] = { template: FHC.lines.defaultTemplate(Number(year)), values: {}, rows: {}, auditOpinion: null };
    }
    return c.years[key];
  }

  function applyPaste(c, year, statement, parsed, columnIndex) {
    var col = columnIndex || 0;
    var y = ensureYear(c, year);
    var rows = parsed.rows.map(function (r) {
      var v = r.values[col];
      return [r.label, v === undefined ? null : v];
    });
    y.rows[statement] = rows;
    var match = FHC.lines.matchRows(rows, statement);
    Object.keys(match.matched).forEach(function (k) { y.values[k] = match.matched[k]; });
    return { matched: Object.keys(match.matched).length, unknown: match.unknown };
  }

  function setValue(c, year, key, text) {
    var s = String(text == null ? '' : text);
    var style = /\d[.,]\d.*[.,]/.test(s) ? detectStyle(s) : 'vn';
    var v = parseNumber(s, style);
    if (v === undefined) return false;
    ensureYear(c, year).values[key] = v;
    return true;
  }

  function setTemplate(c, year, template) { ensureYear(c, year).template = template; }
  function setAuditOpinion(c, year, opinion) { ensureYear(c, year).auditOpinion = opinion || null; }
  function removeYear(c, year) { delete c.years[String(year)]; }

  function convert(value, from, to) {
    if (value === null || value === undefined) return value;
    return value * UNIT_FACTORS[from] / UNIT_FACTORS[to];
  }

  function toYears(c) {
    return Object.keys(c.years).map(function (k) {
      return { year: Number(k), values: c.years[k].values, rows: c.years[k].rows, template: c.years[k].template };
    }).sort(function (a, b) { return a.year - b.year; });
  }

  function toCompany(c) {
    var opinions = {};
    Object.keys(c.years).forEach(function (k) {
      if (c.years[k].auditOpinion) opinions[Number(k)] = c.years[k].auditOpinion;
    });
    return { years: toYears(c), companyType: c.companyType, industry: c.industry, auditOpinions: opinions };
  }

  FHC.entry = {
    detectStyle: detectStyle, parseNumber: parseNumber, parsePaste: parsePaste, newCompany: newCompany,
    ensureYear: ensureYear, applyPaste: applyPaste, setValue: setValue, setTemplate: setTemplate,
    setAuditOpinion: setAuditOpinion, removeYear: removeYear, convert: convert, toYears: toYears, toCompany: toCompany,
    UNITS: { dong: 'đồng', trieu: 'triệu đồng', ty: 'tỷ đồng' }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
