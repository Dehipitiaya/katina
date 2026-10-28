const UNIT_WORDS = new Set([
  "කිලො",
  "කිලෝ",
  "kg",
  "ග්‍රෑම්",
  "g",
  "ලිටර්",
  "ලීටර",
  "ලිටර",
  "liter",
  "litre",
  "l",
  "පැකට්",
  "පෑකට්",
  "මිටි",
  "ගෙඩි",
  "ඇවරි",
  "බොල",
  "ටින්",
]);

const NUMBER = /^\d+(?:\.\d+)?$/;

/**
 * Reads how much of an item is needed from names like "මොප් 4",
 * "කැරට් කිලො 1" or "ඩේසි මල් 20 x 500 = 10000" (count × price).
 * Returns null when there is nothing to split (no number, or just "1" of something).
 */
export function parseItemQuantity(name: string) {
  const cleaned = name
    .replace(/\(.*?\)/g, " ") // prices like "(6400 /=)"
    .replace(/=.*$/, " ") // totals like "= 10000"
    .replace(/(\d)\s*[x×*]\s*\d+(?:\.\d+)?/gi, "$1") // keep the count of "20 x 500"
    .replace(/[-,]/g, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const numberIndexes = tokens
    .map((token, index) => (NUMBER.test(token) ? index : -1))
    .filter((index) => index !== -1);

  if (numberIndexes.length === 0) {
    return null;
  }

  const index = numberIndexes[numberIndexes.length - 1];
  const target = Number(tokens[index]);
  const neighbours = [tokens[index - 1], tokens[index + 1]];
  const unit =
    neighbours.find((word) => word && UNIT_WORDS.has(word.toLowerCase())) ?? null;

  if (!(target > 0) || (target === 1 && !unit)) {
    return null;
  }

  return { targetAmount: target, unit };
}

/** Rounds away floating-point noise from summed decimal quantities (0.1 + 0.2). */
export function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

/** "Rs. 6,400" for money items, "1.5 කිලො" / "4" for quantity items. */
export function formatItemAmount(
  item: { type: string; unit: string | null },
  amount: number,
) {
  const value = roundAmount(amount).toLocaleString("en-LK");

  if (item.type === "MONEY") {
    return `Rs. ${value}`;
  }

  return item.unit ? `${value} ${item.unit}` : value;
}
