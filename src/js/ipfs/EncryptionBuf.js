import { FILENAME_LENGTH_NUMBER } from './ipfsConfig';
import appendThreeBuffer from './appendThreeBuffer';

/**
 * Class for creating encrypted IPFS buffer
 */
export default class EncryptionBuf {
  constructor() {
    this.lengthNumber = FILENAME_LENGTH_NUMBER;
  }

  /**
   * Create encrypted IPFS buffer
   * @param {String} Filename
   * @param {Uint8Array} Initialvector
   * @param {ArrayBuffer} Encrypted Data
   * @returns {ArrayBuffer}
   */
  createBuf(filename, initialVector, encryptedData) {
    const lenNumber = Buffer.from(filename).length + this.lengthNumber;
    const fileNameArray = Buffer.from(lenNumber + filename);
    return appendThreeBuffer(
      fileNameArray,
      initialVector,
      encryptedData,
    );
  }

  /**
   * Disassemble the encrypted arraybuffer
   * @param {ArrayBuffer} Arraybuffer
   * @returns {Array} FileName, Initialvector, Filearray
   */
  disassembleBuf(arrayBuffer) {
    const fileNameLength = new TextDecoder('utf-8').decode(arrayBuffer.slice(0, 4)) - this.lengthNumber;
    const fileName = new TextDecoder('utf-8').decode(
      arrayBuffer.slice(4, fileNameLength + 4),
    );
    const initialVector = new Uint8Array(
      arrayBuffer.slice(4 + fileNameLength, 16 + fileNameLength),
    );
    const fileArray = new Uint8Array(
      arrayBuffer.slice(16 + fileNameLength),
    );
    return [fileName, initialVector, fileArray];
  }
}
