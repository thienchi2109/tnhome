import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        // Skip if out of stock
        const stock = item.stock ?? 99;
        if (stock <= 0) return;

        const addQty = Math.max(1, quantity);
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          // Don't exceed available stock
          const newQty = Math.min(existingItem.quantity + addQty, stock);
          if (newQty <= existingItem.quantity) return;
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty, stock } : i
            ),
          });
        } else {
          const cappedQty = Math.min(addQty, stock);
          set({ items: [...items, { ...item, quantity: cappedQty }] });
        }
        set({ isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;
            // Cap at available stock (defensive default for old localStorage data)
            const maxStock = i.stock ?? 99;
            return { ...i, quantity: Math.min(quantity, maxStock) };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "tnhome-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Migrate old localStorage data that lacks `stock` field
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CartState> | undefined;
        return {
          ...current,
          items: (persistedState?.items ?? []).map((item) => ({
            ...item,
            stock: item.stock ?? 99,
          })),
        };
      },
    }
  )
);
