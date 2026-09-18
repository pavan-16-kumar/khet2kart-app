import { useState, useMemo, useEffect } from "react";
import { useFarmConnect, type CropListing } from "../FarmContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  type Hub,
} from "@/lib/api";
import {
  ShoppingCart,
  Search,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  Sparkles,
  Truck,
  Store,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRight,
  Radio,
  Clock,
  Check,
} from "lucide-react";

interface CustomerMarketplacePortalProps {
  onOpenCart: () => void;
}

export function CustomerMarketplacePortal({ onOpenCart }: CustomerMarketplacePortalProps) {
  const { listings, cart, addToCart, updateCartQuantity, removeFromCart, placeOrder, orders } =
    useFarmConnect();

  const [deliveryLocation, setDeliveryLocation] = useState("Jubilee Hills, Hyderabad");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selected quantity for each card before adding to cart (cropId -> kg)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("Pavan Kumar");
  const [address, setAddress] = useState("Plot 18, Road No. 10, Jubilee Hills, Hyderabad");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [isPlacing, setIsPlacing] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<string | null>(null);

  // Auto hub selection calculation
  const [autoHub, setAutoHub] = useState<{
    selectedHub: Hub | null;
    distanceKm: number;
    etaMinutes: number;
    allAvailable: boolean;
    allHubOptions: { hub: Hub; distanceKm: number; etaMinutes: number; canFulfillAll: boolean; missingItems: string[] }[];
  } | null>(null);

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Organic"];

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch =
        l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.variety.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "All" ||
        (selectedCategory === "Organic" && l.grade.toLowerCase().includes("organic")) ||
        l.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [listings, searchQuery, selectedCategory]);

  const handleQtyChange = (cropId: string, delta: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[cropId] || 1;
      const next = Math.max(0.5, Math.round((current + delta) * 2) / 2);
      return { ...prev, [cropId]: next };
    });
  };

  const handleAddToCartWithQty = (item: CropListing) => {
    const qty = selectedQuantities[item.id] || 1;
    addToCart(item, qty);
  };

  // Compute Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.pricePerKg * item.cartQuantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const totalAmount = subtotal + deliveryFee;

  // Recalculate auto-hub routing whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const itemsPayload = cart.map((c) => ({
        listingId: c.id,
        cropName: c.cropName,
        quantity: Math.ceil(c.cartQuantity),
        pricePerKg: c.pricePerKg,
      }));

      api.hubs
        .autoSelect({
          customerAddress: address,
          items: itemsPayload,
        })
        .then((res) => {
          setAutoHub(res);
        })
        .catch(() => {});
    }
  }, [cart, address]);

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsPlacing(true);
    try {
      const order = await placeOrder({
        buyer: buyerName,
        deliveryAddress: address,
        paymentMethod,
        items: cart.map((it) => ({
          listingId: it.id,
          cropName: it.cropName,
          quantity: Math.ceil(it.cartQuantity),
          pricePerKg: it.pricePerKg,
        })),
        subtotal,
        delivery: deliveryFee,
        totalAmount,
      });
      setActiveTrackingOrder(order.orderId);
      setCheckoutOpen(false);
    } catch (err) {
      console.error("Order placement failed:", err);
    } finally {
      setIsPlacing(false);
    }
  };

  // Find active tracking order if available
  const currentOrder = orders.find((o) => o.orderId === activeTrackingOrder) || orders[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner with Delivery Location */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="size-3.5" /> 100% Farm-Fresh · Zero Middlemen Markups
            </span>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-4xl">
              Fresh Produce Delivered to Your Door
            </h1>
            <p className="mt-1 text-xs text-emerald-200/80">
              Direct from verified Telangana & Indian farms · Harvested within 24 hours
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <span className="text-[10px] font-semibold uppercase text-emerald-200 block">
                Deliver to Location
              </span>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm">
                <MapPin className="size-4 text-emerald-400 shrink-0" />
                <select
                  value={deliveryLocation}
                  onChange={(e) => {
                    setDeliveryLocation(e.target.value);
                    setAddress(`Plot 18, Road No. 10, ${e.target.value}`);
                  }}
                  className="bg-transparent border-none text-white font-bold text-sm focus:outline-hidden cursor-pointer"
                >
                  <option value="Jubilee Hills, Hyderabad" className="text-black">
                    Jubilee Hills, Hyderabad
                  </option>
                  <option value="Banjara Hills, Hyderabad" className="text-black">
                    Banjara Hills, Hyderabad
                  </option>
                  <option value="HITEC City, Madhapur" className="text-black">
                    HITEC City, Madhapur
                  </option>
                  <option value="Gachibowli, Hyderabad" className="text-black">
                    Gachibowli, Hyderabad
                  </option>
                </select>
              </div>
            </div>

            {/* Cart Button */}
            <Button
              onClick={onOpenCart}
              className="relative h-auto bg-harvest text-ink hover:bg-harvest/90 font-bold px-5 py-3 rounded-2xl shadow-lg"
            >
              <ShoppingCart className="size-5 mr-1.5" />
              <span>Cart ({cart.length})</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex items-center rounded-2xl bg-white/10 p-2 backdrop-blur-md ring-1 ring-white/20">
          <Search className="ml-2 size-5 text-emerald-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farm-fresh tomatoes, okra, onions, mangoes..."
            className="border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 shadow-none text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? "bg-white text-emerald-950 shadow-xs"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Active Delivery Tracker (if customer placed an order) */}
      {currentOrder && (
        <div className="mt-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Truck className="size-6 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-800">
                    Active Order #{currentOrder.orderId}
                  </span>
                  <Badge className="bg-emerald-600 text-white">
                    {currentOrder.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fulfilling from: <b>Hub A · Banjara Hills</b> · Assigned Driver:{" "}
                  <b>Ravi Kumar (DP-HYD-042)</b>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-xs text-muted-foreground">Estimated Delivery</span>
                <p className="text-2xl font-black text-emerald-600">14 - 18 mins</p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div className="flex flex-col items-center">
              <span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white">
                <Check className="size-4" />
              </span>
              <span className="mt-1 text-[11px] text-foreground">Order Placed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white">
                <Check className="size-4" />
              </span>
              <span className="mt-1 text-[11px] text-foreground">Hub QC & Packed</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="grid size-7 place-items-center rounded-full bg-amber-500 text-white animate-pulse">
                <Truck className="size-4" />
              </span>
              <span className="mt-1 text-[11px] text-amber-600 font-bold">On the Way</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="grid size-7 place-items-center rounded-full bg-muted text-muted-foreground">
                <MapPin className="size-4" />
              </span>
              <span className="mt-1 text-[11px] text-muted-foreground">Handover</span>
            </div>
          </div>
        </div>
      )}

      {/* Produce Grid */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Fresh Vegetables & Produce Near You</h2>
            <p className="text-xs text-muted-foreground">
              Select desired quantity in kg and add to your single multi-item basket.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredListings.length} Available Lots
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredListings.map((item) => {
            const currentQty = selectedQuantities[item.id] || 1;
            const itemPrice = Math.round(item.pricePerKg * currentQty);

            return (
              <Card
                key={item.id}
                className="overflow-hidden border-border/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 w-full bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.cropName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2.5 top-2.5 flex gap-1">
                    <Badge className="bg-emerald-600 text-white text-[10px]">🟢 Fresh</Badge>
                    <Badge className="bg-background/90 text-foreground text-[10px]">
                      {item.grade}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white">
                      Avail: {item.availableQuantity} kg
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{item.cropName}</h3>
                      <p className="text-xs text-muted-foreground">{item.variety}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600">
                        ₹{item.pricePerKg}
                      </span>
                      <span className="text-xs text-muted-foreground">/kg</span>
                    </div>
                  </div>

                  {/* Quantity Stepper (0.5 kg increments) */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border bg-muted/30 p-1.5">
                    <span className="text-xs font-semibold text-muted-foreground pl-2">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -0.5)}
                        className="grid size-7 place-items-center rounded-lg bg-background border hover:bg-muted text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold text-xs w-12 text-center">
                        {currentQty} kg
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 0.5)}
                        className="grid size-7 place-items-center rounded-lg bg-background border hover:bg-muted text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCartWithQty(item)}
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9"
                  >
                    Add {currentQty} kg · ₹{itemPrice}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Floating Multi-Item Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl rounded-2xl bg-ink p-4 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-harvest text-ink font-extrabold">
                <ShoppingCart className="size-5" />
              </span>
              <div>
                <p className="font-bold text-sm">
                  {cart.length} Item{cart.length !== 1 ? "s" : ""} in Cart · ₹{totalAmount}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {autoHub?.selectedHub ? (
                    <span>
                      🏪 Routed to <b>{autoHub.selectedHub.name}</b> ({autoHub.distanceKm} km ·{" "}
                      {autoHub.etaMinutes}m ETA)
                    </span>
                  ) : (
                    "Calculating nearest fulfilling hub..."
                  )}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setCheckoutOpen(true)}
              className="bg-harvest text-ink hover:bg-harvest/90 font-bold text-sm px-6"
            >
              Checkout <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5 text-emerald-600" />
              Confirm Fresh Produce Order
            </DialogTitle>
            <DialogDescription>
              Your basket is automatically routed to the nearest Khet2Kart hub with 100% item availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 pt-2 text-xs">
            {/* Automatic Store Selection Highlight */}
            {autoHub?.selectedHub && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-900">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Store className="size-4 text-emerald-600" />
                    Optimal Fulfillment Hub Selected:
                  </span>
                  <Badge variant="outline" className="bg-white text-emerald-700 font-mono">
                    {autoHub.distanceKm} km away
                  </Badge>
                </div>
                <p className="mt-1 text-xs font-semibold">{autoHub.selectedHub.name}</p>
                <p className="text-[11px] text-emerald-700">
                  {autoHub.selectedHub.address} · All {cart.length} produce items in stock · Driver ETA:{" "}
                  {autoHub.etaMinutes} mins
                </p>
              </div>
            )}

            {/* Cart Items Summary */}
            <div className="rounded-xl border p-3 bg-muted/20 space-y-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                Itemized Basket:
              </span>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span>
                    {item.cropName} × <b>{item.cartQuantity} kg</b>
                  </span>
                  <span className="font-mono font-bold">
                    ₹{(item.pricePerKg * item.cartQuantity).toFixed(0)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between text-xs text-muted-foreground">
                <span>Products Subtotal:</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Hub Delivery Fee:</span>
                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-600">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Delivery Contact Details */}
            <div className="space-y-2">
              <div>
                <label className="font-semibold text-muted-foreground">Recipient Name</label>
                <Input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground">Delivery Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="font-semibold text-muted-foreground">Payment Method</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    paymentMethod === "UPI"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-700"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  <CreditCard className="size-4" /> Instant UPI (GPay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-700"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  <Banknote className="size-4" /> Cash on Delivery (COD)
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPlacing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-sm"
            >
              {isPlacing ? "Routing to Hub..." : `Place Order · ₹${totalAmount}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
