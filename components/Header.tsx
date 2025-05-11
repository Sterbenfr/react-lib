"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { searchBooks } from "@/utils/openLibrary";

type Book = {
  key: string;
  title: string;
  author_name?: string[];
};

const Header = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setShowDropdown(false);
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchBooks({ q: query });
        setResults(data.slice(0, 5));
        setShowDropdown(true);
      } catch {
        setShowDropdown(false);
        setResults([]);
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <header className="px-4 py-2 h-16 flex justify-center bg-gray-100 shadow relative z-50">
      <div className="max-w-xl w-full grid grid-cols-3 items-center gap-4 relative">
        <div className="flex justify-center">
          <Link
            href="/"
            className="font-bold text-lg text-[color:var(--accent)] hover:underline whitespace-nowrap"
          >
            OpenLibrary
          </Link>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Recherche rapide..."
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-light)]"
          />
          {showDropdown && results.length > 0 && (
            <ul className="absolute top-full left-0 w-full mt-1 border rounded shadow-lg z-50 bg-white">
              {results.map((book) => (
                <li key={book.key} className="hover:bg-gray-100">
                  <Link
                    href={`/books/${book.key.split("/").pop()}`}
                    className="block px-4 py-2"
                    onClick={() => {
                      setShowDropdown(false);
                      setQuery("");
                    }}
                  >
                    {book.title}{" "}
                    <span className="text-sm text-gray-500">
                      {book.author_name?.join(", ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-center">
          <Link
            href="/advanced-search"
            className="text-sm text-[color:var(--accent)] hover:underline whitespace-nowrap px-2 py-2"
          >
            Recherche avancée
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
