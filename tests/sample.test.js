// T-012: example company used for the demo page and the print check.
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/sample.js') : T.load();
  var A = T.assert;

  T.test('sample: HPG example is a valid company file and gives the G1 hand-test results', function () {
    A.ok(FHC.sample && FHC.sample.hpg, 'FHC.sample.hpg should exist');
    var c = FHC.sample.hpg();
    var r = FHC.storage.deserialize(FHC.storage.serialize(c));
    A.equal(r.ok, true, (r.errors || []).join('; '));
    var y = FHC.flags.evaluate(FHC.entry.toCompany(c))[2025];
    var f01 = y.flags.filter(function (f) { return f.code === 'F01'; })[0];
    A.equal(f01.level, 'yellow');
    A.equal(c.years['2025'].template, 'TT200');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
