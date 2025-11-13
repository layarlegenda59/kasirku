import React, { useCallback } from 'react';
import { useStore } from './StoreContext';
import type { Product, Transaction, StoreSettings } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

interface ApiContextType {
  state: any;
  dispatch: any;
  // API actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateSettings: (settings: StoreSettings) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ApiContext = React.createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load initial data from server
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodRes, trxRes, setRes] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/transactions`),
          fetch(`${API_BASE}/settings`),
        ]);

        if (prodRes.ok) {
          const products = await prodRes.json();
          if (products && products.length > 0) {
            dispatch({ type: 'LOAD_PRODUCTS', payload: products });
          }
        }
        if (trxRes.ok) {
          const transactions = await trxRes.json();
          if (transactions && transactions.length > 0) {
            dispatch({ type: 'LOAD_TRANSACTIONS', payload: transactions });
          }
        }
        if (setRes.ok) {
          const settings = await setRes.json();
          if (settings) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
          }
        }
      } catch (err) {
        console.warn('Failed to load data from server (using mock data):', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const addProduct = useCallback(
    async (productData: Omit<Product, 'id'>) => {
      try {
        setError(null);
        const product: Product = {
          id: `${Date.now()}-${Math.random()}`,
          ...productData,
        };

        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!res.ok) throw new Error('Gagal menyimpan produk');
        dispatch({ type: 'ADD_PRODUCT', payload: product });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(msg);
        throw err;
      }
    },
    [dispatch]
  );

  const updateProduct = useCallback(
    async (product: Product) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!res.ok) throw new Error('Gagal update produk');
        dispatch({ type: 'UPDATE_PRODUCT', payload: product });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(msg);
        throw err;
      }
    },
    [dispatch]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });

        if (!res.ok) throw new Error('Gagal hapus produk');
        dispatch({ type: 'DELETE_PRODUCT', payload: id });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(msg);
        throw err;
      }
    },
    [dispatch]
  );

  const addTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });

        if (!res.ok) throw new Error('Gagal catat transaksi');
        dispatch({ type: 'PROCESS_TRANSACTION', payload: transaction });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(msg);
        throw err;
      }
    },
    [dispatch]
  );

  const updateSettings = useCallback(
    async (settings: StoreSettings) => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });

        if (!res.ok) throw new Error('Gagal simpan pengaturan');
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(msg);
        throw err;
      }
    },
    [dispatch]
  );

  return (
    <ApiContext.Provider
      value={{
        state,
        dispatch,
        addProduct,
        updateProduct,
        deleteProduct,
        addTransaction,
        updateSettings,
        loading,
        error,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = React.useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};
