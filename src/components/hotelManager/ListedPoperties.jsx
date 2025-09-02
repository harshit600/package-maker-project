import React, { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";
const config = {
	API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
}

function ListedProperites({
  properties = [],
  isLoading = false,
  totalHotels = 0,
  sortBy,
  searchQuery,
  priceFilter,
  locationFilter,
  ratingFilter,
  propertyType, // <-- new prop
}) {
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    locations: [],
    priceRanges: [],
    ratings: [],
  });
  const [localProperties, setLocalProperties] = useState(properties);

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  // Generate filter options from properties data
  useEffect(() => {
    if (properties) {
      // Get unique locations
      const locations = [
        ...new Set(
          properties
            .map((property) => property?.location?.address)
            .filter(Boolean)
        ),
      ];
      // Get unique ratings
      const ratings = [
        ...new Set(
          properties
            .map((property) => property?.basicInfo?.starRating)
            .filter(Boolean)
        ),
      ].sort((a, b) => b - a);
      // Calculate price ranges based on room rates
      const allPrices = properties
        .flatMap(
          (property) =>
            property?.rooms?.data?.map((room) => parseInt(room.baseRate)) || []
        )
        .filter(Boolean);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
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
  }, [properties]);

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

  // Filtering logic
  const getFilteredProperties = () => {
    if (!properties) return [];
    return properties.filter((property) => {
      // Property type filter
      if (propertyType && propertyType !== 'all' && property?.basicInfo?.propertyType !== propertyType) return false;
      // Search filter
      const searchMatch =
        !searchQuery ||
        property?.basicInfo?.propertyName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        property?.location?.address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      // Location filter
      const locationMatch =
        locationFilter === "all" ||
        locationFilter === "All Locations" ||
        property?.location?.address === locationFilter;
      // Price filter
      let priceMatch = true;
      if (priceFilter !== "All Prices") {
        const lowestPrice = Math.min(
          ...(property?.rooms?.data?.map((room) => parseInt(room.baseRate)) || [0])
        );
        const [minPrice, maxPrice] = getPriceRange(priceFilter);
        priceMatch = lowestPrice >= minPrice && lowestPrice <= maxPrice;
      }
      // Rating filter
      const ratingMatch =
        ratingFilter === "All Ratings" ||
        property?.basicInfo?.starRating === parseInt(ratingFilter);
      return searchMatch && locationMatch && priceMatch && ratingMatch;
    });
  };
  // Helper function to get price range bounds
  const getPriceRange = (filter) => {
    const allPrices = properties
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

  // Add handleDelete method
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const response = await fetch(`${config.API_HOST}/api/packagemaker/delete-packagemaker/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.success) {
        setLocalProperties((prev) => prev.filter((p) => p._id !== id));
        alert("Property deleted successfully!");
        window.location.reload();
      } else {
        alert(result.message || "Failed to delete property.");
      }
    } catch (error) {
      alert("Error deleting property.");
    }
  };

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

  if (isLoading && properties.length === 0) {
    return (
      <div className="p-4">
        {[1, 2, 3].map((index) => (
          <PropertySkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
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
                    {`${(currentImageIndexes[property._id] || 0) + 1}/$${property?.photosAndVideos?.images?.length}`}
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
                    (
                    {[...Array(property?.basicInfo?.starRating || 3)].map(
                      (_, index) => (
                        <svg
                          key={index}
                          className="w-4 h-4 text-black-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )
                    )}
                    star )
                  </div>
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
                {/* Simplified Room Details Section with Base Rate */}
                <div className="mt-2 border-t border-gray-300 pt-2">
                  <div className="space-y-1">
                    {property?.rooms?.data?.map((room, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right - Actions */}
              <div className="w-56 flex flex-col items-end justify-between border-l border-gray-300 pl-6">
                <div className="flex gap-2">
                  <Link
                    to={`/update/${slugify(
                      property?.basicInfo?.propertyName
                    )}/${property._id}`}
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
              </div>
            </div>
          </div>
        ))}
        {/* Updated info display */}
        <div className="text-center text-gray-600 text-sm mt-2">
          Showing {getFilteredProperties().length} of {totalHotels} properties
        </div>
      </div>
    </div>
  );
}

export default ListedProperites;
