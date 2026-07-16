import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { GlassCard } from './GlassCard';
import { TrendingUp, Users, Zap, Shield, Leaf } from 'lucide-react';

interface AnalyticsData {
  time: string;
  crowdDensity: number;
  energyUsage: number;
  incidentRate: number;
  sustainabilityScore: number;
  aiPredictions: number;
}

interface HeatmapData {
  section: string;
  density: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  capacity: number;
}

export const AdvancedAnalytics: React.FC = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<AnalyticsData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'crowd' | 'energy' | 'incidents' | 'ai'>('crowd');

  useEffect(() => {
    // Generate realistic time series data
    const generateTimeSeriesData = () => {
      const now = new Date();
      const data: AnalyticsData[] = [];
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();
        
        // Simulate realistic patterns based on time of day
        const crowdMultiplier = hour >= 18 && hour <= 22 ? 1.8 : 
                               hour >= 14 && hour <= 17 ? 1.4 : 0.6;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          crowdDensity: Math.floor((Math.random() * 40 + 30) * crowdMultiplier),
          energyUsage: Math.floor((Math.random() * 30 + 60) * (crowdMultiplier * 0.8 + 0.2)),
          incidentRate: Math.floor(Math.random() * 5 + (crowdMultiplier > 1.5 ? 3 : 1)),
          sustainabilityScore: Math.floor(Math.random() * 20 + 70),
          aiPredictions: Math.floor(Math.random() * 15 + 5)
        });
      }
      
      setTimeSeriesData(data);
    };

    // Generate heatmap data
    const generateHeatmapData = () => {
      const sections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'VIP', 'F1', 'F2', 'F3'];
      const data: HeatmapData[] = sections.map(section => {
        const density = Math.random() * 100;
        const risk = density > 85 ? 'critical' : 
                    density > 70 ? 'high' : 
                    density > 50 ? 'medium' : 'low';
        
        return {
          section,
          density: Math.floor(density),
          risk,
          capacity: Math.floor(Math.random() * 2000 + 500)
        };
      });
      
      setHeatmapData(data);
    };

    generateTimeSeriesData();
    generateHeatmapData();
    
    const interval = setInterval(() => {
      generateTimeSeriesData();
      generateHeatmapData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const metricColors = {
    crowd: '#00a3ff',
    energy: '#00ff66',
    incidents: '#ff003c',
    ai: '#a855f7'
  };

  const riskColors = {
    low: '#00ff66',
    medium: '#ffea00',
    high: '#ff6b35',
    critical: '#ff003c'
  };

  const pieData = [
    { name: 'Operational', value: 85, color: '#00ff66' },
    { name: 'Moderate Risk', value: 12, color: '#ffea00' },
    { name: 'High Risk', value: 3, color: '#ff003c' }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Real-Time Trends */}
      <GlassCard accent="blue" className="xl:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-fifa-accent" />
            <div>
              <h3 className="text-lg font-bold text-white">Real-Time Analytics Dashboard</h3>
              <p className="text-fifa-accent text-sm">24-hour operational metrics</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['crowd', 'energy', 'incidents', 'ai'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedMetric === metric 
                    ? 'bg-fifa-accent text-fifa-dark' 
                    : 'bg-fifa-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0a0e1a',
                  border: '1px solid #00a3ff30',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              {selectedMetric === 'crowd' && (
                <Area
                  type="monotone"
                  dataKey="crowdDensity"
                  stroke={metricColors.crowd}
                  fill={`${metricColors.crowd}30`}
                  strokeWidth={2}
                />
              )}
              {selectedMetric === 'energy' && (
                <Area
                  type="monotone"
                  dataKey="energyUsage"
                  stroke={metricColors.energy}
                  fill={`${metricColors.energy}30`}
                  strokeWidth={2}
                />
              )}
              {selectedMetric === 'incidents' && (
                <Area
                  type="monotone"
                  dataKey="incidentRate"
                  stroke={metricColors.incidents}
                  fill={`${metricColors.incidents}30`}
                  strokeWidth={2}
                />
              )}
              {selectedMetric === 'ai' && (
                <Area
                  type="monotone"
                  dataKey="aiPredictions"
                  stroke={metricColors.ai}
                  fill={`${metricColors.ai}30`}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Crowd Heatmap */}
      <GlassCard accent="red">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-fifa-neonRed" />
          <div>
            <h3 className="text-lg font-bold text-white">Section Density Heatmap</h3>
            <p className="text-fifa-neonRed text-sm">Real-time capacity monitoring</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                type="number"
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                type="category"
                dataKey="section"
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0e1a',
                  border: '1px solid #ff003c30',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={(value: any, name: string) => [
                  `${value}%`,
                  'Density'
                ]}
              />
              <Bar 
                dataKey="density" 
                fill="#ff003c"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fifa-neonGreen"></div>
            <span className="text-gray-300">Safe (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fifa-neonYellow"></div>
            <span className="text-gray-300">Moderate (50-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fifa-neonRed"></div>
            <span className="text-gray-300">Critical (&gt;85%)</span>
          </div>
        </div>
      </GlassCard>

      {/* Risk Distribution */}
      <GlassCard accent="green">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-fifa-neonGreen" />
          <div>
            <h3 className="text-lg font-bold text-white">Risk Distribution</h3>
            <p className="text-fifa-neonGreen text-sm">Security & safety status</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0e1a',
                  border: '1px solid #00ff6630',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 bg-fifa-dark/30 p-3 rounded-lg">
          <div className="text-xs text-fifa-neonGreen mb-2">🛡️ SECURITY STATUS</div>
          <div className="text-sm text-white">All systems operational - No immediate threats detected</div>
        </div>
      </GlassCard>
    </div>
  );
};