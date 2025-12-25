<script setup lang="ts">
import { onResourceGain, type ResourceGain } from '~/composables/useResources'

interface GainPopup {
  id: number
  type: 'metal' | 'crystal' | 'deuterium'
  value: number
  x: number
  y: number
}

const popups = ref<GainPopup[]>([])
let popupId = 0

// Random offset for visual variety
const getRandomOffset = () => ({
  x: Math.random() * 60 - 30, // -30 to 30
  y: Math.random() * 10 - 5,  // -5 to 5
})

onMounted(() => {
  // Subscribe to resource gain events
  const unsubscribe = onResourceGain((gain: ResourceGain) => {
    const container = document.querySelector('.resource-bar-container')
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    
    // Only show if gain is significant enough
    if (gain.tinhThach > 0.01) {
      const offset = getRandomOffset()
      popups.value.push({
        id: popupId++,
        type: 'metal',
        value: gain.tinhThach,
        x: rect.left + 80 + offset.x,
        y: rect.top + 20 + offset.y,
      })
    }
    
    if (gain.nangLuongVuTru > 0.01) {
      const offset = getRandomOffset()
      popups.value.push({
        id: popupId++,
        type: 'crystal',
        value: gain.nangLuongVuTru,
        x: rect.left + 200 + offset.x,
        y: rect.top + 20 + offset.y,
      })
    }
    
    if (gain.honThach > 0.005) {
      const offset = getRandomOffset()
      popups.value.push({
        id: popupId++,
        type: 'deuterium',
        value: gain.honThach,
        x: rect.left + 320 + offset.x,
        y: rect.top + 20 + offset.y,
      })
    }
    
    // Remove old popups after animation
    setTimeout(() => {
      popups.value = popups.value.filter(p => p.id > popupId - 20)
    }, 1500)
  })
  
  onUnmounted(() => {
    unsubscribe()
  })
})

const formatGain = (value: number) => {
  if (value < 1) return `+${value.toFixed(2)}`
  if (value < 10) return `+${value.toFixed(1)}`
  return `+${Math.floor(value)}`
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="resource-gain">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="resource-gain-popup"
        :class="popup.type"
        :style="{
          left: `${popup.x}px`,
          top: `${popup.y}px`,
        }"
      >
        {{ formatGain(popup.value) }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.resource-gain-enter-active {
  animation: resource-float-up 1.2s ease-out forwards;
}

.resource-gain-popup {
  position: fixed;
  pointer-events: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 9999;
}

.resource-gain-popup.metal {
  color: var(--neo-metal);
  text-shadow: 0 0 8px var(--neo-metal-glow);
}

.resource-gain-popup.crystal {
  color: var(--neo-crystal);
  text-shadow: 0 0 8px var(--neo-crystal-glow);
}

.resource-gain-popup.deuterium {
  color: var(--neo-soul);
  text-shadow: 0 0 8px var(--neo-soul-glow);
}

@keyframes resource-float-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translateY(-35px) scale(0.85);
  }
}
</style>
