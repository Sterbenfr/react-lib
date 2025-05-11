"use client";
import { Suspense } from "react";
import SearchResults from "@/components/SearchResults"; // We'll create this component

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4">Chargement de la recherche...</div>}>
      <SearchResults />
    </Suspense>
  );
}
