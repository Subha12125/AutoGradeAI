import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentDetailModal from '../../src/components/evaluation/StudentDetailModal';

describe('StudentDetailModal Component Hardcore Tests', () => {
  const sampleResult = {
    studentName: 'Priyam Kumar',
    rollNumber: '21BCE1002',
    marksAwarded: 85,
    maxMarks: 100,
    overallFeedback: 'Demonstrated outstanding conceptual understanding and clean derivations.',
    questionResults: [
      { questionNumber: 1, marksAwarded: 10, maxMarks: 10, feedback: 'Flawless answer.' },
      { questionNumber: 2, marksAwarded: 8, maxMarks: 10, feedback: 'Minor calculation flaw in step 3.' },
    ],
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StudentDetailModal isOpen={false} result={sampleResult} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders student name, roll number, score, and overall feedback when open', () => {
    render(
      <StudentDetailModal isOpen={true} result={sampleResult} onClose={vi.fn()} />
    );

    expect(screen.getByText('Priyam Kumar')).toBeInTheDocument();
    expect(screen.getByText('21BCE1002')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Demonstrated outstanding conceptual understanding/i)).toBeInTheDocument();
  });

  it('renders each question breakdown properly', () => {
    render(
      <StudentDetailModal isOpen={true} result={sampleResult} onClose={vi.fn()} />
    );

    expect(screen.getByText(/Q\.\s*1/)).toBeInTheDocument();
    expect(screen.getByText('Flawless answer.')).toBeInTheDocument();
    expect(screen.getByText(/Q\.\s*2/)).toBeInTheDocument();
    expect(screen.getByText('Minor calculation flaw in step 3.')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <StudentDetailModal isOpen={true} result={sampleResult} onClose={onClose} />
    );

    // Look for button with close icon
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find(b => b.textContent?.includes('close'));
    expect(closeBtn).toBeDefined();
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
