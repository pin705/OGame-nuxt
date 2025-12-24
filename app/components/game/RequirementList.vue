<script setup lang="ts">
import type { Requirement } from '~/utils/techTree'

defineProps<{
  requirements: Requirement[]
}>()
</script>

<template>
  <div class="space-y-1 bg-slate-900/50 p-2 rounded border border-slate-700/50">
    <div class="text-xs font-semibold text-slate-400 mb-1">Yêu cầu:</div>
    <div v-for="req in requirements" :key="req.type" class="flex items-center justify-between text-xs">
      <span :class="req.met ? 'text-green-400' : 'text-red-400'">
        {{ req.name }} (Cấp {{ req.level }})
      </span>
      <span v-if="!req.met" class="text-slate-500 ml-2">
        Hiện tại: {{ req.currentLevel }}
      </span>
      <IconsHoanThanh v-else class="w-3 h-3 text-green-400 ml-2" />
    </div>
  </div>
</template>
