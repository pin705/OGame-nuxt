<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

const currentGalaxy = ref(1)
const currentSystem = ref(250)

const systemPlanets = ref([
  { position: 1, planet: null },
  { position: 2, planet: { name: 'Hoang Mạc Alpha', owner: 'StarLord', level: 25, alliance: 'VN Elite' } },
  { position: 3, planet: null },
  { position: 4, planet: { name: 'Tinh Cầu X', owner: 'DarkMatter', level: 18, alliance: null } },
  { position: 5, planet: null },
  { position: 6, planet: null },
  { position: 7, planet: { name: 'Neo Earth', owner: 'Commander', level: 32, alliance: 'Warriors' } },
  { position: 8, planet: { name: 'Hành Tinh Mẫu', owner: 'LaPhong', level: 15, alliance: null, isOwn: true } },
  { position: 9, planet: null },
  { position: 10, planet: { name: 'Dark World', owner: 'Phantom', level: 22, alliance: 'Shadow' } },
  { position: 11, planet: null },
  { position: 12, planet: null },
  { position: 13, planet: { name: 'Ice Giant', owner: 'Frozen', level: 28, alliance: 'Arctic' } },
  { position: 14, planet: null },
  { position: 15, planet: null },
])

const navigateSystem = (direction: 'prev' | 'next') => {
  if (direction === 'prev') {
    if (currentSystem.value > 1) currentSystem.value--
    else {
      currentSystem.value = 499
      if (currentGalaxy.value > 1) currentGalaxy.value--
      else currentGalaxy.value = 9
    }
  } else {
    if (currentSystem.value < 499) currentSystem.value++
    else {
      currentSystem.value = 1
      if (currentGalaxy.value < 9) currentGalaxy.value++
      else currentGalaxy.value = 1
    }
  }
}

const goToSystem = () => {
  // In real app, this would fetch new system data
  console.log(`Navigating to [${currentGalaxy.value}:${currentSystem.value}:*]`)
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
          <Icon name="mdi:chevron-left" />
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
          <Icon name="mdi:chevron-right" />
        </button>
        
        <button class="btn-primary" @click="goToSystem">
          <Icon name="mdi:magnify" />
          Đi đến
        </button>
      </div>
    </div>

    <!-- Galaxy View -->
    <div class="glass-card overflow-hidden">
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
          v-for="slot in systemPlanets"
          :key="slot.position"
          class="grid grid-cols-12 gap-2 p-4 items-center transition-colors"
          :class="{
            'bg-space-800/30': slot.planet,
            'hover:bg-space-700/30': slot.planet,
            'bg-primary-500/10': slot.planet?.isOwn,
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
                  :class="slot.planet.isOwn ? 'bg-primary-500/30' : 'bg-slate-700'"
                >
                  <Icon name="mdi:earth" class="text-xl" :class="slot.planet.isOwn ? 'text-primary-400' : 'text-slate-400'" />
                </div>
                <div>
                  <p class="font-medium text-slate-200">{{ slot.planet.name }}</p>
                  <p v-if="slot.planet.isOwn" class="text-xs text-primary-400">Hành tinh của bạn</p>
                </div>
              </div>
            </template>
            <template v-else>
              <span class="text-slate-600">— Trống —</span>
            </template>
          </div>

          <!-- Owner -->
          <div class="col-span-2">
            <template v-if="slot.planet">
              <span
                class="font-medium"
                :class="slot.planet.isOwn ? 'text-primary-400' : 'text-slate-300'"
              >
                {{ slot.planet.owner }}
              </span>
            </template>
          </div>

          <!-- Level -->
          <div class="col-span-1 text-center">
            <template v-if="slot.planet">
              <span class="font-mono text-slate-300">{{ slot.planet.level }}</span>
            </template>
          </div>

          <!-- Alliance -->
          <div class="col-span-2">
            <template v-if="slot.planet?.alliance">
              <span class="badge badge-info">{{ slot.planet.alliance }}</span>
            </template>
          </div>

          <!-- Actions -->
          <div class="col-span-3">
            <template v-if="slot.planet && !slot.planet.isOwn">
              <div class="flex items-center justify-center gap-2">
                <button class="btn-ghost text-xs px-3 py-1">
                  <Icon name="mdi:eye" />
                  Do thám
                </button>
                <button class="btn-ghost text-xs px-3 py-1 text-red-400 hover:bg-red-500/10">
                  <Icon name="mdi:sword" />
                  Tấn công
                </button>
                <button class="btn-ghost text-xs px-3 py-1">
                  <Icon name="mdi:truck" />
                  Vận chuyển
                </button>
              </div>
            </template>
            <template v-else-if="!slot.planet">
              <div class="flex items-center justify-center">
                <button class="btn-ghost text-xs px-3 py-1 text-green-400 hover:bg-green-500/10">
                  <Icon name="mdi:earth-plus" />
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
        <Icon name="mdi:earth-plus" class="text-green-400" />
        <span>Có thể thuộc địa hóa</span>
      </div>
    </div>
  </div>
</template>
