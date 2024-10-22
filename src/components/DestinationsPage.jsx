import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import "../components/Destinations.css";
import CountriesForm from "./CountriesForm";
import config from "../../config";
import Button from "./ui-kit/atoms/Button";

import { Icons } from '../icons/index';

const { EditIcon, DeleteIcon } = Icons;


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
        {/* <button
          className="btn addcountrybtn btn btn-primary me-2 text-white"
          onClick={handleAddCountry}
        >
          Add new Country
        </button> */}
        <Button 
        text="Add new Country"
        onClick={handleAddCountry}
        variant="primary"
        />
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
                  <td className="aligntxtend flex gap-2 justify-end items-center"> 
                    <Button 
                    icon={<EditIcon />} 
                    iconPosition="left"
                    onClick={() => handleEdit(country)}
                    variant="shade"
                    />
                    <Button 
                    icon={<DeleteIcon />} 
                    iconPosition="left"
                    onClick={() => handleDelete(country._id)}
                    variant="danger"
                    />
                    <Button 
                    text="States"
                    onClick={() => handleViewStates(country)}
                    variant="primary"
                    />
                  
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
