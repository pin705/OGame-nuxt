<script setup lang="ts">
import { BUILDINGS, RESEARCHES, SHIPS } from '~/config/gameConfig'
import { BuildingType, ResearchType, ShipType } from '~/types/game'

const game = useGame()
const countdown = useCountdown()

const isExpanded = ref(false)
const isCancelling = ref<string | null>(null)

// Get all queue items
const buildingQueue = computed(() => game.buildQueue.value?.buildingQueue || [])
const research = computed(() => game.buildQueue.value?.research)
const ships = computed(() => game.buildQueue.value?.ships || [])

const hasActiveQueue = computed(() => {
  return buildingQueue.value.length > 0 || research.value || ships.value.length > 0
})

const totalQueueItems = computed(() => {
  return buildingQueue.value.length + (research.value ? 1 : 0) + ships.value.length
})

const getItemName = (type: string, queueType: string) => {
  if (queueType === 'building') {
    return BUILDINGS[type as BuildingType]?.name || type
  }
  if (queueType === 'research') {
    return RESEARCHES[type as ResearchType]?.name || type
  }
  if (queueType === 'ship') {
    return SHIPS[type as ShipType]?.name || type
  }
  return type
}

const formatTime = (seconds: number | null | undefined) => {
  if (!seconds || seconds <= 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const cancelBuilding = async (queueId: string) => {
  if (isCancelling.value) return
  isCancelling.value = queueId

  try {
    await $fetch('/api/game/building/cancel', {
      method: 'POST',
      body: {
        queueId,
        planetId: game.currentPlanetId.value,
      },
    })
    await game.fetchBuildQueue()
    await game.fetchPlanet()
  } catch (error) {
    console.error('Failed to cancel building:', error)
  } finally {
    isCancelling.value = null
  }
}

// Toggle expanded state
const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50">
      <!-- Collapsed Badge - Show when has queue and collapsed -->
      <button
        v-if="hasActiveQueue && !isExpanded"
        class="relative flex items-center gap-2 px-4 py-3 bg-[var(--neo-bg-card)] backdrop-blur-sm border border-[var(--neo-border-active)] rounded-lg shadow-lg hover:border-[var(--neo-cyan)] transition-all neo-glow-cyan"
        @click="toggle"
      >
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-[var(--neo-cyan)] animate-pulse" />
          <span class="text-sm font-medium text-[var(--neo-text-primary)]">Hàng đợi</span>
        </div>
        <span class="bg-[var(--neo-cyan-glow)] text-[var(--neo-cyan)] text-xs font-bold px-2 py-0.5 rounded-full">
          {{ totalQueueItems }}
        </span>
        <IconsMuiTen class="w-4 h-4 text-[var(--neo-text-muted)] rotate-180" />
      </button>

      <!-- Expanded Panel -->
      <div
        v-if="isExpanded"
        class="w-80 bg-[var(--neo-bg-card)] backdrop-blur-sm border border-[var(--neo-border)] rounded-lg shadow-xl overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--neo-border)] bg-[var(--neo-bg-dark)]">
          <div class="flex items-center gap-2">
            <IconsThoiGian class="w-5 h-5 text-[var(--neo-cyan)]" />
            <h3 class="font-semibold text-[var(--neo-text-primary)]">Hàng Đợi Xây Dựng</h3>
          </div>
          <button
            class="p-1 hover:bg-[var(--neo-bg-elevated)] rounded transition-colors"
            @click="toggle"
          >
            <IconsDong class="w-4 h-4 text-[var(--neo-text-muted)]" />
          </button>
        </div>

        <!-- Queue Content -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Empty State -->
          <div v-if="!hasActiveQueue" class="p-6 text-center">
            <IconsThoiGian class="w-10 h-10 text-[var(--neo-text-dim)] mx-auto mb-2" />
            <p class="text-sm text-[var(--neo-text-muted)]">Không có công trình nào đang xây dựng</p>
          </div>

          <!-- Buildings Queue -->
          <div v-if="buildingQueue.length > 0" class="p-3 space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <IconsMoKhoang class="w-4 h-4 text-[var(--neo-crystal)]" />
              <span class="text-xs font-medium text-[var(--neo-text-muted)] uppercase tracking-wider">Công trình</span>
            </div>

            <div
              v-for="(item, index) in buildingQueue"
              :key="item.id"
              class="relative p-3 rounded-lg border transition-all"
              :class="item.status === 'IN_PROGRESS' 
                ? 'bg-[var(--neo-cyan-glow)] border-[var(--neo-border-active)]' 
                : 'bg-[var(--neo-bg-dark)] border-[var(--neo-border)]'"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span 
                      class="text-xs font-bold px-1.5 py-0.5 rounded"
                      :class="item.status === 'IN_PROGRESS' ? 'bg-[var(--neo-cyan-glow)] text-[var(--neo-cyan)]' : 'bg-[var(--neo-bg-elevated)] text-[var(--neo-text-muted)]'"
                    >
                      {{ Number(index) + 1 }}
                    </span>
                    <span class="text-sm font-medium text-[var(--neo-text-primary)] truncate">
                      {{ getItemName(item.type, 'building') }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-[var(--neo-text-muted)]">Cấp {{ item.level }}</span>
                    <template v-if="item.status === 'IN_PROGRESS'">
                      <span class="text-xs text-[var(--neo-cyan)] font-mono">
                        {{ formatTime(countdown.buildingRemaining.value) }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="text-xs text-[var(--neo-text-muted)]">Đang chờ</span>
                    </template>
                  </div>
                </div>

                <!-- Cancel Button -->
                <button
                  class="p-1.5 rounded hover:bg-[var(--neo-red-glow)] text-[var(--neo-text-muted)] hover:text-[var(--neo-danger)] transition-colors"
                  :disabled="isCancelling === item.id"
                  title="Hủy xây dựng"
                  @click.stop="cancelBuilding(item.id)"
                >
                  <svg v-if="isCancelling === item.id" class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <IconsDong v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Progress bar for active item -->
              <div
                v-if="item.status === 'IN_PROGRESS' && item.remainingSeconds != null"
                class="mt-2 h-1 bg-[var(--neo-bg-dark)] rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-[var(--neo-cyan-dark)] to-[var(--neo-cyan)] transition-all duration-1000"
                  :style="{ width: `${Math.max(0, 100 - (countdown.buildingRemaining.value / (item.durationSeconds || 1)) * 100)}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Research Queue -->
          <div v-if="research" class="p-3 border-t border-[var(--neo-border)]">
            <div class="flex items-center gap-2 mb-2">
              <IconsNghienCuu class="w-4 h-4 text-[var(--neo-purple)]" />
              <span class="text-xs font-medium text-[var(--neo-text-muted)] uppercase tracking-wider">Nghiên cứu</span>
            </div>

            <div class="p-3 rounded-lg bg-[var(--neo-purple-glow)] border border-[var(--neo-purple)]/30">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm font-medium text-[var(--neo-text-primary)]">
                    {{ getItemName(research.type, 'research') }}
                  </span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-[var(--neo-text-muted)]">Cấp {{ research.level }}</span>
                    <span class="text-xs text-[var(--neo-purple)] font-mono">
                      {{ formatTime(countdown.researchRemaining.value) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ships Queue -->
          <div v-if="ships.length > 0" class="p-3 border-t border-[var(--neo-border)]">
            <div class="flex items-center gap-2 mb-2">
              <IconsChienHam class="w-4 h-4 text-[var(--neo-orange)]" />
              <span class="text-xs font-medium text-[var(--neo-text-muted)] uppercase tracking-wider">Tàu chiến</span>
            </div>

            <div
              v-for="ship in ships"
              :key="ship.id"
              class="p-3 rounded-lg bg-[var(--neo-orange-glow)] border border-[var(--neo-orange)]/30 mb-2 last:mb-0"
            >
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm font-medium text-[var(--neo-text-primary)]">
                    {{ getItemName(ship.type, 'ship') }}
                  </span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-[var(--neo-text-muted)]">x{{ ship.count }}</span>
                    <span class="text-xs text-[var(--neo-orange)] font-mono">
                      {{ formatTime(ship.remainingSeconds) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with queue capacity -->
        <div class="px-4 py-2 border-t border-[var(--neo-border)] bg-[var(--neo-bg-dark)]">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[var(--neo-text-muted)]">Công trình trong hàng đợi</span>
            <span class="font-mono" :class="buildingQueue.length >= 6 ? 'text-[var(--neo-warning)]' : 'text-[var(--neo-text-secondary)]'">
              {{ buildingQueue.filter((b: any) => b.status === 'IN_PROGRESS').length }}/3 đang xây · {{ buildingQueue.filter((b: any) => b.status === 'PENDING').length }}/3 chờ
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
