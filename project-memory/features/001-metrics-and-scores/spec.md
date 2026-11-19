# Spec 001: Chỉ số, Altman Z, Beneish M, Piotroski F

Version 0.3 · Date 2026-11-19 · Status: approved cùng PRD 0.2 (G1, D-002); 0.3 chỉ điền cột mã TT99 đã hẹn ở G1, không đổi nghĩa · Phục vụ REQ-002, REQ-004 đến REQ-007

Quy ước: "t" = năm đang xét, "t−1" = năm trước. "bq" = bình quân số đầu năm và cuối năm. Thiếu số → "Không tính được" + tên dòng thiếu (REQ-004 AC-004.2). Mã số ghi trong phần công thức dưới đây theo **TT200**; với năm theo TT99, đọc mã ở cột phải của bảng §1. Tên dòng là khoá chính.

## 1. Dòng dữ liệu cần nhập (tối thiểu)

Mã TT99 lấy ở G3 (2026-11-19) từ bản sao Phụ lục IV đăng trên expertis.vn [chưa đối chiếu Công báo; nên đối chiếu khi có báo cáo năm 2026 thật]. Dòng có mã khác nhau giữa hai thông tư được **in đậm**.

| Tên ngắn | Dòng báo cáo | Mã TT200 | Mã TT99 |
|---|---|---|---|
| TSNH | Tài sản ngắn hạn | B01.100 | B01.100 |
| Tiền | Tiền và tương đương tiền | B01.110 | B01.110 |
| Phải thu NH | Các khoản phải thu ngắn hạn | B01.130 | B01.130 |
| Phải thu KH | Phải thu ngắn hạn của khách hàng | B01.131 | B01.131 |
| HTK | Hàng tồn kho (dòng nhóm) | B01.140 | B01.140 |
| TSCĐ HH | Tài sản cố định hữu hình (giá trị còn lại) | B01.221 | B01.221 |
| **Tổng TS** | Tổng cộng tài sản | **B01.270** | **B01.280** |
| Nợ phải trả | Nợ phải trả | B01.300 | B01.300 |
| Nợ NH | Nợ ngắn hạn | B01.310 | B01.310 |
| Phải trả NB | Phải trả người bán ngắn hạn | B01.311 | B01.311 |
| **Vay NH** | Vay và nợ thuê tài chính ngắn hạn | **B01.320** | **B01.321** |
| Nợ DH | Nợ dài hạn | B01.330 | B01.330 |
| **Vay DH** | Vay và nợ thuê tài chính dài hạn | **B01.338** | **B01.339** |
| VCSH | Vốn chủ sở hữu | B01.400 | B01.400 |
| Vốn góp | Vốn góp của chủ sở hữu | B01.411 | B01.411 |
| **LNCPP** | LNST chưa phân phối | **B01.421** | **B01.420** |
| Tổng NV | Tổng cộng nguồn vốn | B01.440 | B01.440 |
| DTT | Doanh thu thuần | B02.10 | B02.10 |
| GVHB | Giá vốn hàng bán | B02.11 | B02.11 |
| LN gộp | Lợi nhuận gộp | B02.20 | B02.20 |
| **Lãi vay** | Chi phí lãi vay (TT200) / Chi phí đi vay (TT99) | **B02.23** | **B02.24** — mã 23 của TT99 là chi phí tài chính |
| CPBH | Chi phí bán hàng | B02.25 | B02.25 |
| CPQL | Chi phí quản lý doanh nghiệp | B02.26 | B02.26 |
| LN thuần | LN thuần từ HĐKD | B02.30 | B02.30 (công thức cộng khác) |
| LN khác | Lợi nhuận khác | B02.40 | B02.40 |
| LNTT | Tổng LN kế toán trước thuế | B02.50 | B02.50 |
| LNST | LN sau thuế TNDN | B02.60 | B02.60 |
| LNTT (B03) | Lợi nhuận trước thuế | B03.01 | B03.01 |
| Khấu hao | Khấu hao TSCĐ và BĐSĐT | B03.02 | B03.02 |
| CFO | LCTT thuần từ HĐKD | B03.20 | B03.20 |
| Phát hành CP | Tiền thu từ phát hành cổ phiếu, nhận vốn góp | B03.31 | B03.31 |
| Ý kiến KT | Loại ý kiến kiểm toán | nhập tay | nhập tay |

