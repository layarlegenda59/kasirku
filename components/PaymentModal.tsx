import React, { useState } from 'react';
import type { Transaction, TransactionItem } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: TransactionItem[];
  total: number;
  onConfirm: (transaction: Transaction) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, cart, total, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer Bank'>('Tunai');
  const [cashReceived, setCashReceived] = useState<number>(0);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const change = paymentMethod === 'Tunai' && cashReceived >= total ? cashReceived - total : 0;

  const handleConfirm = () => {
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items: cart,
      total,
      paymentMethod,
      cashierName: 'Admin',
    };
    onConfirm(newTransaction);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-semibold text-gray-800">Pembayaran</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-gray-600">Total Tagihan</p>
            <p className="text-4xl font-bold text-[#4A90E2]">{formatCurrency(total)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
            >
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Transfer Bank</option>
            </select>
          </div>
          {paymentMethod === 'Tunai' && (
            <div>
              <label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700">Uang Diterima</label>
              <input
                type="number"
                id="cashReceived"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                placeholder="e.g. 100000"
              />
              <div className="mt-2 text-right">
                <p className="text-gray-600">Kembalian: <span className="font-bold text-lg text-green-600">{formatCurrency(change)}</span></p>
              </div>
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={paymentMethod === 'Tunai' && cashReceived < total}
            className="w-full px-4 py-3 bg-[#50C878] text-white text-lg font-bold rounded-md hover:bg-[#45a062] disabled:bg-gray-400 transition-colors"
          >
            PROSES & CETAK STRUK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
