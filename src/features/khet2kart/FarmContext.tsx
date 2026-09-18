import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import tomatoes from "@/assets/tomatoes.jpg";
import mangoes from "@/assets/mangoes.jpg";
import okra from "@/assets/okra.jpg";
import rice from "@/assets/rice.jpg";
import { supabase } from "@/lib/supabase";
import {
  api,
  type CreateOrderPayload,
  type ApiListing,
  type UserProfile,
  type AppRole,
  type RolePermissionConfig,
  type InventoryBatch,
  type InventorySummary,
  type DriverDelivery,
  type AuditLog,
} from "@/lib/api";

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
  items?: { listingId: string; cropName: string; quantity: number; pricePerKg: number }[];
};

export type CartItem = CropListing & { cartQuantity: number };

function resolveImage(cropName: string, imageUrl?: string): string {
  const name = (cropName || "").toLowerCase();
  if (name.includes("tomato")) return tomatoes;
  if (name.includes("mango")) return mangoes;
  if (name.includes("okra") || name.includes("lady")) return okra;
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

const defaultFarmerUser: UserProfile = {
  id: "u-farmer-01",
  phone: "9876543201",
  name: "Ramesh Naik",
  role: "FARMER",
  farmerId: "FO-TG-MDL-26-000184",
  location: "Medak, Telangana",
  village: "Narsapur",
  farmArea: 4.5,
  crops: ["Tomatoes", "Okra", "Chilli"],
  coordinates: [17.8714, 78.1108],
  verified: true,
  rating: 4.9,
  todaySales: 12450,
  availableStockKg: 240,
  activeCropsCount: 3,
  pendingOrdersCount: 5,
};

export const defaultRolePermissions: Record<AppRole, RolePermissionConfig> = {
  FARMER: {
    role: "FARMER",
    name: "Farmer Portal",
    enabled: true,
    adminApproved: true,
    description: "Direct farm produce listings, sales ledger, mandi rates & payments",
    permissions: ["create_listing", "view_orders", "manage_stock", "mandi_rates"],
  },
  CUSTOMER: {
    role: "CUSTOMER",
    name: "Customer Shopping",
    enabled: true,
    adminApproved: true,
    description: "Direct fresh produce marketplace, cart checkout, and delivery tracking",
    permissions: ["browse_catalog", "cart_checkout", "track_delivery", "upi_cod_payments"],
  },
  DELIVERY_PARTNER: {
    role: "DELIVERY_PARTNER",
    name: "Delivery Partner",
    enabled: true,
    adminApproved: true,
    description: "Last-mile transit dispatch, GPS tracking, and delivery OTP confirmation",
    permissions: ["accept_dispatch", "update_gps", "confirm_delivery_otp", "route_navigation"],
  },
  STORE_MANAGER: {
    role: "STORE_MANAGER",
    name: "Store / Hub Manager",
    enabled: true,
    adminApproved: true,
    description: "Hub intake inspection, cold chain monitoring, batch sealing, pick-pack-dispatch",
    permissions: ["quality_inspection", "seal_batch", "cold_chain_monitoring", "pick_pack_dispatch"],
  },
  ADMIN: {
    role: "ADMIN",
    name: "Admin Control Tower",
    enabled: true,
    adminApproved: true,
    description: "Full governance, RBAC permissions, network KPIs, and audit trail oversight",
    permissions: ["manage_roles", "grant_permissions", "audit_ledger", "full_governance"],
  },
};

type FarmContextValue = {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  currentUser: UserProfile | null;
  loginWithPhone: (phone: string, otp: string) => Promise<UserProfile>;
  loginWithOAuth: (
    provider: "google" | "agristack" | "demo_oauth",
    email: string,
    name: string,
    role: AppRole,
    avatar?: string,
    token?: string,
  ) => Promise<UserProfile>;
  quickRoleLogin: (role: AppRole) => Promise<UserProfile>;
  logout: () => void;
  rolePermissions: Record<AppRole, RolePermissionConfig>;
  isRoleAllowed: (role: AppRole | Role) => boolean;
  updateRolePermission: (
    role: AppRole,
    enabled: boolean,
    permissions?: string[],
    adminApproved?: boolean,
  ) => Promise<void>;
  listings: CropListing[];
  addListing: (listing: Omit<CropListing, "id" | "listingId" | "imageUrl">) => Promise<void>;
  updateListingQuantity: (id: string, newQuantity: number) => Promise<void>;
  orders: Order[];
  updateOrder: (id: string, status: OrderStatus) => Promise<void>;
  cart: CartItem[];
  addToCart: (listing: CropListing, qty?: number) => void;
  updateCartQuantity: (id: string, qty: number) => void;
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
  batches: InventoryBatch[];
  inventorySummary: InventorySummary | null;
  auditLogs: AuditLog[];
  activeDeliveries: DriverDelivery[];
  registerFarmerUser: (farmerData: {
    farmerId: string;
    name: string;
    phone: string;
    location: string;
    village?: string;
    farmArea?: number;
    crops?: string[];
    coordinates?: [number, number];
  }) => UserProfile;
  refreshData: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
};

const FarmContext = createContext<FarmContextValue | undefined>(undefined);

function roleToAppRole(role: Role): AppRole {
  switch (role) {
    case "farmer":
      return "FARMER";
    case "customer":
      return "CUSTOMER";
    case "transporter":
      return "DELIVERY_PARTNER";
    case "hub":
      return "STORE_MANAGER";
    case "admin":
      return "ADMIN";
    default:
      return "CUSTOMER";
  }
}

function appRoleToRole(appRole: AppRole): Role {
  switch (appRole) {
    case "FARMER":
      return "farmer";
    case "CUSTOMER":
      return "customer";
    case "DELIVERY_PARTNER":
      return "transporter";
    case "STORE_MANAGER":
      return "hub";
    case "ADMIN":
      return "admin";
    default:
      return "home";
  }
}

export function FarmConnectProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_session_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore user session:", e);
      }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_session_user");
        if (saved) {
          const u = JSON.parse(saved);
          if (u?.role) return appRoleToRole(u.role);
        }
      } catch (e) {
        console.error("Failed to restore active role:", e);
      }
    }
    return "home";
  });

  const [rolePermissions, setRolePermissions] = useState<Record<AppRole, RolePermissionConfig>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_role_permissions");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore permissions:", e);
      }
    }
    return defaultRolePermissions;
  });

  const [listings, setListings] = useState<CropListing[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_listings");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore listings:", e);
      }
    }
    return initialListings;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_orders");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore orders:", e);
      }
    }
    return initialOrders;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("k2k_cart");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore cart:", e);
      }
    }
    return [];
  });

  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<DriverDelivery[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalHarvestSaved: "18,420 t",
    extraFarmerIncome: "₹12.8 Cr",
    activeFarmers: "8,642",
    avgTurnaroundTime: "21 hrs",
    gmv: "₹4.82 Cr",
    systemHealth: "99.98%",
  });

  // Maintain website data exclusively in browser storage (localStorage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_role_permissions", JSON.stringify(rolePermissions));
    }
  }, [rolePermissions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_listings", JSON.stringify(listings));
    }
  }, [listings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Global Auto-Logout on 401
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleAuthExpired = () => {
      logout();
      alert("Your session has expired. Please sign in again.");
    };
    window.addEventListener("k2k:auth:expired", handleAuthExpired);
    return () => window.removeEventListener("k2k:auth:expired", handleAuthExpired);
  }, []);

  // Supabase Auth State Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUserToProfile(session.user);
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        syncSupabaseUserToProfile(session.user);
      } else {
        // User logged out
        setCurrentUser(null);
        setActiveRole("home");
        localStorage.removeItem("k2k_session_user");
        localStorage.removeItem("k2k_jwt");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncSupabaseUserToProfile = (supabaseUser: any) => {
    const role: AppRole = supabaseUser.user_metadata?.role || "CUSTOMER";
    if (!isRoleAllowed(role)) {
      supabase.auth.signOut();
      alert(`Role "${role}" access is restricted by Platform Admin.`);
      return;
    }

    const defaultUser = role === "FARMER" ? defaultFarmerUser : null;
    const userProfile: UserProfile = {
      id: supabaseUser.id,
      phone: supabaseUser.phone || supabaseUser.user_metadata?.phone || "",
      name: supabaseUser.user_metadata?.name || (supabaseUser.email ? supabaseUser.email.split("@")[0] : "User"),
      role: role,
      location: role === "FARMER" ? "Medak, Telangana" : "Hyderabad, Telangana",
      verified: true,
      ...(defaultUser && role === "FARMER" ? defaultUser : {}),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_session_user", JSON.stringify(userProfile));
    }
    
    setCurrentUser(userProfile);
    setActiveRole(appRoleToRole(role));
    fetchData();
  };

  const fetchData = async () => {
    try {
      const [listingsRes, ordersRes, statsRes, batchesRes, summaryRes, logsRes, driverTasksRes] =
        await Promise.allSettled([
          api.listings.getAll(),
          api.orders.getAll(),
          api.platform.getStats(),
          api.inventory.getBatches(),
          api.inventory.getSummary(),
          api.admin.getAuditLogs(10),
          api.logistics.getDriverTasks("DP-HYD-042"),
        ]);

      if (listingsRes.status === "fulfilled" && listingsRes.value?.listings) {
        const remoteListings = listingsRes.value.listings.map((item: ApiListing) => ({
          ...item,
          imageUrl: resolveImage(item.cropName, item.imageUrl),
        }));
        setListings((prev) => {
          // Merge remote with locally created listings
          const localOnly = prev.filter((p) => !remoteListings.some((r: CropListing) => r.id === p.id));
          const combined = [...remoteListings, ...localOnly];
          if (typeof window !== "undefined") {
            localStorage.setItem("k2k_listings", JSON.stringify(combined));
          }
          return combined;
        });
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value?.orders) {
        setOrders((prev) => {
          const remoteOrders = ordersRes.value.orders;
          const localOnly = prev.filter((p) => !remoteOrders.some((r: Order) => r.id === p.id));
          const combined = [...remoteOrders, ...localOnly];
          if (typeof window !== "undefined") {
            localStorage.setItem("k2k_orders", JSON.stringify(combined));
          }
          return combined;
        });
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.stats) {
        setPlatformStats((prev) => ({
          ...prev,
          ...statsRes.value.stats,
        }));
      }

      if (batchesRes.status === "fulfilled" && batchesRes.value?.batches) {
        setBatches(batchesRes.value.batches);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.summary) {
        setInventorySummary(summaryRes.value.summary);
      }

      if (logsRes.status === "fulfilled" && logsRes.value?.auditLogs) {
        setAuditLogs(logsRes.value.auditLogs);
      }

      if (driverTasksRes.status === "fulfilled" && driverTasksRes.value?.deliveries) {
        setActiveDeliveries(driverTasksRes.value.deliveries);
      }

      // Sync role permissions from backend
      api.auth
        .getPermissions()
        .then((pRes) => {
          if (pRes?.permissions) {
            setRolePermissions((prev) => {
              const merged = { ...prev, ...pRes.permissions };
              if (typeof window !== "undefined") {
                localStorage.setItem("k2k_role_permissions", JSON.stringify(merged));
              }
              return merged;
            });
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn("Could not fetch remote data, continuing with cached/initial state", err);
    }
  };

  const refreshInventory = async () => {
    try {
      const [bRes, sRes] = await Promise.allSettled([
        api.inventory.getBatches(),
        api.inventory.getSummary(),
      ]);
      if (bRes.status === "fulfilled") setBatches(bRes.value.batches);
      if (sRes.status === "fulfilled") setInventorySummary(sRes.value.summary);
    } catch (e) {
      console.error("Failed to refresh inventory:", e);
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const res = await api.admin.getAuditLogs(15);
      if (res?.auditLogs) setAuditLogs(res.auditLogs);
    } catch (e) {
      console.error("Failed to refresh audit logs:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isRoleAllowed = (role: AppRole | Role): boolean => {
    const appRole: AppRole =
      role === "farmer"
        ? "FARMER"
        : role === "customer"
        ? "CUSTOMER"
        : role === "transporter"
        ? "DELIVERY_PARTNER"
        : role === "hub"
        ? "STORE_MANAGER"
        : role === "admin"
        ? "ADMIN"
        : (role as AppRole);
    const config = rolePermissions[appRole];
    if (!config) return true;
    return Boolean(config.enabled && config.adminApproved !== false);
  };

  const updateRolePermission = async (
    role: AppRole,
    enabled: boolean,
    permissions?: string[],
    adminApproved: boolean = true,
  ) => {
    setRolePermissions((prev) => {
      const updated = {
        ...prev,
        [role]: {
          ...(prev[role] || defaultRolePermissions[role]),
          enabled,
          adminApproved,
          permissions: permissions || prev[role]?.permissions || [],
          updatedAt: new Date().toISOString(),
          updatedBy: "Platform Administrator",
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("k2k_role_permissions", JSON.stringify(updated));
      }
      return updated;
    });

    try {
      await api.admin.updateRolePermission(role, {
        enabled,
        adminApproved,
        ...(permissions ? { permissions } : {}),
      });
      refreshAuditLogs();
    } catch (err) {
      console.warn("Backend permission update failed, maintained in browser storage:", err);
    }
  };

  const loginWithPhone = async (phone: string, otp: string) => {
    const res = await api.auth.verifyOtp(phone, otp);
    if (res?.user) {
      if (!isRoleAllowed(res.user.role)) {
        throw new Error(`Role "${res.user.role}" access is restricted by Platform Admin.`);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("k2k_session_user", JSON.stringify(res.user));
        if (res.verificationToken) {
          localStorage.setItem("k2k_jwt", res.verificationToken);
        }
      }
      setCurrentUser(res.user);
      const newRole = appRoleToRole(res.user.role);
      setActiveRole(newRole);
      fetchData();
      return res.user;
    }
    throw new Error("Failed to authenticate user");
  };

  const loginWithOAuth = async (
    provider: "google" | "agristack" | "demo_oauth",
    email: string,
    name: string,
    role: AppRole,
    avatar?: string,
    token?: string,
  ) => {
    if (!isRoleAllowed(role)) {
      throw new Error(`Role "${role}" access is currently restricted by Platform Admin.`);
    }

    try {
      const res = await api.auth.oauthLogin({
        provider,
        role,
        email,
        name,
        ...(avatar ? { avatar } : {}),
        token: token || `k2k_oauth_${provider}_${Date.now()}`,
      });
      if (res?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("k2k_session_user", JSON.stringify(res.user));
          if (res.verificationToken) {
            localStorage.setItem("k2k_jwt", res.verificationToken);
          }
        }
        setCurrentUser(res.user);
        setActiveRole(appRoleToRole(res.user.role));
        fetchData();
        return res.user;
      }
    } catch (err) {
      console.warn("Backend OAuth call failed, logging in locally with browser storage session:", err);
      const defaultUser = role === "FARMER" ? defaultFarmerUser : null;
      const user: UserProfile = {
        id: `u-oauth-${Date.now()}`,
        phone:
          "987654320" +
          (role === "FARMER"
            ? "1"
            : role === "CUSTOMER"
            ? "2"
            : role === "DELIVERY_PARTNER"
            ? "3"
            : role === "STORE_MANAGER"
            ? "4"
            : "5"),
        name:
          name ||
          (role === "FARMER"
            ? "Ramesh Naik"
            : role === "CUSTOMER"
            ? "Pavan Kumar"
            : role === "STORE_MANAGER"
            ? "Suresh Varma"
            : role === "DELIVERY_PARTNER"
            ? "Ravi Kumar"
            : "Platform Administrator"),
        role,
        location: role === "FARMER" ? "Medak, Telangana" : "Hyderabad, Telangana",
        verified: true,
        ...(defaultUser && role === "FARMER" ? defaultUser : {}),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("k2k_session_user", JSON.stringify(user));
      }
      setCurrentUser(user);
      setActiveRole(appRoleToRole(role));
      return user;
    }
    throw new Error("Failed to authenticate with OAuth");
  };

  const quickRoleLogin = async (role: AppRole) => {
    if (!isRoleAllowed(role)) {
      throw new Error(`Role "${role}" access is currently restricted by Platform Admin.`);
    }
    try {
      const res = await api.auth.quickLogin(role);
      if (res?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("k2k_session_user", JSON.stringify(res.user));
          if (res.verificationToken) {
            localStorage.setItem("k2k_jwt", res.verificationToken);
          }
        }
        setCurrentUser(res.user);
        const newRole = appRoleToRole(role);
        setActiveRole(newRole);
        fetchData();
        return res.user;
      }
    } catch (e) {
      console.warn("Backend quickLogin failed, falling back to browser storage session:", e);
      const fallbackUser: UserProfile = {
        id: `u-${role.toLowerCase()}-demo`,
        phone:
          "987654320" +
          (role === "FARMER"
            ? "1"
            : role === "CUSTOMER"
            ? "2"
            : role === "DELIVERY_PARTNER"
            ? "3"
            : role === "STORE_MANAGER"
            ? "4"
            : "5"),
        name:
          role === "FARMER"
            ? "Ramesh Naik"
            : role === "CUSTOMER"
            ? "Pavan Kumar"
            : role === "STORE_MANAGER"
            ? "Suresh Varma"
            : role === "DELIVERY_PARTNER"
            ? "Ravi Kumar"
            : "Platform Administrator",
        role,
        verified: true,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("k2k_session_user", JSON.stringify(fallbackUser));
      }
      setCurrentUser(fallbackUser);
      setActiveRole(appRoleToRole(role));
      return fallbackUser;
    }
    throw new Error(`Failed to switch to role ${role}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveRole("home");
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("k2k_session_user");
      localStorage.removeItem("k2k_jwt");
      localStorage.removeItem("k2k_cart");
    }
  };

  const registerFarmerUser = (farmerData: {
    farmerId: string;
    name: string;
    phone: string;
    location: string;
    village?: string;
    farmArea?: number;
    crops?: string[];
    coordinates?: [number, number];
  }) => {
    const user: UserProfile = {
      id: "usr-" + Date.now(),
      phone: farmerData.phone,
      name: farmerData.name,
      role: "FARMER",
      farmerId: farmerData.farmerId,
      location: farmerData.location,
      village: farmerData.village || "Narsapur",
      farmArea: farmerData.farmArea || 4.0,
      crops: farmerData.crops || ["Tomatoes", "Okra"],
      coordinates: farmerData.coordinates || [17.8714, 78.1108],
      verified: true,
      rating: 5.0,
      todaySales: 0,
      availableStockKg: 0,
      activeCropsCount: (farmerData.crops || []).length || 2,
      pendingOrdersCount: 0,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("k2k_session_user", JSON.stringify(user));
    }
    setCurrentUser(user);
    setActiveRole("farmer");
    return user;
  };

  const handleSetRole = (role: Role) => {
    setActiveRole(role);
    if (role === "home") {
      // Return to landing page
    } else {
      const appRole = roleToAppRole(role);
      quickRoleLogin(appRole).catch(() => {});
    }
  };

  const value = useMemo<FarmContextValue>(
    () => ({
      activeRole,
      setActiveRole: handleSetRole,
      currentUser,
      loginWithPhone,
      loginWithOAuth,
      quickRoleLogin,
      logout,
      rolePermissions,
      isRoleAllowed,
      updateRolePermission,
      registerFarmerUser,
      listings,
      orders,
      cart,
      batches,
      inventorySummary,
      auditLogs,
      activeDeliveries,
      platformStats,
      refreshData: fetchData,
      refreshInventory,
      refreshAuditLogs,
      addToCart: (listing, qty = 1) =>
        setCart((items) => {
          const found = items.find((item) => item.id === listing.id);
          return found
            ? items.map((item) =>
                item.id === listing.id
                  ? { ...item, cartQuantity: item.cartQuantity + qty }
                  : item,
              )
            : [...items, { ...listing, cartQuantity: qty }];
        }),
      updateCartQuantity: (id, qty) =>
        setCart((items) =>
          qty <= 0
            ? items.filter((it) => it.id !== id)
            : items.map((it) => (it.id === id ? { ...it, cartQuantity: qty } : it)),
        ),
      removeFromCart: (id) => setCart((items) => items.filter((item) => item.id !== id)),
      clearCart: () => setCart([]),
      updateOrder: async (id, status) => {
        setOrders((items) =>
          items.map((order) => (order.id === id ? { ...order, status } : order)),
        );
        try {
          await api.orders.updateStatus(id, status);
          refreshAuditLogs();
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
            refreshInventory();
            refreshAuditLogs();
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
      updateListingQuantity: async (id: string, newQuantity: number) => {
        try {
          // You could make an api call here if `api.listings.update` exists,
          // for now we'll just update the local state since we don't have the API endpoint handy.
          setListings((items) =>
            items.map((item) =>
              item.id === id ? { ...item, availableQuantity: newQuantity } : item
            )
          );
        } catch (err) {
          console.error("Failed to update listing quantity:", err);
        }
      },
      placeOrder: async (payload: CreateOrderPayload) => {
        const res = await api.orders.create(payload);
        if (res?.order) {
          setOrders((items) => [res.order, ...items]);
          setCart([]);
          fetchData();
          return res.order;
        }
        throw new Error("Failed to create order on backend");
      },
    }),
    [
      activeRole,
      currentUser,
      rolePermissions,
      listings,
      orders,
      cart,
      batches,
      inventorySummary,
      auditLogs,
      activeDeliveries,
      platformStats,
    ],
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarmConnect() {
  const value = useContext(FarmContext);
  if (!value) throw new Error("useFarmConnect must be used within FarmConnectProvider");
  return value;
}
