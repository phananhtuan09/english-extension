# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Chrome Extension Manifest V3 trên Chrome desktop; JavaScript, HTML và CSS thuần, không framework UI, TypeScript, thư viện runtime hoặc build step cho bản đầu. Dịch bằng Translator API tích hợp Chrome; thử logic bằng test runner tích hợp Node.js và xác minh runtime trong Chrome. Chỉ thêm công cụ build khi có nhu cầu thực tế. [Quyết định stack](decisions/2026-09-27-lightweight-chrome-extension-stack.md).

## Users

Người xem YouTube trên Chrome desktop muốn vừa hiểu nội dung bằng tiếng Việt vừa nhìn thấy phụ đề tiếng Anh để học từ vựng và cách diễn đạt, không phải liên tục đổi ngôn ngữ hoặc tạm dừng để tra cứu.

## Product Purpose

Hiển thị đồng thời câu phụ đề tiếng Anh đang phát và bản dịch tiếng Việt ngay trên video, để việc theo dõi nội dung và học tiếng Anh không làm gián đoạn trải nghiệm xem.

## Positioning

Ghép câu EN đang hiển thị trên YouTube với bản dịch VI tại chỗ trong một lớp phủ đồng bộ với video; bản MVP dùng Translator API của Chrome để dịch trên thiết bị, không gửi câu phụ đề tới dịch vụ dịch bên ngoài và không phát sinh phí API theo lượt dịch.

## Operating Context

Người dùng mở trang xem video YouTube trong Chrome desktop, chọn track phụ đề tiếng Anh trên YouTube và bật/tắt lớp phủ song ngữ. Phụ đề có thể do tác giả cung cấp hoặc do YouTube tạo tự động; người dùng có thể phát, tạm dừng, tua và đổi track. Cần có thao tác người dùng để khởi tạo dịch khi Chrome yêu cầu user gesture; lần sử dụng đầu có thể phải tải mô hình cục bộ.

## Capabilities and Constraints

- MVP chỉ dành cho trang xem YouTube trên Chrome desktop, cặp EN→VI và một engine dịch: Translator API tích hợp trong Chrome. Không có bộ chọn engine trong MVP.
- Lớp phủ hiển thị câu nguồn và bản dịch tương ứng, có thể bật/tắt và điều chỉnh kích thước, vị trí, độ tương phản để tránh che video quá mức.
- Khi câu nguồn đổi, xóa bản dịch cũ ngay; giữ câu nguồn cùng trạng thái đang dịch. Bỏ kết quả đến muộn không còn khớp câu hiện tại. Khi tạm dừng giữ cặp câu hiện tại, khi tua cập nhật theo vị trí mới, khi không có câu đang hoạt động thì xóa bản dịch cũ.
- Khi không có phụ đề EN, Translator API/cặp EN→VI không khả dụng hoặc mô hình đang tải, cho biết trạng thái dễ hiểu; nếu có câu nguồn vẫn hiển thị và không làm dừng video.
- Chỉ xin quyền truy cập trang cần cho lớp phủ; MVP không cần kết nối tới dịch vụ dịch bên ngoài.
- Không thuộc MVP: tra từ, lưu/ôn từ, đồng bộ thiết bị, nhận dạng giọng nói để tạo phụ đề, nền tảng ngoài YouTube và hỗ trợ mọi video/ngôn ngữ.
- Proposal đã được phê duyệt, nhưng **chưa đạt gate kỹ thuật trước MVP**: phải xác minh nguồn caption và đồng bộ trên 10 video phụ đề tác giả + 10 video phụ đề tự động, ít nhất 100 câu liên tiếp mỗi video, ≥95% câu nguồn đúng nội dung/thứ tự mỗi nhóm, p95 dịch ≤2 giây sau khi mô hình sẵn sàng, không có bản dịch cũ sau đổi câu/tua; đồng thời xác minh EN→VI trong extension và trải nghiệm tải mô hình lần đầu. Nếu nhóm nào không đạt, thu hẹp hỗ trợ hoặc xem lại phương án trước khi cam kết MVP.
- Ngôn ngữ giao diện và tên thương mại vẫn chưa được quyết định.

## Evidence on Hand

- Proposal được phê duyệt: [youtube-bilingual-subtitles/proposal.md](proposals/youtube-bilingual-subtitles/proposal.md). Đây là định hướng sản phẩm, không phải bằng chứng đã vượt qua gate MVP.
- Các thăm dò kỹ thuật trước đây đã quan sát được caption YouTube và Translator API trong một số trường hợp, nhưng chưa đáp ứng bộ thử nghiệm 20 video/100 câu mỗi video, độ chính xác nguồn và trải nghiệm extension đầy đủ. Không dùng các số đo warm trên máy thử như lời hứa hiệu năng phổ quát.
- Chưa có ứng dụng hoàn chỉnh, nhận diện thương hiệu, hình ảnh sản phẩm hoặc lời chứng thực người dùng để sử dụng làm bằng chứng truyền thông.

## Product Principles

- Đặt việc xem video liền mạch lên trước: trạng thái dịch hay giới hạn hỗ trợ không được làm dừng video.
- Giữ câu nguồn và bản dịch khớp nhau; không để kết quả trễ bị hiểu là bản dịch của câu mới.
- Ưu tiên xử lý cục bộ, quyền tối thiểu và minh bạch về bất kỳ việc gửi phụ đề ra ngoài nào trong tương lai.
- Chỉ cam kết độ phủ và hiệu năng sau khi vượt qua các phép thử kỹ thuật đã nêu trong proposal.
