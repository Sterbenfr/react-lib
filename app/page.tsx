"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { fetchChanges } from "@/utils/openLibrary";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import "react-loading-skeleton/dist/skeleton.css";

type Change = {
  id: string;
  kind: string;
  timestamp: string;
  comment: string;
  author: { key: string };
  changes?: { key: string; revision?: number }[];
};

type Author = { key: string; name: string };

function kindToFr(kind: string) {
  switch (kind) {
    case "edit-book":
      return "Modification de livre";
    case "add-book":
      return "Ajout de livre";
    case "add-cover":
      return "Ajout de couverture";
    case "update":
      return "Mise à jour";
    case "new-account":
      return "Nouveau compte";
    default:
      return kind;
  }
}

function AuthorsLinks({ authors }: { authors: Author[] }) {
  return (
    <span>
      {authors.map((author, idx) => (
        <Link
          key={idx}
          href={`/authors/${author.key}`}
          className="text-blue-600 underline"
        >
          {author.name}
        </Link>
      ))}
    </span>
  );
}

const fetchWithCache = (() => {
  const memoryCache = new Map<string, any>();
  return async (url: string) => {
    // Try memory cache first
    if (memoryCache.has(url)) return memoryCache.get(url);

    // Try localStorage cache
    const local = localStorage.getItem(url);
    if (local) {
      const data = JSON.parse(local);
      memoryCache.set(url, data);
      return data;
    }

    // Fetch from network
    const res = await fetch(url);
    const data = await res.json();
    memoryCache.set(url, data);
    try {
      localStorage.setItem(url, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage is full or not available", e);
    }
    return data;
  };
})();

export default function HomePage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [meta, setMeta] = useState<
    Record<string, { title: string; authors: Author[] }>
  >({});
  const [authorsMeta, setAuthorsMeta] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      const data = await fetchChanges();
      setChanges(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchMeta() {
      const allKeys = changes.flatMap((c) =>
        (c.changes || []).filter((x) => isRelevantKey(x.key)).map((x) => x.key)
      );
      const uniqueKeys = Array.from(new Set(allKeys));
      const metaObj: Record<string, { title: string; authors: Author[] }> = {};
      for (const key of uniqueKeys) {
        const data = await fetchWithCache(`https://openlibrary.org${key}.json`);
        const title = data.title || key.split("/").pop(); // fallback sur l'ID si pas de titre
        let authors: Author[] = [];
        if (data.authors) {
          authors = await Promise.all(
            data.authors.map(async (a: any) => {
              const authorKey = a.author?.key || a.key;
              if (!authorKey) return null;
              const dataA = await fetchWithCache(
                `https://openlibrary.org${authorKey}.json`
              );
              return { key: authorKey, name: dataA.name };
            })
          );
          authors = authors.filter(Boolean);
        }
        metaObj[key] = { title, authors };
      }
      setMeta(metaObj);
    }
    if (changes.length > 0) fetchMeta();
  }, [changes]);

  useEffect(() => {
    async function fetchAuthors() {
      const authorKeys = Array.from(
        new Set(changes.map((c) => c.author?.key).filter(Boolean))
      );
      const metaObj: Record<string, string> = {};
      for (const key of authorKeys) {
        try {
          const res = await fetch(`https://openlibrary.org${key}.json`);
          const data = await res.json();
          metaObj[key] = data.name || key.split("/").pop();
        } catch {
          metaObj[key] = key.split("/").pop() || "";
        }
      }
      setAuthorsMeta(metaObj);
    }
    if (changes.length > 0) fetchAuthors();
  }, [changes]);

  // Fonction utilitaire pour filtrer les clés pertinentes
  function isRelevantKey(key: string) {
    return key.startsWith("/books/") || key.startsWith("/works/");
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Changements récents</h1>
      <ul>
        {changes.length > 0 ? (
          changes.map((change) => (
            <li key={change.id} className="mb-4 p-4 border rounded-md shadow">
              <p>
                <strong>Type :</strong> {kindToFr(change.kind)}
              </p>
              <p>
                <strong>Auteur :</strong>{" "}
                {authorsMeta[change.author?.key] ||
                  change.author?.key ||
                  "Inconnu"}
              </p>
              <p>
                <strong>Commentaire :</strong>{" "}
                {change.comment || "Aucun commentaire"}
              </p>
              <p>
                <strong>Date :</strong>{" "}
                {new Date(change.timestamp).toLocaleString()}
              </p>
              {change.changes &&
                change.changes.filter((c) => isRelevantKey(c.key)).length >
                  0 && (
                  <div>
                    <strong>Livres ou œuvres modifiés :</strong>
                    <ul className="ml-4 list-disc">
                      {change.changes
                        .filter((c) => isRelevantKey(c.key))
                        .map((c, idx) => {
                          const metaEntry = meta[c.key];
                          const title =
                            metaEntry?.title || c.key.split("/").pop();
                          const authors = metaEntry?.authors;
                          let link = null;
                          link = (
                            <Link
                              href={`/books/${c.key.split("/").pop()}`}
                              className="text-blue-600 underline"
                            >
                              Livre : {title}
                            </Link>
                          );

                          return (
                            <li key={idx}>
                              {link}
                              {c.revision && (
                                <span className="ml-2 text-xs text-gray-500">
                                  révision {c.revision}
                                </span>
                              )}
                              <div className="text-sm text-gray-700">
                                <span>Auteur(s): </span>
                                {authors ? (
                                  <AuthorsLinks authors={authors} />
                                ) : (
                                  <span>Chargement...</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}
            </li>
          ))
        ) : (
          <Skeleton count={10} />
        )}
      </ul>
    </main>
  );
}
