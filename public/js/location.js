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
  });

  if (saveButton && addressText) {
    saveButton.onclick = () => {
      const address = addressText.textContent || 'Không có địa chỉ';
      localStorage.setItem('userAddress', address);
      window.location.href = '/';
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
