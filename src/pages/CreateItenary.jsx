import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { Pagination } from "react-bootstrap";
import { BeatLoader } from "react-spinners";
import SideBar from "../components/SideBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table } from "react-bootstrap";
import config from "../../config";

const ItineraryMaster = () => {
  const [selectedOption, setSelectedOption] = useState("sightseeing");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isEditMode, setIsEditMode] = useState("");
  const [formData, setFormData] = useState({
    cityName: "",
    cityArea: [],
    country: "",
    itineraryType: "sightseeing", // Default to sightseeing
    itineraryTitle: "",
    itineraryDescription: "",
    specialNotes: "",
    totalHours: "",
    distance: "",
    connectingCity: "", // New field for connecting city
    status: "enabled",
  });

  const [filteredCities, setFilteredCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [connectingCity, setConnectingCity] = useState("");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [closeDropdown, setCloseDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [itineraryData, setItineraryData] = useState([]);
  const [page, setPage] = useState(1); // Current page
  const [perPage] = useState(10);

   // Handle page change
   const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  useEffect(() => {
    fetchItineraryData();
  }, []);

  const fetchItineraryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/itinerary`
      );
      const data = await response.json();
      setItineraryData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setIsEditMode(false); 
   
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setCloseDropdown(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchAllCities();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/country/getcountries`
      );
      const data = await response.json();
      setCountries(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching countries:", error);
    }
  };

  const fetchAllCities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/cities/getallcities`
      );
      const data = await response.json();
      setCities(data);
      setFilteredCities(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    // Filter cities based on search input
    const filtered = cities.filter((city) =>
      city.cityName.toLowerCase().includes(cityFilter.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [cityFilter]);

  const fetchCities = async (country) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/cities/getcities/${country}`
      );
      const data = await response.json();
      setCities(data);
      setFilteredCities(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching cities:", error);
    }
  };

  const fetchPlaces = async (country, city) => {
    setLoading(true);
    try {
        const response = await fetch(
            `${config.API_HOST}/api/places/getallplaces/${country}/${city}`
        );
        const newData = await response.json();
        // Merge new data with existing places
        setPlaces(prevPlaces => [...prevPlaces, ...newData]);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error("Error fetching places:", error);
    }
};


  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  const filteredItineraryData = itineraryData.filter((item) => {
    if (typeFilter === "sightseeing") {
      return item.itineraryType === "sightseeing";
    } else if (typeFilter === "travel") {
      return item.itineraryType === "travel";
    } else {
      return true; // Show all when no filter is selected
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = "";
      let method = ""; 
  
      if (isEditMode) {
        // Editing existing itinerary
        url = `${config.API_HOST}/api/itinerary/updateitinerary/${isEditMode}`;
        method = "PUT"; // Use PUT for updating
      } else {
        // Adding new itinerary
        url = `${config.API_HOST}/api/itinerary/additinerary`;
        method = "POST"; // Use POST for adding
      }
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit itinerary");
      }

      window.location.reload();
      // Reset form data
      setFormData({
        cityName: "",
        cityArea: [],
        itineraryType: "sightseeing",
        itineraryTitle: "",
        itineraryDescription: "",
        specialNotes: "",
        totalHours: "",
        distance: "",
        connectingCity: "",
        status: "enabled",
      });
      setSelectedCountry("");
      setSelectedCity("");
      setConnectingCity("");
      setSelectedPlaces([]);
  
      // Handle successful response
      if (formData._id) {
        // Editing existing itinerary
        toast.success("Itinerary has been updated successfully!");
      } else {
        // Adding new itinerary
        toast.success("Itinerary has been added successfully!");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error submitting itinerary:", error.message);
      setLoading(false);
    }
  };
  
  
  const handleOptionChange = (e) => {
    setLoading(true); // Show loader when switching
    setSelectedOption(e.target.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      itineraryType: e.target.value,
    }));
    if (e.target.value === "travel") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        cityName: "",
      }));
    }
    setTimeout(() => {
      setLoading(false); // Hide loader after 0.5 seconds
    }, 500);
  };

  const handleInputChange = (e) => {
    const city = e.target.value;
    setConnectingCity(city);
    setSelectedPlace(""); // Reset selected place when city changes
    setFormData({
      ...formData,
      connectingCity: city, // Set city name when city changes
    });
    fetchPlaces(selectedCountry, city);
  };

  const handleTitleChange = (e) => {
    setFormData({
      ...formData,
      itineraryTitle: e.target.value,
    });
  };

  const handleCityAreaChange = (e) => {
    setCloseDropdown(true);
    setSearchInput(e.target.value);
    const filteredResults = places.filter((place) =>
      place.placeName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedCity(""); // Reset selected city when country changes
    setFormData({
      ...formData,
      country: country, // Reset city name when country changes
      cityName: "",
    });
    fetchCities(country);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    console.log(city)
    setSelectedCity(city);
    setSelectedPlace(""); // Reset selected place when city changes
    setFormData({
      ...formData,
      cityName: city, // Set city name when city changes
    });
    fetchPlaces(selectedCountry, city);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlaces([...selectedPlaces, place.placeName]);
    setFormData({
      ...formData,
      cityArea: [...selectedPlaces, place.placeName], // Save selected places as an array
    });
    setSearchInput("");
  };

  const handleRemovePlace = (placeIndex) => {
    const updatedPlaces = [...selectedPlaces];
    updatedPlaces.splice(placeIndex, 1);
    setSelectedPlaces(updatedPlaces);
    setFormData({
      ...formData,
      cityArea: [...updatedPlaces]
    })
  };

  const handleDescriptionChange = (e) => {
    setFormData({
      ...formData,
      itineraryDescription: e.target.value,
    });
  };

  const handleNotesChange = (e) => {
    setFormData({
      ...formData,
      specialNotes: e.target.value,
    });
  };

  const handleHoursChange = (e) => {
    setFormData({
      ...formData,
      totalHours: e.target.value,
    });
  };

  const handleDistanceChange = (e) => {
    setFormData({
      ...formData,
      distance: e.target.value,
    });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      status: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    // Implement delete functionality here
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/deleteitinerary/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete itinerary");
      }

      // Remove the deleted itinerary from the state
      setItineraryData((prevData) =>
        prevData.filter((item) => item._id !== id)
      );

      toast.success("Itinerary deleted successfully!");
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      toast.error("Failed to delete itinerary");
    }
  };

  const handleEdit = async (id) => {
    setShowForm(true);
    setIsEditMode(id);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/getitinerary/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch itinerary data");
      }
      const data = await response.json();

      console.log(data)

      fetchCities(data?.country);
      setSelectedCountry(data.country);
      setConnectingCity(data?.connectingCity);
      setSelectedCity(data.cityName);
      setSelectedOption(data.itineraryType);
      setSearchResults(data.cityArea);
      setSelectedPlaces(data.cityArea); // Set selected places with city area data
      fetchPlaces(data?.country, data?.cityName);
      fetchPlaces(data?.country, data?.connectingCity);
      setFormData({
        ...formData,
        // Populate other form fields with data retrieved from the API
        cityName: data.cityName,
        country: data.country,
        connectingCity: data?.connectingCity,
        cityArea: data.cityArea,
        itineraryTitle: data.itineraryTitle,
        itineraryType: data.itineraryType,
        itineraryDescription: data.itineraryDescription,
        specialNotes: data.specialNotes,
        totalHours: data.totalHours,
        distance: data.distance,
        status: data.status,
      });
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
      // Handle error
    }
  };

  const handleCityClick = async (cityName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/citybasis/${cityName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch itinerary data");
      }
      const data = await response.json();
      setItineraryData(data);
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
    } finally {
      setLoading(false);
      setCityFilter("");
    }
  };

  const handleCityFilterChange = (e) => {
    const value = e.target.value;
    setCityFilter(value);
    const filtered = cities.filter((city) =>
      city.cityName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCities(filtered);
  };

    // Calculate start and end index of items to display
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, filteredItineraryData.length);
  
    // Slice the data array to get items for the current page
    const currentPageData = filteredItineraryData.slice(startIndex, endIndex);
  

  return (
    <div className="container flexitdest">
      <div className="sidebarpluto">
        <SideBar />
      </div>
      <div className="itediv">
        <div className="itenavbar">
          <div className="itelogo">Itinerary</div>
          <button className="add-button" onClick={toggleForm}>
            {showForm ? "Close Form" : "Add Itinerary"}
          </button>
        </div>
        {showForm ? (
          <div className="itenbox">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3 mt-3">
                <Form.Label>Select Itinerary Type:</Form.Label>
                <Form.Select
                  name="itineraryType"
                  value={selectedOption}
                  onChange={handleOptionChange}
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="travel">Travel</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3 mt-3">
                <Form.Label>Select Country:</Form.Label>
                <Form.Select
                  className="form-select"
                  name="selectedCountry"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country._id} value={country.countryName}>
                      {country.countryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 mt-3">
                <Form.Label>Select City:</Form.Label>
                <Form.Select
                  className="form-select"
                  name="selectedCity"
                  value={selectedCity}
                  onChange={handleCityChange}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city.cityName}>
                      {city.cityName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group
                className="mb-3 mt-3"
                style={{
                  display: selectedOption === "travel" ? "block" : "none",
                  transition: "display 1s ease",
                }}
              >
                <Form.Label>Select Connecting City:</Form.Label>
                <Form.Select
                  className="form-select"
                  name="connectingCity"
                  value={connectingCity}
                  onChange={handleInputChange}
                >
                  <option value="">Select Connecting City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city.cityName}>
                      {city.cityName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Select City Places:</Form.Label>
                <div ref={dropdownRef} className="search-input-container">
                  {/* Selected places */}
                  <div className="selected-places">
                    {selectedPlaces.map((place, index) => (
                      <span key={index} className="selected-place">
                        {place}
                        <span
                          className="remove-place"
                          onClick={() => handleRemovePlace(index)}
                        >
                          &times;
                        </span>
                      </span>
                    ))}
                  </div>

                  <Form.Control
                    type="text"
                    placeholder="Search City Places"
                    value={searchInput}
                    onChange={handleCityAreaChange}
                  />
                  {/* Suggestions dropdown */}
                  {closeDropdown && searchResults.length > 0 && (
                    <ul className="suggestions-list">
                      {searchResults.map((place) => (
                        <li
                          key={place._id}
                          onClick={() => handlePlaceSelect(place)}
                        >
                          {place.placeName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Itinerary Title:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Itinerary Title"
                    id="itineraryTitleInput"
                    name="itineraryTitle"
                    value={formData.itineraryTitle}
                    onChange={handleTitleChange}
                  />
                </Col>
                <Col>
                  <Form.Label>Itinerary Description:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Itinerary Description"
                    name="itineraryDescription"
                    value={formData.itineraryDescription}
                    onChange={handleDescriptionChange}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Special Note:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Special Notes"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleNotesChange}
                  />
                </Col>
                <Col className="infoflex">
                  <Form.Label>total hours:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Total Hours"
                    name="totalHours"
                    value={formData.totalHours}
                    onChange={handleHoursChange}
                  />
                  <span className="infospan">Mins</span>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col className="infoflex">
                  <Form.Label>Itinerary Distance:</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleDistanceChange}
                  />
                  <span className="infospan">kms</span>
                </Col>
                <Col className="infoflex">
                  <Form.Label>Status:</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </Form.Select>
                </Col>
              </Row>

              <Button className="mb-10" variant="primary" type="submit">
                Submit
              </Button>
            </Form>
            {loading && (
              <div className="loader">
                <BeatLoader color="#36d7b7" loading={true} />
              </div>
            )}
          </div>
        ) : (
          ""
        )}

        <div className="table-container">
          <h2 className="mt-10 mb-10 text-center">Itinerary List</h2>
          <div className="filter-container flex gap-1">
            <div className="filter-item search-container">
              <Form.Group className="mb-3 mt-3">
                <Form.Control
                  type="text"
                  placeholder="Search by City"
                  value={cityFilter}
                  onChange={handleCityFilterChange}
                  style={{ maxWidth: "200px" }}
                />
              </Form.Group>

              <div className="cityitemdiv">
                {cityFilter && (
                  <div className="city-list">
                    {filteredCities.map((city) => (
                      <div
                        key={city._id}
                        className="city-item"
                        onClick={() => handleCityClick(city.cityName)}
                      >
                        {city.cityName}
                      </div>
                    ))}
                    {filteredCities.length < 1 ? (
                      <div className="city-item">No results found!</div>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="filter-container">
          <Form.Group className="mb-3 mt-3">
            <Form.Select
              name="searchByType"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              style={{ maxWidth: "200px" }}
            >
              <option value="">All</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="travel">Travel</option>
            </Form.Select>
          </Form.Group>
        </div>
          </div>

          <Table className="itentable" striped bordered hover>
            <thead>
              <tr>
                <th>City Name</th>
                <th>City Area</th>
                <th>Itinerary Title</th>
                <th>Itinerary Description</th>
                <th>Type</th>
                <th>Total Hours</th>
                <th>Distance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item) => (
                <tr key={item._id}>
                  <td>{item.cityName}</td>
                  <td className="woverflow ellipse">{item.cityArea.join(", ")}</td>
                  <td>{item.itineraryTitle}</td>
                  <td className="ellipse" >{item.itineraryDescription}</td>
                  <td>{item.itineraryType}</td>
                  <td>{item.totalHours}</td>
                  <td>{item.distance}</td>
                  <td>{item.status}</td>
                  <td className="flex text-end">
                    {/* ... (previous buttons) */}
                    <button
                      className="btn btn-info me-2 text-white"
                      onClick={() => handleEdit(item._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-pencil-square"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                        <path
                          fillRule="evenodd"
                          d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                        />
                      </svg>
                    </button>
                    <button
                      className="btn btn-danger me-2 text-white"
                      onClick={() => handleDelete(item._id)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
        <div className="pagination mb-20 mt-10 text-center flex align-center justify-center">
        <Pagination>
                {filteredItineraryData.length > perPage && (
                  <Pagination.Prev
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  />
                )}
                {Array.from({ length: Math.ceil(filteredItineraryData.length / perPage) }, (_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === page} onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
                {filteredItineraryData.length > perPage && (
                  <Pagination.Next
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === Math.ceil(filteredItineraryData.length / perPage)}
                  />
                )}
              </Pagination>
        </div>
        </div>
        {loading && (
              <div className="loader">
                <BeatLoader color="#36d7b7" loading={true} />
              </div>
            )}
      </div>
    </div>
  );
};

export default ItineraryMaster;
