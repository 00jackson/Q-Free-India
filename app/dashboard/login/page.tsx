"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopId: "test-shop",
        pin,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid PIN");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="space-y-4 w-64">
        <h1 className="text-xl font-bold">Admin PIN</h1>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full p-2 text-black"
          placeholder="Enter PIN"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={submit}
          className="w-full bg-white text-black py-2"
        >
          Enter
        </button>
      </div>
    </div>
  );
}