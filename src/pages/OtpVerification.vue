<template>
  <AuthLayout>
    <div
      class="w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-md mx-auto p-5 sm:p-8 bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl mt-10 sm:mt-16"
    >
      <div class="card-body">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-4 text-center">
          <img
            src="/duitama-logo.png"
            alt="DUITAMA"
            class="w-28 sm:w-32 md:w-36 lg:w-40 object-contain"
          />
          <h2 class="text-lg sm:text-xl font-bold mt-3 text-gray-700">
            Verifikasi OTP
          </h2>
          <p class="text-gray-500 text-sm sm:text-base max-w-sm leading-relaxed">
            Masukkan 6 digit kode OTP yang dikirim ke email atau nomor Anda
          </p>
        </div>

        <!-- Form OTP -->
        <form @submit.prevent="verifyOtp" class="w-full">
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text font-semibold">Kode OTP</span>
            </label>

            <!-- Input OTP -->
            <div
              class="flex justify-center gap-2 sm:gap-3 mb-3 flex-wrap sm:flex-nowrap"
            >
              <input
                v-for="(index) in otpDigits"
                :key="index"
                v-model="otp[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="input input-bordered w-10 sm:w-12 md:w-14 text-center text-lg sm:text-xl font-bold tracking-widest"
                @input="handleInput(index, $event)"
                @keydown.backspace="movePrev(index, $event)"
                @keypress="allowOnlyNumbers($event)"
              />
            </div>
          </div>

          <!-- Pesan status -->
          <div class="text-center text-sm mb-3">
            <p v-if="timer > 0" class="text-gray-600">
              Kirim ulang kode dalam
              <span class="font-semibold">{{ timer }}</span> detik
            </p>
            <button
              v-else
              type="button"
              class="text-blue-600 hover:underline"
              @click="resendOtp"
            >
              Kirim ulang kode OTP
            </button>
            |
            <button
              type="button"
              class="text-blue-600 hover:underline"
              @click="router.push('/login')"
            >
              Kembali ke halaman login
            </button>
          </div>

          <!-- Tombol Verifikasi -->
          <button
            class="btn btn-primary w-full font-semibold"
            type="submit"
            :disabled="!isOtpFilled || loading"
          >
            <i class="fa-solid fa-shield-keyhole mr-2"></i>
            {{ loading ? "Memverifikasi..." : "Verifikasi Kode" }}
          </button>

          <!-- Pesan Error -->
          <p
            v-if="error"
            class="text-error text-center mt-3 text-sm sm:text-base"
          >
            {{ error }}
          </p>

          <!-- Pesan Sukses -->
          <p
            v-if="success"
            class="text-green-600 text-center mt-3 font-medium text-sm sm:text-base"
          >
            {{ success }}
          </p>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { api } from "../api/config"
import AuthLayout from "../layouts/AuthLayout.vue"

const router = useRouter()
const otp = ref<string[]>(["", "", "", "", "", ""])
const otpDigits = [0, 1, 2, 3, 4, 5]
const error = ref("")
const success = ref("")
const timer = ref(30)
const loading = ref(false)
let countdown: ReturnType<typeof setInterval> | null = null

const email = ref(localStorage.getItem("otp_email") || "")

const isOtpFilled = computed(() => otp.value.every((v) => v.trim() !== ""))

// Hanya izinkan angka
const allowOnlyNumbers = (e: KeyboardEvent) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

// Hanya izinkan angka, lalu pindah ke input berikutnya
const handleInput = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  // Hilangkan karakter non-angka
  input.value = input.value.replace(/[^0-9]/g, "")
  otp.value[index] = input.value
  if (input.value.length === 1 && index < otp.value.length - 1) {
    const next = input.nextElementSibling as HTMLInputElement
    next?.focus()
  }
}

const movePrev = (index: number, e: KeyboardEvent) => {
  if (e.key === "Backspace" && index > 0 && otp.value[index] === "") {
    const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement
    prev?.focus()
  }
}

const verifyOtp = async () => {
  error.value = ""
  success.value = ""
  loading.value = true
  const enteredOtp = otp.value.join("")

  try {
    const response = await api.post("/auth/verify-otp", {
      otp_code: enteredOtp,
    })

    if (response.data.success) {
      success.value = response.data.message || "Verifikasi berhasil!"
      localStorage.setItem("email", response.data.data.email)
      localStorage.setItem("name", response.data.data.name)
      localStorage.setItem("access_token", response.data.data.access_token)
      localStorage.setItem("refresh_token", response.data.data.refresh_token)
      localStorage.setItem("role", response.data.data.roles[0].name)
      localStorage.setItem("isLoggedIn", "true")
      localStorage.removeItem("otp_email")

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } else {
      error.value = response.data.message || "Kode OTP salah."
      otp.value = ["", "", "", "", "", ""]
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || "Terjadi kesalahan server."
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timer.value = 30
  if (countdown) clearInterval(countdown)
  countdown = setInterval(() => {
    if (timer.value > 0) timer.value--
    else if (countdown) clearInterval(countdown)
  }, 1000)
}

const resendOtp = async () => {
  error.value = ""
  success.value = ""
  console.log(email.value)
  try {
    const res = await api.post("/auth/resend-otp", {
      emailRequest: email.value,
    })
    success.value = res.data.message || "Kode OTP baru telah dikirim ✅"
    startTimer()
  } catch {
    error.value = "Gagal mengirim ulang OTP. Coba lagi nanti."
  }
}

onMounted(() => {
  startTimer()
  if (!email.value) {
    router.push("/login")
  }
})

onUnmounted(() => {
  if (countdown) clearInterval(countdown)
})
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

input:focus {
  outline: none;
  border-color: #0ea5e9; /* sky-500 */
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
}

input {
  transition: all 0.2s ease-in-out;
}
</style>
