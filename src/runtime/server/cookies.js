import { nullObject } from '#utils/native.js';

export class Cookies {
  constructor(context) {
    this.context = context;
  }

  get(name) {
    return this.data[name];
  }

  set(name, value, options) {
    this.data[name] &&= value;

    value = name + '=' + value;
    value += '; path=' + (options?.path || '/');

    if (options?.maxAge != null) {
      value += '; max-age=' + options.maxAge;
    } else if (options?.expires) {
      value += '; expires=' + options.expires.toGMTString();
    }

    if (options?.httpOnly) value += '; httponly';
    if (options?.sameSite) value += '; samesite=' + options.sameSite;

    this.context.set('set-cookie', value);
  }

  parse(text) {
    if (text) {
      this.data = Object.create(null);

      for (let vars = text.split(';'), i = 0; i < vars.length; i++) {
        const param = vars[i].split('=', 2);
        this.data[param[0].trim()] = param[1].trim();
      }
    }
  }
}

Cookies.prototype.data = nullObject;
