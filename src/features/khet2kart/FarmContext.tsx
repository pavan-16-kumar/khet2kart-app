import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import tomatoes from "@/assets/tomatoes.jpg";
import mangoes from "@/assets/mangoes.jpg";
import okra from "@/assets/okra.jpg";
import rice from "@/assets/rice.jpg";
import { api, type CreateOrderPayload, type ApiListing } from "@/lib/api";

export type Role = "home" | "customer" | "farmer" | "transporter" | "hub" | "admin";
export type OrderStatus = "PENDING" | "FARMER_ACCEPTED" | "IN_TRANSIT" | "DELIVERED";

export type CropListing = {
  id: string;
  listingId: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  variety: string;
  category: "Vegetables" | "Fruits" | "Grains";
  grade: string;
  availableQuantity: number;
  pricePerKg: number;
  harvestDate: string;
  imageUrl: string;
  location: string;
};

export type Order = {
  id: string;
  orderId: string;
  customerId: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  buyer: string;
  deliveryAddress?: string;
  createdAt?: string;
};

export type CartItem = CropListing & { cartQuantity: number };

function resolveImage(cropName: string, imageUrl?: string): string {
  const name = (cropName || "").toLowerCase();
  if (name.includes("tomato")) return tomatoes;
  if (name.includes("mango")) return mangoes;
  if (name.includes("okra")) return okra;
  if (name.includes("rice") || name.includes("wheat") || name.includes("grain")) return rice;
  return imageUrl && imageUrl.startsWith("http") ? imageUrl : okra;
}

const initialListings: CropListing[] = [
  {
    id: "1",
    listingId: "LST-2041",
    farmerId: "FC-TG-184",
    farmerName: "Ramesh Naik",
    cropName: "Tomatoes",
    variety: "Arka Rakshak",
    category: "Vegetables",
    grade: "Grade A",
    availableQuantity: 620,
    pricePerKg: 32,
    harvestDate: "Today",
    imageUrl: tomatoes,
    location: "Medak, Telangana",
  },
  {
    id: "2",
    listingId: "LST-2042",
    farmerId: "FC-MH-092",
    farmerName: "Sunita Patil",
    cropName: "Alphonso Mango",
    variety: "Ratnagiri",
    category: "Fruits",
    grade: "Organic",
    availableQuantity: 380,
    pricePerKg: 145,
    harvestDate: "Tomorrow",
    imageUrl: mangoes,
    location: "Ratnagiri, Maharashtra",
  },
  {
    id: "3",
    listingId: "LST-2043",
    farmerId: "FC-KA-311",
    farmerName: "Mahesh Gowda",
    cropName: "Fresh Okra",
    variety: "Parbhani Kranti",
    category: "Vegetables",
    grade: "Organic",
    availableQuantity: 240,
    pricePerKg: 48,
    harvestDate: "Today",
    imageUrl: okra,
    location: "Mysuru, Karnataka",
  },
  {
    id: "4",
    listingId: "LST-2044",
    farmerId: "FC-PB-228",
    farmerName: "Gurpreet Singh",
    cropName: "Basmati Rice",
    variety: "Pusa 1121",
    category: "Grains",
    grade: "Grade A",
    availableQuantity: 1800,
    pricePerKg: 76,
    harvestDate: "Sep 12",
    imageUrl: rice,
    location: "Patiala, Punjab",
  },
];

const initialOrders: Order[] = [
  {
    id: "1",
    orderId: "K2K-84321",
    customerId: "C-009",
    farmerId: "FC-TG-184",
    cropName: "Tomatoes",
    quantity: 120,
    totalAmount: 3840,
    status: "PENDING",
    paymentMethod: "UPI",
    buyer: "Fresh Basket Café",
  },
  {
    id: "2",
    orderId: "K2K-84318",
    customerId: "C-102",
    farmerId: "FC-TG-184",
    cropName: "Fresh Okra",
    quantity: 80,
    totalAmount: 3840,
    status: "FARMER_ACCEPTED",
    paymentMethod: "UPI",
    buyer: "Aahar Kitchens",
  },
  {
    id: "3",
    orderId: "K2K-84296",
    customerId: "C-047",
    farmerId: "FC-MH-092",
    cropName: "Alphonso Mango",
    quantity: 40,
    totalAmount: 5800,
    status: "DELIVERED",
    paymentMethod: "COD",
    buyer: "Green Grocers",
  },
];

