import request from 'supertest';
import express = require('express');
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Create test app with security middlewares
const createSecureApp = () => {
  const app = express();
  
  // Apply security middlewares
  app.use(helmet());
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type'],
  }));
  
  const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, // Lower limit for testing
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api/', rateLimiter);
  app.use(express.json({ limit: '10kb' }));
  
  // Test routes
  app.get('/api/test', (req, res) => {
    res.json({ message: 'test success' });
  });
  
  app.post('/api/test', (req, res) => {
    res.json({ received: req.body });
  });
  
  return app;
};

describe('Security Integration Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    app = createSecureApp();
  });
  
  describe('Helmet Security Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
    
    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['x-frame-options']).toBeDefined();
    });
    
    it('should set X-XSS-Protection header', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
    
    it('should set Strict-Transport-Security header', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
    
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });
  
  describe('CORS Protection', () => {
    it('should allow requests from localhost:5173', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:5173');
        
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
    
    it('should allow requests from localhost:5174', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:5174');
        
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5174');
    });
    
    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://malicious-site.com');
        
      expect(response.status).toBe(500); // CORS middleware blocks it
    });
  });
  
  describe('Rate Limiting', () => {
    it('should allow requests under the limit', async () => {
      // Make 3 requests (under the limit of 5)
      for (let i = 0; i < 3; i++) {
        const response = await request(app).get('/api/test');
        expect(response.status).toBe(200);
      }
    });
    
    it('should block requests over the rate limit', async () => {
      // Make 6 requests (over the limit of 5)
      const responses = [];
      for (let i = 0; i < 6; i++) {
        const response = await request(app).get('/api/test');
        responses.push(response);
      }
      
      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i].status).toBe(200);
      }
      
      // 6th should be rate limited
      expect(responses[5].status).toBe(429);
    });
    
    it('should include rate limit headers', async () => {
      const response = await request(app).get('/api/test');
      
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });
  });
  
  describe('Input Validation and Size Limits', () => {
    it('should accept normal-sized JSON payloads', async () => {
      const normalPayload = { message: 'Hello World' };
      
      const response = await request(app)
        .post('/api/test')
        .send(normalPayload);
        
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(normalPayload);
    });
    
    it('should reject oversized JSON payloads', async () => {
      // Create payload larger than 10kb limit
      const largePayload = {
        data: 'A'.repeat(15000) // 15KB of data
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(largePayload);
        
      expect(response.status).toBe(413); // Payload Too Large
    });
    
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}'); // Malformed JSON
        
      expect(response.status).toBe(400); // Bad Request
    });
    
    it('should reject non-JSON content types for JSON endpoints', async () => {
      const response = await request(app)
        .post('/api/test')
        .set('Content-Type', 'text/plain')
        .send('plain text data');
        
      expect(response.status).toBe(400); // Should reject non-JSON
    });
  });
  
  describe('HTTP Method Security', () => {
    it('should allow only specified HTTP methods', async () => {
      // Test allowed methods
      const getResponse = await request(app).get('/api/test');
      expect(getResponse.status).toBe(200);
      
      const postResponse = await request(app).post('/api/test').send({});
      expect(postResponse.status).toBe(200);
      
      // Test disallowed methods
      const deleteResponse = await request(app).delete('/api/test');
      expect(deleteResponse.status).toBe(404); // Method not allowed/found
      
      const patchResponse = await request(app).patch('/api/test');
      expect(patchResponse.status).toBe(404);
    });
  });
  
  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      // This test would typically check that stack traces or internal
      // paths are not exposed in production error responses
      
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      
      // Should not contain sensitive server information
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toMatch(/\/home\/.*\/server/);
      expect(responseText).not.toMatch(/node_modules/);
      expect(responseText).not.toMatch(/Error: /);
    });
    
    it('should handle URL encoding attacks', async () => {
      // Test various URL encoding attacks
      const maliciousUrls = [
        '/api/test/../../../etc/passwd',
        '/api/test/%2e%2e%2f%2e%2e%2f%2e%2e%2f',
        '/api/test/..%252f..%252f..%252f',
      ];
      
      for (const url of maliciousUrls) {
        const response = await request(app).get(url);
        // Should either 404 or sanitize the path
        expect(response.status).not.toBe(200);
      }
    });
  });
});