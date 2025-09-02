import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, Modal } from "react-bootstrap";
import { Pagination } from "react-bootstrap";
import { BeatLoader } from "react-spinners";
import SideBar from "../components/SideBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table } from "react-bootstrap";
import config from "../../config";
import ItMultiSelectDropdown from "../components/ui-kit/atoms/ItMultiSelectDropDown";

const ItineraryMaster = () => {
  const [selectedOption, setSelectedOption] = useState("sightseeing");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isEditMode, setIsEditMode] = useState("");
  const [placesOptions, setPlacesOptions] = useState([]);
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

  const [showModal, setShowModal] = useState(false);

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
    setShowModal(!showModal);
    setIsEditMode(false);
  };

  useEffect(() => {
    // Reset form data to default values when the component mounts
    setFormData({
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
  }, [isEditMode]);

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
      const options = newData.map((place) => place.placeName);
      setPlacesOptions(options);
      setPlaces((prevPlaces) => [...prevPlaces, ...newData]);
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

  const handleCityAreaChange = (selectedOptions) => {
    setCloseDropdown(true);
    setSearchInput(selectedOptions);
    const filteredResults = places.filter((place) =>
      place.placeName.toLowerCase().includes(selectedOptions[0].toLowerCase())
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
    setSelectedCity(city);
    setSelectedPlace(""); // Reset selected place when city changes
    setFormData({
      ...formData,
      cityName: city, // Set city name when city changes
    });
    fetchPlaces(selectedCountry, city);
  };

  useEffect(() => {
    setFormData({
      ...formData,
      cityArea: placesOptions, // Save selected places as an array
    });
  }, [placesOptions]);

  const handleRemovePlace = (placeIndex) => {
    const updatedPlaces = [...selectedPlaces];
    updatedPlaces.splice(placeIndex, 1);
    setSelectedPlaces(updatedPlaces);
    setFormData({
      ...formData,
      cityArea: [...updatedPlaces],
    });
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
    // Set the form to show first (optional)
    setShowModal(true);
    setIsEditMode(id);

    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/getitinerary/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch itinerary data");
      }
      const data = await response.json();

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
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
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
      <div className="itediv">
        <div
          className="mt-2 flex justify-between p-4 mb-4 rounded-lg shadow-lg"
          style={{
            background: "rgb(45 45 68)",
            borderLeft: "4px solid #4f46e5",
            borderRight: "4px solid #4f46e5",
          }}
        >
          <div
            className="itelogo"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-map mr-2"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"
              />
            </svg>
            Itinerary Management
          </div>
          <button
            className="add-button"
            onClick={toggleForm}
            style={{
              background: "#4f46e5",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              cursor: "pointer",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-plus-circle"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Add Itinerary
          </button>
        </div>

        <Modal
          show={showModal}
          onHide={toggleForm}
          dialogClassName="modal-xl"
          style={{
            "--bs-modal-width": "70%",
          }}
        >
          <Modal.Header
            closeButton
            style={{
              background: "rgb(45 45 68)", // Dark blue/gray background
              borderBottom: "1px solid #dee2e6",
              color: "white", // Adding white text color for better contrast
            }}
          >
            <Modal.Title>Add Itinerary</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <div>
                <div className="row mb-3 mt-3">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Select Itinerary Type:</Form.Label>
                      <Form.Select
                        name="itineraryType"
                        value={formData.itineraryType}
                        onChange={handleOptionChange}
                      >
                        <option value="sightseeing">Sightseeing</option>
                        <option value="travel">Travel</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
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
                  </div>
                </div>

                <div className="row mb-3 mt-3">
                  <div className="col-md-6">
                    <Form.Group>
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
                  </div>
                  <div
                    className="col-md-6"
                    style={{
                      display: selectedOption === "travel" ? "block" : "none",
                    }}
                  >
                    <Form.Group>
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
                  </div>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>City Places:</Form.Label>
                <ItMultiSelectDropdown
                  options={placesOptions}
                  // label="City Places"
                  page="itenirary"
                  handleChange={(selectedOptions) =>
                    handleCityAreaChange(selectedOptions)
                  }
                  value={placesOptions}
                />
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
          </Modal.Body>
        </Modal>

        <div
          className="filters-wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "20px",
            marginBottom: "24px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* All Deals Dropdown */}
          <div className="filter-item" style={{ minWidth: "160px" }}>
            <Form.Select
              name="searchByType"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                backgroundColor: "white",
                cursor: "pointer",
                color: "#4a5568",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                height: "42px",
                width: "100%",
              }}
            >
              <option value="">All Deals</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="travel">Travel</option>
            </Form.Select>
          </div>

       
          {/* Search by City */}
          <div
            className="filter-item"
            style={{
              position: "relative",
              minWidth: "160px",
            }}
          >
            <Form.Control
              type="text"
              placeholder="Search by City"
              value={cityFilter}
              onChange={handleCityFilterChange}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px",
                width: "100%",
                backgroundColor: "white",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                height: "42px",
                color: "#4a5568",
              }}
            />
          </div>
        </div>

        <div className="table-container">
          <Table className="itentable" hover>
            <thead>
              <tr
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  City Name
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  City Area
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Itinerary Title
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Itinerary Description
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Total Hours
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Distance
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "15px",
                    color: "#6b7280",
                    fontWeight: "500",
                    fontSize: "14px",
                    textTransform: "uppercase",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, index) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    backgroundColor:
                      index % 2 === 0 ? "#ffffff" : "rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <td
                    style={{
                      padding: "15px",
                      color: "#111827",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {item.cityName}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                    className="woverflow ellipse"
                  >
                    {item.cityArea.join(", ")}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {item.itineraryTitle}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                    className="ellipse"
                  >
                    {item.itineraryDescription}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {item.itineraryType}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {item.totalHours} mins
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {item.distance} kms
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          item.status === "enabled" ? "#dcfce7" : "#fee2e2",
                        color:
                          item.status === "enabled" ? "#166534" : "#991b1b",
                        fontSize: "12px",
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }} className="flex gap-2">
                    <span
                      onClick={() => handleEdit(item._id)}
                      className="cursor-pointer p-2"
                      style={{
                        color: "#4f46e5",
                        transition: "color 0.2s",
                      }}
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
                    </span>
                    <span
                      className="cursor-pointer p-2"
                      onClick={() => handleDelete(item._id)}
                      style={{
                        color: "#ef4444",
                        transition: "color 0.2s",
                      }}
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
                    </span>
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
              {Array.from(
                { length: Math.ceil(filteredItineraryData.length / perPage) },
                (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === page}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                )
              )}
              {filteredItineraryData.length > perPage && (
                <Pagination.Next
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    page === Math.ceil(filteredItineraryData.length / perPage)
                  }
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
