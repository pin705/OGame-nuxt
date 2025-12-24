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
      <linearGradient id="commandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#4338ca" />
      </linearGradient>
      <radialGradient id="holoGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a5b4fc" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.2" />
      </radialGradient>
    </defs>
    <!-- Base platform -->
    <ellipse cx="12" cy="20" rx="10" ry="2" fill="#1e1b4b" />
    <ellipse cx="12" cy="19" rx="8" ry="1.5" fill="#312e81" />
    
    <!-- Console structure -->
    <path
      d="M4 19L6 10L18 10L20 19H4Z"
      fill="url(#commandGrad)"
      stroke="#818cf8"
      stroke-width="0.5"
    />
    
    <!-- Screen -->
    <rect x="7" y="11" width="10" height="6" rx="0.5" fill="#0f172a" />
    <rect x="8" y="12" width="8" height="4" rx="0.3" fill="url(#holoGrad)" />
    
    <!-- Holographic display -->
    <ellipse cx="12" cy="6" rx="5" ry="2" fill="#818cf8" opacity="0.3" />
    <ellipse cx="12" cy="6" rx="3" ry="1.2" fill="#a5b4fc" opacity="0.5" />
    <circle cx="12" cy="6" r="1" fill="#e0e7ff" />
    
    <!-- Connection beam -->
    <path d="M12 8L12 12" stroke="#818cf8" stroke-width="0.5" stroke-dasharray="1 1" opacity="0.6" />
    
    <!-- Holographic rings -->
    <ellipse cx="12" cy="6" rx="6" ry="2.5" fill="none" stroke="#a5b4fc" stroke-width="0.3" opacity="0.4" />
    <ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="#818cf8" stroke-width="0.2" opacity="0.3" />
    
    <!-- Control buttons -->
    <circle cx="9" cy="14" r="0.5" fill="#22c55e" />
    <circle cx="11" cy="14" r="0.5" fill="#f59e0b" />
    <circle cx="13" cy="14" r="0.5" fill="#ef4444" />
    
    <!-- Data streams on screen -->
    <line x1="9" y1="13" x2="14" y2="13" stroke="#60a5fa" stroke-width="0.3" opacity="0.8" />
    <line x1="9" y1="14.5" x2="12" y2="14.5" stroke="#34d399" stroke-width="0.3" opacity="0.6" />
  </svg>
</template>
