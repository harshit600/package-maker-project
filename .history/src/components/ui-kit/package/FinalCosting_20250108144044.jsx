import React, { useState } from "react";

const FinalCosting = () => {
  const [activeTab, setActiveTab] = useState("b2b");

  const [margins, setMargins] = useState({
    b2b: 0,
    internal: 0,
    website: 0,
  });

  const PricingDetails = ({ type }) => (
    <div className="pricing-details">
      <div className="cost-item">
        <span>Hotel Price:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Cab Price:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Activities Price:</span>
        <span>₹0.00</span>
      </div>
      <div className="cost-item">
        <span>Other Costs:</span>
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
        <strong>Total Cost:</strong>
        <strong>₹0.00</strong>
      </div>
    </div>
  );

  const features = [
    { name: "Review and Analysis", b2b: true, internal: true, website: false },
    {
      name: "Website Structure Analysis",
      b2b: true,
      internal: true,
      website: true,
    },
    {
      name: "Past Performance Review",
      b2b: true,
      internal: true,
      website: true,
    },
    {
      name: "Competitor Analysis",
      b2b: "2 Competitor",
      internal: "3 Competitor",
      website: "5 Competitor",
    },
    { name: "Market Analysis", b2b: true, internal: true, website: true },
    { name: "Price Analysis", b2b: true, internal: true, website: true },
    { name: "Content Review", b2b: true, internal: true, website: true },
  ];

  return (
    <div className="final-costing">
      <div className="pricing-table">
        <div className="pricing-columns">
          <div className="pricing-column">
            <div className="column-header">
              <h3>B2B SALE PRICE</h3>
              <p>UPTO 15 ITEMS</p>
              <button className="calculator-btn">COST CALCULATOR</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">
                    {typeof feature.b2b === "boolean"
                      ? feature.b2b
                        ? "✔️"
                        : "❌"
                      : feature.b2b}
                  </span>
                </div>
              ))}
            </div>
            <PricingDetails type="b2b" />
          </div>

          <div className="pricing-column premium">
            <div className="column-header">
              <h3>INTERNAL SALE PRICE</h3>
              <p>UPTO 30 ITEMS</p>
              <button className="calculator-btn">COST CALCULATOR</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">
                    {typeof feature.internal === "boolean"
                      ? feature.internal
                        ? "✓"
                        : "✗"
                      : feature.internal}
                  </span>
                </div>
              ))}
            </div>
            <PricingDetails type="internal" />
          </div>

          <div className="pricing-column">
            <div className="column-header">
              <h3>WEBSITE SALE PRICE</h3>
              <p>UPTO 50 ITEMS</p>
              <button className="calculator-btn">COST CALCULATOR</button>
            </div>
            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-value">
                    {typeof feature.website === "boolean"
                      ? feature.website
                        ? "✓"
                        : "✗"
                      : feature.website}
                  </span>
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
