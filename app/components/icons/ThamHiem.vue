<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="1.5" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <!-- Compass-like star field exploration -->
    <circle cx="12" cy="12" r="9" stroke-dasharray="2 2" opacity="0.5" />
    <circle cx="12" cy="12" r="4" />
    
    <!-- Direction arrows -->
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    
    <!-- Stars/dots representing unknown space -->
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="18" cy="6" r="0.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
    <circle cx="6" cy="18" r="0.5" fill="currentColor" />
    
    <!-- Question mark for unknown -->
    <path d="M11 11.5c0-1 1-1.5 1.5-1.5s1 .5 1 1c0 .5-.5 1-1 1.5v.5" />
    <circle cx="12" cy="14.5" r="0.3" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
</script>
