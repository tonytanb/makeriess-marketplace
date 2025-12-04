import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address, Location, DeliveryMode, CartItem, Product } from '@/lib/types/customer';
import { queueAction, isOnline } from '@/lib/pwa/offline-queue';

interface AppState {
  // Address & Location
  selectedAddress: Address | null;
  currentLocation: Location | null;
  setSelectedAddress: (address: Address | null) => void;
  setCurrentLocation: (location: Location | null) => void;

  // Delivery Mode
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;

  // Scheduling
  isScheduled: boolean;
  scheduledTime: Date | null;
  setScheduled: (scheduled: boolean, time?: Date | null) => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getVendorSubtotals: () => Map<string, { vendorName: string; subtotal: number; items: CartItem[] }>;

  // Favorites
  favoriteProducts: string[];
  favoriteVendors: string[];
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteVendor: (vendorId: string) => void;
  isFavoriteProduct: (productId: string) => boolean;
  isFavoriteVendor: (vendorId: string) => boolean;

  // Dietary Preferences
  dietaryPreferences: string[];
  setDietaryPreferences: (preferences: string[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Address & Location
      selectedAddress: null,
      currentLocation: null,
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setCurrentLocation: (location) => set({ currentLocation: location }),

      // Delivery Mode
      deliveryMode: 'DELIVERY',
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),

      // Scheduling
      isScheduled: false,
      scheduledTime: null,
      setScheduled: (scheduled, time = null) =>
        set({ isScheduled: scheduled, scheduledTime: time }),

      // Cart
      cartItems: [],
      addToCart: (product, quantity = 1) => {
        const { cartItems } = get();
        const existingItem = cartItems.find((item) => item.productId === product.id);

        if (existingItem) {
          set({
            cartItems: cartItems.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    subtotal: (item.quantity + quantity) * item.price,
                  }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            productName: product.name,
            productImage: product.images[0] || '',
            vendorId: product.vendorId,
            vendorName: product.vendor?.businessName || '',
            quantity,
            price: product.price,
            subtotal: product.price * quantity,
          };
          set({ cartItems: [...cartItems, newItem] });
        }

        // Queue action if offline
        if (!isOnline()) {
          queueAction({
            type: 'cart',
            action: 'add',
            data: { productId: product.id, quantity },
          }).catch(console.error);
        }
      },

      removeFromCart: (productId) => {
        const { cartItems } = get();
        set({ cartItems: cartItems.filter((item) => item.productId !== productId) });

        // Queue action if offline
        if (!isOnline()) {
          queueAction({
            type: 'cart',
            action: 'remove',
            data: { productId },
          }).catch(console.error);
        }
      },

      updateQuantity: (productId, quantity) => {
        const { cartItems } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cartItems: cartItems.map((item) =>
            item.productId === productId
              ? { ...item, quantity, subtotal: quantity * item.price }
              : item
          ),
        });

        // Queue action if offline
        if (!isOnline()) {
          queueAction({
            type: 'cart',
            action: 'update',
            data: { productId, quantity },
          }).catch(console.error);
        }
      },

      clearCart: () => set({ cartItems: [] }),

      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.subtotal, 0);
      },

      getCartItemCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((count, item) => count + item.quantity, 0);
      },

      getVendorSubtotals: () => {
        const { cartItems } = get();
        const vendorMap = new Map<string, { vendorName: string; subtotal: number; items: CartItem[] }>();

        cartItems.forEach((item) => {
          const existing = vendorMap.get(item.vendorId);
          if (existing) {
            existing.subtotal += item.subtotal;
            existing.items.push(item);
          } else {
            vendorMap.set(item.vendorId, {
              vendorName: item.vendorName,
              subtotal: item.subtotal,
              items: [item],
            });
          }
        });

        return vendorMap;
      },

      // Favorites
      favoriteProducts: [],
      favoriteVendors: [],

      toggleFavoriteProduct: (productId) => {
        const { favoriteProducts } = get();
        const isRemoving = favoriteProducts.includes(productId);
        
        if (isRemoving) {
          set({ favoriteProducts: favoriteProducts.filter((id) => id !== productId) });
        } else {
          set({ favoriteProducts: [...favoriteProducts, productId] });
        }

        // Queue action if offline
        if (!isOnline()) {
          queueAction({
            type: 'favorite',
            action: isRemoving ? 'remove' : 'add',
            data: { productId, type: 'product' },
          }).catch(console.error);
        }
      },

      toggleFavoriteVendor: (vendorId) => {
        const { favoriteVendors } = get();
        const isRemoving = favoriteVendors.includes(vendorId);
        
        if (isRemoving) {
          set({ favoriteVendors: favoriteVendors.filter((id) => id !== vendorId) });
        } else {
          set({ favoriteVendors: [...favoriteVendors, vendorId] });
        }

        // Queue action if offline
        if (!isOnline()) {
          queueAction({
            type: 'favorite',
            action: isRemoving ? 'remove' : 'add',
            data: { vendorId, type: 'vendor' },
          }).catch(console.error);
        }
      },

      isFavoriteProduct: (productId) => {
        const { favoriteProducts } = get();
        return favoriteProducts.includes(productId);
      },

      isFavoriteVendor: (vendorId) => {
        const { favoriteVendors } = get();
        return favoriteVendors.includes(vendorId);
      },

      // Dietary Preferences
      dietaryPreferences: [],
      setDietaryPreferences: (preferences) => set({ dietaryPreferences: preferences }),
    }),
    {
      name: 'makeriess-storage',
      partialize: (state) => ({
        selectedAddress: state.selectedAddress,
        deliveryMode: state.deliveryMode,
        cartItems: state.cartItems,
        favoriteProducts: state.favoriteProducts,
        favoriteVendors: state.favoriteVendors,
        dietaryPreferences: state.dietaryPreferences,
      }),
    }
  )
);
