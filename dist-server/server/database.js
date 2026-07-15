"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getSustainability = exports.getGates = exports.updateIncidentStatus = exports.addIncident = exports.getIncidents = void 0;
// Initial Data Seed
let incidents = [
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
    },
    {
        id: 'inc-103',
        title: 'Suspicious unattended bag',
        description: 'Black backpack left under seat B24 in the volunteer break area.',
        type: 'security',
        location: 'Sponsor Lounge Annex',
        priority: 'high',
        status: 'pending',
        reportedBy: 'volunteer@stadium.ai',
        reportedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    }
];
let gates = [
    { id: 'gate-a', name: 'Gate A (North)', flowRate: 85, status: 'normal', riskScore: 15, capacity: 250 },
    { id: 'gate-b', name: 'Gate B (East)', flowRate: 140, status: 'medium', riskScore: 48, capacity: 620 },
    { id: 'gate-c', name: 'Gate C (South)', flowRate: 280, status: 'overcrowded', riskScore: 88, capacity: 1850 },
    { id: 'gate-d', name: 'Gate D (West)', flowRate: 45, status: 'normal', riskScore: 10, capacity: 120 },
];
let sustainability = {
    energy: { current: 12450, solarRatio: 42, efficiencyStatus: 'optimal' },
    water: { current: 84000, recycledRatio: 65, leakDetected: false },
    waste: {
        total: 3450,
        recyclingRate: 58,
        organicRate: 25,
        alerts: ['Food Zone B: High plastic trash volume detected. Suggest adding recycling bins.']
    },
};
// Simulation Helpers
const getIncidents = () => incidents;
exports.getIncidents = getIncidents;
const addIncident = (incidentData) => {
    const newId = `inc-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident = {
        ...incidentData,
        id: newId,
        status: 'pending',
        reportedAt: new Date().toISOString(),
    };
    incidents.unshift(newIncident);
    // If gate related or overcrowded, adjust crowd system
    if (incidentData.location.toLowerCase().includes('gate c') || incidentData.description.toLowerCase().includes('gate c')) {
        const gateC = gates.find(g => g.id === 'gate-c');
        if (gateC) {
            gateC.status = 'overcrowded';
            gateC.riskScore = 95;
        }
    }
    return newIncident;
};
exports.addIncident = addIncident;
const updateIncidentStatus = (id, status) => {
    const incident = incidents.find(i => i.id === id);
    if (incident) {
        incident.status = status;
        return incident;
    }
    return null;
};
exports.updateIncidentStatus = updateIncidentStatus;
const getGates = () => {
    // Let's add slight random fluctuations to make the simulation feel alive
    return gates.map(gate => {
        const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const newFlow = Math.max(10, gate.flowRate + fluctuation);
        let newStatus = gate.status;
        let newRisk = gate.riskScore + Math.floor(Math.random() * 5) - 2;
        newRisk = Math.max(0, Math.min(100, newRisk));
        if (newFlow > 220) {
            newStatus = 'overcrowded';
        }
        else if (newFlow > 110) {
            newStatus = 'medium';
        }
        else {
            newStatus = 'normal';
        }
        return {
            ...gate,
            flowRate: newFlow,
            status: newStatus,
            riskScore: newRisk,
            capacity: Math.max(50, gate.capacity + fluctuation * 3),
        };
    });
};
exports.getGates = getGates;
const getSustainability = () => {
    // Simulate consumption increasing
    sustainability.energy.current += Math.floor(Math.random() * 20) - 5;
    sustainability.water.current += Math.floor(Math.random() * 100) - 20;
    sustainability.waste.total += Math.floor(Math.random() * 5);
    return sustainability;
};
exports.getSustainability = getSustainability;
const getDashboardStats = () => {
    const currentGates = (0, exports.getGates)();
    const currentIncidents = (0, exports.getIncidents)();
    const visitorCount = currentGates.reduce((acc, g) => acc + g.capacity, 0) * 15 + 42000; // simulated attendance
    const openIncidents = currentIncidents.filter(i => i.status !== 'resolved').length;
    // Risk Score is average of gate risks weighted
    const avgRisk = Math.round(currentGates.reduce((acc, g) => acc + g.riskScore, 0) / currentGates.length);
    return {
        totalVisitors: visitorCount,
        activeAlerts: avgRisk > 60 ? 2 : 1,
        crowdRiskScore: avgRisk,
        openIncidents: openIncidents,
        gates: currentGates,
    };
};
exports.getDashboardStats = getDashboardStats;
