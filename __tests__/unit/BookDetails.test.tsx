import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookDetails from '@/components/BookDetails';
import * as utils from '@/utils/openLibrary';

vi.mock('@/utils/openLibrary', () => ({
  getBookDetails: vi.fn(),
  getWikipediaExtract: vi.fn(),
}));

const mockOLID = 'OL123W';

const mockBookData = {
  title: '1984',
  description: 'A dystopian novel by George Orwell.',
  covers: [12345],
  authors: [{ key: '/authors/OL123A' }],
};

const mockAuthorData = {
  name: 'George Orwell',
};

const mockEditionData = {
  publish_date: '1949',
  publishers: ['Secker & Warburg'],
  physical_format: 'Hardcover',
  number_of_pages: 328,
  isbn_13: ['9780451524935'],
};

// Mock global fetch for author and edition
global.fetch = vi.fn((url) => {
  if (url.includes('/authors/OL123A.json')) {
    return Promise.resolve({ json: () => Promise.resolve(mockAuthorData) });
  }
  if (url.includes('/works/OL123W/editions.json')) {
    return Promise.resolve({ json: () => Promise.resolve({ entries: [mockEditionData] }) });
  }
  return Promise.resolve({ json: () => Promise.resolve({}) });
}) as any;

describe('BookDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.getBookDetails as any).mockResolvedValue(mockBookData);
    (utils.getWikipediaExtract as any).mockResolvedValue('Short Wikipedia summary');
  });

  it('renders book details correctly', async () => {
    render(<BookDetails workID={mockOLID} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '1984' })).toBeInTheDocument();
    });

    expect(screen.getByText('George Orwell')).toBeInTheDocument();
    expect(screen.getByText('Résumé Wikipédia')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('12345'));
  });
});
