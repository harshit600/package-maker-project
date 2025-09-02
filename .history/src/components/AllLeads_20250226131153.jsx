import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";
import ActivitySlider from "./ActivitySlider";
import { FaPlus } from "react-icons/fa";

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

  // Add state for room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);

  // Add this to your existing state declarations
  const [showRoomSlider, setShowRoomSlider] = useState(false);
  const [isActivitySliderOpen, setIsActivitySliderOpen] = useState(false);

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

  // Add function to handle room change click
  const handleRoomChangeClick = async (hotel) => {
    setSelectedHotelForRooms(hotel);
    // Fetch rooms if not already loaded
    if (!hotel.rooms) {
      const roomsData = await fetchHotelRooms(hotel._id);
      setSelectedHotelForRooms((prev) => ({
        ...prev,
        rooms: roomsData,
      }));
    }
    setShowRoomSlider(true);
  };

  const renderHotels = (day, index, totalDays) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Hotel Header */}
      <div className="bg-gradient-to-r from-[rgb(45,45,68)] to-[rgb(65,65,98)] text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
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
            </div>
            <div>
              <h3 className="text-lg font-semibold">Hotel Stay - Day {day.day}</h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {selectedPackage?.hotels?.length || 0} hotels selected
              </p>
            </div>
          </div>
          {/* Total Price Display */}
          <div className="text-right">
            <div className="text-sm text-gray-300">Total Room Cost</div>
            <div className="text-xl font-bold">
              ₹{(selectedPackage?.hotels || [])
                .filter(hotel => hotel.dayNumber === day.day)
                .reduce((acc, hotel) => 
                  acc + ((hotel.price || 0) * (hotel.quantity || 1)), 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Content */}
      <div className="p-3">
        <div className="space-y-3">
          {selectedPackage?.hotels
            ?.filter(hotel => hotel.dayNumber === day.day)
            .map((hotel, hotelIndex) => (
              <div
                key={hotelIndex}
                className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex p-3">
                  {/* Hotel Image */}
                  <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={hotel.imageUrl || "https://placehold.co/300x200?text=Hotel"}
                      alt={hotel.hotelName}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x200?text=Hotel";
                      }}
                    />
                  </div>

                  {/* Hotel Details */}
                  <div className="flex-1 ml-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {hotel.hotelName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {hotel.starRating} Star
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{hotel.price}
                        </div>
                        <div className="text-xs text-gray-500">per room/night</div>

                        {/* Room Quantity Selector */}
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const updatedHotels = selectedPackage.hotels.map(h => {
                                if (h === hotel) {
                                  return {
                                    ...h,
                                    quantity: Math.max((h.quantity || 1) - 1, 1)
                                  };
                                }
                                return h;
                              });
                              setSelectedPackage(prev => ({
                                ...prev,
                                hotels: updatedHotels
                              }));
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {hotel.quantity || 1}
                          </span>
                          <button
                            onClick={() => {
                              const updatedHotels = selectedPackage.hotels.map(h => {
                                if (h === hotel) {
                                  return {
                                    ...h,
                                    quantity: (h.quantity || 1) + 1
                                  };
                                }
                                return h;
                              });
                              setSelectedPackage(prev => ({
                                ...prev,
                                hotels: updatedHotels
                              }));
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="mt-1 text-sm text-gray-600">
                          Total: ₹{((hotel.price || 0) * (hotel.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Hotel Description */}
                    <p className="mt-1.5 text-gray-600 text-xs line-clamp-2">
                      {hotel.description}
                    </p>

                    {/* Hotel Meta Information */}
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        <span className="text-xs">{hotel.location}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            const updatedHotels = selectedPackage.hotels.filter(h => h !== hotel);
                            setSelectedPackage(prev => ({
                              ...prev,
                              hotels: updatedHotels
                            }));
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          {hotel.quantity || 1} Room{(hotel.quantity || 1) > 1 ? 's' : ''} Selected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderActivities = (day, index, totalDays) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Activities Header */}
      <div className="bg-gradient-to-r from-[rgb(45,45,68)] to-[rgb(65,65,98)] text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18S13.168 18.477 12 19.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Activities - Day {day.day}</h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {day.activities?.length || 0} activities selected
              </p>
            </div>
          </div>
          {/* Total Price Display */}
          <div className="text-right">
            <div className="text-sm text-gray-300">Total Activity Cost</div>
            <div className="text-xl font-bold">
              ₹{day.activities?.reduce((acc, activity) => 
                acc + ((activity.price || 0) * (activity.quantity || 1)), 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Activities Content */}
      <div className="p-3">
        <div className="space-y-3">
          {day.activities?.map((activity, activityIndex) => (
            <div
              key={activityIndex}
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex p-3">
                {/* Activity Image */}
                <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={activity.imageUrl || "https://placehold.co/300x200?text=Activity"}
                    alt={activity.activityName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x200?text=Activity";
                    }}
                  />
                </div>

                {/* Activity Details */}
                <div className="flex-1 ml-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {activity.activityName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {activity.category}
                        </span>
                        {activity.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{activity.price}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>

                      {/* Quantity Selector */}
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const updatedActivities = day.activities.map(a => {
                              if (a === activity) {
                                return {
                                  ...a,
                                  quantity: Math.max((a.quantity || 1) - 1, 1)
                                };
                              }
                              return a;
                            });
                            setSelectedPackage(prev => ({
                              ...prev,
                              package: {
                                ...prev.package,
                                itineraryDays: prev.package.itineraryDays.map(d => {
                                  if (d.day === day.day) {
                                    return {
                                      ...d,
                                      activities: updatedActivities
                                    };
                                  }
                                  return d;
                                })
                              }
                            }));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {activity.quantity || 1}
                        </span>
                        <button
                          onClick={() => {
                            const updatedActivities = day.activities.map(a => {
                              if (a === activity) {
                                return {
                                  ...a,
                                  quantity: (a.quantity || 1) + 1
                                };
                              }
                              return a;
                            });
                            setSelectedPackage(prev => ({
                              ...prev,
                              package: {
                                ...prev.package,
                                itineraryDays: prev.package.itineraryDays.map(d => {
                                  if (d.day === day.day) {
                                    return {
                                      ...d,
                                      activities: updatedActivities
                                    };
                                  }
                                  return d;
                                })
                              }
                            }));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                        >
                          +
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="mt-1 text-sm text-gray-600">
                        Total: ₹{((activity.price || 0) * (activity.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Activity Description */}
                  <p className="mt-1.5 text-gray-600 text-xs line-clamp-2">
                    {activity.description?.replace(/<\/?[^>]+(>|$)/g, "")}
                  </p>

                  {/* Activity Meta Information */}
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs">{activity.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="text-xs">{activity.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          const updatedActivities = day.activities.filter(a => a !== activity);
                          setSelectedPackage(prev => ({
                            ...prev,
                            package: {
                              ...prev.package,
                              itineraryDays: prev.package.itineraryDays.map(d => {
                                if (d.day === day.day) {
                                  return {
                                    ...d,
                                    activities: updatedActivities
                                  };
                                }
                                return d;
                              })
                            }
                          }));
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        {activity.quantity || 1} Person{(activity.quantity || 1) > 1 ? 's' : ''} Selected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderItinerary = (day, index, totalDays) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Itinerary Header */}
      <div className="bg-gradient-to-r from-[rgb(45,45,68)] to-[rgb(65,65,98)] text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Itinerary - Day {day.day}</h3>
              <p className="text-xs text-gray-300 mt-0.5">
                {day.selectedItinerary?.itineraryName || "No itinerary selected"}
              </p>
            </div>
          </div>
          {/* Total Price Display */}
          <div className="text-right">
            <div className="text-sm text-gray-300">Total Itinerary Cost</div>
            <div className="text-xl font-bold">
              ₹{day.selectedItinerary?.price?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <div className="p-3">
        <div className="space-y-3">
          {day.selectedItinerary ? (
            <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex p-3">
                {/* Itinerary Image */}
                <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={day.selectedItinerary.imageUrl || "https://placehold.co/300x200?text=Itinerary"}
                    alt={day.selectedItinerary.itineraryName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/300x200?text=Itinerary";
                    }}
                  />
                </div>

                {/* Itinerary Details */}
                <div className="flex-1 ml-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {day.selectedItinerary.itineraryName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {day.selectedItinerary.category}
                        </span>
                        {day.selectedItinerary.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{day.selectedItinerary.price}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                  </div>

                  {/* Itinerary Description */}
                  <p className="mt-1.5 text-gray-600 text-xs line-clamp-2">
                    {day.selectedItinerary.description?.replace(/<\/?[^>]+(>|$)/g, "")}
                  </p>

                  {/* Itinerary Meta Information */}
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs">{day.selectedItinerary.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="text-xs">{day.selectedItinerary.location}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          const updatedDays = selectedPackage.package.itineraryDays.map(d => {
                            if (d.day === day.day) {
                              return {
                                ...d,
                                selectedItinerary: null
                              };
                            }
                            return d;
                          });
                          setSelectedPackage(prev => ({
                            ...prev,
                            package: {
                              ...prev.package,
                              itineraryDays: updatedDays
                            }
                          }));
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        {day.selectedItinerary.quantity || 1} Person{(day.selectedItinerary.quantity || 1) > 1 ? 's' : ''} Selected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
              {/* Empty State Message */}
              <div className="p-8 flex flex-col items-center justify-center text-center bg-gray-50">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Itinerary Selected
                </h4>
                <p className="text-gray-500 mb-4">
                  Please select an itinerary for this day
                </p>
                <button
                  onClick={() => handleItineraryChangeClick(day)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Select Itinerary
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCabs = (day, index, totalDays) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Cabs Header */}
      <div className="bg-gradient-to-r from-[rgb(45,45,68)] to-[rgb(65,65,98)] text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
