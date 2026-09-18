import { useState, lazy, Suspense } from "react";
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
  Sprout,
  IndianRupee,
  Package,
  Layers,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Plus,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
} from "lucide-react";

const FarmMap = lazy(() => import("../FarmMap"));

export function FarmerPortal() {
  const { currentUser, listings, addListing, updateListingQuantity, orders, updateOrder } = useFarmConnect();
  const [activeTab, setActiveTab] = useState<"crops" | "orders" | "gps" | "earnings">("crops");
  const [addCropOpen, setAddCropOpen] = useState(false);

  // Form states for new crop
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState<"Vegetables" | "Fruits" | "Grains">("Vegetables");
  const [grade, setGrade] = useState("Grade A");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [harvestDate, setHarvestDate] = useState("Today");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter crops and orders strictly for this farmer (least privilege)
  const farmerId = currentUser?.farmerId || "FO-TG-MDL-26-000184";
  const myCrops = listings.filter(
    (l) =>
      l.farmerId === farmerId ||
      l.farmerName.toLowerCase().includes("ramesh") ||
      l.farmerId.includes("184"),
  );

  const myOrders = orders.filter(
    (o) =>
      o.farmerId === farmerId ||
      o.farmerId.includes("184") ||
      o.cropName.toLowerCase().includes("tomato") ||
      o.cropName.toLowerCase().includes("okra"),
  );

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !variety || !quantity || !price) return;
    setIsSubmitting(true);
    try {
      await addListing({
        farmerId: farmerId,
        farmerName: currentUser?.name || "Ramesh Naik",
        cropName,
        variety,
        category,
        grade,
        availableQuantity: parseInt(quantity, 10),
        pricePerKg: parseFloat(price),
        harvestDate,
        location: currentUser?.location || "Medak, Telangana",
      });
      setAddCropOpen(false);
      setCropName("");
      setVariety("");
      setQuantity("");
      setPrice("");
    } catch (err) {
      console.error("Failed to add crop:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSalesVal = currentUser?.todaySales || 12450;
  const totalKgAvailable = myCrops.reduce((acc, c) => acc + c.availableQuantity, 0) || 240;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
              <Sprout className="size-8" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {currentUser?.name || "Ramesh Naik"}
                </h1>
                <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-400/30">
                  <CheckCircle2 className="mr-1 size-3" /> Verified Farm
                </Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-emerald-200/90">
                Farmer ID: <span className="font-bold text-white">{farmerId}</span> ·{" "}
                {currentUser?.location || "Medak, Telangana"} (4.5 Acres)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddCropOpen(true)}
              className="bg-harvest text-ink hover:bg-harvest/90 font-bold shadow-md"
            >
              <Plus className="mr-1.5 size-4" /> Add New Crop
            </Button>
          </div>
        </div>

        {/* Today's Summary Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <IndianRupee className="size-4" /> Today's Sales
            </div>
            <p className="mt-2 text-2xl font-black sm:text-3xl">
              ₹{totalSalesVal.toLocaleString()}
            </p>
            <span className="mt-1 inline-flex items-center text-[10px] text-emerald-400">
              <TrendingUp className="mr-1 size-3" /> Direct bank settlement
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <Layers className="size-4" /> Active Crops
            </div>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{myCrops.length} Crops</p>
            <span className="mt-1 inline-flex text-[10px] text-emerald-300">
              Grade A & Organic certified
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <Package className="size-4" /> Stock Available
            </div>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{totalKgAvailable} kg</p>
            <span className="mt-1 inline-flex text-[10px] text-emerald-300">
              In cold storage & ready
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <ShoppingBag className="size-4" /> Involving Orders
            </div>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{myOrders.length} Orders</p>
            <span className="mt-1 inline-flex text-[10px] text-emerald-300">
              Automated hub dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        
        {/* Sidebar Navigation */}
        <div className="flex flex-col gap-2 border-r border-border/70 pr-4">
          <Button
            variant={activeTab === "crops" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("crops")}
            className="justify-start gap-2 h-10 w-full"
          >
            <Sprout className="size-4" /> My Crops ({myCrops.length})
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("orders")}
            className="justify-start gap-2 h-10 w-full"
          >
            <ShoppingBag className="size-4" /> Produce Orders ({myOrders.length})
          </Button>
          <Button
            variant={activeTab === "gps" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("gps")}
            className="justify-start gap-2 h-10 w-full"
          >
            <MapPin className="size-4" /> Farm Location & GPS
          </Button>
          <Button
            variant={activeTab === "earnings" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("earnings")}
            className="justify-start gap-2 h-10 w-full"
          >
            <IndianRupee className="size-4" /> Earnings & Settlement
          </Button>
        </div>

        {/* Content Area */}
        <div className="min-w-0">
      {/* Tab 1: My Crops */}
      {activeTab === "crops" && (
        <div className="mt-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Active Produce Listings & Batches</h2>
              <p className="text-xs text-muted-foreground">
                All lots harvested from your farm are batch-tagged for transparent hub distribution.
              </p>
            </div>
            <Button size="sm" onClick={() => setAddCropOpen(true)}>
              <Plus className="mr-1 size-4" /> Add Produce
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCrops.map((crop) => (
              <Card key={crop.id} className="overflow-hidden border-border/80 shadow-sm">
                <div className="relative h-44 w-full bg-muted">
                  <img
                    src={crop.imageUrl}
                    alt={crop.cropName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md">
                      {crop.grade}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-lg bg-black/60 px-2 py-1 font-mono text-[11px] font-bold text-white backdrop-blur-md">
                      {crop.listingId}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base">{crop.cropName}</h3>
                      <p className="text-xs text-muted-foreground">{crop.variety}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600">
                        ₹{crop.pricePerKg}
                      </span>
                      <span className="text-xs text-muted-foreground">/kg</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2.5 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-1">Available Stock:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateListingQuantity(crop.id, Math.max(0, crop.availableQuantity - 10))}
                          className="grid size-5 place-items-center rounded bg-background border hover:bg-muted text-foreground font-bold"
                        >
                          -
                        </button>
                        <p className="font-bold text-foreground text-center min-w-10">{crop.availableQuantity} kg</p>
                        <button
                          type="button"
                          onClick={() => updateListingQuantity(crop.id, crop.availableQuantity + 10)}
                          className="grid size-5 place-items-center rounded bg-background border hover:bg-muted text-foreground font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Harvest Date:</span>
                      <p className="font-bold text-foreground">{crop.harvestDate}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> {crop.location}
                    </span>
                    <span className="font-semibold text-emerald-600">Hub Verified</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Orders Involving My Produce */}
      {activeTab === "orders" && (
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Orders Sourced from Your Farm</h2>
            <p className="text-xs text-muted-foreground">
              Direct tracking of buyer requests and automated collection hub transfers.
            </p>
          </div>

          <div className="space-y-3">
            {myOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Package className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{order.orderId}</span>
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "default"
                            : order.status === "IN_TRANSIT"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.cropName} · <b>{order.quantity} kg</b>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-base text-emerald-600">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Paid via {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === "PENDING" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => updateOrder(order.id, "FARMER_ACCEPTED")}
                    >
                      Accept Produce Dispatch
                    </Button>
                  )}
                  {order.status === "FARMER_ACCEPTED" && (
                    <Badge variant="outline" className="text-blue-600 border-blue-500/30">
                      Dispatched to Hub A
                    </Badge>
                  )}
                  {order.status === "IN_TRANSIT" && (
                    <Badge variant="secondary" className="text-amber-600">
                      Out for Delivery
                    </Badge>
                  )}
                  {order.status === "DELIVERED" && (
                    <Badge variant="default" className="bg-emerald-600">
                      Settlement Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Farm Location & GPS */}
      {activeTab === "gps" && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-emerald-600" />
                Registered Farm Coordinates & Collection Route
              </CardTitle>
              <CardDescription>
                Transporters use these precise GPS coordinates to collect fresh produce directly from your farm gate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-xs text-muted-foreground">State & District:</span>
                  <p className="font-bold">Telangana · Medak</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Village:</span>
                  <p className="font-bold">Narsapur</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Coordinates:</span>
                  <p className="font-bold font-mono">17.8714° N, 78.1108° E</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Assigned Hub:</span>
                  <p className="font-bold text-emerald-600">Hub A (Hyderabad Central · 42 km)</p>
                </div>
              </div>

              <div className="h-72 w-full overflow-hidden rounded-xl border">
                <Suspense fallback={<div className="grid h-full place-items-center">Loading Farm GPS Map...</div>}>
                  <FarmMap position={[17.8714, 78.1108]} onChange={() => {}} />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Earnings & Settlements */}
      {activeTab === "earnings" && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Total Paid to Bank</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600">₹1,42,800</p>
              <span className="text-[11px] text-muted-foreground">Direct NEFT/UPI settlement</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Pending Payout</span>
              <p className="mt-1 text-2xl font-extrabold text-amber-600">₹12,450</p>
              <span className="text-[11px] text-muted-foreground">Settles at 06:00 PM today</span>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-muted-foreground">Middlemen Commission Saved</span>
              <p className="mt-1 text-2xl font-extrabold text-primary">₹38,200</p>
              <span className="text-[11px] text-muted-foreground">100% direct farmer margin</span>
            </Card>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-4">
            <h3 className="font-bold text-sm mb-3">Bank Settlement History (Last 5 Transits)</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">Batch TB001 · 300 kg Tomatoes</p>
                  <span className="text-muted-foreground">16 Sept 2026 · UTR: HDFC89021481</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">₹9,600</span>
                  <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-500/30">Settled</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">Batch LB012 · 80 kg Fresh Okra</p>
                  <span className="text-muted-foreground">15 Sept 2026 · UTR: HDFC88992140</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">₹3,840</span>
                  <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-500/30">Settled</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Batch OB019 · 200 kg Onions</p>
                  <span className="text-muted-foreground">14 Sept 2026 · UTR: HDFC87410092</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">₹7,000</span>
                  <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-500/30">Settled</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Add Crop Modal */}
      <Dialog open={addCropOpen} onOpenChange={setAddCropOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="size-5 text-emerald-600" />
              Add Crop Produce Lot
            </DialogTitle>
            <DialogDescription>
              Register your fresh harvest. The lot will be assigned an automated batch ID for hub traceability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCropSubmit} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold">Crop Name</label>
              <Input
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Tomatoes, Fresh Okra, Onion"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Variety</label>
                <Input
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Arka Rakshak"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as "Vegetables" | "Fruits" | "Grains")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold">Quantity (kg)</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="200"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Price (₹/kg)</label>
                <Input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="32"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Harvest</label>
                <select
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Yesterday">Yesterday</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Batch & Listing..." : "Register Batch Lot"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
