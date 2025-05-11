/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Image from "next/image";
import { getBookDetails, getWikipediaExtract } from "@/utils/openLibrary";

type BookDetailsProps = {
  workID: string;
};

type Author = { key: string; name: string };

const BookDetails = ({ workID }: BookDetailsProps) => {
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [wikiData, setWikiData] = useState<any>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [edition, setEdition] = useState<any>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const details = await getBookDetails(workID);
        setBookDetails(details);

        if (details.edition_key?.length) {
          const res = await fetch(
            `https://openlibrary.org/books/${details.edition_key[0]}.json`
          );
          setEdition(await res.json());
        }

        if (details.authors?.length) {
          const authorsData: Author[] = await Promise.all(
            details.authors.map(async (a: any) => {
              const key = a.author?.key || a.key;
              if (!key) return null;
              try {
                const res = await fetch(`https://openlibrary.org${key}.json`);
                const data = await res.json();
                return { key, name: data.name || key.split("/").pop() };
              } catch {
                return { key, name: key.split("/").pop() };
              }
            })
          );
          setAuthors(authorsData.filter(Boolean));
        } else {
          setAuthors([]);
        }

        if (details.title) {
          const wikiResponse = await getWikipediaExtract(details.title);
          setWikiData(wikiResponse);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    }

    fetchDetails();
  }, [workID]);

  if (!bookDetails) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Chargement des détails du livre...
      </p>
    );
  }

  const coverUrl = bookDetails.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg`
    : "/no-cover.png";

  return (
    <div className="bg-white dark:bg-zinc-900 shadow-md rounded-2xl m-2 p-6 md:p-10 max-w-4xl mx-auto mt-10 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="mtflex-shrink-0 flex justify-center ">
          <Image
            src={coverUrl}
            alt={`Couverture de ${bookDetails.title || "inconnu"}`}
            width={300}
            height={400}
            className="object-cover rounded-lg border shadow"
            priority
          />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {bookDetails.title || "Titre inconnu"}
          </h1>
          {bookDetails.subtitle && (
            <h2 className="text-lg text-zinc-500 dark:text-zinc-400 italic font-medium mb-2">
              {bookDetails.subtitle}
            </h2>
          )}

          {/* Authors */}
          {authors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Auteur(s)</p>
              <p className="text-base text-zinc-900 dark:text-zinc-100">
                {authors.map((author, idx) => (
                  <span key={author.key}>
                    {idx > 0 && ", "}
                    <a
                      href={`https://openlibrary.org${author.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                    >
                      {author.name}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-800 p-4 rounded-md">
            {bookDetails.first_publish_date && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Première publication</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">{bookDetails.first_publish_date}</p>
              </div>
            )}
            {bookDetails.created && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Créé le</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">{new Date(bookDetails.created.value).toLocaleDateString()}</p>
              </div>
            )}
            {bookDetails.last_modified && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Dernière modification</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">{new Date(bookDetails.last_modified.value).toLocaleDateString()}</p>
              </div>
            )}
            {bookDetails.number_of_pages && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Nombre de pages</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">{bookDetails.number_of_pages}</p>
              </div>
            )}
            {bookDetails.edition_count && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Nombre d’éditions</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">{bookDetails.edition_count}</p>
              </div>
            )}
            {bookDetails.languages && Array.isArray(bookDetails.languages) && (
              <div className="space-y-1">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Langue(s)</p>
                <p className="text-base text-zinc-900 dark:text-zinc-100">
                  {bookDetails.languages
                    .map((lang: any) => lang.key.replace("/languages/", ""))
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Open Library link */}
          <div>
            <a
              href={`https://openlibrary.org${bookDetails.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors font-medium"
            >
              Voir sur Open Library
            </a>
          </div>

          {/* Subjects */}
          {bookDetails.subjects && Array.isArray(bookDetails.subjects) && (
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Sujets</p>
              <div className="flex flex-wrap gap-2">
                {bookDetails.subjects.slice(0, 10).map((subject: string | number) => (
                  <span
                    key={subject}
                    className="bg-zinc-200 dark:bg-zinc-800 text-sm px-2 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
                {bookDetails.subjects.length > 10 && (
                  <span className="text-gray-400">…</span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {bookDetails.description && (
            <div className="prose dark:prose-invert max-w-none mt-4">
              <h2>Résumé</h2>
              <p>
                {typeof bookDetails.description === "string"
                  ? bookDetails.description
                  : bookDetails.description?.value}
              </p>
            </div>
          )}

          {/* Edition details */}
          {edition && (
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6 mt-6 space-y-2 text-gray-700 dark:text-gray-300">
              <h3 className="font-semibold text-lg mb-2">
                Détails de l’édition principale
              </h3>
              {edition.publish_date && (
                <div>
                  <span className="font-semibold">Date de publication :</span>{" "}
                  {edition.publish_date}
                </div>
              )}
              {edition.publishers && (
                <div>
                  <span className="font-semibold">Éditeur :</span>{" "}
                  {edition.publishers.join(", ")}
                </div>
              )}
              {edition.physical_format && (
                <div>
                  <span className="font-semibold">Format :</span>{" "}
                  {edition.physical_format}
                </div>
              )}
              {edition.number_of_pages && (
                <div>
                  <span className="font-semibold">Pages :</span>{" "}
                  {edition.number_of_pages}
                </div>
              )}
              {edition.isbn_10 && (
                <div>
                  <span className="font-semibold">ISBN-10 :</span>{" "}
                  {edition.isbn_10.join(", ")}
                </div>
              )}
              {edition.isbn_13 && (
                <div className="flex gap-2 flex-wrap mt-1">
                  <a
                    href={`https://www.amazon.fr/s?k=${edition.isbn_13[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Acheter sur Amazon
                  </a>
                  <a
                    href={`https://www.betterworldbooks.com/search/results?q=${edition.isbn_13[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Acheter sur BetterWorldBooks
                  </a>
                  <a
                    href={`https://www.worldcat.org/isbn/${edition.isbn_13[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Trouver en bibliothèque (WorldCat)
                  </a>
                  <a
                    href={`https://library.link/isbn/${edition.isbn_13[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Trouver en bibliothèque (Library.link)
                  </a>
                </div>
              )}
              {edition.identifiers?.librarything && (
                <div>
                  <a
                    href={`https://www.librarything.com/work/${edition.identifiers.librarything[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Voir sur LibraryThing
                  </a>
                </div>
              )}
              {edition.identifiers?.goodreads && (
                <div>
                  <a
                    href={`https://www.goodreads.com/book/show/${edition.identifiers.goodreads[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
                  >
                    Voir sur Goodreads
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Wikipedia Section */}
      {wikiData && (
        <div className="prose dark:prose-invert max-w-none mt-12 bg-gray-100 dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
          <h2>Résumé Wikipédia</h2>
          <div dangerouslySetInnerHTML={{ __html: wikiData.extract_html }} />
          <div className="flex flex-col space-y-2 my-4">
            {wikiData.content_urls?.desktop?.page && (
              <a
                href={wikiData.content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
              >
                Lire l&apos;article complet sur Wikipédia
              </a>
            )}
            {wikiData.content_urls?.desktop?.revisions && (
              <a
                href={wikiData.content_urls.desktop.revisions}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
              >
                Historique
              </a>
            )}
            {wikiData.content_urls?.desktop?.talk && (
              <a
                href={wikiData.content_urls.desktop.talk}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--accent)] hover:text-[color:#1d4ed8] underline transition-colors"
              >
                Discussion
              </a>
            )}
          </div>
          {wikiData.description && (
            <p className="text-gray-600 mt-2">{wikiData.description}</p>
          )}
        </div>
      )}
      {wikiData === null && (
        <p className="text-gray-500 mt-8 text-center">
          Aucun article Wikipédia français trouvé pour ce titre.
        </p>
      )}
    </div>
  );
};

export default BookDetails;
