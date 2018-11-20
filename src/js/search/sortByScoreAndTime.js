
/**
 * always prefer more recent stuff, since the chances are higher it's still available!
 * @param {object} x
 * @param {object} y
 */
export default function sortByScoreAndTime(x, y) {
  if (x.score === y.score) {
    const dx = new Date(x.time).getTime();
    const dy = new Date(y.time).getTime();
    if (dx > dy) { return -1; }
    if (dx < dy) { return 1; }
    return 0;
  }
  return x.score < y.score ? 1 : -1;
}
