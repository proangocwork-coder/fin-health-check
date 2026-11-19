# Báo cáo cổng G4 Code xong — Financial Health Check — 2026-11-19

**Kết luận:** verified (đạt), có hai giới hạn ghi ở dưới
**Cần bạn duyệt:** không, chỉ báo để biết (G4 ở T1 do agent xác nhận, FD-01 §5.1). Phát hành (G5) không áp dụng vì phần mềm không ra khỏi máy Owner.

## Đã làm được gì
- Phần mềm chạy trong trình duyệt, bấm đúp `index.html`: nhập hoặc dán 3 báo cáo VAS (mẫu TT200 và TT99), tự kiểm số, lưu ra file / mở file, ra bảng 21 chỉ số, Altman Z' / Z'', Beneish M, Piotroski F, 18 cờ Đỏ / Vàng kèm lý do, in A4.
- Kết quả khớp bảng đối chiếu độc lập (lập ở phiên riêng, từ báo cáo kiểm toán của HPG, VIC, PHP) ở 392 / 396 ô.

## Bằng chứng
| Tiêu chí ra (FD-01 §5.1, T1: test qua, đối chiếu criteria) | Bằng chứng | Tình trạng |
|---|---|---|
| Mọi task MVP xong | `project-memory/tasks.md` T-001 đến T-014: done | Đạt |
| Test tự động qua | `tools\verify-browser.cmd`: RESULT PASS 99/99 (laptop, Edge headless, 2026-11-19); mỗi bài mới đã thấy sai trước khi làm | Đạt (đường trình duyệt) |
| Mọi acceptance criterion có bằng chứng | `tasks.md` mục "Criterion → test map" | Đạt |
| NFR-001 kết quả đúng (≤ 0,01) | `tools/compare-reference.html`: 392/396 khớp ở sai số tương đối 1e-6; 4 ô còn lại là X5 "Không áp dụng" dưới Z'' (công thức không dùng); Owner dò 5 số nguồn với PDF: 5/5 đúng | Đạt |
| NFR-002 nhập ≤ 20 phút | Owner bấm giờ: 3 phút cho một công ty 2 năm, dán từ file dán sẵn | Đạt một phần: chưa đo khi chép số từ CafeF |
| NFR-003 không mất dữ liệu | Owner lưu và mở lại file `.json`, số không đổi; bài kiểm tra lưu/mở và bản nháp | Đạt |
| NFR-004 chạy offline trên Windows | Chạy trên laptop Windows 11 không mạng nội bộ nào; không lệnh gọi mạng (bài kiểm tra trong trình duyệt) | Đạt trên laptop; máy cá nhân Windows 10 chưa mở thử |
| NFR-005 chi phí 0 | Không dịch vụ, không tài khoản, không thư viện ngoài | Đạt |
| REQ-009 in A4 | In thử PDF bằng Edge (agent đọc lại 2 trang) và Owner in thật: "Đủ cả 7" | Đạt |
| Bảo mật T1 (ARCHITECTURE "Security risks") | Chữ dán vào không chạy như mã (bài kiểm tra); file mở lên được kiểm từng số; không gọi mạng | Đạt; bài rà mã nguồn tĩnh chỉ chạy bằng Node.js, chưa chạy |

## Chưa làm hoặc chưa kiểm được
- `node --test` chưa chạy lần nào (laptop không có Node.js). Cần chạy một lần trên máy cá nhân; bài rà "không có lệnh gọi mạng trong mã nguồn" chỉ chạy được ở đó.
- Thời gian nhập khi chép số từ CafeF hoặc báo cáo PDF chưa đo (giả định rủi ro nhất của BRIEF mới kiểm một nửa).
- Mã số TT99 lấy từ bản sao Phụ lục IV (expertis.vn), chưa có báo cáo năm 2026 thật để thử.

## Lỗi còn mở
Không có lỗi mức S1–S2. Không có lỗi nào được ghi trong `tasks.md` mục Defects.

## Rủi ro và chi phí cần biết
- Z, M, F xây trên dữ liệu doanh nghiệp Mỹ; trang kết quả luôn ghi là tín hiệu, không phải kết luận.
- Chi phí: 0 đồng.

## Việc kế tiếp
Rút kinh nghiệm (retro G4), đóng WP-07 ở VIBEOS, chuyển phát hiện sang WP-08 (sửa Handbook).
