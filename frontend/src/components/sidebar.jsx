import React from "react";
import "./Sidebar.css";

const Sidebar = ({ conversations, activeId, setActiveId, createNewChat }) => {

  const getTitle = (messages) => {
    if (!messages || messages.length === 0) return "New Chat";
    return messages[0].user.slice(0, 35);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <button className="new-chat" onClick={createNewChat}>
          + New Chat
        </button>
      </div>

      <div className="sidebar-list">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className={`sidebar-item ${chat.id === activeId ? "active" : ""}`}
            onClick={() => setActiveId(chat.id)}
          >
            {getTitle(chat.messages)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;