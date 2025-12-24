<script setup lang="ts">
interface Props {
  rank: 1 | 2 | 3
}

const props = defineProps<Props>()

const colors = computed(() => {
  switch (props.rank) {
    case 1:
      return { main: '#FFD700', shadow: '#B8860B', shine: '#FFF8DC' }
    case 2:
      return { main: '#C0C0C0', shadow: '#808080', shine: '#FFFFFF' }
    case 3:
      return { main: '#CD7F32', shadow: '#8B4513', shine: '#DEB887' }
    default:
      return { main: '#C0C0C0', shadow: '#808080', shine: '#FFFFFF' }
  }
})
</script>

<template>
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    class="icon-huy-chuong"
  >
    <!-- Ribbon -->
    <path 
      d="M8 2 L6 10 L12 8 L18 10 L16 2 Z" 
      :fill="colors.shadow"
      opacity="0.8"
    />
    <path 
      d="M9 2 L7 9 L12 7 L17 9 L15 2 Z" 
      :fill="colors.main"
    />
    
    <!-- Medal circle -->
    <circle 
      cx="12" 
      cy="15" 
      r="7" 
      :fill="colors.shadow"
    />
    <circle 
      cx="12" 
      cy="15" 
      r="6" 
      :fill="colors.main"
    />
    <circle 
      cx="12" 
      cy="15" 
      r="4.5" 
      :fill="colors.shadow"
      opacity="0.3"
    />
    
    <!-- Shine effect -->
    <circle 
      cx="10" 
      cy="13" 
      r="1.5" 
      :fill="colors.shine"
      opacity="0.6"
    />
    
    <!-- Rank number -->
    <text 
      x="12" 
      y="16.5" 
      :fill="colors.shadow" 
      font-size="6" 
      font-weight="bold" 
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="system-ui, sans-serif"
    >{{ rank }}</text>
  </svg>
</template>
