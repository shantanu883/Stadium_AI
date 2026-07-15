import React, { useState } from 'react';
import { ChatBot } from '../components/ChatBot';
import { GlassCard } from '../components/GlassCard';
import { createIncident } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Accessibility, 
  Globe, 
  Flame, 
  Volume2, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [activeLang, setActiveLang] = useState('English');
  const [wheelchairPath, setWheelchairPath] = useState(false);
  const [audioNav, setAudioNav] = useState(false);
  const [prioritySent, setPrioritySent] = useState(false);
  const [submittingAlert, setSubmittingAlert] = useState(false);

  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Japanese'];

  // Trigger priority help request (sends medical incident ticket to command center)
  const triggerPriorityHelp = async () => {
    setSubmittingAlert(true);
    try {
      await createIncident({
        title: 'Priority Assist Triggered',
        description: `Elderly/Disabled assistance request. Audio navigation requested. Role: ${user?.role || 'Spectator'}.`,
        type: 'medical',
        location: user?.ticket?.sector || 'Gate A Concourse',
        priority: 'critical',
        reportedBy: user?.email || 'anonymous-assistant@stadium.ai',
      });
      setPrioritySent(true);
      setTimeout(() => setPrioritySent(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAlert(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="text-fifa-accent animate-spin" style={{ animationDuration: '8s' }} /> FIFA Multilingual AI Hub
        </h1>
        <p className="text-xs text-gray-400 font-medium">Talk to Gemini in your language. Toggle accessibility layouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Chat Window */}
        <div className="lg:col-span-2 h-[600px]">
          <ChatBot />
        </div>

        {/* Right Column - Assistive Panel */}
        <div className="space-y-6">
          
          {/* Multilingual Translator Panel */}
          <GlassCard accent="purple" hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <Globe className="w-4 h-4 text-fifa-neonPurple" /> language settings
            </h3>
            <p className="text-[11px] text-gray-400">
              Set audio output translation language. Assistant voice replies will match this selection.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    activeLang === lang
                      ? 'bg-fifa-neonPurple/15 border-fifa-neonPurple text-white shadow-neon-purple'
                      : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Accessibility Deck */}
          <GlassCard accent="green" hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <Accessibility className="w-4 h-4 text-fifa-neonGreen" /> accessibility assistance
            </h3>
            <p className="text-[11px] text-gray-400">
              For disabled, elderly, or sensory-sensitive spectators.
            </p>

            <div className="space-y-3 pt-2">
              {/* Wheelchair route selector */}
              <label className="flex items-center justify-between p-2.5 bg-gray-900/40 border border-gray-800 rounded-xl cursor-pointer hover:border-fifa-neonGreen/30 transition-all">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-fifa-neonGreen" />
                  Wheelchair Routes Only
                </span>
                <input
                  type="checkbox"
                  checked={wheelchairPath}
                  onChange={(e) => setWheelchairPath(e.target.checked)}
                  className="w-4 h-4 text-fifa-neonGreen bg-gray-900 border-gray-800 focus:ring-fifa-neonGreen rounded cursor-pointer"
                />
              </label>

              {/* Audio navigation toggle */}
              <label className="flex items-center justify-between p-2.5 bg-gray-900/40 border border-gray-800 rounded-xl cursor-pointer hover:border-fifa-neonGreen/30 transition-all">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  Audio-guided Navigation
                </span>
                <input
                  type="checkbox"
                  checked={audioNav}
                  onChange={(e) => setAudioNav(e.target.checked)}
                  className="w-4 h-4 text-sky-400 bg-gray-900 border-gray-800 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2 text-[10px] text-gray-400 font-medium leading-relaxed">
              📍 Wheelchair charging docks and elevators are located at Gates A, B, and D. Restrooms in Sectors 102 and 118 feature wider doorways and lowered basins.
            </div>
          </GlassCard>

          {/* Priority Assistance Panic Button */}
          <GlassCard accent="red" hoverEffect={false} className="space-y-4 relative overflow-hidden">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-fifa-neonRed" /> Emergency Safety Trigger
            </h3>
            <p className="text-[11px] text-gray-400">
              Elderly, sick or disabled spectators can trigger priority rescue. This immediately dispatches a staff member to your ticketed block.
            </p>
            
            {!prioritySent ? (
              <button
                onClick={triggerPriorityHelp}
                disabled={submittingAlert}
                className="w-full py-4 rounded-xl bg-fifa-neonRed text-white font-extrabold text-xs uppercase tracking-widest hover:opacity-90 shadow-neon-red flex items-center justify-center gap-2 transition-all disabled:opacity-40 animate-pulse"
              >
                <Flame className="w-4 h-4" />
                <span>{submittingAlert ? 'Notifying Safety...' : 'Request Priority Help'}</span>
              </button>
            ) : (
              <div className="p-3 bg-fifa-neonGreen/10 border border-fifa-neonGreen/20 text-fifa-neonGreen rounded-xl text-center flex flex-col items-center gap-1.5">
                <CheckCircle className="w-6 h-6 animate-bounce" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Help Request Dispatched</span>
                <span className="text-[9px] text-gray-400">Medical team is enroute to Seat {user?.ticket?.seat || 'Gate A Lobby'}.</span>
              </div>
            )}
          </GlassCard>

        </div>
      </div>
    </div>
  );
};
