<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="icon-tin-nhan"
  >
    <!-- Message/envelope icon -->
    <!-- Envelope body -->
    <rect 
      x="2" 
      y="5" 
      width="20" 
      height="14" 
      rx="2" 
      stroke="currentColor" 
      stroke-width="1.5"
      fill="none"
    />
    
    <!-- Envelope flap (open) -->
    <path 
      d="M 2 7 L 12 14 L 22 7" 
      stroke="currentColor" 
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
    
    <!-- Subtle lines representing text -->
    <line 
      x1="6" 
      y1="11" 
      x2="10" 
      y2="11" 
      stroke="currentColor" 
      stroke-width="1"
      opacity="0.4"
    />
    <line 
      x1="6" 
      y1="14" 
      x2="12" 
      y2="14" 
      stroke="currentColor" 
      stroke-width="1"
      opacity="0.3"
    />
    
    <!-- Notification dot (optional, can be controlled via prop) -->
    <circle 
      cx="20" 
      cy="6" 
      r="3" 
      fill="currentColor"
      class="notification-dot"
      opacity="0"
    />
  </svg>
</template>

<style scoped>
.icon-tin-nhan.has-unread .notification-dot {
  opacity: 1;
}
</style>
