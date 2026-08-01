export default function VoiceOrb({ state, onStop }) {
  if (!state || state === 'idle') return null;
  const colors = {
    listening: { bar:'#8b5cf6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.25)', label:'Listening… speak now', emoji:'🎙️' },
    thinking:  { bar:'#06b6d4', bg:'rgba(6,182,212,0.08)', border:'rgba(6,182,212,0.25)', label:'Thinking…', emoji:'🧠' },
    speaking:  { bar:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.25)', label:'Speaking response…', emoji:'🔊' },
  };
  const cfg = colors[state] || colors.listening;
  return (
    <div className="animate-fadeUp" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:16, background: cfg.bg, border:`1px solid ${cfg.border}`, marginBottom:12 }}>
      <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, animation: state==='thinking' ? 'brainBounce 1.5s ease-in-out infinite' : 'none' }}>{cfg.emoji}</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:24 }}>
        {[0,.1,.2,.15,.05,.12,.08].map((delay,i) => (
          <div key={i} style={{ width:4, borderRadius:99, background: cfg.bar, animation: state==='thinking' ? 'dotPop 1.2s ease-in-out infinite' : 'barBounce .6s ease-in-out infinite', animationDelay:`${delay}s`, height:4 }}/>
        ))}
      </div>
      <span className="animate-shimmer" style={{ fontSize:13, fontWeight:600, color: cfg.bar, letterSpacing:.3 }}>{cfg.label}</span>
      {onStop && (
        <button onClick={onStop} style={{ marginLeft:'auto', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:600, color:'var(--text-secondary)', cursor:'pointer', fontFamily:'inherit' }}>⏹ Stop</button>
      )}
    </div>
  );
}
