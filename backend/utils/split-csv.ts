/**
 * Standard way to get a list of values from a string
 *
 * @param csv list of comma separated values
 * @param separator separator to use (by default a comma)
 * @return list of trimmed, not-empty values (or empty array if none found)
 */
export function splitCsv(csv: string, separator = ','): string[] {
  if (!csv) {
    return [];
  }

  return csv.split(separator)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
}
