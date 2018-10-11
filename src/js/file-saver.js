/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
const saveAs = saveAs
  || (function saveAs(e) {
    if (
      typeof e === 'undefined'
      || (typeof navigator !== 'undefined'
        && /MSIE [1-9]\./.test(navigator.userAgent))
    ) {
      return;
    }
    const t = e.document;
    const n = function url() {
      return e.URL || e.webkitURL || e;
    };
    const r = t.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    const o = 'download' in r;
    const a = function MouseEvent(et) {
      const te = new MouseEvent('click');
      et.dispatchEvent(te);
    };

    const i = /constructor/i.test(e.HTMLElement) || e.safari;
    const f = /CriOS\/[\d]+/.test(navigator.userAgent);


    const u = function (t) {
      (e.setImmediate || e.setTimeout)(() => {
        throw t;
      }, 0);
    };

    const s = 'application/octet-stream';
    const d = 1e3 * 40;
    const c = function (e) {
      const t = function () {
        if (typeof e === 'string') {
          n().revokeObjectURL(e);
        } else {
          e.remove();
        }
      };
      setTimeout(t, d);
    };

    const l = function (e, t, n) {
      t = [].concat(t);
      let r = t.length;
      while (r--) {
        const o = e[`on${t[r]}`];
        if (typeof o === 'function') {
          try {
            o.call(e, n || e);
          } catch (a) {
            u(a);
          }
        }
      }
    };


    const p = function (e) {
      if (
        /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
          e.type,
        )
      ) {
        return new Blob([String.fromCharCode(65279), e], { type: e.type });
      }
      return e;
    };


    const v = function (t, u, d) {
      if (!d) {
        t = p(t);
      }
      const v = this;


      const w = t.type;


      const m = w === s;


      let y;


      const h = function writestart() {
        l(v, 'writestart progress write writeend'.split(' '));
      };


      const S = function () {
        if ((f || (m && i)) && e.FileReader) {
          const r = new FileReader();
          r.onloadend = function () {
            let t = f
              ? r.result
              : r.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
            const n = e.open(t, '_blank');
            if (!n) e.location.href = t;
            t = undefined;
            v.readyState = v.DONE;
            h();
          };
          r.readAsDataURL(t);
          v.readyState = v.INIT;
          return;
        }
        if (!y) {
          y = n().createObjectURL(t);
        }
        if (m) {
          e.location.href = y;
        } else {
          const o = e.open(y, '_blank');
          if (!o) {
            e.location.href = y;
          }
        }
        v.readyState = v.DONE;
        h();
        c(y);
      };
      v.readyState = v.INIT;
      if (o) {
        y = n().createObjectURL(t);
        setTimeout(() => {
          r.href = y;
          r.download = u;
          a(r);
          h();
          c(y);
          v.readyState = v.DONE;
        });
        return;
      }
      S();
    };


    const w = v.prototype;


    const m = function (e, t, n) {
      return new v(e, t || e.name || 'download', n);
    };
    if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
      return function (e, t, n) {
        t = t || e.name || 'download';
        if (!n) {
          e = p(e);
        }
        return navigator.msSaveOrOpenBlob(e, t);
      };
    }
    w.abort = function () { };
    w.readyState = w.INIT = 0;
    w.WRITING = 1;
    w.DONE = 2;
    w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null;
    return m;
  }(
    (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || this.content,
  ));

if (typeof module !== 'undefined' && module.exports) {
  module.exports.saveAs = saveAs;
} else if (
  typeof define !== 'undefined'
  && define !== null
  && define.amd !== null
) {
  define('FileSaver.js', () => saveAs);
}
