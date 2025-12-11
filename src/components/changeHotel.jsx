import React, { useState, useEffect } from 'react';

// Add this function before the ChangeHotel component
const calculateHotelPriceDifference = (currentHotel, newHotel, requiredRooms = 1, extraBeds = 0) => {
  // Get current hotel's price
  
  const getCurrentPrice = (hotel) => {
    if (!hotel) return 0;
    
    const baseRate = hotel?.selectedRoom?.baseRate || hotel?.rooms?.data?.[0]?.baseRate || hotel?.price || 0;
    const extraAdultCharge = hotel?.selectedRoom?.extraAdultCharge || 0;
    
    return (baseRate * requiredRooms) + (extraAdultCharge * extraBeds);
  };

  // Calculate prices
  const currentPrice = getCurrentPrice(currentHotel);
  const newPrice = getCurrentPrice(newHotel);
  
  // Calculate difference
  const difference = Math.abs(newPrice - currentPrice);
  
  return {
    isIncrease: newPrice > currentPrice,
    difference: difference,
    formattedDifference: difference.toLocaleString()
  };
};

const ChangeHotel = ({ 
  selectedLead,
  selectedCity, 
  selectedDayForHotelSlider, 
  setShowHotelSlider, 
  selectedPackage,
  handleSelectHotel,
  handleAddSimilarHotel,
  hotelsByCity,
  setHotelsByCity,
  fetchHotelRooms
}) => {
  const [loadingHotels, setLoadingHotels] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
console.log(hotelsByCity,"hotelsByCity")
  
  // Get available star ratings from hotels
  const getAvailableStarRatings = () => {
    const hotels = hotelsByCity[selectedCity?.toLowerCase()] || [];
    const starRatings = new Set();
    hotels.forEach(hotel => {
      const rating = hotel.basicInfo?.hotelStarRating;
      if (rating) {
        const starNum = parseInt(rating);
        if (!isNaN(starNum) && starNum > 0) {
          starRatings.add(starNum);
        }
      }
    });
    return Array.from(starRatings).sort((a, b) => b - a); // Sort descending
  };

  // Add this filter function
  const getFilteredHotels = () => {
    const hotels = hotelsByCity[selectedCity?.toLowerCase()] || [];
    if (activeFilter === 'all') return hotels;
    if (activeFilter === 'preferred') {
      return hotels.filter(hotel => hotel.basicInfo?.prefered === true);
    }
    
    return hotels.filter(hotel => {
      const starRating = parseInt(hotel.basicInfo?.hotelStarRating) || 0;
      return starRating === parseInt(activeFilter);
    });
  };

  // Get count of preferred hotels
  const getPreferredHotelsCount = () => {
    const hotels = hotelsByCity[selectedCity?.toLowerCase()] || [];
    return hotels.filter(hotel => hotel.basicInfo?.prefered === true).length;
  };

  useEffect(() => {
    const loadAllRooms = async () => {
      const hotelsForCity = hotelsByCity[selectedCity?.toLowerCase()] || [];
      
      // Check if we already have the rooms data
      const allHotelsHaveRooms = hotelsForCity.every(hotel => 
        hotel.rooms?.data && Array.isArray(hotel.rooms.data)
      );
      
      // If all hotels already have room data, don't fetch again
      if (allHotelsHaveRooms) {
        return;
      }

      
      // Set loading state for hotels that need rooms
      const hotelsNeedingRooms = hotelsForCity.filter(hotel => !hotel.rooms?.data);
      setLoadingHotels(prev => ({
        ...prev,
        ...Object.fromEntries(hotelsNeedingRooms.map(hotel => [hotel._id, true]))
      }));

      try {
        const updatedHotels = await Promise.all(
          hotelsForCity.map(async (hotel) => {
            if (!hotel.rooms?.data) {
              try {
                const roomsData = await fetchHotelRooms(hotel._id);
                return { ...hotel, rooms: roomsData };
              } catch (error) {
                console.error(`Error fetching rooms for hotel ${hotel._id}:`, error);
                return hotel;
              }
            }
            return hotel;
          })
        );

        setHotelsByCity(prev => ({
          ...prev,
          [selectedCity?.toLowerCase()]: updatedHotels,
        }));
      } finally {
        // Clear loading states
        setLoadingHotels({});
      }
    };

    loadAllRooms();
  }, [selectedCity, hotelsByCity]);

  // Get the default hotel and room for the current city
  const defaultHotel = hotelsByCity[selectedCity?.toLowerCase()]?.[0];
  const defaultRoom = defaultHotel?.rooms?.data?.[0];

  // Get current hotel for price comparison
  const currentHotel = selectedPackage?.package?.itineraryDays?.find(
    day => day.day === selectedDayForHotelSlider?.day
  )?.selectedHotel || { ...defaultHotel, selectedRoom: defaultRoom };

  // Helper function to get room rate from inventory
  const getRoomRate = (hotel, room) => {
    if (!room) return 0;
    
    const roomInventory = hotel?.inventory?.b2c?.[room.roomName];
    const apRates = roomInventory?.rates?.AP;
    let defaultRate = room.baseRate;

    // Calculate the specific date for this day
    if (apRates && selectedLead?.travelDate && selectedDayForHotelSlider?.day) {
      const dayDate = new Date(selectedLead.travelDate);
      // Add (day - 1) days to the travel date to get the correct date
      dayDate.setDate(dayDate.getDate() + (selectedDayForHotelSlider.day - 1));
      const formattedDate = dayDate.toISOString().split('T')[0];
      
      // Look through all rate periods for the specific date
      for (const period in apRates) {
        if (Array.isArray(apRates[period])) {
          const matchingRate = apRates[period].find(rate => {
            if (!rate.date) return false; // Skip if date is missing
            const parsedDate = new Date(rate.date);
            if (isNaN(parsedDate)) return false; // Skip if invalid date
            const rateDate = parsedDate.toISOString().split('T')[0];
            return rateDate === formattedDate;
          });
          
          if (matchingRate) {
            defaultRate = matchingRate.value;
            break;
          }
        }
      }
      
      if (defaultRate === room.baseRate) {
        console.log(`No specific rate found for ${formattedDate}, using base rate: ₹${defaultRate}`);
      }
    }

    return defaultRate;
  };

  // Update calculateHotelPriceDifference to pass the day information
  const calculateHotelPriceDifference = (currentHotel, newHotel, requiredRooms = 1, extraBeds = 0) => {
    const getCurrentPrice = (hotel) => {
      if (!hotel) return 0;
      
      const room = hotel?.selectedRoom || hotel?.rooms?.data?.[0];
      const roomRate = getRoomRate(hotel, room);
      const extraAdultCharge = room?.extraAdultCharge || 0;
      
      return roomRate;
    };

    const currentPrice = getCurrentPrice(currentHotel);
    const newPrice = getCurrentPrice(newHotel);
    
    const difference = Math.abs(newPrice - currentPrice);
    
    return {
      isIncrease: newPrice > currentPrice,
      difference: difference,
      formattedDifference: difference.toLocaleString()
    };
  };

  const renderRooms = (hotel) => {
    if (loadingHotels[hotel._id]) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!hotel.rooms?.data?.length) {
      return (
        <div className="text-center py-4 text-gray-500">
          No rooms available for this hotel
        </div>
      );
    }

    return hotel.rooms.data.map((room) => {
      const requiredRooms = parseInt(selectedLead?.noOfRooms) || 1;
      const extrabed = parseInt(selectedLead?.extraBeds) || 0;

      const roomPriceDiff = currentHotel?.selectedRoom ? calculateHotelPriceDifference(
        { selectedRoom: currentHotel?.selectedRoom },
        { selectedRoom: room },
        requiredRooms,
        extrabed
      ) : null;

      return (
        <div key={room._id} className="bg-white rounded-lg border p-4">
          <div className="flex gap-6">
            {/* Room Image */}
            <div className="w-48 h-36 flex-shrink-0">
              <img
                src={room.imageUrl}
                alt={room.roomName}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200?text=Room+Image";
                }}
              />
            </div>

            {/* Room Details */}
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900">
                    {room.roomName}
                  </h5>
                  <p className="text-gray-600 mt-1">
                    {room.roomDescription}
                  </p>
                </div>
                <div className="text-right">
                  {roomPriceDiff && currentHotel?.selectedRoom ? (
                    <p className={`text-2xl ${
                      roomPriceDiff.isIncrease ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {roomPriceDiff.isIncrease ? '+' : '-'} ₹{roomPriceDiff.formattedDifference}
                      <p className="text-sm text-gray-500">price difference</p>
                    </p>
                  ) : (
                    <>
                      <p className="text-2xl font-medium">₹{room.baseRate}</p>
                      <p className="text-sm text-gray-500">per night</p>
                    </>
                  )}
                </div>
              </div>

              {/* Room details and select button */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-4 gap-3">
                <div className="text-sm text-gray-600">
                  <p>Extra Adult Charge: ₹{room.extraAdultCharge}</p>
                  <p>Child Charge: ₹{room.childCharge}</p>
                  <p>Room Count Available: {room.roomCount}</p>
                  <p>Total requiredRooms: {requiredRooms}</p>
                  <p>Total Extra Beds: {extrabed}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      handleSelectHotel(
                        {
                          ...hotel,
                          selectedRoom: room,
                          rooms: hotel.rooms,
                        },
                        selectedDayForHotelSlider?.day
                      );
                      setShowHotelSlider(false);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select Room
                  </button>
                  <button
                    onClick={() => {
                      handleAddSimilarHotel(
                        hotel,
                        selectedDayForHotelSlider?.day
                      );
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add in Similar Hotel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setShowHotelSlider(false)}
      />
      <div style={{zIndex:"1000"}}className="fixed inset-y-0 right-0 w-full sm:w-[85%] md:w-[75%] lg:w-[55%] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="sticky top-0 bg-[rgb(45,45,68)] text-white px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">
              Change Hotel in {selectedCity}
            </h2>
            <span className="text-xs sm:text-sm bg-blue-500 px-2 py-1 rounded">
              Day {selectedDayForHotelSlider?.day}
            </span>
          </div>
          <button
            onClick={() => setShowHotelSlider(false)}
            className="text-white hover:text-gray-200 self-end sm:self-auto"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-6">
          {/* Hotel Filter Tabs */}
          <div className="mb-4 sm:mb-6 border-b border-gray-200">
            <div className="flex flex-wrap -mb-px">
              {/* All Hotels Tab */}
              <button 
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors ${
                  activeFilter === 'all' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All Hotels
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {hotelsByCity[selectedCity?.toLowerCase()]?.length || 0}
                </span>
              </button>
              
              {/* Preferred Hotels Tab */}
              {getPreferredHotelsCount() > 0 && (
                <button 
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeFilter === 'preferred' 
                      ? 'border-blue-600 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveFilter('preferred')}
                >
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Preferred
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {getPreferredHotelsCount()}
                  </span>
                </button>
              )}
              
              {/* Star Rating Tabs - Dynamically generated */}
              {getAvailableStarRatings().map((starRating) => (
                <button
                  key={starRating}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeFilter === starRating.toString()
                      ? 'border-blue-600 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveFilter(starRating.toString())}
                >
                  <div className="flex items-center gap-1">
                    {[...Array(starRating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span>{starRating} Star</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {hotelsByCity[selectedCity?.toLowerCase()]?.filter(hotel => {
                      const rating = parseInt(hotel.basicInfo?.hotelStarRating) || 0;
                      return rating === starRating;
                    }).length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Update Hotel List to use filtered hotels */}
          <div className="space-y-4 sm:space-y-6">
            {getFilteredHotels().map((hotel) => {
              const defaultRoom = hotel?.rooms?.data?.[0];
              const roomRate = getRoomRate(hotel, defaultRoom);
              const priceDiff = calculateHotelPriceDifference(
                currentHotel,
                { ...hotel, selectedRoom: defaultRoom },
                parseInt(selectedLead?.noOfRooms) || 1,
                parseInt(selectedLead?.extraBeds) || 0
              );
              
              // Check if hotel is preferred
              const isPreferred = hotel.basicInfo?.prefered === true;

              return (
                <div
                  key={hotel._id}
                  className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                    isPreferred ? 'border-2 border-yellow-400 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row p-3 sm:p-4">
                    {/* Hotel Image - Larger for preferred hotels */}
                    <div className={`relative flex-shrink-0 mb-3 sm:mb-0 ${
                      isPreferred 
                        ? 'w-full sm:w-96 h-64' 
                        : 'w-full sm:w-64 h-48'
                    }`}>
                      <img
                        src={hotel.photosAndVideos?.images?.[0]}
                        alt={hotel.basicInfo?.propertyName}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/300x200?text=Hotel+Image";
                        }}
                      />
                      {/* Preferred Badge */}
                      {isPreferred && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xl font-semibold shadow-lg flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Preferred
                        </div>
                      )}
                    </div>

                    {/* Hotel Details */}
                    <div className="flex-1 sm:ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {hotel.basicInfo?.propertyName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[
                                ...Array(
                                  parseInt(
                                    hotel.basicInfo?.hotelStarRating
                                  ) || 3
                                ),
                              ].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {hotel.basicInfo?.hotelStarRating} Star Hotel
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {hotel.basicInfo?.address}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          {priceDiff ? (
                            <div className={`text-lg sm:text-2xl font-bold ${priceDiff.isIncrease ? 'text-black-600' : 'text-green-600'}`}>
                              {priceDiff.isIncrease ? '+' : '-'} ₹{priceDiff.formattedDifference}
                              <p className="text-xs sm:text-sm text-gray-500">price difference</p>
                            </div>
                          ) : ( 
                            <>
                              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                ₹{roomRate.toLocaleString()}
                                <span className="text-xs sm:text-sm text-gray-500"> per night</span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Free Cancellation
                        </span>
                        <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Breakfast Included
                        </span>
                      </div>

                      {/* Select Buttons */}
                      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            handleSelectHotel(
                              hotel,
                              selectedDayForHotelSlider?.day
                            );
                            setShowHotelSlider(false);
                          }}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                          Select Hotel
                        </button>
                        <button
                          onClick={() => {
                            handleAddSimilarHotel(
                              hotel,
                              selectedDayForHotelSlider?.day
                            );
                          }}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                          Add in Similar Hotel
                        </button>
                      </div>
                    </div>
                  </div>

              
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeHotel;
