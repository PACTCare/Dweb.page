/**
 * Compbines three buffer
 * @param {buffer} buffer1
 * @param {buffer} buffer2
 * @param {buffer} buffer3
 */
export default function appendThreeBuffer(buffer1, buffer2, buffer3) {
  const tmp = new Uint8Array(
    buffer1.byteLength + buffer2.byteLength + buffer3.byteLength,
  );
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  tmp.set(new Uint8Array(buffer3), buffer1.byteLength + buffer2.byteLength);
  return tmp.buffer;
}
