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
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";

function ListedProperties() {
  const [propertiesData, setPropertiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Our Properties</h1>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Properties</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Link to="/property">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
              Add New Property
            </button>
          </Link>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="space-y-6">
        {propertiesData?.map((property) => (
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
        ))}
      </div>
    </div>
  );
}

export default ListedProperties;
