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
    if (!cityName) return;
    
    try {
      console.log("Fetching hotels for city:", cityName);
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemaker-hotels-by-city/${cityName.toLowerCase()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Hotels received for", cityName, ":", data);

      if (data.success) {
        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data.data || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching hotels for", cityName, ":", error);
      // Set empty array for this city to prevent repeated failed fetches
      setHotelsByCity((prev) => ({
        ...prev,
        [cityName.toLowerCase()]: [],
      }));
    }
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
    } catch (error) {
     
    }
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
    if (index === totalDays - 1) {
      return (
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              No hotel selection needed for the last day
            </p>
          </div>
        </div>
      );
    }

    const cityName = day.selectedItinerary?.cityName;
    if (!cityName) return null;

    const normalizedCityName = cityName.toLowerCase();
    const hotelsForCity = hotelsByCity[normalizedCityName] || [];
    
    console.log("Rendering hotels for city:", cityName, "Hotels:", hotelsForCity);

    // Fetch hotels if not already fetched
    useEffect(() => {
      if (cityName && !hotelsByCity[normalizedCityName]) {
        fetchHotelsByCity(cityName);
      }
    }, [cityName]);

    return (
                                    return (
                                      <div
                                        key={index}
                                        className="mb-8 last:mb-0"
                                      >
                                        {/* Day Header */}
                                        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                                          <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center bg-orange-500 text-white w-16 h-16 rounded-lg">
                                              <span className="text-xs font-medium">
                                                DAY
                                              </span>
                                              <span className="text-2xl font-bold">
                                                {day.day}
                                              </span>
                                            </div>
                                            <div>
                                              <h4 className="text-xl font-semibold text-gray-900">
                                                {
                                                  currentItinerary?.itineraryTitle
                                                }
                                              </h4>
                                              <div className="flex items-center gap-4 mt-1">
                                                {currentItinerary?.cityName && (
                                                  <p className="text-sm text-gray-500">
                                                    <span className="inline-flex items-center">
                                                      <svg
                                                        className="w-4 h-4 mr-1"
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
                                                      {currentItinerary.country}
                                                    </span>
                                                  </p>
                                                )}
                                                {currentItinerary?.distance && (
                                                  <p className="text-sm text-gray-500">
                                                    <span className="inline-flex items-center">
                                                      <svg
                                                        className="w-4 h-4 mr-1"
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
                                                  </p>
                                                )}
                                                {currentItinerary?.totalHours && (
                                                  <p className="text-sm text-gray-500">
                                                    <span className="inline-flex items-center">
                                                      <svg
                                                        className="w-4 h-4 mr-1"
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
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Itinerary Description */}
                                        {currentItinerary?.itineraryDescription && (
                                          <div className="mt-4 bg-white rounded-lg p-6 shadow-sm">
                                            <div className="prose max-w-none">
                                              <h5 className="text-lg font-medium text-gray-900 mb-3">
                                                Description
                                              </h5>
                                              <div className="text-gray-600 whitespace-pre-line">
                                                {
                                                  currentItinerary.itineraryDescription
                                                }
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Add Cab Section - Only for Day 1 */}
                                        {day.day === 1 && (
                                          <div className="mt-4 bg-white rounded-lg p-6 shadow-sm">
                                            {/* Header with Dynamic Cities */}
                                            <div className="flex items-center justify-between mb-4">
                                              <div className="flex items-center gap-2">
                                                <svg
                                                  className="w-6 h-6 text-gray-600"
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
                                                <h3 className="text-lg font-medium">
                                                  TRANSFER •{" "}
                                                  {currentItinerary?.cityName ||
                                                    "delhi"}{" "}
                                                  to{" "}
                                                  {selectedPackage?.package
                                                    ?.itineraryDays[1]
                                                    ?.selectedItinerary
                                                    ?.cityName || "Shimla"}
                                                </h3>
                                                <button
                                                  className="ml-2"
                                                  onClick={() =>
                                                    console.log(
                                                      "Toggle details"
                                                    )
                                                  }
                                                >
                                                  <svg
                                                    className="w-5 h-5 text-gray-500"
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
                                              </div>
                                              <div className="flex gap-4">
                                                <button
                                                  onClick={() =>
                                                    setShowCabSlider(true)
                                                  }
                                                  className="text-blue-500 hover:text-blue-600 font-medium"
                                                >
                                                  CHANGE
                                                </button>
                                                <button className="text-blue-500 hover:text-blue-600 font-medium">
                                                  REMOVE
                                                </button>
                                              </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex gap-6">
                                              <div className="w-64 bg-gray-50 rounded-lg p-4">
                                                <img
                                                  src={selectedCab.cabImages[0]}
                                                  alt={selectedCab.cabName}
                                                  className="w-full h-auto object-cover rounded-lg"
                                                />
                                              </div>

                                              <div className="flex-1">
                                                <h4 className="text-xl font-semibold mb-3">
                                                  {selectedCab.cabName} -
                                                  Private Transfer
                                                </h4>
                                                <div className="flex items-center gap-2 text-gray-600 mb-2">
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
                                                      d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                  </svg>
                                                  <span>
                                                    {
                                                      selectedCab.cabSeatingCapacity
                                                    }{" "}
                                                    | {selectedCab.cabLuggage} |
                                                    First Aid
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
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
                                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                  </svg>
                                                  <span>
                                                    Intercity Transfer
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Transport Options Note */}
                                            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                                              <p className="text-gray-700">
                                                There are more ways to reach
                                                your destination
                                                <button className="text-blue-500 hover:text-blue-600 font-medium ml-2">
                                                  VIEW TRANSPORT OPTION(S)
                                                </button>
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {/* Keep existing hotel rendering */}
                                        {renderHotels(
                                          day,
                                          index,
                                          selectedPackage?.package
                                            ?.itineraryDays?.length
                                        )}
                                      </div>
                                    );
                                  }
                                )}
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

      {showCabsPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowCabsPanel(false)}
          />

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between space-x-3">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Select Vehicle
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isLoadingCabs
                        ? "Loading vehicles..."
                        : `${availableCabs.length} vehicles available`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCabsPanel(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
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

              {/* Updated Cab List with Quantity Selector */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 sm:px-6">
                  {isLoadingCabs ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableCabs.length > 0 ? (
                    <div className="space-y-4">
                      {availableCabs.map((cab) => (
                        <div
                          key={cab._id}
                          className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="flex">
                            {/* Cab Image section remains the same */}
                            <div className="w-40 h-32 flex-shrink-0">
                              {cab.cabImages && cab.cabImages[0] ? (
                                <img
                                  src={cab.cabImages[0]}
                                  alt={cab.cabName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log(
                                      "Image failed to load:",
                                      cab.cabImages[0]
                                    );
                                    e.target.onerror = null;
                                    e.target.src = "/default-car.png"; // Add a default car image
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
                                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Updated Cab Details with Quantity Selector */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {cab.cabName}
                                  </h3>
                                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-1"
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
                                    <span className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {cab.cabLuggage}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Type: {cab.cabType}
                                  </p>
                                </div>
                              </div>

                              {/* Quantity Selector */}
                              <div className="mt-4 flex items-center space-x-4">
                                <label className="text-sm text-gray-600">
                                  Quantity:
                                </label>
                                <div className="flex items-center border rounded-md">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        cab._id,
                                        (cabQuantities[cab._id] || 1) - 1
                                      )
                                    }
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-r"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={cabQuantities[cab._id] || 1}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        cab._id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-16 text-center py-1 border-none focus:ring-0"
                                  />
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        cab._id,
                                        (cabQuantities[cab._id] || 1) + 1
                                      )
                                    }
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-l"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Select Button */}
                              <button
                                onClick={() => {
                                  console.log(
                                    "Selecting cab:",
                                    cab,
                                    "Quantity:",
                                    cabQuantities[cab._id] || 1
                                  );
                                  handleSelectCab({
                                    ...cab,
                                    quantity: cabQuantities[cab._id] || 1,
                                  });
                                }}
                                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Select {cabQuantities[cab._id] || 1} Vehicle
                                {(cabQuantities[cab._id] || 1) > 1 ? "s" : ""}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No vehicles available at the moment
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCab && showSelectedCabDetails && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Selected Vehicle Details
            </h3>
            <button
              onClick={() => setShowSelectedCabDetails(false)}
              className="text-gray-400 hover:text-gray-500"
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

          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              {selectedCab.cabImages && selectedCab.cabImages[0] ? (
                <img
                  src={selectedCab.cabImages[0]}
                  alt={selectedCab.cabName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(
                      "Image failed to load:",
                      selectedCab.cabImages[0]
                    );
                    e.target.onerror = null;
                    e.target.src = "/default-car.png";
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
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {selectedCab.cabImages && selectedCab.cabImages.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto">
                {selectedCab.cabImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-20 h-20">
                    <img
                      src={image}
                      alt={`${selectedCab.cabName} view ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cab Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {selectedCab.cabName}
              </h4>
              <p className="text-gray-600 mb-4">{selectedCab.cabType}</p>
              <div className="flex items-center mb-4">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
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
                <span>{selectedCab.cabSeatingCapacity}</span>
              </div>
              <div className="flex items-center mb-4">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                <span>{selectedCab.cabLuggage}</span>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Selected Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCab.quantity} Vehicle
                  {selectedCab.quantity > 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Vehicle Features:</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Type: {selectedCab.cabType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Seating: {selectedCab.cabSeatingCapacity}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Luggage: {selectedCab.cabLuggage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Adjuster */}
          <div className="mt-6 flex items-center space-x-3">
            <button
              onClick={() =>
                handleQuantityChange(
                  selectedCab._id,
                  (selectedCab.quantity || 1) - 1
                )
              }
              className="p-2 border rounded-md hover:bg-gray-50"
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
            <span className="text-lg font-medium w-12 text-center">
              {selectedCab.quantity || 1}
            </span>
            <button
              onClick={() =>
                handleQuantityChange(
                  selectedCab._id,
                  (selectedCab.quantity || 1) + 1
                )
              }
              className="p-2 border rounded-md hover:bg-gray-50"
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
      )}

      {/* Selected Hotel Details View */}
      {selectedHotel && (
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
            <div className="flex space-x-2">
              <button
                onClick={() => handleHotelChangeClick(selectedDay)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 border border-blue-600 rounded-md"
              >
                Change Hotel
              </button>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-gray-400 hover:text-gray-500"
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
      )}

      {/* Add the sliding modal for hotel selection */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowHotelModal(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-5xl w-full bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Change Hotel</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
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

                {/* Filters */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      3★
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4★
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      5★
                    </button>
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-3 py-1 pr-8 rounded border text-sm hover:bg-gray-50">
                      <option>Any</option>
                      {/* Add location options */}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      3 & above
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4 & above
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4.5 & above
                    </button>
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-3 py-1 pr-8 rounded border text-sm hover:bg-gray-50">
                      <option>Any</option>
                      {/* Add hotel type options */}
                    </select>
                  </div>
                  <button className="flex items-center gap-1 text-blue-500 text-sm">
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
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    MORE FILTERS
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4 relative">
                  <input
                    type="text"
                    placeholder="Search by Hotel Name or Location"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <button className="absolute right-3 top-2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hotel List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">
                      Showing {hotels.length} Stays in {selectedCity} | Sort by
                      Popularity
                    </p>
                  </div>

                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div
                        key={hotel._id}
                        className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="flex">
                          {/* Hotel Image */}
                          <div className="w-72 h-48 relative">
                            <img
                              src={hotel.photosAndVideos?.images?.[0]}
                              alt={hotel.basicInfo?.propertyName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-teal-500 text-white px-2 py-1 rounded text-sm">
                              {hotel.basicInfo?.rating || "4.2"}/5
                            </div>
                          </div>

                          {/* Hotel Details */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-medium">
                                    {hotel.basicInfo?.propertyName}
                                  </h3>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-lg ${
                                          i <
                                          (hotel.basicInfo?.hotelStarRating ||
                                            3)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-1">
                                  {hotel.basicInfo?.address}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {hotel.basicInfo?.distanceFromLandmark} drive
                                  to Mall Road
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <svg
                                    className="w-5 h-5 text-gray-500"
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
                                  <span className="text-gray-600">
                                    {hotel.checkInDate} - {hotel.checkOutDate}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">
                                    Includes:
                                  </span>
                                  <span className="font-medium">Breakfast</span>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">
                                    Room Type
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {hotel.roomType || "Deluxe Room"}
                                    </span>
                                    <button className="text-blue-500 text-sm">
                                      CHANGE ROOM
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-3xl font-semibold">
                                  ₹{hotel.price}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Price/Person
                                </p>
                                <button
                                  onClick={() => handleSelectHotel(hotel)}
                                  className="mt-2 px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  SELECT
                                </button>
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
