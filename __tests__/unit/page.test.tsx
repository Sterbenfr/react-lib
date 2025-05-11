import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../../app/page';
import { fetchChanges } from '../../utils/openLibrary';
import { act } from 'react'; // Import from 'react' instead of 'react-dom/test-utils'

// Mock the fetchChanges function
vi.mock('../../utils/openLibrary', () => ({
  fetchChanges: vi.fn(),
}));

// Mock response data that matches the real API response
const mockChanges = [
  {
    id: "149213280",
    kind: "edit-book",
    timestamp: "2025-05-11T14:51:29.933890",
    comment: "import existing book",
    changes: [
      {
        key: "/books/OL3565276M",
        revision: 13
      }
    ],
    author: {
      key: "/people/horncBot"
    },
    ip: null,
    data: {}
  },
  {
    id: "149213278",
    kind: "new-account",
    timestamp: "2025-05-11T14:51:29.234836",
    comment: "Created new account.",
    changes: [
      {
        key: "/people/diresithole",
        revision: 1
      },
      {
        key: "/people/diresithole/usergroup",
        revision: 1
      }
    ],
    author: {
      key: "/people/diresithole"
    },
    ip: null,
    data: {}
  }
];

// Mock fetch responses
global.fetch = vi.fn((url) => {
  if (url.includes('/people/horncBot.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({ name: 'horncBot' })
    });
  }
  if (url.includes('/people/diresithole.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({ name: 'diresithole' })
    });
  }
  if (url.includes('/books/OL3565276M.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({ 
        title: 'The myths we live by',
        authors: [{ key: '/authors/OL4327048A' }]
      })
    });
  }
  if (url.includes('/authors/OL4327048A.json')) {
    return Promise.resolve({
      json: () => Promise.resolve({ name: 'Mary Midgley' })
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({})
  });
}) as any;

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchChanges as any).mockResolvedValue(mockChanges);
  });

  it('renders loading state initially', async () => {
    // Wrap in act to handle React state updates
    await act(async () => {
      render(<HomePage />);
    });
    expect(screen.getByText('Changements récents')).toBeInTheDocument();
  });
});