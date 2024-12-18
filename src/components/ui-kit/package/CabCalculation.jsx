import React, { useEffect } from 'react';
import UpperCabInfo from './UpperCabInfo';
import DayWiseCabPricing from './DayWiseCabPricing';
import Button from '../atoms/Button';

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
  fetchCabs 
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
        lowestOnSeasonPrice: cabsData.travelPrices.prices?.lowestOnSeasonPrice || 0,
        lowestOffSeasonPrice: cabsData.travelPrices.prices?.lowestOffSeasonPrice || 0
      });

      // Initialize cab payload with existing travel prices
      setCabPayload(cabsData.travelPrices);
    }
  }, [isEditing, cabsData, setPricing, setCabPayload]);

  return (
    <div className="container mx-auto px-4">
      <div className="bg-gray-200 rounded p-4 text-xl font-semibold mb-4 text-center border-b-2 border-gray-300">
        {isEditing ? 'Edit Cab Prices' : 'Cab Price Calculation'}
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <UpperCabInfo 
          cabsData={cabsData} 
          pricing={pricing}
          isEditing={isEditing}
        />
        <DayWiseCabPricing 
          travelData={travelData} 
          setPricing={setPricing} 
          cabs={cabs} 
          cabPayLoad={cabPayLoad} 
          pricing={pricing}
          setCabPayload={setCabPayload} 
          setFormData={setFormData}
          isEditing={isEditing}
        />
        <div className='flex justify-end items-center p-4'>
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
