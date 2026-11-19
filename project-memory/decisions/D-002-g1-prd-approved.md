# D-002 G1: PRD 0.1 approved with all default answers

| Trường | Nội dung |
|---|---|
| ID, dự án, ngày | D-002 · Financial Health Check (internal) · 2026-11-19 |
| Loại | APPROVAL |
| Trạng thái | approved |

## Bối cảnh và ràng buộc
G1 của PILOT-01 (WP-07 phiên 2, VIBEOS). Hồ sơ: `PRD.md` 0.1, `features/001-metrics-and-scores/spec.md` 0.1, `FLAG_RULES.md` 0.1 kèm phần thử trên HPG 2025. Năm câu hỏi Q1–Q5 trong PRD, mỗi câu có mặc định.

## Phương án và đánh đổi
- **A. Duyệt G1, giữ mọi mặc định**: đi tiếp sang G2 ngay; ngưỡng cờ sẽ hiệu chỉnh sau khi chạy 3 công ty.
- **B. Duyệt và sửa một số câu trả lời**: sát ý Owner hơn, thêm một vòng hỏi.
- **C. Chưa duyệt**: quay lại sửa PRD.

## Khuyến nghị và lý do
A: các mặc định giữ đầu vào ở mức "chỉ cần 3 báo cáo", và ngưỡng chỉ hiệu chỉnh được khi có số thật của 3 công ty.

## Chi phí và rủi ro
0 đồng. Đổi ý sau G1 là APPROVAL: mở lại G1 và chỉ làm lại phần bị ảnh hưởng (PD-02 §6).

## Lựa chọn
A. Câu trả lời đã áp dụng:
- Q1: giữ ngưỡng FLAG_RULES 0.1; hiệu chỉnh sau khi chạy PHP, VIC, HPG.
- Q2: F10 dùng **phải thu khách hàng** (B01.131), không dùng tổng phải thu ngắn hạn.
- Q3: không dùng Altman Z bản gốc 1968; chỉ Z' (sản xuất) và Z'' (còn lại).
- Q4: không có điểm tổng; đầu trang kết quả đếm số cờ Đỏ và Vàng.
- Q5: HPG = sản xuất (Z'); PHP = dịch vụ (Z''); VIC = đa ngành (Z'').

## Người duyệt, thời điểm
Owner, 2026-11-19, nguyên văn: "Duyệt G1, giữ mặc định".

## Ảnh hưởng tới
- Tài liệu: PRD.md (0.2, approved), FLAG_RULES.md (0.2), spec 001 (0.2), STATE.md · Code/test: chưa có.

## Điểm tiếp tục
Checkpoint CP-20261119-05
