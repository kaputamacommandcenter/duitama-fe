import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Fungsi helper untuk update meta Open Graph
function updateOg(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("property", property)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

// Fungsi helper untuk update meta biasa
function updateMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute("name", name)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

// Router hook: update meta setiap kali route berubah
router.afterEach((to) => {
  const title = (to.meta.title as string) || "DUITAMA"
  const description = (to.meta.description as string) || "Sistem manajemen tagihan modern."
  const url = window.location.href

  // Title
  document.title = title

  // Description
  updateMeta("description", description)

  // Open Graph (for social media)
  updateOg("og:title", title)
  updateOg("og:url", url)
})

app.use(router).mount('#app')
