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

        <!-- Jika berhasil reset password -->
        <div v-if="success" class="text-center animate-fade-in">
          <p class="text-green-700 font-semibold text-lg mb-3">
            {{ success }}
          </p>
          <RouterLink
            to="/login"
            class="text-blue-600 font-semibold hover:underline"
          >
            👉 Kembali ke halaman login
          </RouterLink>
        </div>

        <!-- Jika belum berhasil -->
        <form v-else @submit.prevent="handleResetPassword">
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
          <p v-if="error" class="text-red-600 font-medium text-center mb-2">
            {{ error }}
          </p>

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

          <!-- Link ke Login -->
          <div class="text-center mt-4 text-sm">
            <RouterLink to="/login" class="text-blue-600 hover:underline">
              Kembali ke halaman login
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import AuthLayout from "../layouts/AuthLayout.vue"
import { api } from "../api/config"

const router = useRouter()
const route = useRoute()

const newPassword = ref("")
const confirmPassword = ref("")
const error = ref("")
const success = ref("")
const isLoading = ref(false)

const handleResetPassword = async () => {
  error.value = ""
  success.value = ""

  if (newPassword.value.length < 6) {
    error.value = "Password minimal 6 karakter."
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Konfirmasi password tidak sama."
    return
  }

  isLoading.value = true

  try {
    const token = route.query.token
    const email = route.query.email

    const response = await api.post("/auth/reset-password", {
      token,
      email,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    })

    if (response.data.success) {
      success.value = "✅ Password berhasil direset! Silakan login kembali."
      // Opsional: redirect otomatis setelah 2 detik
      setTimeout(() => router.push("/login"), 10000)
    } else {
      error.value = response.data.message || "Gagal mereset password."
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || "Terjadi kesalahan saat reset password."
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

/* Animasi lembut untuk pesan sukses */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>
