/**
 * FoodEats - Smart Live Search & Autocomplete
 */

(function () {
  const TRENDING_KEYWORDS = ['Trà sữa', 'Gà rán', 'Pizza', 'Cơm tấm', 'Bún bò', 'Burger', 'Cà phê'];

  function initSearch(inputId, searchBoxClass) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const parentBox = input.closest('.search-box');
    if (!parentBox) return;

    parentBox.style.position = 'relative';

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions-dropdown';
    dropdown.style.display = 'none';
    parentBox.appendChild(dropdown);

    let debounceTimer = null;

    // Handle Submit
    function submitSearch(query) {
      const q = query || input.value.trim();
      if (q) {
        window.location.href = `/products/search?q=${encodeURIComponent(q)}`;
      }
    }

    // Search button click
    const btnSearch = parentBox.querySelector('.btn-search');
    if (btnSearch) {
      btnSearch.addEventListener('click', (e) => {
        e.preventDefault();
        submitSearch();
      });
    }

    // Enter key press
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitSearch();
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    // Input Typing (Debounced)
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const val = input.value.trim();

      if (!val) {
        showTrending();
        return;
      }

      dropdown.innerHTML = `
        <div class="search-loading-row">
          <span class="search-spinner"></span> Đang tìm món ngon...
        </div>
      `;
      dropdown.style.display = 'block';

      debounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(`/products/api/search?q=${encodeURIComponent(val)}`);
          const data = await res.json();

          if (data.success && data.data && data.data.length > 0) {
            renderResults(data.data, val, data.totalMatched || data.data.length);
          } else {
            renderNoResults(val);
          }
        } catch (err) {
          console.error('Search fetch error:', err);
        }
      }, 280);
    });

    // Focus
    input.addEventListener('focus', () => {
      if (!input.value.trim()) {
        showTrending();
      } else {
        dropdown.style.display = 'block';
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!parentBox.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    // Render Trending Keywords
    function showTrending() {
      let html = `
        <div class="search-section-title">🔥 Từ khóa tìm kiếm phổ biến</div>
        <div class="search-trending-tags">
      `;
      TRENDING_KEYWORDS.forEach(kw => {
        html += `<span class="trending-tag" onclick="selectKeyword('${kw}')">${kw}</span>`;
      });
      html += `</div>`;
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    }

    // Render Matching Results
    function renderResults(items, query, totalMatched) {
      let html = `
        <div class="search-section-title">🍽️ Gợi ý món ăn phù hợp</div>
        <div class="search-results-list">
      `;

      items.forEach(item => {
        html += `
          <a href="/products/${item._id}" class="search-item-row">
            <img src="${item.imageUrl}" alt="${item.name}" class="search-item-thumb" onerror="this.src='/images/default-product.jpg'">
            <div class="search-item-info">
              <span class="search-item-name">${item.name}</span>
              <span class="search-item-store">📍 ${item.storeName || item.category}</span>
            </div>
            <span class="search-item-price">${Number(item.price).toLocaleString('vi-VN')}đ</span>
          </a>
        `;
      });

      html += `</div>`;
      html += `
        <a href="/products/search?q=${encodeURIComponent(query)}" class="search-view-all-btn">
          🔍 Xem tất cả ${totalMatched} kết quả cho "<strong>${query}</strong>" ➔
        </a>
      `;
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';
    }

    // Render No Results
    function renderNoResults(query) {
      dropdown.innerHTML = `
        <div class="search-no-results">
          <span>😕</span> Không tìm thấy món ăn nào với từ khóa "<strong>${query}</strong>"
        </div>
        <a href="/products/search?q=${encodeURIComponent(query)}" class="search-view-all-btn">
          🔍 Thử mở trang tìm kiếm chi tiết ➔
        </a>
      `;
      dropdown.style.display = 'block';
    }

    // Helper for tag clicks
    window.selectKeyword = function (kw) {
      input.value = kw;
      submitSearch(kw);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearch('global-search');
    initSearch('mobile-global-search');
  });
})();

