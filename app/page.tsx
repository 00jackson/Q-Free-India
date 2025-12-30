export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Welcome to Q-India
        </h1>

        <p className="text-center text-gray-600">
          Join the queue without standing in line.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full border rounded-lg px-4 py-2"
            disabled
          />

          <button
            disabled
            className="w-full bg-black text-white py-2 rounded-lg opacity-60 cursor-not-allowed"
          >
            Join Queue
          </button>
        </div>

        <p className="text-xs text-center text-gray-400">
          (Static UI – logic coming later)
        </p>
      </div>
    </main>
  );
}