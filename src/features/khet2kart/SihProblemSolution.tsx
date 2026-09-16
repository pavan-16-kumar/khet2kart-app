import { useState } from "react";
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Truck,
  MapPin,
  QrCode,
  IndianRupee,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  Search,
  ShoppingCart,
  Check,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SihProblemSolutionProps {
  onRegisterFarmer: () => void;
  onExploreMarketplace: () => void;
}

export function SihProblemSolutionSection({
  onRegisterFarmer,
  onExploreMarketplace,
}: SihProblemSolutionProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "comparison">("overview");

  const impactMetrics = [
    {
      value: "+35%",
      label: "Farmer Income",
      subtext: "Direct realization without middlemen commissions",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      value: "15–20%",
      label: "Consumer Savings",
      subtext: "Eliminates multi-tier retail markups",
      icon: TrendingDown,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      value: "<24 hrs",
      label: "Farm-to-Doorstep",
      subtext: "Direct dispatch avoids mandi yard delays",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      value: "20%",
      label: "Lower Transport Loss",
      subtext: "Reduced handling cycles & route optimization",
      icon: Truck,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      value: "4–6",
      label: "Middle Tiers Removed",
      subtext: "Dalals, brokers & wholesalers bypassed",
      icon: Layers,
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      value: "65–75%",
      label: "Farmer's Share",
      subtext: "Compared to barely ~30% in traditional mandis",
      icon: IndianRupee,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  const pipelineSteps = [
    {
      step: "01",
      title: "Farm GPS Pinning",
      subtitle: "Location Privacy Masked",
      desc: "Farmers select farm coordinates via interactive map. Exact residence coordinates remain obfuscated to buyers for complete privacy.",
      icon: MapPin,
      badge: "GPS Masked",
    },
    {
      step: "02",
      title: "Unique Digital Farmer ID",
      subtitle: "Verified Credit & Identity",
      desc: "Every onboarded grower receives a verifiable ID (e.g. FC-TG-MED-26-000185) building a credible transaction history for financial inclusion.",
      icon: QrCode,
      badge: "Credit Ready",
    },
    {
      step: "03",
      title: "Crop Lot Listing",
      subtitle: "Farmer-Set Fair Pricing",
      desc: "List fresh harvests with category, variety, grade, and transparent price per kg, setting clear expectations before pickup.",
      icon: Layers,
      badge: "Transparent",
    },
    {
      step: "04",
      title: "Partial-Qty Cart Hold",
      subtitle: "10-Minute Anti-Collision",
      desc: "Buyers can purchase exact quantities needed (no forced bulk dumping). Real-time 10-minute stock reservation prevents dual-buyer collisions.",
      icon: ShoppingCart,
      badge: "10-Min Hold",
    },
    {
      step: "05",
      title: "Auto Farm-Gate Pickup",
      subtitle: "Smart VRP Routing",
      desc: "Vehicle Routing Problem (VRP) algorithms group nearby farm collections, dispatching local transporters straight to the farm gate.",
      icon: Truck,
      badge: "VRP Routed",
    },
    {
      step: "06",
      title: "Secure Direct Payment",
      subtitle: "Instant Escrow Release",
      desc: "Buyer payments are held in escrow and disbursed directly to the farmer's bank or UPI upon verified delivery receipt.",
      icon: CheckCircle2,
      badge: "Instant UPI",
    },
  ];

  const comparisonRows = [
    {
      metric: "Coverage Scope",
      khet2kart: "Multi-state, rural-first network",
      enam: "Pan-India, mandi-dependent",
      mandi: "Local physical yard only",
      fpo: "District/society level",
      highlight: true,
    },
    {
      metric: "Intermediary Removal",
      khet2kart: "Full (Direct Farmer ⇄ Buyer)",
      enam: "Partial (still via registered traders)",
      mandi: "None (4–6 middleman layers)",
      fpo: "Partial (via FPO management)",
      highlight: true,
    },
    {
      metric: "Quantity Flexibility",
      khet2kart: "Partial-lot buying supported",
      enam: "Bulk whole-lot auctions only",
      mandi: "Bulk truck lots only",
      fpo: "Pooled bulk lots only",
      highlight: true,
    },
    {
      metric: "Farm-Gate Pickup",
      khet2kart: "Automated, VRP-routed pickup",
      enam: "Not available (farmer brings produce)",
      mandi: "Farmer transports at own expense",
      fpo: "Manual coordination required",
      highlight: true,
    },
    {
      metric: "Farmer Identity",
      khet2kart: "Unique Digital Farmer ID + Ledger",
      enam: "Trader-centric licensing",
      mandi: "No digital identity",
      fpo: "Local member ID only",
      highlight: true,
    },
    {
      metric: "Location Privacy",
      khet2kart: "GPS-masked waypoints",
      enam: "Not applicable",
      mandi: "Not applicable",
      fpo: "Not applicable",
      highlight: false,
    },
    {
      metric: "Payment Settlement",
      khet2kart: "Instant secure UPI escrow (<24h)",
      enam: "1–3 bank working days",
      mandi: "Cash, delayed or commission docked",
      fpo: "Weekly / periodic settlements",
      highlight: true,
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-border/80 bg-linear-to-b from-card via-background to-muted/40 py-20">
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -left-48 top-0 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 size-96 rounded-full bg-harvest/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top SIH 2026 Hackathon Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-accent/30 to-harvest/10 p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3.5">
            <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Award className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-primary-foreground">
                  Smart India Hackathon 2026
                </span>
                <span className="rounded-full border border-primary/30 bg-background/80 px-2.5 py-0.5 text-xs font-mono font-bold text-ink">
                  ID: SIH26033
                </span>
                <span className="hidden rounded-full bg-harvest/20 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 md:inline">
                  PS Category: Software
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground/90">
                Theme:{" "}
                <span className="font-bold text-primary">
                  Agriculture, FoodTech & Rural Development
                </span>{" "}
                · Team: <span className="font-bold text-ink">Khet2Kart</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className="rounded-full text-xs font-bold"
            >
              Problem & Solution
            </Button>
            <Button
              size="sm"
              variant={activeTab === "pipeline" ? "default" : "outline"}
              onClick={() => setActiveTab("pipeline")}
              className="rounded-full text-xs font-bold"
            >
              6-Step Architecture
            </Button>
            <Button
              size="sm"
              variant={activeTab === "comparison" ? "default" : "outline"}
              onClick={() => setActiveTab("comparison")}
              className="rounded-full text-xs font-bold"
            >
              Mandi Benchmark
            </Button>
          </div>
        </div>

        {/* Tab 1: Problem vs Solution Deep-Dive */}
        {activeTab === "overview" && (
          <div className="mt-12 space-y-12 animate-in fade-in-50 duration-300">
            {/* Split Comparison Cards */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* THE PROBLEM STATEMENT CARD */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-500/20 bg-linear-to-br from-rose-500/4 via-card to-background p-6 sm:p-8 shadow-sm">
                <div className="absolute right-4 top-4 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  The Problem (SIH26033)
                </div>

                <div>
                  <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="size-5" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Core Challenge Identified
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">
                    Multiple Intermediaries Reduce Farmers’ Earnings & Increase Consumer Prices
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Traditional Indian agricultural mandis involve 4 to 6 middle tiers (village
                    collectors, mandi dalals, commission agents, wholesalers, and retail chains).
                    Each handoff extracts margin without adding tangible product value.
                  </p>

                  {/* Pain Point List */}
                  <div className="mt-6 space-y-3.5">
                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/15 bg-background/60 p-3.5 backdrop-blur-sm">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-xs font-black text-rose-600 dark:text-rose-400">
                        1
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Farmers Receive Only ~30% of Consumer Rupee
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Up to 70% of produce spend is swallowed by commission agents, transport
                          tolls, and mandi yard fees.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/15 bg-background/60 p-3.5 backdrop-blur-sm">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-xs font-black text-rose-600 dark:text-rose-400">
                        2
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Forced Distress Selling & Price Gouging
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Smallholders must liquidate whole lots at unremunerative prices due to
                          lack of partial-lot buyers and cold logistics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/15 bg-background/60 p-3.5 backdrop-blur-sm">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-xs font-black text-rose-600 dark:text-rose-400">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          20%+ Harvest Spoilage in Transit
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Repeated unscientific unloading, double handling in congested mandis, and
                          deadhead trips cause immense post-harvest loss.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <span className="font-extrabold">Mandi Reality:</span> In the status quo,
                    consumers pay 2.5x more while growers incur debts despite bountiful harvests.
                  </p>
                </div>
              </div>

              {/* THE KHET2KART SOLUTION CARD */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/5 via-card to-background p-6 sm:p-8 shadow-sm">
                <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  The Innovation Solution
                </div>

                <div>
                  <div className="flex items-center gap-2.5 text-primary">
                    <Sparkles className="size-5" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      SIH 2026 Software Implementation
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">
                    A Unified Platform Connecting Farmers, Buyers & Local Transporters
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Khet2Kart delivers end-to-end disintermediation: growers list harvests with
                    transparent pricing, buyers reserve partial lots, and local transporters execute
                    farm-gate pickups with route optimization.
                  </p>

                  {/* Solution Highlights */}
                  <div className="mt-6 space-y-3.5">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/60 p-3.5 backdrop-blur-sm">
                      <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Verified Digital Farmer ID & Ledger
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Every grower gets a unique digital ID and immutable transaction record,
                          unlocking institutional credit without collateral.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/60 p-3.5 backdrop-blur-sm">
                      <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Partial Lot Buying & 10-Min Stock Hold
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Farmers sell exact quantities required. 10-minute temporary cart holds
                          eliminate double-selling conflicts.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-background/60 p-3.5 backdrop-blur-sm">
                      <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Smart Farm-Gate VRP Pickup & Location Privacy
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Vehicle Routing Problem (VRP) algorithms dispatch local transporters
                          directly to farms while masking private GPS coordinates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Guaranteed Farmer Share
                    </p>
                    <p className="text-xl font-extrabold text-ink">65% – 75% of Consumer Rupee</p>
                  </div>
                  <Button size="sm" onClick={onRegisterFarmer} className="gap-1.5 font-bold">
                    Register Farmer <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Impact Metrics Grid (Directly from Page 5 of PDF) */}
            <div>
              <div className="text-center">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                  Quantified Impact & Benefits
                </span>
                <h4 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                  Cutting the Middleman Pays Off For Everyone
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Data-backed outcomes evaluated against traditional mandi baselines.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {impactMetrics.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border ${item.bg} p-5 text-center transition-all hover:scale-[1.02]`}
                  >
                    <item.icon className={`mx-auto size-6 ${item.color}`} />
                    <p className="mt-3 font-display text-2xl font-black text-ink sm:text-3xl">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                      {item.subtext}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 6-Step Solution Architecture Flow (Directly from Page 2 of PDF) */}
        {activeTab === "pipeline" && (
          <div className="mt-12 animate-in fade-in-50 duration-300">
            <div className="text-center">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                End-To-End Architecture Pipeline
              </span>
              <h3 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                The Khet2Kart 6-Step Flow: From Soil to Doorstep
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                How our integrated Python FastAPI backend, Leaflet GPS pinning, and React frontend
                work in unison.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pipelineSteps.map((step) => (
                <div
                  key={step.step}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-muted-foreground/30 group-hover:text-primary/40">
                      {step.step}
                    </span>
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">
                      {step.badge}
                    </span>
                  </div>
                  <div className="my-4">
                    <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <step.icon className="size-5" />
                    </div>
                    <h4 className="text-lg font-bold text-ink">{step.title}</h4>
                    <p className="text-xs font-semibold text-primary mt-0.5">{step.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary/60 transition-all group-hover:w-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Stack callout from Page 3 */}
            <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-primary/10 p-2 text-primary">
                  <Zap className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-primary">
                    Frontend (Design & App)
                  </p>
                  <p className="text-sm font-extrabold text-ink mt-0.5">React 19 + Tailwind CSS</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    TypeScript, Vite, Leaflet interactive maps with India state & district
                    selectors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <Lock className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
                    Backend (Server & APIs)
                  </p>
                  <p className="text-sm font-extrabold text-ink mt-0.5">Python FastAPI + Uvicorn</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pydantic v2 validation, rate-limited cellular SMS OTP dispatch, and location
                    privacy masking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                  <Layers className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                    Data & Logistics
                  </p>
                  <p className="text-sm font-extrabold text-ink mt-0.5">Smart VRP Routing & Hubs</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automated transporter task generation, Grade A hub verification, and instant
                    batch sealing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Mandi vs Khet2Kart Comparison Matrix (Page 6 of PDF) */}
        {activeTab === "comparison" && (
          <div className="mt-12 animate-in fade-in-50 duration-300">
            <div className="text-center">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                Competitive Benchmark
              </span>
              <h3 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                Research & References: Why Khet2Kart Outperforms Existing Channels
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Rigorous benchmarking against e-NAM electronic auctions, traditional APMC mandis,
                and FPO apps.
              </p>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="p-4 font-extrabold text-ink">Key Metric</th>
                    <th className="p-4 font-black text-primary bg-primary/5 border-x border-primary/20">
                      🌾 KHET2KART (Our Solution)
                    </th>
                    <th className="p-4 font-bold text-muted-foreground">e-NAM Portal</th>
                    <th className="p-4 font-bold text-muted-foreground">Traditional Mandi</th>
                    <th className="p-4 font-bold text-muted-foreground">FPO Apps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonRows.map((row) => (
                    <tr key={row.metric} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-ink">{row.metric}</td>
                      <td className="p-4 font-extrabold text-primary bg-primary/5 border-x border-primary/20">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="size-4 shrink-0 text-emerald-500" />
                          {row.khet2kart}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{row.enam}</td>
                      <td className="p-4 text-muted-foreground">{row.mandi}</td>
                      <td className="p-4 text-muted-foreground">{row.fpo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Evaluated with Agmarknet price spreads, FPO cooperative hub dynamics, and e-NAM
                  auction cartel gaps.
                </p>
              </div>
              <Button
                size="sm"
                onClick={onExploreMarketplace}
                variant="outline"
                className="font-bold"
              >
                View Live Produce Marketplace <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
