<script setup lang="ts">
defineProps<{
  size?: number
  class?: string
  direction?: 'up' | 'down' | 'left' | 'right'
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
    :style="{
      transform: direction === 'down' ? 'rotate(180deg)' 
        : direction === 'left' ? 'rotate(-90deg)' 
        : direction === 'right' ? 'rotate(90deg)' 
        : 'none'
    }"
  >
    <defs>
      <linearGradient id="arrowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#0ea5e9" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
    </defs>
    
    <!-- Arrow body -->
    <path
      d="M12 4L5 12H9V20H15V12H19L12 4Z"
      fill="url(#arrowGrad)"
      stroke="#0284c7"
      stroke-width="0.5"
    />
    
    <!-- Highlight -->
    <path d="M12 5L8 10H10V19H12V5Z" fill="#7dd3fc" opacity="0.4" />
    
    <!-- Speed lines -->
    <line x1="6" y1="16" x2="6" y2="20" stroke="#0ea5e9" stroke-width="0.5" opacity="0.5" />
    <line x1="18" y1="16" x2="18" y2="20" stroke="#0ea5e9" stroke-width="0.5" opacity="0.5" />
    <line x1="4" y1="18" x2="4" y2="21" stroke="#0ea5e9" stroke-width="0.3" opacity="0.3" />
    <line x1="20" y1="18" x2="20" y2="21" stroke="#0ea5e9" stroke-width="0.3" opacity="0.3" />
  </svg>
</template>
