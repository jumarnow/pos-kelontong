<template>
  <div class="max-w-lg mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Produk' : 'Tambah Produk' }}</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
        <input type="file" accept="image/*" @change="handleImageChange" class="input-field" />
        <div v-if="imagePreview" class="mt-2">
          <img :src="imagePreview" alt="Preview" class="w-24 h-24 object-cover rounded" />
        </div>
        <div v-else-if="form.image_url" class="mt-2">
          <img :src="form.image_url" alt="Preview" class="w-24 h-24 object-cover rounded" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
        <input v-model="form.name" type="text" required class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <input v-model="form.category" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
        <input v-model="form.barcode" type="text" class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Harga</label>
        <input v-model="form.price" type="number" step="0.01" required class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Stok</label>
        <input v-model="form.stock" type="number" required class="input-field" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea v-model="form.description" rows="3" class="input-field"></textarea>
      </div>
      <div class="flex justify-end space-x-3 mt-6">
        <NuxtLink to="/products" class="btn-outline">Batal</NuxtLink>
        <button type="submit" :disabled="submitting" class="btn-primary">
          <span v-if="submitting">Menyimpan...</span>
          <span v-else>{{ isEdit ? 'Update' : 'Simpan' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const { addProduct, updateProduct, fetchProducts, products } = useProducts()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const imageFile = ref(null)
const imagePreview = ref('')

const form = ref({
  name: '',
  category: '',
  barcode: '',
  price: '',
  stock: '',
  description: '',
  image_url: ''
})

onMounted(async () => {
  if (isEdit.value) {
    await fetchProducts()
    const product = products.value.find(p => p.id === route.params.id)
    if (product) {
      form.value = {
        name: product.name,
        category: product.category || '',
        barcode: product.barcode || '',
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        image_url: product.image_url || ''
      }
      imagePreview.value = product.image_url || ''
    }
  }
})

function handleImageChange(e) {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

const submitForm = async () => {
  try {
    submitting.value = true
    let imageUrl = form.value.image_url
    if (imageFile.value) {
      const file = imageFile.value
      const fileExt = file.name.split('.').pop()
      const fileName = `product_${Date.now()}.${fileExt}`
      const { data, error } = await useNuxtApp().$supabase.storage.from('product-images').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
      if (error) throw error
      const { data: urlData } = useNuxtApp().$supabase.storage.from('product-images').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }
    const productData = {
      name: form.value.name,
      category: form.value.category,
      barcode: form.value.barcode,
      price: parseFloat(form.value.price),
      stock: parseInt(form.value.stock),
      description: form.value.description,
      image_url: imageUrl
    }
    let result
    if (isEdit.value) {
      result = await updateProduct(route.params.id, productData)
    } else {
      result = await addProduct(productData)
    }
    if (result.success) {
      router.push('/products')
    } else {
      alert('Gagal menyimpan produk: ' + result.error)
    }
  } catch (error) {
    alert('Terjadi kesalahan: ' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>
