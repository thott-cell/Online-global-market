// src/context/CartContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  sellerId?: string;
  discount?: number;
  discountedPrice?: number | string;
  discountPrice?: number | string;
  salePrice?: number | string;

  stock?: number;
  initialStock?: number;
  sold?: number;
}

interface Order {
  id: string;
  products: CartItem[];
  total: number;
  status: string;
  orderedAt: string;
  estimatedArrival: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  createOrder: () => Order | null;
  orders: Order[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const toNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getAvailableStock = (item: CartItem) => {
  if (Number.isFinite(Number(item.stock))) {
    return Math.max(0, toNumber(item.stock));
  }

  const hasInitial = Number.isFinite(Number(item.initialStock));
  const hasSold = Number.isFinite(Number(item.sold));

  if (hasInitial || hasSold) {
    const initial = hasInitial ? toNumber(item.initialStock) : 0;
    const sold = hasSold ? toNumber(item.sold) : 0;
    return Math.max(0, initial - sold);
  }

  return null; // unknown stock, do not force to 0
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const safeQuantity = Math.max(1, toNumber(item.quantity) || 1);

      if (existing) {
        const availableStock = getAvailableStock(existing);
        const nextQuantity = existing.quantity + safeQuantity;

        if (availableStock !== null && nextQuantity > availableStock) {
          return prev;
        }

        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: nextQuantity } : i
        );
      }

      const availableStock = getAvailableStock(item);

      if (availableStock !== null && safeQuantity > availableStock) {
        return prev;
      }

      return [
        ...prev,
        {
          ...item,
          quantity: safeQuantity,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          const nextQuantity = Math.max(0, toNumber(quantity));
          const availableStock = getAvailableStock(item);

          if (availableStock !== null && nextQuantity > availableStock) {
            return item;
          }

          return {
            ...item,
            quantity: nextQuantity,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const createOrder = (): Order | null => {
    if (!cartItems.length) return null;

    const orderId = `ORD-${Date.now()}`;

    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const now = new Date();
    const estimatedArrival = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

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
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        createOrder,
        orders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};