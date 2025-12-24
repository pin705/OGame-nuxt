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
      <linearGradient id="honThachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c4b5fd" />
        <stop offset="50%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#6d28d9" />
      </linearGradient>
      <radialGradient id="honThachInner" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#e9d5ff" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </radialGradient>
      <filter id="honThachGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
      </filter>
    </defs>
    <!-- Soul energy aura -->
    <ellipse cx="12" cy="12" rx="9" ry="7" fill="#a78bfa" opacity="0.3" filter="url(#honThachGlow)" />
    <!-- Main gem body -->
    <path
      d="M12 3L17 7L19 12L17 17L12 21L7 17L5 12L7 7L12 3Z"
      fill="url(#honThachGrad)"
      stroke="#7c3aed"
      stroke-width="0.5"
    />
    <!-- Inner crystal structure -->
    <path d="M12 3L12 12L7 7L12 3Z" fill="url(#honThachInner)" opacity="0.7" />
    <path d="M12 3L17 7L12 12L12 3Z" fill="#ddd6fe" opacity="0.5" />
    <path d="M12 12L7 17L5 12L7 7L12 12Z" fill="#6d28d9" opacity="0.4" />
    <path d="M12 12L17 17L19 12L17 7L12 12Z" fill="#7c3aed" opacity="0.3" />
    <path d="M12 12L12 21L7 17L12 12Z" fill="#4c1d95" opacity="0.5" />
    <path d="M12 12L17 17L12 21L12 12Z" fill="#5b21b6" opacity="0.4" />
    <!-- Soul spark -->
    <circle cx="10" cy="8" r="1.5" fill="#f5f3ff" opacity="0.9" />
    <circle cx="11" cy="9" r="0.5" fill="#ffffff" />
    <!-- Mystical swirl -->
    <path
      d="M9 13C9 13 10 11 12 11C14 11 15 13 15 13C15 13 14 15 12 15C10 15 9 13 9 13Z"
      fill="#c4b5fd"
      opacity="0.5"
    />
  </svg>
</template>
