
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601 format
  items: TransactionItem[];
  total: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer Bank';
  cashierName: string;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  receiptFooter: string;
}
