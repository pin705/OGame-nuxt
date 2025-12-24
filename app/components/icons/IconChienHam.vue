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
      <linearGradient id="fighterBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="fighterEngine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="50%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#fef3c7" />
      </linearGradient>
    </defs>
    <!-- Engine trails -->
    <path d="M3 14L7 12.5L3 11L0 12.5L3 14Z" fill="url(#fighterEngine)" opacity="0.8" />
    <path d="M3 18L7 16.5L3 15L0 16.5L3 18Z" fill="url(#fighterEngine)" opacity="0.6" />
    <!-- Main body -->
    <path
      d="M8 10L20 12L22 14L20 16L8 18L6 14L8 10Z"
      fill="url(#fighterBody)"
      stroke="#64748b"
      stroke-width="0.3"
    />
    <!-- Wings -->
    <path d="M10 10L14 6L16 6L14 10L10 10Z" fill="#334155" stroke="#475569" stroke-width="0.3" />
    <path d="M10 18L14 22L16 22L14 18L10 18Z" fill="#334155" stroke="#475569" stroke-width="0.3" />
    <!-- Cockpit -->
    <ellipse cx="16" cy="14" rx="2" ry="1.5" fill="#0ea5e9" opacity="0.8" />
    <ellipse cx="16.5" cy="13.5" rx="1" ry="0.5" fill="#7dd3fc" opacity="0.6" />
    <!-- Weapon ports -->
    <circle cx="20" cy="12" r="0.5" fill="#ef4444" />
    <circle cx="20" cy="16" r="0.5" fill="#ef4444" />
    <!-- Hull details -->
    <line x1="10" y1="12" x2="18" y2="12" stroke="#64748b" stroke-width="0.3" />
    <line x1="10" y1="16" x2="18" y2="16" stroke="#64748b" stroke-width="0.3" />
  </svg>
</template>
