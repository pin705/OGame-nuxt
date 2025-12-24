<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="icon-chien-huu"
  >
    <!-- Two people connected - buddy/friend icon -->
    <!-- Person 1 (left) -->
    <circle cx="7" cy="7" r="3" fill="currentColor" />
    <path 
      d="M 2 18 Q 2 12 7 12 Q 12 12 12 18" 
      fill="currentColor"
      opacity="0.8"
    />
    
    <!-- Person 2 (right) -->
    <circle cx="17" cy="7" r="3" fill="currentColor" />
    <path 
      d="M 12 18 Q 12 12 17 12 Q 22 12 22 18" 
      fill="currentColor"
      opacity="0.8"
    />
    
    <!-- Connection/bond between them -->
    <path 
      d="M 9 8 Q 12 6 15 8" 
      stroke="currentColor" 
      stroke-width="1.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.6"
    />
    
    <!-- Handshake/connection in center bottom -->
    <circle 
      cx="12" 
      cy="15" 
      r="2" 
      fill="currentColor"
      opacity="0.5"
    />
    <path 
      d="M 10 14 L 8 16 M 14 14 L 16 16" 
      stroke="currentColor" 
      stroke-width="1.5"
      stroke-linecap="round"
      opacity="0.6"
    />
  </svg>
</template>
