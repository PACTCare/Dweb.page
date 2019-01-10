import { LOAD_DAYS_BEGINNING } from './searchConfig';

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
  if (mostRecentDayNumber - daysLoaded > LOAD_DAYS_BEGINNING) {
    return mostRecentDayNumber - LOAD_DAYS_BEGINNING;
  }
  return daysLoaded;
}
