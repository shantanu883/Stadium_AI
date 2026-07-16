import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { LiveBadge } from './LiveBadge';
import { TrendingUp, AlertTriangle, Users, Zap } from 'lucide-react';

interface PredictiveInsight {
  id: string;
  type: 'crowd_surge' | 'security_risk' | 'energy_spike' | 'congestion';
  prediction: string;
  confidence: number;
  timeframe: string;
  actionable: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const PredictiveAnalytics: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate AI-powered predictive analytics
    const generatePredictions = () => {
      const predictions: PredictiveInsight[] = [
        {
          id: 'pred-001',
          type: 'crowd_surge',
          prediction: 'Gate C expected to reach 95% capacity in next 12 minutes',
          confidence: 89,
          timeframe: '12 minutes',
          actionable: 'Deploy 2 additional staff to Gate C and activate overflow routing',
          severity: 'high'
        },
        {
          id: 'pred-002',
          type: 'security_risk',
          prediction: 'Elevated crowd density risk in Block F12 during halftime',
          confidence: 76,
          timeframe: '45 minutes',
          actionable: 'Pre-position security team and activate crowd control measures',
          severity: 'medium'
        },
        {
          id: 'pred-003',
          type: 'energy_spike',
          prediction: 'Power demand will increase 34% during penalty shootout',
          confidence: 92,
          timeframe: '90 minutes',
          actionable: 'Switch to backup generators and reduce non-essential systems',
          severity: 'medium'
        },
        {
          id: 'pred-004',
          type: 'congestion',
          prediction: 'Concourse bottleneck expected at Food Court B after match',
          confidence: 83,
          timeframe: '2 hours',
          actionable: 'Open alternate food service areas and deploy wayfinding staff',
          severity: 'low'
        }
      ];

      setInsights(predictions);
      setIsProcessing(false);
    };

    // Simulate processing delay
    setTimeout(generatePredictions, 2000);

    // Update predictions every 30 seconds
    const interval = setInterval(() => {
      generatePredictions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'crowd_surge': return <Users className="w-5 h-5" />;
      case 'security_risk': return <AlertTriangle className="w-5 h-5" />;
      case 'energy_spike': return <Zap className="w-5 h-5" />;
      case 'congestion': return <TrendingUp className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-fifa-neonRed border-fifa-neonRed';
      case 'high': return 'text-fifa-neonYellow border-fifa-neonYellow';
      case 'medium': return 'text-fifa-neonPurple border-fifa-neonPurple';
      case 'low': return 'text-fifa-neonGreen border-fifa-neonGreen';
      default: return 'text-fifa-accent border-fifa-accent';
    }
  };

  if (isProcessing) {
    return (
      <GlassCard className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-fifa-accent/20 rounded-full animate-spin" />
          <div>
            <h3 className="text-lg font-bold text-white">AI Predictive Analytics</h3>
            <p className="text-fifa-accent text-sm">Processing real-time data...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard accent="blue">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fifa-accent/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-fifa-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Predictive Analytics</h3>
            <p className="text-fifa-accent text-sm">Machine learning insights & predictions</p>
          </div>
        </div>
        <LiveBadge status="normal" label="ACTIVE" />
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={`p-4 rounded-lg border-l-4 bg-white/5 ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity).replace('text-', 'bg-').replace('border-', '').replace(/ .*/, '')}/20`}>
                {getIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white text-sm">
                    {insight.type.replace('_', ' ').toUpperCase()} PREDICTION
                  </h4>
                  <span className="text-xs px-2 py-1 bg-fifa-dark/50 rounded-full text-fifa-accent">
                    {insight.confidence}% confidence
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-2">
                  {insight.prediction}
                </p>
                
                <div className="bg-fifa-dark/30 p-3 rounded-md">
                  <p className="text-xs text-fifa-neonGreen mb-1">🤖 AI RECOMMENDATION:</p>
                  <p className="text-xs text-gray-300">{insight.actionable}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    Timeframe: {insight.timeframe}
                  </span>
                  <button className="text-xs px-2 py-1 bg-fifa-accent/20 text-fifa-accent rounded hover:bg-fifa-accent/30 transition-colors">
                    Implement Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-fifa-accent/10 to-fifa-neonPurple/10 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-fifa-neonGreen" />
          <span className="text-xs font-semibold text-fifa-neonGreen">AI MODEL PERFORMANCE</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">94.2%</div>
            <div className="text-xs text-gray-400">Accuracy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">847ms</div>
            <div className="text-xs text-gray-400">Latency</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">12.3K</div>
            <div className="text-xs text-gray-400">Data Points</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};