<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

// Categories for ranking
const categories = [
  { id: 'general', label: 'Tổng Điểm', icon: 'NguoiChoi' },
  { id: 'fleet', label: 'Hạm Đội', icon: 'HamDoi' },
  { id: 'research', label: 'Nghiên Cứu', icon: 'NghienCuu' },
  { id: 'buildings', label: 'Công Trình', icon: 'TrungTamChiHuy' },
  { id: 'defense', label: 'Phòng Thủ', icon: 'PhongThu' },
]
const activeCategory = ref('general')

const page = ref(1)
const limit = ref(50)
const searchQuery = ref('')

const { data: highscoreData, refresh, pending } = await useFetch('/api/game/highscore', {
  query: computed(() => ({
    page: page.value,
    limit: limit.value,
    category: activeCategory.value,
    search: searchQuery.value || undefined,
  })),
})

const players = computed(() => highscoreData.value?.data || [])
const pagination = computed(() => highscoreData.value?.pagination)

// Current player for highlighting
const { player: currentPlayer } = useAuth()

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num || 0)
}

// Rank styles
const getRankStyle = (rank: number) => {
  if (rank === 1) return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' }
  if (rank === 2) return { text: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/30' }
  if (rank === 3) return { text: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' }
  return { text: 'text-white', bg: '', border: '' }
}

const getRankName = (rank: string) => {
  const names: Record<string, string> = {
    CHIEN_BINH_SO_CAP: 'Chiến Binh Sơ Cấp',
    CHIEN_TUONG: 'Chiến Tướng',
    DAI_TUONG: 'Đại Tướng',
    NGUYEN_SOAI: 'Nguyên Soái',
    DAI_DE: 'Đại Đế',
    VU_TRU_CAP: 'Vũ Trụ Cấp',
  }
  return names[rank] || rank?.replace(/_/g, ' ')
}

const getRankColor = (rank: string) => {
  const colors: Record<string, string> = {
    CHIEN_BINH_SO_CAP: 'text-neutral-400',
    CHIEN_TUONG: 'text-green-400',
    DAI_TUONG: 'text-blue-400',
    NGUYEN_SOAI: 'text-purple-400',
    DAI_DE: 'text-yellow-400',
    VU_TRU_CAP: 'text-red-400',
  }
  return colors[rank] || 'text-neutral-400'
}

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    refresh()
  }, 300)
}

