export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const truncateString = (str, length) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const cleanStudentName = (name, rollNumber) => {
  if (!name || name.toLowerCase() === 'answer' || name.toLowerCase() === 'student' || name.toLowerCase() === 'unknown') {
    if (rollNumber && rollNumber !== 'N/A') {
      return rollNumber.replace(/[_-]+/g, ' ').trim();
    }
    return 'Student';
  }
  return name.replace(/[_-]+/g, ' ').trim();
};

export const cleanRoll = (rollNumber, studentName) => {
  if (!rollNumber || rollNumber === 'N/A') return '—';
  if (studentName && rollNumber.replace(/[_-]+/g, ' ').toLowerCase() === studentName.toLowerCase()) {
    return 'Auto-detected';
  }
  return rollNumber;
};

