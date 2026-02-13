import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap, ArrowRight, CheckCircle2, Star, Store, Users,
  Receipt, Package, BarChart3, MessageCircle, Smartphone,
  Shield, Clock, IndianRupee, Wrench, ShoppingBag,
  Milk, Car, Cpu, ChevronRight, TrendingUp,
  MapPin, Quote
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  })
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

const BUSINESS_TYPES = [
  { icon: ShoppingBag, label: "Kirana Store" },
  { icon: Car, label: "Garage" },
  { icon: Wrench, label: "Repair Shop" },
  { icon: Milk, label: "Milk Vendor" },
  { icon: Cpu, label: "Mobile Shop" },
  { icon: Store, label: "Retail Store" },
];

const FEATURES = [
  { icon: Receipt, title: "Super-Fast POS", desc: "Bill in 3 seconds flat. Barcode, search, or tap." },
  { icon: IndianRupee, title: "Udhaar / Khata", desc: "Track credit customers. Send WhatsApp reminders." },
  { icon: Package, title: "Inventory Engine", desc: "Stock tracking, low alerts, supplier management." },
  { icon: BarChart3, title: "Smart Reports", desc: "P&L, cash flow, daily summaries — auto generated." },
  { icon: Users, title: "Customer CRM", desc: "Purchase history, AMC reminders, loyalty tracking." },
  { icon: MessageCircle, title: "WhatsApp Billing", desc: "Share invoices instantly via WhatsApp." },
  { icon: Smartphone, title: "Works Offline", desc: "POS works without internet. Syncs when back online." },
  { icon: Store, title: "Online Store", desc: "Get a public store page. Customers discover you." },
];

const TESTIMONIALS = [
  { name: "Rajesh Patel", business: "Patel Kirana Store, Ahmedabad", text: "Pehle register me likhta tha. Ab phone se bill banta hai 5 second me. Udhaar tracking ne life easy kar di.", rating: 5 },
  { name: "Suresh Mehta", business: "Mehta Auto Garage, Surat", text: "Job card system bahut kaam ka hai. Customer ko WhatsApp pe estimate bhejta hoon. Professional lagta hai.", rating: 5 },
  { name: "Priya Sharma", business: "Sharma Mobile Repair, Vadodara", text: "Inventory tracking se pata chalta hai kaunsa part khatam ho raha hai. Pehle yaad nahi rehta tha.", rating: 4 },
  { name: "Amit Kumar", business: "Kumar Dairy, Gandhinagar", text: "Daily hisaab kitaab ab phone me. Monthly report khud ban jaati hai. Time ki bahut bachat.", rating: 5 },
];

