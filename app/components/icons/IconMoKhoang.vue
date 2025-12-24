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
      <linearGradient id="mineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="mineBeam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
    </defs>
    <!-- Mine structure base -->
    <path
      d="M4 20L6 12L10 10L12 6L14 10L18 12L20 20H4Z"
      fill="url(#mineGrad)"
      stroke="#334155"
      stroke-width="0.5"
    />
    <!-- Drilling tower -->
    <rect x="10" y="2" width="4" height="8" fill="#64748b" rx="0.5" />
    <rect x="11" y="3" width="2" height="2" fill="#94a3b8" rx="0.2" />
    <!-- Drill head -->
    <path d="M12 10L10 14L12 18L14 14L12 10Z" fill="#78716c" />
    <path d="M12 10L11 12L12 14L13 12L12 10Z" fill="#a8a29e" />
    <!-- Energy beam -->
    <line x1="12" y1="10" x2="12" y2="22" stroke="url(#mineBeam)" stroke-width="1" opacity="0.6" />
    <!-- Mining particles -->
    <circle cx="8" cy="16" r="1" fill="#94a3b8" opacity="0.7" />
    <circle cx="16" cy="17" r="0.8" fill="#94a3b8" opacity="0.6" />
    <circle cx="10" cy="18" r="0.6" fill="#cbd5e1" opacity="0.5" />
    <circle cx="14" cy="19" r="0.7" fill="#cbd5e1" opacity="0.6" />
  </svg>
</template>
