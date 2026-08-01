import { useState, useEffect } from "react";
import ChatPage from "./pages/ChatPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentOverview from "./pages/StudentOverview";
import SplashScreen from "./components/SplashScreen";
import LoginPage from "./components/LoginPage";
import "./index.css";

function App() {
  const [view, setView] = useState("chat");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (username) => {
    localStorage.setItem("user", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setView("chat");
  };

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;
  if (!user)   return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"var(--bg-base)" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", height:60,
        background:"rgba(17,24,39,0.85)",
        backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--border)",
        flexShrink:0, zIndex:50,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, boxShadow:"0 0 16px rgba(139,92,246,.5)",
          }}>🏥</div>
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:16, color:"var(--text-primary)" }}>
            Arundhati <span className="gradient-text">Health</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {["chat","dashboard","overview"].map(tab => (
            <button key={tab} onClick={() => setView(tab)} className="btn btn-ghost" style={{
              fontSize:13, padding:"6px 16px", textTransform:"capitalize",
              background: view===tab ? "rgba(139,92,246,0.15)" : "transparent",
              borderColor: view===tab ? "rgba(139,92,246,0.4)" : "var(--border)",
              color: view===tab ? "#a78bfa" : "var(--text-secondary)",
            }}>
              { tab === "chat" ? "💬 Chat" : tab === "dashboard" ? "📊 Dashboard" : "🧾 Overview" }
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:13, color:"var(--text-secondary)" }}>
            Hey, <strong style={{ color:"var(--text-primary)" }}>{user}</strong> 👋
          </span>
          <button onClick={handleLogout} className="btn btn-ghost" style={{
            fontSize:12, padding:"5px 14px", color:"#f87171", borderColor:"rgba(248,113,113,0.3)"
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── PAGES ───────────────────────────────────────── */}
      <div style={{ flex:1, overflow:"hidden" }}>
        {view === "chat"      && <ChatPage user={user} setAnalysis={setAnalysis} />}
        {view === "dashboard" && <StudentDashboard analysis={analysis} />}
        {view === "overview"  && <StudentOverview analysis={analysis} />}
      </div>
    </div>
  );
}

export default App;