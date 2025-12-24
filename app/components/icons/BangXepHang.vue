<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="icon-bang-xep-hang"
  >
    <!-- Podium / leaderboard icon -->
    <!-- First place (center, tallest) -->
    <rect 
      x="9" 
      y="6" 
      width="6" 
      height="12" 
      rx="1" 
      fill="currentColor"
    />
    <text 
      x="12" 
      y="14" 
      fill="var(--color-bg-primary, #0f172a)" 
      font-size="6" 
      font-weight="bold" 
      text-anchor="middle"
      dominant-baseline="middle"
    >1</text>
    
    <!-- Second place (left) -->
    <rect 
      x="2" 
      y="10" 
      width="6" 
      height="8" 
      rx="1" 
      fill="currentColor"
      opacity="0.7"
    />
    <text 
      x="5" 
      y="15" 
      fill="var(--color-bg-primary, #0f172a)" 
      font-size="5" 
      font-weight="bold" 
      text-anchor="middle"
      dominant-baseline="middle"
    >2</text>
    
    <!-- Third place (right) -->
    <rect 
      x="16" 
      y="12" 
      width="6" 
      height="6" 
      rx="1" 
      fill="currentColor"
      opacity="0.5"
    />
    <text 
      x="19" 
      y="16" 
      fill="var(--color-bg-primary, #0f172a)" 
      font-size="4" 
      font-weight="bold" 
      text-anchor="middle"
      dominant-baseline="middle"
    >3</text>
    
    <!-- Base line -->
    <line 
      x1="1" 
      y1="19" 
      x2="23" 
      y2="19" 
      stroke="currentColor" 
      stroke-width="2"
      stroke-linecap="round"
    />
    
    <!-- Crown/star on first place -->
    <path 
      d="M12 3 L13 5 L15 5 L13.5 6.5 L14 8 L12 7 L10 8 L10.5 6.5 L9 5 L11 5 Z" 
      fill="currentColor"
      opacity="0.9"
    />
  </svg>
</template>
