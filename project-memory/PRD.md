# PRD: Financial Health Check (bản nội bộ)

Version 0.2 · Date 2026-11-19 · Tier T1 · Status: approved (G1, 2026-11-19, D-002)
Nguồn: `BRIEF.md` (G0 duyệt 2026-11-19, D-001) · Công thức chi tiết: `features/001-metrics-and-scores/spec.md` · Bộ cờ: `FLAG_RULES.md`

## Goal
Owner đánh giá nhanh "sức khoẻ tài chính" của một doanh nghiệp từ 3 báo cáo tài chính VAS, cho kết quả lặp lại được và kiểm lại được từng số.
Thước đo thành công (từ BRIEF): (1) chỉ số, Z, M, F khớp bảng Excel Owner tự làm với 3 công ty PHP, VIC, HPG, sai khác chỉ do làm tròn; (2) nhập 3 báo cáo cho 2 năm ≤ 20 phút; (3) mỗi cờ ghi rõ quy tắc và số đã dùng; (4) PILOT-01: số lần agent báo "xong" sai = 0.

## Users
Một người dùng: Owner, trên máy cá nhân Windows, không cần mạng khi dùng.

## Requirements

### REQ-001 Nhập báo cáo tài chính
Là Owner, tôi muốn nhập B01, B02, B03 (gián tiếp) của một doanh nghiệp cho 2 đến 5 năm, để có dữ liệu tính toán mà không phải gõ lại mỗi lần.
Priority: MVP · Source: BRIEF "Must-have", "Rough size"
- AC-001.1 Cho công ty "Thử A" năm 2025 với Tổng TS 1.000 và Tổng nguồn vốn 1.000, khi Owner nhập xong và lưu, thì dữ liệu được giữ lại; mở lại lần sau thấy đúng các số đó.
- AC-001.2 Cho một năm chỉ có số liệu ở cột "số đầu năm" của báo cáo năm sau, khi Owner nhập, thì năm đó được tính như một năm có Bảng cân đối (không cần B02, B03 của năm đó).
- AC-001.3 Cho Owner dán một khối số từ bảng tính (cột tên dòng + cột số), khi dán, thì các số vào đúng dòng theo **tên dòng** (không chỉ theo mã số), và dòng không nhận ra được liệt kê để Owner chọn tay.
- AC-001.4 Đơn vị: Owner chọn đồng, triệu hoặc tỷ cho mỗi lần nhập; kết quả hiện cùng đơn vị đã chọn.
- AC-001.5 Cho ô để trống, khi tính, thì ô đó là "thiếu", không coi là 0; số 0 chỉ khi Owner nhập 0 hoặc dấu "-".

### REQ-002 Chọn mẫu báo cáo theo năm (TT200 / TT99)
Là Owner, tôi muốn mỗi năm được gắn đúng mẫu báo cáo (TT200 cho năm tài chính bắt đầu trước 01/01/2026, TT99/2025 từ 01/01/2026), để số không vào nhầm dòng khi mã số đổi.
Priority: MVP · Source: BRIEF "Assumptions" (kiểm ở G1, kết quả ở mục "Kiểm thông tư" dưới đây)
- AC-002.1 Cho năm tài chính 2025, khi nhập, thì mặc định là mẫu TT200; năm 2026 mặc định TT99; Owner đổi được.
- AC-002.2 Cho báo cáo năm 2026 (TT99) có dòng "Chi phí đi vay" ở B02, khi tính khả năng trả lãi, thì dùng dòng này; với năm 2025 (TT200) dùng dòng "Chi phí lãi vay" (mã 23). Không bao giờ lấy mã 23 của TT99 (là "Chi phí tài chính") làm lãi vay.
- AC-002.3 Dòng mới chỉ có ở TT99 (tài sản sinh học, phải trả cổ tức, lãi/lỗ bán BĐS đầu tư) được nhập và cộng đúng vào tổng của nhóm.

