import type { ServerContext } from './context.ts';

export interface WebSocket {
  onOpen(): Promise<void>;
  onMessage(): Promise<void>;
  onClose(): Promise<void>;
}

type MethodsRPC = Record<string, (context: ServerContext, payload?: unknown) => Promise<unknown>>;

export interface WebSocketRPC {
  methods: MethodsRPC;

  onOpen(): Promise<void>;
  onClose(): Promise<void>;
}
