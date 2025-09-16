import React, { useState } from 'react';

export default function ChatBox({ onSend }) {
  const [value, setValue] = useState('');

  function handleChange(e) {
    setValue(e.target.value);
  }

  function handleSend() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-box">
      <textarea
        className="chat-input"
        rows={1}
        placeholder="Type your question..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{ resize: 'none' }}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!value.trim()}
      >
        Send
      </button>
    </div>
  );
}
