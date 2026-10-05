# Lấy cue phụ đề từ timedtext của player

Status: Accepted
Date: 2026-10-05
Scope: Nguồn phụ đề, đồng bộ cue và thời điểm dịch của tiện ích phụ đề song ngữ YouTube

## Context

Đọc chữ đang hiện trong DOM `.ytp-caption-segment` cho từng từ một với phụ đề tự động, nên câu nguồn không trọn vẹn và bản dịch luôn đến sau câu hiển thị. Để hiện EN và VI cùng lúc cần có toàn bộ cue kèm mốc thời gian trước khi phát. Request `/api/timedtext` tự gọi từ ngoài player trả về rỗng vì thiếu tham số ký của player; chỉ response mà chính player tải có nội dung.

## Decision

Một content script chạy ở MAIN world tại `document_start` bọc `fetch` và `XMLHttpRequest` để lấy body json3 của các request `/api/timedtext` do player gửi, rồi chuyển sang content script chính qua `window.postMessage`.
Content script chính chỉ nhận track tiếng Anh gốc (không có `tlang`) của đúng video đang xem, dựng danh sách cue (phụ đề ASR được ghép lại từ từng từ thành cue theo dấu câu, khoảng nghỉ và độ dài), dịch trước toàn bộ cue bằng Translator API theo thứ tự gần vị trí phát nhất và hiển thị cặp EN+VI theo `video.currentTime`.
Đường đọc DOM hiện có giữ nguyên làm phương án dự phòng khi chưa có cue từ player.

## Constraints

- Cue và bản dịch chỉ nằm trong bộ nhớ theo video; không lưu xuống storage và không gửi ra ngoài.
- Không tự gọi `/api/timedtext` và không tự bật phụ đề thay người dùng; người dùng vẫn phải bật track tiếng Anh để player tải cue.
- Không thêm quyền ngoài `host_permissions` hiện có.
- Dịch vẫn chạy trong trang (Translator API không có trong service worker) và vẫn cần user gesture khi Chrome yêu cầu.
- Kết quả dịch đến muộn sau khi đổi video hoặc tắt lớp phủ phải bị bỏ.
- Gate kỹ thuật trong proposal vẫn áp dụng cho nguồn cue mới.

## Consequences

- Positive: Câu EN trọn vẹn, bản dịch có sẵn trước khi tới câu; pause, tua đúng theo thời gian video; không còn bản dịch cũ kéo dài sang câu mới.
- Negative: Phụ thuộc endpoint, định dạng và cách bọc request nội bộ của YouTube nên có thể hỏng khi YouTube đổi; request của player có thể trả body rỗng trong phiên không được tin cậy (ví dụ trình duyệt tự động hóa), khi đó tiện ích dùng đường DOM; ASR không có dấu câu bị cắt cue theo khoảng nghỉ/độ dài nên chất lượng dịch có thể thấp hơn câu hoàn chỉnh.

## Alternatives considered

- Tự fetch `baseUrl` của track: trả 200 với body rỗng vì thiếu tham số ký của player.
- Đọc `performance` resource entries rồi fetch lại: chưa kiểm chứng việc refetch có được chấp nhận.
- Scrape/gọi API transcript của YouTube: UI hoặc API nội bộ mong manh hơn; để dự phòng nếu hook không ổn.
- Dùng bản dịch `tlang=vi` của YouTube: trái quyết định dùng Translator API cục bộ làm engine duy nhất.

## References

- [Quyết định stack](2026-09-27-lightweight-chrome-extension-stack.md)
- [Proposal và gate kỹ thuật](../proposals/youtube-bilingual-subtitles/proposal.md)
