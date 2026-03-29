import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }) {

  console.log("MESSAGES:", messages);

  const bottomRef = useRef(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SAFETY FIX (keep this)
  const safeMessages = Array.isArray(messages)
    ? messages.filter(m => m && m.content)
    : [];

  if (safeMessages.length === 0) {
    return <p className="text-gray-400">No messages yet</p>;
  }

  return (
    <div className="space-y-4">

      {safeMessages.map((msg, index) => (
        <div key={index}>
          <MessageBubble
            role={msg.role || "assistant"}
            content={msg.content || ""}
          />
        </div>
      ))}

      {/* 🔥 THIS IS THE MAGIC LINE */}
      <div ref={bottomRef} />

    </div>
  );
}