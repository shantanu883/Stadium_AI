import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ShieldAlert, 
  Users, 
  Smile, 
  Wrench,
  ChevronRight
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('fan@stadium.ai');
  const [password, setPassword] = useState('stadium123');
  const [role, setRole] = useState<UserRole>('fan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle switching roles to auto-fill common credentials
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'fan') {
      setEmail('fan@stadium.ai');
    } else if (selectedRole === 'volunteer') {
      setEmail('volunteer@stadium.ai');
    } else if (selectedRole === 'staff') {
      setEmail('staff@stadium.ai');
    } else if (selectedRole === 'admin') {
      setEmail('admin@stadium.ai');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please input your credentials.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const success = await login(email, role);
      if (success) {
        // Route dashboard depending on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'fan') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        setErrorMsg('Authentication failed. Check credentials.');
      }
    } catch (err) {
      setErrorMsg('Server connection timeout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfigs = [
    { id: 'fan', label: 'Fan Arena', icon: Smile, color: 'text-fifa-gold' },
    { id: 'volunteer', label: 'Volunteer', icon: Users, color: 'text-fifa-neonGreen' },
    { id: 'staff', label: 'Crew Staff', icon: Wrench, color: 'text-fifa-neonPurple' },
    { id: 'admin', label: 'Command', icon: ShieldAlert, color: 'text-fifa-neonRed' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-fifa-dark">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-fifa-accent/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fifa-neonPurple/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-fifa-accent/10 border border-fifa-accent/20 text-fifa-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> FIFA 2026 Smart Stadium Grid
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-widest text-glow-blue font-sans">
            STADIUM AI
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 font-medium tracking-wide">
            Enter operations checkpoint and select grid tier.
          </p>
        </div>

        {/* Login Form Box */}
        <GlassCard accent="blue" hoverEffect={false} className="p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-fifa-neonRed/10 border border-fifa-neonRed/20 text-fifa-neonRed text-xs font-bold rounded-lg uppercase tracking-wider text-center">
              {errorMsg}
            </div>
          )}

          {/* Role selector buttons */}
          <div className="mb-6">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2.5">
              Select Operational Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roleConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const active = role === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => handleRoleSelect(cfg.id as UserRole)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      active
                        ? 'bg-fifa-accent/15 border-fifa-accent text-white shadow-neon-blue'
                        : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${cfg.color} ${active ? 'scale-110' : ''}`} />
                    <span className="text-[10px] font-bold tracking-wide uppercase">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                Authentication Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@stadium.ai"
                  className="w-full bg-gray-900/30 border border-gray-800 focus:border-fifa-accent focus:outline-none text-xs text-white pl-10 pr-4 py-3 rounded-xl transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                Operations Key / Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/30 border border-gray-800 focus:border-fifa-accent focus:outline-none text-xs text-white pl-10 pr-4 py-3 rounded-xl transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-fifa hover:opacity-95 text-fifa-dark font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-neon-blue transition-all disabled:opacity-50 mt-6"
            >
              <span>{isSubmitting ? 'Verifying Grid Access...' : 'Authenticate'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </GlassCard>

        {/* Demo details note */}
        <div className="mt-6 text-center text-[10px] text-gray-500 font-medium">
          FIFA Smart Stadium Operations Grid. Testing bypass enabled for hackathon.
        </div>
      </div>
    </div>
  );
};
