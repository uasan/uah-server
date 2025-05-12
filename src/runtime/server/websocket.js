import { Conflict } from '#runtime/exceptions/Conflict.js';
import { stringify } from '#runtime/types/json.js';
import { SHARED_COMPRESSOR } from 'uWebSockets.js';
import { Server } from './app.js';

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

function sendMessageToChannel(name, payload) {
  Server.instance.publish(name, stringify(payload));
}

class SocketStore {
  message = null;
  channels = new Set();

  send(payload, isBinary) {
    this.message = { isBinary, payload };
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
  const meta = { context, sid: undefined, uid: undefined };

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
    const { message, channels } = ws.context.socket;
    ws.context.socket = ws;

    if (channels.size) {
      for (const name of channels) {
        ws.subscribe(name);
      }
    }

    if (message) {
      ws.send(message.payload, message.isBinary);
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

function onMessage(ws, message) {
  // try {
  //   onMessage(ws, parse(textDecoder.decode(new Uint8Array(message))));
  // } catch (error) {
  //   ws.end(400, error?.message);
  // }
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
    message: onMessage.bind(ctor),
    close: onClose.bind(ctor),
  };
}
