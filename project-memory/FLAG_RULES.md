# Bộ cờ cảnh báo (bản nháp cho G1)

Version 0.2 · Date 2026-11-19 · Status: approved cùng PRD ở G1 (D-002): giữ ngưỡng 0.1, F10 dùng phải thu khách hàng, không có điểm tổng. Ngưỡng hiệu chỉnh sau khi chạy PHP, VIC, HPG (thay đổi sau G1 là APPROVAL)
Nguồn: Claude soạn theo yêu cầu Owner ("Soạn cho t cờ cảnh báo đi"). Mọi ngưỡng dưới đây là **đề xuất** [ASSUMPTION], trừ khi ghi nguồn. Owner là người chốt.

## Cách đọc
- **Đỏ** = cần xem ngay. **Vàng** = cần hỏi thêm. Không bật = không thấy dấu hiệu theo quy tắc này (không có nghĩa là "an toàn").
- Mỗi cờ khi bật phải hiện: mã cờ, công thức, các số đã dùng (năm nào, mã số dòng nào), ngưỡng.
- Thiếu số liệu → cờ ghi **"Không tính được"** và nêu dòng thiếu; không bao giờ coi là "không bật".
- Doanh nghiệp là ngân hàng, bảo hiểm, chứng khoán → toàn bộ bộ cờ ghi **"Không áp dụng"** (mẫu báo cáo và bản chất khác).
- Mã số dòng theo mẫu B01, B02, B03 (gián tiếp) của TT200. Nếu thông tư mới thay TT200 đổi mã số thì sửa bảng ánh xạ ở G1 [ASSUMPTION, kiểm ở G1].
- Đây là tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu.

## Chữ viết tắt (mã số dòng)
TSNH = B01.100 · Tiền = B01.110 · Phải thu NH = B01.130 · HTK = B01.140 · Tổng TS = B01.270 · Nợ NH = B01.310 · Vay NH = B01.320 · Vay DH = B01.338 · VCSH = B01.400 · LNST chưa phân phối = B01.421
DTT = B02.10 · GVHB = B02.11 · LN gộp = B02.20 · Lãi vay = B02.23 · LN thuần HĐKD = B02.30 · LN khác = B02.40 · LNTT = B02.50 · LNST = B02.60
Khấu hao = B03.02 · CFO = B03.20
EBIT = LNTT + Lãi vay · EBITDA = EBIT + Khấu hao · Nợ vay = Vay NH + Vay DH · "bq" = bình quân đầu năm và cuối năm

## A. Thanh khoản
| Mã | Cờ | Công thức | Vàng | Đỏ |
|---|---|---|---|---|
| F01 | Thanh toán hiện hành thấp | TSNH / Nợ NH | 1,0 – < 1,2 | < 1,0 |
| F02 | Thanh toán nhanh thấp | (TSNH − HTK) / Nợ NH | < 0,5 | — |

## B. Đòn bẩy và khả năng trả nợ
| Mã | Cờ | Công thức | Vàng | Đỏ |
|---|---|---|---|---|
| F03 | Khó trả lãi vay | EBIT / Lãi vay | 1,5 – < 3 | < 1,5 (hoặc EBIT âm có vay) |
| F04 | Nợ vay quá cao so với khả năng tạo tiền | Nợ vay / EBITDA | > 4 | > 6 (hoặc EBITDA ≤ 0 có vay) |
| F05 | Vốn chủ âm hoặc lỗ luỹ kế | VCSH; LNST chưa phân phối | LNST chưa phân phối < 0 | VCSH ≤ 0 |

## C. Dòng tiền và chất lượng lợi nhuận
| Mã | Cờ | Công thức | Vàng | Đỏ |
|---|---|---|---|---|
| F06 | Có lãi mà không có tiền | LNST > 0 và CFO < 0 | 1 năm | 2 năm liền |
| F07 | Lợi nhuận ít chuyển thành tiền | CFO / LNST (khi LNST > 0) | < 0,5 hai năm liền | — |
| F08 | Lợi nhuận dồn tích cao | (LNST − CFO) / Tổng TS bq | > 10% | — |
| F09 | Lãi nhờ hoạt động phụ | LN thuần HĐKD < 0 mà LNST > 0; hoặc LN khác / LNTT > 50% | bật | — |

## D. Vốn lưu động
| Mã | Cờ | Công thức | Vàng | Đỏ |
|---|---|---|---|---|
| F10 | Phải thu tăng nhanh hơn doanh thu | %tăng Phải thu khách hàng (B01.131) − %tăng DTT (D-002) | > 20 điểm % | > 50 điểm % |
| F11 | Tồn kho tăng nhanh hơn giá vốn | %tăng HTK − %tăng GVHB | > 20 điểm % | — |
| F12 | Chu kỳ tiền mặt kéo dài | (DSO + DIO − DPO) năm nay − năm trước | > 30 ngày | > 90 ngày |

