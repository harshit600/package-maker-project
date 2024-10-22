import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, InputGroup, Badge } from "react-bootstrap";
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
import  Button  from './ui-kit/atoms/Button'

const PackageCreation = () => {
  const [showIteniraryBoxes, setShowIteniraryBoxes] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedAmenitiesTags, setSelectedAmenitiesTags] = useState([]);
  const [selectedAminityTag, setSelectedAminityTag] = useState("");
  const [files, setFiles] = useState([]); // Added files state
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedDefaultVehicle, setSelectedDefaultVehicle] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [tripData, setTripData] = useState([{ fromCity: "", toCity: "", day: 0 }]);
  const [dropLocationSearchResults, setDropLocationSearchResults] = useState(
    []
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const [pickupLocationSearchResults, setPickupLocationSearchResults] =
    useState([]);
  const [selectedDefaultHotelPackage, setSelectedDefaultHotelPackage] =
    useState("");
  const [itineraryDays, setItineraryDays] = useState([
    { day: 1, description: "", selectedItinerary: null },
  ]);
  const [packagePlaces, setPackagePlaces] = useState([
    { placeCover: "", nights: 0, transfer: false },
  ]);
  const [numRooms, setNumRooms] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    packageType: "",
    packageCategory: "",
    packageName: "",
    packageImages: [],
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
  });

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
      updatedDays[index].selectedItinerary = selectedItinerary;
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
        const response = await fetch(`${config.API_HOST}/api/itinerary/searchitineraries?search=${itineraryTitle}`);
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
      console.log("Itinerary for", itineraryTitle, ":", itineraryData);
      
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
      console.log("Itinerary for", itineraryTitle, ":", itineraryData);

      setItineraryDays((prevDays) => {
        const updatedDays = [...prevDays];
        if (updatedDays.length > 0) {
          updatedDays[0].selectedItinerary = itineraryData[0]; // Adjust index to match day
        }
        return updatedDays;
      });
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
    }
  };

  fetchItineraryData();

}, [formData.pickupLocation, tripData[0].fromCity]);


useEffect(() => {
  fetchItinerariesForTripData(tripData);
},[tripData])


