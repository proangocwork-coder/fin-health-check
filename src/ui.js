// The page (T-009 entry; T-010 save/open; T-011 results). Plain DOM, text only:
// user data is always set with textContent / value, never as HTML (ARCHITECTURE "Security risks").
(function (root) {
  'use strict';
  var FHC = root.FHC;
  var doc = root.document;

  var TYPES = [['', '— chọn —'], ['manufacturing', 'Sản xuất (Altman Z\')'],
    ['non-manufacturing', 'Phi sản xuất, dịch vụ, đa ngành (Altman Z\'\')'], ['financial', 'Ngân hàng, bảo hiểm, chứng khoán']];
  var INDUSTRIES = [['real-estate', 'Bất động sản'], ['conglomerate', 'Tập đoàn đa ngành'], ['infrastructure', 'Dịch vụ hạ tầng']];
  var OPINIONS = [['', '— chưa chọn —'], ['unqualified', 'Chấp nhận toàn phần'], ['emphasis', 'Có đoạn vấn đề cần nhấn mạnh'],
    ['qualified', 'Ngoại trừ'], ['adverse', 'Trái ngược'], ['disclaimer', 'Từ chối đưa ra ý kiến'],
    ['going-concern', 'Nghi ngờ hoạt động liên tục']];
  var STATEMENTS = [['B01', 'B01 Tình hình tài chính (cân đối kế toán)'], ['B02', 'B02 Kết quả kinh doanh'], ['B03', 'B03 Lưu chuyển tiền tệ']];

  // Element helper: attrs set as properties/attributes; children are nodes or strings (as text).
  function el(tag, attrs, children) {
    var e = doc.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'test') e.setAttribute('data-test', attrs[k]);
      else if (k === 'class') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (k in e) e[k] = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' ? doc.createTextNode(c) : c);
    });
    return e;
  }
  function select(test, options, value, onchange) {
    var s = el('select', { test: test, onchange: onchange },
      options.map(function (o) { return el('option', { value: o[0] }, [o[1]]); }));
    s.value = value == null ? '' : value;
    return s;
  }
  function fmt(v) { return v === null || v === undefined ? '' : FHC.format.number(v, 2); }

  function mount(box, opts) {
    var app = { company: FHC.entry.newCompany(), ui: { pasteText: '', pasteStatement: 'B01', pasteYear: null, pasteColumn: 0,
      pasteResult: null, cellError: null, newYear: '' }, storage: opts && opts.storage, render: null };

    function years() { return Object.keys(app.company.years).sort(); }
    function changed() { if (app.onChange) app.onChange(); render(); }

    function companySection() {
      var c = app.company;
      return el('section', { class: 'card' }, [
        el('h2', {}, ['1. Công ty']),
        el('label', {}, ['Tên công ty ', el('input', { test: 'company-name', value: c.name,
          onchange: function (e) { c.name = e.target.value; changed(); } })]),
        el('label', {}, ['Mã chứng khoán ', el('input', { test: 'company-ticker', value: c.ticker, size: 6,
          onchange: function (e) { c.ticker = e.target.value; changed(); } })]),
        el('label', {}, ['Loại doanh nghiệp ', select('company-type', TYPES, c.companyType,
          function (e) { c.companyType = e.target.value || null; changed(); })]),
        el('div', {}, ['Ngành đặc thù (để hiện lưu ý cạnh cờ): '].concat(INDUSTRIES.map(function (i) {
          return el('label', { class: 'inline' }, [el('input', { type: 'checkbox', test: 'industry-' + i[0],
            checked: c.industry.indexOf(i[0]) >= 0,
            onchange: function (e) {
              c.industry = c.industry.filter(function (x) { return x !== i[0]; });
              if (e.target.checked) c.industry.push(i[0]);
              changed();
            } }), ' ' + i[1]]);
        }))),
        el('label', {}, ['Đơn vị số liệu ', select('unit', [['ty', 'tỷ đồng'], ['trieu', 'triệu đồng'], ['dong', 'đồng']], c.unit,
          function (e) { c.unit = e.target.value; changed(); })])
      ]);
    }

    function yearSection() {
      var rows = years().map(function (y) {
        var data = app.company.years[y];
        return el('tr', {}, [
          el('td', {}, [y]),
          el('td', {}, [select('template-' + y, [['TT200', 'TT200 (năm tài chính trước 2026)'], ['TT99', 'TT99/2025 (từ 2026)']],
            data.template, function (e) { FHC.entry.setTemplate(app.company, y, e.target.value); changed(); })]),
          el('td', {}, [select('audit-' + y, OPINIONS, data.auditOpinion,
            function (e) { FHC.entry.setAuditOpinion(app.company, y, e.target.value); changed(); })]),
          el('td', {}, [el('button', { type: 'button', test: 'remove-' + y, onclick: function () {
            if (root.confirm && !root.confirm('Xoá năm ' + y + ' và toàn bộ số của năm này?')) return;
            FHC.entry.removeYear(app.company, y); changed();
          } }, ['Xoá năm'])])
        ]);
      });
      return el('section', { class: 'card' }, [
        el('h2', {}, ['2. Các năm']),
        el('p', { class: 'hint' }, ['Thêm cả năm chỉ có số đầu kỳ (cột "số đầu năm" của báo cáo năm sau) để tính số bình quân.']),
        el('label', {}, ['Năm tài chính ', el('input', { test: 'new-year', size: 6, value: app.ui.newYear,
          oninput: function (e) { app.ui.newYear = e.target.value; } })]),
        el('button', { type: 'button', test: 'add-year', onclick: function () {
          var input = box.querySelector('[data-test="new-year"]');
          var y = parseInt(input ? input.value : app.ui.newYear, 10);
          if (!(y >= 1990 && y <= 2100)) { app.ui.cellError = 'Năm không hợp lệ: "' + (input ? input.value : '') + '"'; render(); return; }
          FHC.entry.ensureYear(app.company, y);
          app.ui.newYear = '';
          app.ui.pasteYear = String(y);
          changed();
        } }, ['Thêm năm']),
        rows.length ? el('table', {}, [el('tr', {}, [el('th', {}, ['Năm']), el('th', {}, ['Mẫu báo cáo']),
          el('th', {}, ['Ý kiến kiểm toán']), el('th', {}, [''])])].concat(rows)) : el('p', {}, ['Chưa có năm nào.'])
      ]);
    }

    function pasteSection() {
      var ys = years();
      if (!app.ui.pasteYear && ys.length) app.ui.pasteYear = ys[ys.length - 1];
      var parsed = FHC.entry.parsePaste(app.ui.pasteText);
      var colOptions = [];
      for (var i = 0; i < Math.max(parsed.columns, 1); i++) {
        var head = parsed.header && parsed.header[i + 1] ? ' (' + parsed.header[i + 1] + ')' : '';
        colOptions.push([String(i), 'Cột số ' + (i + 1) + head]);
      }
      var result = app.ui.pasteResult;
      return el('section', { class: 'card' }, [
        el('h2', {}, ['3. Dán số từ bảng tính hoặc trang web']),
        el('p', { class: 'hint' }, ['Chép cả bảng (cột tên dòng và cột số) rồi dán vào ô dưới. Phần mềm nhận dòng theo tên; dòng không nhận ra sẽ được liệt kê.']),
        el('label', {}, ['Báo cáo ', select('paste-statement', STATEMENTS, app.ui.pasteStatement,
          function (e) { app.ui.pasteStatement = e.target.value; render(); })]),
        el('label', {}, ['Năm ', select('paste-year', ys.map(function (y) { return [y, y]; }), app.ui.pasteYear,
          function (e) { app.ui.pasteYear = e.target.value; render(); })]),
        el('label', {}, ['Lấy cột ', select('paste-column', colOptions, String(app.ui.pasteColumn),
          function (e) { app.ui.pasteColumn = parseInt(e.target.value, 10) || 0; })]),
        el('textarea', { test: 'paste-text', rows: 6, value: app.ui.pasteText,
          oninput: function (e) { app.ui.pasteText = e.target.value; },
          onchange: function (e) { app.ui.pasteText = e.target.value; render(); } }),
        el('button', { type: 'button', test: 'paste-apply', onclick: function () {
          var area = box.querySelector('[data-test="paste-text"]');
          app.ui.pasteText = area ? area.value : app.ui.pasteText;
          var yearSel = box.querySelector('[data-test="paste-year"]');
          var year = yearSel && yearSel.value ? yearSel.value : app.ui.pasteYear;
          if (!year) { app.ui.pasteResult = { error: 'Hãy thêm năm trước khi dán số.' }; render(); return; }
          var p = FHC.entry.parsePaste(app.ui.pasteText);
          var r = FHC.entry.applyPaste(app.company, year, app.ui.pasteStatement, p, app.ui.pasteColumn);
          app.ui.pasteResult = { matched: r.matched, unknown: r.unknown, problems: p.problems, year: year };
          changed();
        } }, ['Nhận số']),
        el('div', { test: 'paste-result', class: 'hint' }, result ? (result.error ? [result.error] : [
          'Đã nhận ' + result.matched + ' dòng vào năm ' + result.year + '. ',
          result.unknown.length ? 'Không nhận ra (gõ tay ở bảng dưới nếu cần): ' + result.unknown.join('; ') + '. ' : '',
          result.problems.length ? 'Ô không đọc được: ' + result.problems.join('; ') : ''
        ]) : [])
      ]);
    }

    function tableSection() {
      var ys = years();
      var head = el('tr', {}, [el('th', {}, ['Dòng']), el('th', {}, ['Mã TT200 / TT99'])]
        .concat(ys.map(function (y) { return el('th', {}, [y]); })));
      var body = [];
      STATEMENTS.forEach(function (st) {
        body.push(el('tr', { class: 'group' }, [el('td', { colSpan: 2 + ys.length }, [st[1]])]));
        FHC.lines.all.filter(function (l) { return l.statement === st[0]; }).forEach(function (line) {
          var codes = (line.codes.TT200 || '—') + ' / ' + (line.codes.TT99 || '—');
          body.push(el('tr', {}, [el('td', {}, [line.names[0]]), el('td', { class: 'code' }, [codes])]
            .concat(ys.map(function (y) {
              var v = app.company.years[y].values[line.key];
              return el('td', {}, [el('input', { test: 'cell-' + line.key + '-' + y, class: 'num', value: fmt(v),
                onchange: function (e) {
                  if (FHC.entry.setValue(app.company, y, line.key, e.target.value)) app.ui.cellError = null;
                  else app.ui.cellError = 'Không đọc được "' + e.target.value + '" (' + line.names[0] + ', ' + y + '). Gõ số dạng 1.234,56; để trống nếu không có; gõ "-" nếu bằng 0.';
                  changed();
                } })]);
            }))));
        });
      });
      return el('section', { class: 'card' }, [
        el('h2', {}, ['4. Bảng số (' + FHC.entry.UNITS[app.company.unit] + ')']),
        el('p', { class: 'hint' }, ['Ô trống = không có số (không tính là 0). Gõ "-" nếu bằng 0.']),
        el('div', { test: 'cell-error', class: 'error' }, app.ui.cellError ? [app.ui.cellError] : []),
        el('div', { class: 'scroll' }, [el('table', { class: 'grid' }, [head].concat(body))])
      ]);
    }

    function checksSection() {
      var items = [];
      years().forEach(function (y) {
        var data = app.company.years[y];
        var r = FHC.checks.runYear({ values: data.values, rows: data.rows });
        r.issues.forEach(function (i) {
          items.push(el('li', { class: i.level }, [y + ': ' + i.message]));
        });
      });
      return el('section', { class: 'card', test: 'checks' }, [
        el('h2', {}, ['5. Kiểm tra số đã nhập']),
        items.length ? el('ul', {}, items) : el('p', {}, ['Chưa thấy chỗ lệch.'])
      ]);
    }

    function render() {
      while (box.firstChild) box.removeChild(box.firstChild);
      var parts = [];
      if (app.extraTop) parts = parts.concat(app.extraTop());
      parts.push(companySection(), yearSection(), pasteSection(), tableSection(), checksSection());
      if (app.extraBottom) parts = parts.concat(app.extraBottom());
      parts.forEach(function (p) { box.appendChild(p); });
    }

    app.render = render;
    app.el = el;
    app.select = select;
    (FHC.ui.plugins || []).forEach(function (plugin) { plugin(app, box, opts || {}); });
    render();
    return app;
  }

  FHC.ui = FHC.ui || {};
  FHC.ui.mount = mount;
  FHC.ui.plugins = FHC.ui.plugins || [];
})(typeof globalThis !== 'undefined' ? globalThis : this);
