import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  accent?: 'blue' | 'purple' | 'green' | 'red' | 'gold' | 'none';
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  accent = 'none',
  delay = 0,
}) => {
  const accentClasses = {
    blue: 'border-l-4 border-l-fifa-accent shadow-neon-blue',
    purple: 'border-l-4 border-l-fifa-neonPurple shadow-neon-purple',
    green: 'border-l-4 border-l-fifa-neonGreen shadow-neon-green',
    red: 'border-l-4 border-l-fifa-neonRed shadow-neon-red',
    gold: 'border-l-4 border-l-fifa-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]',
    none: '',
  };

  const cardContent = (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-5 ${accentClasses[accent]} ${
        hoverEffect ? 'glass-card-hover' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );

  if (delay > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};
