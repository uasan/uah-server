import {
  App,
  us_listen_socket_close,
  LIBUS_LISTEN_EXCLUSIVE_PORT,
} from 'uWebSockets.js';

import { onAborted } from '#utils/process.js';
import { green, red } from '#utils/console.js';

import { port } from './constants.js';
import { Context } from './context.js';
import { bindEndpoints } from './router.js';
import { loadServices } from './services.js';
import { noop } from '#utils/native.js';

export const startServer = async ({ services, websocket } = {}) => {
  const server = App();
  const context = Context.init({
    server,
    onOpenWebsocket: websocket?.onOpen ?? noop,
    onCloseWebsocket: websocket?.onClose ?? noop,
  });

  await bindEndpoints(server);
  await loadServices(context, services);

  await new Promise((resolve, reject) => {
    server.listen(port, LIBUS_LISTEN_EXCLUSIVE_PORT, token => {
      if (token) {
        onAborted(() => {
          us_listen_socket_close(token);
        });
        console.info(green('Server listen on port ') + port);
        resolve();
      } else {
        reject(new Error(red('Server listen on port ' + port)));
      }
    });
  });
};
