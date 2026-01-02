

"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket: any;

export default function DashboardClient() {
  const [queue, setQueue] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket = io();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("queue:update", (data: { queue: string[] }) => {
      setQueue(data.queue);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function serveNext() {
    await fetch("/api/queue/serve-next/test-shop", { method: "POST" });
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <p className="mb-2">
        Socket status: {connected ? "Connected" : "Disconnected"}
      </p>

      <button
        onClick={serveNext}
        className="bg-black text-white px-4 py-2 mb-4"
      >
        Serve Next
      </button>

      <ul className="space-y-2">
        {queue.map((name, i) => (
          <li key={i} className="border p-2">
            {i + 1}. {name}
          </li>
        ))}
      </ul>
    </div>
  );
}