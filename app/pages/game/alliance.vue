<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

// Tabs when in alliance
const allianceTabs = [
  { id: 'overview', label: 'Tổng Quan', icon: 'ThienHa' },
  { id: 'members', label: 'Thành Viên', icon: 'NguoiChoi' },
  { id: 'applications', label: 'Đơn Xin Vào', icon: 'ThoiGian' },
  { id: 'circular', label: 'Thư Liên Minh', icon: 'ThongTin' },
  { id: 'settings', label: 'Cài Đặt', icon: 'CaiDat' },
]
const activeTab = ref('overview')

const { data: allianceData, refresh, pending } = await useFetch('/api/game/alliance/index')

const hasAlliance = computed(() => allianceData.value?.hasAlliance || false)
const alliance = computed(() => allianceData.value?.data)
const isOwner = computed(() => allianceData.value?.isOwner || false)

// Create Form
const createForm = ref({ name: '', tag: '', description: '' })
const isCreating = ref(false)

// Search
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

// Application
const applyMessage = ref('')
const selectedAllianceId = ref('')
const isApplyModalOpen = ref(false)
const isApplying = ref(false)

// Circular mail
const circularForm = ref({ subject: '', content: '' })
const isSendingCircular = ref(false)

// Settings
const settingsForm = ref({ description: '' })
const isSavingSettings = ref(false)

// States
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const processingIds = ref<Set<string>>(new Set())

// Initialize settings form
watch(alliance, (newVal) => {
  if (newVal) {
    settingsForm.value.description = newVal.description || ''
  }
}, { immediate: true })

// Actions
const createAlliance = async () => {
  if (!createForm.value.name || !createForm.value.tag) {
    error.value = 'Vui lòng nhập tên và tag'
    setTimeout(() => { error.value = null }, 3000)
    return
  }

  isCreating.value = true
  try {
    await $fetch('/api/game/alliance/create', {
      method: 'POST',
      body: createForm.value,
    })
    success.value = 'Đã thành lập liên minh thành công!'
    await refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi tạo liên minh'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isCreating.value = false
  }
}

const searchAlliance = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  try {
    const res: any = await $fetch('/api/game/alliance/list', {
      query: { search: searchQuery.value },
    })
    searchResults.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    isSearching.value = false
  }
}

const openApplyModal = (id: string) => {
  selectedAllianceId.value = id
  applyMessage.value = ''
  isApplyModalOpen.value = true
}

const sendApplication = async () => {
  isApplying.value = true
  try {
    await $fetch('/api/game/alliance/apply', {
      method: 'POST',
      body: {
        allianceId: selectedAllianceId.value,
        message: applyMessage.value,
      },
    })
    isApplyModalOpen.value = false
    success.value = 'Đã gửi đơn xin gia nhập!'
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi đơn'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isApplying.value = false
  }
}

const handleApplication = async (appId: string, action: 'ACCEPT' | 'REJECT') => {
  processingIds.value.add(appId)
  try {
    await $fetch('/api/game/alliance/manage', {
      method: 'POST',
      body: { applicationId: appId, action },
    })
    success.value = action === 'ACCEPT' ? 'Đã chấp nhận thành viên!' : 'Đã từ chối đơn'
    await refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi xử lý'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    processingIds.value.delete(appId)
  }
}

const kickMember = async (memberId: string, username: string) => {
  if (!confirm(`Bạn có chắc muốn đuổi ${username} khỏi liên minh?`)) return
  
  processingIds.value.add(memberId)
  try {
    await $fetch('/api/game/alliance/kick', {
      method: 'POST',
      body: { memberId },
    })
    success.value = `Đã đuổi ${username} khỏi liên minh`
    await refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi đuổi thành viên'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    processingIds.value.delete(memberId)
  }
}

