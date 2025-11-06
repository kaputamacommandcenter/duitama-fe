// src/stores/loading.ts
import { ref } from "vue"

export const isLoading = ref(false)
export const loadingMessage = ref("Memproses...")

export function showLoading(message = "Memproses...") {
  loadingMessage.value = message
  isLoading.value = true
}

export function hideLoading() {
  isLoading.value = false
}
