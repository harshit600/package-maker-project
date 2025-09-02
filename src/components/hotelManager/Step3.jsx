import React, { useState, useEffect } from "react";
import { Radio, Typography, Card, CardBody, CardHeader } from "@material-tailwind/react";

const amenitiesData = {
  mandatory: [
    "Air Conditioning", "Laundry", "Newspaper", "Parking",
    "Room service", "Smoke detector", "Smoking rooms",
    "Swimming Pool", "Wifi", "Lounge", "Reception", "Bar",
    "Restaurant", "Luggage assistance", "Wheelchair",
    "Gym/ Fitness centre", "CCTV", "Fire extinguishers",
    "Airport Transfers", "First-aid services"
  ],
  basicFacilities: [
    "Elevator/ Lift", "Housekeeping", "Kitchen/Kitchenette", "LAN",
    "Power backup", "Refrigerator", "Umbrellas", "Washing Machine",
    "Laundromat", "EV Charging Station", "Driver's Accommodation"
  ],
  generalServices: [
    "Bellboy service", "Caretaker", "Concierge", "Multilingual Staff",
    "Luggage storage", "Specially abled assistance", "Wake-up Call / Service",
    "Butler Services", "Doctor on call", "Medical centre", "Pool/ Beach towels"
  ],
  outdoorActivitiesAndSports: [
    "Beach", "Bonfire", "Golf", "Kayaks", "Canoeing", "Outdoor sports",
    "Snorkelling", "Telescope", "Water sports", "Skiing", "Jungle Safari", "Cycling"
  ],
  commonArea: [
    "Balcony/ Terrace", "Fireplace", "Lawn", "Library",
    "Seating Area", "Sun Deck", "Verandah", "Jacuzzi"
  ],
  foodAndDrink: [
    "Dining Area", "Kitchen"
  ],
  healthAndWellness: [
    "Gym", "Spa", "Sauna"
  ],
  businessCenterAndConferences: [
    "Meeting Room", "Conference Hall"
  ],
  beautyAndSpa: [
    "Beauty Services", "Spa Services"
  ],
  security: [
    "CCTV", "Fire extinguishers"
  ],
  transfers: [
    "Airport Transfer", "Shuttle Service"
  ],
  entertainment: [
    "Game Room", "TV"
  ],
  shopping: [
    "Gift Shop", "Mini Market"
  ],
  paymentServices: [
    "Card Payment", "Online Payment"
  ],
  indoorActivitiesAndSports: [
    "Indoor Pool", "Table Tennis"
  ],
  familyAndKids: [
    "Kids Play Area", "Babysitting"
  ],
  petEssentials: [
    "Pet Friendly", "Pet Food"
  ]
};

const categories = [
  "mandatory", "basicFacilities", "generalServices",
  "outdoorActivitiesAndSports", "commonArea",
  "foodAndDrink", "healthAndWellness", 
  "businessCenterAndConferences", "beautyAndSpa",
  "security", "transfers", "entertainment", 
  "shopping", "paymentServices", 
  "indoorActivitiesAndSports", "familyAndKids", 
  "petEssentials"
];

export default function Step3({ formData, setFormData }) {
  const [selectedCategory, setSelectedCategory] = useState("mandatory");

  // Ensure selected amenities are initialized from formData
  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    // Initialize selectedAmenities with default empty values for each category
    const initializedAmenities = Object.fromEntries(
      categories.map(category => [
        category,
        formData.amenities[category] || Object.fromEntries(
          amenitiesData[category]?.map(amenity => [amenity, ""]) || []
        )
      ])
    );
    return initializedAmenities;
  });

  useEffect(() => {
    // Update formData with selected amenities
    setFormData(prevFormData => ({
      ...prevFormData,
      amenities: selectedAmenities
    }));
  }, [selectedAmenities, setFormData]);

  const handleAmenitySelection = (category, amenity, value) => {
    setSelectedAmenities(prevState => {
      const updatedState = {
        ...prevState,
        [category]: {
          ...prevState[category],
          [amenity]: value,
        }
      };
      return updatedState;
    });
  };

  const formatCategory = (category) => {
    return category
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <Card className="w-full mx-auto border border-gray-200">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 px-4">
          <Typography variant="h4" color="blue-gray">
            Property Amenities
          </Typography>
          <Typography color="gray" className="mt-1 font-normal">
            Please select all the amenities available at your property
          </Typography>
        </div>
      </CardHeader>
      <CardBody className="px-0 pt-0">
        <Card className="rounded-none shadow-none">
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="mb-2">
              All Amenities
            </Typography>
            <Typography color="gray" className="mb-4 font-normal">
              Answering the amenities available at your property can significantly influence guests to book! Please answer the Mandatory Amenities available below.
            </Typography>
            <div className="flex border-gray-500">
              <div className="w-1/4 bg-gray-50 border border-gray-300">
                {categories.map((category, index) => (
                  <div 
                    key={index} 
                    className={`py-4 px-4 cursor-pointer ${selectedCategory === category ? 'bg-gray-200' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Typography className="text-md text-gray-800 font-bold">
                      {formatCategory(category)}
                    </Typography>
                  </div>
                ))}
              </div>
              <div className="w-3/4 pl-4">
                {amenitiesData[selectedCategory]?.map((amenity, index) => (
                  <div key={index} className="mb-4 flex items-center justify-between border-b pb-2">
                    <Typography className="font-medium text-sm text-gray-600">{amenity}</Typography>
                    <div className="flex gap-4">
                      <Radio 
                        name={`radio-${selectedCategory}-${index}`} 
                        label="No" 
                        checked={selectedAmenities[selectedCategory]?.[amenity] === "No"}
                        onChange={() => handleAmenitySelection(selectedCategory, amenity, "No")}
                      />
                      <Radio 
                        name={`radio-${selectedCategory}-${index}`} 
                        label="Yes" 
                        checked={selectedAmenities[selectedCategory]?.[amenity] === "Yes"}
                        onChange={() => handleAmenitySelection(selectedCategory, amenity, "Yes")}
                      />
                    </div>
                  </div>
                )) || (
                  <Typography color="gray" className="text-sm mt-2">
                    No amenities available for this category.
                  </Typography>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  );
}
