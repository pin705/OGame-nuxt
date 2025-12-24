<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const features = [
  {
    icon: 'mdi:office-building',
    title: 'Xây Dựng Căn Cứ',
    description: 'Xây dựng các công trình khai thác tài nguyên, nghiên cứu và sản xuất tàu chiến.',
  },
  {
    icon: 'mdi:flask',
    title: 'Nghiên Cứu Công Nghệ',
    description: 'Nghiên cứu các công nghệ tiên tiến để nâng cao sức mạnh quân sự.',
  },
  {
    icon: 'mdi:rocket-launch',
    title: 'Chế Tạo Hạm Đội',
    description: 'Chế tạo đội tàu chiến hùng mạnh từ Tiểu Chiến Hạm đến Tử Thần Tinh.',
  },
  {
    icon: 'mdi:sword-cross',
    title: 'Chiến Đấu Chinh Phục',
    description: 'Tấn công hành tinh địch, cướp tài nguyên và mở rộng lãnh thổ.',
  },
  {
    icon: 'mdi:account-group',
    title: 'Liên Minh',
    description: 'Gia nhập hoặc thành lập liên minh để cùng nhau chinh phục vũ trụ.',
  },
  {
    icon: 'mdi:galaxy',
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
      <div class="absolute inset-0 bg-gradient-cosmic" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f172a_100%)]" />

      <!-- Content -->
      <div class="relative z-10 container mx-auto px-4 text-center">
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-6">
            <Icon name="mdi:star-four-points" class="text-primary-400" />
            <span class="text-sm text-primary-300">Dựa trên tiểu thuyết Thôn Phệ Tinh Không</span>
          </div>
          
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span class="text-gradient">Thôn Phệ</span>
            <br>
            <span class="text-slate-100">Tinh Không</span>
          </h1>
          
          <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Xây dựng đế chế vũ trụ của bạn. Chinh phục thiên hà. Trở thành Vũ Trụ Cấp Chiến Sĩ.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink to="/register" class="btn-primary text-lg px-8 py-3">
              <Icon name="mdi:rocket-launch" />
              Bắt Đầu Chinh Phục
            </NuxtLink>
            <NuxtLink to="/login" class="btn-outline text-lg px-8 py-3">
              <Icon name="mdi:login" />
              Đăng Nhập
            </NuxtLink>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16">
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-primary-400">9</p>
            <p class="text-sm text-slate-500">Thiên Hà</p>
          </div>
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-secondary-400">4.5K+</p>
            <p class="text-sm text-slate-500">Hệ Sao</p>
          </div>
          <div class="text-center">
            <p class="text-3xl md:text-4xl font-display font-bold text-accent-400">67K+</p>
            <p class="text-sm text-slate-500">Hành Tinh</p>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Icon name="mdi:chevron-double-down" class="text-3xl text-slate-500" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold mb-4">
            Trở Thành <span class="text-gradient">Đại Đế Vũ Trụ</span>
          </h2>
          <p class="text-slate-400 max-w-xl mx-auto">
            Từ một Chiến Binh Sơ Cấp, hãy xây dựng đế chế và trở thành Vũ Trụ Cấp Chiến Sĩ.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="glass-card-hover p-6"
          >
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center mb-4">
              <Icon :name="feature.icon" class="text-2xl text-primary-400" />
            </div>
            <h3 class="font-display font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-slate-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />
          
          <div class="relative z-10">
            <Icon name="mdi:rocket-launch-outline" class="text-6xl text-primary-400 mb-6" />
            <h2 class="text-2xl md:text-3xl font-display font-bold mb-4">
              Sẵn Sàng Chinh Phục Vũ Trụ?
            </h2>
            <p class="text-slate-400 mb-8 max-w-lg mx-auto">
              Đăng ký miễn phí và nhận ngay hành tinh đầu tiên cùng 500 Tinh Thạch và 500 Năng Lượng Vũ Trụ.
            </p>
            <NuxtLink to="/register" class="btn-primary text-lg px-8 py-3">
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
