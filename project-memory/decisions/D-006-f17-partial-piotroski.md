# D-006 F17 vẫn bật khi Piotroski chỉ tính được một phần tiêu chí

Status: approved · Date: 2026-11-19 · Category: APPROVAL (làm rõ một quy tắc cờ đã duyệt ở G1)

**Context:** FLAG_RULES 0.2 ghi F17 "F ≤ 3 → Vàng" mà không nói năm chỉ tính được một phần 9 tiêu chí (năm đầu thường 5/9). Phần mềm ghi "Không tính được"; bảng đối chiếu T-014 áp ngưỡng lên điểm một phần. Lộ ra khi so khớp ở T-013.

**Options:** A. Áp ngưỡng ≤ 3 lên điểm đã tính, hiện "x/n tiêu chí tính được" · B. Chỉ xét khi đủ 9 tiêu chí (cách cũ của phần mềm).

**Decision:** A, theo lựa chọn của Owner. Không đổi ngưỡng. Không tiêu chí nào tính được → vẫn "Không tính được".

**Consequence:** năm đầu dễ bật Vàng hơn (HPG 2/5, VIC 3/5 năm 2024 bật; PHP 4/5 không). Agent đã khuyên B vì 2/5 không so được với thang 9 tiêu chí; Owner chọn A.

**Running cost:** 0 · **Reversibility:** dễ (một dòng trong `src/flags.js` và một bài kiểm tra).

**Approval:** Owner, 2026-11-19, nguyên văn "Vẫn bật" (trả lời trong phiên T-014; agent của phiên làm phần mềm đã đọc lại câu trả lời trong lịch sử phiên đó trước khi sửa). Ghi chú trong FLAG_RULES (commit ff337b8).
