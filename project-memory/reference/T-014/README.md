# T-014 Bảng đối chiếu độc lập (D-005)

Lập 2026-11-19 · Phiên riêng, **không đọc mã phần mềm** (`src/`, `tests/`, `tests.html`, `index.html`). Chỉ đọc PRD, spec 001 v0.3, FLAG_RULES 0.2, D-002, D-005, dòng T-014.
Dùng ở T-013: so từng số của phần mềm với bảng này, sai khác cho phép ≤ 0,01.

## Các file trong thư mục này
| File | Nội dung |
|---|---|
| `T-014_bang_doi_chieu.xlsx` | Bảng tính chính. Trang `HPG`, `VIC`, `PHP`: phần trên là số nhập từ báo cáo (cột F ghi nguồn), phần dưới là kết quả, **mỗi ô là công thức Excel nhìn thấy được**. Trang `NguonSoLieu`: mọi số đã nhập. Trang `DocTruoc`: cách đọc. |
| `so_lieu_nguon.csv` | Cùng số liệu nhập, dạng văn bản (mỗi số một dòng, kèm file và trang). |
| `ket_qua.csv` | Giá trị kết quả (làm tròn 4 chữ số) để so nhanh ở T-013; cột `DongTrongExcel` chỉ dòng chứa công thức. |

## Nguồn số liệu (báo cáo tài chính hợp nhất, PDF của chính công ty)
File tải về máy theo phép Owner ngày 2026-11-19; **không đưa PDF lên GitHub**.

| Mã file | Tên file | Nơi đăng | Kiểm toán | Ý kiến |
|---|---|---|---|---|
| HPG2025 | 20260327-hpg-bctc-hop-nhat-nam-2025-sau-kiem-toan.pdf | hoaphat.com.vn | Deloitte | Chấp nhận toàn phần; năm 2024 do hãng khác kiểm toán, cũng chấp nhận toàn phần (đoạn "Vấn đề khác", tr.4) |
| HPG_H1_2024 | 20240829-hpg-bctc-hop-nhat-6-thang-dau-nam-2024-sau-soat-xet.pdf | hoaphat.com.vn | (soát xét) | Chỉ lấy cột 1/1/2024 = số cuối 2023 |
| VIC2025 | 2025_Bao cao tai chinh hop nhat kiem toan.pdf | vingroup.net | EY | Chấp nhận toàn phần, không có đoạn nhấn mạnh |
| VIC2024 | 2024_BCTC HN KT.pdf | vingroup.net | EY | Chấp nhận toàn phần, không có đoạn nhấn mạnh |
| PHP2025 | Bao cao tai chinh hop nhat va giai trinh co lien quan_kiem toan_2025.pdf | haiphongport.com.vn | UHY | Chấp nhận toàn phần **có đoạn "Vấn đề cần nhấn mạnh"** (cầu cảng 4, 5 Chùa Vẽ; cổ phần hoá) |
| PHP2024 | vi_baocaotaichinhhopnhat_kiemtoan_2024pdf.pdf | haiphongport.com.vn | UHY | **Ngoại trừ** |

"tr.X" = số trang in trên báo cáo; "PDF tr.Y" = trang thứ Y của file. Đơn vị: HPG và PHP là đồng; **VIC là triệu đồng** (tỷ số không đổi theo đơn vị). Cả 6 báo cáo theo mẫu TT200 nên dùng mã TT200.

