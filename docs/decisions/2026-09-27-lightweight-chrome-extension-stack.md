# Lightweight Chrome extension stack

Status: Accepted
Date: 2026-09-27
Scope: Prototype và MVP tiện ích phụ đề song ngữ YouTube trên Chrome desktop

## Context

Sản phẩm mới chưa có scaffold. Người dùng ưu tiên stack nhẹ và nhanh; MVP chỉ cần đọc phụ đề trên YouTube, dịch EN→VI trên thiết bị và hiển thị overlay. Gate kỹ thuật về nguồn phụ đề và trải nghiệm extension vẫn chưa đạt.

## Decision

Dùng Chrome Extension Manifest V3 với JavaScript thuần, HTML và CSS thuần; file tĩnh được đóng gói trực tiếp, không framework UI, TypeScript, thư viện runtime hoặc build step trong bản đầu. Dùng Translator API tích hợp Chrome làm engine dịch duy nhất. Tách phần quan sát caption, đồng bộ cue, dịch và hiển thị theo trách nhiệm; dùng test runner tích hợp Node.js cho logic thuần và thử nghiệm thực trong Chrome cho hành vi extension.

## Constraints

- Overlay phải thuộc khung phát YouTube để hiển thị cả khi toàn màn hình; không đặt ngoài video.
- Không thực hiện dịch trong background service worker vì Translator API không chạy ở Web Worker; xác minh user gesture trong ngữ cảnh thực trước khi quyết định cách khởi tạo translator.
- Chỉ xin quyền cần cho trang YouTube và tính năng hiện có; không thêm dịch vụ dịch ngoài hoặc tải mã thực thi từ xa trong MVP.
- Việc không có build step là lựa chọn ban đầu, không phải lệnh cấm bổ sung công cụ khi có nhu cầu kỹ thuật đã chứng minh.
- Stack này không thay thế các ngưỡng thử nghiệm trước MVP trong proposal.

## Consequences

- Positive: Ít phụ thuộc, đóng gói đơn giản và tránh chi phí framework cho một bề mặt tương tác nhỏ.
- Negative: Phải tự tổ chức module và quản lý giao tiếp giữa popup/content script; nếu nhu cầu mở rộng tăng, có thể cần thêm công cụ build sau khi đánh giá.

## Alternatives considered

- Framework UI và bundler ngay từ đầu: chưa cần thiết cho phạm vi overlay, popup và cài đặt nhỏ của phiên bản đầu.

## References

- [Proposal và gate kỹ thuật](../proposals/youtube-bilingual-subtitles/proposal.md)
