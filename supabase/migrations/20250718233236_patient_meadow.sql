/*
  # Insert sample data for POS system

  1. Sample Products
    - Various grocery items with different categories
    - Realistic prices and stock levels
    - Some items with barcodes

  2. Notes
    - This is optional sample data for testing
    - Can be removed in production
*/

-- Insert sample products
INSERT INTO products (name, barcode, price, stock, category, description) VALUES
('Beras Premium 5kg', '8992761123456', 75000, 50, 'Sembako', 'Beras premium kualitas terbaik'),
('Minyak Goreng 2L', '8992761234567'  , 32000, 30, 'Sembako', 'Minyak goreng kemasan 2 liter'),
('Gula Pasir 1kg', '8992761345678', 15000, 40, 'Sembako', 'Gula pasir putih kemasan 1kg'),
('Telur Ayam 1kg', '8992761456789', 28000, 25, 'Protein', 'Telur ayam segar grade A'),
('Susu UHT 1L', '8992761567890', 18000, 35, 'Minuman', 'Susu UHT full cream'),
('Roti Tawar', '8992761678901', 12000, 20, 'Roti', 'Roti tawar gandum'),
('Sabun Mandi', '8992761789012', 8500, 45, 'Kebersihan', 'Sabun mandi antibakteri'),
('Shampo 200ml', '8992761890123', 15500, 30, 'Kebersihan', 'Shampo anti ketombe'),
('Pasta Gigi', '8992761901234', 12500, 25, 'Kebersihan', 'Pasta gigi dengan fluoride'),
('Kopi Sachet', '8992762012345', 2500, 100, 'Minuman', 'Kopi instan 3in1'),
('Teh Celup', '8992762123456', 8000, 60, 'Minuman', 'Teh celup kemasan 25 pcs'),
('Mie Instan', '8992762234567', 3500, 80, 'Makanan', 'Mie instan rasa ayam'),
('Biskuit', '8992762345678', 7500, 40, 'Snack', 'Biskuit rasa cokelat'),
('Kerupuk', '8992762456789', 5000, 35, 'Snack', 'Kerupuk udang tradisional'),
('Air Mineral 600ml', '8992762567890', 3000, 120, 'Minuman', 'Air mineral kemasan botol');