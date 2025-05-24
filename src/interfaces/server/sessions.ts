interface JwtOptions {
  secret: string;
  maxAge: number;
}

export declare function SessionJWT(
  options: JwtOptions,
): (target: new(preset?: any) => object, context: ClassDecoratorContext) => void;
