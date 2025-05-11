import { render, screen } from '@testing-library/react';
import AuthorsLinks from '@/components/AuthorsLinks';

describe('AuthorsLinks', () => {
  it('renders unknown author if list is empty', () => {
    render(<AuthorsLinks authors={[]} />);
    expect(screen.getByText('Auteur inconnu')).toBeInTheDocument();
  });

  it('renders a single author link', () => {
    const authors = [{ key: '/authors/OL1A', name: 'George Orwell' }];
    render(<AuthorsLinks authors={authors} />);
    const link = screen.getByText('George Orwell') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toContain('https://openlibrary.org/authors/OL1A');
  });

  it('renders multiple authors with commas', () => {
    const authors = [
      { key: '/authors/OL1A', name: 'George Orwell' },
      { key: '/authors/OL2A', name: 'Aldous Huxley' }
    ];
    render(<AuthorsLinks authors={authors} />);
    expect(screen.getByText('George Orwell')).toBeInTheDocument();
    expect(screen.getByText('Aldous Huxley')).toBeInTheDocument();
    expect(screen.getByText(',')).toBeInTheDocument(); // comma between
  });
});
