import { useState, useEffect, useRef, useCallback } from "react";

// ✅ Capture native fetch BEFORE any Chrome extension can override window.fetch
const nativeFetch = window.fetch.bind(window);

// ✅ Priority-ordered list of soothing natural female voices
const PREFERRED_FEMALE_VOICES = [
  "Samantha",          // macOS / iOS — warm, natural
  "Google UK English Female",
  "Microsoft Zira",    // Windows
  "Microsoft Jenny",   // Windows 11
  "Karen",             // macOS
  "Moira",             // macOS Irish English
  "Victoria",          // macOS
  "Fiona",             // macOS Scottish
  "Martha",            // Windows
];

function pickBestVoice(voices) {
  for (const name of PREFERRED_FEMALE_VOICES) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: any en-US or en-GB female-named voice
  const fallback = voices.find(v =>
    (v.lang === "en-US" || v.lang === "en-GB" || v.lang === "en-IN") &&
    /female|woman|girl|zira|jenny|samantha|karen|moira|fiona|victoria|hazel/i.test(v.name)
  );
  return fallback || voices.find(v => v.lang.startsWith("en")) || voices[0];
}

function InputBox({
  messages,
  setMessages,
  voiceState,
  setVoiceState,
  conversationId,
  setConversationId,
  stopSpeechRef,
}) {
  const [input, setInput]       = useState("");
  const [voices, setVoices]     = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused]   = useState(false);

  // Always-fresh refs — avoids stale closures in async / voice callbacks
  const messagesRef       = useRef(messages);
  const conversationIdRef = useRef(conversationId);
  const voiceStateRef     = useRef(voiceState);

  useEffect(() => { messagesRef.current       = messages;       }, [messages]);
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { voiceStateRef.current     = voiceState;     }, [voiceState]);

  // Load voices (async on some browsers)
  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.onvoiceschanged = load;
  }, []);

  // ─── SPEAK — soothing female voice ────────────────────────────────
  const speak = useCallback((text) => {
    if (!text) return;

    const voice = pickBestVoice(voices);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;

    // Natural, soothing settings
    utterance.pitch = 1.05;   // Slightly warm, not too high
    utterance.rate  = 0.92;   // Calm, unhurried
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setVoiceState("speaking");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setVoiceState("idle");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setVoiceState("idle");
    };

    speechSynthesis.cancel();
    // Small delay so cancel() fully clears before new utterance
    setTimeout(() => speechSynthesis.speak(utterance), 80);
  }, [voices, setVoiceState]);

  // ─── PAUSE / RESUME / STOP ─────────────────────────────────────────
  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  const stopSpeech = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setVoiceState("idle");
  }, [setVoiceState]);

  // Expose stopSpeech so VoiceOrb Stop button works from ChatPage
  useEffect(() => {
    if (stopSpeechRef) stopSpeechRef.current = stopSpeech;
  }, [stopSpeech, stopSpeechRef]);

  // ─── SEND MESSAGE ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (textOverride = null) => {
    const text = (textOverride || input).trim();
    if (!text) return;

    const currentMessages = Array.isArray(messagesRef.current) ? messagesRef.current : [];
    const userMessage    = { role: "user", content: text };
    const updatedMessages = [...currentMessages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setVoiceState("thinking");

    try {
      const res = await nativeFetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationIdRef.current,
        }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data?.reply || "No response from server" };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      if (data?.conversation_id) setConversationId(data.conversation_id);
      if (data?.reply) speak(data.reply);
      else             setVoiceState("idle");

    } catch (err) {
      console.error("API ERROR:", err);
      setVoiceState("idle");
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "⚠️ Could not reach the server. Is the backend running on port 8000?",
      }]);
    }
  }, [input, setMessages, setConversationId, setVoiceState, speak]);

  // ─── VOICE INPUT ───────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input requires Chrome or Edge browser.");
      return;
    }

    speechSynthesis.cancel();
    setIsSpeaking(false);

    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = ()  => setVoiceState("listening");
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setVoiceState("thinking");
      sendMessage(transcript);
    };
    rec.onerror = (e) => {
      console.error("Recognition error:", e.error);
      setVoiceState("idle");
      if (e.error === "not-allowed")
        alert("Microphone permission denied. Please allow mic access and try again.");
    };
    rec.onend = () => {
      if (voiceStateRef.current === "listening") setVoiceState("idle");
    };

    rec.start();
  };

  // ─── RENDER ────────────────────────────────────────────────────────
  const busy = voiceState === "listening" || voiceState === "thinking";

  return (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      padding:"12px 16px",
      borderTop:"1px solid var(--border)",
      background:"rgba(17,24,39,0.6)",
      backdropFilter:"blur(16px)",
    }}>
      {/* Text input */}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
        placeholder="Type a message or use the mic…"
        disabled={busy}
        className="input-field"
        style={{ flex:1, padding:"11px 16px", fontSize:14, opacity: busy ? 0.6 : 1 }}
      />

      {/* Mic button */}
      <button
        onClick={startListening}
        disabled={busy}
        title="Voice input"
        style={{
          width:42, height:42, borderRadius:"50%", border:"none",
          background: busy ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)",
          color: "#a78bfa", fontSize:18, cursor: busy ? "not-allowed" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s", flexShrink:0,
          opacity: busy ? 0.5 : 1,
          boxShadow: busy ? "none" : "0 0 12px rgba(139,92,246,0.2)",
        }}
        onMouseEnter={e => { if (!busy) e.currentTarget.style.background = "rgba(139,92,246,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = busy ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"; }}
      >🎤</button>

      {/* Pause */}
      <button
        onClick={pauseSpeech}
        disabled={!isSpeaking || isPaused}
        title="Pause speech"
        style={{
          width:36, height:36, borderRadius:8, border:"1px solid var(--border)",
          background:"transparent", color:"var(--text-secondary)", fontSize:14,
          cursor: (!isSpeaking || isPaused) ? "not-allowed" : "pointer",
          opacity: (!isSpeaking || isPaused) ? 0.35 : 1,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s", flexShrink:0,
        }}
      >⏸</button>

      {/* Resume */}
      <button
        onClick={resumeSpeech}
        disabled={!isPaused}
        title="Resume speech"
        style={{
          width:36, height:36, borderRadius:8, border:"1px solid var(--border)",
          background:"transparent", color:"var(--text-secondary)", fontSize:14,
          cursor: !isPaused ? "not-allowed" : "pointer",
          opacity: !isPaused ? 0.35 : 1,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s", flexShrink:0,
        }}
      >▶</button>

      {/* Stop */}
      <button
        onClick={stopSpeech}
        disabled={!isSpeaking}
        title="Stop speech"
        style={{
          width:36, height:36, borderRadius:8, border:"1px solid rgba(248,113,113,0.25)",
          background:"transparent", color:"#f87171", fontSize:14,
          cursor: !isSpeaking ? "not-allowed" : "pointer",
          opacity: !isSpeaking ? 0.35 : 1,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s", flexShrink:0,
        }}
      >⏹</button>

      {/* Send */}
      <button
        onClick={() => sendMessage()}
        disabled={!input.trim() || busy}
        className="btn btn-primary"
        style={{
          height:42, padding:"0 20px", fontSize:14, flexShrink:0,
          opacity: (!input.trim() || busy) ? 0.45 : 1,
          cursor: (!input.trim() || busy) ? "not-allowed" : "pointer",
        }}
      >
        Send ↑
      </button>
    </div>
  );
}

export default InputBox;