import React, { useState, useEffect } from 'react';
// Note: You must ensure 'Truck' and 'FuelDataPoint' types are available in './types'
import { Truck, FuelDataPoint } from './types'; 
import { TruckList } from './components/TruckList';
import { FuelChart } from './components/FuelChart';
import { AIInsightPanel } from './components/AIInsightPanel';
import { FleetChat } from './components/FleetChat';
import Link from 'next/link';
import { LayoutDashboard, Search, Bell, Droplet, Gauge, Map, ShieldCheck, Zap, BarChart3, Radio, Wifi, Battery, Check, LogIn } from 'lucide-react';


// --- MOCK DATA GENERATOR ---
const generateMockData = (): Truck[] => {
  const trucks: Truck[] = [];
  const now = new Date();
  
  for (let i = 1; i <= 5; i++) {
    const history: FuelDataPoint[] = [];
    let currentLevel = 85 - (Math.random() * 20);
    
    for (let j = 12; j >= 0; j--) {
      const time = new Date(now.getTime() - j * 3600000);
      const consumption = Math.random() * 5;
      currentLevel -= (consumption / 2);
      if (currentLevel < 0) currentLevel = 100;
      
      history.push({
        time: time.getHours() + ':00',
        level: Math.round(currentLevel),
        consumptionRate: parseFloat(consumption.toFixed(1))
      });
    }

    trucks.push({
      id: `TRK-${100 + i}`,
      name: `Orca Hauler ${i}`,
      driver: ['John D.', 'Sarah C.', 'Mike R.', 'Lisa M.', 'Tom B.'][i-1],
      status: i === 2 ? 'Idling' : i === 4 ? 'Stopped' : 'Moving',
      fuelLevel: Math.round(history[history.length - 1].level),
      capacity: 300,
      currentMpg: 6.5 + (Math.random() * 2),
      location: ['I-40 Westbound', 'Dallas Depot', 'Route 66', 'Phoenix Yard', 'I-5 Northbound'][i-1],
      history: history,
      lastUpdated: 'Just now'
    });
  }
  return trucks;
};

const LOGO_URL = "/Orca.jpg";
const destinationUrl1 = 'https://cal.com/orca-trucks/30min';

// Helper function retained from original code for the Landing page
const SparklesIcon = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M7 5h4" />
  </svg>
);


