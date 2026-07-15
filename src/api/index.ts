// API Client service for StadiumAI

const BASE_URL = ''; // Relative paths proxy via Vite during development

export interface IncidentData {
  title: string;
  description: string;
  type: 'medical' | 'security' | 'facility' | 'lost-person';
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
}

export const chatWithGemini = async (prompt: string, role: string = 'fan'): Promise<string> => {
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, role }),
    });
    
    if (!res.ok) throw new Error('API server returned error');
    
    const data = await res.json();
    return data.response;
  } catch (error) {
    console.warn('API error, falling back to local chat simulation.', error);
    // Simulate locally if backend is unavailable
    return simulateChatResponseLocal(prompt, role);
  }
};

export const fetchIncidents = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, using mock incidents.');
    return mockIncidentsFallback;
  }
};

export const createIncident = async (incident: IncidentData) => {
  try {
    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
    });
    if (!res.ok) throw new Error('Failed to submit incident');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, mocking incident submission.');
    return {
      ...incident,
      id: `inc-${Math.floor(100 + Math.random() * 900)}`,
      status: 'pending',
      reportedAt: new Date().toISOString(),
    };
  }
};

export const updateIncident = async (id: string, status: 'pending' | 'dispatched' | 'resolved') => {
  try {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update incident');
    return await res.json();
  } catch (error) {
    console.warn('Backend unavailable, mocking incident update.');
    return { id, status };
  }
};

export const fetchCrowdStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/crowd`);
    if (!res.ok) throw new Error('Failed to fetch crowd status');
    return await res.json();
  } catch (error) {
    return mockGatesFallback;
  }
};

export const fetchSustainabilityMetrics = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/sustainability`);
    if (!res.ok) throw new Error('Failed to fetch sustainability metrics');
    return await res.json();
  } catch (error) {
    return mockSustainabilityFallback;
  }
};

export const fetchAdminStats = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/dashboard-stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return await res.json();
  } catch (error) {
    const visitorCount = Math.floor(45000 + Math.random() * 15000);
    return {
      totalVisitors: visitorCount,
      activeAlerts: 1,
      crowdRiskScore: 42,
      openIncidents: 2,
      gates: mockGatesFallback,
    };
  }
};

// --- MOCK FALLBACKS FOR ROBUST CLIENT-SIDE STANDALONE EXECUTION ---

const mockIncidentsFallback = [
  {
    id: 'inc-101',
    title: 'Dehydration in Block F12',
    description: 'An elderly spectator is feeling dizzy and needs medical water/attention.',
    type: 'medical',
    location: 'Block F12, Row 10',
    priority: 'high',
    status: 'pending',
    reportedBy: 'fan@stadium.ai',
    reportedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'inc-102',
    title: 'Broken turnstile at Gate C',
    description: 'Entry barrier #3 is unresponsive. Tech maintenance required.',
    type: 'facility',
    location: 'Gate C Entryway',
    priority: 'medium',
    status: 'dispatched',
    reportedBy: 'staff@stadium.ai',
    reportedAt: new Date(Date.now() - 40 * 60000).toISOString(),
  }
];

const mockGatesFallback = [
  { id: 'gate-a', name: 'Gate A (North)', flowRate: 85, status: 'normal', riskScore: 15, capacity: 250 },
  { id: 'gate-b', name: 'Gate B (East)', flowRate: 140, status: 'medium', riskScore: 48, capacity: 620 },
  { id: 'gate-c', name: 'Gate C (South)', flowRate: 280, status: 'overcrowded', riskScore: 88, capacity: 1850 },
  { id: 'gate-d', name: 'Gate D (West)', flowRate: 45, status: 'normal', riskScore: 10, capacity: 120 },
];

const mockSustainabilityFallback = {
  energy: { current: 12450, solarRatio: 42, efficiencyStatus: 'optimal' },
  water: { current: 84000, recycledRatio: 65, leakDetected: false },
  waste: { 
    total: 3450, 
    recyclingRate: 58, 
    organicRate: 25, 
    alerts: ['Food Zone B: High plastic trash volume detected. Suggest adding recycling bins.'] 
  },
};

const simulateChatResponseLocal = (prompt: string, role: string): string => {
  const query = prompt.toLowerCase();
  
  if (role === 'admin' || query.includes('summarize') || query.includes('stadium condition') || query.includes('operations')) {
    return `[Operations Briefing - MetLife Stadium]
Current Attendance: 68,500. Crowd Index: 45% (Stable).
All gates operating normally except Gate C, which has medium congestion.
No critical incidents active. 2 facility maintenance requests pending.`;
  }
  if (query.includes('seat') || query.includes('where is my')) {
    return `⚽ To reach your seat from **Gate A**: Enter through **Gate A (North)** ➔ walk along the **North Outer Ring Corridor** ➔ take **Escalator 3** to the Lower Plaza ➔ enter **Block F12**, near Row 10.`;
  }
  if (query.includes('washroom') || query.includes('restroom')) {
    return `🚻 Restrooms are located behind Section 102 (45s walk from entrance) and near Section 118. ADA accessible restrooms are next to every gate escalator bank.`;
  }
  if (query.includes('food') || query.includes('eat') || query.includes('hungry')) {
    return `🍔 Dining near you: Burgers & Dogs (Section 104), Taco Fiesta (Section 114), and Halal Delights (Section 122).`;
  }
  if (query.includes('translate')) {
    return `🌐 Translator:
- Spanish: "¿Cómo puedo ayudarte hoy?"
- French: "Comment puis-je vous aider aujourd'hui ?"
- Hindi: "मैं आज आपकी क्या मदद कर सकता हूँ?"`;
  }
  return `Welcome to StadiumAI for FIFA World Cup 2026! I can assist with navigation, facilities location, incident filing, translations, or sustainability metrics.`;
};
