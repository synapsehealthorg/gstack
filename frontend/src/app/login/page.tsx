"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    let result;
    if (isLogin) {
      result = await login(formData);
    } else {
      result = await signup(formData);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result && "success" in result && result.success) {
      setSuccess(result.success);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null); setSuccess(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (oauthError) { setError(oauthError.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-cyan-100">
      {/* Container simulating a browser layout */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Auth Card & Bottom Promo Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Main Auth Form Card */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-md border border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              {/* Logo / Branding */}
              <div className="text-xl font-extrabold tracking-tight text-slate-900 mb-8 flex items-center gap-1">
                proov<span className="text-cyan-500">.</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {isLogin ? "Welcome back" : "Welcome to proov"}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {isLogin 
                    ? "Log in to view design briefs, generate instant techpacks, and secure payments with escrow in one place."
                    : "Create an account to start collaborate, design briefs, generate techpacks, and secure escrow contracts."
                  }
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              {success && <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{success}</div>}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name (Only on Signup) */}
                {!isLogin && (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm"
                    />
                  </div>
                )}

                {/* Role dropdown (Only on Signup) */}
                {!isLogin && (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </span>
                    <select
                      name="role"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm appearance-none"
                    >
                      <option value="buyer">Buyer (Brand / Creator)</option>
                      <option value="manufacturer">Manufacturer / Factory</option>
                    </select>
                  </div>
                )}

                {/* Email Address */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm"
                  />
                </div>

                {/* Password input with visibility toggler */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00a2ca] hover:bg-[#0da1c7] text-white font-semibold py-3 rounded-2xl transition-colors disabled:opacity-75 shadow-sm text-sm"
                >
                  {loading ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
                </button>
              </form>

              {/* Or separator */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400">or</span>
              </div>

              {/* Google signup/login */}
              <button
                type="button"
                onClick={() => void handleGoogle()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors py-3 rounded-2xl font-semibold text-slate-700 text-sm shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-4 h-4" />
                {isLogin ? "Signin with Google" : "Signup with Google"}
              </button>

              {process.env.NODE_ENV === "development" && (
                <button
                  type="button"
                  onClick={() => {
                    document.cookie = "dev_bypass=true; path=/";
                    window.location.href = "/dashboard";
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors py-3 rounded-2xl font-semibold text-slate-500 text-sm shadow-sm mt-3"
                >
                  Developer Bypass
                </button>
              )}

            </div>

            {/* Switch authentication modes */}
            <div className="mt-8 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
              >
                {isLogin ? (
                  <span>Don't have an account? <span className="text-[#00a2ca] hover:underline">Sign up</span></span>
                ) : (
                  <span>Already have an account? <span className="text-[#00a2ca] hover:underline">Login</span></span>
                )}
              </button>
            </div>
          </div>
          
          {/* Bottom Card - Happy Customers Promo */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Stacked avatars */}
              <div className="flex -space-x-3">
                <img 
                  className="w-9 h-9 rounded-full border-2 border-white object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="Customer avatar" 
                />
                <img 
                  className="w-9 h-9 rounded-full border-2 border-white object-cover" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="Customer avatar" 
                />
                <img 
                  className="w-9 h-9 rounded-full border-2 border-white object-cover" 
                  src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="Customer avatar" 
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Join with 20k+ Users!</p>
                <p className="text-[10px] text-slate-400">Let's see our happy customer</p>
              </div>
            </div>
            <button 
              onClick={() => alert("Redirecting to customers showcase...")}
              className="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Split-screen visual artwork and testimonials */}
        <div className="lg:col-span-7 relative rounded-[32px] overflow-hidden min-h-[500px] lg:min-h-full flex flex-col justify-between p-8 text-white shadow-md">
          {/* Background image illustration */}
          <div className="absolute inset-0 bg-slate-900 -z-20">
            <img 
              src="/assets/login_artwork.png" 
              alt="3D abstract geometry render" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 -z-10" />

          {/* Top Headline Text */}
          <div className="max-w-md">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-sm">
              AI Revolutionizing the way we design, manufacture, and source apparel.
            </h2>
          </div>

          {/* Bottom Floating Glass Card */}
          <div className="bg-slate-900/30 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border border-white/20 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">P</div>
                  <div className="w-6 h-6 rounded-full border border-white/20 bg-teal-500 flex items-center justify-center text-[10px] font-bold">R</div>
                </span>
                <span className="px-3 py-1 text-xs font-medium border border-white/20 bg-white/10 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Designing
                </span>
              </div>
              <div className="flex gap-2">
                <button className="w-7 h-7 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-7 h-7 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-100 leading-relaxed">
              Create design briefs, generate instant techpacks, and secure transactions with automatic escrows.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
