import { Router } from './router.js';

const arrayFreezed = Object.freeze([]);

export class ContextRequest {
  static router = Router;

  cookies = null;
  headers = null;
  connected = true;

  setHeader(name, value) {
    if (this.headers) {
      this.headers.push(name, value);
    } else {
      this.headers = [name, value];
    }
  }

  setCookie(name, value, options) {
    value = name + '=' + value;
    value += '; path=' + (options?.path || '/');

    if (options?.maxAge != null) {
      value += '; max-age=' + options.maxAge;
    } else if (options?.expires) {
      value += '; expires=' + options.expires.toGMTString();
    }

    if (options?.httpOnly) value += '; httponly';
    if (options?.sameSite) value += '; samesite=' + options.sameSite;

    this.setHeader('set-cookie', value);
  }

  static request(req, res) {
    const context = new this();

    res.onAborted(() => {
      context.connected = false;
    });

    return context;
  }
}
