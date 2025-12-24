<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const features = [
  {
    iconType: 'building',
    title: 'Xây Dựng Căn Cứ',
    description: 'Xây dựng các công trình khai thác tài nguyên, nghiên cứu và sản xuất tàu chiến.',
  },
  {
    iconType: 'research',
    title: 'Nghiên Cứu Công Nghệ',
    description: 'Nghiên cứu các công nghệ tiên tiến để nâng cao sức mạnh quân sự.',
  },
  {
    iconType: 'shipyard',
    title: 'Chế Tạo Hạm Đội',
    description: 'Chế tạo đội tàu chiến hùng mạnh từ Tiểu Chiến Hạm đến Tử Thần Tinh.',
  },
  {
    iconType: 'attack',
    title: 'Chiến Đấu Chinh Phục',
    description: 'Tấn công hành tinh địch, cướp tài nguyên và mở rộng lãnh thổ.',
  },
  {
    iconType: 'player',
    title: 'Liên Minh',
    description: 'Gia nhập hoặc thành lập liên minh để cùng nhau chinh phục vũ trụ.',
  },
  {
    iconType: 'galaxy',
    title: 'Khám Phá Thiên Hà',
    description: 'Khám phá 9 thiên hà với hàng nghìn hệ sao và hành tinh.',
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background effects -->
      <div class="neo-star-field" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,rgba(0,209,255,0.05)_0%,transparent_50%)]" />

      <!-- Content -->
      <div class="relative z-10 container mx-auto px-4 text-center">
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 neo-card border-primary-500/30 mb-6">
            <IconsTenLua class="w-5 h-5 text-primary-500" />
            <span class="text-sm text-primary-500">Dựa trên tiểu thuyết Thôn Phệ Tinh Không</span>
          </div>
          
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span class="text-gradient-cyan">Thôn Phệ</span>
            <br>
            <span>Tinh Không</span>
          </h1>
          
          <p class="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-8">
            Xây dựng đế chế vũ trụ của bạn. Chinh phục thiên hà. Trở thành Vũ Trụ Cấp Chiến Sĩ.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink to="/register" class="neo-btn-primary text-lg px-8 py-3 flex items-center gap-2">
              <IconsTenLua class="w-5 h-5" />
              Bắt Đầu Chinh Phục
            </NuxtLink>
            <NuxtLink to="/login" class="neo-btn-outline text-lg px-8 py-3 flex items-center gap-2">
              <IconsNguoiChoi class="w-5 h-5" />
              Đăng Nhập
            </NuxtLink>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16">
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-primary-500">9</p>
            <p class="text-sm text-neutral-500">Thiên Hà</p>
          </div>
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-success-400">4.5K+</p>
            <p class="text-sm text-neutral-500">Hệ Sao</p>
          </div>
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-warning-400">67K+</p>
            <p class="text-sm text-neutral-500">Hành Tinh</p>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <IconsMuiTen class="w-8 h-8 text-neutral-500 rotate-90" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold mb-4">
            Trở Thành <span class="text-gradient-cyan">Đại Đế Vũ Trụ</span>
          </h2>
          <p class="text-neutral-500 max-w-xl mx-auto">
            Từ một Chiến Binh Sơ Cấp, hãy xây dựng đế chế và trở thành Vũ Trụ Cấp Chiến Sĩ.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="neo-card neo-card-hover p-6"
          >
            <div class="w-12 h-12 neo-card flex items-center justify-center mb-4 border-primary-500/20">
              <IconsMoKhoang v-if="feature.iconType === 'building'" class="w-6 h-6 text-primary-500" />
              <IconsNghienCuu v-else-if="feature.iconType === 'research'" class="w-6 h-6 text-primary-500" />
              <IconsXuongDongTau v-else-if="feature.iconType === 'shipyard'" class="w-6 h-6 text-success-400" />
              <IconsTanCong v-else-if="feature.iconType === 'attack'" class="w-6 h-6 text-alert-400" />
              <IconsNguoiChoi v-else-if="feature.iconType === 'player'" class="w-6 h-6 text-warning-400" />
              <IconsThienHa v-else-if="feature.iconType === 'galaxy'" class="w-6 h-6 text-primary-500" />
            </div>
            <h3 class="font-display font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-neutral-500">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="neo-card neo-panel-glow p-8 md:p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-success-400/5" />
          
          <div class="relative z-10">
            <IconsTenLua class="w-16 h-16 text-primary-500 mx-auto mb-6" />
            <h2 class="text-2xl md:text-3xl font-display font-bold mb-4">
              Sẵn Sàng Chinh Phục Vũ Trụ?
            </h2>
            <p class="text-neutral-500 mb-8 max-w-lg mx-auto">
              Đăng ký miễn phí và nhận ngay hành tinh đầu tiên cùng 500 Tinh Thạch và 500 Năng Lượng Vũ Trụ.
            </p>
            <NuxtLink to="/register" class="neo-btn-primary text-lg px-8 py-3">
              Đăng Ký Miễn Phí
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-space-700 py-8 px-4">
      <div class="container mx-auto text-center text-slate-500 text-sm">
        <p>© 2024 Thôn Phệ Tinh Không. Inspired by OGame & Swallowed Star.</p>
        <p class="mt-2">Made with ❤️ using Nuxt 4, Tailwind CSS & MongoDB</p>
      </div>
    </footer>
  </div>
</template>
