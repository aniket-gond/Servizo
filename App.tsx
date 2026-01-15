
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Star, 
  MapPin, 
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Zap,
  Compass,
  SlidersHorizontal,
  RotateCcw,
  Droplets,
  Zap as Electric,
  GraduationCap,
  Wrench,
  Leaf,
  Sparkles,
  HeartPulse,
  Paintbrush,
  Wind,
  Truck,
  Dog,
  TrendingUp,
  Activity,
  User,
  Wallet,
  Calendar,
  Map as MapIcon,
  Clock,
  Briefcase,
  Users,
  Award,
  Box,
  BadgeCheck,
  Verified,
  ShieldAlert,
  Loader2,
  Sun,
  Moon,
  Hammer,
  Lightbulb,
  MousePointer2,
  Heart,
  Navigation,
  Settings,
  Shield,
  Map as LucideMap,
  Grid,
  Filter,
  ChevronDown
} from 'lucide-react';
import { SERVICE_PROVIDERS, CATEGORIES } from './data';
import { ServiceProvider, FilterState, AppView, ServiceStatus } from './types';

// Declare Leaflet globally since it's loaded via script tag
declare const L: any;

// --- Helper: Proximity Calculation ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// --- Custom Logo Component (Accurately matching provided image) ---
const ServizoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 5)">
      {/* Top Part of the Graphic */}
      <path 
        d="M30 40C20 40 10 30 10 20C10 10 20 0 35 0C50 0 60 10 60 25C60 40 50 50 40 50" 
        stroke="#3B82F6" strokeWidth="8" strokeLinecap="round"
      />
      <circle cx="60" cy="25" r="7" fill="#3B82F6" />
      <circle cx="40" cy="50" r="7" fill="#3B82F6" />
      
      {/* Bottom Part of the Graphic (Inverted Mirror) */}
      <path 
        d="M50 60C60 60 70 70 70 80C70 90 60 100 45 100C30 100 20 90 20 75C20 60 30 50 40 50" 
        stroke="#3B82F6" strokeWidth="8" strokeLinecap="round"
      />
      <circle cx="20" cy="75" r="7" fill="#3B82F6" />
      <circle cx="40" cy="50" r="7" fill="#3B82F6" />
    </g>
  </svg>
);

