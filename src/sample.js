// T-012: example company for the demo page (index.html?demo) and the print check.
// Public HPG figures in tỷ đồng copied from CafeF on 2026-11-19 (G1 data test); NOT checked against the audited report.
// Lines CafeF's free summary did not show for 2024 are left empty on purpose (they show as "Không tính được").
(function (root) {
  'use strict';
  var isNode = typeof require === 'function' && typeof module !== 'undefined';
  var FHC = isNode ? require('./fhc.js') : root.FHC;
  if (isNode) { require('./entry.js'); require('./storage.js'); require('./flags.js'); }

  function hpg() {
    var c = FHC.entry.newCompany();
    c.name = 'Tập đoàn Hòa Phát (ví dụ: số CafeF, chưa đối chiếu báo cáo kiểm toán)';
    c.ticker = 'HPG';
    c.companyType = 'manufacturing';
    c.unit = 'ty';
    FHC.entry.ensureYear(c, 2024).values = {
      currentAssets: 86674.28, cash: 6887.65, shortReceivables: 7647.80, inventories: 46091.22,
      nonCurrentAssets: 137815.43, totalAssets: 224489.71, liabilities: 109842.25, currentLiabilities: 75225.24,
      nonCurrentLiabilities: 34617.01, equity: 114647.46, contributedCapital: 63962.50, retainedEarnings: 49599.12,
      totalResources: 224489.71, revenue: 138855.11, cogs: 120357.56, grossProfit: 18497.55, financialIncome: 2618.92,
      financialExpense: 3966.64, sellingExpense: 2337.31, adminExpense: 1545.52, operatingProfit: 13267.01,
      otherProfit: 426.50, profitBeforeTax: 13693.50, profitAfterTax: 12020.02
    };
    FHC.entry.ensureYear(c, 2025).values = {
      currentAssets: 103659.40, cash: 8300.89, shortReceivables: 15042.32, tradeReceivables: 10994.15, inventories: 52828.23,
      nonCurrentAssets: 154239.80, tangibleFixedAssets: 133420.85, totalAssets: 257899.20, liabilities: 126679.19,
      currentLiabilities: 94186.27, tradePayables: 21183.38, shortBorrowings: 64694.96, nonCurrentLiabilities: 32492.92,
      longBorrowings: 27479.19, equity: 131220.01, contributedCapital: 76754.66, retainedEarnings: 51037.90,
      totalResources: 257899.20, revenue: 156116.09, cogs: 131618.31, grossProfit: 24497.79, financialIncome: 2081.79,
      financialExpense: 4603.58, interest: 3114.86, sellingExpense: 2633.63, adminExpense: 1436.54,
      operatingProfit: 17905.83, otherProfit: 134.76, profitBeforeTax: 18040.59, profitAfterTax: 15514.93,
      cfProfitBeforeTax: 18040.59, depreciation: 8468.26, cfo: 15693.90, shareIssue: 1865.20
    };
    return c;
  }

  FHC.sample = { hpg: hpg };
  if (typeof module !== 'undefined' && module.exports) module.exports = FHC;
})(typeof globalThis !== 'undefined' ? globalThis : this);
