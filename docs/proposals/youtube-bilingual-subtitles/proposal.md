# Chrome extension xem YouTube với phụ đề song ngữ

**Status:** Approved  
**Ngày tạo:** 2026-09-24

**Quyết định của người dùng (2026-09-24):** Ưu tiên không trả phí dịch, bắt đầu MVP với một engine dịch cục bộ, và lấy cặp tiếng Anh sang tiếng Việt (EN→VI) làm cặp ngôn ngữ thiết yếu.

**Ghi nhận phê duyệt (2026-09-27):** Người dùng yêu cầu chuyển proposal này sang Approved.

Phê duyệt ghi nhận hướng đề xuất; không thay thế hoặc đánh dấu đạt các ngưỡng thử nghiệm kỹ thuật trước MVP tại mục “Thử nghiệm cần làm trước MVP”.

## Tóm tắt

Đề xuất xây dựng tiện ích Chrome hiển thị câu phụ đề gốc cùng bản dịch ngay trên video YouTube, cập nhật theo câu phụ đề đang phát.

MVP dịch phụ đề tiếng Anh sang tiếng Việt (EN→VI) bằng Translator API tích hợp trong Chrome làm engine duy nhất.

Đề xuất giới hạn phiên bản đầu vào trải nghiệm phụ đề song ngữ; từ điển và lưu từ mới là hướng mở rộng sau khi luồng phụ đề hoạt động ổn định.

Trước khi cam kết phạm vi MVP, cần làm một thử nghiệm kỹ thuật để xác nhận tiện ích có thể lấy ổn định câu phụ đề và thời điểm hiển thị trên YouTube cho các video thông thường.

## Vấn đề và người dùng

Người học ngoại ngữ thường phải chọn giữa việc xem phụ đề gốc để luyện nghe và phụ đề bằng ngôn ngữ quen thuộc để hiểu nội dung.

Việc chuyển qua lại giữa các ngôn ngữ hoặc dừng video để tra cứu làm gián đoạn việc xem.

Tiện ích hướng tới người xem YouTube muốn hiểu nội dung bằng bản dịch trong khi vẫn nhìn thấy câu gốc để học từ vựng và cách diễn đạt.

## Mục tiêu

- Hiển thị câu gốc và bản dịch cùng lúc trên video.
- Cập nhật bản dịch tương ứng với câu đang được phát, kể cả khi video tạm dừng hoặc người xem tua.
- Dịch phụ đề tiếng Anh sang tiếng Việt trong MVP; các phiên bản sau có thể thêm cặp khác mà không đổi luồng phụ đề chính.
- Xử lý câu phụ đề cục bộ theo mặc định; nếu bổ sung dịch vụ từ xa, báo rõ nhà cung cấp trước khi gửi nội dung.

## Đề xuất

Xây dựng tiện ích cho YouTube trên Chrome, dùng giao diện trang video hiện tại để đọc câu phụ đề đang hiển thị và thời điểm cập nhật, sau đó đặt bản dịch trong một lớp phủ đồng bộ với trình phát.

MVP chỉ cung cấp một engine: Translator API có sẵn trong Chrome, chạy bằng mô hình trên thiết bị để tránh phí API và không gửi nội dung phụ đề tới dịch vụ dịch bên ngoài.

Luồng xử lý phụ đề được thiết kế độc lập với engine cụ thể: MVP nối luồng đó với Translator API; các phiên bản sau có thể cho người dùng chuyển giữa các engine mà không thay đổi cách phụ đề được đọc và hiển thị.

Nếu sau này bổ sung dịch vụ đám mây, giao diện cần cho người dùng biết nhà cung cấp nào nhận nội dung phụ đề và giới hạn miễn phí nào áp dụng.

Luồng đọc phụ đề từ giao diện YouTube là giả thuyết cần kiểm chứng, vì giao diện trang có thể thay đổi và hành vi có thể khác giữa phụ đề do người tạo video tải lên, phụ đề tự động, video trực tiếp và các thiết lập phụ đề khác.

Nếu thử nghiệm không xác nhận được nguồn phụ đề ổn định cho video phổ thông, cần thu hẹp hỗ trợ hoặc xem xét lại đề xuất trước khi bắt đầu xây dựng MVP.