## Công thức và nguồn học thuật
Theo spec 001 §2–§5 và FLAG_RULES 0.2; đã so với bài gốc:
- **Altman Z'** (Altman 1983, công ty chưa niêm yết, X4 = VCSH sổ sách / Nợ phải trả): 0,717·X1 + 0,847·X2 + 3,107·X3 + 0,420·X4 + 0,998·X5; an toàn > 2,9, nguy hiểm < 1,23. Dùng cho HPG.
- **Altman Z''** (Altman 1995 / Altman, Hartzell & Peck, bản 4 biến không có hằng số 3,25): 6,56·X1 + 3,26·X2 + 6,72·X3 + 1,05·X4; an toàn > 2,6, nguy hiểm < 1,1. Dùng cho VIC, PHP.
- **Beneish M 8 biến** (Beneish 1999): hệ số −4,84; 0,920; 0,528; 0,404; 0,892; 0,115; −0,172; 4,679; −0,327 khớp bài gốc. Ngưỡng −1,78 (1999) và −2,22 (Beneish, Lee & Nichols 2013). **Khác bài gốc 1999 một chỗ:** TATA dùng (LNST − CFO)/Tổng TS như spec (dạng dòng tiền, phổ biến sau này); bài 1999 tính dồn tích từ thay đổi các khoản mục vốn lưu động.
- **Piotroski F** (Piotroski 2000): ROA và CFO chia Tổng TS đầu năm; đòn bẩy = vay dài hạn / Tổng TS bình quân; thanh khoản = TSNH/Nợ NH; không phát hành cổ phiếu; biên gộp; vòng quay = DTT / TS đầu năm. Khớp bài gốc.

## Quy ước đã chọn (cần xem phần mềm có làm giống không ở T-013)
1. Năm 2024 là năm đầu: có Bảng cân đối cuối 2023 (đầu năm 2024) nhưng **không có Kết quả kinh doanh 2023**. Vì vậy năm 2024: số bình quân dùng (cuối 2023 + cuối 2024)/2; tăng trưởng, Beneish M, F10–F14, F16 ghi "Không tính được"; Piotroski chỉ tính được 5/9 tiêu chí (1, 2, 4, 6, 7).
2. F06 năm 2024 chỉ xét một năm; F07 năm 2024 "Không bật" nếu CFO/LNST ≥ 0,5, ngược lại "Không tính được".
3. F17 năm 2024 áp ngưỡng F ≤ 3 lên điểm 5 tiêu chí (HPG 2/5, VIC 3/5 → Vàng). Phần mềm có thể xử lý khác.
4. Piotroski 7 dùng đúng dòng B03.31. Dòng này **gồm cả tiền góp vốn của cổ đông không kiểm soát** (HPG 687,5 tỷ năm 2025; VIC 2.267.028 triệu) nên tiêu chí 7 không đạt dù công ty mẹ không phát hành.
5. VIC: dòng 23 ghi "chi phí lãi vay **và chi phí phát hành**"; đã dùng nguyên dòng. Trái phiếu hoán đổi (mã 339) **không** cộng vào Vay DH (đúng mã 338 của spec).
6. HPG: số cuối 2024 lấy từ cột "Số đầu năm (Trình bày lại)" của báo cáo 2025; số năm 2024 của kết quả kinh doanh lấy từ cột "Năm trước" của báo cáo 2025. VIC, PHP: số 2024 lấy từ báo cáo 2024 và đã so với cột so sánh của báo cáo 2025, khớp hết các dòng dùng ở đây.
7. F18 nhập tay: PHP 2024 Đỏ (ngoại trừ), PHP 2025 Vàng (có đoạn nhấn mạnh), HPG và VIC không bật.

## Kết quả chính
| | HPG 2024 | HPG 2025 | VIC 2024 | VIC 2025 | PHP 2024 | PHP 2025 |
|---|---|---|---|---|---|---|
| Thanh toán hiện hành | 1,1522 | 1,1006 | 0,7847 | 1,1214 | 1,8885 | 2,4532 |
| EBIT / Lãi vay | 6,9866 | 6,7918 | 1,7284 | 1,9066 | 169,8696 | 55,5838 |
| Nợ vay / EBITDA | 3,6214 | 3,1112 | 3,5966 | 3,8438 | 0,3553 | 1,1539 |
| ROA | 5,83% | 6,43% | 0,70% | 1,13% | 12,52% | 10,70% |
| Biên gộp | 13,32% | 15,69% | 14,44% | 15,88% | 38,14% | 46,76% |
| CFO / LNST | 0,5498 | 1,1193 | 3,9512 | 6,2581 | 1,4929 | 0,6058 |
| Altman Z (biến thể) | 1,5006 (Z', xám) | 1,4880 (Z', xám) | −0,1243 (Z'', nguy hiểm) | 1,0749 (Z'', nguy hiểm) | 5,6112 (Z'', an toàn) | 4,7809 (Z'', an toàn) |
| Beneish M | Không tính được | −1,5748 | Không tính được | −2,4482 | Không tính được | −2,5008 |
| Piotroski F | 2/5 | 6/9 | 3/5 | 7/9 | 4/5 | 4/9 |
| Cờ Đỏ | — | F10, F16 | F01, F15 | F15 | F18 | — |
| Cờ Vàng | F01, F15, F17 | F01, F15 | F03, F17 | F01, F03, F09 | — | F18 |

