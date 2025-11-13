import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

const Products: React.FC = () => {
  const { state, dispatch } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredProducts = useMemo(() => {
    if (!showLowStockOnly) {
      return state.products;
    }
    return state.products.filter(product => product.stock < 15);
  }, [state.products, showLowStockOnly]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Gagal menyimpan produk');
      if (editingProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      } else {
        dispatch({ type: 'ADD_PRODUCT', payload: product });
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan produk.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus produk.');
    }
  };

  return (
    <Layout title="Manajemen Produk">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Daftar Produk</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="low-stock-filter"
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="h-4 w-4 text-[#4A90E2] focus:ring-[#357ABD] border-gray-300 rounded"
              />
              <label htmlFor="low-stock-filter" className="ml-2 block text-sm text-gray-900">
                Hanya tampilkan stok menipis
              </label>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD] transition-colors"
            >
              Tambah Produk
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Gambar</th>
                <th scope="col" className="px-6 py-3">SKU</th>
                <th scope="col" className="px-6 py-3">Nama Produk</th>
                <th scope="col" className="px-6 py-3">Kategori</th>
                <th scope="col" className="px-6 py-3">Harga</th>
                <th scope="col" className="px-6 py-3">Stok</th>
                <th scope="col" className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                  <td className={`px-6 py-4 ${product.stock < 15 ? 'text-red-600 font-bold' : ''}`}>{product.stock}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => openEditModal(product)} className="font-medium text-[#4A90E2] hover:underline">Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="font-medium text-red-600 hover:underline">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}>
        <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={closeModal} />
      </Modal>
    </Layout>
  );
};

export default Products;