<script setup lang="ts">
const theme = useTheme()
</script>

<template>
  <button
    class="theme-toggle-btn group relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-[var(--space-light)]"
    :title="theme.isDark.value ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
    @click="theme.toggleTheme()"
  >
    <!-- Sun icon (light mode) -->
    <svg
      v-if="theme.isDark.value"
      class="w-5 h-5 text-[var(--accent-gold)] transition-transform duration-200 group-hover:scale-110"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
    
    <!-- Moon icon (dark mode) -->
    <svg
      v-else
      class="w-5 h-5 text-[var(--accent-purple)] transition-transform duration-200 group-hover:scale-110"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    
    <!-- Glow effect on hover -->
    <span 
      class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      :class="theme.isDark.value ? 'neo-glow-gold' : 'neo-glow-purple'"
      style="filter: blur(8px);"
    />
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  border: 1px solid var(--border-subtle);
  background: var(--space-medium);
}

.theme-toggle-btn:hover {
  border-color: var(--border-active);
}
</style>
