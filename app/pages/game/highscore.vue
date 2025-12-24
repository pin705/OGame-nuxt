<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

const page = ref(1)
const limit = ref(100)

const { data: highscoreData, refresh } = await useFetch('/api/game/highscore', {
  query: {
    page,
    limit,
  },
})

const players = computed(() => highscoreData.value?.data || [])
const pagination = computed(() => highscoreData.value?.pagination)

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Rank color class
const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-white'
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white font-display tracking-wider">
          BẢNG XẾP HẠNG
        </h1>
        <p class="text-neutral-400 text-sm mt-1">
          Top 100 chiến binh mạnh nhất vũ trụ
        </p>
      </div>
    </div>

    <UiCard :padding="false" class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/5 text-neutral-400 uppercase tracking-wider font-medium">
            <tr>
              <th class="px-6 py-4 w-20 text-center">Hạng</th>
              <th class="px-6 py-4">Người chơi</th>
              <th class="px-6 py-4">Liên minh</th>
              <th class="px-6 py-4 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr 
              v-for="(player, index) in players" 
              :key="player._id"
              class="hover:bg-white/5 transition-colors"
              :class="{'bg-white/5': (index + 1 + (page - 1) * limit) % 2 === 0}"
            >
              <td class="px-6 py-4 text-center font-bold text-lg" :class="getRankColor(index + 1 + (page - 1) * limit)">
                {{ index + 1 + (page - 1) * limit }}
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-white text-base">{{ player.username }}</div>
                <div class="text-xs text-neutral-500 mt-0.5">{{ player.rank.replace(/_/g, ' ') }}</div>
              </td>
              <td class="px-6 py-4">
                <span v-if="player.alliance" class="text-primary-400 font-medium">
                  [{{ player.alliance.tag }}] {{ player.alliance.name }}
                </span>
                <span v-else class="text-neutral-600 italic">--</span>
              </td>
              <td class="px-6 py-4 text-right font-mono text-primary-300 text-base">
                {{ formatNumber(player.points) }}
              </td>
            </tr>
            
            <tr v-if="players.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-neutral-500">
                Chưa có dữ liệu xếp hạng
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>
