import Iota from '../iota/Iota';
import createDayNumber from '../helperFunctions/createDayNumber';
import addMetadata from './addMetadata';
import Signature from '../crypto/Signature';
import prepObjectForSignature from '../crypto/prepObjectForSignature';
import daysToLoadNr from './dayToLoadNr';
import SubscriptionDb from './SubscriptionDb';
import MetadataDb from './MetadataDb';
import {
  LOAD_DAYS_UPDATE, LOAD_DAYS_BEGINNING, MAX_LOAD_ARRAY,
} from './searchConfig';

const mostRecentDayNumber = createDayNumber();
const subscriptionDb = new SubscriptionDb();
const metadataDb = new MetadataDb();
const iota = new Iota();

/**
 * Load new metadata from subscript addresses
 * @param {Number} mostRecentDayNumber
 * @param {Array} subscribeArray
 * @param {Object} iota
 */
function loadSubscription(subscribeArray) {
  const awaitTransactions = [];
  let localDayNumber = mostRecentDayNumber;
  for (let i = 0; i < subscribeArray.length; i += 1) {
    const daysLoaded = daysToLoadNr(subscribeArray[i].daysLoaded);
    while (localDayNumber >= daysLoaded) {
      const tag = iota.createTimeTag(localDayNumber);
      awaitTransactions.push(iota.getTransactionByAddressAndTag(subscribeArray[i].address, tag));
      localDayNumber -= 1;
    }
  }
  return awaitTransactions;
}

/**
 * Load metadata by day
 * @param {Number} mostRecentDayNumber
 * @param {Number} recentDayLoad
 * @param {Object} iota
 */
function loadMetadataByDay(recentDayLoad) {
  let recentDaysLoaded = 0;
  const awaitTransactions = [];
  let localDayNumber = mostRecentDayNumber;
  while (localDayNumber >= 0 && recentDaysLoaded < recentDayLoad) {
    const tag = iota.createTimeTag(localDayNumber);
    console.log(tag);
    awaitTransactions.push(iota.getTransactionByTag(tag));
    recentDaysLoaded += 1;
    localDayNumber -= 1;
  }
  return awaitTransactions;
}

// function loadAvailibilityData() {
// TODO: at least two times market as unavailable
// } else if (metadataCount === 0 && metaObject.description === UNAVAILABLE_DESC) {
//   metaObject.available = 0;
//   try {
//     await searchDb.metadata.add(metaObject);
//   } catch (error) {
//     console.log(error);
//     console.log(metaObject);
//   }
// } else if (metaObject.description === UNAVAILABLE_DESC) {
//   // removeMetaData(metaObject);
//   await searchDb.metadata.where('fileId').equals(metaObject.fileId).modify({ available: 0 });
// }
// }

/**
 * Load most recent metadata and stores it
 * @param {boolean} databaseWorks
 */
export default async function loadMetadata(databaseWorks) {
  await iota.nodeInitialization();
  const sig = new Signature();
  const logFlags = {};
  let awaitTransactions = [];
  let recentDayLoad = LOAD_DAYS_UPDATE;

  if (databaseWorks) {
    await subscriptionDb.updateDaysLoaded(mostRecentDayNumber);
    const subscribeArray = await subscriptionDb.loadActiveSubscription();
    if (subscribeArray.length === 0) {
      recentDayLoad = LOAD_DAYS_BEGINNING;
    } else {
      awaitTransactions = awaitTransactions.concat(loadSubscription(subscribeArray));
    }
  } else {
    recentDayLoad = LOAD_DAYS_BEGINNING;
  }

  awaitTransactions = awaitTransactions.concat(loadMetadataByDay(recentDayLoad));
  const transactionsArrays = await Promise.all(awaitTransactions);
  let transactions = [].concat(...transactionsArrays);
  // TODO: System to load rest of array data with next side reload
  transactions = transactions.slice(0, MAX_LOAD_ARRAY);
  if (transactions.length > 0) {
    await Promise.all(transactions.map(async (transaction) => {
      let metaObject = await iota.getMessage(transaction);
      if (typeof metaObject !== 'undefined' && (!logFlags[metaObject.fileId])) {
        logFlags[metaObject.fileId] = true;
        metaObject.publicTryteKey = metaObject.address + metaObject.publicTryteKey;
        const publicKey = await sig.importPublicKey(iota.tryteKeyToHex(metaObject.publicTryteKey));

        if (typeof publicKey !== 'undefined') {
          const { signature, address } = metaObject;
          metaObject = prepObjectForSignature(metaObject);
          const isVerified = await sig.verify(publicKey, signature, JSON.stringify(metaObject));
          metaObject.address = address;
          if (isVerified && typeof metaObject.fileId !== 'undefined') {
            if (databaseWorks) {
              await metadataDb.add(metaObject);
            } else {
              addMetadata(metaObject);
            }
          }
        }
      }
    }));
  }

  // TODO: Loadavailibility data
}
