interface ServerOptions {
  url: string;
}

export declare class Server {
  static host: string;
  static port: number;

  static start(options: ServerOptions): Promise<void>;
}
