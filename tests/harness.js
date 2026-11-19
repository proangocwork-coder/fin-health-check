// Minimal test harness that runs the same test files in two places:
// - Node.js: delegates to the built-in runner (`node --test`).
// - Browser (tests.html): runs tests in order and writes a summary line.
(function (root) {
  'use strict';
  var isNode = typeof module !== 'undefined' && module.exports && typeof require === 'function';

  function fail(message) {
    throw new Error(message);
  }

  var assert = {
    ok: function (value, message) {
      if (!value) fail(message || 'expected a true value');
    },
    equal: function (actual, expected, message) {
      if (actual !== expected) {
        fail((message ? message + ': ' : '') + 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
      }
    },
    near: function (actual, expected, tolerance, message) {
      var tol = typeof tolerance === 'number' ? tolerance : 0.005;
      if (typeof actual !== 'number' || Math.abs(actual - expected) > tol) {
        fail((message ? message + ': ' : '') + 'expected ' + expected + ' ± ' + tol + ', got ' + actual);
      }
    }
  };

  var harness;
  if (isNode) {
    var nodeTest = require('node:test');
    harness = {
      isNode: true,
      assert: assert,
      test: function (name, fn) { nodeTest.test(name, fn); },
      load: function (path) { return require(path); }
    };
    module.exports = harness;
  } else {
    var results = [];
    harness = {
      isNode: false,
      assert: assert,
      test: function (name, fn) {
        try {
          fn();
          results.push({ name: name, ok: true });
        } catch (err) {
          results.push({ name: name, ok: false, error: String(err && err.message ? err.message : err) });
        }
      },
      load: function () { return root.FHC; },
      report: function () {
        var passed = results.filter(function (r) { return r.ok; }).length;
        var total = results.length;
        var status = total > 0 && passed === total ? 'PASS' : 'FAIL';
        var summary = 'RESULT: ' + status + ' ' + passed + '/' + total;
        var out = root.document.getElementById('results');
        var lines = [summary];
        results.forEach(function (r) {
          lines.push((r.ok ? 'ok   ' : 'FAIL ') + r.name + (r.ok ? '' : ' -- ' + r.error));
        });
        out.textContent = lines.join('\n');
        root.document.title = summary;
        return summary;
      }
    };
    root.TestHarness = harness;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
