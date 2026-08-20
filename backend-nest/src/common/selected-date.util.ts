export function normalizeSelectedDateKey(selectedDate?: string | Date) {
  if (!selectedDate) {
    return '';
  }

  const raw = selectedDate.toString().trim();
  const parts = raw.split('-').map((part) => Number(part));

  if (parts.length < 2 || parts.some((part, index) => index < 2 && Number.isNaN(part))) {
    return raw;
  }

  const [year, month, day] = parts;
  const normalizedMonth = String(month).padStart(2, '0');

  if (parts.length >= 3 && !Number.isNaN(day)) {
    return `${year}-${normalizedMonth}-${String(day).padStart(2, '0')}`;
  }

  return `${year}-${normalizedMonth}`;
}

export function parseSelectedDateRange(selectedDate?: string | Date) {
  if (!selectedDate) {
    return null;
  }

  const raw = selectedDate.toString().trim();
  const parts = raw.split('-').map((part) => Number(part));

  const [year, month, day] = parts;
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return null;
  }

  if (parts.length >= 3 && !Number.isNaN(day)) {
    return {
      from: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
      to: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
    };
  }

  return {
    from: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    to: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}