Dẫn xuất: EBIT = LNTT + Lãi vay · EBITDA = EBIT + Khấu hao · Nợ vay = Vay NH + Vay DH · Vốn lưu động = TSNH − Nợ NH.
Hai năm báo cáo cho ba thời điểm Bảng cân đối (cuối t, cuối t−1, và đầu t−1 lấy từ cột "số đầu năm"), đủ cho số bình quân và cho Piotroski.

## 2. Bảng chỉ số (REQ-004)

| Nhóm | Chỉ số | Công thức |
|---|---|---|
| Thanh khoản | Thanh toán hiện hành | TSNH / Nợ NH |
| | Thanh toán nhanh | (TSNH − HTK) / Nợ NH |
| | Thanh toán tiền mặt | Tiền / Nợ NH |
| Đòn bẩy | Nợ phải trả / Tổng TS | Nợ phải trả / Tổng TS |
| | Nợ vay / VCSH | Nợ vay / VCSH |
| | Nợ vay / EBITDA | Nợ vay / EBITDA |
| | Khả năng trả lãi | EBIT / Lãi vay |
| Hiệu quả | ROA | LNST / Tổng TS bq |
| | ROE | LNST / VCSH bq |
| | Vòng quay tổng TS | DTT / Tổng TS bq |
| Vốn lưu động | DSO (ngày) | Phải thu KH bq / DTT × 365 |
| | DIO (ngày) | HTK bq / GVHB × 365 |
| | DPO (ngày) | Phải trả người bán NH bq / GVHB × 365 (cần thêm dòng B01.311) |
| | Chu kỳ tiền mặt | DSO + DIO − DPO |
| Biên lợi nhuận | Biên gộp | LN gộp / DTT |
| | Biên EBITDA | EBITDA / DTT |
| | Biên ròng | LNST / DTT |
| Dòng tiền | CFO / LNST | CFO / LNST (chỉ khi LNST > 0) |
| | CFO / Nợ NH | CFO / Nợ NH |
| Tăng trưởng | % DTT, % LNST | (t / t−1) − 1 |

Năm chỉ có một Bảng cân đối (năm đầu tiên): chỉ số "bq" dùng số cuối năm và ghi chú "dùng số cuối năm".

## 3. Altman Z (REQ-005) [KNOWN: Altman 1968, 1983, 1995; ngưỡng là ngưỡng gốc]

X1 = Vốn lưu động / Tổng TS · X2 = LN giữ lại / Tổng TS · X3 = EBIT / Tổng TS · X4 = VCSH (sổ sách) / Nợ phải trả · X5 = DTT / Tổng TS
LN giữ lại: dùng LNCPP (B01.421) [ASSUMPTION: VAS không có dòng "retained earnings" đúng nghĩa; quỹ đầu tư phát triển không cộng vào].

| Biến thể | Dùng cho | Công thức | An toàn | Xám | Nguy hiểm |
|---|---|---|---|---|---|
| Z' | Sản xuất (mặc định HPG) | 0,717·X1 + 0,847·X2 + 3,107·X3 + 0,420·X4 + 0,998·X5 | > 2,9 | 1,23 – 2,9 | < 1,23 |
| Z'' | Phi sản xuất, dịch vụ, đa ngành (mặc định PHP, VIC) | 6,56·X1 + 3,26·X2 + 6,72·X3 + 1,05·X4 | > 2,6 | 1,1 – 2,6 | < 1,1 |