console.log(itineraryDays)


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
          <div
            className="p-3"
            style={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <h4 className="mb-6">Selected Itinerary Details:</h4>
            <p className="mb-1">
              <strong>Title:</strong> {day.selectedItinerary.itineraryTitle}
            </p>
            <p className="mb-1">
              <strong>Description:</strong>{" "}
              {day.selectedItinerary.itineraryDescription}
            </p>
            <p className="mb-1">
              <strong>City:</strong> {day.selectedItinerary.cityName}
            </p>
            <p className="mb-1">
              <strong>Country:</strong> {day.selectedItinerary.country}
            </p>
            <p className="mb-0">
              <strong>Duration:</strong> {day.selectedItinerary.totalHours}{" "}
              hours
            </p>
            <p className="mb-0">
              <strong>Distance:</strong> {day.selectedItinerary.distance} km
            </p>
            {/* Add more details as needed */}
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form submission or API call here
    console.log(formData);
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

  const handleTagSelection = (e) => {
    setSelectedTag(e.target.value);
  };

  const handleAddTag = () => {
    if (selectedTag && !selectedTags.includes(selectedTag)) {
      const updatedTags = [...selectedTags, selectedTag];
      setSelectedTags(updatedTags);
      setFormData({
        ...formData,
        tags: updatedTags,
      });
      setSelectedTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleAmenitiesTagSelection = (e) => {
    setSelectedAminityTag(e.target.value);
  };

  const handleAddAmenitiesTag = () => {
    if (
      selectedAminityTag &&
      !selectedAmenitiesTags.includes(selectedAminityTag)
    ) {
      setSelectedAmenitiesTags([...selectedAmenitiesTags, selectedAminityTag]);
      setFormData({
        ...formData,
        amenities: [...formData.amenities, selectedAminityTag],
      });
      setSelectedAminityTag("");
    }
  };

  const handleRemoveAmenitiesTag = (tag) => {
    setSelectedAmenitiesTags(selectedAmenitiesTags.filter((t) => t !== tag));
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
      fetch(
        `${config.API_HOST}/api/places/searchplaces?search=${searchString}`
      )
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
    const updatedTripData = [...tripData.slice(0, index), newEntry, ...tripData.slice(index)];
  
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
    if (updatedTripData[updatedTripData.length - 1].fromCity === "" && updatedTripData[updatedTripData.length - 1].toCity === "") {
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

  const handleThemeSelection = (e) => {
    setSelectedTheme(e.target.value);
  };

  const handleAddTheme = () => {
    if (selectedTheme && !selectedThemes.includes(selectedTheme)) {
      const updatedThemes = [...selectedThemes, selectedTheme];
      setSelectedThemes(updatedThemes);
      setFormData({
        ...formData,
        themes: updatedThemes,
      });
      setSelectedTheme("");
    }
  };

  const handleRemoveTheme = (theme) => {
    setSelectedThemes(selectedThemes.filter((t) => t !== theme));
  };

  const handleDefaultVehicleSelection = (e) => {
    setSelectedDefaultVehicle(e.target.value);
    setFormData({
      ...formData,
      defaultVehicle: e.target.value,
    });
  };

  const handleInitialAmountChange = (e) => {
    setInitialAmount(e.target.value);
    setFormData({
      ...formData,
      initialAmount: e.target.value,
    });
  };

  const handleDefaultHotelPackageSelection = (e) => {
    setSelectedDefaultHotelPackage(e.target.value);
    setFormData({
      ...formData,
      defaultHotelPackage: e.target.value,
    });
  };

  const handleCustomizableChange = (e) => {
    const isChecked = e.target.checked;
    setFormData({
      ...formData,
      customizablePackage: isChecked,
    });
  };

  const handlePickupLocationChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickupLocation: value,
    }));

    // Fetch data from the API based on the search query
    fetch(`${config.API_HOST}/api/cities/searchcities?search=${value}`)
      .then((response) => response.json())
      .then((data) => {
        setPickupLocationSearchResults(data.slice(0, 5)); // Limit to maximum 5 results
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const handleSelectSuggestion = (selectedCity) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      pickupLocation: selectedCity.cityName,
    }));

    // addTripEntry(selectedCity.cityName)
    setPickupLocationSearchResults([]); // Clear search results after selection
  };

  const handleDropLocationChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropLocation: value,
    }));

    // Fetch data from the API based on the search query
    fetch(`${config.API_HOST}/api/cities/searchcities?search=${value}`)
      .then((response) => response.json())
      .then((data) => {
        setDropLocationSearchResults(data.slice(0, 5)); // Limit to maximum 5 results
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
      });
  };

  const handleSelectDropLocationSuggestion = (selectedCity) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dropLocation: selectedCity.cityName,
    }));
    const lastEntryIndex = tripData.length - 1;
    if (lastEntryIndex >= 0) {
        const updatedTripData = [...tripData];
        updatedTripData[lastEntryIndex].toCity = selectedCity.cityName;
        setTripData(updatedTripData);
    }

    setDropLocationSearchResults([]); // Clear search results after selection
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Top bar */}
      <div
       className="bg-gray-100 rounded p-2 text-xl font-semibold mb-2"
      >
        Edit Package
      </div>

      {/* Basic Information section */}

      {/* <div className="mt-6 mb-6 text-lg font-semibold ">Basic Information</div> */}
      <Form onSubmit={handleSubmit}>
        <Container
          style={{
            paddingTop: "10px",
            // border: "1px solid #ccc",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          }}
        >
          <Row className="mb-6">
            <Form.Group as={Col} id="packageType">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Type
              </Form.Label>
              <Form.Select
                name="packageType"
                onChange={handleInputChange}
                value={formData.packageType}
                size="sm"
              >
                <option value="">Select Type</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Group">Group</option>
                <option value="Couple">Couple (Casual Trip)</option>
                {/* Add more options here */}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} id="packageCategory">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Category
              </Form.Label>
              <Form.Select
                name="packageCategory"
                onChange={handleInputChange}
                value={formData.packageCategory}
                size="sm"
              >
                <option value="">Select Category</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Group">Group</option>
                <option value="Couple">Couple (Casual Trip)</option>
                {/* Add more options here */}
              </Form.Select>
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
                size="sm"
              />
            </Form.Group>
          </Row>
          <Row className="mb-6">
            <Form.Group as={Col} id="duration">
              <Form.Label style={{ fontSize: "smaller" }}>
                Duration (Days)
              </Form.Label>
              <Form.Select
                name="duration"
                onChange={handleInputChange}
                value={formData.duration}
                size="sm"
              >
                <option value="">Select Duration</option>
                <option value="2D/1N">2D/1N</option>
                <option value="3D/2N">3D/2N</option>
                <option value="4D/3N">4D/3N</option>
                <option value="5D/4N">5D/4N</option>
                <option value="6D/5N">6D/5N</option>
                <option value="7D/6N">7D/6N</option>
                <option value="8D/7N">8D/7N</option>
                <option value="9D/8N">9D/8N</option>
                <option value="10D/9N">10D/9N</option>
                <option value="11D/10N">11D/10N</option>

                {/* Add more options here */}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} id="status">
              <Form.Label style={{ fontSize: "smaller" }}>Status</Form.Label>
              <Form.Select
                name="status"
                onChange={handleInputChange}
                value={formData.status}
                size="sm"
              >
                <option value="">Select Status</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} id="displayOrder">
              <Form.Label style={{ fontSize: "smaller" }}>
                Display Order
              </Form.Label>
              <Form.Control
                type="number"
                name="displayOrder"
                onChange={handleInputChange}
                value={formData.displayOrder}
                size="sm"
              />
              <Form.Text className="text-muted text-xs">
                1 is Highest and 100 is Lowest
              </Form.Text>
            </Form.Group>
            <Form.Group as={Col} id="hotelCategory">
              <Form.Label style={{ fontSize: "smaller" }}>
                Hotel Category
              </Form.Label>
              <Form.Select
                name="hotelCategory"
                onChange={handleInputChange}
                value={formData.hotelCategory}
                size="sm"
              >
                <option value="">Select Hotel Category</option>
                <option value="Standard">Standard</option>
                <option value="Delux">Deluxe</option>
                <option value="3 star">3 star</option>
                <option value="4 star">4 star</option>
                <option value="5 star">5 star</option>
                {/* Add more options here */}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className="mb-6">
            <Form.Group as={Col} id="pickupLocation">
              <Form.Label style={{ fontSize: "smaller" }}>
                Pickup Location
              </Form.Label>
              {/* Use input for search */}
              <input
                type="text"
                name="pickupLocation"
                className="form-control form-control-sm"
                onChange={handlePickupLocationChange}
                value={formData.pickupLocation}
                placeholder="Search Pickup Location"
              />
              {/* Display search suggestions */}
              {pickupLocationSearchResults.length > 0 && (
                <ul className="list-group mt-1">
                  {pickupLocationSearchResults.map((city) => (
                    <li
                      key={city._id}
                      className="list-group-item"
                      onClick={() => handleSelectSuggestion(city)}
                      style={{ cursor: "pointer" }}
                    >
                      {city.cityName}
                    </li>
                  ))}
                </ul>
              )}
            </Form.Group>
            <Form.Group as={Col} id="pickupTransfer">
              <Form.Label style={{ fontSize: "smaller" }}>
                Pickup Transfer
              </Form.Label>
              <div className="flex align-center gap-2">
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
              <input
                type="text"
                name="dropLocation"
                className="form-control form-control-sm"
                onChange={handleDropLocationChange}
                value={formData.dropLocation}
                placeholder="Search Drop Location"
              />
              {/* Display search suggestions */}
              {dropLocationSearchResults.length > 0 && (
                <ul className="list-group mt-1">
                  {dropLocationSearchResults.map((city) => (
                    <li
                      key={city._id}
                      className="list-group-item"
                      onClick={() => handleSelectDropLocationSuggestion(city)}
                      style={{ cursor: "pointer" }}
                    >
                      {city.cityName}
                    </li>
                  ))}
                </ul>
              )}
            </Form.Group>
          </Row>
          <Row className="mb-6">
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
              <Form.Select
                name="tourBy"
                onChange={handleInputChange}
                value={formData.tourBy}
                size="sm"
              >
                <option value="">Select Tour By</option>
                <option value="volvo">Volvo</option>
                <option value="taxi/cab">Taxi/Cab</option>
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} id="agentPackage">
              <Form.Label style={{ fontSize: "smaller" }}>
                Agent Package
              </Form.Label>
              <Form.Select
                name="agentPackage"
                onChange={handleInputChange}
                value={formData.agentPackage}
                size="sm"
              >
                <option value="">Select Agent Package</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Form.Select>
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
                <InputGroup style={{ width: "50%", borderRadius:'8px' }}>
                  <Form.Label style={{ fontSize: "smaller" }}>
                    Amenities:
                  </Form.Label>
                  <Form.Select
                    value={selectedAminityTag}
                    onChange={handleAmenitiesTagSelection}
                    aria-label="Select tag"
                    style={{ borderRadius:'8px' }}
                  >
                    <option value="">Select tag</option>
                    <option value="Meals">Meals</option>
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Cab">Cab</option>
                    <option value="Hotel">Hotel</option>
                  </Form.Select>
                  
                  <Button 
                  text="Add"
                  id="add-tag"
                  variant="shade"
                  onClick={handleAddAmenitiesTag}
                  cssClassesProps="ml-2"
                  />
                  <div className="mb-6 mt-2 w-100">
                    {selectedAmenitiesTags.map((tag, index) => (
                      <Badge
                        variant="secondary"
                        key={index}
                        // bg="secondary"
                        className="me-2 mb-2 tag-badge"
                        onClick={() => handleRemoveAmenitiesTag(tag)}
                      >
                        {tag}
                        <span aria-hidden="true" style={{ marginLeft: "5px" }}>
                          &times;
                        </span>
                      </Badge>
                    ))}
                  </div>
                </InputGroup>
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
                <Form.Label style={{ fontSize: "smaller" }}>
                  Add Tags:
                </Form.Label>
                <InputGroup>
                  <Form.Select
                    value={selectedTag}
                    onChange={handleTagSelection}
                    aria-label="Select tag"
                  >
                    <option value="">Select tag</option>
                    <option value="Women Special">Women Special</option>
                    <option value="Couple Friendly">Couple Friendly</option>
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Old Aged">Old Aged</option>
                  </Form.Select>
                
                  <Button
                  text="Add"
                  id="add-tag"
                    onClick={handleAddTag}
                    variant="shade"
                    />
                </InputGroup>
                <div className="mb-6 mt-1 w-100">
                  {selectedTags.map((tag, index) => (
                    <Badge
                      variant="secondary"
                      key={index}
                      // bg="secondary"
                      className="me-2 mb-2 tag-badge"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <span aria-hidden="true">&times;</span>
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Default Hotel Package Section */}
              <Form.Group className="w-100">
                <Form.Label>Default Hotel Package:</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedDefaultHotelPackage}
                  onChange={handleDefaultHotelPackageSelection}
                >
                  <option value="">Select hotel package</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="3star">3 Star</option>
                  <option value="4star">4 Star</option>
                  <option value="5star">5 Star</option>
                </Form.Control>
              </Form.Group>

              <div className="mb-6 w-100">
                <Form.Label style={{ fontSize: "smaller" }}>
                  Price tag:
                </Form.Label>
                <InputGroup>
                  <Form.Select aria-label="Select price tag">
                    <option value="">Select price tag</option>
                    <option value="Per Person">Per Person</option>
                    <option value="Family (4)">Family (4)</option>
                    <option value="Couple">Couple</option>
                  </Form.Select>
                </InputGroup>
              </div>
            </Container>
          </Row>
          {/* Theme Section */}
          <div className="flex gap-10">
            <Form.Group className=" w-100">
              <Form.Label>Themes:</Form.Label>
              <Row>
                <Col xs={8}>
                  <Form.Control
                    as="select"
                    value={selectedTheme}
                    onChange={handleThemeSelection}
                  >
                    <option value="">Select theme</option>
                    <option value="holiday">Holiday</option>
                    <option value="weekend">Weekend</option>
                    <option value="heritage">Heritage</option>
                    {/* Add more options here */}
                  </Form.Control>
                </Col>
                <Col xs={1}>
                  
                  <Button 
                  text="Add"
                  id="add-tag"
                    onClick={handleAddTheme}
                    variant="shade"
                    />
                </Col>
              </Row>
              <Row>
                <div className="mb-6  w-100">
                  {selectedThemes.map((theme, index) => (
                    <Badge
                      variant="secondary"
                      key={index}
                      className="me-2 mb-2 tag-badge"
                      onClick={() => handleRemoveTheme(theme)}
                    >
                      {theme}
                      <span aria-hidden="true">&times;</span>
                    </Badge>
                  ))}
                </div>
              </Row>
            </Form.Group>
            {/* Initial Amount */}
            <Form.Group className=" w-100">
              <Form.Label>Initial Amount:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter initial amount"
                value={initialAmount}
                onChange={handleInitialAmountChange}
              />
            </Form.Group>
            {/* Default Vehicle Section */}
            <Form.Group className=" w-100">
              <Form.Label>Default Vehicle:</Form.Label>
              <Form.Control
                as="select"
                value={selectedDefaultVehicle}
                onChange={handleDefaultVehicleSelection}
              >
                <option value="">Select vehicle</option>
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="sedan_premium">Sedan Premium</option>
                <option value="suv">SUV</option>
                <option value="suv_premium">SUV Premium</option>
                <option value="traveller">Traveller</option>
              </Form.Control>
            </Form.Group>
          </div>
        </Container>

        <div
          className="flex mb-10"
          style={{
            border: "1px solid #ccc",
            borderTop: "0",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          }}
        >
          <Container style={{ borderRight: "1px solid #ccc" }}>
            <div className="mt-6 mb-6 text-lg">Package Places</div>
            <Row className="mb-6">
              <Col>
                <Form.Label>
                  Places Cover
                </Form.Label>
              </Col>
              <Col>
                <Form.Label>
                  No. of Nights
                </Form.Label>
              </Col>
              <Col>
                <Form.Label>
                  Place Transfer
                </Form.Label>
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
                  {searchResults.length > 0 && index === activeIndex && (
                    <ul className="list-group mt-1">
                      {searchResults.map((result, resultIndex) => (
                        <li
                          key={result._id}
                          className="list-group-item"
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
              {maxNightsReached + 1 === maxNights ? (
                <button
                  className="btn btn-primary text-white rounded text-xs"
                  onClick={handleItenaryBoxes}
                >
                  Done
                </button>
              ) : (
                <button
                  className="btn btn-primary text-white rounded text-xs"
                  onClick={handleAddPackagePlace}
                >
                  Add Place
                </button>
              )}
            </div>
          </Container>
          <Container>
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
            style={{
              border: "1px solid #ccc",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
            }}
          >
            <h2 className="mb-4 mt-6">Package Itinerary and Locations:</h2>
            {renderItineraryBoxes()}
            <Row className="mt-4 mb-6">
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
                    class="bi bi-plus-lg"
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
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </button>
              </Col>
            </Row>
          </Container>
        )}
        <div>
          <div className="mt-6 mb-6 text-lg">Package Other Information</div>
          <div className="mb-6">
            <h5 className="mt-6 mb-6">Package Description</h5>
            <RichTextInput />
          </div>
          <div className="mb-6">
            <h5 className="mt-6 mb-6">Package Inclusions</h5>
            <RichTextInput />
          </div>
          <div className="mb-6">
            <h5 className="mt-6 mb-6">Package Exclusions</h5>
            <RichTextInput />
          </div>
        </div>

        <button
          className="btn btn-primary rounded mt-10 mb-10 text-white"
          onClick={handleSubmit}
        >
          Save
        </button>
      </Form>
    </div>
  );
};

const RichTextInput = () => {
  // Quill modules and formats configuration
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

  // Custom styles for the editor
  const editorStyle = {
    height: "200px", // Set your desired height here
    paddingBottom: "50px",
  };

  return (
    <ReactQuill
      theme="snow" // 'snow' for light theme
      modules={modules}
      placeholder="Write something..."
      style={editorStyle}
    />
  );
};

export default PackageCreation;
