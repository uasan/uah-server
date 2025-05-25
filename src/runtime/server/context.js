import { Exception } from '#runtime/exceptions/Exception.js';
import { Context } from '../context.js';
import { noop } from '../utils/native.js';
import { deleteCookie, parseCookies, setCookie } from './cookies.js';

export class ServerContext extends Context {
  isConnected = true;

  user = null;
  socket = null;
  session = null;
  permission = null;

  request = {
    cookies: new Map(),
    headers: {
      etag: '',
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

  auth() {
    throw new Exception('Not implemented auth method');
  }

  createSession() {
    throw new Exception('Not implemented create session');
  }

  deleteSession() {
    throw new Exception('Not implemented delete session');
  }

  sendMessageToSocket(payload) {
    if (this.socket) {
      return this.socket.sendMessage(payload);
    } else {
      throw new Exception('Not implemented send message to socket');
    }
  }

  subscribeToChannel(name) {
    if (this.socket) {
      return this.socket.subscribe(name);
    } else {
      throw new Exception('Not implemented subscribe to channel');
    }
  }

  unsubscribeFromChannel(name) {
    if (this.socket) {
      return this.socket.unsubscribe(name);
    } else {
      throw new Exception('Not implemented unsubscribe from channel');
    }
  }

  static sendMessageToSocket() {
    throw new Exception('Not implemented send message to socket');
  }

  static sendMessageToUser() {
    throw new Exception('Not implemented send message to user');
  }

  static sendMessageToChannel() {
    throw new Exception('Not implemented send message to channel');
  }

  static getParamsOfRoute = noop;

  static create(req, res) {
    try {
      const context = this.getParamsOfRoute === noop ? new this() : new this(this.getParamsOfRoute(req));
      res.context = context;

      res.onAborted(() => {
        context.isConnected = false;
        context.onAborted();
      });

      parseCookies(context.request.cookies, req.getHeader('cookie'));

      context.request.headers.range = req.getHeader('range') ?? '';

      return context;
    } catch (error) {
      res.context = { isConnected: true };
      throw error;
    }
  }
}
