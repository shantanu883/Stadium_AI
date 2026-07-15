import React from 'react';

interface LiveBadgeProps {
  status?: 'normal' | 'medium' | 'overcrowded' | 'critical';
  label?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ status = 'normal', label }) => {
  const statusColors = {
    normal: {
      bg: 'bg-fifa-neonGreen/10',
      text: 'text-fifa-neonGreen',
      dot: 'bg-fifa-neonGreen shadow-[0_0_8px_#00ff66]',
    },
    medium: {
      bg: 'bg-fifa-neonYellow/10',
      text: 'text-fifa-neonYellow',
      dot: 'bg-fifa-neonYellow shadow-[0_0_8px_#ffea00]',
    },
    overcrowded: {
      bg: 'bg-fifa-neonRed/10',
      text: 'text-fifa-neonRed',
      dot: 'bg-fifa-neonRed shadow-[0_0_8px_#ff003c] animate-pulse',
    },
    critical: {
      bg: 'bg-fifa-neonRed/20',
      text: 'text-fifa-neonRed font-bold border border-fifa-neonRed/30',
      dot: 'bg-fifa-neonRed shadow-[0_0_12px_#ff003c] animate-ping',
    },
  };

  const current = statusColors[status];
  const displayLabel = label || (status === 'normal' ? 'Normal' : status === 'medium' ? 'Medium' : 'Overcrowded');

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${current.bg} ${current.text}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>
      {displayLabel}
    </span>
  );
};
