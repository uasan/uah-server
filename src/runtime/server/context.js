import { setCookie } from './cookies.js';

export class RequestContext {
  status = 0;
  headers = [];
  cookies = new Map();
  connected = true;

  sendHeader(name, value) {
    this.headers.push(name, value);
  }

  sendCookie(name, value, options) {
    this.headers.push('set-cookie', setCookie(name, value, options));
  }
}
