export default class Cookie {
  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   *
   * @param {string} value
   * @param {number} days
   */
  setCookie(value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${this.name}=${value || ''}${expires}; path=/`;
  }

  getCookie() {
    const nameEQ = `${this.name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}
