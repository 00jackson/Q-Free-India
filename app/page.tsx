"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

const SHOP_ID = "test-shop";

export default function HomePage() {
  const [name, setName] = useState("");
  const [updates, setUpdates] = useState<any[]>([]);
  const [myToken, setMyToken] = useState<number | null>(null);
  const [myEta, setMyEta] = useState<number | null>(null);
  const myNameRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on("queue:update", (data) => {
      if (data.shopId !== SHOP_ID) return;

      if (data.type === "JOIN") {
        setUpdates((prev) => [...prev, data.entry]);

        if (data.entry.name === myNameRef.current) {
          setMyToken(data.entry.position);
          setMyEta(data.etaMinutes);
        }
      }

      if (data.type === "SERVE_NEXT") {
        const updated = data.queue.find(
          (q) => q.name === myNameRef.current
        );
        if (updated) {
          setMyToken(updated.position);
          setMyEta(updated.etaMinutes);
        }
      }
    });

    return () => {
      socket.off("queue:update");
    };
  }, []);

  async function joinQueue() {
    if (!name) return;
    myNameRef.current = name;

    await fetch("http://localhost:3000/api/queue/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        shopId: SHOP_ID,
      }),
    });

    setName("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Q-India</h1>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          onClick={joinQueue}
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          Join Queue
        </button>
        
        {myToken && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Your Token</p>
            <p className="text-3xl font-bold">#{myToken}</p>

            <p className="mt-2 text-sm text-gray-500">Estimated Wait</p>
            <p className="text-lg font-semibold">
              ~{myEta} minutes
            </p>
          </div>
        )}


        <div className="pt-4">
          <h2 className="font-semibold mb-2">Live Queue Updates</h2>
          <ul className="space-y-1 text-sm">
            {updates.map((u, i) => (
              <li key={i}>
                #{u.position} — {u.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}