### REQ-003 Kiểm số nhập trước khi tính
Là Owner, tôi muốn được báo ngay khi số nhập lệch, để không tính chỉ số từ số sai (lỗi lệch dòng đã thấy thật trên trang dữ liệu công khai khi thử HPG).
Priority: MVP · Source: phát hiện G1 (mục "Nhập thử")
- AC-003.1 Cho Tổng TS 257.921,58 và Tổng nguồn vốn 257.899,20, khi kiểm, thì báo "Lệch 22,38: tài sản ≠ nguồn vốn" và vẫn cho lưu, nhưng mọi kết quả của năm đó gắn nhãn "số chưa cân".
- AC-003.2 Cho các dòng con của "Phải thu ngắn hạn" cộng lại khác dòng tổng, khi kiểm, thì báo lệch kèm tên nhóm.
- AC-003.3 Cho dòng "Dự phòng ..." nhập số dương, khi kiểm, thì cảnh báo "dự phòng thường là số âm, có thể lệch dòng".
- AC-003.4 Cho LNTT ở B02 khác "Lợi nhuận trước thuế" ở đầu B03, khi kiểm, thì báo lệch.

### REQ-004 Bảng chỉ số tài chính
Là Owner, tôi muốn bảng chỉ số theo năm (thanh khoản, đòn bẩy, hiệu quả, vốn lưu động, biên lợi nhuận, dòng tiền), để xem xu hướng nhiều năm trên một trang.
Priority: MVP · Source: BRIEF "Rough size" · Danh sách và công thức: spec §2
- AC-004.1 Cho HPG 2025: TSNH 103.682,04; Nợ NH 94.208,65, khi tính, thì Thanh toán hiện hành = 1,10.
- AC-004.2 Cho một chỉ số có mẫu số bằng 0 hoặc thiếu, khi tính, thì ô hiện "Không tính được: <dòng thiếu>", không hiện 0 hay lỗi.
- AC-004.3 Mỗi ô chỉ số mở ra được công thức và các số đã dùng.

### REQ-005 Altman Z theo loại doanh nghiệp
Là Owner, tôi muốn điểm Altman Z dùng đúng biến thể cho loại doanh nghiệp, để không đánh giá công ty dịch vụ bằng công thức của công ty sản xuất.
Priority: MVP · Source: BRIEF "Must-have" · Công thức: spec §3
- AC-005.1 Cho công ty gắn loại "sản xuất", khi tính, thì dùng Z' (5 biến, giá trị sổ sách); loại "phi sản xuất / dịch vụ / đa ngành" dùng Z'' (4 biến). Kết quả ghi tên biến thể và vùng (an toàn / xám / nguy hiểm) theo ngưỡng của biến thể đó.
- AC-005.2 Cho công ty gắn loại "ngân hàng, bảo hiểm, chứng khoán", khi tính, thì ghi "Không áp dụng".

### REQ-006 Beneish M
Là Owner, tôi muốn điểm Beneish M (8 biến), để có tín hiệu về khả năng làm đẹp lợi nhuận.
Priority: MVP · Source: BRIEF "Must-have" · Công thức: spec §4
- AC-006.1 Cho chỉ có 1 năm số liệu, khi tính, thì ghi "Cần 2 năm".
- AC-006.2 Kết quả hiện cả 8 biến con (DSRI, GMI, AQI, SGI, DEPI, SGAI, TATA, LVGI) để Owner thấy biến nào đẩy điểm lên.

### REQ-007 Piotroski F
Là Owner, tôi muốn điểm Piotroski F (0–9) kèm từng tiêu chí đạt / không đạt, để thấy nhanh mặt nào đang yếu.
Priority: MVP · Source: BRIEF "Must-have" · Công thức: spec §5
- AC-007.1 Cho một tiêu chí thiếu số, khi tính, thì tiêu chí đó ghi "Không tính được" và điểm hiện dạng "6/8 tiêu chí tính được", không tự cho 0.

