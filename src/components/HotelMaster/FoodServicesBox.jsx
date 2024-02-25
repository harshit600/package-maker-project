import React, { useState } from "react";
import "../../pages/HotelMaster/hotelmaster.css";

function FoodServicesBox() {

    const [showAddRestuarant, setShowAddRestuarant] = useState(false);

  return (
    <>{!showAddRestuarant ?
      <div className="foodservices">
        <div className="foodservicestag">
          Add information below to tell your guests more about your property and
          attract more bookings.
        </div>
        <div className="isfood">
          <div className="isfoodavaialable">
            <div className="isfoodavailabletext">
              Is restaurant available at your property?
            </div>
            <div className="isfoodavailablebtns">
              <button className="foodbtn isfoodactive">Yes</button>
              <button className="foodbtn">No</button>
            </div>
          </div>
          <div className="addrestuarant">
            <button className="addrestbtn" onClick={() => setShowAddRestuarant(true)}>+ ADD RESTAURANT</button>
          </div>
        </div>
        <div className="foodpolicies">
          <h3>FOOD POLICIES</h3>
        </div>
        <div className="foodpolic1">
          <div className="isfoodavailabletext">Is Non-Veg Food allowed?</div>
          <div className="isfoodavailablebtns">
            <button className="foodbtn isfoodactive">Yes</button>
            <button className="foodbtn">No</button>
          </div>
        </div>
        <div className="foodpolic1">
          <div className="isfoodavailabletext">Is outside food allowed?</div>
          <div className="isfoodavailablebtns">
            <button className="foodbtn isfoodactive">Yes</button>
            <button className="foodbtn">No</button>
          </div>
        </div>
        <div className="foodpolic1">
          <div className="isfoodavailabletext">Is Food Delivery Available?</div>
          <div className="isfoodavailablebtns">
            <button className="foodbtn isfoodactive">Yes</button>
            <button className="foodbtn">No</button>
          </div>
        </div>
        <div className="foodpolic1">
          <div className="isfoodavailabletext">
            Is alcohol consumption allowed at the property?
          </div>
          <div className="isfoodavailablebtns">
            <button className="foodbtn isfoodactive">Yes</button>
            <button className="foodbtn">No</button>
          </div>
        </div>
      </div> : <div className="addrest">
        <button className="addrestback" onClick={() => setShowAddRestuarant(false)}>
           Back
        </button>
        <div className="addresthead">
            <h2>Add Restaurant</h2>
        </div>
        <div className="flex gap-6">
        <div className="Step p-2">
            STEP 1: FOOD & RESTAURANT DETAILS
        </div>
        <div className="Step p-2">
            STEP 2: OTHER DETAILS
        </div>
        </div>
      </div>}
    </>
  );
}

export default FoodServicesBox;
