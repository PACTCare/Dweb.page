import Dexie from 'dexie';

const db = new Dexie('backgroundDb');
db.version(1).stores({
  backgroundImg: '++id',
});

export default db;
