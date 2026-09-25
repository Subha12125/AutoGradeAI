import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../src/components/layout/Sidebar';
import { useAuthStore } from '../../src/store/authStore';

describe('Sidebar Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { name: 'Dr. Test Professor', role: 'Faculty Member' },
      isAuthenticated: true,
      token: 'mock-token',
    });
  });

  const renderSidebar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Sidebar isOpen={true} onClose={vi.fn()} isCollapsed={false} onToggleCollapse={vi.fn()} {...props} />
      </BrowserRouter>
    );
  };

  it('renders all navigation items when expanded', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quiz Arena')).toBeInTheDocument();
    expect(screen.getByText('Exams')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders collapse toggle button and fires onToggleCollapse', () => {
    const handleToggle = vi.fn();
    renderSidebar({ isCollapsed: false, onToggleCollapse: handleToggle });

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    expect(collapseButton).toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('renders expand toggle button when collapsed', () => {
    const handleToggle = vi.fn();
    renderSidebar({ isCollapsed: true, onToggleCollapse: handleToggle });

    const expandButton = screen.getByLabelText('Expand sidebar');
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
