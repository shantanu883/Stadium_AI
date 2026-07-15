import React, { useState, useEffect } from 'react';
import { 
  Compass,
  Accessibility
} from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  type: 'gate' | 'block' | 'food' | 'restroom' | 'medical' | 'exit';
  x: number;
  y: number;
  details: string;
}

export const HOTSPOTS: Hotspot[] = [
  // Gates
  { id: 'gate-a', name: 'Gate A (North Entrance)', type: 'gate', x: 200, y: 35, details: 'Main entry point, closest to train arrival.' },
  { id: 'gate-b', name: 'Gate B (East Entrance)', type: 'gate', x: 365, y: 200, details: 'Dropoff zone, medium queues.' },
  { id: 'gate-c', name: 'Gate C (South Entrance)', type: 'gate', x: 200, y: 365, details: 'Heavy security checkpoints. Highly congested.' },
  { id: 'gate-d', name: 'Gate D (West Entrance)', type: 'gate', x: 35, y: 200, details: 'VIP & Disabled priority elevator entrance.' },
  
  // Seating blocks
  { id: 'block-f12', name: 'Block F12 Seating', type: 'block', x: 280, y: 110, details: 'Spectator Seating - Rows 1 to 40' },
  { id: 'block-a1', name: 'Block A1 Seating', type: 'block', x: 120, y: 110, details: 'Spectator Seating - Rows 1 to 40' },
  { id: 'block-b4', name: 'Block B4 Seating', type: 'block', x: 280, y: 290, details: 'Spectator Seating - Rows 1 to 40' },
  { id: 'block-c8', name: 'Block C8 Seating', type: 'block', x: 120, y: 290, details: 'Spectator Seating - Rows 1 to 40' },

  // Food stalls
  { id: 'food-taco', name: 'Taco Fiesta', type: 'food', x: 330, y: 140, details: 'Mexican style tacos & soft drinks.' },
  { id: 'food-burger', name: 'Burgers & Dogs', type: 'food', x: 70, y: 140, details: 'Classic beef burgers, hotdogs and fries.' },
  { id: 'food-halal', name: 'Halal Delights', type: 'food', x: 100, y: 260, details: 'Shawarma, gyros and falafels.' },

  // Restrooms
  { id: 'restroom-n', name: 'Concourse Washrooms (North)', type: 'restroom', x: 200, y: 100, details: 'ADA Wheelchair accessible, baby changing.' },
  { id: 'restroom-s', name: 'Concourse Washrooms (South)', type: 'restroom', x: 200, y: 300, details: 'ADA Wheelchair accessible, high stall count.' },

  // Medical
  { id: 'medical-main', name: 'First Aid HQ (North)', type: 'medical', x: 200, y: 70, details: 'Full clinical response squad and emergency beds.' },
];

// Helper routes connection node matrix
const ROUTE_NETWORKS: Record<string, Record<string, Array<{ x: number, y: number }>>> = {
  'gate-a': {
    'block-f12': [{ x: 200, y: 35 }, { x: 200, y: 80 }, { x: 280, y: 80 }, { x: 280, y: 110 }],
    'block-a1': [{ x: 200, y: 35 }, { x: 200, y: 80 }, { x: 120, y: 80 }, { x: 120, y: 110 }],
    'food-taco': [{ x: 200, y: 35 }, { x: 200, y: 80 }, { x: 330, y: 80 }, { x: 330, y: 140 }],
    'food-burger': [{ x: 200, y: 35 }, { x: 200, y: 80 }, { x: 70, y: 80 }, { x: 70, y: 140 }],
    'restroom-n': [{ x: 200, y: 35 }, { x: 200, y: 100 }],
    'medical-main': [{ x: 200, y: 35 }, { x: 200, y: 70 }],
  },
  'gate-b': {
    'block-f12': [{ x: 365, y: 200 }, { x: 330, y: 200 }, { x: 330, y: 110 }, { x: 280, y: 110 }],
    'block-b4': [{ x: 365, y: 200 }, { x: 330, y: 200 }, { x: 330, y: 290 }, { x: 280, y: 290 }],
    'food-taco': [{ x: 365, y: 200 }, { x: 330, y: 200 }, { x: 330, y: 140 }],
  },
  'gate-c': {
    'block-b4': [{ x: 200, y: 365 }, { x: 200, y: 320 }, { x: 280, y: 320 }, { x: 280, y: 290 }],
    'block-c8': [{ x: 200, y: 365 }, { x: 200, y: 320 }, { x: 120, y: 320 }, { x: 120, y: 290 }],
    'restroom-s': [{ x: 200, y: 365 }, { x: 200, y: 300 }],
  },
  'gate-d': {
    'block-a1': [{ x: 35, y: 200 }, { x: 70, y: 200 }, { x: 70, y: 110 }, { x: 120, y: 110 }],
    'block-c8': [{ x: 35, y: 200 }, { x: 70, y: 200 }, { x: 70, y: 290 }, { x: 120, y: 290 }],
    'food-burger': [{ x: 35, y: 200 }, { x: 70, y: 200 }, { x: 70, y: 140 }],
    'food-halal': [{ x: 35, y: 200 }, { x: 70, y: 200 }, { x: 70, y: 260 }, { x: 100, y: 260 }],
  }
};

