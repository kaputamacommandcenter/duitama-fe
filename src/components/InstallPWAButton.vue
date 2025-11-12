<template>
  <button
    v-if="showInstallButton"
    class="btn btn-outline btn-primary flex items-center gap-2"
    @click="installApp"
  >
    <i class="fa-solid fa-download"></i>
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue"

defineProps({
  label: {
    type: String,
    default: "Install Aplikasi DUITAMA",
  },
})

const deferredPrompt = ref<any>(null)
const showInstallButton = ref(false)

const installApp = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  console.log(`User response: ${outcome}`)
  deferredPrompt.value = null
  showInstallButton.value = false
}

onMounted(() => {
  // Tangkap event ketika browser siap menawarkan instalasi
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallButton.value = true
  })

  // Jika aplikasi sudah terinstal
  window.addEventListener("appinstalled", () => {
    console.log("Aplikasi DUITAMA telah diinstal ✅")
    showInstallButton.value = false
  })
})
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");
</style>
