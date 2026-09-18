import { useState, useEffect } from "react";
import { useFarmConnect } from "../FarmContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  api,
  type AdminOverview,
  type AuditLog,
  type UserProfile,
  type OrderTrace,
  type AppRole,
} from "@/lib/api";
import {
  Shield,
  Users,
  Store,
  Truck,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  History,
  Lock,
} from "lucide-react";

export function AdminControlTower() {
  const { orders, rolePermissions, updateRolePermission } = useFarmConnect();
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "users" | "logistics" | "audit" | "permissions"
  >("overview");
  const [permissionNotice, setPermissionNotice] = useState<string>("");

  const [overview, setOverview] = useState<AdminOverview>({
    summary: {
      farmersCount: 2480,
      customersCount: 18420,
      ordersCount: 1284,
      activeHubsCount: 24,
      activeDriversCount: 182,
      todaySales: "₹4.82L",
    },
    liveOperations: {
      completed: 820,
      processing: 210,
      outForDelivery: 124,
      delayed: 18,
    },
    inventoryAlerts: {
      expiringSoonBatches: 12,
      lowStockProducts: 7,
      qualityIssuesReported: 4,
      hubsNearCapacity: 2,
    },
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [selectedOrderTrace, setSelectedOrderTrace] = useState<OrderTrace | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, auditRes, usersRes] = await Promise.allSettled([
        api.admin.getOverview(),
        api.admin.getAuditLogs(50),
        api.admin.getUsers(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        setOverview({
          summary: overviewRes.value.summary,
          liveOperations: overviewRes.value.liveOperations,
          inventoryAlerts: overviewRes.value.inventoryAlerts,
        });
      }

      if (auditRes.status === "fulfilled" && auditRes.value?.auditLogs) {
        setAuditLogs(auditRes.value.auditLogs);
      }

      if (usersRes.status === "fulfilled" && usersRes.value?.users) {
        setUsers(usersRes.value.users);
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleInspectOrder = async (orderId: string) => {
    setTraceLoading(true);
    try {
      const res = await api.admin.getOrderTrace(orderId);
      if (res?.traceTimeline) {
        setSelectedOrderTrace(res);
      }
    } catch (err) {
      console.error("Failed to get order trace:", err);
    } finally {
      setTraceLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    return (
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.buyer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.cropName.toLowerCase().includes(orderSearch.toLowerCase())
    );
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter === "ALL") return true;
    return u.role === userRoleFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-400/30">
              <Shield className="size-8" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-black sm:text-3xl">
                  Khet2Kart Admin Control Tower
                </h1>
                <Badge className="bg-rose-500/30 text-rose-300 border-rose-400/30">
                  <Lock className="mr-1 size-3" /> Full Governance
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                End-to-End Traceability · Cross-Hub Network Telemetry · Audit Ledger & Security Policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdminData}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Control Tower
            </Button>
          </div>
        </div>

        {/* Top 6 Network Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Registered Farmers</span>
            <p className="mt-1 text-2xl font-black">{overview.summary.farmersCount.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400">GPS geo-mapped</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Active Customers</span>
            <p className="mt-1 text-2xl font-black">{overview.summary.customersCount.toLocaleString()}</p>
            <span className="text-[10px] text-blue-400">Urban buyers</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Total Orders</span>
            <p className="mt-1 text-2xl font-black">{overview.summary.ordersCount.toLocaleString()}</p>
            <span className="text-[10px] text-purple-400">99.8% fulfilled</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Active Fresh Hubs</span>
            <p className="mt-1 text-2xl font-black">{overview.summary.activeHubsCount}</p>
            <span className="text-[10px] text-amber-400">Cold chain verified</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Active Delivery Fleet</span>
            <p className="mt-1 text-2xl font-black">{overview.summary.activeDriversCount}</p>
            <span className="text-[10px] text-teal-400">On-duty EV partners</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-slate-300">Today's Sales</span>
            <p className="mt-1 text-2xl font-black text-harvest">{overview.summary.todaySales}</p>
            <span className="text-[10px] text-emerald-400">Real-time GMV</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-3">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
          className="gap-2"
        >
          <TrendingUp className="size-4" /> Operations & Alerts
        </Button>
        <Button
          variant={activeTab === "orders" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("orders")}
          className="gap-2"
        >
          <ShoppingBag className="size-4" /> Traceable Orders ({orders.length})
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("users")}
          className="gap-2"
        >
          <Users className="size-4" /> User Directory ({users.length})
        </Button>
        <Button
          variant={activeTab === "logistics" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("logistics")}
          className="gap-2"
        >
          <Truck className="size-4" /> Live Logistics Map
        </Button>
        <Button
          variant={activeTab === "audit" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("audit")}
          className="gap-2"
        >
          <History className="size-4" /> 🚨 Audit Logs ({auditLogs.length})
        </Button>
        <Button
          variant={activeTab === "permissions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("permissions")}
          className="gap-2 font-bold"
        >
          <Lock className="size-4" /> 🛡️ Role Permissions & RBAC
        </Button>
      </div>

      {/* TAB 1: OPERATIONS & ALERTS */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Live Operations */}
            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-primary" /> Live Daily Operations
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time status of orders progressing across India's supply network.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-emerald-800">
                  <span className="font-semibold text-xs flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Orders Completed
                  </span>
                  <span className="font-mono font-bold text-lg">{overview.liveOperations.completed}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 p-3 text-amber-800">
                  <span className="font-semibold text-xs flex items-center gap-2">
                    <Clock className="size-4 text-amber-600" />
                    Hub Processing & Picking
                  </span>
                  <span className="font-mono font-bold text-lg">{overview.liveOperations.processing}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-blue-500/10 p-3 text-blue-800">
                  <span className="font-semibold text-xs flex items-center gap-2">
                    <Truck className="size-4 text-blue-600" />
                    Out for Delivery (Google Routes)
                  </span>
                  <span className="font-mono font-bold text-lg">{overview.liveOperations.outForDelivery}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 p-3 text-rose-800">
                  <span className="font-semibold text-xs flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-600" />
                    Delayed / Traffic Exceptions
                  </span>
                  <span className="font-mono font-bold text-lg">{overview.liveOperations.delayed}</span>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-600" /> Critical Inventory & Storage Alerts
                </CardTitle>
                <CardDescription className="text-xs">
                  Proactive threshold alerts for perishable cold storage nodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-700">⚠️ {overview.inventoryAlerts.expiringSoonBatches} Batches Expiring Soon</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Automated flash discounts initiated on customer marketplace</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">Review Batches</Button>
                </div>

                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-orange-700">⚠️ {overview.inventoryAlerts.lowStockProducts} Products Low in Stock</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Automated collection alerts dispatched to registered Medak farmers</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">Dispatch Transporters</Button>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-700">⚠️ {overview.inventoryAlerts.qualityIssuesReported} Quality Issues Flagged</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Rejected lots segregated for farm compensation review</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">Audit Culls</Button>
                </div>

                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-700">⚠️ {overview.inventoryAlerts.hubsNearCapacity} Hubs Near 85% Capacity</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Hub B & Hub C approaching cold storage maximum</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7">Reroute Influx</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT & TRACEABILITY */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">End-to-End Order Provenance Management</h2>
              <p className="text-xs text-muted-foreground">
                Click any order to inspect complete lifecycle traceability: Farmer Lot &rarr; Hub QC &rarr; Reservation &rarr; Picking &rarr; Driver &rarr; Handover.
              </p>
            </div>

            <div className="w-72">
              <Input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search Order ID or Buyer..."
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Produce Items</th>
                  <th className="p-3.5">Assigned Hub</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{o.orderId}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-foreground">{o.buyer}</span>
                      <span className="block text-[11px] text-muted-foreground truncate max-w-xs">
                        {o.deliveryAddress}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">{o.cropName}</td>
                    <td className="p-3.5 font-mono text-muted-foreground">Hub A (Banjara Hills)</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">₹{o.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <Badge variant="outline">{o.status}</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-primary font-bold"
                        onClick={() => handleInspectOrder(o.orderId)}
                      >
                        Inspect Trace <ChevronRight className="ml-1 size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER DIRECTORY */}
      {activeTab === "users" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Role-Separated User Directory</h2>
              <p className="text-xs text-muted-foreground">
                Protected user data: Sensitive KYC and Aadhaar records masked per OWASP security principles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmers</option>
                <option value="CUSTOMER">Customers</option>
                <option value="STORE_MANAGER">Store Managers</option>
                <option value="DELIVERY_PARTNER">Delivery Partners</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="p-4 border-border/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{u.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {u.role}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Phone: +91 {u.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Location: <b>{u.location || u.address || "Hyderabad, Telangana"}</b>
                </p>
                {u.farmerId && (
                  <p className="text-[11px] font-mono text-emerald-600 mt-1">
                    Farmer ID: {u.farmerId} ({u.farmArea} Acres)
                  </p>
                )}
                {u.driverId && (
                  <p className="text-[11px] font-mono text-amber-600 mt-1">
                    Driver ID: {u.driverId} · {u.vehicle}
                  </p>
                )}
                {u.hubId && (
                  <p className="text-[11px] font-mono text-purple-600 mt-1">
                    Assigned Hub: {u.hubName}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE LOGISTICS MAP DIAGRAM */}
      {activeTab === "logistics" && (
        <div className="mt-6 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-bold">Network Logistics & Fleet Route Topology</h2>
                <p className="text-xs text-muted-foreground">
                  Hierarchical flow: Farms &rarr; Collection Transport &rarr; Hubs &rarr; Last-Mile Delivery Partners &rarr; Customers.
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white">Google Routes Connected</Badge>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3 text-xs font-mono">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <span className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <Store className="size-4" /> Hub A · Hyderabad Central
                </span>
                <p className="mt-2 text-muted-foreground">Road 12, Banjara Hills · Lat 17.4123, Lng 78.4487</p>
                <div className="mt-3 space-y-1.5 border-t pt-2">
                  <p className="text-foreground font-semibold">Assigned Fleet:</p>
                  <p className="text-emerald-700">🚚 Driver Ravi Kumar (DP-HYD-042) &rarr; Jubilee Hills Cluster</p>
                  <p className="text-emerald-700">🚚 Driver Naresh G (DP-HYD-045) &rarr; Somajiguda Cluster</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <span className="font-bold text-blue-700 text-sm flex items-center gap-1.5">
                  <Store className="size-4" /> Hub B · Cyberabad West
                </span>
                <p className="mt-2 text-muted-foreground">HITEC City Phase 2 · Lat 17.4485, Lng 78.3758</p>
                <div className="mt-3 space-y-1.5 border-t pt-2">
                  <p className="text-foreground font-semibold">Assigned Fleet:</p>
                  <p className="text-blue-700">🚚 Driver Santosh M (DP-HYD-088) &rarr; Madhapur Cluster</p>
                  <p className="text-blue-700">🚚 Driver Praveen B (DP-HYD-091) &rarr; Kondapur Cluster</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-4">
                <span className="font-bold text-purple-700 text-sm flex items-center gap-1.5">
                  <Store className="size-4" /> Hub C · Secunderabad North
                </span>
                <p className="mt-2 text-muted-foreground">Karkhana Main Road · Lat 17.4399, Lng 78.4983</p>
                <div className="mt-3 space-y-1.5 border-t pt-2">
                  <p className="text-foreground font-semibold">Assigned Fleet:</p>
                  <p className="text-purple-700">🚚 Driver Ajay V (DP-HYD-112) &rarr; Marredpally Cluster</p>
                  <p className="text-purple-700">🚚 Driver Kiran S (DP-HYD-114) &rarr; Begumpet Cluster</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: 🚨 AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Immutable System Audit Log Ledger</h2>
              <p className="text-xs text-muted-foreground">
                Append-only log recording actor identities, precise timestamps, actions, and resource changes.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor Role</th>
                  <th className="p-3.5">Identity</th>
                  <th className="p-3.5">Action Executed</th>
                  <th className="p-3.5">Log Details & Event Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="p-3.5 text-muted-foreground">{log.timestamp}</td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={
                          log.role === "Store Manager"
                            ? "text-purple-600 border-purple-500/30"
                            : log.role === "Delivery Partner"
                            ? "text-amber-600 border-amber-500/30"
                            : log.role === "Farmer"
                            ? "text-emerald-600 border-emerald-500/30"
                            : log.role === "Admin"
                            ? "text-rose-600 border-rose-500/30"
                            : "text-blue-600 border-blue-500/30"
                        }
                      >
                        {log.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-sans font-semibold">{log.actor}</td>
                    <td className="p-3.5 font-sans font-bold text-foreground">{log.action}</td>
                    <td className="p-3.5 text-muted-foreground text-xs font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: 🛡️ ROLE ACCESS & PERMISSIONS GOVERNANCE */}
      {activeTab === "permissions" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Lock className="size-5 text-rose-600" />
                Admin Role-Based Access Control (RBAC) Governance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Grant or restrict access before users select roles in the Sign-In modal. Changes immediately sync to browser storage and backend.
              </p>
            </div>
            {permissionNotice && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 p-2 text-xs">
                <CheckCircle2 className="size-3.5 mr-1" /> {permissionNotice}
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(rolePermissions) as AppRole[]).map((roleKey) => {
              const perm = rolePermissions[roleKey];
              const isEnabled = perm?.enabled && perm?.adminApproved !== false;
              return (
                <Card
                  key={roleKey}
                  className={`border-2 transition-all ${
                    isEnabled ? "border-emerald-500/30 bg-card" : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        {roleKey === "FARMER" && "👨🌾 Farmer Portal"}
                        {roleKey === "CUSTOMER" && "🛒 Customer Marketplace"}
                        {roleKey === "DELIVERY_PARTNER" && "🚚 Delivery Partner"}
                        {roleKey === "STORE_MANAGER" && "🏪 Store / Hub Manager"}
                        {roleKey === "ADMIN" && "🛡️ Admin Control Tower"}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          isEnabled
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                        }`}
                      >
                        {isEnabled ? "ACCESS GRANTED" : "ACCESS LOCKED"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{perm?.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                        Capabilities Granted:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {perm?.permissions?.map((cap) => (
                          <span
                            key={cap}
                            className="rounded-md bg-background px-2 py-0.5 text-[10px] font-mono border text-foreground"
                          >
                            ✓ {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs font-semibold text-muted-foreground">Admin Status:</span>
                      <Button
                        size="sm"
                        variant={isEnabled ? "destructive" : "default"}
                        onClick={async () => {
                          const nextState = !isEnabled;
                          await updateRolePermission(roleKey, nextState, perm?.permissions, nextState);
                          setPermissionNotice(
                            `Role ${roleKey} access ${nextState ? "GRANTED" : "RESTRICTED"} by Admin`,
                          );
                          setTimeout(() => setPermissionNotice(""), 4000);
                        }}
                        className="text-xs font-bold h-8 gap-1.5"
                      >
                        {isEnabled ? (
                          <>
                            <Lock className="size-3.5" /> Restrict Access
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5" /> Grant Permission
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Provenance Trace Modal */}
      {selectedOrderTrace && (
        <Dialog open={!!selectedOrderTrace} onOpenChange={() => setSelectedOrderTrace(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="size-5 text-emerald-600" />
                End-to-End Order Provenance Trace (#{selectedOrderTrace.order.orderId})
              </DialogTitle>
              <DialogDescription>
                Complete supply chain journey: Farmer Lot &rarr; Batch &rarr; Hub QC &rarr; Customer Cart &rarr; Picking &rarr; Packing &rarr; Driver &rarr; Delivery &rarr; Settlement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-bold">{selectedOrderTrace.order.buyer}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Paid:</span>
                  <p className="font-bold text-emerald-600">₹{selectedOrderTrace.order.totalAmount} ({selectedOrderTrace.order.paymentMethod})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fulfillment Hub:</span>
                  <p className="font-bold">Hub A · Hyderabad Central</p>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500/30 my-4">
                {selectedOrderTrace.traceTimeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[31px] grid size-5 place-items-center rounded-full text-[10px] font-bold text-white ${
                        step.status === "COMPLETED"
                          ? "bg-emerald-600"
                          : step.status === "IN_PROGRESS"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{step.stage}</h4>
                        <span className="font-mono text-[10px] text-muted-foreground">{step.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-primary font-semibold">{step.actor}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
