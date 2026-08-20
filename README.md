# 🍜 FoodEats - Nền Tảng Đặt Món Ăn Trực Tuyến

Ứng dụng web thương mại điện tử phục vụ nhu cầu tìm kiếm, đặt món ăn trực tuyến và quản lý thực đơn dành cho cửa hàng. Dự án được xây dựng theo kiến trúc MVC (Model-View-Controller) trên nền tảng Node.js, Express và MongoDB.

---

## 📌 Tính Năng Nổi Bật

* **Khách hàng (User):**
  * Khám phá danh sách món ăn đa dạng, xem chi tiết và đánh giá sản phẩm.
  * Thêm món vào giỏ hàng, tùy chỉnh số lượng và ghi chú theo từng món ăn.
  * Đặt hàng trực tuyến và theo dõi thông tin đơn hàng cá nhân.
* **Cửa hàng (Seller):**
  * Đăng bán món ăn kèm tải lên hình ảnh qua Cloudinary.
  * Quản lý, cập nhật thông tin và xóa sản phẩm trong thực đơn.
* **Bảo mật & Tối ưu:**
  * Xác thực người dùng bằng Session kết hợp mã hóa bảo mật.
  * Cơ chế chống tấn công NoSQL Injection và bảo vệ XSS trên giao diện EJS.
  * Giới hạn tần suất đăng nhập (Rate Limiting) và xử lý đường dẫn chuẩn qua Proxy.

---

## 🛠️ Công Nghệ Sử Dụng

* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose ODM
* **View Engine:** EJS (Embedded JavaScript)
* **Lưu trữ ảnh:** Cloudinary API
* **Package Manager:** `pnpm` 

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ

### 1. Clone dự án
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
