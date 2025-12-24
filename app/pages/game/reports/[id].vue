<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

const route = useRoute()
const reportId = route.params.id

const { data: reportData, error } = await useFetch(`/api/game/reports/${reportId}`)

const report = computed(() => reportData.value?.data)

const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd/MM/yyyy HH:mm:ss')

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(Math.floor(num))

const getShipName = (type: string) => {
  // This should ideally come from a config or store
  const names: Record<string, string> = {
    TIEU_CHIEN_HAM: 'Tiểu Chiến Hạm',
    TRUNG_CHIEN_HAM: 'Trung Chiến Hạm',
    TUAN_DUONG_HAM: 'Tuần Dương Hạm',
    THIET_GIAP_HAM: 'Thiết Giáp Hạm',
    HAC_LONG_HAM: 'Hắc Long Hạm',
    VAN_TAI_NHO: 'Vận Tải Nhỏ',
    VAN_TAI_LON: 'Vận Tải Lớn',
    TAU_THUOC_DIA: 'Tàu Thuộc Địa',
    TAU_DO_THAM: 'Tàu Dò Thám',
    TAU_TAI_CHE: 'Tàu Tái Chế',
    MAU_HAM: 'Mẫu Hạm',
    DA_DE_HAM: 'Dạ Đế Hạm',
    TU_THAN_TINH: 'Tử Thần Tinh',
    // Defenses
    BE_PHONG_TEN_LUA: 'Bệ Phóng Tên Lửa',
    PHAO_LASER_NHO: 'Pháo Laser Nhỏ',
    PHAO_LASER_LON: 'Pháo Laser Lớn',
    PHAO_GAUSS: 'Pháo Gauss',
    PHAO_ION: 'Pháo Ion',
    PHAO_PLASMA: 'Pháo Plasma',
    VOM_KHIEN_NHO: 'Vòm Khiên Nhỏ',
    VOM_KHIEN_LON: 'Vòm Khiên Lớn',
  }
  return names[type] || type
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-4">
      <NuxtLink to="/game/messages" class="text-neutral-400 hover:text-white flex items-center gap-2">
        <IconsQuayLai class="w-4 h-4" /> Quay lại tin nhắn
      </NuxtLink>
    </div>

    <div v-if="error" class="text-center text-red-500 p-8 bg-white/5 rounded">
      Không tìm thấy báo cáo hoặc bạn không có quyền xem.
    </div>

    <div v-else-if="report" class="space-y-6">
      <!-- Header -->
      <div class="bg-space-900 border border-white/10 rounded-lg p-6 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
        
        <div class="relative z-10">
          <h1 class="text-2xl font-bold text-white font-display tracking-wider mb-2">
            BÁO CÁO CHIẾN ĐẤU
          </h1>
          <div class="text-neutral-400 text-sm mb-4">
            {{ formatDate(report.battleTime) }}
          </div>
          
          <div class="flex justify-center items-center gap-8">
            <div class="text-right">
              <div class="text-xl font-bold text-blue-400">{{ report.attacker.username }}</div>
              <div class="text-sm text-neutral-500">
                [{{ report.attackerPlanet.galaxy }}:{{ report.attackerPlanet.system }}:{{ report.attackerPlanet.position }}]
              </div>
            </div>
            <div class="text-2xl font-bold text-neutral-600">VS</div>
            <div class="text-left">
              <div class="text-xl font-bold text-red-400">{{ report.defender.username }}</div>
              <div class="text-sm text-neutral-500">
                [{{ report.defenderPlanet.galaxy }}:{{ report.defenderPlanet.system }}:{{ report.defenderPlanet.position }}]
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div class="text-xl font-bold mb-4" :class="{
          'text-green-400': report.result.attackerWins,
          'text-red-400': report.result.defenderWins,
          'text-yellow-400': report.result.draw
        }">
          {{ report.result.attackerWins ? 'NGƯỜI TẤN CÔNG THẮNG' : (report.result.defenderWins ? 'NGƯỜI PHÒNG THỦ THẮNG' : 'HÒA') }}
        </div>
        
        <div class="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div class="bg-black/30 p-3 rounded border border-white/5">
            <div class="text-xs text-neutral-500 uppercase mb-1">Tài nguyên cướp được</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-neutral-400">Tinh Thạch:</span>
                <span class="text-white">{{ formatNumber(report.loot.tinhThach) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-400">Năng Lượng:</span>
                <span class="text-white">{{ formatNumber(report.loot.nangLuongVuTru) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-400">Hồn Thạch:</span>
                <span class="text-white">{{ formatNumber(report.loot.honThach) }}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-black/30 p-3 rounded border border-white/5">
            <div class="text-xs text-neutral-500 uppercase mb-1">Bãi phế liệu</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-neutral-400">Tinh Thạch:</span>
                <span class="text-white">{{ formatNumber(report.debrisField.tinhThach) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-400">Năng Lượng:</span>
                <span class="text-white">{{ formatNumber(report.debrisField.nangLuongVuTru) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fleets -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Attacker Fleet -->
        <UiCard title="Hạm đội Tấn công" :padding="false">
          <table class="w-full text-sm">
            <thead class="bg-white/5 text-neutral-400 text-xs uppercase">
              <tr>
                <th class="px-3 py-2 text-left">Loại</th>
                <th class="px-3 py-2 text-right">Đầu</th>
                <th class="px-3 py-2 text-right">Mất</th>
                <th class="px-3 py-2 text-right">Còn</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="ship in report.attackerFleet" :key="ship.type">
                <td class="px-3 py-2 font-medium text-blue-300">{{ getShipName(ship.type) }}</td>
                <td class="px-3 py-2 text-right text-neutral-400">{{ formatNumber(ship.initial) }}</td>
                <td class="px-3 py-2 text-right text-red-400">{{ formatNumber(ship.lost) }}</td>
                <td class="px-3 py-2 text-right text-white">{{ formatNumber(ship.remaining) }}</td>
              </tr>
              <tr v-if="report.attackerFleet.length === 0">
                <td colspan="4" class="px-3 py-4 text-center text-neutral-500">Không có tàu tham chiến</td>
              </tr>
            </tbody>
          </table>
        </UiCard>

        <!-- Defender Fleet -->
        <UiCard title="Hạm đội Phòng thủ" :padding="false">
          <table class="w-full text-sm">
            <thead class="bg-white/5 text-neutral-400 text-xs uppercase">
              <tr>
                <th class="px-3 py-2 text-left">Loại</th>
                <th class="px-3 py-2 text-right">Đầu</th>
                <th class="px-3 py-2 text-right">Mất</th>
                <th class="px-3 py-2 text-right">Còn</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <!-- Ships -->
              <tr v-if="report.defenderFleet.length > 0" class="bg-white/5">
                <td colspan="4" class="px-3 py-1 text-xs font-bold text-neutral-500 uppercase">Tàu chiến</td>
              </tr>
              <tr v-for="ship in report.defenderFleet" :key="ship.type">
                <td class="px-3 py-2 font-medium text-red-300">{{ getShipName(ship.type) }}</td>
                <td class="px-3 py-2 text-right text-neutral-400">{{ formatNumber(ship.initial) }}</td>
                <td class="px-3 py-2 text-right text-red-400">{{ formatNumber(ship.lost) }}</td>
                <td class="px-3 py-2 text-right text-white">{{ formatNumber(ship.remaining) }}</td>
              </tr>
              
              <!-- Defenses -->
              <tr v-if="report.defenderDefenses.length > 0" class="bg-white/5">
                <td colspan="4" class="px-3 py-1 text-xs font-bold text-neutral-500 uppercase">Phòng thủ</td>
              </tr>
              <tr v-for="def in report.defenderDefenses" :key="def.type">
                <td class="px-3 py-2 font-medium text-yellow-300">{{ getShipName(def.type) }}</td>
                <td class="px-3 py-2 text-right text-neutral-400">{{ formatNumber(def.initial) }}</td>
                <td class="px-3 py-2 text-right text-red-400">{{ formatNumber(def.lost) }}</td>
                <td class="px-3 py-2 text-right text-white">{{ formatNumber(def.remaining) }}</td>
              </tr>

              <tr v-if="report.defenderFleet.length === 0 && report.defenderDefenses.length === 0">
                <td colspan="4" class="px-3 py-4 text-center text-neutral-500">Không có đơn vị phòng thủ</td>
              </tr>
            </tbody>
          </table>
        </UiCard>
      </div>
    </div>
  </div>
</template>
