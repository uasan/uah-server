import { Context } from '../context';

export interface CookieOptions {
  name: string;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  partitioned?: boolean;
  sameSite?: 'None' | 'Lax' | 'Strict';
}

type ID = string | number | bigint;

interface User {
  id: ID;
}

interface Request {
  cookies: Map<string, string>;
}

interface Response {
  status: number;
  headers: [string, string];
  setCookie(options: CookieOptions, value: string): void;
  deleteCookie(options: CookieOptions): void;
}

interface Server {
  start(): Promise<void>;
}

export declare abstract class ServerContext extends Context {
  isConnected: boolean;

  abstract auth(): Promise<void>;

  user: User;
  request: Request;
  response: Response;

  subscribeToChannel(name: string): void;
  unsubscribeFromChannel(name: string): void;
  sendMessageToSocket(payload: any, isBinary?: boolean): boolean;

  static server: Server;
  static sendMessageToUser(uid: ID, payload: any): boolean;
  static sendMessageToSocket(sid: ID, payload: any): boolean;
  static sendMessageToChannel(name: string, payload: any): boolean;
}
