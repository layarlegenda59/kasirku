
import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useStore } from '../context/StoreContext';
import type { Transaction } from '../types';

const Reports: React.FC = () => {
  const { state } = useStore();
  const { transactions, products } = state;
  const [filterDate, setFilterDate] = useState({ start: '', end: '' });
  const [filterCategory, setFilterCategory] = useState('');

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const startDate = filterDate.start ? new Date(filterDate.start) : null;
      const endDate = filterDate.end ? new Date(filterDate.end) : null;

      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;

      if (filterCategory) {
        const productCategoriesInTx = tx.items.map(item => products.find(p => p.id === item.productId)?.category);
        if (!productCategoriesInTx.includes(filterCategory)) return false;
      }
      return true;
    });
  }, [transactions, products, filterDate, filterCategory]);

  const exportToCsv = () => {
    const headers = ['ID', 'Tanggal', 'Items', 'Total', 'Metode Pembayaran', 'Kasir'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      formatDate(tx.date),
      tx.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `${item.quantity}x ${product ? product.name : 'Unknown'}`;
      }).join('; '),
      tx.total,
      tx.paymentMethod,
      tx.cashierName
    ].map(String).join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_penjualan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Layout title="Laporan Penjualan">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Laporan Transaksi</h2>
          <div className="flex items-center gap-4">
              <input type="date" value={filterDate.start} onChange={e => setFilterDate(prev => ({...prev, start: e.target.value}))} className="border border-gray-300 rounded-md p-2"/>
              <span>-</span>
              <input type="date" value={filterDate.end} onChange={e => setFilterDate(prev => ({...prev, end: e.target.value}))} className="border border-gray-300 rounded-md p-2"/>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-300 rounded-md p-2">
                <option value="">Semua Kategori</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            <button onClick={exportToCsv} className="px-4 py-2 bg-[#50C878] text-white rounded-md hover:bg-[#45a062] transition-colors">Export ke CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">ID Transaksi</th>
                <th scope="col" className="px-6 py-3">Tanggal</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Metode Bayar</th>
                <th scope="col" className="px-6 py-3">Kasir</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.id}</td>
                  <td className="px-6 py-4">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4">{formatCurrency(tx.total)}</td>
                  <td className="px-6 py-4">{tx.paymentMethod}</td>
                  <td className="px-6 py-4">{tx.cashierName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
