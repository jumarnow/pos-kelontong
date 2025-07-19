<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🏪 POS Kelontong
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Masuk ke sistem kasir
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-3">
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading">Memproses...</span>
            <span v-else>Masuk</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

// Redirect to home if already logged in
const { user, signIn } = useAuth()

// watch(user, (newUser) => {
//   if (newUser) {
//     navigateTo('/')
//   }
// }, { immediate: true })

const router = useRouter()

const form = ref({
  email: 'admin@test.com',
  password: 'admin@test.com'
})

const loading = ref(false)
const error = ref('')
const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const result = await signIn(form.value.email, form.value.password)
    
    if (result.success) {
      console.log('Login berhasil:', result.user);
      
      await navigateTo('/')
    } else {
      error.value = result.error || 'Login gagal'
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan sistem'
  } finally {
    loading.value = false
  }
}
</script>