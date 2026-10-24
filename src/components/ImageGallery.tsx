"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, title }: { images: { url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const current = images[active]?.url;

  return (
    <div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-muted"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        {current && (
          <Image
            src={current}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={{
              transform: zoom ? "scale(1.8)" : "scale(1)",
              transformOrigin: origin,
            }}
            priority
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setActive(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                idx === active ? "border-brand" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={`${title} thumbnail ${idx + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-center text-xs text-muted">Hover image to zoom</p>
    </div>
  );
}
