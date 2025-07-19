<template>
  <div v-if="loading" class="text-center py-16 text-gray-500">Memuat invoice...</div>
  <div v-else-if="!transaction" class="text-center py-16 text-red-500">Invoice tidak ditemukan</div>
  <div v-else class="max-w-lg mx-auto bg-white p-8 mt-5 rounded shadow print:p-0 print:shadow-none print:bg-white">
    <h2 class="text-2xl font-bold mb-2 text-center">Invoice</h2>
    <div class="mb-2">Tanggal: {{ formatDate(transaction.created_at) }}</div>
    <div class="mb-4">ID Transaksi: {{ transaction.id }}</div>
    <table class="w-full border-collapse mb-4">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1 text-left">Produk</th>
          <th class="border px-2 py-1 text-right">Qty</th>
          <th class="border px-2 py-1 text-right">Harga</th>
          <th class="border px-2 py-1 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in transaction.transaction_items" :key="item.product?.id">
          <td class="border px-2 py-1">{{ item.products?.name }}</td>
          <td class="border px-2 py-1 text-right">{{ item.quantity }}</td>
          <td class="border px-2 py-1 text-right">Rp {{ formatCurrency(item.products?.price || 0) }}</td>
          <td class="border px-2 py-1 text-right">Rp {{ formatCurrency((item.products?.price || 0) * item.quantity) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="border px-2 py-1 text-right font-bold">Total</td>
          <td class="border px-2 py-1 text-right font-bold">Rp {{ formatCurrency(transaction.total_amount || 0) }}</td>
        </tr>
      </tfoot>
    </table>
    <div class="mb-2">Metode Pembayaran: <b>{{ transaction.payment_method }}</b></div>
    <div class="mt-8 text-center text-gray-500 text-sm">Terima kasih telah berbelanja!</div>
    <div v-if="canPrint" class="mt-6 flex justify-center print:hidden">
      <button @click="printInvoice" class="btn-primary">🖨️ Print</button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})
const route = useRoute()
const transaction = ref(null)
const loading = ref(true)

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID').format(amount)
}
function formatDate(date) {
  return new Date(date).toLocaleString('id-ID')
}

onMounted(async () => {
  const id = route.query.id
  if (!id) {
    loading.value = false
    return
  }
  try {
    const { getTransactionById } = useTransactions()
    transaction.value = await getTransactionById(id)
    console.log('Transaction data:', transaction.value);
  } catch (e) {
    transaction.value = null
  }
  loading.value = false
})


const canPrint = typeof window !== 'undefined' && typeof window.print === 'function'

function printInvoice() {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print()
  }
}
</script>

<style scoped>
@media print {
  .print\\:hidden { display: none !important; }
  .print\\:p-0 { padding: 0 !important; }
  .print\\:shadow-none { box-shadow: none !important; }
  .print\\:bg-white { background: #fff !important; }
  .btn-primary { display: none !important; }
}
</style>