## Tech stack cho prototype và MVP (chốt 2026-09-27)

- **Nền tảng:** Chrome Extension Manifest V3 trên Chrome desktop. Content script chạy trên trang xem YouTube để quan sát câu phụ đề đang hiển thị và đặt overlay **bên trong khung phát**, kể cả khi toàn màn hình; popup nhỏ dành cho thao tác bật/tắt và các cài đặt cần thiết.
- **Giao diện và logic:** JavaScript thuần, HTML và CSS thuần; dùng API trình duyệt/Chrome có sẵn. Không dùng React, framework UI, TypeScript hoặc thư viện runtime trong phiên bản đầu. Chia mã theo trách nhiệm (đọc caption, đồng bộ cue, dịch, hiển thị, cài đặt) thay vì thêm framework để tổ chức mã.
- **Đóng gói:** đóng gói file tĩnh cùng extension, chưa cần bundler hoặc build step cho bản đầu. Chỉ bổ sung công cụ build nếu ràng buộc thực tế của extension hoặc kích thước mã khiến cách đóng gói trực tiếp không còn phù hợp; không tải mã thực thi từ xa.
- **Dịch:** Translator API tích hợp Chrome trong ngữ cảnh extension phù hợp, không gọi dịch trong background service worker vì API không chạy ở Web Worker. Khởi tạo bằng tương tác người dùng khi Chrome yêu cầu; xử lý rõ tình huống chưa tải model, không hỗ trợ và kết quả đến muộn. Không thêm SDK hay dịch vụ dịch ngoài cho MVP.
- **Quyền và dữ liệu:** giới hạn quyền vào trang YouTube cần cho chức năng, không xin host permission cho dịch vụ bên ngoài; chỉ lưu lựa chọn bật/tắt và cài đặt hiển thị bằng API lưu trữ của Chrome khi cần, không lưu lịch sử câu phụ đề.
- **Kiểm thử:** tách phần xử lý cue/trạng thái khỏi DOM để có thể thử bằng test runner tích hợp Node.js; kiểm tra overlay, fullscreen, user gesture và Translator API bằng thử nghiệm thực trong Chrome. Không xem unit test là bằng chứng đã vượt gate 20 video trong proposal.

Lựa chọn này ưu tiên gói extension nhỏ, ít phụ thuộc và thời gian khởi động thấp; **không phải cam kết số đo hiệu năng** khi chưa kiểm chứng. Các ngưỡng và điều kiện trước MVP ở mục “Thử nghiệm cần làm trước MVP” giữ nguyên. Quyết định kiến trúc được ghi tại [docs/decisions](../../decisions/2026-09-27-lightweight-chrome-extension-stack.md).

## Phạm vi phiên bản đầu

### Bao gồm

- Hoạt động trên trang xem video YouTube trong Chrome.
- Hiển thị câu gốc và bản dịch trong một lớp phủ có thể bật hoặc tắt.
- Dịch phụ đề tiếng Anh sang tiếng Việt (EN→VI) bằng duy nhất Translator API tích hợp trong Chrome khi cặp này khả dụng.
- Không hiển thị lựa chọn engine trong MVP; kiến trúc giữ khả năng thêm và chuyển engine ở phiên bản sau.
- Đồng bộ câu hiển thị với trạng thái phát, tạm dừng và tua của video.
- Trạng thái dễ hiểu khi video không có phụ đề tiếng Anh, Chrome không hỗ trợ Translator API hoặc cặp EN→VI, hay mô hình cục bộ đang tải.
- Cài đặt kích thước, vị trí và độ tương phản của phụ đề để không che nội dung quá mức.
- Chỉ xin quyền truy cập trang cần cho lớp phủ; không cần quyền kết nối tới dịch vụ dịch bên ngoài cho phương án được khuyến nghị.

### Chưa bao gồm

- Từ điển tra cứu khi bấm vào một từ.
- Lưu từ vào danh sách từ vựng, ôn tập hoặc đồng bộ giữa thiết bị.
- Tạo phụ đề bằng nhận dạng giọng nói khi video không cung cấp phụ đề.
- Hỗ trợ nền tảng video ngoài YouTube.
- Cam kết hỗ trợ mọi loại video, mọi ngôn ngữ hoặc mọi nhà cung cấp dịch.

