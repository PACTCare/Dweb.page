import Dexie from 'dexie';

const db = new Dexie('logDb');
db.version(1).stores({
  log: '++id',
});

export default db;
