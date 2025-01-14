import { create } from 'zustand'
import { StateCreator } from 'zustand'

interface Product {
  id: string
  title: string
  description: string
  imageUrl: string
  price: string
  rating: number
  externalUrl: string
}

interface CompareStore {
  selectedProducts: Product[]
  addProduct: (product: Product) => void
  removeProduct: (productId: string) => void
  clearProducts: () => void
}

const storeCreator: StateCreator<CompareStore> = (set) => ({
  selectedProducts: [],
  addProduct: (product: Product) =>
    set((state: CompareStore) => ({
      selectedProducts: [...state.selectedProducts, product],
    })),
  removeProduct: (productId: string) =>
    set((state: CompareStore) => ({
      selectedProducts: state.selectedProducts.filter((p: Product) => p.id !== productId),
    })),
  clearProducts: () => set({ selectedProducts: [] }),
})

export const useCompareStore = create<CompareStore>(storeCreator) 