const BASE = "https://openlibrary.org";

/**
 * Recherche dans OpenLibrary à partir de n'importe quel ensemble de paramètres.
 * @param params Un objet avec les paramètres de recherche : q, title, author, etc.
 * @returns Une liste de livres (docs)
 */
export async function searchBooks(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/search.json?${query}`);
  if (!res.ok) {
    throw new Error("Erreur lors de la recherche");
  }
  const data = await res.json();
  return data.docs;
}

export async function getBookDetails(workID: string) {
  const res = await fetch(`${BASE}/works/${workID}.json`);
  return res.json();
}

// Exemple simple pour Wikipedia (via l’API REST)
export async function getWikipediaExtract(title: string) {
  const res = await fetch(
    `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchChanges() {
  const res = await fetch(`${BASE}/recentchanges.json?limit=10`);
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des changements récents");
  }
  const data = await res.json();
  return data;
}
