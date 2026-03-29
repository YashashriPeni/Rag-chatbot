import { useState, useEffect } from "react";

function InputBox({
  messages,
  setMessages,
  voiceState,
  setVoiceState,
  conversationId,
  setConversationId
}) {
  const [input, setInput] = useState("");
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 🔊 SPEAK FUNCTION (UPDATED)
  const speak = (text) => {
    if (!text) return;

    const voice =
      voices.find(v => v.name.toLowerCase().includes("heera")) ||
      voices.find(v => v.lang === "en-IN");

    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) utterance.voice = voice;

    utterance.pitch = 1.3;
    utterance.rate = 0.95;

    // 🔥 IMPORTANT STATE HANDLING
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechSynthesis.cancel(); // clear previous
    speechSynthesis.speak(utterance);
  };

  // ⏸ PAUSE
  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // ▶ RESUME
  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  // ⛔ STOP
  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const sendMessage = async (textOverride = null) => {
    const text = textOverride || input;

    if (!text || !text.trim()) return;

    const userMessage = {
      role: "user",
      content: text
    };

    const updatedMessages = Array.isArray(messages)
      ? [...messages, userMessage]
      : [userMessage];

    setMessages(updatedMessages);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId
        })
      });

      const data = await res.json();

      const botMessage = {
        role: "assistant",
        content: data?.reply || "No response from server"
      };

      const finalMessages = [...updatedMessages, botMessage];

      if (!Array.isArray(finalMessages)) {
        console.error("Messages not array:", finalMessages);
        return;
      }

      setMessages(finalMessages);

      if (data?.conversation_id) {
        setConversationId(data.conversation_id);
      }

      if (data?.reply) {
        speak(data.reply);
      }

    } catch (err) {
      console.error("API ERROR:", err);
    }
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";

    recognition.onstart = () => setVoiceState("listening");

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      sendMessage(text);
    };

    recognition.onend = () => setVoiceState("idle");

    recognition.start();
  };

  return (
    <div className="p-4 border-t flex flex-wrap gap-3 items-center">

      {/* INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 border rounded-xl px-4 py-2"
        placeholder="Talk to me..."
      />

      {/* 🎤 */}
      <button onClick={startListening}>🎤</button>

      {/* ⏸ */}
      <button
        onClick={pauseSpeech}
        disabled={!isSpeaking || isPaused}
        className="bg-yellow-400 px-3 py-1 rounded-lg text-sm disabled:opacity-40"
      >
        Pause
      </button>

      {/* ▶ */}
      <button
        onClick={resumeSpeech}
        disabled={!isPaused}
        className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-40"
      >
        Resume
      </button>

      {/* ⛔ */}
      <button
        onClick={stopSpeech}
        disabled={!isSpeaking}
        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-40"
      >
        Stop
      </button>

      {/* SEND */}
      <button
        onClick={() => sendMessage()}
        className="bg-green-500 text-white px-4 rounded-xl"
      >
        Send
      </button>

    </div>
  );
}

export default InputBox;