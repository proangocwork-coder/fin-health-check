# D-003 Nền tảng: ứng dụng trình duyệt thuần, mở bằng file, không cần cài đặt

Status: approved · Date: 2026-11-19 · Category: APPROVAL (công nghệ nền ở T1, FD-03 §6)

**Context:** G2 của dự án T1. Owner dùng một mình, trên máy Windows của mình, không cần mạng (NFR-004), 0 đồng (NFR-005), cần in được (REQ-009), dán số từ bảng tính (AC-001.3). Owner làm việc trên hai máy: máy cá nhân (Windows 10, có Node.js 24 [MACHINE_SETUP, kiểm 2026-11-18]) và laptop công ty (Windows 11, **không có Node.js**, kiểm 2026-11-19; cài phần mềm cần IT cho phép). Owner không lập trình nên cách chạy phải là "bấm đúp là mở".

**Options:**
- **A. Ứng dụng trình duyệt thuần:** một thư mục gồm trang HTML, CSS, JavaScript; bấm đúp `index.html` là mở trong Edge hoặc Chrome. Không máy chủ, không thư viện ngoài, không gọi mạng.
- **B. Ứng dụng web chạy máy chủ nhỏ trên máy (Node.js, địa chỉ localhost):** bấm đúp một file khởi động, cửa sổ lệnh mở, trình duyệt mở trang. Máy chủ tự ghi dữ liệu xuống thư mục.
- **C. Sổ Excel có công thức và macro:** quen tay Owner, nhưng không phải "web app nhỏ" như OQ-02 đã chốt, khó kiểm tự động, khó tách "công thức" khỏi "dữ liệu".

**Decision:** A, vì chạy được trên cả hai máy mà không cài gì, không có cửa sổ lệnh hay cổng mạng phải giữ, in bằng chức năng in của trình duyệt. Phần tính toán (chỉ số, Z, M, F, cờ) tách thành các file JavaScript thuần, không phụ thuộc giao diện, để kiểm tự động bằng trình chạy test có sẵn trong Node.js (`node --test`, không thêm thư viện) trên máy cá nhân.

**Consequences:**
- Good: không cài gì để dùng; không có gì chạy ngầm; không gửi dữ liệu đi đâu; dễ sao lưu (chép thư mục).
- Bad: trình duyệt không tự ghi file xuống ổ đĩa → cách lưu dữ liệu xem D-004. Trang mở bằng file không nạp được kiểu module JavaScript hiện đại, nên mã viết theo kiểu script thường (chi tiết ở G3). Agent không mở được trang dạng file trong khung trình duyệt của nó, nên kiểm giao diện ở G4 do Owner bấm thử theo kịch bản nghiệm thu; phần tính toán vẫn kiểm tự động.
- Affects: ARCHITECTURE.md; mọi task ở G3; test chạy trên máy cá nhân (laptop công ty chỉ chạy test được nếu sau này có Node.js, việc đó hỏi riêng).

**Running cost:** 0 đồng/tháng. Không tài khoản, không dịch vụ.
**Reversibility:** một đến hai phiên để chuyển sang B (phần tính toán giữ nguyên, chỉ thay phần lưu và mở).
**Pros and cons:** A — 0 đồng, không cài, rủi ro chính: dữ liệu chưa lưu ra file có thể mất (D-004 xử lý). B — tự lưu xuống đĩa, nhưng cần Node.js trên mọi máy dùng app, Owner phải giữ một cửa sổ lệnh mở, rủi ro mở cổng mạng nếu cấu hình sai. C — Owner tự sửa được, nhưng không kiểm tự động được và lệch mục tiêu chạy thử Handbook.

**Approval:** Owner, 2026-11-19, nguyên văn: "Duyệt G2" (duyệt cả D-003 và D-004 trong báo cáo G2) · Resume point: CP-20261119-07
