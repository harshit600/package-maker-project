import React, { useEffect } from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap';
import SimpleDropdown from '../atoms/SimpleDropdown';
import { durationOptions, packageTypeOptions, packageCategoryOptions, statusOptions, hotelCategoryOptions, tourByOptions,
    agentPackageOptions, amenitiesOptions, TagOptions, themeOptions, hotelPackageOptions, vehicleOptions, priceTagOptions
  } from "../onBoardingConstants/onBoardingData";
import Dropdown from '../atoms/Dropdown';
import MultiSelectDropdown from '../atoms/MultiSelectDropdown';
import Button from '../atoms/Button';
import ReactQuill from 'react-quill';

function PackageForm({
  formData, validationErrors, handleInputChange, pickupLocationSearchResults, setSearchInput, handlePickupLocationChange, searchInput, 
  handleSelectSuggestion, dropLocationSearchResults, setPickupSearchInput, handleDropLocationChange, pickupSearchInput, handleDropSelectSuggestion,
  handleCustomizableChange, handleImageChange, handleImageUpload, packagePlaces, isDropdownOpen, maxNightsReached, maxNights, handleAddPackagePlace,
  showIteniraryBoxes, numRooms, handleNumRoomsChange, handleSubmit, handleDropDownChange, handleMultiSelectChange, handleRichTextChange, RichTextInput,handleDropdownChange,
  handlePlaceSelection, handlePlaceInputChange, handleItenaryBoxes, handleRemovePackagePlace, setActiveSuggestion, activeSuggestion, dropdownRef, searchResults, activeIndex, renderItineraryBoxes, isEditing, initialData
}) {
  useEffect(() => {
    if (isEditing && initialData) {
      if (initialData.packageType) {
        handleDropDownChange("packageType", initialData.packageType);
      }
      if (initialData.packageCategory) {
        handleDropDownChange("packageCategory", initialData.packageCategory);
      }
      if (initialData.amenities) {
        handleMultiSelectChange('amenities', initialData.amenities);
      }
      if (initialData.themes) {
        handleMultiSelectChange('themes', initialData.themes);
      }
      if (initialData.tags) {
        handleMultiSelectChange('tags', initialData.tags);
      }
    }
  }, [isEditing, initialData]);

  return (
    <div className=" mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">{isEditing ? 'Edit Package' : 'Create New Package'}</h1>
        <p className="text-blue-100 mt-2">Fill in the details below to {isEditing ? 'update' : 'create'} your package</p>
      </div>

     
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Basic Information</h2>
          <Row className="mb-6">
            <Form.Group as={Col}>
              <SimpleDropdown
                options={packageTypeOptions}
                label="Package Type"
                onSelect={(selectedOption) => handleDropDownChange("packageType", selectedOption.value)}
                value={formData.packageType}
                invalid={validationErrors.packageType}
                className="w-full"
              />
              {validationErrors.packageType && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.packageType}</p>
              )}
            </Form.Group>

            <Form.Group as={Col}>
              <SimpleDropdown
                options={packageCategoryOptions}
                label="Package Category"
                onSelect={(selectedOption) => handleDropDownChange("packageCategory", selectedOption.value)}
                value={formData.packageCategory}
                invalid={validationErrors.packageCategory}
                className="w-full"
              />
              {validationErrors.packageCategory && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.packageCategory}</p>
              )}
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="text-sm font-medium text-gray-700">Package Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package name"
                name="packageName"
                onChange={handleInputChange}
                value={formData.packageName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {validationErrors.packageName && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.packageName}</p>
              )}
            </Form.Group>
          </Row>

          <Row className="mb-6">
            <Form.Group as={Col}>
              <SimpleDropdown
                options={durationOptions}
                label="Duration"
                onSelect={(selectedOption) => handleDropDownChange("duration", selectedOption.value)}
                value={formData.duration}
                invalid={validationErrors.duration}
                className="w-full"
              />
              {validationErrors.duration && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.duration}</p>
              )}
            </Form.Group>

            <Form.Group as={Col}>
              <SimpleDropdown
                options={statusOptions}
                label="Status"
                onSelect={(selectedOption) => handleDropDownChange("status", selectedOption.value)}
                value={formData.status}
                invalid={validationErrors.status}
                className="w-full"
              />
              {validationErrors.status && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.status}</p>
              )}
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="text-sm font-medium text-gray-700">Display Order</Form.Label>
              <Form.Control
                type="number"
                name="displayOrder"
                placeholder="Display order"
                onChange={handleInputChange}
                value={formData.displayOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {validationErrors.displayOrder && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.displayOrder}</p>
              )}
            </Form.Group>
          </Row>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Location Details</h2>
          <Row className="mb-6">
            <Form.Group as={Col}>
              <Form.Label className="text-sm font-medium text-gray-700">Pickup Location</Form.Label>
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
                  <p className="mt-1 text-sm text-red-500">{validationErrors.pickupLocation}</p>
                )}
              </div>
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="text-sm font-medium text-gray-700">Drop Location</Form.Label>
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
                  <p className="mt-1 text-sm text-red-500">{validationErrors.dropLocation}</p>
                )}
              </div>
            </Form.Group>
          </Row>
        </div>

        {/* Package Places */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Package Places</h2>
            <button
              type="button"
              onClick={handleAddPackagePlace}
              disabled={maxNightsReached >= maxNights}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Place
            </button>
          </div>

          {packagePlaces.map((place, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
              <Row className="items-center">
                <Col>
                  <div className="relative">
                    <Form.Label className="text-sm font-medium text-gray-700">Place</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter place name"
                      name="placeCover"
                      value={place.placeCover || ""}
                      onChange={(e) => handlePlaceInputChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    {isDropdownOpen && searchResults.length > 0 && index === activeIndex && (
                      <ul ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
                  <Form.Label className="text-sm font-medium text-gray-700">Nights</Form.Label>
                  <Form.Control
                    type="number"
                    name="nights"
                    value={place.nights || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                      className="focus:ring-blue-500 h-5 w-10"
                    />
                    <span className="text-sm text-gray-600">Night</span>
                  </div>
                </Col>
                {index > 0 && (
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
        </div>

        {/* Features and Amenities */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Features & Amenities</h2>
          <Row className="mb-6">
            <Col>
              <MultiSelectDropdown
                options={amenitiesOptions}
                label="Amenities"
                handleChange={(selectedOptions) => handleMultiSelectChange('amenities', selectedOptions)}
                initialValue={formData.amenities}
                className="w-full"
              />
            </Col>
            <Col>
              <MultiSelectDropdown
                options={themeOptions}
                label="Themes"
                handleChange={(selectedOptions) => handleMultiSelectChange('themes', selectedOptions)}
                initialValue={formData.themes}
                className="w-full"
              />
            </Col>
            <Col>
              <MultiSelectDropdown
                options={TagOptions}
                label="Tags"
                handleChange={(selectedOptions) => handleMultiSelectChange('tags', selectedOptions)}
                initialValue={formData.tags}
                className="w-full"
              />
            </Col>
          </Row>
        </div>

        {/* Package Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Package Description</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
              <RichTextInput
                value={formData.packageDescription}
                onChange={(value) => handleRichTextChange('packageDescription', value)}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Inclusions</h3>
              <RichTextInput
                value={formData.packageInclusions}
                onChange={(value) => handleRichTextChange('packageInclusions', value)}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Exclusions</h3>
              <RichTextInput
                value={formData.packageExclusions}
                onChange={(value) => handleRichTextChange('packageExclusions', value)}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Package Images</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={handleImageChange}
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Upload
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
                        const newImages = formData.packageImages.filter((_, i) => i !== index);
                        setFormData({
                          ...formData,
                          packageImages: newImages
                        });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Itinerary Details</h2>
            {renderItineraryBoxes()}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {isEditing ? 'Update Package' : 'Create Package'}
          </button>
        </div>
      
    </div>
  );
}

export default PackageForm;