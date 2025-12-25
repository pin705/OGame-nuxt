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
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dienNangMax: 0,
  showProduction: false,
  compact: false,
  production: () => ({ tinhThach: 0, nangLuongVuTru: 0, honThach: 0 }),
})

const energyStatus = computed(() => {
  if (props.dienNangMax === 0) return 'normal'
  const ratio = props.dienNang / props.dienNangMax
  if (ratio >= 1) return 'full'
  if (ratio >= 0.5) return 'normal'
  if (ratio >= 0.25) return 'warning'
  return 'danger'
})

// Format for compact display
const compactFormat = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return formatNumber(num)
}
</script>

<template>
  <!-- Compact Mobile Version -->
  <div v-if="compact" class="resource-bar-compact">
    <div class="flex items-center justify-between gap-2">
      <!-- Tinh Thạch -->
      <div class="resource-compact-item">
        <IconsTinhThach class="w-4 h-4 text-neutral-400" />
        <span class="resource-compact-value text-neutral-300">{{ compactFormat(tinhThach) }}</span>
      </div>
      
      <!-- Năng Lượng Vũ Trụ -->
      <div class="resource-compact-item">
        <IconsNangLuong class="w-4 h-4 text-[#00D1FF]" />
        <span class="resource-compact-value text-[#00D1FF]">{{ compactFormat(nangLuongVuTru) }}</span>
      </div>
      
      <!-- Hồn Thạch -->
      <div class="resource-compact-item">
        <IconsHonThach class="w-4 h-4 text-[#00F59B]" />
        <span class="resource-compact-value text-[#00F59B]">{{ compactFormat(honThach) }}</span>
      </div>
      
      <!-- Điện Năng -->
      <div class="resource-compact-item">
        <IconsDienNang 
          class="w-4 h-4"
          :class="energyStatus === 'danger' ? 'text-[#FF4D4D] animate-pulse' : 'text-[#FFB800]'"
        />
        <span 
          class="resource-compact-value"
          :class="{
            'text-[#FFB800]': energyStatus !== 'danger',
            'text-[#FF4D4D]': energyStatus === 'danger'
          }"
        >
          {{ compactFormat(dienNang) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Full Desktop Version -->
  <div v-else class="resource-bar">
    <div class="resource-bar-inner">
      <!-- Tinh Thạch (Metal) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--metal">
          <IconsTinhThach class="w-5 h-5" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Tinh Thạch</span>
          <div class="resource-value-wrapper">
            <span class="resource-value text-neutral-300">
              {{ formatNumber(tinhThach) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.tinhThach) }}/h
            </span>
          </div>
        </div>
      </div>

      <!-- Năng Lượng Vũ Trụ (Crystal) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--crystal">
          <IconsNangLuong class="w-5 h-5" />
        </div>
        <div class="resource-info">
          <span class="resource-label">NL Vũ Trụ</span>
          <div class="resource-value-wrapper">
            <span class="resource-value text-[#00D1FF]">
              {{ formatNumber(nangLuongVuTru) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.nangLuongVuTru) }}/h
            </span>
          </div>
        </div>
      </div>

      <!-- Hồn Thạch (Deuterium) -->
      <div class="resource-item group">
        <div class="resource-icon resource-icon--soul">
          <IconsHonThach class="w-5 h-5" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Hồn Thạch</span>
          <div class="resource-value-wrapper">
            <span class="resource-value text-[#00F59B]">
              {{ formatNumber(honThach) }}
            </span>
            <span v-if="showProduction && production" class="resource-production">
              +{{ formatNumber(production.honThach) }}/h
            </span>
          </div>
        </div>
      </div>

      <!-- Điện Năng (Energy) -->
      <div class="resource-item group">
        <div
          class="resource-icon"
          :class="{
            'resource-icon--energy': energyStatus !== 'danger',
            'resource-icon--danger': energyStatus === 'danger',
          }"
        >
          <IconsDienNang class="w-5 h-5" />
        </div>
        <div class="resource-info">
          <span class="resource-label">Điện Năng</span>
          <div class="resource-value-wrapper">
            <span
              class="resource-value"
              :class="{
                'text-[#FFB800]': energyStatus !== 'danger',
                'text-[#FF4D4D]': energyStatus === 'danger',
              }"
            >
              {{ formatNumber(dienNang) }}
              <span v-if="dienNangMax > 0" class="text-neutral-600">
                / {{ formatNumber(dienNangMax) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Compact Mobile Bar */
.resource-bar-compact {
  @apply px-1;
}

.resource-compact-item {
  @apply flex items-center gap-1.5 px-2 py-1 rounded;
  background: rgba(22, 27, 34, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.resource-compact-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
}

/* Full Desktop Bar */
.resource-bar {
  @apply relative py-1;
}

.resource-bar-inner {
  @apply flex flex-wrap items-center justify-center gap-4 md:gap-6;
}

.resource-item {
  @apply flex items-center gap-2 px-2 py-1 rounded transition-all duration-200;
}

.resource-item:hover {
  background: rgba(0, 209, 255, 0.05);
}

.resource-icon {
  @apply flex items-center justify-center w-8 h-8 rounded;
  transition: all 0.2s ease;
}

.resource-icon--metal {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #9DA3AE;
}

.resource-icon--crystal {
  background: rgba(0, 209, 255, 0.1);
  border: 1px solid rgba(0, 209, 255, 0.2);
  color: #00D1FF;
}

.resource-icon--soul {
  background: rgba(0, 245, 155, 0.1);
  border: 1px solid rgba(0, 245, 155, 0.2);
  color: #00F59B;
}

.resource-icon--energy {
  background: rgba(255, 184, 0, 0.1);
  border: 1px solid rgba(255, 184, 0, 0.2);
  color: #FFB800;
}

.resource-icon--danger {
  background: rgba(255, 77, 77, 0.15);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #FF4D4D;
  animation: pulse-danger 1.5s infinite;
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4); }
  50% { box-shadow: 0 0 8px rgba(255, 77, 77, 0.4); }
}

.resource-info {
  @apply flex flex-col;
}

.resource-label {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  @apply text-neutral-500;
}

.resource-value-wrapper {
  @apply flex items-baseline gap-1.5;
}

.resource-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
}

.resource-production {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #00F59B;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .resource-bar-inner {
    @apply gap-2;
  }
  
  .resource-item {
    @apply px-1.5 py-0.5;
  }
  
  .resource-icon {
    @apply w-6 h-6;
  }
  
  .resource-label {
    font-size: 7px;
  }
  
  .resource-value {
    font-size: 10px;
  }
  
  .resource-production {
    font-size: 8px;
  }
}
</style>
