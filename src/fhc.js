// Financial Health Check: shared namespace.
// Plain script (no modules) so it loads in a page opened from a file (D-003)
// and can also be required by Node for tests.
(function (root) {
  'use strict';
  var FHC = root.FHC || {};
  FHC.version = '0.0.1';
  root.FHC = FHC;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FHC;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
