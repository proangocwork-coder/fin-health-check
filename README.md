# Financial Health Check (bản nội bộ)

Công cụ cá nhân của Owner: nhập 3 báo cáo tài chính VAS (B01, B02, B03) → bảng chỉ số, Altman Z, Beneish M, Piotroski F và cờ cảnh báo kèm lý do. Tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu.

**Trạng thái:** đang xây dựng (khung rỗng, G3 ngày 2026-11-19). Yêu cầu: `project-memory/PRD.md`.

## Dùng
Bấm đúp `index.html` (mở bằng Edge hoặc Chrome). Không cần cài gì, không cần mạng.

## Kiểm tra tự động
- Bấm đúp `tests.html`: dòng đầu ghi `RESULT: PASS n/n` là tất cả đều đúng.
- Máy có Node.js (máy cá nhân): chạy `node --test` trong thư mục này.
- Máy không có Node.js (laptop công ty): chạy `tools\verify-browser.cmd`.

## Số liệu của bạn
File công ty (`.json`) lưu ngoài repo hoặc trong thư mục `data/` (không bao giờ đưa lên GitHub). Không đưa báo cáo của khách hàng vào công cụ này.

## Thư mục
`index.html` ứng dụng · `src/` phần tính toán · `tests/` bài kiểm tra · `tools/` lệnh hỗ trợ · `project-memory/` hồ sơ dự án (PRD, thiết kế, quyết định, task, trạng thái).
