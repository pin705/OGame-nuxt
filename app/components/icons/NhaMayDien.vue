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
      <radialGradient id="solarCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef9c3" />
        <stop offset="30%" stop-color="#fbbf24" />
        <stop offset="60%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </radialGradient>
      <linearGradient id="panelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#1e40af" />
      </linearGradient>
      <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
      </filter>
    </defs>
    
    <!-- Sun glow -->
    <circle cx="18" cy="5" r="5" fill="#fbbf24" opacity="0.3" filter="url(#sunGlow)" />
    <!-- Sun -->
    <circle cx="18" cy="5" r="3" fill="url(#solarCore)" />
    
    <!-- Sun rays -->
    <g stroke="#fbbf24" stroke-width="0.5" opacity="0.7">
      <line x1="18" y1="0" x2="18" y2="1" />
      <line x1="22" y1="5" x2="23" y2="5" />
      <line x1="18" y1="9" x2="18" y2="10" />
      <line x1="14" y1="5" x2="13" y2="5" />
      <line x1="21" y1="2" x2="21.7" y2="1.3" />
      <line x1="21" y1="8" x2="21.7" y2="8.7" />
      <line x1="15" y1="8" x2="14.3" y2="8.7" />
      <line x1="15" y1="2" x2="14.3" y2="1.3" />
    </g>
    
    <!-- Solar panels base -->
    <rect x="2" y="14" width="18" height="8" rx="0.5" fill="#0f172a" />
    
    <!-- Solar panel cells -->
    <g fill="url(#panelGrad)">
      <rect x="3" y="15" width="3.5" height="3" rx="0.2" />
      <rect x="7" y="15" width="3.5" height="3" rx="0.2" />
      <rect x="11" y="15" width="3.5" height="3" rx="0.2" />
      <rect x="15" y="15" width="3.5" height="3" rx="0.2" />
      <rect x="3" y="18.5" width="3.5" height="3" rx="0.2" />
      <rect x="7" y="18.5" width="3.5" height="3" rx="0.2" />
      <rect x="11" y="18.5" width="3.5" height="3" rx="0.2" />
      <rect x="15" y="18.5" width="3.5" height="3" rx="0.2" />
    </g>
    
    <!-- Panel grid lines -->
    <g stroke="#3b82f6" stroke-width="0.2" opacity="0.6">
      <line x1="4.5" y1="15" x2="4.5" y2="18" />
      <line x1="3" y1="16.5" x2="6.5" y2="16.5" />
      <line x1="8.5" y1="15" x2="8.5" y2="18" />
      <line x1="7" y1="16.5" x2="10.5" y2="16.5" />
    </g>
    
    <!-- Energy beam from sun -->
    <path d="M15 8L10 14" stroke="#fbbf24" stroke-width="1" stroke-dasharray="2 1" opacity="0.5" />
    
    <!-- Support structure -->
    <rect x="10" y="12" width="2" height="2" fill="#374151" rx="0.2" />
  </svg>
</template>
