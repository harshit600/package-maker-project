import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import config from '../../config';

const ItineraryDropdown = ({ onSelectItinerary, selectedItinerary, setSelectedItinerary })  => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    fetch(`${config.API_HOST}/api/itinerary/itinerary`)
      .then(response => response.json())
      .then(data => {
        // Extract itinerary titles from the response and format them for the dropdown
        const formattedOptions = data.map(itinerary => ({
          value: itinerary._id,
          label: itinerary.itineraryTitle,
          details: itinerary // Store all details of the itinerary for later use
        }));
        setOptions(formattedOptions);
      })
      .catch(error => console.error('Error fetching itinerary data:', error));
  }, []); // Empty dependency array ensures the effect runs only once

  const handleChange = (selectedOption) => {
    onSelectItinerary(selectedOption ? selectedOption.details : null);
    setSelectedItinerary(selectedOption);
  };

  return (
    <div>
      <Select
        options={options}
        onChange={handleChange}
        placeholder="Select itinerary"
      />
    </div>
  );
};

export default ItineraryDropdown;
