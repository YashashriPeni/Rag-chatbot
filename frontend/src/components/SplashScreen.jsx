import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => onFinish(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'linear-gradient(135deg,#0a0f1e 0%,#0f1729 50%,#0a0f1e 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:24,
    }}>
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%)', top:'20%', left:'30%', filter:'blur(40px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)', bottom:'20%', right:'30%', filter:'blur(40px)', pointerEvents:'none' }}/>
      <div className="animate-float" style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.2)', opacity: phase >= 1 ? 1 : 0, transition:'opacity 0.6s ease' }}>🏥</div>
      <div style={{ textAlign:'center', opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)', transition:'all 0.7s ease 0.1s' }}>
        <h1 className="animate-splashGlow" style={{ fontFamily:"'Sora',sans-serif", fontSize:36, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.5px', marginBottom:6 }}>Arundhati</h1>
        <p style={{ color:'#94a3b8', fontSize:14, letterSpacing:2, textTransform:'uppercase' }}>Student Health Assistant</p>
      </div>
      <div style={{ width:180, height:2, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden', opacity: phase >= 2 ? 1 : 0, transition:'opacity 0.4s ease' }}>
        <div style={{ height:'100%', borderRadius:99, background:'linear-gradient(90deg,#8b5cf6,#06b6d4)', width: phase >= 2 ? '100%' : '0%', transition:'width 1.2s ease' }}/>
      </div>
    </div>
  );
}