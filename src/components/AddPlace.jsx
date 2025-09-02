import React, { useState } from 'react';
import { FaPlus, FaMapMarkerAlt, FaClock, FaRupeeSign, FaTimes } from 'react-icons/fa';
import config from '../../config';

const AddPlace = ({ day, onUpdatePlaces, selectedPackage }) => {
    const [showCityModal, setShowCityModal] = useState(false);
    const [matchedCities, setMatchedCities] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const cityAreas = day.selectedItinerary?.cityArea || [];

    // Get the selected cab details from the package
    const selectedCab = selectedPackage?.cabs?.selectedCab;
    const cabQuantity = selectedPackage?.cabs?.quantity || 1;

    // Function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Modify the place cost display to show total cost based on cab quantity
    const getPlaceCost = (place) => {
        if (!place.cost || !selectedCab) return null;
        const cabCost = place.cost[selectedCab.cabType] || 0;
        return cabCost ;
    };

    // Function to fetch places for the current city
    const fetchPlacesForCity = async () => {
        try {
            const response = await fetch(
                `${config.API_HOST}/api/places/fetchAllPlaces`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Get currently selected places for this day
            const existingPlaces = cityAreas || [];
            
            // Filter out places that are already selected
            const filteredCities = data
                .filter(item => item.city === day.selectedItinerary?.cityName)
                .filter(item => !existingPlaces.some(existing => 
                    existing.placeName === item.placeName || existing === item.placeName
                ));
            
        
            // Set matched cities and show modal only if there are new places to add
            if (filteredCities.length > 0) {
                setMatchedCities(filteredCities);
            } else {
                // Show a message if no new places are available
                alert("All available places for this city have already been added.");
                setShowCityModal(false);
            }
            
        } catch (error) {
            alert("Error fetching places. Please try again.");
        }
    };

    // Function to handle city selection
    const handleCitySelection = (city) => {
        setSelectedCities(prev => {
            if (prev.some(item => item._id === city._id)) {
                return prev.filter(item => item._id !== city._id);
            } else {
                return [...prev, city];
            }
        });
    };

    // Function to add selected places to the day's itinerary
    const addSelectedPlacesToDay = () => {
        // Format new places
        const newPlaces = selectedCities.map(city => ({
            placeName: city.placeName,
            type: 'manual',
            description: city.description || '',
            cost: city.cost || { SUV: '', Sedan: '', Traveller: '' },
            paid: city.paid || false,
            price: city.price || 0,
            imageUrls: city.imageUrls || [],
            city: city.city,
            distance: city.distance,
            time: city.time,
            status: city.enabled ? 'enabled' : 'disabled'
        }));

        // Create updated day object
        const updatedDay = {
            ...day,
            selectedItinerary: {
                ...day.selectedItinerary,
                cityArea: [...cityAreas, ...newPlaces]
            }
        };

        // Call the parent update function
        onUpdatePlaces(updatedDay);

        // Close modal and reset selection
        setShowCityModal(false);
        setSelectedCities([]);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Places Header */}
            <div className="bg-[rgb(45,45,68)] text-white px-4 py-2 border-b">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FaMapMarkerAlt className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-lg">
                                Places to Visit in {day.selectedItinerary?.cityName}
                            </h3>
                            <p className="text-gray-300 text-sm">Day {day.day}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setShowCityModal(true);
                            fetchPlacesForCity();
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add Place
                    </button>
                </div>
            </div>

            {/* Places Content */}
            <div className="p-6">
                {cityAreas.length > 0 ? (
                    <div className="space-y-4">
                        {cityAreas.map((place, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                            {place.placeName || place}
                                        </h4>
                                        {place.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {place.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                            {place.distance && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <FaMapMarkerAlt className="mr-1" />
                                                    {place.distance} km
                                                </div>
                                            )}
                                            {place.time && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <FaClock className="mr-1" />
                                                    {place.time} mins
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {place.cost && selectedCab && (
                                        <div className="text-right">
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                <div className="text-sm text-gray-500">
                                                    <p>Cab: {selectedCab.cabName}</p>
                                                    <p>Quantity: {cabQuantity}</p>
                                                </div>
                                                <p className="font-medium text-lg">
                                                    {formatCurrency(getPlaceCost(place))}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaMapMarkerAlt className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Places Added</h4>
                        <p className="text-gray-500">Add sightseeing locations for this day</p>
                    </div>
                )}
            </div>

            {/* Add Places Modal */}
            {showCityModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Select Places to Add</h3>
                                <button 
                                    onClick={() => setShowCityModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {matchedCities.map(city => {
                                    const totalCost = getPlaceCost(city);
                                    const hasCost = totalCost !== null;
                                    
                                    return (
                                        <div 
                                            key={city._id}
                                            className={`border rounded-lg p-4 mb-3 cursor-pointer ${
                                                selectedCities.some(item => item._id === city._id) 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : hasCost 
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200'
                                            }`}
                                            onClick={() => {
                                                if (hasCost) {
                                                    if (window.confirm(
                                                        `This place has the following cost:\n` +
                                                        `${selectedCab.cabName} (x${cabQuantity}): ${formatCurrency(totalCost)}\n\n` +
                                                        `Do you want to add this place?`
                                                    )) {
                                                        handleCitySelection(city);
                                                    }
                                                } else {
                                                    handleCitySelection(city);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedCities.some(item => item._id === city._id)}
                                                        readOnly
                                                        className="mt-1 h-4 w-4 mr-3"
                                                    />
                                                    <h4 className="font-medium inline-block">
                                                        {city.placeName}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {city.description || 'No description'}
                                                    </p>
                                                </div>
                                                
                                                {hasCost && (
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <div className="text-sm text-gray-500">
                                                            <p>Cab: {selectedCab.cabName}</p>
                                                            <p>Quantity: {cabQuantity}</p>
                                                        </div>
                                                        <p className="font-medium text-lg mt-1">
                                                            {formatCurrency(totalCost)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end space-x-3 mt-4 pt-3 border-t">
                                <button
                                    onClick={() => setShowCityModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addSelectedPlacesToDay}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={selectedCities.length === 0}
                                >
                                    Add Selected Places
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPlace;
