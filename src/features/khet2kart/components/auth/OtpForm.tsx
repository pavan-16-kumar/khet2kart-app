import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import type { AppRole } from "@/lib/api";

interface OtpFormProps {
  role: AppRole;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function OtpForm({ role, onSuccess, onError }: OtpFormProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    
    setLoading(true);
    try {
      const options: any = {
        data: { role } // Pass the selected role in user metadata
      };

      let error;
      if (method === "email") {
        const { error: err } = await supabase.auth.signInWithOtp({
          email: contact,
          options
        });
        error = err;
      } else {
        const { error: err } = await supabase.auth.signInWithOtp({
          phone: contact,
          options
        });
        error = err;
      }

      if (error) throw error;
      
      setStep("verify");
      setCountdown(30);
    } catch (err: any) {
      onError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      let error;
      if (method === "email") {
        const { error: err } = await supabase.auth.verifyOtp({
          email: contact,
          token: otp,
          type: 'email'
        });
        error = err;
      } else {
        const { error: err } = await supabase.auth.verifyOtp({
          phone: contact,
          token: otp,
          type: 'sms'
        });
        error = err;
      }

      if (error) throw error;
      
      onSuccess();
    } catch (err: any) {
      onError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <button type="button" onClick={() => setStep("input")} className="hover:text-white transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <span>Sent to {contact}</span>
        </div>
        
        <div className="flex justify-center py-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot 
                  key={index} 
                  index={index} 
                  className="size-12 rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-white shadow-inner focus:ring-2 focus:ring-indigo-500/50" 
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : "Verify OTP"}
        </Button>
        
        <div className="text-center mt-2">
          <button 
            type="button" 
            disabled={countdown > 0} 
            onClick={handleSendOtp}
            className="text-xs font-medium text-slate-400 hover:text-white disabled:opacity-50"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4">
      <div className="flex rounded-xl bg-black/40 p-1 border border-white/5 text-xs mb-4">
        <button
          type="button"
          onClick={() => { setMethod("email"); setContact(""); }}
          className={`flex-1 rounded-lg py-2 font-bold transition-all ${method === "email" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => { setMethod("phone"); setContact(""); }}
          className={`flex-1 rounded-lg py-2 font-bold transition-all ${method === "phone" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
        >
          Phone
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {method === "email" ? "Email Address" : "Phone Number (E.164 format)"}
        </label>
        <Input
          type={method === "email" ? "email" : "tel"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={method === "email" ? "pavan@example.com" : "+919876543210"}
          required
          className="h-12 bg-black/40 border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !contact}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
      >
        {loading ? <Loader2 className="size-5 animate-spin" /> : "Send OTP"}
      </Button>
    </form>
  );
}
