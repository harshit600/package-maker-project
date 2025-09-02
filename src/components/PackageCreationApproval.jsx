import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import config from "../../config";
import PackageForm from "./ui-kit/package/PackageForm";
import CabCalculation from "./ui-kit/package/CabCalculation";
import HotelCalculation from "./ui-kit/package/HotelCalculation";
import FinalCosting from "./ui-kit/package/FinalCosting";

const PackageCreationApproval = ({ initialData, isEditing, editId }) => {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser.data)
  const [showIteniraryBoxes, setShowIteniraryBoxes] = useState(false);
  const [files, setFiles] = useState([]); // Added files state
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [pickupSearchInput, setPickupSearchInput] = useState("");
  const [tripData, setTripData] = useState([
    { fromCity: "", toCity: "", day: 0 },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const [dropLocationSearchResults, setDropLocationSearchResults] = useState(
    []
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [pickupLocationSearchResults, setPickupLocationSearchResults] =
    useState([]);
  const [itineraryDays, setItineraryDays] = useState([
    { day: 1, description: "", selectedItinerary: null },
  ]);
  const [packagePlaces, setPackagePlaces] = useState([
    { placeCover: "", nights: 0, transfer: false },
  ]);
  const [numRooms, setNumRooms] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState("Package");
  const tabs = ["Package", "Cabs", "Hotels", "Final Costing"];
  const [travelData, setTravelData] = useState({});
  const [pricing, setPricing] = useState(0);
  const [cabsData, setCabsData] = useState({});
  const [cabs, setCabs] = useState();
  const [cabPayLoad, setCabPayload] = useState();
  const [thirdStep, setThirdStep] = useState();
  const [selectedHotelData, setSelectedHotelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState(
    initialData || {
      packageType: "",
      packageCategory: "",
      packageName: "",
      packageImages: [],
      priceTag: "",
      duration: "",
      status: "",
      state: "",
      displayOrder: "",
      hotelCategory: "",
      pickupLocation: "",
      pickupTransfer: false,
      dropLocation: "",
      validTill: "",
      tourBy: "",
      agentPackage: "",
      packagePlaces: { placeCover: "", nights: 0, transfer: false },
      themes: [],
      initialAmount: "",
      defaultHotelPackage: "",
      defaultVehicle: "",
      tags: [],
      customizablePackage: false,
      amenities: [],
      packageDescription: "",
      packageInclusions: "",
      packageExclusions: "",
      customExclusions: [], // Add this line
      userRef: "",
      travelPrices: {},
      cityArea:[],
    }
  );

  const [activeSuggestion, setActiveSuggestion] = useState(
    Array(packagePlaces.length).fill(null)
  );
  const [selectedItineraryTitles, setSelectedItineraryTitles] = useState(
    Array.from({ length: itineraryDays.length }, () => "")
  );
  const [showDropdowns, setShowDropdowns] = useState(
    Array.from({ length: itineraryDays.length }, () => false)
  );
  const maxNights = parseInt(formData.duration.split("N")[0].split("/"));

  // Add new state to store all tabs data
  const [allTabsData, setAllTabsData] = useState({
    package: null,
    cabs: null,
    hotels: null,
    finalCosting: null,
  });
  const [itineraryData, setItineraryData] = useState([]);
  useEffect(() => {
  const fetchItineraryData = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/itinerary`
      );
      const data = await response.json();
      setItineraryData(data);
      console.log(data)
    
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
    }
  };
  fetchItineraryData();
}, []);
  // Add useEffect to monitor allTabsData changes
  useEffect(() => {
    console.log("Updated all tabs data:", allTabsData);
  }, [allTabsData]);

  // Add new useEffect to fetch data from /api/add/get
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/add/get`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("All Package Data:", data);
      } catch (error) {
        console.error("Error fetching all package data:", error);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : "Please enter the information",
    }));
  };

  // Add new state variables
  const [showCityModal, setShowCityModal] = useState(false);
  const [matchedCities, setMatchedCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(null);

  const cityareas = async (cityName, dayIndex) => {

    

    try {
      const response = await fetch(
        `${config.API_HOST}/api/places/fetchAllPlaces`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
    
    // Get currently selected places for this day
    const currentDayItinerary = itineraryDays[dayIndex]?.selectedItinerary;
    const existingPlaces = currentDayItinerary?.cityArea || [];
    
    // Filter out places that are already selected
    const matchedCities = data
      .filter(item => item.city === cityName)
      .filter(item => !existingPlaces.includes(item.placeName));
    
    console.log("Filtered City Data:", matchedCities);
  
    // Set matched cities and show modal only if there are new places to add
    if (matchedCities.length > 0) {
      setMatchedCities(matchedCities);
      setCurrentDayIndex(dayIndex);
      setShowCityModal(true);
    } else {
      // Show a message if no new places are available
      alert("All available places for this city have already been added.");
    }
    
  } catch (error) {
    console.error("Error fetching city areas:", error);
  }
};


  // Function to handle city selection
  const handleCitySelection = (city) => {
    setSelectedCities(prev => {
      if (prev.some(item => item._id === city._id)) {
        return prev.filter(item => item._id !== city._id);
      } else {
        return [...prev, city];
      }
    });
  };

  // Function to add selected cities to itinerary
  const addSelectedCitiesToItinerary = () => {
    if (currentDayIndex !== null && selectedCities.length > 0) {
      // Update itinerary days
      setItineraryDays(prevDays => {
        const updatedDays = [...prevDays];
        const currentDay = updatedDays[currentDayIndex];
        
        if (currentDay && currentDay.selectedItinerary) {
          const currentCityArea = currentDay.selectedItinerary.cityArea || [];
          const newPlaceNames = selectedCities.map(city => city.placeName);
          
          updatedDays[currentDayIndex].selectedItinerary = {
            ...currentDay.selectedItinerary,
            cityArea: [...new Set([...currentCityArea, ...newPlaceNames])]
          };
        }
        
        return updatedDays;
      });
      
      // Close modal and reset
      setShowCityModal(false);
      setSelectedCities([]);
    }
  };

  // Function to generate itinerary sequence based on package places
  const generateItinerarySequence = () => {
    console.log("Starting generateItinerarySequence");
    console.log("Current formData:", formData);
    console.log("Current packagePlaces:", packagePlaces);

    if (!formData.pickupLocation || !packagePlaces.length) {
      console.error("Missing required data:", {
        pickupLocation: formData.pickupLocation,
        packagePlaces: packagePlaces.length,
      });
      return [];
    }

    // Parse duration to get total days
    const totalDays = parseInt(formData.duration?.split("D")[0]);
    if (!totalDays) {
      console.error("Invalid duration:", formData.duration);
      return [];
    }

    console.log("Total days:", totalDays);

    const sequence = [];
    let currentLocation = formData.pickupLocation;
    let dayCounter = 1;

    // First add all travel days and local days in sequence
    for (let i = 0; i < packagePlaces.length; i++) {
      const place = packagePlaces[i];
      console.log(`Processing place ${i + 1}:`, place);

      // Add travel day
      sequence.push({
        day: dayCounter++,
        from: currentLocation,
        to: place.placeCover,
        type: "travel",
        isNightTravel: place.transfer,
      });

      // Add local days if nights > 1
      const nights = parseInt(place.nights) || 0;
      console.log(`Nights at ${place.placeCover}:`, nights);

      if (nights > 1) {
        // Add local days for this place
        for (let j = 0; j < nights - 1; j++) {
          if (dayCounter <= totalDays) {
            sequence.push({
              day: dayCounter++,
              location: place.placeCover,
              type: "local",
              cityIndex: i,
            });
          }
        }
      }

      currentLocation = place.placeCover;
    }

    // Add final return journey if we still have a day left
    if (dayCounter <= totalDays && formData.dropLocation) {
      sequence.push({
        day: dayCounter,
        from: currentLocation,
        to: formData.dropLocation,
        type: "travel",
        isNightTravel: false,
      });
    }

    console.log("Generated sequence:", sequence);
    return sequence;
  };

  // Add a useEffect to monitor the data needed for sequence generation
  useEffect(() => {
    if (
      formData.pickupLocation &&
      packagePlaces.length > 0 &&
      formData.duration
    ) {
      console.log("Data changed, attempting to generate new sequence");
      const sequence = generateItinerarySequence();
      if (sequence.length > 0) {
        console.log("New sequence generated, initializing itinerary days");
        initializeItineraryDays();
      }
    }
  }, [formData.pickupLocation, packagePlaces, formData.duration]);

  // 1. The main function that handles itinerary search and auto-selection
  const handleItinerarySearch = async (index, query, itineraryDay) => {
    try {
      let searchQuery = query;
      const sequence = generateItinerarySequence();

      if (!query) {
        if (!sequence || !sequence[index]) {
          console.error("Invalid sequence or index");
          return;
        }

        const dayInfo = sequence[index];
        if (!dayInfo) {
          console.error("Day info not found for index:", index);
          return;
        }

        if (dayInfo.type === "travel") {
          searchQuery = `${dayInfo.from} to ${dayInfo.to}${
            dayInfo.isNightTravel ? " night" : ""
          }`;
        } else if (dayInfo.type === "local") {
          searchQuery = `${dayInfo.location} Local`;
        }

        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[index] = searchQuery;
          return updatedTitles;
        });
      }

      if (!sequence || !sequence[index]) {
        console.error("Sequence not available for API call");
        return;
      }

      const response = await fetch(
        `${
          config.API_HOST
        }/api/itinerary/searchitineraries?search=${encodeURIComponent(
          searchQuery
        )}&type=${sequence[index].type}&from=${encodeURIComponent(
          sequence[index].from || ""
        )}&to=${encodeURIComponent(
          sequence[index].to || ""
        )}&location=${encodeURIComponent(sequence[index].location || "")}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setItineraryDays((prevDays) => {
        const updatedDays = [...prevDays];
        if (!updatedDays[index]) {
          updatedDays[index] = {
            day: index + 1,
            type: sequence[index].type,
            ...(sequence[index].type === "travel"
              ? {
                  from: sequence[index].from,
                  to: sequence[index].to,
                  isNightTravel: sequence[index].isNightTravel,
                }
              : {
                  location: sequence[index].location,
                }),
          };
        }

        updatedDays[index].searchResults = data;

        if (data.length > 0) {
          updatedDays[index].selectedItinerary = {
            ...data[0],
            itineraryTitle: data[0].itineraryTitle,
            itineraryDescription: data[0].itineraryDescription,
            cityName: data[0].cityName,
            totalHours: data[0].totalHours,
            distance: data[0].distance,
            activities: data[0].activities || [],
            sightseeing: data[0].sightseeing || [],
            inclusions: data[0].inclusions || [],
            exclusions: data[0].exclusions || [],
            cityArea: data[0].cityArea || [],
          };
        }

        return updatedDays;
      });

      // Update formData with day-wise cityArea
      setFormData(prevFormData => {
        const updatedCityArea = [...(prevFormData.cityArea || [])];
        if (data.length > 0 && data[0].cityArea) {
          updatedCityArea[index] = data[0].cityArea;
        }
        return {
          ...prevFormData,
          cityArea: updatedCityArea
        };
      });

      if (!query && data.length > 0) {
        handleItinerarySelection(index, data[0]);
      }
    } catch (error) {
      console.error("Error in handleItinerarySearch:", error);
      setItineraryDays((prevDays) => {
        const updatedDays = [...prevDays];
        if (!updatedDays[index]) {
          updatedDays[index] = { day: index + 1 };
        }
        updatedDays[index].error = error.message;
        return updatedDays;
      });
    }
  };

  // 2. Function to initialize itinerary days when package places are updated
  const initializeItineraryDays = async () => {
    console.log("Starting initializeItineraryDays");
    const sequence = generateItinerarySequence();
    console.log("Generated sequence:", sequence);

    if (!sequence.length) {
      console.error("No sequence generated");
      return;
    }

    setShowIteniraryBoxes(true);

    const days = sequence.map((dayInfo, index) => ({
      day: dayInfo.day,
      description: "",
      selectedItinerary: null, // Reset selected itinerary to ensure fresh fetch
      type: dayInfo.type,
      ...(dayInfo.type === "travel"
        ? {
            from: dayInfo.from,
            to: dayInfo.to,
            isNightTravel: dayInfo.isNightTravel,
          }
        : {
            location: dayInfo.location,
          }),
    }));

    setItineraryDays(days);
    console.log("Set initial itinerary days:", days);

    // Fetch itineraries for each day
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const searchQuery =
        day.type === "travel"
          ? `${day.from} to ${day.to}`
          : `${day.location} Local`;

      console.log(
        `Fetching itinerary for day ${i + 1} with query:`,
        searchQuery
      );

      try {
        const response = await fetch(
          `${
            config.API_HOST
          }/api/itinerary/searchitineraries?search=${encodeURIComponent(
            searchQuery
          )}&type=${day.type}&from=${encodeURIComponent(
            day.from || ""
          )}&to=${encodeURIComponent(
            day.to || ""
          )}&location=${encodeURIComponent(day.location || "")}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Received data for day ${i + 1}:`, data);

        if (data && data.length > 0) {
          // Auto-select the first itinerary
          setItineraryDays((prevDays) => {
            const updatedDays = [...prevDays];
            if (!updatedDays[i]) {
              updatedDays[i] = { day: i + 1 };
            }
            updatedDays[i].selectedItinerary = {
              ...data[0],
              itineraryTitle: data[0].itineraryTitle,
              itineraryDescription: data[0].itineraryDescription,
              cityName: data[0].cityName,
              totalHours: data[0].totalHours,
              distance: data[0].distance,
              activities: data[0].activities || [],
              sightseeing: data[0].sightseeing || [],
              inclusions: data[0].inclusions || [],
              exclusions: data[0].exclusions || [],
              cityArea: data[0].cityArea || [],
            };
            updatedDays[i].searchResults = data;
            return updatedDays;
          });

          // Update the selected itinerary title
          setSelectedItineraryTitles((prevTitles) => {
            const updatedTitles = [...prevTitles];
            updatedTitles[i] = data[0].itineraryTitle;
            return updatedTitles;
          });

          console.log(`Auto-selected itinerary for day ${i + 1}:`, data[0]);
        }
      } catch (error) {
        console.error(`Error fetching itinerary for day ${i + 1}:`, error);
      }
    }
  };

  // Update renderItineraryBoxes to show the correct information
  const renderItineraryBoxes = () => {
    const sequence = generateItinerarySequence();

    return (
      <div className="mt-8 transition-all duration-300 ease-in-out">
        <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            🎯 Itinerary Planning
          </h3>
          <p className="text-blue-600">
            Your package places match the duration! Now let's plan the daily
            activities.
          </p>
        </div>

        <div className="space-y-6">
          {sequence.map((dayInfo, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">
                    Day {dayInfo.day}
                  </span>
                  <h4 className="text-lg font-medium text-gray-800">
                    {dayInfo.type === "travel"
                      ? `Travel from ${dayInfo.from} to ${dayInfo.to}${
                          dayInfo.isNightTravel ? "" : ""
                        }`
                      : `Local sightseeing in ${dayInfo.location}`}
                  {dayInfo.isNightTravel && (
                    <span className="inline-flex items-center ml-2 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                      </svg>
                      Night Travel
                    </span>
                  )}
                  </h4>
                </div>

                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        dayInfo.type === "travel"
                          ? `Search travel itinerary from ${dayInfo.from} to ${dayInfo.to}`
                          : `Search local activities in ${dayInfo.location}`
                      }
                      className="w-full p-3 !pl-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-10"
                      value={selectedItineraryTitles[index] || ""}
                      onChange={(e) => {
                        const { value } = e.target;
                        setSelectedItineraryTitles((prevTitles) => {
                          const updatedTitles = [...prevTitles];
                          updatedTitles[index] = value;
                          return updatedTitles;
                        });
                        setShowDropdowns((prev) => {
                          const updated = [...prev];
                          updated[index] = true;
                          return updated;
                        });
                        handleItinerarySearch(index, value, dayInfo);
                      }}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                  </div>

                  {showDropdowns[index] &&
                    itineraryDays[index]?.searchResults && (
                      <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {itineraryDays[index].searchResults
                          .slice(0, 5)
                          .map((result) => (
                            
                            <li
                              key={result._id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b last:border-b-0"
                              onClick={() =>
                                handleItinerarySelection(index, result)
                              }
                            >
                              <div className="font-medium text-gray-800">
                                {result.itineraryTitle}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {result.itineraryDescription}
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                </div>

                {itineraryDays[index]?.selectedItinerary && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3">
                          📌 Selected Itinerary
                        </h5>
                        <p className="text-gray-700 mb-2">
                          {
                            itineraryDays[index].selectedItinerary
                              .itineraryTitle
                          }
                        </p>
                        <p className="text-gray-600 text-sm">
                          {
                            itineraryDays[index].selectedItinerary
                              .itineraryDescription
                          }
                        </p>
                           {/* Add City Areas Section */}
                           {itineraryDays[index].selectedItinerary.cityArea && 
                          itineraryDays[index].selectedItinerary.cityArea.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-medium text-gray-700 mb-2">
                              📍 Places to Visit:
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {itineraryDays[index].selectedItinerary.cityArea.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {itineraryDays[index].selectedItinerary.activities && (
                          <div className="mt-3">
                            <h6 className="font-medium text-gray-700 mb-2">
                              Activities:
                            </h6>
                            <ul className="list-disc pl-4 text-sm text-gray-600">
                              {itineraryDays[
                                index
                              ].selectedItinerary.activities.map(
                                (activity, idx) => (
                                  <li key={idx}>{activity}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">🌆</span>
                          <span className="font-medium">
                            {itineraryDays[index].selectedItinerary.cityName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">⏳</span>
                          <span>
                            {itineraryDays[index].selectedItinerary.totalHours}{" "}
                            hours
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">📏</span>
                          <span>
                            {itineraryDays[index].selectedItinerary.distance} km
                          </span>
                        </div>
                        {itineraryDays[index].selectedItinerary
                          .specialNotes && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <h6 className="font-medium text-yellow-800 mb-1">
                              Special Notes:
                            </h6>
                            <p className="text-sm text-yellow-700">
                              {
                                itineraryDays[index].selectedItinerary
                                  .specialNotes
                              }
                            </p>
                            {console.log("Gghtghfhgfhgfhfgh",)}
                          </div>
                        )}
                         <button
                          className="mt-4 inline-flex items-center px-4 py-2 border border-blue-300 
                            rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 
                            hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-blue-500 transition-all duration-200 ease-in-out"
                          onClick={() => cityareas(itineraryDays[index].selectedItinerary.cityName, index)}
                        >
                          <svg 
                            className="mr-2 -ml-1 h-4 w-4" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                            />
                          </svg>
                          Add More Places
                        </button>
                      </div>
                     
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to handle change in the number of rooms
  const handleNumRoomsChange = (e) => {
    const value = parseInt(e.target.value);
    setNumRooms(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create day-wise cityArea array from itineraryDays
      const dayWiseCityArea = itineraryDays.map(day => ({
        day: day.day,
        cityArea: day.selectedItinerary?.cityArea || []
      }));

      const packageData = {
        packageType: formData.packageType,
        packageCategory: formData.packageCategory,
        packageName: formData.packageName,
        packageImages: formData.packageImages,
        priceTag: formData.priceTag,
        duration: formData.duration,
        state: formData.state,
        status: formData.status,
        displayOrder: formData.displayOrder,
        hotelCategory: formData.hotelCategory,
        pickupLocation: formData.pickupLocation,
        pickupTransfer: formData.pickupTransfer,
        dropLocation: formData.dropLocation,
        validTill: formData.validTill,
        tourBy: formData.tourBy,
        agentPackage: formData.agentPackage,
        customizablePackage: formData.customizablePackage || false,
        packagePlaces: packagePlaces
          .filter((place) => place.placeCover && place.nights)
          .map((place) => ({
            placeCover: place.placeCover,
            nights: parseInt(place.nights),
            transfer: place.transfer || false,
          })),
        themes: formData.themes || [],
        tags: formData.tags || [],
        amenities: formData.amenities || [],
        initialAmount: formData.initialAmount,
        defaultHotelPackage: formData.defaultHotelPackage,
        defaultVehicle: formData.defaultVehicle,
        packageDescription: formData.packageDescription || "",
        packageInclusions: formData.packageInclusions || "",
        packageExclusions: formData.packageExclusions || "",
        customExclusions: formData.customExclusions || [], // Add this line

        cityArea: dayWiseCityArea, // Update to use day-wise cityArea
        itineraryDays: itineraryDays.map((day) => ({
          day: day.day,
          selectedItinerary: day.selectedItinerary
            ? {
                itineraryTitle: day.selectedItinerary.itineraryTitle,
                itineraryDescription: day.selectedItinerary.itineraryDescription,
                cityName: day.selectedItinerary.cityName,
                totalHours: day.selectedItinerary.totalHours,
                distance: day.selectedItinerary.distance,
                cityArea: day.selectedItinerary.cityArea || [], // Include day-specific cityArea
                activities: day.selectedItinerary.activities || [],
                sightseeing: day.selectedItinerary.sightseeing || [],
                inclusions: day.selectedItinerary.inclusions || [],
                exclusions: day.selectedItinerary.exclusions || [],
              }
            : null,
        })),
      };

      const response = await fetch(
        `${config.API_HOST}/api/packages/${isEditing ? editId : 'createpackage'}`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(packageData),
        }
      );

      const data = await response.json();

      // Update allTabsData with package information
      setAllTabsData((prev) => {
        const newData = {
          ...prev,
          package: packageData,
        };
        console.log("After package tab:", newData);
        return newData;
      });

      if (response.ok) {
        // Set the cabs data and move to next tab
        setCabsData({
          ...(data.data || data.package || data),
          packageId: (data.data || data.package || data)._id || editId,
          pickupLocation: packageData.pickupLocation,
          dropLocation: packageData.dropLocation,
          packagePlaces: packageData.packagePlaces,
          duration: packageData.duration,
        });

        const currentTabIndex = tabs.indexOf(activeTab);
        if (currentTabIndex < tabs.length - 1) {
          setActiveTab(tabs[currentTabIndex + 1]);
        }
      } else {
        throw new Error(
          data.error || data.message || `Server error: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Full error details:", error);

      let errorMessage = "Failed to save package. ";
      if (error.message) {
        errorMessage += error.message;
      } else if (error.response) {
        errorMessage += `Server responded with status: ${error.response.status}`;
      } else {
        errorMessage += "Please check your network connection and try again.";
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const [maxNightsReached, setMaxNightsReached] = useState(0);

  const handleItenaryBoxes = () => {
    setShowIteniraryBoxes(true);
  };

  // Function to handle adding a new package place
  const handleAddPackagePlace = () => {
    // Ensure that packagePlaces is initialized properly
    const updatedPackagePlaces = [...packagePlaces];

    // Get the last place in the packagePlaces array
    const lastPlace = updatedPackagePlaces[updatedPackagePlaces.length - 1];

    // Check if the last place is filled
    if (
      lastPlace.placeCover.trim() !== "" &&
      lastPlace.nights !== "" &&
      lastPlace.transfer !== ""
    ) {
      // Extract the maximum number of nights from the selected duration
      const maxNights = parseInt(formData.duration.split("N")[0].split("/")[1]);

      // Calculate the total nights
      const totalNights = updatedPackagePlaces.reduce((acc, place) => {
        // Ensure that nights are parsed as integers
        const nightValue = parseInt(place.nights);
        // If parsing fails or night value is NaN, return accumulator as is
        if (isNaN(nightValue)) {
          return acc;
        }
        return acc + nightValue;
      }, 0);

      setMaxNightsReached(totalNights);

      // Check if the total nights exceed the maximum allowed nights
      if (totalNights > maxNights) {
        // You can display an error message or handle it according to your UI/UX
        alert("Total nights cannot exceed the maximum allowed nights.");
        return;
      }

      // Add a new place with default values
      const newPlace = { placeCover: "", nights: "", transfer: false };

      // Update packagePlaces with the new place
      updatedPackagePlaces.push(newPlace);
      setPackagePlaces(updatedPackagePlaces);

      // Update formData with the new place
      const updatedFormData = { ...formData };
      updatedFormData.packagePlaces = updatedPackagePlaces;
      setFormData(updatedFormData);
    } else {
      // If the last place is not filled, display an error message or take appropriate action
      console.error(
        "Please fill the details of the previous place before adding a new one."
      );
      // You can show a toast message, a modal, or take any other appropriate action to inform the user
    }
  };

  // Function to handle removing a package place
  const handleRemovePackagePlace = (index) => {
    const updatedPlaces = [...packagePlaces];
    updatedPlaces.splice(index, 1);
    setPackagePlaces(updatedPlaces);
  };

  const handlePlaceInputChange = (index, event) => {
    setIsDropdownOpen(true); // Close the dropdown
    const { name, value } = event.target;
    const updatedPlaces = [...packagePlaces];
    setActiveIndex(index);
    updatedPlaces[index] = {
      ...updatedPlaces[index],
      [name]: value,
    };

    // Update formData with the selected place cover
    const updatedFormData = { ...formData };
    updatedFormData.packagePlaces[index] = {
      placeCover: updatedPlaces[index].placeCover,
      nights: updatedPlaces[index].nights || "", // Ensure nights is included
      transfer: updatedPlaces[index].transfer || false,
    };

    // Update the state with the input value
    setPackagePlaces(updatedPlaces);
    setFormData(updatedFormData); // Update form data with nights

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : "Please enter the information",
    }));

    // Extract search string from input
    const searchString = value.trim();
    if (searchString) {
      // Make API call to search for places
      fetch(`${config.API_HOST}/api/places/searchplaces?search=${searchString}`)
        .then((response) => response.json())
        .then((data) => {
          setSearchResults(data);
        })
        .catch((error) => console.error("Error searching places:", error));
    } else {
      setSearchResults([]); // Clear search results if input is empty
    }
  };

  const handlePlaceSelection = (index, selectedPlace) => {
    console.log("Handling place selection:", { index, selectedPlace });

    const updatedPlaces = [...packagePlaces];
    updatedPlaces[index].placeCover = selectedPlace.placeName;
    setPackagePlaces(updatedPlaces);

    // Calculate total nights to check if we should fetch itineraries
    const totalNights = updatedPlaces.reduce(
      (sum, place) => sum + parseInt(place.nights || 0),
      0
    );
    const maxNights = parseInt(formData.duration?.split("N")[0] || 0);

    console.log("Nights calculation:", { totalNights, maxNights });

    // Update tripData
    const newEntry = {
      fromCity: selectedPlace.placeName,
      toCity: "", // Will be set based on next place or drop location
      day: index + 1,
    };

    setTripData((prev) => {
      const updated = [...prev];
      updated[index] = newEntry;
      return updated;
    });

    // If we have all required data, trigger itinerary fetch
    if (
      totalNights === maxNights &&
      formData.pickupLocation &&
      formData.dropLocation
    ) {
      console.log("All conditions met, fetching itineraries");
      setTimeout(() => {
        initializeItineraryDays();
      }, 0);
    }
  };

  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleImageUpload = () => {
    if (files.length > 0 && files.length + formData.packageImages.length < 7) {
      setUploading(true);
      setImageUploadError(null);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            packageImages: formData.packageImages.concat(urls),
          });
          setImageUploadError(null);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 MB max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleDropdownChange = (index) => {
    setActiveIndex(index);
    const updatedPlaces = [...packagePlaces];
    updatedPlaces[index].transfer = !updatedPlaces[index].transfer;
    setPackagePlaces(updatedPlaces);
  };

  const handleCustomizableChange = (e) => {
    const isChecked = e.target.checked;
    setFormData({
      ...formData,
      customizablePackage: isChecked,
    });
  };

  const handlePickupLocationChange = (inputValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickupLocation: inputValue,
    }));

    // Fetch data from the API based on the search query
    fetch(`${config.API_HOST}/api/cities/searchcities?search=${inputValue}`)
      .then((response) => response.json())
      .then((data) => {
        setPickupLocationSearchResults(data.slice(0, 5)); // Limit to 5 results
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const handleSelectSuggestion = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickupLocation: selectedOption.label, // Update form data with the selected city
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      pickupLocation: selectedOption.label
        ? ""
        : "Please enter the information",
    }));
  };

  const handleDropLocationChange = (inputValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropLocation: inputValue,
    }));

    // Fetch data for drop location
    fetch(`${config.API_HOST}/api/cities/searchcities?search=${inputValue}`)
      .then((response) => response.json())
      .then((data) => {
        setDropLocationSearchResults(data.slice(0, 5)); // Limit to 5 results
      })
      .catch((error) => {
        console.error("Error fetching drop location results:", error);
      });
  };

  const handleDropSelectSuggestion = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropLocation: selectedOption.label, // Update drop location
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      dropLocation: selectedOption.label ? "" : "Please enter the information",
    }));
  };

  const handleDropDownChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Dynamically update the form field based on name
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : "Please enter the information",
    }));
  };

  useEffect(() => {
    if (maxNightsReached + 1 === maxNights) {
      handleItenaryBoxes();
    }
  }, [maxNightsReached]);

  const checkAndRemoveLastEntry = () => {
    // Check if packagePlaces is not empty
    if (packagePlaces.length > 0) {
      const lastIndex = packagePlaces.length - 1;
      const lastNightsValue = packagePlaces[lastIndex].nights;

      // If the last entry's nights is greater than 1, remove it
      if (maxNightsReached + 1 === maxNights && lastNightsValue === "") {
        setPackagePlaces((prevPackagePlaces) => {
          // Create a new array without the last element
          return prevPackagePlaces.slice(0, -1);
        });
      }
    }
  };

  useEffect(() => {
    checkAndRemoveLastEntry();
  }, [maxNightsReached, packagePlaces]); // Runs whenever lastNightsValue changes

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Function to handle click outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false); // Close the dropdown
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMultiSelectChange = (field, selectedOptions) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: selectedOptions,
    }));
  };

  const handleRichTextChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  useEffect(() => {
    // Initialize the travel data
    const newTravelData = {};

    if (cabsData && activeTab === "Cabs") {
      const { pickupLocation, dropLocation, packagePlaces } = cabsData;

      // Ensure there is at least one place in packagePlaces
      const firstCity = packagePlaces[0]?.placeCover;

      // Store travel 1 with pickupLocation and first city
      newTravelData["travel 1"] = firstCity
        ? [pickupLocation, firstCity]
        : [pickupLocation, dropLocation];

      // Iterate through packagePlaces to create travel entries
      packagePlaces.forEach((place, index) => {
        if (place.placeCover) {
          if (index < packagePlaces.length - 1) {
            // For travel 2 and onward, link current place to the next place
            newTravelData[`travel ${index + 2}`] = [
              packagePlaces[index].placeCover,
              packagePlaces[index + 1].placeCover,
            ];
          } else {
            // Last travel leg: from last place to dropLocation
            newTravelData[`travel ${index + 2}`] = [
              packagePlaces[index].placeCover,
              dropLocation,
            ];
          }
        }
      });

      fetchCabs();
    }

    setTravelData(newTravelData);
  }, [cabsData]);

  const fetchCabs = async () => {
    try {
      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`);
      const data = await response.json();

      // Assuming the result contains an array of cabs
      const segregatedCabs = data.result.reduce((acc, cab) => {
        const { cabType } = cab;
        if (!acc[cabType]) {
          acc[cabType] = []; // Initialize an array if it doesn't exist
        }
        acc[cabType].push(cab); // Push the cab to the corresponding cabType array
        return acc;
      }, {});

      setCabs(segregatedCabs); // Set the segregated cabs data
    } catch (error) {
      console.error("Error fetching cabs:", error);
    }
  };

  const handleCabsSubmit = (cabData) => {
    // Simply store the received cab data
    setAllTabsData((prev) => {
      const newData = {
        ...prev,
        cabs: cabData,
      };
      console.log("After cabs tab:", newData);
      return newData;
    });

    // Move to next tab
    const currentTabIndex = tabs.indexOf(activeTab);
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }
  };

  // Add this effect to initialize cab data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      // Set initial cab data
      if (initialData.travelPrices) {
        setCabsData({
          ...initialData,
          packageId: initialData._id,
        });
        setCabPayload(initialData.travelPrices);
        setTravelData(initialData.travelPrices.travelInfo);
      }
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    if (initialData && isEditing) {
      // Set form data with all fields
      setFormData({
        ...initialData,
        packageType: initialData.packageType || "",
        packageCategory: initialData.packageCategory || "",
        amenities: initialData.amenities || [],
        themes: initialData.themes || [],
        tags: initialData.tags || [],
        pickupLocation: initialData.pickupLocation || "",
        dropLocation: initialData.dropLocation || "",
        state: initialData.state || "",
      customExclusions: initialData.customExclusions || [], // Add this line
  
      });

      // Set package places
      if (initialData.packagePlaces && initialData.packagePlaces.length > 0) {
        setPackagePlaces(initialData.packagePlaces);
      }

      // Set files/images
      if (initialData.packageImages && initialData.packageImages.length > 0) {
        // Convert image URLs to File objects if needed
        setFiles(initialData.packageImages);
      }

      // Initialize trip data from package places
      if (initialData.packagePlaces) {
        const newTripData = initialData.packagePlaces.map(
          (place, index, array) => ({
            fromCity: place.placeCover,
            toCity:
              index < array.length - 1
                ? array[index + 1].placeCover
                : initialData.dropLocation,
            day: index + 1,
          })
        );
        setTripData(newTripData);
      }

      // Show itinerary boxes if package places exist
      if (initialData.packagePlaces && initialData.packagePlaces.length > 0) {
        setShowIteniraryBoxes(true);
      }

      // Initialize itinerary days based on duration
      if (initialData.duration) {
        const nights = parseInt(initialData.duration.split("D")[0]);
        const days = Array.from({ length: nights }, (_, i) => ({
          day: i + 1,
          description: "",
          selectedItinerary: null,
        }));
        setItineraryDays(days);
      }

      // Set travel data if it exists
      if (initialData.travelPrices) {
        setTravelData(initialData.travelPrices.travelInfo);
        setCabsData(initialData);
        setCabPayload(initialData.travelPrices);
      }

      // Calculate max nights reached
      if (initialData.packagePlaces) {
        const totalNights = initialData.packagePlaces.reduce(
          (acc, place) => acc + parseInt(place.nights || 0),
          0
        );
        setMaxNightsReached(totalNights);
      }
    }
  }, [initialData, isEditing]);

  // Add this effect to handle itinerary initialization
  useEffect(() => {
    if (tripData && tripData.length > 0) {
      console.log("TripData updated, fetching itineraries...");
      fetchItinerariesForTripData(tripData);
    }
  }, [tripData]);

  const handleItinerarySelection = (index, selectedItinerary) => {
    setItineraryDays((prevDays) => {
      const updatedDays = [...prevDays];
      if (!updatedDays[index]) {
        updatedDays[index] = { day: index + 1 };
      }
      updatedDays[index].selectedItinerary = {
        ...selectedItinerary,
        itineraryTitle: selectedItinerary.itineraryTitle,
        itineraryDescription: selectedItinerary.itineraryDescription,
        cityName: selectedItinerary.cityName,
        totalHours: selectedItinerary.totalHours,
        distance: selectedItinerary.distance,
        activities: selectedItinerary.activities || [],
        sightseeing: selectedItinerary.sightseeing || [],
        inclusions: selectedItinerary.inclusions || [],
        exclusions: selectedItinerary.exclusions || [],
        cityArea: selectedItinerary.cityArea || [], // Add this line

      };
      return updatedDays;
    });

    // Update the selected itinerary title
    setSelectedItineraryTitles((prevTitles) => {
      const updatedTitles = [...prevTitles];
      updatedTitles[index] = selectedItinerary.itineraryTitle;
      return updatedTitles;
    });

    // Close the dropdown
    setShowDropdowns((prev) => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });
  };

  const fetchItinerariesForTripData = async (tripData) => {
    try {
      console.log("Starting fetchItinerariesForTripData with:", tripData);
      const sequence = generateItinerarySequence();

      if (!sequence.length) {
        console.error("No sequence generated");
        return;
      }

      console.log("Generated sequence:", sequence);
      const updatedDays = [...itineraryDays];
      const updatedTitles = [...selectedItineraryTitles];

      for (let i = 0; i < sequence.length; i++) {
        try {
          const dayInfo = sequence[i];
          if (!dayInfo) {
            console.error(`No day info for index ${i}`);
            continue;
          }

          let searchQuery;
          if (dayInfo.type === "travel") {
            searchQuery = `${dayInfo.from} to ${dayInfo.to}${
              dayInfo.isNightTravel ? " night" : ""
            }`;
          } else {
            searchQuery = `${dayInfo.location} Local`;
          }

          console.log(
            `Fetching itinerary for day ${i + 1} with query:`,
            searchQuery
          );

          const response = await fetch(
            `${
              config.API_HOST
            }/api/itinerary/searchitineraries?search=${encodeURIComponent(
              searchQuery
            )}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`Received data for day ${i + 1}:`, data);

          if (data && data.length > 0) {
            updatedTitles[i] = searchQuery;
            if (!updatedDays[i]) {
              updatedDays[i] = { day: i + 1 };
            }
            updatedDays[i].selectedItinerary = data[0];
            updatedDays[i].searchResults = data;

            // Automatically trigger itinerary selection
            handleItinerarySelection(i, data[0]);
          }
        } catch (error) {
          console.error(`Error fetching itinerary for day ${i + 1}:`, error);
          continue;
        }
      }

      setItineraryDays(updatedDays);
      setSelectedItineraryTitles(updatedTitles);
      console.log("Updated itinerary days:", updatedDays);
    } catch (error) {
      console.error("Error in fetchItinerariesForTripData:", error);
    }
  };

  // Add this useEffect to handle initial itinerary loading for edit mode
  useEffect(() => {
    if (isEditing && initialData && initialData.packagePlaces) {
      console.log("Initializing itinerary for edit mode...");
      fetchItinerariesForTripData(initialData.packagePlaces);
    }
  }, [isEditing, initialData]);

  // Add these icons at the top of your file
  const TabIcons = {
    Package: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21"
        />
      </svg>
    ),
    Cabs: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M8 7h8m-8 5h8m-4 5h4M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4l-4 4-4-4z"
        />
      </svg>
    ),
    Hotels: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    FinalCosting: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 3h18v18H3V3z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 9h18M3 15h18"
        />
      </svg>
    ),
  };

  const handleHotelDataConfirm = (data) => {
    setSelectedHotelData(data);
    setActiveTab("Final Costing");
  };

  // Add handler for Hotels tab
  const handleHotelsSubmit = async () => {
    // Store hotels data
    setAllTabsData((prev) => ({
      ...prev,
      hotels: {
        selectedHotelData,
        selectedHotels,
      },
    }));

    // Move to next tab
    const currentTabIndex = tabs.indexOf(activeTab);
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    }

    console.log("All tabs data so far:", allTabsData);
  };

  const handleFinalCostingSubmit = async (finalCostingData) => {
    // Update allTabsData with the final costing data
    setAllTabsData((prev) => {
      const newData = {
        ...prev,
        hotels: finalCostingData.hotels,
        activities: finalCostingData.activities,
        sightseeing: finalCostingData.sightseeing,
        finalCosting: finalCostingData.pricing,
      };

      // Call the API with the complete data
      submitCompletePackage(newData);

      return newData;
    });
  };

  const submitCompletePackage = async (completeData) => {
    try {
      // Prepare the complete data payload
      const payload = {
        package: completeData.package,
        cabs: completeData.cabs,
        hotels: completeData.hotels,
        activities: completeData.activities,
        sightseeing: completeData.sightseeing,
        finalCosting: completeData.finalCosting,
        currentUser: currentUser?.data||"",
        packageStatus:"pending",
      };

      console.log("Submitting Complete Package Data:", payload);

      const response = await fetch(`${config.API_HOST}/api/packageapproval/createapproval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Success handling
      alert("Package saved successfully!");
    } catch (error) {
      console.error("Error in submitCompletePackage:", error);
      alert("Error saving package. Please try again.");
    }
  };

  // 1. Add missing state for selectedHotels
  const [selectedHotels, setSelectedHotels] = useState([]);

  // Add state for global master modal
  const [showGlobalMasterModal, setShowGlobalMasterModal] = useState(false);
  const [globalMasterData, setGlobalMasterData] = useState([]);
  const [selectedGlobalMasterItems, setSelectedGlobalMasterItems] = useState([]);
  const [loadingGlobalMaster, setLoadingGlobalMaster] = useState(false);

  // Add a useEffect to monitor packagePlaces changes
  useEffect(() => {
    if (
      packagePlaces.length > 0 &&
      formData.duration &&
      formData.pickupLocation &&

      
      formData.dropLocation
    ) {
      const totalNights = packagePlaces.reduce(
        (sum, place) => sum + parseInt(place.nights || 0),
        0
      );
      const maxNights = parseInt(formData.duration?.split("N")[0] || 0);

      console.log("Package places changed:", {
        totalNights,
        maxNights,
        places: packagePlaces,
      });

      if (totalNights === maxNights) {
        console.log("Conditions met, initializing itineraries");
        initializeItineraryDays();
      }
    }
  }, [
    packagePlaces,
    formData.duration,
    formData.pickupLocation,
    formData.dropLocation,
  ]);

  // Function to fetch global master data
  const fetchGlobalMasterData = async () => {
    setLoadingGlobalMaster(true);
    try {
      const response = await fetch(`${config.API_HOST}/api/globalmaster/getall`);
      if (!response.ok) throw new Error('Failed to fetch global master data');
      const data = await response.json();
      setGlobalMasterData(data);
    } catch (error) {
      alert('Error fetching global master data: ' + error.message);
    } finally {
      setLoadingGlobalMaster(false);
    }
  };

  // Function to handle global master item selection
  const handleGlobalMasterSelection = (item) => {
    setSelectedGlobalMasterItems(prev => {
      if (prev.some(selectedItem => selectedItem._id === item._id)) {
        return prev.filter(selectedItem => selectedItem._id !== item._id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Function to add selected global master items to inclusions or exclusions
  const addSelectedGlobalMasterItems = () => {
    try {
      if (selectedGlobalMasterItems.length === 0) {
        alert("Please select at least one item from global master data.");
        return;
      }

      // Separate inclusions and exclusions
      const inclusions = selectedGlobalMasterItems.filter(item => 
        item.name.toLowerCase().includes('inclusion')
      );
      const exclusions = selectedGlobalMasterItems.filter(item => 
        item.name.toLowerCase().includes('exclusion')
      );
      const otherItems = selectedGlobalMasterItems.filter(item => 
        !item.name.toLowerCase().includes('inclusion') && 
        !item.name.toLowerCase().includes('exclusion')
      );

      let updatedFormData = { ...formData };
      let message = [];

      // Add inclusions to packageInclusions
      if (inclusions.length > 0) {
        const currentInclusions = formData.packageInclusions || '';
        const newInclusionsContent = inclusions.map(item => item.description).join('<br><br>');
        const updatedInclusions = currentInclusions 
          ? currentInclusions + '<br><br>' + newInclusionsContent
          : newInclusionsContent;
        
        updatedFormData.packageInclusions = updatedInclusions;
        message.push(`${inclusions.length} inclusion(s)`);
      }

      // Add exclusions to packageExclusions
      if (exclusions.length > 0) {
        const currentExclusions = formData.packageExclusions || '';
        const newExclusionsContent = exclusions.map(item => item.description).join('<br><br>');
        const updatedExclusions = currentExclusions 
          ? currentExclusions + '<br><br>' + newExclusionsContent
          : newExclusionsContent;
        
        updatedFormData.packageExclusions = updatedExclusions;
        message.push(`${exclusions.length} exclusion(s)`);
      }

      // Add other items to customExclusions
      if (otherItems.length > 0) {
        const newCustomExclusions = otherItems.map(item => ({
          name: item.name,
          description: item.description
        }));

        const updatedCustomExclusions = [...(formData.customExclusions || []), ...newCustomExclusions];
        updatedFormData.customExclusions = updatedCustomExclusions;
        message.push(`${otherItems.length} other item(s) to custom exclusions`);
      }

      setFormData(updatedFormData);

      // Reset selection and close modal
      setSelectedGlobalMasterItems([]);
      setShowGlobalMasterModal(false);
      
      alert(`${message.join(', ')} added successfully!`);
      
    } catch (error) {
      console.error("Error adding global master items:", error);
      alert("Error adding selected items. Please try again.");
    }
  };

  // Function to open global master modal
  const openGlobalMasterModal = () => {
    setShowGlobalMasterModal(true);
    fetchGlobalMasterData();
  };

  return (
    <div className="stepper-form w-full mt-4">
      <div className="sticky top-0 z-50 bg-white shadow-sm  mx-auto">
        <div className="mx-auto">
          <div className="flex items-center justify-between border-b w-full">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  relative flex-1 px-4 py-2 -mb-px
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${
                    activeTab === tab
                      ? "bg-[rgb(45,45,68)] text-white border-b-2 border-white"
                      : index < tabs.indexOf(activeTab)
                      ? "text-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {/* Icon with background */}
                <div
                  className={`
                  w-6 h-6 rounded-full
                  flex items-center justify-center
                  ${
                    activeTab === tab
                      ? "bg-white"
                      : index < tabs.indexOf(activeTab)
                      ? "bg-green-100"
                      : "bg-gray-100"
                  } 
                `}
                >
                  <span
                    className={
                      activeTab === tab ? "text-[rgb(43,104,135)]" : ""
                    }
                  >
                    {TabIcons[tab]}
                  </span>
                </div>

                {/* Label */}
                <span className="text-xs font-medium whitespace-nowrap text-center">
                  {tab}
                </span>

                {/* Completed indicator */}
                {index < tabs.indexOf(activeTab) && (
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 bg-gray-100 w-full">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((tabs.indexOf(activeTab) + 1) / tabs.length) * 100}%`,
              backgroundImage: "linear-gradient(to right, #10B981, #3B82F6)",
            }}
          />
        </div>
      </div>

      {/* Add some spacing for the content below the sticky header */}
      <div className="mt-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "Package" && (
          <div className="step-1">
            <PackageForm
              formData={formData}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
              pickupLocationSearchResults={pickupLocationSearchResults}
              setSearchInput={setSearchInput}
              handlePickupLocationChange={handlePickupLocationChange}
              searchInput={searchInput}
              handleSelectSuggestion={handleSelectSuggestion}
              dropLocationSearchResults={dropLocationSearchResults}
              setPickupSearchInput={setPickupSearchInput}
              handleDropLocationChange={handleDropLocationChange}
              pickupSearchInput={pickupSearchInput}
              handleDropSelectSuggestion={handleDropSelectSuggestion}
              handleCustomizableChange={handleCustomizableChange}
              handleImageChange={handleImageChange}
              handleImageUpload={handleImageUpload}
              packagePlaces={packagePlaces}
              isDropdownOpen={isDropdownOpen}
              maxNightsReached={maxNightsReached}
              maxNights={maxNights}
              handleAddPackagePlace={handleAddPackagePlace}
              showIteniraryBoxes={showIteniraryBoxes}
              numRooms={numRooms}
              handleNumRoomsChange={handleNumRoomsChange}
              handleSubmit={handleSubmit}
              handleDropDownChange={handleDropDownChange}
              handleMultiSelectChange={handleMultiSelectChange}
              handleRichTextChange={handleRichTextChange}
              RichTextInput={RichTextInput}
              handleDropdownChange={handleDropdownChange}
              handlePlaceSelection={handlePlaceSelection}
              handlePlaceInputChange={handlePlaceInputChange}
              handleRemovePackagePlace={handleRemovePackagePlace}
              setActiveSuggestion={setActiveSuggestion}
              activeSuggestion={activeSuggestion}
              searchResults={searchResults}
              activeIndex={activeIndex}
              renderItineraryBoxes={renderItineraryBoxes}
              dropdownRef={dropdownRef}
              handleItenaryBoxes={handleItenaryBoxes}
              isEditing={isEditing}
              initialData={initialData}
              setFormData={setFormData}
              uploading={uploading}
              isLoading={isLoading}
              setShowGlobalMasterModal={openGlobalMasterModal}
            />
          </div>
        )}
        {activeTab === "Cabs" && (
          <div className="step-2">
            <CabCalculation
              cabsData={cabsData}
              cabs={cabs}
              pricing={pricing}
              setPricing={setPricing}
              travelData={travelData}
              handleCabsSubmit={handleCabsSubmit}
              setCabPayload={setCabPayload}
              setFormData={setFormData}
              cabPayLoad={cabPayLoad}
              isEditing={isEditing}
              fetchCabs={fetchCabs}
            />
          </div>
        )}
        {activeTab === "Hotels" && (
          <div className="step-3">
            <HotelCalculation
              travelData={packagePlaces.map((place, index) => ({
                day: index + 1,
                city: place.placeCover,
                nights: place.nights,
              }))}
              cabsData={cabsData}
              isEditing={isEditing}
              editId={editId}
              existingHotels={initialData?.hotels}
              onConfirmSelection={handleHotelDataConfirm}
            />
          </div>
        )}
        {activeTab === "Final Costing" && (
          <div className="step-4">
            <FinalCosting
              selectedHotelData={selectedHotelData}
              onSubmit={handleFinalCostingSubmit}
            />
          </div>
        )}
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Places to Add</h3>
              <button 
                onClick={() => setShowCityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {matchedCities.length === 0 ? (
                <p className="text-gray-600 py-4">No places found for this city.</p>
              ) : (
                <div className="space-y-3">
                  {matchedCities.map(city => (
                    <div 
                      key={city._id}
                      className={`border rounded-lg p-3 cursor-pointer ${
                        selectedCities.some(item => item._id === city._id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleCitySelection(city)}
                    >
                      <div className="flex items-start">
                        <input 
                          type="checkbox" 
                          checked={selectedCities.some(item => item._id === city._id)}
                          readOnly
                          className="mt-1 h-4 w-4"
                        />
                        <div className="ml-3">
                          <h4 className="font-medium">{city.placeName}</h4>
                          <p className="text-sm text-gray-600">{city.description || 'No description'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-4 pt-3 border-t">
              <button
                onClick={() => setShowCityModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={addSelectedCitiesToItinerary}
                disabled={selectedCities.length === 0}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedCities.length === 0 
                    ? 'bg-blue-300' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Master Data Modal */}
      {showGlobalMasterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Global Master Data</h3>
              <button 
                onClick={() => {
                  setShowGlobalMasterModal(false);
                  setSelectedGlobalMasterItems([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loadingGlobalMaster ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading global master data...</p>
                </div>
              ) : globalMasterData.length === 0 ? (
                <p className="text-gray-600 py-4 text-center">No global master data found.</p>
              ) : (
                <div className="space-y-3">
                  {globalMasterData.map(item => (
                    <div 
                      key={item._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedGlobalMasterItems.some(selectedItem => selectedItem._id === item._id) 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleGlobalMasterSelection(item)}
                    >
                      <div className="flex items-start">
                        <input 
                          type="checkbox" 
                          checked={selectedGlobalMasterItems.some(selectedItem => selectedItem._id === item._id)}
                          readOnly
                          className="mt-1 h-4 w-4 text-green-600"
                        />
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-gray-800 mb-2">
                            {item.name}
                          </h4>
                          <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: item.description }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <div className="text-sm text-gray-600">
                {selectedGlobalMasterItems.length > 0 && (
                  <span>{selectedGlobalMasterItems.length} item(s) selected</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowGlobalMasterModal(false);
                    setSelectedGlobalMasterItems([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addSelectedGlobalMasterItems}
                  disabled={selectedGlobalMasterItems.length === 0}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedGlobalMasterItems.length === 0 
                      ? 'bg-green-300 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Add Selected ({selectedGlobalMasterItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RichTextInput = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const editorStyle = {
    height: "200px",
    paddingBottom: "50px",
    borderRadius: "10px",
  };

  return (
    <ReactQuill
      theme="snow"
      modules={modules}
      placeholder="Write something..."
      style={editorStyle}
      value={value}
      onChange={onChange}
    />
  );
};
export default PackageCreationApproval;
