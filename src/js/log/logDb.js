import Dexie from 'dexie';

const db = new Dexie('logDb');
db.version(1).stores({
  log: '++id, time',
});

export default db;
