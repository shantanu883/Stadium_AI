import {
  getIncidents,
  addIncident,
  updateIncidentStatus,
  getGates,
  getSustainability,
  getDashboardStats,
  Incident,
  GateStatus,
  SustainabilityMetrics
} from '../../server/database';

describe('Database Functions', () => {
  
  describe('Incidents Management', () => {
    it('should return initial incidents', () => {
      const incidents = getIncidents();
      expect(Array.isArray(incidents)).toBe(true);
      expect(incidents.length).toBeGreaterThan(0);
      
      // Check structure of first incident
      const firstIncident = incidents[0];
      expect(firstIncident).toHaveProperty('id');
      expect(firstIncident).toHaveProperty('title');
      expect(firstIncident).toHaveProperty('description');
      expect(firstIncident).toHaveProperty('type');
      expect(firstIncident).toHaveProperty('location');
      expect(firstIncident).toHaveProperty('priority');
      expect(firstIncident).toHaveProperty('status');
      expect(firstIncident).toHaveProperty('reportedBy');
      expect(firstIncident).toHaveProperty('reportedAt');
    });

    it('should add a new incident correctly', () => {
      const initialCount = getIncidents().length;
      
      const newIncidentData = {
        title: 'Test Medical Emergency',
        description: 'Heart attack in VIP section',
        type: 'medical' as const,
        location: 'VIP Block A1',
        priority: 'critical' as const,
        reportedBy: 'paramedic@stadium.ai'
      };

      const newIncident = addIncident(newIncidentData);
      
      // Verify the incident was created with correct data
      expect(newIncident.id).toMatch(/^inc-\d+$/);
      expect(newIncident.title).toBe(newIncidentData.title);
      expect(newIncident.description).toBe(newIncidentData.description);
      expect(newIncident.type).toBe(newIncidentData.type);
      expect(newIncident.location).toBe(newIncidentData.location);
      expect(newIncident.priority).toBe(newIncidentData.priority);
      expect(newIncident.reportedBy).toBe(newIncidentData.reportedBy);
      expect(newIncident.status).toBe('pending');
      expect(newIncident.reportedAt).toBeDefined();

      // Verify it was added to the incidents list
      const updatedIncidents = getIncidents();
      expect(updatedIncidents.length).toBe(initialCount + 1);
      expect(updatedIncidents[0]).toEqual(newIncident); // Should be at the front (unshift)
    });

    it('should update incident status correctly', () => {
      // First add an incident to update
      const testIncident = addIncident({
        title: 'Status Update Test',
        description: 'Testing status updates',
        type: 'facility',
        location: 'Gate B',
        priority: 'medium',
        reportedBy: 'staff@stadium.ai'
      });

      // Update to dispatched
      const dispatchedIncident = updateIncidentStatus(testIncident.id, 'dispatched');
      expect(dispatchedIncident).not.toBeNull();
      expect(dispatchedIncident?.status).toBe('dispatched');
      expect(dispatchedIncident?.id).toBe(testIncident.id);

      // Update to resolved
      const resolvedIncident = updateIncidentStatus(testIncident.id, 'resolved');
      expect(resolvedIncident).not.toBeNull();
      expect(resolvedIncident?.status).toBe('resolved');

      // Try to update non-existent incident
      const nonExistentUpdate = updateIncidentStatus('non-existent-id', 'resolved');
      expect(nonExistentUpdate).toBeNull();
    });

    it('should handle Gate C incident special case', () => {
      const initialGates = getGates();
      const gateCBefore = initialGates.find(g => g.id === 'gate-c');
      
      // Add an incident related to Gate C
      addIncident({
        title: 'Gate C Overcrowding',
        description: 'Dangerous overcrowding at Gate C entrance',
        type: 'security',
        location: 'Gate C main entrance',
        priority: 'critical',
        reportedBy: 'security@stadium.ai'
      });

      // Check that Gate C status was affected
      const updatedGates = getGates();
      const gateCAfter = updatedGates.find(g => g.id === 'gate-c');
      
      expect(gateCAfter?.status).toBe('overcrowded');
      expect(gateCAfter?.riskScore).toBeGreaterThanOrEqual(90); // Allow for some fluctuation
    });
  });

  describe('Gate Status Management', () => {
    it('should return gates with proper structure', () => {
      const gates = getGates();
      
      expect(Array.isArray(gates)).toBe(true);
      expect(gates.length).toBeGreaterThan(0);

      gates.forEach(gate => {
        expect(gate).toHaveProperty('id');
        expect(gate).toHaveProperty('name');
        expect(gate).toHaveProperty('flowRate');
        expect(gate).toHaveProperty('status');
        expect(gate).toHaveProperty('riskScore');
        expect(gate).toHaveProperty('capacity');
        
        expect(typeof gate.flowRate).toBe('number');
        expect(['normal', 'medium', 'overcrowded']).toContain(gate.status);
        expect(gate.riskScore).toBeGreaterThanOrEqual(0);
        expect(gate.riskScore).toBeLessThanOrEqual(100);
        expect(gate.capacity).toBeGreaterThanOrEqual(50);
      });
    });

    it('should apply fluctuation simulation correctly', () => {
      const gates1 = getGates();
      const gates2 = getGates();
      
      // Values should be different due to simulation (with high probability)
      const gate1Flow = gates1[0].flowRate;
      const gate2Flow = gates2[0].flowRate;
      
      // Allow for the case where random might be the same (low probability)
      // But at least verify the range is reasonable
      expect(gate2Flow).toBeGreaterThanOrEqual(10); // minimum enforced
      expect(Math.abs(gate2Flow - gate1Flow)).toBeLessThanOrEqual(10); // within fluctuation range
    });

    it('should categorize status based on flow rate correctly', () => {
      const gates = getGates();
      
      gates.forEach(gate => {
        if (gate.flowRate > 220) {
          expect(gate.status).toBe('overcrowded');
        } else if (gate.flowRate > 110) {
          expect(gate.status).toBe('medium');
        } else {
          expect(gate.status).toBe('normal');
        }
      });
    });
  });

  describe('Sustainability Metrics', () => {
    it('should return sustainability metrics with correct structure', () => {
      const sustainability = getSustainability();
      
      expect(sustainability).toHaveProperty('energy');
      expect(sustainability).toHaveProperty('water');
      expect(sustainability).toHaveProperty('waste');

      // Energy metrics
      expect(sustainability.energy).toHaveProperty('current');
      expect(sustainability.energy).toHaveProperty('solarRatio');
      expect(sustainability.energy).toHaveProperty('efficiencyStatus');
      expect(typeof sustainability.energy.current).toBe('number');
      expect(typeof sustainability.energy.solarRatio).toBe('number');
      expect(['optimal', 'warning', 'critical']).toContain(sustainability.energy.efficiencyStatus);

      // Water metrics
      expect(sustainability.water).toHaveProperty('current');
      expect(sustainability.water).toHaveProperty('recycledRatio');
      expect(sustainability.water).toHaveProperty('leakDetected');
      expect(typeof sustainability.water.current).toBe('number');
      expect(typeof sustainability.water.recycledRatio).toBe('number');
      expect(typeof sustainability.water.leakDetected).toBe('boolean');

      // Waste metrics
      expect(sustainability.waste).toHaveProperty('total');
      expect(sustainability.waste).toHaveProperty('recyclingRate');
      expect(sustainability.waste).toHaveProperty('organicRate');
      expect(sustainability.waste).toHaveProperty('alerts');
      expect(Array.isArray(sustainability.waste.alerts)).toBe(true);
    });

    it('should simulate consumption increases over time', () => {
      const initial = getSustainability();
      const updated = getSustainability();
      
      // Values should generally increase or stay similar (within fluctuation range)
      expect(updated.energy.current).toBeGreaterThanOrEqual(initial.energy.current - 5);
      expect(updated.water.current).toBeGreaterThanOrEqual(initial.water.current - 20);
      expect(updated.waste.total).toBeGreaterThanOrEqual(initial.waste.total);
    });
  });

  describe('Dashboard Statistics', () => {
    it('should calculate dashboard stats correctly', () => {
      const stats = getDashboardStats();
      
      expect(stats).toHaveProperty('totalVisitors');
      expect(stats).toHaveProperty('activeAlerts');
      expect(stats).toHaveProperty('crowdRiskScore');
      expect(stats).toHaveProperty('openIncidents');
      expect(stats).toHaveProperty('gates');

      expect(typeof stats.totalVisitors).toBe('number');
      expect(stats.totalVisitors).toBeGreaterThan(40000); // Base + simulation
      
      expect(typeof stats.activeAlerts).toBe('number');
      expect(stats.activeAlerts).toBeGreaterThanOrEqual(1);
      
      expect(typeof stats.crowdRiskScore).toBe('number');
      expect(stats.crowdRiskScore).toBeGreaterThanOrEqual(0);
      expect(stats.crowdRiskScore).toBeLessThanOrEqual(100);

      expect(typeof stats.openIncidents).toBe('number');
      expect(stats.openIncidents).toBeGreaterThanOrEqual(0);

      expect(Array.isArray(stats.gates)).toBe(true);
    });

    it('should correlate active alerts with risk score', () => {
      const stats = getDashboardStats();
      
      if (stats.crowdRiskScore > 60) {
        expect(stats.activeAlerts).toBe(2);
      } else {
        expect(stats.activeAlerts).toBe(1);
      }
    });

    it('should count open incidents correctly', () => {
      const initialIncidents = getIncidents();
      const initialOpenCount = initialIncidents.filter(i => i.status !== 'resolved').length;
      
      const stats = getDashboardStats();
      expect(stats.openIncidents).toBe(initialOpenCount);
      
      // Add a new incident and verify count increases
      addIncident({
        title: 'Test Open Incident',
        description: 'This should increase open count',
        type: 'medical',
        location: 'Test Location',
        priority: 'low',
        reportedBy: 'test@stadium.ai'
      });
      
      const updatedStats = getDashboardStats();
      expect(updatedStats.openIncidents).toBe(initialOpenCount + 1);
    });
  });
});