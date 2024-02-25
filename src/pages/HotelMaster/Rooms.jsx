import React, { useState } from "react";
import HotelSideBar from "../../components/HotelSideBar";
import AmenitiesBox from "../../components/HotelMaster/AmenitiesBox";
import RoomTable from "../../components/HotelMaster/RoomTable";

function Rooms() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    // Existing state
    displayName: "",
    roomType: "",
    totalRooms: "",
    description: "",
    roomView: "",
    bedType: "",
    dimensionsType: "size",
    length: "",
    breadth: "",
    area: "",
    unit: "sq.ft",
    // New state for occupancy
    baseAdults: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDimensionsTypeChange = (e) => {
    const { value } = e.target;
    // Reset dimensions values when changing dimensions type
    setFormData({
      ...formData,
      dimensionsType: value,
      length: "",
      breadth: "",
      area: "",
    });
  };

  const handleIncrement = () => {
    setFormData({ ...formData, baseAdults: formData.baseAdults + 1 });
  };

  const handleDecrement = () => {
    if (formData.baseAdults > 1) {
      setFormData({ ...formData, baseAdults: formData.baseAdults - 1 });
    }
  };

  const HandleAddNewRoom = () => {
    setShowModal(!showModal);
  }

  return (
    <div className="flexitdest mt-5">
      <div className="sidebarpluto">
        <HotelSideBar />
      </div>
      <div className="roomsheading">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-600">Property</h2>
        </div>
        <div className="existingroomtab flex">
          <div className="existnumber">Existing Rooms (3)</div>
          <button className="btn btn-primary text-white" onClick={() => HandleAddNewRoom()}>
            {showModal ? 'CREATE NEW ROOM' : 'Go Back'}
          </button>
        </div>
       {!showModal ? <div className="addnewroomdiv">
          <h2>ADD NEW ROOM</h2>
          <div className="addnewroomheading mt-6">
            <h5 className="mb-6">ROOM INFO</h5>
            <div className="roominfo">
              <div>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="displayName">Display Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group col">
                    <label htmlFor="roomType">Room Type</label>
                    <select
                      className="form-control"
                      id="roomType"
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Room Type</option>
                      <option value="DELUXE">DELUXE</option>
                      <option value="STANDARD">STANDARD</option>
                      <option value="LUXURY">LUXURY</option>
                      <option value="MASTER">MASTER</option>
                      <option value="COMMON">COMMON</option>
                      <option value="TENT">TENT</option>
                      <option value="FAMILY">FAMILY ROOM</option>
                      <option value="WATER">WATER VILLA</option>
                      <option value="BEACH">BEACH VILLA</option>
                      <option value="HONEYMOONERS">HONEYMOONERS</option>
                      <option value="GARDEN">GARDEN VILLA</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="totalRooms">Total Rooms</label>
                    <input
                      type="text"
                      className="form-control"
                      id="totalRooms"
                      name="totalRooms"
                      value={formData.totalRooms}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group col">
                    <label htmlFor="roomView">Room View</label>
                    <select
                      className="form-control"
                      id="roomView"
                      name="roomView"
                      value={formData.roomView}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Room View</option>
                      <option value="NO_VIEW">No View</option>
                      <option value="SEA_VIEW">Sea View</option>
                      <option value="VALLEY_VIEW">Valley View</option>
                      <option value="HILL_VIEW">Hill View</option>
                      <option value="POOL_VIEW">Pool View</option>
                      <option value="GARDEN_VIEW">Garden View</option>
                      <option value="RIVER_VIEW">River View</option>
                      <option value="LAKE_VIEW">Lake View</option>
                      <option value="PALACE_VIEW">Palace View</option>
                      <option value="BAY_VIEW">Bay View</option>
                      <option value="JUNGLE_VIEW">Jungle View</option>
                    </select>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="bedType">Bed Type</label>
                    <select
                      className="form-control"
                      id="bedType"
                      name="bedType"
                      value={formData.bedType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Bed Type</option>
                      <option value="TWIN_BED">Twin Bed</option>
                      <option value="KING_BED">King Bed</option>
                      <option value="QUEEN_BED">Queen Bed</option>
                      <option value="DOUBLE_BED">Double Bed</option>
                      <option value="SINGLE_BED">Single Bed</option>
                      <option value="SOFA_BED">Sofa Bed</option>
                      <option value="STANDARD_BED">Standard Bed</option>
                    </select>
                  </div>
                </div>
                {/* Dimensions Section */}
                <div className="form-row">
                  <div className="form-group col">
                    <label htmlFor="dimensionsType">Dimensions Type</label>
                    <select
                      className="form-control"
                      id="dimensionsType"
                      name="dimensionsType"
                      value={formData.dimensionsType}
                      onChange={handleDimensionsTypeChange}
                    >
                      <option value="size">Size</option>
                      <option value="area">Area</option>
                    </select>
                  </div>
                  {formData.dimensionsType === "size" ? (
                    <React.Fragment>
                      <div className="form-group col">
                        <label htmlFor="length">Length</label>
                        <input
                          type="text"
                          className="form-control"
                          id="length"
                          name="length"
                          value={formData.length}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group col">
                        <label htmlFor="breadth">Breadth</label>
                        <input
                          type="text"
                          className="form-control"
                          id="breadth"
                          name="breadth"
                          value={formData.breadth}
                          onChange={handleInputChange}
                        />
                      </div>
                    </React.Fragment>
                  ) : (
                    <div className="form-group col">
                      <label htmlFor="area">Area</label>
                      <input
                        type="text"
                        className="form-control"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  <div className="form-group col">
                    <label htmlFor="unit">Unit</label>
                    <select
                      className="form-control"
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      <option value="sq.ft">sq.ft</option>
                      <option value="sq.mtr">sq.mtr</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="form-row mt-5 mb-5">
                    <div className="form-group col">
                      <label className="text-sm" htmlFor="baseAdults">
                        Base Adults
                      </label>
                      <span className="text-sm">
                        Ideal number of adults that can be accommodated in this
                        room
                      </span>
                    </div>
                    <div className="form-group col">
                      <label></label>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleDecrement}
                        >
                          -
                        </button>
                        <button type="button" className="btn btn-secondary">
                          {formData.baseAdults}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleIncrement}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="form-group col">
                      <label className="text-sm" htmlFor="baseAdults">
                        Maximum Adults
                      </label>
                      <span className="text-sm">
                        Maximum number of adults that can be accommodated in
                        this room
                      </span>
                    </div>
                    <div className="form-group col">
                      <label></label>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleDecrement}
                        >
                          -
                        </button>
                        <button type="button" className="btn btn-secondary">
                          {formData.baseAdults}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleIncrement}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label className="text-sm" htmlFor="baseAdults">
                        Number of Max Children
                      </label>
                      <span className="text-sm">
                        Mention the maximum number of children who can stay in
                        the room
                      </span>
                    </div>
                    <div className="form-group col">
                      <label></label>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleDecrement}
                        >
                          -
                        </button>
                        <button type="button" className="btn btn-secondary">
                          {formData.baseAdults}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleIncrement}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="form-group col">
                      <label className="text-sm" htmlFor="baseAdults">
                        Maximum Occupancy (adults & children)
                      </label>
                      <span className="text-sm">
                        Mention the total number of adults & children that can
                        be accommodated in this room
                      </span>
                    </div>
                    <div className="form-group col">
                      <label></label>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleDecrement}
                        >
                          -
                        </button>
                        <button type="button" className="btn btn-secondary">
                          {formData.baseAdults}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleIncrement}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <AmenitiesBox />
              </div>
            </div>
            <div className="flex justify-content-center">
            <button type="submit" className="btn btn-primary mt-5">SAVE</button>
            </div>
          </div>
        </div> : <div className="existingrooms mt-5">
        <RoomTable />
          </div>} 
      </div>
    </div>
  );
}

export default Rooms;
