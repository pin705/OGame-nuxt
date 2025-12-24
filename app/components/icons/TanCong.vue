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
      <linearGradient id="swordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="50%" stop-color="#94a3b8" />
        <stop offset="100%" stop-color="#64748b" />
      </linearGradient>
      <linearGradient id="attackGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
    </defs>
    <!-- Attack burst effect -->
    <circle cx="18" cy="6" r="4" fill="#ef4444" opacity="0.2" />
    <circle cx="18" cy="6" r="2" fill="#f87171" opacity="0.4" />
    
    <!-- Blade -->
    <path
      d="M4 20L16 8L18 6L20 4L19 7L17 9L5 21L4 20Z"
      fill="url(#swordGrad)"
      stroke="#475569"
      stroke-width="0.5"
    />
    <!-- Blade edge highlight -->
    <path d="M5 19L16 8L17 9L6 20L5 19Z" fill="#e2e8f0" opacity="0.6" />
    
    <!-- Handle -->
    <rect x="3" y="19" width="3" height="3" rx="0.5" fill="#78350f" transform="rotate(-45 4.5 20.5)" />
    <rect x="2.5" y="19.5" width="1" height="4" rx="0.3" fill="#451a03" transform="rotate(-45 3 21.5)" />
    
    <!-- Cross guard -->
    <path d="M6 17L8 15L9 16L7 18L6 17Z" fill="#d97706" />
    
    <!-- Attack lines -->
    <path d="M18 6L22 2" stroke="url(#attackGlow)" stroke-width="1.5" stroke-linecap="round" />
    <path d="M19 8L23 6" stroke="#ef4444" stroke-width="1" stroke-linecap="round" opacity="0.6" />
    <path d="M20 5L23 3" stroke="#ef4444" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />
    
    <!-- Sparks -->
    <circle cx="20" cy="4" r="0.5" fill="#fbbf24" />
    <circle cx="21" cy="6" r="0.4" fill="#fbbf24" opacity="0.7" />
  </svg>
</template>
