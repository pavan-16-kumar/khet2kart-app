/**
 * Khet2Kart API Client
 * Multi-role platform client supporting Farmer, Customer, Store Manager, Delivery Partner, and Admin
 */

const API_BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:5000";

import { supabase } from "./supabase";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (typeof window !== "undefined") {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        await supabase.auth.signOut();
        localStorage.removeItem("k2k_session_user");
        window.dispatchEvent(new Event("k2k:auth:expired"));
      }
    }
    const errorMsg =
      data?.error || data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export type AppRole = "FARMER" | "CUSTOMER" | "DELIVERY_PARTNER" | "STORE_MANAGER" | "ADMIN";

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: AppRole;
  farmerId?: string;
  hubId?: string;
  hubName?: string;
  driverId?: string;
  vehicle?: string;
  location?: string;
  village?: string;
  address?: string;
  farmArea?: number;
  crops?: string[];
  coordinates?: [number, number];
  verified?: boolean;
  rating?: number;
  todaySales?: number;
  availableStockKg?: number;
  activeCropsCount?: number;
  pendingOrdersCount?: number;
  todayDeliveries?: number;
  todayCompleted?: number;
  todayPending?: number;
  loyaltyPoints?: number;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

export interface AuthResponse {
  success: boolean;
  verificationToken: string;
  message: string;
  role: AppRole;
  user: UserProfile;
}

export interface VerifyOtpResponse extends AuthResponse {}

export interface FarmerRegistrationPayload {
  name: string;
  phone: string;
  state: string;
  district: string;
  village?: string;
  farmArea: number;
  mainCrops: string;
  yearsFarming?: number;
  coordinates: [number, number];
  verificationToken: string;
}

export interface FarmerRegistrationResponse {
  success: boolean;
  message: string;
  farmer: {
    id: string;
    farmerId: string;
    name: string;
    phone: string;
    district: string;
    state: string;
    verified: boolean;
  };
}

export interface ApiListing {
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
  imageUrl?: string;
  location: string;
}

export interface CropListingPayload {
  cropName: string;
  variety: string;
  category: "Vegetables" | "Fruits" | "Grains";
  grade: string;
  availableQuantity: number;
  pricePerKg: number;
  harvestDate: string;
  farmerId?: string;
  farmerName?: string;
  imageUrl?: string;
  location?: string;
}

export interface OrderItem {
  listingId: string;
  cropName: string;
  quantity: number;
  pricePerKg: number;
}

export interface CreateOrderPayload {
  buyer: string;
  deliveryAddress: string;
  paymentMethod: "UPI" | "COD";
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  totalAmount: number;
  farmerId?: string;
}

export interface ApiOrder {
  id: string;
  orderId: string;
  customerId: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  totalAmount: number;
  subtotal?: number;
  delivery?: number;
  status: "PENDING" | "FARMER_ACCEPTED" | "IN_TRANSIT" | "DELIVERED";
  paymentMethod: string;
  buyer: string;
  deliveryAddress?: string;
  items?: OrderItem[];
  hubId?: string;
  hubName?: string;
  createdAt?: string;
}

export interface InventoryBatch {
  batchId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  quantityKg: number;
  grade: string;
  harvestDate: string;
  ageDays: number;
  shelfLifeDays: number;
  hubId: string;
  status: "FRESH" | "SELL_SOON" | "PRIORITY" | "CRITICAL";
  pricePerKg: number;
  temperature: string;
}

export interface InventorySummary {
  totalStockKg: number;
  freshStockKg: number;
  lowStockItems: number;
  expiringSoonKg: number;
  expiringCount: number;
  damagedKg: number;
  wastageKg: number;
  batchesCount: number;
}

export interface InventoryMovement {
  id: string;
  timestamp: string;
  batchId: string;
  cropName: string;
  actor: string;
  action: string;
  quantityChange: number;
  previousBalance: number;
  newBalance: number;
  reference: string;
}

export interface Hub {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  coverageRadiusKm: number;
  capacityKg: number;
  currentStockKg: number;
  status: string;
  manager: string;
  availableCrops: string[];
}

export interface PickingTaskItem {
  cropName: string;
  qtyKg: number;
  batchId: string;
  picked: boolean;
}

