import Dexie from 'dexie';

const db = new Dexie('sigDb');
db.version(1).stores({
  key: '++id',
});

export default db;
