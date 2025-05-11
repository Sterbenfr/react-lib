import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';

describe('BookCard', () => {
  const baseProps = {
    title: '1984',
    authors: ['George Orwell'],
    coverID: 123,
    olid: '/works/OL123W',
  };

  it('renders book title', () => {
    render(<BookCard {...baseProps} />);
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('renders authors', () => {
    render(<BookCard {...baseProps} />);
    expect(screen.getByText(/George Orwell/)).toBeInTheDocument();
  });

  it('renders fallback if no authors', () => {
    render(<BookCard {...baseProps} authors={[]} />);
    expect(screen.getByText('Auteur inconnu')).toBeInTheDocument();
  });

  it('renders cover image', () => {
    render(<BookCard {...baseProps} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img).toHaveAttribute('src', expect.stringContaining(`${baseProps.coverID}-M.jpg`));
  });

  it('renders link to details page', () => {
    render(<BookCard {...baseProps} />);
    const link = screen.getByText('Voir les détails') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toContain('/books/OL123W');
  });
});
