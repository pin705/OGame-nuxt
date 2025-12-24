<script setup lang="ts">
import { formatNumber } from '~/utils/gameFormulas'

interface Props {
  tinhThach: number
  nangLuongVuTru: number
  honThach: number
  dienNang: number
  dienNangMax?: number
  showProduction?: boolean
  production?: {
    tinhThach: number
    nangLuongVuTru: number
    honThach: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  dienNangMax: 0,
  showProduction: false,
})

const energyStatus = computed(() => {
  if (props.dienNangMax === 0) return 'normal'
  const ratio = props.dienNang / props.dienNangMax
  if (ratio >= 1) return 'full'
  if (ratio >= 0.5) return 'normal'
  if (ratio >= 0.25) return 'warning'
  return 'danger'
})

// Animation for counting up
const displayValues = reactive({
  tinhThach: 0,
  nangLuongVuTru: 0,
  honThach: 0,
  dienNang: 0,
})

watch(
  () => props.tinhThach,
  (newVal) => { displayValues.tinhThach = newVal },
  { immediate: true }
)
watch(
  () => props.nangLuongVuTru,
  (newVal) => { displayValues.nangLuongVuTru = newVal },
  { immediate: true }
)
watch(
  () => props.honThach,
  (newVal) => { displayValues.honThach = newVal },
  { immediate: true }
)
watch(
  () => props.dienNang,
  (newVal) => { displayValues.dienNang = newVal },
  { immediate: true }
)
</script>

<template>
  <div class="resource-bar">
    <div class="resource-bar-inner">
      <!-- Tinh Thạch (Metal) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--metal">
          <IconsTinhThach :size="22" />
          <div class="resource-icon-glow resource-icon-glow--metal" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Tinh Thạch</span>
          <div class="resource-value-wrapper">
            <span class="resource-value resource-value--metal">
              {{ formatNumber(displayValues.tinhThach) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.tinhThach) }}/h
            </span>
          </div>
        </div>
        <div class="resource-tooltip">
          Khoáng sản cơ bản để xây dựng và sản xuất
        </div>
      </div>

      <!-- Năng Lượng Vũ Trụ (Crystal) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--crystal">
          <IconsNangLuong :size="22" />
          <div class="resource-icon-glow resource-icon-glow--crystal" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Năng Lượng Vũ Trụ</span>
          <div class="resource-value-wrapper">
            <span class="resource-value resource-value--crystal">
              {{ formatNumber(displayValues.nangLuongVuTru) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.nangLuongVuTru) }}/h
            </span>
          </div>
        </div>
        <div class="resource-tooltip">
          Năng lượng tinh thuần từ vũ trụ
        </div>
      </div>

      <!-- Hồn Thạch (Deuterium) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--soul">
          <IconsHonThach :size="22" />
          <div class="resource-icon-glow resource-icon-glow--soul" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Hồn Thạch</span>
          <div class="resource-value-wrapper">
            <span class="resource-value resource-value--soul">
              {{ formatNumber(displayValues.honThach) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.honThach) }}/h
            </span>
          </div>
        </div>
        <div class="resource-tooltip">
          Năng lượng tinh thần quý hiếm
        </div>
      </div>

      <!-- Điện Năng (Energy) -->
      <div class="resource-item group">
        <div
          class="resource-icon"
          :class="{
            'resource-icon--energy': energyStatus === 'full' || energyStatus === 'normal',
            'resource-icon--warning': energyStatus === 'warning',
            'resource-icon--danger': energyStatus === 'danger',
          }"
        >
          <IconsDienNang :size="22" />
          <div
            class="resource-icon-glow"
            :class="{
              'resource-icon-glow--energy': energyStatus === 'full' || energyStatus === 'normal',
              'resource-icon-glow--warning': energyStatus === 'warning',
              'resource-icon-glow--danger': energyStatus === 'danger',
            }"
          />
        </div>
        <div class="resource-info">
          <span class="resource-label">Điện Năng</span>
          <div class="resource-value-wrapper">
            <span
              class="resource-value"
              :class="{
                'resource-value--energy': energyStatus === 'full' || energyStatus === 'normal',
                'resource-value--warning': energyStatus === 'warning',
                'resource-value--danger': energyStatus === 'danger',
              }"
            >
              {{ formatNumber(displayValues.dienNang) }}
              <span v-if="dienNangMax > 0" class="resource-max">
                / {{ formatNumber(dienNangMax) }}
              </span>
            </span>
          </div>
        </div>
        <div class="resource-tooltip">
          Năng lượng vận hành công trình
        </div>
      </div>
    </div>

    <!-- Animated background particles -->
    <div class="resource-bar-particles">
      <div v-for="i in 6" :key="i" class="particle" :style="{ animationDelay: `${i * 0.5}s` }" />
    </div>
  </div>
</template>

<style scoped>
.resource-bar {
  @apply relative;
  background: rgba(11, 14, 20, 0.9);
  border-bottom: 1px solid rgba(0, 209, 255, 0.1);
}

