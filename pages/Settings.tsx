
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useStore } from '../context/StoreContext';
import type { StoreSettings } from '../types';

const Settings: React.FC = () => {
  const { state, dispatch } = useStore();
  const [settings, setSettings] = useState<StoreSettings>(state.settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Layout title="Pengaturan Toko">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Informasi Toko</h2>
          <div className="flex items-center space-x-6">
            <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 rounded-full object-cover" />
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">Upload Logo Baru</label>
              <input type="file" id="logo" onChange={handleFileChange} accept="image/*" className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4A90E2] file:text-white hover:file:bg-[#357ABD]"/>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Toko</label>
            <input type="text" name="name" id="name" value={settings.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea name="address" id="address" value={settings.address} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]"></textarea>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">No. Telepon</label>
            <input type="text" name="phone" id="phone" value={settings.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]" />
          </div>
          <div>
            <label htmlFor="receiptFooter" className="block text-sm font-medium text-gray-700">Footer Struk</label>
            <input type="text" name="receiptFooter" id="receiptFooter" value={settings.receiptFooter} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2]" />
          </div>
          <div className="flex justify-end items-center">
            {isSaved && <p className="text-[#50C878] mr-4">Pengaturan disimpan!</p>}
            <button type="submit" className="px-6 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD] transition-colors">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
