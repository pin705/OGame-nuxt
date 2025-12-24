<script setup lang="ts">
interface GuideTip {
  id: string
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  priority: number
}

interface Props {
  tips: GuideTip[]
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
})

const emit = defineEmits<{
  dismiss: [id: string]
}>()

// Sort tips by priority
const sortedTips = computed(() => {
  return [...props.tips].sort((a, b) => a.priority - b.priority)
})

const activeTipIndex = ref(0)
const activeTip = computed(() => sortedTips.value[activeTipIndex.value])

const nextTip = () => {
  if (activeTipIndex.value < sortedTips.value.length - 1) {
    activeTipIndex.value++
  }
}

const prevTip = () => {
  if (activeTipIndex.value > 0) {
    activeTipIndex.value--
  }
}

const dismissTip = () => {
  emit('dismiss', activeTip.value.id)
}
</script>

<template>
  <div v-if="sortedTips.length > 0" class="neo-card p-4 border-l-2 border-primary-500 bg-primary-500/5">
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="w-10 h-10 neo-card flex items-center justify-center border-primary-500/30 flex-shrink-0">
        <IconsThongTin class="w-5 h-5 text-primary-500" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-display font-semibold text-primary-400">
            {{ activeTip.title }}
          </h4>
          <span v-if="sortedTips.length > 1" class="text-xs text-neutral-500">
            {{ activeTipIndex + 1 }}/{{ sortedTips.length }}
          </span>
        </div>
        
        <p class="text-sm text-neutral-400 mb-3">
          {{ activeTip.description }}
        </p>
        
        <div class="flex items-center gap-3">
          <!-- Action button -->
          <NuxtLink 
            v-if="activeTip.action"
            :to="activeTip.action.href"
            class="neo-btn text-xs px-3 py-1.5"
          >
            {{ activeTip.action.label }}
          </NuxtLink>
          
          <!-- Navigation -->
          <div v-if="sortedTips.length > 1" class="flex items-center gap-1 ml-auto">
            <button 
              class="neo-btn-ghost p-1.5"
              :disabled="activeTipIndex === 0"
              @click="prevTip"
            >
              <IconsQuayLai class="w-4 h-4" />
            </button>
            <button 
              class="neo-btn-ghost p-1.5"
              :disabled="activeTipIndex === sortedTips.length - 1"
              @click="nextTip"
            >
              <IconsMuiTen class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Dismiss -->
          <button 
            v-if="dismissible"
            class="neo-btn-ghost p-1.5 text-neutral-500 hover:text-alert-400"
            title="Ẩn gợi ý"
            @click="dismissTip"
          >
            <IconsDong class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
