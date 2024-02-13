// src/App.js
import React, { useState, useEffect } from 'react';
import './Activies.css';

// Import FontAwesome icons
import { FaEdit, FaTrash } from 'react-icons/fa';
import SideBar from '../components/SideBar';

const ActivityCard = ({ activity }) => (
  <div className="activity-card">
    <img src={activity.imageUrls[0]} alt={activity.name} />
    <h3>{activity.name}</h3>
    <div className="card-icons">
      <FaEdit className="edit-icon" onClick={() => handleUpdate(activity._id)} />
      <FaTrash className="delete-icon" onClick={() => handleDelete(activity._id)} />
    </div>
  </div>
);

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/activity/listings');
        const data = await response.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setActivities(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleUpdate = (activityId) => {
    // Implement update logic here
    console.log(`Update activity with ID: ${activityId}`);
  };

  const handleDelete = (activityId) => {
    // Implement delete logic here
    console.log(`Delete activity with ID: ${activityId}`);
  };

  return (
    <div className="App">
      <div className='leftside'>
        <SideBar />
      </div>
      <div className='rightside'>
      <h1>Activity Listings</h1>
      <div className="activity-container">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error fetching activities</p>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))
        )}
      </div>
      </div>
    </div>
  );
}

export default Activities;
