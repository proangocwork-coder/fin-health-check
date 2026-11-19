# D-005 Bảng đối chiếu do agent làm (thay cho Excel Owner tự làm), có biện pháp giữ độc lập

Status: approved · Date: 2026-11-19 · Category: APPROVAL (đổi nghĩa thước đo thành công 1 của BRIEF và NFR-001 đã duyệt ở G1)

**Context:** BRIEF thước đo 1 và PRD NFR-001: kết quả của app phải khớp bảng Excel **Owner tự làm** cho PHP, VIC, HPG. Khi được hỏi bảng này đã bắt đầu chưa, Owner trả lời: "m tự làm kiểm tra đi".

**Hệ quả của thay đổi:** bảng do Owner tự làm là phép thử độc lập: nếu agent hiểu sai một công thức, Owner sẽ tính khác và lộ ra. Nếu cùng một agent vừa viết app vừa làm bảng đối chiếu, một hiểu sai về công thức có thể nằm ở cả hai chỗ và không lộ ra (AI-07 §6: kiểm tra độc lập phải là phiên khác).

**Options:**
- A. Agent làm bảng đối chiếu ở **một phiên riêng không đọc mã của app**, tính trong bảng tính có công thức nhìn thấy được, từ số của báo cáo kiểm toán (PDF) và công thức lấy từ bài báo gốc; Owner chỉ dò lại khoảng 5 con số với báo cáo gốc.
- B. Cùng phiên làm app tự tính lại: nhanh nhất, nhưng gần như không độc lập.
- C. Giữ nguyên: Owner tự làm Excel.

**Decision:** A (RECOMMEND trong phạm vi Owner đã cho phép). Giữ được phần lớn giá trị kiểm tra mà không tốn công Owner.

**Thay đổi kèm theo:**
- NFR-001: "khớp bảng đối chiếu độc lập (D-005)" thay cho "khớp Excel của Owner"; sai khác ≤ 0,01 giữ nguyên.
- Task mới T-014 (bảng đối chiếu, phiên riêng) trước T-013. T-013: so app với bảng đối chiếu; Owner dò 5 số với báo cáo gốc; **thời gian nhập (NFR-002) vẫn do Owner tự bấm giờ**, vì đó là thời gian của Owner, agent không đo thay được.
- RISKS: PR-08 đóng; thêm PR-09 (bảng đối chiếu và app cùng hiểu sai một công thức).

**Running cost:** 0 đồng; tốn thêm khoảng một phiên quota cho T-014.
**Reversibility:** dễ; Owner có thể tự làm Excel bất cứ lúc nào và dùng thêm làm phép thử thứ hai.

**Approval:** Owner, 2026-11-19, nguyên văn: "m tự làm kiểm tra đi" (trả lời câu hỏi: bảng Excel đối chiếu PHP, VIC, HPG đã bắt đầu làm chưa). Chi tiết A (phiên riêng, Owner dò 5 số) là khuyến nghị của agent, báo lại Owner trong cùng lượt.
