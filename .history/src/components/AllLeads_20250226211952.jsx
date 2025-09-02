import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";
import ActivitySlider from "./ActivitySlider";
import { FaPlus } from "react-icons/fa";
import SightseeingSlider from "./SightseeingSlider";

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
  const [selectedPackage, setSelectedPackage] = useState({
    activities: [],
    // ... other package properties ...
  });
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

  // Add these state variables at the top with other state declarations
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

  // Add these state variables at the top with other state declarations
  const [isSightseeingSliderOpen, setIsSightseeingSliderOpen] = useState(false);
  const [selectedDayForSightseeing, setSelectedDayForSightseeing] =
    useState(null);

  // Add this state variable at the top with other state declarations
  const [citySightseeing, setCitySightseeing] = useState([]);

  // Add this state variable for activities
  const [selectedDayForActivities, setSelectedDayForActivities] =
    useState(null);
  const [showActivitySlider, setShowActivitySlider] = useState(false);

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

  const renderHotels = (day, index, totalDays) => {
    // Get the selected hotel with room details from the day's data
    const hotel =
      day.selectedHotel ||
      hotelsByCity[day?.selectedItinerary?.cityName?.toLowerCase()]?.[0];
    const selectedRoom = day.selectedHotel?.selectedRoom;

    if (!hotel) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Header remains visible even when no hotel is selected */}
          <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-white"
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
                  <h3 className="text-white font-medium text-lg">
                    Stay at {day?.selectedItinerary?.cityName}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Night {index} of {totalDays - 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleHotelChangeClick(day)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Select Hotel
              </button>
            </div>
          </div>

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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Hotel Selected
            </h4>
            <p className="text-gray-500 mb-4">
              Please select a hotel for this night of your stay
            </p>
            <button
              onClick={() => handleHotelChangeClick(day)}
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
                  d="M12 4v16m8-8H4"
                />
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
                <svg
                  className="w-6 h-6 text-white"
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
                <h3 className="text-white font-medium text-lg">
                  Stay at {day?.selectedItinerary?.cityName}
                </h3>
                <p className="text-gray-300 text-sm">
                  Night {index} of {totalDays - 1}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleHotelChangeClick(day)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
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
                  src={
                    hotel.photosAndVideos?.images?.[0] || "/default-hotel.jpg"
                  }
                  alt={hotel.basicInfo?.propertyName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                {hotel.basicInfo?.hotelStarRating && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-white px-2 py-1 rounded text-sm font-medium">
                    {hotel.basicInfo.hotelStarRating} ★
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {hotel.basicInfo?.propertyName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {hotel.basicInfo?.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{selectedRoom?.baseRate || hotel.price || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
              </div>

              {/* Selected Room Details */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">Selected Room</h5>
                    {selectedRoom ? (
                      <>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedRoom.roomName}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
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
                            Max {selectedRoom.maxOccupancy} Guests
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
                            {selectedRoom.bedType}
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
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                            {selectedRoom.roomsizeinnumber}{" "}
                            {selectedRoom.roomSize}
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
                            {selectedRoom.mealOption}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">
                        No room selected
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRoomChangeClick(hotel)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change Room Type
                  </button>
                </div>
              </div>

              {/* Additional Charges */}
              {selectedRoom && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Extra Adult:</span> ₹
                    {selectedRoom.extraAdultCharge}
                  </div>
                  <div>
                    <span className="font-medium">Child:</span> ₹
                    {selectedRoom.childCharge}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ... rest of your existing code ...

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      // Extract token from the nested data structure
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${config.API_HOST}/api/leads/get-leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // First, let's add some console logs to debug the fetch function
  const fetchCabs = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setCabs(data.result);
        // Set Swift Dzire as default
        const swiftDzire = data.result.find(
          (cab) => cab._id === "6720c5643d0bb849fbd7565a"
        );
        if (swiftDzire) {
          setSelectedCab(swiftDzire);
        }
      }
    } catch (error) {
      toast.error("Failed to load cabs. Please try again.");
    }
  };

  // Add this new function to handle cab selection
  const handleCabSelection = (cab) => {
    setSelectedCab(cab);
    if (selectedPackage) {
      const updatedPackage = {
        ...selectedPackage,
        cabs: {
          ...selectedPackage.cabs,
          travelPrices: {
            ...selectedPackage.cabs?.travelPrices,
            cabImage: cab.cabImages[0],
            cabName: cab.cabName,
            cabType: cab.cabType,
            seatingCapacity: cab.cabSeatingCapacity,
            luggageCapacity: cab.cabLuggage,
            hasAC: cab.hasAC,
            pricePerKm: cab.pricePerKm,
          },
        },
      };
      setSelectedPackage(updatedPackage);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      const mobileMatch = lead.mobile
        ?.toLowerCase()
        .includes(searchMobile.toLowerCase());
      const nameMatch = lead.name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const categoryMatch =
        !searchCategory ||
        lead.packageCategory?.toLowerCase() === searchCategory.toLowerCase();
      return mobileMatch && nameMatch && categoryMatch;
    });
  };

  // Update pagination logic to use filtered leads
  const filteredLeads = getFilteredLeads();
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Get unique categories from leads instead of packages
  const uniqueCategories = [
    ...new Set(leads.map((lead) => lead.packageCategory)),
  ].filter(Boolean);

  const getStatusColor = (status) => {
    switch (status) {
      case "Yes":
        return "bg-green-100 text-green-800";
      case "No":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Modify fetchPackages to accept lead as parameter
  const fetchPackages = async (lead) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      // Get destination from passed lead parameter
      const destination = lead?.destination;

      if (!destination) {
        return [];
      }

      const response = await fetch(`${config.API_HOST}/api/add/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();

      // Filter packages where lead destination matches package name
      const filteredPackages = data.filter((pkg) => {
        const searchTerm = destination.toLowerCase().trim();
        const packageName = (pkg.package?.packageName || "")
          .toLowerCase()
          .trim();

        return packageName.includes(searchTerm);
      });

      return filteredPackages;
    } catch (error) {
      toast.error(`Failed to load packages: ${error.message}`);
      return [];
    }
  };

  // Modify handleEditClick to pass the lead directly
  const handleEditClick = async (lead) => {
    if (!lead) {
      return;
    }

    // Set the lead first
    setSelectedLead(lead);
    setIsEditPanelOpen(true);

    if (lead?.destination) {
      const packages = await fetchPackages(lead); // Pass lead directly

      setAvailablePackages(packages);
    } else {
      setAvailablePackages([]); // Clear any existing packages
      toast.warning("No destination specified for this lead");
    }
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setSelectedLead(null);
  };

  // Add this function to handle sharing
  const handleShare = async (method) => {
    if (!selectedLead?.assignedPackage) {
      toast.error("No package assigned to share");
      return;
    }

    try {
      setIsSharing(true);
      setSharingMethod(method);

      switch (method) {
        case "whatsapp":
          // Format the message for WhatsApp
          const whatsappMessage = encodeURIComponent(
            `*Package Details*\n` +
              `Package: ${selectedLead.assignedPackage.packageName}\n` +
              `Duration: ${selectedLead.assignedPackage.duration} Days\n` +
              `Price: ₹${selectedLead.assignedPackage.price}`
          );

          // Log sharing attempt
          await fetch(`${config.API_HOST}/api/leads/log-share`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: selectedLead._id,
              packageId: selectedLead.assignedPackage._id,
              shareMethod: "whatsapp",
            }),
          });

          // Open WhatsApp in new window
          window.open(
            `https://wa.me/${selectedLead.mobile}?text=${whatsappMessage}`
          );
          toast.success("WhatsApp opened with package details");
          break;

        case "email":
          const emailResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!emailResponse.ok) throw new Error("Failed to send email");
          toast.success("Package details sent via email");
          break;

        case "sms":
          const smsResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-sms`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!smsResponse.ok) throw new Error("Failed to send SMS");
          toast.success("Package details sent via SMS");
          break;

        default:
          throw new Error("Invalid sharing method");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSharing(false);
      setSharingMethod(null);
    }
  };

  // Add this function to handle package editing
  const handleEditPackage = async (packageId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      const response = await fetch(
        `${config.API_HOST}/api/packages/getpackage/${packageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localUser.token}`,
          },
        }
      );

      if (!response.ok) {
        const rawResponse = await response.text();
        throw new Error(
          `Failed to fetch package details: ${response.status} - ${rawResponse}`
        );
      }

      const packageData = await response.json();

      setEditingPackageData(packageData);
      setIsEditingPackage(true);
    } catch (error) {
      toast.error(`Error editing package: ${error.message}`);
    }
  };

  // Add new function to handle view click
  const handleViewClick = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  // Add function to handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/delete-lead/${leadId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete lead");

      toast.success("Lead deleted successfully");
      fetchLeads(); // Refresh the leads list
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add function to handle lead update
  const handleUpdateLead = async (leadId, updatedData) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/update-lead/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update lead");

      toast.success("Lead updated successfully");
      fetchLeads(); // Refresh the leads list
      return true;
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
      return false;
    }
  };

  // Add this function to handle booking
  const handleCabBooking = (cab) => {
    setSelectedCabForBooking(cab);
    setCabQuantity(1);
  };

  // Make sure the handleChangeClick function is properly defined
  const handleChangeClick = () => {
    setShowCabsPanel(true);
    fetchCabs();
  };

  const fetchHotels = async () => {
    try {
      setIsLoadingHotels(true);
      const response = await fetch(
        `${config.API_HOST}/api/packages/getPackageHotels/${selectedPackage._id}`
      );
      const data = await response.json();
      if (data.success) {
        setHotels(data.result);
        // Set the first hotel as default selected
        setSelectedHotel(data.result[0]);
      }
    } catch (error) {
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const handleHotelChangeClick = (day) => {
    setSelectedDayForHotelSlider(day);
    setShowHotelSlider(true);
    const cityName = day?.selectedItinerary?.cityName;

    if (cityName) {
      setSelectedCity(cityName);
      fetchHotelsByCity(cityName);
    }
  };

  const handleChangeRoom = (day, hotel) => {
    setSelectedDay(day);
    setSelectedHotel(hotel);
    setPackageInfoTab("rooms");
    setIsSliderOpen(true);
  };

  const fetchAllHotels = async () => {
    try {
      // Add necessary headers
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemaker`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any other required headers like authentication
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAllHotels(data.data || []);
      } else {
      }
    } catch (error) {
      setAllHotels([]); // Set empty array in case of error
    }
  };

  // Update the handleSelectHotel function
  const handleSelectHotel = (hotelWithRoom, dayNumber) => {
    const updatedPackage = { ...selectedPackage };
    const dayIndex = dayNumber - 1;

    // Update the selected hotel and room for the specific day
    if (updatedPackage.package?.itineraryDays?.[dayIndex]) {
      updatedPackage.package.itineraryDays[dayIndex].selectedHotel = {
        ...hotelWithRoom,
        selectedRoom: hotelWithRoom.selectedRoom || null,
      };
    }

    // Update the state
    setSelectedPackage(updatedPackage);

    // Close both sliders
    setShowHotelSlider(false);
    setShowRoomSlider(false);
  };

  const getMinPrice = (rooms) => {
    if (!rooms?.data?.length) return 0;
    return Math.min(...rooms.data.map((room) => parseInt(room.baseRate) || 0));
  };

  // Add this function to handle quantity changes
  const handleQuantityChange = (cabId, value) => {
    setCabQuantities((prev) => ({
      ...prev,
      [cabId]: Math.max(1, Math.min(10, value)), // Limit quantity between 1 and 10
    }));
  };

  // Update the handleSelectCab function to include quantity
  const handleSelectCab = (cab) => {
    const quantity = cabQuantities[cab._id] || 1;
    setSelectedCab({
      ...cab,
      quantity,
    });
    setShowCabsPanel(false);
    setShowSelectedCabDetails(true); // Make sure this is set to true
  };

  // Add useEffect to check if the panel is actually opening
  useEffect(() => {
    if (showCabsPanel) {
    }
  }, [showCabsPanel]);

  // Add this function to handle hotel change
  const handleChangeHotel = (day) => {
    setSelectedDayForHotelChange(day);
    setShowHotelModal(true);
  };

  // Add this function to handle hotel selection from modal
  const handleHotelChange = (hotel) => {
    if (selectedDayForHotelChange) {
      handleSelectHotel(hotel, selectedDayForHotelChange);
    }
    setShowHotelModal(false);
    setSelectedDayForHotelChange(null);
  };

  // Add this console log to see what data we're receiving
  useEffect(() => {}, [hotels]);

  // Update the hotel card rendering with more checks
  {
    hotels?.map((hotel) => (
      <div
        key={hotel?._id ?? Math.random()}
        className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="flex">
          {/* Hotel Image */}
          <div className="w-40 h-32 flex-shrink-0">
            {hotel?.photosAndVideos?.images?.[0] ? (
              <img
                src={hotel.photosAndVideos.images[0]}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-hotel.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.propertyName
                    : hotel?.propertyName ?? "Hotel Name Not Available"}
                </h3>
                <p className="text-sm text-gray-500">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.hotelStarRating
                    : hotel?.hotelStarRating ?? "Rating Not Available"}
                </p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.propertyDescription
                    : hotel?.propertyDescription ?? "No description available"}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleHotelChangeClick(selectedDay)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Change Hotel
            </button>
          </div>
        </div>
      </div>
    ));
  }

  // Update the selected hotel view with direct property access
  {
    selectedHotel && (
      <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedHotel?.basicInfo?.propertyName ||
                "Hotel Name Not Available"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedHotel?.basicInfo?.hotelStarRating ||
                "Rating Not Available"}
            </p>
          </div>
          {/* ... rest of the code ... */}
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            {selectedHotel?.photosAndVideos?.images?.[0] ? (
              <img
                src={selectedHotel.photosAndVideos.images[0]}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-hotel.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
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
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">About the Property</h4>
            <p className="text-gray-600 mb-4">
              {selectedHotel?.basicInfo?.propertyDescription ||
                "No description available"}
            </p>
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-gray-500 mr-2">
                Rating:
              </span>
              <span className="text-sm font-semibold">
                {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Hotel Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Add or modify the handleActivitySelect function
  const handleActivitySelect = (activityWithDay) => {
    console.log("Activity being added:", activityWithDay); // Debug log
    setSelectedPackage((prev) => {
      const updatedPackage = {
        ...prev,
        activities: [...(prev?.activities || []), activityWithDay],
      };
      console.log("Updated package:", updatedPackage); // Debug log
      return updatedPackage;
    });
  };

  const handleSightseeingSelect = (selectedSights) => {
    setSelectedPackage((prev) => ({
      ...prev,
      sightseeing: [
        ...(prev.sightseeing || []).filter(
          (s) => s.dayNumber !== selectedDayForSightseeing?.day
        ),
        ...selectedSights,
      ],
    }));
  };

  // Add this function to filter sightseeing spots by city
  const filterSightseeingByCity = (cityName) => {
    if (!cityName || !selectedPackage?.sightseeing) return [];

    return selectedPackage?.sightseeing?.filter((sight) => {
      // Convert both to lowercase for case-insensitive comparison
      const sightCity = sight.city?.toLowerCase() || "";
      const currentCity = cityName?.toLowerCase() || "";
      return sightCity === currentCity;
    });
  };

  return (
    <div className="p-3 bg-white relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">All Leads</h2>
        <div className="flex items-center space-x-2">
          <input
            type="search"
            placeholder="Search by name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="search"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchMobile("");
              setSearchName("");
              setSearchCategory("");
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {/* Title section remains unchanged */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(45,45,68)] text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-lg font-medium">Leads Overview</h2>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[rgb(45,45,68)]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Name</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Designation</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Email</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Mobile</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                  <span>Status</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentLeads.map((lead, index) => (
              <tr
                key={lead._id || `demo-${index}`}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-[rgb(59,130,246,0.2)]"
                }`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {lead.packageType}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-[rgb(45,45,68)]">
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {lead.mobile}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      lead.publish
                    )}`}
                  >
                    {lead.publish}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="View Details"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      className="text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
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
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-2 bg-white border-t border-gray-200 sm:px-4">
        <div className="flex justify-center flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="relative ml-2 inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstLead + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastLead, filteredLeads.length)}
              </span>{" "}
              of <span className="font-medium">{filteredLeads.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-3 py-1 border text-sm font-medium ${
                      currentPage === number
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Panel Slide-over */}
      {isEditPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out z-40 ${
              isEditPanelOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClosePanel}
          />

          {/* Side Panel - Updated width from w-1/2 to w-[70%] */}
          <div
            className={`fixed inset-y-0 right-0 w-[70%] bg-[rgb(45,45,68)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
              isEditPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-[rgb(45,45,68)] text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Lead Information</h2>
                <button
                  onClick={handleClosePanel}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
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

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex px-3" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("leadDetails")}
                    className={`${
                      activeTab === "leadDetails"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Lead Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className={`${
                      activeTab === "createPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Lead</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("viewPackage")}
                    className={`${
                      activeTab === "viewPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>View Package</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className={`${
                      activeTab === "sendPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Send Package</span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="p-3 bg-white">
                    <div className="space-y-3">
                      {/* Lead Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {selectedLead?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedLead?.name}
                            </h2>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <span>{selectedLead?.email}</span>
                              <span>•</span>
                              <span>{selectedLead?.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lead Information Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Lead owner
                          </div>
                          <div className="font-medium text-gray-900">
                            Sales Team
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Package Category
                          </div>
                          <div className="font-medium text-gray-900">
                            {selectedLead?.packageCategory || "N/A"}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Annual Revenue
                          </div>
                          <div className="font-medium text-gray-900">
                            ₹{selectedLead?.budget || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Status Tabs */}
                      <div className="flex space-x-2 mb-4">
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          New
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Open
                        </div>
                        <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          In Progress
                        </div>
                      </div>

                      {/* Lead Details Section */}
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Travel Details
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                From
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.from || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Destination
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.destination || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Travel Date
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.travelDate
                                  ? new Date(
                                      selectedLead.travelDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Duration
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.days
                                  ? `${selectedLead.days} Days, ${selectedLead.nights} Nights`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Guest Information Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Guest Information
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Adults
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.adults || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Kids
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.kids || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Total Guests
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.persons || "0"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Recent Activity
                            </h3>
                          </div>
                          <div className="p-3">
                            <div className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-blue-600"
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
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Lead created
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Today at {new Date().toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "createPackage" && selectedLead && (
                  <div className="p-6 bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateLead(selectedLead._id, selectedLead);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                value={selectedLead.name}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    name: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                value={selectedLead.email}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    email: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Mobile
                              </label>
                              <input
                                type="text"
                                value={selectedLead.mobile}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mobile: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Travel Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Travel Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                From
                              </label>
                              <input
                                type="text"
                                value={selectedLead.from}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    from: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Destination
                              </label>
                              <input
                                type="text"
                                value={selectedLead.destination}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    destination: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Travel Date
                              </label>
                              <input
                                type="date"
                                value={
                                  selectedLead.travelDate
                                    ? new Date(selectedLead.travelDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    travelDate: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Duration & Guests */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Duration & Guests
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Days
                              </label>
                              <input
                                type="number"
                                value={selectedLead.days}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    days: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Nights
                              </label>
                              <input
                                type="number"
                                value={selectedLead.nights}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    nights: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Adults
                              </label>
                              <input
                                type="number"
                                value={selectedLead.adults}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    adults: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Kids
                              </label>
                              <input
                                type="number"
                                value={selectedLead.kids}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    kids: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Package Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Package Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Type
                              </label>
                              <select
                                value={selectedLead.packageType}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageType: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Type</option>
                                <option value="family">Family</option>
                                <option value="honeymoon">Honeymoon</option>
                                <option value="adventure">adventure</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Category
                              </label>
                              <select
                                value={selectedLead.packageCategory}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageCategory: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Category</option>
                                <option value="luxury">Luxury</option>

                                <option value="standard">Standard</option>
                                <option value="budget">Budget</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Meal Plans
                              </label>
                              <select
                                value={selectedLead.mealPlans}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mealPlans: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Meal Plan</option>
                                <option value="breakfast">
                                  Breakfast Only
                                </option>
                                <option value="halfboard">Half Board</option>
                                <option value="fullboard">Full Board</option>
                                <option value="allinclusive">
                                  All Inclusive
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Room Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Number of Rooms
                              </label>
                              <input
                                type="number"
                                value={selectedLead.noOfRooms}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    noOfRooms: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Extra Beds
                              </label>
                              <input
                                type="number"
                                value={selectedLead.extraBeds}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    extraBeds: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "viewPackage" && (
                  <div className="p-6 bg-white relative">
                    <div className="space-y-6">
                      {/* Debug Info */}
                      <div className="mb-4 p-2 bg-gray-100 rounded">
                        <p>
                          Available Packages: {availablePackages?.length || 0}
                        </p>
                        <p>
                          Selected Lead Destination:{" "}
                          {selectedLead?.destination || "None"}
                        </p>
                      </div>

                      {/* Lead Destination Info */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Selected Destination
                        </h3>
                        <p className="text-blue-700">
                          {selectedLead?.destination ||
                            "No destination selected"}
                        </p>
                      </div>

                      {/* Packages Table */}
                      <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                PACKAGE NAME
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                TYPE
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                CATEGORY
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                DURATION
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                PRICE
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                ACTIONS
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(availablePackages) &&
                            availablePackages.length > 0 ? (
                              availablePackages.map((pkg, index) => (
                                <tr
                                  key={pkg._id || index}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {pkg.package?.packageName || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      {pkg.package?.packageType || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {pkg.package?.packageCategory || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {pkg.package?.duration
                                      ? `${pkg.package.duration} Days`
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                      {pkg.finalCosting?.baseTotal
                                        ? `₹${pkg.finalCosting.baseTotal}`
                                        : "₹N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => {
                                        setSelectedPackage(pkg);
                                        setIsPackageInfoOpen(true);
                                      }}
                                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                    >
                                      Select Package
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="px-6 py-4 text-center text-gray-500"
                                >
                                  {Array.isArray(availablePackages)
                                    ? "No packages available for this destination"
                                    : "Loading packages..."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Package Info Slide-over */}
                    <div
                      className={`fixed inset-y-0 right-0 w-[90%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                        isPackageInfoOpen ? "translate-x-0" : "translate-x-full"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-[rgb(45,45,68)] text-white">
                          <div className="px-6 py-4 flex justify-between items-center">
                            {packageInfoTab === "cab" ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setPackageInfoTab("package")}
                                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 19l-7-7 7-7"
                                    />
                                  </svg>
                                </button>
                                <h2 className="text-xl font-semibold">
                                  Change Transfer
                                </h2>
                              </div>
                            ) : (
                              <h2 className="text-xl font-semibold">
                                Package Details
                              </h2>
                            )}
                            <button
                              onClick={() => setIsPackageInfoOpen(false)}
                              className="text-white hover:text-gray-200"
                            >
                              <svg
                                className="h-6 w-6"
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

                        {/* Package Info Tabs */}
                        <div className="border-b border-gray-200">
                          <nav className="flex px-6" aria-label="Tabs">
                            <button
                              onClick={() => setPackageInfoTab("package")}
                              className={`${
                                packageInfoTab === "package"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                            >
                              Package Info
                            </button>
                            <button
                              onClick={() => setPackageInfoTab("costing")}
                              className={`${
                                packageInfoTab === "costing"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
                            >
                              Final Costing
                            </button>
                          </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                          {packageInfoTab === "package" && (
                            <div className="p-6 space-y-6">
                              {/* Debug Information */}
                              {console.log(
                                "Selected Package Full Data:",
                                selectedPackage
                              )}
                              {console.log(
                                "Package Basic Info:",
                                selectedPackage?.package
                              )}
                              {console.log(
                                "Package Itinerary:",
                                selectedPackage?.package?.itineraryDays
                              )}
                              {console.log(
                                "Package Hotels:",
                                selectedPackage?.hotels
                              )}
                              {console.log(
                                "Package Cabs:",
                                selectedPackage?.cabs
                              )}
                              {console.log(
                                "Package Activities:",
                                selectedPackage?.activities
                              )}
                              {console.log(
                                "Final Costing:",
                                selectedPackage?.finalCosting
                              )}

                              {/* Package Overview */}
                              <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Package Overview
                                  </h3>
                                </div>
                                <div className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">
                                      Package Details
                                    </h2>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Package Name
                                      </p>
                                      <p className="font-medium">
                                        {selectedPackage?.package?.packageName}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Duration
                                      </p>
                                      <p className="font-medium">
                                        {selectedPackage?.package?.duration}{" "}
                                        Days
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Category
                                      </p>
                                      <p className="font-medium">
                                        {
                                          selectedPackage?.package
                                            ?.packageCategory
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Type
                                      </p>
                                      <p className="font-medium">
                                        {selectedPackage?.package?.packageType}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Trip Itinerary Section */}
                              <div className="bg-white rounded-lg shadow-sm">
                                <div className="p-6">
                                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                                    TRIP ITINERARY
                                  </h3>

                                  <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                    {selectedPackage?.package?.itineraryDays?.map(
                                      (day, index) => {
                                        const currentItinerary =
                                          day.selectedItinerary;
                                        const cityName =
                                          day.selectedItinerary?.cityName;
                                        const isFirstDay = day.day === 1;
                                        const isLastDay =
                                          index ===
                                          selectedPackage?.package
                                            ?.itineraryDays?.length -
                                            1;

                                        // Filter activities for current day
                                        const dayActivities =
                                          selectedPackage?.activities?.filter(
                                            (activity) =>
                                              Number(activity.dayNumber) ===
                                              Number(day.day)
                                          );

                                        // Filter sightseeing based on the current city
                                        const citySightseeing =
                                          selectedPackage?.sightseeing?.filter(
                                            (sight) => {
                                              // Convert both to lowercase for case-insensitive comparison
                                              const sightCity =
                                                sight.city?.toLowerCase() || "";
                                              const currentCity =
                                                cityName?.toLowerCase() || "";
                                              return sightCity === currentCity;
                                            }
                                          );

                                        console.log("Current city:", cityName);
                                        console.log(
                                          "Sightseeing places:",
                                          selectedPackage?.sightseeing
                                        );
                                        console.log(
                                          "Filtered sightseeing:",
                                          citySightseeing
                                        );

                                        if (
                                          cityName &&
                                          !hotelsByCity[cityName.toLowerCase()]
                                        ) {
                                          fetchHotelsByCity(cityName);
                                        }

                                        return (
                                          <div
                                            key={index}
                                            className="mb-8 last:mb-0"
                                          >
                                            {/* Day Header with Timeline Dot */}
                                            <div className="relative flex items-center mb-6">
                                              <div className="absolute left-8 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                                              <div className="ml-16 flex items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                  <div className="bg-[rgb(45,45,68)] text-white px-4 py-2 rounded-lg">
                                                    <span className="text-sm font-medium">
                                                      DAY
                                                    </span>
                                                    <span className="ml-2 text-xl font-bold">
                                                      {day.day}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                      {
                                                        currentItinerary?.itineraryTitle
                                                      }
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-1 text-gray-600">
                                                      {currentItinerary?.cityName && (
                                                        <span className="flex items-center gap-1 text-sm">
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
                                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                          </svg>
                                                          {
                                                            currentItinerary.cityName
                                                          }
                                                          ,{" "}
                                                          {
                                                            currentItinerary.country
                                                          }
                                                        </span>
                                                      )}
                                                      {currentItinerary?.distance && (
                                                        <span className="flex items-center gap-1 text-sm">
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
                                                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                                            />
                                                          </svg>
                                                          {
                                                            currentItinerary.distance
                                                          }{" "}
                                                          km
                                                        </span>
                                                      )}
                                                      {currentItinerary?.totalHours && (
                                                        <span className="flex items-center gap-1 text-sm">
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
                                                          {
                                                            currentItinerary.totalHours
                                                          }{" "}
                                                          hours
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Day Content */}
                                            <div className="ml-16 space-y-6">
                                              {/* Description Card */}
                                              {currentItinerary?.itineraryDescription && (
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                  <h5 className="text-lg font-medium text-gray-900 mb-4">
                                                    Today's Highlights
                                                  </h5>
                                                  <div className="prose max-w-none text-gray-600">
                                                    {
                                                      currentItinerary.itineraryDescription
                                                    }
                                                  </div>
                                                </div>
                                              )}

                                              {/* Only show Transfer Section for Day 1 */}
                                              {isFirstDay && (
                                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                                  {/* Transfer Header */}
                                                  <div className="bg-[rgb(45,45,68)] text-white px-4 py-2 border-b">
                                                    <div className="flex justify-between items-center">
                                                      <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-white/10 rounded-lg">
                                                          <svg
                                                            className="w-6 h-6 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth="2"
                                                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                                            />
                                                          </svg>
                                                        </div>
                                                        <div>
                                                          <h3 className="text-white font-medium text-lg">
                                                            Ground Transfer
                                                          </h3>
                                                          <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-gray-300 text-sm">
                                                              {currentItinerary?.cityName ||
                                                                "Delhi"}
                                                            </span>
                                                            <svg
                                                              className="w-4 h-4 text-gray-300"
                                                              fill="none"
                                                              stroke="currentColor"
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 5l7 7-7 7"
                                                              />
                                                            </svg>
                                                            <span className="text-gray-300 text-sm">
                                                              {selectedPackage
                                                                ?.package
                                                                ?.itineraryDays[1]
                                                                ?.selectedItinerary
                                                                ?.cityName ||
                                                                "Shimla"}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center gap-3">
                                                        <button
                                                          onClick={() =>
                                                            setShowCabSlider(
                                                              true
                                                            )
                                                          }
                                                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
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
                                                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                            />
                                                          </svg>
                                                          Change Vehicle
                                                        </button>
                                                        <button className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors">
                                                          <svg
                                                            className="w-5 h-5"
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
                                                  </div>

                                                  {selectedCab && (
                                                    <div className="p-6">
                                                      <div className="flex gap-8">
                                                        {/* Vehicle Image Gallery */}
                                                        <div className="w-72 relative group">
                                                          <div className="aspect-w-16 aspect-h-10 rounded-xl overflow-hidden">
                                                            <img
                                                              src={
                                                                selectedCab
                                                                  .cabImages[0]
                                                              }
                                                              alt={
                                                                selectedCab.cabName
                                                              }
                                                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                          </div>
                                                          {selectedCab.cabImages
                                                            .length > 1 && (
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                              {selectedCab.cabImages.map(
                                                                (_, idx) => (
                                                                  <button
                                                                    key={idx}
                                                                    className="w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-colors"
                                                                  />
                                                                )
                                                              )}
                                                            </div>
                                                          )}
                                                        </div>

                                                        {/* Vehicle Details */}
                                                        <div className="flex-1">
                                                          <div className="flex justify-between items-start">
                                                            <div>
                                                              <h4 className="text-xl font-semibold text-gray-900">
                                                                {
                                                                  selectedCab.cabName
                                                                }
                                                              </h4>
                                                              <p className="text-gray-500 mt-1">
                                                                {
                                                                  selectedCab.cabType
                                                                }{" "}
                                                                • Private
                                                                Transfer
                                                              </p>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                              <div className="text-sm text-gray-500">
                                                                Starting from
                                                              </div>
                                                              <div className="text-2xl font-bold text-gray-900">
                                                                ₹
                                                                {selectedCab.price ||
                                                                  "2999"}
                                                              </div>
                                                              <div className="text-sm text-gray-500">
                                                                per vehicle
                                                              </div>
                                                            </div>
                                                          </div>

                                                          {/* Features Grid */}
                                                          <div className="mt-6 grid grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                              <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                                  <svg
                                                                    className="w-5 h-5 text-blue-600"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                  >
                                                                    <path
                                                                      strokeLinecap="round"
                                                                      strokeLinejoin="round"
                                                                      strokeWidth="2"
                                                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                  </svg>
                                                                </div>
                                                                <div>
                                                                  <div className="text-sm text-gray-500">
                                                                    Seating
                                                                    Capacity
                                                                  </div>
                                                                  <div className="font-medium">
                                                                    {
                                                                      selectedCab.cabSeatingCapacity
                                                                    }{" "}
                                                                    Passengers
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                                  <svg
                                                                    className="w-5 h-5 text-blue-600"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                  >
                                                                    <path
                                                                      strokeLinecap="round"
                                                                      strokeLinejoin="round"
                                                                      strokeWidth="2"
                                                                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                                    />
                                                                  </svg>
                                                                </div>
                                                                <div>
                                                                  <div className="text-sm text-gray-500">
                                                                    Luggage
                                                                    Space
                                                                  </div>
                                                                  <div className="font-medium">
                                                                    {
                                                                      selectedCab.cabLuggage
                                                                    }
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                              <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                                  <svg
                                                                    className="w-5 h-5 text-blue-600"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                  >
                                                                    <path
                                                                      strokeLinecap="round"
                                                                      strokeLinejoin="round"
                                                                      strokeWidth="2"
                                                                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                    />
                                                                  </svg>
                                                                </div>
                                                                <div>
                                                                  <div className="text-sm text-gray-500">
                                                                    Safety
                                                                    Features
                                                                  </div>
                                                                  <div className="font-medium">
                                                                    First Aid
                                                                    Kit, GPS
                                                                    Tracking
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                              {/* Only show Hotel Section for days that are not first or last */}
                                              {!isFirstDay &&
                                                !isLastDay &&
                                                renderHotels(
                                                  day,
                                                  index,
                                                  selectedPackage?.package
                                                    ?.itineraryDays?.length
                                                )}

                                              {/* Add Activities Button - Only show for middle days */}
                                              {!isFirstDay && !isLastDay && (
                                                <div className="space-y-4">
                                                  {/* Existing Sightseeing Button */}
                                                  <div
                                                    onClick={() => {
                                                      const currentCity =
                                                        day.selectedItinerary
                                                          ?.cityName;
                                                      const filteredSightseeing =
                                                        filterSightseeingByCity(
                                                          currentCity
                                                        );
                                                      setCitySightseeing(
                                                        filteredSightseeing
                                                      );
                                                      setSelectedDayForSightseeing(
                                                        day
                                                      );
                                                      setIsSightseeingSliderOpen(
                                                        true
                                                      );
                                                    }}
                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                                  >
                                                    <div className="p-3 bg-blue-100 rounded-full">
                                                      <FaPlus className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                      <h3 className="font-semibold">
                                                        Add Sightseeing to your
                                                        day
                                                      </h3>
                                                      <p className="text-sm text-gray-600">
                                                        Spend the day at leisure
                                                        or add an activity,
                                                        transfer or meal
                                                      </p>
                                                    </div>
                                                  </div>

                                                  {/* New Activities Button */}
                                                  <div
                                                    onClick={() => {
                                                      setSelectedDayForActivities(
                                                        day
                                                      );
                                                      setShowActivitySlider(
                                                        true
                                                      );
                                                    }}
                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                                  >
                                                    <div className="p-3 bg-green-100 rounded-full">
                                                      <svg
                                                        className="w-5 h-5 text-green-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                      </svg>
                                                    </div>
                                                    <div>
                                                      <h3 className="font-semibold">
                                                        Add Activities to your
                                                        day
                                                      </h3>
                                                      <p className="text-sm text-gray-600">
                                                        Explore and add exciting
                                                        activities for this
                                                        destination
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Activities Section */}
                                              {/* Activities and Sightseeing Section */}
                                              {dayActivities &&
                                                dayActivities.length > 0 && (
                                                  <div className="space-y-6">
                                                    {/* Activities Section */}
                                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                                      {/* Activities Header */}
                                                      <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
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
                                                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                              </svg>
                                                            </div>
                                                            <div>
                                                              <h3 className="text-lg font-semibold">
                                                                Activities for
                                                                Day {day.day}
                                                              </h3>
                                                              <p className="text-xs text-gray-300 mt-0.5">
                                                                {
                                                                  dayActivities.length
                                                                }{" "}
                                                                activities
                                                                planned
                                                              </p>
                                                            </div>
                                                          </div>
                                                          {/* Total Activities Price Display */}
                                                          <div className="text-right">
                                                            <div className="text-sm text-gray-300">
                                                              Total Activities
                                                              Cost
                                                            </div>
                                                            <div className="text-xl font-bold">
                                                              ₹
                                                              {dayActivities
                                                                .reduce(
                                                                  (
                                                                    acc,
                                                                    activity
                                                                  ) =>
                                                                    acc +
                                                                    (activity.price ||
                                                                      activity.discount_price) *
                                                                      (activity.quantity ||
                                                                        1),
                                                                  0
                                                                )
                                                                .toLocaleString()}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      {/* Activities List */}
                                                      <div className="p-3">
                                                        <div className="space-y-3">
                                                          {dayActivities.map(
                                                            (
                                                              activity,
                                                              actIndex
                                                            ) => (
                                                              <div
                                                                key={actIndex}
                                                                className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                                                              >
                                                                <div className="flex p-3">
                                                                  {/* Activity Image with Overlay */}
                                                                  <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                                                                    <img
                                                                      src={
                                                                        activity.imageUrl ||
                                                                        "https://placehold.co/300x200?text=Activity"
                                                                      }
                                                                      alt={
                                                                        activity.title
                                                                      }
                                                                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                                      onError={(
                                                                        e
                                                                      ) => {
                                                                        e.target.onerror =
                                                                          null;
                                                                        e.target.src =
                                                                          "https://placehold.co/300x200?text=Activity";
                                                                      }}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                  </div>

                                                                  {/* Activity Details */}
                                                                  <div className="flex-1 ml-3">
                                                                    <div className="flex justify-between items-start">
                                                                      <div>
                                                                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                                                          {
                                                                            activity.title
                                                                          }
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                                            {
                                                                              activity.category_id
                                                                            }
                                                                          </span>
                                                                          {activity.tags && (
                                                                            <span className="text-xs text-gray-500">
                                                                              {activity.tags
                                                                                .split(
                                                                                  ","
                                                                                )
                                                                                .slice(
                                                                                  0,
                                                                                  2
                                                                                )
                                                                                .join(
                                                                                  " • "
                                                                                )}
                                                                            </span>
                                                                          )}
                                                                        </div>
                                                                      </div>
                                                                      <div className="text-right">
                                                                        <div className="text-lg font-bold text-gray-900">
                                                                          ₹
                                                                          {activity.price ||
                                                                            activity.discount_price}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                          per
                                                                          person
                                                                        </div>

                                                                        {/* Quantity Selector */}
                                                                        <div className="mt-2 flex items-center justify-end gap-2">
                                                                          <button
                                                                            onClick={() => {
                                                                              const updatedActivities =
                                                                                selectedPackage.activities.map(
                                                                                  (
                                                                                    a
                                                                                  ) => {
                                                                                    if (
                                                                                      a ===
                                                                                      activity
                                                                                    ) {
                                                                                      return {
                                                                                        ...a,
                                                                                        quantity:
                                                                                          Math.max(
                                                                                            (a.quantity ||
                                                                                              1) -
                                                                                              1,
                                                                                            1
                                                                                          ),
                                                                                      };
                                                                                    }
                                                                                    return a;
                                                                                  }
                                                                                );
                                                                              setSelectedPackage(
                                                                                (
                                                                                  prev
                                                                                ) => ({
                                                                                  ...prev,
                                                                                  activities:
                                                                                    updatedActivities,
                                                                                })
                                                                              );
                                                                            }}
                                                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                                                                          >
                                                                            -
                                                                          </button>
                                                                          <span className="text-sm font-medium w-8 text-center">
                                                                            {activity.quantity ||
                                                                              1}
                                                                          </span>
                                                                          <button
                                                                            onClick={() => {
                                                                              const updatedActivities =
                                                                                selectedPackage.activities.map(
                                                                                  (
                                                                                    a
                                                                                  ) => {
                                                                                    if (
                                                                                      a ===
                                                                                      activity
                                                                                    ) {
                                                                                      return {
                                                                                        ...a,
                                                                                        quantity:
                                                                                          (a.quantity ||
                                                                                            1) +
                                                                                          1,
                                                                                      };
                                                                                    }
                                                                                    return a;
                                                                                  }
                                                                                );
                                                                              setSelectedPackage(
                                                                                (
                                                                                  prev
                                                                                ) => ({
                                                                                  ...prev,
                                                                                  activities:
                                                                                    updatedActivities,
                                                                                })
                                                                              );
                                                                            }}
                                                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
                                                                          >
                                                                            +
                                                                          </button>
                                                                        </div>

                                                                        {/* Total Price */}
                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                          Total:
                                                                          ₹
                                                                          {(
                                                                            (activity.price ||
                                                                              activity.discount_price) *
                                                                            (activity.quantity ||
                                                                              1)
                                                                          ).toLocaleString()}
                                                                        </div>
                                                                      </div>
                                                                    </div>

                                                                    {/* Description */}
                                                                    <p className="mt-1.5 text-gray-600 text-xs line-clamp-2">
                                                                      {activity.short_description?.replace(
                                                                        /<\/?[^>]+(>|$)/g,
                                                                        ""
                                                                      )}
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
                                                                        <span className="text-xs">
                                                                          1 Hour
                                                                          Duration
                                                                        </span>
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
                                                                        <span className="text-xs">
                                                                          {
                                                                            activity.location_site
                                                                          }
                                                                          ,{" "}
                                                                          {
                                                                            activity.city
                                                                          }
                                                                        </span>
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
                                                                          View
                                                                          Details
                                                                        </button>
                                                                        <button
                                                                          onClick={() => {
                                                                            const updatedActivities =
                                                                              selectedPackage.activities.filter(
                                                                                (
                                                                                  a
                                                                                ) =>
                                                                                  a !==
                                                                                  activity
                                                                              );
                                                                            setSelectedPackage(
                                                                              (
                                                                                prev
                                                                              ) => ({
                                                                                ...prev,
                                                                                activities:
                                                                                  updatedActivities,
                                                                              })
                                                                            );
                                                                          }}
                                                                          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors duration-300"
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
                                                                          Available
                                                                          Today
                                                                        </span>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Sightseeing Section */}
                                                    {citySightseeing &&
                                                      citySightseeing.length >
                                                        0 && (
                                                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                                          {/* Sightseeing Header */}
                                                          <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
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
                                                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                    />
                                                                  </svg>
                                                                </div>
                                                                <div>
                                                                  <h3 className="text-lg font-semibold">
                                                                    Sightseeing
                                                                    for Day{" "}
                                                                    {day.day}
                                                                  </h3>
                                                                  <p className="text-xs text-gray-300 mt-0.5">
                                                                    {
                                                                      citySightseeing.length
                                                                    }{" "}
                                                                    sightseeing
                                                                    spots
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          </div>

                                                          {/* Sightseeing List */}
                                                          <div className="p-4">
                                                            <div className="grid grid-cols-1 gap-4">
                                                              {citySightseeing.map(
                                                                (spot) => (
                                                                  <div
                                                                    key={
                                                                      spot._id
                                                                    }
                                                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 transition-all duration-300"
                                                                  >
                                                                    <div className="flex items-start gap-4">
                                                                      <div className="w-24 h-24 flex-shrink-0">
                                                                        <img
                                                                          src={
                                                                            spot
                                                                              .images?.[0] ||
                                                                            "https://placehold.co/100x100?text=Spot"
                                                                          }
                                                                          alt={
                                                                            spot.placeName
                                                                          }
                                                                          className="w-full h-full object-cover rounded-lg"
                                                                          onError={(
                                                                            e
                                                                          ) => {
                                                                            e.target.onerror =
                                                                              null;
                                                                            e.target.src =
                                                                              "https://placehold.co/100x100?text=Spot";
                                                                          }}
                                                                        />
                                                                      </div>
                                                                      <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                          <div>
                                                                            <h5 className="text-lg font-semibold text-gray-900">
                                                                              {
                                                                                spot.placeName
                                                                              }
                                                                            </h5>
                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                              {spot.description ||
                                                                                "No description available"}
                                                                            </p>
                                                                          </div>
                                                                          <div className="flex items-center">
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                              Included
                                                                            </span>
                                                                          </div>
                                                                        </div>

                                                                        {/* Spot Details */}
                                                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                                          <span className="flex items-center gap-1">
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
                                                                            {spot.visitDuration ||
                                                                              "1-2 hours"}
                                                                          </span>
                                                                          <span className="flex items-center gap-1">
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
                                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                              />
                                                                            </svg>
                                                                            {spot.location ||
                                                                              "Local attraction"}
                                                                          </span>
                                                                        </div>
                                                                      </div>
                                                                    </div>
                                                                  </div>
                                                                )
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {packageInfoTab === "costing" && (
                            <div className="p-6 space-y-6">
                              {/* Final Costing Details */}
                              <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Cost Breakdown
                                  </h3>
                                </div>
                                <div className="p-4">
                                  <div className="space-y-4">
                                    {/* Hotel Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Hotel Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.hotelPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Transfer Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Transfer Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.transferPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Activity Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Activity Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.activityPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Taxes */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Taxes & Fees
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting?.taxes ||
                                          0}
                                      </span>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg mt-4">
                                      <span className="font-semibold text-lg">
                                        Grand Total
                                      </span>
                                      <span className="font-semibold text-lg text-blue-600">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.finalPrices?.grandTotal || 0}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Per Person Breakdown */}
                                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                      Per Person Cost
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-blue-700">
                                          Adult Cost (x
                                          {selectedLead?.adults || 1})
                                        </span>
                                        <span className="font-medium text-blue-900">
                                          ₹
                                          {selectedPackage?.finalCosting
                                            ?.finalPrices?.adultPrice || 0}
                                        </span>
                                      </div>
                                      {selectedLead?.kids > 0 && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-blue-700">
                                            Child Cost (x{selectedLead?.kids})
                                          </span>
                                          <span className="font-medium text-blue-900">
                                            ₹
                                            {selectedPackage?.finalCosting
                                              ?.finalPrices?.childPrice || 0}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add this at the bottom of your component */}
      {showCabModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setShowCabModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Vehicle
                </h3>
                <div className="space-y-4">
                  {cabs.map((cab) => (
                    <div
                      key={cab._id}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                        selectedCab?._id === cab._id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedCab({ ...cab, day: 1, quantity: 1 });
                        setShowCabModal(false);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={cab.cabImages?.[0] || "/default-car.png"}
                            alt={cab.cabName}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {cab.cabName}
                          </h4>
                          <p className="text-sm text-gray-500">{cab.cabType}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {cab.cabSeatingCapacity} Seater • {cab.cabLuggage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCabModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update the sliding modal design */}
      {showCabSlider && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCabSlider(false)}
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-4xl">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-white px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Change Transfer
                      </h2>
                      <p className="mt-1 text-gray-500">
                        Changes would be reflected to whole itinerary
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                      {cabs.map((cab) => (
                        <div
                          key={cab._id}
                          className={`bg-white rounded-lg border ${
                            selectedCab?._id === cab._id ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="p-4">
                            {selectedCab?._id === cab._id && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  SELECTED
                                </span>
                              </div>
                            )}

                            <div className="flex gap-4">
                              {/* Cab Image */}
                              <div className="w-32 h-24 flex-shrink-0">
                                <img
                                  src={cab.cabImages[0]}
                                  alt={cab.cabName}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>

                              {/* Cab Details */}
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium">
                                      {cab.cabName}
                                      <span className="text-gray-500 text-sm ml-2">
                                        (or Similar)
                                      </span>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Private Transfer/{cab.cabType}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex flex-col items-end mb-2">
                                        <p className="text-lg font-semibold text-gray-900">
                                          Total: ₹
                                          {selectedPackage?.cabs?.travelPrices
                                            ?.prices
                                            ? ((selectedCab?._id === cab._id
                                                ? 1
                                                : cab.quantity) || 0) *
                                              (cab.cabType === "Hatchback"
                                                ? selectedPackage.cabs
                                                    .travelPrices.prices
                                                    .lowestOffSeasonPrice
                                                : cab.cabType === "Sedan"
                                                ? selectedPackage.cabs
                                                    .travelPrices.prices
                                                    .lowestOnSeasonPrice
                                                : selectedPackage.cabs
                                                    .travelPrices.prices
                                                    .lowestOffSeasonPrice)
                                            : 0}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {(selectedCab?._id === cab._id
                                            ? 1
                                            : cab.quantity) || 0}{" "}
                                          {((selectedCab?._id === cab._id
                                            ? 1
                                            : cab.quantity) || 0) === 1
                                            ? "cab"
                                            : "cabs"}{" "}
                                          x ₹
                                          {cab.cabType === "Hatchback"
                                            ? selectedPackage.cabs.travelPrices
                                                .prices.lowestOffSeasonPrice
                                            : cab.cabType === "Sedan"
                                            ? selectedPackage.cabs.travelPrices
                                                .prices.lowestOnSeasonPrice
                                            : selectedPackage.cabs.travelPrices
                                                .prices.lowestOffSeasonPrice}
                                        </p>
                                      </div>

                                      {/* Update quantity buttons */}
                                      <button
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                        onClick={() => {
                                          const currentQty =
                                            (selectedCab?._id === cab._id
                                              ? 1
                                              : cab.quantity) || 0;
                                          if (currentQty > 0) {
                                            cab.quantity = currentQty - 1;
                                            setCabs([...cabs]);
                                          }
                                        }}
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
                                            d="M20 12H4"
                                          />
                                        </svg>
                                      </button>

                                      <span className="w-12 text-center font-medium">
                                        {(selectedCab?._id === cab._id
                                          ? 1
                                          : cab.quantity) || 0}
                                      </span>

                                      <button
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                        onClick={() => {
                                          const currentQty =
                                            (selectedCab?._id === cab._id
                                              ? 1
                                              : cab.quantity) || 0;
                                          cab.quantity = currentQty + 1;
                                          setCabs([...cabs]);
                                        }}
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
                                            d="M12 4v16m8-8H4"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Facilities */}
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-2">
                                    Facilities:
                                  </p>
                                  <div className="flex items-center gap-4">
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
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {cab.cabSeatingCapacity} seater
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
                                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                      </svg>
                                      {cab.cabLuggage} luggage bags
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
                                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                      </svg>
                                      First Aid
                                    </span>
                                  </div>
                                </div>

                                {/* Price and Select Button */}
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-right">
                                    {selectedPackage?.cabs?.travelPrices
                                      ?.prices ? (
                                      <>
                                        <p className="text-2xl font-bold text-gray-900">
                                          ₹
                                          {cab.cabType === "Hatchback"
                                            ? selectedPackage.cabs.travelPrices
                                                .prices.lowestOffSeasonPrice
                                            : cab.cabType === "Sedan"
                                            ? selectedPackage.cabs.travelPrices
                                                .prices.lowestOnSeasonPrice
                                            : selectedPackage.cabs.travelPrices
                                                .prices.lowestOffSeasonPrice}
                                          <span className="text-sm text-gray-500">
                                            {" "}
                                            Price/Cab
                                          </span>
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-2xl font-bold text-gray-900">
                                          Price not available
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Contact support
                                        </p>
                                      </>
                                    )}
                                  </div>
                                  {selectedCab?._id === cab._id ? (
                                    <button className="px-4 py-2 text-blue-600 font-medium">
                                      REMOVE
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedCab(cab);
                                        setShowCabSlider(false);
                                      }}
                                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                      SELECT
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHotelSlider && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowHotelSlider(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[55%] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="sticky top-0 bg-[rgb(45,45,68)] text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  Change Hotel in {selectedCity}
                </h2>
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">
                  Day {selectedDayForHotelSlider?.day}
                </span>
              </div>
              <button
                onClick={() => setShowHotelSlider(false)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-6">
              {/* Hotel Filters */}
              <div className="mb-6 flex items-center gap-4 border-b pb-4">
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  All Hotels
                </button>
                <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
                  5 Star
                </button>
                <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
                  4 Star
                </button>
                <button className="px-4 py-2 hover:bg-gray-50 rounded-full text-sm">
                  3 Star
                </button>
              </div>

              {/* Hotel List */}
              <div className="space-y-6">
                {hotelsByCity[selectedCity?.toLowerCase()]?.map((hotel) => (
                  <div
                    key={hotel._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex p-4">
                      {/* Hotel Image */}
                      <div className="w-64 h-48 flex-shrink-0">
                        <img
                          src={hotel.photosAndVideos?.images?.[0]}
                          alt={hotel.basicInfo?.propertyName}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/300x200?text=Hotel+Image";
                          }}
                        />
                      </div>

                      {/* Hotel Details */}
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
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
                                    className="w-4 h-4 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {hotel.basicInfo?.hotelStarRating} Star Hotel
                              </span>
                            </div>
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

                                        {/* Quantity Selector */}
                                        <div className="mt-2 flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => {
                                              const currentQuantity =
                                                room.quantity || 1;
                                              if (currentQuantity > 1) {
                                                const updatedRoom = {
                                                  ...room,
                                                  quantity: currentQuantity - 1,
                                                };
                                                handleSelectHotel(
                                                  {
                                                    ...hotel,
                                                    selectedRoom: updatedRoom,
                                                  },
                                                  selectedDayForHotelSlider?.day
                                                );
                                              }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                                            disabled={
                                              !room.quantity ||
                                              room.quantity <= 1
                                            }
                                          >
                                            -
                                          </button>
                                          <span className="w-8 text-center">
                                            {room.quantity || 1}
                                          </span>
                                          <button
                                            onClick={() => {
                                              const currentQuantity =
                                                room.quantity || 1;
                                              if (
                                                currentQuantity < room.roomCount
                                              ) {
                                                const updatedRoom = {
                                                  ...room,
                                                  quantity: currentQuantity + 1,
                                                };
                                                handleSelectHotel(
                                                  {
                                                    ...hotel,
                                                    selectedRoom: updatedRoom,
                                                  },
                                                  selectedDayForHotelSlider?.day
                                                );
                                              }
                                            }}
                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                                            disabled={
                                              room.quantity >= room.roomCount
                                            }
                                          >
                                            +
                                          </button>
                                        </div>

                                        {/* Total Price */}
                                        <p className="mt-1 text-sm text-gray-600">
                                          Total: ₹
                                          {(
                                            room.baseRate * (room.quantity || 1)
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Rest of room details remain the same */}
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                      {/* ... existing room details ... */}
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

      {showRoomSlider && (
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
                  <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          Select Room Type
                        </h2>
                        <p className="text-sm text-gray-300 mt-1">
                          {selectedHotelForRooms?.basicInfo?.propertyName}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowRoomSlider(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
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
                    <div className="p-6">
                      {!selectedHotelForRooms?.rooms ? (
                        <div className="flex flex-col items-center justify-center h-48">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                          <p className="mt-4 text-gray-500">
                            Loading room options...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {selectedHotelForRooms?.rooms?.data?.map((room) => (
                            <div
                              key={room._id}
                              className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${
                                selectedHotelForRooms?.selectedRoom?._id ===
                                room._id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="p-4">
                                <div className="flex gap-4">
                                  {/* Room Image */}
                                  <div className="w-40 h-32 flex-shrink-0">
                                    <img
                                      src={room.imageUrl || "/default-room.jpg"}
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
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          {room.roomName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                          {room.roomType}
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

                                    {/* Room Features */}
                                    <div className="mt-4 grid grid-cols-2 gap-y-2">
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
                                        {room.maxOccupancy} Guests
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
                                        {room.bedType}
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
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                          />
                                        </svg>
                                        {room.roomsizeinnumber} {room.roomSize}
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
                                        {room.mealOption}
                                      </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                      <div className="text-sm text-gray-600">
                                        <p>
                                          Extra Adult: ₹{room.extraAdultCharge}
                                        </p>
                                        <p>Child: ₹{room.childCharge}</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          handleSelectHotel(
                                            {
                                              ...selectedHotelForRooms,
                                              selectedRoom: room,
                                            },
                                            selectedDayForHotelSlider?.day
                                          );
                                          setShowRoomSlider(false);
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        Select Room
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Slider */}
      <ActivitySlider
        isOpen={isActivitySliderOpen}
        onClose={() => setIsActivitySliderOpen(false)}
        selectedDay={selectedDay}
        onActivitySelect={handleActivitySelect}
      />

      {/* Sightseeing Slider */}
      <SightseeingSlider
        isOpen={isSightseeingSliderOpen}
        onClose={() => {
          setIsSightseeingSliderOpen(false);
          setCitySightseeing([]);
        }}
        selectedDay={selectedDayForSightseeing}
        sightseeing={citySightseeing}
        onSightseeingSelect={handleSightseeingSelect}
      />

      {/* Add Activity Slider */}
      {showActivitySlider && (
        <ActivitySlider
          isOpen={showActivitySlider}
          onClose={() => setShowActivitySlider(false)}
          selectedDay={selectedDayForActivities}
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
          onActivitySelect={handleActivitySelect}
        />
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
