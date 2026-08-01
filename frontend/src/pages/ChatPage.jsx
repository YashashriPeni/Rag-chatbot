import { useState, useEffect, useRef } from "react";
import ChatWindow from "../components/ChatWindow";
import InputBox   from "../components/InputBox";
import VoiceOrb   from "../components/VoiceOrb";

export default function ChatPage() {
  const [messages,       setMessages]       = useState([]);
  const [voiceState,     setVoiceState]     = useState("idle");
  const [conversationId, setConversationId] = useState("");
  const [chats,          setChats]          = useState([]);
  const [activeIndex,    setActiveIndex]    = useState(0);
  const [isLoaded,       setIsLoaded]       = useState(false);
  const [reminder,       setReminder]       = useState("");
  const stopSpeechRef = useRef(null);

  const handleVoiceStop = () => {
    if (stopSpeechRef.current) stopSpeechRef.current();
    setVoiceState("idle");
  };

  // ─── LOAD ───────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("chat_data");
    const init  = { messages:[], conversationId:"", createdAt:new Date().toISOString() };
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.chats?.length) { setChats(p.chats); setActiveIndex(p.activeIndex || 0); }
        else { setChats([init]); setActiveIndex(0); }
      } catch { setChats([init]); setActiveIndex(0); }
    } else {
      setChats([init]); setActiveIndex(0);
    }
    setIsLoaded(true);
  }, []);

  // ─── SAVE ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("chat_data", JSON.stringify({ chats, activeIndex }));
  }, [chats, activeIndex, isLoaded]);

  // ─── SYNC ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (chats[activeIndex]) {
      setMessages(chats[activeIndex].messages || []);
      setConversationId(chats[activeIndex].conversationId || "");
    }
  }, [activeIndex, chats]);

  // ─── UPDATE MESSAGES ────────────────────────────────────────────────
  const updateMessages = (newMsgs) => {
    const safe = (newMsgs || []).filter(m => m && m.content);
    setMessages(safe);
    setChats(prev => {
      const u = [...prev];
      if (!u[activeIndex]) { u.push({ messages:safe, conversationId:"", createdAt:new Date().toISOString() }); return u; }
      u[activeIndex] = { ...u[activeIndex], messages:safe };
      return u;
    });
  };

  const updateConversationId = (id) => {
    setConversationId(id);
    setChats(prev => {
      const u = [...prev];
      if (!u[activeIndex]) return prev;
      u[activeIndex] = { ...u[activeIndex], conversationId:id };
      return u;
    });
  };

  // ─── CHAT MANAGEMENT ────────────────────────────────────────────────
  const createNewChat = () => {
    const c = { messages:[], conversationId:"", createdAt:new Date().toISOString() };
    setChats(prev => { const u = [...prev, c]; setActiveIndex(u.length-1); return u; });
  };

  const deleteChat = (i) => {
    setChats(prev => {
      const u = prev.filter((_,x) => x !== i);
      if (i === activeIndex) setActiveIndex(Math.max(0, i-1));
      return u;
    });
  };

  const getTitle = (chat) => {
    if (!chat) return "New Chat";
    if (chat.messages?.length) {
      const first = chat.messages[0];
      if (!first?.content) return "New Chat";
      const t = first.content.toLowerCase();
      if (t.includes("fever"))  return "Fever Help 🌡️";
      if (t.includes("stress")) return "Stress Talk 🌿";
      if (t.includes("sad"))    return "Support 💛";
      if (t.includes("sleep"))  return "Sleep Issues 😴";
      if (t.includes("head"))   return "Headache 🤕";
      return first.content.slice(0,22) + (first.content.length > 22 ? "…" : "");
    }
    return new Date(chat.createdAt).toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" });
  };

  // ─── REMINDER ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!messages.length) { setReminder("Hi 👋  Tell me how you're feeling today."); return; }
    const last = messages[messages.length-1];
    if (!last?.content) return;
    const l = last.content.toLowerCase();
    if (l.includes("fever"))  setReminder("💧 Stay hydrated and rest well");
    else if (l.includes("stress")) setReminder("🌿 Take a short break and breathe");
    else if (l.includes("sleep"))  setReminder("😴 Try to maintain a consistent sleep schedule");
    else setReminder("💚 I'm here for you. Take care!");
  }, [messages]);

  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden", background:"var(--bg-base)" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width:240, flexShrink:0,
        background:"rgba(17,24,39,0.7)",
        backdropFilter:"blur(20px)",
        borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        padding:"16px 12px",
        gap:8, overflowY:"auto",
      }}>
        {/* Sidebar header */}
        <div style={{ marginBottom:4, paddingBottom:12, borderBottom:"1px solid var(--border)" }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>
            💬 Conversations
          </h2>
          <button
            onClick={createNewChat}
            className="btn btn-ghost"
            style={{ width:"100%", fontSize:13, justifyContent:"flex-start", gap:8, padding:"9px 12px" }}
          >
            <span style={{ fontSize:16 }}>+</span> New Chat
          </button>
        </div>

        {/* Chat list */}
        {chats.map((chat, i) => (
          <div
            key={i}
            style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"9px 12px", borderRadius:10, cursor:"pointer",
              background: activeIndex===i ? "rgba(139,92,246,0.15)" : "transparent",
              border: activeIndex===i ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              transition:"all .2s",
            }}
            onMouseEnter={e => { if (activeIndex!==i) e.currentTarget.style.background="var(--bg-card-hover)"; }}
            onMouseLeave={e => { if (activeIndex!==i) e.currentTarget.style.background="transparent"; }}
          >
            <span
              onClick={() => setActiveIndex(i)}
              style={{
                fontSize:12.5, color: activeIndex===i ? "#a78bfa" : "var(--text-secondary)",
                fontWeight: activeIndex===i ? 600 : 400,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
              }}
            >
              {getTitle(chat)}
            </span>
            <button
              onClick={() => deleteChat(i)}
              style={{
                background:"transparent", border:"none", cursor:"pointer",
                color:"#f87171", fontSize:12, padding:"2px 4px", borderRadius:4,
                opacity:0, transition:"opacity .15s", flexShrink:0, marginLeft:4,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="1"}
              onMouseLeave={e => e.currentTarget.style.opacity="0"}
            >✕</button>
          </div>
        ))}
      </aside>

      {/* ── MAIN AREA ───────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

        {/* Ambient background glow */}
        <div style={{
          position:"absolute", width:500, height:500, borderRadius:"50%", pointerEvents:"none",
          background:"radial-gradient(circle,rgba(139,92,246,0.06),transparent 70%)",
          top:"-10%", right:"-5%", filter:"blur(60px)",
        }}/>

        {/* Reminder banner */}
        {reminder && (
          <div className="animate-fadeIn" style={{
            margin:"12px 16px 0",
            padding:"10px 16px",
            borderRadius:12,
            background:"rgba(139,92,246,0.08)",
            border:"1px solid rgba(139,92,246,0.2)",
            fontSize:13, color:"#c4b5fd", fontWeight:500,
            flexShrink:0,
          }}>
            {reminder}
          </div>
        )}

        {/* VoiceOrb */}
        {voiceState !== "idle" && (
          <div style={{ padding:"8px 16px 0", flexShrink:0 }}>
            <VoiceOrb state={voiceState} onStop={handleVoiceStop} />
          </div>
        )}

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
          <ChatWindow messages={messages} />
        </div>

        {/* Input */}
        <InputBox
          messages={messages}
          setMessages={updateMessages}
          voiceState={voiceState}
          setVoiceState={setVoiceState}
          conversationId={conversationId}
          setConversationId={updateConversationId}
          stopSpeechRef={stopSpeechRef}
        />
      </div>
    </div>
  );
}