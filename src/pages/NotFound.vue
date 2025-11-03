<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-500"
  >
    <!-- Icon animasi -->
    <div
      class="animate-bounce text-6xl text-blue-500 mb-4"
    >
      ⚠️
    </div>

    <!-- Judul besar -->
    <h1 class="text-7xl font-extrabold text-gray-800 dark:text-white">404</h1>

    <!-- Pesan -->
    <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
      Halaman yang kamu cari tidak ditemukan.
    </p>

    <!-- Tombol kembali -->
    <router-link
      to="/"
      class="mt-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-transform duration-200"
    >
      Kembali ke Beranda
    </router-link>

    <!-- Efek animasi tambahan -->
    <div class="absolute bottom-10 text-gray-400 text-sm animate-pulse">
      DUITAMA © {{ new Date().getFullYear() }}
    </div>
  </div>
</template>

<script setup>
// Tidak perlu script tambahan di sini
</script>

<style scoped>
/* Animasi fade-in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div {
  animation: fadeIn 0.8s ease-in-out;
}
</style>
