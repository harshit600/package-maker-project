import React, { useState } from 'react';

const Sidebar = () => {
  const [selectedPrice, setSelectedPrice] = useState(0);

  const handleCabSelect = (cab) => {
    setSelectedCab(cab);
    setSelectedPrice(cab.price);
  };

  return (
    <div className="sidebar">
      <div className="price-summary">
        <div className="price-details">
          <div className="price-row">
            <span className="price-label">Selected Cab Fare</span>
            <span className="price-value">₹{selectedPrice}</span>
          </div>
          <div className="price-row">
            <span className="price-label">Taxes & Fees</span>
            <span className="price-value">₹{Math.round(selectedPrice * 0.18)}</span>
          </div>
          <div className="price-row total-price">
            <span className="price-label">Total Amount</span>
            <span className="price-value">
              ₹{selectedPrice + Math.round(selectedPrice * 0.18)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 