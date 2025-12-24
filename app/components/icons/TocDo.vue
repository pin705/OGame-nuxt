<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Speedometer arc -->
    <path d="M12 20a8 8 0 110-16 8 8 0 010 16z" />
    <!-- Speed indicator needle -->
    <path d="M12 12l4-4" stroke-width="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <!-- Speed marks -->
    <line x1="12" y1="4" x2="12" y2="6" />
    <line x1="4" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="20" y2="12" />
    <line x1="6.3" y1="6.3" x2="7.7" y2="7.7" />
    <line x1="17.7" y1="6.3" x2="16.3" y2="7.7" />
    <!-- Speed trails -->
    <path d="M2 14h3" opacity="0.5" />
    <path d="M2 17h2" opacity="0.3" />
  </svg>
</template>

<script setup lang="ts">
</script>
