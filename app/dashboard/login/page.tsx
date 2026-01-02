"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!pin) {
      setError("Please enter your PIN");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: "test-shop",
          pin: String(pin),
        }),
      });

      if (res.ok) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 300);
      } else {
        setError("Invalid PIN. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-sm md:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="h-14 w-14 md:h-16 md:w-16 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Dr. Sharma Clinic Management
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-5 md:p-6">
          <div className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 text-base md:text-lg">
                Enter Admin PIN
              </label>
              
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg md:rounded-xl px-4 py-3 md:py-3.5 pl-12 pr-12 text-lg md:text-xl font-medium transition-all duration-150"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  inputMode="numeric"
                  disabled={isLoading}
                  autoComplete="off"
                />
                
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <Eye className="h-5 w-5 md:h-6 md:w-6" />
                  )}
                </button>
              </div>
              
              <p className="text-gray-500 text-sm mt-2">
                Enter the 4-digit PIN provided for admin access
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-red-500 mt-0.5">!</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <p className="text-sm text-red-600 mt-1">
                      Try again or contact support
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={submit}
              disabled={isLoading || !pin}
              className={`w-full py-3 md:py-4 rounded-lg md:rounded-xl font-medium text-base md:text-lg transition-all ${
                isLoading || !pin
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>

            {/* Security Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Access</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Never share your PIN with anyone
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Hint - Only shown in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 text-center">
                  Demo PIN: <span className="font-medium text-gray-700">1121</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
              Secure connection
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Real-time monitoring</span>
            <span className="hidden sm:inline">•</span>
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </div>
  );
}