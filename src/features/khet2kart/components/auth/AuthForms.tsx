import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type AppRole } from "@/lib/api";
import { Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthFormsProps {
  role: AppRole;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function AuthForms({ role, onSuccess, onError }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");

    try {
      if (isLogin) {
        const res = await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
        if (res.success && res.verificationToken) {
          localStorage.setItem("k2k_session_user", JSON.stringify(res.user));
          await supabase.auth.setSession({
            access_token: res.verificationToken,
            refresh_token: "", // Usually handled securely via Supabase cookies/storage natively, but this syncs our state
          });
          onSuccess();
        }
      } else {
        const res = await api.auth.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role,
        });
        if (res.success && res.verificationToken) {
          localStorage.setItem("k2k_session_user", JSON.stringify(res.user));
          await supabase.auth.setSession({
            access_token: res.verificationToken,
            refresh_token: "",
          });
          onSuccess();
        }
      }
    } catch (err: any) {
      onError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // Note: Supabase will redirect the browser here
    } catch (err: any) {
      onError(err.message || "Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-green-50 rounded-xl border border-green-100">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            isLogin ? "bg-white text-green-900 shadow-sm" : "text-green-600 hover:text-green-800"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            !isLogin ? "bg-white text-green-900 shadow-sm" : "text-green-600 hover:text-green-800"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-900">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-green-600/50" />
                <Input
                  required
                  placeholder="Ramesh Naik"
                  className="pl-9 border-green-200 focus-visible:ring-green-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-green-900">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-green-600/50" />
                <Input
                  placeholder="9876543210"
                  type="tel"
                  className="pl-9 border-green-200 focus-visible:ring-green-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-green-900">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-green-600/50" />
            <Input
              required
              type="email"
              placeholder="you@example.com"
              className="pl-9 border-green-200 focus-visible:ring-green-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-green-900">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-green-600/50" />
            <Input
              required
              type="password"
              placeholder="••••••••"
              className="pl-9 border-green-200 focus-visible:ring-green-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLogin ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-green-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-green-600 font-medium">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full border-green-200 hover:bg-green-50 text-green-800 h-11"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </Button>
    </div>
  );
}
