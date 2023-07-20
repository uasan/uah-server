import { Context } from '../context';

interface CookieOptions {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  sameSite?: 'None' | 'Lax' | 'Strict';
}

export declare abstract class RequestContext extends Context {
  status: number;
  connected: boolean;
  cookies: Map<string, string>;

  setHeader(name: string, value: string): void;
  setCookie(name: string, value: string, options?: CookieOptions): void;
}
