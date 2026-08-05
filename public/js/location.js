let map, marker;
const initialPos = { lat: 20.8449, lng: 106.6881 };

const pinIcon = L.divIcon({
  className: 'custom-pin-icon',
  html: '<div class="pin-icon"></div>',
  iconSize: [32, 42],
  iconAnchor: [16, 42]
});

document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  const saveButton = document.getElementById('btn-save-location');
  const currentLocationButton = document.getElementById('btn-current-location');
  const addressText = document.getElementById('address-text');
  const hintText = document.getElementById('hint-text');
  const confirmBox = document.querySelector('.confirm-box');
  const searchInput = document.getElementById('address-search');
  const searchBtn = document.getElementById('search-btn');
  const suggestionsBox = document.getElementById('search-suggestions');
  let userLocation = null;

  // Try to get device location to bias search suggestions
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }, () => { /* ignore errors */ }, { enableHighAccuracy: true, timeout: 5000 });
  }

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value && searchInput.value.trim();
      if (!q) return;
      searchBtn.disabled = true;
      searchBtn.textContent = 'Tìm...';
      fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1&accept-language=vi`)
        .then((res) => res.json())
        .then((results) => {
          if (results && results.length) {
            const r = results[0];
            const latlng = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
            marker.setLatLng(latlng);
            map.setView(latlng, 17);
            updateAddress(r.display_name || q);
            if (confirmBox) confirmBox.classList.add('open');
          } else {
            alert('Không tìm thấy địa chỉ. Vui lòng thử từ khóa khác.');
          }
        })
        .catch((err) => {
          console.error('Search error', err);
          alert('Lỗi tìm kiếm địa chỉ. Vui lòng thử lại.');
        })
        .finally(() => {
          searchBtn.disabled = false;
          searchBtn.textContent = 'Tìm';
        });
    });
  }

  // Debounced suggestions while typing
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function showSuggestions(items) {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = '';
    if (!items || !items.length) { suggestionsBox.style.display = 'none'; suggestionsBox.setAttribute('aria-hidden', 'true'); return; }
    items.forEach(r => {
      const el = document.createElement('div');
      el.className = 'item';
      el.textContent = r.display_name || r.display || r.name || r.formatted;
      el.dataset.lat = r.lat;
      el.dataset.lon = r.lon;
      el.addEventListener('click', () => {
        const latlng = { lat: parseFloat(el.dataset.lat), lng: parseFloat(el.dataset.lon) };
        marker.setLatLng(latlng);
        map.setView(latlng, 17);
        updateAddress(el.textContent);
        if (confirmBox) confirmBox.classList.add('open');
        suggestionsBox.style.display = 'none';
        suggestionsBox.setAttribute('aria-hidden', 'true');
      });
      suggestionsBox.appendChild(el);
    });
    suggestionsBox.style.display = 'block';
    suggestionsBox.setAttribute('aria-hidden', 'false');
  }

  const onInput = debounce(() => {
    const q = searchInput.value && searchInput.value.trim();
    if (!q) { showSuggestions([]); return; }
    let url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=vi`;
    if (userLocation) {
      // Bias results by viewbox around user location (~5km)
      const delta = 0.05;
      const left = userLocation.lng - delta;
      const right = userLocation.lng + delta;
      const top = userLocation.lat + delta;
      const bottom = userLocation.lat - delta;
      url += `&viewbox=${left},${top},${right},${bottom}`;
    } else if (map && map.getBounds) {
      const b = map.getBounds();
      const left = b.getWest();
      const right = b.getEast();
      const top = b.getNorth();
      const bottom = b.getSouth();
      url += `&viewbox=${left},${top},${right},${bottom}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(results => showSuggestions(results))
      .catch(err => { console.error('Suggest error', err); showSuggestions([]); });
  }, 300);

  if (searchInput) {
    searchInput.addEventListener('input', onInput);
    // hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!suggestionsBox) return;
      if (!document.querySelector('.map-card').contains(e.target)) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (!mapElement) return;

  map = L.map('map', {
    center: [initialPos.lat, initialPos.lng],
    zoom: 15,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  marker = L.marker([initialPos.lat, initialPos.lng], { icon: pinIcon, draggable: false }).addTo(map);

  updateAddress('Nhấn vào bản đồ để chọn vị trí giao hàng.');

  map.on('click', (event) => {
    marker.setLatLng(event.latlng);
    map.panTo(event.latlng, { animate: true, duration: 0.5 });
    reverseGeocodePosition(event.latlng);
    if (hintText) hintText.textContent = 'Đã chọn vị trí, bấm xác nhận để lưu.';
    // Toggle confirm box visibility so user can see full map when needed
    if (confirmBox) {
      if (confirmBox.classList.contains('open')) {
        confirmBox.classList.remove('open');
      } else {
        confirmBox.classList.add('open');
      }
    }
  });

  // 👇 ĐÃ SỬA: Tích hợp logic quay về trang trước đó vào Nút Xác Nhận
  if (saveButton && addressText) {
    saveButton.onclick = () => {
      const address = addressText.textContent || 'Không có địa chỉ';
      localStorage.setItem('userAddress', address);
      
      // Kiểm tra và quay lại đúng trang khách hàng vừa đứng
      if (document.referrer) {
        window.location.href = document.referrer;
      } else {
        window.location.href = '/'; 
      }
    };
  }

  if (currentLocationButton) {
    currentLocationButton.onclick = () => {
      if (!navigator.geolocation) {
        updateAddress('Trình duyệt không hỗ trợ định vị.');
        return;
      }

      updateAddress('Đang tìm vị trí hiện tại...');
      currentLocationButton.disabled = true;
      currentLocationButton.textContent = 'Đang định vị...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          marker.setLatLng(userPos);
          map.setView(userPos, 17);
          reverseGeocodePosition(userPos);
          if (hintText) hintText.textContent = 'Đã chọn vị trí hiện tại. Bấm xác nhận để lưu.';
          if (confirmBox) confirmBox.classList.add('open');
        },
        (error) => {
          console.error('Lỗi định vị:', error);
          updateAddress('Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      ).finally(() => {
        currentLocationButton.disabled = false;
        currentLocationButton.textContent = 'Định vị hiện tại';
      });
    };
  }
});

function reverseGeocodePosition(pos) {
  const lat = pos.lat;
  const lng = pos.lng;

  updateAddress('Đang tìm tên đường...');

  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`)
    .then((res) => res.json())
    .then((data) => {
      const address = data.display_name || 'Không thể tìm thấy tên đường tại vị trí này.';
      updateAddress(address);
      const confirmBox = document.querySelector('.confirm-box');
      if (confirmBox) confirmBox.classList.add('open');
    })
    .catch((error) => {
      console.error('Lỗi Geocode:', error);
      updateAddress('Lỗi mạng: không thể lấy tên đường.');
    });
}

function updateAddress(text) {
  const addressText = document.getElementById('address-text');
  if (addressText) {
    addressText.textContent = text;
  }
}