function showQRModal(config) {
  const overlay = document.getElementById('qr-modal');
  const container = document.getElementById('qr-code-container');
  container.innerHTML = '';

  const ssid = config.wifi.network;
  const password = config.wifi.password;
  const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};;`;

  new QRCode(container, {
    text: wifiString,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M,
  });

  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('visible'));
}

function hideQRModal() {
  const overlay = document.getElementById('qr-modal');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.add('hidden'), 200);
}

function initQR(config) {
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-show-qr')) {
      showQRModal(config);
      return;
    }
    if (e.target.closest('#qr-modal-close')) {
      hideQRModal();
      return;
    }
    const overlay = document.getElementById('qr-modal');
    if (overlay && e.target === overlay) {
      hideQRModal();
    }
  });
}
