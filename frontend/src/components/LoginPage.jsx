import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const submit = () => { const t = name.trim(); if (t) onLogin(t); };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0a0f1e 0%,#0f1729 60%,#0a0f1e 100%)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)', top:'-10%', left:'10%', filter:'blur(60px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,0.08),transparent 70%)', bottom:'-10%', right:'10%', filter:'blur(60px)', pointerEvents:'none' }}/>
      <div className="glass animate-fadeUp" style={{ width:'100%', maxWidth:420, borderRadius:24, padding:'48px 40px', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', gap:28 }}>
        <div className="animate-float" style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, boxShadow:'0 0 32px rgba(139,92,246,0.4)' }}>🏥</div>
        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>Welcome to <span className="gradient-text">Arundhati</span></h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>Your personal student health companion.<br/>Tell me your name to get started.</p>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Your name…" className="input-field" style={{ fontSize:15, boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none', width:'100%' }}/>
        <button onClick={submit} disabled={!name.trim()} className="btn btn-primary" style={{ width:'100%', fontSize:15, padding:'13px', opacity: name.trim() ? 1 : 0.45, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>Enter Chat ✨</button>
        <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>No account needed · Fully private</p>
      </div>
    </div>
  );
}