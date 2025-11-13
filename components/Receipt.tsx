import React from 'react';
import type { Transaction, StoreSettings, Product } from '../types';

interface ReceiptProps {
  transaction: Transaction;
  settings: StoreSettings;
  products: Product[];
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, settings, products }) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('id-ID');

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produk tidak ditemukan';
  };
  
  return (
    <div className="p-4 bg-white text-black font-mono text-xs" style={{ width: '288px' /* 72mm */ }}>
      <div className="text-center">
        {settings.logoUrl && <img src={settings.logoUrl} alt="logo" className="mx-auto w-16 h-16 object-contain mb-2"/>}
        <h2 className="text-base font-bold">{settings.name}</h2>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>
      <div className="border-t border-dashed border-black my-2"></div>
      <div>
        <p>No: {transaction.id}</p>
        <p>Tgl: {formatDate(transaction.date)}</p>
        <p>Kasir: {transaction.cashierName}</p>
      </div>
      <div className="border-t border-dashed border-black my-2"></div>
      <div>
        {transaction.items.map(item => (
          <div key={item.productId} className="grid grid-cols-5 gap-1 my-1">
            <div className="col-span-5">{getProductName(item.productId)}</div>
            <div className="col-span-1 text-left">{item.quantity}x</div>
            <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
            <div className="col-span-2 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-black my-2"></div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-bold">{formatCurrency(transaction.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Metode Bayar</span>
          <span>{transaction.paymentMethod}</span>
        </div>
      </div>
      <div className="border-t border-dashed border-black my-2"></div>
      <div className="text-center mt-2">
        <p>{settings.receiptFooter}</p>
      </div>
    </div>
  );
};

export default Receipt;
