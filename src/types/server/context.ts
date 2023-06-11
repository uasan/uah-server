interface CookieOptions{
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  sameSite?: 'None' | 'Lax' | 'Strict'
}

export declare class ContextRequest {
  sql(strings: TemplateStringsArray, ...params: any[]): Promise<any>;


  setHeader(name: string, value: string): void;
  setCookie(name: string, value: string, options?: CookieOptions): void;
}
