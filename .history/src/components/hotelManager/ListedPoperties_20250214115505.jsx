import React, { useEffect, useState } from "react";
import config from "../../../config";
import {
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";

function ListedProperites() {
  const [propertiesData, setPropertiesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add delete handler function
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/delete-packagemaker/${id}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();

        if (data.success) {
          // Remove the deleted property from state
          setPropertiesData((prevData) =>
            prevData.filter((property) => property._id !== id)
          );
        }
      } catch (error) {
        console.error("Error deleting property:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/get-packagemaker`
        );
        console.log("API Response:", response);
        const data = await response.json();
        console.log("API Response:", data);
        if (data.success) {
          setPropertiesData(data.data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Skeleton loader component
  const PropertySkeleton = () => (
    <div className="property-card flex justify-between mt-4 animate-pulse">
      <div className="flex gap-8 items-center">
        <div className="h-[200px] w-[200px] bg-gray-200 rounded-lg"></div>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-4 items-center mr-10">
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4">
        {[1, 2, 3].map((index) => (
          <PropertySkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {propertiesData?.map((property, index) => (
        <div
          key={property._id}
          className="property-card bg-white shadow-sm border rounded-lg mb-4 hover:shadow-md transition-all duration-300"
        >
          <div className="flex p-4">
            {/* Left side - Image */}
            <div className="w-72 h-48 flex-shrink-0">
              <img
                src={property?.photosAndVideos?.images?.[0]}
                className="w-full h-full object-cover rounded-lg"
                alt={property?.basicInfo?.propertyName}
              />
              <div className="flex gap-2 mt-2">
                {property?.photosAndVideos?.images
                  ?.slice(0, 3)
                  .map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-16 h-12 object-cover rounded"
                      alt={`thumbnail-${i}`}
                    />
                  ))}
                <div className="w-16 h-12 bg-gray-800 rounded flex items-center justify-center text-white text-sm cursor-pointer">
                  View All
                </div>
              </div>
            </div>

            {/* Middle - Property Details */}
            <div className="flex-grow px-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">
                  {property?.basicInfo?.propertyName}
                </h2>
                <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  <span className="mr-1">4.5</span>
                  <span>★</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {property?.location?.address}
              </div>

              {/* Amenities */}
              <div className="flex gap-4 mt-4">
                {Array.isArray(property?.amenities) &&
                  property.amenities?.slice(0, 3).map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 text-gray-600"
                    >
                      <span className="w-5 h-5">🏊‍♂️</span>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
              </div>

              {/* Tags */}
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  Free Cancellation
                </span>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="w-48 flex flex-col items-end justify-between">
              <div className="flex gap-2">
                <Link
                  to={`/update/${slugify(property?.basicInfo?.propertyName)}/${
                    property._id
                  }`}
                >
                  <div className="p-2 rounded-full hover:bg-gray-100">
                    <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </Link>
                <div
                  className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleDelete(property._id)}
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </div>
                <Link
                  to={`/property/${slugify(
                    property?.basicInfo?.propertyName
                  )}/${property._id}`}
                >
                  <div className="p-2 rounded-full hover:bg-gray-100">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                </Link>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Starting from</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{property?.pricing?.basePrice || "1,999"}
                </div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListedProperites;
