import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

async function startServer() {
  await app.prepare();

  const expressApp = express();
  const httpServer = http.createServer(expressApp);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  expressApp.use((req, res) => {
    return handle(req, res);
  });
  
  httpServer.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
}

startServer();