// Watch category change
watch(activeCategory, () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Bảng Xếp Hạng</h1>
        <p class="text-neutral-500 mt-1">Top chiến binh mạnh nhất vũ trụ Thôn Phệ Tinh Không</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            class="neo-input pl-10 w-64"
            placeholder="Tìm kiếm người chơi..."
            @input="handleSearch"
          >
          <IconsNguoiChoi class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        </div>
        <button @click="refresh()" class="neo-btn-ghost p-2.5" :class="{ 'animate-spin': pending }">
          <IconsTaiDang class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
        :class="activeCategory === cat.id ? 'neo-btn' : 'neo-btn-ghost'"
        @click="activeCategory = cat.id"
      >
        <component :is="`Icons${cat.icon}`" class="w-5 h-5" />
        {{ cat.label }}
      </button>
    </div>

    <!-- Highscore Table -->
    <UiCard :padding="false" class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/5 text-neutral-400 uppercase tracking-wider font-display">
            <tr>
              <th class="px-6 py-4 w-20 text-center">Hạng</th>
              <th class="px-6 py-4">Người Chơi</th>
              <th class="px-6 py-4">Cấp Bậc</th>
              <th class="px-6 py-4">Liên Minh</th>
              <th class="px-6 py-4 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr 
              v-for="(player, index) in players" 
              :key="player._id"
              class="hover:bg-white/5 transition-colors"
              :class="[
                getRankStyle(index + 1 + (page - 1) * limit).bg,
                getRankStyle(index + 1 + (page - 1) * limit).border && 'border-l-2',
                currentPlayer?._id === player._id && 'bg-primary-500/10 border-l-2 border-primary-500'
              ]"
            >
              <!-- Rank -->
              <td class="px-6 py-4 text-center">
                <span 
                  class="font-mono font-bold text-lg"
                  :class="getRankStyle(index + 1 + (page - 1) * limit).text"
                >
                  {{ index + 1 + (page - 1) * limit }}
                </span>
                <!-- Medal icons for top 3 -->
                <div v-if="index + 1 + (page - 1) * limit <= 3" class="mt-1">
                  <IconsHuyChuong 
                    :rank="(index + 1 + (page - 1) * limit) as 1 | 2 | 3" 
                    class="w-6 h-6 mx-auto"
                  />
                </div>
              </td>

              <!-- Player Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 neo-card flex items-center justify-center border-primary-500/20">
                    <IconsNguoiChoi class="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p class="font-display font-semibold text-white">
                      {{ player.username }}
                      <span v-if="currentPlayer?._id === player._id" class="text-xs text-primary-400 ml-1">(Bạn)</span>
                    </p>
                    <p class="text-xs text-neutral-500">Cấp {{ player.level || 1 }}</p>
                  </div>
                </div>
              </td>

              <!-- Rank Title -->
              <td class="px-6 py-4">
                <span :class="getRankColor(player.rank)" class="font-medium">
                  {{ getRankName(player.rank) }}
                </span>
              </td>

              <!-- Alliance -->
              <td class="px-6 py-4">
                <span v-if="player.alliance" class="text-primary-400 font-medium">
                  [{{ player.alliance.tag }}] {{ player.alliance.name }}
                </span>
                <span v-else class="text-neutral-600 italic">--</span>
              </td>

              <!-- Points -->
              <td class="px-6 py-4 text-right">
                <span class="font-mono text-primary-300 text-lg">
                  {{ formatNumber(player.points) }}
                </span>
              </td>
            </tr>
            
            <tr v-if="players.length === 0 && !pending">
              <td colspan="5" class="px-6 py-12 text-center text-neutral-500">
                <IconsNguoiChoi class="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy người chơi nào</p>
                <p v-if="searchQuery" class="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
              </td>
            </tr>

            <tr v-if="pending">
              <td colspan="5" class="px-6 py-12 text-center">
                <svg class="animate-spin w-8 h-8 mx-auto text-primary-400" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-neutral-500 mt-3">Đang tải dữ liệu...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.pages > 1" class="p-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-sm text-neutral-500">
          Hiển thị {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, pagination.total) }} 
          trong {{ pagination.total }} người chơi
        </p>
        
        <div class="flex gap-1">
          <button 
            class="neo-btn-ghost px-3 py-1.5 text-sm"
            :disabled="page <= 1"
            :class="{ 'opacity-50 cursor-not-allowed': page <= 1 }"
            @click="page--"
          >
            <IconsQuayLai class="w-4 h-4" />
          </button>
          
          <template v-for="p in pagination.pages" :key="p">
            <button 
              v-if="p === 1 || p === pagination.pages || (p >= page - 2 && p <= page + 2)"
              class="w-9 h-9 rounded flex items-center justify-center text-sm font-mono transition-colors"
              :class="page === p ? 'neo-btn' : 'neo-btn-ghost'"
              @click="page = p"
            >
              {{ p }}
            </button>
            <span 
              v-else-if="(p === page - 3 && page > 4) || (p === page + 3 && page < pagination.pages - 3)"
              class="w-9 h-9 flex items-center justify-center text-neutral-500"
            >
              ...
            </span>
          </template>
          
          <button 
            class="neo-btn-ghost px-3 py-1.5 text-sm"
            :disabled="page >= pagination.pages"
            :class="{ 'opacity-50 cursor-not-allowed': page >= pagination.pages }"
            @click="page++"
          >
            <IconsMuiTen class="w-4 h-4" />
          </button>
        </div>
      </div>
    </UiCard>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="neo-card p-4 text-center">
        <p class="text-3xl font-mono font-bold text-primary-400">{{ pagination?.total || 0 }}</p>
        <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Tổng Người Chơi</p>
      </div>
      <div class="neo-card p-4 text-center">
        <p class="text-3xl font-mono font-bold text-yellow-400">
          {{ players[0]?.points ? formatNumber(players[0].points) : '---' }}
        </p>
        <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Điểm Cao Nhất</p>
      </div>
      <div class="neo-card p-4 text-center">
        <p class="text-3xl font-mono font-bold text-success-400">{{ players[0]?.username || '---' }}</p>
        <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Top 1</p>
      </div>
      <div class="neo-card p-4 text-center">
        <p class="text-3xl font-mono font-bold text-warning-400">
          {{ currentPlayer?.points ? formatNumber(currentPlayer.points) : '---' }}
        </p>
        <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Điểm Của Bạn</p>
      </div>
    </div>
  </div>
</template>
