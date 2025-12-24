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
      <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
    </defs>
    
    <!-- Outer gear -->
    <path
      d="M12 2L13.5 4.5L16.5 4L17.5 7L20.5 8L20 11L22 13L20 15L20.5 18L17.5 19L16.5 22L13.5 21.5L12 24L10.5 21.5L7.5 22L6.5 19L3.5 18L4 15L2 13L4 11L3.5 8L6.5 7L7.5 4L10.5 4.5L12 2Z"
      fill="url(#settingsGrad)"
      stroke="#94a3b8"
      stroke-width="0.5"
    />
    
    <!-- Inner circle -->
    <circle cx="12" cy="13" r="5" fill="#1e293b" stroke="#64748b" stroke-width="0.5" />
    
    <!-- Core -->
    <circle cx="12" cy="13" r="2.5" fill="#334155" />
    <circle cx="12" cy="13" r="1" fill="#0ea5e9" />
    
    <!-- Tech details -->
    <g stroke="#94a3b8" stroke-width="0.3" opacity="0.6">
      <line x1="12" y1="8" x2="12" y2="10" />
      <line x1="12" y1="16" x2="12" y2="18" />
      <line x1="7" y1="13" x2="9" y2="13" />
      <line x1="15" y1="13" x2="17" y2="13" />
    </g>
    
    <!-- Gear teeth highlights -->
    <circle cx="13.5" cy="4.5" r="0.5" fill="#94a3b8" opacity="0.5" />
    <circle cx="20" cy="11" r="0.5" fill="#94a3b8" opacity="0.5" />
    <circle cx="13.5" cy="21.5" r="0.5" fill="#94a3b8" opacity="0.5" />
    <circle cx="4" cy="11" r="0.5" fill="#94a3b8" opacity="0.5" />
  </svg>
</template>
