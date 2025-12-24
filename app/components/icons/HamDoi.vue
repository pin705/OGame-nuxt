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
      <linearGradient id="fleetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>
      <linearGradient id="fleetTrail" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#f97316" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Lead ship -->
    <path d="M14 8L22 11L14 14L12 11L14 8Z" fill="url(#fleetGrad)" stroke="#64748b" stroke-width="0.3" />
    <path d="M6 11L12 11" stroke="url(#fleetTrail)" stroke-width="1.5" opacity="0.7" />
    <circle cx="18" cy="11" r="1" fill="#0ea5e9" opacity="0.8" />
    
    <!-- Second ship -->
    <path d="M10 4L16 6L10 8L9 6L10 4Z" fill="url(#fleetGrad)" stroke="#64748b" stroke-width="0.2" />
    <path d="M4 6L9 6" stroke="url(#fleetTrail)" stroke-width="1" opacity="0.5" />
    <circle cx="13" cy="6" r="0.6" fill="#0ea5e9" opacity="0.7" />
    
    <!-- Third ship -->
    <path d="M10 16L16 18L10 20L9 18L10 16Z" fill="url(#fleetGrad)" stroke="#64748b" stroke-width="0.2" />
    <path d="M4 18L9 18" stroke="url(#fleetTrail)" stroke-width="1" opacity="0.5" />
    <circle cx="13" cy="18" r="0.6" fill="#0ea5e9" opacity="0.7" />
    
    <!-- Formation lines -->
    <path d="M12 11L10 6M12 11L10 18" stroke="#60a5fa" stroke-width="0.3" stroke-dasharray="1 1" opacity="0.4" />
    
    <!-- Stars -->
    <circle cx="3" cy="3" r="0.3" fill="#e2e8f0" />
    <circle cx="5" cy="14" r="0.2" fill="#e2e8f0" />
    <circle cx="2" cy="21" r="0.3" fill="#e2e8f0" />
  </svg>
</template>
