import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

export default function App() {
  const [room, setRoom] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const joinRoom = () => {
    if (room.trim() !== '') {
      socket.emit('join_room', room);
    }
  };

  const handleSendMsg = () => {
    if (input.trim() !== '' && room !== '') {
      const filteredMessage = input;

      const messageData = {
        room,
        message: filteredMessage,
        sender: socket.id,
      };

      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, { ...messageData, self: true }]);
      setInput('');
    }
  };

  const handleDeleteMessage = (id) => {
    if (id === null) return;
    const filteredMessage = messages.filter((msg, index) => index !== id);
    socket.emit('delete_message', { room, message: filteredMessage });
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (data.sender !== socket.id) {
        setMessages((prev) => [...prev, { ...data, self: false }]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
        </div>
        <div className="search-container">
          <input type="text" className="search-box" placeholder="Search..." />
        </div>
        <div className="conversation-list">
          <div className="conversation active">
            <div className="avatar">JS</div>
            <div className="conversation-info">
              <div className="conversation-name">John Smith</div>
              <div className="conversation-preview">Hey, how are you doing?</div>
            </div>
            <div className="conversation-time">10:42 AM</div>
          </div>

          <div className="conversation">
            <div className="avatar">EM</div>
            <div className="conversation-info">
              <div className="conversation-name">Emma Miller</div>
              <div className="conversation-preview">Are we still meeting tomorrow?</div>
            </div>
            <div className="conversation-time">Yesterday</div>
          </div>

          <div className="conversation">
            <div className="avatar">DR</div>
            <div className="conversation-info">
              <div className="conversation-name">David Rodriguez</div>
              <div className="conversation-preview">I sent you the documents</div>
            </div>
            <div className="conversation-time">Wednesday</div>
          </div>

          <div className="conversation">
            <div className="avatar">SJ</div>
            <div className="conversation-info">
              <div className="conversation-name">Sarah Johnson</div>
              <div className="conversation-preview">Thanks for your help!</div>
            </div>
            <div className="conversation-time">Monday</div>
          </div>

          <div className="conversation">
            <div className="avatar">MW</div>
            <div className="conversation-info">
              <div className="conversation-name">Mike Wilson</div>
              <div className="conversation-preview">Let me know when you're free</div>
            </div>
            <div className="conversation-time">Sep 12</div>
          </div>
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <div className="avatar">JS</div>
          <div className="chat-header-info">
            <div className="chat-header-name">John Smith</div>
            <div className="chat-header-status">Online</div>
          </div>
        </div>

        <div className="messages-container">
          <div className="message received">
            <div className="message-bubble">Hi there! How's it going?</div>
            <div className="message-time">10:30 AM</div>
          </div>
        </div>

        <div className="input-area">
          <div className="icon">😊</div>
          <input type="text" className="message-input" placeholder="Type a message..." />
          <button className="send-button">
            <div className="icon" style={{ color: 'white' }}>
              ➤
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
