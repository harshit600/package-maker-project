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
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});

  const nextImage = (propertyId, totalImages) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages,
    }));
  };

  const prevImage = (propertyId, totalImages) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]:
        prev[propertyId] === 0 ? totalImages - 1 : prev[propertyId] - 1,
    }));
  };

  const setImageIndex = (propertyId, index) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [propertyId]: index,
    }));
  };

  useEffect(() => {
    if (propertiesData) {
      const indexes = {};
      propertiesData.forEach((property) => {
        indexes[property._id] = 0;
      });
      setCurrentImageIndexes(indexes);
    }
  }, [propertiesData]);

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
    <div className="p-2 max-w-7xl mx-auto bg-gray-50">
      {propertiesData?.map((property, index) => (
        <div
          key={property._id}
          className="property-card bg-white shadow-lg border border-gray-100 rounded-lg mb-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex p-4">
            {/* Left side - Image */}
            <div className="w-80 flex-shrink-0">
              <div className="relative">
                <img
                  src={
                    property?.photosAndVideos?.images?.[
                      currentImageIndexes[property._id] || 0
                    ]
                  }
                  className="w-full h-56 object-cover rounded-lg shadow-sm"
                  alt={property?.basicInfo?.propertyName}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    prevImage(
                      property._id,
                      property?.photosAndVideos?.images?.length
                    );
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    nextImage(
                      property._id,
                      property?.photosAndVideos?.images?.length
                    );
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {`${(currentImageIndexes[property._id] || 0) + 1}/${
                    property?.photosAndVideos?.images?.length
                  }`}
                </div>
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {property?.photosAndVideos?.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className={`w-16 h-12 object-cover rounded shadow-sm cursor-pointer transition-all ${
                      i === (currentImageIndexes[property._id] || 0)
                        ? "ring-2 ring-blue-500"
                        : "hover:opacity-80"
                    }`}
                    alt={`thumbnail-${i}`}
                    onClick={() => setImageIndex(property._id, i)}
                  />
                ))}
              </div>
            </div>

            {/* Middle - Property Details */}
            <div className="flex-grow px-6 py-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">
                  {property?.basicInfo?.propertyName}
                </h2>

                {/* Hotel Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(property?.basicInfo?.starRating || 3)].map(
                    (_, index) => (
                      <svg
                        key={index}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )
                  )}
                </div>

                <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm">
                  <span className="mr-1 font-semibold">4.5</span>
                  <span>★</span>
                </div>
                <span className="text-sm text-gray-500">(1,234 Reviews)</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {property?.location?.address}
              </div>

              {/* Amenities */}
              <div className="flex gap-6 mt-4">
                {Array.isArray(property?.amenities) &&
                  property.amenities?.slice(0, 4).map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-full">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
              </div>

              {/* Tags */}
              <div className="mt-4 flex gap-3">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                  Free Cancellation
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                  Breakfast Included
                </span>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="w-56 flex flex-col items-end justify-between border-l border-gray-100 pl-6">
              <div className="flex gap-2">
                <Link
                  to={`/update/${slugify(property?.basicInfo?.propertyName)}/${
                    property._id
                  }`}
                >
                  <div className="p-2 rounded-full hover:bg-blue-50 group transition-colors">
                    <PencilSquareIcon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  </div>
                </Link>
                <div
                  className="p-2 rounded-full hover:bg-red-50 group transition-colors cursor-pointer"
                  onClick={() => handleDelete(property._id)}
                >
                  <TrashIcon className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                </div>
                <Link
                  to={`/property/${slugify(
                    property?.basicInfo?.propertyName
                  )}/${property._id}`}
                >
                  <div className="p-2 rounded-full hover:bg-green-50 group transition-colors">
                    <CalendarIcon className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  </div>
                </Link>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">
                  Starting from
                </div>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{property?.pricing?.basePrice || "1,999"}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">/ night</span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-semibold text-gray-800 bg-blue-100 px-2 py-1 rounded-full">
                    {property?.roomCategory || "Standard Room"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">+ ₹299 taxes & fees</div>
                <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListedProperites;
