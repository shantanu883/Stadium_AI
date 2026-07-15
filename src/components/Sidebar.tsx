import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Map, 
  Users, 
  Bus, 
  Leaf, 
  AlertTriangle, 
  Shield, 
  LogOut, 
  Home, 
  Menu, 
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Welcome Portal', icon: Home, roles: ['fan', 'volunteer', 'staff', 'admin'] },
    { path: '/dashboard', label: 'Fan Arena', icon: LayoutDashboard, roles: ['fan'] },
    { path: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare, roles: ['fan', 'volunteer', 'staff', 'admin'] },
    { path: '/navigation', label: 'Seat Navigator', icon: Map, roles: ['fan', 'volunteer', 'staff', 'admin'] },
    { path: '/transport', label: 'Transit Predictor', icon: Bus, roles: ['fan', 'volunteer', 'staff', 'admin'] },
    { path: '/reports', label: 'Incident Desk', icon: AlertTriangle, roles: ['fan', 'volunteer', 'staff', 'admin'] },
    { path: '/crowd-monitor', label: 'Crowd Center', icon: Users, roles: ['staff', 'admin'] },
    { path: '/sustainability', label: 'Green Monitor', icon: Leaf, roles: ['staff', 'admin'] },
    { path: '/admin', label: 'Command Room', icon: Shield, roles: ['admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  const roleLabels: Record<string, string> = {
    fan: 'Spectator',
    volunteer: 'Volunteer Team',
    staff: 'Stadium Staff',
    admin: 'Command Center Officer',
  };

  const roleColors: Record<string, string> = {
    fan: 'from-blue-600 to-cyan-500 shadow-neon-blue border border-cyan-400/20',
    volunteer: 'from-emerald-600 to-teal-500 shadow-neon-green border border-emerald-400/20',
    staff: 'from-amber-600 to-orange-500 shadow-neon-purple border border-amber-400/20',
    admin: 'from-rose-600 to-red-500 shadow-neon-red border border-rose-400/20',
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-fifa-dark/95 border-b border-gray-800 fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-fifa-accent to-fifa-neonPurple bg-clip-text text-transparent tracking-wider text-glow-blue font-sans">
            STADIUM AI
          </span>
          <span className="text-xs text-fifa-gold font-bold px-1.5 py-0.5 rounded border border-fifa-gold/30 bg-fifa-gold/10">FIFA 2026</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-72 bg-fifa-dark/95 lg:bg-fifa-dark/70 border-r border-gray-800/80 backdrop-blur-xl transition-transform duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } pt-20 lg:pt-6 flex flex-col justify-between`}>
        
        <div>
          {/* Logo */}
          <div className="hidden lg:flex items-center justify-between px-6 pb-6 border-b border-gray-800/60">
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-fifa-accent to-fifa-neonPurple bg-clip-text text-transparent tracking-widest text-glow-blue">
                STADIUM AI
              </span>
              <span className="text-[10px] text-fifa-gold font-bold tracking-widest mt-0.5">FIFA WORLD CUP 2026</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-fifa-accent animate-neon-pulse shadow-neon-blue"></div>
          </div>

          {/* User Profile Info */}
          <div className="px-6 py-6 border-b border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fifa-accent/20 to-fifa-neonPurple/20 border border-fifa-accent/40 flex items-center justify-center font-bold text-fifa-accent text-lg">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-[10px] truncate text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className={`mt-3 px-3 py-1 rounded bg-gradient-to-r text-white text-[10px] font-bold tracking-wider uppercase text-center ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-fifa-accent/10 text-fifa-accent border-l-2 border-fifa-accent' 
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-fifa-accent' : 'text-gray-400 group-hover:text-gray-200'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Option */}
        <div className="p-4 border-t border-gray-800/60">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold text-fifa-neonRed hover:bg-fifa-neonRed/10 border border-fifa-neonRed/20 hover:border-fifa-neonRed/40 transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT APPLICATION</span>
          </button>
          <div className="mt-4 text-[10px] text-center text-gray-500 font-medium">
            METLIFE OPERATIONAL GRID v1.4.0
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30"
        />
      )}
    </>
  );
};
