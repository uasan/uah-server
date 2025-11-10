import type { CookieOptions } from '../context.ts';

interface JwtOptions {
  secret: string;
  maxAge: number;
  algorithm?: 'HS256' | 'HS384' | 'HS512';
  cookies?: {
    uid: CookieOptions;
    jwt: CookieOptions;
  };
}

export declare function SessionJWT(
  options: JwtOptions,
): (
  target: new (preset?: any) => object,
  context: ClassDecoratorContext,
) => void;
