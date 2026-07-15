import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  Bus, 
  Car, 
  Train, 
  MapPin, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ParkingSpace {
  name: string;
  capacity: number;
  filled: number;
  status: 'open' | 'filling' | 'full';
}

interface TransitSchedule {
  route: string;
  line: string;
  eta: number; // minutes
  status: 'on-time' | 'delayed' | 'boarding';
}

export const Transport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [parking, setParking] = useState<ParkingSpace[]>([
    { name: 'Lot A (North)', capacity: 1500, filled: 620, status: 'open' },
    { name: 'Lot B (South)', capacity: 2000, filled: 1850, status: 'full' },
    { name: 'Lot C (West)', capacity: 1200, filled: 980, status: 'filling' },
    { name: 'Lot D (VIP-East)', capacity: 500, filled: 210, status: 'open' },
  ]);

  const [schedules, setSchedules] = useState<TransitSchedule[]>([
    { route: 'Secaucus Express', line: 'Subway Line 1', eta: 3, status: 'boarding' },
    { route: 'Hoboken Local', line: 'Subway Line 2', eta: 8, status: 'on-time' },
    { route: 'NYC Direct Express', line: 'Train Line A', eta: 14, status: 'on-time' },
    { route: 'East Concourse Loop', line: 'Shuttle Bus B', eta: 5, status: 'on-time' },
  ]);

  // Simulate updates
  const refreshTransportLogs = () => {
    setLoading(true);
    setTimeout(() => {
      // Fluctuate parking
      setParking(prev => prev.map(p => {
        const change = Math.floor(Math.random() * 21) - 10;
        const newFilled = Math.max(100, Math.min(p.capacity, p.filled + change));
        const ratio = newFilled / p.capacity;
        const status = ratio > 0.85 ? 'full' : ratio > 0.6 ? 'filling' : 'open';
        return { ...p, filled: newFilled, status };
      }));

      // Adjust ETAs
      setSchedules(prev => prev.map(s => {
        let newEta = s.eta - 1;
        let status = s.status;
        if (newEta <= 0) {
          newEta = Math.floor(Math.random() * 12) + 4;
          status = 'on-time';
        } else if (newEta === 1) {
          status = 'boarding';
        }
        return { ...s, eta: newEta, status };
      }));
      setLoading(false);
    }, 700);
  };

  useEffect(() => {
    const interval = setInterval(refreshTransportLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bus className="text-fifa-accent" /> Transportation Intelligence
          </h1>
          <p className="text-xs text-gray-400 font-medium">Real-time transit networks, taxi loops, and parking status.</p>
        </div>
        <button
          onClick={refreshTransportLogs}
          disabled={loading}
          className="p-2 border border-gray-800 hover:border-fifa-accent hover:text-fifa-accent bg-gray-900/40 text-gray-400 rounded-lg transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Grid: Parking + Metro/Bus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Parking Lot Statuses */}
        <GlassCard accent="blue" hoverEffect={false} className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
            <Car className="w-4 h-4 text-fifa-accent" /> parking lot ratios
          </h3>
          
          <div className="space-y-4 pt-2">
            {parking.map((lot, idx) => {
              const ratio = (lot.filled / lot.capacity) * 100;
              const isFull = lot.status === 'full';
              const isFilling = lot.status === 'filling';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-300">
                    <span>{lot.name}</span>
                    <span className={isFull ? 'text-fifa-neonRed' : isFilling ? 'text-fifa-neonYellow' : 'text-fifa-neonGreen'}>
                      {lot.filled.toLocaleString()} / {lot.capacity.toLocaleString()} ({Math.round(ratio)}% Filled)
                    </span>
                  </div>
                  {/* Progress bar wrapper */}
                  <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull 
                          ? 'bg-fifa-neonRed shadow-neon-red' 
                          : isFilling 
                            ? 'bg-fifa-neonYellow shadow-[0_0_10px_#ffea00]' 
                            : 'bg-fifa-neonGreen shadow-neon-green'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Live Transit Schedules */}
        <GlassCard accent="purple" hoverEffect={false} className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
            <Train className="w-4 h-4 text-fifa-neonPurple" /> metro & shuttle departures
          </h3>

          <div className="space-y-3 pt-2">
            {schedules.map((schedule, idx) => {
              const isBoarding = schedule.status === 'boarding';
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-gray-900/40 border border-gray-800 rounded-xl"
                >
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                      {schedule.line}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      {schedule.route}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      isBoarding 
                        ? 'bg-fifa-neonRed/15 text-fifa-neonRed border border-fifa-neonRed/20 animate-pulse' 
                        : 'bg-fifa-neonGreen/10 text-fifa-neonGreen border border-fifa-neonGreen/20'
                    }`}>
                      {schedule.status}
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {isBoarding ? 'Now' : `${schedule.eta}m`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

      </div>

      {/* AI Transport Predictions Advisory */}
      <div className="grid grid-cols-1 gap-6">
        <GlassCard accent="gold" hoverEffect={false} className="relative overflow-hidden flex items-start gap-4">
          {/* Decorative design overlay */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-fifa-gold/5 rounded-full filter blur-3xl pointer-events-none"></div>

          <div className="p-3 bg-fifa-gold/10 border border-fifa-gold/20 text-fifa-gold rounded-xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Gemini AI Transportation Outflow Advisory
            </h3>
            <p className="text-xs text-gray-300 font-medium leading-relaxed max-w-4xl">
              "Based on matchday telemetry, an attendance of 72,000 will create severe bottlenecks at Gate B (East) and South Lot B immediately post-match. 
              <strong> Recommended Exit Route: </strong> Leave through Gate C (South) or Gate D (West) and utilize the Secaucus Express Subway Line 1. Shuttles are operating at 3-minute intervals from Gate D to Lot C."
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Taxi points info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hoverEffect={true} className="p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-fifa-accent" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Taxi Stand North</h4>
            <p className="text-[10px] text-gray-400 font-medium">Located next to Gate A. Active taxi fleet count: 48 vehicles.</p>
          </div>
        </GlassCard>
        
        <GlassCard hoverEffect={true} className="p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-fifa-neonPurple" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rideshare Zone South</h4>
            <p className="text-[10px] text-gray-400 font-medium">Located at South Lot B. Current queue pickup wait: ~12 minutes.</p>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
