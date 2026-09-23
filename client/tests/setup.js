import '@testing-library/jest-dom';

// Mock IntersectionObserver for Framer Motion in jsdom
if (typeof window !== 'undefined') {
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  window.IntersectionObserver = MockIntersectionObserver;
  global.IntersectionObserver = MockIntersectionObserver;
}
