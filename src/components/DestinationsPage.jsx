// DestinationPage.js
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import "../components/Destinations.css";
import CountriesForm from "./CountriesForm";
import config from "../../config";
import Button from "./ui-kit/atoms/Button";
import Table from "./ui-kit/molecules/Table.jsx";
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

  const handleViewStates = (country) => navigate(`/destinations/${country.countryName}`);
  const handleEdit = (country) => {
    setFormData({ ...country });
    setIsEditMode(true);
    setShowModal(true);
  };
  const handleDelete = (countryId) => console.log(`Deleting country with ID: ${countryId}`);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCountry = await response.json();
        setCountries((prev) =>
          isEditMode
            ? prev.map((c) => (c._id === updatedCountry._id ? updatedCountry : c))
            : [...prev, updatedCountry]
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
      <div className="addcountry mb-4">
        <Button text="+ new Country" onClick={handleAddCountry} variant="shade" />
      </div>
      <div className="countrieslist">
        {/* <div className="countriesadded">
          <h2>Countries Added</h2>
        </div> */}
        {loading ? (
          <div className="loader">
            <BeatLoader color="#36d7b7" loading={true} />
          </div>
        ) : (
          <Table
            headers={["Country"]}
            data={countries}
            renderRow={(country) => (
              <>
                <td className="pl-2">{country.countryName}</td>
              </>
            )}
            renderActions={(country) => (
              <div className="flex gap-4 justify-end items-center">
                <span className="cursor-pointer" onClick={() => handleEdit(country)}><EditIcon /></span>
                <span className="cursor-pointer" onClick={() => handleDelete(country._id)}><DeleteIcon /></span>
                <span className="cursor-pointer" onClick={() => handleViewStates(country)}>States</span>
              </div>
            )}
          />
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Country" : "Add New Country"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CountriesForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="shade" text="close" onClick={handleCloseModal} />
          <Button variant="primary" text="save" onClick={handleSubmit} />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DestinationPage;