export interface PickingTask {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: PickingTaskItem[];
  totalWeightKg: number;
  status: "PENDING_PICK" | "PICKING" | "QUALITY_CHECK" | "PACKED" | "READY_FOR_DELIVERY";
  assignedDriver: string;
  hubId: string;
  createdAt?: string;
}

export interface IncomingShipment {
  id: string;
  farmer: string;
  farmerId: string;
  crop: string;
  expectedKg: number;
  actualKg: number;
  acceptedKg: number;
  rejectedKg: number;
  grade: string;
  freshness: string;
  damagePct: number;
  temperature: string;
  status: "PENDING_QC" | "APPROVED" | "REJECTED";
  hubId: string;
  eta: string;
}

export interface DriverDelivery {
  id: string;
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  hubName: string;
  hubAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsSummary: string;
  pickupDistance: string;
  dropoffDistance: string;
  currentDriverLat: number;
  currentDriverLng: number;
  etaMinutes: number;
  status: "ACCEPTED" | "PICKED_UP_FROM_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  role: string;
  actor: string;
  action: string;
  details: string;
}

export interface AdminOverview {
  summary: {
    farmersCount: number;
    customersCount: number;
    ordersCount: number;
    activeHubsCount: number;
    activeDriversCount: number;
    todaySales: string;
  };
  liveOperations: {
    completed: number;
    processing: number;
    outForDelivery: number;
    delayed: number;
  };
  inventoryAlerts: {
    expiringSoonBatches: number;
    lowStockProducts: number;
    qualityIssuesReported: number;
    hubsNearCapacity: number;
  };
}

export interface OrderTrace {
  order: ApiOrder;
  traceTimeline: {
    stage: string;
    actor: string;
    timestamp: string;
    details: string;
    status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  }[];
}

export interface ApiTransporterTask {
  id: number;
  status: "Pending Pickup" | "In Transit" | "Delivered";
  crop: string;
  quantity: string;
  from: string;
  to: string;
  distance: string;
}

export interface ApiHubShipment {
  id: string;
  farmer: string;
  crop: string;
  qty: string;
  eta: string;
  gradeStatus: "PENDING" | "GRADE A APPROVED";
}

export interface ApiAdminUser {
  id: string;
  name: string;
  role?: string;
  type?: string;
  location: string;
  status?: string;
}

export interface ApiPlatformStats {
  totalHarvestSaved: string;
  extraFarmerIncome: string;
  activeFarmers: string;
  avgTurnaroundTime: string;
  gmv?: string;
  systemHealth?: string;
}