### REQ-008 Cờ cảnh báo kèm lý do
Là Owner, tôi muốn danh sách cờ Đỏ / Vàng theo bộ quy tắc trong `FLAG_RULES.md`, mỗi cờ ghi quy tắc, số đã dùng và ngưỡng, để tôi kiểm lại được.
Priority: MVP · Source: BRIEF "Success measure" 3
- AC-008.1 Cho HPG 2025, Thanh toán hiện hành 1,10, khi chạy bộ cờ (ngưỡng F01 bản 0.1), thì bật F01 Vàng với dòng: "F01 · TSNH 103.682,04 / Nợ NH 94.208,65 = 1,10 · Vàng khi 1,0 – < 1,2".
- AC-008.2 Cho cờ thiếu số liệu, khi chạy, thì ghi "Không tính được" và tên dòng thiếu; không bao giờ ghi "không bật".
- AC-008.3 Cho công ty có lưu ý ngành (bất động sản, đa ngành, hạ tầng), khi hiện kết quả, thì lưu ý ngành hiện ngay cạnh các cờ liên quan.
- AC-008.4 Mọi trang kết quả có câu: "Tín hiệu để hỏi tiếp, không phải kết luận và không phải gợi ý mua bán cổ phiếu".

### REQ-009 Trang kết quả in được
Là Owner, tôi muốn một trang kết quả in hoặc lưu PDF được, để mang vào buổi làm việc.
Priority: MVP · Source: BRIEF "Rough size"
- AC-009.1 Cho kết quả của một công ty 2 năm, khi in ra khổ A4 dọc, thì đủ: tên công ty, các năm, mẫu báo cáo từng năm, bảng chỉ số, Z/M/F, danh sách cờ, câu miễn trừ; không cắt cột.

### REQ-010 Ý kiến kiểm toán (nhập tay)
Là Owner, tôi muốn chọn loại ý kiến kiểm toán cho từng năm, để cờ F18 bật đúng.
Priority: MVP · Source: `FLAG_RULES.md` nhóm G
- AC-010.1 Cho năm 2025 chọn "Ngoại trừ", khi chạy bộ cờ, thì F18 bật Đỏ. Chưa chọn → F18 "Không tính được".

## Non-functional
| ID | Area (ISO/IEC 25010) | Requirement | Target |
|---|---|---|---|
| NFR-001 | Correctness | Kết quả khớp bảng đối chiếu độc lập (D-005: agent làm ở phiên riêng, không đọc mã app; Owner dò 5 số với báo cáo gốc) | Sai khác ≤ 0,01 ở chỉ số và điểm, cho cả 3 công ty |
| NFR-002 | Usability | Thời gian nhập 3 báo cáo × 2 năm | ≤ 20 phút với Owner (đo lại ở G4 bằng đồng hồ) |
| NFR-003 | Reliability | Dữ liệu đã lưu không mất khi đóng máy | 0 lần mất dữ liệu trong pilot |
| NFR-004 | Portability | Chạy trên Windows 10 của Owner, không cần mạng khi dùng | Đạt / không đạt |
| NFR-005 | Cost | Chi phí định kỳ | 0 đồng / tháng; không hosting, không đăng nhập |

## Out of scope
- Ngân hàng, bảo hiểm, chứng khoán (mẫu báo cáo khác; ghi "Không áp dụng").
- Báo cáo của khách hàng thật (phải xếp tầng lại, PRINCIPLES).
- Tự lấy số liệu từ trang web hay dịch vụ dữ liệu (nhập tay / dán).
- Đọc tự động file PDF báo cáo.
- So sánh với trung bình ngành; định giá; gợi ý mua bán.
- Mẫu TT133 (doanh nghiệp nhỏ và vừa): 3 công ty chạy thử đều theo mẫu TT200/TT99.
- Báo cáo quý, bán niên (chỉ báo cáo năm).
- Altman Z bản gốc 1968 (cần giá thị trường cổ phiếu) — xem câu hỏi Q3.

