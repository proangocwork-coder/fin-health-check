// T-004: ratio table (REQ-004, spec 001 §2). HPG numbers in tỷ đồng from CafeF (spec §6).
(function (root) {
  'use strict';
  var T = typeof require === 'function' ? require('./harness.js') : root.TestHarness;
  var FHC = T.isNode ? T.load('../src/ratios.js') : T.load();
  var A = T.assert;
  var R = function () {
    A.ok(FHC && FHC.ratios, 'FHC.ratios should exist');
    return FHC.ratios;
  };

  function hpg() {
    return [
      { year: 2024, values: {
        currentAssets: 86674.28, cash: 6887.65, inventories: 46091.22, totalAssets: 224489.71,
        currentLiabilities: 75225.24, equity: 114647.46, revenue: 138855.11, cogs: 120357.56,
        grossProfit: 18497.55, profitAfterTax: 12020.02 } },
      { year: 2025, values: {
        currentAssets: 103682.04, cash: 8300.89, inventories: 52828.23, totalAssets: 257899.20,
        liabilities: 126679.19, currentLiabilities: 94208.65, shortBorrowings: 64694.96, longBorrowings: 27479.19,
        equity: 131220.01, revenue: 156116.09, cogs: 131618.31, grossProfit: 24497.79,
        interest: 3114.86, profitBeforeTax: 18040.59, profitAfterTax: 15514.93,
        depreciation: 8468.26, cfo: 15693.90 } }
    ];
  }
  function find(list, key) {
    var r = list.filter(function (x) { return x.key === key; })[0];
    A.ok(r, 'ratio ' + key + ' present');
    return r;
  }

  T.test('AC-004.1 HPG 2025 current ratio 1.10', function () {
    var r = find(R().compute(hpg())[2025], 'currentRatio');
    A.equal(r.status, 'ok');
    A.near(r.value, 1.10, 0.005);
    A.equal(r.inputs.currentAssets, 103682.04, 'inputs recorded for AC-004.3');
    A.equal(r.inputs.currentLiabilities, 94208.65);
    A.ok(r.formula.length > 0, 'formula text present');
  });

  T.test('AC-004.1 HPG 2025 leverage, margins, cash flow match the G1 hand test', function () {
    var y = R().compute(hpg())[2025];
    A.near(find(y, 'interestCoverage').value, 6.79, 0.005);
    A.near(find(y, 'debtToEbitda').value, 3.11, 0.005);
    A.near(find(y, 'grossMargin').value, 0.1569, 0.00005);
    A.near(find(y, 'cfoToProfit').value, 1.01, 0.005);
    A.near(find(y, 'revenueGrowth').value, 0.1243, 0.00005);
  });

  T.test('averages use opening and closing balances when the prior year exists', function () {
    var roa = find(R().compute(hpg())[2025], 'roa');
    A.near(roa.value, 15514.93 / ((224489.71 + 257899.20) / 2), 1e-9);
    A.equal(roa.note, undefined, 'no note when the average is real');
  });

  T.test('first year: averages fall back to year-end with a note', function () {
    var roa = find(R().compute(hpg())[2024], 'roa');
    A.near(roa.value, 12020.02 / 224489.71, 1e-9);
    A.equal(roa.note, 'dùng số cuối năm');
  });

  T.test('AC-004.2 missing denominator line: "Không tính được" with the line name, never 0', function () {
    var years = hpg();
    years[1].values.currentLiabilities = null;
    var r = find(R().compute(years)[2025], 'currentRatio');
    A.equal(r.status, 'missing');
    A.equal(r.value, null);
    A.equal(r.reason, 'Không tính được: Nợ ngắn hạn');
  });

  T.test('AC-004.2 missing numerator line is named too', function () {
    var years = hpg();
    delete years[1].values.inventories;
    A.equal(find(R().compute(years)[2025], 'quickRatio').reason, 'Không tính được: Hàng tồn kho');
  });

  T.test('AC-004.2 zero denominator', function () {
    var years = hpg();
    years[1].values.interest = 0;
    var r = find(R().compute(years)[2025], 'interestCoverage');
    A.equal(r.status, 'missing');
    A.equal(r.value, null);
    A.equal(r.reason, 'Không tính được: Chi phí lãi vay bằng 0');
  });

  T.test('not applicable cases: CFO / profit when profit ≤ 0; debt / EBITDA when EBITDA ≤ 0', function () {
    var years = hpg();
    years[1].values.profitAfterTax = -10;
    years[1].values.profitBeforeTax = -20000; // EBITDA = -20000 + 3114.86 + 8468.26 < 0
    var y = R().compute(years)[2025];
    A.equal(find(y, 'cfoToProfit').status, 'not-applicable');
    A.equal(find(y, 'cfoToProfit').reason, 'Không áp dụng: LNST ≤ 0');
    A.equal(find(y, 'debtToEbitda').status, 'not-applicable');
    A.equal(find(y, 'debtToEbitda').reason, 'Không áp dụng: EBITDA ≤ 0');
  });

  T.test('growth needs the prior year; first year is not computable', function () {
    var r = find(R().compute(hpg())[2024], 'revenueGrowth');
    A.equal(r.status, 'missing');
    A.equal(r.reason, 'Không tính được: Doanh thu thuần năm trước');
  });

  T.test('every ratio in spec §2 is produced, in groups', function () {
    var keys = R().compute(hpg())[2025].map(function (r) { return r.key; });
    ['currentRatio', 'quickRatio', 'cashRatio', 'liabilitiesToAssets', 'debtToEquity', 'debtToEbitda',
      'interestCoverage', 'roa', 'roe', 'assetTurnover', 'dso', 'dio', 'dpo', 'cashConversionCycle',
      'grossMargin', 'ebitdaMargin', 'netMargin', 'cfoToProfit', 'cfoToCurrentLiabilities',
      'revenueGrowth', 'profitGrowth'].forEach(function (k) {
      A.ok(keys.indexOf(k) >= 0, k + ' missing from the table');
    });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
