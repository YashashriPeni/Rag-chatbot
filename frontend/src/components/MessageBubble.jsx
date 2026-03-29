export default function MessageBubble({ role, content }) {

  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>

      <div
        className={`max-w-[70%] px-4 py-2 rounded-xl ${
          isUser
            ? "bg-black text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {content || ""}
      </div>

    </div>
  );
}