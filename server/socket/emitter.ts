import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function registerSocket(server: SocketIOServer) {
  io = server;
}

export function emitQueueUpdate(payload: any) {
  if (!io) {
    console.warn("Socket.io not initialized yet");
    return;
  }

  io.emit("queue:update", payload);
}