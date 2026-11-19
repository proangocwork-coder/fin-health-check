// T-010: company files (D-004) and the browser draft.
// File: { app: 'fhc', schema: 1, savedAt, company } — company as in src/entry.js.
// Opening a file checks structure and every number before use (ARCHITECTURE "Security risks", OWASP A08).
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) { require('./lines.js'); require('./entry.js'); }

  var SCHEMA = 1;
  var DRAFT_KEY = 'fhc-draft';
  var TYPES = ['manufacturing', 'non-manufacturing', 'financial'];
  var INDUSTRIES = ['real-estate', 'conglomerate', 'infrastructure'];
  var UNITS = ['dong', 'trieu', 'ty'];
  var OPINIONS = ['unqualified', 'emphasis', 'qualified', 'adverse', 'disclaimer', 'going-concern'];
  var STATEMENTS = ['B01', 'B02', 'B03'];
  var NOT_OURS = 'File này không phải file dữ liệu của Financial Health Check';

  function isNum(x) { return typeof x === 'number' && isFinite(x); }
  function str(x, max) { return typeof x === 'string' ? x.slice(0, max || 200) : ''; }

  function serialize(company) {
    return JSON.stringify({ app: 'fhc', schema: SCHEMA, savedAt: new Date().toISOString(), company: company }, null, 2);
  }

  function deserialize(text) {
    var errors = [];
    var warnings = [];
    var obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, errors: [NOT_OURS + ' (không đọc được).'], warnings: [] }; }
    if (!obj || obj.app !== 'fhc' || !obj.company) return { ok: false, errors: [NOT_OURS + '.'], warnings: [] };
    if (obj.schema > SCHEMA) {
      return { ok: false, errors: ['File được lưu bởi phiên bản mới hơn (cấu trúc ' + obj.schema + '); phiên bản này đọc được đến ' + SCHEMA + '.'], warnings: [] };
    }
    var src = obj.company;
    var c = FHC.entry.newCompany();
    c.name = str(src.name);
    c.ticker = str(src.ticker, 20);
    c.companyType = TYPES.indexOf(src.companyType) >= 0 ? src.companyType : null;
    c.industry = Array.isArray(src.industry) ? src.industry.filter(function (i) { return INDUSTRIES.indexOf(i) >= 0; }) : [];
    c.unit = UNITS.indexOf(src.unit) >= 0 ? src.unit : 'ty';
    var years = src.years && typeof src.years === 'object' ? src.years : {};
    Object.keys(years).forEach(function (y) {
      var sy = years[y] || {};
      if (!/^\d{4}$/.test(y)) { errors.push('Năm không hợp lệ: "' + str(y, 20) + '".'); return; }
      if (sy.template !== 'TT200' && sy.template !== 'TT99') { errors.push('Năm ' + y + ': mẫu báo cáo không hợp lệ.'); return; }
      var ty = { template: sy.template, values: {}, rows: {}, auditOpinion: OPINIONS.indexOf(sy.auditOpinion) >= 0 ? sy.auditOpinion : null };
      var values = sy.values && typeof sy.values === 'object' ? sy.values : {};
      Object.keys(values).forEach(function (k) {
        if (!FHC.lines.get(k)) { warnings.push('Năm ' + y + ': bỏ dòng không biết "' + str(k, 40) + '".'); return; }
        var v = values[k];
        if (v === null || isNum(v)) ty.values[k] = v;
        else errors.push('Năm ' + y + ', dòng "' + k + '": không phải số.');
      });
      var rows = sy.rows && typeof sy.rows === 'object' ? sy.rows : {};
      STATEMENTS.forEach(function (st) {
        if (!rows[st]) return;
        if (!Array.isArray(rows[st])) { errors.push('Năm ' + y + ', ' + st + ': bảng dán vào không hợp lệ.'); return; }
        var ok = rows[st].every(function (r) { return Array.isArray(r) && typeof r[0] === 'string' && (r[1] === null || isNum(r[1])); });
        if (ok) ty.rows[st] = rows[st].map(function (r) { return [str(r[0]), r[1]]; });
        else errors.push('Năm ' + y + ', ' + st + ': bảng dán vào có ô không phải số.');
      });
      c.years[y] = ty;
    });
    if (errors.length) return { ok: false, errors: errors, warnings: warnings };
    return { ok: true, company: c, errors: [], warnings: warnings };
  }

  function fileName(company) {
    var base = company.ticker || company.name || 'cong-ty';
    var s = String(base).replace(/đ/g, 'd').replace(/Đ/g, 'D');
    if (s.normalize) s = s.normalize('NFD');
    s = s.replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (s || 'cong-ty') + '.json';
  }

  function saveDraft(storage, company) {
    if (!storage) return false;
    try { storage.setItem(DRAFT_KEY, serialize(company)); return true; } catch (e) { return false; }
  }
  function loadDraft(storage) {
    if (!storage) return null;
    try {
      var text = storage.getItem(DRAFT_KEY);
      if (!text) return null;
      var r = deserialize(text);
      return r.ok ? r : null;
    } catch (e) { return null; }
  }
  function clearDraft(storage) {
    if (!storage) return;
    try { storage.removeItem(DRAFT_KEY); } catch (e) { /* storage blocked: nothing to clear */ }
  }

  FHC.storage = { serialize: serialize, deserialize: deserialize, fileName: fileName,
    saveDraft: saveDraft, loadDraft: loadDraft, clearDraft: clearDraft, SCHEMA: SCHEMA };

  // Page plugin: "0. File" section, unsaved banner, draft restore.
  if (root.document) {
    FHC.ui = FHC.ui || {};
    FHC.ui.plugins = FHC.ui.plugins || [];
    FHC.ui.plugins.push(function (app, box, opts) {
      var storage = opts.storage || null;
      var doc = root.document;
      app.dirty = false;
      app.fileMessage = null;

      var draft = loadDraft(storage);
      if (draft) {
        app.company = draft.company;
        app.dirty = true;
        app.fileMessage = 'Đã khôi phục bản nháp chưa lưu ra file.';
      }

      function download(name, text) {
        if (opts.download) return opts.download(name, text);
        var blob = new root.Blob([text], { type: 'application/json' });
        var url = root.URL.createObjectURL(blob);
        var a = doc.createElement('a');
        a.href = url;
        a.download = name;
        doc.body.appendChild(a);
        a.click();
        doc.body.removeChild(a);
        root.setTimeout(function () { root.URL.revokeObjectURL(url); }, 1000);
      }

      app.onChange = function () {
        app.dirty = true;
        saveDraft(storage, app.company);
      };
      app.save = function () {
        var name = fileName(app.company);
        download(name, serialize(app.company));
        app.dirty = false;
        clearDraft(storage);
        app.fileMessage = 'Đã lưu "' + name + '" (thường nằm trong thư mục Downloads).';
        app.render();
      };
      app.openText = function (text) {
        var r = deserialize(text);
        if (!r.ok) {
          app.fileMessage = 'Không mở được: ' + r.errors.join(' ');
        } else {
          app.company = r.company;
          app.dirty = false;
          clearDraft(storage);
          app.fileMessage = 'Đã mở dữ liệu ' + (r.company.ticker || r.company.name || '') + '.' +
            (r.warnings.length ? ' Lưu ý: ' + r.warnings.join(' ') : '');
        }
        app.render();
      };
      app.newCompany = function () {
        app.company = FHC.entry.newCompany();
        app.dirty = false;
        clearDraft(storage);
        app.fileMessage = null;
        app.render();
      };

      var previousTop = app.extraTop;
      app.extraTop = function () {
        var el = app.el;
        var input = el('input', { type: 'file', accept: '.json,application/json', test: 'open-file', style: 'display:none',
          onchange: function (e) {
            var f = e.target.files && e.target.files[0];
            if (!f) return;
            var reader = new root.FileReader();
            reader.onload = function () { app.openText(String(reader.result)); };
            reader.readAsText(f);
          } });
        var ask = function (msg) { return !app.dirty || !root.confirm || root.confirm(msg); };
        var section = el('section', { class: 'card file-bar' }, [
          el('button', { type: 'button', test: 'save-file', onclick: app.save }, ['Lưu ra file']),
          ' ',
          el('button', { type: 'button', test: 'open-button', onclick: function () {
            if (ask('Có thay đổi chưa lưu ra file. Vẫn mở file khác?')) input.click();
          } }, ['Mở file']),
          ' ',
          el('button', { type: 'button', test: 'new-company', onclick: function () {
            if (ask('Có thay đổi chưa lưu ra file. Vẫn bắt đầu công ty mới?')) app.newCompany();
          } }, ['Công ty mới']),
          input,
          app.dirty ? el('p', { test: 'unsaved', class: 'warning-banner' }, ['Có thay đổi chưa lưu ra file. Bấm "Lưu ra file" để giữ lại.']) : null,
          el('p', { test: 'file-message', class: 'hint' }, app.fileMessage ? [app.fileMessage] : [])
        ]);
        return (previousTop ? previousTop() : []).concat([section]);
      };
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
