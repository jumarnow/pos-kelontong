export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  if (!user.value) {
    return navigateTo('/login')
  }
})