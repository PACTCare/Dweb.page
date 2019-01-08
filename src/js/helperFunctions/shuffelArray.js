/**
 * Shuffels the list of potential nodes to reduce the traffic to one specific node
 * @param {array} array
 */
export default function shuffleArray(array) {
  const pArray = array;
  let currentIndex = array.length; let temporaryValue; let
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    pArray[currentIndex] = array[randomIndex];
    pArray[randomIndex] = temporaryValue;
  }

  return pArray;
}
