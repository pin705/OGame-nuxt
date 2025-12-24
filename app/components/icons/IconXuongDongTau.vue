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
      <linearGradient id="shipyardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#374151" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>
      <linearGradient id="shipyardGlow" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Shipyard base -->
    <rect x="2" y="16" width="20" height="6" fill="#1f2937" rx="1" />
    <!-- Main hangar -->
    <path
      d="M4 16L6 8L18 8L20 16H4Z"
      fill="url(#shipyardGrad)"
      stroke="#4b5563"
      stroke-width="0.5"
    />
    <!-- Hangar entrance -->
    <rect x="8" y="12" width="8" height="4" fill="#111827" rx="0.5" />
    <rect x="9" y="13" width="6" height="2" fill="url(#shipyardGlow)" opacity="0.6" />
    <!-- Construction cranes -->
    <path d="M5 8L5 4L8 4L8 5L6 5L6 8" stroke="#6b7280" stroke-width="0.8" fill="none" />
    <path d="M19 8L19 4L16 4L16 5L18 5L18 8" stroke="#6b7280" stroke-width="0.8" fill="none" />
    <!-- Ship in construction -->
    <path d="M10 7L12 5L14 7L12 9L10 7Z" fill="#9ca3af" stroke="#6b7280" stroke-width="0.3" />
    <circle cx="12" cy="7" r="1" fill="#60a5fa" opacity="0.8" />
    <!-- Welding sparks -->
    <circle cx="7" cy="6" r="0.5" fill="#fbbf24" opacity="0.9" />
    <circle cx="17" cy="5" r="0.4" fill="#fbbf24" opacity="0.7" />
    <circle cx="8" cy="4" r="0.3" fill="#fde68a" opacity="0.8" />
    <!-- Status lights -->
    <circle cx="4" cy="18" r="0.8" fill="#22c55e" />
    <circle cx="20" cy="18" r="0.8" fill="#22c55e" />
  </svg>
</template>
