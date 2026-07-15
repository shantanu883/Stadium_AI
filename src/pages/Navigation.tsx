import React, { useState } from 'react';
import { MapWidget, HOTSPOTS } from '../components/MapWidget';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { 
  Map, 
  Compass, 
  Accessibility, 
  Volume2, 
  ArrowRight,
  MapPin,
  Flag
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  
  // Default source: Gate A (North)
  const [source, setSource] = useState('gate-a');
  // Default destination: Seat Block F12 (matches fan ticket) or first block
  const [destination, setDestination] = useState(user?.ticket?.sector ? 'block-f12' : 'block-a1');
  const [wheelchair, setWheelchair] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const gates = HOTSPOTS.filter(h => h.type === 'gate');
  const destinations = HOTSPOTS.filter(h => h.type !== 'gate');

  const getSourceDetails = () => HOTSPOTS.find(h => h.id === source);
  const getDestDetails = () => HOTSPOTS.find(h => h.id === destination);

  // Simple pathfinding route descriptor
  const generateRouteSteps = (): string[] => {
    const src = getSourceDetails();
    const dest = getDestDetails();
    if (!src || !dest) return [];

    const steps = [
      `Enter through ${src.name}.`,
    ];

    if (wheelchair) {
      steps.push('Take elevator bank G-1 to Level 2 access corridor.');
      steps.push('Head down wide-access Corridor 3, bypassing escalators.');
    } else {
      steps.push('Walk straight along Corridor 3.');
      steps.push('Take Escalator 3 to Section Plaza.');
    }

    if (dest.type === 'block') {
      steps.push(`Locate ${dest.name}. Your seat is in Row 10.`);
    } else if (dest.type === 'food') {
      steps.push(`Arrive at ${dest.name} stall inside the dining bay.`);
    } else if (dest.type === 'restroom') {
      steps.push(`Arrive at ${dest.name}.`);
    } else if (dest.type === 'medical') {
      steps.push(`Report directly to the ${dest.name} receptionist desk.`);
    }

    return steps;
  };

  const steps = generateRouteSteps();

  const handleReadAloud = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const narration = `Navigation directions from ${getSourceDetails()?.name || 'Gate'} to ${getDestDetails()?.name || 'Destination'}. ` +
      steps.join(' ');
      
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.onend = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectFromMap = (id: string) => {
    setDestination(id);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Map className="text-fifa-accent" /> Smart Stadium Seat Navigator
          </h1>
          <p className="text-xs text-gray-400 font-medium">Select location nodes or tap hotspots on the live map.</p>
        </div>
        
        {/* Toggle options */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWheelchair(!wheelchair)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              wheelchair 
                ? 'bg-fifa-neonGreen/10 border-fifa-neonGreen text-fifa-neonGreen shadow-neon-green' 
                : 'border-gray-800 bg-gray-900/40 text-gray-400'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>ADA Wheelchair Route</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Widget (lg:span-6) */}
        <div className="lg:col-span-6">
          <GlassCard hoverEffect={false} className="flex flex-col items-center">
            <MapWidget
              sourceId={source}
              destinationId={destination}
              wheelchairMode={wheelchair}
              onSelectDestination={handleSelectFromMap}
            />
            <div className="text-[10px] text-gray-500 font-medium mt-3 text-center">
              💡 Pro Tip: Tap on Seating Blocks, Food Stalls, or Restrooms directly on the map to set destination.
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Routing Instructions Panel (lg:span-6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Node Selectors */}
          <GlassCard hoverEffect={false} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                Current Location (Entrance)
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:border-fifa-accent focus:outline-none cursor-pointer"
              >
                {gates.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                Stadium Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:border-fifa-accent focus:outline-none cursor-pointer"
              >
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                ))}
              </select>
            </div>
          </GlassCard>

          {/* Path Breadcrumbs Directions */}
          <GlassCard accent="blue" hoverEffect={false} className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-fifa-accent" /> step-by-step routing
              </h3>
              <button
                onClick={handleReadAloud}
                className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  isPlayingAudio
                    ? 'border-fifa-neonPurple/40 bg-fifa-neonPurple/15 text-fifa-neonPurple animate-pulse'
                    : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? 'Speaking...' : 'Audio Navigation'}</span>
              </button>
            </div>

            {/* Breadcrumb Flow visual */}
            <div className="flex items-center gap-2 p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl overflow-x-auto text-[11px] font-bold text-gray-300">
              <span className="flex items-center gap-1 text-fifa-accent uppercase whitespace-nowrap">
                <MapPin className="w-3 h-3" />
                {getSourceDetails()?.name.split(' ')[1] || 'Gate'}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="text-gray-400 whitespace-nowrap">Corridor 3</span>
              <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="text-gray-400 whitespace-nowrap">Plaza Deck</span>
              <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="flex items-center gap-1 text-fifa-neonPurple uppercase whitespace-nowrap">
                <Flag className="w-3 h-3" />
                {getDestDetails()?.name.split(' ')[0] || 'Section'}
              </span>
            </div>

            {/* Step list */}
            <div className="space-y-3 pt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed font-medium">
                  <div className="w-5 h-5 rounded-full bg-gray-800 text-fifa-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 border border-gray-700/60">
                    {idx + 1}
                  </div>
                  <p className="text-gray-300 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};
