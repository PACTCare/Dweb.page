import { MAX_LOAD_DAYS } from './searchConfig';

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
  if (mostRecentDayNumber - daysLoaded > MAX_LOAD_DAYS) {
    return mostRecentDayNumber - MAX_LOAD_DAYS;
  }
  return daysLoaded;
}
