import { describe, it, expect } from 'vitest';
import { cleanStudentName, cleanRoll, formatPercentage, formatDate } from '../../src/utils/format';

describe('Format Utility Hardcore Tests', () => {
  it('cleanStudentName falls back to rollNumber when name is "Answer" or "unknown"', () => {
    expect(cleanStudentName('Answer', 'Priyam_Kumar')).toBe('Priyam Kumar');
    expect(cleanStudentName('answer', '21BCE1002')).toBe('21BCE1002');
    expect(cleanStudentName('unknown', 'Rohan_Sharma')).toBe('Rohan Sharma');
    expect(cleanStudentName(null, 'Aditi_Verma')).toBe('Aditi Verma');
  });

  it('cleanStudentName cleans underscores and dashes into spaces', () => {
    expect(cleanStudentName('John_Doe_Smith')).toBe('John Doe Smith');
    expect(cleanStudentName('Ananya-Sen')).toBe('Ananya Sen');
  });

  it('cleanStudentName defaults to "Student" when both name and roll are missing or N/A', () => {
    expect(cleanStudentName(null, null)).toBe('Student');
    expect(cleanStudentName('Answer', 'N/A')).toBe('Student');
  });

  it('cleanRoll returns "Auto-detected" if rollNumber is identical to studentName', () => {
    expect(cleanRoll('John_Doe', 'John Doe')).toBe('Auto-detected');
  });

  it('cleanRoll returns "—" if rollNumber is empty or N/A', () => {
    expect(cleanRoll('')).toBe('—');
    expect(cleanRoll(null)).toBe('—');
    expect(cleanRoll('N/A')).toBe('—');
  });

  it('formatPercentage rounds properly', () => {
    expect(formatPercentage(87.6)).toBe('88%');
    expect(formatPercentage(92.1)).toBe('92%');
  });
});
