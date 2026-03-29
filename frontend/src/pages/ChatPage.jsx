import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";
import VoiceOrb from "../components/VoiceOrb";

export default function ChatPage() {

  const [messages, setMessages] = useState([]);
  const [voiceState, setVoiceState] = useState("idle");
  const [conversationId, setConversationId] = useState("");

  const [chats, setChats] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [reminder, setReminder] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // ===============================
  // LOAD
  // ===============================
  useEffect(() => {
    const saved = localStorage.getItem("chat_data");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed.chats && parsed.chats.length > 0) {
          setChats(parsed.chats);
          setActiveIndex(parsed.activeIndex || 0);
        } else {
          const firstChat = {
            messages: [],
            conversationId: "",
            createdAt: new Date().toISOString()
          };
          setChats([firstChat]);
          setActiveIndex(0);
        }

      } catch (err) {
        console.error(err);
      }
    } else {
      const firstChat = {
        messages: [],
        conversationId: "",
        createdAt: new Date().toISOString()
      };
      setChats([firstChat]);
      setActiveIndex(0);
    }

    setIsLoaded(true);
  }, []);

  // ===============================
  // SAVE
  // ===============================
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      "chat_data",
      JSON.stringify({
        chats,
        activeIndex
      })
    );
  }, [chats, activeIndex, isLoaded]);

  // ===============================
  // SYNC ACTIVE CHAT
  // ===============================
  useEffect(() => {
    if (chats[activeIndex]) {
      setMessages(chats[activeIndex].messages || []);
      setConversationId(chats[activeIndex].conversationId || "");
    }
  }, [activeIndex, chats]);

  // ===============================
  // UPDATE MESSAGES
  // ===============================
  const updateMessages = (newMessages) => {

    // ✅ SAFETY FILTER (VERY IMPORTANT FIX)
    const safeMessages = (newMessages || []).filter(m => m && m.content);

    setMessages(safeMessages);

    setChats(prev => {
      const updated = [...prev];

      if (!updated[activeIndex]) {
        updated.push({
          messages: safeMessages,
          conversationId: "",
          createdAt: new Date().toISOString()
        });
        return updated;
      }

      updated[activeIndex] = {
        ...updated[activeIndex],
        messages: safeMessages
      };

      return updated;
    });
  };

  const updateConversationId = (id) => {

    setConversationId(id);

    setChats(prev => {
      const updated = [...prev];

      if (!updated[activeIndex]) return prev;

      updated[activeIndex] = {
        ...updated[activeIndex],
        conversationId: id
      };

      return updated;
    });
  };

  // ===============================
  // NEW CHAT
  // ===============================
  const createNewChat = () => {

    const newChat = {
      messages: [],
      conversationId: "",
      createdAt: new Date().toISOString()
    };

    setChats(prev => {
      const updated = [...prev, newChat];
      setActiveIndex(updated.length - 1);
      return updated;
    });
  };

  // ===============================
  // DELETE CHAT
  // ===============================
  const deleteChat = (index) => {

    setChats(prev => {
      const updated = prev.filter((_, i) => i !== index);

      if (index === activeIndex) {
        setActiveIndex(Math.max(0, index - 1));
      }

      return updated;
    });
  };

  // ===============================
  // SMART TITLE (🔥 FIXED SAFELY)
  // ===============================
  const getTitle = (chat) => {

    if (!chat) return "New Chat";

    if (chat.messages && chat.messages.length > 0) {

      const firstMsg = chat.messages[0];

      // ✅ CRITICAL FIX
      if (!firstMsg || !firstMsg.content) return "New Chat";

      const text = firstMsg.content.toLowerCase();

      if (text.includes("fever")) return "Fever Help 🌡️";
      if (text.includes("stress")) return "Stress Talk 🌿";
      if (text.includes("sad")) return "Emotional Support 💛";
      if (text.includes("hello")) return "General Chat 💬";

      return firstMsg.content.slice(0, 25);
    }

    const date = new Date(chat.createdAt);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ===============================
  // REMINDER
  // ===============================
  useEffect(() => {

    if (!messages.length) {
      setReminder("Hi 👋 I'm here for you. Tell me how you're feeling.");
      return;
    }

    const lastMsg = messages[messages.length - 1];

    // ✅ SAFETY FIX
    if (!lastMsg || !lastMsg.content) return;

    const last = lastMsg.content.toLowerCase();

    if (last.includes("fever")) setReminder("Stay hydrated 🌡️");
    else if (last.includes("stress")) setReminder("Take a break 🌿");
    else setReminder("Take care 💚");

  }, [messages]);

  return (
    <div className="flex h-screen bg-[#fdf8f3]">

      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-4">

        <h1 className="text-xl font-bold mb-4">Arundhati</h1>

        <button
          onClick={createNewChat}
          className="mb-4 p-2 bg-gray-100 rounded-lg w-full"
        >
          + New Chat
        </button>

        {chats.map((chat, i) => (
          <div
            key={i}
            className={`p-2 rounded cursor-pointer flex justify-between items-center group ${
              activeIndex === i ? "bg-green-100" : "hover:bg-gray-100"
            }`}
          >
            <span onClick={() => setActiveIndex(i)}>
              {getTitle(chat)}
            </span>

            <button
              onClick={() => deleteChat(i)}
              className="opacity-0 group-hover:opacity-100 text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="flex flex-col flex-1">

        <div className="p-4 bg-white border-b">Chat</div>

        <div className="p-6">
          <div className="bg-yellow-100 p-4 rounded mb-4">
            {reminder}
          </div>

          <VoiceOrb state={voiceState} />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ChatWindow messages={messages} />
        </div>

        <InputBox
          messages={messages}
          setMessages={updateMessages}
          voiceState={voiceState}
          setVoiceState={setVoiceState}
          conversationId={conversationId}
          setConversationId={updateConversationId}
        />

      </div>
    </div>
  );
}