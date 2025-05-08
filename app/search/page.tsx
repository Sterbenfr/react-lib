"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookCard from "@/components/BookCard";
import { searchBooks } from "@/utils/openLibrary";

type Book = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    async function fetchData() {
      setLoading(true);
      try {
        const books = await searchBooks(query);
        setResults(books);
      } catch (err) {
        alert("Erreur de recherche");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Résultats pour « {query} »</h1>
      {loading && <p>Chargement...</p>}
      {results.length === 0 && !loading && <p>Aucun résultat trouvé.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((book) => (
          <BookCard
            key={book.key}
            title={book.title}
            authors={book.author_name}
            coverID={book.cover_i}
            olid={book.key}
          />
        ))}
      </div>
    </div>
  );
}
