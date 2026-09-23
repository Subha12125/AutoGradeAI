import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../src/hooks/useAuth';
import { authService } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/store/authStore';

// Mock the auth service
vi.mock('../../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  }
}));

describe('useAuth hook', () => {
  const wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles successful login', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    const mockToken = 'test-token';
    authService.login.mockResolvedValueOnce({ user: mockUser, token: mockToken });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles failed login', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch {
        // Expected to throw
      }
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles successful logout', async () => {
    // First setup logged in state
    useAuthStore.setState({
      user: { id: 1, name: 'Test User' },
      token: 'test-token',
      isAuthenticated: true
    });
    
    authService.logout.mockResolvedValueOnce(true);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
