export function updateArrayAt<T>(
  items: T[],
  index: number,
  updater: (item: T) => T
): T[] {
  const next = [...items];
  next[index] = updater(next[index]);
  return next;
}

export function removeArrayAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

export function addArrayItem<T>(items: T[], item: T): T[] {
  return [...items, item];
}

export function moveArrayItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}
