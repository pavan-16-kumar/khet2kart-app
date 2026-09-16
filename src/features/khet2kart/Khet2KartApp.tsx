import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BadgeIndianRupee,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Crop,
  Gauge,
  IndianRupee,
  KeyRound,
  Leaf,
  Loader2,
  MapPin,
  Menu,
  Package,
  Phone,
  Plus,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sprout,
  Tractor,
  Truck,
  UserCheck,
  Users,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import heroImage from "@/assets/khet2kart-hero.jpg";
import {
  api,
  type FarmerRegistrationResponse,
  type ApiTransporterTask,
  type ApiHubShipment,
  type ApiAdminUser,
} from "@/lib/api";
import {
  FarmConnectProvider,
  useFarmConnect,
  type CropListing,
  type OrderStatus,
  type Role,
} from "./FarmContext";
import { ALL_INDIAN_STATES, getDistrictsForState } from "@/lib/indiaLocationData";
import { SihProblemSolutionSection } from "./SihProblemSolution";

const FarmMap = lazy(() => import("./FarmMap"));
const roles: { id: Role; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "customer", label: "Marketplace" },
  { id: "farmer", label: "Farmer" },
  { id: "transporter", label: "Transporter" },
  { id: "hub", label: "Hub" },
  { id: "admin", label: "Admin" },
];

export function Khet2KartApp() {
  return (
    <FarmConnectProvider>
      <AppShell />
    </FarmConnectProvider>
  );
}

function AppShell() {
  const { activeRole, setActiveRole, cart } = useFarmConnect();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const go = (role: Role) => {
    setActiveRole(role);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="ticker overflow-hidden bg-ink text-primary-foreground">
        <div className="ticker-track flex w-max items-center gap-10 py-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/30 px-2.5 py-0.5 font-bold text-harvest">
            <Award className="size-3.5" /> SMART INDIA HACKATHON 2026 · PS ID: SIH26033
          </span>
          <span>
            <b className="text-harvest">LIVE MANDI</b> · Updated 2 min ago
          </span>
          <span>
            Tomato ₹25 APMC <b>→ ₹32 Khet2Kart</b>
          </span>
          <span>
            Onion ₹28 APMC <b>→ ₹36 Khet2Kart</b>
          </span>
          <span>
            Wheat ₹29 APMC <b>→ ₹34 Khet2Kart</b>
          </span>
          <span>
            Mango ₹118 APMC <b>→ ₹145 Khet2Kart</b>
          </span>
          <span aria-hidden="true">
            Tomato ₹25 APMC <b>→ ₹32 Khet2Kart</b>
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-5 px-4 sm:px-6">
          <Button
            variant="ghost"
            className="h-auto gap-2 p-0 hover:bg-transparent"
            onClick={() => go("home")}
            aria-label="Khet2Kart home"
          >
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </span>
            <span className="font-display text-xl font-extrabold text-ink">
              Khet<span className="text-primary">2</span>Kart
            </span>
          </Button>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Role navigation">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant="ghost"
                size="sm"
                className={
                  activeRole === role.id
                    ? "bg-accent text-primary font-bold"
                    : "text-muted-foreground"
                }
                onClick={() => go(role.id)}
              >
                {role.label}
              </Button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-2">
            {activeRole === "customer" && (
              <Button
                size="icon"
                variant="outline"
                className="relative"
                onClick={() => setCartOpen(true)}
                aria-label="Open cart"
              >
                <ShoppingCart />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-alert text-[10px] font-bold text-primary-foreground">
                    {cart.length}
                  </span>
                )}
              </Button>
            )}
            <Button className="hidden sm:inline-flex" onClick={() => setRegisterOpen(true)}>
              <Sprout /> Register as Farmer
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid border-t bg-background p-3 lg:hidden">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant="ghost"
                className="justify-start"
                onClick={() => go(role.id)}
              >
                {role.label}
              </Button>
            ))}
            <Button className="mt-2 sm:hidden" onClick={() => setRegisterOpen(true)}>
              Register as Farmer
            </Button>
          </nav>
        )}
      </header>
      <main>
        {activeRole === "home" && <HomeView onRole={go} onRegister={() => setRegisterOpen(true)} />}
        {activeRole === "customer" && <CustomerView onCart={() => setCartOpen(true)} />}
        {activeRole === "farmer" && <FarmerView />}
        {activeRole === "transporter" && <TransporterView />}
        {activeRole === "hub" && <HubView />}
        {activeRole === "admin" && <AdminView />}
      </main>
      <Footer onRole={go} />
      <CartDialog open={cartOpen} onOpenChange={setCartOpen} />
      <OnboardingDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={() => go("farmer")}
      />
    </div>
  );
}

