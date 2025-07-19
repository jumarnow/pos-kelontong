<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-primary-600">
              🏪 POS Kelontong
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Kasir
            </NuxtLink>
            <NuxtLink 
              to="/products" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Produk
            </NuxtLink>
            <NuxtLink 
              to="/transactions" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Transaksi
            </NuxtLink>
            <NuxtLink 
              to="/dashboard" 
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </NuxtLink>
            
            <div class="relative">
              <button
                @click="signOut"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { signOut } = useAuth()
</script>