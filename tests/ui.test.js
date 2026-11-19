// T-009 (page): entry page behaviour. Browser only (needs a page); skipped under Node.
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  if (T.isNode) return;
  var FHC = T.load();
  var A = T.assert;
  var doc = root.document;

  function mount() {
    A.ok(FHC.ui, 'FHC.ui should exist');
    var box = doc.createElement('div');
    box.style.display = 'none';
    doc.body.appendChild(box);
    var app = FHC.ui.mount(box, { storage: null });
    return { box: box, app: app, q: function (sel) { return box.querySelector(sel); } };
  }
  function set(el, value, event) {
    el.value = value;
    el.dispatchEvent(new root.Event(event || 'change', { bubbles: true }));
  }
  function addYear(m, year) {
    set(m.q('[data-test="new-year"]'), String(year), 'input');
    m.q('[data-test="add-year"]').click();
  }

  T.test('page: company form, year form and paste box are shown', function () {
    var m = mount();
    A.ok(m.q('[data-test="company-name"]'), 'company name');
    A.equal(m.q('[data-test="company-type"]').options.length, 4, 'blank + 3 types');
    A.ok(m.q('[data-test="unit"]'), 'unit');
    A.ok(m.q('[data-test="paste-text"]'), 'paste box');
  });

  T.test('AC-002.1 page: adding 2025 shows TT200, 2026 shows TT99', function () {
    var m = mount();
    addYear(m, 2025);
    addYear(m, 2026);
    A.equal(m.q('[data-test="template-2025"]').value, 'TT200');
    A.equal(m.q('[data-test="template-2026"]').value, 'TT99');
  });

  T.test('AC-001.3 page: paste fills the table and lists unknown lines', function () {
    var m = mount();
    addYear(m, 2025);
    set(m.q('[data-test="paste-statement"]'), 'B01');
    set(m.q('[data-test="paste-year"]'), '2025');
    set(m.q('[data-test="paste-text"]'), 'A. TÀI SẢN NGẮN HẠN\t103,682.04\n8. Quỹ đầu tư phát triển\t1,388.44', 'input');
    m.q('[data-test="paste-apply"]').click();
    A.ok(m.q('[data-test="paste-result"]').textContent.indexOf('Đã nhận 1 dòng') >= 0, 'matched count shown');
    A.ok(m.q('[data-test="paste-result"]').textContent.indexOf('8. Quỹ đầu tư phát triển') >= 0, 'unknown line listed');
    A.equal(m.q('[data-test="cell-currentAssets-2025"]').value, '103.682,04');
  });

  T.test('AC-001.5 page: invalid cell is rejected with a message; "-" stores zero', function () {
    var m = mount();
    addYear(m, 2025);
    set(m.q('[data-test="cell-cash-2025"]'), 'abc');
    A.ok(m.q('[data-test="cell-error"]').textContent.indexOf('abc') >= 0, 'error shown');
    A.equal(m.app.company.years['2025'].values.cash, undefined, 'nothing stored');
    set(m.q('[data-test="cell-cash-2025"]'), '-');
    A.equal(m.app.company.years['2025'].values.cash, 0);
  });

  T.test('AC-003.1 page: input checks are shown', function () {
    var m = mount();
    addYear(m, 2025);
    set(m.q('[data-test="cell-totalAssets-2025"]'), '257.921,58');
    set(m.q('[data-test="cell-totalResources-2025"]'), '257.899,20');
    A.ok(m.q('[data-test="checks"]').textContent.indexOf('Lệch 22,38: tài sản ≠ nguồn vốn') >= 0);
  });

  T.test('security: pasted text is shown as text, never run as page code', function () {
    var m = mount();
    addYear(m, 2025);
    set(m.q('[data-test="paste-text"]'), '<img src=x onerror="window.__fhcInjected=1">\t5', 'input');
    m.q('[data-test="paste-apply"]').click();
    A.equal(m.box.querySelectorAll('img').length, 0, 'no element created from pasted text');
    A.equal(root.__fhcInjected, undefined);
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
