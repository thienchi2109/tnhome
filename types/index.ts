export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface Product {
  id: string;
  externalId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  isActive: boolean;
  stock: number;
  lowStockThreshold: number;
}

export interface Customer {
  id: string;
  userId: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  userId: string | null;
  customerId: string;
  customer?: Customer;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";

// Form input types
export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  notes?: string;
}

export interface CreateOrderInput extends CheckoutFormData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