export interface RolePermissionConfig {
  role: AppRole;
  name: string;
  enabled: boolean;
  adminApproved: boolean;
  description: string;
  permissions: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface OAuthLoginPayload {
  provider: "google" | "agristack" | "demo_oauth";
  role: AppRole;
  email: string;
  name: string;
  avatar?: string;
  token?: string;
}

export const api = {
  // Auth & Roles
  auth: {
    register: (payload: { email: string; password: string; name: string; role: AppRole; phone?: string }) =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    sendOtp: (phone: string) =>
      request<SendOtpResponse>("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, otp: string) =>
      request<VerifyOtpResponse>("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      }),
    oauthLogin: (payload: OAuthLoginPayload) =>
      request<VerifyOtpResponse>("/api/auth/oauth", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getPermissions: () =>
      request<{ success: boolean; permissions: Record<AppRole, RolePermissionConfig> }>(
        "/api/auth/permissions",
      ),
    quickLogin: (role: AppRole) =>
      request<VerifyOtpResponse>("/api/auth/quick-role-login", {
        method: "POST",
        body: JSON.stringify({ role }),
      }),
    getMe: (token?: string, role?: string, phone?: string) => {
      const qs = new URLSearchParams();
      if (role) qs.set("role", role);
      if (phone) qs.set("phone", phone);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return request<{ success: boolean; user: UserProfile; role: AppRole }>(
        `/api/auth/me${qs.toString() ? `?${qs.toString()}` : ""}`,
        { headers },
      );
    },
    registerFarmer: (payload: FarmerRegistrationPayload) =>
      request<FarmerRegistrationResponse>("/api/farmers/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getFarmers: () => request<{ success: boolean; farmers: unknown[] }>("/api/farmers"),
  },

  // Crop Listings
  listings: {
    getAll: (params?: { query?: string; category?: string; grade?: string; farmerId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.set("query", params.query);
      if (params?.category && params.category !== "All")
        searchParams.set("category", params.category);
      if (params?.grade && params.grade !== "All") searchParams.set("grade", params.grade);
      if (params?.farmerId) searchParams.set("farmerId", params.farmerId);
      const qs = searchParams.toString();
      return request<{ success: boolean; listings: ApiListing[] }>(
        `/api/listings${qs ? `?${qs}` : ""}`,
      );
    },
    create: (payload: CropListingPayload) =>
      request<{ success: boolean; listing: ApiListing }>("/api/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Orders
  orders: {
    getAll: (farmerId?: string) => {
      const qs = farmerId ? `?farmerId=${encodeURIComponent(farmerId)}` : "";
      return request<{ success: boolean; orders: ApiOrder[] }>(`/api/orders${qs}`);
    },
    create: (payload: CreateOrderPayload) =>
      request<{ success: boolean; order: ApiOrder; message: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateStatus: (
      id: string,
      status: "PENDING" | "FARMER_ACCEPTED" | "IN_TRANSIT" | "DELIVERED",
    ) =>
      request<{ success: boolean; order: ApiOrder; message: string }>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Batch Inventory & Ledger
  inventory: {
    getBatches: (params?: { crop?: string; hubId?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.crop) qs.set("crop", params.crop);
      if (params?.hubId) qs.set("hubId", params.hubId);
      if (params?.status) qs.set("status", params.status);
      return request<{ success: boolean; count: number; batches: InventoryBatch[] }>(
        `/api/inventory/batches${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
    },
    getSummary: () =>
      request<{ success: boolean; summary: InventorySummary }>("/api/inventory/summary"),
    getLedger: () =>
      request<{ success: boolean; count: number; ledger: InventoryMovement[] }>(
        "/api/inventory/ledger",
      ),
    recordWastage: (payload: { batchId: string; cropName: string; wastageKg: number; reason: string }) =>
      request<{ success: boolean; movement: InventoryMovement }>("/api/inventory/record-wastage", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  // Hubs & Auto Hub Routing
  hubs: {
    getAll: () => request<{ success: boolean; hubs: Hub[] }>("/api/hubs"),
    autoSelect: (payload: {
      customerAddress: string;
      coordinates?: [number, number];
      items: OrderItem[];
    }) =>
      request<{
        success: boolean;
        selectedHub: Hub | null;
        distanceKm: number;
        etaMinutes: number;
        allAvailable: boolean;
        allHubOptions: { hub: Hub; distanceKm: number; etaMinutes: number; canFulfillAll: boolean; missingItems: string[] }[];
      }>("/api/hubs/auto-select", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getWorkload: (hubId: string) =>
      request<{
        success: boolean;
        workload: {
          hubId: string;
          todayOrders: number;
          pendingPicking: number;
          readyForDelivery: number;
          lowStockAlerts: number;
          expiringSoonAlerts: number;
          wastageKg: number;
          pickingQueue: PickingTask[];
          incomingShipments: IncomingShipment[];
          activeDeliveries: DriverDelivery[];
        };
      }>(`/api/hubs/${hubId}/workload`),
    receiveShipment: (
      shipmentId: string,
      payload: {
        expectedKg: number;
        actualKg: number;
        acceptedKg: number;
        rejectedKg: number;
        grade: "Grade A" | "Grade B" | "Grade C";
        freshness: "Excellent" | "Good" | "Fair" | "Substandard";
        damagePct: number;
        temperature: string;
        decision: "APPROVE" | "REJECT" | "PARTIAL_ACCEPT";
      },
    ) =>
      request<{ success: boolean; shipment: IncomingShipment; message: string }>(
        `/api/hubs/incoming/${shipmentId}/receive`,
        {
          method: "POST",
          body: JSON.stringify({ shipmentId, ...payload }),
        },
      ),
    updatePickPack: (
      orderId: string,
      payload: {
        pickTaskId: string;
        stage: "START_PICKING" | "QUALITY_CHECK" | "PACK_ORDER" | "READY_FOR_DELIVERY";
        notes?: string;
      },
    ) =>
      request<{ success: boolean; task: PickingTask; message: string }>(
        `/api/hubs/orders/${orderId}/pick-pack`,
        {
          method: "PATCH",
          body: JSON.stringify({ orderId, ...payload }),
        },
      ),
  },

  // Logistics & Delivery Partner
  logistics: {
    getTasks: () =>
      request<{ success: boolean; tasks: ApiTransporterTask[] }>("/api/logistics/tasks"),
    updateTask: (id: number, status: string) =>
      request<{ success: boolean; task: ApiTransporterTask }>(`/api/logistics/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    getDriverTasks: (driverId = "DP-HYD-042") =>
      request<{ success: boolean; driverId: string; count: number; deliveries: DriverDelivery[] }>(
        `/api/logistics/driver/tasks?driverId=${encodeURIComponent(driverId)}`,
      ),
    pingLocation: (payload: {
      driverId: string;
      lat: number;
      lng: number;
      speedKmh?: number;
      heading?: number;
      etaMinutes?: number;
    }) =>
      request<{ success: boolean; driverId: string; lat: number; lng: number }>(
        "/api/logistics/driver/location",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      ),
    updateDeliveryStatus: (
      deliveryId: string,
      payload: {
        status: "ACCEPTED" | "PICKED_UP_FROM_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED";
        proofOtp?: string | undefined;
        driverName?: string | undefined;
      },
    ) =>
      request<{ success: boolean; delivery: DriverDelivery; message: string }>(
        `/api/logistics/driver/deliveries/${deliveryId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      ),
    getHubShipments: () =>
      request<{ success: boolean; shipments: ApiHubShipment[] }>("/api/logistics/hub/shipments"),
    approveShipment: (id: string) =>
      request<{ success: boolean; shipment: ApiHubShipment }>(
        `/api/logistics/hub/shipments/${id}/approve`,
        {
          method: "POST",
        },
      ),
    sealBatch: (route?: string, description?: string) =>
      request<{
        success: boolean;
        batch: { id: string; route: string; description: string; sealedAt: string };
      }>("/api/logistics/hub/batches", {
        method: "POST",
        body: JSON.stringify({ route, description }),
      }),
  },

  // Platform & Admin Control Tower
  admin: {
    getOverview: () =>
      request<{
        success: boolean;
        summary: AdminOverview["summary"];
        liveOperations: AdminOverview["liveOperations"];
        inventoryAlerts: AdminOverview["inventoryAlerts"];
      }>("/api/admin/overview"),
    getOrderTrace: (orderId: string) =>
      request<{ success: boolean; order: ApiOrder; traceTimeline: OrderTrace["traceTimeline"] }>(
        `/api/admin/orders/${orderId}/trace`,
      ),
    getAuditLogs: (limit = 50) =>
      request<{ success: boolean; count: number; auditLogs: AuditLog[] }>(
        `/api/admin/audit-logs?limit=${limit}`,
      ),
    getUsers: (role?: string) =>
      request<{ success: boolean; count: number; users: UserProfile[] }>(
        `/api/admin/users${role ? `?role=${encodeURIComponent(role)}` : ""}`,
      ),
    getRolePermissions: () =>
      request<{ success: boolean; permissions: Record<AppRole, RolePermissionConfig> }>(
        "/api/admin/permissions",
      ),
    updateRolePermission: (
      role: AppRole,
      payload: { enabled: boolean; adminApproved?: boolean; permissions?: string[] },
    ) =>
      request<{
        success: boolean;
        role: AppRole;
        permission: RolePermissionConfig;
        message: string;
      }>(`/api/admin/permissions/${role}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  },

  platform: {
    getStats: () => request<{ success: boolean; stats: ApiPlatformStats }>("/api/platform/stats"),
    getAdminUsers: () =>
      request<{ success: boolean; users: ApiAdminUser[] }>("/api/platform/admin/users"),
    verifyUser: (id: string) =>
      request<{ success: boolean; verifiedList: string[] }>(
        `/api/platform/admin/users/${id}/verify`,
        {
          method: "PATCH",
        },
      ),
    resolveDispute: () =>
      request<{ success: boolean; result: { resolved: boolean } }>(
        "/api/platform/admin/disputes/resolve",
        {
          method: "POST",
        },
      ),
  },
};
