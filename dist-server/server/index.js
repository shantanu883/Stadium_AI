"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const gemini_1 = require("./gemini");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
// 1. AI Chat Route (Gemini API / Fallback Simulator)
app.post('/api/chat', async (req, res) => {
    const { prompt, role } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const aiResponse = await (0, gemini_1.generateGeminiResponse)(prompt, role || 'fan');
        res.json({ response: aiResponse });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Internal AI Server Error' });
    }
});
// 2. Incident Reports
app.get('/api/incidents', (req, res) => {
    try {
        const list = (0, database_1.getIncidents)();
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/incidents', (req, res) => {
    const { title, description, type, location, priority, reportedBy } = req.body;
    if (!title || !description || !type || !location || !priority || !reportedBy) {
        return res.status(400).json({ error: 'Missing required incident fields.' });
    }
    try {
        const newIncident = (0, database_1.addIncident)({
            title,
            description,
            type,
            location,
            priority,
            reportedBy,
        });
        res.status(201).json(newIncident);
    }
    catch (error) {
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
        const updated = (0, database_1.updateIncidentStatus)(id, status);
        if (!updated) {
            return res.status(404).json({ error: 'Incident not found.' });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 3. Crowd Monitoring Data
app.get('/api/crowd', (req, res) => {
    try {
        const gates = (0, database_1.getGates)();
        res.json(gates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 4. Sustainability Stats
app.get('/api/sustainability', (req, res) => {
    try {
        const sustain = (0, database_1.getSustainability)();
        res.json(sustain);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 5. Admin Dashboard Metrics
app.get('/api/dashboard-stats', (req, res) => {
    try {
        const stats = (0, database_1.getDashboardStats)();
        res.json(stats);
    }
    catch (error) {
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
