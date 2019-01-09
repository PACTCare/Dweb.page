import Dexie from 'dexie';

/**
 * Subscription db for the Search Enginen
 */
export default class SubscriptionDb {
  constructor() {
    const db = new Dexie('subscriptionDb');
    db.version(1).stores({
      subscription: 'address, blocked, daysLoaded',
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
    // TODO: Automaticly unsubscribe from too many users
    const count = await this.db.subscription.where('address').equals(address).count();
    // only add new addresses
    if (count < 1) {
      await this.db.subscription.add({
        address,
        blocked: 0,
        daysLoaded: 0,
      });
    }
  }

  async removeSubscription(address) {
    // TODO: entries need to be removed from metadata as well as
    // don't load additional meta from this subscriber
    // window.metadata
    // window.miniSearch
    await this.db.subscription.where('address').equals(address).modify({ blocked: 1 }); // 1 = true
    await this.db.metadata.where('address').equals(address).delete();
  }

  /**
   * Update most recent day for all subscribers
   * @param {number} mostRecentDayNumber
   */
  async updateDaysLoaded(mostRecentDayNumber) {
    await this.db.subscription.toCollection().modify({ daysLoaded: mostRecentDayNumber });
  }
}
