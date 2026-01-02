import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
export let io: SocketIOServer;
import queueRoutes from "./server/routes/queue.js";
import { registerSocket } from "./server/socket/emitter.js";
import queueStateRoutes from "./server/routes/queueState.js";
import serveNextRoutes from "./server/routes/queueServeNext.js";
import removeRoutes from "./server/routes/queueRemove.js";
import adminLoginRoutes from "./server/routes/adminLogin.js"
import cookieParser from "cookie-parser";

const dev = process.env.NODE_ENV !== "production";
const app = (next as unknown as (opts: { dev: boolean }) => any)({ dev });
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
    expressApp.use((req, _res, next) => {
        console.log("➡️", req.method, req.url);
        next();
    });
    expressApp.use(cookieParser());
    expressApp.use("/api/admin", adminLoginRoutes)

    expressApp.use("/api/queue/serve-next", serveNextRoutes);
    expressApp.use("/api/queue/remove", removeRoutes);
    expressApp.use("/api/queue/state", queueStateRoutes);
    expressApp.use("/api/queue", queueRoutes);
    expressApp.use((req, res) => {
        // if (req.url.startsWith("/api/")) {
        //     return next();
        // }
        return handle(req, res);
    });

    httpServer.listen(PORT, () => {
        console.log(`> Server ready on http://localhost:${PORT}`);
    });
}

startServer();