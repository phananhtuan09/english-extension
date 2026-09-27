---
version: 1
slug: "extension-overlay"
primary_target: "extension/overlay"
related_targets: []
---

# Overlay song ngữ trên video YouTube

Mode: Operate. Phạm vi: giao diện lớp phủ trong khung phát YouTube; chưa triển khai.

Người xem cần đối chiếu câu EN đang phát với bản dịch VI mà vẫn thấy video; có trạng thái đang dịch, tải mô hình và giới hạn hỗ trợ. Ưu tiên không che hình. Bản MVP chưa được chứng minh đạt gate kỹ thuật của proposal.

## Direction contract

THESIS: Hai dòng đối chiếu trong khung phát, không phải một bảng học ngôn ngữ đặt bên ngoài video.

OWN-WORLD: Chữ sáng dịu trên nền than cục bộ; một sắc lạnh tiết chế cho trạng thái, nhịp lề mảnh, không có hình trang trí tranh vai chính với video.

STORY: Người xem nhận ra ngay câu EN, nhìn xuống VI để hiểu, và biết khi bản dịch đang chờ hoặc không khả dụng; video không bị gián đoạn.

FIRST VIEWPORT: Bên trong player, ở vùng phụ đề quen thuộc trên thanh điều khiển: EN ở trên, VI hoặc trạng thái ngay dưới; lớp nền chỉ ôm vùng chữ. Khi toàn màn hình, vùng đọc vẫn ở trong video.

FORM: Trang đối chiếu song ngữ chuyển thành dải phụ đề nội khung, hướng thứ 6 trong danh sách bảy hình thức; seed key 1301c01c. Chuyển câu theo nhịp cue, không di chuyển chữ đang đọc.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Chưa quyết: font, mã màu, kích thước, safe area và cách triển khai trên player thực; xác nhận bằng code và kiểm tra runtime trước khi ghi token chuẩn.