const LIVE_STATS = { stores: 2847, bills: "1.2L+", cities: 45 };

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={umiyaLogo} alt="DukaaanOS" className="h-8 w-8 rounded-xl shrink-0" />
            <span className="font-brand text-base tracking-wide text-foreground">DukaanOS</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#businesses" className="hover:text-foreground transition-colors">For Who</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            <button onClick={() => navigate("/stores")} className="hover:text-foreground transition-colors">Stores</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/stores")} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 hidden sm:block">
              Stores
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="gradient-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-xl active:scale-[0.97] transition-all">
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.1),transparent_70%)] blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Live counter */}
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-brand-success animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                {LIVE_STATS.stores.toLocaleString()} businesses live across {LIVE_STATS.cities} cities
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1}
              className="font-brand text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-5">
              RUN YOUR
              <br />
              <span className="text-gradient-accent">DUKAAN</span> LIKE
              <br />
              A PRO
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-3 leading-relaxed">
              The complete business OS for Indian local shops — billing, inventory, udhaar tracking, reports, and online store. All from your phone.
            </motion.p>

            <motion.p variants={fadeUp} custom={2.5}
              className="text-xs text-muted-foreground/50 mb-8">
              Kirana • Garage • Repair Shop • Dairy • Mobile Shop • Retail
            </motion.p>

            <motion.div variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/dashboard")}
                className="gradient-accent text-accent-foreground font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 text-base active:scale-[0.97] transition-all glow-accent">
                <Zap className="h-5 w-5" />
                Register Your Store — Free
              </button>
              <button onClick={() => navigate("/stores")}
                className="glass text-foreground font-semibold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
                <Store className="h-4 w-4 text-primary" />
                Browse Stores
              </button>
            </motion.div>

            <motion.p variants={fadeUp} custom={4}
              className="text-xs text-muted-foreground/40 mt-4">
              कोई भी दुकानदार, कहीं से भी, फ़्री में शुरू करें
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE STATS STRIP ── */}
      <section className="border-y border-border/30 py-5">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: LIVE_STATS.stores.toLocaleString("+"), label: "Live Stores", icon: Store },
            { value: LIVE_STATS.bills, label: "Bills Created", icon: Receipt },
            { value: `${LIVE_STATS.cities}+`, label: "Cities", icon: MapPin },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <s.icon className="h-4 w-4 text-accent/60 mb-1" />
              <p className="text-xl sm:text-2xl font-brand text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BUILT FOR ── */}
      <section id="businesses" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center mb-10">
          <motion.p variants={fadeUp} custom={0} className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Built For</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-3xl md:text-5xl text-foreground">EVERY LOCAL BUSINESS</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">No matter what you sell or repair — DukaanOS adapts to your business type.</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BUSINESS_TYPES.map((b, i) => (
            <motion.div key={b.label} variants={fadeUp} custom={i}
              className="glass rounded-2xl p-4 text-center hover:border-primary/30 transition-all">
              <b.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">{b.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="text-center mb-10">
          <motion.p variants={fadeUp} custom={0} className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Features</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-3xl md:text-5xl text-foreground">EVERYTHING YOU NEED</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">Replace your register, calculator, and diary — all in one app.</motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i}
              className="glass rounded-2xl p-4 md:p-5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 md:py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Simple</p>
            <h2 className="font-brand text-3xl md:text-5xl text-foreground">3 STEPS TO START</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Register", desc: "Enter your shop name, phone, and business type. Done in 30 seconds." },
              { step: "2", title: "Add Products", desc: "Add your items with prices. Or import from Excel later." },
              { step: "3", title: "Start Billing", desc: "Create bills, track udhaar, manage inventory — all from your phone." },
            ].map((s) => (
              <div key={s.step} className="glass rounded-2xl p-5 text-center">
                <div className="h-10 w-10 rounded-full gradient-accent text-accent-foreground font-brand text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Reviews</p>
          <h2 className="font-brand text-3xl md:text-5xl text-foreground">DUKAANDARS LOVE US</h2>
          <p className="text-muted-foreground mt-3 text-sm">Real stories from real business owners</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-5">
              <Quote className="h-5 w-5 text-accent/40 mb-3" />
              <p className="text-sm text-foreground/90 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.business}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative py-16 md:py-24 max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-brand text-3xl md:text-5xl text-foreground mb-4">
            APNI DUKAAN KO
            <br />
            <span className="text-gradient-accent">DIGITAL BANAO</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">
            Join {LIVE_STATS.stores.toLocaleString()} business owners who already manage their shop from their phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")}
              className="gradient-accent text-accent-foreground font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all glow-accent">
              <Zap className="h-5 w-5" />
              Start Free — No Card Needed
            </button>
            <a href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20know%20about%20DukaanOS"
              target="_blank" rel="noopener noreferrer"
              className="glass text-foreground font-semibold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
              <MessageCircle className="h-4 w-4 text-brand-success" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/30 py-6 px-4 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src={umiyaLogo} alt="" className="h-7 w-7 rounded-lg shrink-0" />
            <div>
              <p className="font-brand text-sm text-foreground">DukaanOS</p>
              <p className="text-[10px] text-muted-foreground">Business OS for Indian Shops</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
            <button onClick={() => navigate("/stores")} className="hover:text-foreground transition-colors">Stores</button>
            <span>•</span>
            <span>© 2025 DukaanOS. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
