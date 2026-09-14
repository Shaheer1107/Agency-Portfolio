"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

export function ProjectMedia({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);
  if (failed)
    return (
      <div
        className={`${className} project-media-fallback`}
        aria-label={`${alt} image unavailable`}
      >
        <ImageOff size={28} />
        <span>Add a real image URL or upload a cover image in Admin.</span>
      </div>
    );
  return (
    <img
      className={className}
      src={src ?? ""}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
