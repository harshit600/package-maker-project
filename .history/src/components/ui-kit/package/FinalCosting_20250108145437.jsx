import React, { useState } from "react";

const FinalCosting = () => {
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
      <button className="calculator-btn">Calculate Cost</button>
    </div>
  );

  return (
    <div className="final-costing">
      <div className="pricing-table">
        <div className="pricing-columns">
          <div className="pricing-column">
            <div className="column-header">
              <h3>B2B Price</h3>
            </div>

            <PricingDetails type="b2b" />
          </div>

          <div className="pricing-column">
            <div className="column-header">
              <h3>Internal Price</h3>
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
              <h3>Website Price</h3>
            </div>

            <PricingDetails type="website" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCosting;