// --- Styled Brand Identity (Logo + Text) ---
// Using dotless 'ı' to ensure only the blue dot is visible
const BrandIdentity: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
  const isLarge = size === 'lg';
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${isLarge ? 'mb-12' : ''}`}>
      <ServizoLogo className={`${isLarge ? 'w-32 h-32 md:w-48 md:h-48' : 'w-10 h-10 md:w-14 md:h-14'}`} />
      <div className={`flex items-baseline font-black tracking-tighter text-zinc-900 dark:text-white ${isLarge ? 'text-6xl md:text-8xl' : 'text-2xl md:text-3xl'}`}>
        <span>Serv</span>
        <span className="relative inline-flex flex-col items-center">
          <span className="text-blue-500 absolute -top-[0.22em] inline-block w-[0.25em] h-[0.25em] rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          <span className="leading-none">ı</span>
        </span>
        <span>zo</span>
      </div>
    </div>
  );
};

// --- Search Intelligence Mapping ---
const CATEGORY_TAGS: Record<string, string[]> = {
  'Plumbing': ['plumber', 'pipe', 'tap', 'leak', 'drain', 'toilet', 'bathroom', 'sink', 'water', 'faucet'],
  'Electrical': ['electrician', 'wire', 'light', 'fan', 'switch', 'socket', 'power', 'fuse', 'ups', 'inverter', 'voltage'],
  'Tutoring': ['teacher', 'tutor', 'class', 'study', 'education', 'math', 'science', 'subject', 'professor'],
  'Mechanic': ['car', 'bike', 'auto', 'vehicle', 'engine', 'brake', 'repair', 'puncture', 'tyre', 'tire'],
  'Home Maintenance': ['handyman', 'painter', 'carpenter', 'wall', 'fixing', 'furniture', 'drill', 'wood'],
  'Gardening': ['garden', 'plant', 'lawn', 'grass', 'pot', 'landscape', 'seeds', 'manure'],
  'Cleaning': ['cleaner', 'housekeeping', 'maid', 'sofa', 'kitchen', 'floor', 'dust', 'broom', 'vacuum'],
  'Moving': ['packer', 'mover', 'shift', 'truck', 'transport', 'delivery', 'luggage'],
  'Pet Care': ['dog', 'cat', 'vet', 'grooming', 'walking', 'pet', 'animal'],
  'Beauty': ['salon', 'makeup', 'facial', 'hair', 'waxing', 'threading', 'pedicure', 'manicure', 'bride', 'groom'],
  'Wellness': ['yoga', 'massage', 'spa', 'meditation', 'trainer', 'health', 'fitness', 'workout', 'diet'],
  'Appliance Repair': ['fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'tv', 'television'],
  'AC Repair': ['air conditioner', 'cooling', 'hvac', 'gas refill', 'service', 'compressor'],
};

// --- Designer UI Assets ---
const CATEGORY_UI: Record<string, any> = {
  'Plumbing': { icon: Droplets, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-400/10' },
  'Electrical': { icon: Electric, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-400/10' },
  'Tutoring': { icon: GraduationCap, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 dark:bg-indigo-400/10' },
  'Mechanic': { icon: Wrench, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-400/10' },
  'Home Maintenance': { icon: Wind, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-500/10 dark:bg-cyan-400/10' },
  'Gardening': { icon: Leaf, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/10' },
  'Cleaning': { icon: Sparkles, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-400/10' },
  'Moving': { icon: Truck, color: 'text-zinc-500 dark:text-zinc-400', bg: 'bg-zinc-500/10 dark:bg-zinc-400/10' },
  'Pet Care': { icon: Dog, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-400/10' },
  'Beauty': { icon: Paintbrush, color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-500/10 dark:bg-pink-400/10' },
  'Wellness': { icon: HeartPulse, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-500/10 dark:bg-teal-400/10' },
  'AC Repair': { icon: Wind, color: 'text-blue-400 dark:text-blue-300', bg: 'bg-blue-400/10 dark:bg-blue-300/10' },
  'Appliance Repair': { icon: Electric, color: 'text-amber-400 dark:text-amber-300', bg: 'bg-amber-400/10 dark:bg-amber-300/10' },
};

// --- Specialized Components ---

const ScreenLoader: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-50/80 dark:bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-12">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse rounded-full" />
          <div className="flex items-center gap-8 relative">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl animate-tool-bounce">
              <Wrench className="w-12 h-12 text-indigo-500 animate-tool-swing" />
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl animate-tool-bounce [animation-delay:0.2s]">
              <Hammer className="w-12 h-12 text-amber-500 animate-tool-swing" />
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-2xl animate-tool-bounce [animation-delay:0.4s]">
              <Lightbulb className="w-12 h-12 text-emerald-500 animate-tool-swing" />
            </div>
          </div>
        </div>
        <div className="space-y-3 text-center">
          <p className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-[0.4em] animate-pulse">Syncing Network</p>
          <p className="text-zinc-500 dark:text-zinc-700 font-bold text-xs uppercase tracking-[0.2em]">Contacting Local Specialists...</p>
        </div>
      </div>
    </div>
  );
};

const ThemeToggle: React.FC<{ theme: 'light' | 'dark', onToggle: () => void }> = ({ theme, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      className="fixed top-6 right-6 z-[110] p-3 md:p-4 rounded-full glass-card border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:scale-110 active:scale-90 transition-all shadow-xl"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

const ProfileRing: React.FC<{ avatar: string; status: ServiceStatus; size?: 'sm' | 'lg'; verified?: boolean }> = ({ avatar, status, size = 'sm', verified }) => {
  const color = status === 'Available' ? 'border-emerald-500' : status === 'Busy' ? 'border-amber-500' : 'border-zinc-300 dark:border-zinc-700';
  const imgSize = size === 'lg' ? 'w-20 h-20 md:w-32 md:h-32' : 'w-14 h-14 md:w-16 md:h-16';
  const dotSize = size === 'lg' ? 'w-6 h-6 md:w-8 md:h-8' : 'w-3 h-3 md:w-4 md:h-4';
  
  return (
    <div className="relative inline-block shrink-0">
      <div className={`p-1 rounded-full border-2 ${color} transition-all duration-700 shadow-xl`}>
        <img src={avatar} className={`${imgSize} rounded-full object-cover grayscale hover:grayscale-0 transition-all`} alt="Profile" />
      </div>
      <div className={`absolute bottom-1 right-1 ${dotSize} rounded-full border-4 border-white dark:border-zinc-1000 ${color.replace('border-', 'bg-')}`} />
      {verified && size === 'lg' && (
        <div className="absolute top-0 right-0 bg-indigo-500 p-2 rounded-full border-4 border-white dark:border-zinc-1000 shadow-xl">
          <BadgeCheck className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

// --- Leaflet Integration Component ---

const InteractiveMap: React.FC<{ 
  providers: ServiceProvider[]; 
  userCoords: {lat: number, lng: number} | null;
  onSelectProvider: (p: ServiceProvider) => void;
  theme: 'light' | 'dark'
}> = ({ providers, userCoords, onSelectProvider, theme }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    // Default center (Bangalore)
    const initialCenter = userCoords ? [userCoords.lat, userCoords.lng] : [12.9716, 77.5946];
    
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false
    }).setView(initialCenter, 15);

    // Dark Tile Layer (Aesthetic like images)
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl).addTo(mapInstanceRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    // Observer to fix "bits" loading
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        layer.setUrl(tileUrl);
      }
    });
  }, [theme]);

  // Update Markers & Path
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    
    markersLayerRef.current.clearLayers();

    // User Marker
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div class="w-10 h-10 bg-indigo-500/20 border-2 border-indigo-500 rounded-full flex items-center justify-center animate-pulse"><div class="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(markersLayerRef.current);
      
      // Auto-recenter on user location when coordinates arrive
      mapInstanceRef.current.panTo([userCoords.lat, userCoords.lng]);
    }

    // Provider Markers
    providers.forEach(p => {
      const statusColor = p.availability === 'Available' ? '#10b981' : p.availability === 'Busy' ? '#f59e0b' : '#6b7280';
      const markerIcon = L.divIcon({
        className: 'provider-marker',
        html: `
          <div class="relative group flex flex-col items-center">
            <!-- Floating Price Bubble -->
            <div class="mb-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full shadow-2xl animate-bounce-slow">
              <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">${p.price}</span>
            </div>
            <!-- Profile Circle -->
            <div class="relative">
              <div class="w-11 h-11 rounded-full border-2 border-white dark:border-zinc-900 shadow-xl overflow-hidden bg-zinc-800 hover:scale-125 transition-all duration-300">
                 <img src="${p.avatar}" class="w-full h-full object-cover" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900" style="background: ${statusColor}"></div>
            </div>
          </div>
        `,
        iconSize: [60, 80],
        iconAnchor: [30, 70]
      });

      const marker = L.marker([p.lat, p.lng], { icon: markerIcon }).addTo(markersLayerRef.current);
      
      marker.on('click', () => {
        onSelectProvider(p);
        
        // DRAW PATH (Polyline)
        if (userCoords) {
          if (polylineRef.current) mapInstanceRef.current.removeLayer(polylineRef.current);
          
          polylineRef.current = L.polyline([
            [userCoords.lat, userCoords.lng],
            [p.lat, p.lng]
          ], {
            color: '#6366f1',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            lineJoin: 'round'
          }).addTo(mapInstanceRef.current);

          mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [100, 100], animate: true });
        }
      });
    });

    mapInstanceRef.current.invalidateSize();
  }, [providers, userCoords, onSelectProvider]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />;
};

const Dock: React.FC<{ activeView: AppView; setView: (v: AppView) => void }> = ({ activeView, setView }) => {
  const items = [
    { id: 'home', icon: Compass },
    { id: 'listings', icon: LayoutGrid },
    { id: 'wallet', icon: Wallet, disabled: true },
    { id: 'profile', icon: User, disabled: true },
  ];
  return (
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] px-3 md:px-4 py-2 md:py-3 dock-blur rounded-full flex items-center gap-1 md:gap-2 shadow-2xl">
      {items.map((item: any) => (
        <button
          key={item.id}
          disabled={item.disabled}
          onClick={() => setView(item.id)}
          className={`p-3 md:p-3.5 rounded-full transition-all ${activeView === item.id ? 'text-zinc-900 dark:text-white bg-zinc-200/50 dark:bg-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'active:scale-90'}`}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};

// --- Core Pages ---

const HomePage: React.FC<{ onSearch: (q: string) => void }> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen pt-12 pb-48 px-6 lg:px-24 flex flex-col items-center animate-in fade-in duration-1000 overflow-x-hidden relative">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] animate-constellation">
           <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-200 dark:text-indigo-500/20">
              <circle cx="200" cy="200" r="2" fill="currentColor" />
              <circle cx="500" cy="400" r="3" fill="currentColor" />
              <circle cx="800" cy="300" r="2" fill="currentColor" />
              <circle cx="400" cy="700" r="4" fill="currentColor" className="animate-pulse" />
              <circle cx="700" cy="800" r="2" fill="currentColor" />
              <path d="M200 200 L500 400 M500 400 L800 300 M500 400 L400 700 M400 700 L700 800" stroke="currentColor" strokeWidth="0.5" />
           </svg>
        </div>
      </div>

      <div className="absolute top-[15%] right-[-5%] opacity-5 dark:opacity-10 pointer-events-none">
        <Settings className="w-96 h-96 text-zinc-400 animate-spin-slow" />
      </div>
      <div className="absolute bottom-[5%] left-[-5%] opacity-5 dark:opacity-10 pointer-events-none">
        <Shield className="w-72 h-72 text-zinc-400 animate-float-slow" />
      </div>

      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] animate-blob-one pointer-events-none rounded-full" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/10 blur-[120px] animate-blob-two pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] animate-pulse pointer-events-none rounded-full" />

      {/* Hero Content */}
      <div className="max-w-7xl w-full flex flex-col items-center z-10 min-h-[90vh]">
        {/* Top Branding Section */}
        <div className="w-full flex justify-center mb-16 animate-reveal-up opacity-0" style={{ animationDelay: '0.05s' }}>
          <BrandIdentity size="lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start w-full">
          <div className="lg:col-span-7 text-center lg:text-left space-y-10 md:space-y-14">
            <div className="animate-reveal-up opacity-0 space-y-10" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] mx-auto lg:mx-0 shadow-lg shimmer-container text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vetted & Insured Marketplace
              </div>

              <div className="space-y-8">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[115px] font-black tracking-tighter leading-[0.82] text-zinc-900 dark:text-white">
                  Premium <br /> <span className="text-indigo-500 relative inline-block">Specialists <div className="absolute -bottom-2 left-0 w-full h-4 bg-indigo-500/10 -z-10 rounded-full animate-pulse" /></span> <br /> On Demand.
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-zinc-600 dark:text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Join 50k+ households discovery India's most trusted certified professionals with 15-minute response guarantees.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-start animate-reveal-up opacity-0" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-2xl group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 rounded-full blur-xl opacity-10 group-focus-within:opacity-25 transition-all duration-700" />
                <form 
                  onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
                  className="relative flex items-center w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full shadow-premium-light dark:shadow-6xl backdrop-blur-3xl overflow-hidden transition-all duration-500 focus-within:border-indigo-500/60"
                >
                  <div className="flex-1 flex items-center pl-8 md:pl-12 pr-2 gap-4 md:gap-6 py-5 md:py-8">
                    <Search className="w-7 h-7 md:w-9 md:h-9 text-zinc-300 dark:text-zinc-700 group-focus-within:text-indigo-500 group-focus-within:scale-110 transition-all shrink-0" />
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Italian Tutor, Deep Clean..."
                      className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-3xl font-black text-zinc-900 dark:text-white placeholder-zinc-100 dark:placeholder-zinc-800 h-10 md:h-16 outline-none"
                    />
                  </div>
                  <div className="pr-2 md:pr-4 py-2">
                    <button type="submit" className="hidden sm:flex premium-btn px-12 md:px-16 h-16 md:h-20 rounded-full font-black text-xl md:text-2xl hover:scale-105 active:scale-95 transition-all items-center justify-center whitespace-nowrap shadow-2xl relative overflow-hidden group/btn">
                      <span className="relative z-10 flex items-center gap-3">Find Expert <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" /></span>
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </button>
                    <button type="submit" className="flex sm:hidden premium-btn p-5 rounded-full font-black hover:scale-105 active:scale-95 transition-all items-center justify-center">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex relative h-[550px] items-center justify-center animate-reveal-up opacity-0" style={{ animationDelay: '0.4s' }}>
            <div className="absolute top-[0%] right-[0%] animate-float transition-transform duration-700 hover:scale-105 z-20">
               <div className="glass-card p-10 rounded-[3rem] border border-white/10 dark:border-white/5 isometric-card flex flex-col gap-8 shadow-6xl group/card relative overflow-hidden text-left">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center group-hover/card:bg-blue-500/20 transition-all"><Droplets className="w-10 h-10 text-blue-500 dark:text-blue-400" /></div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Plumbing</p>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-loose">Master Certified • Industrial Equipment</p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">48 Active Experts</p>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-[0%] left-[-10%] animate-float-slow delay-700 z-10 transition-transform duration-1000 hover:scale-110">
               <div className="glass-card p-10 rounded-[3rem] border border-white/10 dark:border-white/5 isometric-card flex flex-col gap-8 shadow-6xl group/card2 relative overflow-hidden text-left">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center group-hover/card2:bg-amber-500/20 transition-all"><Electric className="w-10 h-10 text-amber-500 dark:text-amber-400" /></div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Electrical</p>
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-loose">Emergency Response • Smart Homes</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase text-left">Nearby Available</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkerListingsPage: React.FC<{ 
  providers: ServiceProvider[], 
  onProfile: (p: ServiceProvider) => void,
  filters: FilterState,
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>,
  isNearMe: boolean,
  setIsNearMe: (v: boolean) => void,
  userCoords: {lat: number, lng: number} | null,
  theme: 'light' | 'dark'
}> = ({ providers, onProfile, filters, setFilters, isNearMe, setIsNearMe, userCoords, theme }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMapView = viewMode === 'map';

  // Handle outside click for custom category dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className={`min-h-screen pt-8 md:pt-12 pb-48 px-4 md:px-12 animate-in fade-in duration-500 ${isMapView ? 'max-w-full' : 'max-w-7xl mx-auto'} transition-all duration-700`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-1 md:space-y-2 text-left">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">Expert Marketplace.</h2>
          <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-xs text-left">Discovering {providers.length} verified specialists active in your region</p>
        </div>
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-full shadow-2xl transition-colors">
           <button onClick={() => setViewMode('grid')} className={`px-6 md:px-8 py-2.5 rounded-full flex items-center gap-2 font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all ${!isMapView ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
             <Grid className="w-3.5 h-3.5" /> List View
           </button>
           <button onClick={() => setViewMode('map')} className={`px-6 md:px-8 py-2.5 rounded-full flex items-center gap-2 font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all ${isMapView ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
             <LucideMap className="w-3.5 h-3.5" /> Live Map
           </button>
        </div>
      </div>

      <div className="space-y-6 mb-8 md:mb-16">
        <div className="relative group w-full flex items-center">
          <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-zinc-400 dark:text-zinc-700 group-focus-within:text-indigo-500 transition-all z-10" />
          <input 
              type="text" 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              placeholder="Search by specialty or service..."
              className="w-full h-16 md:h-20 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full px-16 md:px-20 text-lg md:text-2xl font-black text-zinc-900 dark:text-white placeholder-zinc-200 dark:placeholder-zinc-800 transition-all focus:border-indigo-500/50 outline-none shadow-premium-light dark:shadow-none pr-32 md:pr-64"
          />
          <div className="absolute right-4 md:right-6 flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 md:h-12 w-10 md:w-12 rounded-full flex items-center justify-center transition-all border ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500'}`}
            >
              <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={() => setIsNearMe(!isNearMe)}
              className={`h-10 md:h-12 px-4 md:px-8 rounded-full flex items-center gap-2 md:gap-3 font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all border ${isNearMe ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-indigo-500/40'}`}
            >
              <Navigation className={`w-3 h-3 md:w-4 md:h-4 ${isNearMe ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{isNearMe ? 'Radius Active' : 'Near Me'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        <div className={`overflow-hidden transition-all duration-500 ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-zinc-200 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4" ref={dropdownRef}>
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block text-left">Category Selection</label>
              
              {/* Custom Category Dropdown with Icons */}
              <div className="relative">
                <button 
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full flex items-center justify-between bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-sm font-bold text-zinc-800 dark:text-white outline-none focus:border-indigo-500/50 text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    {filters.category ? (
                      (() => {
                        const UI = CATEGORY_UI[filters.category];
                        return UI ? <UI.icon className={`w-4 h-4 ${UI.color}`} /> : <LayoutGrid className="w-4 h-4 text-zinc-400" />;
                      })()
                    ) : (
                      <LayoutGrid className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>{filters.category || "All Service Sectors"}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-6xl z-50 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => { setFilters(prev => ({...prev, category: ''})); setIsCategoryDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-white/10 text-sm font-bold text-zinc-500 transition-colors border-b border-zinc-100 dark:border-white/5"
                    >
                      <LayoutGrid className="w-4 h-4" /> All Service Sectors
                    </button>
                    {CATEGORIES.map(c => {
                      const UI = CATEGORY_UI[c] || { icon: Sparkles, color: 'text-zinc-400' };
                      return (
                        <button 
                          key={c}
                          onClick={() => { setFilters(prev => ({...prev, category: c})); setIsCategoryDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-white/10 text-sm font-bold text-zinc-800 dark:text-white transition-colors"
                        >
                          <UI.icon className={`w-4 h-4 ${UI.color}`} /> {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block text-left">Real-time Status</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Available', 'Busy', 'Offline'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({...prev, availability: filters.availability === status ? '' : status}))}
                    className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filters.availability === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <button 
                onClick={() => setFilters({search: '', category: '', location: '', availability: ''})}
                className="flex items-center justify-center gap-3 w-full py-4 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 ${isMapView ? 'h-[75vh] min-h-[500px] flex flex-col lg:flex-row gap-6 overflow-hidden bg-white dark:bg-zinc-950 rounded-[2.5rem] md:rounded-[4xl] border border-zinc-200 dark:border-white/5 p-4 shadow-6xl' : ''}`}>
        
        {isMapView && (
          <div className="flex flex-col lg:w-[450px] shrink-0 overflow-y-auto no-scrollbar gap-4 animate-in slide-in-from-left-4 duration-500 pr-2 h-[200px] lg:h-full order-2 lg:order-1">
            <p className="px-6 pt-2 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest text-left">Discover Within 1.5km • {providers.length} Matches</p>
            {providers.map(p => (
              <div 
                key={p.id}
                onClick={() => onProfile(p)}
                className="group glass-card p-6 rounded-[2rem] border border-zinc-100 dark:border-white/5 hover:border-indigo-500/40 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-6"
              >
                <ProfileRing avatar={p.avatar} status={p.availability} />
                <div className="flex-1 text-left space-y-1">
                   <div className="flex items-center justify-between">
                     <h4 className="font-black text-xl text-zinc-900 dark:text-white tracking-tight">{p.name}</h4>
                     <span className="text-[10px] font-black text-indigo-500 uppercase">{p.price}</span>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{p.category}</p>
                   <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase pt-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> {p.rating} • {p.yearsExperience}Y Exp.
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`relative flex-1 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden order-1 lg:order-2 h-full ${!isMapView ? 'hidden' : 'block animate-in zoom-in-95 duration-700'}`}>
          <InteractiveMap 
            providers={providers} 
            userCoords={userCoords} 
            onSelectProvider={onProfile}
            theme={theme}
          />
          
          <div className="absolute top-6 left-6 z-[400] flex flex-col gap-3 pointer-events-none">
             <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> {isNearMe ? 'Local Radius Mode' : 'Discovery Mode'}
             </div>
          </div>

          <div className="absolute bottom-8 right-8 z-[400] glass-card p-6 rounded-[2rem] border border-white/10 shadow-6xl max-w-sm hidden md:block text-left">
             <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl"><MapIcon className="w-6 h-6 text-indigo-500" /></div>
                <div className="text-left">
                   <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Aesthetic Visualization</p>
                   <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Markers show pricing for instant comparison.</p>
                </div>
             </div>
          </div>
        </div>

        {!isMapView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 animate-in slide-in-from-bottom-6 duration-700">
            {providers.length > 0 ? providers.map(p => {
               const UI = CATEGORY_UI[p.category] || { icon: Sparkles, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
               const dist = userCoords ? getDistance(userCoords.lat, userCoords.lng, p.lat, p.lng) : null;
               return (
                <div 
                  key={p.id}
                  onClick={() => onProfile(p)}
                  className="group glass-card p-10 md:p-14 rounded-[4rem] transition-all hover:-translate-y-3 cursor-pointer shadow-premium-light dark:shadow-6xl flex flex-col justify-between min-h-[550px] border border-zinc-200 dark:border-white/5 hover:border-indigo-500/20"
                >
                  <div className="space-y-10 md:space-y-14">
                    <div className="flex items-start justify-between">
                       <ProfileRing avatar={p.avatar} status={p.availability} />
                       <div className="flex flex-col items-end gap-2 text-right">
                          <div className={`flex items-center gap-2 px-4 py-2 ${UI.bg} rounded-full`}>
                             <UI.icon className={`w-4 h-4 ${UI.color}`} />
                             <span className={`text-[10px] font-black uppercase tracking-widest ${UI.color}`}>{p.category}</span>
                          </div>
                          {isNearMe && dist !== null && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-in slide-in-from-right-2">
                               <Navigation className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                               <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{dist.toFixed(1)} km</span>
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2 text-left">
                          <h3 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter group-hover:text-indigo-600 transition-all leading-none">{p.name}</h3>
                          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest">
                            <MapPin className="w-4 h-4" /> {p.location.split(',')[0]}
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {p.skills.slice(0, 2).map(skill => (
                            <span key={skill} className="px-3.5 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{skill}</span>
                          ))}
                       </div>
                       <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-white/5">
                          <div className="space-y-1 text-left">
                             <p className="text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.2em] flex items-center gap-1.5"><Clock className="w-2.5 h-2.5" /> Response</p>
                             <p className="text-base font-black text-zinc-800 dark:text-white">{p.responseTime}</p>
                          </div>
                          <div className="space-y-1 text-left">
                             <p className="text-[7px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.2em] flex items-center gap-1.5"><Briefcase className="w-2.5 h-2.5" /> Experience</p>
                             <p className="text-base font-black text-zinc-800 dark:text-white">{p.yearsExperience} Years</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-10 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.3em] mb-1">Elite Standard</p>
                      <p className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white">{p.price}<span className="text-xs font-bold text-zinc-400 ml-1">min</span></p>
                    </div>
                    <button className="p-5 md:p-6 bg-indigo-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl group/btn">
                      <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
               );
            }) : (
              <div className="col-span-full py-48 text-center space-y-8">
                <Search className="w-24 h-24 text-zinc-100 dark:text-zinc-900 mx-auto animate-pulse" />
                <div className="space-y-4">
                  <p className="text-3xl md:text-5xl font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-tighter leading-none">No Local Talent Found.</p>
                  <p className="text-zinc-500 font-medium max-w-md mx-auto">Try broadening your search or resetting filters to find specialists beyond 1.5km.</p>
                </div>
                <button onClick={() => setFilters({search: '', category: '', location: '', availability: ''})} className="px-12 py-5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Clear All Filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage: React.FC<{ provider: ServiceProvider, onBack: () => void }> = ({ provider, onBack }) => {
  const [booked, setBooked] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => { window.scrollTo(0,0); }, []);

  const handleBooking = () => {
    setIsReserving(true);
    setTimeout(() => {
      setBooked(true);
      setIsReserving(false);
    }, 900);
  };

  return (
    <div className="min-h-screen pt-10 md:pt-16 pb-48 px-6 lg:px-24 animate-in slide-in-from-bottom-10 duration-700 max-w-7xl mx-auto">
      <button onClick={onBack} className="mb-12 md:mb-20 flex items-center gap-2 text-zinc-500 dark:text-zinc-600 hover:text-indigo-600 dark:hover:text-white transition-all font-black uppercase text-[10px] tracking-widest group text-left">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-16">
          <div className="glass-card rounded-[3rem] md:rounded-[5rem] p-10 md:p-16 text-center space-y-12 relative overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
             
             <div className="flex flex-col items-center space-y-8 text-center">
               <ProfileRing avatar={provider.avatar} status={provider.availability} size="lg" verified={provider.verified} />
               <div className="space-y-4">
                 <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">{provider.name}</h1>
                 <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs leading-none">{provider.category} Specialist</p>
                 <div className="flex justify-center gap-2 pt-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-6 h-6 md:w-8 md:h-8 ${i <= Math.floor(provider.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 dark:text-zinc-900'}`} />
                    ))}
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 md:gap-6">
                {[
                  { label: 'Jobs Done', val: `${provider.completedJobs}+` },
                  { label: 'Experience', val: `${provider.yearsExperience}Y` },
                  { label: 'Customers', val: provider.repeatCustomers },
                  { label: 'Response', val: provider.responseTime }
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-50 dark:bg-white/5 p-8 rounded-[2rem] md:rounded-[3rem] border border-zinc-100 dark:border-white/5 space-y-1">
                    <p className="text-[8px] md:text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white">{item.val}</p>
                  </div>
                ))}
             </div>

             <button 
              onClick={handleBooking}
              disabled={isReserving}
              className={`w-full py-8 md:py-10 premium-btn rounded-full font-black text-2xl md:text-3xl flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl relative overflow-hidden group ${isReserving ? 'opacity-90 scale-95' : 'active:scale-95'}`}
             >
               <span className={`flex items-center gap-4 transition-all duration-500 ${isReserving ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                 Instant Booking <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
               </span>
               {isReserving && (
                 <div className="absolute inset-0 flex items-center justify-center gap-4 animate-in fade-in zoom-in-90 duration-300">
                   <Loader2 className="w-8 h-8 animate-spin text-white" />
                   <span className="uppercase tracking-[0.2em] text-lg">Reserving...</span>
                 </div>
               )}
             </button>
             
             <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.2em] pt-4 text-center">Safety insured up to ₹50,000 for every job</p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-20 md:space-y-40 py-5 md:py-10 text-left">
          <section className="space-y-10 md:space-y-16">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.4em]">Expert Bio</p>
                <h2 className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">The <br /> Specialist.</h2>
             </div>
             <p className="text-xl sm:text-2xl md:text-4xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic border-l-4 md:border-l-8 border-indigo-500/20 dark:border-indigo-500/20 pl-8 md:pl-16">
               "{provider.longBio}"
             </p>
             <div className="flex flex-wrap gap-3 md:gap-5 pt-4">
               {provider.skills.map(skill => (
                 <span key={skill} className="px-6 md:px-10 py-4 md:py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-full text-xs md:text-xl font-black text-zinc-900 dark:text-white hover:border-indigo-500 transition-all cursor-default shadow-sm">
                   {skill}
                 </span>
               ))}
             </div>
          </section>

          <section className="space-y-12">
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase tracking-widest text-left">Professional Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
               <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 space-y-6">
                  <div className="flex items-center gap-4">
                    <Award className="w-10 h-10 text-amber-500" />
                    <p className="text-xl font-black text-zinc-900 dark:text-white uppercase">Certifications</p>
                  </div>
                  <ul className="space-y-4">
                    {provider.certifications.map((c, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-500 font-medium text-left">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="glass-card p-10 rounded-[3rem] border border-zinc-200 dark:border-white/5 space-y-6">
                  <div className="flex items-center gap-4">
                    <Box className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                    <p className="text-xl font-black text-zinc-900 dark:text-white uppercase">Pro Equipment</p>
                  </div>
                  <ul className="space-y-4">
                    {provider.equipment.map((e, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-600 dark:text-zinc-500 font-medium text-left">
                        <Zap className="w-5 h-5 text-amber-500 shrink-0" /> {e}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </section>

          <section className="space-y-12">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <h3 className="text-3xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white text-left">Client Feedback</h3>
               <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-6 py-3 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <span className="text-lg font-black text-zinc-900 dark:text-white">{provider.rating}/5.0</span>
               </div>
             </div>
             
             <div className="space-y-8 md:space-y-12">
               {provider.reviews.map(review => (
                 <div key={review.id} className="glass-card p-10 md:p-16 rounded-[3rem] md:rounded-[5rem] space-y-8 md:space-y-12 group hover:bg-zinc-50 dark:hover:bg-white/5 transition-all relative overflow-hidden border border-zinc-200 dark:border-white/5">
                    <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-6 md:gap-10 text-left">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center font-black text-zinc-800 dark:text-white text-3xl md:text-5xl group-hover:bg-white dark:group-hover:bg-white/10 transition-all">
                             {review.user.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-2xl md:text-4xl text-zinc-900 dark:text-white tracking-tight leading-none">{review.user}</h4>
                            <div className="flex items-center gap-3 mt-3 md:mt-4">
                              <span className="text-[10px] md:text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">{review.date}</span>
                              <div className="w-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                              <span className="text-[10px] md:text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Verified Booking</span>
                            </div>
                          </div>
                       </div>
                    </div>
                    <p className="text-2xl md:text-5xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic relative z-10">"{review.comment}"</p>
                 </div>
               ))}
             </div>
             <button className="w-full py-6 text-zinc-400 dark:text-zinc-700 font-black uppercase text-xs tracking-[0.3em] hover:text-indigo-600 dark:hover:text-zinc-400 transition-all border border-dashed border-zinc-300 dark:border-zinc-900 rounded-[2.5rem]">Load 24 more reviews</button>
          </section>
        </div>
      </div>

      {booked && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/95 backdrop-blur-3xl" onClick={() => setBooked(false)} />
           <div className="relative w-full max-w-xl glass-card rounded-[3rem] md:rounded-[5rem] p-12 md:p-20 text-center space-y-12 md:space-y-16 shadow-6xl animate-in zoom-in-95 border border-zinc-200 dark:border-white/10">
              <div className="w-24 h-24 md:w-36 md:h-36 bg-emerald-500/10 border border-emerald-500/30 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center mx-auto text-emerald-500 animate-bounce shadow-2xl">
                 <CheckCircle2 className="w-12 h-12 md:w-20 md:h-20" />
              </div>
              <div className="space-y-4 md:space-y-6 text-center">
                <h3 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter">Slot Reserved.</h3>
                <p className="text-xl md:text-3xl text-zinc-600 dark:text-zinc-500 font-medium leading-snug">Expert <span className="text-indigo-600 dark:text-white">{provider.name}</span> will contact you via WhatsApp for scheduling details within 15 minutes.</p>
              </div>
              <div className="bg-zinc-50 dark:bg-white/5 p-8 rounded-[2rem] border border-zinc-100 dark:border-white/5 space-y-4 text-left">
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-zinc-400 dark:text-zinc-600">Booking Reference</span>
                    <span className="text-zinc-900 dark:text-white">#SL-{(Math.random() * 10000).toFixed(0)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                    <span className="text-zinc-400 dark:text-zinc-600">Appointment Fee</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Paid - ₹0</span>
                 </div>
              </div>
              <button onClick={() => setBooked(false)} className="w-full py-8 md:py-10 premium-btn font-black text-2xl md:text-3xl rounded-full shadow-6xl">Done</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ search: '', category: '', location: '', availability: '' });
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const [isNearMe, setIsNearMe] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  useEffect(() => {
    if (isNearMe && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsNearMe(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [isNearMe, userCoords]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.className = next;
  };

  const navigateTo = (nextView: AppView, provider: ServiceProvider | null = null) => {
    setIsPageLoading(true);
    setTimeout(() => {
      if (provider) setSelectedProvider(provider);
      setView(nextView);
      window.scrollTo(0, 0);
      setIsPageLoading(false);
    }, 1200);
  };

  const filteredProviders = useMemo(() => {
    let result = SERVICE_PROVIDERS.filter(p => {
      const q = filters.search.toLowerCase().trim();
      const tags = CATEGORY_TAGS[p.category] || [];
      const hasTagMatch = q ? tags.some(tag => tag.includes(q) || q.includes(tag)) : true;
      
      const ms = q ? (
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        q.includes(p.category.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(q)) || 
        p.location.toLowerCase().includes(q) ||
        hasTagMatch
      ) : true;

      const mc = !filters.category || p.category === filters.category;
      const ma = !filters.availability || p.availability === filters.availability;
      return ms && mc && ma;
    });

    if (isNearMe && userCoords) {
      result = result.filter(p => getDistance(userCoords.lat, userCoords.lng, p.lat, p.lng) <= 1.5)
      .sort((a, b) => {
        const distA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return result;
  }, [filters, isNearMe, userCoords]);

  const handleSearch = (q: string) => {
    setFilters(prev => ({ ...prev, search: q }));
    navigateTo('listings');
  };

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-indigo-500 selection:text-white font-sans text-left overflow-x-hidden">
      <ScreenLoader isVisible={isPageLoading} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <main className={`transition-opacity duration-500 ${isPageLoading ? 'opacity-0' : 'opacity-100'}`}>
        {view === 'home' && <HomePage onSearch={handleSearch} />}
        {view === 'listings' && (
          <WorkerListingsPage 
            providers={filteredProviders}
            onProfile={(p) => navigateTo('profile', p)}
            filters={filters}
            setFilters={setFilters}
            isNearMe={isNearMe}
            setIsNearMe={setIsNearMe}
            userCoords={userCoords}
            theme={theme}
          />
        )}
        {view === 'profile' && selectedProvider && (
          <ProfilePage provider={selectedProvider} onBack={() => navigateTo('listings')} />
        )}
      </main>

      <Dock activeView={view} setView={(v) => navigateTo(v)} />

      <footer className="pt-20 md:pt-40 pb-40 md:pb-60 px-6 md:px-12 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-gradient-to-b dark:from-zinc-1000 dark:to-black">
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-x-16 lg:gap-x-20 text-left">
            <div className="space-y-6 md:space-y-8 text-left sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0">
                  <ServizoLogo className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div className="flex items-baseline font-black tracking-tighter text-zinc-900 dark:text-white text-3xl md:text-5xl">
                  <span>Serv</span>
                  <span className="relative inline-flex flex-col items-center">
                    <span className="text-blue-500 absolute -top-[0.25em] inline-block w-[0.25em] h-[0.25em] rounded-full bg-blue-500"></span>
                    <span className="leading-none">ı</span>
                  </span>
                  <span>zo.</span>
                </div>
              </div>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-600 font-medium leading-relaxed max-w-xl">Redefining service discovery in India's metropolitan cities. Quality, safety, and transparency, guaranteed.</p>
            </div>
            <div className="space-y-6 md:space-y-8 text-left">
               <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Contact</p>
               <div className="space-y-3 md:space-y-4 text-zinc-500 font-bold text-left">
                  <p className="hover:text-indigo-500 transition-colors cursor-pointer truncate">help@servizo.in</p>
                  <p>+91 800 234 5678</p>
                  <p>Kandivali HQ - Mumbai, Maharashtra</p>
               </div>
            </div>
            <div className="space-y-6 md:space-y-8 text-left">
               <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest text-left">Connect</p>
               <div className="flex gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center justify-center hover:bg-indigo-500/10 transition-all cursor-pointer"><TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" /></div>)}
               </div>
            </div>
          </div>
          <div className="pt-12 md:pt-24 border-t border-zinc-200 dark:border-white/5 space-y-4 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] md:tracking-[0.8em] text-[8px] md:text-[10px]">
              India's Premier Digital Service Standard
            </p>
            <p className="text-zinc-400 dark:text-zinc-800 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">© 2026 Servizo India Private Limited • All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