Cờ F15 trong `FLAG_RULES.md` đọc vùng theo đúng biến thể (Vàng = xám, Đỏ = nguy hiểm). Bản gốc 1968 (X4 theo giá thị trường) để ngoài phạm vi (D-002, Q3). Loại doanh nghiệp đã chốt: HPG sản xuất; PHP dịch vụ; VIC đa ngành (D-002, Q5).

## 4. Beneish M, 8 biến (REQ-006) [KNOWN: Beneish 1999]

M = −4,84 + 0,920·DSRI + 0,528·GMI + 0,404·AQI + 0,892·SGI + 0,115·DEPI − 0,172·SGAI + 4,679·TATA − 0,327·LVGI

| Biến | Công thức (VAS) |
|---|---|
| DSRI | (Phải thu KH_t / DTT_t) / (Phải thu KH_t−1 / DTT_t−1) |
| GMI | Biên gộp_t−1 / Biên gộp_t |
| AQI | [1 − (TSNH_t + TSCĐ HH_t) / Tổng TS_t] / [1 − (TSNH_t−1 + TSCĐ HH_t−1) / Tổng TS_t−1] |
| SGI | DTT_t / DTT_t−1 |
| DEPI | [KH_t−1 / (KH_t−1 + TSCĐ HH_t−1)] / [KH_t / (KH_t + TSCĐ HH_t)] |
| SGAI | ((CPBH + CPQL)_t / DTT_t) / ((CPBH + CPQL)_t−1 / DTT_t−1) |
| TATA | (LNST_t − CFO_t) / Tổng TS_t |
| LVGI | [(Nợ NH_t + Vay DH_t) / Tổng TS_t] / [(Nợ NH_t−1 + Vay DH_t−1) / Tổng TS_t−1] |

Ngưỡng (F16): > −1,78 Đỏ; −2,22 đến −1,78 Vàng. Mẫu số 0 ở một biến → biến đó "Không tính được" và M không tính.

## 5. Piotroski F, 9 tiêu chí (REQ-007) [KNOWN: Piotroski 2000]

Mỗi tiêu chí đạt = 1 điểm. "TS đầu năm" = Tổng TS cuối năm trước.

| # | Tiêu chí | Đạt khi |
|---|---|---|
| 1 | ROA dương | LNST_t / TS đầu năm_t > 0 |
| 2 | CFO dương | CFO_t > 0 |
| 3 | ROA tăng | ROA_t > ROA_t−1 |
| 4 | Chất lượng lợi nhuận | CFO_t / TS đầu năm_t > ROA_t |
| 5 | Đòn bẩy giảm | Vay DH_t / Tổng TS bq_t < Vay DH_t−1 / Tổng TS bq_t−1 |
| 6 | Thanh khoản tăng | Thanh toán hiện hành_t > năm t−1 |
| 7 | Không phát hành thêm cổ phiếu | Phát hành CP (B03.31)_t = 0 [ASSUMPTION: cổ phiếu thưởng, chia cổ tức bằng cổ phiếu không tính là phát hành] |
| 8 | Biên gộp tăng | Biên gộp_t > năm t−1 |
| 9 | Vòng quay TS tăng | DTT_t / TS đầu năm_t > năm t−1 |

Tiêu chí 3, 5, 9 cần Bảng cân đối của ba thời điểm (xem §1). Thiếu → "Không tính được", điểm hiện "x / số tiêu chí tính được" (AC-007.1). F17: F ≤ 3 → Vàng.

## 6. Kiểm thử bằng số thật (dùng ở G4)
Số HPG 2025 (tỷ đồng, CafeF, chưa đối chiếu báo cáo kiểm toán): Thanh toán hiện hành 1,10 · EBIT / Lãi vay 6,79 · Nợ vay / EBITDA 3,11 · CFO / LNST 1,01 · Biên gộp 15,69% (2024: 13,32%). Đây là số tham khảo; số chuẩn để so khớp là bảng Excel của Owner tính từ báo cáo kiểm toán (NFR-001).
