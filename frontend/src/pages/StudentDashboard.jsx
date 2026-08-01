import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const nativeFetch = window.fetch.bind(window);

const GAUGE_COLORS = ["#8b5cf6","#06b6d4","#10b981","#f59e0b","#f87171"];

function StatCard({ icon, label, value, color="#8b5cf6", sub }) {
  return (
    <div className="glass animate-fadeUp" style={{
      borderRadius:16, padding:"20px 22px",
      display:"flex", flexDirection:"column", gap:6,
      border:"1px solid var(--border)",
      transition:"transform .2s, box-shadow .2s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="var(--shadow-glow)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
    >
      <div style={{ fontSize:24 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:700, color, fontFamily:"'Sora',sans-serif" }}>{value}</div>
      <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default function StudentDashboard({ analysis }) {
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

  const pieData = [
    { name:"Positive", value: Math.max(data.positive, 1) },
    { name:"Negative", value: Math.max(data.negative, 1) },
    { name:"Neutral",  value: Math.max(data.messages - data.positive - data.negative, 1) },
  ];
  const pieColors = ["#10b981","#f87171","#94a3b8"];

  const barData = [
    { name:"Stress",   value: data.stress_mentions },
    { name:"Headache", value: data.headaches },
    { name:"Sleep",    value: data.sleep_issues },
    { name:"Positive", value: data.positive },
    { name:"Negative", value: data.negative },
  ];

  return (
    <div style={{
      height:"100%", overflowY:"auto",
      padding:"24px", display:"flex", flexDirection:"column", gap:20,
      background:"var(--bg-base)", position:"relative",
    }}>
      {/* Ambient glow */}
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", pointerEvents:"none", background:"radial-gradient(circle,rgba(6,182,212,0.06),transparent 70%)", top:0, right:0, filter:"blur(60px)" }}/>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>
          📊 Health <span className="gradient-text">Dashboard</span>
        </h2>
        <p style={{ fontSize:13, color:"var(--text-muted)" }}>Live analytics from your conversations · updates every 3s</p>
      </div>

      {/* Alerts */}
      {data.alerts?.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {data.alerts.map((a,i) => (
            <div key={i} className="animate-fadeUp" style={{
              padding:"11px 16px", borderRadius:12,
              background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)",
              fontSize:13, color:"#fca5a5", fontWeight:500,
            }}>{a}</div>
          ))}
        </div>
      )}

      {/* Health score + stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        <div className="glass animate-fadeUp" style={{
          borderRadius:16, padding:"20px 22px", gridColumn:"span 1",
          display:"flex", flexDirection:"column", gap:6,
          border:"1px solid var(--border)",
        }}>
          <div style={{ fontSize:24 }}>❤️‍🩹</div>
          <div style={{ fontSize:32, fontWeight:700, color:scoreColor, fontFamily:"'Sora',sans-serif" }}>{score}</div>
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:500 }}>Health Score</div>
          <div style={{ height:4, borderRadius:99, background:"var(--border)", marginTop:4 }}>
            <div style={{ height:"100%", borderRadius:99, background:scoreColor, width:`${score}%`, transition:"width 1s ease" }}/>
          </div>
        </div>
        <StatCard icon="💬" label="Total Messages"    value={data.messages}        color="#8b5cf6" />
        <StatCard icon="😌" label="Positive Mood"     value={data.positive}        color="#10b981" />
        <StatCard icon="😔" label="Negative Mood"     value={data.negative}        color="#f87171" />
        <StatCard icon="😤" label="Stress Mentions"   value={data.stress_mentions} color="#f59e0b" />
        <StatCard icon="🤕" label="Headache Reports"  value={data.headaches}       color="#a78bfa" />
        <StatCard icon="😴" label="Sleep Issues"      value={data.sleep_issues}    color="#06b6d4" />
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Mood pie */}
        <div className="glass" style={{ borderRadius:16, padding:"20px", border:"1px solid var(--border)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:16 }}>😊 Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                {pieData.map((_,i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:10, color:"var(--text-primary)", fontSize:12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            {pieData.map((d,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-secondary)" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:pieColors[i] }}/>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Symptom bar */}
        <div className="glass" style={{ borderRadius:16, padding:"20px", border:"1px solid var(--border)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:16 }}>📈 Symptom Frequency</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={24}>
              <XAxis dataKey="name" tick={{ fill:"var(--text-muted)", fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background:"var(--bg-surface)", border:"1px solid var(--border)", borderRadius:10, color:"var(--text-primary)", fontSize:12 }}
              />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {barData.map((_,i) => <Cell key={i} fill={GAUGE_COLORS[i % GAUGE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}