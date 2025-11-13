import React, { createContext, useReducer, useContext, type Dispatch, useEffect } from 'react';
import type { Product, Transaction, StoreSettings } from '../types';
import { initialProducts, initialTransactions, initialSettings } from '../data/mockData';

// API base (frontend will use this to call the local server)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

interface AppState {
  products: Product[];
  transactions: Transaction[];
  settings: StoreSettings;
}

type Action =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string } // id
  | { type: 'UPDATE_SETTINGS'; payload: StoreSettings }
  | { type: 'PROCESS_TRANSACTION'; payload: Transaction }
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] };

const initialState: AppState = {
  products: initialProducts,
  transactions: initialTransactions,
  settings: initialSettings,
};

const storeReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_PRODUCTS':
      return { ...state, products: action.payload };
    case 'LOAD_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'PROCESS_TRANSACTION': {
      const newTransaction = action.payload;
      const updatedProducts = state.products.map(product => {
        const itemInCart = newTransaction.items.find(item => item.productId === product.id);
        if (itemInCart) {
          return { ...product, stock: product.stock - itemInCart.quantity };
        }
        return product;
      });
      return {
        ...state,
        transactions: [newTransaction, ...state.transactions],
        products: updatedProducts,
      };
    }
    default:
      return state;
  }
};

const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};