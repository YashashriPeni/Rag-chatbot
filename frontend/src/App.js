import { useState, useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentOverview from "./pages/StudentOverview";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";

function App() {
  const [view, setView] = useState("chat");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 🔥 NEW: Shared analysis state
  const [analysis, setAnalysis] = useState(null);

  // 🔁 Check if user already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // 🔐 Handle login
  const handleLogin = (username) => {
    localStorage.setItem("user", username);
    setUser(username);
  };

  // 🚪 Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setView("chat");
  };

  // 🔥 Splash screen first
  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  // 🔐 Login screen next
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔷 Navbar */}
      <nav className="w-full bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">
          🏥 Arundhati Student Health System
        </h1>

        <div className="flex items-center gap-4">
          <NavButton
            label="Chat"
            active={view === "chat"}
            onClick={() => setView("chat")}
          />

          <NavButton
            label="Dashboard"
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />

          <NavButton
            label="Overview"
            active={view === "overview"}
            onClick={() => setView("overview")}
          />

          <div className="flex items-center gap-3 ml-4">
            <span className="text-sm text-gray-600 font-medium">
              Hey, {user} 👀
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* 🔷 Pages */}
      <div className="flex-1">
        {view === "chat" && (
          <ChatPage user={user} setAnalysis={setAnalysis} />
        )}

        {view === "dashboard" && (
          <StudentDashboard analysis={analysis} />
        )}

        {view === "overview" && (
          <StudentOverview analysis={analysis} />
        )}
      </div>
    </div>
  );
}

// 🔘 Nav Button
function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export default App;