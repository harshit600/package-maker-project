import React from 'react'
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
 handlePlaceSelection, handlePlaceInputChange, handleItenaryBoxes, handleRemovePackagePlace, setActiveSuggestion, activeSuggestion, dropdownRef, searchResults, activeIndex, renderItineraryBoxes
}) {
  return (
    <div style={{ width: "100%" }}>
      {/* Top bar */}
      <div className="bg-gray-100 rounded p-2 text-xl font-semibold mb-2 border-l-4 text-center border-r-4 border-black">
        Create Package
      </div>

      {/* Basic Information section */}

      {/* <div className="mt-6 mb-6 text-lg font-semibold ">Basic Information</div> */}
      <div>
        <Container
          style={{
            paddingTop: "10px",
            // border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
          }}
        >
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="packageType">
              <SimpleDropdown
                options={packageTypeOptions}
                label="Select Package Type"
                onSelect={(selectedOption) =>
                  handleDropDownChange("packageType", selectedOption.value)
                }
                value={formData.packageType}
                invalid={validationErrors.packageType}
              />
              {validationErrors.packageType && (
          <small className="text-red-500">{validationErrors.packageType}</small>
        )}
              
            </Form.Group>
            <Form.Group as={Col} id="packageCategory">
              
              <SimpleDropdown
                options={packageCategoryOptions}
                label="Select Package Category"
                onSelect={(selectedOption) =>
                  handleDropDownChange("packageCategory", selectedOption.value)
                }
                value={formData.packageCategory}
                invalid={validationErrors.packageCategory}
              />
              {validationErrors.packageCategory && (
          <small className="text-red-500">{validationErrors.packageCategory}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="packageName">
              <Form.Label style={{ fontSize: "smaller" }}>
                Package Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package name"
                name="packageName"
                onChange={handleInputChange}
                value={formData.packageName}
                size="md"
                className={`text-sm placeholder-gray-400 placeholder-opacity-100 ${validationErrors.packageName ? 'border-red-500' : ''}`}
              />
               {validationErrors.packageName && (
          <small className="text-red-500">{validationErrors.packageName}</small>
        )}
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="duration">
              
              <SimpleDropdown
                options={durationOptions}
                label="Select Duration"
                onSelect={(selectedOption) =>
                  handleDropDownChange("duration", selectedOption.value)
                }
                value={formData.duration}
                invalid={validationErrors.duration}
              />
              {validationErrors.duration && (
          <small className="text-red-500">{validationErrors.duration}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="status">
              <SimpleDropdown
                options={statusOptions}
                label="Select Status"
                onSelect={(selectedOption) =>
                  handleDropDownChange("status", selectedOption.value)
                }
                value={formData.status}
                invalid={validationErrors.status}
              />
              {validationErrors.status && (
          <small className="text-red-500">{validationErrors.status}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="displayOrder">
              <Form.Label style={{ fontSize: "smaller" }}>
                Display Order
              </Form.Label>
              <Form.Control
                type="number"
                name="displayOrder"
                placeholder="Display order"
                onChange={handleInputChange}
                value={formData.displayOrder}
                size="md"
                invalid={validationErrors.displayOrder}
                className={`text-sm placeholder-gray-400 placeholder-opacity-100 ${validationErrors.packageName ? 'border-red-500' : ''}`}
              />
              {validationErrors.displayOrder && (
          <small className="text-red-500">{validationErrors.displayOrder}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="hotelCategory">
              
              <SimpleDropdown
                options={hotelCategoryOptions}
                label="Select Hotel Category"
                onSelect={(selectedOption) =>
                  handleDropDownChange("hotelCategory", selectedOption.value)
                }
                value={formData.hotelCategory}
                invalid={validationErrors.hotelCategory}
              />
              {validationErrors.hotelCategory && (
          <small className="text-red-500">{validationErrors.hotelCategory}</small>
        )}
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="pickupLocation">
              <Form.Label style={{ fontSize: "smaller" }}>
                Pickup Location
              </Form.Label>
              {/* Use input for search */}
              <Dropdown
                options={pickupLocationSearchResults.map((city) => ({
                  label: `${city.cityName}`,
                  value: city._id, // Each option has an ID or unique value
                }))}
                setSearchInput={setSearchInput}
                onChange={handlePickupLocationChange}
                searchInput={searchInput}
                label="Search Pickup Location"
                onSelect={handleSelectSuggestion} // Handle selection
                invalid={validationErrors.pickupLocation}
              />
              {validationErrors.pickupLocation && (
          <small className="text-red-500">{validationErrors.pickupLocation}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="pickupTransfer">
              <Form.Label
                style={{
                  fontSize: "smaller",
                  textAlign: "center",
                  marginBottom: "15px",
                }}
              >
                Pickup Transfer
              </Form.Label>
              
              <div className="flex align-center justify-center gap-2">
                <Form.Text className="text-muted">Day</Form.Text>
                <Form.Check
                  type="switch"
                  id="pickupTransfer"
                  label=""
                  checked={formData.pickupTransfer} // Use formData value
                  onChange={() =>
                    setFormData({
                      ...formData,
                      pickupTransfer: !formData.pickupTransfer,
                    })
                  }
                  size="sm"
                />
                <Form.Text className="text-muted">Night</Form.Text>
              </div>
              <div className="flex justify-center">
             
        </div>
            </Form.Group>

            <Form.Group as={Col} id="dropLocation">
              <Form.Label style={{ fontSize: "smaller" }}>
                Drop Location
              </Form.Label>
              {/* Use input for search */}
              <Dropdown
                options={dropLocationSearchResults.map((city) => ({
                  label: `${city.cityName}`,
                  value: city._id, // Each option has an ID or unique value
                }))}
                setSearchInput={setPickupSearchInput}
                onChange={handleDropLocationChange}
                searchInput={pickupSearchInput}
                label="Search Drop Location"
                invalid={validationErrors.dropLocation}
                onSelect={handleDropSelectSuggestion} // Handle selection
              />
              {validationErrors.dropLocation && (
          <small className="text-red-500">{validationErrors.dropLocation}</small>
        )}
            </Form.Group>
          </Row>
          <Row className="mb-[40px]">
            <Form.Group as={Col} id="validTill">
              <Form.Label style={{ fontSize: "smaller" }}>
                Valid Till
              </Form.Label>
              <Form.Control
                type="date"
                name="validTill"
                onChange={handleInputChange}
                value={formData.validTill}
                className={`text-sm placeholder-gray-400 placeholder-opacity-100 ${validationErrors.validTill ? 'border-red-500' : ''}`}
                size="sm"
              />
              {validationErrors.validTill && (
          <small className="text-red-500">{validationErrors.validTill}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="tourBy">
              <SimpleDropdown
                options={tourByOptions}
                label="Tour By"
                onSelect={(selectedOption) =>
                  handleDropDownChange("tourBy", selectedOption.value)
                }
                value={formData.tourBy}
                invalid={validationErrors.tourBy}
              />
              {validationErrors.tourBy && (
          <small className="text-red-500">{validationErrors.tourBy}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="agentPackage">
              
              <SimpleDropdown
                options={agentPackageOptions}
                label="Select Agent Package"
                onSelect={(selectedOption) =>
                  handleDropDownChange("agentPackage", selectedOption.value)
                }
                value={formData.agentPackage}
                invalid={validationErrors.agentPackage}
              />
               {validationErrors.agentPackage && (
          <small className="text-red-500">{validationErrors.agentPackage}</small>
        )}
            </Form.Group>
            <Form.Group as={Col} id="customizable">
              {/* Checkbox for Customizable Package */}
              <div className="flex gap-2 m-4 align-center">
                <input
                  type="checkbox"
                  id="customizablePackage"
                  checked={formData.customizablePackage}
                  onChange={handleCustomizableChange}
                  style={{ width: "25px" }}
                />
                <label htmlFor="customizablePackage" className="text-xs">
                  Customizable Package
                </label>
              </div>
            </Form.Group>
            <div className="mb-6 mt-3 w-100">
              <div className="flex gap-5 rounded">
                <MultiSelectDropdown
                  options={amenitiesOptions}
                  label="Amenities"
                  handleChange={(selectedOptions) => handleMultiSelectChange('amenities', selectedOptions)}
                />
                <Form.Group
                  style={{ width: "50%" }}
                  as={Col}
                  id="packageImages"
                >
                  <Form.Label style={{ fontSize: "smaller" }}>
                    Package Images
                  </Form.Label>
                  <div className="flex flex-col gap-3">
                    <Form.Control
                      type="file"
                      name="packageImages"
                      onChange={handleImageChange}
                      size="sm"
                      id="image"
                      multiple
                    />

                    <Button
                      text="upload"
                      onClick={handleImageUpload}
                      variant="shade"
                    />
                  </div>
                </Form.Group>
              </div>
            </div>

            <Container className="d-flex flex-row mt-4 align-items-center gap-20">
              <div className="mb-6 w-100">
                <MultiSelectDropdown options={TagOptions} label="Add tags" handleChange={(selectedOptions) => handleMultiSelectChange('tags', selectedOptions)}/>
              </div>
              {/* Default Hotel Package Section */}
              <Form.Group className="mb-6 w-100">
                <SimpleDropdown
                  options={hotelPackageOptions}
                  label="Select Hotel Package"
                  onSelect={(selectedOption) =>
                    handleDropDownChange(
                      "hotelPackageOptions",
                      selectedOption.value
                    )
                  }
                  value={formData.hotelPackageOptions}
                />
              </Form.Group>

              <div className="mb-6 w-100">
                <SimpleDropdown
                  options={priceTagOptions}
                  label="Select Price tag"
                  onSelect={(selectedOption) =>
                    handleDropDownChange("priceTag", selectedOption.value)
                  }
                  value={formData.priceTag}
                />
              </div>
            </Container>
          </Row>
          {/* Theme Section */}
          <div className="flex gap-10 pb-6 mb-3">
            <Form.Group className=" w-100">
              <MultiSelectDropdown options={themeOptions} label="Add themes"  handleChange={(selectedOptions) => handleMultiSelectChange('themes', selectedOptions)}/>
            </Form.Group>
            {/* Initial Amount */}
            <Form.Group className=" w-100">
              <Form.Label>Initial Amount:</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter initial amount"
                name="initialAmount"
                onChange={handleInputChange}
                value={formData.initialAmount}
                // onChange={handleInitialAmountChange}
              />
            </Form.Group>
            {/* Default Vehicle Section */}
            <Form.Group className=" w-100">
              <SimpleDropdown
                options={vehicleOptions}
                label="Select default vehicle"
                onSelect={(selectedOption) =>
                  handleDropDownChange("defaultVehicle", selectedOption.value)
                }
                value={formData.defaultVehicle}
              />
            </Form.Group>
          </div>
        </Container>

        <div
          className="flex gap-3 mb-10"
          style={{
            // border: "1px solid #ccc",
            borderTop: "0",
          }}
        >
          <Container className="shadow-md rounded-lg border-gray-300 border-2">
            <div className="mt-6 mb-6 text-lg">Package Places</div>
            <Row className="mb-6">
              <Col>
                <Form.Label>Places Cover</Form.Label>
              </Col>
              <Col>
                <Form.Label>No. of Nights</Form.Label>
              </Col>
              <Col>
                <Form.Label>Place Transfer</Form.Label>
              </Col>
            </Row>
            {packagePlaces.map((place, index) => (
              <Row key={index} className="mb-6">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Places Cover"
                    name="placeCover"
                    value={place.placeCover || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                  />
                  {/* Display search results */}
                  {isDropdownOpen && searchResults.length > 0 && index === activeIndex && (
        <ul ref={dropdownRef} className="list-group mt-1 absolute shadow-lg z-[50] left-[10px] bg-white">
          {searchResults.slice(0, 5).map((result, resultIndex) => (
            <li
              key={result._id}
              className="list-group-item text-sm !border-0"
              onClick={() => handlePlaceSelection(index, result)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  activeSuggestion[index] === resultIndex
                    ? "#f0f0f0"
                    : "transparent",
              }}
              onMouseEnter={() =>
                setActiveSuggestion({
                  ...activeSuggestion,
                  [index]: resultIndex,
                })
              }
              onMouseLeave={() =>
                setActiveSuggestion({
                  ...activeSuggestion,
                  [index]: null,
                })
              }
            >
              {result.placeName}
            </li>
          ))}
        </ul>
      )}
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder="No. of Nights"
                    name="nights"
                    value={place.nights || ""}
                    onChange={(e) => handlePlaceInputChange(index, e)}
                  />
                </Col>
                <Col>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Text className="text-muted">Day</Form.Text>
                    <Form.Check
                      type="switch"
                      id={`placeTransfer${index}`}
                      label=""
                      checked={place.transfer}
                      onChange={() => handleDropdownChange(index)}
                    />
                    <Form.Text className="text-muted">Night</Form.Text>
                  </div>
                </Col>
                {index !== packagePlaces.length - 1 && (
                  <Col>
                    <button
                      className="btn btn-danger text-white rounded text-xs"
                      onClick={() => handleRemovePackagePlace(index)}
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
                  </Col>
                )}
              </Row>
            ))}
            <div className="d-flex justify-content-between mb-6">
              <Button
                text={`${
                  maxNightsReached + 1 === maxNights ? "Done" : "Add Place"
                }`}
                onClick={
                  maxNightsReached + 1 === maxNights
                    ? handleItenaryBoxes
                    : handleAddPackagePlace
                }
                variant="shade"
                disabled={showIteniraryBoxes}
              />
            </div>
          </Container>
          <Container className="shadow-md rounded-lg border-gray-300 border-2">
            <div className="mt-6 mb-6 text-lg">Package Room Details</div>
            <Form.Group as={Row} className="mb-6">
              <Form.Label column sm={4} style={{ fontSize: "14px" }}>
                Number of Rooms:
              </Form.Label>
              <Col sm={5}>
                <Form.Control
                  as="select"
                  value={numRooms}
                  onChange={handleNumRoomsChange}
                >
                  {[...Array(10).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            {[...Array(numRooms).keys()].map((roomIndex) => (
              <Row key={roomIndex} className="mb-6">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Adults (12+ yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Kids (2-11 yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="text"
                    placeholder={`Infants (0-2 yrs)`}
                    style={{ fontSize: "14px" }}
                  />
                </Col>
              </Row>
            ))}
          </Container>
        </div>
        {showIteniraryBoxes && (
          <Container
          className="shadow-md rounded-lg "
            style={{
              border: "2px solid #ccc",
            }}
          >
            <h2 className="mb-4 mt-6">Package Itinerary and Locations:</h2>
            {renderItineraryBoxes()}
            {/* <Row className="mt-4 mb-6">
              <Col>
                <button
                  className="btn btn-primary text-white rounded text-xs"
                  onClick={handleAddItineraryDay}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-lg"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                    />
                  </svg>
                </button>
                <button
                  className="btn btn-danger text-white rounded text-xs"
                  onClick={handleRemoveItineraryDay}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </button>
              </Col>
            </Row> */}
          </Container>
        )}
        <div>
        <div className="mt-6 mb-6 text-lg">Package Other Information</div>
      
      <div className="mb-6">
        <h5 className="mt-6 mb-6">Package Description</h5>
        <RichTextInput 
          value={formData.packageDescription}
          onChange={(value) => handleRichTextChange('packageDescription', value)}
        />
      </div>

      <div className="mb-6">
        <h5 className="mt-6 mb-6">Package Inclusions</h5>
        <RichTextInput 
          value={formData.packageInclusions}
          onChange={(value) => handleRichTextChange('packageInclusions', value)}
        />
      </div>

      <div className="mb-6">
        <h5 className="mt-6 mb-6 rounded-lg">Package Exclusions</h5>
        <RichTextInput 
          value={formData.packageExclusions}
          onChange={(value) => handleRichTextChange('packageExclusions', value)}
        />
      </div>
      </div>

        <div className="w-full flex justify-center">
          <Button
            text="Save and Next"
            onClick={handleSubmit}
            variant="primary"
            cssClassesProps="w-[200px] mb-[30px] h-[50px]"
          />
        </div>
      </div>
    </div>
  )
}


export default PackageForm