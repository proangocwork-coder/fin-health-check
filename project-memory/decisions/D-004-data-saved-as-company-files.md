# D-004 Lưu dữ liệu: mỗi công ty một file do Owner lưu và mở, kèm bản nháp tự động trong trình duyệt

Status: approved · Date: 2026-11-19 · Category: APPROVAL (nơi lưu dữ liệu là lựa chọn nền, đi cùng D-003)

**Context:** REQ-001 (nhập 2–5 năm, mở lại thấy đúng số), NFR-003 (0 lần mất dữ liệu trong pilot). Với D-003 (trình duyệt thuần), trang không tự ghi file xuống ổ đĩa. Dữ liệu chỉ là báo cáo công khai, nhập lại được (PRINCIPLES).

**Options:**
- **A. File dữ liệu cho mỗi công ty + bản nháp tự động:** nút "Lưu ra file" tải về một file `.json` (ví dụ `HPG.json`); nút "Mở file" đọc lại. Trong lúc nhập, trình duyệt tự giữ một bản nháp; trang luôn hiện dòng "Có thay đổi chưa lưu ra file" khi có.
- **B. Chỉ lưu trong trình duyệt:** tiện nhất, nhưng xoá lịch sử duyệt web, đổi trình duyệt hoặc đổi máy là mất; không chép sang máy kia được.
- **C. Dán lại từ bảng tính mỗi lần:** không lưu gì; trái REQ-001.

**Decision:** A. File `.json` là bản chính: đọc được bằng mắt, chép giữa hai máy được, sao lưu bằng cách chép thư mục. Bản nháp trong trình duyệt chỉ để không mất số khi lỡ đóng trang.

**Consequences:**
- Good: không mất dữ liệu đã lưu ra file; chuyển giữa máy cá nhân và laptop được; mỗi file ghi phiên bản cấu trúc để đọc được về sau.
- Bad: Owner phải bấm "Lưu ra file" (một bước); file tải về rơi vào thư mục Downloads trừ khi Owner chọn nơi khác. Mở một file lạ là một đường đưa dữ liệu xấu vào (xem "Rủi ro bảo mật" trong ARCHITECTURE.md).
- Affects: REQ-001, NFR-003; task lưu/mở và kiểm file khi mở ở G3.

**Running cost:** 0 đồng.
**Reversibility:** dễ; đổi cách lưu không đổi phần tính toán, file `.json` chuyển đổi được.
**Data location rule:** file dữ liệu của Owner **không** đưa vào repo GitHub; chỉ file mẫu với số bịa hoặc số công khai dùng cho test (PRINCIPLES "No client financial statements").

**Approval:** Owner, 2026-11-19, nguyên văn: "Duyệt G2" (duyệt cả D-003 và D-004 trong báo cáo G2) · Resume point: CP-20261119-07
