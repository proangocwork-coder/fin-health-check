# Architecture: Financial Health Check (internal)

Tier T1 · Updated 2026-11-19 · Status: approved (G2, 2026-11-19, D-003, D-004)

## Drivers
- Chạy trên Windows của Owner, không cần mạng, không cài đặt; dùng được trên cả máy cá nhân và laptop công ty (NFR-004)
- 0 đồng/tháng, không hosting, không đăng nhập (NFR-005, PRINCIPLES)
- Kết quả đúng, kiểm lại được từng số (NFR-001, REQ-004 đến REQ-008) → phần tính toán tách riêng và kiểm tự động
- Không mất dữ liệu đã lưu (NFR-003); in được (REQ-009)

## Context
Một người dùng (Owner). Không nói chuyện với hệ thống nào bên ngoài: số liệu do Owner gõ hoặc dán từ bảng tính / báo cáo PDF (lấy số là việc của Owner, ngoài app).

## Containers
| Container | Technology | Purpose | Talks to | ADR |
|---|---|---|---|---|
| Trang ứng dụng | HTML + CSS + JavaScript thuần, mở bằng file trong Edge/Chrome | Nhập, kiểm số, hiện bảng chỉ số, Z/M/F, cờ, trang in | File dữ liệu, bản nháp trong trình duyệt | D-003 |
| Bộ tính toán | Các file JavaScript thuần, không dùng giao diện | Ánh xạ dòng TT200/TT99, kiểm số, chỉ số, Z, M, F, cờ | Được trang gọi; được test gọi | D-003 |
| File dữ liệu công ty | `.json`, một file mỗi công ty, Owner giữ | Bản chính của số đã nhập | Trang (mở / lưu) | D-004 |
| Bộ test | Trình chạy test có sẵn của Node.js (`node --test`), không thư viện ngoài | Kiểm bộ tính toán theo acceptance criteria | Bộ tính toán | RECOMMEND (thư viện phụ, FD-03 §6) |

## Deployment
Thư mục dự án trên máy Owner; dùng app = bấm đúp `index.html`. Không có môi trường nào khác. Test chạy trên máy cá nhân (có Node.js 24); laptop công ty chỉ dùng app.

## Security risks
- **Bí mật:** không có mật khẩu, khoá hay tài khoản nào trong app hay repo.
- **Truy cập từ mạng:** không có; app không mở cổng và không gửi yêu cầu ra mạng (sẽ có test kiểm mã không chứa lệnh gọi mạng).
- **Dữ liệu dán vào hoặc file mở lên:** chữ dán vào chỉ hiện ra như chữ, không bao giờ được chạy như mã của trang (OWASP A05 Injection); file `.json` mở lên được kiểm cấu trúc, số và phiên bản trước khi dùng, file sai bị từ chối kèm lý do. Mức: Thấp ở T1 (chỉ Owner mở file của chính mình).
- **Dữ liệu nếu lộ hoặc mất:** chỉ là báo cáo công khai, nhập lại được. Báo cáo của khách hàng không được đưa vào (PRINCIPLES); nếu muốn thì phải xếp tầng lại.

## Decisions
- D-003 Nền tảng: ứng dụng trình duyệt thuần (approved 2026-11-19)
- D-004 Lưu dữ liệu: file mỗi công ty + bản nháp tự động (approved 2026-11-19)

## Simplicity check (EN-01 §4.6)
- [x] Every container and external service traces to a driver (không có dịch vụ ngoài).
- [x] Number of deployable parts is the minimum the drivers allow (một thư mục).
- [x] Every technology is mainstream, maintained, verifiable in current docs (HTML/CSS/JavaScript; Node.js test runner) [KNOWN; phiên bản Node.js trên máy cá nhân từ MACHINE_SETUP, chưa kiểm lại hôm nay].
- [x] The Owner can run, back up and pay for it without programming (bấm đúp; chép thư mục; 0 đồng).
- [x] Nothing built "for later" (không máy chủ, không cơ sở dữ liệu, không đăng nhập).