## Kiểm thông tư (G1, 2026-11-19)
- **TT99/2025/TT-BTC** ký 27/10/2025, thay TT200/2014, áp dụng cho năm tài chính bắt đầu từ 01/01/2026 [nguồn thứ cấp: KPMG, MISA; chưa đọc văn bản gốc]. Năm tài chính 2025 vẫn theo TT200.
- B01 đổi tên thành "Báo cáo tình hình tài chính"; nhiều mã số dịch chỗ (thêm tài sản sinh học 150, 230; BĐS đầu tư 230→240; dở dang 240→250; đầu tư dài hạn 250→260; TS dài hạn khác 260→270; thêm "phải trả cổ tức" 313). B02: mã 21 mới (BĐS đầu tư), "Chi phí lãi vay" thành "Chi phí đi vay" và dời mã 23→24; mã 23 nay là "Chi phí tài chính" [MISA, chưa đối chiếu văn bản gốc].
- Hệ quả: nhận dòng theo **tên** và theo mẫu của từng năm (REQ-002); bảng ánh xạ mã số TT99 lấy từ Phụ lục IV văn bản gốc, việc này làm ở G3.

## Nhập thử (G1, 2026-11-19, HPG, trang dữ liệu công khai CafeF)
- Agent lấy được khoảng 80% số cần cho năm 2025 trong khoảng 2 phút. Năm 2024 bản tóm tắt thiếu vay ngắn hạn và dài hạn, lãi vay, khấu hao, dòng tiền kinh doanh; phải mở báo cáo gốc. Đây **không** phải số đo thời gian của Owner (NFR-002 chưa đo).
- Ba bẫy dữ liệu thấy thật: (1) cột "Q4-2025" ở bảng chi tiết dựng theo mẫu TT99 có số đặt lệch dòng (dự phòng phải thu +2.318,28 là số dương); (2) hai màn hình cùng trang lệch nhau 22,38 tỷ ở Tổng TS 2025; (3) cột "Q4-2025" của lưu chuyển tiền tệ thực chất là số cả năm, các cột 2026 là luỹ kế từ đầu năm.
- Hệ quả: nguồn chuẩn để so khớp là báo cáo kiểm toán (PDF) của công ty; trang web chỉ để nhập nhanh và phải qua REQ-003.

## Open questions
Không còn. Q1–Q5 đã trả lời ở G1 (D-002, Owner giữ mọi mặc định):
- Q1 Ngưỡng cờ: giữ FLAG_RULES bản 0.1; hiệu chỉnh sau khi chạy 3 công ty (REQ-008).
- Q2 F10 dùng phải thu khách hàng (B01.131) (REQ-008).
- Q3 Không dùng Altman Z bản gốc 1968; chỉ Z' và Z'' (REQ-005).
- Q4 Không có điểm tổng; đầu trang đếm số cờ Đỏ và Vàng (REQ-008).
- Q5 HPG = sản xuất (Z'); PHP = dịch vụ (Z''); VIC = đa ngành (Z'') (REQ-005).

## Change log
| Date | Change | Decision |
|---|---|---|
| 2026-11-19 | G1 duyệt; ghi câu trả lời Q1–Q5 (không đổi nghĩa yêu cầu nào) | D-002 |
| 2026-11-19 | NFR-001: bảng đối chiếu do agent làm ở phiên riêng thay cho Excel của Owner (Owner: "m tự làm kiểm tra đi"); NFR-002 không đổi | D-005 |

## Quality check before G1
- [x] Every requirement traces to the brief (REQ-002, REQ-003 từ kết quả kiểm ở G1 mà BRIEF yêu cầu).
- [x] Every requirement has a testable criterion with concrete values.
- [x] Edge cases covered for each MVP requirement (thiếu số, mẫu số 0, 1 năm, ngân hàng, số chưa cân).
- [x] No technology or implementation detail.
- [x] NFRs for the tier, each with a target.
- [x] Out-of-scope list present.
- [x] No clarification marker in MVP scope (Q1–Q5 trả lời ở D-002).
- [x] No two requirements contradict each other.
