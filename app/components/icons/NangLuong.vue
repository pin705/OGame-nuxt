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
      <radialGradient id="nangLuongCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="40%" stop-color="#fbbf24" />
        <stop offset="70%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </radialGradient>
      <radialGradient id="nangLuongGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
      </radialGradient>
      <filter id="nangLuongBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
    </defs>
    <!-- Outer glow -->
    <circle cx="12" cy="12" r="10" fill="url(#nangLuongGlow)" filter="url(#nangLuongBlur)" />
    <!-- Energy core -->
    <circle cx="12" cy="12" r="7" fill="url(#nangLuongCore)" />
    <!-- Energy waves -->
    <path
      d="M12 5C12 5 14 7 14 9C14 11 12 12 12 12C12 12 10 11 10 9C10 7 12 5 12 5Z"
      fill="#fef9c3"
      opacity="0.8"
    />
    <path
      d="M5 12C5 12 7 10 9 10C11 10 12 12 12 12C12 12 11 14 9 14C7 14 5 12 5 12Z"
      fill="#fef9c3"
      opacity="0.6"
    />
    <path
      d="M19 12C19 12 17 10 15 10C13 10 12 12 12 12C12 12 13 14 15 14C17 14 19 12 19 12Z"
      fill="#fef9c3"
      opacity="0.6"
    />
    <path
      d="M12 19C12 19 10 17 10 15C10 13 12 12 12 12C12 12 14 13 14 15C14 17 12 19 12 19Z"
      fill="#fef9c3"
      opacity="0.5"
    />
    <!-- Center bright spot -->
    <circle cx="11" cy="10" r="2" fill="#fffbeb" opacity="0.9" />
  </svg>
</template>
