import React, { useState } from "react";
const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}
const FinalCosting = ({ selectedHotelData, onSubmit, places }) => {
  const [margins, setMargins] = useState({
    b2b: 5,
    internal: 5,
    website: 5,
  });
console.log(places)
  // Calculate total sedan cost from places
  const sedanCost = places?.reduce((total, dayData) => {
    const cityAreas = dayData.selectedItinerary?.cityArea || [];
    return total + cityAreas.reduce((dayTotal, area) => {
      return dayTotal + (parseFloat(area?.cost?.Sedan) || 0);
    }, 0);
  }, 0) || 0;

  // Calculate total activities cost
  const activitiesTotalCost = selectedHotelData?.activities?.reduce(
    (total, activity) => total + parseFloat(activity.discount_price || 0),
    0
  ) || 0;

  // Get transport cost from off season price
  const transportCost = selectedHotelData?.transportation?.selectedCabInfo?.prices?.offSeasonPrice || 0;

  // Get hotel cost - updated to handle the new data structure
  const hotelCost = selectedHotelData?.hotels ? 
    Object.values(selectedHotelData.hotels).reduce((total, dayData) => {
      return total + parseFloat(dayData.roomInfo?.price || 0);
    }, 0) 
    : 0;

  // Calculate base total without margins (now including sedan cost)
  const baseTotalCost = activitiesTotalCost + parseFloat(transportCost) + hotelCost + sedanCost;

  const calculateTotalWithMargin = (baseTotal, marginPercentage) => {
    const marginAmount = (baseTotal * marginPercentage) / 100;
    return baseTotal + marginAmount;
  };

  const handleSave = () => {
    // Prepare the final data structure including sightseeing
    const finalData = {
      hotels: selectedHotelData.hotels || {},
      activities: selectedHotelData.activities || [],
      sightseeing: selectedHotelData.sightseeing || [], // Make sure sightseeing is included
      transportation: selectedHotelData.transportation,
      pricing: {
        baseTotal: baseTotalCost,
        margins: margins,
        finalPrices: {
          b2b: calculateTotalWithMargin(baseTotalCost, margins.b2b),
          internal: calculateTotalWithMargin(baseTotalCost, margins.internal),
          website: calculateTotalWithMargin(baseTotalCost, margins.website)
        },
        breakdown: {
          hotelCost,
          transportCost,
          activitiesTotalCost,
          sedanCost
        }
      }
    };

    // Pass the complete data to parent component
    onSubmit(finalData);
  };

  const PricingDetails = ({ type }) => {
    const [totalWithMargin, setTotalWithMargin] = useState(baseTotalCost);

    const handleCalculate = () => {
      const newTotal = calculateTotalWithMargin(baseTotalCost, margins[type]);
      setTotalWithMargin(newTotal);
    };

    return (
      <div className="pricing-details">
        <div className="cost-item">
          <span>Hotel Cost Review:</span>
          <span>₹{hotelCost.toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span>Transport Cost Review:</span>
          <span>₹{parseFloat(transportCost).toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span>Activities Cost Review:</span>
          <span>₹{activitiesTotalCost.toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span>Paid Places Cost:</span>
          <span>₹{sedanCost.toFixed(2)}</span>
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
                [type]: parseFloat(e.target.value) || 0,
              })
            }
            min="0"
            max="100"
          />
        </div>
        <div className="total-cost">
          <strong>Total Package Cost:</strong>
          <strong>
            ₹{totalWithMargin.toFixed(2)}
          </strong>
        </div>
        <button className="calculator-btn" onClick={handleCalculate}>
          Calculate Cost With Margin
        </button>
      </div>
    );
  };

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
              <h3>Internal Sale Price</h3>
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

      {/* Add Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Package
        </button>
      </div>
    </div>
  );
};

export default FinalCosting;
