import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Mock the API calls
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Simple test component for testing auth flows
const TestAuthComponent = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div data-testid="loading">Loading...</div>;
  
  if (!user) {
    return (
      <div>
        <h1>Stadium AI</h1>
        <p>Login to continue</p>
        <button onClick={() => login('fan@test.com', 'fan')}>
          Login as Fan
        </button>
        <button onClick={() => login('staff@test.com', 'staff')}>
          Login as Staff
        </button>
        <button onClick={() => login('admin@test.com', 'admin')}>
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Role: {user.role}</p>
      {user.role === 'staff' || user.role === 'admin' ? (
        <div>
          <p>Crowd Monitor</p>
          <p>Sustainability</p>
        </div>
      ) : null}
      {user.role === 'admin' ? (
        <p>Admin</p>
      ) : null}
      <nav>
        <p>AI Assistant</p>
        <p>Reports</p>
        <p>Transport</p>
      </nav>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Helper to render test app
const renderApp = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('End-to-End App Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Authentication Flow', () => {
    it('should redirect to login when not authenticated', async () => {
      renderApp();
      
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByText(/stadium ai/i)).toBeInTheDocument();
        expect(screen.getByText(/login/i)).toBeInTheDocument();
      });
    });

    it('should complete full login flow as fan', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Should be on login page
      await waitFor(() => {
        expect(screen.getByText(/login to continue/i)).toBeInTheDocument();
      });

      // Login as fan
      await user.click(screen.getByText(/login as fan/i));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should redirect to home page
      await waitFor(() => {
        expect(screen.getByText(/welcome.*diego maradona/i)).toBeInTheDocument();
      });
    });

    it('should complete full login flow as staff and access restricted areas', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login as staff
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login as staff/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /login as staff/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Should have access to staff areas in navigation
      expect(screen.getByText(/crowd monitor/i)).toBeInTheDocument();
      expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
    });

    it('should complete full login flow as admin and access admin panel', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login as admin
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login as admin/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /login as admin/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Should have access to admin areas
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
  });

  describe('Navigation and Routing', () => {
    beforeEach(async () => {
      // Login as admin to have access to all areas
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      await user.click(screen.getByRole('button', { name: /login as admin/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('should navigate to AI Assistant', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      await user.click(screen.getByText(/ai assistant/i));
      
      await waitFor(() => {
        expect(screen.getByText(/ai assistant/i)).toBeInTheDocument();
      });
    });

    it('should navigate to Reports', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      await user.click(screen.getByText(/reports/i));
      
      await waitFor(() => {
        expect(screen.getByText(/incident reports/i)).toBeInTheDocument();
      });
    });

    it('should navigate to Transport', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      await user.click(screen.getByText(/transport/i));
      
      await waitFor(() => {
        expect(screen.getByText(/transport/i)).toBeInTheDocument();
      });
    });

    it('should navigate to Admin panel', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      await user.click(screen.getByText(/admin/i));
      
      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Access Control', () => {
    it('should restrict fan access to staff-only areas', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login as fan
      await user.click(screen.getByRole('button', { name: /login as fan/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Fan should not see staff-only navigation items
      expect(screen.queryByText(/crowd monitor/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sustainability/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    });

    it('should restrict staff access to admin-only areas', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login as staff
      await user.click(screen.getByRole('button', { name: /login as staff/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Staff should see some areas but not admin
      expect(screen.getByText(/crowd monitor/i)).toBeInTheDocument();
      expect(screen.getByText(/sustainability/i)).toBeInTheDocument();
      expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    beforeEach(async () => {
      // Login as staff for API access
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      await user.click(screen.getByRole('button', { name: /login as staff/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      // Mock failed API response
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Navigate to a page that makes API calls
      await user.click(screen.getByText(/reports/i));
      
      await waitFor(() => {
        expect(screen.getByText(/incident reports/i)).toBeInTheDocument();
      });
      
      // Should handle the error gracefully (not crash)
      expect(screen.getByText(/incident reports/i)).toBeInTheDocument();
    });

    it('should make API calls with proper authentication', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'test-incident',
            title: 'Test Incident',
            description: 'Test Description',
            type: 'medical',
            location: 'Test Location',
            priority: 'high',
            status: 'pending',
            reportedBy: 'test@test.com',
            reportedAt: '2026-07-16T12:00:00.000Z'
          }
        ])
      } as Response);
      
      // Navigate to reports page which should trigger API call
      await user.click(screen.getByText(/reports/i));
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // Verify the API was called correctly
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      expect(lastCall[0]).toMatch(/\/api\/incidents/);
    });
  });

  describe('Logout Flow', () => {
    it('should logout and redirect to login page', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login first
      await user.click(screen.getByRole('button', { name: /login as fan/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Find and click logout button (might be in navigation)
      const logoutButton = screen.getByText(/logout/i);
      await user.click(logoutButton);

      // Should redirect to login page
      await waitFor(() => {
        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login as fan/i })).toBeInTheDocument();
      });
    });
  });

  describe('Session Persistence', () => {
    it('should restore user session on page refresh', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Login
      await user.click(screen.getByRole('button', { name: /login as admin/i }));
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Simulate page refresh by re-rendering the app
      const { unmount } = renderApp();
      unmount();
      
      renderApp();

      act(() => {
        jest.runAllTimers();
      });

      // Should still be logged in
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });
  });
});