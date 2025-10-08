/**
 * Parse a date string in DD-MM-YYYY format to a Date object (UTC)
 */
export function parseDateFromDDMMYYYY(dateString: string): Date | undefined {
  if (!dateString.trim()) return undefined;

  const [day, month, year] = dateString.split("-");
  if (!day || !month || !year) return undefined;

  return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
}

/**
 * Format a Date object to DD-MM-YYYY string
 */
export function formatDateToDDMMYYYY(date: Date): string {
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Parse user input as either a numeric index (1-based) or a task ID (UUID)
 * Returns the task ID
 */
export function parseTaskIdOrIndex(
  input: string,
  indexMap: Record<number, string>
): string {
  const numericInput = parseInt(input);
  if (!isNaN(numericInput) && indexMap[numericInput]) {
    return indexMap[numericInput];
  }
  return input;
}

/**
 * Navigate through priority options with wraparound
 */
export function navigatePriorities<T>(
  options: readonly T[],
  currentValue: T,
  direction: "up" | "down"
): T {
  const currentIdx = options.indexOf(currentValue);
  const newIdx =
    direction === "down"
      ? (currentIdx + 1) % options.length
      : (currentIdx - 1 + options.length) % options.length;
  return options[newIdx];
}
