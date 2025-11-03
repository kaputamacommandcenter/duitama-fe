<template>
  <AuthLayout>
    <div
      class="card w-96 backdrop-blur-md bg-white/70 border border-white/30 shadow-2xl"
    >
      <div class="card-body">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-1">
          <img src="/duitama-logo.png" alt="DUITAMA" class="size-40" />
          <h2 class="text-xl font-bold mt-2 text-gray-700">Verifikasi OTP</h2>
          <p class="text-gray-500 text-sm text-center">
            Masukkan 6 digit kode OTP yang dikirim ke email atau nomor Anda
          </p>
        </div>

        <!-- Form OTP -->
        <form @submit.prevent="verifyOtp">
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text font-semibold">Kode OTP</span>
            </label>

            <!-- Input OTP -->
            <div class="flex justify-between gap-2 mb-3">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                v-model="otp[index]"
                type="text"
                maxlength="1"
                class="input input-bordered w-12 text-center text-xl font-bold tracking-widest"
                @input="moveNext(index, $event)"
                @keydown.backspace="movePrev(index, $event)"
              />
            </div>
          </div>

          <!-- Pesan status -->
          <div class="text-center text-sm mb-3">
            <p v-if="timer > 0" class="text-gray-600">
              Kirim ulang kode dalam <span class="font-semibold">{{ timer }}</span> detik
            </p>
            <button
              v-else
              type="button"
              class="text-blue-600 hover:underline"
              @click="resendOtp"
            >
              Kirim ulang kode OTP
            </button>
          </div>

          <!-- Tombol Verifikasi -->
          <button
            class="btn btn-primary w-full font-semibold"
            type="submit"
            :disabled="!isOtpFilled"
          >
            <i class="fa-solid fa-shield-keyhole mr-2"></i> Verifikasi Kode
          </button>

          <!-- Pesan Error -->
          <p v-if="error" class="text-error text-center mt-3">
            {{ error }}
          </p>

          <!-- Pesan Sukses -->
          <p v-if="success" class="text-green-600 text-center mt-3 font-medium">
            {{ success }}
          </p>
        </form>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import AuthLayout from "../layouts/AuthLayout.vue"

const otp = ref<string[]>(["", "", "", "", "", ""])
const otpDigits = [0, 1, 2, 3, 4, 5]
const error = ref("")
const success = ref("")
const timer = ref(30)
let countdown: ReturnType<typeof setInterval> | null = null

// Simulasi OTP benar
const correctOtp = "123456"

// Cek apakah semua input sudah diisi
const isOtpFilled = computed(() => otp.value.every((v) => v.trim() !== ""))

// Otomatis pindah ke input berikutnya
const moveNext = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.value.length === 1 && index < otp.value.length - 1) {
    const next = input.nextElementSibling as HTMLInputElement
    next?.focus()
  }
}

// Pindah ke input sebelumnya saat tekan backspace
const movePrev = (index: number, e: KeyboardEvent) => {
  if (e.key === "Backspace" && index > 0 && otp.value[index] === "") {
    const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement
    prev?.focus()
  }
}

// Fungsi verifikasi OTP
const verifyOtp = () => {
  error.value = ""
  success.value = ""

  const entered = otp.value.join("")

  if (entered === correctOtp) {
    success.value = "Verifikasi berhasil! Anda akan diarahkan..."
    setTimeout(() => {
      alert("Login sukses, diarahkan ke dashboard 🎉")
      // Router.push('/dashboard') — tambahkan nanti setelah routing aktif
    }, 1500)
  } else {
    error.value = "Kode OTP salah. Silakan coba lagi."
    otp.value = ["", "", "", "", "", ""]
  }
}

// Hitung mundur pengiriman ulang OTP
const startTimer = () => {
  timer.value = 30
  countdown = setInterval(() => {
    if (timer.value > 0) timer.value--
    else if (countdown) clearInterval(countdown)
  }, 1000)
}

// Fungsi kirim ulang OTP
const resendOtp = () => {
  alert("Kode OTP baru telah dikirim ✅")
  startTimer()
}

onMounted(() => {
  startTimer()
})
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css");

/* Efek input */
input:focus {
  outline: none;
  border-color: #0ea5e9; /* sky-500 */
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
}

/* Transisi lembut */
input {
  transition: all 0.2s ease-in-out;
}
</style>
