import { useState, useEffect } from 'react';
import './App.css';

// Simulate socket behavior with custom event system
const createSocketSimulator = () => {
  let callbacks = {};

  return {
    emit: (event, data) => {
      // Simulate network delay
      setTimeout(() => {
        if (event === 'send_message' && callbacks['receive_message']) {
          // For messages, broadcast to all "listeners"
          callbacks['receive_message'](data);
        } else if (event === 'join_room' && callbacks['room_joined']) {
          // Confirm room joining
          callbacks['room_joined'](data);
        } else if (event === 'delete_message' && callbacks['message_deleted']) {
          // Handle message deletion
          callbacks['message_deleted'](data);
        }
      }, 100);
    },
    on: (event, callback) => {
      callbacks[event] = callback;
    },
    off: (event) => {
      delete callbacks[event];
    },
    id: Math.random().toString(36).substring(2, 10), // Generate a random ID
  };
};

const socket = createSocketSimulator();

export default function App() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'John Smith',
      avatar: 'JS',
      preview: 'Hey, how are you doing?',
      time: '10:42 AM',
      online: true,
      messages: [
        { text: "Hi there! How's it going?", time: '10:30 AM', sender: 'other' },
        { text: 'Hey, how are you doing?', time: '10:42 AM', sender: 'other' },
      ],
    },
    {
      id: 2,
      name: 'Emma Miller',
      avatar: 'EM',
      preview: 'Are we still meeting tomorrow?',
      time: 'Yesterday',
      online: false,
      messages: [{ text: 'Hi, are we still meeting tomorrow?', time: 'Yesterday', sender: 'other' }],
    },
    {
      id: 3,
      name: 'David Rodriguez',
      avatar: 'DR',
      preview: 'I sent you the documents',
      time: 'Wednesday',
      online: false,
      messages: [{ text: 'I sent you the documents', time: 'Wednesday', sender: 'other' }],
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      preview: 'Thanks for your help!',
      time: 'Monday',
      online: true,
      messages: [{ text: 'Thanks for your help!', time: 'Monday', sender: 'other' }],
    },
    {
      id: 5,
      name: 'Mike Wilson',
      avatar: 'MW',
      preview: "Let me know when you're free",
      time: 'Sep 12',
      online: false,
      messages: [{ text: "Let me know when you're free", time: 'Sep 12', sender: 'other' }],
    },
  ]);
  const [activeConversation, setActiveConversation] = useState(1);

  const handleSendMsg = () => {
    if (input.trim() !== '') {
      const messageData = {
        message: input,
        sender: socket.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      socket.emit('send_message', messageData);

      // Update the active conversation with the new message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === activeConversation) {
            return {
              ...conv,
              messages: [...conv.messages, { text: input, time: messageData.time, sender: 'self' }],
              preview: input,
              time: 'Just now',
            };
          }
          return conv;
        })
      );

      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMsg();
    }
  };

  const handleDeleteMessage = (index) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversation) {
          const newMessages = [...conv.messages];
          newMessages.splice(index, 1);
          return {
            ...conv,
            messages: newMessages,
            preview: newMessages.length > 0 ? newMessages[newMessages.length - 1].text : 'No messages',
            time: newMessages.length > 0 ? newMessages[newMessages.length - 1].time : conv.time,
          };
        }
        return conv;
      })
    );
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (data.sender !== socket.id) {
        // For demo purposes, we'll simulate receiving messages only for active conversation
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === activeConversation) {
              return {
                ...conv,
                messages: [...conv.messages, { text: data.message, time: data.time, sender: 'other' }],
                preview: data.message,
                time: 'Just now',
              };
            }
            return conv;
          })
        );
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [activeConversation]);

  const activeConvData = conversations.find((conv) => conv.id === activeConversation) || conversations[0];

  return (
    <div className="chat-container">
      {/* Sidebar Container */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Chats</h2>
        </div>
        <div className="search-container">
          <input type="text" className="search-box" placeholder="Search..." />
        </div>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <div key={conversation.id} className={`conversation ${conversation.id === activeConversation ? 'active' : ''}`} onClick={() => setActiveConversation(conversation.id)}>
              <div className="avatar">{conversation.avatar}</div>
              <div className="conversation-info">
                <div className="conversation-name">{conversation.name}</div>
                <div className="conversation-preview">{conversation.preview}</div>
              </div>
              <div className="conversation-time">{conversation.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User Info Chat Header */}
      <div className="chat-area">
        <div className="chat-header">
          <div className="avatar">{activeConvData.avatar}</div>
          <div className="chat-header-info">
            <div className="chat-header-name">{activeConvData.name}</div>
            <div className="chat-header-status">{activeConvData.online ? 'Online' : 'Offline'}</div>
          </div>
        </div>

        <div className="messages-container">
          {activeConvData.messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'self' ? 'sent' : 'received'}`}>
              <div className="message-bubble">{message.text}</div>
              <div className="message-time">{message.time}</div>
              {message.sender === 'self' && (
                <button className="delete-button" onClick={() => handleDeleteMessage(index)}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="input-area">
          <div className="icon">😊</div>
          <input type="text" className="message-input" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} />
          <button className="send-button" onClick={handleSendMsg}>
            <div className="icon" style={{ color: 'white' }}>
              ➤
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
