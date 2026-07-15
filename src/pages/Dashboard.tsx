import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { LiveBadge } from '../components/LiveBadge';
import { 
  Ticket, 
  CloudSun, 
  Users, 
  Clock, 
  Sparkles,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState('02:14:45');

  // Simulate ticket countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const parts = prev.split(':').map(Number);
        let sec = parts[2];
        let min = parts[1];
        let hr = parts[0];

        sec--;
        if (sec < 0) {
          sec = 59;
          min--;
          if (min < 0) {
            min = 59;
            hr--;
            if (hr < 0) {
              hr = 0; min = 0; sec = 0;
              clearInterval(timer);
            }
          }
        }

        const pad = (num: number) => String(num).padStart(2, '0');
        return `${pad(hr)}:${pad(min)}:${pad(sec)}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user || user.role !== 'fan' || !user.ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Unauthorized role. Fan dashboard requires spectator clearance.</p>
        <button onClick={() => navigate('/home')} className="mt-4 px-4 py-2 bg-fifa-accent text-fifa-dark font-bold rounded">
          Return Home
        </button>
      </div>
    );
  }

  const { ticket } = user;

  // Render QR Code grid simulator
  const renderMockQR = () => {
    return (
      <div className="w-24 h-24 bg-white p-1 rounded-lg border border-gray-700 flex flex-wrap justify-between content-between shadow-[0_0_15px_rgba(255,255,255,0.15)]">
        {[...Array(49)].map((_, i) => {
          // generate pseudo random pattern
          const isBlack = (i * 7 + 13) % 5 < 3;
          return (
            <div 
              key={i} 
              className={`w-[12%] h-[12%] rounded-sm ${isBlack ? 'bg-black' : 'bg-white'}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Ticket className="text-fifa-accent" /> Spectator Match Arena
          </h1>
          <p className="text-xs text-gray-400 font-medium">Manage your stadium pass and live logistics updates.</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveBadge status="normal" label="Turnstiles Active" />
        </div>
      </div>

      {/* Ticket Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Details Panel */}
        <GlassCard accent="gold" hoverEffect={false} className="lg:col-span-2 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Decorative stadium arc overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-fifa-gold/5 rounded-full filter blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-fifa-gold font-bold tracking-widest uppercase block mb-1">
                  official digital match ticket
                </span>
                <h2 className="text-lg md:text-xl font-extrabold text-white uppercase tracking-wide">
                  {ticket.matchName}
                </h2>
              </div>
              {renderMockQR()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Access Gate</span>
                <span className="text-sm font-bold text-fifa-accent uppercase tracking-wide">{ticket.gate}</span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Seating Section</span>
                <span className="text-sm font-bold text-fifa-neonPurple uppercase tracking-wide">{ticket.sector}</span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Row Block</span>
                <span className="text-sm font-bold text-white uppercase tracking-wide">{ticket.row}</span>
              </div>
              <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60">
                <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">Seat Number</span>
                <span className="text-sm font-bold text-fifa-gold uppercase tracking-wide">{ticket.seat}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 border-t border-gray-800/80 gap-3 mt-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-4 h-4 text-fifa-accent" />
              <span>{ticket.dateTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-fifa-gold">
              <span className="w-2 h-2 rounded-full bg-fifa-gold animate-pulse"></span>
              ID: {ticket.ticketId}
            </div>
          </div>
        </GlassCard>

        {/* Kick-off countdown card */}
        <GlassCard accent="purple" hoverEffect={false} className="flex flex-col justify-between text-center py-6">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">
              countdown to kickoff
            </span>
            <div className="relative inline-flex items-center justify-center p-6 rounded-full border border-fifa-neonPurple/20 bg-fifa-neonPurple/5 mt-2">
              <Clock className="w-20 h-20 text-fifa-neonPurple/20 absolute" />
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-widest font-mono text-glow-purple relative">
                {countdown}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/navigation')}
              className="w-full py-3 rounded-xl bg-fifa-neonPurple/10 hover:bg-fifa-neonPurple/20 text-fifa-neonPurple hover:text-white border border-fifa-neonPurple/20 hover:border-fifa-neonPurple/40 font-bold text-xs uppercase tracking-wider transition-all duration-200"
            >
              Scan seat routing
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Weather, Crowd and AI Suggestion grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <GlassCard hoverEffect={true} className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-xl">
            <CloudSun className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Matchday Weather</span>
            <h3 className="text-lg font-bold text-white">74°F, Clear Sky</h3>
            <p className="text-[10px] text-gray-400 font-medium">Optimal wind speeds. No precipitation forecasted.</p>
          </div>
        </GlassCard>

        {/* Crowd status Entrance gate */}
        <GlassCard hoverEffect={true} className="flex items-center gap-4">
          <div className="p-3 bg-fifa-neonGreen/10 border border-fifa-neonGreen/20 text-fifa-neonGreen rounded-xl">
            <Users className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Gate queue status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h3 className="text-lg font-bold text-white truncate">Gate A (North)</h3>
              <LiveBadge status="normal" label="Normal" />
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Scan flow: 85 min. Wait time &lt; 3 mins.</p>
          </div>
        </GlassCard>

        {/* AI Travel Recommendation */}
        <GlassCard accent="blue" hoverEffect={true} className="flex items-start gap-4">
          <div className="p-2.5 bg-fifa-accent/15 border border-fifa-accent/30 text-fifa-accent rounded-lg mt-0.5 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-fifa-accent block tracking-wider font-sans">stadiumAI advisory</span>
            <p className="text-[11px] text-gray-300 font-medium leading-relaxed mt-1.5">
              "Entry Gate A queue is currently normal. Travel now to beat the peak crowds arriving via Metro Line 2. Total transit delay estimated at 5 mins."
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Safety Info warning if any */}
      <GlassCard hoverEffect={false} className="p-4 bg-fifa-neonRed/5 border-l-4 border-l-fifa-neonRed border-y-gray-900 border-r-gray-900 flex items-center gap-4">
        <AlertTriangle className="w-5 h-5 text-fifa-neonRed animate-pulse" />
        <p className="text-xs text-gray-300 font-medium">
          <span className="font-bold text-fifa-neonRed">Notice: </span> 
          Gate C (South) is currently heavily congested. Spectators seated in Sections F, G, and H are strongly advised to enter through Gate A and bypass the outer South concourse.
        </p>
      </GlassCard>
    </div>
  );
};
