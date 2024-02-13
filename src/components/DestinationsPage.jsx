import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import "../components/Destinations.css";
import CountriesForm from "./CountriesForm";
import config from "../../config";

const DestinationPage = () => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ countryName: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    fetch(`${config.API_HOST}/api/country/getcountries`)
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) => console.error("Error fetching countries:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleViewStates = (country) => {
    navigate(`/destinations/${country?.countryName}`);
  };

  const handleEdit = (country) => {
    setFormData({ ...country }); // Copy all properties from the country object
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (countryId) => {
    // Handle delete logic
    console.log(`Deleting country with ID: ${countryId}`);
  };

  const handleAddCountry = () => {
    setFormData({ countryName: "" });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ countryName: "" });
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      const url = isEditMode
        ? `${config.API_HOST}/api/country/editcountry/${formData._id}`
        : `${config.API_HOST}/api/country/addcountry`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCountry = await response.json();
        setCountries((prevCountries) =>
          isEditMode
            ? prevCountries.map((c) =>
                c._id === updatedCountry._id ? updatedCountry : c
              )
            : [...prevCountries, updatedCountry]
        );
        handleCloseModal();
        alert(isEditMode ? "Country updated successfully!" : "Country added successfully!");
      } else {
        alert("Failed to save country. Please try again.");
      }
    } catch (error) {
      console.error("Error saving country:", error);
      alert("An error occurred while saving the country.");
    }
  };

  return (
    <div className="container destcontainer">
      <h1 className="destinationheading">Destinations</h1>
      <div className="addcountry">
        <button
          className="btn addcountrybtn btn btn-primary me-2 text-white"
          onClick={handleAddCountry}
        >
          Add new Country
        </button>
      </div>
      <div className="countrieslist">
        <div className="countriesadded">
          <h2>Countries Added</h2>
        </div>
        <table className="table table-bordered table-striped mt-5">
          <thead>
            <tr>
              <th>Country</th>
              <th className="aligntxtend">Actions</th>
            </tr>
          </thead>
          {loading ? (
            <div className="loader">
              <BeatLoader color="#36d7b7" loading={true} />
            </div>
          ) : (
            <tbody>
              {countries.map((country) => (
                <tr key={country._id}>
                  <td>
                    <h5>{country.countryName}</h5>
                  </td>
                  <td className="aligntxtend">
                    <button
                      className="btn btn-info me-2 text-white"
                      onClick={() => handleEdit(country)}
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
                      onClick={() => handleDelete(country._id)}
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
                    <button
                      className="btn btn-primary text-white"
                      onClick={() => handleViewStates(country)}
                    >
                      States
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit Country" : "Add New Country"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CountriesForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DestinationPage;
