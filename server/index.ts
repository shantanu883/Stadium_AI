import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  getIncidents, 
  addIncident, 
  updateIncidentStatus, 
  getGates, 
  getSustainability, 
  getDashboardStats 
} from './database';
import { generateGeminiResponse } from './gemini';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

// 1. AI Chat Route (Gemini API / Fallback Simulator)
app.post('/api/chat', async (req, res) => {
  const { prompt, role } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const aiResponse = await generateGeminiResponse(prompt, role || 'fan');
    res.json({ response: aiResponse });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal AI Server Error' });
  }
});

// 2. Incident Reports
app.get('/api/incidents', (req, res) => {
  try {
    const list = getIncidents();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/incidents', (req, res) => {
  const { title, description, type, location, priority, reportedBy } = req.body;
  
  if (!title || !description || !type || !location || !priority || !reportedBy) {
    return res.status(400).json({ error: 'Missing required incident fields.' });
  }

  try {
    const newIncident = addIncident({
      title,
      description,
      type,
      location,
      priority,
      reportedBy,
    });
    res.status(201).json(newIncident);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'dispatched', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing incident status.' });
  }

  try {
    const updated = updateIncidentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Crowd Monitoring Data
app.get('/api/crowd', (req, res) => {
  try {
    const gates = getGates();
    res.json(gates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Sustainability Stats
app.get('/api/sustainability', (req, res) => {
  try {
    const sustain = getSustainability();
    res.json(sustain);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Admin Dashboard Metrics
app.get('/api/dashboard-stats', (req, res) => {
  try {
    const stats = getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', time: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`StadiumAI Express Server running on port ${PORT}`);
});
