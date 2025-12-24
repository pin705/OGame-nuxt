<script setup lang="ts">
definePageMeta({
  layout: 'game',
  middleware: [
    function (to, from) {
      return navigateTo('/game/messages?type=COMBAT')
    }
  ]
})
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <p class="text-slate-400">Đang chuyển hướng đến hộp thư...</p>
    </div>
  </div>
</template>
