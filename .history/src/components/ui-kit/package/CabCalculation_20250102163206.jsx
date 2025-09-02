import React, { useEffect } from "react";
import UpperCabInfo from "./UpperCabInfo";
import DayWiseCabPricing from "./DayWiseCabPricing";
import Button from "../atoms/Button";

function CabCalculation({
  cabsData,
  cabs,
  pricing,
  setPricing,
  travelData,
  handleCabsSubmit,
  setCabPayload,
  setFormData,
  cabPayLoad,
  isEditing,
  fetchCabs,
  onCabSelect
}) {
  useEffect(() => {
    // Fetch cabs data only once when component mounts
    fetchCabs();
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Initialize cab pricing data when editing
    if (isEditing && cabsData?.travelPrices) {
      // Initialize pricing from existing data
      setPricing({
        lowestOnSeasonPrice:
          cabsData.travelPrices.prices?.lowestOnSeasonPrice || 0,
        lowestOffSeasonPrice:
          cabsData.travelPrices.prices?.lowestOffSeasonPrice || 0,
      });

      // Initialize cab payload with existing travel prices
      setCabPayload(cabsData.travelPrices);
    }
  }, [isEditing, cabsData, setPricing, setCabPayload]);

  const handleCabSelection = (cabData) => {
    console.log("CabCalculation - Received:", cabData);
    // Pass the data up to HotelCalculation
    onCabSelect(cabData);
  };

  return (
    <div className="container mx-auto ">
      <div className="bg-white rounded-lg overflow-hidden">
        <DayWiseCabPricing
          travelData={travelData}
          setPricing={setPricing}
          cabs={cabs}
          cabPayLoad={cabPayLoad}
          pricing={pricing}
          setCabPayload={setCabPayload}
          setFormData={setFormData}
          isEditing={isEditing}
          cabsData={cabsData}
          onCabSelect={handleCabSelection}
        />
        <div className="flex justify-end items-center p-4">
          <Button
            text={isEditing ? "Update Prices" : "Save and next"}
            cssClassesProps="w-[200px] h-[50px]"
            onClick={handleCabsSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default CabCalculation;
