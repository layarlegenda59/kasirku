
import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { useStore } from '../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const TransactionIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const LowStockIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>;


const Dashboard: React.FC = () => {
    const { state } = useStore();
    const { products, transactions } = state;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }

    const todaySales = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return transactions
            .filter(tx => tx.date.startsWith(today))
            .reduce((sum, tx) => sum + tx.total, 0);
    }, [transactions]);
    
    const monthTransactions = useMemo(() => {
        const thisMonth = new Date().toISOString().substring(0, 7);
        return transactions.filter(tx => tx.date.startsWith(thisMonth)).length;
    }, [transactions]);
    
    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.stock < 15).length;
    }, [products]);

    const salesData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const last7days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7days.forEach(day => {
            data[day] = 0;
        });

        transactions.forEach(tx => {
            const day = tx.date.split('T')[0];
            if (data[day] !== undefined) {
                data[day] += tx.total;
            }
        });

        return Object.entries(data).map(([name, sales]) => ({ name: new Date(name).toLocaleDateString('id-ID', { weekday: 'short'}), sales }));
    }, [transactions]);

    const topProducts = useMemo(() => {
        const productSales: { [key: string]: number } = {};
        transactions.forEach(tx => {
            tx.items.forEach(item => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            });
        });
        return Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, quantity]) => ({
                product: products.find(p => p.id === productId),
                quantity
            }));
    }, [transactions, products]);

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card title="Penjualan Hari Ini" value={formatCurrency(todaySales)} icon={<SalesIcon className="w-6 h-6 text-white"/>} color="bg-[#4A90E2]"/>
          <Card title="Transaksi Bulan Ini" value={monthTransactions} icon={<TransactionIcon className="w-6 h-6 text-white"/>} color="bg-[#50C878]"/>
          <Card title="Stok Menipis" value={`${lowStockProducts} Produk`} icon={<LowStockIcon className="w-6 h-6 text-white"/>} color="bg-[#FFA07A]"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">Tren Penjualan (7 Hari Terakhir)</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(Number(value))}/>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))}/>
                      <Legend />
                      <Line type="monotone" dataKey="sales" name="Penjualan" stroke="#4A90E2" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">5 Produk Terlaris</h3>
              <ul className="space-y-4">
                  {topProducts.map(({ product, quantity }) => product ? (
                      <li key={product.id} className="flex items-center space-x-3">
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                          <div className="flex-1">
                              <p className="font-medium text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <p className="font-semibold text-gray-700">{quantity}x</p>
                      </li>
                  ) : null)}
              </ul>
          </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
