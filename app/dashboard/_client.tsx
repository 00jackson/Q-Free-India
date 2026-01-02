"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Users, Clock, ArrowRight, Trash2, RefreshCw, LogOut } from "lucide-react";

const SHOP_ID = "test-shop";

let socket: any;

type QueueEntry = {
  id: string;
  name: string;
  position: number;
  etaMinutes?: number;
};

export default function DashboardClient() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isServing, setIsServing] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: string; time: Date } | null>(null);

  async function loadInitialQueue() {
    const res = await fetch(`/api/queue/state/${SHOP_ID}`, { cache: "no-store" });
    const data = await res.json();
    setQueue(data.queue);
  }

  async function serveNext() {
    setIsServing(true);
    try {
      await fetch(`/api/queue/serve-next/${SHOP_ID}`, { method: "POST" });
      setLastAction({ type: "SERVE_NEXT", time: new Date() });
    } finally {
      setIsServing(false);
    }
  }

  async function removeUser(name: string) {
    await fetch(`/api/queue/remove/${SHOP_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLastAction({ type: "REMOVE", time: new Date() });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  }

  useEffect(() => {
    loadInitialQueue();
    socket = io();

    socket.on("connect", () => {
      loadInitialQueue();
    });

    socket.on("queue:update", (data: any) => {
      if (data.shopId !== SHOP_ID) return;

      // Full queue sync (serve / remove / skip)
      if (Array.isArray(data.queue)) {
        setQueue(data.queue);
        return;
      }

      // Single entry added (join)
      if (data.entry) {
        setQueue((prev) => {
          if (prev.find((e) => e.id === data.entry.id)) return prev;
          return [...prev, data.entry].sort((a, b) => a.position - b.position);
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const averageWaitTime = queue.length
    ? Math.round(queue.reduce((sum, e) => sum + (e.etaMinutes ?? (e.position - 1) * 4), 0) / queue.length)
    : 0;

  return (
    <main className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header - Clean and Simple */}
        <div className="bg-white border-b border-gray-200 pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Queue Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Dr. Sharma Clinic • Real-time management
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadInitialQueue}
                className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm md:text-base"
              >
                <RefreshCw className="h-4 w-4 md:h-5 md:w-5 mr-2" /> 
                <span className="hidden md:inline">Refresh</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors text-sm md:text-base"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Action Card - Serve Next */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg md:rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
            Next Customer
          </h2>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              {queue.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3 md:mr-4">
                      <span className="font-bold text-blue-700 text-lg md:text-xl">#{queue[0].position}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-base md:text-lg">{queue[0].name}</p>
                      <p className="text-gray-600 text-sm md:text-base">
                        <Clock className="inline h-3 w-3 md:h-4 md:w-4 mr-1" />
                        ~{queue[0].etaMinutes ?? (queue[0].position - 1) * 4} min wait
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-base md:text-lg">No customers waiting</p>
              )}
            </div>
            
            <button
              onClick={serveNext}
              disabled={isServing || queue.length === 0}
              className={`py-3 md:py-4 px-6 rounded-lg md:rounded-xl font-medium text-base md:text-lg transition-colors min-w-[140px] md:min-w-[160px] ${
                queue.length === 0 || isServing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
              }`}
            >
              {isServing ? (
                <span className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Serving...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Serve Next
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid - Simple and Clear */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6">
            <div className="flex items-center mb-2 md:mb-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-3 md:mr-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm md:text-base">People in Queue</p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{queue.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6">
            <div className="flex items-center mb-2 md:mb-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-3 md:mr-4">
                <span className="font-bold text-blue-700 text-xl md:text-2xl">#{queue[0]?.position || "—"}</span>
              </div>
              <div>
                <p className="text-gray-600 text-sm md:text-base">Current Token</p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">
                  {queue.length ? queue[0].position : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6">
            <div className="flex items-center mb-2 md:mb-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-100 flex items-center justify-center mr-3 md:mr-4">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm md:text-base">Avg Wait Time</p>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">
                  {averageWaitTime} <span className="text-gray-600 text-lg">min</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue List - Clean and Readable */}
        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Current Queue <span className="text-gray-600 font-normal">({queue.length})</span>
              </h2>
              {lastAction && (
                <p className="text-gray-500 text-sm mt-1 sm:mt-0">
                  Last: {lastAction.type.toLowerCase().replace('_', ' ')} • {lastAction.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              )}
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="px-4 md:px-6 py-8 md:py-12 text-center">
              <div className="inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-base md:text-lg">Queue is empty</p>
              <p className="text-gray-400 text-sm md:text-base mt-1">Waiting for customers to join...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {queue.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`px-4 md:px-6 py-3 md:py-4 ${
                    index === 0 ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className={`h-12 w-12 md:h-14 md:w-14 rounded-lg flex items-center justify-center ${
                        index === 0 
                          ? 'bg-blue-100 border border-blue-200' 
                          : 'bg-gray-100'
                      }`}>
                        <span className={`font-bold text-xl md:text-2xl ${
                          index === 0 ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          #{entry.position}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-base md:text-lg">{entry.name}</p>
                        <div className="flex items-center text-gray-600 text-sm md:text-base">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          <span>~{entry.etaMinutes ?? (entry.position - 1) * 4} min wait</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeUser(entry.name)}
                      className="flex items-center text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      aria-label={`Remove ${entry.name}`}
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="hidden md:inline ml-2 text-sm">Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-3 md:mb-0">
              <div className="flex items-center text-gray-700">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm md:text-base font-medium">System Status</span>
              </div>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                Real-time updates active • Connected to queue server
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-gray-600 text-sm md:text-base">
                Total wait time: <span className="font-medium">{queue.reduce((sum, entry) => sum + (entry.etaMinutes ?? (entry.position - 1) * 4), 0)} min</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}