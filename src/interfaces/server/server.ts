import type { ServerContext } from './context';

interface StaticServer {
  path: string;
}

interface ServerOptions {
  url: string;
  static?: StaticServer;
  init?: (context?: ServerContext) => Promise<void>;
}

export declare function Server(
  options: ServerOptions,
): (
  target: new (preset?: any) => object,
  context: ClassDecoratorContext,
) => void;
