<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: YouTube Bilingual Subtitles
description: Phụ đề song ngữ đối chiếu ngay trong khung phát YouTube
---

# Design System: YouTube Bilingual Subtitles

## Overview

**Creative North Star: "Đối chiếu ở mép khung hình"**

Hệ giao diện lấy cảm hứng từ trang văn bản song ngữ có lề chú giải, nhưng sống bên trong video chứ không nằm ngoài trình phát. Hai dòng EN và VI tạo một nhịp đọc ổn định, dễ đối chiếu trong lúc mắt vẫn theo dõi hình. Lớp phủ chỉ chiếm phần diện tích cần thiết, gần vùng phụ đề quen thuộc của YouTube và còn hiển thị khi xem toàn màn hình.

Chữ là nhân vật chính; vật liệu nền chỉ hỗ trợ đọc trên cảnh tối lẫn sáng. Popup và trang cài đặt sau này tiếp tục cùng ngôn ngữ phân cấp thông tin, không biến thành một dashboard riêng biệt. Chuyển trạng thái chính xác hơn hiệu ứng gây chú ý: câu đang đọc đứng yên; khi cue đổi, nội dung mới thay ngay nội dung cũ.

**Key Characteristics:**
- Hai dòng nguồn và dịch liên kết bằng thứ bậc chữ, không bằng hai khối lớn cạnh tranh với video.
- Nhịp lề mảnh và một dấu trạng thái nhỏ giúp nhận biết hệ thống mà không che hình.
- Tương phản thích ứng với cảnh video; thao tác điều chỉnh thuộc popup/cài đặt, không lấn lên câu phụ đề.

## Colors

Chiến lược màu tiết chế: nền than trung tính, chữ sáng dịu và một sắc lạnh rất ít dùng cho trạng thái hoặc điểm nhấn điều khiển. Cảnh video luôn là lớp màu chủ đạo; overlay không nhuộm hay làm tối toàn bộ khung hình. Giá trị màu và ngưỡng tương phản cụ thể **[to be resolved during implementation]** sau khi thử trên cảnh sáng, tối và nhiều màu.

**The Video-First Rule.** Không dùng mảng màu bão hòa hoặc tấm nền lớn chỉ để làm phụ đề nổi bật; ưu tiên chữ, viền chữ và nền cục bộ khi cần giữ khả năng đọc.

## Typography

Chọn một họ sans dễ đọc ở kích cỡ phụ đề và hiển thị đầy đủ dấu tiếng Việt; nguồn EN và bản dịch VI khác nhau bằng trọng lượng, độ sáng và khoảng cách có kiểm soát, không bằng kiểu chữ trang trí. Cặp font, cỡ và chiều cao dòng cụ thể **[to be resolved during implementation]**; cần thử ở kích thước player thường, rạp và toàn màn hình.

**The Fixed Reading Point Rule.** Không làm chữ đang đọc trôi, lật ô hoặc thay đổi vị trí chỉ để báo cue mới; chuyển câu phải nhanh và giữ điểm nhìn ổn định.

## Layout

Overlay nằm **bên trong khung video**, gần vùng phụ đề YouTube, không ở ngoài player hay dưới trang. Đặt cặp EN/VI theo trục dọc trong một vùng gọn có khoảng cách an toàn với điều khiển phát và cạnh khung; khi kích thước player thay đổi hoặc chuyển toàn màn hình, vùng này vẫn thuộc khung video. Giữ dòng nguồn dễ nhận diện và dòng dịch gần đủ để đối chiếu; bản dịch hoặc trạng thái đang dịch dùng cùng một vị trí, không đẩy các phần khác của trang YouTube.

Cho phép điều chỉnh kích thước, vị trí và độ tương phản theo phạm vi MVP đã được phê duyệt. Bố cục popup/cài đặt kế thừa cùng thứ bậc chữ và sự tiết chế không gian nhưng không sao chép bố cục overlay. Kích thước, safe area và ngưỡng co giãn cụ thể **[to be resolved during implementation]**.

## Elevation & Depth

Phân tách với video bằng tương phản cục bộ, viền/chút bóng chữ hoặc nền mờ giới hạn ngay sau chữ khi cảnh phức tạp; không dựng một tấm kính lớn phủ ngang khung hình. Ngữ pháp độ sâu và độ mờ cụ thể **[to be resolved during implementation]**.

## Shapes

Ưu tiên dải gọn với cạnh mềm vừa đủ để nền đọc không giống hộp thoại. Nét lề/nhịp phân chia mảnh hơn độ dày nét chữ; hình học chính xác **[to be resolved during implementation]**.

## Do's and Don'ts

### Do:
- **Do** đặt overlay trong khung phát để nó còn hiển thị ở chế độ toàn màn hình.
- **Do** giữ câu EN và VI ở hai dòng có quan hệ rõ; thay bản dịch cũ bằng trạng thái phù hợp khi câu nguồn đổi.
- **Do** thử độ đọc và mức che hình trên nhiều cảnh video trước khi chốt token.

### Don't:
- **Don't** đặt phụ đề ngoài video hoặc tạo bảng điều khiển phủ lên vùng đọc.
- **Don't** dùng hiệu ứng chữ chuyển động, chớp sáng hoặc trang trí làm người xem mất điểm nhìn khi đọc.
- **Don't** giả định một màu chữ hoặc một mức nền duy nhất luôn đọc được trên mọi cảnh.
