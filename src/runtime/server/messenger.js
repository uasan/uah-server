import { stringify } from '#utils/native.js';
import { Exception } from '#exceptions/Exception.js';
import { routes } from './constants.js';

const clients = new Map();

export const onMessage = async (ws, { id, method, params }) => {
  const { context } = ws;
  const route = routes.get(method);

  try {
    if (route) {
      await route.method(context, params, id);
    } else {
      context.body = stringify({
        id,
        status: 404,
        errors: [{ message: `Not found method ${method}` }],
      });
    }
  } catch (error) {
    Exception.respond(context, error, id);
  }

  if (id) {
    context.sendMessageToSocket(context.body);
  }
};

export function sendMessageToSocket(message) {
  if (this.isAborted === false)
    this.websocket.cork(() => {
      this.websocket.send(message);
    });
}

export function sendMessageToUser(uid, method, params) {
  if (clients.has(uid)) {
    const message = stringify({ method, params });

    for (const ws of clients.get(uid)) {
      ws.context.sendMessageToSocket(message);
    }
  }
}

export function sendMessageToChannel(name, method, params) {
  this.server.publish(name, stringify({ method, params }));
}

export function subscribeToChannel(name) {
  if (this.isAborted === false) this.websocket.subscribe(name);
}

export function unsubscribeFromChannel(name) {
  if (this.isAborted === false) this.websocket.unsubscribe(name);
}

export const onOpen = async ws => {
  const { context } = ws;
  const { uid } = context;

  context.websocket = ws;

  if (clients.has(uid)) clients.get(uid).add(ws);
  else clients.set(uid, new Set().add(ws));

  try {
    const response = await context.onOpenWebsocket(context);

    if (response != null) {
      context.sendMessageToSocket(stringify(response));
    }
  } catch (error) {
    console.error(error);
  }
};

export const onClose = async ws => {
  const { context } = ws;
  const { uid } = context;

  context.websocket = null;
  context.isAborted = true;

  if (clients.has(uid)) {
    const sockets = clients.get(uid);

    if (sockets.size === 1) clients.delete(uid);
    else if (sockets.size > 1) clients.get(uid).delete(ws);

    try {
      await context.onCloseWebsocket(context);
    } catch (error) {
      console.error(error);
    }
  }
};
