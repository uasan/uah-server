interface SocketIdentifier {
  sid?: number | bigint | string;
  uid?: number | bigint | string;
}

export interface WebSocket {
  onOpen(): Promise<void>;
  onMessage(): Promise<void>;
  onClose(): Promise<void>;
}

export interface WebSocketRPC {
  onOpen(payload?: unknown): Promise<SocketIdentifier | void>;
  onClose(): Promise<void>;
}
