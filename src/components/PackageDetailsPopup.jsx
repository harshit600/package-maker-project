import React, { useState, useEffect } from 'react';
import { usePackage } from '../context/PackageContext';
import { useFinalcosting } from '../context/FinalcostingContext';
const PackageDetailsPopup = ({ 
  isOpen, 
  onClose, 
  selectedPackage,
  selectedLead,
  hotelsByCity,
  activities,
  cabQuantity,
  hotelRoomsAndBeds = {},
}) => {
  const { setPackageSummary } = usePackage();
  const { fetchMarginByState, marginData, setMarginData } = useFinalcosting();
  
  if (!isOpen) return null;
  // Helper function to get room rate
  const getRoomRate = (hotel, selectedRoom, dayIndex) => {
    if (!selectedLead?.travelDate) {
      return selectedRoom?.rate || hotel?.rooms?.data?.[0]?.baseRate || 0;
    }
    
    // Calculate the specific date for this day
    const dayDate = new Date(selectedLead.travelDate);
    dayDate.setDate(dayDate.getDate() + dayIndex); // Add dayIndex to get the correct date
    const formattedDate = dayDate.toISOString().split('T')[0];
    
    let nightRate = 0;
    
    if (selectedRoom?.plandata?.[1]) {
      // Use plandata if available
      const plandata = selectedRoom.plandata[1];
      const foundRate = plandata.find(item => {
        // Validate the date before processing
        if (!item.date || typeof item.date !== 'string') {
          return false;
        }
        
        // Check if the date string looks malformed (contains multiple dates)
        if (item.date.includes(' ') && item.date.split(' ').length > 1) {
          console.warn('Malformed date detected in plandata (getRoomRate):', item.date);
          return false;
        }
        
        const dateObj = new Date(item.date);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn('Invalid date detected in plandata (getRoomRate):', item.date);
          return false;
        }
        
        const itemDate = dateObj.toISOString().split('T')[0];
        return itemDate === formattedDate;
      });
      
      if (foundRate) {
        nightRate = foundRate.value;
      } else {
        nightRate = selectedRoom.baseRate;
      }
    } else {
      // Fallback to inventory rates
      const defaultRoom = hotel?.rooms?.data?.[0];
      const roomInventory = hotel?.inventory?.b2c?.[defaultRoom?.roomName];
      const apRates = roomInventory?.rates?.MAP;
      
      if (apRates) {
        for (const period in apRates) {
          if (Array.isArray(apRates[period])) {
            const matchingRate = apRates[period].find(rate => {
              // Validate the date before processing
              if (!rate.date || typeof rate.date !== 'string') {
                return false;
              }
              
              // Check if the date string looks malformed (contains multiple dates)
              if (rate.date.includes(' ') && rate.date.split(' ').length > 1) {
                console.warn('Malformed date detected in apRates (getRoomRate):', rate.date);
                return false;
              }
              
              const dateObj = new Date(rate.date);
              
              // Check if the date is valid
              if (isNaN(dateObj.getTime())) {
                console.warn('Invalid date detected in apRates (getRoomRate):', rate.date);
                return false;
              }
              
              const rateDate = dateObj.toISOString().split('T')[0];
              return rateDate === formattedDate;
            });
            
            if (matchingRate) {
              nightRate = matchingRate.value;
              break;
            }
          }
        }
      }
      
      // If no rate found, use base rate
      if (!nightRate) {
        nightRate = defaultRoom?.baseRate || 0;
      }
    }
    
    return nightRate;
  };

  // Helper function to get extra adult rate
  const getExtraAdultRate = (hotel, selectedRoom, dayIndex) => {
    if (!selectedLead?.travelDate) {
      return selectedRoom?.extraAdultCharge || hotel?.rooms?.data?.[0]?.extraAdultCharge || 0;
    }
    
    // Calculate the specific date for this day
    const dayDate = new Date(selectedLead.travelDate);
    dayDate.setDate(dayDate.getDate() + dayIndex); // Add dayIndex to get the correct date
    const formattedDate = dayDate.toISOString().split('T')[0];
    
    let extraAdultRate = 0;
    if (selectedRoom?.plandata?.[3]) {
      // Use plandata if available
      const plandata = selectedRoom?.plandata[3];
      const foundRate = plandata.find(item => {
        // Validate the date before processing
        if (!item.date || typeof item.date !== 'string') {
          return false;
        }
        
        // Check if the date string looks malformed (contains multiple dates)
        if (item.date.includes(' ') && item.date.split(' ').length > 1) {
          console.warn('Malformed date detected in plandata (getExtraAdultRate):', item.date);
          return false;
        }
        
        const dateObj = new Date(item.date);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.warn('Invalid date detected in plandata (getExtraAdultRate):', item.date);
          return false;
        }
        
        const itemDate = dateObj.toISOString().split('T')[0];
        return itemDate === formattedDate;
      });
      
      if (foundRate) {
        extraAdultRate = foundRate.value;
      } else {
        extraAdultRate = selectedRoom.extraAdultCharge;
      }
    } else {
      const defaultRoomm = hotel?.rooms?.data?.[0];
      const roomInventoryy = hotel?.inventory?.b2c?.[defaultRoomm?.roomName];
      const extraAdultInventory = roomInventoryy?.rates?.MAP[3];
      // Fallback to default room
   
      if (extraAdultInventory) {
        // Look through all extra adult rate periods
        for (const rate of extraAdultInventory) {
          // Validate the date before processing
          if (!rate.date || typeof rate.date !== 'string') {
            continue;
          }
          
          // Check if the date string looks malformed (contains multiple dates)
          if (rate.date.includes(' ') && rate.date.split(' ').length > 1) {
            console.warn('Malformed date detected in extraAdultInventory:', rate.date);
            continue;
          }
          
          const dateObj = new Date(rate.date);
          
          // Check if the date is valid
          if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date detected in extraAdultInventory:', rate.date);
            continue;
          }
          
          const rateDate = dateObj.toISOString().split('T')[0];
          // Compare the rateDate with formattedDate
          if (rateDate === formattedDate) {
            extraAdultRate = rate.value; // Assign the value if a match is found
            break; // Exit the loop once a match is found
          }
        }
      }
      
      // If no inventory rate found, use the standard extra adult charge
      if (!extraAdultRate) {
        extraAdultRate = defaultRoomm?.extraAdultCharge || 0;
      }
    }
    
    return extraAdultRate;
  };

  // Calculate place costs first
  const calculatePlaceCosts = () => {
    let totalCost = 0;
    const paidPlaces = [];

    selectedPackage?.package?.itineraryDays?.forEach(day => {
      const places = day.selectedItinerary?.cityArea || [];
      places.forEach(place => {
        if (place.cost && selectedPackage?.cabs?.selectedCab) {
          const placeCost = place.cost[selectedPackage.cabs.selectedCab.cabType] || 0;
          const totalPlaceCost = placeCost * cabQuantity;
          if (totalPlaceCost > 0) {
            totalCost += totalPlaceCost;
            paidPlaces.push({
              name: place.placeName,
              cost: totalPlaceCost,
              day: day.day
            });
          }
        }
      });
    });

    return { totalCost, paidPlaces };
  };

  const { totalCost: totalPlacesCost, paidPlaces } = calculatePlaceCosts();

  // Calculate hotels cost
  const hotelsCost = selectedPackage?.package?.itineraryDays?.reduce((total, day, index) => {
    let hotel = day?.selectedHotel; // First priority: directly selected hotel

    if (!hotel && day?.selectedItinerary?.cityName) {
      const cityHotels = hotelsByCity[day.selectedItinerary.cityName.toLowerCase()];
      
      // If no directly selected hotel, try to find from the hotels array
      const selectedHotelForDay = selectedPackage?.hotels?.[day.day];
      if (selectedHotelForDay?.hotelInfo?.id && cityHotels) {
        hotel = cityHotels.find(h => h._id === selectedHotelForDay.hotelInfo.id);
      }
      
      // If still no hotel found, use the first hotel from the city
      if (!hotel && cityHotels?.length) {
        hotel = cityHotels[0];
      }
    }
    const selectedRoom = hotel?.selectedRoom || hotel?.rooms?.data?.[0];
    const roomRate = getRoomRate(hotel, selectedRoom, index);
    const extraAdultRate = getExtraAdultRate(hotel, selectedRoom, index);
    const isFirstDay = day.day === 1 && selectedPackage?.package?.packagePlaces[0]?.transfer;
    const isLastDay = index === selectedPackage.package.itineraryDays.length - 1;

    const roomCost = !isFirstDay && !isLastDay ? Number(roomRate * (hotelRoomsAndBeds[`hotel-${day.day}`]?.rooms ?? selectedLead?.noOfRooms ?? 1)) || 0 : 0;
    const extraBedCost = !isFirstDay && !isLastDay ? Number(extraAdultRate * (hotelRoomsAndBeds[`hotel-${day.day}`]?.extraBeds ?? selectedLead?.extraBeds ?? 0)) || 0 : 0;
    return total + roomCost + extraBedCost;
  }, 0) || 0;

  




  // Calculate activities cost
  const activitiesCost = activities?.reduce((total, activity) => 
    total + (Number(activity.price) * Number(activity?.quantity || 1) || 0), 0) || 0;

  // Calculate transfer cost
  const transferCost = selectedPackage?.cabs?.selectedCabs?.reduce((total, cab) => 
    total + (Number(cab.price) * Number(cab?.quantity || 1) || 0), 0) || 
    Number(selectedPackage?.cabs?.selectedCab?.price * (cabQuantity || 1)) || 0;

  // Create package summary
  const packageSummary = {
    id: selectedPackage._id,
    transfer: {
      details: selectedPackage?.cabs?.selectedCabs || [selectedPackage?.cabs?.selectedCab || null],
      selectedLead: selectedLead||null,
      totalCost: transferCost,
      itineraryDays: selectedPackage?.package?.itineraryDays||null,
      state: selectedPackage?.package?.state||null,
      editcost:"gdfgfdg",
    },
    hotels: selectedPackage?.package?.itineraryDays?.map((day, index) => {
      const isFirstDay = day.day === 1 && selectedPackage?.package?.packagePlaces[0]?.transfer;
      const isLastDay = index === selectedPackage.package.itineraryDays.length - 1;

      // Skip first and last day by returning null
      if (isFirstDay || isLastDay) return null;

      // Get the hotel for this day
      let hotel = day?.selectedHotel; // First priority: directly selected hotel

      if (!hotel && day?.selectedItinerary?.cityName) {
        const cityHotels = hotelsByCity[day.selectedItinerary.cityName.toLowerCase()];
        
        // If no directly selected hotel, try to find from the hotels array
        const selectedHotelForDay = selectedPackage?.hotels?.[day.day];
        if (selectedHotelForDay?.hotelInfo?.id && cityHotels) {
          hotel = cityHotels.find(h => h._id === selectedHotelForDay.hotelInfo.id);
        }
        
        // If still no hotel found, use the first hotel from the city
        if (!hotel && cityHotels?.length) {
          hotel = cityHotels[0];
        }
      }

      const selectedRoom = hotel?.selectedRoom || hotel?.rooms?.data?.[0];
      const roomRate = getRoomRate(hotel, selectedRoom, index);
      const extraAdultRate = getExtraAdultRate(hotel, selectedRoom, index);
      
      return {
        day: day.day,
        cityName: day?.selectedItinerary?.cityName || '',
        propertyName: hotel?.basicInfo?.propertyName,
        mealPlan: selectedRoom?.mealPlan || "MAP",
        propertyphoto: hotel?.photosAndVideos?.images,
        hotelemail: hotel?.basicInfo?.email,
        roomName: selectedRoom?.roomName,
        roomimage: selectedRoom?.imageUrl,
        roomcount: hotelRoomsAndBeds[`hotel-${day.day}`]?.rooms ?? selectedLead?.noOfRooms ?? 1,
        extrabedcount: hotelRoomsAndBeds[`hotel-${day.day}`]?.extraBeds ?? selectedLead?.extraBeds ?? 0,
        cost: roomRate || 0,
        selectedLead: selectedLead,
        extraAdultRate: extraAdultRate || 0,
        similarhotel: day?.similarhotel || []
      };
    }).filter(hotel => hotel !== null) || [],
    activities: activities?.map(activity => ({
      title: activity.meta_title,
      quantity: activity.quantity,
      description: activity?.
      meta_description,
      thing_to_carry: activity?.things_to_carry      ,
      image: activity?.image,   
dayNumber: activity?.dayNumber,
      price: activity?.price,
      cost: Number(activity?.price) * Number(activity?.quantity) || 0
    })) || [],
    places: paidPlaces,
    totals: {
      transferCost,
      hotelCost: hotelsCost,
      activitiesCost,
      placesCost: totalPlacesCost,
      grandTotal: transferCost + hotelsCost + activitiesCost + totalPlacesCost
    },
    package: selectedPackage.package,
  };

  // Update package summary
  React.useEffect(() => {
    if (selectedPackage && packageSummary) {
      setPackageSummary(packageSummary, selectedPackage);
    }
  }, [packageSummary, selectedPackage, setPackageSummary]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  useEffect(() => {
    const fetchMarginData = async () => {
      try {
        const fullPackageState = packageSummary?.package?.state || "";
        const matchingStateMargin = await fetchMarginByState(fullPackageState);
        if (matchingStateMargin) {
          // Immediately set the margin data when found
          setMarginData(matchingStateMargin);
        }
      } catch (error) {
        console.error("Error fetching margin data:", error);
      }
    };

    if (packageSummary?.package?.state) {
      fetchMarginData();
    }
  }, [packageSummary?.package?.state, fetchMarginByState]); // Changed dependency to state

  return (
    <div style={{height:"350px",zIndex:"100"}} className="scroll-y-auto fixed inset-y-0 right-0 w-96 bg-white shadow-xl overflow-y-auto hidden md:block">
      {/* Header */}
      <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Package Details</h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Transfer Details */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-900">Transfer Details</h3>
          </div>
          <div className="p-4">
            {selectedPackage?.cabs?.selectedCabs && selectedPackage.cabs.selectedCabs.length > 0 ? (
              <div className="space-y-3">
                {selectedPackage.cabs.selectedCabs.map((cab, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cab.cabName}</h4>
                      <p className="text-sm text-gray-600">{cab.cabType}</p>
                      <p className="text-sm text-gray-500">Quantity: {cab.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(Number(cab.price) * Number(cab.quantity || 1))}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{Number(cab.price).toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Transfer Cost:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(transferCost)}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedPackage?.cabs?.selectedCab ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{selectedPackage.cabs.selectedCab.cabName}</h4>
                    <p className="text-sm text-gray-600">{selectedPackage.cabs.selectedCab.cabType}</p>
                    <p className="text-sm text-gray-500">Quantity: {cabQuantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(Number(selectedPackage.cabs.selectedCab.price) * Number(cabQuantity || 1))}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{Number(selectedPackage.cabs.selectedCab.price).toLocaleString()} each
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No transfers selected</p>
            )}
          </div>
        </div>

        {/* Hotels Details */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-900">Hotel Details</h3>
          </div>
          <div className="divide-y">
            {selectedPackage?.package?.itineraryDays?.map((day, index) => {
              const isFirstDay = day.day === 1 && selectedPackage?.package?.packagePlaces[0]?.transfer;
              const isLastDay = index === selectedPackage.package.itineraryDays.length - 1;

              // Skip first and last day by returning null
              if (isFirstDay || isLastDay) return null;

              // Get the hotel for this day
              let hotel = day?.selectedHotel; // First priority: directly selected hotel

              if (!hotel && day?.selectedItinerary?.cityName) {
                const cityHotels = hotelsByCity[day.selectedItinerary.cityName.toLowerCase()];
                
                // If no directly selected hotel, try to find from the hotels array
                const selectedHotelForDay = selectedPackage?.hotels?.[day.day];
                if (selectedHotelForDay?.hotelInfo?.id && cityHotels) {
                  hotel = cityHotels.find(h => h._id === selectedHotelForDay.hotelInfo.id);
                }
                
                // If still no hotel found, use the first hotel from the city
                if (!hotel && cityHotels?.length) {
                  hotel = cityHotels[0];
                }
              }

              const selectedRoom = hotel?.selectedRoom || hotel?.rooms?.data?.[0];
              const roomRate = getRoomRate(hotel, selectedRoom, index);
              const extraAdultRate = getExtraAdultRate(hotel, selectedRoom, index);

              return hotel && !isFirstDay && !isLastDay ? ( // Only render if not first or last day
                <div key={index} className="p-4">
                  <div className="space-y-4">
                    {/* Hotel Name */}
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-lg">{hotel?.basicInfo?.propertyName}</h4>
                    </div>

                    {/* Room Details Card */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Room Type */}
                      {selectedRoom && (
                        <div className="flex items-center">
                          <svg 
                            className="w-5 h-5 text-gray-500 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-gray-500">Room Type</p>
                            <p className="font-medium">{selectedRoom.roomName}</p>
                          </div>
                        </div>
                      )}

                      {/* Price Details */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <p className="text-sm text-gray-500">Base Rate</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(getRoomRate(hotel, selectedRoom, index) || 0)}
                              <span className="text-sm text-gray-500 ml-1">per night</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(
                                (getRoomRate(hotel, selectedRoom, index) * (hotelRoomsAndBeds[`hotel-${day.day}`]?.rooms ?? selectedLead?.noOfRooms ?? 1)) +
                                (getExtraAdultRate(hotel, selectedRoom, index) * (hotelRoomsAndBeds[`hotel-${day.day}`]?.extraBeds ?? selectedLead?.extraBeds ?? 0)) || 0
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Similar Hotels Section */}
                    {day?.similarhotel && Array.isArray(day.similarhotel) && day.similarhotel.length > 0 && (
                      <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center mb-3">
                          <svg 
                            className="w-5 h-5 text-green-600 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <h5 className="font-medium text-green-800">Similar Hotels</h5>
                        </div>
                        <div className="space-y-2">
                          {day.similarhotel.map((similarHotel, similarIndex) => (
                            <div 
                              key={similarIndex} 
                              className="flex items-center justify-between bg-white rounded-md p-2 border border-green-100"
                            >
                              <div className="flex items-center flex-1">
                                <div className="flex items-center mr-2">
                                  {[...Array(similarHotel.rating || 0)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className="w-3 h-3 text-yellow-400"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                  {similarHotel.propertyName}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {similarHotel.rating || 0} Star
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null; // Return null for first and last day
            })}
          </div>
        </div>

        {/* Activities Details */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-900">Activities Details</h3>
          </div>
          <div className="divide-y">
            {activities?.map((activity, index) => (
              <div key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.meta_title}</h4>
                      <div className="mt-2 text-sm">
                        <p>Quantity: {activity.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(activity.price) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-900">Cost Summary</h3>
          </div>
          <div className="p-4 space-y-3">
            {/* Transfer Cost */}
            <div className="flex justify-between text-sm">
              <span>Total Transfer Cost:</span>
              <span>
                {formatCurrency(transferCost)}
              </span>
            </div>

            {/* Hotel Cost */}
            <div className="flex justify-between text-sm">
              <span>Total Hotel Cost:</span>
              <span>
                {formatCurrency(packageSummary.totals.hotelCost)}
              </span>
            </div>

            {/* Activities Cost */}
            <div className="flex justify-between text-sm">
              <span>Total Activities Cost:</span>
              <span>
                {formatCurrency(packageSummary.totals.activitiesCost)}
              </span>
            </div>

            {/* Paid Places Section */}
            {paidPlaces.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Paid Places:</p>
                {paidPlaces.map((place, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Day {place.day} - {place.name}</span>
                    <span>{formatCurrency(place.cost)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm mt-2">
                  <span>Total Places Cost:</span>
                  <span>{formatCurrency(totalPlacesCost)}</span>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-3 border-t flex justify-between font-medium">
              <span>Grand Total:</span>
              <span>
                {formatCurrency(packageSummary.totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsPopup; 