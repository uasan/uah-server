import { Conflict } from '#runtime/exceptions/Conflict.js';
import { hasOwn, isObject } from '#runtime/types/checker.js';
import { parse, stringify } from '#runtime/types/json.js';
import { textDecoder } from '#runtime/types/text.js';
import { SHARED_COMPRESSOR } from 'uWebSockets.js';

function sendMessageToSocket(id, payload) {
  if (this.sockets.has(id)) {
    this.sockets.get(id).send(stringify(payload));
    return true;
  } else {
    return false;
  }
}

function sendMessageToUser(id, payload) {
  if (this.users.has(id)) {
    const data = stringify(payload);

    for (const ws of this.users.get(id)) {
      ws.send(data);
    }
    return true;
  } else {
    return false;
  }
}

function sendMessage(payload) {
  this.cork(() => {
    this.send(stringify(payload));
  });
}

function sendMessageToChannel(name, payload) {
  this.server.app.publish(name, stringify(payload));
}

class SocketStore {
  messages = [];
  channels = new Set();

  sendMessage(payload) {
    this.messages.push(stringify(payload));
  }

  subscribe(name) {
    this.channels.add(name);
  }

  unsubscribe(name) {
    this.channels.delete(name);
  }
}

async function upgrade(res, req, ctx) {
  const context = this.create(req, res);
  const meta = { context, sendMessage, sid: undefined, uid: undefined };

  const secWebSocketKey = req.getHeader('sec-websocket-key');
  const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
  const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');

  context.socket = new SocketStore();

  try {
    const payload = this.getPayload?.(req);

    await context.auth();
    const result = await context.onOpen(payload);

    if (result?.sid) {
      meta.sid = result.sid;
    }
    if (result?.uid) {
      meta.uid = result.uid;
    }
  } catch (error) {
    context.error = error || { status: 400, message: 'Cancel' };
  }

  if (context.isConnected) {
    context.request = null;
    context.response = null;

    res.cork(() => {
      res.upgrade(meta, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, ctx);
    });
  }
}

function onOpen(ws) {
  if (ws.context.error) {
    ws.end(ws.context.error.status || 500, String(ws.context.error.message || ''));
  } else {
    const { messages, channels } = ws.context.socket;
    ws.context.socket = ws;

    if (channels.size) {
      for (const name of channels) {
        ws.subscribe(name);
      }
    }

    if (messages.length) {
      for (const message of messages) {
        ws.send(message);
      }
    }

    if (ws.sid) {
      if (this.sockets.has(ws.sid)) {
        const error = new Conflict(`Duplicate socket id "${ws.sid}"`);

        ws.end(error.status, error.message);
        console.error(error);

        return;
      } else {
        this.sockets.set(ws.sid, ws);
      }
    }

    if (ws.uid) {
      if (this.users.has(ws.uid)) {
        this.users.get(ws.uid).add(ws);
      } else {
        this.users.set(ws.uid, new Set().add(ws));
      }
    }
  }
}

async function onMessage(ws, buffer) {
  let id = 0;

  try {
    const data = parse(textDecoder.decode(new Uint8Array(buffer)));

    id = data?.id;

    if (hasOwn(ws.context.methods, data?.method)) {
      const result = await ws.context.methods[data.method](Object.create(ws.context), data.params);

      if (id && ws.context.isConnected) {
        ws.sendMessage({ id, result });
      }
    }
  } catch (error) {
    if (error) {
      if (isObject(error) === false) {
        error = { type: 'Error', message: error };
      }

      const status = error.status || 500;
      const type = error.type || error.constructor?.name || 'Error';

      if (ws.context.isConnected) {
        if (id) {
          ws.sendMessage({ id, error: { status, type, message: error.message, ...error } });
        } else {
          ws.end(status, error.message);
        }
      }

      if (status === 500) {
        console.error(error);
      }
    } else if (id && ws.context.isConnected) {
      ws.sendMessage({ id });
    }
  }
}

async function onClose(ws) {
  ws.context.socket = null;
  ws.context.isConnected = false;

  if (ws.sid) {
    this.sockets.delete(ws.sid);
  }

  if (ws.uid) {
    const users = this.users.get(ws.uid);

    if (users) {
      if (users.size > 1) {
        users.delete(ws);
      } else {
        this.users.delete(ws.uid);
      }
    }
  }

  try {
    await ws.context.onClose();
  } catch (error) {
    console.error(error);
  }
}

export function createWebSocketRPC(ctor) {
  ctor.sendMessageToUser = sendMessageToUser;
  ctor.sendMessageToSocket = sendMessageToSocket;
  ctor.sendMessageToChannel = sendMessageToChannel;

  return {
    idleTimeout: 960,
    sendPingsAutomatically: true,
    compression: SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,

    upgrade: upgrade.bind(ctor),
    open: onOpen.bind(ctor),
    message: onMessage,
    close: onClose.bind(ctor),
  };
}
