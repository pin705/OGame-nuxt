<script setup lang="ts">
import { formatCoordinates } from '~/utils/gameFormulas'

interface Planet {
  _id: string
  name: string
  coordinates: {
    galaxy: number
    system: number
    position: number
  }
  diameter: number
  temperature: number
  usedFields: number
  maxFields: number
  isHomePlanet: boolean
}

interface Props {
  planet: Planet
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  select: [planetId: string]
}>()

const fieldUsagePercent = computed(() => {
  return Math.round((props.planet.usedFields / props.planet.maxFields) * 100)
})

const fieldStatusColor = computed(() => {
  if (fieldUsagePercent.value >= 90) return 'text-red-400'
  if (fieldUsagePercent.value >= 70) return 'text-yellow-400'
  return 'text-green-400'
})
</script>

<template>
  <div
    class="glass-card p-4 cursor-pointer transition-all duration-300"
    :class="{
      'ring-2 ring-primary-500 shadow-glow-primary': isActive,
      'hover:ring-1 hover:ring-primary-500/50': !isActive,
    }"
    @click="emit('select', planet._id)"
  >
    <div class="flex items-center gap-4">
      <!-- Planet Image -->
      <div class="relative flex-shrink-0">
        <div
          class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-secondary-700 flex items-center justify-center overflow-hidden"
        >
          <Icon name="mdi:earth" class="text-4xl text-white/80" />
        </div>
        <div
          v-if="planet.isHomePlanet"
          class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center"
          title="Hành tinh mẫu"
        >
          <Icon name="mdi:home" class="text-sm text-white" />
        </div>
      </div>

      <!-- Planet Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-display font-semibold text-slate-100 truncate">
            {{ planet.name }}
          </h3>
          <span
            v-if="isActive"
            class="badge badge-info"
          >
            Đang chọn
          </span>
        </div>

        <p class="text-sm text-slate-400 font-mono">
          {{ formatCoordinates(planet.coordinates) }}
        </p>

        <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span class="flex items-center gap-1">
            <Icon name="mdi:resize" />
            {{ planet.diameter.toLocaleString() }} km
          </span>
          <span class="flex items-center gap-1">
            <Icon name="mdi:thermometer" />
            {{ planet.temperature }}°C
          </span>
        </div>
      </div>

      <!-- Field Usage -->
      <div class="flex-shrink-0 text-right">
        <p class="text-xs text-slate-500 mb-1">Ô đất</p>
        <p class="font-mono text-sm" :class="fieldStatusColor">
          {{ planet.usedFields }}/{{ planet.maxFields }}
        </p>
        <div class="w-16 h-1.5 bg-space-700 rounded-full mt-1 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="{
              'bg-green-500': fieldUsagePercent < 70,
              'bg-yellow-500': fieldUsagePercent >= 70 && fieldUsagePercent < 90,
              'bg-red-500': fieldUsagePercent >= 90,
            }"
            :style="{ width: `${fieldUsagePercent}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
