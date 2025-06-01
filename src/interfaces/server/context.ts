import { Context } from '../context.ts';
import type { SchedulerContext } from '../services/scheduler.ts';

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
  [key: string]: any;
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

  request: Request;
  response: Response;

  auth(): Promise<void>;
  createSession(user: User): Promise<void>;
  deleteSession(): Promise<void>;

  subscribeToChannel(name: string): void;
  unsubscribeFromChannel(name: string): void;
  sendMessageToSocket(payload: any, isBinary?: boolean): boolean;

  static server: Server;
  static services: Record<string, SchedulerContext>;

  static sendMessageToUser(uid: ID, payload: any): boolean;
  static sendMessageToSocket(sid: ID, payload: any): boolean;
  static sendMessageToChannel(name: string, payload: any): boolean;
}
