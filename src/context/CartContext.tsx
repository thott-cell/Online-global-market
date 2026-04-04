// src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

// Type for cart item
interface CartItem {
  discountedPrice: any;
  discount?: number; // optional discount
  description: string;
  sellerId: string;
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string; // 👈 for Cloudinary
}

// Type for an order
interface Order {
  id: string;
  products: CartItem[];
  total: number;
  status: string;
  orderedAt: string;
  estimatedArrival: string;
}

// Context type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void; // ✅ new
  clearCart: () => void;
  cartCount: number;
  createOrder: () => Order | null;
  orders: Order[];
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  // Remove item completely
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Update quantity of a specific item
  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0) // auto remove if quantity <= 0
    );
  };

  // Clear entire cart
  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Create Order
  const createOrder = (): Order | null => {
    if (!cartItems.length) return null;

    const orderId = `ORD-${Date.now()}`; // unique order ID
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const now = new Date();
    const estimatedArrival = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days

    const newOrder: Order = {
      id: orderId,
      products: cartItems,
      total,
      status: "Pending",
      orderedAt: now.toISOString(),
      estimatedArrival: estimatedArrival.toISOString(),
    };

    setOrders((prev) => [...prev, newOrder]);
    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, createOrder, orders }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};