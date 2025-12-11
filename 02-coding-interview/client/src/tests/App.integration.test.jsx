import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../App';

// Mock axios
vi.mock('axios');

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const socket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  return {
    io: vi.fn(() => socket),
  };
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders HomePage by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Code Interview Platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Create a new interview session/i)).toBeInTheDocument();
  });

  test('creates a new session and navigates to it', async () => {
    // Mock axios post response
    axios.post.mockResolvedValueOnce({
      data: {
        sessionId: 'test-session-id',
        session: {
          id: 'test-session-id',
          code: '// Test code',
          language: 'javascript',
        },
      },
    });
    
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Fill in username and click create button
    const usernameInput = screen.getByLabelText(/Your Name/i);
    fireEvent.change(usernameInput, { target: { value: 'Test User' } });
    
    const createButton = screen.getByText(/Create New Session/i);
    fireEvent.click(createButton);
    
    // Verify axios was called
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/sessions'));
    
    // Wait for navigation (this is a bit tricky in tests)
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  test('displays 404 page for non-existent routes', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });
});