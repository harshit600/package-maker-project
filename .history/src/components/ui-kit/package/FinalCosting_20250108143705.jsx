import React, { useState } from "react";

const FinalCosting = () => {
  const [activeTab, setActiveTab] = useState("b2b");
  const [hotelPrice, setHotelPrice] = useState("");
  const [cabPrice, setCabPrice] = useState("");
  const [activitiesPrice, setActivitiesPrice] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [margin, setMargin] = useState("");

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

  const renderCostTable = () => (
    <table className="cost-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Hotel Price</td>
          <td>
            <input
              type="number"
              value={hotelPrice}
              onChange={(e) => setHotelPrice(e.target.value)}
              placeholder="Enter hotel price"
            />
          </td>
        </tr>
        <tr>
          <td>Cab Price</td>
          <td>
            <input
              type="number"
              value={cabPrice}
              onChange={(e) => setCabPrice(e.target.value)}
              placeholder="Enter cab price"
            />
          </td>
        </tr>
        <tr>
          <td>Activities Price</td>
          <td>
            <input
              type="number"
              value={activitiesPrice}
              onChange={(e) => setActivitiesPrice(e.target.value)}
              placeholder="Enter activities price"
            />
          </td>
        </tr>
        <tr>
          <td>Other Cost</td>
          <td>
            <input
              type="number"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              placeholder="Enter other cost"
            />
          </td>
        </tr>
        <tr>
          <td>Margin (%)</td>
          <td>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              placeholder="Enter margin"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );

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
                        ? "✓"
                        : "✗"
                      : feature.b2b}
                  </span>
                </div>
              ))}
            </div>
            {renderCostTable()}
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
            {renderCostTable()}
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
            {renderCostTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalCosting;
