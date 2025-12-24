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
      <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef3c7" />
        <stop offset="30%" stop-color="#fbbf24" />
        <stop offset="60%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
      </radialGradient>
      <filter id="galaxyBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
      </filter>
    </defs>
    <!-- Galaxy background glow -->
    <circle cx="12" cy="12" r="10" fill="url(#galaxyCore)" filter="url(#galaxyBlur)" opacity="0.7" />
    <!-- Spiral arms -->
    <path
      d="M12 12C12 12 14 8 18 7C22 6 22 12 18 14C14 16 12 12 12 12Z"
      fill="#c4b5fd"
      opacity="0.5"
    />
    <path
      d="M12 12C12 12 10 16 6 17C2 18 2 12 6 10C10 8 12 12 12 12Z"
      fill="#a78bfa"
      opacity="0.5"
    />
    <path
      d="M12 12C12 12 16 14 17 18C18 22 12 22 10 18C8 14 12 12 12 12Z"
      fill="#8b5cf6"
      opacity="0.4"
    />
    <path
      d="M12 12C12 12 8 10 7 6C6 2 12 2 14 6C16 10 12 12 12 12Z"
      fill="#7c3aed"
      opacity="0.4"
    />
    <!-- Core -->
    <circle cx="12" cy="12" r="3" fill="#fef3c7" />
    <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
    <!-- Stars -->
    <circle cx="5" cy="5" r="0.5" fill="#e0e7ff" />
    <circle cx="19" cy="6" r="0.4" fill="#e0e7ff" />
    <circle cx="4" cy="15" r="0.3" fill="#f5f3ff" />
    <circle cx="18" cy="18" r="0.5" fill="#e0e7ff" />
    <circle cx="8" cy="19" r="0.4" fill="#f5f3ff" />
    <circle cx="20" cy="11" r="0.3" fill="#e0e7ff" />
    <circle cx="3" cy="9" r="0.4" fill="#f5f3ff" />
  </svg>
</template>
