import React, { useEffect, useRef, useState } from "react";
import { Container, Form, Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { app } from "../firebase";
import config from "../../config";
import Button from "./ui-kit/atoms/Button";
import Dropdown from "./ui-kit/atoms/Dropdown";
import SimpleDropdown from "./ui-kit/atoms/SimpleDropdown";
import MultiSelectDropdown from "./ui-kit/atoms/MultiSelectDropdown";
import { durationOptions, packageTypeOptions, packageCategoryOptions, statusOptions, hotelCategoryOptions, tourByOptions,
  agentPackageOptions, amenitiesOptions, TagOptions, themeOptions, hotelPackageOptions, vehicleOptions, priceTagOptions
} from "./ui-kit/onBoardingConstants/onBoardingData";

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
    // Perform form submission or API call here
    const payload = formData;
    let url = "";
    let method = "";

      // Adding new itinerary
      url = `${config.API_HOST}/api/packages/createpackage`;
      method = "POST"; // Use POST for adding
  
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if(response.ok){
      window.location.reload();
    }

    if (!response.ok) {
      throw new Error("Failed to submit itinerary");
    }
  };

  const handleAddItineraryDay = () => {
    const nextDay = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        day: nextDay,
        selectedItinerary: null,
        details: { title: "", description: "" },
      },
    ]);
  };

  const handleRemoveItineraryDay = () => {
    if (itineraryDays.length === 1) return;
    const updatedItinerary = [...itineraryDays];
    updatedItinerary.pop();
    setItineraryDays(updatedItinerary);
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
  };

  const handleDropDownChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Dynamically update the form field based on name
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


  return (
    <div style={{ width: "100%" }}>
      {/* Top bar */}
      <div className="bg-gray-100 rounded p-2 text-xl font-semibold mb-2 border-l-4 text-center border-r-4 border-black">
        Edit Package
      </div>

      {/* Basic Information section */}

      {/* <div className="mt-6 mb-6 text-lg font-semibold ">Basic Information</div> */}
      <Form onSubmit={handleSubmit}>
        <Container
          style={{
            paddingTop: "10px",
            // border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          }}
        >
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="packageType">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Type
              </Form.Label>
              <SimpleDropdown
                options={packageTypeOptions}
                label="Select Package Type"
                onSelect={(selectedOption) =>
                  handleDropDownChange("packageType", selectedOption.value)
                }
                value={formData.packageType}
              />
            </Form.Group>
            <Form.Group as={Col} id="packageCategory">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Category
              </Form.Label>
              <SimpleDropdown
                options={packageCategoryOptions}
                label="Select Package Type"
                onSelect={(selectedOption) =>
                  handleDropDownChange("packageCategory", selectedOption.value)
                }
                value={formData.packageCategory}
              />
            </Form.Group>
            <Form.Group as={Col} id="packageName">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package name"
                name="packageName"
                onChange={handleInputChange}
                value={formData.packageName}
                size="md"
                className="text-sm placeholder-gray-400 placeholder-opacity-100"
              />
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="duration">
              <Form.Label style={{ fontSize: "smaller" }}>
                Duration (Days)
              </Form.Label>
              <SimpleDropdown
                options={durationOptions}
                label="Select Duration"
                onSelect={(selectedOption) =>
                  handleDropDownChange("duration", selectedOption.value)
                }
                value={formData.duration}
              />
            </Form.Group>
            <Form.Group as={Col} id="status">
              <Form.Label style={{ fontSize: "smaller" }}>Status</Form.Label>
              <SimpleDropdown
                options={statusOptions}
                label="Select Duration"
                onSelect={(selectedOption) =>
                  handleDropDownChange("status", selectedOption.value)
                }
                value={formData.status}
              />
            </Form.Group>
            <Form.Group as={Col} id="displayOrder">
              <Form.Label style={{ fontSize: "smaller" }}>
                Display Order
              </Form.Label>
              <Form.Control
                type="number"
                name="displayOrder"
                placeholder="Display order"
                onChange={handleInputChange}
                value={formData.displayOrder}
                size="md"
                className="text-sm placeholder-gray-400 placeholder-opacity-100"
              />
              <Form.Text className="text-muted text-xs">
                1 is Highest and 100 is Lowest
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} id="hotelCategory">
              <Form.Label style={{ fontSize: "smaller" }}>
                Hotel Category
              </Form.Label>
              <SimpleDropdown
                options={hotelCategoryOptions}
                label="Select Hotel Category"
                onSelect={(selectedOption) =>
                  handleDropDownChange("hotelCategory", selectedOption.value)
                }
                value={formData.hotelCategory}
              />
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="pickupLocation">
              <Form.Label style={{ fontSize: "smaller" }}>
                Pickup Location
              </Form.Label>
              {/* Use input for search */}
              <Dropdown
                options={pickupLocationSearchResults.map((city) => ({
                  label: `${city.cityName}`,
                  value: city._id, // Each option has an ID or unique value
                }))}
                setSearchInput={setSearchInput}
                onChange={handlePickupLocationChange}
                searchInput={searchInput}
                label="Search Pickup Location"
                onSelect={handleSelectSuggestion} // Handle selection
              />
            </Form.Group>
            <Form.Group as={Col} id="pickupTransfer">
              <Form.Label
                style={{
                  fontSize: "smaller",
                  textAlign: "center",
                  marginBottom: "15px",
                }}
              >
                Pickup Transfer
              </Form.Label>
              <div className="flex align-center justify-center gap-2">
                <Form.Text className="text-muted">Day</Form.Text>
                <Form.Check
                  type="switch"
                  id="pickupTransfer"
                  label=""
                  checked={formData.pickupTransfer} // Use formData value
                  onChange={() =>
                    setFormData({
                      ...formData,
                      pickupTransfer: !formData.pickupTransfer,
                    })
                  }
                  size="sm"
                />
                <Form.Text className="text-muted">Night</Form.Text>
              </div>
            </Form.Group>
            <Form.Group as={Col} id="dropLocation">
              <Form.Label style={{ fontSize: "smaller" }}>
                Drop Location
              </Form.Label>
              {/* Use input for search */}
              <Dropdown
                options={dropLocationSearchResults.map((city) => ({
                  label: `${city.cityName}, ${city.state}, ${city.country}`,
                  value: city._id, // Each option has an ID or unique value
                }))}
                setSearchInput={setPickupSearchInput}
                onChange={handleDropLocationChange}
                searchInput={pickupSearchInput}
                label="Search Drop Location"
                onSelect={handleDropSelectSuggestion} // Handle selection
              />
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="validTill">
              <Form.Label style={{ fontSize: "smaller" }}>
                Valid Till
              </Form.Label>
              <Form.Control
                type="date"
                name="validTill"
                onChange={handleInputChange}
                value={formData.validTill}
                size="sm"
              />
            </Form.Group>
            <Form.Group as={Col} id="tourBy">
              <Form.Label style={{ fontSize: "smaller" }}>Tour By</Form.Label>
              <SimpleDropdown
                options={tourByOptions}
                label="Tour By"
                onSelect={(selectedOption) =>
                  handleDropDownChange("tourBy", selectedOption.value)
                }
                value={formData.tourBy}
              />
            </Form.Group>
            <Form.Group as={Col} id="agentPackage">
              <Form.Label style={{ fontSize: "smaller" }}>
                Agent Package
              </Form.Label>
              <SimpleDropdown
                options={agentPackageOptions}
                label="Select Agent Package"
                onSelect={(selectedOption) =>
                  handleDropDownChange("agentPackage", selectedOption.value)
                }
                value={formData.agentPackage}
              />
            </Form.Group>
            <Form.Group as={Col} id="customizable">
              {/* Checkbox for Customizable Package */}
              <div className="flex gap-2 m-4 align-center">
                <input
                  type="checkbox"
                  id="customizablePackage"
                  checked={formData.customizablePackage}
                  onChange={handleCustomizableChange}
                  style={{ width: "25px" }}
                />
                <label htmlFor="customizablePackage" className="text-xs">
                  Customizable Package
                </label>
              </div>
            </Form.Group>
            <div className="mb-6 mt-3 w-100">
              <div className="flex gap-5 rounded">
                <MultiSelectDropdown
                  options={amenitiesOptions}
                  label="Amenities"
                  handleChange={(selectedOptions) => handleMultiSelectChange('amenities', selectedOptions)}
                />
                <Form.Group
                  style={{ width: "50%" }}
                  as={Col}
                  id="packageImages"
                >
                  <Form.Label style={{ fontSize: "smaller" }}>
                    Package Images
                  </Form.Label>
                  <div className="flex flex-col gap-3">
                    <Form.Control
                      type="file"
                      name="packageImages"
                      onChange={handleImageChange}
                      size="sm"
                      id="image"
                      multiple
                    />

                    <Button
                      text="upload"
                      onClick={handleImageUpload}
                      variant="shade"
                    />
                  </div>
                </Form.Group>
              </div>
            </div>

            <Container className="d-flex flex-row mt-4 align-items-center gap-20">
              <div className="mb-6 w-100">
                <MultiSelectDropdown options={TagOptions} label="Add tags" handleChange={(selectedOptions) => handleMultiSelectChange('tags', selectedOptions)}/>
              </div>
              {/* Default Hotel Package Section */}
              <Form.Group className="mb-6 w-100">
                <Form.Label>Default Hotel Package:</Form.Label>
                <SimpleDropdown
                  options={hotelPackageOptions}
                  label="Select Hotel Package"
                  onSelect={(selectedOption) =>
                    handleDropDownChange(
                      "hotelPackageOptions",
                      selectedOption.value
                    )
                  }
                  value={formData.hotelPackageOptions}
                />
              </Form.Group>

              <div className="mb-6 w-100">
                <Form.Label>Price tag:</Form.Label>
                <SimpleDropdown
                  options={priceTagOptions}
                  label="Select Price tag"
                  onSelect={(selectedOption) =>
                    handleDropDownChange("priceTag", selectedOption.value)
                  }
                  value={formData.priceTag}
                />
              </div>
            </Container>
          </Row>
          {/* Theme Section */}
          <div className="flex gap-10 pb-6 mb-3">
            <Form.Group className=" w-100">
              <MultiSelectDropdown options={themeOptions} label="Add themes"  handleChange={(selectedOptions) => handleMultiSelectChange('themes', selectedOptions)}/>
            </Form.Group>
            {/* Initial Amount */}
            <Form.Group className=" w-100">
              <Form.Label>Initial Amount:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter initial amount"
                name="initialAmount"
                onChange={handleInputChange}
                value={formData.initialAmount}
                // onChange={handleInitialAmountChange}
              />
            </Form.Group>
            {/* Default Vehicle Section */}
            <Form.Group className=" w-100">
              <Form.Label>Default Vehicle:</Form.Label>
              <SimpleDropdown
                options={vehicleOptions}
                label="Select default vehicle"
                onSelect={(selectedOption) =>
                  handleDropDownChange("defaultVehicle", selectedOption.value)
                }
                value={formData.defaultVehicle}
              />
            </Form.Group>
          </div>
        </Container>

        <div
          className="flex gap-3 mb-10"
          style={{
            // border: "1px solid #ccc",
            borderTop: "0",
          }}
        >
          <Container className="shadow-md rounded-lg border-gray-300 border-2">
            <div className="mt-6 mb-6 text-lg">Package Places</div>
            <Row className="mb-6">
              <Col>
                <Form.Label>Places Cover</Form.Label>
              </Col>
              <Col>
                <Form.Label>No. of Nights</Form.Label>
              </Col>
              <Col>
                <Form.Label>Place Transfer</Form.Label>
              </Col>
            </Row>
            {packagePlaces.map((place, index) => (
              <Row key={index} className="mb-6">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Places Cover"
                    name="placeCover"
                    value={place.placeCover || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                  />
                  {/* Display search results */}
                  {isDropdownOpen && searchResults.length > 0 && index === activeIndex && (
        <ul ref={dropdownRef} className="list-group mt-1 absolute shadow-lg z-[50] left-[10px] bg-white">
          {searchResults.slice(0, 5).map((result, resultIndex) => (
            <li
              key={result._id}
              className="list-group-item text-sm !border-0"
              onClick={() => handlePlaceSelection(index, result)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  activeSuggestion[index] === resultIndex
                    ? "#f0f0f0"
                    : "transparent",
              }}
              onMouseEnter={() =>
                setActiveSuggestion({
                  ...activeSuggestion,
                  [index]: resultIndex,
                })
              }
              onMouseLeave={() =>
                setActiveSuggestion({
                  ...activeSuggestion,
                  [index]: null,
                })
              }
            >
              {result.placeName}
            </li>
          ))}
        </ul>
      )}
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="No. of Nights"
                    name="nights"
                    value={place.nights || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                  />
                </Col>
                <Col>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Text className="text-muted">Day</Form.Text>
                    <Form.Check
                      type="switch"
                      id={`placeTransfer${index}`}
                      label=""
                      checked={place.transfer}
                      onChange={() => handleDropdownChange(index)}
                    />
                    <Form.Text className="text-muted">Night</Form.Text>
                  </div>
                </Col>
                {index !== packagePlaces.length - 1 && (
                  <Col>
                    <button
                      className="btn btn-danger text-white rounded text-xs"
                      onClick={() => handleRemovePackagePlace(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-trash3-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                      </svg>
                    </button>
                  </Col>
                )}
              </Row>
            ))}
            <div className="d-flex justify-content-between mb-6">
              <Button
                text={`${
                  maxNightsReached + 1 === maxNights ? "Done" : "Add Place"
                }`}
                onClick={
                  maxNightsReached + 1 === maxNights
                    ? handleItenaryBoxes
                    : handleAddPackagePlace
                }
                variant="shade"
                disabled={showIteniraryBoxes}
              />
            </div>
          </Container>
          <Container className="shadow-md rounded-lg border-gray-300 border-2">
            <div className="mt-6 mb-6 text-lg">Package Room Details</div>
            <Form.Group as={Row} className="mb-6">
              <Form.Label column sm={4} style={{ fontSize: "14px" }}>
                Number of Rooms:
              </Form.Label>
              <Col sm={5}>
                <Form.Control
                  as="select"
                  value={numRooms}
                  onChange={handleNumRoomsChange}
                >
                  {[...Array(10).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            {[...Array(numRooms).keys()].map((roomIndex) => (
              <Row key={roomIndex} className="mb-6">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Adults (12+ yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Kids (2-11 yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Infants (0-2 yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
              </Row>
            ))}
          </Container>
        </div>
        {showIteniraryBoxes && (
          <Container
          className="shadow-md rounded-lg "
            style={{
              border: "2px solid #ccc",
            }}
          >
            <h2 className="mb-4 mt-6">Package Itinerary and Locations:</h2>
            {renderItineraryBoxes()}
            {/* <Row className="mt-4 mb-6">
              <Col>
                <button
                  className="btn btn-primary text-white rounded text-xs"
                  onClick={handleAddItineraryDay}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-lg"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                    />
                  </svg>
                </button>
                <button
                  className="btn btn-danger text-white rounded text-xs"
                  onClick={handleRemoveItineraryDay}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </button>
              </Col>
            </Row> */}
          </Container>
        )}
        <div>
        <div className="mt-6 mb-6 text-lg">Package Other Information</div>
      
      <div className="mb-6">
        <h5 className="mt-6 mb-6">Package Description</h5>
        <RichTextInput 
          value={formData.packageDescription}
          onChange={(value) => handleRichTextChange('packageDescription', value)}
        />
      </div>

      <div className="mb-6">
        <h5 className="mt-6 mb-6">Package Inclusions</h5>
        <RichTextInput 
          value={formData.packageInclusions}
          onChange={(value) => handleRichTextChange('packageInclusions', value)}
        />
      </div>

      <div className="mb-6">
        <h5 className="mt-6 mb-6 rounded-lg">Package Exclusions</h5>
        <RichTextInput 
          value={formData.packageExclusions}
          onChange={(value) => handleRichTextChange('packageExclusions', value)}
        />
      </div>
      </div>

        <div className="w-full flex justify-center">
          <Button
            text="Save"
            onClick={handleSubmit}
            variant="primary"
            cssClassesProps="w-[200px] mb-[30px] h-[50px]"
          />
        </div>
      </Form>
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
