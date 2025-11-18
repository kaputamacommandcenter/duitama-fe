<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-slate-100 to-blue-300 relative overflow-hidden"
  >
    <!-- Dekorasi background -->
    <div class="absolute inset-0 opacity-30 pointer-events-none">
      <div class="absolute top-10 left-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-60 h-60 bg-sky-300 rounded-full blur-3xl"></div>
    </div>

    <!-- Slot konten halaman -->
    <div class="z-10 w-full flex justify-center p-3">
      <slot />
    </div>

    <!-- Copyright -->
    <footer
      class="text-gray-700 text-sm text-center opacity-80 z-10 mt-4 w-full"
    >
      &copy; {{ currentYear }} <span class="font-semibold">DUITAMA</span>. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
