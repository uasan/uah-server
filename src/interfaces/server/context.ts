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

interface User {
  id: bigint;
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

export declare abstract class ServerContext extends Context {
  connected: boolean;

  abstract auth(): Promise<void>;

  user: User;
  request: Request;
  response: Response;

  subscribeToChannel(name: string): void;

  static sendMessageToChannel(name: string, payload: any): void;
  static sendMessageToUser(uid: string | number | bigint, payload: any): void;
}
