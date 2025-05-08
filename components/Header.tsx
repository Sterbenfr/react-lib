'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-gray-100 p-4 shadow">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Recherche rapide"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow px-4 py-2 rounded border"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Rechercher
        </button>
      </form>
    </header>
  );
};

export default Header;
