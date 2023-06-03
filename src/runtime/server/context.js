import { presets } from '#env';
import { Cookies } from './cookies.js';
import { noop } from '#utils/native.js';
import { setDataBaseContext } from '#db/context.js';
import { respond, respondStream } from './response.js';
import { setSecurityContext } from '#security/context.js';
import { factory } from '#db/sql/query.js';
import {
  sendMessageToChannel,
  sendMessageToSocket,
  sendMessageToUser,
  subscribeToChannel,
  unsubscribeFromChannel,
} from './messenger.js';

export class Context {
  sql = factory(this);

  headers = [];
  cookies = new Cookies(this);

  set(name, value) {
    this.headers.push(name.toLowerCase(), value);
  }

  static init(params) {
    const context = Object.assign(this.prototype, params);

    context.language = context.lang = presets.language;
    context.defaultLanguage = presets.language;

    context.languages = presets.languages;

    setDataBaseContext(context);
    setSecurityContext(context);

    return context;
  }
}

Context.prototype.type = '';
Context.prototype.status = 204;
Context.prototype.route = null;
Context.prototype.body = null;
Context.prototype.error = null;
Context.prototype.stream = null;
Context.prototype.payload = null;
Context.prototype.service = null;
Context.prototype.request = null;
Context.prototype.response = null;

Context.prototype.path = '';

Context.prototype.lang = '';
Context.prototype.language = '';
Context.prototype.isMultiLang = false;

Context.prototype.isAborted = false;
Context.prototype.onAborted = noop;
Context.prototype.respond = respond;
Context.prototype.respondStream = respondStream;

Context.prototype.websocket = null;
Context.prototype.onOpenWebsocket = noop;
Context.prototype.onCloseWebsocket = noop;
Context.prototype.sendMessageToUser = sendMessageToUser;
Context.prototype.sendMessageToSocket = sendMessageToSocket;
Context.prototype.sendMessageToChannel = sendMessageToChannel;
Context.prototype.subscribeToChannel = subscribeToChannel;
Context.prototype.unsubscribeFromChannel = unsubscribeFromChannel;
