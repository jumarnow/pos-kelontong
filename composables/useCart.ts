export const useCart = () => {
  const { $supabase } = useNuxtApp()
  const { user } = useAuth()
  const cart = ref([])
  const loading = ref(false)

  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = cart.value.find(item => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.subtotal = existingItem.quantity * existingItem.product.price
    } else {
      cart.value.push({
        product,
        quantity,
        subtotal: product.price * quantity
      })
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity = quantity
      item.subtotal = item.quantity * item.product.price
    }
  }

  const removeFromCart = (productId: string) => {
    cart.value = cart.value.filter(item => item.product.id !== productId)
  }

  const clearCart = () => {
    cart.value = []
  }

  const getTotal = () => {
    return cart.value.reduce((total, item) => total + item.subtotal, 0)
  }

  const getItemCount = () => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  }

  const checkout = async (paymentMethod: string = 'cash') => {
    try {
      loading.value = true
      
      const total = getTotal()
      
      // Create transaction
      const { data: transaction, error: transactionError } = await $supabase
        .from('transactions')
        .insert([{
          total_amount: total,
          payment_method: paymentMethod,
          cashier_id: user.value?.id
        }])
        .select()
        .single()
      
      if (transactionError) throw transactionError
      
      // Create transaction items
      const transactionItems = cart.value.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.subtotal
      }))
      
      const { error: itemsError } = await $supabase
        .from('transaction_items')
        .insert(transactionItems)
      
      if (itemsError) throw itemsError
      
      // Update stock
      for (const item of cart.value) {
        const { error: stockError } = await $supabase
          .from('products')
          .update({ 
            stock: item.product.stock - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product.id)
        
        if (stockError) throw stockError
      }
      
      clearCart()
      
      return { success: true, transaction }
    } catch (error) {
      console.error('Checkout error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    cart: readonly(cart),
    loading: readonly(loading),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    checkout
  }
}