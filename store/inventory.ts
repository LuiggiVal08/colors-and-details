import { create } from 'zustand';
import type { InventoryTabKey } from '@/feature/inventory/types';

interface InventoryState {
  selectedTab: InventoryTabKey;
  query: string;
  setSelectedTab: (tab: InventoryTabKey) => void;
  setQuery: (value: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  selectedTab: 'categorias',
  query: '',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setQuery: (value) => set({ query: value }),
}));
