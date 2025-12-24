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
      <linearGradient id="infoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="12" cy="12" r="10" fill="url(#infoGrad)" stroke="#1d4ed8" stroke-width="0.5" />
    
    <!-- Circle highlight -->
    <path
      d="M6 8C8 4 16 4 18 8C14 6 10 6 6 8Z"
      fill="#93c5fd"
      opacity="0.4"
    />
    
    <!-- Info "i" -->
    <circle cx="12" cy="7.5" r="1.3" fill="#dbeafe" />
    <rect x="10.8" y="10" width="2.4" height="7" rx="0.5" fill="#dbeafe" />
    
    <!-- Inner highlight -->
    <circle cx="11.7" cy="7.2" r="0.4" fill="#ffffff" opacity="0.6" />
    <rect x="11" y="10.5" width="0.8" height="6" rx="0.3" fill="#ffffff" opacity="0.3" />
  </svg>
</template>
