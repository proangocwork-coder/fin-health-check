// T-011: results section of the page (ratios, Z/M/F, flags with reasons, counts, notes, disclaimer).
// Plain DOM, text only (no HTML from data).
(function (root) {
  'use strict';
  var FHC = root.FHC;
  if (!root.document) return;

  var PERCENT = ['liabilitiesToAssets', 'roa', 'roe', 'grossMargin', 'ebitdaMargin', 'netMargin', 'revenueGrowth', 'profitGrowth'];
  var DAYS = ['dso', 'dio', 'dpo', 'cashConversionCycle'];
  var LEVELS = { red: 'Đỏ', yellow: 'Vàng', missing: 'Không tính được', none: 'Không bật', 'not-applicable': 'Không áp dụng' };
  var ORDER = { red: 0, yellow: 1, missing: 2, 'not-applicable': 3, none: 4 };

  function n(x, d) { return FHC.format.number(x, d === undefined ? 2 : d); }
  function showRatio(r) {
    if (r.status !== 'ok') return '—';
    if (PERCENT.indexOf(r.key) >= 0) return n(r.value * 100, 1) + '%';
    if (DAYS.indexOf(r.key) >= 0) return n(r.value, 0) + ' ngày';
    return n(r.value);
  }

  FHC.ui = FHC.ui || {};
  FHC.ui.plugins = FHC.ui.plugins || [];
  FHC.ui.plugins.push(function (app) {
    app.ui.ratioDetail = null;
    var previousBottom = app.extraBottom;

    app.extraBottom = function () {
      var el = app.el;
      var before = previousBottom ? previousBottom() : [];
      var company = FHC.entry.toCompany(app.company);
      var years = company.years.map(function (y) { return y.year; });
      if (!years.length) return before;

      var ratios = FHC.ratios.compute(company.years);
      var altman = FHC.scores.altman(company.years, company.companyType);
      var beneish = FHC.scores.beneish(company.years);
      var piotroski = FHC.scores.piotroski(company.years);
      var flags = FHC.flags.evaluate(company);
      var unbalanced = {};
      company.years.forEach(function (y) { unbalanced[y.year] = FHC.checks.runYear({ values: y.values, rows: y.rows }).unbalanced; });

      // Header and counts
      var c = app.company;
      var title = (c.ticker ? c.ticker + ' — ' : '') + (c.name || 'Công ty chưa đặt tên');
      var meta = years.map(function (y) { return y + ' (' + app.company.years[String(y)].template + ')'; }).join(', ') +
        ' · Đơn vị: ' + FHC.entry.UNITS[c.unit];
      var counts = years.map(function (y) {
        var k = flags[y].counts;
        return el('li', { test: 'counts-' + y, class: k.red ? 'red' : k.yellow ? 'yellow' : '' },
          [y + ': ' + k.red + ' cờ Đỏ, ' + k.yellow + ' cờ Vàng' + (unbalanced[y] ? ' (số chưa cân)' : '')]);
      });

      // Ratio table
      var head = el('tr', {}, [el('th', {}, ['Chỉ số']), el('th', {}, ['Công thức'])].concat(years.map(function (y) {
        return el('th', { class: 'num' }, [String(y) + (unbalanced[y] ? ' (số chưa cân)' : '')]);
      })));
      var rows = [];
      var lastGroup = null;
      FHC.ratios.definitions.forEach(function (d) {
        if (d.group !== lastGroup) {
          rows.push(el('tr', { class: 'group' }, [el('td', { colSpan: 2 + years.length }, [d.group])]));
          lastGroup = d.group;
        }
        rows.push(el('tr', {}, [el('td', {}, [d.name]), el('td', { class: 'code' }, [d.formula])].concat(years.map(function (y) {
          var r = ratios[y].filter(function (x) { return x.key === d.key; })[0];
          return el('td', { class: 'num' }, [el('button', { type: 'button', class: 'cell' + (r.note ? ' noted' : ''),
            test: 'ratio-' + d.key + '-' + y, title: r.reason || r.note || 'Bấm để xem số đã dùng',
            onclick: function () { app.ui.ratioDetail = { key: d.key, year: y }; app.render(); } }, [showRatio(r)])]);
        }))));
      });
      var detail = null;
      if (app.ui.ratioDetail && ratios[app.ui.ratioDetail.year]) {
        var rd = ratios[app.ui.ratioDetail.year].filter(function (x) { return x.key === app.ui.ratioDetail.key; })[0];
        if (rd) {
          var inputs = Object.keys(rd.inputs).map(function (k) {
            var base = k.replace(/ \((đầu năm|năm trước)\)$/, '');
            var suffix = k.slice(base.length);
            return FHC.lines.label(base) + suffix + ' = ' + n(rd.inputs[k]);
          });
          detail = el('p', { test: 'ratio-detail', class: 'detail' }, [rd.name + ' ' + app.ui.ratioDetail.year + ': ' + rd.formula +
            ' = ' + showRatio(rd) + (rd.reason ? ' (' + rd.reason + ')' : '') + (rd.note ? ' (' + rd.note + ')' : '') +
            (inputs.length ? ' · Số đã dùng: ' + inputs.join('; ') : '')]);
        }
      }

      // Scores
      var scoreRows = years.map(function (y) {
        var z = altman[y], m = beneish[y], f = piotroski[y];
        var zText = z.status === 'ok' ? z.variant + ' ' + n(z.value) + ' (vùng ' + z.zone + ')' : z.reason;
        var mText = m.status === 'ok' ? 'M ' + n(m.value) + ' · ' + Object.keys(m.components).map(function (k) {
          return k + ' ' + n(m.components[k]);
        }).join(', ') : m.reason;
        var fText = f.status === 'ok' ? 'F ' + f.display + ' · ' + f.criteria.map(function (cr) {
          return cr.n + '. ' + cr.name + ': ' + (cr.status === 'pass' ? 'đạt' : cr.status === 'fail' ? 'không đạt' : 'không tính được');
        }).join('; ') : 'Không tính được';
        return el('tr', {}, [el('td', {}, [String(y)]), el('td', { test: 'score-altman-' + y }, [zText]),
          el('td', { test: 'score-beneish-' + y }, [mText]), el('td', { test: 'score-piotroski-' + y }, [fText])]);
      });

      // Flags
      var flagBlocks = years.map(function (y) {
        var list = flags[y].flags.slice().sort(function (a, b) { return ORDER[a.level] - ORDER[b.level]; });
        return el('div', { class: 'flag-year' }, [el('h3', {}, ['Cờ năm ' + y + (unbalanced[y] ? ' (số chưa cân)' : '')]),
          el('ul', {}, list.map(function (f) {
            return el('li', { test: 'flag-' + y + '-' + f.code, class: 'flag ' + f.level },
              [LEVELS[f.level] + ' · ' + f.name + ' — ' + f.reason + (f.note ? ' · Lưu ý ngành: ' + f.note : '')]);
          }))]);
      });

      var section = el('section', { class: 'card results', test: 'results' }, [
        el('h2', {}, ['6. Kết quả']),
        el('p', { class: 'result-title' }, [title]),
        el('p', { class: 'hint' }, [meta]),
        el('p', { test: 'disclaimer', class: 'disclaimer' }, [FHC.flags.DISCLAIMER]),
        el('ul', { class: 'counts' }, counts),
        el('h3', {}, ['Bảng chỉ số']),
        el('p', { class: 'hint no-print' }, ['Bấm vào một con số để xem công thức và các số đã dùng. "—" = không tính được (rê chuột để xem lý do).']),
        el('div', { class: 'scroll' }, [el('table', { class: 'grid ratios' }, [head].concat(rows))]),
        detail,
        el('h3', {}, ['Điểm Altman Z, Beneish M, Piotroski F']),
        el('div', { class: 'scroll' }, [el('table', { class: 'grid scores' }, [el('tr', {}, [el('th', {}, ['Năm']),
          el('th', {}, ['Altman Z']), el('th', {}, ['Beneish M']), el('th', {}, ['Piotroski F'])])].concat(scoreRows))]),
        el('h3', {}, ['Cờ cảnh báo']),
        el('div', {}, flagBlocks),
        el('p', { class: 'hint' }, ['Z, M, F xây trên dữ liệu doanh nghiệp Mỹ; với doanh nghiệp Việt Nam chỉ dùng làm tín hiệu cảnh báo.'])
      ]);
      return before.concat([section]);
    };
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
