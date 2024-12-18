import React, { useEffect, useState } from "react";
import Button from "../atoms/Button";

function DayWiseCabPricing({ travelData = {}, cabs, cabPayLoad, setCabPayload, setFormData, pricing,  setPricing, isEditing }) {
    const [prices, setPrices] = useState({});

    useEffect(() => {
        // Initialize data when editing
        if (isEditing && cabPayLoad?.prices) {
            setPrices(cabPayLoad.prices);
        }
    }, [isEditing, cabPayLoad]);

    // Initialize prices for all cabs
    useEffect(() => {
        if (cabs) {
            const initialPrices = {};
            Object.entries(cabs).forEach(([cabType, cabsOfType]) => {
                cabsOfType.forEach(cab => {
                    // If editing and price exists, use it; otherwise set empty
                    if (isEditing && cabPayLoad?.prices?.[cab.cabName]) {
                        initialPrices[cab.cabName] = cabPayLoad.prices[cab.cabName];
                    } else {
                        initialPrices[cab.cabName] = {
                            onSeasonPrice: "",
                            offSeasonPrice: "",
                            _id: cab._id
                        };
                    }
                });
            });
            setPrices(initialPrices);
        }
    }, [cabs, isEditing, cabPayLoad]);

    const handlePriceChange = (cabName, field, value) => {
        const updatedPrices = {
            ...prices,
            [cabName]: {
                ...prices[cabName],
                [field]: value,
                _id: prices[cabName]?._id
            }
        };

        setPrices(updatedPrices);

        // Calculate totals
        let totalOnSeason = 0;
        let totalOffSeason = 0;
        Object.values(updatedPrices).forEach(price => {
            if (price.onSeasonPrice) totalOnSeason += parseFloat(price.onSeasonPrice);
            if (price.offSeasonPrice) totalOffSeason += parseFloat(price.offSeasonPrice);
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
        <div className="p-6">
            {/* Travel Route Summary */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-gray-700">Travel Route</h4>
                <div className="space-y-2">
                    {Array.isArray(travelData) && travelData.map((route, index) => (
                        <div key={index} className="flex items-center text-gray-600">
                            <span className="font-medium">{route[0]}</span>
                            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="font-medium">{route[1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cab Types Section */}
            {cabs && Object.entries(cabs).map(([cabType, cabsOfType]) => (
                <div key={cabType} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">{cabType}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cabsOfType.map((cab) => (
                            <div key={cab._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center mb-4">
                                    <span className="text-xl">🚗</span>
                                    <h4 className="font-medium ml-2 text-gray-800">{cab.cabName}</h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            On Season Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={prices[cab.cabName]?.onSeasonPrice || ""}
                                            onChange={(e) => handlePriceChange(cab.cabName, 'onSeasonPrice', e.target.value)}
                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter price"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Off Season Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={prices[cab.cabName]?.offSeasonPrice || ""}
                                            onChange={(e) => handlePriceChange(cab.cabName, 'offSeasonPrice', e.target.value)}
                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter price"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Price Summary */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h4 className="font-semibold mb-4 text-gray-800">Total Price Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-600">Total On Season Price</span>
                        <div className="text-2xl font-bold text-blue-600">₹{pricing?.lowestOnSeasonPrice || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <span className="text-sm text-gray-600">Total Off Season Price</span>
                        <div className="text-2xl font-bold text-blue-600">₹{pricing?.lowestOffSeasonPrice || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DayWiseCabPricing;
