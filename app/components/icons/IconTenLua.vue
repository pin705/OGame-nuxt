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
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="50%" stop-color="#94a3b8" />
        <stop offset="100%" stop-color="#64748b" />
      </linearGradient>
      <linearGradient id="rocketFire" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7" />
        <stop offset="30%" stop-color="#fbbf24" />
        <stop offset="70%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
      <filter id="rocketGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
    </defs>
    
    <!-- Fire glow -->
    <ellipse cx="12" cy="20" rx="3" ry="4" fill="#f97316" opacity="0.3" filter="url(#rocketGlow)" />
    
    <!-- Rocket body -->
    <path
      d="M12 2C12 2 8 6 8 12V16L10 18V14C10 10 12 6 12 6C12 6 14 10 14 14V18L16 16V12C16 6 12 2 12 2Z"
      fill="url(#rocketGrad)"
      stroke="#475569"
      stroke-width="0.5"
    />
    
    <!-- Nose cone highlight -->
    <path d="M12 2C12 2 10 5 10 8L12 4L14 8C14 5 12 2 12 2Z" fill="#e2e8f0" opacity="0.6" />
    
    <!-- Window -->
    <circle cx="12" cy="9" r="1.5" fill="#0ea5e9" stroke="#0369a1" stroke-width="0.3" />
    <circle cx="11.5" cy="8.5" r="0.5" fill="#7dd3fc" />
    
    <!-- Fins -->
    <path d="M8 14L5 18L6 18L8 16V14Z" fill="#475569" stroke="#64748b" stroke-width="0.2" />
    <path d="M16 14L19 18L18 18L16 16V14Z" fill="#475569" stroke="#64748b" stroke-width="0.2" />
    
    <!-- Engine -->
    <rect x="10" y="17" width="4" height="2" fill="#374151" rx="0.3" />
    
    <!-- Flame -->
    <path
      d="M10.5 19L12 24L13.5 19L12 21L10.5 19Z"
      fill="url(#rocketFire)"
    />
    <path
      d="M11 19L12 22L13 19L12 20.5L11 19Z"
      fill="#fef3c7"
      opacity="0.8"
    />
    
    <!-- Body details -->
    <line x1="8" y1="12" x2="16" y2="12" stroke="#64748b" stroke-width="0.3" />
    <line x1="9" y1="14" x2="15" y2="14" stroke="#64748b" stroke-width="0.3" />
  </svg>
</template>
