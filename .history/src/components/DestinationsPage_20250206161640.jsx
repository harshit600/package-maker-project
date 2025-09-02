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
    <div className="min-h-screen bg-slate-100 py-6 w-full">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="bg-white rounded-xl shadow-lg p-4 w-full">
          <div className="flex justify-between items-center mb-4 w-full">
            <h1 className="text-3xl font-bold text-[rgb(45,45,68)]">
              Destinations
            </h1>
            <Button
              text="+ New Country"
              onClick={handleAddCountry}
              variant="primary"
              className="hover:shadow-lg transition-all duration-200 px-3 py-1.5 bg-[rgb(45,45,68)] text-white"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-36 w-full">
              <BeatLoader color="rgb(45,45,68)" loading={true} size={12} />
            </div>
          ) : (
            <Table
              headers={["Country", "Actions"]}
              data={countries}
              className="w-full border-collapse table-fixed bg-white"
              renderRow={(country) => (
                <>
                  <td className="py-2.5 px-4 border-b border-slate-200 w-3/4 text-slate-700">
                    {country.countryName}
                  </td>
                </>
              )}
              renderActions={(country) => (
                <td className="py-2.5 px-4 border-b border-slate-200 w-1/4">
                  <div className="flex gap-3 justify-end items-center">
                    <button
                      className="text-slate-500 hover:text-[rgb(45,45,68)] transition-colors duration-200"
                      onClick={() => handleEdit(country)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="text-slate-500 hover:text-red-600 transition-colors duration-200"
                      onClick={() => handleDelete(country._id)}
                    >
                      <DeleteIcon />
                    </button>
                    <button
                      className="text-[rgb(45,45,68)] hover:text-[rgb(45,45,68/0.8)] font-semibold transition-colors duration-200"
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
          <Modal.Header closeButton className="border-b border-slate-200 p-3">
            <Modal.Title className="text-2xl font-bold text-[rgb(45,45,68)]">
              {isEditMode ? "Edit Country" : "Add New Country"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <CountriesForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
            />
          </Modal.Body>
          <Modal.Footer className="border-t border-slate-200 p-3">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                text="Cancel"
                onClick={handleCloseModal}
                className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors duration-200"
              />
              <Button
                variant="primary"
                text="Save"
                onClick={handleSubmit}
                className="px-3 py-1.5 hover:shadow-lg transition-all duration-200 bg-[rgb(45,45,68)] text-white"
              />
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DestinationPage;
