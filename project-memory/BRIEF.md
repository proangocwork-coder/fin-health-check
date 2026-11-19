# Idea Brief: Financial Health Check (bản nội bộ)

Date: 2026-11-19 · Verdict: go · Tier: T1 (approved D-001)

## Problem
Owner làm tư vấn tài chính (CFO, kiểm soát nội bộ) và muốn đánh giá nhanh "sức khoẻ tài chính" của một doanh nghiệp từ 3 báo cáo tài chính theo VAS. Hiện việc này làm tay trong Excel hoặc nhờ Claude trong chat: mỗi lần tính lại từ đầu, kết quả không lặp lại được, dễ sai công thức và khó so sánh giữa các doanh nghiệp.

## Users
Chỉ Owner, trên máy cá nhân. Không có khách hàng dùng trực tiếp ở bản này.

## Success measure
1. Với 3 công ty niêm yết (báo cáo công khai, 2–5 năm), mọi chỉ số, Z, M, F của app khớp bảng tính Excel Owner tự làm (sai khác chỉ do làm tròn). *Đổi 2026-11-19 (D-005): bảng đối chiếu do agent làm ở phiên riêng, Owner dò 5 số.*
2. Nhập 3 báo cáo của một công ty cho 2 năm mất ≤ 20 phút.
3. Mỗi cờ cảnh báo ghi rõ quy tắc nào bật nó và từ số nào, Owner kiểm lại được.
4. Về Handbook (PILOT-01): số lần agent báo "xong" sai = 0.

## Must-have
Nhập B01, B02, B03 (VAS) cho ít nhất 2 năm → ra bảng chỉ số, Altman Z, Beneish M, Piotroski F và danh sách cờ cảnh báo kèm lý do.

## Alternatives considered
- MISA AMIS / SME.NET — có dashboard chỉ số và tô đỏ chỉ số vượt ngưỡng — chỉ cho dữ liệu nằm trong phần mềm kế toán của chính doanh nghiệp; không có Z/M/F; trả phí theo gói.
- Fathom, Spotlight Reporting, Syft — báo cáo, KPI, dự báo cho cố vấn — kết nối Xero/QuickBooks, không theo VAS, trả phí hằng tháng, dữ liệu lưu ở nước ngoài.
- Excel tự làm / nhờ Claude trong chat — linh hoạt, 0 đồng — không lặp lại được, dễ sai, không có bộ quy tắc cố định.
- Kết luận: không công cụ nào phủ "VAS + Z/M/F + bộ cờ riêng + chạy trên máy" ở chi phí 0. Lý do chính để tự làm vẫn là chạy thử Handbook (WP-07).

## Assumptions
- Nhập liệu đủ nhanh (dán từ bảng trên mạng hoặc Excel) để Owner chịu dùng **(riskiest)** — chưa kiểm; kiểm ở G1 bằng một công ty thật.
- Z, M, F xây trên dữ liệu doanh nghiệp Mỹ vẫn có ích như tín hiệu cảnh báo cho doanh nghiệp Việt Nam (không phải kết luận) — chấp nhận, ghi rõ trên kết quả.
- B03 theo phương pháp gián tiếp có dòng khấu hao; nếu là phương pháp trực tiếp thì Owner nhập khấu hao từ thuyết minh — kiểm ở G1.
- Mẫu báo cáo: thông tư nào đang hiệu lực cho năm tài chính 2025–2026 (TT200 hay thông tư thay thế, TT133 cho DN nhỏ) [ASSUMPTION, chưa kiểm] — kiểm ở G1.

## Constraints
0 đồng/tháng; không hosting, không đăng nhập; chạy offline trên Windows 10. Bản này chỉ dùng số liệu công khai của công ty niêm yết hoặc số bịa; không đưa báo cáo của khách hàng vào (nếu muốn, phải xếp tầng lại vì là dữ liệu tài chính của người khác). Không phải công cụ gợi ý mua bán cổ phiếu.

## Rough size
Bản đầu khoảng 5 tính năng: mẫu nhập 3 báo cáo (tối đa 5 năm); bảng chỉ số (thanh khoản, đòn bẩy, hiệu quả, vốn lưu động, biên lợi nhuận, dòng tiền); Altman Z (chọn biến thể theo loại DN); Beneish M; Piotroski F; bộ cờ cảnh báo (khoảng 10–15 quy tắc); trang kết quả in được. Ước 4–6 phiên (G1–G2 gộp 1 phiên, G3 1 phiên, làm và kiểm 2–4 phiên). Chi phí định kỳ 0.

## Open questions
- Owner có sẵn bộ quy tắc cờ cảnh báo riêng không, hay dùng bộ Claude đề xuất ở G1 rồi sửa?
- ~~Chọn 3 công ty niêm yết nào làm dữ liệu chạy thử?~~ Đã chốt 2026-11-19: PHP, VIC, HPG (MBB bị thay vì là ngân hàng, mô hình không áp dụng).
