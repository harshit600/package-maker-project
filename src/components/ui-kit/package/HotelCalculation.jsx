import React, { useState, useEffect } from 'react';

function HotelCalculation({ itineraryDays }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCityFromItinerary = (day) => {
    const dayData = itineraryDays.find(d => d.day === day);
    if (dayData?.selectedItinerary) {
      return dayData.selectedItinerary.connectingCity || dayData.selectedItinerary.cityName;
    }
    const previousDay = itineraryDays.find(d => d.day === day - 1);
    return previousDay?.selectedItinerary?.connectingCity || '';
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
    const city = getCityFromItinerary(selectedDay);
    fetchHotels(city);
  }, [selectedDay]);

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
          {itineraryDays.map(day => (
            <option key={day.day} value={day.day}>
              Day {day.day} - {getCityFromItinerary(day.day)}
            </option>
          ))}
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