interface MapWidgetProps {
  sourceId: string;
  destinationId: string;
  wheelchairMode?: boolean;
  onSelectDestination?: (id: string) => void;
  heatmapMode?: boolean;
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  sourceId,
  destinationId,
  wheelchairMode = false,
  onSelectDestination,
  heatmapMode = false,
}) => {
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ x: number, y: number }>>([]);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  // Re-calculate route path lines when endpoints change
  useEffect(() => {
    if (sourceId && destinationId) {
      const sourceNetwork = ROUTE_NETWORKS[sourceId];
      if (sourceNetwork && sourceNetwork[destinationId]) {
        let coords = [...sourceNetwork[destinationId]];
        
        // If wheelchairMode, slightly alter route coordinates to represent "Elevator bypass" routes
        if (wheelchairMode) {
          coords = coords.map(c => {
            // Adjust x or y coordinates slightly to represent wheelchair corridors
            if (c.y === 80) return { ...c, y: 92 }; // use wide access corridor
            if (c.y === 320) return { ...c, y: 308 };
            return c;
          });
        }
        setRouteCoordinates(coords);
      } else {
        // Fallback connecting straight line
        const src = HOTSPOTS.find(h => h.id === sourceId);
        const dest = HOTSPOTS.find(h => h.id === destinationId);
        if (src && dest) {
          setRouteCoordinates([{ x: src.x, y: src.y }, { x: dest.x, y: dest.y }]);
        } else {
          setRouteCoordinates([]);
        }
      }
    } else {
      setRouteCoordinates([]);
    }
  }, [sourceId, destinationId, wheelchairMode]);




  return (
    <div className="relative w-full max-w-[500px] mx-auto bg-black/40 rounded-2xl border border-gray-800/80 p-4 overflow-hidden">
      {/* Map Header details */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-gray-400 tracking-wider">
        <span className="flex items-center gap-1.5 uppercase">
          <Compass className="w-3.5 h-3.5 text-fifa-accent" />
          MetLife Stadium Layout
        </span>
        {wheelchairMode && (
          <span className="flex items-center gap-1 text-fifa-neonGreen text-[10px] uppercase border border-fifa-neonGreen/20 bg-fifa-neonGreen/10 px-2 py-0.5 rounded-full">
            <Accessibility className="w-3 h-3" /> ADA Active
          </span>
        )}
      </div>

      {/* Main SVG Plot */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto mt-4"
        style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
      >
        {/* Grids and Concentric guide circles */}
        <circle cx="200" cy="200" r="180" className="stroke-gray-800/30 fill-none" strokeWidth="1" />
        <circle cx="200" cy="200" r="140" className="stroke-gray-800/50 fill-none" strokeWidth="2" strokeDasharray="5,5" />
        <circle cx="200" cy="200" r="90" className="stroke-gray-800/40 fill-none" strokeWidth="1" />
        
        {/* Heatmap rings */}
        {heatmapMode && (
          <>
            <circle cx="200" cy="350" r="40" className="fill-fifa-neonRed/10 stroke-fifa-neonRed/20 animate-ping" strokeWidth="1" style={{ animationDuration: '3s' }} />
            <circle cx="200" cy="350" r="25" className="fill-fifa-neonRed/20 stroke-fifa-neonRed/30" />
            <circle cx="365" cy="200" r="20" className="fill-fifa-neonYellow/10 stroke-fifa-neonYellow/20" />
          </>
        )}

        {/* Inner Pitch (Soccer Field representation) */}
        <rect
          x="145"
          y="155"
          width="110"
          height="90"
          rx="12"
          className="fill-fifa-dark/90 stroke-gray-700/60"
          strokeWidth="2"
        />
        {/* Pitch markings */}
        <line x1="200" y1="155" x2="200" y2="245" className="stroke-gray-800" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="20" className="stroke-gray-800 fill-none" strokeWidth="1.5" />

        {/* Stadium Seating Blocks Boundaries (Arcs) */}
        <path d="M 120 90 A 130 130 0 0 1 280 90" className="stroke-gray-800 fill-none" strokeWidth="16" strokeLinecap="round" />
        <path d="M 120 310 A 130 130 0 0 0 280 310" className="stroke-gray-800 fill-none" strokeWidth="16" strokeLinecap="round" />
        <path d="M 90 120 A 130 130 0 0 0 90 280" className="stroke-gray-800 fill-none" strokeWidth="16" strokeLinecap="round" />
        <path d="M 310 120 A 130 130 0 0 1 310 280" className="stroke-gray-800 fill-none" strokeWidth="16" strokeLinecap="round" />

        {/* Active Route Path Layer */}
        {routeCoordinates.length > 1 && (
          <>
            {/* Background glowing path line */}
            <polyline
              points={routeCoordinates.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(0,163,255,0.35)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main animated dashed route line */}
            <polyline
              points={routeCoordinates.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#00a3ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 6"
              style={{ animation: 'dash 2s linear infinite', strokeDashoffset: 0 }}
            />
          </>
        )}

        {/* Draw Hotspot nodes */}
        {HOTSPOTS.map((hotspot) => {
          const isSource = hotspot.id === sourceId;
          const isDest = hotspot.id === destinationId;
          const isHovered = hoveredHotspot?.id === hotspot.id;

          let radius = 7;
          if (hotspot.type === 'gate') radius = 8.5;
          if (isSource || isDest) radius = 10;

          return (
            <g 
              key={hotspot.id}
              onClick={() => onSelectDestination && hotspot.type !== 'gate' && onSelectDestination(hotspot.id)}
              onMouseEnter={() => setHoveredHotspot(hotspot)}
              onMouseLeave={() => setHoveredHotspot(null)}
              className="cursor-pointer"
            >
              {/* Outer pulsing ring for endpoints */}
              {(isSource || isDest) && (
                <circle
                  cx={hotspot.x}
                  cy={hotspot.y}
                  r={radius + 5}
                  fill={isSource ? 'rgba(0,163,255,0.15)' : 'rgba(168,85,247,0.15)'}
                  stroke={isSource ? 'rgba(0,163,255,0.4)' : 'rgba(168,85,247,0.4)'}
                  strokeWidth="1"
                  className="animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              )}
              {/* Node core circle */}
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r={radius}
                fill={
                  isSource ? '#00a3ff'
                  : isDest ? '#a855f7'
                  : heatmapMode && hotspot.type === 'gate' ? '#ff003c'
                  : hotspot.type === 'gate' ? '#00a3ff'
                  : hotspot.type === 'block' ? '#a855f7'
                  : hotspot.type === 'food' ? '#ffea00'
                  : hotspot.type === 'restroom' ? '#38bdf8'
                  : hotspot.type === 'medical' ? '#00ff66'
                  : '#9ca3af'
                }
                stroke={isHovered || isSource || isDest ? '#ffffff' : '#111827'}
                strokeWidth={isHovered || isSource || isDest ? 2 : 1}
                style={{ transition: 'all 0.2s', transform: isHovered ? 'scale(1.2)' : 'scale(1)', transformOrigin: `${hotspot.x}px ${hotspot.y}px` }}
              />
              {/* Label abbreviation */}
              <text
                x={hotspot.x}
                y={hotspot.y + 3.5}
                className="text-[8px] font-bold text-fifa-dark text-center fill-gray-900 pointer-events-none"
                textAnchor="middle"
              >
                {hotspot.type === 'gate' ? hotspot.name.charAt(5) : hotspot.type === 'medical' ? '+' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip Card overlay */}
      {hoveredHotspot && (
        <div className="absolute bottom-2 left-2 right-2 glass-card rounded-lg p-2.5 border border-gray-800/80 text-xs transition-all duration-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fifa-accent"></span>
            <span className="font-bold text-white uppercase tracking-wide">
              {hoveredHotspot.name}
            </span>
            <span className="ml-auto text-[9px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full uppercase">
              {hoveredHotspot.type}
            </span>
          </div>
          <p className="text-gray-400 mt-1 font-medium">{hoveredHotspot.details}</p>
        </div>
      )}

      {/* CSS Animation for SVG route lines */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -48; }
        }
      `}} />
    </div>
  );
};
