import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './GlobalNotification.css';

export default function GlobalNotification() {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const currentUserData = currentUser?.data;

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('chatNotifications') || '[]');
    if (savedNotifications.length > 0) {
      setNotifications(savedNotifications);
      setShowNotification(true);
    }

    // Listen for storage changes (when new notifications are added from chat)
    const handleStorageChange = (e) => {
      if (e.key === 'chatNotifications') {
        const newNotifications = JSON.parse(e.newValue || '[]');
        setNotifications(newNotifications);
        setShowNotification(newNotifications.length > 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleCustomNotification = (e) => {
      const newNotifications = JSON.parse(localStorage.getItem('chatNotifications') || '[]');
      setNotifications(newNotifications);
      setShowNotification(newNotifications.length > 0);
    };

    window.addEventListener('newChatNotification', handleCustomNotification);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('newChatNotification', handleCustomNotification);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    // Navigate to sale dashboard (where chat is located)
    navigate('/sale-dashboard');
    // The chat component will handle selecting the user
    window.dispatchEvent(new CustomEvent('selectChatUser', { 
      detail: { userId: notification.senderId } 
    }));
  };

  const dismissNotification = () => {
    setShowNotification(false);
  };

  const clearAllNotifications = () => {
    localStorage.removeItem('chatNotifications');
    setNotifications([]);
    setShowNotification(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showNotification || notifications.length === 0) {
    return null;
  }

  return (
    <div className="global-notification-panel">
      <div className="global-notification-header">
        <div className="global-notification-title">
          <svg className="global-notification-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
        <div className="global-notification-actions">
          <button 
            className="global-clear-all-btn" 
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
            className="global-dismiss-btn" 
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
      
      <div className="global-notification-list">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className="global-notification-item"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="global-notification-avatar">
              {notification.senderName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div className="global-notification-content">
              <div className="global-notification-sender">{notification.senderName}</div>
              <div className="global-notification-message">
                {notification.message.length > 50 
                  ? `${notification.message.substring(0, 50)}...` 
                  : notification.message
                }
              </div>
              <div className="global-notification-time">
                {formatTime(notification.timestamp)}
              </div>
            </div>
            <div className="global-notification-indicator"></div>
          </div>
        ))}
        
        {notifications.length > 3 && (
          <div className="global-notification-more">
            +{notifications.length - 3} more messages
          </div>
        )}
      </div>
    </div>
  );
}
