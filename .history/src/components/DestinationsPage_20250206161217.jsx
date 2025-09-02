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
import { Icons } from "../icons/index";

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

  const handleViewStates = (country) =>
    navigate(`/destinations/${country.countryName}`);
  const handleEdit = (country) => {
    setFormData({ ...country });
    setIsEditMode(true);
    setShowModal(true);
  };
  const handleDelete = (countryId) =>
    console.log(`Deleting country with ID: ${countryId}`);
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
            ? prev.map((c) =>
                c._id === updatedCountry._id ? updatedCountry : c
              )
            : [...prev, updatedCountry]
        );
        handleCloseModal();
        alert(
          isEditMode
            ? "Country updated successfully!"
            : "Country added successfully!"
        );
      } else {
        alert("Failed to save country. Please try again.");
      }
    } catch (error) {
      console.error("Error saving country:", error);
      alert("An error occurred while saving the country.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
          <div className="flex justify-between items-center mb-6 w-full">
            <h1 className="text-2xl font-semibold text-gray-900">
              Destinations
            </h1>
            <Button
              text="+ New Country"
              onClick={handleAddCountry}
              variant="primary"
              className="hover:shadow-md transition-all"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64 w-full">
              <BeatLoader color="#4F46E5" loading={true} />
            </div>
          ) : (
            <Table
              headers={["Country", "Actions"]}
              data={countries}
              className="w-full border-collapse table-fixed"
              renderRow={(country) => (
                <>
                  <td className="py-4 px-6 border-b w-3/4">
                    {country.countryName}
                  </td>
                </>
              )}
              renderActions={(country) => (
                <td className="py-4 px-6 border-b w-1/4">
                  <div className="flex gap-4 justify-end items-center">
                    <button
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => handleEdit(country)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      onClick={() => handleDelete(country._id)}
                    >
                      <DeleteIcon />
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      onClick={() => handleViewStates(country)}
                    >
                      View States
                    </button>
                  </div>
                </td>
              )}
            />
          )}
        </div>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          size="lg"
          className="w-full"
        >
          <Modal.Header closeButton className="border-b p-4">
            <Modal.Title className="text-xl font-semibold">
              {isEditMode ? "Edit Country" : "Add New Country"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <CountriesForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          </Modal.Body>
          <Modal.Footer className="border-t p-4">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={handleCloseModal}
                className="px-4 py-2"
              />
              <Button
                variant="primary"
                text="Save"
                onClick={handleSubmit}
                className="px-4 py-2"
              />
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DestinationPage;
