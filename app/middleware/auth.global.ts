export default defineNuxtRouteMiddleware(async (to) => {
  // Only check auth for game routes
  if (!to.path.startsWith('/game')) {
    return
  }

  const auth = useAuth()
  
  // Wait for initial auth check
  if (auth.isLoading.value) {
    await auth.init()
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated.value) {
    return navigateTo('/login', {
      replace: true,
      redirectCode: 302,
    })
  }
})
