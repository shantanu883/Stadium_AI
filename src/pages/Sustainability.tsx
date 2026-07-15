import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { LiveBadge } from '../components/LiveBadge';
import { fetchSustainabilityMetrics } from '../api';
import { 
  Leaf, 
  Sparkles, 
  Zap, 
  Droplet, 
  Trash2,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const mockDailyResources = [
  { day: 'Mon', energy: 11200, water: 72000, waste: 2100 },
  { day: 'Tue', energy: 10800, water: 68000, waste: 1950 },
  { day: 'Wed', energy: 13500, water: 88000, waste: 3100 },
  { day: 'Thu', energy: 12100, water: 78000, waste: 2400 },
  { day: 'Fri', energy: 14200, water: 94000, waste: 3800 },
  { day: 'Sat', energy: 16800, water: 110000, waste: 5100 },
  { day: 'Sun', energy: 12450, water: 84000, waste: 3450 },
];

export const Sustainability: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const chartData = mockDailyResources;
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    try {
      const data = await fetchSustainabilityMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMetrics();
    const timer = setInterval(() => {
      loadMetrics();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const refreshTelemetry = () => {
    setLoading(true);
    setTimeout(() => {
      loadMetrics();
      setLoading(false);
    }, 600);
  };

  if (!metrics) {
    return <div className="p-6 text-gray-400 font-medium">Loading green telemetry...</div>;
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Leaf className="text-fifa-neonGreen" /> Sustainability monitor
          </h1>
          <p className="text-xs text-gray-400 font-medium">Tracking solar grids, water recyclers, and solid waste diversion.</p>
        </div>
        <button
          onClick={refreshTelemetry}
          disabled={loading}
          className="p-2 border border-gray-800 hover:border-fifa-accent hover:text-fifa-accent bg-gray-900/40 text-gray-400 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Energy Card */}
        <GlassCard accent="gold" hoverEffect={false} className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-fifa-gold/15 text-fifa-gold border border-fifa-gold/20 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <LiveBadge status="normal" label="Optimal Grid" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Solar Powered Electricity</span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {metrics.energy.current.toLocaleString()} kWh
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              Solar panel grid ratio: <span className="text-fifa-gold font-bold">{metrics.energy.solarRatio}%</span>
            </p>
          </div>
        </GlassCard>

        {/* Water Card */}
        <GlassCard accent="blue" hoverEffect={false} className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-fifa-accent/15 text-fifa-accent border border-fifa-accent/20 rounded-lg">
              <Droplet className="w-5 h-5" />
            </div>
            <LiveBadge status="normal" label="Closed Loop" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Greywater Recycle Rate</span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {metrics.water.current.toLocaleString()} Liters
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              Recycled water feed: <span className="text-fifa-accent font-bold">{metrics.water.recycledRatio}%</span>
            </p>
          </div>
        </GlassCard>

        {/* Waste Card */}
        <GlassCard accent="green" hoverEffect={false} className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-fifa-neonGreen/15 text-fifa-neonGreen border border-fifa-neonGreen/20 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <LiveBadge status="normal" label="Recycling Active" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Solid Waste Diversion</span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {metrics.waste.total.toLocaleString()} kg
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              Eco diversion rate: <span className="text-fifa-neonGreen font-bold">{metrics.waste.recyclingRate}% Recycled</span>
            </p>
          </div>
        </GlassCard>

      </div>

      {/* Chart + Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Resource charts */}
        <div className="lg:col-span-8">
          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <TrendingDown className="w-4 h-4 text-fifa-accent" /> Weekly solid waste logs (kg)
            </h3>
            
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid #1f2937', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#00ff66', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="waste" fill="#00ff66" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* AI Recommendations Panel */}
        <div className="lg:col-span-4">
          <GlassCard accent="green" hoverEffect={false} className="space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                <Sparkles className="w-4 h-4 text-fifa-neonGreen animate-pulse" /> Green AI Advisory
              </h3>
              
              <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-fifa-neonGreen block tracking-widest">
                  Waste Detection Alert
                </span>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  "Food zone B has high plastic waste accumulation. 
                  Action Recommended: Deploy 3 extra double-stream recycling bins near Section 114 to divert bottle refuse from landfill compactors."
                </p>
              </div>

              <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-fifa-accent block tracking-widest">
                  Energy Saver Suggestion
                </span>
                <p className="text-xs text-gray-300 font-medium leading-relaxed">
                  "Peak solar grid load complete. Offset luxury corridor lights by 15% during final half-time without sacrificing crowd visibility."
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/80">
              <button className="w-full py-2.5 rounded-xl bg-fifa-neonGreen/10 hover:bg-fifa-neonGreen/20 text-fifa-neonGreen hover:text-white border border-fifa-neonGreen/20 hover:border-fifa-neonGreen/40 font-bold text-xs uppercase tracking-wider transition-all duration-200">
                Dispatch Eco Crews
              </button>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
