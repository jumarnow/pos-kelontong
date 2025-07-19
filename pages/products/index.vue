<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Manajemen Produk</h1>
      <NuxtLink to="/products/create" class="btn-primary">
        + Tambah Produk
      </NuxtLink>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari produk, kategori, atau barcode..."
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
                Produk
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcode
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <!-- <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-sm">📦</span>
                    </div>
                  </div> -->
                  <div class="flex-shrink-0 h-10 w-10">
                    <div v-if="product.image_url"
                      class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img :src="product.image_url" alt="Gambar" class="h-10 w-10 object-cover rounded-full" />
                    </div>
                    <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-sm">📦</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ product.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ product.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ product.barcode }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatCurrency(product.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <NuxtLink :to="`/products/${product.id}`" class="text-indigo-600 hover:text-indigo-900 mr-3">
                  Edit
                </NuxtLink>
                <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Memuat produk...</div>
      </div>

      <div v-if="!loading && filteredProducts.length === 0" class="text-center py-8">
        <div class="text-gray-500">Belum ada produk</div>
      </div>

      <div v-if="!loading && filteredProducts.length > 0" class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">
          Menampilkan {{ startItem + 1 }} - {{ endItem }} dari {{ filteredProducts.length }} produk
        </div>
        <div class="space-x-2 flex items-center">
          <button @click="prevPage" :disabled="page === 1" class="btn-outline px-3 py-1">Prev</button>
          <template v-for="n in totalPages" :key="n">
            <button
              @click="goToPage(n)"
              :class="['px-3 py-1 rounded', n === page ? 'bg-primary-500 text-white' : 'btn-outline']"
            >
              {{ n }}
            </button>
          </template>
          <button @click="nextPage" :disabled="page === totalPages" class="btn-outline px-3 py-1">Next</button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct: deleteProductApi } = useProducts()

const searchQuery = ref("")
const page = ref(1)
const pageSize = ref(10)
function goToPage(n) {
  if (n >= 1 && n <= totalPages.value) page.value = n
}

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.barcode?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / pageSize.value)))
const startItem = computed(() => (page.value - 1) * pageSize.value)
const endItem = computed(() => Math.min(startItem.value + pageSize.value, filteredProducts.value.length))
const paginatedProducts = computed(() => filteredProducts.value.slice(startItem.value, endItem.value))

function prevPage() {
  if (page.value > 1) page.value--
}
function nextPage() {
  if (page.value < totalPages.value) page.value++
}

watch([searchQuery, filteredProducts, pageSize], () => {
  page.value = 1
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const deleteProduct = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
    const result = await deleteProductApi(id)
    if (!result.success) {
      alert('Gagal menghapus produk: ' + result.error)
    }
  }
}

onMounted(() => {
  fetchProducts()
})
</script>