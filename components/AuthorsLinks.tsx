import Link from "next/link";

type Author = { key: string; name: string };

export default function AuthorsLinks({ authors }: { authors: Author[] }) {
  if (!authors?.length) return <span>Auteur inconnu</span>;
  return (
    <>
      {authors.map((a, i) => (
        <span key={a.key}>
          {i > 0 && ", "}
          <Link href={`https://openlibrary.org${a.key}`} target="_blank" className="text-blue-600 underline">
            {a.name}
          </Link>
        </span>
      ))}
    </>
  );
}