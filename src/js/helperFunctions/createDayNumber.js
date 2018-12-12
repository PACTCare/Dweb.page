/**
 * Returns the number of days since 2018 11 18
 */
export default function createDayNumber() {
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }
  const firstDate = new Date('2018-11-18'); //  ISO 8601 syntax (YYYY-MM-DD)
  const secondDate = new Date(`${yyyy}-${mm}-${dd}`);
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
}
