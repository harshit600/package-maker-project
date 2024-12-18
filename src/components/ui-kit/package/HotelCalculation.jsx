import React, { useEffect, useState } from 'react';
import config from '../../../../config';
import Button from '../atoms/Button';

function HotelCalculation({ travelData, cabsData, isEditing, editId, existingHotels }) {
  console.log("existingHotels", existingHotels);
    const [selectedHotels, setSelectedHotels] = useState({});
    console.log("selectedHotels", selectedHotels);
    const [hotels, setHotels] = useState({});
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState({
        onSeason: 0,
        offSeason: 0
    });

    // Initialize selected hotels from existing data
    useEffect(() => {
        if (existingHotels && Array.isArray(existingHotels)) {
            const hotelSelections = {};
            existingHotels.forEach(hotel => {
                hotelSelections[hotel.day] = {
                    city: hotel.city,
                    hotel: {
                        basicInfo: {
                            propertyName: hotel.hotelName
                        }
                    },
                    night: 1,
                    totalNights: 1,
                    photosAndVideos: ""
                };
            });
            setSelectedHotels(hotelSelections);
        }
    }, [existingHotels]);

    // Fetch hotels for each city
    useEffect(() => {
        const fetchHotels = async () => {
            if (!travelData || !Array.isArray(travelData)) return;
            
            setLoading(true);
            const hotelData = {};
            
            // Get unique cities
            const cities = [...new Set(travelData.map(item => item.city))];

            // need a function which make first letter capital of cities
            const capitalizeFirstLetter = (city) => {
                return city.charAt(0).toUpperCase() + city.slice(1);
            }
            
            for (const city of cities) {
                try {
                    const response = await fetch(`${config.API_HOST}/api/property/get-hotels-by-city/${capitalizeFirstLetter(city)}`);
                    const data = await response.json();
                    if (data.data && Array.isArray(data.data)) {
                        hotelData[city] = data.data;
                    }
                } catch (error) {
                    console.error('Error fetching hotels for city:', city, error);
                }
            }
            
            setHotels(hotelData);
            setLoading(false);
        };

        fetchHotels();
    }, [travelData]);

    // Generate day-wise city data
    const generateDayWiseCities = () => {
        let dayWiseData = [];
        let currentDay = 1;

        travelData.forEach(cityData => {
            for (let night = 0; night < cityData.nights; night++) {
                dayWiseData.push({
                    day: currentDay,
                    city: cityData.city,
                    totalNights: cityData.nights,
                    currentNight: night + 1
                });
                currentDay++;
            }
        });

        return dayWiseData;
    };

    const dayWiseCities = generateDayWiseCities();

    const handleHotelSelect = (day, cityData, hotel) => {
        setSelectedHotels(prev => ({
            ...prev,
            [day]: {
                city: cityData.city,
                hotel,
                night: cityData.currentNight,
                totalNights: cityData.totalNights,
                photosAndVideos: hotel.photosAndVideos
            }
        }));

        calculateTotalPrice({
            ...selectedHotels,
            [day]: {
                city: cityData.city,
                hotel,
                night: cityData.currentNight,
                totalNights: cityData.totalNights
            }
        });
    };

    const calculateTotalPrice = (selections) => {
        const total = {
            onSeason: 0,
            offSeason: 0
        };

        Object.values(selections).forEach(({ hotel }) => {
            if (hotel && hotel.onSeasonPrice && hotel.offSeasonPrice) {
                total.onSeason += parseFloat(hotel.onSeasonPrice);
                total.offSeason += parseFloat(hotel.offSeasonPrice);
            }
        });

        setTotalPrice(total);
    };

    const handleSubmit = async () => {
        try {
            const url = `${config.API_HOST}/api/packages/${editId}/hotels`;
            const payload = {
                selectedHotels: Object.entries(selectedHotels).map(([day, { city, hotel }]) => ({
                    day,
                    city,
                    hotelName: hotel.basicInfo.propertyName
                }))
            };

            console.log("Payload", payload);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data) {
                window.location.href = `/ `;
            }
        } catch (error) {
            console.error('Error saving hotels:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading hotels...</div>;
    }

    if (!dayWiseCities || dayWiseCities.length === 0) {
        return <div className="flex justify-center items-center h-64">No travel data available</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-bold mb-6">Hotel Selection</h2>
            
            {/* Day-wise hotel selection */}
            <div className="space-y-8">
                {dayWiseCities.map((dayData) => (
                    <div key={dayData.day} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-4">
                            Day {dayData.day} - {dayData.city}
                            <span className="text-sm text-gray-600 ml-2">
                                (Night {dayData.currentNight} of {dayData.totalNights})
                            </span>
                            {selectedHotels[dayData.day] && (
                                <span className="text-green-600 ml-2">
                                    Selected: {selectedHotels[dayData.day].hotel.basicInfo.propertyName}
                                </span>
                            )}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4">
                            {hotels[dayData.city]?.map((hotel) => (
                                <div 
                                    key={hotel._id}
                                    className={`border rounded-lg w-[300px] overflow-hidden cursor-pointer transition-all
                                        ${selectedHotels[dayData.day]?.hotel?.basicInfo?.propertyName === hotel.basicInfo.propertyName
                                            ? 'border-blue-500 ring-2 ring-blue-200' 
                                            : 'border-gray-200 hover:border-blue-300'}`}
                                    onClick={() => handleHotelSelect(dayData.day, dayData, hotel)}
                                >
                                    {/* Hotel Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={hotel.photosAndVideos?.images[0]} 
                                            alt={hotel.basicInfo.propertyName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
                                            {hotel.basicInfo.hotelStarRating}
                                        </div>
                                    </div>

                                    {/* Hotel Info */}
                                    <div className="p-4">
                                        <h4 className="font-semibold text-lg mb-2">
                                            {hotel.basicInfo.propertyName}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {hotel.basicInfo.propertyDescription}
                                        </p>

                                        <div className="space-y-1 text-sm">
                                            <p className="flex items-center justify-between">
                                                <span>Built Year:</span>
                                                <span className="font-medium">{hotel.basicInfo.propertyBuiltYear}</span>
                                            </p>
                                            <p className="flex items-center justify-between">
                                                <span>Booking Since:</span>
                                                <span className="font-medium">{hotel.basicInfo.bookingSinceYear}</span>
                                            </p>
                                            {hotel.onSeasonPrice && (
                                                <p className="flex items-center justify-between text-green-600">
                                                    <span>On Season:</span>
                                                    <span className="font-medium">₹{hotel.onSeasonPrice}/night</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Section */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Selected Hotels Summary</h3>
                <div className="space-y-4">
                    {Object.entries(selectedHotels).map(([day, { city, hotel, night, totalNights }]) => (
                        <div key={day} className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center space-x-4">
                               
                                <div>
                                    <p className="font-medium">Day {day} - {city}</p>
                                    <p className="text-sm text-gray-600">
                                        {hotel.basicInfo.propertyName} (Night {night} of {totalNights})
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <Button
                    text="Save"
                    cssClassesProps="w-[200px] h-[50px]"
                    onClick={handleSubmit}
                />
            </div>
        </div>
    );
}

export default HotelCalculation;