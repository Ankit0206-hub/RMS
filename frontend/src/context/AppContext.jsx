import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [customerSession, setCustomerSession] = useState(() => {
    const saved = localStorage.getItem("customerSession");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (customerSession) {
      localStorage.setItem("customerSession", JSON.stringify(customerSession));
    } else {
      localStorage.removeItem("customerSession");
    }
  }, [customerSession]);

  const [editingAddress, setEditingAddress] = useState(null);
  const [user, setUser] = useState({
    
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+91 98765 43210",
    image: "https://i.pravatar.cc/150?img=12",
  });
  const addToCart = (food) => {
    // Generate a unique ID for the cart item based on customizations so they don't merge incorrectly
    const customId = `${food.id || food.name}-${food.portion || 'Full'}-${food.spiceLevel || 'Normal'}`;
    const item = {
      ...food,
      cartItemId: customId,
      id: customId,
      originalId: food.id || food.name,
    };

    const existing = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existing) {
      toast.success(`Increased ${item.name} quantity`);
    } else {
      toast.success(`Added ${item.name} to cart`);
    }

    setCartItems((prev) => {
      const existingInPrev = prev.find((cartItem) => cartItem.id === item.id);

      if (existingInPrev) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const editCartItem = (oldId, newFoodObj, quantity) => {
    const customId = `${newFoodObj.originalId || newFoodObj.id || newFoodObj.name}-${newFoodObj.portion || 'Full'}-${newFoodObj.spiceLevel || 'Normal'}`;
    
    // Perform side effects outside the state updater
    toast.success(`Updated ${newFoodObj.name}`);

    setCartItems((prev) => {
      const filtered = prev.filter(item => item.id !== oldId);
      const existing = filtered.find(item => item.id === customId);
      
      if (existing) {
        return filtered.map(item => 
          item.id === customId 
            ? { ...item, quantity: item.quantity + quantity, instructions: newFoodObj.instructions }
            : item
        );
      } else {
        const itemToAdd = {
          ...newFoodObj,
          cartItemId: customId,
          id: customId,
          originalId: newFoodObj.originalId || newFoodObj.id || newFoodObj.name,
          quantity
        };
        return [...filtered, itemToAdd];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };
  const toggleFavorite = (food) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === food.id);

      if (exists) {
        return prev.filter((item) => item.id !== food.id);
      }

      return [...prev, food];
    });
  };
  const isFavorite = (id) => {
    return favorites.some((item) => item.id === id);
  };
  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };
  const placeOrder = (paymentMethod = "Cash") => {
    if (cartItems.length === 0) return;

    const newOrder = {
      id: `ORD${Date.now()}`,
      items: cartItems,
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: "Delivered",
      paymentMethod,
      date: new Date().toLocaleDateString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  };
  const updateUser = (data) => {
    setUser((prev) => ({
      ...prev,
      ...data,
    }));
  };
  const addAddress = (newAddress) => {
    setAddresses((prev) => [
      ...prev,
      { id: Date.now(), ...newAddress },
    ]);
  };

  const updateAddress = (id, updatedData) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id ? { ...addr, ...updatedData } : addr
      )
    );
  };

  const deleteAddress = (id) => {
    setAddresses((prev) =>
      prev.filter((addr) => addr.id !== id)
    );
  };
  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        editCartItem,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,

        favorites,
        toggleFavorite,
        isFavorite,
        appliedCoupon,
        applyCoupon,
        orders,
        placeOrder,
        user,
        updateUser,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        editingAddress,
        setEditingAddress,
        customerSession,
        setCustomerSession,
        setCartItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
