import React, { useState, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { FaClock } from "react-icons/fa";
import config from '../config';

const ActivitySkeleton = () => (
  <div className="animate-pulse">
    <div className="flex gap-4 border-b pb-4">
      {/* Image skeleton */}
      <div className="w-32 h-32 bg-gray-200 rounded" />

      {/* Content skeleton */}
      <div className="flex-1">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Duration skeleton */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>

      {/* Price and button skeleton */}
      <div className="text-right">
        <div className="h-6 bg-gray-200 rounded w-20 ml-auto mb-1" />
        <div className="h-4 bg-gray-200 rounded w-16 ml-auto mb-3" />
        <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
      </div>
    </div>
  </div>
);

const FiltersSkeleton = () => (
  <div className="animate-pulse mb-6 space-y-4">
    <div className="flex justify-between items-center">
      <div className="w-1/3">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-full" />
      </div>
      <div className="w-1/2">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-2 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

const BlurImage = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-32 h-32 relative overflow-hidden rounded">
      {/* Low quality placeholder */}
      <div
        className={`
          absolute inset-0 bg-gray-200
          ${isLoading ? "visible" : "invisible"}
        `}
      />

      {/* Main image */}
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-500 ease-in-out
          ${isLoading ? "opacity-0" : "opacity-100"}
        `}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          setIsLoading(false);
          e.target.onerror = null;
          e.target.src = "https://placehold.co/300x200?text=Activity";
        }}
      />
    </div>
  );
};

const ActivitySlider = ({ isOpen, onClose, selectedDay, onActivitySelect }) => {
  console.log("ActivitySlider props:", {
    isOpen,
    selectedDay,
    onActivitySelect,
  });

  const [activities, setActivities] = useState([]);
  const [activityImages, setActivityImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Any");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [visibleItems, setVisibleItems] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);

  const handleActivitySelect = useCallback(
    (activity) => {
      console.log("handleActivitySelect called with:", activity, selectedDay);

      if (!selectedDay || !onActivitySelect) {
        console.log(
          "Early return due to missing selectedDay or onActivitySelect"
        );
        return;
      }

      const isSelected = selectedActivities.some(a => a._id === activity._id);
      let updatedActivities;
      
      if (isSelected) {
        updatedActivities = selectedActivities.filter(a => a._id !== activity._id);
      } else {
        updatedActivities = [...selectedActivities, { ...activity, day: selectedDay.day, quantity: 1 }];
      }
      
      setSelectedActivities(updatedActivities);
    },
    [selectedDay, onActivitySelect, selectedActivities]
  );

  useEffect(() => {
    if (isOpen && selectedDay) {
      fetchActivities(selectedDay.selectedItinerary?.cityName);
    }
  }, [isOpen, selectedDay]);

  const fetchActivities = async (cityName) => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemakeractivities-by-city/${cityName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onActivitySelect(selectedActivities);
    setSelectedActivities([]);
    onClose();
  };

  if (!isOpen) return null;

  const filteredActivities = activities.filter((activity) => {
    const matchesCategory =
      selectedCategory === "Any" || activity.category_id === selectedCategory;
    const matchesPrice = parseInt(activity.price) <= priceRange[1];
    const matchesSearch =
      !searchQuery ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.short_description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Add Activities</h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Day {selectedDay?.day} - {selectedDay?.selectedItinerary?.cityName}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-500">Loading activities...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          onClick={() => handleActivitySelect(activity)}
                          className={`bg-white rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                            selectedActivities.some(a => a._id === activity._id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={activity.imageUrl || "https://placehold.co/100x100?text=Activity"}
                                alt={activity.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/100x100?text=Activity";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                      {activity.category_id}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">₹{activity.price || activity.discount_price}</p>
                                  <p className="text-xs text-gray-500">per person</p>
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {activity.short_description?.replace(/<\/?[^>]+(>|$)/g, "")}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  1 Hour Duration
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  {activity.location_site}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={handleDone}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Selected Activities ({selectedActivities.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these styles to your CSS or Tailwind config
const styles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .bg-shimmer {
    background: linear-gradient(
      90deg,
      #f3f4f6 25%,
      #e5e7eb 50%,
      #f3f4f6 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

export default ActivitySlider;
