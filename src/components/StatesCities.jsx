import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import "../components/Destinations.css";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import Table from "../components/ui-kit/molecules/Table";
import { Icons } from '../icons/index';
import Button from "../components/ui-kit/atoms/Button"

const { EditIcon, DeleteIcon, ArrowLeftIcon } = Icons;

const CountryStates = () => {
  const params = useParams();
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
        setShowModal(false);
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
          `${config.API_HOST}/api/cities/delete/${cityId}`,
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

  const headers = ["City Name", "Actions"];

  const renderRow = (row) => (
    <>
      <td className="px-2 py-4 font-medium text-gray-800">{row.cityName}</td>
    </>
  );

  const renderActions = (row) => (
     <div className="flex gap-4 justify-end items-center">
     <span className="cursor-pointer" onClick={() => handleEditCity(row)}><EditIcon /></span>
     <span className="cursor-pointer" onClick={() => handleDeleteCity(row._id)}><DeleteIcon /></span>
     <span className="cursor-pointer" onClick={() => handleCities(row.cityName)}>Places</span>
   </div>
  );

  return (
    <div className="container destcontainer">
      <h1 className="destinationheading">
        {params?.state.replace("-", " ").toUpperCase()}
      </h1>
      {/* <div className="addstate">
        <button className="btn btn-primary text-white" onClick={handleBack}>
          Back
        </button>
        <button
          className="btn btn-primary text-white ms-2"
          onClick={() => setShowModal(true)}
        >
          Add City
        </button>
      </div> */}
      <div className='addstate flex gap-2 mb-4'>
        <Button variant="secondary" onClick={handleBack} icon={<ArrowLeftIcon />} />
        <Button variant="shade"  onClick={() => setShowModal(true)} text="Add City" />
      </div>

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
        </div>
        <Table headers={headers} data={cities} renderRow={renderRow} renderActions={renderActions} />
      </div>
    </div>
  );
};

export default CountryStates;
