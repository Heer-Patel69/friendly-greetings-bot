import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PageShell({ title, subtitle, children }: PageShellProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <header className="relative overflow-hidden px-4 pt-6 pb-5">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-40%] right-[-20%] w-[50%] h-[80%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.08),transparent_70%)] blur-3xl" />
        <div className="relative flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </header>
      <div className="p-4 md:p-6">{children}</div>
    </motion.div>
  );
}
