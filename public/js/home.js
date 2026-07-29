if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('.hero-3d-card'), {
    max: 15,
    speed: 400,
    glare: false,
    'max-glare': 0.2
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('bg-video');

  if (!video) return;

  let targetTime = 0;
  let currentTime = 0;
  let isSeeking = false;

  const updateVideoTime = () => {
    const diff = targetTime - currentTime;

    if (Math.abs(diff) < 0.03) {
      currentTime = targetTime;
      video.currentTime = currentTime;
      isSeeking = false;
      return;
    }

    currentTime += diff * 0.25;
    video.currentTime = currentTime;
    requestAnimationFrame(updateVideoTime);
  };

  video.addEventListener('loadedmetadata', () => {
    window.addEventListener('scroll', () => {
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollableDistance));
      targetTime = video.duration * progress;

      if (!isSeeking) {
        isSeeking = true;
        requestAnimationFrame(updateVideoTime);
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Lắng nghe sự kiện click trên toàn bộ container món ăn
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-add-cart')) {
      e.preventDefault();
      e.stopPropagation(); // Chặn chuyển hướng trang nếu nút nằm gần link

      const productId = e.target.getAttribute('data-id');

      try {
        const response = await fetch('/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: 1 })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast(result.message, 'success');
          
          // Cập nhật số badge giỏ hàng trên Header (nếu có)
          const cartBadge = document.getElementById('cart-badge');
          if (cartBadge) {
            cartBadge.innerText = result.totalItems;
          }
        } else {
          showToast(result.message || 'Chưa thể thêm món!', 'error');
          if (response.status === 401) {
            setTimeout(() => window.location.href = '/login', 1200);
          }
        }
      } catch (err) {
        showToast('Lỗi kết nối máy chủ!', 'error');
      }
    }
  });
});