import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
export let io: SocketIOServer;
import queueRoutes from "./server/routes/queue.ts";
import { registerSocket } from "./server/socket/emitter.ts";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = 3000;

async function startServer() {
    await app.prepare();

    const expressApp = express();
    const httpServer = http.createServer(expressApp);

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
        },
    });
    registerSocket(io);

    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });

    expressApp.use(express.json());
    expressApp.use("/api/queue", queueRoutes);
    expressApp.use((req, res) => {
        return handle(req, res);
    });

    httpServer.listen(PORT, () => {
        console.log(`> Server ready on http://localhost:${PORT}`);
    });
}

startServer();