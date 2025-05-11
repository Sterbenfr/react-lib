'use client';
import { useParams } from "next/navigation";
import BookDetails from "@/components/BookDetails";

export default function BookPage() {
  const { bookID } = useParams();

  if (!bookID) {
    return <p className="text-red-500">L&apos;ID du livre est manquant.</p>;
  }

  return <BookDetails workID={Array.isArray(bookID) ? bookID[0] : bookID} />;
}
