import React, { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import SimpleDropdown from "../atoms/SimpleDropdown";
import {
  durationOptions,
  packageTypeOptions,
  packageCategoryOptions,
  statusOptions,
  hotelCategoryOptions,
  tourByOptions,
  agentPackageOptions,
  amenitiesOptions,
  TagOptions,
  themeOptions,
  hotelPackageOptions,
  vehicleOptions,
  priceTagOptions,
} from "../onBoardingConstants/onBoardingData";
import Dropdown from "../atoms/Dropdown";
import MultiSelectDropdown from "../atoms/MultiSelectDropdown";
import Button from "../atoms/Button";
import ReactQuill from "react-quill";
import Select from "react-select";

function PackageForm({
  formData,
  validationErrors,
  handleInputChange,
  pickupLocationSearchResults,
  setSearchInput,
  handlePickupLocationChange,
  searchInput,
  handleSelectSuggestion,
  dropLocationSearchResults,
  setPickupSearchInput,
  handleDropLocationChange,
  pickupSearchInput,
  handleDropSelectSuggestion,
  handleCustomizableChange,
  handleImageChange,
  handleImageUpload,
  packagePlaces,
  isDropdownOpen,
  maxNightsReached,
  maxNights,
  handleAddPackagePlace,
  showIteniraryBoxes,
  numRooms,
  handleNumRoomsChange,
  handleSubmit,
  handleDropDownChange,
  handleMultiSelectChange,
  handleRichTextChange,
  RichTextInput,
  handleDropdownChange,
  handlePlaceSelection,
  handlePlaceInputChange,
  handleItenaryBoxes,
  handleRemovePackagePlace,
  setActiveSuggestion,
  activeSuggestion,
  dropdownRef,
  searchResults,
  activeIndex,
  renderItineraryBoxes,
  isEditing,
  initialData,
  uploading,
  onSaveSuccess,
  isLoading,
}) {
  const [isPackagePlacesEditable, setIsPackagePlacesEditable] = useState(true);

  useEffect(() => {
    if (isEditing && initialData) {
      if (initialData.packageType) {
        handleDropDownChange("packageType", initialData.packageType);
      }
      if (initialData.packageCategory) {
        handleDropDownChange("packageCategory", initialData.packageCategory);
      }
      if (initialData.amenities) {
        handleMultiSelectChange("amenities", initialData.amenities);
      }
      if (initialData.themes) {
        handleMultiSelectChange("themes", initialData.themes);
      }
      if (initialData.tags) {
        handleMultiSelectChange("tags", initialData.tags);
      }
    }
  }, [isEditing, initialData]);

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="bg-[rgb(45,45,68)] from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Package" : "Create New Package"}
        </h1>
        <p className="text-blue-100 mt-2">
          Fill in the details below to {isEditing ? "update" : "create"} your
          package
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
          Basic Information
        </h2>
        <Row className="mb-6">
          <Form.Group as={Col}>
            <SimpleDropdown
              options={packageTypeOptions}
              label="Package Type"
              onSelect={(selectedOption) =>
                handleDropDownChange("packageType", selectedOption.value)
              }
              value={formData.packageType}
              invalid={validationErrors.packageType}
              className="w-full border border-gray-300 rounded-md"
            />
            {validationErrors.packageType && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.packageType}
              </p>
            )}
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="text-sm font-medium text-gray-700">
              Package Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter package name"
              name="packageName"
              onChange={handleInputChange}
              value={formData.packageName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {validationErrors.packageName && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.packageName}
              </p>
            )}
          </Form.Group>
        </Row>

        <Row className="mb-6">
          <Form.Group as={Col}>
            <SimpleDropdown
              options={durationOptions}
              label="Duration"
              onSelect={(selectedOption) =>
                handleDropDownChange("duration", selectedOption.value)
              }
              value={formData.duration}
              invalid={validationErrors.duration}
              className="w-full"
            />
            {validationErrors.duration && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.duration}
              </p>
            )}
          </Form.Group>

          <Form.Group as={Col}>
            <SimpleDropdown
              options={statusOptions}
              label="Status"
              onSelect={(selectedOption) =>
                handleDropDownChange("status", selectedOption.value)
              }
              value={formData.status}
              invalid={validationErrors.status}
              className="w-full"
            />
            {validationErrors.status && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.status}
              </p>
            )}
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="text-sm font-medium text-gray-700">
              Display Order
            </Form.Label>
            <Form.Control
              type="number"
              name="displayOrder"
              placeholder="Display order"
              onChange={handleInputChange}
              value={formData.displayOrder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {validationErrors.displayOrder && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.displayOrder}
              </p>
            )}
          </Form.Group>
        </Row>
      </div>

      {/* Location Details */}
      <div className="mt-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
          Location Details
        </h2>
        <Row className="mb-6">
          <Form.Group as={Col}>
            <Form.Label className="text-sm font-medium text-gray-700">
              Pickup Location
            </Form.Label>
            <div className="relative">
              <Dropdown
                options={pickupLocationSearchResults.map((city) => ({
                  label: `${city.cityName}`,
                  value: city._id,
                }))}
                setSearchInput={setSearchInput}
                onChange={handlePickupLocationChange}
                searchInput={searchInput}
                label="Search Pickup Location"
                onSelect={handleSelectSuggestion}
                invalid={validationErrors.pickupLocation}
                initialValue={formData.pickupLocation}
                className="w-full"
              />
              {validationErrors.pickupLocation && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.pickupLocation}
                </p>
              )}
            </div>
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="text-sm font-medium text-gray-700">
              Drop Location
            </Form.Label>
            <div className="relative">
              <Dropdown
                options={dropLocationSearchResults.map((city) => ({
                  label: `${city.cityName}`,
                  value: city._id,
                }))}
                setSearchInput={setPickupSearchInput}
                onChange={handleDropLocationChange}
                searchInput={pickupSearchInput}
                label="Search Drop Location"
                invalid={validationErrors.dropLocation}
                onSelect={handleDropSelectSuggestion}
                initialValue={formData.dropLocation}
                className="w-full"
              />
              {validationErrors.dropLocation && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.dropLocation}
                </p>
              )}
            </div>
          </Form.Group>
        </Row>
      </div>

      {/* Package Places */}
      <div className="mt-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6 pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Package Places
          </h2>
          {isPackagePlacesEditable ? (
            <button
              type="button"
              onClick={handleAddPackagePlace}
              disabled={maxNightsReached >= maxNights}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Place
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPackagePlacesEditable(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Edit Places
            </button>
          )}
        </div>

        {packagePlaces.map((place, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
            <Row className="items-center">
              <Col>
                <div className="relative">
                  <Form.Label className="text-sm font-medium text-gray-700">
                    Place
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter place name"
                    name="placeCover"
                    value={place.placeCover || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                    disabled={!isPackagePlacesEditable}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      !isPackagePlacesEditable ? "bg-gray-100" : ""
                    }`}
                  />
                  {isDropdownOpen &&
                    searchResults.length > 0 &&
                    index === activeIndex &&
                    isPackagePlacesEditable && (
                      <ul
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {searchResults.slice(0, 5).map((result) => (
                          <li
                            key={result._id}
                            onClick={() => handlePlaceSelection(index, result)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {result.placeName}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </Col>
              <Col>
                <Form.Label className="text-sm font-medium text-gray-700">
                  Nights
                </Form.Label>
                <Form.Control
                  type="number"
                  name="nights"
                  value={place.nights || ""}
                  onChange={(e) => handlePlaceInputChange(index, e)}
                  disabled={!isPackagePlacesEditable}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    !isPackagePlacesEditable ? "bg-gray-100" : ""
                  }`}
                />
              </Col>
              <Col>
                <div className="flex items-center space-x-2 mt-6">
                  <span className="text-sm text-gray-600">Day</span>
                  <Form.Check
                    type="switch"
                    id={`placeTransfer${index}`}
                    checked={place.transfer}
                    onChange={() => handleDropdownChange(index)}
                    disabled={!isPackagePlacesEditable}
                    className={`focus:ring-blue-500 h-5 w-10 ${
                      !isPackagePlacesEditable ? "opacity-50" : ""
                    }`}
                  />
                  <span className="text-sm text-gray-600">Night</span>
                </div>
              </Col>
              {index > 0 && isPackagePlacesEditable && (
                <Col className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemovePackagePlace(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Remove
                  </button>
                </Col>
              )}
            </Row>
          </div>
        ))}

        {maxNightsReached >= maxNights && isPackagePlacesEditable && (
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsPackagePlacesEditable(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Features & Amenities Section */}
      <div className="mt-2 mb-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">✨</span>
          Features & Amenities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Themes */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-2">
              <span className="flex items-center">
                <span className="mr-2">🎨</span>
                Themes
              </span>
            </label>
            <Select
              isMulti
              name="themes"
              options={[
                { value: "adventure", label: "Adventure" },
                { value: "romantic", label: "Romantic" },
                { value: "family", label: "Family" },
                { value: "wildlife", label: "Wildlife" },
                { value: "cultural", label: "Cultural" },
                { value: "religious", label: "Religious" },
                { value: "beach", label: "Beach" },
                { value: "hill station", label: "Hill Station" },
              ]}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formData.themes?.map((theme) => ({
                value: theme,
                label: theme,
              }))}
              onChange={(selectedOptions) =>
                handleMultiSelectChange(
                  "themes",
                  selectedOptions?.map((option) => option.value) || []
                )
              }
            />
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-2">
              <span className="flex items-center">
                <span className="mr-2">🏷️</span>
                Tags
              </span>
            </label>
            <Select
              isMulti
              name="tags"
              options={[
                { value: "popular", label: "Popular" },
                { value: "trending", label: "Trending" },
                { value: "best seller", label: "Best Seller" },
                { value: "new", label: "New" },
                { value: "featured", label: "Featured" },
                { value: "recommended", label: "Recommended" },
              ]}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formData.tags?.map((tag) => ({ value: tag, label: tag }))}
              onChange={(selectedOptions) =>
                handleMultiSelectChange(
                  "tags",
                  selectedOptions?.map((option) => option.value) || []
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Package Description */}
      <div className="mt-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
          Package Description
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Description
            </h3>
            <RichTextInput
              value={formData.packageDescription}
              onChange={(value) =>
                handleRichTextChange("packageDescription", value)
              }
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Inclusions
            </h3>
            <RichTextInput
              value={formData.packageInclusions}
              onChange={(value) =>
                handleRichTextChange("packageInclusions", value)
              }
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Exclusions
            </h3>
            <RichTextInput
              value={formData.packageExclusions}
              onChange={(value) =>
                handleRichTextChange("packageExclusions", value)
              }
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="mt-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
          Package Images
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={handleImageChange}
              multiple
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload</span>
              )}
            </button>
          </div>

          {formData.packageImages && formData.packageImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {formData.packageImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Package ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const newImages = formData.packageImages.filter(
                        (_, i) => i !== index
                      );
                      setFormData({
                        ...formData,
                        packageImages: newImages,
                      });
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Boxes */}
      {showIteniraryBoxes && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
            Itinerary Details
          </h2>
          {renderItineraryBoxes()}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleSubmit}
          type="button"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save & Next</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PackageForm;
