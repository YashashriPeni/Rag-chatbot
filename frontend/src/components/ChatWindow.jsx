import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const safe = (messages || []).filter(m => m && m.content);

  if (!safe.length) {
    return (
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', height:'100%', gap:16, opacity:.5,
      }}>
        <div className="animate-float" style={{ fontSize:48 }}>💬</div>
        <p style={{ fontSize:14, color:'var(--text-muted)', fontWeight:500 }}>
          Start a conversation…
        </p>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {safe.map((msg, i) => (
        <MessageBubble key={i} message={msg} index={i} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}