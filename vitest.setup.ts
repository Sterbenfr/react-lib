import { expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock CSS imports
vi.mock('react-loading-skeleton/dist/skeleton.css', () => ({}));

// Mock style and CSS modules imports
vi.mock('*.css', () => ({}));
vi.mock('*.scss', () => ({}));
vi.mock('*.sass', () => ({}));
vi.mock('*.less', () => ({}));
vi.mock('*.stylus', () => ({}));

// Mock Next.js components
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => {
    return React.createElement('a', { href, ...rest }, children);
  }
}));

// Mock localStorage for browser-like environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch API
global.fetch = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
  localStorageMock.clear();
});