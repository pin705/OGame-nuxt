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
      <linearGradient id="dienNangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#0891b2" />
      </linearGradient>
      <filter id="dienNangGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
      </filter>
    </defs>
    <!-- Electric glow background -->
    <path
      d="M13 2L4 14H11L10 22L19 10H12L13 2Z"
      fill="#22d3ee"
      opacity="0.3"
      filter="url(#dienNangGlow)"
    />
    <!-- Lightning bolt main -->
    <path
      d="M13 2L4 14H11L10 22L19 10H12L13 2Z"
      fill="url(#dienNangGrad)"
      stroke="#0e7490"
      stroke-width="0.5"
    />
    <!-- Highlight -->
    <path d="M12.5 3L10.5 7H12L11 10L14 6H12.5L14 3L12.5 3Z" fill="#ecfeff" opacity="0.7" />
    <!-- Energy spark -->
    <circle cx="8" cy="11" r="1" fill="#67e8f9" opacity="0.8" />
    <circle cx="15" cy="8" r="0.7" fill="#67e8f9" opacity="0.6" />
    <circle cx="11" cy="16" r="0.8" fill="#67e8f9" opacity="0.7" />
  </svg>
</template>
