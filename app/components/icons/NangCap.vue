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
      <linearGradient id="upgradeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#059669" />
        <stop offset="100%" stop-color="#10b981" />
      </linearGradient>
      <filter id="upgradeGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
      </filter>
    </defs>
    <!-- Background glow -->
    <circle cx="12" cy="12" r="8" fill="#10b981" opacity="0.2" filter="url(#upgradeGlow)" />
    
    <!-- Circle base -->
    <circle cx="12" cy="12" r="9" fill="none" stroke="#065f46" stroke-width="2" />
    <circle cx="12" cy="12" r="9" fill="none" stroke="url(#upgradeGrad)" stroke-width="2" stroke-dasharray="14 42" stroke-dashoffset="-7" />
    
    <!-- Arrow up -->
    <path
      d="M12 5L17 12H14V19H10V12H7L12 5Z"
      fill="url(#upgradeGrad)"
      stroke="#047857"
      stroke-width="0.5"
    />
    <!-- Arrow highlight -->
    <path d="M12 6L15 11H13V18H12V6Z" fill="#34d399" opacity="0.5" />
    
    <!-- Plus signs -->
    <g fill="#6ee7b7" opacity="0.8">
      <path d="M4 8H6V7H4V8ZM5 6V9H4.5V6H5Z" />
      <path d="M18 16H20V15H18V16ZM19 14V17H18.5V14H19Z" />
    </g>
    
    <!-- Sparkles -->
    <circle cx="8" cy="5" r="0.5" fill="#a7f3d0" />
    <circle cx="17" cy="7" r="0.4" fill="#a7f3d0" />
    <circle cx="19" cy="12" r="0.5" fill="#a7f3d0" />
  </svg>
</template>
