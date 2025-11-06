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

          <!-- Captcha -->
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
              <button
                type="button"
                class="btn btn-sm btn-outline"
                @click="generateCaptcha"
              >
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

            <p
              v-if="captchaAnswer !== null"
              class="text-sm mt-1"
              :class="isCaptchaCorrect ? 'text-green-600' : 'text-red-600'"
            >
              {{ isCaptchaCorrect ? 'Captcha benar ✅' : 'Captcha salah ❌' }}
            </p>
          </div>

          <!-- Remember -->
          <div class="flex justify-between items-center text-sm mb-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="rememberMe"
                class="checkbox checkbox-sm"
              />
              <span class="text-gray-700">Remember me</span>
            </label>

            <RouterLink
              to="/forgot-password"
              class="text-blue-600 hover:underline"
            >
              Forgot password?
            </RouterLink>
          </div>

          <!-- Tombol Login -->
          <button
            class="btn w-full text-white font-semibold"
            type="submit"
            :disabled="loading || !isCaptchaCorrect"
            :class="
              isCaptchaCorrect
                ? 'btn-primary'
                : 'btn-disabled bg-gray-400 cursor-not-allowed'
            "
          >
            <i v-if="!loading" class="fa-solid fa-right-to-bracket mr-2"></i>
            <span v-if="loading" class="loading loading-spinner mr-2"></span>
            {{ loading ? 'Memproses...' : 'Masuk' }}
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
import { useRouter } from "vue-router"
import { api } from "../api/config"
import AuthLayout from "../layouts/AuthLayout.vue"

const router = useRouter()

const username = ref("")
const password = ref("")
const rememberMe = ref(false)
const error = ref("")
const loading = ref(false)

const captchaQuestion = ref("")
const captchaResult = ref(0)
const captchaAnswer = ref<number | null>(null)

// 🔹 Generate captcha
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
onMounted(() => {
  generateCaptcha()

  const saved = localStorage.getItem("rememberMe")
  const savedUsername = localStorage.getItem("savedUsername")

  if (saved === "true" && savedUsername) {
    username.value = savedUsername
    rememberMe.value = true
  }
})


const isCaptchaCorrect = computed(
  () => captchaAnswer.value === captchaResult.value
)

// 🔹 Fungsi login via REST API
const handleLogin = async () => {
  error.value = ""

  if (!isCaptchaCorrect.value) {
    error.value = "Hasil perhitungan salah!"
    generateCaptcha()
    return
  }

  loading.value = true
  try {
    const response = await api.post("auth/login", {
      email: username.value,
      password: password.value,
    })

    if (response.data.success) {
      // ✅ Simpan data user sementara (untuk OTP)
      localStorage.setItem("otp_email", username.value)

      // ✅ Simpan preferensi Remember Me
      if (rememberMe.value) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("savedUsername", username.value)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("savedUsername")
      }

      // Lanjut ke verifikasi OTP
      router.push("/otp")
    } else {
      error.value = response.data.message || "Login gagal!"
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Terjadi kesalahan pada server."
  } finally {
    loading.value = false
    generateCaptcha()
  }
}

</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");
</style>
