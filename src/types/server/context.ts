interface CookieOptions{
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  sameSite?: 'None' | 'Lax' | 'Strict'
}

export declare class ContextRequest {
  status:number;
  connected:boolean;
  cookies:Map<string, string>;

  sql(strings: TemplateStringsArray, ...params: any[]): Promise<any>;


  sendHeader(name: string, value: string): void;
  sendCookie(name: string, value: string, options?: CookieOptions): void;
}
