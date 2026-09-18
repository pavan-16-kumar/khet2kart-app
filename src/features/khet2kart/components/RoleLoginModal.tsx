import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFarmConnect } from "../FarmContext";
import { type AppRole } from "@/lib/api";
import { AuthForms } from "./auth/AuthForms";
import {
  Sprout,
  Store,
  Truck,
  ShoppingCart,
  Shield,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

interface RoleLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleMeta: Record<
  AppRole,
  {
    title: string;
    subtitle: string;
    icon: typeof Sprout;
    accentBg: string;
  }
> = {
  CUSTOMER: {
    title: "Customer Marketplace",
    subtitle: "Fresh farm-to-fork cart & order tracking",
    icon: ShoppingCart,
    accentBg: "bg-green-100 text-green-700 border-green-200",
  },
  FARMER: {
    title: "Farmer Portal",
    subtitle: "Harvest listings, sales ledger & direct payouts",
    icon: Sprout,
    accentBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  DELIVERY_PARTNER: {
    title: "Delivery Partner",
    subtitle: "GPS transit dispatch & driver tasks",
    icon: Truck,
    accentBg: "bg-amber-100 text-amber-700 border-amber-200",
  },
  STORE_MANAGER: {
    title: "Store / Hub Manager",
    subtitle: "Hub intake inspection & batch dispatch",
    icon: Store,
    accentBg: "bg-purple-100 text-purple-700 border-purple-200",
  },
  ADMIN: {
    title: "Admin Control Tower",
    subtitle: "Full governance, RBAC permissions & KPIs",
    icon: Shield,
    accentBg: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export function RoleLoginModal({ open, onOpenChange }: RoleLoginModalProps) {
  const { isRoleAllowed } = useFarmConnect();
  const [selectedRole, setSelectedRole] = useState<AppRole>("CUSTOMER");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const currentMeta = roleMeta[selectedRole]!;
  const IconComponent = currentMeta.icon;
  const isAllowed = isRoleAllowed(selectedRole);

  const handleRoleChange = (newRole: AppRole) => {
    setSelectedRole(newRole);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleAuthSuccess = () => {
    setSuccessMsg(`Welcome to the ${currentMeta.title}!`);
    setTimeout(() => {
      onOpenChange(false);
      setSuccessMsg("");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-[1.5rem] border border-green-100 bg-white shadow-2xl text-slate-900">
        
        {/* Subtle Header Pattern */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50 to-white/0 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-green-100 border border-green-200 text-green-700 shadow-sm">
              <Leaf className="size-7" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-green-950">
                Welcome to Khet2Kart
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Connecting farmers directly with buyers
              </DialogDescription>
            </div>
          </div>

          {/* 1. ROLE SELECTION DROPDOWN */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-green-800 flex items-center gap-1.5 ml-1">
              <Fingerprint className="size-3.5" /> Select Account Type
            </label>

            <Select value={selectedRole} onValueChange={(val) => handleRoleChange(val as AppRole)}>
              <SelectTrigger className="w-full h-14 border border-green-200 bg-white px-4 rounded-xl hover:bg-green-50 transition-colors focus:ring-2 focus:ring-green-500/50 text-slate-900 shadow-sm">
                <div className="flex items-center gap-3 text-left w-full mr-2">
                  <div className={`size-9 rounded-lg border grid place-items-center shrink-0 ${currentMeta.accentBg}`}>
                    <IconComponent className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{currentMeta.title}</span>
                      {isAllowed ? (
                        <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-200 px-1.5 py-0 h-4.5">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-500 border-slate-200 px-1.5 py-0 h-4.5">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SelectTrigger>

              <SelectContent className="max-h-80 rounded-xl border-green-100 bg-white text-slate-900">
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-slate-500 px-2 py-2">
                    Available Roles
                  </SelectLabel>
                  {(Object.keys(roleMeta) as AppRole[]).map((r) => {
                    const meta = roleMeta[r]!;
                    const RIcon = meta.icon;
                    return (
                      <SelectItem key={r} value={r} className="py-3 cursor-pointer rounded-lg focus:bg-green-50 focus:text-green-900">
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`size-8 rounded-md border grid place-items-center ${meta.accentBg}`}>
                              <RIcon className="size-4" />
                            </span>
                            <div>
                              <p className="font-semibold text-xs text-slate-900">{meta.title}</p>
                              <p className="text-[10px] text-slate-500">{meta.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* 2. AUTHENTICATION METHODS */}
          <div className="pt-2">
            <AuthForms 
              role={selectedRole}
              onSuccess={handleAuthSuccess}
              onError={setErrorMsg}
            />
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 flex items-center gap-3">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 flex items-center gap-3">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
