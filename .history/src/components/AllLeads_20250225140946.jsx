import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Check your config.API_HOST value
console.log("API Host:", config.API_HOST);

const AllLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leadDetails");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sharingMethod, setSharingMethod] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [isPackageInfoOpen, setIsPackageInfoOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageInfoTab, setPackageInfoTab] = useState("package");
  const [selectedCabs, setSelectedCabs] = useState({});

  const [selectedCab, setSelectedCab] = useState({
    _id: "6720c5643d0bb849fbd7565a",
    cabName: "Swift Dzyre",
    cabType: "Hatchback",
    cabSeatingCapacity: "4 Seater",
    cabLuggage: "Small Trunk",
    cabImages: [
      "https://firebasestorage.googleapis.com/v0/b/mern-estate-1b3d0.appspot.com/o/1730200926947swift-dzire11.webp?alt=media&token=70c6ec4e-20d9-416e-aec6-be1bfd7c8de6",
    ],
  });
  const [cabs, setCabs] = useState([]);
  const [isLoadingCabs, setIsLoadingCabs] = useState(false);
  const [cabQuantity, setCabQuantity] = useState(1);
  const [selectedCabForBooking, setSelectedCabForBooking] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [allHotels, setAllHotels] = useState([]);
  const [hotelsByCity, setHotelsByCity] = useState({});

  // Add state to track which day's hotels are being shown
  const [showHotelsForDay, setShowHotelsForDay] = useState(null);

  // Add these state variables at the top of your component
  const [showCabsPanel, setShowCabsPanel] = useState(false);
  const [availableCabs, setAvailableCabs] = useState([]);

  // Add this state if not already present
  const [cabQuantities, setCabQuantities] = useState({});

  // Add this state for selected cab details view
  const [showSelectedCabDetails, setShowSelectedCabDetails] = useState(false);

  // Add these state variables if not already present
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedDayForHotelChange, setSelectedDayForHotelChange] =
    useState(null);
  const [selectedCity, setSelectedCity] = useState("");

  // Add this state at the top with other state declarations
  const [itineraryDetails, setItineraryDetails] = useState({});
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  const [showCabModal, setShowCabModal] = useState(false);

  // Add this state for the sliding modal
  const [showCabSlider, setShowCabSlider] = useState(false);

  // Add these state variables at the top with your other states
  const [showHotelSlider, setShowHotelSlider] = useState(false);
  const [selectedDayForHotelSlider, setSelectedDayForHotelSlider] =
    useState(null);

  // Add this state for managing expanded hotels
  const [expandedHotel, setExpandedHotel] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchCabs();
  }, []);

  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSliderOpen]);

  useEffect(() => {
    fetchHotels();
  }, [selectedPackage]);

  useEffect(() => {
    if (viewLead?.assignedPackage?.hotels?.length > 0) {
      setSelectedHotel(viewLead.assignedPackage.hotels[0]);
    }
  }, [viewLead]);

  useEffect(() => {
    if (isPackageInfoOpen) {
      fetchCabs();
    }
  }, [isPackageInfoOpen]);

  useEffect(() => {
    fetchAllHotels();
  }, []);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!selectedPackage?.package?.itineraryDays) return;

      setIsLoadingItinerary(true);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) throw new Error("No user data found");

        const userData = JSON.parse(userStr);
        const token = userData.data.token;

        for (const day of selectedPackage.package.itineraryDays) {
          // Check if the day has a selected itinerary
          if (day?.selectedItinerary?._id) {
            const response = await fetch(
              `${config.API_HOST}/api/itinerary/getitinerary/${day.selectedItinerary._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
              setItineraryDetails((prevDetails) => ({
                ...prevDetails,
                [day.selectedItinerary._id]: data.itinerary,
              }));
            }
          } else {
          }
        }
      } catch (error) {
        toast.error(`Failed to load itinerary: ${error.message}`);
      } finally {
        setIsLoadingItinerary(false);
      }
    };

    fetchItineraries();
  }, [selectedPackage?.package?.itineraryDays]);

  // Function to fetch hotels for a specific city
  const fetchHotelsByCity = async (cityName) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemaker-hotels-by-city/${cityName}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data.data || [],
        }));
      }
    } catch (error) {}
  };

  // Add this new function to extract and fetch hotels for each city in the itinerary
  const fetchHotelsForItinerary = async (itineraryDays) => {
    try {
      // Fetch hotels for the first day's city as a test
      if (itineraryDays && itineraryDays[0]?.selectedItinerary?.cityName) {
        const cityName = itineraryDays[0].selectedItinerary.cityName;

        const response = await fetch(`/api/hotels?city=${cityName}`);
        const data = await response.json();

        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data,
        }));
      }
    } catch (error) {}
  };

  // Update the useEffect when selectedPackage changes to fetch hotels for all cities
  useEffect(() => {
    if (selectedPackage?.package?.itineraryDays) {
      fetchHotelsForItinerary(selectedPackage.package.itineraryDays);
    }
  }, [selectedPackage]);

  // Modify the getHotelsForCity function to match your console data structure
  const getHotelsForCity = (cityName) => {
    if (!cityName) return [];

    const normalizedCityName = cityName.toLowerCase().trim();
    const cityHotels = hotelsByCity[normalizedCityName] || [];

    return cityHotels.map((hotel) => ({
      id: hotel._id,
      name: hotel?.basicInfo?.propertyName,
      description: hotel?.basicInfo?.propertyDescription,
      images: hotel?.photosAndVideos?.images || [],
      // Add any other fields you need
    }));
  };

  // Function to handle the Change Hotel button click
  const handleChangeHotelClick = (dayNumber) => {
    setShowHotelsForDay(showHotelsForDay === dayNumber ? null : dayNumber);
  };

  // Modified hotel rendering function
  // ... existing code ...

  const renderHotels = (day, index, totalDays) => {
    const hotel = selectedHotel || hotelsByCity[day?.selectedItinerary?.cityName?.toLowerCase()]?.[0];
    
    if (!hotel) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Header remains visible even when no hotel is selected */}
          <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">Stay at {day?.selectedItinerary?.cityName}</h3>
                  <p className="text-gray-300 text-sm">Night {index} of {totalDays - 1}</p>
                </div>
              </div>
              <button 
                onClick={() => handleHotelChangeClick(day)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Select Hotel
              </button>
            </div>
          </div>

          {/* Empty State Message */}
          <div className="p-8 flex flex-col items-center justify-center text-center bg-gray-50">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Hotel Selected</h4>
            <p className="text-gray-500 mb-4">Please select a hotel for this night of your stay</p>
            <button
              onClick={() => handleHotelChangeClick(day)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Select Hotel
            </button>
          </div>
        </div>
      );
    }

    // Rest of the existing hotel display code when a hotel is selected
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Hotel Header */}
        <div className="bg-[rgb(45,45,68)] text-white px-4 py-2 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">Stay at {day?.selectedItinerary?.cityName}</h3>
                <p className="text-gray-300 text-sm">Night {index} of {totalDays - 1}</p>
              </div>
            </div>
            <button 
              onClick={() => handleHotelChangeClick(day)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Change Hotel
            </button>
          </div>
        </div>

        {/* Hotel Content */}
        <div className="p-6">
          <div className="flex gap-8">
            {/* Hotel Image Gallery */}
            <div className="w-72 relative group">
              <div className="aspect-w-16 aspect-h-10 rounded-xl overflow-hidden">
                <img
                  src={hotel.photosAndVideos?.images?.[0] || '/default-hotel.jpg'}
                  alt={hotel.basicInfo?.propertyName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                {hotel.basicInfo?.rating && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {hotel.basicInfo.rating} ★
                  </div>
                )}
              </div>
              {hotel.photosAndVideos?.images?.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {hotel.photosAndVideos.images.slice(0, 5).map((_, idx) => (
                    <button key={idx} className="w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-colors" />
                  ))}
                </div>
              )}
            </div>

            {/* Hotel Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {hotel.basicInfo?.propertyName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(parseInt(hotel.basicInfo?.hotelStarRating || 0))].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {hotel.basicInfo?.hotelStarRating}-Star Property
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <p className="text-sm text-gray-600 mt-2">
                              {hotel.basicInfo?.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{hotel.price || "5000"}
                            </p>
                            <p className="text-sm text-gray-500">per night</p>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="mt-4 flex items-center gap-4">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
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
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
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

                        {/* Select Button */}
                        <button
                          onClick={() => {
                            handleSelectHotel(
                              hotel,
                              selectedDayForHotelSlider?.day
                            );
                            setShowHotelSlider(false);
                          }}
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Select Hotel
                        </button>
                      </div>
                    </div>

                    {/* View Rooms Button */}
                    <button
                      onClick={async () => {
                        if (expandedHotel === hotel._id) {
                          setExpandedHotel(null);
                        } else {
                          setExpandedHotel(hotel._id);
                          // Fetch rooms if not already loaded
                          if (!hotel.rooms) {
                            const roomsData = await fetchHotelRooms(hotel._id);
                            // Update the hotel with rooms data
                            const updatedHotels = hotelsByCity[
                              selectedCity?.toLowerCase()
                            ].map((h) => {
                              if (h._id === hotel._id) {
                                return { ...h, rooms: roomsData };
                              }
                              return h;
                            });

                            // Update state with new hotels data
                            setHotelsByCity({
                              ...hotelsByCity,
                              [selectedCity?.toLowerCase()]: updatedHotels,
                            });
                          }
                        }
                      }}
                      className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <span>
                        {expandedHotel === hotel._id
                          ? "Hide Rooms"
                          : "View Rooms"}
                      </span>
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          expandedHotel === hotel._id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Room List */}
                    {expandedHotel === hotel._id && (
                      <div className="border-t mt-4">
                        <div className="p-4">
                          <h4 className="text-lg font-medium mb-4">
                            Available Rooms
                          </h4>
                          <div className="space-y-4">
                            {hotel.rooms?.data?.map((room) => (
                              <div
                                key={room._id}
                                className="bg-white rounded-lg border p-4"
                              >
                                <div className="flex gap-6">
                                  {/* Room Image */}
                                  <div className="w-48 h-36 flex-shrink-0">
                                    <img
                                      src={room.imageUrl}
                                      alt={room.roomName}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/300x200?text=Room+Image";
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
                                        <p className="text-2xl font-bold text-gray-900">
                                          ₹{room.baseRate}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          per night
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg
                                            className="w-4 h-4"
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
                                          <span>
                                            Room Type: {room.roomType}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                          </svg>
                                          <span>
                                            Max Occupancy: {room.maxOccupancy} (
                                            {room.maxAdults} Adults +{" "}
                                            {room.maxChildren} Children)
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                            />
                                          </svg>
                                          <span>Bed Type: {room.bedType}</span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                            />
                                          </svg>
                                          <span>
                                            Room Size: {room.roomsizeinnumber}{" "}
                                            {room.roomSize}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                          </svg>
                                          <span>View: {room.roomView}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                          <svg
                                            className="w-4 h-4"
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
                                          <span>{room.mealOption}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                      <div className="text-sm text-gray-600">
                                        <p>
                                          Extra Adult Charge: ₹
                                          {room.extraAdultCharge}
                                        </p>
                                        <p>Child Charge: ₹{room.childCharge}</p>
                                        <p>
                                          Room Count Available: {room.roomCount}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          handleSelectHotel(
                                            { ...hotel, selectedRoom: room },
                                            selectedDayForHotelSlider?.day
                                          );
                                          setShowHotelSlider(false);
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        Select Room
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {!hotel.rooms && (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">
                                  Loading rooms...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllLeads;

// Add this function with your other API functions
const fetchHotelRooms = async (hotelId) => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) throw new Error("No user data found");

    const userData = JSON.parse(userStr);
    const token = userData.data.token;

    const response = await fetch(
      `${config.API_HOST}/api/packagemaker/get-packagemakerrooms-by-id/${hotelId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
};