## Luồng người dùng chính

1. Người dùng cài tiện ích và mở video YouTube có phụ đề.
2. Người dùng chọn track phụ đề tiếng Anh trong YouTube và bật lớp phủ song ngữ EN→VI.
3. Tiện ích coi track tiếng Anh đang hiển thị là đầu vào, giữ câu đó ở lớp trên và yêu cầu engine MVP dịch sang tiếng Việt. Nếu track đã được YouTube tự dịch sang tiếng Anh, tiện ích dịch tiếp văn bản đang hiển thị và không khẳng định đó là phụ đề gốc của video.
4. Khi có câu mới, bản dịch cũ bị xóa ngay; câu nguồn vẫn hiện kèm trạng thái đang dịch cho tới khi bản dịch tương ứng sẵn sàng.
5. Nếu bản dịch hoàn tất sau khi câu đã đổi hoặc video đã tua, tiện ích bỏ kết quả cũ và không gắn nó vào câu hiện tại.
6. Khi video tạm dừng, giữ cặp câu hiện tại; khi tua, cập nhật theo câu tại vị trí mới; khi không có câu phụ đề đang hoạt động, xóa cả bản dịch cũ khỏi lớp phủ.
7. Nếu phụ đề tiếng Anh không khả dụng hoặc Chrome không hỗ trợ Translator API/cặp EN→VI, câu nguồn (nếu có) vẫn hiển thị và tiện ích báo giới hạn mà không làm video dừng phát.

## Khả thi và ràng buộc đã xác minh

