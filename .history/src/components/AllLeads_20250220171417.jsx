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

  // Add this state at the top with other state declarations
  const [itineraryDetails, setItineraryDetails] = useState({});
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  const [showCabModal, setShowCabModal] = useState(false);

  // Add this state for the sliding modal
  const [showCabSlider, setShowCabSlider] = useState(false);

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
            console.log(
              "Fetching itinerary for day:",
              day.day,
              "ID:",
              day.selectedItinerary._id
            );

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
            console.log("Itinerary API Response for day", day.day, ":", data);

            if (data.success) {
              setItineraryDetails((prevDetails) => ({
                ...prevDetails,
                [day.selectedItinerary._id]: data.itinerary,
              }));
            }
          } else {
            console.log("No itinerary selected for day:", day.day);
          }
        }
      } catch (error) {
        console.error("Error fetching itinerary details:", error);
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
      console.log(`Hotels for ${cityName}:`, data);

      if (data.success) {
        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data.data || [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching hotels for ${cityName}:`, error);
    }
  };

  // Add this new function to extract and fetch hotels for each city in the itinerary
  const fetchHotelsForItinerary = async (itineraryDays) => {
    console.log("Fetching hotels for itinerary:", itineraryDays);

    try {
      // Fetch hotels for the first day's city as a test
      if (itineraryDays && itineraryDays[0]?.selectedItinerary?.cityName) {
        const cityName = itineraryDays[0].selectedItinerary.cityName;
        console.log("Fetching hotels for city:", cityName);

        const response = await fetch(`/api/hotels?city=${cityName}`);
        const data = await response.json();
        console.log("Hotels data received:", data);

        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  // Update the useEffect when selectedPackage changes to fetch hotels for all cities
  useEffect(() => {
    if (selectedPackage?.package?.itineraryDays) {
      console.log("Selected package:", selectedPackage);
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
  const renderHotels = (day, index, totalDays) => {
    if (index === totalDays - 1) {
      return (
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">No hotel selection needed for the last day</p>
          </div>
        </div>
      );
    }

    const cityName = day.selectedItinerary?.cityName;
    if (!cityName) return null;

    const hotelsForCity = hotelsByCity[cityName.toLowerCase()] || [];

    return (
      <div className="mt-6">
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">HOMESTAY • 2 Nights • In {cityName}</h4>
            <button className="text-blue-500 font-medium">CHANGE</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {hotelsForCity.map((hotel) => (
              <div key={hotel._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Hotel Image */}
                  <div className="relative w-72 h-48 flex-shrink-0">
                    {hotel.photosAndVideos?.images?.[0] ? (
                      <img
                        src={hotel.photosAndVideos.images[0]}
                        alt={hotel.basicInfo?.propertyName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-lg font-medium">
                                    {cab.cabName}
                                    <span className="text-gray-500 text-sm ml-2">
                                      (or Similar)
                                    </span>
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Private Transfer/{cab.cabType}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Facilities:
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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
                                    {cab.cabSeatingCapacity}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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
                                    {cab.cabLuggage}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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

                              <p className="text-sm text-gray-600 mt-2">
                                Intercity Transfer; 14 Sightseeing Transfers
                                Included
                              </p>

                              {selectedCab?._id === cab._id ? (
                                <button className="absolute top-4 right-4 text-blue-500 font-medium">
                                  REMOVE
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedCab(cab);
                                    setShowCabSlider(false);
                                  }}
                                  className="absolute bottom-4 right-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                                >
                                  SELECT
                                </button>
                              )}
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

      {/* Hotel Display Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
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
            <h3 className="text-lg font-medium">
              HOMESTAY • {selectedHotel?.nights || "2"} Nights • In{" "}
              {selectedHotel?.location || "Shimla"}
            </h3>
          </div>
          <button
            onClick={() => handleHotelChangeClick(selectedDay)}
            className="text-blue-500 font-medium"
          >
            CHANGE
          </button>
        </div>

        <div className="flex gap-4">
          {/* Hotel Image */}
          <div className="relative w-72 h-48">
            <img
              src={
                selectedHotel?.photosAndVideos?.images?.[0] ||
                "/default-hotel.jpg"
              }
              alt={selectedHotel?.basicInfo?.propertyName}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-sm">
              <span className="font-medium">
                {selectedHotel?.basicInfo?.rating || "4.4"}
              </span>
              /5
            </div>
          </div>

          {/* Hotel Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xl font-medium">
                {selectedHotel?.basicInfo?.propertyName || "Golden Oak"}
              </h4>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < (selectedHotel?.basicInfo?.hotelStarRating || 3)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <p className="text-gray-600 mb-2">
              {selectedHotel?.basicInfo?.address || "Kachi Ghatti"},
              {selectedHotel?.basicInfo?.distanceFromLandmark
                ? ` ${selectedHotel.basicInfo.distanceFromLandmark} drive to Viceregal Lodge`
                : " 2.7 km drive to Viceregal Lodge"}
            </p>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {selectedHotel?.checkIn
                  ? new Date(selectedHotel.checkIn).toLocaleDateString()
                  : "14 March"}{" "}
                -
                {selectedHotel?.checkOut
                  ? new Date(selectedHotel.checkOut).toLocaleDateString()
                  : "16 March"}
                ,{selectedHotel?.nights || "2"} Nights
              </span>
            </div>

            <div className="border-t pt-4">
              <h5 className="text-lg mb-2">
                Diamond Rooms (No View) - Holidays Selections
              </h5>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Breakfast is included</span>
              </div>
            </div>

            <button
              onClick={() => setShowRoomOptions(true)}
              className="mt-4 text-blue-500 font-medium"
            >
              More Room Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLeads;
