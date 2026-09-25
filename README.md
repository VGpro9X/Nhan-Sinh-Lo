# Nhân Sinh Lộ

Một game **Life Simulation / Choice-driven Roguelite** nơi mỗi Tân Sinh là một cuộc đời khác. Người chơi không chọn class hay cốt truyện cố định: nghề nghiệp, quan hệ, sức mạnh, cơ duyên và các quyết định va chạm để hình thành nhân sinh.

Tu tiên chỉ là một trong nhiều con đường có thể xuất hiện cùng đời thường, kinh doanh, võ đạo, khoa học, huyền bí, tương lai và các biến cố thế giới.

## Tài liệu
- [MASTER_PLAN.md](./MASTER_PLAN.md) — thiết kế và quy tắc dự án.
- [ROADMAP.md](./ROADMAP.md) — các checkpoint.
- [PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) — trạng thái bàn giao.

## Quy tắc phát triển quan trọng nhất
Mỗi checkpoint hoàn thành phải được build/test, commit lên `main`, deploy GitHub Pages và **dừng lại để người dùng test**. Chỉ tiếp tục checkpoint sau khi được xác nhận.

## Phiên bản test hiện tại
**V0.12 — Biên Niên Sử & Tân Sinh.** Truy cập https://vgpro9x.github.io/Nhan-Sinh-Lo/ để chơi thử. Bản ghi tối đa 24 cuộc đời được giữ trên chính trình duyệt/thiết bị, không đồng bộ đám mây; xóa dữ liệu trình duyệt sẽ xóa bản ghi.

Kiểm thử mã nguồn: `npm run typecheck`, `npm test`, `npm run build`. V0.12 cần người dùng test và duyệt trước khi bắt đầu V0.13.
