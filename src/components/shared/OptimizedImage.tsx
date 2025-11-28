/**
 * OptimizedImage Component (P6-011)
 *
 * Image component with lazy loading, error fallback, and loading state.
 */

import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  aspectRatio?: "square" | "video" | "auto";
  objectFit?: "cover" | "contain" | "fill";
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  aspectRatio = "video",
  objectFit = "cover",
  lazy = true,
}: OptimizedImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  );
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!(lazy && containerRef.current)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Reset status when src changes
  useEffect(() => {
    if (src) {
      setStatus("loading");
    } else {
      setStatus("error");
    }
  }, [src]);

  const handleLoad = () => {
    setStatus("loaded");
  };

  const handleError = () => {
    setStatus("error");
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  }[objectFit];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClass,
        className,
      )}
    >
      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Error/fallback state */}
      {status === "error" && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted",
            fallbackClassName,
          )}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Image */}
      {src && isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? "lazy" : undefined}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            objectFitClass,
            status === "loaded" ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}

/**
 * Favicon image with fallback
 */
interface FaviconProps {
  src: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Favicon({ src, alt, size = "md", className }: FaviconProps) {
  const [error, setError] = useState(!src);

  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-muted",
          sizeClass,
          className,
        )}
      >
        <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn("rounded", sizeClass, className)}
    />
  );
}
