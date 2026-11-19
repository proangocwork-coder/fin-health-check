// Number formatting in Vietnamese style: thousands ".", decimals ",".
(function (root) {
  'use strict';
  var FHC = typeof require === 'function' && typeof module !== 'undefined' ? require('./fhc.js') : root.FHC;

  function number(value, decimals) {
    var d = typeof decimals === 'number' ? decimals : 2;
    if (value === null || value === undefined || isNaN(value)) return '';
    var negative = value < 0;
    var fixed = Math.abs(value).toFixed(d);
    var parts = fixed.split('.');
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (negative ? '-' : '') + whole + (parts[1] ? ',' + parts[1] : '');
  }

  FHC.format = { number: number };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
