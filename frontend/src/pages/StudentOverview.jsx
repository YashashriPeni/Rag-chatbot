import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const nativeFetch = window.fetch.bind(window);

function InsightCard({ icon, title, tip, color }) {
  return (
    <div className="glass animate-fadeUp" style={{
      borderRadius:14, padding:"16px 18px",
      border:`1px solid ${color}30`,
      display:"flex", flexDirection:"column", gap:6,
      transition:"transform .2s",
    }}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="none"}
    >
      <div style={{ fontSize:20 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{title}</div>
      <div style={{ fontSize:12.5, color:"var(--text-secondary)", lineHeight:1.6 }}>{tip}</div>
    </div>
  );
}

export default function StudentOverview({ analysis }) {
  const [data, setData] = useState({
    health_score:100, stress_mentions:0, headaches:0,
    sleep_issues:0, messages:0, positive:0, negative:0, alerts:[],
  });

  useEffect(() => {
    const fetch = () =>
      nativeFetch("http://127.0.0.1:8000/dashboard")
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
    fetch();
    const id = setInterval(fetch, 3000);
    return () => clearInterval(id);
  }, []);

  const score = data.health_score ?? 100;
  const scoreColor = score > 70 ? "#10b981" : score > 40 ? "#f59e0b" : "#f87171";

  const donutData = [
    { name:"Health",   value: score },
    { name:"Affected", value: 100 - score },
  ];

  const tips = [];
  if (data.stress_mentions > 2)  tips.push({ icon:"🌿", title:"Stress Management", tip:"High stress detected. Try 5-minute deep breathing or a short walk between study sessions.", color:"#f59e0b" });
  if (data.headaches > 1)        tips.push({ icon:"💧", title:"Hydration & Screen Breaks", tip:"Multiple headaches reported. Drink water regularly and follow the 20-20-20 rule for screen time.", color:"#a78bfa" });
  if (data.sleep_issues > 1)     tips.push({ icon:"😴", title:"Sleep Hygiene", tip:"Sleep issues detected. Aim for 7–9 hours. Avoid screens 1 hour before bed and keep a consistent schedule.", color:"#06b6d4" });
  if (data.negative > data.positive && data.messages > 3) tips.push({ icon:"💛", title:"Emotional Wellbeing", tip:"Your mood seems low. Talk to a friend, try journaling, or reach out to your campus counselor.", color:"#f87171" });
  if (!tips.length) tips.push({ icon:"✨", title:"You're doing great!", tip:"No health concerns detected. Keep maintaining your healthy habits and stay hydrated!", color:"#10b981" });

  return (
    <div style={{
      height:"100%", overflowY:"auto", padding:"24px",
      display:"flex", flexDirection:"column", gap:20,
      background:"var(--bg-base)", position:"relative",
    }}>
      {/* Ambient glow */}
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", pointerEvents:"none", background:"radial-gradient(circle,rgba(139,92,246,0.07),transparent 70%)", top:0, left:"30%", filter:"blur(70px)" }}/>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>
          🧾 Wellness <span className="gradient-text">Overview</span>
        </h2>
        <p style={{ fontSize:13, color:"var(--text-muted)" }}>AI-generated health insights based on your conversations</p>
      </div>

      {/* Score + donut */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Donut */}
        <div className="glass" style={{ borderRadius:16, padding:"24px", border:"1px solid var(--border)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:4 }}>Overall Health Score</h3>
          <div style={{ position:"relative" }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} paddingAngle={2}>
                  <Cell fill={scoreColor} />
                  <Cell fill="rgba(255,255,255,0.05)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:26, fontWeight:700, color:scoreColor, fontFamily:"'Sora',sans-serif" }}>{score}</span>
              <span style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:1 }}>/100</span>
            </div>
          </div>
          <p style={{ fontSize:12, color: scoreColor, fontWeight:600 }}>
            {score > 70 ? "🟢 Good" : score > 40 ? "🟡 Fair" : "🔴 Needs Attention"}
          </p>
        </div>

        {/* Stats summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { label:"Total conversations", value:data.messages, icon:"💬", color:"#8b5cf6" },
            { label:"Positive moments",    value:data.positive, icon:"😊", color:"#10b981" },
            { label:"Stress mentions",     value:data.stress_mentions, icon:"😤", color:"#f59e0b" },
            { label:"Alerts triggered",    value:data.alerts?.length||0, icon:"⚠️", color:"#f87171" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="glass" style={{
              borderRadius:12, padding:"12px 16px",
              border:"1px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <span style={{ fontSize:12.5, color:"var(--text-secondary)" }}>{icon} {label}</span>
              <span style={{ fontSize:17, fontWeight:700, color, fontFamily:"'Sora',sans-serif" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text-primary)", marginBottom:12 }}>💡 Personalized Insights</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
          {tips.map((t, i) => <InsightCard key={i} {...t} />)}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)" }}>
        <p style={{ fontSize:11.5, color:"var(--text-muted)", lineHeight:1.7 }}>
          ⚕️ <strong style={{ color:"var(--text-secondary)" }}>Disclaimer:</strong> Arundhati provides general wellness guidance only. For serious symptoms, please consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}