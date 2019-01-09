import Dexie from 'dexie';
import addMetadata from './addMetadata';
import { NOLONGER_AVAILABLE_LIMIT } from './searchConfig';

/**
 * Metadata db for the Search Enginen
 */
export default class MetadataDb {
  constructor() {
    const db = new Dexie('metadataDb');
    db.version(1).stores({
      metadata: 'fileId, address, available',
    });
    this.db = db;
  }

  /**
   * Adds metadata to the database and to the search engine
   * @param {Object} metadata
   */
  async add(metadata) {
    // uses count + add instead of put to not generate double entries with addMetadata!
    const metadataCount = await this.db.metadata.where('fileId').equals(metadata.fileId).count();
    if (metadataCount === 0) {
      addMetadata(metadata);
      const localMeta = metadata;
      localMeta.available = 0;
      await this.db.metadata.add(localMeta);
    }
  }

  async getMetadata() {
    return this.db.metadata.where('available').below(NOLONGER_AVAILABLE_LIMIT).toArray();
  }

  async noLongerAvailable(metadata) {
    const metadataCount = await this.db.metadata.where('fileId').equals(metadata.fileId).count();
    if (metadataCount > 0) {
      await this.db.metadata.where('fileId').equals(metadata.fileId).modify({ available: NOLONGER_AVAILABLE_LIMIT });
    }
  }
}
