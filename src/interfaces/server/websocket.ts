export interface WebSocket {
  onOpen(): Promise<void>;
  onMessage(): Promise<void>;
  onClose(): Promise<void>;
}

export interface WebSocketRPC {
  onOpen(payload?: unknown): Promise<number | bigint | string | void>;
  onClose(): Promise<void>;
}
