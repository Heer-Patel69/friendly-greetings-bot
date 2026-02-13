import { motion } from "framer-motion";
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
  ChevronRight,
  BarChart3,
  Receipt,
  Package,
  Users,
  MessageCircle,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
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
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(224_65%_45%/0.5),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/90 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 md:pt-16 md:pb-24">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-12 md:mb-20"
          >
            <div className="flex items-center gap-3">
              <img src={umiyaLogo} alt="Shree Umiya Electronics" className="h-11 w-11 rounded-xl" />
              <div>
                <span className="text-primary-foreground font-brand text-lg tracking-wide">SHREE UMIYA</span>
                <p className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.2em]">Electronics</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Services</a>
              <a href="#why-us" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Why Us</a>
              <a href="#platform" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">Platform</a>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
              >
                Open Dashboard
              </button>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="md:hidden bg-accent/20 text-accent-foreground px-4 py-2 rounded-xl text-sm font-medium"
            >
              Dashboard
            </button>
          </motion.nav>

          {/* Hero content */}
          <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center md:text-left"
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground rounded-full px-4 py-1.5 mb-6">
                <Award className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-semibold tracking-wide">Established 2005 • 20,000+ Solutions</span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="font-brand text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground leading-[1.05] mb-4 tracking-wide">
                YOUR TRUSTED
                <br />
                <span className="text-accent">ELECTRONICS</span>
                <br />
                EXPERTS
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="font-body text-primary-foreground/70 text-base md:text-lg max-w-md mx-auto md:mx-0 mb-4 leading-relaxed">
                Sargasan & Gandhinagar's most trusted name for washing machines, RO systems, geysers, and AC & chimney deep-cleaning.
              </motion.p>

              <motion.p variants={fadeUp} custom={2.5} className="font-body text-primary-foreground/50 text-sm mb-8">
                आपकी इलेक्ट्रॉनिक्स ज़रूरतों का एक भरोसेमंद नाम
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-accent text-accent-foreground font-bold py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-accent/25"
                >
                  <Zap className="h-5 w-5" />
                  Open Business Dashboard
                </button>
                <a
                  href="tel:+919999999999"
                  className="border-2 border-primary-foreground/20 text-primary-foreground font-semibold py-3.5 px-7 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-foreground/5 transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              </motion.div>
            </motion.div>

            {/* Hero stats cards — desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="bg-primary-foreground/10 backdrop-blur-md rounded-3xl p-8 border border-primary-foreground/10">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "20+", label: "Years Experience", icon: Clock },
                      { value: "20K+", label: "Problems Solved", icon: CheckCircle2 },
                      { value: "4.8★", label: "Customer Rating", icon: Star },
                      { value: "<2hr", label: "Response Time", icon: Zap },
                    ].map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="bg-primary-foreground/5 rounded-2xl p-5 text-center"
                      >
                        <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
                        <p className="text-2xl font-brand text-primary-foreground tracking-wide">{s.value}</p>
                        <p className="text-xs text-primary-foreground/60 mt-1">{s.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:hidden grid grid-cols-3 gap-3 mt-10"
          >
            {[
              { value: "20+", label: "Years" },
              { value: "20K+", label: "Solved" },
              { value: "4.8★", label: "Rating" },
            ].map((s) => (
              <div key={s.label} className="bg-primary-foreground/10 rounded-2xl py-4 text-center backdrop-blur-sm">
                <p className="text-xl font-brand text-primary-foreground tracking-wide">{s.value}</p>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto"><path d="M0 60L1440 60L1440 20Q1200 0 720 30Q240 60 0 20Z" fill="hsl(var(--background))" /></svg>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Our Expertise</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-3xl md:text-5xl text-foreground tracking-wide">WHAT WE MASTER</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-lg mx-auto">We don't do everything — we specialize in what we truly know best.</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { icon: Wrench, title: "Washing Machines", desc: "Installation, repair, and deep-cleaning for all brands", color: "bg-primary/8 text-primary" },
            { icon: Droplets, title: "RO Systems", desc: "Water purifier installation, filter replacement, AMC", color: "bg-brand-info/10 text-brand-info" },
            { icon: Flame, title: "Geysers", desc: "Gas & electric geyser expert repairs and new installations", color: "bg-accent/10 text-accent" },
            { icon: Wind, title: "AC & Chimney", desc: "Professional deep-cleaning, gas refill, servicing", color: "bg-brand-success/10 text-brand-success" },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              custom={i}
              className="bg-card rounded-2xl p-5 md:p-8 shadow-brand border border-border/60 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center mb-4 ${s.color} transition-transform group-hover:scale-110`}>
                <s.icon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <h3 className="font-brand text-base md:text-lg text-foreground mb-1 tracking-wide">{s.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground/60 mt-6 italic"
        >
          Note: We do not provide refrigerator repair services — we focus only on our areas of expertise.
        </motion.p>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section id="why-us" className="py-16 md:py-24 bg-primary/[0.03]">
        <div className="px-4 sm:px-6 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Why Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-brand text-3xl md:text-5xl text-foreground tracking-wide">BUILT ON TRUST</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-lg mx-auto">Since 2005, families across Gandhinagar have trusted us for honest, expert service.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: "Transparent Pricing", desc: "No hidden charges. Upfront estimate before every job.", hindi: "कोई छिपा शुल्क नहीं" },
              { icon: Award, title: "Certified Technicians", desc: "Factory-trained, experienced professionals only.", hindi: "प्रशिक्षित तकनीशियन" },
              { icon: Clock, title: "Same-Day Response", desc: "Most service calls attended within 2 hours in Sargasan.", hindi: "उसी दिन सेवा" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-2xl p-6 md:p-8 shadow-brand border border-border/60 text-center md:text-left"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0 mb-5">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                <p className="text-xs text-muted-foreground/60">{item.hindi}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BUSINESS PLATFORM ── */}
      <section id="platform" className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Business Platform</motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-brand text-3xl md:text-5xl text-foreground tracking-wide">YOUR DIGITAL ENGINE</motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-lg mx-auto">
            A complete business operating system — Sales, Inventory, Billing, Reports, CRM, and more. All in one.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Receipt, title: "Fast Billing", desc: "3-tap invoicing with GST" },
            { icon: Package, title: "Inventory", desc: "Real-time stock tracking" },
            { icon: BarChart3, title: "Reports", desc: "P&L, Cash Flow, Analytics" },
            { icon: Users, title: "Customer CRM", desc: "History, reminders, AMC" },
            { icon: MessageCircle, title: "WhatsApp", desc: "Share invoices instantly" },
            { icon: Zap, title: "Quick Sell", desc: "Bill in under 5 seconds" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="bg-card rounded-2xl p-5 shadow-brand border border-border/60 hover:border-primary/20 transition-colors"
            >
              <f.icon className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-semibold text-sm text-foreground mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-primary-foreground font-bold py-4 px-8 rounded-2xl inline-flex items-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-base"
          >
            Launch Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="bg-primary py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(224_65%_40%/0.4),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-brand text-3xl md:text-5xl text-primary-foreground tracking-wide mb-4">
              READY TO GROW
              <br />
              YOUR BUSINESS?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Join Sargasan's most trusted electronics brand. Start managing your business like a pro.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-accent text-accent-foreground font-bold py-3.5 px-8 rounded-xl inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <Zap className="h-5 w-5" />
                Get Started Free
              </button>
              <a
                href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Shree%20Umiya%20Electronics"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-primary-foreground/20 text-primary-foreground font-semibold py-3.5 px-8 rounded-xl inline-flex items-center justify-center gap-2 hover:bg-primary-foreground/5 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/[0.03] border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={umiyaLogo} alt="" className="h-8 w-8 rounded-lg" />
            <div>
              <p className="font-brand text-sm text-foreground tracking-wide">SHREE UMIYA ELECTRONICS</p>
              <p className="text-[10px] text-muted-foreground">Sargasan, Gandhinagar — 382421</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© 2005–2026 Shree Umiya Electronics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
