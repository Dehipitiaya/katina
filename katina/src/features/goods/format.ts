export { formatItemAmount } from "@/lib/item-quantity";

export function formatRupees(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

/** Groups items into consecutive sections by category, keeping list order. */
export function groupByCategory<T extends { category: string | null }>(items: T[]) {
  return items.reduce<Array<{ category: string | null; items: T[] }>>(
    (groups, item) => {
      const last = groups.at(-1);

      if (last && last.category === item.category) {
        last.items.push(item);
      } else {
        groups.push({ category: item.category, items: [item] });
      }

      return groups;
    },
    [],
  );
}
