import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'crowd_update' | 'incident_alert' | 'ai_insight' | 'system_status';
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UseWebSocketOptions {
  url?: string;
  protocols?: string[];
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closed' | 'Error'>('Closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  
  const {
    url = 'ws://localhost:3002/ws', // WebSocket server endpoint
    protocols,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const connect = useCallback(() => {
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setConnectionStatus('Connecting');
      ws.current = new WebSocket(url, protocols);

      ws.current.onopen = () => {
        setConnectionStatus('Open');
        reconnectAttemptsRef.current = 0;
        onOpen?.();
        
        // Send authentication/initialization message
        ws.current?.send(JSON.stringify({
          type: 'init',
          clientId: 'stadium-ai-dashboard',
          timestamp: new Date().toISOString()
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Closed');
        onClose?.();
        
        // Attempt to reconnect if under retry limit
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionStatus('Error');
        onError?.(error);
      };

    } catch (error) {
      setConnectionStatus('Error');
      console.error('WebSocket connection failed:', error);
    }
  }, [url, protocols, onMessage, onError, onOpen, onClose, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setConnectionStatus('Closed');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Simulate WebSocket messages for demo (since we don't have a real WebSocket server)
  useEffect(() => {
    if (connectionStatus === 'Open') {
      const simulateMessages = () => {
        const mockMessages: WebSocketMessage[] = [
          {
            type: 'crowd_update',
            data: {
              gateId: 'gate-c',
              currentCapacity: Math.floor(Math.random() * 2000) + 500,
              flowRate: Math.floor(Math.random() * 300) + 50,
              riskLevel: Math.random() > 0.7 ? 'high' : 'medium'
            },
            timestamp: new Date().toISOString(),
            priority: 'medium'
          },
          {
            type: 'incident_alert',
            data: {
              incidentId: `inc-${Date.now()}`,
              type: 'medical',
              location: 'Block F12',
              severity: 'high',
              description: 'Medical assistance required'
            },
            timestamp: new Date().toISOString(),
            priority: 'high'
          },
          {
            type: 'ai_insight',
            data: {
              prediction: 'Crowd surge expected at Gate A in 15 minutes',
              confidence: Math.floor(Math.random() * 30) + 70,
              actionRequired: true,
              category: 'crowd_management'
            },
            timestamp: new Date().toISOString(),
            priority: 'high'
          },
          {
            type: 'system_status',
            data: {
              component: 'AI_ENGINE',
              status: 'operational',
              uptime: '99.97%',
              lastUpdate: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
            priority: 'low'
          }
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        setLastMessage(randomMessage);
        setMessages(prev => [...prev.slice(-99), randomMessage]);
        onMessage?.(randomMessage);
      };

      // Simulate connection success
      setTimeout(() => setConnectionStatus('Open'), 1000);
      
      // Send periodic messages
      const interval = setInterval(simulateMessages, 8000 + Math.random() * 7000);
      
      return () => clearInterval(interval);
    }
  }, [connectionStatus, onMessage]);

  return {
    connectionStatus,
    messages,
    lastMessage,
    connect,
    disconnect,
    sendMessage
  };
};