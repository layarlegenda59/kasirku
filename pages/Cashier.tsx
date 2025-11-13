import React, { useState, useMemo, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import type { Product, Transaction, TransactionItem } from '../types';
import PaymentModal from '../components/PaymentModal';
import Receipt from '../components/Receipt';
import { NavLink } from 'react-router-dom';

const Cashier: React.FC = () => {
  const { state, addTransaction } = useApi();
  const { products, settings } = state;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const categories = useMemo(() => ['Semua', ...new Set(products.map(p => p.category))], [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      (activeCategory === 'Semua' || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search, activeCategory]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { productId: product.id, quantity: 1, price: product.price }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        return prevCart.filter(item => item.productId !== productId);
      }
      return prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleConfirmTransaction = async (transaction: Transaction) => {
    try {
      await addTransaction(transaction);
      setLastTransaction(transaction);
      setCart([]);
      setPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses transaksi.');
    }
  };
  
  useEffect(() => {
    if (lastTransaction) {
      const handleAfterPrint = () => {
        setLastTransaction(null);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      window.print();
    }
  }, [lastTransaction]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #print-section, #print-section * {
                    visibility: visible;
                }
                #print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
            }
        `}</style>
      <div className="print:hidden flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#4A90E2]">KasirKu</h1>
           <NavLink to="/" className="text-sm text-gray-600 hover:text-[#4A90E2]">Kembali ke Dashboard</NavLink>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <main className="flex-1 p-4 overflow-y-auto">
            <input
              type="text"
              placeholder="Cari produk (nama atau SKU)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
            />
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                    activeCategory === cat ? 'bg-[#4A90E2] text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col text-center overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover" />
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{product.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Cart Section */}
          <aside className="w-80 bg-white p-4 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold border-b pb-2 mb-2">Keranjang</h2>
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">Keranjang kosong</p>
              ) : (
                cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded-full">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded-full">+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-[#4A90E2]">{formatCurrency(cartTotal)}</span>
              </div>
              <button
                onClick={() => setPaymentModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#FFA07A] text-white text-lg font-bold rounded-lg hover:bg-[#ff8a5c] disabled:bg-gray-300 transition-colors"
              >
                BAYAR
              </button>
            </div>
          </aside>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        cart={cart}
        total={cartTotal}
        onConfirm={handleConfirmTransaction}
      />
      <div id="print-section">
        {lastTransaction && <Receipt transaction={lastTransaction} settings={settings} products={products} />}
      </div>
    </div>
  );
};

export default Cashier;
