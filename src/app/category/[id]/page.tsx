import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CategoryResults } from "@/components/category/category-results";
import { api } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

const getGenre = cache(async (rawId: string) => {
  const id = Number(rawId);
  const genres = await api.movies.genres();
  const name = Number.isInteger(id) ? genres[id] : undefined;
  if (!name) notFound();
  return { id, name };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const genre = await getGenre((await params).id);
  return { title: `${genre.name} movies` };
}

export default async function CategoryPage({ params }: Props) {
  const genre = await getGenre((await params).id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {genre.name}
      </h1>
      {/* Keyed so switching categories starts with a fresh list. */}
      <CategoryResults key={genre.id} genreId={genre.id} name={genre.name} />
    </div>
  );
}
