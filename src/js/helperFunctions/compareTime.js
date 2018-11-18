/**
 * Compares two objects based on the date time element, for the sort function
 * @param {Object} a
 * @param {Object} b
 */
export default function compareTime(a, b) {
  const da = new Date(a.time).getTime();
  const db = new Date(b.time).getTime();
  if (da > db) return -1;
  if (da < db) return 1;
  return 0;
}
