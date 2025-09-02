import React, { useState } from "react";
import { Card, Radio, Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function Property() {
  const [selectedProperty, setSelectedProperty] = useState("hotel");

  const handleSelection = (type) => {
    setSelectedProperty(type);
  };

  // JSON data for different property types
  const propertyTypes = [
    {
      title: "Hotel",
      description:
        "A commercial establishment providing lodging with amenities like dining, room service, and conference facilities.",
      imageUrl: "https://promos.makemytrip.com/images/HOTEL.png",
      value: "hotel",
    },
    {
      title: "BnBs",
      description:
        "A self-contained property offering luxurious lodging with amenities such as pools, spas, dining, and recreation.",
      imageUrl: "https://promos.makemytrip.com/images/RESORT.png",
      value: "BnBs",
    },
    {
      title: "Home Stays & Villas",
      description:
        "A small, privately-owned accommodation offering personalized services and fewer amenities.",
      imageUrl: "https://promos.makemytrip.com/images/GUEST%20HOME.png",
      value: "homeStays&Villas",
    },
   
  ];

  return (
    <>
      <div className="p-8 mb-10">
        <Typography variant="h4" className="font-bold mb-4">
       
          Which property type would you like to list?
        </Typography>
        <Typography variant="small" className="mb-6">
          Please select your property type from below options
        </Typography>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {propertyTypes.map((property) => (
            <Card
              key={property.value}
              onClick={() => handleSelection(property.value)}
              className={`p-4 cursor-pointer ${selectedProperty === property.value
                  ? "border-2 border-blue-500"
                  : "border"
                } flex flex-col items-center`}
            >
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-64 object-cover mb-4"
              />
              <div className="text-center w-full">
                <Typography variant="h5" className="font-semibold mb-2">
                  {property.title}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-700 mb-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3, // Limit to 3 lines
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {property.description}
                </Typography>
              </div>
              <div className="mt-auto">
                <Radio
                  name="property"
                  value={property.value}
                  checked={selectedProperty === property.value}
                  onChange={() => handleSelection(property.value)}
                />
              </div>
            </Card>
          ))}
        </div>
        
      </div>

      <div className="fixed bottom-0 w-full flex  items-center bg-white p-5 border-t">
      <Link to={`/onboarding/${selectedProperty}`}>
          <button className="bg-blue-800 text-white hover:underline text-2xl  font-bold w-full flex border-2 border-blue-800 rounded-lg p-2">
            List Property
          </button>
        </Link>
        <button className="bg-blue-800 text-white hover:underline text-2xl  font-bold w-1/2   ml-20 border-2 border-blue-800 rounded-lg p-2 ">Cancel</button>
      
      </div>
   
    </>
  );
}

export default Property;
