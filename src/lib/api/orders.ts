import { client } from '@/lib/amplify/client';
import type { Order, OrderStatus } from '@/lib/types/checkout';

// Mock orders for development
const mockOrders: Order[] = [
  {
    id: 'order_abc123def456',
    customerId: 'cust_001',
    vendorId: 'vendor_1',
    vendorName: 'Sweet Treats Bakery',
    items: [
      {
        productId: 'prod_1',
        productName: 'Chocolate Croissant',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        quantity: 2,
        price: 4.5,
        subtotal: 9.0,
      },
      {
        productId: 'prod_2',
        productName: 'Almond Croissant',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        quantity: 1,
        price: 5.0,
        subtotal: 5.0,
      },
    ],
    subtotal: 14.0,
    deliveryFee: 3.99,
    platformFee: 0.84,
    tax: 1.12,
    discount: 0,
    total: 19.95,
    status: 'PREPARING',
    deliveryAddress: {
      street: '123 Main St',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43201',
      label: 'home',
    },
    deliveryMode: 'DELIVERY',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
  },
  {
    id: 'order_pending001',
    customerId: 'cust_002',
    vendorId: 'vendor_1',
    vendorName: 'Sweet Treats Bakery',
    items: [
      {
        productId: 'prod_5',
        productName: 'Blueberry Muffin',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        quantity: 4,
        price: 3.5,
        subtotal: 14.0,
      },
    ],
    subtotal: 14.0,
    deliveryFee: 2.99,
    platformFee: 0.84,
    tax: 1.12,
    discount: 0,
    total: 18.95,
    status: 'PENDING',
    deliveryAddress: {
      street: '789 Elm St',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43203',
      label: 'home',
    },
    deliveryMode: 'DELIVERY',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_ready001',
    customerId: 'cust_003',
    vendorId: 'vendor_1',
    vendorName: 'Sweet Treats Bakery',
    items: [
      {
        productId: 'prod_6',
        productName: 'Sourdough Bread',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        quantity: 1,
        price: 8.0,
        subtotal: 8.0,
      },
    ],
    subtotal: 8.0,
    deliveryFee: 0,
    platformFee: 0.48,
    tax: 0.64,
    discount: 0,
    total: 9.12,
    status: 'READY',
    deliveryAddress: {
      street: '321 Pine St',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43204',
      label: 'home',
    },
    deliveryMode: 'PICKUP',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  },
  {
    id: 'order_completed001',
    customerId: 'cust_004',
    vendorId: 'vendor_1',
    vendorName: 'Sweet Treats Bakery',
    items: [
      {
        productId: 'prod_7',
        productName: 'Cinnamon Roll',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_1',
        vendorName: 'Sweet Treats Bakery',
        quantity: 2,
        price: 4.0,
        subtotal: 8.0,
      },
    ],
    subtotal: 8.0,
    deliveryFee: 2.99,
    platformFee: 0.48,
    tax: 0.64,
    discount: 0,
    total: 12.11,
    status: 'COMPLETED',
    deliveryAddress: {
      street: '555 Maple Ave',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43205',
      label: 'home',
    },
    deliveryMode: 'DELIVERY',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'order_xyz789ghi012',
    customerId: 'mock-customer-id',
    vendorId: 'vendor_2',
    vendorName: 'Artisan Coffee Co.',
    items: [
      {
        productId: 'prod_3',
        productName: 'Cold Brew Coffee',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_2',
        vendorName: 'Artisan Coffee Co.',
        quantity: 1,
        price: 4.5,
        subtotal: 4.5,
      },
    ],
    subtotal: 4.5,
    deliveryFee: 2.99,
    platformFee: 0.27,
    tax: 0.36,
    discount: 0,
    total: 8.12,
    status: 'COMPLETED',
    deliveryAddress: {
      street: '123 Main St',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43201',
      label: 'home',
    },
    deliveryMode: 'PICKUP',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'order_mno345pqr678',
    customerId: 'mock-customer-id',
    vendorId: 'vendor_3',
    vendorName: 'Local Craft Market',
    items: [
      {
        productId: 'prod_4',
        productName: 'Handmade Candle',
        productImage: '/placeholder-product.jpg',
        vendorId: 'vendor_3',
        vendorName: 'Local Craft Market',
        quantity: 3,
        price: 12.0,
        subtotal: 36.0,
      },
    ],
    subtotal: 36.0,
    deliveryFee: 4.99,
    platformFee: 2.16,
    tax: 2.88,
    discount: 5.0,
    total: 41.03,
    status: 'OUT_FOR_DELIVERY',
    deliveryAddress: {
      street: '456 Oak Avenue',
      city: 'Columbus',
      state: 'OH',
      zipCode: '43202',
      label: 'work',
      instructions: 'Leave at front desk',
    },
    deliveryMode: 'DELIVERY',
    promoCode: 'SAVE5',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
  },
];

export const orderService = {
  // Get order history for a customer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getOrderHistory: async (customerId: string): Promise<Order[]> => {
    try {
      // For development, return mock data
      // In production, this would call the backend
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      return mockOrders;

      /* Production code:
      const { data, errors } = await client.queries.getOrderHistory({
        customerId,
      });

      if (errors) {
        console.error('Get order history errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to fetch order history');
      }

      return (data?.orders as Order[]) || [];
      */
    } catch (error) {
      console.error('Get order history error:', error);
      throw error;
    }
  },

  // Get a specific order by ID
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      // For development, return mock data
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay
      return mockOrders.find((order) => order.id === orderId) || null;

      /* Production code:
      const { data, errors } = await client.queries.getOrderHistory({
        customerId: 'mock-customer-id', // Would come from auth
      });

      if (errors) {
        console.error('Get order errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to fetch order');
      }

      const orders = (data?.orders as Order[]) || [];
      return orders.find((order) => order.id === orderId) || null;
      */
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  // Update order status (vendor only)
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    try {
      const { data, errors } = await client.mutations.updateOrderStatus({
        orderId,
        status,
      });

      if (errors) {
        console.error('Update order status errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to update order status');
      }

      if (!data) {
        throw new Error('No data returned from update order status');
      }

      return data as Order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  // Contact vendor about an order
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contactVendor: async (orderId: string, message: string): Promise<void> => {
    try {
      // This would send a message to the vendor
      // For now, we'll just log it
      console.log('Contact vendor:', { orderId, message });
      
      // In production, this would call a backend function
      // that sends an email or notification to the vendor
    } catch (error) {
      console.error('Contact vendor error:', error);
      throw error;
    }
  },

  // Get orders for a vendor (vendor portal)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getVendorOrders: async (vendorId: string, status?: OrderStatus): Promise<Order[]> => {
    try {
      // For development, return mock data filtered by vendor
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      
      let orders = mockOrders.filter((order) => order.vendorId === vendorId);
      
      // Filter by status if provided
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }
      
      // Sort by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return orders;

      /* Production code:
      const { data, errors } = await client.queries.getVendorOrders({
        vendorId,
        status,
      });

      if (errors) {
        console.error('Get vendor orders errors:', errors);
        throw new Error(errors[0]?.message || 'Failed to fetch vendor orders');
      }

      return (data?.orders as Order[]) || [];
      */
    } catch (error) {
      console.error('Get vendor orders error:', error);
      throw error;
    }
  },
};
