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
    class="neo-card"
    :class="{
      'p-4 md:p-5': padding,
      'neo-card-hover': hover,
      'neo-glow-cyan': neon,
    }"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="neo-card-header">
      <div>
        <h3 v-if="title" class="neo-card-title">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-neutral-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </div>

    <!-- Content -->
    <slot />

    <!-- Footer -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-white/5">
      <slot name="footer" />
    </div>
  </div>
</template>
