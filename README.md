# Financial Health Check (bản nội bộ)

Công cụ cá nhân của Owner: nhập 3 báo cáo tài chính VAS (B01, B02, B03) → bảng chỉ số, Altman Z, Beneish M, Piotroski F và cờ cảnh báo kèm lý do. Tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu.

**Trạng thái:** dùng thử được (T-001 đến T-012 xong ngày 2026-11-19); chưa nghiệm thu (T-013, T-014). Yêu cầu: `project-memory/PRD.md`.

## Dùng
1. Bấm đúp `index.html` (mở bằng Edge hoặc Chrome). Không cần cài gì, không cần mạng.
2. Muốn xem trước kết quả mẫu: bấm "Xem ví dụ HPG" ở đầu trang (số CafeF, chưa đối chiếu báo cáo kiểm toán; không đụng tới dữ liệu của bạn).
3. Nhập: điền phần Công ty → thêm năm → dán bảng số (hoặc gõ tay ở Bảng số) → xem phần Kiểm tra số → xem phần Kết quả.
4. Giữ dữ liệu: bấm "Lưu ra file" (file `.json`, thường vào thư mục Downloads); lần sau bấm "Mở file". Trình duyệt cũng tự giữ một bản nháp.
5. In: Ctrl + P, chỉ in phần Kết quả, khổ A4 dọc.

## Kiểm tra tự động
- Bấm đúp `tests.html`: dòng đầu ghi `RESULT: PASS n/n` là tất cả đều đúng.
- Máy có Node.js (máy cá nhân): chạy `node --test` trong thư mục này.
- Máy không có Node.js (laptop công ty): chạy `tools\verify-browser.cmd`.

## Số liệu của bạn
File công ty (`.json`) lưu ngoài repo hoặc trong thư mục `data/` (không bao giờ đưa lên GitHub). Không đưa báo cáo của khách hàng vào công cụ này.

## Thư mục
`index.html` ứng dụng · `src/` phần tính toán · `tests/` bài kiểm tra · `tools/` lệnh hỗ trợ · `project-memory/` hồ sơ dự án (PRD, thiết kế, quyết định, task, trạng thái).
