"use client";

export function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const q = query.trim().toLowerCase();
  const parts: Array<{ str: string; match: boolean }> = [];
  let remaining = text;

  while (remaining.length > 0) {
    const idx = remaining.toLowerCase().indexOf(q);
    if (idx === -1) {
      parts.push({ str: remaining, match: false });
      break;
    }
    if (idx > 0) {
      parts.push({ str: remaining.slice(0, idx), match: false });
    }
    parts.push({ str: remaining.slice(idx, idx + q.length), match: true });
    remaining = remaining.slice(idx + q.length);
  }

  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={i}
            className="bg-accent/30 text-text-main rounded-sm px-0.5"
          >
            {part.str}
          </mark>
        ) : (
          <span key={i}>{part.str}</span>
        )
      )}
    </>
  );
}
