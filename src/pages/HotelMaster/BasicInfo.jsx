import React, { useState } from "react";
import HotelSideBar from "../../components/HotelSideBar";
import "./hotelmaster.css";

function BasicInfo() {
  const [activeMenuItem, setActiveMenuItem] = useState("PROPERTY DETAILS");

  // Function to handle menu item click
  const handleMenuItemClick = (title) => {
    setActiveMenuItem(title);
  };

  return (
    <div className="flexitdest">
      <div className="sidebarpluto">
        <HotelSideBar />
      </div>
      <div className="flex-1">
        <div className="px-4 py-6">
          {/* Property heading with small info icon */}
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-600">Property</h2>
          </div>

          {/* Menu items */}
          <div className="flex">
            <MenuItem
              title="PROPERTY DETAILS"
              active={activeMenuItem === "PROPERTY DETAILS"}
              onClick={() => handleMenuItemClick("PROPERTY DETAILS")}
            />
            <MenuItem
              title="CONTACTS"
              active={activeMenuItem === "CONTACTS"}
              onClick={() => handleMenuItemClick("CONTACTS")}
            />
            <MenuItem
              title="PROPERTY LOCATION AND DIRECTION"
              active={activeMenuItem === "PROPERTY LOCATION AND DIRECTION"}
              onClick={() =>
                handleMenuItemClick("PROPERTY LOCATION AND DIRECTION")
              }
            />
          </div>
          <div className="propdetails">
            {/* Property Details Inputs */}
            {activeMenuItem === "PROPERTY DETAILS" ? (
              <div className="property-inputs text-sm">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label text-sm"
                      htmlFor="propertyName"
                    >
                      Property Name
                    </label>
                    <input
                      className="form-control text-sm"
                      type="text"
                      id="propertyName"
                      placeholder="Property Name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="displayName">
                      Display Name
                    </label>
                    <input
                      className="form-control text-sm"
                      type="text"
                      id="displayName"
                      placeholder="Display Name"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      className="form-control text-sm"
                      id="description"
                    ></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="timezone">
                      Timezone
                    </label>
                    <input
                      className="form-control text-sm"
                      type="text"
                      id="timezone"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label text-sm"
                      htmlFor="propertyType"
                    >
                      Property Type
                    </label>
                    <select className="form-select text-sm" id="propertyType">
                      <option value="guestHouse">Guest House</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="standard">Standard</option>
                      <option value="3star">3 Star</option>
                      <option value="4star">4 Star</option>
                      <option value="5star">5 Star</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="chainName">
                      Chain Name
                    </label>
                    <select className="form-select text-sm" id="chainName">
                      <option value="hyatt">Hyatt</option>
                      <option value="raddison">Raddison</option>
                      <option value="hilton">Hilton</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="builtYear">
                      Built Year
                    </label>
                    <input
                      className="form-control text-sm"
                      type="number"
                      id="builtYear"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label text-sm"
                      htmlFor="numOfRestaurants"
                    >
                      No. of Restaurants
                    </label>
                    <input
                      className="form-control text-sm"
                      type="number"
                      id="numOfRestaurants"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="numOfRooms">
                      No. of Rooms
                    </label>
                    <input
                      className="form-control text-sm"
                      type="number"
                      id="numOfRooms"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="numOfFloors">
                      No. of Floors
                    </label>
                    <input
                      className="form-control text-sm"
                      type="number"
                      id="numOfFloors"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="currency">
                      Currency
                    </label>
                    <select className="form-select text-sm" id="currency">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="vccCurrency">
                      VCC Currency
                    </label>
                    <select className="form-select text-sm" id="vccCurrency">
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-sm" htmlFor="checkInTime">
                      Check-in Time
                    </label>
                    <input
                      className="form-control text-sm"
                      type="text"
                      id="checkInTime"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label
                      className="form-label text-sm"
                      htmlFor="checkOutTime"
                    >
                      Check-out Time
                    </label>
                    <input
                      className="form-control text-sm"
                      type="text"
                      id="checkOutTime"
                    />
                  </div>
                </div>
                {/* <div className="row">
                                
                            </div> */}
                {/* Add more inputs similarly */}
              </div>
            ) : (
              ""
            )}
            {activeMenuItem === "CONTACTS" ? (
              <div className="property-inputs text-sm">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="hotelPhone">
                      Hotel Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="hotelPhone"
                      placeholder="Hotel Phone"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="phoneList">
                      Phone List <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="phoneList"
                      placeholder="Phone List"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="hotelMobile">
                      Hotel Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="hotelMobile"
                      placeholder="Hotel Mobile"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="websiteList">
                      Website List <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="websiteList"
                      placeholder="Website List"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="hotelEmail">
                      Hotel Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="hotelEmail"
                      placeholder="Hotel Email"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small" htmlFor="emailList">
                      Email List <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      id="emailList"
                      placeholder="Email List"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {activeMenuItem === "PROPERTY LOCATION AND DIRECTION" ? (
              <div className="property-inputs text-sm">
                <div className="property-address">
                  <h3 className="text-xs font-bold mb-2">Property Address</h3>
                  <p className="mb-1">
                    Sokni Da Kot Khanayara Dharamshala, Dharamshala, India
                  </p>
                  <h3 className="text-xs mb-2">
                    Latitude: 32.2077396 Longitude: 76.3640166
                  </h3>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MenuItem component
const MenuItem = ({ title, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex-1 py-2 px-4 text-center cursor-pointer ${
      active ? "text-blue-500" : "text-gray-400"
    }`}
  >
    <span>{title}</span>
    {active && <div className="w-full h-0.5 mt-3 bg-blue-500"></div>}
  </div>
);

export default BasicInfo;
