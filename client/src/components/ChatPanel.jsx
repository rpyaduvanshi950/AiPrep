import React, { useRef, useEffect } from 'react';

export default function ChatPanel({ chat, loading }) {
  const panelRef = useRef();

  // Scroll to bottom on new chat
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [chat.length]);

  return (
    <div className="chat-panel" ref={panelRef}>
      {loading && <div className="loading">Loading...</div>}
      {chat.map((item) => (
        <div key={item.id + item.question} className="chat-pair">
          <div className="chat-bubble question">{item.question}</div>
          <div className="chat-bubble answer">
            {item.answer ? item.answer : <span className="loading">Writing...</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
