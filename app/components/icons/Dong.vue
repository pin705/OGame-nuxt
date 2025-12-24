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
      <linearGradient id="closeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="12" cy="12" r="10" fill="#1e293b" stroke="#374151" stroke-width="0.5" />
    
    <!-- X mark -->
    <path
      d="M8 8L16 16M16 8L8 16"
      stroke="url(#closeGrad)"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    
    <!-- Subtle glow -->
    <circle cx="12" cy="12" r="10" fill="none" stroke="#ef4444" stroke-width="0.3" opacity="0.3" />
  </svg>
</template>
