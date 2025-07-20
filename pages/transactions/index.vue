<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Riwayat Transaksi</h1>
    </div>

    <div class="card">

      <div class="flex items-center justify-between mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi..."
          class="input-field w-64"
        />
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-500">Tampilkan</label>
          <select v-model.number="pageSize" class="input-field py-1 px-2 w-20">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span class="text-sm text-gray-500">/ halaman</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Transaksi
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ transaction.id.slice(0, 8) }}...
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatCurrency(transaction.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ transaction.payment_method }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.transaction_items?.length || 0 }} item(s)
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-medium flex gap-1.5">
                <button @click="viewTransaction(transaction)" class="btn-outline text-xs">
                  Detail
                </button>
                <a :href="`/print?id=${transaction.id}`" target="_blank" rel="noopener" class="btn-outline text-xs"
                  title="Print Invoice">
                  Print
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Memuat transaksi...</div>
      </div>

      <div v-if="!loading && filteredTransactions.length === 0" class="text-center py-8">
        <div class="text-gray-500">Belum ada transaksi</div>
      </div>

      <div v-if="!loading && filteredTransactions.length > 0" class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">
          Menampilkan {{ startItem + 1 }} - {{ endItem }} dari {{ filteredTransactions.length }} transaksi
        </div>
        <div class="space-x-2 flex items-center">
          <button @click="prevPage" :disabled="page === 1" class="btn-outline px-3 py-1">Prev</button>
          <template v-for="n in totalPages" :key="n">
            <button @click="goToPage(n)"
              :class="['px-3 py-1 rounded', n === page ? 'bg-primary-500 text-white' : 'btn-outline']">
              {{ n }}
            </button>
          </template>
          <button @click="nextPage" :disabled="page === totalPages" class="btn-outline px-3 py-1">Next</button>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold">Detail Transaksi</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div v-if="selectedTransaction" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">ID Transaksi</label>
              <p class="text-sm text-gray-900">{{ selectedTransaction.id }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedTransaction.created_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Total</label>
              <p class="text-sm text-gray-900">Rp {{ formatCurrency(selectedTransaction.total_amount) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
              <p class="text-sm text-gray-900">{{ selectedTransaction.payment_method }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Items</label>
            <div class="border rounded-lg overflow-hidden mb-4">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Produk</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Harga</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="item in selectedTransaction.transaction_items" :key="item.id">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.products?.name }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">Rp {{ formatCurrency(item.price) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">Rp {{ formatCurrency(item.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Tombol print dipindah ke kolom aksi tabel utama -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { transactions, loading, fetchTransactions } = useTransactions()

const showDetailModal = ref(false)
const selectedTransaction = ref(null)


const searchQuery = ref("")
const page = ref(1)
const pageSize = ref(10)

const filteredTransactions = computed(() => {
  if (!searchQuery.value.trim()) return transactions.value
  const q = searchQuery.value.toLowerCase()
  return transactions.value.filter(t =>
    t.id?.toLowerCase().includes(q) ||
    t.payment_method?.toLowerCase().includes(q) ||
    formatDate(t.created_at).toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize.value)))
const startItem = computed(() => (page.value - 1) * pageSize.value)
const endItem = computed(() => Math.min(startItem.value + pageSize.value, filteredTransactions.value.length))
const paginatedTransactions = computed(() => filteredTransactions.value.slice(startItem.value, endItem.value))

function prevPage() {
  if (page.value > 1) page.value--
}
function nextPage() {
  if (page.value < totalPages.value) page.value++
}
function goToPage(n) {
  if (n >= 1 && n <= totalPages.value) page.value = n
}

watch([searchQuery, filteredTransactions, pageSize], () => {
  page.value = 1
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

onMounted(() => {
  fetchTransactions()
})
</script>