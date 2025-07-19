/*
  # Create transactions and transaction_items tables for POS system

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `total_amount` (decimal, not null)
      - `payment_method` (text, default 'cash')
      - `cashier_id` (uuid, references auth.users)
      - `created_at` (timestamp)
    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, references transactions)
      - `product_id` (uuid, references products)
      - `quantity` (integer, not null)
      - `price` (decimal, not null)
      - `subtotal` (decimal, not null)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users

  3. Indexes
    - Index on cashier_id for filtering by cashier
    - Index on created_at for date-based queries
    - Index on transaction_id for joining transaction_items
    - Index on product_id for product sales analysis
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount decimal(10,2) NOT NULL,
  payment_method text DEFAULT 'cash',
  cashier_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Policies for transactions table
CREATE POLICY "Allow authenticated users to read transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for transaction_items table
CREATE POLICY "Allow authenticated users to read transaction_items"
  ON transaction_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert transaction_items"
  ON transaction_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update transaction_items"
  ON transaction_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);