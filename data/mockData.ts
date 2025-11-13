
import type { Product, Transaction, StoreSettings } from '../types';

export const initialProducts: Product[] = [
  { id: '1', sku: 'MNM-001', name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18000, stock: 50, imageUrl: 'https://picsum.photos/id/234/200/200' },
  { id: '2', sku: 'MKN-001', name: 'Croissant Coklat', category: 'Makanan', price: 22000, stock: 30, imageUrl: 'https://picsum.photos/id/235/200/200' },
  { id: '3', sku: 'MNM-002', name: 'Teh Melati', category: 'Minuman', price: 15000, stock: 75, imageUrl: 'https://picsum.photos/id/236/200/200' },
  { id: '4', sku: 'MKN-002', name: 'Roti Bakar Keju', category: 'Makanan', price: 16000, stock: 45, imageUrl: 'https://picsum.photos/id/237/200/200' },
  { id: '5', sku: 'RKK-001', name: 'Rokok Filter 12', category: 'Rokok', price: 25000, stock: 120, imageUrl: 'https://picsum.photos/id/238/200/200' },
  { id: '6', sku: 'MNM-003', name: 'Jus Jeruk', category: 'Minuman', price: 12000, stock: 25, imageUrl: 'https://picsum.photos/id/239/200/200' },
  { id: '7', sku: 'MKN-003', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 35000, stock: 10, imageUrl: 'https://picsum.photos/id/240/200/200' },
];

export const initialTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i % 10));
    const items = [
        { productId: '1', quantity: 1, price: 18000 },
        { productId: '2', quantity: Math.floor(Math.random() * 2) + 1, price: 22000 }
    ];
    return {
        id: `TRX-00${i + 1}`,
        date: date.toISOString(),
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        paymentMethod: ['Tunai', 'QRIS', 'Transfer Bank'][i % 3] as 'Tunai' | 'QRIS' | 'Transfer Bank',
        cashierName: ['Andi', 'Budi'][i % 2],
    }
});

export const initialSettings: StoreSettings = {
  name: 'Kopi Kenangan Senja',
  address: 'Jl. Jend. Sudirman No. 123, Jakarta',
  phone: '0812-3456-7890',
  logoUrl: 'https://picsum.photos/id/12/100/100',
  receiptFooter: 'Terima Kasih atas kunjungan Anda!',
};
