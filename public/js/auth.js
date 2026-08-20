
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

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

async function handleRegister(e) {
  e.preventDefault();

  const form = document.getElementById('registerForm');
  const role = document.getElementById('roleInput').value;
  const pass = document.getElementById('regPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const address = document.getElementById('reg-address').value;

  if (pass.length <= 6) {
    return showToast("Mật khẩu phải dài hơn 6 ký tự!", "error");
  }

  if (pass !== confirmPass) {
    return showToast("Mật khẩu nhập lại không khớp!", "error");
  }

  if (role === 'seller' && (!address || address.trim() === '')) {
    return showToast("Cửa hàng bắt buộc phải nhập địa chỉ!", "error");
  }

  const formData = new FormData(form);

  try {
    const response = await fetch('/register', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Đăng ký thành công! Đang chuyển trang...", "success");
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    showToast("Lỗi kết nối đến máy chủ!", "error");
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;

  if (!password || password.length < 6) {
    return showToast("Mật khẩu không chính xác!", "error");
  }

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: phone, password: password })
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Đăng nhập thành công! Đang chuyển hướng...", "success");
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    console.error("Lỗi Fetch Đăng nhập:", error);
    showToast("Lỗi kết nối đến máy chủ!", "error");
  }
}