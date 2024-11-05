import React from 'react';

function UpperCabInfo({ cabsData, pricing }) {


    return (
        <div className="grid grid-cols-4 gap-4">
            {/* Pickup Location Card */}
            <div className="flex flex-col justify-center items-center p-4 bg-gray-100 border rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                <span className="text-gray-600">Pickup </span>
                <div className="text-2xl font-bold text-blue-600">
                    {cabsData?.pickupLocation?.toUpperCase() || 'Not Specified'}
                </div>
            </div>
            
            {/* Drop Location Card */}
            <div className="flex flex-col justify-center items-center p-4 bg-gray-100 border rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                <span className="text-gray-600">Drop </span>
                <div className="text-2xl font-bold text-blue-600">
                    {cabsData?.dropLocation?.toUpperCase() || 'Not Specified'}
                </div>
            </div>

            {/* Duration of Package Card */}
            <div className="flex flex-col justify-center items-center p-4 bg-gray-100 border rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
                <span className="text-gray-600">Duration</span>
                <div className="text-2xl font-bold text-blue-600">
                    {cabsData?.duration || 'Not Specified'}
                </div>
            </div>

            {/* Total Prices Card */}
            <div className="p-4 bg-gray-100 border rounded-lg shadow-md">
                <h3 className="text-lg text-center text-gray-600">Prices</h3>
               
                            <div className="flex justify-between gap-2">
                                <div>On-Season: <div className='text-2xl font-bold text-blue-600'>₹{pricing?.lowestOnSeasonPrice}</div></div>
                                <div>Off-Season: <div className='text-2xl font-bold text-blue-600'>₹{pricing?.lowestOffSeasonPrice}</div></div>
                            </div>
                        </div>
      
     
        </div>
    );
}

export default UpperCabInfo;
