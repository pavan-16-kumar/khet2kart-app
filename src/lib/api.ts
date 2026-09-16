/**
 * Khet2Kart API Client
 * Connects frontend views to backend endpoints with validation and error formatting.
 */

const API_BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:5000";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  verificationToken: string;
  message: string;
}

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
    state: string;
    district: string;
    coordinates: [number, number];
  };
}

export interface CropListingPayload {
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
  imageUrl: string;
  location: string;
}

export interface CreateOrderPayload {
  buyer: string;
  deliveryAddress: string;
  paymentMethod: "UPI" | "COD";
  items: Array<{
    listingId: string;
    cropName: string;
    quantity: number;
    pricePerKg: number;
  }>;
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
  status: "PENDING" | "FARMER_ACCEPTED" | "IN_TRANSIT" | "DELIVERED";
  paymentMethod: string;
  buyer: string;
  deliveryAddress?: string;
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
  type: string;
  location: string;
  status: string;
}

export interface ApiPlatformStats {
  totalHarvestSaved: string;
  extraFarmerIncome: string;
  activeFarmers: string;
  avgTurnaroundTime: string;
  gmv?: string;
  systemHealth?: string;
}

export const api = {
  // Auth & Farmer Registration
  auth: {
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

  // Logistics & Hub
  logistics: {
    getTasks: () =>
      request<{ success: boolean; tasks: ApiTransporterTask[] }>("/api/logistics/tasks"),
    updateTask: (id: number, status: string) =>
      request<{ success: boolean; task: ApiTransporterTask }>(`/api/logistics/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
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

  // Platform KPIs & Admin
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
