import { setCookie } from './cookies.js';
import { createContext } from './request.js';
import { Router } from './router.js';

const arrayFreezed = Object.freeze([]);

export class ContextRequest {
  static router = Router;

  status = 0;
  headers = null;
  cookies = new Map();
  connected = true;

  sendHeader(name, value) {
    if (this.headers === null) this.headers = [name, value];
    else this.headers.push(name, value);
  }

  sendCookie(name, value, options) {
    this.sendHeader('set-cookie', setCookie(name, value, options));
  }

  static request(req, res) {
    return createContext(this, req, res);
  }
}
