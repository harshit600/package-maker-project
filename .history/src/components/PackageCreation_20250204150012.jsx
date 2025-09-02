import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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

const PackageCreation = ({ initialData, isEditing, editId }) => {
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
      userRef: "",
      travelPrices: {},
    }
  );

  console.log(formData);

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

  // Function to generate itinerary sequence based on package places
  const generateItinerarySequence = () => {
    if (!formData.pickupLocation || !packagePlaces.length) return [];

    // Parse duration to get total days
    const totalDays = parseInt(formData.duration.split("D")[0]);
    if (!totalDays) return [];

    const sequence = [];
    let currentLocation = formData.pickupLocation;
    let dayCounter = 1;

    // First add all travel days and local days in sequence
    for (let i = 0; i < packagePlaces.length; i++) {
      const place = packagePlaces[i];

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

    return sequence;
  };

  // Update handleItinerarySearch to use the correct search query based on type
  const handleItinerarySearch = async (index, query, itineraryDay) => {
    try {
      let searchQuery = query;
      if (!query) {
        const sequence = generateItinerarySequence();
        const dayInfo = sequence[index];

        if (dayInfo.type === "travel") {
          searchQuery = `${dayInfo.from} to ${dayInfo.to}${
            dayInfo.isNightTravel ? " night" : ""
          }`;
        } else {
          searchQuery = `${dayInfo.location} Local`; // Add 'Local' for local days
        }

        // Set the search box value
        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[index] = searchQuery;
          return updatedTitles;
        });
      }

      const response = await fetch(
        `${config.API_HOST}/api/itinerary/searchitineraries?search=${searchQuery}`
      );
      const data = await response.json();

      setItineraryDays((prevDays) => {
        const updatedDays = [...prevDays];
        if (!updatedDays[index]) {
          updatedDays[index] = { day: index + 1 };
        }
        updatedDays[index].searchResults = data;
        return updatedDays;
      });

      // Auto-select first result if no query provided and results exist
      if (!query && data.length > 0) {
        handleItinerarySelection(index, data[0]);

        // Also update the search box value with the selected itinerary title
        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[index] = data[0].itineraryTitle;
          return updatedTitles;
        });
      }
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  // Update initializeItineraryDays to respect existing data
  const initializeItineraryDays = () => {
    const sequence = generateItinerarySequence();
    const days = sequence.map((dayInfo, index) => ({
      day: dayInfo.day,
      description: "",
      selectedItinerary: itineraryDays[index]?.selectedItinerary || null,
      type: dayInfo.type,
      ...(dayInfo.type === "travel"
        ? { from: dayInfo.from, to: dayInfo.to }
        : { location: dayInfo.location }),
    }));

    setItineraryDays(days);

    // Initialize search box values and fetch itineraries
    days.forEach((day, index) => {
      const searchQuery =
        day.type === "travel"
          ? `${day.from} to ${day.to}`
          : `${day.location} Local`;

      // Set initial search box value
      setSelectedItineraryTitles((prevTitles) => {
        const updatedTitles = [...prevTitles];
        updatedTitles[index] = searchQuery;
        return updatedTitles;
      });

      // Only fetch new itineraries if we don't have existing data
      if (!day.selectedItinerary) {
        handleItinerarySearch(index, "", day);
      }
    });
  };

  // Update fetchItinerariesForTripData to combine both versions' functionality
  const fetchItinerariesForTripData = async (tripData) => {
    const sequence = generateItinerarySequence();

    if (!sequence.length) return;

    const updatedDays = [...itineraryDays];
    const updatedTitles = [...selectedItineraryTitles];

    for (let i = 0; i < sequence.length; i++) {
      const dayInfo = sequence[i];
      let searchQuery;

      if (dayInfo.type === "travel") {
        searchQuery = `${dayInfo.from} to ${dayInfo.to}${
          dayInfo.isNightTravel ? " night" : ""
        }`;
      } else {
        searchQuery = `${dayInfo.location} Local`;
      }

      try {
        const response = await fetch(
          `${config.API_HOST}/api/itinerary/searchitineraries?search=${searchQuery}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          // Update selected itinerary title
          updatedTitles[i] = searchQuery;

          // Update itinerary day data
          if (!updatedDays[i]) {
            updatedDays[i] = { day: i + 1 };
          }
          updatedDays[i].selectedItinerary = data[0];
          updatedDays[i].searchResults = data;
        }
      } catch (error) {
        console.error(`Error fetching itinerary for day ${i + 1}:`, error);
      }
    }

    setItineraryDays(updatedDays);
    setSelectedItineraryTitles(updatedTitles);
  };

  // Update useEffect for itinerary initialization
  useEffect(() => {
    if (
      formData.duration &&
      packagePlaces.length > 0 &&
      formData.pickupLocation &&
      formData.dropLocation
    ) {
      const totalNights = packagePlaces.reduce(
        (sum, place) => sum + parseInt(place.nights || 0),
        0
      );
      const maxNights = parseInt(formData.duration.split("N")[0]);

      if (totalNights === maxNights) {
        // If we're editing and have initial data, use that first
        if (isEditing && initialData?.itineraryDays) {
          setItineraryDays(initialData.itineraryDays);
          const titles = initialData.itineraryDays.map((day) =>
            day.selectedItinerary ? day.selectedItinerary.itineraryTitle : ""
          );
          setSelectedItineraryTitles(titles);
        } else {
          // Otherwise initialize fresh
          initializeItineraryDays();
        }
        setShowIteniraryBoxes(true);
      }
    }
  }, [
    formData.duration,
    packagePlaces,
    formData.pickupLocation,
    formData.dropLocation,
  ]);

  // Remove the duplicate useEffect for tripData
  useEffect(() => {
    if (isEditing && initialData) {
      if (initialData.itineraryDays?.length > 0) {
        setItineraryDays(initialData.itineraryDays);
        const titles = initialData.itineraryDays.map((day) =>
          day.selectedItinerary ? day.selectedItinerary.itineraryTitle : ""
        );
        setSelectedItineraryTitles(titles);
      } else if (initialData.packagePlaces?.length > 0) {
        fetchItinerariesForTripData(initialData.packagePlaces);
      }
    }
  }, [isEditing, initialData]);

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
                          dayInfo.isNightTravel ? " (Night Travel)" : ""
                        }`
                      : `Local sightseeing in ${dayInfo.location}`}
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

    // Basic validation
    const requiredFields = [
      "packageType",
      "packageCategory",
      "packageName",
      "duration",
      "status",
      "pickupLocation",
      "dropLocation",
    ];

    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });

    // Validate package places
    if (
      !packagePlaces ||
      packagePlaces.length === 0 ||
      !packagePlaces.every((place) => place.placeCover && place.nights)
    ) {
      errors.packagePlaces = "Please add at least one place with nights";
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      alert("Please fill in all required fields");
      return;
    }

    const url = isEditing
      ? `${config.API_HOST}/api/packages/${editId}/package`
      : `${config.API_HOST}/api/packages/createpackage`;

    const method = isEditing ? "PATCH" : "POST";

    // Prepare the package data
    const packageData = {
      packageType: formData.packageType,
      packageCategory: formData.packageCategory,
      packageName: formData.packageName,
      packageImages: formData.packageImages,
      priceTag: formData.priceTag,
      duration: formData.duration,
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
      itineraryDays: itineraryDays.map((day) => ({
        day: day.day,
        selectedItinerary: day.selectedItinerary
          ? {
              itineraryTitle: day.selectedItinerary.itineraryTitle,
              itineraryDescription: day.selectedItinerary.itineraryDescription,
              cityName: day.selectedItinerary.cityName,
              country: day.selectedItinerary.country,
              totalHours: day.selectedItinerary.totalHours,
              distance: day.selectedItinerary.distance,
            }
          : null,
      })),
    };

    try {
      console.log("Submitting package data:", packageData);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Server error: ${response.status}`
        );
      }

      // Handle successful response
      if (data.success) {
        // For creation response
        if (data.data) {
          setCabsData({
            ...data.data,
            packageId: data.data._id,
            pickupLocation: packageData.pickupLocation,
            dropLocation: packageData.dropLocation,
            packagePlaces: packageData.packagePlaces,
            duration: packageData.duration,
          });
        } 
        // For edit response
        else if (data.package) {
          setCabsData({
            ...data.package,
            packageId: data.package._id || editId,
            pickupLocation: packageData.pickupLocation,
            dropLocation: packageData.dropLocation,
            packagePlaces: packageData.packagePlaces,
            duration: packageData.duration,
          });
        }

        // Move to the next tab
        setActiveTab("Cabs");
        return; // Exit the function after successful handling
      }

      // If we get here without a success flag, throw an error
      throw new Error(data.message || "Failed to save package");
      
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

  // const handleAddItineraryDay = () => {
  //   const nextDay = itineraryDays.length + 1;
  //   setItineraryDays([
  //     ...itineraryDays,
  //     {
  //       day: nextDay,
  //       selectedItinerary: null,
  //       details: { title: "", description: "" },
  //     },
  //   ]);
  // };

  // const handleRemoveItineraryDay = () => {
  //   if (itineraryDays.length === 1) return;
  //   const updatedItinerary = [...itineraryDays];
  //   updatedItinerary.pop();
  //   setItineraryDays(updatedItinerary);
  // };

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
    // Update the state with the selected place and clear search results
    const updatedPlaces = [...packagePlaces];
    updatedPlaces[index].placeCover = selectedPlace.placeName;
    setPackagePlaces(updatedPlaces);
    setSearchResults([]);

    // Create a new entry with the selected place as the "fromCity"
    const newEntry = { fromCity: selectedPlace.placeName, toCity: "" };

    // Update the tripData array by inserting the new entry at the correct position
    const updatedTripData = [
      ...tripData.slice(0, index),
      newEntry,
      ...tripData.slice(index),
    ];

    // Update the "toCity" of the previous entry and calculate the day number
    if (index > 0) {
      updatedTripData[index - 1].toCity = selectedPlace.placeName;

      // Calculate the day number based on the cumulative days
      let cumulativeDays = 1; // Start from day 1
      for (let i = 0; i < index; i++) {
        const nights = updatedPlaces[i].nights || 1; // Default to 1 night if not specified
        cumulativeDays += Number(nights); // Add the nights to the cumulative days
      }
      updatedTripData[index - 1].day = cumulativeDays;
    }

    // Remove the last entry if it is empty
    if (
      updatedTripData[updatedTripData.length - 1].fromCity === "" &&
      updatedTripData[updatedTripData.length - 1].toCity === ""
    ) {
      updatedTripData.pop();
    }

    // Update state with the new tripData
    setTripData(updatedTripData);
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

    // setValidationErrors((prevErrors) => ({
    //   ...prevErrors,
    //   [name]: value ? "" : "Please enter the information",
    // }));

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

  const handleCabsSubmit = async () => {
    try {
      if (!editId) {
        console.error("Package ID is undefined");
        return;
      }

      const url = `${config.API_HOST}/api/packages/${editId}/travel-prices`;
      const method = "PATCH";

      // Convert travelData object to array format
      const travelInfoArray = Object.values(travelData).map((route) => route);

      // Prepare the correct data structure for the API
      const payload = {
        travelPrices: {
          prices: cabPayLoad.prices,
          travelInfo: travelInfoArray,
          cabs: cabs,
        },
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setThirdStep(data);
      setActiveTab("Hotels"); // Move to next step after successful submission
    } catch (error) {
      console.error("Error updating prices:", error);
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
      fetchItinerariesForTripData(tripData);
    }
  }, [tripData]);

  const handleItinerarySelection = (index, selectedItinerary) => {
    // Update the selected itinerary for the corresponding day
    setItineraryDays((prevDays) => {
      const updatedDays = [...prevDays];
      if (updatedDays[index]) {
        updatedDays[index].selectedItinerary = selectedItinerary;
      }
      return updatedDays;
    });

    // Update the selected itinerary title for the corresponding input field
    setSelectedItineraryTitles((prevTitles) => {
      const updatedTitles = [...prevTitles];
      updatedTitles[index] = selectedItinerary.itineraryTitle;
      return updatedTitles;
    });

    // Close the dropdown for the corresponding input field
    setShowDropdowns((prevDropdowns) => {
      const updatedDropdowns = [...prevDropdowns];
      updatedDropdowns[index] = false;
      return updatedDropdowns;
    });
  };

  const fetchItinerary = async (itineraryTitle) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/searchitineraries?search=${itineraryTitle}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      return null;
    }
  };

  // Add this useEffect to handle initial itinerary loading for edit mode
  useEffect(() => {
    if (isEditing && initialData && initialData.packagePlaces) {
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
            />
          </div>
        )}
        {activeTab === "Cabs" && (
          <div className="step-2">
            <CabCalculation
              cabsData={cabsData}
              cabs={cabs}
              setTravelData={setTravelData}
              travelData={travelData}
              setPricing={setPricing}
              pricing={pricing}
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
            <FinalCosting selectedHotelData={selectedHotelData} />
          </div>
        )}
      </div>
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
export default PackageCreation;
