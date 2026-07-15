import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { LiveBadge } from '../components/LiveBadge';
import { 
  fetchAdminStats, 
  fetchIncidents, 
  updateIncident, 
  chatWithGemini 
} from '../api';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  AlertOctagon, 
  Sparkles, 
  Terminal,
  Send,
  TrendingUp,
  RotateCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const mockScanData = [
  { time: '17:00', scans: 4500 },
  { time: '17:30', scans: 12000 },
  { time: '18:00', scans: 25000 },
  { time: '18:30', scans: 42000 },
  { time: '19:00', scans: 58000 },
  { time: '19:30', scans: 69000 },
  { time: '20:00', scans: 74200 },
];

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [terminalInput, setTerminalInput] = useState('Summarize current stadium condition');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [loadingTerminal, setLoadingTerminal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const statsData = await fetchAdminStats();
      const incidentList = await fetchIncidents();
      setStats(statsData);
      setIncidents(incidentList.filter((i: any) => i.status !== 'resolved'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Run AI Operations Assistant query
  const queryOpsAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    setLoadingTerminal(true);
    setTerminalOutput('');
    try {
      const response = await chatWithGemini(terminalInput, 'admin');
      setTerminalOutput(response);
    } catch (err) {
      setTerminalOutput('Failed to communicate with ops mainframe. Check terminal links.');
    } finally {
      setLoadingTerminal(false);
    }
  };

  const handleIncidentStatus = async (id: string, nextStatus: 'dispatched' | 'resolved') => {
    try {
      await updateIncident(id, nextStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!stats) {
    return <div className="p-6 text-gray-400 font-medium">Booting command mainframe...</div>;
  }

  const priorityColors = {
    low: 'text-gray-400 bg-gray-800/40 border-gray-800',
    medium: 'text-fifa-neonYellow bg-fifa-neonYellow/10 border-fifa-neonYellow/20',
    high: 'text-fifa-neonPurple bg-fifa-neonPurple/10 border-fifa-neonPurple/20',
    critical: 'text-fifa-neonRed bg-fifa-neonRed/10 border-fifa-neonRed/20 animate-pulse',
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2 text-glow-purple">
            <ShieldAlert className="text-fifa-neonRed animate-pulse" /> operations command center
          </h1>
          <p className="text-xs text-gray-400 font-medium">MetLife Stadium Master Console • FIFA 2026 Operations Mainframe</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 border border-gray-800 hover:border-fifa-accent hover:text-fifa-accent bg-gray-900/40 text-gray-400 rounded-lg transition-all flex items-center gap-1.5 font-bold text-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync telemetry</span>
        </button>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard accent="blue" hoverEffect={false} className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Total Active Scans</span>
            <h3 className="text-2xl font-black text-white text-glow-blue mt-1">
              {stats.totalVisitors.toLocaleString()}
            </h3>
            <span className="text-[10px] text-fifa-accent font-bold mt-0.5">Spectators Inside</span>
          </div>
          <div className="p-3 bg-fifa-accent/10 border border-fifa-accent/20 text-fifa-accent rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard accent="purple" hoverEffect={false} className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">System Active Alerts</span>
            <h3 className="text-2xl font-black text-fifa-neonPurple mt-1">
              {stats.activeAlerts}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold mt-0.5">Critical Gate Congestion</span>
          </div>
          <div className="p-3 bg-fifa-neonPurple/10 border border-fifa-neonPurple/20 text-fifa-neonPurple rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard accent="gold" hoverEffect={false} className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Crowd Risk Index</span>
            <h3 className="text-2xl font-black text-fifa-gold mt-1">
              {stats.crowdRiskScore}%
            </h3>
            <span className="text-[10px] text-fifa-gold font-bold mt-0.5">Status: Moderate Risk</span>
          </div>
          <div className="p-3 bg-fifa-gold/10 border border-fifa-gold/20 text-fifa-gold rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard accent="red" hoverEffect={false} className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Open Incidents</span>
            <h3 className="text-2xl font-black text-fifa-neonRed mt-1">
              {stats.openIncidents}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold mt-0.5">Awaiting Resolution</span>
          </div>
          <div className="p-3 bg-fifa-neonRed/10 border border-fifa-neonRed/20 text-fifa-neonRed rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: AI Assistant Console + Incidents Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Span-7: Operations Mainframe Console */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Terminal */}
          <GlassCard hoverEffect={false} className="space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-fifa-accent" /> AI Operations Assistant Mainframe
              </h3>
              <LiveBadge status="normal" label="Gemini Ops online" />
            </div>

            {/* Prompt input Form */}
            <form onSubmit={queryOpsAI} className="flex gap-2">
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Ask ops AI... (e.g. 'Summarize current stadium condition')"
                className="flex-1 bg-gray-950 border border-gray-800 focus:border-fifa-accent focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl transition-all"
              />
              <button
                type="submit"
                disabled={loadingTerminal}
                className="p-3 rounded-xl bg-gradient-fifa hover:opacity-90 text-fifa-dark transition-all disabled:opacity-40"
                title="Send command"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Terminal Screen response box */}
            <div className="bg-black/85 border border-gray-800/80 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-gray-300 min-h-[180px] max-h-[300px] overflow-y-auto">
              {loadingTerminal ? (
                <div className="flex items-center gap-2 text-fifa-accent">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing live metrics... compiling incident backlogs...</span>
                </div>
              ) : terminalOutput ? (
                <div className="whitespace-pre-wrap select-text">{terminalOutput}</div>
              ) : (
                <div className="text-gray-600">
                  StadiumAI Operations terminal ready. Submit queries to parse live fire, medical, gate bottlenecks and recommendations.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Ticket scans chart */}
          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <TrendingUp className="w-4 h-4 text-fifa-accent" /> Ticket Check-in Scans (Recharts)
            </h3>
            
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockScanData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', border: '1px solid #1f2937', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#d600ff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="scans" stroke="#d600ff" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          
        </div>

        {/* Right Span-5: Incidents Dispatch Deck */}
        <div className="lg:col-span-5">
          <GlassCard accent="red" hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <ShieldAlert className="w-4 h-4 text-fifa-neonRed" /> active incidents panel ({incidents.length})
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-10 font-medium">All systems normal. No pending tickets.</p>
              ) : (
                incidents.map((inc) => {
                  return (
                    <div 
                      key={inc.id}
                      className="p-3.5 bg-gray-900/40 border border-gray-800 rounded-xl space-y-2.5 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-white uppercase block leading-tight">{inc.title}</span>
                          <span className="text-[9px] text-gray-500 block mt-0.5">Loc: {inc.location}</span>
                        </div>
                        <span className={`text-[8px] font-bold uppercase border px-1.5 py-0.5 rounded ${priorityColors[inc.priority as 'low' | 'medium' | 'high' | 'critical']}`}>
                          {inc.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                        {inc.description}
                      </p>
                      
                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-800/60 text-[9px] text-gray-500">
                        <span>Reported: {inc.reportedBy.split('@')[0]}</span>
                        <div className="flex gap-1.5">
                          {inc.status === 'pending' && (
                            <button
                              onClick={() => handleIncidentStatus(inc.id, 'dispatched')}
                              className="px-2 py-0.5 rounded bg-fifa-neonPurple/20 text-fifa-neonPurple border border-fifa-neonPurple/30 font-bold transition-all text-[9px]"
                            >
                              DISPATCH
                            </button>
                          )}
                          <button
                            onClick={() => handleIncidentStatus(inc.id, 'resolved')}
                            className="px-2 py-0.5 rounded bg-fifa-neonGreen/20 text-fifa-neonGreen border border-fifa-neonGreen/30 font-bold transition-all text-[9px]"
                          >
                            RESOLVE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
