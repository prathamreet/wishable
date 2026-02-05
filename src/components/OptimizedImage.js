"use client";

import { useState } from "react";
import Image from "next/image";

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  onError = null,
  sizes = "100vw",
  quality = 75,
  forceProxy,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageSrc = src && src.trim() !== "" ? src : "/images/placeholder.svg";

  const isInternalImage =
    imageSrc.startsWith("/") || imageSrc.startsWith("data:");

  const handleError = () => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setError(true);
    setLoading(false);
    if (onError) onError();
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const imageProps = {
    src: error ? "/images/placeholder.svg" : imageSrc,
    alt: alt || "Product image",
    className: `${className} ${
      loading ? "opacity-0" : "opacity-100"
    } transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    style: { objectFit: "contain" },
  };

  return (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
          <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="text-center">
            <p className="text-xs text-neutral-600">
              Image unavailable
            </p>
          </div>
        </div>
      )}

      {isInternalImage ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          {...imageProps}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          sizes={sizes}
          quality={quality}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img
          {...imageProps}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          style={{
            ...imageProps.style,
            width: fill ? "100%" : width,
            height: fill ? "100%" : height,
            position: fill ? "absolute" : "relative",
            inset: fill ? 0 : "auto",
          }}
        />
      )}
    </>
  );
}
