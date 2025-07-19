export const useTransactions = () => {
  const { $supabase } = useNuxtApp()
  const transactions = ref([])
  const loading = ref(false)

  const fetchTransactions = async (limit: number = 50) => {
    try {
      loading.value = true
      const { data, error } = await $supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            products (name, price)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      transactions.value = data || []
    } catch (error) {
      console.error('Fetch transactions error:', error)
    } finally {
      loading.value = false
    }
  }

  const getTransactionById = async (id: string) => {
    try {
      const { data, error } = await $supabase
        .from('transactions')
        .select(`
          *,
          transaction_items (
            *,
            products (name, price)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Get transaction error:', error)
      return null
    }
  }

  const getDailySales = async (date: string) => {
    try {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      
      const { data, error } = await $supabase
        .from('transactions')
        .select('total_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      if (error) throw error
      
      const total = data.reduce((sum, transaction) => sum + parseFloat(transaction.total_amount), 0)
      return { total, count: data.length }
    } catch (error) {
      console.error('Get daily sales error:', error)
      return { total: 0, count: 0 }
    }
  }

  return {
    transactions: readonly(transactions),
    loading: readonly(loading),
    fetchTransactions,
    getTransactionById,
    getDailySales
  }
}