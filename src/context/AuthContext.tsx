import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'fan' | 'volunteer' | 'staff' | 'admin';

export interface TicketDetails {
  matchName: string;
  dateTime: string;
  stadium: string;
  gate: string;
  sector: string;
  row: string;
  seat: string;
  ticketId: string;
}

export interface User {
  email: string;
  role: UserRole;
  name: string;
  ticket?: TicketDetails;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if session is persisted in localStorage
    const savedUser = localStorage.getItem('stadium_ai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('stadium_ai_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    // Simulate API network call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let name = 'Alex Hunter';
    let ticket: TicketDetails | undefined = undefined;

    // Seed dummy user details based on role
    if (role === 'fan') {
      name = 'Diego Maradona';
      ticket = {
        matchName: 'Argentina vs France - Quarter Finals',
        dateTime: 'July 14, 2026 - 20:00 EST',
        stadium: 'MetLife Stadium, NJ',
        gate: 'Gate A (North)',
        sector: 'Block F12',
        row: 'Row 10',
        seat: 'Seat 12',
        ticketId: 'FIFA-2026-ARGFRA-99827',
      };
    } else if (role === 'volunteer') {
      name = 'Sarah Jenkins';
    } else if (role === 'staff') {
      name = 'Marcus Vance';
    } else if (role === 'admin') {
      name = 'Chief Officer Miller';
    }

    const userData: User = { email, role, name, ticket };
    setUser(userData);
    localStorage.setItem('stadium_ai_user', JSON.stringify(userData));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stadium_ai_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