.resource-bar-inner {
  @apply flex flex-wrap items-center justify-center gap-6 md:gap-8 px-4 py-2;
  position: relative;
  z-index: 2;
}

.resource-item {
  @apply flex items-center gap-2.5 relative cursor-pointer;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.resource-item:hover {
  background: rgba(0, 209, 255, 0.05);
}

.resource-icon {
  @apply relative flex items-center justify-center;
  width: 32px;
  height: 32px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.resource-icon--metal {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.resource-icon--crystal {
  background: rgba(0, 209, 255, 0.1);
  border: 1px solid rgba(0, 209, 255, 0.3);
}

.resource-icon--soul {
  background: rgba(0, 245, 155, 0.1);
  border: 1px solid rgba(0, 245, 155, 0.3);
}

.resource-icon--energy {
  background: rgba(255, 184, 0, 0.1);
  border: 1px solid rgba(255, 184, 0, 0.3);
}

.resource-icon--warning {
  background: rgba(255, 184, 0, 0.15);
  border: 1px solid rgba(255, 184, 0, 0.5);
}

.resource-icon--danger {
  background: rgba(255, 77, 77, 0.15);
  border: 1px solid rgba(255, 77, 77, 0.5);
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
  50% { box-shadow: 0 0 8px rgba(255, 77, 77, 0.4); }
}

.resource-icon-glow {
  @apply absolute inset-0 rounded-sm opacity-0 transition-opacity duration-200;
}

.group:hover .resource-icon-glow {
  opacity: 1;
}

.resource-icon-glow--metal { box-shadow: 0 0 12px rgba(148, 163, 184, 0.4); }
.resource-icon-glow--crystal { box-shadow: 0 0 12px rgba(0, 209, 255, 0.5); }
.resource-icon-glow--soul { box-shadow: 0 0 12px rgba(0, 245, 155, 0.5); }
.resource-icon-glow--energy { box-shadow: 0 0 12px rgba(255, 184, 0, 0.5); }
.resource-icon-glow--warning { box-shadow: 0 0 12px rgba(255, 184, 0, 0.6); }
.resource-icon-glow--danger { box-shadow: 0 0 12px rgba(255, 77, 77, 0.6); }

.resource-info {
  @apply flex flex-col gap-0.5;
}

.resource-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6E7681;
}

.resource-value-wrapper {
  @apply flex items-baseline gap-1.5;
}

.resource-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
}

.resource-value--metal { color: #9DA3AE; }
.resource-value--crystal { color: #00D1FF; text-shadow: 0 0 8px rgba(0, 209, 255, 0.5); }
.resource-value--soul { color: #00F59B; text-shadow: 0 0 8px rgba(0, 245, 155, 0.5); }
.resource-value--energy { color: #FFB800; text-shadow: 0 0 8px rgba(255, 184, 0, 0.5); }
.resource-value--warning { color: #FFB800; }
.resource-value--danger { color: #FF4D4D; text-shadow: 0 0 8px rgba(255, 77, 77, 0.5); }

.resource-max {
  color: #484F58;
  font-weight: 400;
}

.resource-production {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #00F59B;
  text-shadow: 0 0 6px rgba(0, 245, 155, 0.4);
}

.resource-tooltip {
  @apply absolute -bottom-10 left-1/2 transform -translate-x-1/2;
  @apply px-3 py-1.5 text-xs whitespace-nowrap;
  @apply opacity-0 invisible transition-all duration-200;
  font-family: 'Rajdhani', sans-serif;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  color: #9DA3AE;
  z-index: 50;
}

.group:hover .resource-tooltip {
  @apply opacity-100 visible;
  transform: translateX(-50%) translateY(4px);
}

.resource-bar-particles {
  @apply absolute inset-0 overflow-hidden pointer-events-none;
  z-index: 1;
}

.particle {
  @apply absolute w-0.5 h-0.5 rounded-full;
  background: rgba(0, 209, 255, 0.6);
  animation: float-particle 10s infinite linear;
}

.particle:nth-child(1) { left: 10%; animation-duration: 8s; }
.particle:nth-child(2) { left: 25%; animation-duration: 10s; }
.particle:nth-child(3) { left: 40%; animation-duration: 9s; }
.particle:nth-child(4) { left: 55%; animation-duration: 11s; }
.particle:nth-child(5) { left: 70%; animation-duration: 8.5s; }
.particle:nth-child(6) { left: 85%; animation-duration: 9.5s; }

@keyframes float-particle {
  0% {
    transform: translateY(100%) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100%) scale(1);
    opacity: 0;
  }
}

/* Progress bar under resource bar */
.resource-progress {
  @apply absolute bottom-0 left-0 right-0 h-[3px];
  background: rgba(22, 27, 34, 0.8);
}

.resource-progress-fill {
  @apply h-full;
  transition: width 0.5s ease;
}
</style>
