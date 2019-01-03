// the bigger maxDaysLoaded the more search data is loaded parallel
// storage should get too big offer time
const maxDaysToLoad = 20;

/**
 * Returns number of the oldest day, which needs to be loaded
 * @param {number} daysLoaded
 * @param {number} mostRecentDayNumber
 * @returns {number} oldest day number
 */
export default function (daysLoaded, mostRecentDayNumber) {
  if (mostRecentDayNumber < daysLoaded) {
    return undefined;
  }
  if (mostRecentDayNumber - daysLoaded > maxDaysToLoad) {
    return mostRecentDayNumber - maxDaysToLoad;
  }
  return daysLoaded;
}
