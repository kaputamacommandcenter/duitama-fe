<template>
  <AuthLayout>
    <div
      class="card w-96 backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl"
    >
      <div class="card-body">
        <div class="flex flex-col items-center mb-2">
          <img src="/duitama-logo.png" alt="DUITAMA" class="size-40" />
          <h2 class="text-xl font-bold text-primary">Forgot Password</h2>
          <p class="text-gray-600 text-sm text-center mt-1">
            Masukkan email Anda untuk mengatur ulang password.
          </p>
        </div>

        <form @submit.prevent="handleForgot">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="contoh@email.com"
              class="input input-bordered w-full"
              required
            />
          </div>

          <button
            class="btn btn-primary w-full"
            type="submit"
            :disabled="loading"
          >
            <i class="fa-solid fa-paper-plane mr-2"></i>
            {{ loading ? "Mengirim..." : "Kirim Link Reset" }}
          </button>
        </form>

        <!-- Pesan sukses -->
        <p v-if="success" class="text-green-600 text-center mt-3 font-medium">
          {{ success }}
        </p>

        <!-- Pesan error -->
        <p v-if="error" class="text-error text-center mt-3">
          {{ error }}
        </p>

        <div class="text-center mt-4">
          <RouterLink to="/login" class="text-blue-600 hover:underline">
            ← Kembali ke Login
          </RouterLink>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { api } from "../api/config"
import { useRouter } from "vue-router"
import AuthLayout from "../layouts/AuthLayout.vue"

const email = ref("")
const success = ref("")
const error = ref("")
const loading = ref(false)
const router = useRouter()

const handleForgot = async () => {
  success.value = ""
  error.value = ""
  loading.value = true

  try {
    const response = await api.post("/auth/forgot-password", {
      email: email.value,
    })

    if (response.data.success) {
      success.value = response.data.message || "Link reset password telah dikirim ke email Anda."
      setTimeout(() => {
        router.push("/login")
      }, 2500)
    } else {
      error.value = response.data.message || "Email tidak terdaftar."
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Terjadi kesalahan saat mengirim permintaan."
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");
</style>
