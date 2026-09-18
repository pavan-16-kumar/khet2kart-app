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
  type InventoryBatch,
  type IncomingShipment,
  type PickingTask,
  type InventoryMovement,
} from "@/lib/api";
import {
  Store,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPin,
  RefreshCw,
  Plus,
  Thermometer,
} from "lucide-react";

export function StoreManagerPortal() {
  const { currentUser, refreshAuditLogs } = useFarmConnect();
  const hubId = currentUser?.hubId || "HUB-HYD-01";
  const hubName = currentUser?.hubName || "Hyderabad Central Fresh Hub (Hub A)";

  const [activeTab, setActiveTab] = useState<"inventory" | "incoming" | "picking" | "movements">("inventory");

  // Data states
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [summary, setSummary] = useState({
    totalStockKg: 4820,
    freshStockKg: 4210,
    lowStockItems: 18,
    expiringSoonKg: 124,
    damagedKg: 12,
    wastageKg: 31,
  });
  const [pickingQueue, setPickingQueue] = useState<PickingTask[]>([]);
  const [incomingShipments, setIncomingShipments] = useState<IncomingShipment[]>([]);
  const [ledger, setLedger] = useState<InventoryMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // Incoming Stock Modal
  const [selectedShipment, setSelectedShipment] = useState<IncomingShipment | null>(null);
  const [expectedKg, setExpectedKg] = useState(200);
  const [actualKg, setActualKg] = useState(194);
  const [acceptedKg, setAcceptedKg] = useState(190);
  const [rejectedKg, setRejectedKg] = useState(4);
  const [qcGrade, setQcGrade] = useState<"Grade A" | "Grade B" | "Grade C">("Grade A");
  const [qcFreshness, setQcFreshness] = useState<"Excellent" | "Good" | "Fair" | "Substandard">("Good");
  const [qcDamagePct, setQcDamagePct] = useState(2.0);
  const [qcTemperature, setQcTemperature] = useState("18°C");

  // Wastage Modal
  const [wastageOpen, setWastageOpen] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState("");
  const [targetCropName, setTargetCropName] = useState("");
  const [wastageAmount, setWastageAmount] = useState("");
  const [wastageReason, setWastageReason] = useState("");

  const loadHubData = async () => {
    setLoading(true);
    try {
      const [batchesRes, summaryRes, workloadRes, ledgerRes] = await Promise.allSettled([
        api.inventory.getBatches({ hubId }),
        api.inventory.getSummary(),
        api.hubs.getWorkload(hubId),
        api.inventory.getLedger(),
      ]);

      if (batchesRes.status === "fulfilled" && batchesRes.value?.batches) {
        setBatches(batchesRes.value.batches);
      }
      if (summaryRes.status === "fulfilled" && summaryRes.value?.summary) {
        setSummary(summaryRes.value.summary);
      }
      if (workloadRes.status === "fulfilled" && workloadRes.value?.workload) {
        setPickingQueue(workloadRes.value.workload.pickingQueue || []);
        setIncomingShipments(workloadRes.value.workload.incomingShipments || []);
      }
      if (ledgerRes.status === "fulfilled" && ledgerRes.value?.ledger) {
        setLedger(ledgerRes.value.ledger);
      }
    } catch (e) {
      console.error("Failed to load store manager data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, [hubId]);

  const handleReceiveStockSubmit = async (decision: "APPROVE" | "REJECT" | "PARTIAL_ACCEPT") => {
    if (!selectedShipment) return;
    try {
      await api.hubs.receiveShipment(selectedShipment.id, {
        expectedKg,
        actualKg,
        acceptedKg: decision === "REJECT" ? 0 : acceptedKg,
        rejectedKg: decision === "REJECT" ? actualKg : rejectedKg,
        grade: qcGrade,
        freshness: qcFreshness,
        damagePct: qcDamagePct,
        temperature: qcTemperature,
        decision,
      });
      setSelectedShipment(null);
      loadHubData();
      refreshAuditLogs();
    } catch (err) {
      console.error("Failed to receive stock:", err);
    }
  };

  const handleAdvancePickTask = async (task: PickingTask, stage: "START_PICKING" | "QUALITY_CHECK" | "PACK_ORDER" | "READY_FOR_DELIVERY") => {
    try {
      await api.hubs.updatePickPack(task.orderId, {
        pickTaskId: task.id,
        stage,
      });
      loadHubData();
      refreshAuditLogs();
    } catch (err) {
      console.error("Failed to advance picking task:", err);
    }
  };

  const handleRecordWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBatchId || !wastageAmount || !wastageReason) return;
    try {
      await api.inventory.recordWastage({
        batchId: targetBatchId,
        cropName: targetCropName,
        wastageKg: parseFloat(wastageAmount),
        reason: wastageReason,
      });
      setWastageOpen(false);
      setWastageAmount("");
      setWastageReason("");
      loadHubData();
      refreshAuditLogs();
    } catch (err) {
      console.error("Failed to record wastage:", err);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FRESH":
        return <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">🟢 Fresh</Badge>;
      case "SELL_SOON":
        return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">🟡 Sell Soon</Badge>;
      case "PRIORITY":
        return <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">🟠 Priority</Badge>;
      case "CRITICAL":
        return <Badge className="bg-rose-500/20 text-rose-700 border-rose-500/30">🔴 Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/30">
              <Store className="size-8" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {hubName}
                </h1>
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30">
                  <CheckCircle2 className="mr-1 size-3" /> Active Fulfillment Node
                </Badge>
              </div>
              <p className="mt-1 text-xs text-purple-200/80">
                Store Manager: <span className="font-bold text-white">{currentUser?.name || "Suresh Varma"}</span> · Hub ID: {hubId} · Banjara Hills, Hyderabad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadHubData}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Hub
            </Button>
          </div>
        </div>

        {/* Top 6 Workload KPIs */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Today's Orders</span>
            <p className="mt-1 text-2xl font-extrabold">126</p>
            <span className="text-[10px] text-purple-300">Across 3 clusters</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Pending Picking</span>
            <p className="mt-1 text-2xl font-extrabold text-amber-300">
              {pickingQueue.filter((p) => p.status === "PENDING_PICK" || p.status === "PICKING").length || 18}
            </p>
            <span className="text-[10px] text-amber-200">Queue active</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Ready for Delivery</span>
            <p className="mt-1 text-2xl font-extrabold text-emerald-300">
              {pickingQueue.filter((p) => p.status === "READY_FOR_DELIVERY").length || 24}
            </p>
            <span className="text-[10px] text-emerald-200">Drivers staged</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Low Stock</span>
            <p className="mt-1 text-2xl font-extrabold text-orange-300">{summary.lowStockItems} Lots</p>
            <span className="text-[10px] text-orange-200">Reorder triggered</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Expiring Soon</span>
            <p className="mt-1 text-2xl font-extrabold text-rose-300">{summary.expiringSoonKg} kg</p>
            <span className="text-[10px] text-rose-200">Priority sale</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
            <span className="text-[11px] text-purple-200">Wastage / Culls</span>
            <p className="mt-1 text-2xl font-extrabold text-white/80">{summary.wastageKg} kg</p>
            <span className="text-[10px] text-purple-300">0.08% loss rate</span>
          </div>
        </div>

        {/* Hub Workload Map Diagram */}
        <div className="mt-6 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="size-4 text-emerald-400" />
              Hub Delivery Workload Radial Map
            </span>
            <Badge variant="outline" className="text-[10px] text-purple-200 border-white/20">
              Coverage: 8.0 km radius
            </Badge>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs font-mono">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>Cluster North · Jubilee Hills</span>
                <Badge variant="secondary" className="text-[10px]">2.1 km</Badge>
              </div>
              <p className="mt-1 text-white/80">48 Active Deliveries · 14 Drivers Assigned</p>
              <p className="text-[11px] text-white/50">Avg ETA: 16 mins</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="font-bold text-emerald-300 flex items-center justify-between">
                <span>Cluster Central · Banjara Hills</span>
                <Badge variant="secondary" className="text-[10px]">1.4 km</Badge>
              </div>
              <p className="mt-1 text-white/80">54 Active Deliveries · 18 Drivers Assigned</p>
              <p className="text-[11px] text-white/50">Avg ETA: 12 mins</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="font-bold text-blue-300 flex items-center justify-between">
                <span>Cluster West · Madhapur</span>
                <Badge variant="secondary" className="text-[10px]">4.8 km</Badge>
              </div>
              <p className="mt-1 text-white/80">24 Active Deliveries · 8 Drivers Assigned</p>
              <p className="text-[11px] text-white/50">Avg ETA: 22 mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="mt-8 flex items-center gap-2 border-b border-border/70 pb-3">
        <Button
          variant={activeTab === "inventory" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("inventory")}
          className="gap-2"
        >
          <Package className="size-4" /> Batch Inventory ({batches.length})
        </Button>
        <Button
          variant={activeTab === "incoming" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("incoming")}
          className="gap-2"
        >
          <Layers className="size-4" /> Incoming Stock & QC ({incomingShipments.length})
        </Button>
        <Button
          variant={activeTab === "picking" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("picking")}
          className="gap-2"
        >
          <CheckSquare className="size-4" /> Pick & Pack Queue ({pickingQueue.length})
        </Button>
        <Button
          variant={activeTab === "movements" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("movements")}
          className="gap-2"
        >
          <Clock className="size-4" /> Inventory Ledger ({ledger.length})
        </Button>
      </div>

      {/* TAB 1: COMPLETE INVENTORY PAGE */}
      {activeTab === "inventory" && (
        <div className="mt-6 space-y-6">
          {/* Metrics Header */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Total Stock</span>
              <p className="mt-1 text-2xl font-black text-foreground">{summary.totalStockKg} kg</p>
              <span className="text-[10px] text-muted-foreground">In active hub storage</span>
            </Card>
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Fresh Produce</span>
              <p className="mt-1 text-2xl font-black text-emerald-600">{summary.freshStockKg} kg</p>
              <span className="text-[10px] text-emerald-600 font-medium">Grade A Quality</span>
            </Card>
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Low Stock</span>
              <p className="mt-1 text-2xl font-black text-amber-600">{summary.lowStockItems} Lots</p>
              <span className="text-[10px] text-muted-foreground">&lt; 100 kg threshold</span>
            </Card>
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Expiring Soon</span>
              <p className="mt-1 text-2xl font-black text-orange-600">{summary.expiringSoonKg} kg</p>
              <span className="text-[10px] text-orange-600 font-medium">Discount / Promote</span>
            </Card>
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Damaged / Culls</span>
              <p className="mt-1 text-2xl font-black text-rose-600">{summary.damagedKg} kg</p>
              <span className="text-[10px] text-muted-foreground">Segregated</span>
            </Card>
            <Card className="p-3.5">
              <span className="text-xs text-muted-foreground">Recorded Wastage</span>
              <p className="mt-1 text-2xl font-black text-foreground">{summary.wastageKg} kg</p>
              <span className="text-[10px] text-muted-foreground">Ledger logged</span>
            </Card>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 max-w-md rounded-xl border bg-background px-3 py-1.5">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crop, batch ID (TB001), or farmer..."
                className="border-0 p-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                <option value="ALL">All Health Statuses</option>
                <option value="FRESH">🟢 Fresh</option>
                <option value="SELL_SOON">🟡 Sell Soon</option>
                <option value="PRIORITY">🟠 Priority</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstBatch = batches[0];
                  if (firstBatch) {
                    setTargetBatchId(firstBatch.batchId);
                    setTargetCropName(firstBatch.cropName);
                  }
                  setWastageOpen(true);
                }}
                className="text-xs"
              >
                <Trash2 className="mr-1 size-3.5 text-rose-600" /> Record Wastage
              </Button>
            </div>
          </div>

          {/* Traceable Batch Table */}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Crop</th>
                    <th className="p-3.5">Batch ID</th>
                    <th className="p-3.5">Farmer & Origin</th>
                    <th className="p-3.5">Available Qty</th>
                    <th className="p-3.5">Quality Grade</th>
                    <th className="p-3.5">Harvest Age</th>
                    <th className="p-3.5">Cold Storage Temp</th>
                    <th className="p-3.5">Health Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredBatches.map((b) => (
                    <tr key={b.batchId} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-bold text-foreground">
                        {b.cropName}
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          ₹{b.pricePerKg}/kg
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-primary">
                        {b.batchId}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold">{b.farmerName}</span>
                        <span className="block text-[11px] text-muted-foreground font-mono">
                          {b.farmerId}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-foreground">
                        {b.quantityKg} kg
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="font-semibold">
                          {b.grade}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        {b.ageDays} day{b.ageDays !== 1 ? "s" : ""}
                        <span className="block text-[10px] text-muted-foreground">
                          Max: {b.shelfLifeDays} days
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Thermometer className="size-3 text-blue-500" />
                          {b.temperature}
                        </span>
                      </td>
                      <td className="p-3.5">{getStatusBadge(b.status)}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            setTargetBatchId(b.batchId);
                            setTargetCropName(b.cropName);
                            setWastageOpen(true);
                          }}
                        >
                          Cull
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING STOCK & QUALITY CHECK */}
      {activeTab === "incoming" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Incoming Farmer Lots & Quality Inspection (QC)</h2>
              <p className="text-xs text-muted-foreground">
                Perishable produce must be weighed, inspected for damage %, and approved into batch inventory.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {incomingShipments.map((s) => (
              <Card key={s.id} className="overflow-hidden border-border/80">
                <CardHeader className="bg-muted/30 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{s.id}</span>
                    <Badge
                      variant={s.status === "APPROVED" ? "default" : "outline"}
                      className={s.status === "APPROVED" ? "bg-emerald-600" : "text-amber-600 border-amber-500/30"}
                    >
                      {s.status === "APPROVED" ? "QC Approved" : "Pending Inspection"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{s.crop} Produce Lot</CardTitle>
                  <CardDescription className="text-xs">
                    Farmer: {s.farmer} ({s.farmerId}) · ETA: {s.eta}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-muted-foreground">Expected:</span>
                      <p className="font-bold text-foreground">{s.expectedKg} kg</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="text-muted-foreground">Actual Received:</span>
                      <p className="font-bold text-foreground">{s.actualKg} kg</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <span className="text-emerald-700">Accepted:</span>
                      <p className="font-bold text-emerald-700">{s.acceptedKg} kg</p>
                    </div>
                    <div className="rounded-lg bg-rose-500/10 p-2">
                      <span className="text-rose-700">Culled/Rejected:</span>
                      <p className="font-bold text-rose-700">{s.rejectedKg} kg</p>
                    </div>
                  </div>

                  <div className="rounded-xl border p-2.5 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grade:</span>
                      <span className="font-bold">{s.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Freshness:</span>
                      <span>{s.freshness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Damage %:</span>
                      <span className="text-amber-600">{s.damagePct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temperature:</span>
                      <span>{s.temperature}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                    onClick={() => {
                      setSelectedShipment(s);
                      setExpectedKg(s.expectedKg);
                      setActualKg(s.actualKg);
                      setAcceptedKg(s.acceptedKg);
                      setRejectedKg(s.rejectedKg);
                      setQcGrade(s.grade as "Grade A" | "Grade B" | "Grade C");
                      setQcDamagePct(s.damagePct);
                      setQcTemperature(s.temperature);
                    }}
                  >
                    <ShieldCheck className="mr-1.5 size-4" /> Conduct Quality Inspection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PICK & PACK QUEUE */}
      {activeTab === "picking" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Store Order Picking & Packing Queue</h2>
              <p className="text-xs text-muted-foreground">
                Fulfill customer baskets from batch inventory: Start Picking &rarr; Quality Check &rarr; Pack Order &rarr; Ready for Delivery.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pickingQueue.map((task) => (
              <Card key={task.id} className="p-5 border-border/80 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                      <Package className="size-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base">#{task.orderId}</span>
                        <Badge
                          variant={
                            task.status === "READY_FOR_DELIVERY"
                              ? "default"
                              : task.status === "PACKED"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            task.status === "READY_FOR_DELIVERY"
                              ? "bg-emerald-600"
                              : task.status === "PACKED"
                              ? "bg-purple-600 text-white"
                              : ""
                          }
                        >
                          {task.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customer: <b>{task.customerName}</b> ({task.customerPhone}) · {task.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Total Basket Weight</span>
                    <p className="font-mono text-xl font-extrabold text-foreground">
                      {task.totalWeightKg} kg
                    </p>
                  </div>
                </div>

                {/* Checklist of required produce */}
                <div className="mt-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Basket Picking Checklist:
                  </span>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {task.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-2.5 text-xs"
                      >
                        {it.picked ? (
                          <CheckSquare className="size-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-foreground">
                            {it.cropName} · {it.qtyKg} kg
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            Batch: {it.batchId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Stepper Action */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Assigned Delivery Partner: <b className="text-foreground">{task.assignedDriver}</b>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === "PENDING_PICK" && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleAdvancePickTask(task, "START_PICKING")}
                      >
                        Start Picking Produce <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {task.status === "PICKING" && (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => handleAdvancePickTask(task, "QUALITY_CHECK")}
                      >
                        Verify Quality & Weight <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {task.status === "QUALITY_CHECK" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleAdvancePickTask(task, "PACK_ORDER")}
                      >
                        Pack in Thermal Bag <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {task.status === "PACKED" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => handleAdvancePickTask(task, "READY_FOR_DELIVERY")}
                      >
                        Mark Ready for Delivery <CheckCircle2 className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {task.status === "READY_FOR_DELIVERY" && (
                      <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
                        <CheckCircle2 className="mr-1 size-3" /> Ready for Driver Pickup
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY MOVEMENTS LEDGER */}
      {activeTab === "movements" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Immutable Inventory Ledger</h2>
              <p className="text-xs text-muted-foreground">
                Every stock delta (Received, Order Reserved, Bulk Dispatch, Wastage) creates a permanent record.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Batch & Crop</th>
                  <th className="p-3.5">Quantity Delta</th>
                  <th className="p-3.5">Balance</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Reference Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ledger.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-mono text-muted-foreground">{m.timestamp}</td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={
                          m.action === "STOCK_RECEIVED"
                            ? "text-emerald-600 border-emerald-500/30"
                            : m.action === "WASTAGE_RECORDED"
                            ? "text-rose-600 border-rose-500/30"
                            : "text-blue-600 border-blue-500/30"
                        }
                      >
                        {m.action.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-bold">
                      {m.cropName} <span className="font-mono font-normal text-muted-foreground">({m.batchId})</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={m.quantityChange > 0 ? "text-emerald-600" : "text-rose-600"}>
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} kg
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-foreground font-bold">
                      {m.newBalance} kg
                    </td>
                    <td className="p-3.5 text-muted-foreground">{m.actor}</td>
                    <td className="p-3.5 text-xs text-muted-foreground">{m.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receive Stock & QC Modal */}
      {selectedShipment && (
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-purple-600" />
                Produce Lot Receiving & Quality Inspection
              </DialogTitle>
              <DialogDescription>
                Lot #{selectedShipment.id} · {selectedShipment.crop} from {selectedShipment.farmer}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Weight Checks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Expected Weight (kg)</label>
                  <Input
                    type="number"
                    value={expectedKg}
                    onChange={(e) => setExpectedKg(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">Actual Scale Weight (kg)</label>
                  <Input
                    type="number"
                    value={actualKg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setActualKg(val);
                      setAcceptedKg(val - rejectedKg);
                    }}
                  />
                </div>
                <div>
                  <label className="font-semibold text-emerald-700">Accepted Weight (kg)</label>
                  <Input
                    type="number"
                    value={acceptedKg}
                    onChange={(e) => setAcceptedKg(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-rose-700">Rejected / Culled (kg)</label>
                  <Input
                    type="number"
                    value={rejectedKg}
                    onChange={(e) => setRejectedKg(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="rounded-xl border p-3 bg-muted/20 space-y-2.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                  Perishable Quality Standard Parameters:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Quality Grade:</label>
                    <select
                      value={qcGrade}
                      onChange={(e) => setQcGrade(e.target.value as "Grade A" | "Grade B" | "Grade C")}
                      className="w-full rounded border bg-background p-1.5 text-xs font-semibold"
                    >
                      <option value="Grade A">Grade A (Premium)</option>
                      <option value="Grade B">Grade B (Commercial)</option>
                      <option value="Grade C">Grade C (Processing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Freshness Level:</label>
                    <select
                      value={qcFreshness}
                      onChange={(e) => setQcFreshness(e.target.value as "Excellent" | "Good" | "Fair" | "Substandard")}
                      className="w-full rounded border bg-background p-1.5 text-xs font-semibold"
                    >
                      <option value="Excellent">Excellent (Firm, fresh bloom)</option>
                      <option value="Good">Good (Normal)</option>
                      <option value="Fair">Fair (Slight soft)</option>
                      <option value="Substandard">Substandard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground">Damage %:</label>
                    <Input
                      type="number"
                      step={0.5}
                      value={qcDamagePct}
                      onChange={(e) => setQcDamagePct(parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Cold Storage Temp:</label>
                    <Input
                      value={qcTemperature}
                      onChange={(e) => setQcTemperature(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Decision Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleReceiveStockSubmit("APPROVE")}
                >
                  Approve (Grade A)
                </Button>
                <Button
                  variant="outline"
                  className="text-amber-600 border-amber-500/30"
                  onClick={() => handleReceiveStockSubmit("PARTIAL_ACCEPT")}
                >
                  Partial Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReceiveStockSubmit("REJECT")}
                >
                  Reject Lot
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Record Wastage Modal */}
      <Dialog open={wastageOpen} onOpenChange={setWastageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="size-5" />
              Record Produce Wastage
            </DialogTitle>
            <DialogDescription>
              Segregate damaged produce and log deduction in the permanent inventory ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordWastageSubmit} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold">Target Batch ID</label>
              <select
                value={targetBatchId}
                onChange={(e) => {
                  setTargetBatchId(e.target.value);
                  const found = batches.find((b) => b.batchId === e.target.value);
                  if (found) setTargetCropName(found.cropName);
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} — {b.cropName} ({b.quantityKg} kg available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold">Wastage Quantity (kg)</label>
              <Input
                type="number"
                step={0.5}
                value={wastageAmount}
                onChange={(e) => setWastageAmount(e.target.value)}
                placeholder="e.g. 2.5"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Reason for Cull</label>
              <Input
                value={wastageReason}
                onChange={(e) => setWastageReason(e.target.value)}
                placeholder="e.g. Crushed in sorting, natural over-ripening"
                required
              />
            </div>

            <Button type="submit" variant="destructive" className="w-full font-bold">
              Record Wastage in Ledger
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
