import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Mencegah prompt otomatis
  e.preventDefault();
  deferredPrompt = e;
  // Tampilkan tombol install
  const installButton = document.getElementById('installButton');
  if (installButton) installButton.style.display = 'block';
});

