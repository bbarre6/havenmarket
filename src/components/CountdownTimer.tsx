"use client";

import { useEffect, useRef, useState } from "react";
import { timeUntil } from "@/lib/format";
import { Clock } from "lucide-react";

export default function CountdownTimer({
  endAt,
  onExpire,
  className = "",
}: {
  endAt: string | Date;
  onExpire?: () => void;
  className?: string;
}) {
  const [, setTick] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const { label, ms, urgent } = timeUntil(endAt);

  useEffect(() => {
    if (ms <= 0 && !firedRef.current) {
      firedRef.current = true;
      onExpire?.();
    }
  }, [ms, onExpire]);

  return (
    <span className={`inline-flex items-center gap-1 ${urgent ? "text-danger" : ""} ${className}`}>
      <Clock size={13} />
      {ms <= 0 ? "Auction ended" : `${label} left`}
    </span>
  );
}