const leaveAlliance = async () => {
  const confirmMsg = isOwner.value 
    ? 'Bạn là chủ minh, rời đi sẽ giải tán liên minh. Bạn có chắc không?' 
    : 'Bạn có chắc muốn rời liên minh?'
  
  if (!confirm(confirmMsg)) return
  
  try {
    await $fetch('/api/game/alliance/leave', { method: 'POST' })
    success.value = 'Đã rời liên minh'
    await refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi rời liên minh'
    setTimeout(() => { error.value = null }, 5000)
  }
}

const sendCircularMail = async () => {
  if (!circularForm.value.subject || !circularForm.value.content) {
    error.value = 'Vui lòng nhập tiêu đề và nội dung'
    setTimeout(() => { error.value = null }, 3000)
    return
  }

  isSendingCircular.value = true
  try {
    await $fetch('/api/game/alliance/circular', {
      method: 'POST',
      body: circularForm.value,
    })
    success.value = 'Đã gửi thư liên minh đến tất cả thành viên!'
    circularForm.value = { subject: '', content: '' }
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi thư'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSendingCircular.value = false
  }
}

const saveSettings = async () => {
  isSavingSettings.value = true
  try {
    await $fetch('/api/game/alliance/settings', {
      method: 'POST',
      body: settingsForm.value,
    })
    success.value = 'Đã lưu cài đặt!'
    await refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi lưu cài đặt'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSavingSettings.value = false
  }
}

const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd/MM/yyyy')

const getRankName = (rank: string) => {
  const names: Record<string, string> = {
    CHIEN_BINH_SO_CAP: 'Chiến Binh Sơ Cấp',
    CHIEN_TUONG: 'Chiến Tướng',
    DAI_TUONG: 'Đại Tướng',
    NGUYEN_SOAI: 'Nguyên Soái',
    DAI_DE: 'Đại Đế',
    VU_TRU_CAP: 'Vũ Trụ Cấp',
  }
  return names[rank] || rank
}

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num || 0)

