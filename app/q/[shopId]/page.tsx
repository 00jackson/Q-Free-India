"use client";


import { getSocket } from "@/lib/socket";
import { Users, AlertCircle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
    const [name, setName] = useState("");
    const [updates, setUpdates] = useState<any[]>([]);
    const [myToken, setMyToken] = useState<number | null>(null);
    const [myEta, setMyEta] = useState<number | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const params = useParams();
    const shopId = params.shopId as string;
    const myNameRef = useRef<string | null>(null);

    useEffect(() => {
        const socket = getSocket();

        socket.on("queue:update", (data) => {
            if (data.shopId !== shopId) return;

            if (data.type === "JOIN") {
                setUpdates((prev) => [...prev.slice(-4), data.entry]); // Keep only last 5 updates

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
                    shopId: shopId,
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
        // Ahead of you = your token - 1 (exclude yourself)
        return Math.max(0, myToken - 1);
    };

    const queue = getPositionStatus();

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-blue-100/50 overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Users className="h-7 w-7" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Q-Free India</h1>
                    </div>
                    <p className="text-center text-blue-100 font-medium">
                        Skip the line, save your time
                    </p>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">
                    {/* Join Queue Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                            Join Virtual Queue
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 transition-all duration-200"
                                    onKeyDown={(e) => e.key === "Enter" && joinQueue()}
                                    disabled={isJoining}
                                />
                            </div>

                            <button
                                onClick={joinQueue}
                                disabled={!name.trim() || isJoining}
                                className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${!name.trim() || isJoining
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                                    }`}
                            >
                                {isJoining ? (
                                    <span className="flex items-center justify-center">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Joining Queue...
                                    </span>
                                ) : (
                                    "Join Queue Now"
                                )}
                            </button>

                            <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                                <span>No login required. Your token will appear instantly.</span>
                            </div>
                        </div>
                    </div>

                    {/* Token Display Section */}
                    {myToken && (
                        <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                            <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-400/10 rounded-full"></div>
                            <div className="absolute -left-6 -bottom-6 h-20 w-20 bg-indigo-400/10 rounded-full"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Your Token</p>
                                        <div className="flex items-baseline mt-1">
                                            <span className="text-5xl font-bold text-gray-900">#{myToken}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Estimated Wait</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ~{myEta} <span className="text-lg text-gray-600">min</span>
                                        </p>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Ahead of You</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {queue !== null ? queue : "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress indicator */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Your Position</span>
                                        <span className="font-medium">#{myToken}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: queue && myEta
                                                    ? `${Math.max(10, 100 - (queue / (queue + 5)) * 100)}%`
                                                    : "10%"
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Live Updates Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                Live Queue Updates
                                <span className="ml-auto text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                                    {myToken ? myToken : 0} in queue
                                </span>
                            </h2>
                        </div>

                        {updates.length > 0 ? (
                            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                {updates.map((u, i) => (
                                    <div
                                        key={i}
                                        className={`px-5 py-3.5 flex items-center transition-all duration-200 ${u.name === myNameRef.current
                                                ? "bg-blue-50/50 border-l-4 border-blue-500"
                                                : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mr-3">
                                            <span className="font-bold text-gray-700">#{u.position}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-500">Joined just now</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-5 py-10 text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">Waiting for queue activity...</p>
                                <p className="text-sm text-gray-400 mt-1">Be the first to join!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Note */}
                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-500">
                            <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                            Real-time updates • Works on 2G/3G • Optimistic UI
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}