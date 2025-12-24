<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

const { player } = useAuth()
const { currentGalaxy, currentSystem, systemView, isLoading, fetchSystem, changeGalaxy, changeSystem, jumpTo, formatCoords } = useGalaxy()

// Fetch initial data
onMounted(() => {
  fetchSystem()
})

const navigateSystem = (direction: 'prev' | 'next') => {
  if (direction === 'prev') {
    if (currentSystem.value > 1) {
      changeSystem(-1)
    } else {
      currentSystem.value = 499
      if (currentGalaxy.value > 1) {
        changeGalaxy(-1)
      } else {
        currentGalaxy.value = 9
      }
      fetchSystem()
    }
  } else {
    if (currentSystem.value < 499) {
      changeSystem(1)
    } else {
      currentSystem.value = 1
      if (currentGalaxy.value < 9) {
        changeGalaxy(1)
      } else {
        currentGalaxy.value = 1
      }
      fetchSystem()
    }
  }
}

const goToSystem = () => {
  fetchSystem(currentGalaxy.value, currentSystem.value)
}

// Check if planet is owned by current player
const isOwnPlanet = (slot: any) => {
  return slot.owner?._id === player.value?._id || slot.owner?.username === player.value?.username
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold">Thiên Hà</h1>
        <p class="text-slate-400">Khám phá vũ trụ và tìm kiếm mục tiêu</p>
      </div>
      
      <!-- Navigation Controls -->
      <div class="flex items-center gap-2">
        <button
          class="btn-ghost"
          @click="navigateSystem('prev')"
        >
          <IconsMuiTen class="w-5 h-5 rotate-180" />
        </button>
        
        <div class="flex items-center gap-2 glass-card px-4 py-2">
          <label class="text-sm text-slate-400">Thiên hà:</label>
          <select
            v-model="currentGalaxy"
            class="bg-space-700 border-none rounded px-2 py-1 text-slate-200 focus:ring-1 focus:ring-primary-500"
            @change="goToSystem"
          >
            <option v-for="g in 9" :key="g" :value="g">{{ g }}</option>
          </select>
          
          <label class="text-sm text-slate-400 ml-2">Hệ sao:</label>
          <input
            v-model.number="currentSystem"
            type="number"
            min="1"
            max="499"
            class="w-20 bg-space-700 border-none rounded px-2 py-1 text-slate-200 focus:ring-1 focus:ring-primary-500"
            @change="goToSystem"
          >
        </div>
        
        <button
          class="btn-ghost"
          @click="navigateSystem('next')"
        >
          <IconsMuiTen class="w-5 h-5" />
        </button>
        
        <button class="btn-primary flex items-center gap-2" @click="goToSystem">
          <IconsThienHa class="w-4 h-4" />
          Đi đến
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <!-- Galaxy View -->
    <div v-if="!isLoading && systemView.length > 0" class="glass-card overflow-hidden">
      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-2 p-4 bg-space-800/50 border-b border-space-700 text-sm font-medium text-slate-400">
        <div class="col-span-1 text-center">Vị trí</div>
        <div class="col-span-3">Hành tinh</div>
        <div class="col-span-2">Người chơi</div>
        <div class="col-span-1 text-center">Cấp</div>
        <div class="col-span-2">Liên minh</div>
        <div class="col-span-3 text-center">Hành động</div>
      </div>

      <!-- Planet Rows -->
      <div class="divide-y divide-space-700">
        <div
          v-for="slot in systemView"
          :key="slot.position"
          class="grid grid-cols-12 gap-2 p-4 items-center transition-colors"
          :class="{
            'bg-space-800/30': slot.planet,
            'hover:bg-space-700/30': slot.planet,
            'bg-primary-500/10': isOwnPlanet(slot),
          }"
        >
          <!-- Position -->
          <div class="col-span-1 text-center">
            <span class="font-mono text-slate-400">
              {{ currentGalaxy }}:{{ currentSystem }}:{{ slot.position }}
            </span>
          </div>

          <!-- Planet -->
          <div class="col-span-3">
            <template v-if="slot.planet">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="isOwnPlanet(slot) ? 'bg-primary-500/30' : 'bg-slate-700'"
                >
                  <IconsHanhTinh class="w-6 h-6" :class="isOwnPlanet(slot) ? 'text-primary-400' : 'text-slate-400'" />
                </div>
                <div>
                  <p class="font-medium text-slate-200">{{ slot.planet.name }}</p>
                  <p v-if="isOwnPlanet(slot)" class="text-xs text-primary-400">Hành tinh của bạn</p>
                </div>
              </div>
            </template>
            <template v-else>
              <span class="text-slate-600">— Trống —</span>
            </template>
          </div>

          <!-- Owner -->
          <div class="col-span-2">
            <template v-if="slot.planet && slot.owner">
              <span
                class="font-medium"
                :class="isOwnPlanet(slot) ? 'text-primary-400' : 'text-slate-300'"
              >
                {{ slot.owner.username }}
              </span>
            </template>
          </div>

          <!-- Level -->
          <div class="col-span-1 text-center">
            <template v-if="slot.owner">
              <span class="font-mono text-slate-300">{{ slot.owner.level || '?' }}</span>
            </template>
          </div>

          <!-- Alliance -->
          <div class="col-span-2">
            <!-- Alliance info not in current API - placeholder -->
          </div>

          <!-- Actions -->
          <div class="col-span-3">
            <template v-if="slot.planet && !isOwnPlanet(slot)">
              <div class="flex items-center justify-center gap-2">
                <button class="btn-ghost text-xs px-3 py-1 flex items-center gap-1">
                  <IconsTauDoTham class="w-4 h-4" />
                  Do thám
                </button>
                <button class="btn-ghost text-xs px-3 py-1 text-red-400 hover:bg-red-500/10 flex items-center gap-1">
                  <IconsTanCong class="w-4 h-4" />
                  Tấn công
                </button>
                <button class="btn-ghost text-xs px-3 py-1 flex items-center gap-1">
                  <IconsHamDoi class="w-4 h-4" />
                  Vận chuyển
                </button>
              </div>
            </template>
            <template v-else-if="!slot.planet">
              <div class="flex items-center justify-center">
                <button class="btn-ghost text-xs px-3 py-1 text-green-400 hover:bg-green-500/10 flex items-center gap-1">
                  <IconsHanhTinh class="w-4 h-4" />
                  Thuộc địa hóa
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-6 text-sm text-slate-500">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-primary-500/30" />
        <span>Hành tinh của bạn</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-full bg-slate-700" />
        <span>Hành tinh của người chơi khác</span>
      </div>
      <div class="flex items-center gap-2">
        <IconsHanhTinh class="w-4 h-4 text-green-400" />
        <span>Có thể thuộc địa hóa</span>
      </div>
    </div>
  </div>
</template>
