import { Film } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <Film className="size-10 text-primary" />
      <h1 className="mt-4 text-2xl font-semibold">Scene missing</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find what you were looking for.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to trending</Link>
      </Button>
    </div>
  );
}
