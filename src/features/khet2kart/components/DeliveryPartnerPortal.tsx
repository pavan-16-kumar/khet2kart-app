import { useState, useEffect } from "react";
import { useFarmConnect } from "../FarmContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  api,
  type DriverDelivery,
} from "@/lib/api";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  Package,
  Clock,
  ShieldCheck,
  Radio,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export function DeliveryPartnerPortal() {
  const { currentUser, refreshAuditLogs } = useFarmConnect();
  const driverId = currentUser?.driverId || "DP-HYD-042";

  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsSharing, setGpsSharing] = useState(true);
  const [currentLat, setCurrentLat] = useState(17.4250);
  const [currentLng, setCurrentLng] = useState(78.4200);
  const [eta, setEta] = useState(14);
  const [proofOtp, setProofOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.logistics.getDriverTasks(driverId);
      if (res?.deliveries) {
        setDeliveries(res.deliveries);
      }
    } catch (err) {
      console.error("Failed to load driver tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [driverId]);

  // Simulated GPS ping broadcaster
  const handlePingLocation = async () => {
    // Nudge coordinates closer to customer
    const newLat = currentLat + 0.0015;
    const newLng = currentLng - 0.0012;
    const newEta = Math.max(3, eta - 2);
    setCurrentLat(newLat);
    setCurrentLng(newLng);
    setEta(newEta);

    try {
      await api.logistics.pingLocation({
        driverId,
        lat: newLat,
        lng: newLng,
        speedKmh: 32.0,
        heading: 135.0,
        etaMinutes: newEta,
      });
      setSuccessMsg(`GPS pinged at ${new Date().toLocaleTimeString()} (ETA: ${newEta}m)`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to broadcast GPS:", err);
    }
  };

  const handleUpdateStatus = async (
    deliveryId: string,
    newStatus: "ACCEPTED" | "PICKED_UP_FROM_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED",
  ) => {
    setOtpError("");
    try {
      await api.logistics.updateDeliveryStatus(deliveryId, {
        status: newStatus,
        proofOtp: newStatus === "DELIVERED" ? proofOtp || "1234" : undefined,
        driverName: currentUser?.name || "Ravi Kumar",
      });
      setSuccessMsg(`Delivery marked as ${newStatus.replace(/_/g, " ")}`);
      loadTasks();
      refreshAuditLogs();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-stone-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30">
              <Truck className="size-8" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {currentUser?.name || "Ravi Kumar"}
                </h1>
                <Badge className="bg-amber-500/30 text-amber-300 border-amber-400/30">
                  <ShieldCheck className="mr-1 size-3" /> Verified Partner
                </Badge>
              </div>
              <p className="mt-1 text-xs text-amber-200/80">
                Driver ID: <span className="font-bold text-white font-mono">{driverId}</span> ·{" "}
                {currentUser?.vehicle || "Tata Ace EV (Capacity: 850 kg)"} · Hyderabad Hub Fleet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={gpsSharing ? "default" : "outline"}
              className={
                gpsSharing
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  : "border-white/20 text-white"
              }
              onClick={() => setGpsSharing(!gpsSharing)}
            >
              <Radio className={`mr-1.5 size-3.5 ${gpsSharing ? "animate-pulse" : ""}`} />
              {gpsSharing ? "Live GPS Active" : "GPS Paused"}
            </Button>
          </div>
        </div>

        {/* Top Shift KPIs */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <span className="text-xs text-amber-200">Today's Deliveries</span>
            <p className="mt-1 text-3xl font-black">12</p>
            <span className="text-[10px] text-amber-300">Scheduled on route</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <span className="text-xs text-amber-200">Completed Deliveries</span>
            <p className="mt-1 text-3xl font-black text-emerald-400">8</p>
            <span className="text-[10px] text-emerald-300">Customer OTP verified</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <span className="text-xs text-amber-200">Pending Deliveries</span>
            <p className="mt-1 text-3xl font-black text-amber-300">4</p>
            <span className="text-[10px] text-amber-200">In queue for dispatch</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <span className="text-xs text-amber-200">Current GPS Station</span>
            <p className="mt-1 text-xl font-bold truncate">📍 Banjara Hills</p>
            <span className="text-[10px] text-amber-300">Nearest: Hub A (0.4 km)</span>
          </div>
        </div>
      </div>

      {/* Least Privilege Security Banner */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-800">
        <ShieldCheck className="size-5 shrink-0 text-amber-600" />
        <p>
          <b>OWASP Least-Privilege Protection Active:</b> As a delivery partner, your session is
          strictly restricted to viewing your assigned delivery packages and route waypoints. Financial,
          farmer KYC, and customer account records remain fully protected on the backend.
        </p>
      </div>

      {successMsg && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Active Deliveries List */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Assigned Delivery Shipments</h2>
          <Button size="sm" variant="outline" onClick={handlePingLocation} className="text-xs">
            <Radio className="mr-1 size-3 text-emerald-600" /> Broadcast Live Location Ping
          </Button>
        </div>

        {deliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No active deliveries assigned currently. Check back with the Store Manager at Hub A.
          </div>
        ) : (
          deliveries.map((deliv) => (
            <Card key={deliv.id} className="overflow-hidden border-border/80 shadow-md">
              <CardHeader className="bg-muted/30 p-5 border-b">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-700">
                      <Package className="size-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base">#{deliv.orderId}</span>
                        <Badge
                          variant={
                            deliv.status === "DELIVERED"
                              ? "default"
                              : deliv.status === "OUT_FOR_DELIVERY"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            deliv.status === "DELIVERED"
                              ? "bg-emerald-600"
                              : deliv.status === "OUT_FOR_DELIVERY"
                              ? "bg-amber-600 text-white"
                              : ""
                          }
                        >
                          {deliv.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Task ID: {deliv.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Live Route ETA</span>
                    <p className="font-mono text-xl font-extrabold text-emerald-600">
                      {deliv.status === "DELIVERED" ? "Delivered" : `${eta} mins`}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Pickup and Dropoff Steps */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Step 1: Pickup Hub */}
                  <div className="rounded-2xl border p-4 bg-muted/20">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="size-4 text-purple-600" />
                        Step 1: Pickup from Hub
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {deliv.pickupDistance}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-bold">{deliv.hubName}</p>
                    <p className="text-xs text-muted-foreground">{deliv.hubAddress}</p>

                    <div className="mt-3 rounded-lg bg-background p-2.5 text-xs">
                      <span className="font-semibold text-muted-foreground">Package Items:</span>
                      <p className="font-bold text-foreground mt-0.5">{deliv.itemsSummary}</p>
                    </div>
                  </div>

                  {/* Step 2: Customer Dropoff */}
                  <div className="rounded-2xl border p-4 bg-muted/20">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Navigation className="size-4 text-emerald-600" />
                        Step 2: Deliver to Customer
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {deliv.dropoffDistance}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-bold">{deliv.customerName}</p>
                    <p className="text-xs text-muted-foreground">{deliv.customerAddress}</p>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-background p-2.5 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="size-3 text-emerald-600" /> {deliv.customerPhone}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-primary p-0"
                        onClick={() => alert(`Calling customer ${deliv.customerName} at ${deliv.customerPhone}`)}
                      >
                        Call Customer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status Advancement Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePingLocation}
                      className="text-xs"
                    >
                      <Navigation className="mr-1.5 size-3.5 text-blue-600" /> Simulate Google Route GPS
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {deliv.status === "ACCEPTED" && (
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        size="sm"
                        onClick={() => handleUpdateStatus(deliv.id, "PICKED_UP_FROM_HUB")}
                      >
                        Confirm Hub Package Pickup <ArrowRight className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {deliv.status === "PICKED_UP_FROM_HUB" && (
                      <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        size="sm"
                        onClick={() => handleUpdateStatus(deliv.id, "OUT_FOR_DELIVERY")}
                      >
                        Start Delivery Route <Truck className="ml-1 size-3.5" />
                      </Button>
                    )}

                    {deliv.status === "OUT_FOR_DELIVERY" && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          maxLength={4}
                          value={proofOtp}
                          onChange={(e) => setProofOtp(e.target.value)}
                          placeholder="OTP (e.g. 1234)"
                          className="h-8 w-32 text-center font-mono text-xs"
                        />
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          size="sm"
                          onClick={() => handleUpdateStatus(deliv.id, "DELIVERED")}
                        >
                          Handover & Complete <CheckCircle2 className="ml-1 size-3.5" />
                        </Button>
                      </div>
                    )}

                    {deliv.status === "DELIVERED" && (
                      <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
                        <CheckCircle2 className="mr-1 size-3" /> Successfully Delivered & Settled
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
