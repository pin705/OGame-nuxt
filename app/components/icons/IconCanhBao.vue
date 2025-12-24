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
      <radialGradient id="warningGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </radialGradient>
    </defs>
    
    <!-- Warning triangle -->
    <path
      d="M12 3L2 21H22L12 3Z"
      fill="url(#warningGrad)"
      stroke="#d97706"
      stroke-width="0.5"
    />
    
    <!-- Triangle highlight -->
    <path d="M12 4L6 17L12 8L12 4Z" fill="#fef3c7" opacity="0.4" />
    
    <!-- Exclamation mark -->
    <rect x="11" y="9" width="2" height="6" rx="0.5" fill="#78350f" />
    <circle cx="12" cy="17.5" r="1.2" fill="#78350f" />
    
    <!-- Inner highlight on text -->
    <rect x="11.3" y="9.5" width="0.8" height="5" rx="0.3" fill="#fef3c7" opacity="0.4" />
    <circle cx="11.7" cy="17.2" r="0.4" fill="#fef3c7" opacity="0.4" />
  </svg>
</template>
