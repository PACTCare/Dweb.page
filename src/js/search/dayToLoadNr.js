// the bigger maxDaysLoaded the more search data is loaded parallel
// storage should get too big offer time
const maxDaysToLoad = 20;

export default function (daysLoaded, mostRecentDayNumber) {
  let daysLoadedPrivate = daysLoaded;
  if (daysLoadedPrivate === 0) {
    if (mostRecentDayNumber > maxDaysToLoad) {
      daysLoadedPrivate = mostRecentDayNumber - maxDaysToLoad; // load the max number of days
    }
  } else if (mostRecentDayNumber - daysLoaded > maxDaysToLoad) {
    // means the last time the page was open is quite some time ago
    daysLoadedPrivate = mostRecentDayNumber - maxDaysToLoad;
  }
  return daysLoadedPrivate;
}
