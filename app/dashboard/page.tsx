"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Users, Ticket, Clock, ArrowRight, Trash2, AlertCircle, BarChart3, RefreshCw } from "lucide-react";

const SHOP_ID = "test-shop";

type QueueEntry = {
    etaMinutes: number;
    id: string;
    name: string;
    position: number;
};

export default function DashboardPage() {
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [isServing, setIsServing] = useState(false);
    const [lastAction, setLastAction] = useState<{type: string, time: Date} | null>(null);

    async function serveNext() {
        setIsServing(true);
        try {
            await fetch(
                `http://localhost:3000/api/queue/serve-next/${SHOP_ID}`,
                { method: "POST" }
            );
            setLastAction({type: "SERVE_NEXT", time: new Date()});
        } catch (error) {
            console.error("Failed to serve next:", error);
        } finally {
            setIsServing(false);
        }
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
        setLastAction({type: "REMOVE", time: new Date()});
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

    // Calculate statistics
    const averageWaitTime = queue.length > 0 
        ? Math.round(queue.reduce((sum, entry) => sum + (entry.etaMinutes || (entry.position - 1) * 4), 0) / queue.length)
        : 0;

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Queue Dashboard</h1>
                            <p className="text-blue-100 mt-2 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Real-time management for Dr. Sharma Clinic
                            </p>
                        </div>
                        <button 
                            onClick={() => loadInitialQueue()}
                            className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Serve Next Button - Prominent Card */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
                            Serve Next Customer
                        </h3>
                        <button
                            onClick={serveNext}
                            disabled={isServing || queue.length === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                                queue.length === 0 || isServing
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                            }`}
                        >
                            {isServing ? (
                                <span className="flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <ArrowRight className="h-6 w-6 mr-2" />
                                    SERVE NEXT CUSTOMER
                                </span>
                            )}
                        </button>
                        <p className="text-sm text-gray-500 mt-3">
                            {queue.length > 0 
                                ? `Next: #${queue[0]?.position} ${queue[0]?.name}`
                                : "No customers waiting"}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                LIVE
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">People in Queue</p>
                        <p className="text-4xl font-bold text-gray-900 mt-1">{queue.length}</p>
                        <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, queue.length * 10)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <Ticket className="h-6 w-6 text-indigo-600" />
                            </div>
                            <span className="text-xs font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                CURRENT
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Current Token</p>
                        <p className="text-4xl font-bold text-gray-900 mt-1">
                            {queue.length ? `#${queue[0].position}` : "—"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {queue.length > 1 
                                ? `Next: #${queue[1]?.position}`
                                : "No next customer"}
                        </p>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Queue Statistics</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average Wait Time</span>
                                <span className="font-semibold text-gray-900">{averageWaitTime} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Today</span>
                                <span className="font-semibold text-gray-900">—</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Peak Hour</span>
                                <span className="font-semibold text-gray-900">—</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                        <div className="flex items-center mb-4">
                            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Manage your queue efficiently with instant actions
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white border border-gray-300 hover:border-gray-400 rounded-xl p-3 text-sm font-medium transition-colors">
                                Recall Previous
                            </button>
                            <button className="bg-white border border-gray-300 hover:border-gray-400 rounded-xl p-3 text-sm font-medium transition-colors">
                                Skip Customer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Queue List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                Live Queue
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({queue.length} waiting)
                                </span>
                            </h2>
                            {lastAction && (
                                <div className="text-sm text-gray-500">
                                    Last action: {lastAction.type.replace('_', ' ')} at {lastAction.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {queue.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">Queue is empty</p>
                                <p className="text-sm text-gray-400 mt-1">Waiting for customers to join...</p>
                            </div>
                        ) : (
                            queue.map((entry, index) => (
                                <div 
                                    key={entry.id}
                                    className={`px-6 py-4 transition-all duration-200 hover:bg-gray-50 ${
                                        index === 0 ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                                                index === 0 
                                                    ? 'bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200' 
                                                    : 'bg-gray-100'
                                            }`}>
                                                <span className={`text-lg font-bold ${
                                                    index === 0 ? 'text-blue-700' : 'text-gray-700'
                                                }`}>
                                                    #{entry.position}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-gray-900">{entry.name}</span>
                                                    {index === 0 && (
                                                        <span className="ml-2 text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                            NEXT
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    <span>~{entry.etaMinutes ?? (entry.position - 1) * 4} min wait</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeUser(entry.name)}
                                            className="group flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <div className="h-8 w-8 rounded-lg flex items-center justify-center group-hover:bg-red-50 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Queue Footer */}
                    {queue.length > 0 && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                    Real-time updates active
                                </div>
                                <div className="text-right">
                                    <span className="font-medium">Total wait time:</span> 
                                    <span className="ml-2">{queue.reduce((sum, entry) => sum + (entry.etaMinutes || (entry.position - 1) * 4), 0)} minutes</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}