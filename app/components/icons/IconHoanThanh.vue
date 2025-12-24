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
      <radialGradient id="checkGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#22c55e" />
        <stop offset="100%" stop-color="#16a34a" />
      </radialGradient>
      <filter id="checkGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
      </filter>
    </defs>
    
    <!-- Glow -->
    <circle cx="12" cy="12" r="9" fill="#22c55e" opacity="0.2" filter="url(#checkGlow)" />
    
    <!-- Background circle -->
    <circle cx="12" cy="12" r="9" fill="url(#checkGrad)" stroke="#15803d" stroke-width="0.5" />
    
    <!-- Check mark -->
    <path
      d="M7 12L10.5 15.5L17 8"
      stroke="#dcfce7"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    
    <!-- Inner glow on check -->
    <path
      d="M7.5 12L10.5 15L16.5 8.5"
      stroke="#ffffff"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.5"
    />
  </svg>
</template>
