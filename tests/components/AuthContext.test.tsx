import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth, UserRole } from '../../src/context/AuthContext';

// Test component that uses the AuthContext
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div data-testid="loading">Loading...</div>;
  
  if (!user) {
    return (
      <div>
        <div data-testid="not-logged-in">Not logged in</div>
        <button 
          data-testid="login-fan" 
          onClick={() => login('fan@test.com', 'fan')}
        >
          Login as Fan
        </button>
        <button 
          data-testid="login-staff" 
          onClick={() => login('staff@test.com', 'staff')}
        >
          Login as Staff
        </button>
        <button 
          data-testid="login-admin" 
          onClick={() => login('admin@test.com', 'admin')}
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div>
      <div data-testid="logged-in">Logged in</div>
      <div data-testid="user-name">{user.name}</div>
      <div data-testid="user-email">{user.email}</div>
      <div data-testid="user-role">{user.role}</div>
      {user.ticket && <div data-testid="has-ticket">Has Ticket</div>}
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render loading state initially', () => {
    renderWithAuth();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should show not logged in state when no user', async () => {
    renderWithAuth();
    
    act(() => {
      jest.runAllTimers();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('not-logged-in')).toBeInTheDocument();
    });
  });

  it('should login as fan successfully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-fan')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('login-fan'));
    
    act(() => {
      jest.advanceTimersByTime(1000); // Advance past the login delay
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Diego Maradona');
    expect(screen.getByTestId('user-email')).toHaveTextContent('fan@test.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('fan');
    expect(screen.getByTestId('has-ticket')).toBeInTheDocument();
  });

  it('should login as staff successfully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-staff')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('login-staff'));
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Marcus Vance');
    expect(screen.getByTestId('user-email')).toHaveTextContent('staff@test.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('staff');
    expect(screen.queryByTestId('has-ticket')).not.toBeInTheDocument();
  });

  it('should login as admin successfully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-admin')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('login-admin'));
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Chief Officer Miller');
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithAuth();

    // Login first
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-fan')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('login-fan'));
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    // Now logout
    await user.click(screen.getByTestId('logout'));

    await waitFor(() => {
      expect(screen.getByTestId('not-logged-in')).toBeInTheDocument();
    });
  });

  it('should persist user session in localStorage', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await user.click(screen.getByTestId('login-fan'));
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    // Check localStorage
    const savedUser = localStorage.getItem('stadium_ai_user');
    expect(savedUser).toBeTruthy();
    
    const parsedUser = JSON.parse(savedUser!);
    expect(parsedUser.email).toBe('fan@test.com');
    expect(parsedUser.role).toBe('fan');
    expect(parsedUser.name).toBe('Diego Maradona');
  });

  it('should restore user session from localStorage', async () => {
    // Pre-populate localStorage
    const mockUser = {
      email: 'restored@test.com',
      role: 'staff',
      name: 'Restored User'
    };
    localStorage.setItem('stadium_ai_user', JSON.stringify(mockUser));

    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Restored User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('restored@test.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('staff');
  });

  it('should handle corrupted localStorage gracefully', async () => {
    // Set corrupted data in localStorage
    localStorage.setItem('stadium_ai_user', 'invalid-json');

    renderWithAuth();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByTestId('not-logged-in')).toBeInTheDocument();
    });

    // Should have cleared the corrupted data
    expect(localStorage.getItem('stadium_ai_user')).toBeNull();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Mock console.error to prevent error output in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponentOutsideProvider = () => {
      useAuth();
      return <div>Should not render</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should handle different user roles correctly', async () => {
    const testCases: Array<{ role: UserRole; expectedName: string; shouldHaveTicket: boolean }> = [
      { role: 'fan', expectedName: 'Diego Maradona', shouldHaveTicket: true },
      { role: 'volunteer', expectedName: 'Sarah Jenkins', shouldHaveTicket: false },
      { role: 'staff', expectedName: 'Marcus Vance', shouldHaveTicket: false },
      { role: 'admin', expectedName: 'Chief Officer Miller', shouldHaveTicket: false },
    ];

    for (const testCase of testCases) {
      // Clear localStorage and re-render for each test case
      localStorage.clear();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      const { unmount } = renderWithAuth();

      act(() => {
        jest.runAllTimers();
      });

      await user.click(screen.getByTestId(`login-${testCase.role}`));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent(testCase.expectedName);
        expect(screen.getByTestId('user-role')).toHaveTextContent(testCase.role);
      });

      if (testCase.shouldHaveTicket) {
        expect(screen.getByTestId('has-ticket')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('has-ticket')).not.toBeInTheDocument();
      }

      unmount();
    }
  });
});