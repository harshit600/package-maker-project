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

const PackageCreation = () => {
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
  const tabs = ['Package', 'Cabs', 'Hotels', 'Final Pricing', 'Share'];
  const [travelData, setTravelData] = useState({});
  const [pricing, setPricing] = useState(0);
  const [cabsData, setCabsData] = useState({});
  const [cabs, setCabs] = useState();
  const [cabPayLoad, setCabPayload] = useState();
  
  const [formData, setFormData] = useState({
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

  // Function to initialize itinerary days based on maxNights
  const initializeItineraryDays = () => {
    const days = [];
    for (let i = 1; i <= maxNights; i++) {
      days.push({ day: i, description: "", selectedItinerary: null });
    }
    setItineraryDays(days);
  };

  // Call initializeItineraryDays when component mounts
  useEffect(() => {
    initializeItineraryDays();
  }, [maxNights]);

  const handleItinerarySearch = async (index, query) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/searchitineraries?search=${query}`
      );
      const data = await response.json();
      const searchResults = data;
      setItineraryDays((prevDays) => {
        const updatedDays = [...prevDays];
        updatedDays[index].searchResults = searchResults;
        return updatedDays;
      });
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    }
  };

  const handleItinerarySelection = (index, selectedItinerary) => {
    // Update the selected itinerary for the corresponding day
    setItineraryDays((prevDays) => {
      const updatedDays = [...prevDays];
      if(updatedDays[index]){
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

  // Function to handle fetching itineraries for all days mentioned in tripData
  const fetchItinerariesForTripData = async (tripData) => {
    tripData.forEach(async (entry, index) => {
      if (entry.day) {
        const itineraryTitle = `${entry.fromCity} to ${entry.toCity}`;
        const itineraryData = await fetchItinerary(itineraryTitle);

        // Update selected itinerary title in state
        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[entry.day - 1] = itineraryTitle; // Adjust index to match day
          return updatedTitles;
        });

        setItineraryDays((prevDays) => {
          const updatedDays = [...prevDays];
          updatedDays[entry.day - 1].selectedItinerary = itineraryData[0]; // Adjust index to match day
          return updatedDays;
        });

        // Handle itinerary data here
      }
    });
  };

  useEffect(() => {
    const fetchItineraryData = async () => {
      const itineraryTitle = `${formData.pickupLocation} to ${tripData[0].fromCity}`;
      try {
        const itineraryData = await fetchItinerary(itineraryTitle);

        setItineraryDays((prevDays) => {
          const updatedDays = [...prevDays];
          if (updatedDays.length > 0) {
            updatedDays[0].selectedItinerary = itineraryData[0]; // Adjust index to match day
          }
          return updatedDays;
        });
        setSelectedItineraryTitles((prevTitles) => {
          const updatedTitles = [...prevTitles];
          updatedTitles[0] = itineraryTitle; // Adjust index to match day
          return updatedTitles;
        });
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
      }
    };

    fetchItineraryData();
  }, [formData.pickupLocation, tripData[0].fromCity]);

  useEffect(() => {
    fetchItinerariesForTripData(tripData);
  }, [tripData]);

  const renderItineraryBoxes = () => {
    return itineraryDays.map((day, index) => (
      <div key={index} className="mb-4">
        <Row className="mb-6">
          <Col>
            <div
              className="mb-0 text-m"
              style={{
                fontWeight: "bold",
              }}
            >
              Day {day.day}
            </div>
          </Col>
          <Col>
            {/* Add input field for itinerary search */}
            <div className="position-relative">
              <input
                type="text"
                placeholder="Search Itinerary"
                className="p-2"
                value={selectedItineraryTitles[index]}
                onChange={(e) => {
                  const { value } = e.target;
                  setSelectedItineraryTitles((prevTitles) => {
                    const updatedTitles = [...prevTitles];
                    updatedTitles[index] = value;
                    return updatedTitles;
                  });
                  setShowDropdowns((prevDropdowns) => {
                    const updatedDropdowns = [...prevDropdowns];
                    updatedDropdowns[index] = true;
                    return updatedDropdowns;
                  });
                  handleItinerarySearch(index, value);
                }}
              />
              {/* Display search results */}
              {showDropdowns[index] && day.searchResults && (
                <ul className="list-group dropitdown mt-1">
                  {day.searchResults.slice(0, 5).map((result) => (
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
        {day.selectedItinerary && (
  <div className="p-6 bg-white shadow-md border border-gray-200 rounded-xl w-full">
    <h4 className="text-xl font-semibold text-gray-800 mb-4">
      Selected Itinerary Details
    </h4>
    <div className="space-y-3">
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">📌 Title:</span> {day.selectedItinerary.itineraryTitle}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">📝 Description:</span> {day.selectedItinerary.itineraryDescription}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">🌆 City:</span> {day.selectedItinerary.cityName}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">🌍 Country:</span> {day.selectedItinerary.country}
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">⏳ Duration:</span> {day.selectedItinerary.totalHours} hours
      </p>
      <p className="text-gray-600">
        <span className="font-medium text-gray-800">📏 Distance:</span> {day.selectedItinerary.distance} km
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
    
    // Validation check
    // const errors = {};
    // Object.keys(formData).forEach((field) => {
    //   if (!formData[field]) {
    //     errors[field] = "Please enter the information";
    //   }
    // });

    // setValidationErrors(errors);

    // // If there are validation errors, do not proceed with form submission
    // if (Object.keys(errors).length > 0) {
    //   return;
    // }

    formData.packagePlaces = formData.packagePlaces.slice(0, -1);

    const payload = {
      ...formData,
      // other payload properties...
  };
    const url = `${config.API_HOST}/api/packages/createpackage`;
    const method = "POST"; 

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
        console.log(data); 

    console.log(data);
    setCabsData(data);
    setActiveTab('Cabs')

    if (response.ok) {
      // window.location.reload();
    } else {
      throw new Error("Failed to submit itinerary");
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


  const handleCabsSubmit = () => {
      console.log('hi clicked!')
  }
  
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
      cabPayLoad={cabPayLoad}
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
