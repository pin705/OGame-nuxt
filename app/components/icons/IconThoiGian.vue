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
      <radialGradient id="timerGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <linearGradient id="timerProgress" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#0ea5e9" />
      </linearGradient>
    </defs>
    
    <!-- Outer ring -->
    <circle cx="12" cy="12" r="10" fill="url(#timerGrad)" stroke="#334155" stroke-width="1" />
    
    <!-- Progress track -->
    <circle cx="12" cy="12" r="8" fill="none" stroke="#1e293b" stroke-width="2" />
    
    <!-- Progress arc (75% complete example) -->
    <circle
      cx="12"
      cy="12"
      r="8"
      fill="none"
      stroke="url(#timerProgress)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="37.7 50.3"
      transform="rotate(-90 12 12)"
    />
    
    <!-- Inner circle -->
    <circle cx="12" cy="12" r="5" fill="#0f172a" stroke="#334155" stroke-width="0.5" />
    
    <!-- Clock hands -->
    <line x1="12" y1="12" x2="12" y2="8" stroke="#e2e8f0" stroke-width="1" stroke-linecap="round" />
    <line x1="12" y1="12" x2="15" y2="14" stroke="#94a3b8" stroke-width="0.8" stroke-linecap="round" />
    
    <!-- Center dot -->
    <circle cx="12" cy="12" r="1" fill="#22d3ee" />
    
    <!-- Hour markers -->
    <g fill="#64748b">
      <circle cx="12" cy="4" r="0.5" />
      <circle cx="20" cy="12" r="0.5" />
      <circle cx="12" cy="20" r="0.5" />
      <circle cx="4" cy="12" r="0.5" />
    </g>
    
    <!-- Glow effect -->
    <circle cx="12" cy="12" r="10" fill="none" stroke="#22d3ee" stroke-width="0.5" opacity="0.3" />
  </svg>
</template>
