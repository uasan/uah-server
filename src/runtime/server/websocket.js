import { SHARED_COMPRESSOR } from 'uWebSockets.js';
import { authorize } from '#security/auth/authorize.js';
import { parse } from '#utils/native.js';

import { setContext } from './handler.js';
import { createContext } from './request.js';
import { onOpen, onMessage, onClose } from './messenger.js';

export const websocket = {
  idleTimeout: 960,
  sendPingsAutomatically: true,
  compression: SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,

  upgrade: async (res, req, ctx) => {
    const context = createContext(req, res);

    const secWebSocketKey = req.getHeader('sec-websocket-key');
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');

    try {
      await authorize(setContext(context));
    } catch (error) {
      context.uid = '';
      context.body = error?.message;
      context.status = error?.status;
    }

    if (context.isAborted === false) {
      context.cookies = null;
      context.response = null;

      res.upgrade(
        { context },
        secWebSocketKey,
        secWebSocketProtocol,
        secWebSocketExtensions,
        ctx
      );
    }
  },

  open: ws => {
    if (ws.context.uid) {
      onOpen(ws);
    } else if (ws.context.body) {
      ws.end(ws.context.status, ws.context.body);
    } else {
      ws.end(401);
    }
  },

  message: (ws, message) => {
    try {
      onMessage(ws, parse(Buffer.from(message)));
    } catch (error) {
      ws.end(400, error?.message);
    }
  },

  close: onClose,
};
