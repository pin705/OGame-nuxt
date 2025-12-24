<script setup lang="ts">
defineProps<{
  size?: number
  class?: string
}>()
</script>

<template>
  <svg
    :width="size || 24"
    :height="size || 24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="$props.class"
  >
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="50%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
      <radialGradient id="shieldCore" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#dbeafe" />
        <stop offset="100%" stop-color="#3b82f6" />
      </radialGradient>
      <filter id="shieldGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
    </defs>
    <!-- Shield glow -->
    <path
      d="M12 2L3 6V12C3 17 7 21 12 22C17 21 21 17 21 12V6L12 2Z"
      fill="#60a5fa"
      opacity="0.3"
      filter="url(#shieldGlow)"
    />
    <!-- Shield body -->
    <path
      d="M12 3L4 6.5V12C4 16.5 7.5 20 12 21C16.5 20 20 16.5 20 12V6.5L12 3Z"
      fill="url(#shieldGrad)"
      stroke="#93c5fd"
      stroke-width="0.5"
    />
    <!-- Shield highlight -->
    <path
      d="M12 4L6 7V12C6 15 8 18 12 19V4Z"
      fill="url(#shieldCore)"
      opacity="0.5"
    />
    <!-- Energy pattern -->
    <path
      d="M12 7L9 10L12 13L15 10L12 7Z"
      fill="none"
      stroke="#dbeafe"
      stroke-width="0.8"
      opacity="0.8"
    />
    <circle cx="12" cy="10" r="1.5" fill="#eff6ff" opacity="0.9" />
    <!-- Shield segments -->
    <line x1="12" y1="3" x2="12" y2="21" stroke="#93c5fd" stroke-width="0.3" opacity="0.5" />
    <path d="M6 8L18 8" stroke="#93c5fd" stroke-width="0.3" opacity="0.4" />
    <path d="M5 12L19 12" stroke="#93c5fd" stroke-width="0.3" opacity="0.4" />
  </svg>
</template>
