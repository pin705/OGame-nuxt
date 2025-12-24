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
      <linearGradient id="tinhThachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8" />
        <stop offset="50%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
      <linearGradient id="tinhThachShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#94a3b8" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Crystal base -->
    <path
      d="M12 2L4 8L6 16L12 22L18 16L20 8L12 2Z"
      fill="url(#tinhThachGrad)"
      stroke="#334155"
      stroke-width="0.5"
    />
    <!-- Crystal facets -->
    <path d="M12 2L12 12L4 8L12 2Z" fill="url(#tinhThachShine)" opacity="0.6" />
    <path d="M12 2L20 8L12 12L12 2Z" fill="#cbd5e1" opacity="0.3" />
    <path d="M12 12L6 16L4 8L12 12Z" fill="#475569" opacity="0.5" />
    <path d="M12 12L18 16L20 8L12 12Z" fill="#64748b" opacity="0.4" />
    <path d="M12 12L12 22L6 16L12 12Z" fill="#334155" opacity="0.6" />
    <path d="M12 12L18 16L12 22L12 12Z" fill="#475569" opacity="0.5" />
    <!-- Shine highlight -->
    <path d="M10 5L12 4L14 6L12 7L10 5Z" fill="#f1f5f9" opacity="0.9" />
  </svg>
</template>
