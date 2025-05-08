import Link from "next/link";
import Image from "next/image";

type BookCardProps = {
  title: string;
  authors?: string[];
  coverID?: number;
  olid: string;
};

const BookCard = ({ title, authors = [], coverID, olid }: BookCardProps) => {
  const coverUrl = coverID
    ? `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`
    : "https://placehold.co/600x400?text=No+Cover";

  return (
    <div className="border rounded p-4 shadow-md flex gap-4">
      <Image
        src={coverUrl}
        alt={title}
        width={128} // Largeur explicite
        height={192} // Hauteur explicite
        className="w-32 h-48 object-cover"
        priority={true}
        unoptimized={coverUrl.startsWith("https://placehold.co/")}
      />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-700">
          {authors.length > 0
            ? `Auteur(s): ${authors.join(", ")}`
            : "Auteur inconnu"}
        </p>
        <Link
          href={`/books/${olid.split("/").pop()}`}
          className="text-blue-600 underline mt-2 inline-block"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
