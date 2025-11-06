<template>
  <transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-gray-800/10 flex flex-col items-center justify-center z-[9999] backdrop-blur-[2px]"
    >
      <div class="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-white/80 mt-4 font-semibold text-lg drop-shadow">{{ loadingMessage }}</p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { isLoading, loadingMessage } from "../stores/loading"
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
