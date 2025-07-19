<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="text-3xl text-primary-500 mr-4">💰</div>
          <div>
            <p class="text-sm text-gray-600">Penjualan Hari Ini</p>
            <p class="text-2xl font-bold">Rp {{ formatCurrency(dailySales.total) }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="text-3xl text-secondary-500 mr-4">🛒</div>
          <div>
            <p class="text-sm text-gray-600">Transaksi Hari Ini</p>
            <p class="text-2xl font-bold">{{ dailySales.count }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="text-3xl text-green-500 mr-4">📦</div>
          <div>
            <p class="text-sm text-gray-600">Total Produk</p>
            <p class="text-2xl font-bold">{{ products.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center">
          <div class="text-3xl text-red-500 mr-4">⚠️</div>
          <div>
            <p class="text-sm text-gray-600">Stok Rendah</p>
            <p class="text-2xl font-bold">{{ lowStockCount }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Transactions -->
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pembayaran
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in recentTransactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(transaction.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatCurrency(transaction.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ transaction.payment_method }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.transaction_items?.length || 0 }} item(s)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="recentTransactions.length === 0" class="text-center py-8">
        <div class="text-gray-500">Belum ada transaksi hari ini</div>
      </div>
    </div>
    
    <!-- Low Stock Alert -->
    <div v-if="lowStockProducts.length > 0" class="card">
      <h2 class="text-xl font-semibold mb-4 text-red-600">Peringatan Stok Rendah</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="product in lowStockProducts"
          :key="product.id"
          class="border border-red-200 rounded-lg p-4 bg-red-50"
        >
          <h3 class="font-medium text-red-900">{{ product.name }}</h3>
          <p class="text-sm text-red-600">Stok tersisa: {{ product.stock }}</p>
          <p class="text-sm text-red-600">Kategori: {{ product.category }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { products, fetchProducts } = useProducts()
const { transactions, fetchTransactions, getDailySales } = useTransactions()

const dailySales = ref({ total: 0, count: 0 })
const recentTransactions = ref([])
const lowStockProducts = ref([])

const lowStockCount = computed(() => {
  return products.value.filter(product => product.stock <= 10).length
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadDashboardData = async () => {
  // Load daily sales
  const today = new Date().toISOString().split('T')[0]
  dailySales.value = await getDailySales(today)
  
  // Load recent transactions
  await fetchTransactions(10)
  recentTransactions.value = transactions.value.filter(t => {
    const transactionDate = new Date(t.created_at).toDateString()
    const today = new Date().toDateString()
    return transactionDate === today
  })
  
  // Load products and find low stock
  await fetchProducts()
  lowStockProducts.value = products.value.filter(product => product.stock <= 10)
}

onMounted(() => {
  loadDashboardData()
})
</script>