<template>
  <AuthLayout>
    <div
      class="card w-96 backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl"
    >
      <div class="card-body">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-1">
          <img src="/duitama-logo.png" alt="DUITAMA" class="size-40" />
        </div>

        <!-- Form Login -->
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

          <!-- Captcha Perhitungan -->
          <div class="form-control mb-3">
            <label class="label">
              <span class="label-text font-semibold">Verifikasi</span>
            </label>

            <div class="flex items-center justify-between mb-2">
              <div
                class="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-mono text-lg rounded select-none"
              >
                {{ captchaQuestion }}
              </div>
              <button type="button" class="btn btn-sm btn-outline" @click="generateCaptcha">
                <i class="fa-solid fa-rotate"></i>
              </button>
            </div>

            <input
              v-model.number="captchaAnswer"
              type="number"
              placeholder="Masukkan hasil perhitungan"
              class="input input-bordered w-full"
              required
            />

            <!-- Indikator captcha -->
            <p v-if="captchaAnswer !== null" class="text-sm mt-1"
               :class="isCaptchaCorrect ? 'text-green-600' : 'text-red-600'">
              {{ isCaptchaCorrect ? 'Captcha benar ✅' : 'Captcha salah ❌' }}
            </p>
          </div>

          <!-- Remember + Forgot -->
          <div class="flex justify-between items-center text-sm mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="rememberMe" class="checkbox checkbox-sm" />
              <span class="text-gray-700">Remember me</span>
            </label>

            <RouterLink to="/forgot-password" class="text-blue-600 hover:underline">
              Forgot password?
            </RouterLink>
          </div>

          <!-- Tombol Login -->
          <button
            class="btn w-full text-white font-semibold"
            type="submit"
            :disabled="!isCaptchaCorrect"
            :class="isCaptchaCorrect ? 'btn-primary' : 'btn-disabled bg-gray-400 cursor-not-allowed'"
          >
            <i class="fa-solid fa-right-to-bracket mr-2"></i> Masuk
          </button>

          <!-- Pesan Error -->
          <p v-if="error" class="text-error text-center mt-3">
            {{ error }}
          </p>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import AuthLayout from "../layouts/AuthLayout.vue"

const username = ref("")
const password = ref("")
const rememberMe = ref(false)
const error = ref("")

const captchaQuestion = ref("")
const captchaResult = ref(0)
const captchaAnswer = ref<number | null>(null)

// Fungsi buat soal aritmatika acak
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const ops = ["+", "-", "*"]
  const op = ops[Math.floor(Math.random() * ops.length)]

  switch (op) {
    case "+":
      captchaResult.value = num1 + num2
      break
    case "-":
      captchaResult.value = num1 - num2
      break
    case "*":
      captchaResult.value = num1 * num2
      break
  }

  captchaQuestion.value = `${num1} ${op} ${num2} = ?`
  captchaAnswer.value = null
}

onMounted(generateCaptcha)

// Cek apakah captcha benar
const isCaptchaCorrect = computed(() => captchaAnswer.value === captchaResult.value)

// Fungsi login
const handleLogin = () => {
  error.value = ""

  if (!isCaptchaCorrect.value) {
    error.value = "Hasil perhitungan salah!"
    generateCaptcha()
    return
  }

  if (username.value === "admin" && password.value === "1234") {
    alert("Login berhasil!")
    generateCaptcha() // captcha otomatis ganti setelah login
  } else {
    error.value = "Username atau password salah!"
  }
}
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");
</style>
