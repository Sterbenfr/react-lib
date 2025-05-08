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

        // Récupère l’édition principale si possible
        if (details.edition_key?.length) {
          const res = await fetch(`https://openlibrary.org/books/${details.edition_key[0]}.json`);
          setEdition(await res.json());
        }

        // Fetch authors' names
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

        // Récupération de l'extrait Wikipédia
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
    return <p>Chargement des détails du livre...</p>;
  }

  const coverUrl = bookDetails.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg`
    : "https://placehold.co/600x400?text=No+Cover";

  return (
    <div className="space-y-4">
      <div className="flex gap-6">
        <Image
          src={coverUrl}
          alt={`Couverture de ${bookDetails.title || "inconnu"}`}
          width={300}
          height={400}
          className="object-cover rounded"
        />
        <div>
          <h1 className="text-3xl font-bold">{bookDetails.title || "Titre inconnu"}</h1>
          {bookDetails.subtitle && (
            <h2 className="text-xl text-gray-500">{bookDetails.subtitle}</h2>
          )}
          {authors.length > 0 && (
            <p className="text-gray-700">
              Auteur(s) :{" "}
              {authors.map((author, index) => (
                <span key={author.key}>
                  {index > 0 && ", "}
                  <a
                    href={`https://openlibrary.org${author.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {author.name}
                  </a>
                </span>
              ))}
            </p>
          )}
          {bookDetails.first_publish_date && (
            <p className="text-gray-600">
              Première publication : {bookDetails.first_publish_date}
            </p>
          )}
          {bookDetails.created && (
            <p className="text-gray-600">
              Créé le : {new Date(bookDetails.created.value).toLocaleDateString()}
            </p>
          )}
          {bookDetails.last_modified && (
            <p className="text-gray-600">
              Dernière modification : {new Date(bookDetails.last_modified.value).toLocaleDateString()}
            </p>
          )}
          {bookDetails.number_of_pages && (
            <p className="text-gray-600">
              Nombre de pages : {bookDetails.number_of_pages}
            </p>
          )}
          {bookDetails.edition_count && (
            <p className="text-gray-600">
              Nombre d’éditions : {bookDetails.edition_count}
            </p>
          )}
          {bookDetails.languages && Array.isArray(bookDetails.languages) && (
            <p className="text-gray-600">
              Langue(s) :{" "}
              {bookDetails.languages
                .map((lang: any) => lang.key.replace("/languages/", ""))
                .join(", ")}
            </p>
          )}
          <p>
            <a
              href={`https://openlibrary.org${bookDetails.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Voir sur Open Library
            </a>
          </p>
        </div>
      </div>
      {bookDetails.subjects && Array.isArray(bookDetails.subjects) && (
        <div>
          <strong>Sujets :</strong>{" "}
          {bookDetails.subjects.slice(0, 10).join(", ")}
          {bookDetails.subjects.length > 10 && "…"}
        </div>
      )}
      {bookDetails.description && (
        <p>
          {typeof bookDetails.description === "string"
            ? bookDetails.description
            : bookDetails.description?.value}
        </p>
      )}
      {edition && (
        <div className="mt-2 space-y-1">
          {edition.publish_date && (
            <p><strong>Date de publication :</strong> {edition.publish_date}</p>
          )}
          {edition.publishers && (
            <p><strong>Éditeur :</strong> {edition.publishers.join(", ")}</p>
          )}
          {edition.physical_format && (
            <p><strong>Format :</strong> {edition.physical_format}</p>
          )}
          {edition.number_of_pages && (
            <p><strong>Pages :</strong> {edition.number_of_pages}</p>
          )}
          {edition.isbn_10 && (
            <p><strong>ISBN-10 :</strong> {edition.isbn_10.join(", ")}</p>
          )}
          {edition.isbn_13 && (
            <div className="flex gap-2 flex-wrap">
              <a
                href={`https://www.amazon.fr/s?k=${edition.isbn_13[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Acheter sur Amazon
              </a>
              <a
                href={`https://www.betterworldbooks.com/search/results?q=${edition.isbn_13[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Acheter sur BetterWorldBooks
              </a>
              <a
                href={`https://www.worldcat.org/isbn/${edition.isbn_13[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Trouver en bibliothèque (WorldCat)
              </a>
              <a
                href={`https://library.link/isbn/${edition.isbn_13[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Trouver en bibliothèque (Library.link)
              </a>
            </div>
          )}
          {edition.identifiers?.librarything && (
            <p>
              <a href={`https://www.librarything.com/work/${edition.identifiers.librarything[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Voir sur LibraryThing
              </a>
            </p>
          )}
          {edition.identifiers?.goodreads && (
            <p>
              <a href={`https://www.goodreads.com/book/show/${edition.identifiers.goodreads[0]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Voir sur Goodreads
              </a>
            </p>
          )}
          {/* Ajoute d’autres liens selon les identifiants */}
        </div>
      )}
      {wikiData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Wikipedia</h2>
          <p dangerouslySetInnerHTML={{ __html: wikiData.extract_html }} />
          <div className="flex gap-2 flex-wrap">
            {wikiData.content_urls?.desktop?.page && (
              <a
                href={wikiData.content_urls.desktop.page}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Lire l’article complet sur Wikipédia
              </a>
            )}
            {wikiData.content_urls?.desktop?.revisions && (
              <a
                href={wikiData.content_urls.desktop.revisions}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Historique
              </a>
            )}
            {wikiData.content_urls?.desktop?.talk && (
              <a
                href={wikiData.content_urls.desktop.talk}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
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
    </div>
  );
};

export default BookDetails;
