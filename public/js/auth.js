function switchRole(role) {
  // Đổi giá trị input ẩn để gửi lên server
  document.getElementById('roleInput').value = role;

  // Cập nhật màu sắc cho nút Tab
  document.getElementById('btn-buyer').classList.remove('active');
  document.getElementById('btn-seller').classList.remove('active');
  document.getElementById('btn-' + role).classList.add('active');

  // Ẩn/hiện các trường dữ liệu tương ứng
  const usernameField = document.getElementById('field-username');
  const sellerFields = document.getElementById('field-seller');

  if (role === 'seller') {
    usernameField.style.display = 'none';
    sellerFields.style.display = 'block';
  } else {
    usernameField.style.display = 'block';
    sellerFields.style.display = 'none';
  }
}

function switchRole(role) {
  // Đổi giá trị input ẩn để gửi lên server
  document.getElementById('roleInput').value = role;

  // Cập nhật màu sắc cho nút Tab (Chuyển qua lại mượt mà)
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + role).classList.add('active');

  // Đóng TẤT CẢ các khu vực role-content và vô hiệu hóa ô nhập để không bị lỗi Form
  document.querySelectorAll('.role-content').forEach(content => {
    content.classList.remove('active');
    // Disable tất cả input bên trong phần bị ẩn
    content.querySelectorAll('input').forEach(input => input.disabled = true);
  });

  // Chỉ MỞ khu vực được chọn và kích hoạt lại các ô nhập
  const activeContent = document.getElementById('content-' + role);
  activeContent.classList.add('active');
  activeContent.querySelectorAll('input').forEach(input => input.disabled = false);
}

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

// 2. Ẩn / Hiện mật khẩu bằng con mắt
function togglePassword(inputId, iconBtn) {
  const passwordInput = document.getElementById(inputId);
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    iconBtn.textContent = '🙈'; // Mắt nhắm
  } else {
    passwordInput.type = 'password';
    iconBtn.textContent = '👁️'; // Mắt mở
  }
}

// 3. Hàm hiển thị thông báo Toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// 4. Giả lập gửi OTP
function sendOTP() {
  showToast("Mã OTP đã được gửi về số điện thoại của bạn!", "success");
}

// 5. Xử lý Đăng ký (Xác minh mật khẩu trùng khớp)
function handleRegister(e) {
  const pass = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  if (pass !== confirmPass) {
    e.preventDefault(); // Ngăn submit form
    showToast("Mật khẩu nhập lại không trùng khớp!", "error");
    return false;
  }
  
  // Bạn có thể bỏ e.preventDefault() khi nối Backend thật. 
  // Dưới đây là demo hiển thị khi gửi thành công:
  showToast("Đăng ký tài khoản thành công!", "success");
}

// 6. Xử lý Đăng nhập demo
function handleLogin(e) {
  const phone = document.getElementById('loginPhone').value;
  const pass = document.getElementById('loginPassword').value;

  // Demo kiểm tra sai mật khẩu
  if (pass && pass.length < 6) {
    e.preventDefault();
    showToast("Mật khẩu không chính xác hoặc quá ngắn!", "error");
    return false;
  }

  showToast("Đăng nhập thành công! Đang chuyển hướng...", "success");
}