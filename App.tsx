import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ApiProvider } from './context/ApiContext';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Cashier from './pages/Cashier';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ApiProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cashier" element={<Cashier />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </HashRouter>
      </ApiProvider>
    </StoreProvider>
  );
};

export default App;