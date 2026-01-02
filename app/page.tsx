"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Users, Clock, AlertCircle, CheckCircle } from "lucide-react";

const SHOP_ID = "test-shop";

export default function HomePage() {
  const [name, setName] = useState("");
  const [updates, setUpdates] = useState<any[]>([]);
  const [myToken, setMyToken] = useState<number | null>(null);
  const [myEta, setMyEta] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const myNameRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on("queue:update", (data) => {
      if (data.shopId !== SHOP_ID) return;

      if (data.type === "JOIN") {
        setUpdates((prev) => [...prev.slice(-4), data.entry]);

        if (data.entry.name === myNameRef.current) {
          setMyToken(data.entry.position);
          setMyEta(data.etaMinutes);
          setIsJoining(false);
        }
      }

      if (data.type === "SERVE_NEXT") {
        const updated = data.queue.find(
          (q: { name: string | null; }) => q.name === myNameRef.current
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
    if (!name.trim()) return;
    
    myNameRef.current = name.trim();
    setIsJoining(true);

    try {
      await fetch("http://localhost:3000/api/queue/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          shopId: SHOP_ID,
        }),
      });
    } catch (error) {
      setIsJoining(false);
      console.error("Failed to join queue:", error);
    }

    setName("");
  }

  // Calculate queue position status
  const getPositionStatus = () => {
    if (!myToken) return null;
    return Math.max(0, myToken - 1);
  };

  const queue = getPositionStatus();

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md lg:max-w-lg bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md border border-gray-100">
        {/* Header - Minimal and Clean */}
        <div className="px-4 md:px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 md:h-14 md:w-14 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center mb-3">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">Q-Free India</h1>
            <p className="text-gray-600 mt-1 text-center text-sm md:text-base">
              Virtual Queue System
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Join Queue Section - Clean and Simple */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Join the Queue
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1 text-sm md:text-base">
                  Your Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg md:rounded-xl px-4 py-3 md:py-3.5 text-base transition-all duration-150"
                  onKeyDown={(e) => e.key === "Enter" && joinQueue()}
                  disabled={isJoining}
                />
              </div>

              <button
                onClick={joinQueue}
                disabled={!name.trim() || isJoining}
                className={`w-full py-3 md:py-3.5 rounded-lg md:rounded-xl font-medium text-base md:text-lg transition-all ${
                  !name.trim() || isJoining
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
                }`}
              >
                {isJoining ? (
                  <span className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Joining...
                  </span>
                ) : (
                  "Join Queue"
                )}
              </button>
              
              <div className="flex items-start text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>No login required. Your token number will appear immediately.</span>
              </div>
            </div>
          </div>

          {/* Token Display - Large and Clear */}
          {myToken && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg md:rounded-xl p-4 md:p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Your Token Number</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">#{myToken}</span>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-3 md:p-4">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    <span className="text-sm md:text-base">Estimated Wait</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {myEta} <span className="text-gray-600 text-base md:text-lg">min</span>
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 md:p-4">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    <span className="text-sm md:text-base">Ahead of You</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {queue !== null ? queue : "—"}
                  </p>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="mt-4 md:mt-5">
                <div className="flex justify-between text-gray-600 mb-1 text-sm md:text-base">
                  <span>Your Position</span>
                  <span className="font-medium">#{myToken}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: queue && myEta 
                        ? `${Math.max(10, 100 - (queue / (queue + 5)) * 100)}%` 
                        : "10%"
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Live Updates - Clean List */}
          <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl overflow-hidden">
            <div className="px-4 md:px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                Live Queue Updates
                <span className="ml-auto text-sm font-medium text-gray-600">
                  {myToken ? myToken : 0} in queue
                </span>
              </h2>
            </div>
            
            {updates.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-60 md:max-h-64 overflow-y-auto">
                {updates.map((u, i) => (
                  <div 
                    key={i} 
                    className={`px-4 md:px-5 py-3 md:py-3.5 ${
                      u.name === myNameRef.current 
                        ? "bg-blue-50" 
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 md:h-11 md:w-11 rounded-lg bg-gray-100 flex items-center justify-center mr-3 md:mr-4">
                        <span className="font-bold text-gray-700 text-base md:text-lg">#{u.position}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-base md:text-lg">{u.name}</p>
                        <p className="text-gray-500 text-sm">Joined recently</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 md:px-5 py-8 md:py-10 text-center">
                <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gray-100 mb-3 md:mb-4">
                  <Users className="h-6 w-6 md:h-7 md:w-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Waiting for queue activity...</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to join!</p>
              </div>
            )}
          </div>

          {/* Footer - Minimal */}
          <div className="text-center pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-3">
              <span className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                Real-time updates
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Works on 2G/3G</span>
              <span className="hidden sm:inline">•</span>
              <span>Instant token</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}