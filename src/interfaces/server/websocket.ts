type SocketId = number | bigint | string;

export interface WebSocket {
  onOpen(): Promise<void | SocketId>;
  onMessage(): Promise<void>;
  onClose(): Promise<void>;
}

export interface WebSocketRPC {
  onOpen(payload?: unknown): Promise<void | SocketId>;
  onClose(): Promise<void>;
}
