# Phase 4 - Frontend học tập và accessibility

## Phạm vi đã triển khai

Phase 4 tập trung vào trang xem bài học video:

- `src/frontend/app/student/videos/[id]/page.tsx`
- `src/frontend/app/globals.css`

## 1. Caption song ngữ trên video

Trang bài học hiện hỗ trợ chọn phụ đề:

- `VI`
- `EN`

Nút chỉ bật khi backend có dữ liệu thật trong `segments_by_language`. Frontend không tự đoán ngôn ngữ và không trộn caption.

## 2. Tùy chọn caption

Đã thêm các tùy chọn:

- Bật/tắt caption.
- Bật/tắt nền caption.
- Chỉnh cỡ chữ.
- Chỉnh line height.
- Chọn vị trí caption: dưới, giữa, trên.
- Đổi nhanh `VI/EN`.

Caption overlay dùng `aria-live="polite"` để hỗ trợ công cụ đọc màn hình ở mức cơ bản.

## 3. Transcript đồng bộ

Transcript panel hiện:

- Tự đổi theo ngôn ngữ caption đang chọn.
- Click từng đoạn để tua video.
- Tự cuộn tới đoạn đang phát.
- Đoạn active có `aria-current`.
- Mỗi dòng transcript là button thật nên có thể focus bằng bàn phím.

## 4. Keyboard navigation

Đã bổ sung phím tắt:

- `Space`: phát/tạm dừng.
- `ArrowRight`: tua tới 5 giây.
- `ArrowLeft`: tua lùi 5 giây.
- `Shift + ArrowRight`: tua tới 10 giây.
- `Shift + ArrowLeft`: tua lùi 10 giây.
- `C`: bật/tắt caption.
- `L`: đổi ngôn ngữ caption.
- `T`: focus đoạn transcript hiện tại.

Các input/form field được bỏ qua để không chặn nhập liệu.

## 5. Reduced motion

Đã thêm CSS `prefers-reduced-motion: reduce` trong `globals.css` để giảm animation/transition toàn cục.

Trang video cũng dùng cờ reduced motion để:

- Tự cuộn transcript bằng `auto` thay vì `smooth`.
- Không hiển thị pulse animation ở dòng transcript active.

## 6. ARIA và focus

Đã bổ sung:

- `role="region"` cho video player.
- `role="tablist"` và `role="tab"` cho panel phải.
- `aria-selected` cho tab.
- `aria-label` cho các nút icon như play, mute, fullscreen, volume, tốc độ phát.
- Focus ring rõ hơn trên transcript item.

## Việc nên kiểm tra thủ công

- Điều hướng toàn bộ trang chỉ bằng bàn phím.
- Caption không che controls ở mobile và desktop.
- Cỡ chữ caption lớn nhất không tràn khỏi video.
- Chế độ `prefers-reduced-motion` trong hệ điều hành.
- Contrast caption trên video sáng/tối khác nhau.

## Việc còn nên làm tiếp

- Chạy Lighthouse và axe DevTools trên trình duyệt thật.
- Thêm test Playwright cho keyboard flow chính.
- Thêm lựa chọn font caption nếu nhóm người dùng khiếm thính cần font dễ đọc hơn.
- Lưu caption settings theo user profile thay vì state tạm trong trang.
