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
      <linearGradient id="labGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e40af" />
        <stop offset="100%" stop-color="#1e3a8a" />
      </linearGradient>
      <radialGradient id="labCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#2563eb" />
      </radialGradient>
    </defs>
    <!-- Lab dome -->
    <ellipse cx="12" cy="18" rx="9" ry="3" fill="#0f172a" />
    <path
      d="M3 18C3 18 3 10 12 6C21 10 21 18 21 18H3Z"
      fill="url(#labGrad)"
      stroke="#3b82f6"
      stroke-width="0.5"
    />
    <!-- Dome glass panels -->
    <path d="M12 6L8 12L12 18L12 6Z" fill="#3b82f6" opacity="0.3" />
    <path d="M12 6L16 12L12 18L12 6Z" fill="#60a5fa" opacity="0.2" />
    <!-- Research core -->
    <circle cx="12" cy="13" r="3" fill="url(#labCore)" />
    <circle cx="12" cy="13" r="1.5" fill="#dbeafe" />
    <!-- Energy rings -->
    <ellipse
      cx="12"
      cy="13"
      rx="5"
      ry="1.5"
      fill="none"
      stroke="#60a5fa"
      stroke-width="0.5"
      opacity="0.6"
    />
    <ellipse
      cx="12"
      cy="13"
      rx="1.5"
      ry="5"
      fill="none"
      stroke="#60a5fa"
      stroke-width="0.5"
      opacity="0.6"
    />
    <!-- Data streams -->
    <path d="M7 10L6 8M17 10L18 8" stroke="#93c5fd" stroke-width="0.5" opacity="0.8" />
    <circle cx="6" cy="8" r="0.8" fill="#60a5fa" />
    <circle cx="18" cy="8" r="0.8" fill="#60a5fa" />
    <!-- Top antenna -->
    <line x1="12" y1="6" x2="12" y2="3" stroke="#64748b" stroke-width="1" />
    <circle cx="12" cy="2.5" r="1" fill="#3b82f6" />
  </svg>
</template>
