import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import umiyaLogo from "@/assets/umiya-logo.png";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-strong rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <img src={umiyaLogo} alt="" className="h-16 w-16 rounded-2xl mx-auto ring-1 ring-border/30" />
          <h1 className="text-xl font-bold text-foreground">Supabase Not Connected</h1>
          <p className="text-sm text-muted-foreground">
            To enable authentication, connect an external Supabase project by adding <code className="text-primary">VITE_SUPABASE_URL</code> and <code className="text-primary">VITE_SUPABASE_ANON_KEY</code> environment variables.
          </p>
          <button onClick={() => navigate("/dashboard")} className="gradient-accent text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-semibold">
            Continue without Auth
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message); return; }
        navigate("/dashboard");
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) { toast.error(error.message); return; }
        toast.success("Account created! Check your email to verify.");
        navigate("/onboarding");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.15),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.1),transparent_70%)] blur-3xl" />
        <div className="relative text-center px-12">
          <img src={umiyaLogo} alt="" className="h-20 w-20 rounded-2xl mx-auto mb-6 ring-1 ring-border/20" />
          <h2 className="font-brand text-3xl text-foreground tracking-[0.06em] mb-2">SHREE UMIYA</h2>
          <p className="text-sm text-muted-foreground">Electronics • Est. 2005</p>
          <p className="text-xs text-muted-foreground/60 mt-4 max-w-xs mx-auto">
            Your complete business operating system. Manage sales, inventory, repairs, and customers — all in one place.
          </p>
        </div>
      </div>

      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src={umiyaLogo} alt="" className="h-14 w-14 rounded-xl mx-auto mb-3 ring-1 ring-border/20" />
            <h1 className="font-brand text-xl text-foreground tracking-[0.06em]">SHREE UMIYA</h1>
          </div>

          <div className="glass-strong rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">{mode === "login" ? "Welcome back" : "Create account"}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "login" ? "Sign in to your business" : "Set up your store in minutes"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full gradient-accent text-accent-foreground py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <button onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-xs text-primary hover:underline">
                {mode === "login" ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <button onClick={() => navigate("/dashboard")}
            className="w-full text-center text-xs text-muted-foreground/60 mt-4 hover:text-muted-foreground transition-colors">
            Skip — continue without account
          </button>
        </motion.div>
      </div>
    </div>
  );
}
