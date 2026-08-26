
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

  const subtitleEl = document.getElementById('auth-subtitle');
  if (subtitleEl) {
    if (role === 'seller') {
      subtitleEl.textContent = 'Mở quán kinh doanh trên FoodEats để tiếp cận hàng triệu khách hàng!';
    } else {
      subtitleEl.textContent = 'Trở thành thành viên FoodEats để nhận ngàn ưu đãi hấp dẫn!';
    }
  }
}

function checkPasswordStrength(password) {
  const container = document.getElementById('password-strength-container');
  const bar = document.getElementById('strength-bar');
  const text = document.getElementById('strength-text');

  if (!container || !bar || !text) return;

  if (!password) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  bar.className = 'strength-bar';

  if (score <= 1) {
    bar.style.width = '25%';
    bar.classList.add('strength-weak');
    text.textContent = 'Yếu';
    text.style.color = '#ff4757';
  } else if (score === 2 || score === 3) {
    bar.style.width = '55%';
    bar.classList.add('strength-medium');
    text.textContent = 'Trung bình';
    text.style.color = '#ffa502';
  } else if (score === 4) {
    bar.style.width = '80%';
    bar.classList.add('strength-strong');
    text.textContent = 'Mạnh';
    text.style.color = '#2ed573';
  } else {
    bar.style.width = '100%';
    bar.classList.add('strength-very-strong');
    text.textContent = 'Rất mạnh';
    text.style.color = '#00d2d3';
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