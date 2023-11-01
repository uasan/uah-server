import { Context } from '../context.js';
import { parseCookies, setCookie } from './cookies.js';

export class ServerContext extends Context {
  status = 0;
  headers = [];
  cookies = new Map();
  connected = true;
  permission = null;
  request = {
    headers: {
      etag: '',
      range: '',
    },
  };

  setHeader(name, value) {
    this.headers.push(name, value);
  }

  setCookie(name, value, options) {
    this.headers.push('set-cookie', setCookie(name, value, options));
  }

  onAborted() {}

  static create(req, res) {
    const context = new this();
    res.context = context;

    res.onAborted(() => {
      context.connected = false;
      context.onAborted();
    });

    parseCookies(context.cookies, req.getHeader('cookie'));

    context.request.headers.etag = req.getHeader('etag') ?? '';
    context.request.headers.range = req.getHeader('range') ?? '';

    return context;
  }
}
