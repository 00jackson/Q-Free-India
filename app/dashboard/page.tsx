export default function DashboardPage() {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Queue Dashboard</h1>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Current Token</p>
              <p className="text-2xl font-bold">#12</p>
            </div>
  
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">People Waiting</p>
              <p className="text-2xl font-bold">8</p>
            </div>
  
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Estimated Wait</p>
              <p className="text-2xl font-bold">25 min</p>
            </div>
          </div>
  
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Queue List</h2>
  
            <ul className="space-y-2">
              {["Rahul", "Amit", "Sita", "John"].map((name, index) => (
                <li
                  key={index}
                  className="flex justify-between border rounded-lg px-4 py-2"
                >
                  <span>#{index + 13}</span>
                  <span>{name}</span>
                  <span className="text-gray-400">Waiting</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    );
  }