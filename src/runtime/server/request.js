import { parseCookies } from './cookies.js';

export const connections = new Set();

export function createContext(classContext, req, res) {
  const context = new classContext();

  connections.add(res);

  res.onAborted(() => {
    connections.delete(res);
    context.connected = false;
  });

  parseCookies(context.cookies, req.getHeader('cookie'));

  return context;
}
