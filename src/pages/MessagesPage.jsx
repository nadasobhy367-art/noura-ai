import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');

  // User info
  const userName = sessionStorage.getItem('userName') || 'User';
  // const userRole = sessionStorage.getItem('userRole') || 'patient';
  const userId = sessionStorage.getItem('userId') || 'PT-0000';

  // ==================== INITIAL DATA ====================
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Simulate loading conversations
    setTimeout(() => {
      const sampleConversations = [
        {
          id: 1,
          participantId: 'DR-2026-001',
          participantName: 'د. أحمد محمود',
          role: 'doctor',
          lastMessage: 'Your scan results look normal. Continue routine screening.',
          timestamp: '2026-03-27 14:30:00',
          unread: false,
          avatar: '👨‍⚕️',
        },
        {
          id: 2,
          participantId: 'NU-2026-001',
          participantName: 'ممرضة سارة',
          role: 'nurse',
          lastMessage: 'Your results are ready. Please check your dashboard.',
          timestamp: '2026-03-27 13:45:00',
          unread: true,
          avatar: '💉',
        },
        {
          id: 3,
          participantId: 'PT-2026-002',
          participantName: 'مريم حسين',
          role: 'patient',
          lastMessage: 'Thank you for the information, doctor.',
          timestamp: '2026-03-27 12:20:00',
          unread: false,
          avatar: '👤',
        },
        {
          id: 4,
          participantId: 'AD-2026-001',
          participantName: 'مدير النظام',
          role: 'admin',
          lastMessage: 'System maintenance scheduled for tonight.',
          timestamp: '2026-03-27 11:15:00',
          unread: false,
          avatar: '👑',
        },
      ];

      setConversations(sampleConversations);

      // Check if we have a recipient from navigation state
      if (location.state?.recipient) {
        const conv = sampleConversations.find(
          c =>
            c.participantName.includes(location.state.recipient) ||
            c.participantId === location.state.patientId
        );
        if (conv) {
          handleSelectConversation(conv);
        } else {
          // Create new conversation
          const newConv = {
            id: 5,
            participantId: location.state.patientId || 'PT-0000',
            participantName: location.state.recipient,
            role: 'patient',
            lastMessage: 'New conversation started',
            timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
            unread: false,
            avatar: '👤',
          };
          setSelectedConversation(newConv);
          loadMessages(newConv);
        }
      } else if (sampleConversations.length > 0) {
        handleSelectConversation(sampleConversations[0]);
      }

      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // ==================== SAMPLE MESSAGES ====================
  const loadMessages = conversation => {
    const sampleMessages = [
      {
        id: 1,
        senderId: conversation.participantId,
        senderName: conversation.participantName,
        content: `Hello ${userName}, I'm reviewing your recent scan results.`,
        timestamp: '2026-03-27 10:15:00',
        isOwn: false,
        read: true,
        type: 'text',
      },
      {
        id: 2,
        senderId: userId,
        senderName: userName,
        content: 'Thank you doctor. When will the results be available?',
        timestamp: '2026-03-27 10:18:00',
        isOwn: true,
        read: true,
        type: 'text',
      },
      {
        id: 3,
        senderId: conversation.participantId,
        senderName: conversation.participantName,
        content: 'The AI analysis is complete. Results show no abnormalities detected.',
        timestamp: '2026-03-27 10:22:00',
        isOwn: false,
        read: true,
        type: 'text',
      },
      {
        id: 4,
        senderId: conversation.participantId,
        senderName: conversation.participantName,
        content:
          'You can view the detailed report in your dashboard. Continue with routine screening in 12 months.',
        timestamp: '2026-03-27 10:25:00',
        isOwn: false,
        read: true,
        type: 'text',
      },
      {
        id: 5,
        senderId: userId,
        senderName: userName,
        content: "That's great news. Thank you for the update!",
        timestamp: '2026-03-27 10:30:00',
        isOwn: true,
        read: true,
        type: 'text',
      },
      {
        id: 6,
        senderId: conversation.participantId,
        senderName: conversation.participantName,
        content: "You're welcome. Remember to track any symptoms and follow your routine checkups.",
        timestamp: '2026-03-27 14:30:00',
        isOwn: false,
        read: true,
        type: 'text',
      },
    ];

    setMessages(sampleMessages);
    setSelectedConversation(conversation);

    // Mark conversation as read
    setConversations(prev =>
      prev.map(conv => (conv.id === conversation.id ? { ...conv, unread: false } : conv))
    );
  };

  // ==================== FUNCTIONS ====================
  const handleSelectConversation = conversation => {
    loadMessages(conversation);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      senderId: userId,
      senderName: userName,
      content: newMessage,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      isOwn: true,
      read: true,
      type: 'text',
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, timestamp: message.timestamp }
          : conv
      )
    );

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartNewConversation = () => {
    if (!recipient.trim()) {
      alert('Please enter a recipient');
      return;
    }

    const newConv = {
      id: conversations.length + 1,
      participantId: 'NEW-' + Date.now(),
      participantName: recipient,
      role: 'patient',
      lastMessage: subject || 'New conversation started',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
      unread: false,
      avatar: '👤',
    };

    setConversations([newConv, ...conversations]);
    setSelectedConversation(newConv);
    setMessages([]);
    setShowNewMessageModal(false);
    setRecipient('');
    setSubject('');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDateTime = dateTimeString => {
    const date = new Date(dateTimeString.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = role => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'patient':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = role => {
    switch (role) {
      case 'doctor':
        return '👨‍⚕️';
      case 'nurse':
        return '💉';
      case 'admin':
        return '👑';
      case 'patient':
        return '👤';
      default:
        return '👤';
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading messages...</p>
          <p className="text-gray-400 text-sm mt-2">Secure encrypted messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Secure Messages</h1>
                <p className="text-xs text-gray-500">Encrypted medical communication</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">Security:</span> End-to-End Encrypted
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Medical Communication</h2>
                  <p className="text-blue-100">
                    Secure, encrypted messaging with healthcare providers
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      🔐 End-to-End Encryption
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      💬 HIPAA Compliant
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      📨 Secure Delivery
                    </span>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <div className="text-center">
                    <div className="text-4xl font-bold">🛡️</div>
                    <p className="text-sm mt-2 text-blue-100">Maximum Security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messaging Interface */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row h-[600px]">
              {/* Left Sidebar - Conversations */}
              <div className="lg:w-1/3 border-r border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Conversations</h3>
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg text-sm"
                    >
                      + New Message
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">🔍</span>
                  </div>
                </div>

                <div className="overflow-y-auto h-[calc(600px-140px)]">
                  {conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                          <span className="text-xl">{conversation.avatar}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 truncate">
                              {conversation.participantName}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(conversation.timestamp)}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm truncate mb-2">
                            {conversation.lastMessage}
                          </p>

                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(conversation.role)}`}
                            >
                              {conversation.role === 'doctor'
                                ? '👨‍⚕️ Doctor'
                                : conversation.role === 'nurse'
                                  ? '💉 Nurse'
                                  : conversation.role === 'admin'
                                    ? '👑 Admin'
                                    : '👤 Patient'}
                            </span>

                            {conversation.unread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Messages */}
              <div className="lg:w-2/3 flex flex-col">
                {/* Conversation Header */}
                {selectedConversation ? (
                  <>
                    <div className="p-6 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                            <span className="text-xl">
                              {getRoleIcon(selectedConversation.role)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {selectedConversation.participantName}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(selectedConversation.role)}`}
                              >
                                {selectedConversation.role === 'doctor'
                                  ? 'Doctor'
                                  : selectedConversation.role === 'nurse'
                                    ? 'Nurse'
                                    : selectedConversation.role === 'admin'
                                      ? 'Admin'
                                      : 'Patient'}
                              </span>
                              <span className="ml-2">ID: {selectedConversation.participantId}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => alert('Calling ' + selectedConversation.participantName)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title="Voice Call"
                          >
                            📞
                          </button>
                          <button
                            onClick={() =>
                              alert('Video call ' + selectedConversation.participantName)
                            }
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title="Video Call"
                          >
                            📹
                          </button>
                          <button
                            onClick={() => alert('More options')}
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title="More"
                          >
                            ⋮
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💬</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            Start a Conversation
                          </h4>
                          <p className="text-gray-600">
                            Send a message to {selectedConversation.participantName}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {messages.map(message => (
                            <div
                              key={message.id}
                              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl p-4 ${
                                  message.isOwn
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 rounded-bl-none'
                                }`}
                              >
                                {!message.isOwn && (
                                  <div className="flex items-center mb-2">
                                    <span className="font-medium text-gray-900">
                                      {message.senderName}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span className="text-xs text-gray-500">
                                      {formatDateTime(message.timestamp)}
                                    </span>
                                  </div>
                                )}

                                <p className={message.isOwn ? '' : 'text-gray-800'}>
                                  {message.content}
                                </p>

                                {message.isOwn && (
                                  <div className="flex justify-end mt-2">
                                    <span className="text-xs opacity-80">
                                      {formatDateTime(message.timestamp)}
                                      {message.read && <span className="ml-2">✓✓</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-gray-200 bg-white">
                      <div className="flex space-x-4">
                        <div className="flex-1 relative">
                          <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="2"
                          />
                          <div className="absolute right-3 bottom-3 flex space-x-2">
                            <button className="text-gray-500 hover:text-blue-600">📎</button>
                            <button className="text-gray-500 hover:text-blue-600">🖼️</button>
                          </div>
                        </div>

                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <span className="mr-2">📤</span>
                          Send
                        </button>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">🔐</span>
                          Messages are end-to-end encrypted
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No Conversation Selected */
                  <div className="flex-1 flex items-center justify-center p-12">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-4xl">💬</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Select a conversation
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md">
                        Choose a conversation from the list or start a new one to begin messaging.
                      </p>
                      <button
                        onClick={() => setShowNewMessageModal(true)}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                      >
                        Start New Conversation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-xl">🔐</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">End-to-End Encryption</h4>
                  <p className="text-gray-600 text-sm">AES-256 encryption for all messages</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">HIPAA Compliant</h4>
                  <p className="text-gray-600 text-sm">Medical privacy standards enforced</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-xl">📁</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Secure File Sharing</h4>
                  <p className="text-gray-600 text-sm">Encrypted medical file transfer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Noura AI Secure Messaging. Medical Communication System.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            All communications are encrypted, logged, and HIPAA compliant.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span className="text-xs text-gray-500">🔐 End-to-End Encryption</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">🛡️ HIPAA Compliant</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">📨 Secure Delivery</span>
          </div>
        </div>
      </footer>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">New Message</h3>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Recipient *
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter name or ID (e.g., DR-2026-001)"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Quick Recipients
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {conversations.slice(0, 4).map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setRecipient(conv.participantName);
                          setSubject('Follow-up');
                        }}
                        className="p-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 text-left"
                      >
                        <div className="font-medium">{conv.participantName}</div>
                        <div className="text-gray-500 text-xs">{conv.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartNewConversation}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg"
                >
                  Start Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
