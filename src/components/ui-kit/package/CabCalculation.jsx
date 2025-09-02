import React, { useEffect, useState } from "react";
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
}) {
  // Track selected cabs
  const [selectedCabs, setSelectedCabs] = useState({});

  useEffect(() => {
    fetchCabs();
  }, []);

  const handleSaveAndNext = () => {
    // Get all available cabs data organized by type
    const allCabsData = {};
    Object.keys(cabs || {}).forEach(cabType => {
      allCabsData[cabType] = cabs[cabType].map(cab => ({
        cabId: cab._id,
        cabName: cab.cabName,
        cabType: cab.cabType,
        seatingCapacity: cab.cabSeatingCapacity,
        luggage: cab.cabLuggage,
        // Include prices if available in cabPayLoad
        prices: cabPayLoad?.prices?.[cab.cabName] || null,
        // Include season dates
        seasonDates: cabPayLoad?.seasonDates?.[cab.cabName] || {
          onSeason: [],
          offSeason: []
        }
      }));
    });

    // Filter selected cabs to include only those with both on-season and off-season prices
    const selectedCabsData = {};
    if (cabPayLoad?.prices) {
      Object.keys(cabs || {}).forEach(cabType => {
        const selectedOfType = cabs[cabType].filter(cab => {
          const prices = cabPayLoad.prices[cab.cabName];
          return prices && prices.onSeasonPrice && prices.offSeasonPrice;
        });

        if (selectedOfType.length > 0) {
          selectedCabsData[cabType] = selectedOfType.map(cab => ({
            cabId: cab._id,
            cabName: cab.cabName,
            cabType: cab.cabType,
            seatingCapacity: cab.cabSeatingCapacity,
            luggage: cab.cabLuggage,
            prices: cabPayLoad.prices[cab.cabName],
            // Include season dates for selected cabs
            seasonDates: cabPayLoad.seasonDates?.[cab.cabName] || {
              onSeason: [],
              offSeason: []
            }
          }));
        }
      });
    }

    // Create final cab data object with both all cabs and selected cabs
    const finalCabData = {
      travelPrices: {
        prices: {
          lowestOnSeasonPrice: pricing.lowestOnSeasonPrice,
          lowestOffSeasonPrice: pricing.lowestOffSeasonPrice
        },
        selectedCabs: selectedCabsData,
        // allCabs: allCabsData, // Add all cabs data
        travelInfo: Object.entries(travelData).map(([_, route]) => ({
          from: route[0],
          to: route[1]
        }))
      }
    };

    // Pass the complete data to parent
    handleCabsSubmit(finalCabData);
  };

  return (
    <div className="container mx-auto">
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
        />
        <div className="flex justify-end items-center p-4">
          <Button
            text={isEditing ? "Update Prices" : "Save and next"}
            cssClassesProps="w-[200px] h-[50px]"
            onClick={handleSaveAndNext}
          />
        </div>
      </div>
    </div>
  );
}

export default CabCalculation;