// Calculate alliance stats
const allianceStats = computed(() => {
  if (!alliance.value?.members) return { totalPoints: 0, avgPoints: 0, onlineCount: 0 }
  
  const members = alliance.value.members
  const totalPoints = members.reduce((sum: number, m: any) => sum + (m.points || 0), 0)
  const avgPoints = Math.round(totalPoints / members.length)
  const onlineCount = members.filter((m: any) => m.isOnline).length
  
  return { totalPoints, avgPoints, onlineCount }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Liên Minh</h1>
        <p class="text-neutral-500 mt-1">Hợp tác cùng phát triển và chinh phục vũ trụ</p>
      </div>
      <button @click="refresh()" class="neo-btn-ghost p-2.5" :class="{ 'animate-spin': pending }">
        <IconsTaiDang class="w-5 h-5" />
      </button>
    </div>

    <!-- Messages -->
    <Transition name="fade">
      <div v-if="error" class="neo-card p-4 border-l-2 border-alert-400 bg-alert-400/10 flex items-center gap-3">
        <IconsCanhBao class="w-5 h-5 text-alert-400 flex-shrink-0" />
        <p class="text-alert-400">{{ error }}</p>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="success" class="neo-card p-4 border-l-2 border-success-400 bg-success-400/10 flex items-center gap-3">
        <IconsHoanThanh class="w-5 h-5 text-success-400 flex-shrink-0" />
        <p class="text-success-400">{{ success }}</p>
      </div>
    </Transition>

    <!-- NO ALLIANCE VIEW -->
    <div v-if="!hasAlliance" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Create Alliance -->
      <UiCard title="Thành Lập Liên Minh" subtitle="Tạo liên minh mới và trở thành lãnh đạo">
        <div class="space-y-4">
          <div>
            <label class="neo-label">Tên Liên Minh</label>
            <input 
              v-model="createForm.name"
              type="text" 
              class="neo-input"
              placeholder="Ví dụ: Thôn Phệ Tinh Không"
              maxlength="30"
            >
          </div>
          <div>
            <label class="neo-label">Tag (Viết tắt)</label>
            <input 
              v-model="createForm.tag"
              type="text" 
              class="neo-input uppercase"
              placeholder="Ví dụ: TPTK"
              maxlength="8"
            >
          </div>
          <div>
            <label class="neo-label">Mô tả (tùy chọn)</label>
            <textarea 
              v-model="createForm.description"
              class="neo-input resize-none"
              rows="3"
              placeholder="Giới thiệu về liên minh..."
              maxlength="500"
            ></textarea>
          </div>
          <button 
            class="w-full neo-btn-success flex items-center justify-center gap-2"
            :disabled="isCreating"
            @click="createAlliance"
          >
            <svg v-if="isCreating" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <IconsThienHa v-else class="w-5 h-5" />
            {{ isCreating ? 'Đang tạo...' : 'Thành Lập' }}
          </button>
        </div>
      </UiCard>

      <!-- Find Alliance -->
      <UiCard title="Tìm Kiếm Liên Minh" subtitle="Gia nhập một liên minh có sẵn">
        <div class="space-y-4">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input 
                v-model="searchQuery"
                type="text" 
                class="neo-input pl-10"
                placeholder="Nhập tên hoặc tag..."
                @keyup.enter="searchAlliance"
              >
              <IconsThienHa class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            </div>
            <button 
              class="neo-btn flex items-center gap-2"
              :disabled="isSearching"
              @click="searchAlliance"
            >
              <svg v-if="isSearching" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Tìm
            </button>
          </div>

          <div class="space-y-2 max-h-[350px] overflow-y-auto">
            <div 
              v-for="item in searchResults" 
              :key="item._id"
              class="neo-card p-4 flex justify-between items-center gap-4"
            >
              <div class="flex-1 min-w-0">
                <p class="font-display font-bold text-white truncate">
                  [{{ item.tag }}] {{ item.name }}
                </p>
                <p class="text-xs text-neutral-500">{{ item.memberCount }} thành viên</p>
              </div>
              <button class="neo-btn-ghost text-sm" @click="openApplyModal(item._id)">
                Xin vào
              </button>
            </div>
            
            <div v-if="searchResults.length === 0 && !isSearching" class="text-center py-8 text-neutral-500">
              <IconsThienHa class="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nhập từ khóa để tìm kiếm</p>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- HAS ALLIANCE VIEW -->
    <template v-else>
      <!-- Alliance Header -->
      <div class="neo-card p-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <IconsThienHa class="w-32 h-32" />
        </div>
        <div class="relative z-10">
          <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div class="flex-1">
              <h2 class="text-3xl font-display font-bold text-white">
                [{{ alliance?.tag }}] {{ alliance?.name }}
              </h2>
              <p class="text-neutral-400 mt-1 max-w-2xl">{{ alliance?.description || 'Chưa có mô tả' }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="neo-card px-3 py-1.5 text-sm border-primary-500/30">
                <IconsNguoiChoi class="w-4 h-4 inline mr-1 text-primary-400" />
                {{ alliance?.members?.length || 0 }} thành viên
              </span>
              <span class="neo-card px-3 py-1.5 text-sm border-success-500/30">
                <span class="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
                {{ allianceStats.onlineCount }} online
              </span>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="text-center">
              <p class="text-2xl font-mono font-bold text-primary-400">{{ formatNumber(allianceStats.totalPoints) }}</p>
              <p class="text-xs text-neutral-500 uppercase">Tổng điểm</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-mono font-bold text-success-400">{{ formatNumber(allianceStats.avgPoints) }}</p>
              <p class="text-xs text-neutral-500 uppercase">Điểm TB</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-mono font-bold text-warning-400">{{ alliance?.members?.length || 0 }}</p>
              <p class="text-xs text-neutral-500 uppercase">Thành viên</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-mono font-bold">{{ formatDate(alliance?.createdAt) }}</p>
              <p class="text-xs text-neutral-500 uppercase">Ngày thành lập</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in allianceTabs"
          :key="tab.id"
          class="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
          :class="activeTab === tab.id ? 'neo-btn' : 'neo-btn-ghost'"
          @click="activeTab = tab.id"
          :disabled="(tab.id === 'applications' || tab.id === 'settings') && !isOwner"
        >
          <component :is="`Icons${tab.icon}`" class="w-5 h-5" />
          {{ tab.label }}
          <span v-if="tab.id === 'applications' && isOwner && alliance?.applications?.length > 0" 
                class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning-500/20 text-warning-400">
            {{ alliance.applications.length }}
          </span>
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <div class="neo-card p-6">
          <h3 class="font-display font-bold text-lg mb-4">Về Liên Minh</h3>
          <p class="text-neutral-400 whitespace-pre-wrap">{{ alliance?.description || 'Chưa có mô tả' }}</p>
        </div>

        <div class="flex justify-end">
          <button class="neo-btn-ghost text-alert-400 hover:bg-alert-400/10" @click="leaveAlliance">
            <IconsQuayLai class="w-4 h-4 mr-2" />
            {{ isOwner ? 'Giải tán Liên minh' : 'Rời Liên minh' }}
          </button>
        </div>
      </div>

      <!-- Members Tab -->
      <div v-if="activeTab === 'members'">
        <UiCard :padding="false">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 text-neutral-400 uppercase font-display">
              <tr>
                <th class="px-4 py-3">Thành Viên</th>
                <th class="px-4 py-3">Cấp Bậc</th>
                <th class="px-4 py-3 text-right">Điểm</th>
                <th class="px-4 py-3 text-center">Trạng Thái</th>
                <th v-if="isOwner" class="px-4 py-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="member in alliance?.members" :key="member._id" class="hover:bg-white/5">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 neo-card flex items-center justify-center border-primary-500/20">
                      <IconsNguoiChoi class="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <p class="font-medium text-white">{{ member.username }}</p>
                      <span v-if="member._id === alliance?.owner" class="text-xs text-yellow-500 border border-yellow-500/30 px-1 rounded">
                        CHỦ MINH
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-neutral-400">{{ getRankName(member.rank) }}</td>
                <td class="px-4 py-3 text-right font-mono text-primary-300">{{ formatNumber(member.points) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="w-2 h-2 rounded-full inline-block" :class="member.isOnline ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-neutral-600'"></span>
                </td>
                <td v-if="isOwner" class="px-4 py-3 text-center">
                  <button 
                    v-if="member._id !== alliance?.owner"
                    class="neo-btn-ghost text-xs text-alert-400 hover:bg-alert-400/10"
                    :disabled="processingIds.has(member._id)"
                    @click="kickMember(member._id, member.username)"
                  >
                    <svg v-if="processingIds.has(member._id)" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span v-else>Đuổi</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </UiCard>
      </div>

      <!-- Applications Tab (Owner only) -->
      <div v-if="activeTab === 'applications' && isOwner" class="space-y-4">
        <div v-if="!alliance?.applications?.length" class="neo-card p-12 text-center">
          <IconsThoiGian class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
          <p class="text-neutral-500">Không có đơn xin gia nhập nào</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="app in alliance.applications" 
            :key="app._id"
            class="neo-card p-4"
          >
            <div class="flex items-start gap-4 mb-3">
              <div class="w-12 h-12 neo-card flex items-center justify-center border-warning-500/30 flex-shrink-0">
                <IconsNguoiChoi class="w-6 h-6 text-warning-500" />
              </div>
              <div class="flex-1">
                <p class="font-display font-bold text-white">{{ app.player?.username }}</p>
                <p class="text-sm text-neutral-500">{{ getRankName(app.player?.rank) }} • {{ formatNumber(app.player?.points) }} điểm</p>
                <p class="text-xs text-neutral-500 mt-1">{{ formatDate(app.createdAt) }}</p>
              </div>
            </div>
            
            <p v-if="app.message" class="text-sm text-neutral-400 mb-4 p-3 bg-white/5 rounded italic">
              "{{ app.message }}"
            </p>
            
            <div class="flex gap-2">
              <button 
                class="flex-1 neo-btn-success text-sm flex items-center justify-center gap-2"
                :disabled="processingIds.has(app._id)"
                @click="handleApplication(app._id, 'ACCEPT')"
              >
                <svg v-if="processingIds.has(app._id)" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <IconsHoanThanh v-else class="w-4 h-4" />
                Chấp nhận
              </button>
              <button 
                class="flex-1 neo-btn-ghost text-sm flex items-center justify-center gap-2"
                :disabled="processingIds.has(app._id)"
                @click="handleApplication(app._id, 'REJECT')"
              >
                <IconsDong class="w-4 h-4" />
                Từ chối
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Circular Mail Tab -->
      <div v-if="activeTab === 'circular'" class="max-w-2xl mx-auto">
        <UiCard title="Gửi Thư Liên Minh" subtitle="Gửi tin nhắn đến tất cả thành viên">
          <div class="space-y-4">
            <div>
              <label class="neo-label">Tiêu đề</label>
              <input 
                v-model="circularForm.subject"
                type="text" 
                class="neo-input"
                placeholder="Tiêu đề thư..."
              >
            </div>
            <div>
              <label class="neo-label">Nội dung</label>
              <textarea 
                v-model="circularForm.content"
                class="neo-input resize-none"
                rows="6"
                placeholder="Nội dung thư gửi đến tất cả thành viên..."
              ></textarea>
            </div>
            <button 
              class="w-full neo-btn-success flex items-center justify-center gap-2"
              :disabled="isSendingCircular || !circularForm.subject || !circularForm.content"
              @click="sendCircularMail"
            >
              <svg v-if="isSendingCircular" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <IconsVanChuyen v-else class="w-5 h-5" />
              {{ isSendingCircular ? 'Đang gửi...' : `Gửi đến ${alliance?.members?.length || 0} thành viên` }}
            </button>
          </div>
        </UiCard>
      </div>

      <!-- Settings Tab (Owner only) -->
      <div v-if="activeTab === 'settings' && isOwner" class="max-w-2xl mx-auto">
        <UiCard title="Cài Đặt Liên Minh" subtitle="Chỉnh sửa thông tin liên minh">
          <div class="space-y-4">
            <div>
              <label class="neo-label">Mô tả Liên Minh</label>
              <textarea 
                v-model="settingsForm.description"
                class="neo-input resize-none"
                rows="5"
                placeholder="Giới thiệu về liên minh của bạn..."
                maxlength="500"
              ></textarea>
              <p class="text-xs text-neutral-500 text-right mt-1">{{ settingsForm.description.length }}/500</p>
            </div>
            <button 
              class="w-full neo-btn-success flex items-center justify-center gap-2"
              :disabled="isSavingSettings"
              @click="saveSettings"
            >
              <svg v-if="isSavingSettings" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <IconsHoanThanh v-else class="w-5 h-5" />
              {{ isSavingSettings ? 'Đang lưu...' : 'Lưu Cài Đặt' }}
            </button>
          </div>
        </UiCard>
      </div>
    </template>

    <!-- Apply Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isApplyModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click="isApplyModalOpen = false">
          <div class="neo-card w-full max-w-md" @click.stop>
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 class="text-lg font-display font-bold text-white">Xin Gia Nhập Liên Minh</h3>
              <button class="text-neutral-400 hover:text-white" @click="isApplyModalOpen = false">
                <IconsDong class="w-5 h-5" />
              </button>
            </div>
            <div class="p-4">
              <label class="neo-label">Lời nhắn (tùy chọn)</label>
              <textarea 
                v-model="applyMessage"
                rows="4"
                class="neo-input resize-none"
                placeholder="Giới thiệu bản thân..."
                maxlength="200"
              ></textarea>
            </div>
            <div class="p-4 border-t border-white/10 flex justify-end gap-2">
              <button class="neo-btn-ghost" @click="isApplyModalOpen = false">Hủy</button>
              <button 
                class="neo-btn-success flex items-center gap-2"
                :disabled="isApplying"
                @click="sendApplication"
              >
                <svg v-if="isApplying" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isApplying ? 'Đang gửi...' : 'Gửi đơn' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
