interface ServerOptions {
  url: string;
}

export declare abstract class Server {
  static host: string;
  static port: number;

  static start(options: ServerOptions): Promise<void>;
}
