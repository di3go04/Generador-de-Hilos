export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countChars(text: string): { withSpaces: number; withoutSpaces: number } {
  return {
    withSpaces: text.length,
    withoutSpaces: text.replace(/\s/g, "").length,
  };
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

export function removeExtraSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function reverseText(text: string): string {
  return text.split("").reverse().join("");
}

export function sortLines(text: string, ascending = true): string {
  const lines = text.split("\n");
  lines.sort((a, b) => (ascending ? a.localeCompare(b) : b.localeCompare(a)));
  return lines.join("\n");
}
