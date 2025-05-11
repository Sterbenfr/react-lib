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

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (value) paramsObj[key] = value;
      });

      if (Object.keys(paramsObj).length === 0) return;

      setLoading(true);
      try {
        const data = await searchBooks(paramsObj);
        setResults(data);
      } catch {
        alert("Erreur lors de la récupération des résultats.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const renderSearchLabel = () => {
    const keys = Array.from(searchParams.keys());
    if (keys.length === 0) return "Recherche";

    return keys.map((key) => `${key}="${searchParams.get(key)}"`).join(", ");
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        Résultats pour {renderSearchLabel()}
      </h1>
      {loading && <p>Chargement...</p>}
      {!loading && results.length === 0 && <p>Aucun résultat trouvé.</p>}
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