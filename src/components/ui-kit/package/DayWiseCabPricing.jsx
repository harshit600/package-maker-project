import React, { useState, useEffect } from 'react';

function DayWiseCabPricing({ 
    travelData = {}, 
    cabs, 
    cabPayLoad, 
    setCabPayload, 
    setFormData, 
    pricing, 
    setPricing, 
    isEditing,
    cabsData 
}) {
    const [prices, setPrices] = useState({});

    // Initialize prices and calculate totals when component mounts or cabPayLoad changes
    useEffect(() => {
        if (cabPayLoad?.prices) {
            setPrices(cabPayLoad.prices);
            
            // Calculate initial totals
            let totalOnSeason = 0;
            let totalOffSeason = 0;
            Object.values(cabPayLoad.prices).forEach(price => {
                if (price.onSeasonPrice) totalOnSeason += parseFloat(price.onSeasonPrice || 0);
                if (price.offSeasonPrice) totalOffSeason += parseFloat(price.offSeasonPrice || 0);
            });

            setPricing({
                lowestOnSeasonPrice: totalOnSeason,
                lowestOffSeasonPrice: totalOffSeason
            });
        } else if (cabs) {
            const initialPrices = {};
            Object.entries(cabs).forEach(([cabType, cabsOfType]) => {
                cabsOfType.forEach(cab => {
                    initialPrices[cab.cabName] = {
                        onSeasonPrice: "",
                        offSeasonPrice: "",
                        _id: cab._id
                    };
                });
            });
            setPrices(initialPrices);
        }
    }, [cabPayLoad, cabs]);

    const handlePriceChange = (cabName, field, value) => {
        const updatedPrices = {
            ...prices,
            [cabName]: {
                ...prices[cabName],
                [field]: value,
                _id: prices[cabName]?._id || cabs?.[Object.keys(cabs)[0]]?.find(cab => cab.cabName === cabName)?._id
            }
        };

        setPrices(updatedPrices);

        // Calculate totals
        let totalOnSeason = 0;
        let totalOffSeason = 0;
        Object.values(updatedPrices).forEach(price => {
            if (price.onSeasonPrice) totalOnSeason += parseFloat(price.onSeasonPrice || 0);
            if (price.offSeasonPrice) totalOffSeason += parseFloat(price.offSeasonPrice || 0);
        });

        setPricing({
            lowestOnSeasonPrice: totalOnSeason,
            lowestOffSeasonPrice: totalOffSeason
        });

        setCabPayload(prev => ({
            ...prev,
            prices: updatedPrices,
            travelInfo: travelData
        }));
    };

    return (
        <div className="p-4 mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
                <h1 className="text-2xl font-bold">Cab Price Configuration</h1>
                <p className="text-blue-100 mt-2">Set your cab prices for different seasons and routes</p>
            </div>

            {/* Route Info and Price Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Route Information Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <span className="mr-2">📍</span>
                        Route Information
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="w-24 text-gray-500">Pickup:</div>
                            <div className="font-medium text-gray-800 capitalize">{cabsData?.pickupLocation}</div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-24 text-gray-500">Drop:</div>
                            <div className="font-medium text-gray-800 capitalize">{cabsData?.dropLocation}</div>
                        </div>
                        {cabsData?.packagePlaces?.map((place, index) => (
                            <div key={index} className="flex items-start">
                                <div className="w-24 text-gray-500">Stop {index + 1}:</div>
                                <div className="font-medium text-gray-800 capitalize">{place.placeCover}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Summary Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <span className="mr-2">💰</span>
                        Price Summary
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">On Season Price:</span>
                            <span className="font-semibold text-blue-600">₹{pricing?.lowestOnSeasonPrice || 0}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Off Season Price:</span>
                            <span className="font-semibold text-blue-600">₹{pricing?.lowestOffSeasonPrice || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Travel Route Overview */}
            <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                    <span className="mr-2">🛣️</span>
                    Travel Route Overview
                </h4>
                <div className="space-y-3">
                    {Array.isArray(travelData) && travelData.map((route, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                            <div className="flex-1 flex items-center">
                                <span className="font-medium text-gray-700 capitalize">{route[0]}</span>
                                <div className="mx-4 flex-1 border-t-2 border-dashed border-gray-300 relative">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="font-medium text-gray-700 capitalize">{route[1]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cab Types Section */}
            <div className="space-y-8">
                {cabs && Object.entries(cabs).map(([cabType, cabsOfType]) => (
                    <div key={cabType} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                            <span className="mr-2">🚗</span>
                            {cabType}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cabsOfType.map((cab) => (
                                <div key={cab._id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center mb-4">
                                        <div className="relative w-16 h-16 mr-4">
                                            <img 
                                                src={cab.cabImages[0]} 
                                                alt={cab.cabName}
                                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{cab.cabName}</h4>
                                            <p className="text-sm text-gray-500">{cabType}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                On Season Price (₹)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={prices[cab.cabName]?.onSeasonPrice || ""}
                                                    onChange={(e) => handlePriceChange(cab.cabName, 'onSeasonPrice', e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Off Season Price (₹)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={prices[cab.cabName]?.offSeasonPrice || ""}
                                                    onChange={(e) => handlePriceChange(cab.cabName, 'offSeasonPrice', e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Price Summary */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
                <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <span className="mr-2">💰</span>
                    Total Price Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-gray-500">On Season Total</span>
                                <div className="text-2xl font-bold text-blue-600">₹{pricing?.lowestOnSeasonPrice || 0}</div>
                            </div>
                            <div className="text-3xl text-blue-500">🌞</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-gray-500">Off Season Total</span>
                                <div className="text-2xl font-bold text-blue-600">₹{pricing?.lowestOffSeasonPrice || 0}</div>
                            </div>
                            <div className="text-3xl text-blue-500">❄️</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DayWiseCabPricing;
