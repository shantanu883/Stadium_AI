import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Sparkles, 
  Map, 
  Bus, 
  AlertTriangle, 
  Users, 
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getQuickLinks = () => {
    const common = [
      { label: 'Chat Assistant', desc: 'Ask Gemini about seats, washrooms, or translation.', path: '/ai-assistant', icon: Sparkles, color: 'text-fifa-accent' },
      { label: 'Seat Navigator', desc: 'Interactive stadium layout and path guide.', path: '/navigation', icon: Map, color: 'text-fifa-neonPurple' },
      { label: 'Transit Predictor', desc: 'Parking status, metro and taxi logs.', path: '/transport', icon: Bus, color: 'text-fifa-neonYellow' },
      { label: 'Report Incident', desc: 'Report medical, facility, or security issues.', path: '/reports', icon: AlertTriangle, color: 'text-fifa-neonRed' },
    ];

    if (user?.role === 'admin') {
      return [
        { label: 'Operations Command', desc: 'Admin control room telemetry overview.', path: '/admin', icon: ShieldCheck, color: 'text-fifa-neonRed font-bold' },
        { label: 'Crowd Center', desc: 'Live heatmaps and gate bottleneck logs.', path: '/crowd-monitor', icon: Users, color: 'text-fifa-accent' },
        ...common
      ];
    }

    if (user?.role === 'staff') {
      return [
        { label: 'Crowd Center', desc: 'Live heatmaps and gate bottleneck logs.', path: '/crowd-monitor', icon: Users, color: 'text-fifa-accent' },
        ...common
      ];
    }

    if (user?.role === 'fan') {
      return [
        { label: 'My Ticket Arena', desc: 'Access match ticket details and seat information.', path: '/dashboard', icon: TrendingUp, color: 'text-fifa-gold font-bold' },
        ...common
      ];
    }

    return common;
  };

  const quickLinks = getQuickLinks();

  return (
    <div className="space-y-6 pt-4">
      {/* Hero Banner Grid */}
      <GlassCard accent="blue" hoverEffect={false} className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-fifa-accent/10 to-fifa-neonPurple/10 rounded-full filter blur-3xl -z-10 translate-x-20 -translate-y-20"></div>
        
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-fifa-gold/10 border border-fifa-gold/20 text-fifa-gold text-xs font-bold uppercase tracking-wider mb-4 animate-neon-pulse">
            ⚽ FIFA World Cup 2026 - MetLife Stadium Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Next-Gen Stadium <br/>
            <span className="bg-gradient-to-r from-fifa-accent to-fifa-neonPurple bg-clip-text text-transparent text-glow-blue">
              AI Command Platform
            </span>
          </h1>
          <p className="text-gray-400 mt-4 text-sm md:text-base leading-relaxed">
            Welcome to the StadiumAI operational cockpit. Utilizing Google Gemini API telemetry summaries, 
            this interface manages visitor logistics, security response units, real-time queues, and sustainability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/ai-assistant')}
              className="px-5 py-3 rounded-xl bg-gradient-fifa text-fifa-dark font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-neon-blue transition-all"
            >
              <span>Query AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/navigation')}
              className="px-5 py-3 rounded-xl border border-gray-800 hover:border-fifa-accent text-white font-bold text-sm transition-all"
            >
              Explore Map Layout
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Grid of features */}
      <div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
          quick operations directory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <GlassCard
                key={idx}
                onClick={() => navigate(link.path)}
                className="flex flex-col justify-between h-40 group hover:border-fifa-accent/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg bg-gray-800/60 border border-gray-700/30 ${link.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-fifa-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-4">
                    {link.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Info status tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard hoverEffect={false} className="p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-fifa-neonGreen animate-pulse shadow-neon-green"></div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">stadium status</h4>
            <p className="text-xs text-gray-400 mt-0.5 truncate">All stadium networks, turnstiles and safety sensors are reporting fully green.</p>
          </div>
        </GlassCard>
        
        <GlassCard hoverEffect={false} className="p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-fifa-neonYellow animate-pulse shadow-neon-purple"></div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Upcoming Match</h4>
            <p className="text-xs text-gray-400 mt-0.5 truncate">Argentina vs France Kick-off in 2 hours. High security alerts deployed at Gate C.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
