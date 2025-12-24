<script setup lang="ts">
import { formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { data: reportsData, refresh } = await useFetch('/api/game/reports')
const reports = computed(() => reportsData.value?.data?.reports || [])

const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN')
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Báo Cáo</h1>
      <button @click="refresh()" class="neo-btn-ghost text-sm">
        Làm mới
      </button>
    </div>
    
    <div class="space-y-3">
      <div v-if="reports.length === 0" class="text-center text-slate-500 py-8">
        Không có báo cáo nào.
      </div>

      <div v-for="report in reports" :key="report.id" class="neo-card p-4 hover:border-primary-500/50 transition-colors">
        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-bold flex items-center gap-2" :class="report.type === 'BATTLE' ? 'text-alert-400' : 'text-warning-400'">
              <component :is="report.type === 'BATTLE' ? 'IconsTanCong' : 'IconsTauDoTham'" class="w-4 h-4" />
              {{ report.type === 'BATTLE' ? 'Báo cáo trận chiến' : 'Báo cáo do thám' }}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              {{ formatDate(report.time) }} | Đối thủ: {{ report.opponent || 'Unknown' }}
            </div>
          </div>
          <div class="text-right text-sm font-mono text-primary-400">
            [{{ report.coordinates.galaxy }}:{{ report.coordinates.system }}:{{ report.coordinates.position }}]
          </div>
        </div>
        
        <!-- Espionage Details -->
        <div v-if="report.type === 'ESPIONAGE'" class="mt-4 text-sm space-y-4 bg-slate-900/50 p-4 rounded border border-slate-800">
          <!-- Resources -->
          <div>
            <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Tài nguyên</div>
            <div class="grid grid-cols-3 gap-4 font-mono">
              <div class="flex items-center gap-2 text-slate-300">
                <IconsTinhThach class="w-3 h-3" />
                {{ formatNumber(report.resources?.tinhThach || 0) }}
              </div>
              <div class="flex items-center gap-2 text-primary-400">
                <IconsNangLuong class="w-3 h-3" />
                {{ formatNumber(report.resources?.nangLuongVuTru || 0) }}
              </div>
              <div class="flex items-center gap-2 text-success-400">
                <IconsHonThach class="w-3 h-3" />
                {{ formatNumber(report.resources?.honThach || 0) }}
              </div>
            </div>
          </div>
          
          <div v-if="report.details">
            <!-- Ships -->
            <div v-if="report.details.ships && report.details.ships.length > 0" class="mt-3">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Hạm đội</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="ship in report.details.ships" :key="ship.type" class="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                  {{ ship.type }}: <span class="text-warning-400">{{ ship.count }}</span>
                </span>
              </div>
            </div>

            <!-- Defenses -->
            <div v-if="report.details.defenses && report.details.defenses.length > 0" class="mt-3">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Phòng thủ</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="def in report.details.defenses" :key="def.type" class="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                  {{ def.type }}: <span class="text-alert-400">{{ def.count }}</span>
                </span>
              </div>
            </div>

            <!-- Buildings -->
            <div v-if="report.details.buildings && report.details.buildings.length > 0" class="mt-3">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Công trình</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="b in report.details.buildings" :key="b.type" class="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                  {{ b.type }}: <span class="text-primary-400">{{ b.level }}</span>
                </span>
              </div>
            </div>

            <!-- Research -->
            <div v-if="report.details.researches && report.details.researches.length > 0" class="mt-3">
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">Nghiên cứu</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="r in report.details.researches" :key="r.type" class="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                  {{ r.type }}: <span class="text-purple-400">{{ r.level }}</span>
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-slate-500 italic text-xs mt-2">
            Không thể thu thập thêm thông tin do chênh lệch cấp độ do thám.
          </div>
          
          <div class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            Tỉ lệ bị phát hiện: {{ (report.counterEspionageChance * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
