import createDayNumber from './createDayNumber';
import addMetadata from './addMetadata';
import Signature from '../crypto/Signature';
import prepObjectForSignature from '../crypto/prepObjectForSignature';
import daysToLoadNr from './dayToLoadNr';
import SubscriptionDb from './SubscriptionDb';
import MetadataDb from './MetadataDb';
import {
  SUBSCRIBER_LOAD_SHARE, LOAD_DAYS_UPDATE, LOAD_DAYS_BEGINNING,
  MAX_LOAD_ARRAY, TAG_PREFIX_UNAVAILABLE,
} from './searchConfig';

const mostRecentDayNumber = createDayNumber();
const subscriptionDb = new SubscriptionDb();
const metadataDb = new MetadataDb();
const sig = new Signature();

async function returnVerifiedObj(metaObject) {
  let localObj = metaObject;
  localObj.publicTryteKey = localObj.address + localObj.publicTryteKey;
  const publicKey = await sig.importPublicKey(iota.tryteKeyToHex(localObj.publicTryteKey));
  if (typeof publicKey !== 'undefined') {
    const { signature, address } = localObj;
    localObj = prepObjectForSignature(localObj);
    const isVerified = await sig.verify(publicKey, signature, JSON.stringify(localObj));
    if (isVerified && typeof localObj.fileId !== 'undefined') {
      localObj.address = address;
      return localObj;
    }
  }
  return undefined;
}

/**
 * Load new metadata from subscript addresses
 * @param {Array} subscribeArray
 * @param {Boolean} loadUnavailableData
 */
function loadSubscription(subscribeArray, loadUnavailableData = false) {
  const awaitTransactions = [];
  for (let i = 0; i < subscribeArray.length; i += 1) {
    const daysLoaded = daysToLoadNr(subscribeArray[i].daysLoaded);
    let localDayNumber = mostRecentDayNumber;
    while (localDayNumber >= daysLoaded) {
      let tag = iota.createTimeTag(localDayNumber);
      if (loadUnavailableData) {
        tag = TAG_PREFIX_UNAVAILABLE + tag;
      }
      awaitTransactions.push(iota.getTransactionByAddressAndTag(subscribeArray[i].address, tag));
      localDayNumber -= 1;
    }
  }
  return awaitTransactions;
}

/**
 * Load metadata by day
 * @param {Number} recentDayLoad
 */
function loadMetadataByDay(recentDayLoad) {
  let recentDaysLoaded = 0;
  const awaitTransactions = [];
  let localDayNumber = mostRecentDayNumber;
  while (localDayNumber >= 0 && recentDaysLoaded < recentDayLoad) {
    const tag = iota.createTimeTag(localDayNumber);
    awaitTransactions.push(iota.getTransactionByTag(tag));
    recentDaysLoaded += 1;
    localDayNumber -= 1;
  }
  return awaitTransactions;
}

/**
 * Load and add availibility data
 * @param {Array} subscribeArray
 */
async function loadAvailibilityData(subscribeArray) {
  const logFlags = {};
  const transactionsArrays = await Promise.all(loadSubscription(subscribeArray, true));
  let unavailableTransactions = [].concat(...transactionsArrays);
  unavailableTransactions = unavailableTransactions.slice(0, MAX_LOAD_ARRAY);
  if (unavailableTransactions.length > 0) {
    unavailableTransactions.map(async (transaction) => {
      let metaObject = await iota.getMessage(transaction);
      if (typeof metaObject !== 'undefined' && (!logFlags[metaObject.address])) {
        logFlags[metaObject.address] = true;
        metaObject = await returnVerifiedObj(metaObject);
        if (metaObject !== 'undefined') {
          await metadataDb.updateAvailability(metaObject);
        }
      }
    });
  }
}

/**
 * Load most recent metadata and stores it
 * @param {boolean} databaseWorks
 */
export default async function loadMetadata(databaseWorks) {
  const logFlags = {};
  let awaitTransactions = [];
  let recentDayLoad = LOAD_DAYS_UPDATE;
  let subscribeArray;

  if (databaseWorks) {
    await subscriptionDb.updateDaysLoaded(mostRecentDayNumber);
    subscribeArray = await subscriptionDb.loadActiveSubscription();
    if (subscribeArray.length === 0) {
      recentDayLoad = LOAD_DAYS_BEGINNING;
    } else {
      awaitTransactions = awaitTransactions.concat(loadSubscription(subscribeArray));
    }
  } else {
    recentDayLoad = LOAD_DAYS_BEGINNING;
  }

  // TODO: System to load rest of array data with next side reload
  awaitTransactions = awaitTransactions.slice(0, MAX_LOAD_ARRAY * SUBSCRIBER_LOAD_SHARE);
  const recentAwaitTransactions = loadMetadataByDay(recentDayLoad).slice(
    0,
    MAX_LOAD_ARRAY * (1 - SUBSCRIBER_LOAD_SHARE),
  );
  awaitTransactions = awaitTransactions.concat(recentAwaitTransactions);

  const transactionsArrays = await Promise.all(awaitTransactions);
  const transactions = [].concat(...transactionsArrays);
  if (transactions.length > 0) {
    await Promise.all(transactions.map(async (transaction) => {
      // let metaObject = await iota.getMessage(transaction);
      if (typeof metaObject !== 'undefined' && (!logFlags[metaObject.fileId])) {
        logFlags[metaObject.fileId] = true;
        metaObject = await returnVerifiedObj(metaObject);
        if (metaObject !== 'undefined') {
          if (databaseWorks) {
            await metadataDb.add(metaObject);
          } else {
            addMetadata(metaObject);
          }
        }
      }
    }));
  }

  // Without database only recent data is loaded,
  // so no available system necessary
  if (subscribeArray.length > 0) {
    await loadAvailibilityData(subscribeArray);
  }
}
