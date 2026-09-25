import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizService from '../../src/services/quiz.service';
import StudentJoin from '../../src/pages/student/StudentJoin';
import ArenaThemeToggle from '../../src/components/common/ArenaThemeToggle';
import useArenaTheme from '../../src/hooks/useArenaTheme';

describe('AI Quiz Arena - Client Unit Tests', () => {
  it('QuizService exposes all required multiplayer and generation endpoints', () => {
    expect(typeof QuizService.generateQuiz).toBe('function');
    expect(typeof QuizService.regenerateQuestion).toBe('function');
    expect(typeof QuizService.createQuiz).toBe('function');
    expect(typeof QuizService.getQuizzes).toBe('function');
    expect(typeof QuizService.getQuiz).toBe('function');
    expect(typeof QuizService.createSession).toBe('function');
    expect(typeof QuizService.getSession).toBe('function');
    expect(typeof QuizService.getSessionByCode).toBe('function');
    expect(typeof QuizService.joinSession).toBe('function');
    expect(typeof QuizService.startSession).toBe('function');
    expect(typeof QuizService.pauseSession).toBe('function');
    expect(typeof QuizService.nextQuestion).toBe('function');
    expect(typeof QuizService.endSession).toBe('function');
    expect(typeof QuizService.submitAnswer).toBe('function');
    expect(typeof QuizService.getLeaderboard).toBe('function');
    expect(typeof QuizService.getResults).toBe('function');
  });

  it('renders StudentJoin screen with game code input, nickname, and join button', () => {
    render(
      <MemoryRouter initialEntries={['/join/X7K92P']}>
        <StudentJoin />
      </MemoryRouter>
    );

    expect(screen.getByText('Join Live Game')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. X7K92P')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter player name...')).toBeInTheDocument();
    expect(screen.getByText('Enter Lobby')).toBeInTheDocument();
  });

  it('ArenaThemeToggle renders and triggers toggleTheme on click', () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <ArenaThemeToggle isDark={true} toggleTheme={handleToggle} />
    );

    const button = screen.getByRole('button', { name: /toggle arena color tone/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    rerender(<ArenaThemeToggle isDark={false} toggleTheme={handleToggle} />);
    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it('useArenaTheme hook toggles between dark and light modes with persistence', () => {
    localStorage.clear();
    const { result } = renderHook(() => useArenaTheme('dark'));

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.isLight).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.isLight).toBe(true);
    expect(localStorage.getItem('arena_theme_preference')).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });
});
