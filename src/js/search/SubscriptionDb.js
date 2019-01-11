import Dexie from 'dexie';

import { MAX_SUBSCRIBER_NR } from './searchConfig';

/**
 * Subscription db for the Search Enginen
 */
export default class SubscriptionDb {
  constructor() {
    const db = new Dexie('subscriptionDb');
    db.version(1).stores({
      subscription: '++id, address, blocked, daysLoaded',
    });
    this.db = db;
  }

  /**
   * Loads all active subscriptions
   */
  async loadActiveSubscription() {
    return this.db.subscription.where('blocked').equals(0).toArray();
  }

  async addSubscribtion(address) {
    const count = await this.db.subscription.where('address').equals(address).count();
    if (count < 1) {
      await this.db.subscription.add({
        address,
        blocked: 0,
        daysLoaded: 0,
      });
      const totalCount = await this.db.subscription.count();

      if (totalCount > MAX_SUBSCRIBER_NR) {
        const test = await this.db.subscription.toCollection().first();
        await this.db.subscription.delete(test.address);
      }
    }
  }

  async removeSubscription(address) {
    await this.db.subscription.where('address').equals(address).modify({ blocked: 1 }); // 1 = true
  }

  /**
   * Update most recent day for all subscribers
   * @param {number} mostRecentDayNumber
   */
  async updateDaysLoaded(mostRecentDayNumber) {
    await this.db.subscription.toCollection().modify({ daysLoaded: mostRecentDayNumber });
  }
}
