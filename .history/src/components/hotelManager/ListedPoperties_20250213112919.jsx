import React, { useEffect, useState } from "react";
import config from "../../../config";
import {
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";

function ListedProperties() {
  const [propertiesData, setPropertiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    stars: "all",
    location: "all",
    status: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/delete-packagemaker/${id}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        if (data.success) {
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
        const data = await response.json();
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

  const locations = [
    ...new Set(propertiesData?.map((p) => p?.location?.city) || []),
  ];

  const filteredProperties = propertiesData?.filter((property) => {
    const matchesSearch = property?.basicInfo?.propertyName
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesStars =
      filters.stars === "all" ||
      property?.basicInfo?.stars === parseInt(filters.stars);
    const matchesLocation =
      filters.location === "all" ||
      property?.location?.city === filters.location;
    const matchesStatus =
      filters.status === "all" || property?.status === filters.status;

    return matchesSearch && matchesStars && matchesLocation && matchesStatus;
  });

  const PropertySkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="h-[250px] w-[300px] bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((index) => (
          <PropertySkeleton key={index} />
        ))}
      </div>
    );
  }

  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-100 text-blue-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-5xl font-extrabold text-white">
              Your Properties
            </h1>
            <span className="text-lg text-gray-200">
              Manage your hotel listings
            </span>
          </div>
          <Link to="/add-property">
            <button className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center gap-2">
              <span>Add New Property</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Star Rating Filter */}
          <div className="min-w-[150px]">
            <select
              value={filters.stars}
              onChange={(e) =>
                setFilters({ ...filters, stars: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stars</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Stars
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="min-w-[200px]">
            <select
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          {Object.values(filters).some((value) => value && value !== "all") && (
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  stars: "all",
                  location: "all",
                  status: "all",
                })
              }
              className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters */}
        {Object.values(filters).some((value) => value && value !== "all") && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {Object.entries(filters).map(([key, value]) => {
              if (value && value !== "all") {
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    <span className="capitalize">
                      {key}: {value}
                    </span>
                    <XMarkIcon
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => setFilters({ ...filters, [key]: "all" })}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="space-y-6">
        {filteredProperties?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              No properties found matching your filters
            </div>
          </div>
        ) : (
          filteredProperties?.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Image Section */}
                  <div className="relative group">
                    <img
                      src={property?.photosAndVideos?.images?.[0]}
                      className="h-[250px] w-[300px] rounded-lg object-cover"
                      alt={property?.basicInfo?.propertyName}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg"></div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {property?.basicInfo?.propertyName}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPinIcon className="w-5 h-5 text-gray-400" />
                          <span>{property?.location?.address}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          to={`/update/${slugify(
                            property?.basicInfo?.propertyName
                          )}/${property._id}`}
                          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                        >
                          <PencilSquareIcon className="w-5 h-5 text-blue-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                        >
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                        <Link
                          to={`/property/${slugify(
                            property?.basicInfo?.propertyName
                          )}/${property._id}`}
                          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                        >
                          <CalendarIcon className="w-5 h-5 text-green-500" />
                        </Link>
                      </div>
                    </div>

                    {/* Property Stats */}
                    <div className="mt-6 flex gap-6">
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-600">4.8 Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">From $199/night</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-600">120 Reviews</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        Pool
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                        Spa
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                        Restaurant
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListedProperties;
