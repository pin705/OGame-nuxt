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
      <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#4f46e5" />
      </linearGradient>
      <radialGradient id="userHead" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#e0e7ff" />
        <stop offset="100%" stop-color="#a5b4fc" />
      </radialGradient>
    </defs>
    
    <!-- Aura glow -->
    <ellipse cx="12" cy="20" rx="8" ry="2" fill="#6366f1" opacity="0.2" />
    
    <!-- Body -->
    <path
      d="M6 21C6 17 8 15 12 15C16 15 18 17 18 21H6Z"
      fill="url(#userGrad)"
      stroke="#818cf8"
      stroke-width="0.5"
    />
    
    <!-- Suit collar details -->
    <path d="M10 15L12 17L14 15" stroke="#a5b4fc" stroke-width="0.5" fill="none" />
    <path d="M9 17L12 19L15 17" stroke="#818cf8" stroke-width="0.3" fill="none" opacity="0.6" />
    
    <!-- Head -->
    <circle cx="12" cy="9" r="5" fill="url(#userHead)" stroke="#c7d2fe" stroke-width="0.5" />
    
    <!-- Face features -->
    <circle cx="10" cy="8" r="0.7" fill="#4338ca" /> <!-- Left eye -->
    <circle cx="14" cy="8" r="0.7" fill="#4338ca" /> <!-- Right eye -->
    <path d="M10.5 10.5Q12 11.5 13.5 10.5" stroke="#4338ca" stroke-width="0.5" fill="none" /> <!-- Smile -->
    
    <!-- Helmet visor hint -->
    <path
      d="M7 8C7 5 9 3 12 3C15 3 17 5 17 8"
      fill="none"
      stroke="#a5b4fc"
      stroke-width="0.3"
      opacity="0.5"
    />
    
    <!-- Rank insignia -->
    <path d="M8 18L9 17L10 18L9 19Z" fill="#fbbf24" opacity="0.8" />
    
    <!-- Energy field particles -->
    <circle cx="5" cy="16" r="0.3" fill="#a5b4fc" opacity="0.6" />
    <circle cx="19" cy="17" r="0.4" fill="#a5b4fc" opacity="0.5" />
    <circle cx="6" cy="19" r="0.3" fill="#c7d2fe" opacity="0.4" />
  </svg>
</template>
