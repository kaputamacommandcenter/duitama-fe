<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 via-slate-100 to-blue-300 relative overflow-hidden"
  >
    <!-- Background dekoratif -->
    <div class="absolute inset-0 opacity-30 pointer-events-none">
      <div class="absolute top-10 left-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-60 h-60 bg-sky-300 rounded-full blur-3xl"></div>
    </div>

    <!-- Card Login -->
    <div
      class="card w-96 backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl z-10"
    >
      <div class="card-body">
        <!-- Logo / Judul -->
        <div class="flex flex-col items-center mb-1">
          <div class="flex items-center gap-2">
            <img src="/public/duitama-logo.png" alt="" class="w-48">
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin">
          <!-- Username -->
          <div class="form-control mb-3">
            <label class="label">
              <span class="label-text font-semibold">Username</span>
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Password -->
          <div class="form-control mb-2">
            <label class="label">
              <span class="label-text font-semibold">Password</span>
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="Masukkan password"
              class="input input-bordered w-full"
              required
            />
          </div>

          <!-- Remember me & Forgot Password -->
          <div class="flex justify-between items-center text-sm mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="rememberMe" class="checkbox checkbox-sm" />
              <span class="text-gray-700">Remember me</span>
            </label>

            <a href="#" class="text-blue-600 hover:underline" @click.prevent="handleForgotPassword">
              Forgot password?
            </a>
          </div>

          <!-- Tombol Login -->
          <div class="form-control mt-2">
            <button class="btn btn-primary w-full" type="submit">
              <i class="fa-solid fa-right-to-bracket mr-2"></i> Masuk
            </button>
          </div>

          <!-- Pesan Error -->
          <p v-if="error" class="text-error text-center mt-3">
            {{ error }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const username = ref<string>("")
const password = ref<string>("")
const rememberMe = ref<boolean>(false)
const error = ref<string>("")

const handleLogin = (): void => {
  if (username.value === "admin" && password.value === "1234") {
    if (rememberMe.value) {
      localStorage.setItem("rememberedUser", username.value)
    } else {
      localStorage.removeItem("rememberedUser")
    }
    alert("Login berhasil!")
    // router.push('/dashboard')
  } else {
    error.value = "Username atau password salah!"
  }
}

const handleForgotPassword = (): void => {
  alert("Fitur lupa password belum diaktifkan. Hubungi admin untuk reset akun.")
  // router.push('/forgot-password')
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
</style>
