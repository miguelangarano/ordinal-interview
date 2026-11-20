"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TrailerButton({
  videoKey,
  title,
}: {
  videoKey: string;
  title: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <Play className="fill-current" /> Watch trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden border-none bg-black p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">{title} trailer</DialogTitle>
        {/* The iframe only mounts while the dialog is open, so closing it stops playback. */}
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
