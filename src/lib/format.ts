export const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  USED_LIKE_NEW: "Like New",
  USED_GOOD: "Good",
  USED_FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

export function conditionLabel(condition: string) {
  return CONDITION_LABELS[condition] ?? condition;
}

export function timeUntil(target: Date | string): { ms: number; label: string; urgent: boolean } {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return { ms: 0, label: "Ended", urgent: false };

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let label: string;
  if (days > 0) label = `${days}d ${hours}h`;
  else if (hours > 0) label = `${hours}h ${minutes}m`;
  else if (minutes > 0) label = `${minutes}m ${seconds}s`;
  else label = `${seconds}s`;

  return { ms, label, urgent: ms < 1000 * 60 * 60 };
}
