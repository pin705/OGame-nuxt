<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="icon-lien-minh"
  >
    <!-- Alliance symbol - connected stars/people in a circle -->
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      stroke="currentColor" 
      stroke-width="1.5"
      stroke-dasharray="2 2"
      opacity="0.4"
    />
    <!-- Central connection point -->
    <circle 
      cx="12" 
      cy="12" 
      r="2" 
      fill="currentColor"
      opacity="0.6"
    />
    <!-- Top member -->
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    <line x1="12" y1="7" x2="12" y2="10" stroke="currentColor" stroke-width="1.5" />
    <!-- Bottom left member -->
    <circle cx="5.5" cy="16" r="2" fill="currentColor" />
    <line x1="7" y1="14.5" x2="10" y2="12.5" stroke="currentColor" stroke-width="1.5" />
    <!-- Bottom right member -->
    <circle cx="18.5" cy="16" r="2" fill="currentColor" />
    <line x1="17" y1="14.5" x2="14" y2="12.5" stroke="currentColor" stroke-width="1.5" />
    <!-- Connection lines between members -->
    <path 
      d="M 7 15 Q 12 18 17 15" 
      stroke="currentColor" 
      stroke-width="1" 
      fill="none"
      opacity="0.5"
    />
  </svg>
</template>
