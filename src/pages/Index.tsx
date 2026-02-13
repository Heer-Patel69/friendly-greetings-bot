import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Zap,
  Award,
  Phone,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Wrench,
  Droplets,
  Flame,
  Wind,
  BarChart3,
  Receipt,
  Package,
  Users,
  MessageCircle,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative gradient-hero overflow-hidden min-h-[90vh] md:min-h-screen flex flex-col">
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.15),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.08),transparent_70%)] blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_60%/0.1),transparent_70%)] blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pt-10 md:pb-24 flex-1 flex flex-col">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-16 md:mb-24"
          >
            <div className="flex items-center gap-3">
              {/* Logo with glow */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl scale-150 animate-pulse" />
                <img src={umiyaLogo} alt="Shree Umiya Electronics" className="relative h-12 w-12 rounded-2xl ring-1 ring-white/10" />
              </div>
              <div>
                <span className="text-foreground font-brand text-lg tracking-[0.08em]">SHREE UMIYA</span>
                <p className="text-muted-foreground text-[9px] uppercase tracking-[0.25em]">Electronics • Est. 2005</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <a href="#services" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300">Services</a>
              <a href="#why-us" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300">Why Us</a>
              <a href="#platform" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-300">Platform</a>
              <button
                onClick={() => navigate("/dashboard")}
                className="gradient-accent text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 active:scale-[0.97] transition-all glow-accent"
              >
                Open Dashboard
              </button>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="lg:hidden gradient-accent text-accent-foreground px-4 py-2 rounded-xl text-sm font-bold glow-accent"
            >
              Dashboard →
            </button>
          </motion.nav>

          {/* Hero content */}
          <div className="flex-1 flex items-center">
            <div className="md:grid md:grid-cols-2 md:gap-16 lg:gap-24 items-center w-full">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="text-center md:text-left"
              >
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold text-foreground/80 tracking-wide">20,000+ Problems Solved • Since 2005</span>
                </motion.div>

                <motion.h1 variants={fadeUp} custom={1} className="font-brand text-[2.75rem] sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.02] mb-6 tracking-[0.03em]">
                  YOUR TRUSTED
                  <br />
                  <span className="text-gradient-accent">ELECTRONICS</span>
                  <br />
                  EXPERTS
                </motion.h1>

                <motion.p variants={fadeUp} custom={2} className="font-body text-muted-foreground text-base md:text-lg max-w-lg mx-auto md:mx-0 mb-3 leading-relaxed">
                  Sargasan & Gandhinagar's most trusted name for washing machines, RO systems, geysers, and AC & chimney deep-cleaning.
                </motion.p>

                <motion.p variants={fadeUp} custom={2.5} className="font-body text-muted-foreground/50 text-sm mb-10 flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-3.5 w-3.5 text-accent/60" />
                  Sargasan, Gandhinagar – 382421
                </motion.p>

                <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="gradient-accent text-accent-foreground font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.97] transition-all glow-accent text-base"
                  >
                    <Zap className="h-5 w-5" />
                    Manage My Business
                  </button>
                  <a
                    href="tel:+919999999999"
                    className="glass text-foreground font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-card/80 transition-all"
                  >
                    <Phone className="h-4 w-4 text-brand-success" />
                    Book Service
                  </a>
                </motion.div>

                <motion.p variants={fadeUp} custom={4} className="text-muted-foreground/40 text-xs mt-4 text-center md:text-left">
                  आपकी इलेक्ट्रॉनिक्स ज़रूरतों का एक भरोसेमंद नाम
                </motion.p>
              </motion.div>

              {/* Hero stats cards — desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="hidden md:block"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl scale-105" />
                  <div className="relative glass-strong rounded-3xl p-8">
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6 font-medium">Why Gandhinagar Trusts Us</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "20+", label: "Years Experience", icon: Clock, glow: "glow-primary" },
                        { value: "20K+", label: "Problems Solved", icon: CheckCircle2, glow: "" },
                        { value: "4.8★", label: "Customer Rating", icon: Star, glow: "" },
                        { value: "<2hr", label: "Response Time", icon: Zap, glow: "glow-accent" },
                      ].map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className={`gradient-card rounded-2xl p-5 text-center border border-border/30 hover:border-primary/30 transition-all duration-300 ${s.glow}`}
                        >
                          <s.icon className="h-5 w-5 text-accent mx-auto mb-3" />
                          <p className="text-3xl font-brand text-foreground tracking-wide">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{s.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="md:hidden grid grid-cols-3 gap-3 mt-8"
          >
            {[
              { value: "20+", label: "Years" },
              { value: "20K+", label: "Solved" },
              { value: "4.8★", label: "Rating" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl py-4 text-center">
                <p className="text-xl font-brand text-foreground tracking-wide">{s.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="py-6 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-muted-foreground/60 text-xs uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary/60" />Serving Since 2005</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2"><Award className="h-3.5 w-3.5 text-accent/60" />Expert Technicians</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-brand-success/60" />Sargasan, Gandhinagar</span>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} custom={0} className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-3">Our Expertise</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-4xl md:text-6xl text-foreground tracking-[0.03em]">WHAT WE MASTER</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">We don't do everything — we specialize in what we truly know best.</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { icon: Wrench, title: "Washing Machines", desc: "Installation, repair & deep-cleaning for all brands", gradient: "from-primary/20 to-primary/5" },
            { icon: Droplets, title: "RO Systems", desc: "Water purifier setup, filter replacement, AMC", gradient: "from-brand-info/20 to-brand-info/5" },
            { icon: Flame, title: "Geysers", desc: "Gas & electric geyser repairs and installations", gradient: "from-accent/20 to-accent/5" },
            { icon: Wind, title: "AC & Chimney", desc: "Professional deep-cleaning, gas refill, service", gradient: "from-brand-success/20 to-brand-success/5" },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              custom={i}
              className="glass rounded-2xl p-6 md:p-8 hover:shadow-elevated hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:glow-primary transition-all duration-500">
                  <s.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="font-brand text-base md:text-lg text-foreground mb-2 tracking-wide">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <span className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs text-muted-foreground/60">
            <Shield className="h-3 w-3 text-accent/50" />
            No Refrigerators — We Specialize to Master
          </span>
        </motion.div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section id="why-us" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-3">Why Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-brand text-4xl md:text-6xl text-foreground tracking-[0.03em]">BUILT ON TRUST</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">Since 2005, families across Gandhinagar have trusted us for honest, expert service.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: "Transparent Pricing", desc: "No hidden charges. Upfront estimate before every job.", hindi: "कोई छिपा शुल्क नहीं", glow: "hover:glow-primary" },
              { icon: Award, title: "Certified Technicians", desc: "Factory-trained, experienced professionals only.", hindi: "प्रशिक्षित तकनीशियन", glow: "hover:glow-accent" },
              { icon: Clock, title: "Same-Day Response", desc: "Most service calls attended within 2 hours in Sargasan.", hindi: "उसी दिन सेवा", glow: "hover:glow-primary" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className={`glass rounded-2xl p-7 md:p-9 text-center md:text-left hover:-translate-y-1 transition-all duration-500 ${item.glow}`}
              >
                <div className="h-14 w-14 rounded-2xl gradient-card border border-primary/20 flex items-center justify-center mx-auto md:mx-0 mb-6">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                <p className="text-xs text-accent/50 font-medium">{item.hindi}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BUSINESS PLATFORM ── */}
      <section id="platform" className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} custom={0} className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-3">Business Platform</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-4xl md:text-6xl text-foreground tracking-[0.03em]">YOUR DIGITAL ENGINE</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            A complete business operating system — Sales, Inventory, Billing, Reports, CRM, and more. All in one.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          {[
            { icon: Receipt, title: "Fast Billing", desc: "3-tap invoicing with GST", accent: "text-accent" },
            { icon: Package, title: "Inventory", desc: "Real-time stock tracking", accent: "text-primary" },
            { icon: BarChart3, title: "Reports", desc: "P&L, Cash Flow, Analytics", accent: "text-brand-info" },
            { icon: Users, title: "Customer CRM", desc: "History, reminders, AMC", accent: "text-brand-success" },
            { icon: MessageCircle, title: "WhatsApp", desc: "Share invoices instantly", accent: "text-brand-success" },
            { icon: Zap, title: "Quick Sell", desc: "Bill in under 5 seconds", accent: "text-accent" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="glass rounded-2xl p-5 md:p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className={`h-5 w-5 ${f.accent}`} />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="gradient-primary text-primary-foreground font-bold py-4 px-10 rounded-2xl inline-flex items-center gap-3 hover:brightness-110 active:scale-[0.97] transition-all glow-primary text-base"
          >
            Launch Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-30%] left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.1),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.08),transparent_70%)] blur-3xl" />

        <div className="relative py-20 md:py-28 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-brand text-4xl md:text-6xl text-foreground tracking-[0.03em] mb-5">
              READY TO GROW
              <br />
              <span className="text-gradient-accent">YOUR BUSINESS?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Join Sargasan's most trusted electronics brand. Start managing your business like a pro.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="gradient-accent text-accent-foreground font-bold py-4 px-8 rounded-2xl inline-flex items-center justify-center gap-2.5 hover:brightness-110 transition-all glow-accent text-base"
              >
                <Zap className="h-5 w-5" />
                Get Started Free
              </button>
              <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Shree%20Umiya%20Electronics"
                target="_blank"
                rel="noopener noreferrer"
                className="glass text-foreground font-semibold py-4 px-8 rounded-2xl inline-flex items-center justify-center gap-2.5 hover:bg-card/80 transition-all"
              >
                <MessageCircle className="h-4 w-4 text-brand-success" />
                WhatsApp Us
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={umiyaLogo} alt="" className="h-8 w-8 rounded-lg ring-1 ring-border/30" />
            <div>
              <p className="font-brand text-sm text-foreground tracking-wide">SHREE UMIYA ELECTRONICS</p>
              <p className="text-[10px] text-muted-foreground">Sargasan, Gandhinagar — 382421</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50">© 2005–2026 Shree Umiya Electronics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
