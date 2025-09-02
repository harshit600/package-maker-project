import React, { useEffect, useState } from "react";
import config from "../../../config";
import {
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";

function ListedProperites({
  sortBy,
  searchQuery,
  priceFilter,
  locationFilter,
  ratingFilter,
}) {
  const [propertiesData, setPropertiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    priceRanges: [],
    ratings: [],
  });

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

  // Generate filter options from properties data
  useEffect(() => {
    if (propertiesData) {
      // Get unique locations
      const locations = [
        ...new Set(
          propertiesData
            .map((property) => property?.location?.address)
            .filter(Boolean)
        ),
      ];

      // Get unique ratings
      const ratings = [
        ...new Set(
          propertiesData
            .map((property) => property?.basicInfo?.starRating)
            .filter(Boolean)
        ),
      ].sort((a, b) => b - a);

      // Calculate price ranges based on room rates
      const allPrices = propertiesData
        .flatMap(
          (property) =>
            property?.rooms?.data?.map((room) => parseInt(room.baseRate)) || []
        )
        .filter(Boolean);

      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);

      // Generate price range options
      const priceRanges = [
        { label: "All Prices", value: "all" },
        { label: `Under ₹${Math.floor(minPrice + 1000)}`, value: "under_low" },
        {
          label: `₹${Math.floor(minPrice + 1000)} - ₹${Math.floor(
            maxPrice - 1000
          )}`,
          value: "mid_range",
        },
        { label: `Above ₹${Math.floor(maxPrice - 1000)}`, value: "above_high" },
      ];

      setFilterOptions({
        locations: ["All Locations", ...locations],
        priceRanges,
        ratings: [
          "All Ratings",
          ...ratings.map((rating) => `${rating} Star${rating > 1 ? "s" : ""}`),
        ],
      });
    }
  }, [propertiesData]);

  // Log filter options for debugging
  useEffect(() => {
    console.log("Dynamic Filter Options:", filterOptions);
  }, [filterOptions]);

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

  // Get filtered properties
  const getFilteredProperties = () => {
    if (!propertiesData) return [];

    return propertiesData.filter((property) => {
      // Search filter
      const searchMatch =
        !searchQuery ||
        property?.basicInfo?.propertyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        property?.location?.address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Price filter
      let priceMatch = true;
      if (priceFilter !== "All Prices") {
        const lowestPrice = Math.min(
          ...(property?.rooms?.data?.map((room) => parseInt(room.baseRate)) || [
            0,
          ])
        );
        const [minPrice, maxPrice] = getPriceRange(priceFilter);
        priceMatch = lowestPrice >= minPrice && lowestPrice <= maxPrice;
      }

      // Location filter
      const locationMatch =
        locationFilter === "All Locations" ||
        property?.location?.address === locationFilter;

      // Rating filter
      const ratingMatch =
        ratingFilter === "All Ratings" ||
        property?.basicInfo?.starRating === parseInt(ratingFilter);

      return searchMatch && priceMatch && locationMatch && ratingMatch;
    });
  };

  // Helper function to get price range bounds
  const getPriceRange = (filter) => {
    const allPrices = propertiesData
      .flatMap(
        (property) =>
          property?.rooms?.data?.map((room) => parseInt(room.baseRate)) || []
      )
      .filter(Boolean);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const midPoint = (minPrice + maxPrice) / 2;

    switch (filter) {
      case "under_low":
        return [0, midPoint];
      case "mid_range":
        return [midPoint, maxPrice - 1000];
      case "above_high":
        return [maxPrice - 1000, Infinity];
      default:
        return [0, Infinity];
    }
  };

  // Export filter options for parent component
  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage(
        {
          type: "FILTER_OPTIONS_UPDATED",
          filterOptions,
        },
        "*"
      );
    }
  }, [filterOptions]);

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
      {getFilteredProperties().map((property, index) => (
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
                {(() => {
                  // Collect all enabled amenities
                  const enabledAmenities = [];

                  // Helper function to check amenities in each category
                  const checkCategory = (category) => {
                    if (property?.amenities?.[category]) {
                      Object.entries(property.amenities[category]).forEach(
                        ([key, value]) => {
                          if (value === "Yes" || value === true) {
                            enabledAmenities.push(key);
                          }
                        }
                      );
                    }
                  };

                  // Check all categories
                  [
                    "mandatory",
                    "basicFacilities",
                    "generalServices",
                    "foodAndDrink",
                    "healthAndWellness",
                    "security",
                    "petEssentials",
                  ].forEach(checkCategory);

                  // Return only first 5 amenities
                  return enabledAmenities.slice(0, 5).map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-full">
                        {/* Icon mapping based on amenity name */}
                        {amenity === "Air Conditioning" && (
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
                              d="M9.25 4.75h5.5a2 2 0 012 2v10.5a2 2 0 01-2 2h-5.5a2 2 0 01-2-2V6.75a2 2 0 012-2z M7.75 8.75h8.5 M7.75 12h8.5 M7.75 15.25h8.5"
                            />
                          </svg>
                        )}
                        {amenity === "Parking" && (
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
                              d="M8.25 4.75h7.5a2 2 0 012 2v10.5a2 2 0 01-2 2h-7.5a2 2 0 01-2-2V6.75a2 2 0 012-2z M12 8.75v4.5 M10 11h4"
                            />
                          </svg>
                        )}
                        {amenity === "Laundry" && (
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
                              d="M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5z M12 8.75v6.5"
                            />
                          </svg>
                        )}
                        {amenity === "CCTV" && (
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
                              d="M15.75 8.75l3.5-3.5 M19.25 12h-3.5 M15.75 15.25l3.5 3.5 M12 19.25v-3.5 M8.25 15.25l-3.5 3.5 M4.75 12h3.5 M8.25 8.75l-3.5-3.5 M12 4.75v3.5"
                            />
                          </svg>
                        )}
                        {amenity === "Gym" && (
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
                              d="M6.75 4.75h10.5a2 2 0 012 2v10.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2V6.75a2 2 0 012-2z M12 8.75v6.5 M8.75 12h6.5"
                            />
                          </svg>
                        )}
                        {/* Default icon for other amenities */}
                        {![
                          "Air Conditioning",
                          "Parking",
                          "Laundry",
                          "CCTV",
                          "Gym",
                        ].includes(amenity) && (
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
                        )}
                      </span>
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* Simplified Room Details Section with Base Rate */}
              <div className="mt-2 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-1">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Rooms Available
                  </h3>
                  <span className="text-sm font-medium text-gray-500">
                    Total Rooms:{" "}
                    {property?.rooms?.data?.reduce(
                      (acc, room) => acc + parseInt(room.roomCount || 0),
                      0
                    )}
                  </span>
                </div>

                <div className="space-y-1">
                  {property?.rooms?.data?.map((room, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-800">
                          {room.roomName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1 py-0.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {room.roomCount} rooms
                          </span>
                          <span className="px-1 py-0.5 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                            {room.roomType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₹{room.baseRate}
                          <span className="text-sm text-gray-500 ml-1">
                            / night
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.mealOption}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="w-56 flex flex-col items-end justify-between border-l border-gray-00 pl-6">
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
                    ₹
                    {Math.min(
                      ...(property?.rooms?.data?.map((room) =>
                        parseInt(room.baseRate)
                      ) || [0])
                    )}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">/ night</span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-semibold text-gray-800 bg-blue-100 px-2 py-1 rounded-full">
                    {property?.rooms?.data?.[0]?.roomType || "Standard Room"}
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
