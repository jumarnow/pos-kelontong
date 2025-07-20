<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Product Search & Selection -->
    <div class="lg:col-span-2">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Pilih Produk</h2>
          <div class="flex items-center space-x-2">
            <input v-model="searchQuery" type="text" placeholder="Cari produk atau barcode..." class="input-field w-64"
              @input="handleSearch" />
            <button @click="fetchProducts" class="btn-primary">
              Refresh
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="product in filteredProducts" :key="product.id" class="border rounded-lg p-4 transition-shadow"
            :class="[
              product.stock > 0
                ? 'hover:shadow-md cursor-pointer'
                : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed pointer-events-none'
            ]" @click="canAddToCart(product) && addToCart(product)">
            <div class="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              <img v-if="product.image_url" :src="product.image_url" :alt="product.name"
                class="w-full h-full object-cover rounded-lg" />
              <div v-else class="text-gray-400 text-4xl">📦</div>
            </div>

            <h3 class="font-medium text-sm mb-1">{{ product.name }}</h3>
            <p class="text-xs text-gray-500 mb-2">{{ product.category }}</p>
            <div class="flex items-center justify-between">
              <span class="text-primary-600 font-semibold">
                Rp {{ formatCurrency(product.price) }}
              </span>
              <span class="text-xs font-semibold" :class="product.stock === 0 ? 'text-gray-400' : 'text-gray-500'">
                Stok: {{ product.stock }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="text-gray-500">Memuat produk...</div>
        </div>

        <div v-if="!loading && filteredProducts.length === 0" class="text-center py-8">
          <div class="text-gray-500">Tidak ada produk ditemukan</div>
        </div>
      </div>
    </div>

    <!-- Shopping Cart -->
    <div class="lg:col-span-1">
      <div class="card sticky top-6">
        <h2 class="text-xl font-semibold mb-4">Keranjang Belanja</h2>

        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div v-for="item in cart" :key="item.product.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1">
              <h4 class="font-medium text-sm">{{ item.product.name }}</h4>
              <p class="text-xs text-gray-500">
                Rp {{ formatCurrency(item.product.price) }} x {{ item.quantity }}
              </p>
            </div>

            <div class="flex items-center space-x-2">
              <button @click="updateQuantity(item.product.id, item.quantity - 1)"
                class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs"
                :disabled="item.quantity <= 1">
                -
              </button>
              <input type="number" class="w-12 text-center text-sm border rounded mx-1" :min="1"
                :max="item.product.stock" :value="item.quantity" @input="onQtyInputInput($event, item)" />
              <button @click="updateQuantity(item.product.id, item.quantity + 1)"
                class="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs"
                :disabled="item.quantity >= item.product.stock">
                +
              </button>
              <button @click="removeFromCart(item.product.id)"
                class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs ml-2">
                ×
              </button>
            </div>
          </div>
        </div>

        <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
          Keranjang masih kosong
        </div>

        <div v-if="cart.length > 0" class="mt-6 pt-4 border-t">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-semibold">Total:</span>
            <span class="text-xl font-bold text-primary-600">
              Rp {{ formatCurrency(getTotal()) }}
            </span>
          </div>

          <div class="space-y-2">
            <select v-model="paymentMethod" class="input-field">
              <option value="cash">Tunai</option>
              <option value="card">Kartu</option>
              <option value="transfer">Transfer</option>
            </select>

            <button @click="handleCheckout" :disabled="checkoutLoading" class="btn-primary w-full">
              <span v-if="checkoutLoading">Memproses...</span>
              <span v-else>Checkout ({{ getItemCount() }} item)</span>
            </button>

            <button @click="clearCart" class="btn-outline w-full">
              Bersihkan Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="text-center">
        <div class="text-green-500 text-5xl mb-4">✓</div>
        <h3 class="text-lg font-semibold mb-2">Transaksi Berhasil!</h3>
        <p class="text-gray-600 mb-4">
          Total: Rp {{ formatCurrency(lastTransaction?.total_amount || 0) }}
        </p>
        <a v-if="lastTransaction?.id" :href="`/print?id=${lastTransaction.id}`" target="_blank" rel="noopener"
          class="btn-outline w-full mb-2 text-center block">
          🖨️ Print Invoice
        </a>
        <button @click="showSuccessModal = false" class="btn-primary w-full">
          OK
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { products, loading, fetchProducts, searchProducts } = useProducts()
const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount, checkout, loading: checkoutLoading } = useCart()

const searchQuery = ref('')
const filteredProducts = ref([])
const paymentMethod = ref('cash')
const showSuccessModal = ref(false)
const lastTransaction = ref(null)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    filteredProducts.value = await searchProducts(searchQuery.value)
  } else {
    filteredProducts.value = products.value
  }
}


function canAddToCart(product) {
  if (product.stock === 0) return false
  const item = cart.value.find(i => i.product.id === product.id)
  if (item && item.quantity >= product.stock) return false
  return true
}


function onQtyInputInput(event, item) {
  let value = Number(event.target.value)
  if (value > item.product.stock) {
    value = item.product.stock
    alert('Jumlah melebihi stok tersedia!')
  } else if (value < 1 || isNaN(value)) {
    value = 1
  }
  updateQuantity(item.product.id, value)
}

const handleCheckout = async () => {
  const result = await checkout(paymentMethod.value)

  if (result.success) {
    lastTransaction.value = result.transaction
    showSuccessModal.value = true
  } else {
    alert('Checkout gagal: ' + result.error)
  }
}


onMounted(async () => {
  await fetchProducts()
  filteredProducts.value = products.value
})

watch(products, (newProducts) => {
  if (!searchQuery.value) {
    filteredProducts.value = newProducts
  }
})
</script>