"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/recently-viewed";

export default function TrackRecentlyViewed({ slug }: { slug: string }) {
  useEffect(() => {
    recordRecentlyViewed(slug);
  }, [slug]);

  return null;
}
