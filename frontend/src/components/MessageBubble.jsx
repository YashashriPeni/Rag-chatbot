export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <div
      className="animate-fadeUp"
      style={{
        display:'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom:6,
        animationDelay:`${Math.min(index * 0.04, 0.3)}s`,
      }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div style={{
          width:30, height:30, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg,#8b5cf6,#06b6d4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, marginRight:8, marginTop:4,
          boxShadow:'0 0 12px rgba(139,92,246,0.3)',
        }}>🏥</div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth:'72%',
        padding:'11px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
          : 'rgba(255,255,255,0.06)',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize:14, lineHeight:1.6, fontWeight:400,
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isUser
          ? '0 4px 20px rgba(139,92,246,0.35)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        wordBreak:'break-word',
        whiteSpace:'pre-wrap',
      }}>
        {message.content}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width:30, height:30, borderRadius:'50%', flexShrink:0,
          background:'rgba(255,255,255,0.1)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, marginLeft:8, marginTop:4,
          border:'1px solid rgba(255,255,255,0.12)',
        }}>👤</div>
      )}
    </div>
  );
}