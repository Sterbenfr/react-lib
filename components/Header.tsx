"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setShowDropdown(false);
      setResults([]);
      return;
    }

    try {
      const data = await searchBooks({ q: value });
      setResults(data.slice(0, 5));
      setShowDropdown(true);
    } catch {
      setShowDropdown(false);
      setResults([]);
    }
  };

  return (
    <header className="bg-gray-100 p-4 shadow relative z-50">
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Recherche rapide..."
          className="w-full px-4 py-2 rounded border"
        />
        {showDropdown && results.length > 0 && (
          <ul className="absolute bg-white border rounded w-full mt-1 shadow-lg z-50">
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
        <Link
          href="/advanced-search"
          className="ml-4 text-sm text-blue-600 hover:underline"
        >
          Recherche avancée
        </Link>
      </div>
    </header>
  );
};

export default Header;
