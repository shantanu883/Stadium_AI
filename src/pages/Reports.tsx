import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { createIncident, fetchIncidents, updateIncident } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  AlertTriangle, 
  Plus, 
  ClipboardList, 
  MapPin, 
  Camera, 
  Clock,
  UserCheck
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  
  const [incidents, setIncidents] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'medical' | 'security' | 'facility' | 'lost-person'>('facility');
  const [location, setLocation] = useState('Block F12');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleImageMock = () => {
    // Mock image attachment filename
    setImageFile(`stadium_cam_${Math.floor(1000 + Math.random() * 9000)}.jpg`);
  };

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setSubmitting(true);
    setSuccessMsg('');

    try {
      await createIncident({
        title,
        description,
        type,
        location,
        priority,
        reportedBy: user?.email || 'guest-reporter@stadium.ai',
      });

      setSuccessMsg('Incident submitted successfully. Dispatched queue activated.');
      setTitle('');
      setDescription('');
      setImageFile(null);
      
      // Reload lists
      await loadIncidents();

      // Clear success notification
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Staff/Admin can dispatch or resolve incidents directly from here as well
  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'dispatched' | 'resolved') => {
    try {
      await updateIncident(id, newStatus);
      await loadIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const priorityColors = {
    low: 'text-gray-400 bg-gray-800/40 border-gray-800',
    medium: 'text-fifa-neonYellow bg-fifa-neonYellow/10 border-fifa-neonYellow/20',
    high: 'text-fifa-neonPurple bg-fifa-neonPurple/10 border-fifa-neonPurple/20',
    critical: 'text-fifa-neonRed bg-fifa-neonRed/10 border-fifa-neonRed/20 animate-pulse',
  };

  const typeLabels = {
    medical: 'Medical Response',
    security: 'Security Force',
    facility: 'Facility Eng.',
    'lost-person': 'Child/Lost Person',
  };

  const locations = [
    'Gate A (North)',
    'Gate B (East)',
    'Gate C (South)',
    'Gate D (West)',
    'Block F12',
    'Block A1',
    'Block B4',
    'Block C8',
    'Concourse Food Zone B',
    'Lobby Lift Sector 4',
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="text-fifa-accent" /> Incident Reporting Desk
          </h1>
          <p className="text-xs text-gray-400 font-medium">Log field reports, facility failures, or medical emergencies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form filing (span-5) */}
        <div className="lg:col-span-5">
          <GlassCard accent="blue" hoverEffect={false} className="space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <Plus className="w-4 h-4 text-fifa-accent" /> file safety report
            </h3>

            {successMsg && (
              <div className="p-3 bg-fifa-neonGreen/15 border border-fifa-neonGreen/20 text-fifa-neonGreen text-xs font-bold rounded-lg uppercase tracking-wider text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken handrail safety hazard"
                  className="w-full bg-gray-900/30 border border-gray-800 focus:border-fifa-accent focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                    Incident Category
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:border-fifa-accent focus:outline-none cursor-pointer"
                  >
                    <option value="medical">Medical</option>
                    <option value="security">Security</option>
                    <option value="facility">Facility/Broken</option>
                    <option value="lost-person">Lost Person</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:border-fifa-accent focus:outline-none cursor-pointer"
                  >
                    <option value="low">Low (Standard)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical (Dispatch)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                    Location Block
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:border-fifa-accent focus:outline-none cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe emergency, specific rows, nearby landmarks..."
                  className="w-full bg-gray-900/30 border border-gray-800 focus:border-fifa-accent focus:outline-none text-xs text-white px-3 py-2.5 rounded-xl transition-all"
                />
              </div>

              {/* Photo upload Simulator */}
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-500 block mb-1.5">
                  Attach Photo Evidence
                </label>
                <button
                  type="button"
                  onClick={handleImageMock}
                  className={`w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                    imageFile
                      ? 'border-fifa-neonGreen/40 bg-fifa-neonGreen/5 text-fifa-neonGreen'
                      : 'border-gray-800 hover:border-fifa-accent bg-gray-900/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] font-bold">
                    {imageFile ? `${imageFile} attached` : 'Simulate Camera Photo Upload'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-fifa hover:opacity-95 text-fifa-dark font-bold text-xs uppercase tracking-widest transition-all shadow-neon-blue"
              >
                {submitting ? 'Transmitting Field Logs...' : 'Submit Incident Report'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Active Tickets tracker (span-7) */}
        <div className="lg:col-span-7">
          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
              <ClipboardList className="w-4 h-4 text-fifa-accent" /> Active operational logs ({incidents.length})
            </h3>

            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 pt-1">
              {incidents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8 font-medium">No active incident logs filed.</p>
              ) : (
                incidents.map((inc) => {
                  const reportedTime = new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={inc.id}
                      className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl space-y-3 relative overflow-hidden"
                    >
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                              {inc.title}
                            </span>
                            <span className={`text-[8px] font-bold uppercase border px-2 py-0.5 rounded ${priorityColors[inc.priority as 'low' | 'medium' | 'high' | 'critical']}`}>
                              {inc.priority}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Ticket Ref: {inc.id} • Assigned: {typeLabels[inc.type as keyof typeof typeLabels]}
                          </span>
                        </div>
                        
                        {/* Status badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            inc.status === 'resolved' 
                              ? 'bg-fifa-neonGreen/10 text-fifa-neonGreen border border-fifa-neonGreen/20' 
                              : inc.status === 'dispatched' 
                                ? 'bg-fifa-neonPurple/15 text-fifa-neonPurple border border-fifa-neonPurple/20 animate-pulse'
                                : 'bg-fifa-neonYellow/15 text-fifa-neonYellow border border-fifa-neonYellow/20'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Body */}
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        {inc.description}
                      </p>

                      {/* Ticket Footer / Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-800/60 text-[10px] text-gray-400 gap-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-fifa-accent" />
                            {inc.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            Filed at {reportedTime}
                          </span>
                        </div>

                        {/* Interactive Dispatcher Controls (Shown for staff/admin) */}
                        {(user?.role === 'admin' || user?.role === 'staff') && inc.status !== 'resolved' && (
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {inc.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(inc.id, 'dispatched')}
                                className="px-2.5 py-1 rounded bg-fifa-neonPurple/20 hover:bg-fifa-neonPurple/40 text-fifa-neonPurple font-bold border border-fifa-neonPurple/30 transition-all"
                              >
                                DISPATCH FORCE
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(inc.id, 'resolved')}
                              className="px-2.5 py-1 rounded bg-fifa-neonGreen/20 hover:bg-fifa-neonGreen/40 text-fifa-neonGreen font-bold border border-fifa-neonGreen/30 transition-all flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" /> RESOLVE
                            </button>
                          </div>
                        )}
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
