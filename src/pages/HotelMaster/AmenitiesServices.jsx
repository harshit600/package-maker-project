import React, { useState } from 'react'
import HotelSideBar from '../../components/HotelSideBar'
import "./hotelmaster.css";
import AmenitiesBox from '../../components/HotelMaster/AmenitiesBox';
import FoodServicesBox from '../../components/HotelMaster/FoodServicesBox';


function AmenitiesServices() {
  const [activeMenuItem, setActiveMenuItem] = useState("AMENITIES");

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
              title="AMENITIES"
              active={activeMenuItem === "AMENITIES"}
              onClick={() => handleMenuItemClick("AMENITIES")}
            />
            <MenuItem
              title="FOOD SERVICES"
              active={activeMenuItem === "FOOD SERVICES"}
              onClick={() => handleMenuItemClick("FOOD SERVICES")}
            />
          </div>
          <div className="propdetails">
            {/* Property Details Inputs */}
            {activeMenuItem === "AMENITIES" ? (
              <div className="property-inputs text-sm">
                <AmenitiesBox />
              </div>
            ) : (
              ""
            )}
            {activeMenuItem === "FOOD SERVICES" ? (
              <div className="property-inputs text-sm">
               <FoodServicesBox />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  )
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

export default AmenitiesServices