export default function App() {
  // Updated view state to include 'login'
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  
  // --- AUTH LOGIC ---
  const handleLogin = (username: string, password: string) => {
    // Basic mock authentication:
    if (username === 'fleetmanager' && password === 'orca123') {
      setView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setView('landing'); // Redirect to the landing page on logout
  };

  // --- DATA LOGIC (Runs once on component mount) ---
  useEffect(() => {
    const data = generateMockData();
    setTrucks(data);
    setSelectedTruckId(data[0].id);
  }, []);

  // --- LIVE DATA SIMULATION (Only runs when view is 'dashboard') ---
  useEffect(() => {
    if (view !== 'dashboard') return;
    const interval = setInterval(() => {
      setTrucks(currentTrucks => 
        currentTrucks.map(truck => {
          if (truck.status === 'Stopped') return truck;
          const isIdling = truck.status === 'Idling';
          const drainRate = isIdling ? 0.05 : 0.15;
          let newFuelLevel = truck.fuelLevel - (drainRate + (Math.random() * 0.05));
          if (newFuelLevel <= 0) newFuelLevel = 100;
          const newHistory = [...truck.history];
          const lastPoint = {...newHistory[newHistory.length - 1]};
          lastPoint.level = Math.round(newFuelLevel);
          newHistory[newHistory.length - 1] = lastPoint;
          return { ...truck, fuelLevel: parseFloat(newFuelLevel.toFixed(1)), history: newHistory };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [view]);

  // Ensure selectedTruck is defined if we're on the dashboard
  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];

  // ===============================================
  // 1. LOGIN PAGE COMPONENT
  // ===============================================
  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!handleLogin(username, password)) {
        setError('Invalid username or password.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl border border-slate-200">
          
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-10">
            <img 
              src={LOGO_URL} 
              alt="Orca Trucks Logo" 
              className="h-24 w-24 rounded-full object-contain bg-slate-50 border border-slate-100 shadow-md" 
            />
            <h1 className="text-3xl font-bold text-slate-900 mt-4">Fleet Login</h1>
            <p className="text-slate-500 mt-2">Access your Orca Tech Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="fleetmanager"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <div className="text-right mt-2">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/25"
            >
              <LogIn size={20} />
              Login
            </button>
            
            {/* Back to Landing Button */}
            <button 
                type="button" 
                onClick={() => setView('landing')}
                className="w-full mt-4 py-3 text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
                Back to Marketing Site
            </button>
          </form>
          
        </div>
      </div>
    );
  };
  
  // ===============================================
  // 2. LANDING PAGE COMPONENT (Updated link to Login)
  // ===============================================
  const LandingPage = () => (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 w-full transition-all">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src={LOGO_URL} 
              alt="Orca Tech Logo" 
              className="h-24 w-24 rounded-full object-contain bg-slate-50 border border-slate-100 shadow-sm" 
            />
            <div className="text-3xl font-black tracking-tighter text-slate-900 cursor-default select-none">
              Orca Tech
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 font-medium text-slate-600 text-sm">
              <a href="#solutions" className="hover:text-orca-600 transition">Solutions</a>
              <a href="#hardware" className="hover:text-orca-600 transition">Hardware</a>
              <a href="#pricing" className="hover:text-orca-600 transition">Pricing</a>
            </nav>
            {/* Directs to the new 'login' view */}
            <button 
              onClick={() => setView('login')}
              className="bg-orca-900 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-orca-700 transition shadow-md hover:shadow-lg"
            >
              Fleet Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col md:flex-row items-center max-w-7xl mx-auto px-8 py-20 gap-16">
        <div className="flex-1 space-y-8">

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            Stop Fuel Theft. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Start Saving.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
            Fuel accounts for over 30% of your total operation costs, yet most fleet managers rely on impercise and outdated sensor kits to track it.
          </p>
          
          <div className="flex gap-4 pt-4">
            {/* Directs to the new 'login' view */}
            <Link href={destinationUrl1}>
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/25"
            >
              Start Monitoring
            </button>
            </Link>
          
            <Link href={destinationUrl1}>
            <button className="px-8 py-4 rounded-xl font-bold text-lg text-slate-700 border border-slate-200 hover:bg-slate-50 transition hover:border-slate-300">
              Learn More
            </button>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 relative w-full">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-[2rem] blur-3xl opacity-40 z-0"></div>
          <img 
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop" 
            alt="Trucking Fleet" 
            className="rounded-2xl shadow-2xl relative z-10 border-4 border-white w-full object-cover aspect-[4/3]"
          />
          <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl z-20 border border-slate-100 hidden md:block animate-bounce-slow">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                <Droplet size={28} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Fuel Saved Today</p>
                <p className="text-3xl font-bold text-slate-900">1,240 gal</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-lg mb-3">Our Solutions</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to run an efficient fleet</h3>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">We combine cutting-edge hardware, extensive testing, and powerful software to give you complete visibility over your most expensive cost center.</p>
          </div>

         <div className="flex flex-col items-center mb-16">
          <div className="max-w-4xl w-full">
            <img 
              src="/prototype.jpg" 
              alt="Orca Sensor Laboratory Testing" 
              className="rounded-2xl shadow-xl w-full h-82 object-cover border border-slate-200"
            />
            {/* The Subtitle */}
            <p className="mt-4 text-center text-slate-500 text-sm italic">
              Fig 1.1: High-precision testing bed to ensure sensor accuracy in turbulant flow.
            </p>
          </div>
        </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <ShieldCheck size={32} />, 
                title: "Theft Prevention", 
                desc: "Instant alerts for rapid fuel drops when the ignition is off. Geofenced incidents help recovery and prosecution." 
              },
              { 
                icon: <BarChart3 size={32} />, 
                title: "Smart Analytics", 
                desc: "Advanced insights to analyze historical data to recommend route changes and driver coaching." 
              },
              { 
                icon: <Zap size={32} />, 
                title: "Efficiency Boosting", 
                desc: "Monitor idling time and aggressive driving behaviors that burn excess fuel. Leverage live data to cut your top operational cost center and ensure your drivers operate safely." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Section (omitted for brevity, assume content remains the same) */}
      <section id="hardware" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
               <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10"></div>
               <img 
                 src="/product.jpg" 
                 alt="Orca Sense Sensor" 
                 className="rounded-3xl shadow-2xl relative z-10 w-full"
               />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-blue-600 font-bold tracking-wide uppercase text-lg mb-3">The Hardware</h2>
                <h3 className="text-4xl font-bold text-slate-900 mb-6">Meet Orca Sense. <br/>Install in minutes, save time and money for years.</h3>
                <p className="text-slate-600 text-lg mb-6">
                  Our sensor has a water proof housing and uses ultra low power, making it easy to install, to maintain, and extremely safe. Our sensors attach to the top of any fuel tank and can be installed in minutes. Ruggedized for the harshest road conditions.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: <Radio size={20} />, text: "LTE Global Connectivity" },
                  { icon: <Battery size={20} />, text: "Instant savings that bring ROI immediately" },
                  { icon: <Wifi size={20} />, text: "0.5% Accuracy Precision" },
                  { icon: <ShieldCheck size={20} />, text: "Waterproof, dustproof, and safety rated housing" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      {feature.icon}
                    </div>
                    <span className="font-medium text-slate-800">{feature.text}</span>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (omitted for brevity, assume content remains the same) */}
      <section id="pricing" className="py-24 bg-orca-900 text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-400 font-bold tracking-wide uppercase text-lg mb-3">Pricing</h2>
            <h3 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h3>
            <p className="text-slate-400 max-w-xl mx-auto">No hidden fees. Pause or cancel anytime. Hardware is included free when you choose an annual plan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-orca-800 border border-orca-700 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Starter</h4>
                <p className="text-slate-400 text-sm">For small fleets just getting started.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$10</span>
                <span className="text-slate-400"> /device/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Real-time tracking", "Basic fuel reports", "Mobile app access"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check size={16} className="text-blue-400" /> {item}
                  </li>
                ))}
              </ul>
              <Link href={destinationUrl1}>
              <button className="w-full py-3 bg-orca-700 hover:bg-orca-600 text-white rounded-xl font-semibold transition">Get Started</button>
              </Link>
            </div>

            {/* Pro - UPDATED CARD */}
            <div className="bg-white text-slate-900 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl overflow-hidden">
              
              {/* FIXED RIBBON: 2-Line Text, Perfect Sticker Look */}
             <div className="absolute top-8 -right-32 w-96 rotate-45 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-orca-900 py-2 text-center shadow-md border-b-2 border-yellow-600/30 z-20">
              <div className="flex flex-col items-center justify-center leading-tight">
                <span className="font-extrabold text-xs uppercase tracking-widest drop-shadow-sm">ROI Guaranteed</span>
                <span className="font-bold text-[10px] uppercase tracking-wider opacity-90">Or It's Free</span>
              </div>
            </div>

              {/* Added mt-4 to prevent overlap with the ribbon */}
              <div className="mb-6 relative z-0 mt-4">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Professional</h4>
                <p className="text-slate-500 text-sm">Full visibility and AI insights.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">$150</span>
                <span className="text-slate-500"> /device/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Everything in starter", "Fuel optimization model", "Theft prediction model", "Driver behavior score", "Unlimited history"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                    <div className="bg-blue-100 p-0.5 rounded-full">
                      <Check size={14} className="text-blue-600" />
                    </div> 
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={destinationUrl1}>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg">Get Started</button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-orca-800 border border-orca-700 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Enterprise</h4>
                <p className="text-slate-400 text-sm">For fleets with 100+ vehicles.</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {["Dedicated Support Manager", "Custom API Integration", "On-site Installation", "3 year Warranty"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check size={16} className="text-blue-400" /> {item}
                  </li>
                ))}
              </ul>
              <Link href={destinationUrl1}>
              <button className="w-full py-3 bg-orca-700 hover:bg-orca-600 text-white rounded-xl font-semibold transition">Contact Sales</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Strip */}
      <footer className="bg-orca-950 text-slate-400 py-12 border-t border-orca-800">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-70 hover:opacity-100 transition">
             <img src={LOGO_URL} alt="Orca" className="h-8 w-8 rounded-full" />
             <span className="font-bold text-black">ORCA Tech</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="https://cal.com/orca-trucks/30min" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );

  // ===============================================
  // 3. DASHBOARD COMPONENT (Updated link to Logout)
  // ===============================================
  const Dashboard = () => (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}> {/* Changed to handleLogout */}
            <img src={LOGO_URL} alt="Orca" className="h-10 w-10 rounded-full border border-slate-200" />
            <span className="font-bold text-orca-900 text-xl tracking-tight hidden md:block">Orca Tech</span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <h1 className="text-slate-500 font-medium hidden md:block">Fleet Dashboard</h1>
          <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wide flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search trucks..." 
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Dedicated Logout Button */}
          <button 
            onClick={handleLogout} 
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Logout
          </button>
          
          <div className="h-8 w-8 bg-orca-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
            JD
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Added conditional rendering check for trucks array length */}
        {trucks.length > 0 && selectedTruck ? (
          <>
            <TruckList trucks={trucks} selectedId={selectedTruckId} onSelect={setSelectedTruckId} />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedTruck.name}</h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <span className="font-medium">ID: {selectedTruck.id}</span>
                      <span>•</span>
                      <span>Driver: {selectedTruck.driver}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Map size={14} />
                        {selectedTruck.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm">
                      View History
                    </button>
                    <button className="px-4 py-2 bg-orca-900 text-white rounded-lg text-sm font-medium hover:bg-orca-800 shadow-md flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Live View
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-300">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">Current Level</p>
                      <p className="text-3xl font-bold text-slate-800 tabular-nums">{Math.round(selectedTruck.fuelLevel)}%</p>
                      <p className="text-xs text-slate-400 mt-1 tabular-nums">
                        {(selectedTruck.capacity * (selectedTruck.fuelLevel / 100)).toFixed(1)} / {selectedTruck.capacity} gal
                      </p>
                    </div>
                    <div className={`p-4 rounded-full transition-colors duration-500 ${selectedTruck.fuelLevel < 20 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      <Droplet size={32} fill={selectedTruck.fuelLevel < 20 ? 'currentColor' : 'none'} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">Efficiency</p>
                      <p className="text-3xl font-bold text-slate-800">{selectedTruck.currentMpg.toFixed(1)} <span className="text-lg text-slate-400 font-normal">mpg</span></p>
                      <p className="text-xs text-green-600 mt-1 font-medium flex items-center">
                        +0.4 mpg vs fleet avg
                      </p>
                    </div>
                    <div className="p-4 rounded-full bg-green-50 text-green-600">
                      <Gauge size={32} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium mb-1">Est. Range</p>
                      <p className="text-3xl font-bold text-slate-800 tabular-nums">
                        {Math.round((selectedTruck.capacity * (selectedTruck.fuelLevel / 100)) * selectedTruck.currentMpg)} 
                        <span className="text-lg text-slate-400 font-normal"> mi</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Based on current consumption
                      </p>
                    </div>
                    <div className="p-4 rounded-full bg-indigo-50 text-indigo-500">
                      <Map size={32} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <LayoutDashboard size={18} className="text-slate-400" />
                        Fuel Consumption Trend
                      </h3>
                      <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Last 12 Hours</option>
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                      </select>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                      <FuelChart 
                        data={selectedTruck.history} 
                        color={selectedTruck.fuelLevel < 20 ? '#ef4444' : '#3b82f6'} 
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1 h-full min-h-[400px]">
                    <AIInsightPanel selectedTruck={selectedTruck} />
                  </div>
                </div>

              </div>
            </main>
            <FleetChat trucks={trucks} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading Fleet Data...</div>
        )}
      </div>
    </div>
  );

  // ===============================================
  // 4. MAIN RENDER LOGIC
  // ===============================================
  if (view === 'login') {
    return <LoginPage />;
  }
  
  if (view === 'dashboard') {
    return <Dashboard />;
  }

  return <LandingPage />;
}