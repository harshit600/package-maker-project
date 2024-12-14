import React, { useState, useEffect } from 'react';

function HotelCalculation({ travelData, cabsData }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityNights, setCityNights] = useState({});

  // Process package places to get nights per city
  useEffect(() => {
    if (cabsData?.packagePlaces) {
      const nightsMap = {};
      let currentDay = 1;
      
      cabsData.packagePlaces.forEach(place => {
        const nights = parseInt(place.nights);
        if (place.placeCover && nights) {
          nightsMap[place.placeCover] = {
            totalNights: nights,
            startDay: currentDay,
            endDay: currentDay + nights - 1
          };
          currentDay += nights;
        }
      });
      
      setCityNights(nightsMap);
    }
  }, [cabsData]);

  const getCityFromDay = (day) => {
    for (const [city, info] of Object.entries(cityNights)) {
      if (day >= info.startDay && day <= info.endDay) {
        return city;
      }
    }
    return '';
  };

  const fetchHotels = async (city) => {
    if (!city) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://pluto-hotel-server-15c83810c41c.herokuapp.com/api/property/get-properties');
      const data = await response.json();
      const filteredHotels = data.data.filter(hotel => 
        hotel.location?.city?.toLowerCase() === city.toLowerCase()
      );
      setHotels(filteredHotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const city = getCityFromDay(selectedDay);
    fetchHotels(city);
  }, [selectedDay]);

  // Calculate total number of nights
  const totalNights = Object.values(cityNights).reduce((sum, info) => sum + info.totalNights, 0);

  if (totalNights === 0) {
    return <p className="p-4">No hotel selection needed for this itinerary.</p>;
  }

  return (
    <div className="hotel-selector p-4">
      <h2 className="text-2xl font-bold mb-4">Select Hotel</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Select Day:</label>
        <select 
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          className="border rounded p-2 w-[400px]"
        >
          {[...Array(totalNights)].map((_, index) => {
            const day = index + 1;
            const city = getCityFromDay(day);
            return (
              <option key={day} value={day}>
                Day {day} - {city}
              </option>
            );
          })}
        </select>
      </div>

      <div className="hotel-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading hotels...</p>
        ) : hotels.length > 0 ? (
          hotels.map(hotel => (
            <div 
              key={hotel._id} 
              className="hotel-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="hotel-images mb-2">
                <img 
                  src={hotel.photosAndVideos?.images[0]} 
                  alt={hotel.basicInfo.propertyName}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
              <h4 className="text-md font-semibold">{hotel.basicInfo.propertyName}</h4>
              <p className="text-sm text-gray-500">⭐ {hotel.basicInfo.hotelStarRating}</p>
              <p className="text-xs text-gray-400 mt-1">{hotel.location?.address}</p>
              <button 
                className="mt-2 bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 w-full"
                onClick={() => {
                  console.log('Selected hotel:', hotel);
                }}
              >
                Select Hotel
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No hotels available in this city.</p>
        )}
      </div>
    </div>
  );
}

export default HotelCalculation;