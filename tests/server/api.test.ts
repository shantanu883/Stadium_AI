import request from 'supertest';
import express = require('express');
import cors = require('cors');
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { 
  getIncidents, 
  addIncident, 
  updateIncidentStatus,
  getGates,
  getSustainability,
  getDashboardStats
} from '../../server/database';
import { generateGeminiResponse } from '../../server/gemini';

// Mock the external dependencies
jest.mock('../../server/database');
jest.mock('../../server/gemini');

const mockedGetIncidents = getIncidents as jest.MockedFunction<typeof getIncidents>;
const mockedAddIncident = addIncident as jest.MockedFunction<typeof addIncident>;
const mockedUpdateIncidentStatus = updateIncidentStatus as jest.MockedFunction<typeof updateIncidentStatus>;
const mockedGetGates = getGates as jest.MockedFunction<typeof getGates>;
const mockedGetSustainability = getSustainability as jest.MockedFunction<typeof getSustainability>;
const mockedGetDashboardStats = getDashboardStats as jest.MockedFunction<typeof getDashboardStats>;
const mockedGenerateGeminiResponse = generateGeminiResponse as jest.MockedFunction<typeof generateGeminiResponse>;

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));
  
  const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', apiRateLimiter);

  // Simplified routes for testing
  const sanitizeStr = (val: unknown, maxLen = 300): string => {
    if (typeof val !== 'string') return '';
    return val.trim().slice(0, maxLen);
  };

  // AI Chat Route
  app.post('/api/chat', async (req, res) => {
    const prompt = sanitizeStr(req.body?.prompt, 500);
    const role = sanitizeStr(req.body?.role, 20) || 'fan';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    try {
      const aiResponse = await generateGeminiResponse(prompt, role);
      res.json({ response: aiResponse });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal AI Server Error' });
    }
  });

  // Incidents
  app.get('/api/incidents', (req, res) => {
    try {
      const list = getIncidents();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/incidents', (req, res) => {
    const title = sanitizeStr(req.body?.title, 120);
    const description = sanitizeStr(req.body?.description, 600);
    const type = sanitizeStr(req.body?.type, 30);
    const location = sanitizeStr(req.body?.location, 80);
    const priority = sanitizeStr(req.body?.priority, 20);
    const reportedBy = sanitizeStr(req.body?.reportedBy, 100);

    const validTypes = ['medical', 'security', 'facility', 'lost-person'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (!title || !description || !type || !location || !priority || !reportedBy) {
      return res.status(400).json({ error: 'Missing required incident fields.' });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid incident type.' });
    }
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value.' });
    }

    try {
      const newIncident = addIncident({ title, description, type: type as any, location, priority: priority as any, reportedBy });
      res.status(201).json(newIncident);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create incident.' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString() });
  });

  return app;
};

describe('Stadium AI API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('time');
    });
  });

  describe('Incidents API', () => {
    const mockIncident = {
      id: 'test-123',
      title: 'Test Incident',
      description: 'Test description',
      type: 'medical' as const,
      location: 'Test Location',
      priority: 'high' as const,
      status: 'pending' as const,
      reportedBy: 'test@test.com',
      reportedAt: '2026-07-16T12:00:00.000Z'
    };

    it('should get all incidents', async () => {
      mockedGetIncidents.mockReturnValue([mockIncident]);
      
      const response = await request(app).get('/api/incidents');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockIncident]);
      expect(mockedGetIncidents).toHaveBeenCalled();
    });

    it('should create a new incident with valid data', async () => {
      const newIncidentData = {
        title: 'New Incident',
        description: 'New incident description',
        type: 'security',
        location: 'Gate A',
        priority: 'critical',
        reportedBy: 'security@stadium.ai'
      };

      mockedAddIncident.mockReturnValue({
        ...mockIncident,
        ...newIncidentData,
        id: 'new-123'
      });

      const response = await request(app)
        .post('/api/incidents')
        .send(newIncidentData);

      expect(response.status).toBe(201);
      expect(mockedAddIncident).toHaveBeenCalledWith(newIncidentData);
    });

    it('should reject incident with missing required fields', async () => {
      const incompleteIncident = {
        title: 'Incomplete',
        // missing description, type, location, priority, reportedBy
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(incompleteIncident);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required incident fields.');
    });

    it('should reject incident with invalid type', async () => {
      const invalidIncident = {
        title: 'Test',
        description: 'Test desc',
        type: 'invalid-type',
        location: 'Gate A',
        priority: 'high',
        reportedBy: 'test@test.com'
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(invalidIncident);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid incident type.');
    });

    it('should reject incident with invalid priority', async () => {
      const invalidIncident = {
        title: 'Test',
        description: 'Test desc',
        type: 'medical',
        location: 'Gate A',
        priority: 'invalid-priority',
        reportedBy: 'test@test.com'
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(invalidIncident);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid priority value.');
    });
  });

  describe('AI Chat API', () => {
    it('should process valid chat request', async () => {
      const mockResponse = 'AI response';
      mockedGenerateGeminiResponse.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({
          prompt: 'Hello, can you help me find my seat?',
          role: 'fan'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ response: mockResponse });
      expect(mockedGenerateGeminiResponse).toHaveBeenCalledWith('Hello, can you help me find my seat?', 'fan');
    });

    it('should reject empty prompt', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          prompt: '',
          role: 'fan'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Prompt is required and must be a non-empty string.');
    });

    it('should handle AI service errors gracefully', async () => {
      mockedGenerateGeminiResponse.mockRejectedValue(new Error('AI Service Down'));

      const response = await request(app)
        .post('/api/chat')
        .send({
          prompt: 'Test prompt',
          role: 'fan'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal AI Server Error');
    });

    it('should default role to fan if not provided', async () => {
      const mockResponse = 'AI response';
      mockedGenerateGeminiResponse.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/chat')
        .send({
          prompt: 'Test prompt'
          // no role provided
        });

      expect(response.status).toBe(200);
      expect(mockedGenerateGeminiResponse).toHaveBeenCalledWith('Test prompt', 'fan');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize and truncate long strings in incidents', async () => {
      const longTitle = 'A'.repeat(200); // Exceeds 120 char limit
      const longDescription = 'B'.repeat(1000); // Exceeds 600 char limit

      mockedAddIncident.mockImplementation((data) => ({
        id: 'sanitized-123',
        status: 'pending' as const,
        reportedAt: new Date().toISOString(),
        ...data
      }));

      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: longTitle,
          description: longDescription,
          type: 'facility',
          location: 'Test Location',
          priority: 'medium',
          reportedBy: 'test@stadium.ai'
        });

      expect(response.status).toBe(201);
      expect(mockedAddIncident).toHaveBeenCalledWith({
        title: 'A'.repeat(120), // Truncated to 120 chars
        description: 'B'.repeat(600), // Truncated to 600 chars
        type: 'facility',
        location: 'Test Location',
        priority: 'medium',
        reportedBy: 'test@stadium.ai'
      });
    });
  });
});