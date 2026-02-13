import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Phone, Star, Clock, ChevronRight, Store, ArrowLeft, ExternalLink } from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
  })
};

interface MockStore {
  id: string;
  name: string;
  type: string;
  city: string;
  rating: number;
  reviews: number;
  phone: string;
  address: string;
  description: string;
  products: { name: string; price: number }[];
  isOpen: boolean;
}

const MOCK_STORES: MockStore[] = [
  {
    id: "s1", name: "Shree Umiya Electronics", type: "Repair Shop",
    city: "Gandhinagar", rating: 4.8, reviews: 342,
    phone: "+91 98765 43210", address: "Sargasan, Gandhinagar - 382421",
    description: "Trusted electronics repair — washing machines, RO, geyser, AC & chimney service since 2005.",
    products: [
      { name: "RO Service", price: 1500 }, { name: "AC Gas Refill", price: 2500 },
      { name: "Washing Machine Repair", price: 2800 }, { name: "Geyser Installation", price: 4500 },
    ],
    isOpen: true,
  },
  {
    id: "s2", name: "Patel Kirana Store", type: "Kirana Store",
    city: "Ahmedabad", rating: 4.5, reviews: 128,
    phone: "+91 98765 11111", address: "Navrangpura, Ahmedabad - 380009",
    description: "Your neighborhood grocery store with fresh daily essentials, snacks, and household items.",
    products: [
      { name: "Toor Dal 1kg", price: 180 }, { name: "Rice 5kg", price: 450 },
      { name: "Cooking Oil 1L", price: 160 }, { name: "Sugar 1kg", price: 55 },
    ],
    isOpen: true,
  },
  {
    id: "s3", name: "Mehta Auto Garage", type: "Garage",
    city: "Surat", rating: 4.7, reviews: 89,
    phone: "+91 98765 22222", address: "Varachha, Surat - 395006",
    description: "Complete auto repair and servicing — engine, electrical, AC, and body work for all car brands.",
    products: [
      { name: "Engine Oil Change", price: 1200 }, { name: "AC Gas Refill (Car)", price: 3500 },
      { name: "Brake Pad Replacement", price: 2000 }, { name: "Full Car Service", price: 5500 },
    ],
    isOpen: false,
  },
  {
    id: "s4", name: "QuickFix Mobile", type: "Mobile Shop",
    city: "Vadodara", rating: 4.6, reviews: 215,
    phone: "+91 98765 33333", address: "Alkapuri, Vadodara - 390007",
    description: "Mobile phone repair, screen replacement, software unlocking, and accessories.",
    products: [
      { name: "Screen Replacement", price: 3000 }, { name: "Battery Replacement", price: 1500 },
      { name: "Software Fix", price: 500 }, { name: "Tempered Glass", price: 150 },
    ],
    isOpen: true,
  },
  {
    id: "s5", name: "Kumar Dairy", type: "Milk Vendor",
    city: "Gandhinagar", rating: 4.9, reviews: 56,
    phone: "+91 98765 44444", address: "Sector 21, Gandhinagar - 382021",
    description: "Fresh milk, curd, paneer, and ghee delivered daily. Farm-to-home quality.",
    products: [
      { name: "Full Cream Milk 1L", price: 68 }, { name: "Curd 500g", price: 40 },
      { name: "Paneer 200g", price: 80 }, { name: "Desi Ghee 500g", price: 350 },
    ],
    isOpen: true,
  },
  {
    id: "s6", name: "Sharma Electronics Repair", type: "Repair Shop",
    city: "Rajkot", rating: 4.4, reviews: 72,
    phone: "+91 98765 55555", address: "Kalavad Road, Rajkot - 360005",
    description: "Home appliance repair specialist — TV, fridge, microwave, and mixer grinder service.",
    products: [
      { name: "TV Repair", price: 2000 }, { name: "Fridge Gas Refill", price: 3000 },
      { name: "Microwave Repair", price: 1500 }, { name: "Mixer Grinder Fix", price: 800 },
    ],
    isOpen: true,
  },
];

const CITIES = ["All Cities", "Gandhinagar", "Ahmedabad", "Surat", "Vadodara", "Rajkot"];
const TYPES = ["All Types", "Kirana Store", "Garage", "Repair Shop", "Mobile Shop", "Milk Vendor"];

export default function Stores() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [expandedStore, setExpandedStore] = useState<string | null>(null);

  const filtered = MOCK_STORES.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase());
    const matchCity = selectedCity === "All Cities" || s.city === selectedCity;
    const matchType = selectedType === "All Types" || s.type === selectedType;
    return matchSearch && matchCity && matchType;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="h-8 w-8 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform shrink-0">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">Live Stores</h1>
            <p className="text-[10px] text-muted-foreground">{MOCK_STORES.length} businesses on DukaanOS</p>
          </div>
          <button onClick={() => navigate("/dashboard")}
            className="gradient-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 active:scale-[0.97] transition-all">
            Register →
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores, business type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {CITIES.map((city) => (
            <button key={city} onClick={() => setSelectedCity(city)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCity === city
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}>
              {city}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {TYPES.map((type) => (
            <button key={type} onClick={() => setSelectedType(type)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === type
                  ? "bg-accent text-accent-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* Store Cards */}
        <div className="space-y-3">
          {filtered.map((store, i) => (
            <motion.div key={store.id}
              initial="hidden" animate="visible" variants={fadeUp} custom={i}
              className="glass rounded-2xl overflow-hidden">
              {/* Store header */}
              <button
                onClick={() => setExpandedStore(expandedStore === store.id ? null : store.id)}
                className="w-full p-4 flex items-start gap-3 text-left active:bg-card/50 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{store.name}</h3>
                    {store.isOpen ? (
                      <span className="shrink-0 text-[9px] font-medium text-brand-success bg-brand-success/10 px-1.5 py-0.5 rounded">OPEN</span>
                    ) : (
                      <span className="shrink-0 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">CLOSED</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{store.type} • {store.city}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="text-xs font-medium text-foreground">{store.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">({store.reviews} reviews)</span>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 transition-transform ${expandedStore === store.id ? "rotate-90" : ""}`} />
              </button>

              {/* Expanded content */}
              {expandedStore === store.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border/30 p-4 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{store.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{store.address}</span>
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Products & Services</p>
                    <div className="grid grid-cols-2 gap-2">
                      {store.products.map((p) => (
                        <div key={p.name} className="bg-secondary/50 rounded-xl px-3 py-2">
                          <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-accent font-semibold">₹{p.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a href={`tel:${store.phone.replace(/\s/g, "")}`}
                      className="flex-1 glass rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-foreground active:scale-[0.97] transition-all">
                      <Phone className="h-3.5 w-3.5 text-brand-success" />
                      Call
                    </a>
                    <a href={`https://wa.me/${store.phone.replace(/[\s+]/g, "")}?text=Hi%2C%20I%20found%20your%20store%20on%20DukaanOS`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 gradient-accent rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-accent-foreground active:scale-[0.97] transition-all">
                      <ExternalLink className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Store className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No stores found</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Try different filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