## E. Kết quả kinh doanh
| Mã | Cờ | Công thức | Vàng | Đỏ |
|---|---|---|---|---|
| F13 | Biên gộp giảm mạnh | Biên gộp năm nay − năm trước | giảm > 5 điểm % | giảm > 10 điểm % |
| F14 | Doanh thu giảm mạnh | %tăng DTT | < −20% | < −40% |

## F. Mô hình điểm
| Mã | Cờ | Công thức | Vàng | Đỏ | Nguồn ngưỡng |
|---|---|---|---|---|---|
| F15 | Altman Z (biến thể theo loại DN, chốt ở G1) | Z'' cho DN phi sản xuất | 1,1 – 2,6 (vùng xám) | < 1,1 | Altman, ngưỡng gốc [KNOWN] |
| F16 | Beneish M (8 biến, cần 2 năm) | M | −2,22 – −1,78 | > −1,78 | Beneish 1999 (−1,78) và 2013 (−2,22) [KNOWN] |
| F17 | Piotroski F (9 tiêu chí) | F | ≤ 3 | — | Piotroski 2000, nhóm điểm thấp [KNOWN] |

Làm rõ F17 (Owner, 2026-11-19, nguyên văn "Vẫn bật"): khi chỉ tính được một phần 9 tiêu chí (VD năm đầu chỉ 5/9), vẫn áp ngưỡng F ≤ 3 lên điểm đã tính và bật Vàng; hiện kèm "x / số tiêu chí tính được". Không đổi ngưỡng.

## G. Nhập tay từ báo cáo kiểm toán
| Mã | Cờ | Điều kiện | Vàng | Đỏ |
|---|---|---|---|---|
| F18 | Ý kiến kiểm toán | Có đoạn "vấn đề cần nhấn mạnh" | bật | Ý kiến ngoại trừ, trái ngược, từ chối; hoặc nghi ngờ hoạt động liên tục |

## Lưu ý theo ngành (hiện cạnh kết quả, không tắt cờ)
- **Bất động sản** (VD: VIC có mảng BĐS lớn): HTK là dự án dở dang, người mua trả tiền trước nằm trong Nợ NH → F01, F02, F11, F12 dễ bật mà chưa chắc là xấu.
- **Tập đoàn đa ngành, có mua bán công ty con trong năm**: tăng trưởng doanh thu, tài sản nhảy vọt → F10, F11, F16 (biến SGI, AQI) dễ bật sai.
- **Dịch vụ hạ tầng** (VD: cảng như PHP): tài sản cố định lớn, HTK nhỏ → F02, F11 ít ý nghĩa; chú ý F04 và F06.

## Chạy thử bằng tay trên HPG 2025 (G1, 2026-11-19; số CafeF, tỷ đồng, chưa đối chiếu báo cáo kiểm toán)
| Cờ | Giá trị | Kết quả theo ngưỡng 0.1 |
|---|---|---|
| F01 | 103.682,04 / 94.208,65 = 1,10 | **Vàng** |
| F03 | (18.040,59 + 3.114,86) / 3.114,86 = 6,79 | không bật |
| F04 | 92.174,15 / 29.623,71 = 3,11 | không bật |
| F07 | CFO / LNST = 1,01 | không bật |
| F08 | (15.514,93 − 15.693,90) / 241.194,46 = −0,07% | không bật |
| F10 | tổng phải thu NH +96,7% so với DTT +12,4% → chênh 84,3 điểm | **Đỏ** nếu dùng tổng phải thu; chưa tính được với phải thu khách hàng (thiếu số 2024) |
| F11 | HTK +14,6% so với GVHB +9,4% → chênh 5,3 điểm | không bật |
| F13 | Biên gộp 15,69% so với 13,32% (tăng) | không bật |
Nhận xét: F10 bật Đỏ chủ yếu vì cách chọn dòng phải thu (tổng phải thu lẫn trả trước người bán, phải thu khác), nên PRD hỏi Owner ở Q2.

## Trả lời ở G1 (D-002, 2026-11-19, Owner: "Duyệt G1, giữ mặc định")
1. Ngưỡng: giữ nguyên bản 0.1; hiệu chỉnh sau khi chạy 3 công ty.
2. Cờ bổ sung: không có ở G1.
3. Điểm tổng: không; đầu trang kết quả đếm số cờ Đỏ và Vàng.
