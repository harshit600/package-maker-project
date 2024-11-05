import React from 'react';
import UpperCabInfo from './UpperCabInfo';
import DayWiseCabPricing from './DayWiseCabPricing';
import Button from '../atoms/Button';

function CabCalculation({ cabsData, cabs, pricing, setPricing, travelData, handleCabsSubmit, setCabPayload, cabPayLoad  }) {
   
    console.log(cabs)
    
    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            {/* Top bar */}
            <div className="bg-gray-200 rounded p-4 text-xl font-semibold mb-4 text-center border-b-2 border-gray-300">
                Cab Price Calculation
            </div>
            <UpperCabInfo cabsData={cabsData} pricing={pricing}/>
            <DayWiseCabPricing travelData={travelData} setPricing={setPricing} cabs={cabs} cabPayLoad={cabPayLoad} setCabPayload={setCabPayload}/>
            <div className='flex justify-end items-center'>
            <Button 
            text="Save and next" 
            cssClassesProps="w-[200px] mb-[30px] mt-[20px] h-[50px]"
            onClick={handleCabsSubmit}
            />
            </div>
        </div>
    );
}

export default CabCalculation;
