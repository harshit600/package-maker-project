import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap"; // Import modal components
import "../components/Destinations.css";
import { useNavigate } from "react-router-dom";
import config from "../../config";

const CountryStates = () => {
  const params = useParams();
  console.log(params);
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [newCityName, setNewCityName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `${config.API_HOST}/api/cities/getcities/${params?.country}/${params?.state}`
    )
      .then((response) => response.json())
      .then((data) => setCities(data))
      .catch((error) => console.error("Error fetching cities:", error));
  }, [params?.country, params?.state]);

  const handleCities = (cityname) => {
    navigate(`/destinations/${params?.country}/${params?.state}/${cityname}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddCity = async () => {
    if (!newCityName) {
      alert("Please enter a city name.");
      return;
    }

    try {
      const response = await fetch(
        `${config.API_HOST}/api/cities/createcity/${params?.country}/${params?.state}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cityName: newCityName }),
        }
      );

      if (response.ok) {
        const newCity = await response.json();
        setCities((prevCities) => [...prevCities, newCity]);
        setNewCityName("");
        setShowModal(false); // Close the modal after adding a city
        alert("City added successfully!");
      } else {
        alert("Failed to add city. Please try again.");
      }
    } catch (error) {
      console.error("Error adding city:", error);
      alert("An error occurred while adding the city.");
    }
  };

  const handleEditCity = async (city) => {
    const updatedCityName = prompt(
      "Enter the updated city name:",
      city.cityName
    );

    if (updatedCityName) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/cities/edit/${city._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cityName: updatedCityName }),
          }
        );

        if (response.ok) {
          const updatedCity = await response.json();
          setCities((prevCities) =>
            prevCities.map((c) => (c._id === updatedCity._id ? updatedCity : c))
          );
          alert("City updated successfully!");
        } else {
          alert("Failed to update city. Please try again.");
        }
      } catch (error) {
        console.error("Error updating city:", error);
        alert("An error occurred while updating the city.");
      }
    }
  };
 
  const handleDeleteCity = async (cityId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this city?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/country/${params?.country}/${params?.state}/cities/delete/${cityId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setCities((prevCities) => prevCities.filter((c) => c._id !== cityId));
          alert("City deleted successfully!");
        } else {
          alert("Failed to delete city. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting city:", error);
        alert("An error occurred while deleting the city.");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="destinationheading">
        {params?.state.replace("-", " ").toUpperCase()}
      </h1>
      <div className="addstate">
        <button className="btn btn-primary text-white" onClick={handleBack}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
</svg>
        </button>
        <button
          className="btn btn-primary text-white ms-2"
          onClick={() => setShowModal(true)} // Open the modal on button click
        >
          Add City
        </button>
      </div>

      {/* Modal for adding a new city */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New City</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="newCityName">City Name:</label>
          <input
            type="text"
            id="newCityName"
            className="form-control"
            placeholder="Enter city name"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddCity}>
            Add City
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="stateslist">
        <div className="statesadded">
          <h2>Cities</h2>
        </div>
        <table className="table table-bordered table-striped mt-5">
          <thead>
            <tr>
              <th>City Name</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((state) => (
              <tr key={state._id}>
                <td>{state.cityName}</td>
                <td className="text-end">
                  <button
                    className="btn btn-info me-2 text-white"
                    onClick={() => handleEditCity(state)}
                  >
                    {" "}
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
                    onClick={() => handleDeleteCity(state._id)}
                  >
                    {" "}
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
                  <button
                    className="btn btn-primary text-white"
                    onClick={() => handleCities(state.cityName)}
                  >
                    Places
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CountryStates;
