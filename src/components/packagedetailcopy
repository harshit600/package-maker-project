import React from 'react';

const RoomSlider = ({ 
  selectedHotelForRooms,
  setShowRoomSlider,
  selectedLead,
  handleSelectHotel,
  selectedDayForHotelSlider,
  calculateHotelPriceDifference 
}) => {
  // Early return if no hotel is selected
  if (!selectedHotelForRooms) {
    return null;
  }
  const getInventoryRate = (selectedHotelForRooms, travelDate, mealPlan = 'MAP') => {
    // Get the first room's data (index 0)
    const firstRoom = selectedHotelForRooms?.rooms?.data?.[0];
    if (!firstRoom) return null;

    // Calculate the actual date based on day number - Fix the date calculation
    const baseDate = new Date(travelDate);
    const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
    const actualDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
   
    
    const roomInventory = selectedHotelForRooms?.inventory?.b2c?.[firstRoom.roomName];
    const planRates = roomInventory?.rates?.[mealPlan];
    
    if (planRates && actualDate) {
      // Check all rate periods (1, 2, 3, 4, etc.)
      for (const period in planRates) {
        if (Array.isArray(planRates[period]) && planRates[period].length > 0) {
          const matchingRate = planRates[period].find(rate => {
            const rateDate = new Date(rate.date);
            // Compare dates without time component
            const rateDateStr = rateDate.toISOString().split('T')[0];
            const actualDateStr = actualDate.toISOString().split('T')[0];
            return rateDateStr === actualDateStr;
          });
          if (matchingRate) {
            return matchingRate.value;
          }
        }
      }
    }
    
    // Fallback to base rate of the first room
    return firstRoom.baseRate;
  };
  const calculateMealPlanPriceDifference = (currentRate, newRate) => {
    const difference = newRate - currentRate;
    return {
      difference,
      isIncrease: difference > 0,
      formattedDifference: Math.abs(difference).toLocaleString('en-IN')
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => setShowRoomSlider(false)}
        />

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-2xl">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="bg-[rgb(45,45,68)] px-3 sm:px-6 py-3 sm:py-4 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Select Room Type
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1">
                      {selectedHotelForRooms?.basicInfo?.propertyName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRoomSlider(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors self-end sm:self-auto"
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
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-6">
                  {!selectedHotelForRooms?.rooms ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-500">
                        Loading room options...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {selectedHotelForRooms?.rooms?.data?.map((room) => {
                        const currentRoom = selectedHotelForRooms?.selectedRoom||getInventoryRate(selectedHotelForRooms,selectedLead.travelDate)  ;
                        const requiredRooms = parseInt(selectedLead?.noOfRooms) || 1; 
                        const extrabed = parseInt(selectedLead?.extraBeds) || 0;
                        
                        // Get the room's inventory rates
                        const roomInventory = selectedHotelForRooms?.inventory?.b2c?.[room.roomName];
                        
                        return (
                          <div
                            key={room._id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                          >
                            <div className="p-3 sm:p-4">
                              {/* Room Header with Image and Basic Info */}
                              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="w-full sm:w-40 h-32 flex-shrink-0">
                                  <img
                                    src={room.imageUrl || "/default-room.jpg"}
                                    alt={room.roomName}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/300x200?text=Room+Image";
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    {room.roomName}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                                    {room.roomType}
                                  </p>
                                  {/* Room Features */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <RoomFeatureItem
                                      icon="guests"
                                      text={`${room.maxOccupancy} Guests`}
                                    />
                                    <RoomFeatureItem
                                      icon="bed"
                                      text={room.bedType}
                                    />
                                    <RoomFeatureItem
                                      icon="size"
                                      text={`${room.roomsizeinnumber} ${room.roomSize}`}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Meal Plans */}
                              <div className="border-t pt-3 sm:pt-4">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Available Meal Plans</h4>
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                  {roomInventory?.rates && 
                                    Object.entries(roomInventory.rates)
                                      .filter(([plan]) => ['EP', 'CP', 'AP', 'MAP',].includes(plan))
                                      .map(([plan, planData]) => {
                                        const travelDate = selectedLead?.travelDate;
                                        const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
                                        // Fix date calculation - use getTime() to avoid mutating original date
                                        const baseDate = new Date(travelDate);
                                        const actualDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
                                        let matchingRate = null;


                                        // Look through all rate periods
                                        if (planData) {
                                          for (const period in planData) {
                                            if (Array.isArray(planData[period]) && planData[period].length > 0) {
                                              const foundRate = planData[period].find(rate => {
                                                const rateDate = new Date(rate.date);
                                                const rateDateStr = rateDate.toISOString().split('T')[0];
                                                const actualDateStr = actualDate.toISOString().split('T')[0];
                                                return rateDateStr === actualDateStr;
                                              });
                                              if (foundRate) {
                                                matchingRate = foundRate;
                                                break;
                                              }
                                            }
                                          }
                                        }

                                        // Use room's base rate as fallback if no matching rate found
                                        const rateValue = matchingRate?.value || room.baseRate;
                                        
                                        // Calculate price difference if there's a current selected room
                                        const priceDiff = currentRoom?.rate ||currentRoom ? 
                                          calculateMealPlanPriceDifference(currentRoom.rate|| currentRoom, rateValue) : null;

                                        const mealPlanLabels = {
                                          'EP': "• No meals included • All services • Non-Refundable,",
                                          'CP': "• All services • Complimentary Breakfast • Non-Refundable",
                                          'MAP': 'All services• Free Breakfast• Free Lunch OR Dinner• Non-Refundable',
                                          'AP': 'All Meals Included'
                                        };

                                        return (
                                          <div 
                                            key={plan}
                                            className="relative border rounded-lg p-2 sm:p-3 hover:border-blue-500 cursor-pointer transition-all"
                                            onClick={() => {
                                              // Get child charge and extra bed charge from inventory if available
                                              const childCharge = roomInventory?.rates?.childCharge ? 
                                                (() => {
                                                  const travelDate = selectedLead?.travelDate;
                                                  const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
                                                  const baseDate = new Date(travelDate);
                                                  const actualDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
                                                  
                                                  // Look for matching rate in childCharge data
                                                  const childRates = roomInventory.rates.childCharge;
                                                  for (const period in childRates) {
                                                    if (Array.isArray(childRates[period]) && childRates[period].length > 0) {
                                                      const foundRate = childRates[period].find(rate => {
                                                        const rateDate = new Date(rate.date);
                                                        const rateDateStr = rateDate.toISOString().split('T')[0];
                                                        const actualDateStr = actualDate.toISOString().split('T')[0];
                                                        return rateDateStr === actualDateStr;
                                                      });
                                                      if (foundRate) return foundRate.value;
                                                    }
                                                  }
                                                  return room.childCharge || 0;
                                                })() : 
                                                room.childCharge || 0;
                                                
                                              const extraAdultCharge = roomInventory?.rates?.extraBed ? 
                                                (() => {
                                                  const travelDate = selectedLead?.travelDate;
                                                  const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
                                                  const baseDate = new Date(travelDate);
                                                  const actualDate = new Date(baseDate.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
                                                  
                                                  // Look for matching rate in extraBed data
                                                  const extraBedRates = roomInventory.rates.extraBed;
                                                  for (const period in extraBedRates) {
                                                    if (Array.isArray(extraBedRates[period]) && extraBedRates[period].length > 0) {
                                                      const foundRate = extraBedRates[period].find(rate => {
                                                        const rateDate = new Date(rate.date);
                                                        const rateDateStr = rateDate.toISOString().split('T')[0];
                                                        const actualDateStr = actualDate.toISOString().split('T')[0];
                                                        return rateDateStr === actualDateStr;
                                                      });
                                                      if (foundRate) return foundRate.value;
                                                    }
                                                  }
                                                  return room.extraAdultCharge || 0;
                                                })() : 
                                                room.extraAdultCharge || 0;
                                                
                                              handleSelectHotel(
                                                {
                                                  ...selectedHotelForRooms,
                                                  selectedRoom: { 
                                                    ...room, 
                                                    mealPlan: plan,
                                                    baseRate: rateValue,
                                                    rate: rateValue,
                                                    inventoryRate: matchingRate ? {
                                                      date: matchingRate.date,
                                                      value: matchingRate.value
                                                    } : null,
                                                    plandata: planData,
                                                    childCharge: childCharge,
                                                    extraAdultCharge: extraAdultCharge,
                                                  },
                                                },
                                                selectedDayForHotelSlider?.day
                                              );
                                              setShowRoomSlider(false);
                                            }}
                                          >
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="text-lg sm:text-xl font-medium text-gray-900">{plan}</span>
                                              <div className="text-right">
                                                <span className="text-base sm:text-lg font-semibold text-blue-600">
                                                  {/* ₹{rateValue?.toLocaleString() || 'N/A'} */}
                                                </span>
                                                {priceDiff && (
                                                  <>
                                                  <p className={`text-lg sm:text-2xl ${priceDiff.isIncrease ? 'text-black-500' : 'text-green-500'}`}>
                                                    {priceDiff.isIncrease ? '+' : '-'} ₹{priceDiff.formattedDifference}
                                                   
                                                   
                                                  </p>
                                                   <span className="text-xs sm:text-sm">per night</span>
                                                   </>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                              {mealPlanLabels[plan]}
                                            </p>
                                          </div>
                                        );
                                      })
                                  }
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="mt-3 sm:mt-4 pt-3 border-t flex justify-between items-center text-xs sm:text-sm text-gray-600">
                                <div>
                                  {/* <p>Extra Adult: ₹{roomInventory?.rates?.extraBed ? 
                                    (() => {
                                      const travelDate = selectedLead?.travelDate;
                                      const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
                                      const actualDate = new Date(new Date(travelDate).setDate(new Date(travelDate).getDate() + dayOffset));
                                      
                                      // Look for matching rate in extraBed data
                                      const extraBedRates = roomInventory.rates.extraBed;
                                      for (const period in extraBedRates) {
                                        if (Array.isArray(extraBedRates[period])) {
                                          const foundRate = extraBedRates[period].find(rate => {
                                            const rateDate = new Date(rate.date).toISOString().split('T')[0];
                                            const compareDate = actualDate.toISOString().split('T')[0];
                                            return rateDate === compareDate;
                                          });
                                          if (foundRate) return foundRate.value;
                                        }
                                      }
                                      return room.extraAdultCharge;
                                    })() : 
                                    room.extraAdultCharge}</p>
                                  <p>Child: ₹{roomInventory?.rates?.childCharge ? 
                                    (() => {
                                      const travelDate = selectedLead?.travelDate;
                                      const dayOffset = (selectedDayForHotelSlider?.day || 1) - 1;
                                      const actualDate = new Date(new Date(travelDate).setDate(new Date(travelDate).getDate() + dayOffset));
                                      
                                      // Look for matching rate in childCharge data
                                      const childRates = roomInventory.rates.childCharge;
                                      for (const period in childRates) {
                                        if (Array.isArray(childRates[period])) {
                                          const foundRate = childRates[period].find(rate => {
                                            const rateDate = new Date(rate.date).toISOString().split('T')[0];
                                            const compareDate = actualDate.toISOString().split('T')[0];
                                            return rateDate === compareDate;
                                          });
                                          if (foundRate) return foundRate.value;
                                        }
                                      }
                                      return room.childCharge;
                                    })() : 
                                    room.childCharge}</p> */}
                                </div>
                                <div className="text-xs text-gray-500 text-center sm:text-right">
                                  Click on a meal plan to select
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for room features
const RoomFeatureItem = ({ icon, text, isGreen = false }) => {
  const icons = {
    guests: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
    bed: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    ),
    size: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    ),
    meal: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${isGreen ? 'text-green-600' : 'text-gray-600'}`}>
      <svg
        className="w-3 h-3 sm:w-4 sm:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[icon]}
      </svg>
      {text}
    </div>
  );
};

export default RoomSlider;