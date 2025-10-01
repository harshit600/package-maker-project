import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Chat.css';

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

export default function Chat() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchInUsers, setSearchInUsers] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [allConversations, setAllConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'chats'
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserData = currentUser?.data;

  useEffect(() => {
    fetchUsers();
    fetchAllConversations();
    // Load existing notifications from localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('chatNotifications') || '[]');
    if (savedNotifications.length > 0) {
      setNotifications(savedNotifications);
      setShowNotification(true);
    }
  }, []);

  useEffect(() => {
    if (currentUserData?.companyName) {
      filterUsersByCompany();
    }
  }, [users, currentUserData]);

  useEffect(() => {
    if (currentUserData?._id) {
      initializeSocket();
    }
  }, [currentUserData]);

  useEffect(() => {
    // Listen for user selection from global notification
    const handleSelectChatUser = (e) => {
      const { userId } = e.detail;
      const user = filteredUsers.find(u => u._id === userId);
      if (user) {
        setSelectedUser(user);
        setShowNotification(false);
      }
    };

    window.addEventListener('selectChatUser', handleSelectChatUser);
    return () => {
      window.removeEventListener('selectChatUser', handleSelectChatUser);
    };
  }, [filteredUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.API_HOST}/api/maker/get-maker`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  const filterUsersByCompany = () => {
    if (!currentUserData?.companyName) return;
    
    const filtered = users.filter(user => 
      user.companyName === currentUserData.companyName && 
      user._id !== currentUserData._id
    );
    setFilteredUsers(filtered);
  };

  const initializeSocket = () => {
    const newSocket = io(config.API_HOST);
    setSocket(newSocket);

    newSocket.emit('user:connect', currentUserData._id);

    newSocket.on('user:connected', (data) => {
      console.log('Connected to chat:', data);
      // Check for missed messages when user comes online
      checkForMissedMessages();
    });

    newSocket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversations list
      fetchAllConversations();
      
      // Show notification if not in current conversation
      if (selectedUser?._id !== message.senderId._id) {
        showMessageNotification(message);
      }
    });

    newSocket.on('message:sent', (message) => {
      setMessages(prev => [...prev, message]);
      // Update conversations list when sending message
      fetchAllConversations();
    });

    newSocket.on('typing:started', (data) => {
      setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
    });

    newSocket.on('typing:stopped', (data) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    });

    newSocket.on('users:online', (data) => {
      setOnlineUsers(data.users);
    });

    newSocket.on('user:online', (data) => {
      setOnlineUsers(prev => [...prev, data.userId]);
    });

    newSocket.on('user:offline', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    newSocket.on('error', (error) => {
      toast.error(error.message);
    });
  };

  const fetchConversation = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `${config.API_HOST}/api/chat/conversation/${currentUserData._id}/${selectedUser._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read when opening conversation
        markMessagesAsRead();
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedUser || !currentUserData) return;

    try {
      const conversationId = [currentUserData._id, selectedUser._id].sort().join('_');
      
      const response = await fetch(`${config.API_HOST}/api/chat/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          userId: currentUserData._id
        }),
      });

      if (response.ok) {
        // Refresh conversations to update unread counts
        fetchAllConversations();
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const fetchAllConversations = async () => {
    if (!currentUserData?._id) return;

    try {
      const response = await fetch(
        `${config.API_HOST}/api/chat/conversations/${currentUserData._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setAllConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const messageData = {
      senderId: currentUserData._id,
      receiverId: selectedUser._id,
      message: newMessage.trim(),
      messageType: 'text'
    };

    socket.emit('message:send', messageData);
    setNewMessage('');
    stopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startTyping = () => {
    if (!isTyping && selectedUser) {
      setIsTyping(true);
      socket.emit('typing:start', {
        senderId: currentUserData._id,
        receiverId: selectedUser._id
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    if (isTyping && selectedUser) {
      setIsTyping(false);
      socket.emit('typing:stop', {
        senderId: currentUserData._id,
        receiverId: selectedUser._id
      });
    }
    clearTimeout(typingTimeoutRef.current);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/chat/delete-message/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted successfully');
      } else {
        toast.error('Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteMessage = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage(messageToDelete._id);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchInUsers) {
      // Search in users
      const results = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.designation.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      // Search in messages
      const results = messages.filter(message => 
        message.message.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
    
    setShowSearchResults(true);
  };

  const handleUserSearch = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleConversationSelect = (conversation) => {
    const user = filteredUsers.find(u => u._id === conversation.otherUser._id);
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleMessageSearch = (message) => {
    // Scroll to the message
    const messageElement = document.getElementById(`message-${message._id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message temporarily
      messageElement.classList.add('search-highlight');
      setTimeout(() => {
        messageElement.classList.remove('search-highlight');
      }, 2000);
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const showMessageNotification = (message) => {
    const notification = {
      id: Date.now(),
      senderName: `${message.senderId.firstName} ${message.senderId.lastName}`,
      message: message.message,
      senderId: message.senderId._id,
      timestamp: new Date()
    };

    // Store notification in localStorage for persistence
    const existingNotifications = JSON.parse(localStorage.getItem('chatNotifications') || '[]');
    const updatedNotifications = [notification, ...existingNotifications.slice(0, 9)]; // Keep last 10
    localStorage.setItem('chatNotifications', JSON.stringify(updatedNotifications));
    
    setNotifications(updatedNotifications);
    setShowNotification(true);

    // Dispatch custom event for global notification
    window.dispatchEvent(new CustomEvent('newChatNotification', { 
      detail: { notification } 
    }));

    // Also show toast notification
    toast.info(`New message from ${notification.senderName}`);
  };

  const handleNotificationClick = (notification) => {
    // Find the user who sent the message
    const user = filteredUsers.find(u => u._id === notification.senderId);
    if (user) {
      setSelectedUser(user);
      setShowNotification(false);
    }
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  const clearAllNotifications = () => {
    localStorage.removeItem('chatNotifications');
    setNotifications([]);
    setShowNotification(false);
  };

  const checkForMissedMessages = async () => {
    if (!currentUserData?._id) return;

    try {
      // Get unread count for current user
      const response = await fetch(
        `${config.API_HOST}/api/chat/unread-count/${currentUserData._id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.unreadCount;
        
        if (unreadCount > 0) {
          // Show notification about missed messages
          toast.info(`You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`);
          
          // Refresh conversations to show unread indicators
          fetchAllConversations();
        }
      }
    } catch (err) {
      console.error('Error checking for missed messages:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ToastContainer />
      
      {/* Notification Panel */}
      {showNotification && notifications.length > 0 && (
        <div className="notification-panel">
          <div className="notification-header">
            <div className="notification-title">
              <svg className="notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>New Messages ({notifications.length})</span>
            </div>
            <div className="notification-actions">
              <button 
                className="clear-all-btn" 
                onClick={clearAllNotifications}
                title="Clear all notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button 
                className="dismiss-btn" 
                onClick={dismissNotification}
                title="Dismiss notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-avatar">
                  {notification.senderName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="notification-content">
                  <div className="notification-sender">{notification.senderName}</div>
                  <div className="notification-message">
                    {notification.message.length > 50 
                      ? `${notification.message.substring(0, 50)}...` 
                      : notification.message
                    }
                  </div>
                  <div className="notification-time">
                    {formatTime(notification.timestamp)}
                  </div>
                </div>
                <div className="notification-indicator"></div>
              </div>
            ))}
            
            {notifications.length > 3 && (
              <div className="notification-more">
                +{notifications.length - 3} more messages
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Left Side - User List */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <h3>Chat</h3>
          <div className="user-info">
            <div className="user-avatar">
              {currentUserData?.firstName?.charAt(0)}{currentUserData?.lastName?.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">
                {currentUserData?.firstName} {currentUserData?.lastName}
              </span>
              <span className="user-company">{currentUserData?.companyName}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search users or messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={clearSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Toggle */}
          <div className="search-toggle">
            <button
              className={`toggle-btn ${searchInUsers ? 'active' : ''}`}
              onClick={() => setSearchInUsers(true)}
            >
              Users
            </button>
            <button
              className={`toggle-btn ${!searchInUsers ? 'active' : ''}`}
              onClick={() => setSearchInUsers(false)}
            >
              Messages
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="chat-tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({filteredUsers.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            All Chats ({allConversations.length})
          </button>
        </div>

        <div className="users-list">
          {activeTab === 'users' && (
            <>
              <h4>Team Members ({filteredUsers.length})</h4>
          
          {/* Search Results */}
          {showSearchResults && searchQuery && (
            <div className="search-results">
              <div className="search-results-header">
                <span>Search Results ({searchResults.length})</span>
                <button className="close-search-btn" onClick={clearSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchInUsers ? (
                    // User search results
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="search-result-item user-result"
                        onClick={() => handleUserSearch(user)}
                      >
                        <div className="user-avatar">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div className="user-info">
                          <div className="user-name">
                            {user.firstName} {user.lastName}
                            {onlineUsers.includes(user._id) && <span className="online-indicator"></span>}
                          </div>
                          <div className="user-designation">{user.designation}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Message search results
                    searchResults.map((message) => (
                      <div
                        key={message._id}
                        className="search-result-item message-result"
                        onClick={() => handleMessageSearch(message)}
                      >
                        <div className="message-preview">
                          <div className="message-sender">
                            {message.senderId.firstName} {message.senderId.lastName}
                          </div>
                          <div className="message-text">
                            {message.message.length > 50 
                              ? `${message.message.substring(0, 50)}...` 
                              : message.message
                            }
                          </div>
                          <div className="message-time">
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="no-search-results">
                  <p>No {searchInUsers ? 'users' : 'messages'} found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Regular User List */}
          {!showSearchResults && filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user.firstName} {user.lastName}
                  {onlineUsers.includes(user._id) && <span className="online-indicator"></span>}
                </div>
                <div className="user-designation">{user.designation}</div>
              </div>
            </div>
          ))}
            </>
          )}

          {/* All Chats Tab */}
          {activeTab === 'chats' && (
            <>
              <h4>All Conversations ({allConversations.length})</h4>
              {allConversations.length > 0 ? (
                allConversations.map((conversation) => (
                  <div
                    key={conversation.conversationId}
                    className={`conversation-item ${selectedUser?._id === conversation.otherUser._id ? 'selected' : ''}`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="user-avatar">
                      {conversation.otherUser.firstName?.charAt(0)}{conversation.otherUser.lastName?.charAt(0)}
                    </div>
                    <div className="user-info">
                      <div className="user-name">
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                        {onlineUsers.includes(conversation.otherUser._id) && <span className="online-indicator"></span>}
                      </div>
                      <div className="last-message">
                        {conversation.lastMessage.message.length > 30 
                          ? `${conversation.lastMessage.message.substring(0, 30)}...` 
                          : conversation.lastMessage.message
                        }
                      </div>
                      <div className="message-time">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="unread-badge">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-conversations">
                  <p>No conversations yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-conversation-header">
              <div className="user-avatar">
                {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {selectedUser.firstName} {selectedUser.lastName}
                  {onlineUsers.includes(selectedUser._id) && <span className="online-indicator"></span>}
                </div>
                <div className="user-status">
                  {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === currentUserData._id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message._id} id={`message-${message._id}`}>
                    {showDate && (
                      <div className="date-separator">
                        {formatDate(message.createdAt)}
                      </div>
                    )}
                    <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                      <div className="message-content">
                        <div className="message-text">{message.message}</div>
                        <div className="message-time">
                          {formatTime(message.createdAt)}
                          {isOwnMessage && message.isRead && <span className="read-indicator">✓✓</span>}
                        </div>
                        {isOwnMessage && (
                          <div className="message-actions">
                            <button
                              className="delete-message-btn"
                              onClick={() => handleDeleteMessage(message)}
                              title="Delete message"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.includes(selectedUser._id) && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    startTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="message-text-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="send-button"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <div className="no-conversation-content">
              <div className="chat-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3>Select a conversation</h3>
              <p>Choose a team member to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Message Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h3>Delete Message</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this message?</p>
              <div className="message-preview">
                "{messageToDelete?.message}"
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
