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
      <linearGradient id="menuGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="50%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
    </defs>
    
    <!-- Menu bars with tech style -->
    <rect x="3" y="5" width="18" height="2.5" rx="0.5" fill="url(#menuGrad)" />
    <rect x="3" y="10.5" width="18" height="2.5" rx="0.5" fill="url(#menuGrad)" />
    <rect x="3" y="16" width="18" height="2.5" rx="0.5" fill="url(#menuGrad)" />
    
    <!-- Tech dots -->
    <circle cx="5" cy="6.25" r="0.8" fill="#0ea5e9" />
    <circle cx="5" cy="11.75" r="0.8" fill="#22c55e" />
    <circle cx="5" cy="17.25" r="0.8" fill="#f59e0b" />
    
    <!-- End accents -->
    <rect x="18" y="5.5" width="2" height="1.5" rx="0.2" fill="#334155" />
    <rect x="18" y="11" width="2" height="1.5" rx="0.2" fill="#334155" />
    <rect x="18" y="16.5" width="2" height="1.5" rx="0.2" fill="#334155" />
  </svg>
</template>
