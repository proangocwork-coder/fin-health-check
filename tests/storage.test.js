// T-010: save / open company files, browser draft (REQ-001 AC-001.1–2, NFR-003, D-004).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/storage.js') : T.load();
  var A = T.assert;
  var S = function () {
    A.ok(FHC && FHC.storage, 'FHC.storage should exist');
    return FHC.storage;
  };
  function sample() {
    var c = FHC.entry.newCompany();
    c.name = 'Công ty Thử A';
    c.ticker = 'THU';
    c.companyType = 'manufacturing';
    FHC.entry.setValue(c, 2025, 'totalAssets', '1.000');
    FHC.entry.setValue(c, 2025, 'totalResources', '1.000');
    FHC.entry.setValue(c, 2025, 'cash', '-');
    FHC.entry.setAuditOpinion(c, 2025, 'emphasis');
    c.years['2025'].rows.B01 = [['TỔNG CỘNG TÀI SẢN', 1000]];
    return c;
  }
  function fakeStorage() {
    var data = {};
    return { getItem: function (k) { return k in data ? data[k] : null; }, setItem: function (k, v) { data[k] = String(v); },
      removeItem: function (k) { delete data[k]; } };
  }

  T.test('AC-001.1 saved company reopens with the same numbers', function () {
    var text = S().serialize(sample());
    var r = S().deserialize(text);
    A.equal(r.ok, true, (r.errors || []).join('; '));
    var y = r.company.years['2025'];
    A.equal(r.company.name, 'Công ty Thử A');
    A.equal(y.values.totalAssets, 1000);
    A.equal(y.values.cash, 0, '"-" stays 0');
    A.equal(y.values.totalResources, 1000);
    A.equal(y.auditOpinion, 'emphasis');
    A.equal(y.template, 'TT200');
    A.equal(y.rows.B01[0][0], 'TỔNG CỘNG TÀI SẢN');
  });

  T.test('open: broken or foreign files are refused with a reason', function () {
    A.equal(S().deserialize('{not json').ok, false);
    A.ok(S().deserialize('{not json').errors[0].indexOf('không phải file dữ liệu') >= 0);
    A.equal(S().deserialize(JSON.stringify({ app: 'other' })).ok, false);
    var newer = JSON.parse(S().serialize(sample()));
    newer.schema = 99;
    A.ok(S().deserialize(JSON.stringify(newer)).errors[0].indexOf('phiên bản') >= 0);
  });

  T.test('open: a text where a number should be is refused (A08 data integrity)', function () {
    var f = JSON.parse(S().serialize(sample()));
    f.company.years['2025'].values.cash = '<script>';
    var r = S().deserialize(JSON.stringify(f));
    A.equal(r.ok, false);
    A.ok(r.errors.join(' ').indexOf('cash') >= 0);
  });

  T.test('open: unknown line keys are dropped with a warning; bad template refused', function () {
    var f = JSON.parse(S().serialize(sample()));
    f.company.years['2025'].values.somethingElse = 5;
    var r = S().deserialize(JSON.stringify(f));
    A.equal(r.ok, true);
    A.equal(r.company.years['2025'].values.somethingElse, undefined);
    A.ok(r.warnings.length === 1);
    f.company.years['2025'].template = 'TT1';
    A.equal(S().deserialize(JSON.stringify(f)).ok, false);
  });

  T.test('file name from ticker or name, safe characters only', function () {
    A.equal(S().fileName(sample()), 'THU.json');
    var c = FHC.entry.newCompany();
    c.name = 'Công ty A/B: thử';
    A.equal(S().fileName(c), 'Cong-ty-A-B-thu.json');
    A.equal(S().fileName(FHC.entry.newCompany()), 'cong-ty.json');
  });

  T.test('NFR-003 draft: saved and restored; broken storage does not crash', function () {
    var st = fakeStorage();
    S().saveDraft(st, sample());
    var d = S().loadDraft(st);
    A.equal(d.company.years['2025'].values.totalAssets, 1000);
    S().clearDraft(st);
    A.equal(S().loadDraft(st), null);
    var broken = { getItem: function () { throw new Error('blocked'); }, setItem: function () { throw new Error('blocked'); } };
    A.equal(S().saveDraft(broken, sample()), false);
    A.equal(S().loadDraft(broken), null);
    A.equal(S().loadDraft(null), null);
  });

  // Page behaviour (browser only)
  if (!T.isNode) {
    var doc = root.document;
    var mountWith = function (storage) {
      var box = doc.createElement('div');
      box.style.display = 'none';
      doc.body.appendChild(box);
      var saved = [];
      var app = FHC.ui.mount(box, { storage: storage, download: function (name, text) { saved.push([name, text]); } });
      return { box: box, app: app, saved: saved, q: function (s) { return box.querySelector(s); } };
    };

    T.test('page: unsaved banner appears after a change and disappears after "Lưu ra file"', function () {
      var m = mountWith(fakeStorage());
      A.equal(m.q('[data-test="unsaved"]'), null, 'no banner at start');
      var name = m.q('[data-test="company-name"]');
      name.value = 'Thử';
      name.dispatchEvent(new root.Event('change', { bubbles: true }));
      A.ok(m.q('[data-test="unsaved"]'), 'banner after change');
      m.q('[data-test="save-file"]').click();
      A.equal(m.saved.length, 1);
      A.equal(m.saved[0][0], 'Thu.json');
      A.equal(m.q('[data-test="unsaved"]'), null, 'banner gone after save');
    });

    T.test('page: opening a file shows its numbers; a draft is restored on the next start', function () {
      var st = fakeStorage();
      var m = mountWith(st);
      m.app.openText(S().serialize(sample()));
      A.equal(m.q('[data-test="cell-totalAssets-2025"]').value, '1.000,00');
      var name = m.q('[data-test="company-name"]');
      name.value = 'Đổi tên';
      name.dispatchEvent(new root.Event('change', { bubbles: true }));
      var again = mountWith(st);
      A.equal(again.q('[data-test="company-name"]').value, 'Đổi tên', 'draft restored');
      A.ok(again.q('[data-test="unsaved"]'), 'restored draft is marked unsaved');
    });

    T.test('page: opening a broken file shows the reason and keeps the current data', function () {
      var m = mountWith(fakeStorage());
      m.app.openText(S().serialize(sample()));
      m.app.openText('{not json');
      A.ok(m.q('[data-test="file-message"]').textContent.indexOf('không phải file dữ liệu') >= 0);
      A.equal(m.q('[data-test="cell-totalAssets-2025"]').value, '1.000,00');
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
