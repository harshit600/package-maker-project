import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaClock } from "react-icons/fa";

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

const ActivitySlider = ({ isOpen, onClose, selectedDay }) => {
  const [activities, setActivities] = useState([]);
  const [activityImages, setActivityImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Any");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [visibleItems, setVisibleItems] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch activities
        const activitiesResponse = await fetch(
          "https://backendactivity.plutotours.in/api/products"
        );
        const activitiesData = await activitiesResponse.json();

        // Fetch images
        const imagesResponse = await fetch(
          "https://backendactivity.plutotours.in/api/images"
        );
        const imagesData = await imagesResponse.json();

        // Create a map of product_id to its images
        const imageMap = {};
        imagesData.Iamges.forEach((img) => {
          if (!imageMap[img.product_id]) {
            imageMap[img.product_id] = [];
          }
          // Store the full image path
          imageMap[img.product_id].push(
            `https://backendactivity.plutotours.in/${img.image}`
          );
        });

        setActivityImages(imageMap);
        setActivities(activitiesData.Product || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
      setVisibleItems(10);
    }
  }, [isOpen]);

  // Filter activities based on category and price
  const filteredActivities = activities.filter(
    (activity) =>
      (selectedCategory === "Any" ||
        activity.category_id === selectedCategory) &&
      parseInt(activity.price) <= priceRange[1]
  );

  // Handle load more
  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + 10);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className=" flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Add Activity, Meal or Transfer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b mb-6">
          <button className="text-blue-500 border-b-2 border-blue-500 pb-2">
            Add Day Activity
          </button>
         
        </div>

        {/* Filters */}
        {loading ? (
          <FiltersSkeleton />
        ) : (
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-1/3">
                <label className="block text-sm text-gray-600 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Any">Any</option>
                  <option value="Water Activity">Water Activity</option>
                  <option value="Flying Activity">Flying Activity</option>
                  <option value="Trek Activity">Trek Activity</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">
                  Price Range (₹{priceRange[0]} to ₹{priceRange[1]})
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  className="w-full"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-6">
          {loading ? (
            // Show multiple skeleton loaders
            Array.from({ length: 5 }).map((_, index) => (
              <ActivitySkeleton key={index} />
            ))
          ) : (
            <>
              {filteredActivities.slice(0, visibleItems).map((activity) => (
                <div key={activity.id} className="flex gap-4 border-b pb-4">
                  <BlurImage
                    src={
                      activityImages[activity.id]?.[0] ||
                      "https://placehold.co/300x200?text=Activity"
                    }
                    alt={activity.title}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <div
                      className="text-sm text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: activity.short_description,
                      }}
                    />
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <FaClock />
                      <span>Duration 1 Hour • Anytime</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      + ₹{activity.discount_price}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                    <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      SELECT
                    </button>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {filteredActivities.length > visibleItems && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
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
