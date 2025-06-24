import axios from 'axios';
import React, { useEffect, useState } from 'react';

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const id = storedUser?.id || storedUser?._id;

    if (!id) {
      console.warn('⚠️ userId not found in localStorage.');
      return;
    }

    setUserId(id);

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications/${id}`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!userId) return null; // Optional: avoid rendering if no user

  return (
    <div>
      {notifications.map(notification => (
        <div
          key={notification._id}
          onClick={() => handleMarkAsRead(notification._id)}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: notification.read ? '#f8f9fa' : '#e9f7ef',
            cursor: 'pointer'
          }}
        >
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
