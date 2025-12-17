import React, { useState, useEffect } from 'react';
import { Truck, FuelDataPoint } from '../types';
import { TruckList } from './TruckList';
import { FuelChart } from './FuelChart';
import { AIInsightPanel } from './AIInsightPanel';
import { FleetChat } from './FleetChat';
import { LayoutDashboard, Search, Bell, Droplet, Gauge, Map, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

// NOTE: This mock data generation should be moved to a service or API call in a real application.
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

const LOGO_URL = "/public/Orca.jpg";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  
  useEffect(() => {
    const data = generateMockData();
    setTrucks(data);
    setSelectedTruckId(data[0].id);
  }, []);

  useEffect(() => {
    // Live update simulation for the dashboard
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
  }, []);

  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onLogout}> 
            <img src={LOGO_URL} alt="Orca" className="h-10 w-10 rounded-full border border-slate-200" />
            <span className="font-bold text-orca-900 text-xl tracking-tight hidden md:block">Orca Trucks</span>
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
          <button 
            onClick={onLogout} // Added a dedicated logout button
            className="p-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full"
          >
            Logout
          </button>
          <div className="h-8 w-8 bg-orca-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
            JD
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Check if trucks[0] exists before passing to TruckList and using selectedTruck. 
            This handles the brief moment before mock data is loaded. */}
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
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading Dashboard Data...</div>
        )}
      </div>
    </div>
  );
};