/**
 * Creates a Ping instance.
 * @returns {Ping}
 * @constructor
 */
const Ping = function ping(opt) {
  this.opt = opt || {};
  this.favicon = this.opt.favicon || '/favicon.ico';
  this.timeout = this.opt.timeout || 0;
};

/**
 * Pings source and triggers a callback when completed.
 * @param source Source of the website or server, including protocol and port.
 * @param callback Callback function to trigger when completed. Returns error and ping value.
 * @param timeout Optional number of milliseconds to wait before aborting.
 */
Ping.prototype.ping = function pingPrototype(callback) {
  // ping google currently for internet connection test, since node ping causes problem
  const source = 'https://www.google.com/';
  this.img = new Image();
  let timer;

  const start = new Date();
  this.img.onload = pingCheck;
  this.img.onerror = pingCheck;
  if (this.timeout) {
    timer = setTimeout(pingCheck, this.timeout);
  }

  /**
   * Times ping and triggers callback.
   */
  function pingCheck(e) {
    if (timer) {
      clearTimeout(timer);
    }
    const pong = new Date() - start;

    if (typeof callback === 'function') {
      if (e.type === 'error') {
        console.error('error loading resource');
        return callback('error', pong);
      }
      return callback(null, pong);
    }
  }

  this.img.src = `${source + this.favicon}?${+new Date()}`; // Trigger image load with cache buster
};

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ping;
  }
} else {
  window.Ping = Ping;
}