- Chrome hỗ trợ content script đọc và sửa DOM của trang trong một isolated world; việc này tạo cơ sở kỹ thuật cho lớp phủ và quan sát phụ đề hiển thị, nhưng không đảm bảo giao diện YouTube là nguồn phụ đề ổn định. [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), kiểm tra ngày 2026-09-24.
- Chrome yêu cầu tiện ích chỉ xin quyền tối thiểu cần cho chức năng hiện có; có thể dùng quyền tùy chọn để xin quyền truy cập bổ sung khi người dùng bật một khả năng. [Chrome permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions), kiểm tra ngày 2026-09-24.
- Chrome Web Store yêu cầu Manifest V3 đóng gói logic thực thi trong tiện ích; gọi dịch vụ từ xa được phép, nhưng tải và thực thi mã từ xa bị hạn chế. Tích hợp nhà cung cấp dịch vì vậy nên dùng yêu cầu dịch vụ dữ liệu qua API, không tải mã thực thi từ nhà cung cấp. [Manifest V3 requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements), kiểm tra ngày 2026-09-24.
- YouTube Data API có thể liệt kê và tải caption track, nhưng nội dung từ `captions.list` không chứa câu phụ đề và thao tác tải yêu cầu OAuth. Tài liệu `captions.download` yêu cầu người dùng có quyền chỉnh sửa video, nên API này không phải giải pháp chung để lấy phụ đề của video bất kỳ. [Captions resource](https://developers.google.com/youtube/v3/docs/captions), [captions.download](https://developers.google.com/youtube/v3/docs/captions/download), kiểm tra ngày 2026-09-24.
- Chrome ghi Translator API có trong Chrome Stable và dùng được trong extension, nhưng API không chạy trong Web Worker. Thử nghiệm cần xác nhận API hoạt động trong ngữ cảnh extension phù hợp với trải nghiệm video; không nên giả định background service worker có thể thực hiện dịch. [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api), [Extensions and AI](https://developer.chrome.com/docs/extensions/ai), kiểm tra ngày 2026-09-24.
- Có các API REST chính thức để dịch văn bản ở nhiều nhà cung cấp, nhưng phương thức xác thực không đồng nhất. Ví dụ, Azure Translator mô tả endpoint dịch văn bản có xác thực bằng khóa dịch vụ; Google Cloud Translation Basic hỗ trợ API key còn Advanced không hỗ trợ API key. Việc hỗ trợ nhiều dịch vụ vì vậy cần chọn các nhà cung cấp dựa trên khả năng tích hợp và mô hình xác thực, không chỉ chất lượng bản dịch. [Azure Translator REST API](https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/reference/rest-api-guide), [Google Cloud Translation authentication](https://docs.cloud.google.com/translate/docs/authentication), kiểm tra ngày 2026-09-24.
- Dịch câu phụ đề qua dịch vụ bên ngoài có thể gửi nội dung người dùng đang xem tới nhà cung cấp. Chrome Web Store yêu cầu công khai cách thu thập, sử dụng và chia sẻ dữ liệu, đồng thời yêu cầu truyền dữ liệu an toàn. [Chrome Web Store user data policy FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), kiểm tra ngày 2026-09-24.

## So sánh phương án dịch không phát sinh phí dịch vụ bên thứ ba

| Phương án | Chi phí dịch | Khả thi và giới hạn | Đánh giá |
| --- | --- | --- | --- |
| Translator API tích hợp trong Chrome | Không tính phí API theo lượt dịch; mô hình được Chrome tải về và chạy trên thiết bị. Có thể dùng băng thông và tài nguyên máy khi tải/chạy mô hình. | API có trong Chrome Stable từ phiên bản 138 và hỗ trợ tiện ích. Chỉ hoạt động trên Chrome desktop; ngôn ngữ khả dụng theo từng cặp và mô hình cần tải xuống khi dùng lần đầu. | **Khuyến nghị cho MVP** nếu ưu tiên không trả phí dịch và không gửi câu phụ đề tới dịch vụ dịch bên ngoài. Chỉ có một engine do Chrome cung cấp nên chưa đáp ứng yêu cầu hỗ trợ nhiều nhà cung cấp. |
| Mô hình dịch mã nguồn mở chạy cục bộ trong tiện ích | Không có phí API; người dùng chịu dung lượng tải mô hình, lưu trữ và tài nguyên máy. | Transformers.js hỗ trợ chạy một số mô hình trong trình duyệt bằng WebAssembly hoặc WebGPU. Kích thước, tốc độ, chất lượng và giấy phép khác nhau theo mô hình. Một mô hình phổ biến để minh họa giới hạn, NLLB-200 distilled 600M, có khoảng 2.48 GB tệp trên Hub và giấy phép CC-BY-NC-4.0, nên không thể mặc định phù hợp cho sản phẩm thương mại. | Có thể tạo lựa chọn engine cục bộ thứ hai để tiến gần yêu cầu nhiều phương thức, nhưng cần thử nghiệm kích thước, ngôn ngữ, hiệu năng và giấy phép trước khi đưa vào phạm vi MVP. |
| API dịch có gói miễn phí, ví dụ Google Cloud Translation | Có hạn mức miễn phí theo tháng; phần vượt hạn mức bị tính phí. | Google Cloud hiện nêu 500.000 ký tự đầu tiên mỗi tháng miễn phí cho dịch NMT, sau đó có đơn giá theo ký tự. Nội dung được gửi tới nhà cung cấp và dùng API cần thiết lập thông tin xác thực. | Kỹ thuật khả thi và tạo lựa chọn nhà cung cấp thứ hai, nhưng không bảo đảm không phát sinh phí nếu vượt hạn mức; không phù hợp nếu “không trả thêm tiền” là yêu cầu tuyệt đối. |
| Tự vận hành dịch vụ mã nguồn mở | Không trả phí API cho bên thứ ba, nhưng vẫn cần máy chủ, băng thông, vận hành và cập nhật do sản phẩm hoặc người dùng chi trả. | Cho phép kiểm soát triển khai và nhà cung cấp mô hình, nhưng tạo thêm hạ tầng và nghĩa vụ duy trì. | Không chọn cho MVP vì chuyển chi phí sang hạ tầng riêng thay vì loại bỏ chi phí thực tế. |
| Dịch tự động của YouTube | Không có phí API riêng cho người xem. | YouTube cho phép chọn phụ đề và dùng Auto-translate khi có hỗ trợ. Tài liệu mô tả chọn một ngôn ngữ hiển thị; chưa có bằng chứng ở đây rằng nó cung cấp đồng thời cả câu gốc và bản dịch cho lớp phủ ngoài. [YouTube Help: quản lý phụ đề](https://support.google.com/youtube/answer/100078?hl=en), kiểm tra ngày 2026-09-24. | Có thể dùng trực tiếp như phương án miễn phí không cần extension, nhưng chưa chứng minh được yêu cầu song ngữ và kiểm soát giao diện của sản phẩm. |

### Hướng đề xuất sau khi so sánh

MVP dùng Translator API của Chrome làm engine dịch duy nhất để tránh phí dịch theo lượt và không gửi phụ đề tới nhà cung cấp dịch bên ngoài.

Yêu cầu nhiều dịch vụ dịch không thuộc MVP; chỉ xem xét thêm engine khác sau này nếu thử nghiệm cho thấy lợi ích về ngôn ngữ hoặc chất lượng đủ bù cho dung lượng tải, giấy phép và độ phức tạp.

Luồng đọc track nguồn, đồng bộ câu và hiển thị không được gắn với Translator API cụ thể; MVP chỉ cấu hình một engine khả dụng, còn việc chọn hoặc chuyển engine dành cho phiên bản sau.

Không dùng gói miễn phí của API thương mại làm bảo đảm chi phí bằng không; nếu sản phẩm vẫn cần nhiều nhà cung cấp dịch, phải chấp nhận hoặc giới hạn rõ ràng nguy cơ vượt quota và phát sinh phí.

### Bằng chứng và giới hạn

Chrome ghi Translator API có trong Chrome Stable từ phiên bản 138 và hỗ trợ extension; tài liệu cho biết API sử dụng mô hình cục bộ, tải language pack theo yêu cầu, và Translator API không hỗ trợ Chrome trên di động. [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis), [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api), kiểm tra ngày 2026-09-24.

Transformers.js mô tả chạy mô hình trong trình duyệt bằng ONNX Runtime, WASM hoặc WebGPU, đồng thời tài liệu khuyến nghị mô hình lượng tử hóa để giảm băng thông và chi phí tài nguyên. [Transformers.js](https://github.com/huggingface/transformers.js), [tài liệu pipeline và model cache](https://github.com/huggingface/transformers.js/blob/main/packages/transformers/docs/source/pipelines.md), kiểm tra ngày 2026-09-24.

Model card NLLB-200 distilled 600M ghi nhận khoảng 2.48 GB dữ liệu model và giấy phép CC-BY-NC-4.0; đây là ví dụ cho thấy cần kiểm tra riêng kích thước và điều kiện cấp phép cho từng model. [NLLB-200 distilled 600M model card](https://huggingface.co/facebook/nllb-200-distilled-600M), kiểm tra ngày 2026-09-24.

Google Cloud Translation hiện công bố 500.000 ký tự NMT đầu tiên mỗi tháng miễn phí và tính phí cho phần vượt hạn mức; giá và hạn mức có thể thay đổi. [Google Cloud Translation pricing](https://cloud.google.com/translate/pricing), kiểm tra ngày 2026-09-24.

## Thử nghiệm cần làm trước MVP

Thử nghiệm trên 20 video công khai dạng video theo yêu cầu: 10 video có phụ đề do người tạo cung cấp và 10 video có phụ đề tự động.

Với mỗi loại phụ đề, kiểm tra ít nhất 10 video và tối thiểu 100 câu liên tiếp mỗi video; bao gồm phát, tạm dừng, tua tới, tua lui và đổi track nguồn.

Xác nhận Translator API hỗ trợ cặp EN→VI trên Chrome desktop mục tiêu và có thể được gọi trong ngữ cảnh extension phù hợp. Đánh giá khả năng đọc câu đang hiển thị, cập nhật theo trình phát, độ trễ dịch sau khi mô hình đã sẵn sàng và hành vi khi tua.

**Ngưỡng đạt đề xuất:** ít nhất 95% số câu nguồn trong mỗi nhóm video được đọc đúng nội dung và đúng thứ tự; độ trễ dịch ở phân vị 95 không quá 2 giây sau khi mô hình sẵn sàng; và không có bản dịch cũ nào hiển thị sau khi câu nguồn đổi hoặc video được tua.

Việc tải mô hình lần đầu phải hiện trạng thái đang tải, không làm dừng video và không làm treo lớp phủ; thời gian tải được ghi nhận riêng, không gộp vào ngưỡng độ trễ dịch khi mô hình đã sẵn sàng.

Chỉ tiếp tục MVP cho các nhóm phụ đề đạt ngưỡng. Nếu một nhóm không đạt, thu hẹp phạm vi hoặc đổi cách lấy phụ đề; nếu cặp EN→VI không khả dụng trong Chrome hoặc API không dùng được trong ngữ cảnh extension phù hợp, xem lại hướng dịch trước khi triển khai.

## Rủi ro và giả định

- **Nguồn phụ đề:** Khả năng đọc câu phụ đề từ DOM của YouTube chưa được xác nhận và có thể hỏng khi YouTube đổi giao diện. Đây là rủi ro quyết định tính khả thi của MVP.
- **Độ đồng bộ:** Dịch từng câu có thể chậm hơn tốc độ phát; lần đầu dùng còn phải tải mô hình, và việc tua hoặc câu mới đến trước khi bản dịch cũ hoàn tất có thể tạo phụ đề trễ hoặc sai câu.
- **Độ phủ:** Video không có phụ đề khả dụng, video trực tiếp, phụ đề nhiều người nói và ngôn ngữ ít phổ biến có thể không được hỗ trợ nhất quán.
- **Quyền riêng tư:** Câu phụ đề gửi tới dịch vụ bên ngoài có thể chứa nội dung nhạy cảm; phải nêu rõ nơi nhận và cách xử lý dữ liệu.
- **Độ phủ ngôn ngữ:** Chrome Translator API chỉ khả dụng với một số cặp ngôn ngữ trên thiết bị; phải xác minh cặp EN→VI trên Chrome desktop mục tiêu trước khi chốt MVP.
- **Mô hình chạy cục bộ:** Nếu bổ sung model bên thứ ba, cần đánh giá giấy phép, kích thước tải, hiệu năng thiết bị và độ chính xác cho từng cặp ngôn ngữ.
- **Chi phí gói miễn phí:** API thương mại có thể tính phí khi vượt hạn mức miễn phí; không bật mặc định nếu chưa có cách chặn chi phí hoặc sự đồng ý rõ ràng của người dùng.
- **Chính sách nền tảng:** Cần rà soát điều khoản YouTube và chính sách Chrome Web Store trong quá trình thiết kế, đặc biệt nếu phương án lấy phụ đề thay đổi khỏi việc đọc nội dung đang hiển thị.

## Mở rộng sau phiên bản đầu

Sau khi trải nghiệm phụ đề và phương thức dịch được xác nhận, có thể thêm tra nghĩa từ/cụm từ trong câu hiện tại và lưu từ vào danh sách từ vựng cá nhân.

Các khả năng này cần được đánh giá riêng vì chúng làm phát sinh nhu cầu lưu trữ, quản lý dữ liệu học tập và có thể cần đồng bộ giữa thiết bị.

## Nguồn và giới hạn kiểm tra

Tài liệu Chrome, YouTube, Google Cloud và model card trên Hugging Face được dùng để so sánh phương án chạy cục bộ, gói miễn phí tính theo quota và giới hạn tiếp cận caption track.

Spike ngày 2026-09-27 trên Chrome 153 và YouTube profile người dùng đã xác nhận đọc caption English do người tạo cung cấp và English ASR từ DOM trên hai video thử; đã quan sát cập nhật khi phát, pause và tua.

Translator API EN→VI ban đầu báo `downloadable`; sau thao tác người dùng, model tải xong với sự kiện tiến độ 0–100% trong khoảng 4.45 giây và dịch một caption ASR thật trong 27.4 ms. Trong 20 lượt dịch warm tuần tự trên các chuỗi caption ASR thu được từ video, p95 nearest-rank là 20.4 ms. Các kết quả này thuộc page context, không phải extension context.

Caption ASR có thể phát ra nhiều chuỗi DOM tăng dần và chồng lặp trong cùng một cue; cần ổn định hoặc nhóm caption trước khi dịch. Chất lượng dịch chưa được đánh giá có hệ thống.

Spike chưa hoàn tất ngưỡng 10 video creator + 10 video ASR, ít nhất 100 cue mỗi video, độ chính xác nguồn 95%, p95 trên cue hoàn chỉnh, kiểm tra không hiển thị bản dịch cũ trong overlay extension, hoặc cold-download trên profile sạch thứ hai. Vì vậy gate kỹ thuật trước MVP vẫn chưa đạt; không dùng các mẫu thử hạn chế để cam kết độ phủ hay hiệu năng.
