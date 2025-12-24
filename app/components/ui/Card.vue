<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  padding?: boolean
  hover?: boolean
  neon?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false,
  neon: false,
})
</script>

<template>
  <div
    class="glass-card"
    :class="{
      'p-4 md:p-6': padding,
      'glass-card-hover': hover,
      'neon-border': neon,
    }"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="card-header">
      <div>
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-slate-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </div>

    <!-- Content -->
    <slot />

    <!-- Footer -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-space-700">
      <slot name="footer" />
    </div>
  </div>
</template>
