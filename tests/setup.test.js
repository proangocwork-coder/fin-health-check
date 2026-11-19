// T-001 setup check: the test harness and the shared namespace load.
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/fhc.js') : T.load();

  T.test('setup: harness runs a test', function () {
    T.assert.equal(1 + 1, 2);
  });

  T.test('setup: FHC namespace has a version', function () {
    T.assert.ok(FHC && typeof FHC.version === 'string', 'FHC.version should be a string');
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