type FarmContextValue = {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  listings: CropListing[];
  addListing: (listing: Omit<CropListing, "id" | "listingId" | "imageUrl">) => Promise<void>;
  orders: Order[];
  updateOrder: (id: string, status: OrderStatus) => Promise<void>;
  cart: CartItem[];
  addToCart: (listing: CropListing) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  placeOrder: (payload: CreateOrderPayload) => Promise<Order>;
  platformStats: {
    totalHarvestSaved: string;
    extraFarmerIncome: string;
    activeFarmers: string;
    avgTurnaroundTime: string;
    gmv?: string;
    systemHealth?: string;
  };
  refreshData: () => Promise<void>;
};

const FarmContext = createContext<FarmContextValue | undefined>(undefined);

export function FarmConnectProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>("home");
  const [listings, setListings] = useState<CropListing[]>(initialListings);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalHarvestSaved: "18,420 t",
    extraFarmerIncome: "₹12.8 Cr",
    activeFarmers: "8,642",
    avgTurnaroundTime: "21 hrs",
    gmv: "₹4.82 Cr",
    systemHealth: "99.98%",
  });

  const fetchData = async () => {
    try {
      const [listingsRes, ordersRes, statsRes] = await Promise.allSettled([
        api.listings.getAll(),
        api.orders.getAll(),
        api.platform.getStats(),
      ]);

      if (listingsRes.status === "fulfilled" && listingsRes.value?.listings) {
        setListings(
          listingsRes.value.listings.map((item: ApiListing) => ({
            ...item,
            imageUrl: resolveImage(item.cropName, item.imageUrl),
          })),
        );
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value?.orders) {
        setOrders(ordersRes.value.orders);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.stats) {
        setPlatformStats((prev) => ({
          ...prev,
          ...statsRes.value.stats,
        }));
      }
    } catch (err) {
      console.warn("Could not fetch remote data, continuing with cached/initial state", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = useMemo<FarmContextValue>(
    () => ({
      activeRole,
      setActiveRole,
      listings,
      orders,
      cart,
      platformStats,
      refreshData: fetchData,
      addToCart: (listing) =>
        setCart((items) => {
          const found = items.find((item) => item.id === listing.id);
          return found
            ? items.map((item) =>
                item.id === listing.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
              )
            : [...items, { ...listing, cartQuantity: 1 }];
        }),
      removeFromCart: (id) => setCart((items) => items.filter((item) => item.id !== id)),
      clearCart: () => setCart([]),
      updateOrder: async (id, status) => {
        setOrders((items) =>
          items.map((order) => (order.id === id ? { ...order, status } : order)),
        );
        try {
          await api.orders.updateStatus(id, status);
        } catch (err) {
          console.error("Backend order update failed:", err);
        }
      },
      addListing: async (listing) => {
        try {
          const res = await api.listings.create({
            ...listing,
            imageUrl: "/src/assets/okra.jpg",
          });
          if (res?.listing) {
            const formatted = {
              ...res.listing,
              imageUrl: resolveImage(res.listing.cropName, res.listing.imageUrl),
            };
            setListings((items) => [formatted, ...items.filter((i) => i.id !== formatted.id)]);
            return;
          }
        } catch (err) {
          console.error("Backend listing creation failed, adding locally:", err);
        }
        const localItem: CropListing = {
          ...listing,
          id: crypto.randomUUID(),
          listingId: `LST-${2040 + listings.length + 1}`,
          imageUrl: okra,
        };
        setListings((items) => [localItem, ...items]);
      },
      placeOrder: async (payload: CreateOrderPayload) => {
        const res = await api.orders.create(payload);
        if (res?.order) {
          setOrders((items) => [res.order, ...items]);
          setCart([]);
          // Also refresh listings because stock was deducted on backend
          fetchData();
          return res.order;
        }
        throw new Error("Failed to create order on backend");
      },
    }),
    [activeRole, listings, orders, cart, platformStats],
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarmConnect() {
  const value = useContext(FarmContext);
  if (!value) throw new Error("useFarmConnect must be used within FarmConnectProvider");
  return value;
}
