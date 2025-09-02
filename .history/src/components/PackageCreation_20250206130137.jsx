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

  // 1. The main function that handles itinerary search and auto-selection
  const handleItinerarySearch = async (index, query, itineraryDay) => {
    try {
      let searchQuery = query;
      const sequence = generateItinerarySequence(); // Define sequence first

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

        // Generate search query based on the type of day
        if (dayInfo.type === "travel") {
          searchQuery = `${dayInfo.from} to ${dayInfo.to}${
            dayInfo.isNightTravel ? " night" : ""
          }`;
        } else if (dayInfo.type === "local") {
          searchQuery = `${dayInfo.location} Local`;
        }

        console.log("Generated search query:", searchQuery);

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

      console.log("Fetching itineraries with query:", searchQuery);

      // Now we can safely use sequence[index] in the API call
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
      console.log("Received itinerary data:", data);

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
          };
        }

        return updatedDays;
      });

      if (!query && data.length > 0) {
        handleItinerarySelection(index, data[0]);
        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[index] = data[0].itineraryTitle;
          return updatedTitles;
        });

        console.log("Auto-selected itinerary:", data[0]);
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
  const initializeItineraryDays = () => {
    console.log("Starting initializeItineraryDays");
    const sequence = generateItinerarySequence();
    console.log("Generated sequence:", sequence);

    if (!sequence.length) {
      console.error("No sequence generated");
      return;
    }

    const days = sequence.map((dayInfo, index) => ({
      day: dayInfo.day,
      description: "",
      selectedItinerary: itineraryDays[index]?.selectedItinerary || null,
      type: dayInfo.type,
      ...(dayInfo.type === "travel"
        ? { from: dayInfo.from, to: dayInfo.to, isNightTravel: dayInfo.isNightTravel }
        : { location: dayInfo.location }),
    }));

    setItineraryDays(days);
    console.log("Set initial itinerary days:", days);

    // Initialize search box values and fetch itineraries
    days.forEach((day, index) => {
      const searchQuery =
        day.type === "travel"
          ? `${day.from} to ${day.to}`
          : `${day.location} Local`;

      console.log(`Day ${index + 1} search query:`, searchQuery);

      // Set initial search box value
      setSelectedItineraryTitles((prevTitles) => {
        const updatedTitles = [...prevTitles];
        updatedTitles[index] = searchQuery;
        return updatedTitles;
      });

      // Fetch itineraries for each day
      handleItinerarySearch(index, "", day);
    });
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

    const url = isEditing
      ? `${config.API_HOST}/api/packages/${editId}/package`
      : `${config.API_HOST}/api/packages/createpackage`;
    const method = isEditing ? "PATCH" : "POST";

    try {
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
                itineraryDescription:
                  day.selectedItinerary.itineraryDescription,
                cityName: day.selectedItinerary.cityName,
                country: day.selectedItinerary.country,
                totalHours: day.selectedItinerary.totalHours,
                distance: day.selectedItinerary.distance,
              }
            : null,
        })),
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      });

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
    const updatedPlaces = [...packagePlaces];
    updatedPlaces[index].placeCover = selectedPlace.placeName;
    setPackagePlaces(updatedPlaces);

    const newEntry = {
      fromCity: selectedPlace.placeName,
      toCity: "", // This will be set based on the next place or drop location
      day: index + 1,
    };

    const updatedTripData = [
      ...tripData.slice(0, index),
      newEntry,
      ...tripData.slice(index),
    ];
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
      const sequence = generateItinerarySequence();
      if (!sequence.length) return;

      const updatedDays = [...itineraryDays];
      const updatedTitles = [...selectedItineraryTitles];

      for (let i = 0; i < sequence.length; i++) {
        try {
          const dayInfo = sequence[i];
          if (!dayInfo) continue; // Skip if dayInfo is undefined

          let searchQuery;
          if (dayInfo.type === "travel") {
            searchQuery = `${dayInfo.from} to ${dayInfo.to}${
              dayInfo.isNightTravel ? " night" : ""
            }`;
          } else {
            searchQuery = `${dayInfo.location} Local`;
          }

          const response = await fetch(
            `${config.API_HOST}/api/itinerary/searchitineraries?search=${searchQuery}`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            updatedTitles[i] = searchQuery;
            if (!updatedDays[i]) {
              updatedDays[i] = { day: i + 1 };
            }
            updatedDays[i].selectedItinerary = data[0];
            updatedDays[i].searchResults = data;
          }
        } catch (error) {
          console.error(`Error fetching itinerary for day ${i + 1}:`, error);
          // Continue with the next iteration instead of breaking the loop
          continue;
        }
      }

      setItineraryDays(updatedDays);
      setSelectedItineraryTitles(updatedTitles);
    } catch (error) {
      console.error("Error in fetchItinerariesForTripData:", error);
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
      };

      console.log("Submitting Complete Package Data:", payload);

      const response = await fetch(`${config.API_HOST}/api/add/create`, {
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
