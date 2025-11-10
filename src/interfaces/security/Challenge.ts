import { ServerContext } from '../server/context.ts';

export declare class Challenge {
  static create(context: ServerContext): Promise<Uint8Array>;

  static verify(context: ServerContext, value: Uint8Array): Promise<void>;

  static verifyFromJSON(
    context: ServerContext,
    json: Uint8Array,
  ): Promise<void>;
}
