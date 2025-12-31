"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

const SHOP_ID = "test-shop";

type QueueEntry = {
    etaMinutes: number;
    id: string;
    name: string;
    position: number;
};

export default function DashboardPage() {
    const [queue, setQueue] = useState<QueueEntry[]>([]);

    async function serveNext() {
        await fetch(
            `http://localhost:3000/api/queue/serve-next/${SHOP_ID}`,
            { method: "POST" }
        );
    }

    async function loadInitialQueue() {
        const res = await fetch(
            `http://localhost:3000/api/queue/state/${SHOP_ID}`,
            { cache: "no-store" }
        );
        const data = await res.json();
        setQueue(data.queue);
    }

    async function removeUser(name: string) {
        await fetch(
            `http://localhost:3000/api/queue/remove/${SHOP_ID}/remove`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            }
        );
    }

    useEffect(() => {
        loadInitialQueue();
        const socket = getSocket();

        socket.on("queue:update", (data) => {
            if (data.shopId !== SHOP_ID) return;

            if (data.type === "SERVE_NEXT") {
                setQueue(data.queue);
                return;
            }
            if (data.type === "REMOVE") {
                setQueue(data.queue);
                return;
              }

            // Default: join event
            setQueue((prev) => {
                if (prev.find((e) => e.id === data.entry.id)) {
                    return prev;
                }
                return [...prev, data.entry].sort(
                    (a, b) => a.position - b.position
                );
            });
        });

        return () => {
            socket.off("queue:update");
        };
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={serveNext}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                >
                    Serve Next
                </button>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-gray-500">People in Queue</p>
                        <p className="text-2xl font-bold">{queue.length}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-gray-500">Current Token</p>
                        <p className="text-2xl font-bold">
                            {queue.length ? `#${queue[0].position}` : "—"}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                    <h2 className="text-xl font-semibold mb-4">Live Queue</h2>

                    {queue.length === 0 ? (
                        <p className="text-gray-400">No one in queue</p>
                    ) : (
                        <ul className="space-y-2">
                            {queue.map((entry) => (
                                <li
                                key={entry.id}
                                className="flex justify-between items-center border rounded-lg px-4 py-2"
                              >
                                <div>
                                  <div>
                                    #{entry.position} — {entry.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    ~{entry.etaMinutes ?? (entry.position - 1) * 4} min
                                  </div>
                                </div>
                              
                                <button
                                  onClick={() => removeUser(entry.name)}
                                  className="text-red-600 text-sm"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    );
}