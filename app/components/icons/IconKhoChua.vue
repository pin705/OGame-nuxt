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
      <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4b5563" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>
      <linearGradient id="storageFill" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#60a5fa" />
      </linearGradient>
    </defs>
    
    <!-- Storage tank body -->
    <path
      d="M5 6C5 4.5 8 3 12 3C16 3 19 4.5 19 6V18C19 19.5 16 21 12 21C8 21 5 19.5 5 18V6Z"
      fill="url(#storageGrad)"
      stroke="#6b7280"
      stroke-width="0.5"
    />
    
    <!-- Top ellipse -->
    <ellipse cx="12" cy="6" rx="7" ry="3" fill="#374151" stroke="#6b7280" stroke-width="0.3" />
    <ellipse cx="12" cy="6" rx="5" ry="2" fill="#1f2937" />
    
    <!-- Fill level -->
    <path
      d="M6 18C6 16.8 8.5 16 12 16C15.5 16 18 16.8 18 18V10C18 11.2 15.5 12 12 12C8.5 12 6 11.2 6 10V18Z"
      fill="url(#storageFill)"
      opacity="0.7"
    />
    
    <!-- Tank bands -->
    <ellipse cx="12" cy="9" rx="6.5" ry="2.5" fill="none" stroke="#4b5563" stroke-width="0.8" />
    <ellipse cx="12" cy="15" rx="6.5" ry="2.5" fill="none" stroke="#4b5563" stroke-width="0.8" />
    
    <!-- Level indicators -->
    <g fill="#22c55e">
      <rect x="19.5" y="16" width="2" height="1" rx="0.2" />
      <rect x="19.5" y="14" width="2" height="1" rx="0.2" />
      <rect x="19.5" y="12" width="2" height="1" rx="0.2" opacity="0.5" />
      <rect x="19.5" y="10" width="2" height="1" rx="0.2" opacity="0.3" />
    </g>
    
    <!-- Pipes -->
    <rect x="2" y="14" width="3" height="1.5" rx="0.3" fill="#374151" />
    <circle cx="2" cy="14.75" r="1" fill="#4b5563" />
    
    <!-- Details -->
    <circle cx="12" cy="6" r="1" fill="#6b7280" />
    <line x1="12" y1="4" x2="12" y2="5" stroke="#9ca3af" stroke-width="0.5" />
  </svg>
</template>
