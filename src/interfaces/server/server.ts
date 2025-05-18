interface ServerOptions {
  url: string;
}

export declare function Server(
  options: ServerOptions,
): (target: new(preset?: any) => object, context: ClassDecoratorContext) => void;
