<script setup lang="ts">
const { notifications, remove } = useNotifications()

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'IconsHoanThanh'
    case 'warning': return 'IconsCanhBao'
    case 'error': return 'IconsCanhBao'
    case 'info': return 'IconsThongTin'
    default: return 'IconsThongTin'
  }
}

const getStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-success-500/50 bg-success-500/10'
    case 'warning':
      return 'border-warning-500/50 bg-warning-500/10'
    case 'error':
      return 'border-alert-500/50 bg-alert-500/10'
    case 'info':
      return 'border-primary-500/50 bg-primary-500/10'
    default:
      return 'border-primary-500/50 bg-primary-500/10'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-success-400'
    case 'warning': return 'text-warning-400'
    case 'error': return 'text-alert-400'
    case 'info': return 'text-primary-400'
    default: return 'text-primary-400'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="neo-card p-4 border-l-2 backdrop-blur-xl shadow-lg cursor-pointer"
          :class="getStyles(notification.type)"
          @click="remove(notification.id)"
        >
          <div class="flex items-start gap-3">
            <component 
              :is="getIcon(notification.type)" 
              class="w-5 h-5 flex-shrink-0 mt-0.5"
              :class="getIconColor(notification.type)"
            />
            <div class="flex-1 min-w-0">
              <p class="font-display font-semibold text-sm text-white">
                {{ notification.title }}
              </p>
              <p v-if="notification.message" class="text-xs text-neutral-400 mt-1">
                {{ notification.message }}
              </p>
            </div>
            <button 
              class="text-neutral-500 hover:text-white transition-colors"
              @click.stop="remove(notification.id)"
            >
              <IconsDong class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
