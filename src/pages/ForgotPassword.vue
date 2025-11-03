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

          <button class="btn btn-primary w-full" type="submit">
            <i class="fa-solid fa-paper-plane mr-2"></i> Kirim Link Reset
          </button>
        </form>

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
import AuthLayout from "../layouts/AuthLayout.vue"

const email = ref("")

const handleForgot = () => {
  alert(`Link reset dikirim ke ${email.value}`)
  // router.push('/login')
}
</script>
