import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { app } from "../firebase";
import config from "../../config";
import PackageForm from "./ui-kit/package/PackageForm";
import CabCalculation from "./ui-kit/package/CabCalculation";
import HotelCalculation from "./ui-kit/package/HotelCalculation";

const PackageCreation = ({ initialData, isEditing, editId }) => {
  const [showIteniraryBoxes, setShowIteniraryBoxes] = useState(false);
  const [files, setFiles] = useState([]); // Added files state
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [pickupSearchInput, setPickupSearchInput] = useState("");
  const [tripData, setTripData] = useState([{ fromCity: "", toCity: "", day: 0 }]);
  const [searchInput, setSearchInput] = useState("");
  const [dropLocationSearchResults, setDropLocationSearchResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [pickupLocationSearchResults, setPickupLocationSearchResults] = useState([]);
  const [itineraryDays, setItineraryDays] = useState([{ day: 1, description: "", selectedItinerary: null }]);
  const [packagePlaces, setPackagePlaces] = useState([{ placeCover: "", nights: 0, transfer: false }]);
  const [numRooms, setNumRooms] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState('Package');
  const tabs = ['Package', 'Cabs', 'Hotels'];
  const [travelData, setTravelData] = useState({});
  const [pricing, setPricing] = useState(0);
  const [cabsData, setCabsData] = useState({});
  const [cabs, setCabs] = useState();
  const [cabPayLoad, setCabPayload] = useState();
  const [thirdStep, setThirdStep] = useState();
  console.log(cabsData, thirdStep)
  
  const [formData, setFormData] = useState(initialData || {
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
    packageDescription:"",
    packageInclusions:"",
    packageExclusions:"",
    userRef: "",
    travelPrices: {}
  });

  console.log(formData)

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
    const totalDays = parseInt(formData.duration.split('D')[0]);
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
            type: 'travel',
            isNightTravel: place.transfer
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
                        type: 'local',
                        cityIndex: i
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
            type: 'travel',
            isNightTravel: false
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
        
        if (dayInfo.type === 'travel') {
          searchQuery = `${dayInfo.from} to ${dayInfo.to}${dayInfo.isNightTravel ? ' night' : ''}`;
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
      ...(dayInfo.type === 'travel' ? { from: dayInfo.from, to: dayInfo.to } : { location: dayInfo.location })
    }));
    
    setItineraryDays(days);

    // Initialize search box values and fetch itineraries
    days.forEach((day, index) => {
      const searchQuery = day.type === 'travel' 
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
        handleItinerarySearch(index, '', day);
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
      
      if (dayInfo.type === 'travel') {
        searchQuery = `${dayInfo.from} to ${dayInfo.to}${dayInfo.isNightTravel ? ' night' : ''}`;
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
    if (formData.duration && packagePlaces.length > 0 && formData.pickupLocation && formData.dropLocation) {
      const totalNights = packagePlaces.reduce((sum, place) => sum + parseInt(place.nights || 0), 0);
      const maxNights = parseInt(formData.duration.split('N')[0]);
      
      if (totalNights === maxNights) {
        // If we're editing and have initial data, use that first
        if (isEditing && initialData?.itineraryDays) {
          setItineraryDays(initialData.itineraryDays);
          const titles = initialData.itineraryDays.map(day => 
            day.selectedItinerary ? day.selectedItinerary.itineraryTitle : ''
          );
          setSelectedItineraryTitles(titles);
        } else {
          // Otherwise initialize fresh
          initializeItineraryDays();
        }
        setShowIteniraryBoxes(true);
      }
    }
  }, [formData.duration, packagePlaces, formData.pickupLocation, formData.dropLocation]);

  // Remove the duplicate useEffect for tripData
  useEffect(() => {
    if (isEditing && initialData) {
      if (initialData.itineraryDays?.length > 0) {
        setItineraryDays(initialData.itineraryDays);
        const titles = initialData.itineraryDays.map(day => 
          day.selectedItinerary ? day.selectedItinerary.itineraryTitle : ''
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
    
    return sequence.map((dayInfo, index) => (
        <div key={index} className="mb-4">
            <Row className="mb-6">
                <Col>
                    <div className="mb-0 text-m font-bold">
                        Day {dayInfo.day} - {dayInfo.type === 'travel' ? 
                            `Travel from ${dayInfo.from} to ${dayInfo.to}${dayInfo.isNightTravel ? ' (Night Travel)' : ''}` : 
                            `Local sightseeing in ${dayInfo.location}`}
                    </div>
                </Col>
                <Col>
                    <div className="position-relative">
                        <input
                            type="text"
                            placeholder={dayInfo.type === 'travel' ? 
                                `Search travel itinerary from ${dayInfo.from} to ${dayInfo.to}` : 
                                `Search local activities in ${dayInfo.location}`}
                            className="p-2 w-full border rounded-md"
                            value={selectedItineraryTitles[index] || ''}
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
                        {showDropdowns[index] && itineraryDays[index]?.searchResults && (
                            <ul className="list-group dropitdown mt-1">
                                {itineraryDays[index].searchResults.slice(0, 5).map((result) => (
                                    <li
                                        key={result._id}
                                        className="list-group-item"
                                        onClick={() => handleItinerarySelection(index, result)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {result.itineraryTitle}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Col>
            </Row>
            {itineraryDays[index]?.selectedItinerary && (
                <div className="p-6 bg-white shadow-md border border-gray-200 rounded-xl w-full">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">
                        Selected Itinerary Details
                    </h4>
                    <div className="space-y-3">
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">📌 Title:</span> {itineraryDays[index].selectedItinerary.itineraryTitle}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">📝 Description:</span> {itineraryDays[index].selectedItinerary.itineraryDescription}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">🌆 City:</span> {itineraryDays[index].selectedItinerary.cityName}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">🌍 Country:</span> {itineraryDays[index].selectedItinerary.country}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">⏳ Duration:</span> {itineraryDays[index].selectedItinerary.totalHours} hours
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-800">📏 Distance:</span> {itineraryDays[index].selectedItinerary.distance} km
                        </p>
                    </div>
                </div>
            )}
        </div>
    ));
  };

  // Function to handle change in the number of rooms
  const handleNumRoomsChange = (e) => {
    const value = parseInt(e.target.value);
    setNumRooms(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing 
      ? `${config.API_HOST}/api/packages/${editId}/package`
      : `${config.API_HOST}/api/packages/createpackage`;
      console.log(url)
    
    const method = isEditing ? "PATCH" : "POST";

    // Prepare only the package data for the first step
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
        .filter(place => place.placeCover && place.nights)
        .map(place => ({
          placeCover: place.placeCover,
          nights: parseInt(place.nights),
          transfer: place.transfer || false
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
      itineraryDays: itineraryDays.map(day => ({
        day: day.day,
        selectedItinerary: day.selectedItinerary ? {
          itineraryTitle: day.selectedItinerary.itineraryTitle,
          itineraryDescription: day.selectedItinerary.itineraryDescription,
          cityName: day.selectedItinerary.cityName,
          country: day.selectedItinerary.country,
          totalHours: day.selectedItinerary.totalHours,
          distance: day.selectedItinerary.distance
        } : null
      }))
    };

    try {
      console.log('Submitting package data:', packageData);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store the package ID in cabsData for next steps
        setCabsData({
          ...data.package,
          packageId: data.package._id || editId,
          pickupLocation: packageData.pickupLocation,
          dropLocation: packageData.dropLocation,
          packagePlaces: packageData.packagePlaces,
          duration: packageData.duration
        });
        
        // Move to the next tab
        setActiveTab('Cabs');
      } else {
        console.error("Error saving package:", data.message);
        alert("Failed to save package. Please check the form and try again.");
      }
    } catch (error) {
      console.error("Error submitting package:", error);
      alert("An error occurred while saving the package. Please try again.");
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
          console.log(`Upload is ${progress}% done`);
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
      pickupLocation: selectedOption.label ? "" : "Please enter the information",
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
  
      if (cabsData && activeTab === 'Cabs') {
          const { pickupLocation, dropLocation, packagePlaces } = cabsData;
  
          // Ensure there is at least one place in packagePlaces
          const firstCity = packagePlaces[0]?.placeCover;
  
          // Store travel 1 with pickupLocation and first city
          newTravelData['travel 1'] = firstCity ? [pickupLocation, firstCity] : [pickupLocation, dropLocation];
  
          // Iterate through packagePlaces to create travel entries
          packagePlaces.forEach((place, index) => {
              if (place.placeCover) {
                  if (index < packagePlaces.length - 1) {
                      // For travel 2 and onward, link current place to the next place
                      newTravelData[`travel ${index + 2}`] = [
                          packagePlaces[index].placeCover,
                          packagePlaces[index + 1].placeCover
                      ];
                  } else {
                      // Last travel leg: from last place to dropLocation
                      newTravelData[`travel ${index + 2}`] = [
                          packagePlaces[index].placeCover,
                          dropLocation
                      ];
                  }
              }
          });

          fetchCabs();
      }
  
      console.log(newTravelData);
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
        console.error('Error fetching cabs:', error);
    }
};


  const handleCabsSubmit = async () => {
    try {
      if (!editId) {
        console.error('Package ID is undefined');
        return;
      }

      const url = `${config.API_HOST}/api/packages/${editId}/travel-prices`;
      const method = "PATCH";

      // Convert travelData object to array format
      const travelInfoArray = Object.values(travelData).map(route => route);

      // Prepare the correct data structure for the API
      const payload = {
        travelPrices: {
          prices: cabPayLoad.prices,
          travelInfo: travelInfoArray,
          cabs: cabs
        }
      };

      console.log('Submitting payload:', payload); // Debug log

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setThirdStep(data);
      setActiveTab('Hotels'); // Move to next step after successful submission
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  // Add this effect to initialize cab data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      // Set initial cab data
      if (initialData.travelPrices) {
        setCabsData({
          ...initialData,
          packageId: initialData._id
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
        const newTripData = initialData.packagePlaces.map((place, index, array) => ({
          fromCity: place.placeCover,
          toCity: index < array.length - 1 ? array[index + 1].placeCover : initialData.dropLocation,
          day: index + 1
        }));
        setTripData(newTripData);
      }

      // Show itinerary boxes if package places exist
      if (initialData.packagePlaces && initialData.packagePlaces.length > 0) {
        setShowIteniraryBoxes(true);
      }

      // Initialize itinerary days based on duration
      if (initialData.duration) {
        const nights = parseInt(initialData.duration.split('D')[0]);
        const days = Array.from({ length: nights }, (_, i) => ({
          day: i + 1,
          description: "",
          selectedItinerary: null
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
        const totalNights = initialData.packagePlaces.reduce((acc, place) => 
          acc + parseInt(place.nights || 0), 0
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

  return (
    <div className="stepper-form w-full">
      <div className="activeTab mb-2">


      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
            {tabs.map((tab) => (
                <li key={tab} className="me-2">
                    <button
                        onClick={() => setActiveTab(tab)}
                        className={`inline-block p-4 rounded-t-lg 
                            ${activeTab === tab ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500' : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'} 
                          
                        `}
                    >
                        {tab}
                    </button>
                </li>
            ))}
        </ul>

      </div>
    {activeTab === 'Package' && <div className="step-1">
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
    />
    </div>}
    {activeTab === 'Cabs' && <div className="step-2">
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
    </div>}
    {activeTab === 'Hotels' && <div className="step-3">
  <HotelCalculation
    travelData={packagePlaces.map((place, index) => ({
      day: index + 1,
      city: place.placeCover,
      nights: place.nights
    }))}
    cabsData={cabsData}
    isEditing={isEditing}
    editId={editId}
    existingHotels={initialData?.hotels} // Add this line to pass existing hotels
  />
</div>}
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
    borderRadius: "10px"
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
