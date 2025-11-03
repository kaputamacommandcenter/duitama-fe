<template>
  <AuthLayout>
    <div
      class="card w-96 backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl"
    >
      <div class="card-body">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-3">
          <img src="/duitama-logo.png" alt="DUITAMA" class="size-36" />
          <h2 class="text-xl font-bold text-gray-800 mt-2">Reset Password</h2>
          <p class="text-sm text-gray-600 text-center">
            Masukkan password baru Anda di bawah ini
          </p>
        </div>

        <!-- Form Reset Password -->
        <form @submit.prevent="handleResetPassword">
          <!-- Password Baru -->
          <div class="form-control mb-3">
            <label class="label">
              <span class="label-text font-semibold">Password Baru</span>
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Masukkan password baru"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Konfirmasi Password -->
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">Konfirmasi Password</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Ulangi password baru"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Pesan Error -->
          <p v-if="error" class="text-error text-center mb-2">{{ error }}</p>

          <!-- Tombol Submit -->
          <button
            class="btn w-full text-white font-semibold"
            type="submit"
            :disabled="isLoading"
            :class="isLoading ? 'btn-disabled bg-gray-400 cursor-not-allowed' : 'btn-primary'"
          >
            <i class="fa-solid fa-unlock-keyhole mr-2"></i>
            {{ isLoading ? "Menyimpan..." : "Reset Password" }}
          </button>
        </form>

        <!-- Link ke Login -->
        <div class="text-center mt-4 text-sm">
          <RouterLink to="/login" class="text-blue-600 hover:underline">
            Kembali ke halaman login
          </RouterLink>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AuthLayout from "../layouts/AuthLayout.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const newPassword = ref("")
const confirmPassword = ref("")
const error = ref("")
const isLoading = ref(false)

const handleResetPassword = async () => {
  error.value = ""

  if (newPassword.value.length < 6) {
    error.value = "Password minimal 6 karakter."
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Konfirmasi password tidak sama."
    return
  }

  isLoading.value = true

  // Simulasi proses API reset
  setTimeout(() => {
    isLoading.value = false
    alert("Password berhasil direset! Silakan login kembali.")
    router.push("/login")
  }, 1500)
}
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");
</style>
