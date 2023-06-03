export const escapeName = string => String(string).replaceAll('"', '""');
export const escapeString = string =>
  "'" + string.replaceAll("'", "''").replaceAll('\\', '\\\\') + "'";
