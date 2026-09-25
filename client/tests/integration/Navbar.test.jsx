import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../src/components/layout/Navbar';
import { ToastProvider } from '../../src/context/ToastContext';

describe('Navbar Integration', () => {
  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <Navbar onMenuClick={vi.fn()} />
        </ToastProvider>
      </BrowserRouter>
    );
  };

  it('renders the navbar title correctly', () => {
    renderNavbar();
    // Default page title when route is '/' is 'AutoGrade Ai'
    expect(screen.getByText('AutoGrade Ai')).toBeInTheDocument();
  });

  it('opens notification dropdown on bell click', () => {
    renderNavbar();
    const bellIcon = screen.getByText('notifications');
    fireEvent.click(bellIcon);
    
    expect(screen.getByText('1 New')).toBeInTheDocument();
    expect(screen.getByText('Evaluation Complete')).toBeInTheDocument();
  });

  it('triggers a toast when export is clicked', () => {
    renderNavbar();
    const exportButton = screen.getByText('Export');
    
    // We mock URL.createObjectURL to avoid JSDOM errors with Blob
    global.URL.createObjectURL = vi.fn();
    
    fireEvent.click(exportButton);
    expect(screen.getByText('Generating export file...')).toBeInTheDocument();
  });

  it('triggers onMenuClick when mobile menu button is clicked', () => {
    const handleMenuClick = vi.fn();
    render(
      <BrowserRouter>
        <ToastProvider>
          <Navbar onMenuClick={handleMenuClick} />
        </ToastProvider>
      </BrowserRouter>
    );

    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();
    fireEvent.click(menuButton);
    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });
});
