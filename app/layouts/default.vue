<script setup lang="ts">
// Default layout for landing and auth pages
</script>

<template>
  <div class="min-h-screen bg-space-900 text-slate-100">
    <!-- Star field background -->
    <div class="star-field" />

    <!-- Main content -->
    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>
