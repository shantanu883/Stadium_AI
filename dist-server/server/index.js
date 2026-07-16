"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const gemini_1 = require("./gemini");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ── Enhanced Security Middlewares ─────────────────────────────────────────────
// Helmet sets secure HTTP headers with strict policies
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // For development compatibility
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
// CORS: restrict to localhost origins in dev; configure for production domains
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight for 24 hours
}));
// Enhanced Rate limiters with different tiers
const strictRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Very limited for sensitive operations
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a minute.' },
    keyGenerator: (req) => req.ip || 'unknown', // Rate limit by IP
});
const chatRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many AI requests. Please wait a moment.' },
});
const apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100, // Reduced from 200 for better security
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'API rate limit exceeded. Please slow down.' },
});
app.use('/api/', apiRateLimiter);
// Body parser with strict size limits and type validation
app.use(express_1.default.json({
    limit: '10kb',
    strict: true,
    type: 'application/json'
}));
// Security middleware to add request logging and validation
app.use((req, res, next) => {
    // Log suspicious requests
    if (req.path.includes('..') || req.path.includes('<script>')) {
        console.warn(`Suspicious request from ${req.ip}: ${req.path}`);
    }
    // Add security headers to all responses
    res.setHeader('X-Request-ID', Math.random().toString(36).substring(7));
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    next();
});
// ── Enhanced Input sanitization and validation ────────────────────────────────
const sanitizeStr = (val, maxLen = 300) => {
    if (typeof val !== 'string')
        return '';
    // Remove potentially dangerous characters and limit length
    return val
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>'";&]/g, '') // Remove dangerous characters
        .slice(0, maxLen);
};
const validateIncidentType = (type) => {
    return ['medical', 'security', 'facility', 'lost-person'].includes(type);
};
const validatePriority = (priority) => {
    return ['low', 'medium', 'high', 'critical'].includes(priority);
};
// Enhanced input validation middleware
const validateIncidentInput = (req, res, next) => {
    const { title, description, type, location, priority, reportedBy } = req.body;
    // Check for required fields
    if (!title || !description || !type || !location || !priority || !reportedBy) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['title', 'description', 'type', 'location', 'priority', 'reportedBy']
        });
    }
    // Validate field types and values
    if (!validateIncidentType(type)) {
        return res.status(400).json({
            error: 'Invalid incident type',
            allowed: ['medical', 'security', 'facility', 'lost-person']
        });
    }
    if (!validatePriority(priority)) {
        return res.status(400).json({
            error: 'Invalid priority level',
            allowed: ['low', 'medium', 'high', 'critical']
        });
    }
    // Email validation for reportedBy
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reportedBy)) {
        return res.status(400).json({ error: 'Invalid email format for reportedBy field' });
    }
    next();
};
// Routes with enhanced security
// 1. AI Chat Route (with strict rate limiting)
app.post('/api/chat', chatRateLimiter, async (req, res) => {
    const prompt = sanitizeStr(req.body?.prompt, 500);
    const role = sanitizeStr(req.body?.role, 20) || 'fan';
    if (!prompt || prompt.length < 3) {
        return res.status(400).json({ error: 'Prompt must be at least 3 characters long' });
    }
    try {
        const aiResponse = await (0, gemini_1.generateGeminiResponse)(prompt, role);
        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            requestId: res.getHeader('X-Request-ID')
        });
    }
    catch (error) {
        // Don't expose internal error details
        console.error('AI Service Error:', error.message);
        res.status(500).json({ error: 'AI service temporarily unavailable' });
    }
});
// 2. Incident Reports with enhanced validation
app.get('/api/incidents', (req, res) => {
    try {
        const list = (0, database_1.getIncidents)();
        res.json({
            incidents: list,
            total: list.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database Error:', error.message);
        res.status(500).json({ error: 'Unable to retrieve incidents' });
    }
});
app.post('/api/incidents', strictRateLimiter, validateIncidentInput, (req, res) => {
    const title = sanitizeStr(req.body.title, 120);
    const description = sanitizeStr(req.body.description, 600);
    const type = req.body.type;
    const location = sanitizeStr(req.body.location, 80);
    const priority = req.body.priority;
    const reportedBy = sanitizeStr(req.body.reportedBy, 100);
    try {
        const newIncident = (0, database_1.addIncident)({ title, description, type, location, priority, reportedBy });
        // Log high-priority incidents for security monitoring
        if (priority === 'critical' || priority === 'high') {
            console.log(`High-priority ${type} incident reported: ${title} at ${location}`);
        }
        res.status(201).json({
            incident: newIncident,
            message: 'Incident created successfully'
        });
    }
    catch (error) {
        console.error('Incident Creation Error:', error.message);
        res.status(500).json({ error: 'Failed to create incident' });
    }
});
app.put('/api/incidents/:id', strictRateLimiter, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Validate incident ID format (simple alphanumeric check)
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid incident ID format' });
    }
    if (!status || !['pending', 'dispatched', 'resolved'].includes(status)) {
        return res.status(400).json({
            error: 'Invalid status',
            allowed: ['pending', 'dispatched', 'resolved']
        });
    }
    try {
        const updated = (0, database_1.updateIncidentStatus)(id, status);
        if (!updated) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        res.json({
            incident: updated,
            message: 'Incident status updated successfully'
        });
    }
    catch (error) {
        console.error('Incident Update Error:', error.message);
        res.status(500).json({ error: 'Failed to update incident status' });
    }
});
// 3. Crowd Monitoring Data (read-only, less strict rate limiting)
app.get('/api/crowd', (req, res) => {
    try {
        const gates = (0, database_1.getGates)();
        res.json({
            gates,
            lastUpdated: new Date().toISOString(),
            totalGates: gates.length
        });
    }
    catch (error) {
        console.error('Crowd Data Error:', error.message);
        res.status(500).json({ error: 'Unable to retrieve crowd data' });
    }
});
// 4. Sustainability Stats
app.get('/api/sustainability', (req, res) => {
    try {
        const sustainability = (0, database_1.getSustainability)();
        res.json({
            ...sustainability,
            lastUpdated: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Sustainability Data Error:', error.message);
        res.status(500).json({ error: 'Unable to retrieve sustainability data' });
    }
});
// 5. Admin Dashboard Metrics
app.get('/api/dashboard-stats', (req, res) => {
    try {
        const stats = (0, database_1.getDashboardStats)();
        res.json({
            ...stats,
            serverTime: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
    catch (error) {
        console.error('Dashboard Stats Error:', error.message);
        res.status(500).json({ error: 'Unable to retrieve dashboard statistics' });
    }
});
// Enhanced Health check endpoint with system info
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled Error:', error.message);
    // Don't expose stack traces in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId: res.getHeader('X-Request-ID'),
        ...(isDevelopment && { details: error.message })
    });
});
// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});
// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
// Start Server
const server = app.listen(PORT, () => {
    console.log(`🏟️  StadiumAI Express Server running on port ${PORT}`);
    console.log(`🔒 Security: Enhanced headers, CORS, rate limiting enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Handle server errors
server.on('error', (error) => {
    console.error('Server Error:', error.message);
});
exports.default = app;
