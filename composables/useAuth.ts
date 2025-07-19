export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  
  // Use useState for SSR-friendly global state
  const user = useState('auth.user', () => null)
  const loading = useState('auth.loading', () => true)

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      user.value = data.user
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await $supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }


  // Fetch session only on client to avoid useAsyncData warning
  const fetchSession = async () => {
    try {
      const { data: { session }, error } = await $supabase.auth.getSession()
      if (error) throw error
      user.value = session?.user || null
    } catch (error) {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  if (process.client) {
    fetchSession()
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    signOut
  }
}