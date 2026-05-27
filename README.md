# Shop Khánh — Hướng dẫn deploy lên Vercel

## Cấu trúc project
```
shop-khanh/
├── pages/
│   ├── api/
│   │   ├── products.js   ← API lấy sản phẩm từ Lark Base
│   │   └── image.js      ← API proxy hình ảnh
│   └── index.js          ← Giao diện cửa hàng
├── .env.local             ← Biến môi trường (KHÔNG upload GitHub)
├── package.json
└── README.md
```

---

## Bước 1 — Tạo GitHub repo

1. Vào https://github.com → **New repository**
2. Đặt tên: `shop-khanh` → **Create repository**
3. Upload toàn bộ folder này lên (kéo thả hoặc dùng GitHub Desktop)
4. **LƯU Ý**: Xoá file `.env.local` trước khi upload — thông tin này sẽ nhập riêng trên Vercel

---

## Bước 2 — Deploy lên Vercel

1. Vào https://vercel.com → đăng nhập bằng GitHub
2. **Add New Project** → chọn repo `shop-khanh`
3. Trước khi bấm Deploy, vào **Environment Variables** và thêm:

| Key | Value |
|-----|-------|
| `LARK_APP_ID` | `cli_aa9f77a4beb89ed4` |
| `LARK_APP_SECRET` | `SlDFPG0aKWC0uqCPmItYQcG5NXWUWmWd` |
| `LARK_BASE_TOKEN` | `DlbYbsR1CaOrfusm1pml9CBkgqc` |
| `LARK_TABLE_ID` | `tblt9lBExLDrytGI` |

4. Bấm **Deploy** → chờ ~1 phút

---

## Bước 3 — Lấy link gửi khách

Sau khi deploy xong, Vercel sẽ cấp link dạng:
```
https://shop-khanh.vercel.app
```

Gửi link này cho khách là xong! 🎉

---

## Nếu hình ảnh không hiện

Lark Base cần cấp quyền cho app đọc ảnh. Vào SHOP APP → **Permissions & Scopes** → thêm:
- `bitable:app:readonly`
- `drive:drive:readonly`

Sau đó publish lại app.

---

## Cập nhật sản phẩm

Chỉ cần cập nhật trong Lark Base là web tự động cập nhật sau 60 giây (cache).
