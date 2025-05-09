"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdvancedSearchPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (author) params.set("author", author);
    if (subject) params.set("subject", subject);
    if (year) params.set("first_publish_year", year);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Recherche avancée</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Titre
          </label>
          <input
            type="text"
            id="title"
            placeholder="Ex: Demon Slayer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="author" className="block font-medium mb-1">
            Auteur
          </label>
          <input
            type="text"
            id="author"
            placeholder="Ex: Koyoharu Gotouge"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block font-medium mb-1">
            Sujet / Catégorie
          </label>
          <input
            type="text"
            id="subject"
            placeholder="Ex: manga, fantasy, history"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="year" className="block font-medium mb-1">
            Année de publication
          </label>
          <input
            type="number"
            id="year"
            placeholder="Ex: 2018"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Lancer la recherche
        </button>
      </form>
    </div>
  );
}
