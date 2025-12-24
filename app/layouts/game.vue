<script setup lang="ts">
const route = useRoute()

const navigation = [
  { name: 'Tổng quan', href: '/game/overview', icon: 'mdi:view-dashboard' },
  { name: 'Công trình', href: '/game/buildings', icon: 'mdi:office-building' },
  { name: 'Nghiên cứu', href: '/game/research', icon: 'mdi:flask' },
  { name: 'Xưởng tàu', href: '/game/shipyard', icon: 'mdi:rocket-launch' },
  { name: 'Hạm đội', href: '/game/fleet', icon: 'mdi:ship-wheel' },
  { name: 'Thiên hà', href: '/game/galaxy', icon: 'mdi:galaxy' },
]

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)

const isActiveRoute = (href: string) => route.path === href
</script>

<template>
  <div class="min-h-screen bg-space-900 text-slate-100">
    <!-- Star field background -->
    <div class="star-field" />

    <!-- Mobile menu button -->
    <button
      class="fixed top-4 left-4 z-50 lg:hidden glass-card p-2"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
      <Icon :name="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" class="text-2xl" />
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 glass-card border-r border-space-700 transform transition-transform duration-300 lg:translate-x-0"
      :class="{
        'translate-x-0': isMobileMenuOpen,
        '-translate-x-full': !isMobileMenuOpen && !isSidebarOpen,
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-4 border-b border-space-700">
          <NuxtLink to="/game/overview" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Icon name="mdi:rocket-launch-outline" class="text-2xl text-white" />
            </div>
            <div>
              <h1 class="font-display font-bold text-lg text-gradient">
                Thôn Phệ
              </h1>
              <p class="text-xs text-slate-500">Tinh Không</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
            :class="
              isActiveRoute(item.href)
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:bg-space-700 hover:text-slate-200'
            "
            @click="isMobileMenuOpen = false"
          >
            <Icon :name="item.icon" class="text-xl" />
            <span class="font-medium">{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-space-700">
          <NuxtLink
            to="/game/settings"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-space-700 hover:text-slate-200 transition-colors"
          >
            <Icon name="mdi:cog" class="text-xl" />
            <span>Cài đặt</span>
          </NuxtLink>
          <button
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full mt-1"
          >
            <Icon name="mdi:logout" class="text-xl" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- Main content -->
    <main class="lg:ml-64 relative z-10 min-h-screen">
      <!-- Top bar with resources -->
      <header class="sticky top-0 z-20 p-4 bg-space-900/80 backdrop-blur-md border-b border-space-700">
        <GameResourceBar
          :tinh-thach="1000000"
          :nang-luong-vu-tru="500000"
          :hon-thach="250000"
          :dien-nang="150"
          :dien-nang-max="200"
          show-production
          :production="{
            tinhThach: 5000,
            nangLuongVuTru: 2500,
            honThach: 1000,
          }"
        />
      </header>

      <!-- Page content -->
      <div class="p-4 md:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
