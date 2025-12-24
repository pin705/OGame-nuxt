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
</script>

<template>
  <div class="glass-card px-4 py-2">
    <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      <!-- Tinh Thạch (Metal) -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center">
          <Icon name="mdi:gold" class="text-slate-300 text-lg" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-slate-400">Tinh Thạch</span>
          <span class="font-mono text-sm text-slate-200">
            {{ formatNumber(tinhThach) }}
            <span v-if="showProduction && production" class="text-xs text-green-400">
              +{{ formatNumber(production.tinhThach) }}/h
            </span>
          </span>
        </div>
      </div>

      <!-- Năng Lượng Vũ Trụ (Crystal) -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-primary-900/50 flex items-center justify-center">
          <Icon name="mdi:diamond-stone" class="text-primary-400 text-lg" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-slate-400">Năng Lượng Vũ Trụ</span>
          <span class="font-mono text-sm text-primary-300">
            {{ formatNumber(nangLuongVuTru) }}
            <span v-if="showProduction && production" class="text-xs text-green-400">
              +{{ formatNumber(production.nangLuongVuTru) }}/h
            </span>
          </span>
        </div>
      </div>

      <!-- Hồn Thạch (Deuterium) -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-secondary-900/50 flex items-center justify-center">
          <Icon name="mdi:water" class="text-secondary-400 text-lg" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-slate-400">Hồn Thạch</span>
          <span class="font-mono text-sm text-secondary-300">
            {{ formatNumber(honThach) }}
            <span v-if="showProduction && production" class="text-xs text-green-400">
              +{{ formatNumber(production.honThach) }}/h
            </span>
          </span>
        </div>
      </div>

      <!-- Điện Năng (Energy) -->
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center"
          :class="{
            'bg-accent-900/50': energyStatus === 'full' || energyStatus === 'normal',
            'bg-yellow-900/50': energyStatus === 'warning',
            'bg-red-900/50': energyStatus === 'danger',
          }"
        >
          <Icon
            name="mdi:lightning-bolt"
            class="text-lg"
            :class="{
              'text-accent-400': energyStatus === 'full' || energyStatus === 'normal',
              'text-yellow-400': energyStatus === 'warning',
              'text-red-400': energyStatus === 'danger',
            }"
          />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-slate-400">Điện Năng</span>
          <span
            class="font-mono text-sm"
            :class="{
              'text-accent-300': energyStatus === 'full' || energyStatus === 'normal',
              'text-yellow-300': energyStatus === 'warning',
              'text-red-300': energyStatus === 'danger',
            }"
          >
            {{ formatNumber(dienNang) }}
            <span v-if="dienNangMax > 0" class="text-slate-500">
              / {{ formatNumber(dienNangMax) }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
