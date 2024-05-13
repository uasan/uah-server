import { Context } from '../context.js';
import { parseCookies, setCookie, deleteCookie } from './cookies.js';

export class ServerContext extends Context {
  connected = true;
  permission = null;

  request = {
    cookies: new Map(),
    headers: {
      range: '',
    },
  };

  response = {
    status: 0,
    headers: [],
    setCookie,
    deleteCookie,
  };

  onAborted() {}

  static create(req, res) {
    const context = new this();
    res.context = context;

    res.onAborted(() => {
      context.connected = false;
      context.onAborted();
    });

    parseCookies(context.request.cookies, req.getHeader('cookie'));

    context.request.headers.range = req.getHeader('range') ?? '';

    return context;
  }
}
