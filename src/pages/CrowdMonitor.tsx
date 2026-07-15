import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { LiveBadge } from '../components/LiveBadge';
import { MapWidget } from '../components/MapWidget';
import { fetchCrowdStatus } from '../api';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  Map
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from 'recharts';

// Seed graph telemetry
const rawChartData = [
  { time: '18:00', scans: 1200 },
  { time: '18:15', scans: 2400 },
  { time: '18:30', scans: 4500 },
  { time: '18:45', scans: 6200 },
  { time: '19:00', scans: 8900 },
  { time: '19:15', scans: 12400 },
  { time: '19:30', scans: 14800 },
  { time: '19:45', scans: 18900 },
  { time: '20:00', scans: 21500 },
];

export const CrowdMonitor: React.FC = () => {
  const [gates, setGates] = useState<any[]>([]);
  const [chartData, setChartData] = useState(rawChartData);


  const loadCrowdLogs = async () => {
    try {
      const data = await fetchCrowdStatus();
      setGates(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCrowdLogs();
    const interval = setInterval(() => {
      loadCrowdLogs();
      
      // Simulate ticking up graph values
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const nextTime = new Date(`2026-07-10T${last.time}:00`);
        nextTime.setMinutes(nextTime.getMinutes() + 15);
        const pad = (n: number) => String(n).padStart(2, '0');
        const timeStr = `${pad(nextTime.getHours())}:${pad(nextTime.getMinutes())}`;
        
        const nextScans = Math.min(24000, last.scans + Math.floor(Math.random() * 800) - 200);
        return [...prev.slice(1), { time: timeStr, scans: nextScans }];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const totalVisitors = gates.reduce((acc, g) => acc + g.capacity, 0) * 15 + 42000;

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="text-fifa-accent" /> Crowd Intelligence telemetry
          </h1>
          <p className="text-xs text-gray-400 font-medium">Monitoring entrance gates, ticket scans, and stadium heatmaps.</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge status="medium" label="Match inflow peaking" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard hoverEffect={true} className="p-4">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Total Active Attendance</span>
          <h3 className="text-2xl font-extrabold text-white text-glow-blue mt-1">
            {totalVisitors.toLocaleString()}
          </h3>
          <p className="text-[10px] text-fifa-accent mt-0.5 font-bold">87.2% Capacity Reached</p>
        </GlassCard>

        <GlassCard hoverEffect={true} className="p-4">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Peak Congestion Gate</span>
          <h3 className="text-2xl font-extrabold text-fifa-neonRed mt-1">Gate C (South)</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Flow rate: 280 scans/min</p>
        </GlassCard>

        <GlassCard hoverEffect={true} className="p-4">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Average Wait Time</span>
          <h3 className="text-2xl font-extrabold text-white mt-1">8.5 Minutes</h3>
          <p className="text-[10px] text-fifa-neonGreen mt-0.5 font-bold">Below SLA Target (12m)</p>
        </GlassCard>

        <GlassCard hoverEffect={true} className="p-4">
          <span className="text-[9px] uppercase font-bold text-gray-500 block">Crowd Risk Level</span>
          <h3 className="text-2xl font-extrabold text-fifa-neonYellow mt-1">48 / 100</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Status: Orange/Moderate</p>
        </GlassCard>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap overlay (span-5) */}
        <div className="lg:col-span-5">
          <GlassCard accent="red" hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <Map className="w-4 h-4 text-fifa-neonRed" /> Concourse Heatmap Overlay
            </h3>
            
            <MapWidget
              sourceId="gate-c"
              destinationId="block-b4"
              heatmapMode={true}
            />

            <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 font-bold uppercase tracking-wider pt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fifa-accent"></span> Low density</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fifa-neonYellow"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fifa-neonRed animate-pulse"></span> Bottleneck</span>
            </div>
          </GlassCard>
        </div>

        {/* Right side: Charts & AI suggestions (span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Neon scan chart */}
          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <TrendingUp className="w-4 h-4 text-fifa-accent" /> Scan Inflow rate (Recharts)
            </h3>
            
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid #1f2937', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#00f0ff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* AI recommendations feed */}
          <GlassCard accent="gold" hoverEffect={false} className="flex gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fifa-gold/5 rounded-full filter blur-2xl pointer-events-none"></div>

            <div className="p-2.5 bg-fifa-gold/15 border border-fifa-gold/30 text-fifa-gold rounded-lg flex-shrink-0 self-start mt-0.5 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-fifa-gold block tracking-wider font-sans">
                Gemini Crowd routing suggestions
              </span>
              <p className="text-xs text-gray-300 font-medium leading-relaxed mt-1.5">
                "Gate C queue threshold is currently at <strong>88% capacity</strong>. 
                Action Recommended: Toggle auxiliary gates at Gate D to route incoming transit trains, 
                and update volunteer tablets at South Plaza to guide arrivals toward East Concourse Gate B."
              </p>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 bg-fifa-gold/20 hover:bg-fifa-gold/30 border border-fifa-gold/30 text-fifa-gold text-[10px] font-bold rounded uppercase tracking-wider transition-all">
                  Broadcast to Volunteers
                </button>
                <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded uppercase tracking-wider transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};
