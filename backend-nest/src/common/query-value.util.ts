export function isAllQueryValue(value?: string | null): boolean {
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'all';
}