function HomeView({
  onRole,
  onRegister,
}: {
  onRole: (role: Role) => void;
  onRegister: () => void;
}) {
  const { platformStats, listings, addToCart } = useFarmConnect();
  const [stage, setStage] = useState(0);
  const stages = [
    {
      icon: Tractor,
      title: "Farmer",
      copy: "Harvest is listed at a transparent, farmer-set price.",
    },
    {
      icon: Warehouse,
      title: "Local Hub",
      copy: "Produce is graded, traced and consolidated nearby.",
    },
    {
      icon: Truck,
      title: "Transporter",
      copy: "Smart routing moves every batch with fewer empty miles.",
    },
    {
      icon: ShoppingCart,
      title: "Buyer",
      copy: "Fresh produce arrives quickly with complete provenance.",
    },
  ];

  return (
    <>
      <section className="relative isolate min-h-[650px] overflow-hidden bg-ink text-primary-foreground">
        <img
          src={heroImage}
          alt="Farmers gathering freshly harvested tomatoes"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-4 pb-36 pt-20 sm:px-6">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-harvest px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-ink">
                <Award className="size-3.5" /> SIH 2026
              </span>
              <span className="text-primary-foreground font-medium">Problem Statement ID:</span>
              <span className="font-mono font-bold text-harvest">SIH26033</span>
              <span className="hidden sm:inline text-primary-foreground/40">·</span>
              <span className="hidden sm:inline text-primary-foreground/90">
                Theme: Agriculture, FoodTech & Rural Development
              </span>
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              From their <span className="text-harvest">khet</span>,<br />
              straight to your kart.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
              One transparent supply chain connecting verified farmers, local hubs, trusted
              transporters and responsible buyers—without the middlemen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-harvest text-ink hover:bg-harvest/90"
                onClick={() => onRole("customer")}
              >
                Buy directly <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onRegister}
              >
                Register as a farmer
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-24 max-w-7xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-lg border border-primary-foreground/15 bg-surface/92 shadow-2xl backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Extra farmer income", platformStats.extraFarmerIncome, IndianRupee],
              ["Harvest saved", platformStats.totalHarvestSaved, Leaf],
              ["Active farmers", platformStats.activeFarmers, Users],
              ["Avg. turnaround", platformStats.avgTurnaroundTime, Clock3],
            ] as [string, string, LucideIcon][]
          ).map(([label, value, Icon], i) => (
            <div
              key={label}
              className={`p-6 ${i ? "border-t sm:border-l sm:border-t-0" : ""} border-border`}
            >
              <Icon className="mb-4 size-5 text-primary" />
              <p className="text-3xl font-extrabold text-ink">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <SihProblemSolutionSection
        onRegisterFarmer={onRegister}
        onExploreMarketplace={() => onRole("customer")}
      />

      <Section
        eyebrow="One connected journey"
        title="See how your harvest moves"
        copy="Every handoff is visible, verified and optimized for freshness."
      >
        <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-lg border bg-card p-4 sm:p-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stages.map((item, index) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  onClick={() => setStage(index)}
                  className={`h-auto min-h-32 flex-col whitespace-normal rounded-md border p-4 ${
                    stage === index
                      ? "border-primary bg-accent text-primary shadow-sm"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  <item.icon className="mb-2 size-7" />
                  <span className="font-bold">{item.title}</span>
                  <span className="text-xs font-normal">Stage {index + 1}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-lg bg-ink p-8 text-primary-foreground">
            <span className="mb-5 grid size-12 place-items-center rounded-md bg-primary">
              <Check className="size-6" />
            </span>
            <p className="text-xs font-bold uppercase text-harvest">Stage {stage + 1} of 4</p>
            <h3 className="mt-2 text-2xl font-bold">{stages[stage]?.title}</h3>
            <p className="mt-3 leading-7 text-primary-foreground/70">{stages[stage]?.copy}</p>
          </div>
        </div>
      </Section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Less distance, more value"
            title="A shorter chain changes everything"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Flow
              title="Traditional supply chain"
              muted
              steps={["Farmer", "Agent", "Wholesaler", "Mandi", "Retailer", "Consumer"]}
              note="Up to 42% lost to commissions and spoilage"
            />
            <Flow
              title="Khet2Kart direct flow"
              steps={["Farmer", "Local Hub", "Buyer"]}
              note="Farmers earn more. Buyers receive fresher."
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Harvested near you"
        title="Fresh from verified farms"
        action={
          <Button variant="outline" onClick={() => onRole("customer")}>
            Explore marketplace <ArrowRight />
          </Button>
        }
      >
        <div className="flex snap-x gap-5 overflow-x-auto pb-4">
          {listings.map((item) => (
            <ProduceCard key={item.id} item={item} onAdd={() => addToCart(item)} compact />
          ))}
        </div>
      </Section>

      <section className="bg-ink py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Built for trust at scale"
            title="Technology rooted in the real world"
            light
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature
              icon={CircleDollarSign}
              title="Instant UPI settlements"
              copy="Farmers get paid within hours, not weeks."
            />
            <Feature
              icon={QrCode}
              title="QR crop traceability"
              copy="Scan every batch from field to final delivery."
            />
            <Feature
              icon={Sparkles}
              title="Fair-price intelligence"
              copy="Live mandi data guides both sides to a fair deal."
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-primary p-8 text-primary-foreground sm:p-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-harvest">Grow a better food economy</p>
            <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
              Every harvest deserves a fair journey.
            </h2>
            <p className="mt-4 max-w-2xl text-primary-foreground/75">
              Join thousands of farmers and buyers building India’s most transparent agricultural
              network.
            </p>
            <Button
              size="lg"
              className="mt-7 bg-harvest text-ink hover:bg-harvest/90"
              onClick={onRegister}
            >
              Join Khet2Kart <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  eyebrow,
  title,
  copy,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <SectionHeading eyebrow={eyebrow} title={title} {...(copy ? { copy } : {})} />
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
      <h2
        className={`mt-2 text-3xl font-extrabold sm:text-4xl ${light ? "text-primary-foreground" : "text-ink"}`}
      >
        {title}
      </h2>
      {copy && (
        <p
          className={`mt-3 leading-7 ${light ? "text-primary-foreground/65" : "text-muted-foreground"}`}
        >
          {copy}
        </p>
      )}
    </div>
  );
}

function Flow({
  title,
  steps,
  note,
  muted = false,
}: {
  title: string;
  steps: string[];
  note: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 sm:p-8 ${muted ? "bg-background" : "border-primary/30 bg-accent"}`}
    >
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-7 flex flex-wrap items-center gap-2">
        {steps.map((item, index) => (
          <div key={item} className="contents">
            <span
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${muted ? "bg-muted text-muted-foreground" : "border-primary/25 bg-background text-primary"}`}
            >
              {item}
            </span>
            {index < steps.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
          </div>
        ))}
      </div>
      <p className={`mt-6 text-sm font-semibold ${muted ? "text-alert" : "text-primary"}`}>
        {note}
      </p>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Zap; title: string; copy: string }) {
  return (
    <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-7">
      <Icon className="size-7 text-harvest" />
      <h3 className="mt-8 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-primary-foreground/60">{copy}</p>
    </div>
  );
}

function ProduceCard({
  item,
  onAdd,
  compact = false,
}: {
  item: CropListing;
  onAdd: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`${compact ? "min-w-72 sm:min-w-80" : ""} overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.cropName}
          width={900}
          height={700}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur">
          {item.grade}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ink">{item.cropName}</h3>
            <p className="text-xs text-muted-foreground">{item.variety}</p>
          </div>
          <p className="font-bold text-primary">
            ₹{item.pricePerKg}
            <span className="text-xs font-normal text-muted-foreground">/kg</span>
          </p>
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <UserCheck className="size-3.5" /> {item.farmerName}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5" /> {item.location}
          </p>
          <p className="flex items-center gap-2">
            <Package className="size-3.5" /> {item.availableQuantity} kg available
          </p>
        </div>
        <Button className="mt-5 w-full" onClick={onAdd} disabled={item.availableQuantity <= 0}>
          <Plus /> {item.availableQuantity <= 0 ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}

function PortalHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="border-b bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold uppercase text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

function CustomerView({ onCart }: { onCart: () => void }) {
  const { listings, addToCart, cart } = useFarmConnect();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [grade, setGrade] = useState("All");

  const filtered = listings.filter(
    (item) =>
      item.cropName.toLowerCase().includes(query.toLowerCase()) &&
      (category === "All" || item.category === category) &&
      (grade === "All" || item.grade === grade),
  );

  return (
    <>
      <PortalHeader
        eyebrow="Direct farm marketplace"
        title="Fresh harvest, transparent prices"
        copy="Buy traceable produce directly from verified Indian farmers."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 pl-9"
              placeholder="Search fresh produce"
              aria-label="Search produce"
            />
          </label>
          <FilterButtons
            label="Category"
            value={category}
            setValue={setCategory}
            options={["All", "Vegetables", "Fruits", "Grains"]}
          />
          <FilterButtons
            label="Grade"
            value={grade}
            setValue={setGrade}
            options={["All", "Organic", "Grade A"]}
          />
          <Button variant="outline" onClick={onCart}>
            <ShoppingCart /> Cart ({cart.length})
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ProduceCard key={item.id} item={item} onAdd={() => addToCart(item)} />
          ))}
        </div>
        {!filtered.length && (
          <div className="py-20 text-center text-muted-foreground">
            No harvests match those filters.
          </div>
        )}
      </div>
    </>
  );
}

function FilterButtons({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function CartDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cart, removeFromCart, placeOrder } = useFarmConnect();
  const [checkout, setCheckout] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("K2K-84902");

  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");

  const subtotal = cart.reduce((sum, item) => sum + item.pricePerKg * item.cartQuantity, 0);
  const delivery = subtotal > 1000 ? 0 : 99;

  const close = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setCheckout(false);
      setComplete(false);
      setErrorMsg("");
    }
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsPlacing(true);

    try {
      const order = await placeOrder({
        buyer: buyerName,
        deliveryAddress: address,
        paymentMethod,
        items: cart.map((item) => ({
          listingId: item.id,
          cropName: item.cropName,
          quantity: item.cartQuantity,
          pricePerKg: item.pricePerKg,
        })),
        subtotal,
        delivery,
        totalAmount: subtotal + delivery,
      });

      setPlacedOrderId(order?.orderId || "K2K-84902");
      setComplete(true);
      toast.success(`Order ${order?.orderId || ""} confirmed! Sent to farmer.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {complete ? "Order confirmed" : checkout ? "Secure checkout" : "Your harvest basket"}
          </DialogTitle>
          <DialogDescription>
            {complete
              ? "The farmer and local hub have been notified."
              : "Fresh produce, sourced directly from verified farms."}
          </DialogDescription>
        </DialogHeader>

        {complete ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto size-16 text-primary" />
            <p className="mt-4 text-2xl font-bold text-ink">Thank you, {buyerName}!</p>
            <p className="mt-2 text-muted-foreground">
              Order <span className="font-mono font-bold text-primary">{placedOrderId}</span> is
              being prepared.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transporter assigned for route dispatch.
            </p>
            <Button className="mt-6" onClick={() => close(false)}>
              Continue shopping
            </Button>
          </div>
        ) : checkout ? (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-md border border-alert/30 bg-alert/10 p-3 text-xs text-alert">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Delivery Address
              </label>
              <Textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, Apartment/Shop, City, Pin"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-md border p-4 text-sm font-bold flex items-center gap-2 ${
                    paymentMethod === "UPI"
                      ? "border-primary bg-accent text-primary"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className="accent-primary"
                  />
                  Instant UPI
                </label>
                <label
                  className={`cursor-pointer rounded-md border p-4 text-sm font-bold flex items-center gap-2 ${
                    paymentMethod === "COD"
                      ? "border-primary bg-accent text-primary"
                      : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-primary"
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-ink">Backend validation enabled:</p>
              <p>Items inventory and pricing are verified before order confirmation.</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setCheckout(false)}>
                Back to basket
              </Button>
              <Button type="submit" disabled={isPlacing} className="flex-1">
                {isPlacing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-4" /> Processing order…
                  </>
                ) : (
                  `Place order · ₹${subtotal + delivery}`
                )}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-md border p-3">
                  <img src={item.imageUrl} alt="" className="size-14 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{item.cropName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.cartQuantity} kg · ₹{item.pricePerKg}/kg
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.cropName}`}
                  >
                    <X />
                  </Button>
                </div>
              ))}
              {!cart.length && (
                <div className="py-12 text-center text-muted-foreground">
                  <ShoppingCart className="mx-auto mb-3 size-9" />
                  Your basket is empty.
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <b>₹{subtotal}</b>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <b>{delivery ? `₹${delivery}` : "Free"}</b>
                </div>
                <div className="flex justify-between text-lg">
                  <b>Total</b>
                  <b>₹{subtotal + delivery}</b>
                </div>
                <Button className="mt-3 w-full" onClick={() => setCheckout(true)}>
                  Checkout <ArrowRight />
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FarmerView() {
  const { listings, orders, updateOrder, addListing } = useFarmConnect();
  const [tab, setTab] = useState("Dashboard");
  const [addOpen, setAddOpen] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  // In production, filtered by active farmer's session ID
  const farmerListings = listings;

  const handleAcceptOrder = async (orderId: string) => {
    setIsUpdatingOrder(orderId);
    try {
      await updateOrder(orderId, "FARMER_ACCEPTED");
      toast.success("Order accepted! Notified transporter for pickup.");
    } catch (err) {
      toast.error("Failed to accept order");
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  return (
    <>
      <PortalHeader
        eyebrow="Farmer portal"
        title="Namaste, Ramesh"
        copy="Farmer ID: FC-TG-MDL-26-000184 · Medak, Telangana"
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[210px_1fr]">
        <aside className="flex gap-2 overflow-x-auto lg:flex-col">
          {["Dashboard", "My Crops", "Orders", "Earnings"].map((item) => (
            <Button
              key={item}
              variant={tab === item ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setTab(item)}
            >
              {item}
            </Button>
          ))}
        </aside>
        <div className="min-w-0 space-y-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              icon={IndianRupee}
              label="Total earnings"
              value="₹1,84,620"
              trend="+18.4% this month"
            />
            <Metric icon={Clock3} label="Pending settlement" value="₹12,840" trend="Due tomorrow" />
            <Metric
              icon={Package}
              label="Active listings"
              value={String(farmerListings.length)}
              trend="Live in marketplace"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Add new crop
            </Button>
            <Button variant="outline">
              <Truck /> Request transport
            </Button>
          </div>
          {(tab === "Dashboard" || tab === "My Crops") && (
            <DataPanel title="My active crops">
              <div className="grid gap-4 sm:grid-cols-2">
                {farmerListings.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-md border p-4">
                    <img src={item.imageUrl} alt="" className="size-20 rounded-md object-cover" />
                    <div>
                      <b>{item.cropName}</b>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.availableQuantity} kg · ₹{item.pricePerKg}/kg
                      </p>
                      <span className="mt-2 inline-block text-xs font-semibold text-primary">
                        ID: {item.listingId} · {item.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DataPanel>
          )}
          {(tab === "Dashboard" || tab === "Orders") && (
            <DataPanel title="Recent orders">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="pb-3">Order</th>
                      <th>Buyer</th>
                      <th>Crop</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="py-4 font-semibold">{order.orderId}</td>
                        <td>{order.buyer}</td>
                        <td>
                          {order.cropName} · {order.quantity}kg
                        </td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <Status value={order.status} />
                        </td>
                        <td>
                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              disabled={isUpdatingOrder === order.id}
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              {isUpdatingOrder === order.id ? (
                                <Loader2 className="animate-spin size-3.5" />
                              ) : (
                                "Accept order"
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DataPanel>
          )}
          {tab === "Earnings" && (
            <DataPanel title="Settlement history">
              <div className="space-y-4">
                {[
                  "Sep 12 · UPI settlement",
                  "Sep 08 · UPI settlement",
                  "Sep 02 · Bank settlement",
                ].map((item, i) => (
                  <div key={item} className="flex justify-between border-b pb-4">
                    <span>{item}</span>
                    <b className="text-primary">
                      ₹{[12840, 28400, 19750][i]?.toLocaleString("en-IN")}
                    </b>
                  </div>
                ))}
              </div>
            </DataPanel>
          )}
        </div>
      </div>
      <AddCropDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addListing} />
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <span className="grid size-10 place-items-center rounded-md bg-accent text-primary">
        <Icon />
      </span>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-2 text-xs font-semibold text-primary">{trend}</p>
    </div>
  );
}

function DataPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-primary">
      {value.replaceAll("_", " ")}
    </span>
  );
}

function AddCropDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (listing: Omit<CropListing, "id" | "listingId" | "imageUrl">) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState("");
  const [variety, setVariety] = useState("");
  const [category, setCategory] = useState<"Vegetables" | "Fruits" | "Grains">("Vegetables");
  const [grade, setGrade] = useState("Grade A");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        farmerId: "FC-TG-184",
        farmerName: "Ramesh Naik",
        cropName: crop,
        variety,
        category,
        grade,
        availableQuantity: Number(quantity),
        pricePerKg: Number(price),
        harvestDate: "Tomorrow",
        location: "Medak, Telangana",
      });
      toast.success(`${crop} published to Khet2Kart marketplace!`);
      onOpenChange(false);
      setCrop("");
      setVariety("");
      setQuantity("");
      setPrice("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish listing";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a crop listing</DialogTitle>
          <DialogDescription>
            Publish your next harvest for verified buyers with backend validation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Crop Name</label>
            <Input
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              required
              placeholder="e.g. Tomatoes"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Variety</label>
            <Input
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              required
              placeholder="e.g. Arka Rakshak"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={category}
              onChange={(e) => setCategory(e.target.value as "Vegetables" | "Fruits" | "Grains")}
            >
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Grade</label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="Grade A">Grade A</option>
              <option value="Organic">Organic</option>
              <option value="Premium Export">Premium Export</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Quantity (kg)</label>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              type="number"
              placeholder="e.g. 500"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Price per kg (₹)</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              type="number"
              placeholder="e.g. 35"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="sm:col-span-2">
            {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Plus />}
            Publish listing
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransporterView() {
  const [tasks, setTasks] = useState<ApiTransporterTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.logistics.getTasks();
      if (res?.tasks) setTasks(res.tasks);
    } catch (err) {
      console.warn("Could not fetch remote tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const advance = async (id: number) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const nextStatus = current.status === "Pending Pickup" ? "In Transit" : "Delivered";

    setTasks((items) =>
      items.map((task) => (task.id === id ? { ...task, status: nextStatus } : task)),
    );

    try {
      await api.logistics.updateTask(id, nextStatus);
      toast.success(`Trip status updated: ${nextStatus}`);
    } catch (err) {
      toast.error("Failed to update status on backend");
    }
  };

  return (
    <>
      <PortalHeader
        eyebrow="Logistics control"
        title="Delivery operations"
        copy="Good morning, Ravi · Vehicle TS 09 AX 4271"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Metric
            icon={Package}
            label="Pending pickup"
            value={String(tasks.filter((t) => t.status === "Pending Pickup").length)}
            trend="Ready now"
          />
          <Metric
            icon={Truck}
            label="In transit"
            value={String(tasks.filter((t) => t.status === "In Transit").length)}
            trend="Live tracked"
          />
          <Metric
            icon={CheckCircle2}
            label="Delivered today"
            value={String(tasks.filter((t) => t.status === "Delivered").length)}
            trend="On schedule"
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {["Pending Pickup", "In Transit", "Delivered"].map((status) => (
            <section key={status} className="rounded-lg bg-muted p-4">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
                <span className="size-2 rounded-full bg-primary" />
                {status}
              </h2>
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <article key={task.id} className="mb-3 rounded-md border bg-card p-5 shadow-sm">
                    <div className="flex justify-between">
                      <b>{task.crop}</b>
                      <span className="text-sm text-primary font-bold">{task.quantity}</span>
                    </div>
                    <div className="my-5 space-y-3 text-sm">
                      <p>
                        <span className="text-muted-foreground">Pickup</span>
                        <br />
                        {task.from}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Drop</span>
                        <br />
                        {task.to}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4 text-sm">
                      <span className="font-bold">{task.distance}</span>
                      {status !== "Delivered" && (
                        <Button size="sm" onClick={() => advance(task.id)}>
                          {status === "Pending Pickup" ? "Start trip" : "Mark delivered"}
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function HubView() {
  const [shipments, setShipments] = useState<ApiHubShipment[]>([]);
  const [batch, setBatch] = useState(false);

  useEffect(() => {
    async function loadShipments() {
      try {
        const res = await api.logistics.getHubShipments();
        if (res?.shipments) setShipments(res.shipments);
      } catch (err) {
        console.warn("Could not load shipments", err);
      }
    }
    loadShipments();
  }, []);

  const handleApprove = async (id: string) => {
    setShipments((items) =>
      items.map((item) => (item.id === id ? { ...item, gradeStatus: "GRADE A APPROVED" } : item)),
    );
    try {
      await api.logistics.approveShipment(id);
      toast.success(`Shipment ${id} approved for aggregation.`);
    } catch (err) {
      toast.error("Failed to approve shipment");
    }
  };

  const handleSealBatch = async () => {
    setBatch(true);
    try {
      await api.logistics.sealBatch("Hyderabad Route · HYD-221", "4 farmer lots · 1,280 kg");
      toast.success("Delivery batch sealed & QR generated!");
    } catch (err) {
      toast.error("Batch seal failed");
    }
  };

  return (
    <>
      <PortalHeader
        eyebrow="Collection hub"
        title="Medak aggregation center"
        copy="Gate activity, quality checks and batch processing."
      />
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={Truck} label="Incoming today" value="18" trend="4 arriving this hour" />
          <Metric icon={Package} label="Inventory" value="8.4 t" trend="72% capacity" />
          <Metric icon={Gauge} label="Quality pass rate" value="96.8%" trend="Above target" />
        </div>
        <DataPanel title="Incoming shipments">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3">Shipment</th>
                  <th>Farmer</th>
                  <th>Produce</th>
                  <th>ETA</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-4 font-bold">{item.id}</td>
                    <td>{item.farmer}</td>
                    <td>
                      {item.crop} · {item.qty}
                    </td>
                    <td>{item.eta}</td>
                    <td>
                      {item.gradeStatus === "GRADE A APPROVED" ? (
                        <Status value="GRADE A APPROVED" />
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(item.id)}>
                          Approve grade
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
        <DataPanel title="Batch processing">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-md bg-muted p-5">
            <div>
              <p className="font-bold">Hyderabad Route · HYD-221</p>
              <p className="mt-1 text-sm text-muted-foreground">
                4 farmer lots · 1,280 kg · departure at 16:00
              </p>
            </div>
            {batch ? (
              <span className="flex items-center gap-2 font-bold text-primary">
                <CheckCircle2 /> Batch sealed
              </span>
            ) : (
              <Button onClick={handleSealBatch}>
                <Package /> Create batch
              </Button>
            )}
          </div>
        </DataPanel>
      </div>
    </>
  );
}

function AdminView() {
  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [resolved, setResolved] = useState(false);
  const barHeights = [
    "h-[32%]",
    "h-[48%]",
    "h-[41%]",
    "h-[65%]",
    "h-[59%]",
    "h-[78%]",
    "h-[86%]",
    "h-full",
  ];
  const mixWidths = ["w-[69%]", "w-[21%]", "w-[7%]", "w-[3%]"];

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await api.platform.getAdminUsers();
        if (res?.users) setUsers(res.users);
      } catch (err) {
        console.warn("Could not load users", err);
      }
    }
    loadAdminData();
  }, []);

  const handleVerify = async (id: string) => {
    setUsers((items) => items.map((u) => (u.id === id ? { ...u, status: "VERIFIED" } : u)));
    try {
      await api.platform.verifyUser(id);
      toast.success(`User ${id} marked as verified.`);
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleResolve = async () => {
    setResolved(true);
    try {
      await api.platform.resolveDispute();
      toast.success("Dispute resolved with audit note.");
    } catch (err) {
      toast.error("Failed to resolve dispute");
    }
  };

  return (
    <>
      <PortalHeader
        eyebrow="Platform intelligence"
        title="Operations overview"
        copy="Network performance and trust signals across Khet2Kart."
      />
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={BadgeIndianRupee}
            label="Platform GMV"
            value="₹4.82 Cr"
            trend="+24.6% MoM"
          />
          <Metric icon={Users} label="Verified users" value="12,408" trend="+436 this month" />
          <Metric icon={Warehouse} label="Active hubs" value="34" trend="Across 8 states" />
          <Metric icon={Activity} label="System health" value="99.98%" trend="All systems normal" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <DataPanel title="GMV growth">
            <div className="flex h-56 items-end gap-3 border-b border-l px-4">
              {[32, 48, 41, 65, 59, 78, 86, 100].map((height, i) => (
                <div
                  key={height}
                  className={`group relative flex-1 rounded-t-sm bg-primary/20 transition hover:bg-primary ${barHeights[i]}`}
                >
                  <span className="absolute -top-6 hidden w-full text-center text-xs group-hover:block">
                    ₹{height}L
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Feb</span>
              <span>Sep</span>
            </div>
          </DataPanel>
          <DataPanel title="Network mix">
            <div className="space-y-5">
              {[
                ["Farmers", "69%"],
                ["Buyers", "21%"],
                ["Transporters", "7%"],
                ["Hub teams", "3%"],
              ].map(([label, value], index) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className={`h-full rounded-full bg-primary ${mixWidths[index]}`} />
                  </div>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>
        <DataPanel title="User verification">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3">ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-4 font-bold">{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.type}</td>
                    <td>{user.location}</td>
                    <td>
                      {user.status === "VERIFIED" ? (
                        <Status value="VERIFIED" />
                      ) : (
                        <Button size="sm" onClick={() => handleVerify(user.id)}>
                          Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
        <DataPanel title="Dispute resolution">
          {resolved ? (
            <p className="flex items-center gap-2 text-primary font-bold">
              <CheckCircle2 /> All flagged cases are resolved.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-alert/30 bg-alert/5 p-4">
              <div>
                <b>K2K-84274 · Delivery delayed 7 hours</b>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buyer: Urban Plate · Transporter: RK Logistics
                </p>
              </div>
              <Button variant="outline" onClick={handleResolve}>
                Resolve case
              </Button>
            </div>
          )}
        </DataPanel>
      </div>
    </>
  );
}

/**
 * Enhanced Farmer Onboarding Dialog with Phone OTP Generation & Verification
 */
function OnboardingDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const { refreshData } = useFarmConnect();

  // Wizard state: 1: Basic Info, 2: OTP Verification, 3: Farm Details, 4: Geotag Map, 5: Success Pass
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1: Basic Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Telangana");
  const [district, setDistrict] = useState("Medak");

  const availableDistricts = useMemo(() => {
    return getDistrictsForState(state);
  }, [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0 && districts[0]) {
      setDistrict(districts[0]);
    } else {
      setDistrict("");
    }
  };

  // Step 2: OTP Verification
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [timer, setTimer] = useState(0);

  // Step 3: Farm Details
  const [farmArea, setFarmArea] = useState("");
  const [mainCrops, setMainCrops] = useState("");
  const [village, setVillage] = useState("");
  const [yearsFarming, setYearsFarming] = useState("");

  // Step 4: Map Location
  const [position, setPosition] = useState<[number, number]>([17.8714, 78.1108]);

  // Step 5: Confirmed Registration
  const [registeredFarmer, setRegisteredFarmer] = useState<
    FarmerRegistrationResponse["farmer"] | null
  >(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const close = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setTimeout(() => {
        setStep(1);
        setErrorMsg("");
        setOtp("");
      }, 250);
    }
  };

  // 1. Send OTP
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate 10-digit Indian phone
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)");
      return;
    }

    setLoading(true);
    try {
      await api.auth.sendOtp(phone.trim());
      setTimer(30);
      setStep(2);
      toast.success(`Verification OTP sent to +91 ${phone}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(phone.trim(), otp.trim());
      setVerificationToken(res.verificationToken);
      setStep(3);
      toast.success("Phone verified successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid OTP";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Farm Details
  const handleFarmDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (Number(farmArea) <= 0) {
      setErrorMsg("Farm area must be greater than 0 acres");
      return;
    }
    setStep(4);
  };

  // 4. Submit Registration to Backend
  const handleFinalSubmit = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.auth.registerFarmer({
        name,
        phone: phone.trim(),
        state,
        district,
        village,
        farmArea: Number(farmArea),
        mainCrops,
        yearsFarming: yearsFarming ? Number(yearsFarming) : 0,
        coordinates: position,
        verificationToken,
      });

      setRegisteredFarmer(res.farmer);
      setStep(5);
      toast.success("Farmer registration confirmed!");
      refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete registration";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 5
              ? "Welcome to Khet2Kart"
              : step === 2
                ? "Phone Verification (OTP)"
                : "Become a verified farmer"}
          </DialogTitle>
          <DialogDescription>
            {step === 5
              ? "Your direct-to-market journey starts today."
              : `Step ${step} of 4 · Government-compliant farmer onboarding with OTP verification.`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full ${step >= item ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-md border border-alert/30 bg-alert/10 p-3 text-xs text-alert font-medium">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Name, Phone, State, District */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Naik"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                10-digit Mobile Number
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  +91
                </span>
                <Input
                  required
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="pl-12 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">State</label>
              <select
                required
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">District</label>
              <select
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {availableDistricts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="size-4 text-primary" /> OTP Verification Guarantee
              </p>
              <p className="mt-0.5">
                We will send a 6-digit verification code to this phone number to secure your farmer
                account.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="sm:col-span-2">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 size-4" /> Sending OTP…
                </>
              ) : (
                <>
                  Send Verification OTP <ArrowRight className="ml-1" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-md border border-primary/25 bg-accent/50 p-4 text-sm">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Phone className="size-4" /> Enter 6-digit OTP
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                We sent an OTP code via SMS to <b className="text-ink">+91 {phone}</b>. Valid for 5
                minutes.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Verification Code
              </label>
              <Input
                required
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="mt-1 text-center font-mono text-2xl tracking-[0.5em]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Didn't receive the code?</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={timer > 0 || loading}
                onClick={handleSendOtp}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Change Number
              </Button>
              <Button type="submit" disabled={loading || otp.length !== 6} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-4" /> Verifying…
                  </>
                ) : (
                  <>
                    Verify & Continue <ArrowRight className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Farm details */}
        {step === 3 && (
          <form onSubmit={handleFarmDetailsSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Farm Area (Acres)
              </label>
              <Input
                required
                type="number"
                min="0.1"
                step="0.1"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                placeholder="e.g. 4.5"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Main Crops Grown
              </label>
              <Input
                required
                value={mainCrops}
                onChange={(e) => setMainCrops(e.target.value)}
                placeholder="e.g. Tomatoes, Fresh Okra, Rice"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Village / Mandal
              </label>
              <Input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Narsapur"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Years Farming</label>
              <Input
                type="number"
                min="0"
                value={yearsFarming}
                onChange={(e) => setYearsFarming(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue to Geotag <ArrowRight />
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Map Location */}
        {step === 4 && (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              Tap the map to pin your farm’s exact geotag location for pickup logistics.
            </p>
            <Suspense
              fallback={
                <div className="grid h-64 place-items-center rounded-lg bg-muted">Loading map…</div>
              }
            >
              <FarmMap position={position} onChange={setPosition} />
            </Suspense>
            <p className="mt-3 text-xs font-mono text-muted-foreground">
              Pinned GPS Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button className="flex-1" disabled={loading} onClick={handleFinalSubmit}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-4" /> Registering with Backend…
                  </>
                ) : (
                  "Submit registration"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success ID card */}
        {step === 5 && (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-accent text-primary">
              <Sprout className="size-10" />
            </span>
            <p className="mt-5 text-2xl font-extrabold text-ink">
              Namaste, {registeredFarmer?.name || name}!
            </p>
            <p className="mt-2 text-muted-foreground">
              Your verified Farmer ID has been generated:
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-lg border-2 border-dashed border-primary bg-accent/40 p-5 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Khet2Kart Verified Producer
                  </span>
                  <p className="font-mono text-lg font-extrabold text-primary">
                    {registeredFarmer?.farmerId || "FC-TG-MDL-26-000185"}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  ACTIVE
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-primary/20 pt-3 text-muted-foreground">
                <p>
                  Phone: <b className="text-ink font-mono">+91 {phone}</b>
                </p>
                <p>
                  Location:{" "}
                  <b className="text-ink">
                    {district}, {state}
                  </b>
                </p>
              </div>
            </div>
            <Button
              className="mt-6"
              onClick={() => {
                close(false);
                if (onSuccess) onSuccess();
              }}
            >
              Enter Farmer Portal
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Footer({ onRole }: { onRole: (role: Role) => void }) {
  return (
    <footer className="border-t bg-ink text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-xl font-extrabold">
            <span className="grid size-9 place-items-center rounded-md bg-primary">
              <Sprout />
            </span>
            Khet2Kart
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/55">
            A fairer, faster agricultural supply chain for India’s farmers and buyers.
          </p>
        </div>
        <div>
          <p className="font-bold">Explore</p>
          <div className="mt-4 grid gap-2">
            {roles.slice(0, 3).map((role) => (
              <Button
                key={role.id}
                variant="link"
                className="h-auto justify-start p-0 text-primary-foreground/60"
                onClick={() => onRole(role.id)}
              >
                {role.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold">Operations</p>
          <div className="mt-4 grid gap-2">
            {roles.slice(3).map((role) => (
              <Button
                key={role.id}
                variant="link"
                className="h-auto justify-start p-0 text-primary-foreground/60"
                onClick={() => onRole(role.id)}
              >
                {role.label} portal
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-5 text-center text-xs text-primary-foreground/45">
        © 2026 Khet2Kart · Built for SIH 2026 · Made for India’s food economy
      </div>
    </footer>
  );
}
