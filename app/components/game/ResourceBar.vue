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
  @apply relative overflow-hidden;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 50%,
    rgba(15, 23, 42, 0.9) 100%
  );
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.resource-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(14, 165, 233, 0.5) 50%,
    transparent 100%
  );
}

.resource-bar-inner {
  @apply flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4 py-3;
  position: relative;
  z-index: 2;
}

.resource-item {
  @apply flex items-center gap-3 relative cursor-pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resource-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.resource-icon {
  @apply relative flex items-center justify-center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.resource-icon--metal {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.2));
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.resource-icon--crystal {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.resource-icon--soul {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.resource-icon--energy {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(14, 165, 233, 0.1));
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.resource-icon--warning {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1));
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.resource-icon--danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
}

.resource-icon-glow {
  @apply absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-300;
}

.group:hover .resource-icon-glow {
  opacity: 1;
}

.resource-icon-glow--metal { box-shadow: 0 0 20px rgba(148, 163, 184, 0.4); }
.resource-icon-glow--crystal { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
.resource-icon-glow--soul { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
.resource-icon-glow--energy { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
.resource-icon-glow--warning { box-shadow: 0 0 20px rgba(234, 179, 8, 0.5); }
.resource-icon-glow--danger { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }

.resource-info {
  @apply flex flex-col;
}

.resource-label {
  @apply text-xs font-medium tracking-wide;
  color: rgba(148, 163, 184, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resource-value-wrapper {
  @apply flex items-baseline gap-2;
}

.resource-value {
  @apply font-mono text-sm font-semibold;
  text-shadow: 0 0 10px currentColor;
}

.resource-value--metal { color: #cbd5e1; }
.resource-value--crystal { color: #fbbf24; }
.resource-value--soul { color: #a78bfa; }
.resource-value--energy { color: #22d3ee; }
.resource-value--warning { color: #eab308; }
.resource-value--danger { color: #ef4444; }

.resource-max {
  @apply text-slate-500 font-normal;
}

.resource-production {
  @apply text-xs font-mono;
  color: #4ade80;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.resource-tooltip {
  @apply absolute -bottom-10 left-1/2 transform -translate-x-1/2;
  @apply px-3 py-1.5 rounded-lg text-xs whitespace-nowrap;
  @apply opacity-0 invisible transition-all duration-200;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #94a3b8;
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
  @apply absolute w-1 h-1 rounded-full;
  background: rgba(14, 165, 233, 0.6);
  animation: float-particle 8s infinite linear;
}

.particle:nth-child(1) { left: 10%; animation-duration: 6s; }
.particle:nth-child(2) { left: 25%; animation-duration: 8s; }
.particle:nth-child(3) { left: 40%; animation-duration: 7s; }
.particle:nth-child(4) { left: 55%; animation-duration: 9s; }
.particle:nth-child(5) { left: 70%; animation-duration: 6.5s; }
.particle:nth-child(6) { left: 85%; animation-duration: 7.5s; }

@keyframes float-particle {
  0% {
    transform: translateY(100%) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100%) scale(1);
    opacity: 0;
  }
}
</style>
