const { default: rateLimit } = require("express-rate-limit");

// 1. Chuyển đổi giữa Người mua và Cửa hàng
function switchRole(role) {
  document.getElementById('roleInput').value = role;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + role).classList.add('active');

  document.querySelectorAll('.role-content').forEach(content => {
    content.classList.remove('active');
    content.querySelectorAll('input').forEach(input => input.disabled = true);
  });

  const activeContent = document.getElementById('content-' + role);
  if (activeContent) {
    activeContent.classList.add('active');
    activeContent.querySelectorAll('input').forEach(input => input.disabled = false);
  }
}

// 2. Ẩn / Hiện mật khẩu
function togglePassword(inputId, iconBtn) {
  const passwordInput = document.getElementById(inputId);
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    iconBtn.innerHTML = '<img src="/images/iconsImages/hide.png" alt="hide" class="custom-icon-lg">';
  } else {
    passwordInput.type = 'password';
    iconBtn.innerHTML = '<img src="/images/iconsImages/view.png" alt="view" class="custom-icon-lg">';
  }
}

// 3. Hàm hiển thị thông báo Toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// 4. Xử lý Đăng ký (AJAX)
async function handleRegister(e) {
  e.preventDefault(); // Chặn việc Form tự động chuyển trang

  const form = document.getElementById('registerForm');
  const role = document.getElementById('roleInput').value;
  const pass = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const address = document.getElementById('reg-address').value;

  // --- CÁC RÀNG BUỘC KIỂM TRA TẠI TRÌNH DUYỆT ---
  if (pass.length <= 6) {
    return showToast("Mật khẩu phải dài hơn 6 ký tự!", "error");
  }

  if (pass !== confirmPass) {
    return showToast("Mật khẩu nhập lại không khớp!", "error");
  }

  // Đổi thành: Chỉ kiểm tra địa chỉ nếu role là 'seller'
  if (role === 'seller' && (!address || address.trim() === '')) {
    return showToast("Cửa hàng bắt buộc phải nhập địa chỉ!", "error");
  }

  // --- GỬI DỮ LIỆU NGẦM LÊN SERVER ---
  const formData = new FormData(form);

  try {
    const response = await fetch('/register', {
      method: 'POST',
      body: formData 
    });

    // Đọc câu trả lời từ Server
    const result = await response.json();

    if (response.ok) {
      showToast("Đăng ký thành công! Đang chuyển trang...", "success");
      // Sau 1.5 giây mới chuyển sang trang đăng nhập
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } else {
      // Server báo lỗi (Ví dụ: trùng số điện thoại)
      showToast(result.message, "error");
    }
  } catch (error) {
    showToast("Lỗi kết nối đến máy chủ!", "error");
  }
}

// 5. Xử lý Đăng nhập (AJAX)
async function handleLogin(e) {
  e.preventDefault(); 

  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;

  // Kiểm tra sơ bộ ở trình duyệt
  if (!password || password.length < 6) {
    return showToast("Mật khẩu không chính xác!", "error");
  }

  try {
    // Gửi ngầm dữ liệu lên Server dưới dạng JSON
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: phone, password: password })
    });

    // Đọc tin nhắn trả lời từ Server
    const result = await response.json();

    if (response.ok) {
      // Đăng nhập thành công, hiện Toast xanh và cho quay về trang chủ
      showToast("Đăng nhập thành công! Đang chuyển hướng...", "success");
      setTimeout(() => { 
        window.location.href = '/'; 
      }, 1500);
    } else {
      // Sai mật khẩu, sđt không tồn tại... -> Hiện Toast đỏ chứa tin nhắn của Server
      showToast(result.message, "error");
    }
  } catch (error) {
    console.error("Lỗi Fetch Đăng nhập:", error);
    showToast("Lỗi kết nối đến máy chủ!", "error");
  }
}