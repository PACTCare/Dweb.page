import searchDb from './searchDb';

/**
 * Subscription system for the Search Enginen
 */
export default class Subscription {
  constructor() {
    this.searchDb = searchDb;
  }

  /**
   * Loads all active subscriptions
   */
  async loadActiveSubscription() {
    return this.searchDb.subscription.where('blocked').equals(0).toArray();
  }

  async addSubscribtion(address) {
    // TODO: Automaticly unsubscribe from too many users
    const count = await this.searchDb.subscription.where('address').equals(address).count();
    // only add new addresses
    if (count < 1) {
      await this.searchDb.subscription.add({
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
    await this.searchDb.subscription.where('address').equals(address).modify({ blocked: 1 }); // 1 = true
    await this.searchDb.metadata.where('address').equals(address).delete();
  }

  /**
   * Update most recent day for all subscribers
   * @param {number} mostRecentDayNumber
   */
  async updateDaysLoaded(mostRecentDayNumber) {
    await this.searchDb.subscription.toCollection().modify({ daysLoaded: mostRecentDayNumber });
  }
}
