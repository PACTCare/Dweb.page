export default function addZeroIfLessThan64(number) {
  let retval = `${number}`;
  while (retval.length < 64) {
    retval = `0${retval}`;
  }
  return retval;
}
