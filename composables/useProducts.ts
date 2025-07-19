export const useProducts = () => {
  const { $supabase } = useNuxtApp()
  const products = ref([])
  const loading = ref(false)

  const fetchProducts = async () => {
    try {
      loading.value = true
      const { data, error } = await $supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      products.value = data || []
    } catch (error) {
      console.error('Fetch products error:', error)
    } finally {
      loading.value = false
    }
  }

  const addProduct = async (productData: any) => {
    try {
      const { data, error } = await $supabase
        .from('products')
        .insert([productData])
        .select()
        .single()
      
      if (error) throw error
      
      products.value.unshift(data)
      return { success: true, data }
    } catch (error) {
      console.error('Add product error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateProduct = async (id: string, productData: any) => {
    try {
      const { data, error } = await $supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = data
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Update product error:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await $supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      products.value = products.value.filter(p => p.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Delete product error:', error)
      return { success: false, error: error.message }
    }
  }

  const searchProducts = async (query: string) => {
    try {
      const { data, error } = await $supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Search products error:', error)
      return []
    }
  }

  return {
    products: readonly(products),
    loading: readonly(loading),
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  }
}