Đủ mọi chỉ số còn lại (thanh toán nhanh, tiền mặt, nợ/tài sản, nợ vay/VCSH, ROE, vòng quay, DSO, DIO, DPO, chu kỳ tiền mặt, biên EBITDA, biên ròng, CFO/Nợ NH, tăng trưởng, X1–X5, 8 biến Beneish, 9 tiêu chí Piotroski, 18 cờ) ở `ket_qua.csv` và trong bảng tính.
Đối chiếu với số CafeF ở spec §6 (HPG 2025): thanh toán hiện hành 1,10; EBIT/lãi vay 6,79; Nợ vay/EBITDA 3,11; biên gộp 15,69% (2024: 13,32%) — **khớp**. CFO/LNST: CafeF 1,01, bảng này 1,12 (CafeF có vẻ dùng LNST công ty mẹ hoặc số khác; bảng này dùng B02.60 = 15.514.931.571.606 và B03.20 = 17.365.859.056.591).

## 5 số để Owner dò lại với báo cáo gốc
| # | Số | Giá trị trong bảng | Mở file | Trang |
|---|---|---|---|---|
| 1 | HPG – Tổng cộng tài sản 31/12/2025 (mã 270) | 257.899.200.817.547 đồng | HPG2025 | tr.6 (PDF tr.8) |
| 2 | HPG – Phải thu ngắn hạn của khách hàng 31/12/2025 (mã 131) | 10.971.774.018.235 đồng | HPG2025 | tr.5 (PDF tr.7) |
| 3 | VIC – Nợ ngắn hạn 31/12/2024 (mã 310) | 505.292.040 triệu đồng | VIC2024 | tr.8 (PDF tr.11) |
| 4 | VIC – Lợi nhuận sau thuế năm 2025 (mã 60) | 11.064.814 triệu đồng | VIC2025 | tr.10 (PDF tr.13) |
| 5 | PHP – Lưu chuyển tiền thuần từ hoạt động kinh doanh năm 2025 (mã 20) | 596.439.674.791 đồng | PHP2025 | tr.9 (PDF tr.13) |

Chọn 5 số này vì mỗi số làm bật hoặc đổi một kết quả lớn (số 2 → cờ F10 Đỏ và M Đỏ của HPG; số 3 → cờ F01 Đỏ và Z âm của VIC; số 5 → Piotroski của PHP).

## Đã kiểm và chưa kiểm được
- Đã kiểm: mỗi Bảng cân đối khớp tổng (Nợ + VCSH = Tổng nguồn vốn = Tổng TS) ở cả 9 thời điểm; LNTT ở B02 = B03 cả 6 năm; tính lại riêng bằng cách khác (không qua Excel) cho thanh toán hiện hành, EBIT/lãi vay, Nợ vay/EBITDA, ROA, DSO, Z (2 năm), M và F (2025) của cả 3 công ty: khớp 100%.
- **Chưa kiểm được:** (a) số được đọc bằng mắt từ file ảnh chụp, không có lớp chữ → cần Owner dò 5 số trên; (b) HPG không có bản kiểm toán 2024 gốc trên trang công ty, số cuối 2024 là số **trình bày lại** trong báo cáo 2025 (chưa xem dòng nào bị trình bày lại); (c) chưa đọc thuyết minh để biết phần cổ phiếu thưởng/cổ tức bằng cổ phiếu trong B03.31; (d) mã TT99 không dùng vì 6 báo cáo đều theo TT200.
