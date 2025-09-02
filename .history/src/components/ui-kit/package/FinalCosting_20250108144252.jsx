import React, { useState } from "react";

const FinalCosting = () => {
  const features = [
    {
      name: "Package Review",
      b2b: "Basic",
      internal: "Advanced",
      website: "Complete",
    },
    {
      name: "Content Quality",
      b2b: "Standard",
      internal: "Premium",
      website: "Premium+",
    },
    {
      name: "Itinerary Check",
      b2b: "✔️",
      internal: "✔️",
      website: "✔️",
    },
    {
      name: "Price Verification",
      b2b: "✔️",
      internal: "✔️",
      website: "✔️",
    },
    {
      name: "Hotel Standards",
      b2b: "3-Star",
      internal: "4-Star",
      website: "5-Star",
    },
    {
      name: "Transport Quality",
      b2b: "Standard",
      internal: "Premium",
      website: "Luxury",
    },
    {
      name: "Activity Review",
      b2b: "Basic",
      internal: "Detailed",
      website: "Comprehensive",
    },
  ];

  const [margins, setMargins] = useState({
    b2b: 0,
    internal: 0,
    website: 0,
  });

  const PricingDetails = ({ type }) => (
    <div className="pricing-details">
      <div className="cost-item">
        <span>Hotel Cost Review:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Transport Cost Review:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Activities Cost Review:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Additional Services:</span>
        <span>₹0.00</span>
      </div>
      <div className="margin-input">
        <label>Margin (%):</label>
        <input
          type="number"
          value={margins[type]}
          onChange={(e) =>
            setMargins({
              ...margins,
              [type]: e.target.value,
            })
          }
          min="0"
          max="100"
        />
      </div>
      <div className="total-cost">
        <strong>Total Package Cost:</strong>
        <strong>₹0.00</strong>
      </div>
    </div>
  );

  return (
    <div className="final-costing">
      <div className="pricing-table">
        <div className="pricing-columns">
          <div className="pricing-column">
            <div className="column-header">
              <h3>B2B Review</h3>
              <p>Standard package review for business partners</p>
              <button className="calculator-btn">Calculate Cost</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">{feature.b2b}</span>
                </div>
              ))}
            </div>
            <PricingDetails type="b2b" />
          </div>

          <div className="pricing-column premium">
            <div className="column-header">
              <h3>Internal Review</h3>
              <p>Enhanced review for internal operations</p>
              <button className="calculator-btn">Calculate Cost</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">{feature.internal}</span>
                </div>
              ))}
            </div>
            <PricingDetails type="internal" />
          </div>

          <div className="pricing-column">
            <div className="column-header">
              <h3>Website Review</h3>
              <p>Comprehensive review for public packages</p>
              <button className="calculator-btn">Calculate Cost</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">{feature.website}</span>
                </div>
              ))}
            </div>
            <PricingDetails type="website" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCosting;
