// Composable for managing toast notifications
export interface ToastNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  duration?: number // ms, 0 = persistent
}

// Global state for notifications
const notifications = ref<ToastNotification[]>([])

export const useNotifications = () => {
  const add = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2)
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    }
    notifications.value.push(newNotification)
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = () => {
    notifications.value = []
  }

  // Shorthand methods
  const success = (title: string, message?: string, duration?: number) => {
    return add({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    return add({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return add({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    return add({ type: 'info', title, message, duration })
  }

  return {
    notifications: readonly(notifications),
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  }
}
