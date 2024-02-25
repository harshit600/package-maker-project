import React, { useState } from 'react';
import "../../pages/HotelMaster/hotelmaster.css";

function AmenitiesBox() {
    // Define the amenities data
    const [amenitiesData, setAmenitiesData] = useState([
        {
            id: 0,
            name: 'Basic Facilities',
            options: [
                { id: 0, name: 'Elevator/lift', checked: false },
                { id: 1, name: 'Air conditioning', checked: false },
                { id: 2, name: 'Housekeeping', checked: false },
                { id: 3, name: 'Ironing services', checked: false },
                { id: 4, name: 'Kitchen/Kitchenette', checked: false },
                { id: 5, name: 'LAN', checked: false },
                { id: 6, name: 'Laundry', checked: false },
                { id: 7, name: 'Newspaper', checked: false },
                { id: 8, name: 'Parking', checked: false },
                { id: 9, name: 'Power backup', checked: false },
                { id: 10, name: 'Refrigerator', checked: false },
                { id: 11, name: 'Room service', checked: false },
                { id: 12, name: 'Smoke detector', checked: false },
                { id: 13, name: 'Smoking rooms', checked: false },
                { id: 14, name: 'Swimming Pool', checked: false },
                { id: 15, name: 'Umbrellas', checked: false },
                { id: 16, name: 'Washing Machine', checked: false },
                { id: 17, name: 'Wifi', checked: false },
                { id: 18, name: 'Laundromat', checked: false },
                { id: 19, name: 'EV Charging Station', checked: false }
            ]
        },
        {
            id: 1,
            name: 'General Services',
            options: [
                { id: 0, name: 'Bellboy service', checked: false },
                { id: 1, name: 'Caretaker', checked: false },
                { id: 2, name: 'Concierge', checked: false },
                { id: 3, name: 'Multilingual Staff', checked: false },
                { id: 4, name: 'Luggage assistance', checked: false },
                { id: 5, name: 'Luggage storage', checked: false },
                { id: 6, name: 'Specially abled assistance', checked: false },
                { id: 7, name: 'Wake-up Call / Service', checked: false },
                { id: 8, name: 'Wheelchair', checked: false },
                { id: 9, name: 'Butler Services', checked: false },
                { id: 10, name: 'Doctor on call', checked: false },
                { id: 11, name: 'Medical centre', checked: false },
                { id: 12, name: 'Pool/Beach towels', checked: false }
            ]
        },
        {
            id: 2,
            name: 'Outdoor Activities and Sports',
            options: [
                { id: 0, name: 'Beach', checked: false },
                { id: 1, name: 'Bonfire', checked: false },
                { id: 2, name: 'Golf', checked: false },
                { id: 3, name: 'Kayaks', checked: false },
                { id: 4, name: 'Outdoor sports', checked: false },
                { id: 5, name: 'Snorkelling', checked: false },
                { id: 6, name: 'Telescope', checked: false },
                { id: 7, name: 'Water sports', checked: false },
                { id: 8, name: 'Canoeing', checked: false },
                { id: 9, name: 'Skiing', checked: false },
                { id: 10, name: 'Jungle Safari', checked: false },
                { id: 11, name: 'Cycling', checked: false }
            ]
        },
        {
            id: 3,
            name: 'Common Area',
            options: [
                { id: 0, name: 'Balcony/ Terrace', checked: false },
                { id: 1, name: 'Fireplace', checked: false },
                { id: 2, name: 'Lawn', checked: false },
                { id: 3, name: 'Library', checked: false },
                { id: 4, name: 'Lounge', checked: false },
                { id: 5, name: 'Reception', checked: false },
                { id: 6, name: 'Seating Area', checked: false },
                { id: 7, name: 'Sun Deck', checked: false },
                { id: 8, name: 'Verandah', checked: false },
                { id: 9, name: 'Jacuzzi', checked: false },
                { id: 10, name: 'Prayer Room', checked: false },
                { id: 11, name: 'Living Room', checked: false },
                { id: 12, name: 'Outdoor Furniture', checked: false },
                { id: 13, name: 'Picnic area', checked: false },
                { id: 14, name: 'Game Room', checked: false },
                { id: 15, name: 'Sitout Area', checked: false },
                { id: 16, name: 'Bonfire Pit', checked: false }
            ]
        },
        {
            id: 4,
            name: 'Food and Drink',
            options: [
                { id: 0, name: 'Bar', checked: false },
                { id: 1, name: 'Barbeque', checked: false },
                { id: 2, name: 'Cafe', checked: false },
                { id: 3, name: 'Coffee shop', checked: false },
                { id: 4, name: 'Dining Area', checked: false },
                { id: 5, name: "Kid's Menu", checked: false },
                { id: 6, name: 'Restaurant', checked: false },
                { id: 7, name: 'Bakery', checked: false }
            ]
        },
        {
            id: 5,
            name: 'Health and Wellness',
            options: [
                { id: 0, name: 'Activity Centre', checked: false },
                { id: 1, name: 'Gym/ Fitness centre', checked: false },
                { id: 2, name: 'Reflexology', checked: false },
                { id: 3, name: 'Yoga', checked: false },
                { id: 4, name: 'Meditation Room', checked: false },
                { id: 5, name: 'First-aid services', checked: false }
            ]
        },
        {
            id: 6,
            name: 'Business Center and Conferences',
            options: [
                { id: 0, name: 'Banquet', checked: false },
                { id: 1, name: 'Business Center', checked: false },
                { id: 2, name: 'Conference room', checked: false },
                { id: 3, name: 'Photocopying', checked: false },
                { id: 4, name: 'Fax service', checked: false },
                { id: 5, name: 'Printer', checked: false }
            ]
        },
        {
            id: 7,
            name: 'Beauty and Spa',
            options: [
                { id: 0, name: 'Massage', checked: false },
                { id: 1, name: 'Salon', checked: false },
                { id: 2, name: 'Spa', checked: false },
                { id: 3, name: 'Steam and Sauna', checked: false },
                { id: 4, name: 'Open air bath', checked: false },
                { id: 5, name: 'Hammam', checked: false }
            ]
        },
        {
            id: 8,
            name: 'Security',
            options: [
                { id: 0, name: 'CCTV', checked: false },
                { id: 1, name: 'Fire extinguishers', checked: false },
                { id: 2, name: 'Security alarms', checked: false },
                { id: 3, name: 'Security Guard', checked: false },
                { id: 4, name: 'Carbon Monoxide Detector', checked: false }
            ]
        },
        {
            id: 9,
            name: 'Transfers',
            options: [
                { id: 0, name: 'Airport Transfers', checked: false },
                { id: 1, name: 'Shuttle Service', checked: false }
            ]
        },
        {
            id: 10,
            name: 'Shopping',
            options: [
                { id: 0, name: 'Book shop', checked: false },
                { id: 1, name: 'Souvenir shop', checked: false },
                { id: 2, name: 'Jewellery Shop', checked: false }
            ]
        },
        {
            id: 11,
            name: 'Entertainment',
            options: [
                { id: 0, name: 'Movie Room', checked: false },
                { id: 1, name: 'Music System', checked: false },
                { id: 2, name: 'Events', checked: false },
                { id: 3, name: 'Pub', checked: false },
                { id: 4, name: 'Professional Photography', checked: false },
                { id: 5, name: 'Night Club', checked: false },
                { id: 6, name: 'Beach club', checked: false },
                { id: 7, name: 'Water Park', checked: false }
            ]
        },
        {
            id: 12,
            name: 'Payment Services',
            options: [
                { id: 0, name: 'ATM', checked: false },
                { id: 1, name: 'Currency Exchange', checked: false }
            ]
        },
        {
            id: 13,
            name: 'Indoor Activities and Sports',
            options: [
                { id: 0, name: 'Casino', checked: false },
                { id: 1, name: 'Indoor games', checked: false }
            ]
        },
        {
            id: 14,
            name: 'Family and Kids',
            options: [
                { id: 0, name: 'Childcare service', checked: false },
                { id: 1, name: "Children's play area", checked: false },
                { id: 2, name: "Kids' Club", checked: false },
                { id: 3, name: 'Strollers', checked: false }
            ]
        },
        {
            id: 15,
            name: 'Pet Essentials',
            options: [
                { id: 0, name: 'Pet bowls', checked: false },
                { id: 1, name: 'Pet baskets', checked: false }
            ]
        }
        // Add more categories as needed
    ]);

    // State to track the selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState(0);

    // Function to handle selection of category
    const handleCategoryClick = (categoryId) => {
        setSelectedCategoryId(categoryId);
    };

    // Function to handle checkbox selection
    const handleCheckboxChange = (categoryId, optionId) => {
        const updatedData = amenitiesData.map(category => {
            if (category.id === categoryId) {
                const updatedOptions = category.options.map(option => {
                    if (option.id === optionId) {
                        return { ...option, checked: !option.checked };
                    }
                    return option;
                });
                return { ...category, options: updatedOptions };
            }
            return category;
        });
        setAmenitiesData(updatedData);
    };

    // Get the selected category
    const selectedCategory = amenitiesData.find(category => category.id === selectedCategoryId);

    console.log(amenitiesData)

    return (
        <div className='amenitiesbox'>
            <div className='amenitiesboxheading'>
                <h3 className='text-bold pb-3'>ALL AMENITIES</h3>
            </div>
            <div className="amenities-container flex">
                {/* Left side: Amenity categories */}
                <div className="amenity-categories">
                    {amenitiesData.map(category => (
                        <div
                            key={category.id}
                            className={`amenity-category ${selectedCategoryId === category.id ? 'selected' : ''}`}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            {category.name} ({category.options.filter(option => option.checked).length})
                        </div>
                    ))}
                </div>

                {/* Right side: Amenity options */}
                <div className="amenity-options">
                    {selectedCategory.options.map(option => (
                        <div key={option.id} className="amenity-option">
                            <input
                                type="checkbox"
                                id={`option-${option.id}`}
                                checked={option.checked}
                                onChange={() => handleCheckboxChange(selectedCategoryId, option.id)}
                            />
                            <label htmlFor={`option-${option.id}`}>{option.name}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AmenitiesBox;
