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
      <radialGradient id="planetGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="50%" stop-color="#2563eb" />
        <stop offset="100%" stop-color="#1e3a8a" />
      </radialGradient>
      <radialGradient id="planetAtmos" cx="50%" cy="50%" r="50%">
        <stop offset="80%" stop-color="transparent" />
        <stop offset="100%" stop-color="#93c5fd" stop-opacity="0.3" />
      </radialGradient>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#94a3b8" stop-opacity="0" />
        <stop offset="30%" stop-color="#cbd5e1" />
        <stop offset="70%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#94a3b8" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Planet shadow -->
    <ellipse cx="13" cy="13" rx="8" ry="8" fill="#0f172a" opacity="0.3" />
    <!-- Planet body -->
    <circle cx="12" cy="12" r="8" fill="url(#planetGrad)" />
    <!-- Surface features -->
    <ellipse cx="9" cy="9" rx="3" ry="1.5" fill="#3b82f6" opacity="0.5" transform="rotate(-20 9 9)" />
    <ellipse cx="14" cy="14" rx="2" ry="1" fill="#1d4ed8" opacity="0.4" transform="rotate(30 14 14)" />
    <ellipse cx="10" cy="15" rx="1.5" ry="0.8" fill="#3b82f6" opacity="0.3" />
    <!-- Atmosphere glow -->
    <circle cx="12" cy="12" r="8" fill="url(#planetAtmos)" />
    <!-- Ring -->
    <ellipse
      cx="12"
      cy="12"
      rx="11"
      ry="3"
      fill="none"
      stroke="url(#ringGrad)"
      stroke-width="1.5"
      transform="rotate(-15 12 12)"
    />
    <!-- Highlight -->
    <circle cx="8" cy="8" r="2" fill="#bfdbfe" opacity="0.4" />
  </svg>
</template>
