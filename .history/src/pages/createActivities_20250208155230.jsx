import { useState, useEffect } from "react";

function CreateActivities() {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllStates, setShowAllStates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCities, setSelectedCities] = useState({});
  const initialStatesToShow = 3;

  useEffect(() => {
    Promise.all([
      fetch("https://backendactivity.plutotours.in/api/products").then((res) =>
        res.json()
      ),
      fetch("https://backendactivity.plutotours.in/api/images").then((res) =>
        res.json()
      ),
    ])
      .then(([productsData, imagesData]) => {
        setProducts(productsData.Product);

        const imagesByProduct = imagesData.Iamges.reduce((acc, img) => {
          if (!acc[img.product_id]) {
            acc[img.product_id] = [];
          }
          acc[img.product_id].push(
            `https://backendactivity.plutotours.in/${img.image}`
          );
          return acc;
        }, {});

        setImages(imagesByProduct);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location_site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered products by state
  const groupedByState = filteredProducts.reduce((acc, product) => {
    if (!acc[product.state]) {
      acc[product.state] = [];
    }
    acc[product.state].push(product);
    return acc;
  }, {});

  // Get unique cities for each state
  const getCitiesForState = (stateProducts) => {
    return [...new Set(stateProducts.map((product) => product.city))].sort();
  };

  // Handle city selection
  const handleCitySelect = (state, city) => {
    setSelectedCities((prev) => ({
      ...prev,
      [state]: prev[state] === city ? null : city,
    }));
  };

  // Get states array
  const stateEntries = Object.entries(groupedByState);
  const statesToDisplay = showAllStates
    ? stateEntries
    : stateEntries.slice(0, initialStatesToShow);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg shadow-lg">
          <h3 className="text-red-800 font-semibold">Error occurred</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Activities List
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Browse through our collection of exciting activities and
                experiences
              </p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          {searchQuery && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "result" : "results"} found
                  for "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* State-wise Flex Layout */}
        <div className="space-y-8">
          {statesToDisplay.map(([state, stateProducts]) => {
            const cities = getCitiesForState(stateProducts);
            const selectedCity = selectedCities[state];
            const filteredStateProducts = selectedCity
              ? stateProducts.filter((product) => product.city === selectedCity)
              : stateProducts;

            return (
              <div key={state} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{state}</h2>
                  <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(state, city)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 
                          ${
                            selectedCity === city
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {city}
                      </button>
                    ))}
                    {selectedCity && (
                      <button
                        onClick={() => handleCitySelect(state, null)}
                        className="px-3 py-1 rounded-full text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex space-x-6 pb-4">
                    {filteredStateProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0 w-80 bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
                      >
                        {/* Image and Overlay Content */}
                        <div className="relative h-72">
                          <img
                            src={images[product.id]?.[0] || "https://via.placeholder.com/300x200"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300x200";
                            }}
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
                          
                          {/* Content Overlay */}
                          <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                            {/* Featured Tag */}
                            <div className="inline-block bg-yellow-400 px-2 py-1 text-xs font-semibold text-black mb-2">
                              FEATURED
                            </div>
                            
                            {/* Location Tag */}
                            <div className="mlinline-block text-white text-sm font-medium">
                              {product.city.toUpperCase()}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-bold text-white">
                              {product.title}
                            </h3>
                            
                            {/* Price */}
                            <div className="flex items-center space-x-2 text-white">
                              <span className="line-through text-sm opacity-70">₹{product.price}</span>
                              <span className="font-bold">₹{product.discount_price}</span>
                              <span className="text-sm bg-green-500 px-2 py-0.5 rounded-full">
                                {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More Button */}
        {stateEntries.length > initialStatesToShow && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllStates(!showAllStates)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showAllStates
                ? "Show Less"
                : `Show More States (${
                    stateEntries.length - initialStatesToShow
                  } more)`}
            </button>
          </div>
        )}

        {/* No Results */}
        {stateEntries.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              No activities found
            </h3>
            <p className="text-gray-500 mt-2">
              {searchQuery
                ? `No results found for "${searchQuery}". Try different keywords.`
                : "Check back later for new activities."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateActivities;
