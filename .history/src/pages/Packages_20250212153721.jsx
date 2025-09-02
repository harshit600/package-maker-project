import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Button from "../components/ui-kit/atoms/Button";
import config from "../../config";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
const themeColor = "bg-blue-200 text-blue-800"; // Uniform color for all theme tags

const ITEMS_PER_PAGE = 10;

const SkeletonLoader = () => {
  return (
    <div className="p-4 animate-pulse">
      {/* Filters Skeleton */}
      <div className="w-full flex flex-wrap items-center gap-2 bg-white rounded-lg shadow p-3">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-9 bg-gray-200 rounded flex-1 min-w-[200px]"
            />
          ))}
          <div className="h-9 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
        <div className="w-full">
          {/* Table Header */}
          <div className="bg-[#2c3e50] p-3">
            <div className="grid grid-cols-9 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-500 rounded" />
              ))}
            </div>
          </div>

          {/* Table Body */}
          {[...Array(10)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`p-3 ${
                rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="grid grid-cols-9 gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-12 w-12 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded-full" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [filters, setFilters] = useState({
    packageName: "",
    duration: "",
    location: "",
    packageType: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showSelectAllModal, setShowSelectAllModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("package");
  const [packageDetails, setPackageDetails] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPackageData, setEditPackageData] = useState(null);
  const navigate = useNavigate();
  const [packageTypes, setPackageTypes] = useState([]);
  const [placesList, setPlacesList] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.API_HOST}/api/add/get`);
        const data = await response.json();

        console.log("Fetched Packages Data:", data);

        const formattedData = data.map((pkg) => ({
          _id: pkg._id,
          packageName: pkg.package.packageName,
          duration: pkg.package.duration,
          pickupLocation: pkg.package.pickupLocation,
          packageType: pkg.package.packageType,
          packageImages: pkg.package.packageImages,
          baseTotal: pkg.finalCosting.baseTotal,
        }));

        setPackages(formattedData);
        setFilteredPackages(formattedData);
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to fetch packages");
      } finally {
        // Add a small delay to prevent flickering on fast connections
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const fetchPackageTypesAndPlaces = async () => {
      try {
        const [typesRes, placesRes] = await Promise.all([
          fetch(`${config.API_HOST}/api/packagetype/get`),
          fetch(`${config.API_HOST}/api/places/get`)
        ]);
        
        const typesData = await typesRes.json();
        const placesData = await placesRes.json();
        
        setPackageTypes(typesData.filter(type => type.Type === "package type"));
        setPlacesList(placesData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      }
    };

    fetchPackageTypesAndPlaces();
  }, []);

  // Get unique durations from packages
  const getUniqueDurations = () => {
    const durations = packages.map((pkg) => pkg.duration || "0D/0N"); // Default to '0D/0N' if duration is undefined
    const uniqueDurations = [...new Set(durations)].sort();
    return uniqueDurations;
  };

  // Get unique locations from packages
  const getUniqueLocations = () => {
    const locations = packages.map(
      (pkg) => pkg.pickupLocation || "Unknown Location"
    );
    const uniqueLocations = [...new Set(locations)].sort();
    return uniqueLocations;
  };

  // Get unique package types from packages
  const getUniquePackageTypes = () => {
    const types = packages.map((pkg) => pkg.packageType);
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes;
  };

  // Updated filter handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply all filters
    const filtered = packages.filter((pkg) => {
      const matchesPackageName =
        !filters.packageName ||
        pkg.packageName
          .toLowerCase()
          .includes(filters.packageName.toLowerCase());

      const matchesDuration =
        !filters.duration || pkg.duration === filters.duration;

      const matchesLocation =
        !filters.location || pkg.pickupLocation === filters.location;

      const matchesType =
        !filters.packageType || pkg.packageType === filters.packageType;

      const travelDate = new Date(pkg.travelDate);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const matchesDateRange =
        (!startDate || travelDate >= startDate) &&
        (!endDate || travelDate <= endDate);

      return (
        matchesPackageName &&
        matchesDuration &&
        matchesLocation &&
        matchesType &&
        matchesDateRange
      );
    });

    setFilteredPackages(filtered);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      packageName: "",
      duration: "",
      location: "",
      packageType: "",
      startDate: "",
      endDate: "",
    });
    setFilteredPackages(packages);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent card click event from firing
    setPackageToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/add/delete/${packageToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedPackages = packages.filter(
          (pkg) => pkg._id !== packageToDelete
        );
        setPackages(updatedPackages);
        setFilteredPackages(updatedPackages);
        setShowDeleteModal(false);
        setPackageToDelete(null);
        toast.success("Package deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error(`Failed to delete package: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Updated bulk delete handler with better error handling
  const handleBulkDelete = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/add/delete-multiple`,

        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ packageIds: selectedPackages }),
        }
      );

      // First try to get JSON response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If JSON parsing fails, get text response
        const textData = await response.text();
        console.error("Raw response:", textData);
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(errorData.message || "Failed to delete packages");
      }

      // Update UI after successful deletion
      const updatedPackages = packages.filter(
        (pkg) => !selectedPackages.includes(pkg._id)
      );
      setPackages(updatedPackages);
      setFilteredPackages(updatedPackages);
      setSelectedPackages([]);
      setShowBulkDeleteModal(false);

      toast.success("Selected packages deleted successfully");
    } catch (error) {
      console.error("Error deleting packages:", error);
      toast.error(`Failed to delete packages: ${error.message}`);
      setShowBulkDeleteModal(false);
    }
  };

  // Calculate pagination values
  const indexOfLastPackage = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPackage = indexOfLastPackage - ITEMS_PER_PAGE;
  const currentPackages = filteredPackages.slice(
    indexOfFirstPackage,
    indexOfLastPackage
  );
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Updated handle select all with modal
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setShowSelectAllModal(true);
    } else {
      setSelectedPackages([]);
    }
  };

  // Confirm select all action
  const confirmSelectAll = () => {
    setSelectedPackages(currentPackages.map((pkg) => pkg._id));
    setShowSelectAllModal(false);
  };

  // Handle individual checkbox selection
  const handleSelectPackage = (packageId) => {
    setSelectedPackages((prev) => {
      if (prev.includes(packageId)) {
        return prev.filter((id) => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  };

  // Function to handle viewing a package
  const handleViewClick = async (pkg) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_HOST}/api/add/get/${pkg._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch package details");
      }
      const data = await response.json();
      setPackageDetails(data);
      setSelectedPackage(data);
      setShowPackageModal(true);
    } catch (error) {
      console.error("Error fetching package details:", error);
      toast.error("Failed to load package details");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination component
  const Pagination = () => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstPackage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastPackage, filteredPackages.length)}
              </span>{" "}
              of <span className="font-medium">{filteredPackages.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === index + 1
                      ? "z-10 bg-[rgb(45,45,68)] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(45,45,68)]"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Updated ImageSlider component with direct image source
  const ImageSlider = ({ images, packageName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = (e) => {
      e.stopPropagation();
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = (e) => {
      e.stopPropagation();
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + images.length) % images.length
      );
    };

    return (
      <div className="relative">
        {images.length > 0 && (
          <img
            className="w-full h-24 object-cover transition-transform duration-300"
            src={images[currentIndex]} // Updated to use direct image source
            alt={`${packageName} - Image ${currentIndex + 1}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "path/to/fallback/image.jpg";
            }}
          />
        )}
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 flex justify-between items-center p-2">
              <button
                className="bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition"
                onClick={prevImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition"
                onClick={nextImage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 mx-0.5 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-white scale-125"
                      : "bg-white/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
  };

  // Function to fetch package details for editing
  const handleEditClick = async (pkg) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_HOST}/api/add/get/${pkg._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch package details");
      }
      const data = await response.json();
      setEditPackageData(data);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching package details:", error);
      toast.error("Failed to load package details");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle package update
  const handleUpdatePackage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${config.API_HOST}/api/add/update/${editPackageData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editPackageData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update package");
      }

      const data = await response.json();
      toast.success("Package updated successfully!");
      setShowEditModal(false);
      // Refresh the packages list
      fetchPackages();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error(`Failed to update package: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Add Bulk Actions Bar */}
          {selectedPackages.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg mb-4 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">
                  {selectedPackages.length} package
                  {selectedPackages.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete Selected
              </button>
            </div>
          )}
          {/* Updated Search Section to be full width */}
          <div className="p-4">
            <div className="w-full flex flex-wrap items-center gap-2 bg-white rounded-lg shadow p-3">
              {/* Date Range Inputs */}
              <div className="flex flex-wrap items-center gap-2 w-full">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                />

                {/* Package Name Search */}
                <input
                  type="text"
                  name="packageName"
                  value={filters.packageName}
                  onChange={handleFilterChange}
                  placeholder="Package Name"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                />

                {/* Duration Filter */}
                <select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                >
                  <option value="">Select Duration</option>
                  {getUniqueDurations().map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>

                {/* Location Filter - Dynamic Select Box */}
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                >
                  <option value="">Select Location</option>
                  {getUniqueLocations().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>

                {/* Package Type Filter - Dynamic Select Box */}
                <select
                  name="packageType"
                  value={filters.packageType}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 flex-1"
                >
                  <option value="">Select Type</option>
                  {getUniquePackageTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="bg-[rgb(45,45,68)] text-white px-4 py-1.5 rounded text-sm hover:bg-opacity-80 transition-colors whitespace-nowrap"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Packages Table */}
            <div className="mt-4 bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2c3e50] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          currentPackages.length > 0 &&
                          selectedPackages.length === currentPackages.length
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Image</th>
                    <th className="px-4 py-3 text-left">Package Name</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPackages.map((pkg, index) => (
                    <tr
                      key={pkg._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 border-t">
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg._id)}
                          onChange={() => handleSelectPackage(pkg._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-4 py-3 border-t">
                        <div className="w-12 h-12 relative overflow-hidden rounded-lg">
                          {pkg.packageImages && pkg.packageImages.length > 0 ? (
                            <img
                              src={pkg.packageImages[0]}
                              alt={pkg.packageName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t font-medium">
                        {pkg.packageName}
                      </td>
                      <td className="px-4 py-3 border-t">{pkg.duration}</td>
                      <td className="px-4 py-3 border-t">
                        {pkg.pickupLocation}
                      </td>
                      <td className="px-4 py-3 border-t">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {pkg.packageType}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-t font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(pkg.baseTotal)}
                      </td>
                      <td className="px-4 py-3 border-t">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 border-t">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDeleteClick(e, pkg._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleViewClick(pkg)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 3C5.58 3 1.5 7 1.5 10s4.08 7 8.5 7 8.5-4 8.5-7-4.08-7-8.5-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
                              <path d="M10 8a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditClick(pkg)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Pagination */}
              <Pagination />
            </div>
          </div>
          {/* Select All Confirmation Modal */}
          {showSelectAllModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Select All
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to select all {currentPackages.length}{" "}
                  packages on this page?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowSelectAllModal(false);
                      // Uncheck the select all checkbox
                      const selectAllCheckbox = document.querySelector(
                        'thead input[type="checkbox"]'
                      );
                      if (selectAllCheckbox) selectAllCheckbox.checked = false;
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSelectAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Select All
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Add Bulk Delete Confirmation Modal */}
          {showBulkDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Bulk Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedPackages.length}{" "}
                  selected package{selectedPackages.length > 1 ? "s" : ""}? This
                  action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this package? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Package Info Modal */}
          {showPackageModal && selectedPackage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header with new background color */}
                <div className="border-b border-gray-700 bg-[rgb(45,45,68)]">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-2xl font-semibold text-white">
                      {selectedPackage?.package?.packageName ||
                        "Package Details"}
                    </h3>
                    <button
                      onClick={() => setShowPackageModal(false)}
                      className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
                    >
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Updated Tabs */}
                  <div className="flex w-full">
                    {[
                      { id: "package", label: "Package Info", icon: "📦" },
                      { id: "cab", label: "Cab Info", icon: "🚗" },
                      { id: "hotel", label: "Hotel & Sightseeing", icon: "🏨" },
                      { id: "sightseeing", label: "Sightseeing", icon: "🗺️" },
                      { id: "costing", label: "Final Costing", icon: "💰" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all flex-1
                          ${
                            activeTab === tab.id
                              ? "bg-white text-[rgb(45,45,68)] shadow-[0_0_10px_rgba(0,0,0,0.1)] relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[rgb(45,45,68)]"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div
                  className="p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 150px)" }}
                >
                  {activeTab === "package" && (
                    <div className="space-y-8">
                      {/* Package Summary Header */}
                      <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">
                              {selectedPackage?.package?.packageName ||
                                "Package Details"}
                            </h3>
                            <p className="text-white/80">
                              {selectedPackage?.package?.packageCategory}{" "}
                              Package
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Duration:{" "}
                              </span>
                              <span className="font-mono">
                                {selectedPackage?.package?.duration || "N/A"}
                              </span>
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Status:{" "}
                              </span>
                              <span
                                className={`font-mono ${
                                  selectedPackage?.package?.status === "Active"
                                    ? "text-green-300"
                                    : "text-yellow-300"
                                }`}
                              >
                                {selectedPackage?.package?.status || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Package Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              📋
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Package Details
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {[
                              ["Name", selectedPackage?.package?.packageName],
                              ["Type", selectedPackage?.package?.packageType],
                              [
                                "Category",
                                selectedPackage?.package?.packageCategory,
                              ],
                              ["Duration", selectedPackage?.package?.duration],
                              ["Status", selectedPackage?.package?.status],
                            ].map(([label, value]) => (
                              <div
                                key={label}
                                className="flex justify-between items-center py-2 border-b border-gray-100"
                              >
                                <span className="text-gray-600">{label}</span>
                                <span className="font-medium text-gray-900">
                                  {value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Locations Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              📍
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Locations
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {[
                              [
                                "Pickup",
                                selectedPackage?.package?.pickupLocation,
                              ],
                              ["Drop", selectedPackage?.package?.dropLocation],
                              [
                                "Transfer",
                                selectedPackage?.package?.pickupTransfer
                                  ? "Yes"
                                  : "No",
                              ],
                            ].map(([label, value]) => (
                              <div
                                key={label}
                                className="flex justify-between items-center py-2 border-b border-gray-100"
                              >
                                <span className="text-gray-600">{label}</span>
                                <span className="font-medium text-gray-900">
                                  {value || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Places Covered */}
                        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              🗺️
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Places Covered
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {selectedPackage?.package?.packagePlaces?.map(
                              (place, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                                >
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    {place.placeCover}
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-gray-600">
                                      Nights:{" "}
                                      <span className="text-gray-900 font-medium">
                                        {place.nights}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Transfer:{" "}
                                      <span className="text-gray-900 font-medium">
                                        {place.transfer ? "Yes" : "No"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Themes & Tags */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              🎨
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Themes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPackage?.package?.themes?.map(
                              (theme, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-2 bg-gray-100 text-[rgb(45,45,68)] rounded-full text-sm font-medium"
                                >
                                  {theme}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              🏷️
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Tags
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPackage?.package?.tags?.map(
                              (tag, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-2 bg-gray-100 text-[rgb(45,45,68)] rounded-full text-sm font-medium"
                                >
                                  {tag}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* Itinerary */}
                        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              📅
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Itinerary
                            </h4>
                          </div>
                          <div className="space-y-6">
                            {selectedPackage?.package?.itineraryDays?.map(
                              (day, index) => (
                                <div key={index} className="relative pl-8 pb-6">
                                  <div className="absolute left-0 top-0 h-full w-px bg-gray-200"></div>
                                  <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-[rgb(45,45,68)] border-4 border-white shadow"></div>

                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="text-lg font-semibold text-[rgb(45,45,68)] mb-2">
                                      Day {day.day}:{" "}
                                      {day.selectedItinerary?.itineraryTitle}
                                    </h5>
                                    <p className="text-[rgb(45,45,68)] mb-2">
                                      📍 {day.selectedItinerary?.cityName}
                                    </p>
                                    <div className="prose prose-sm max-w-none text-gray-600">
                                      {
                                        day.selectedItinerary
                                          ?.itineraryDescription
                                      }
                                    </div>
                                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                                      {day.selectedItinerary?.distance && (
                                        <span className="flex items-center gap-1">
                                          <span>🚗</span>{" "}
                                          {day.selectedItinerary.distance} km
                                        </span>
                                      )}
                                      {day.selectedItinerary?.totalHours && (
                                        <span className="flex items-center gap-1">
                                          <span>⏱️</span>{" "}
                                          {day.selectedItinerary.totalHours}{" "}
                                          hours
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "cab" && (
                    <div className="space-y-8">
                      {/* Cab Summary Header */}
                      <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">
                              Transport Details
                            </h3>
                            <p className="text-white/80">
                              Selected vehicles for your journey
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Total Vehicles:{" "}
                              </span>
                              <span className="font-mono">
                                {
                                  Object.values(
                                    selectedPackage?.cabs?.travelPrices
                                      ?.selectedCabs || {}
                                  ).flat().length
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cab Categories */}
                      <div className="space-y-6">
                        {Object.entries(
                          selectedPackage?.cabs?.travelPrices?.selectedCabs ||
                            {}
                        ).map(([cabType, cabs]) => (
                          <div
                            key={cabType}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                          >
                            {/* Category Header */}
                            <div className="bg-[rgb(45,45,68)] p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 bg-white/10 rounded-lg text-xl">
                                    🚗
                                  </span>
                                  <h4 className="text-lg font-semibold">
                                    {cabType}
                                  </h4>
                                </div>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                  {cabs.length}{" "}
                                  {cabs.length === 1 ? "Vehicle" : "Vehicles"}
                                </span>
                              </div>
                            </div>

                            {/* Cabs Grid */}
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cabs.map((cab, index) => (
                                  <div
                                    key={index}
                                    className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                                  >
                                    {/* Cab Image */}
                                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                      {cab.imageUrl ? (
                                        <img
                                          src={cab.imageUrl}
                                          alt={cab.cabName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">
                                          {cabType.includes("SUV")
                                            ? "🚙"
                                            : cabType.includes("Traveller")
                                            ? "🚐"
                                            : "🚗"}
                                        </div>
                                      )}
                                      {/* Price Badge */}
                                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                                        <span className="text-[rgb(45,45,68)] font-semibold">
                                          ₹{cab.prices.onSeasonPrice}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Cab Details */}
                                    <div className="p-4 space-y-4">
                                      {/* Name and Type */}
                                      <div>
                                        <h5 className="text-lg font-semibold text-[rgb(45,45,68)] mb-1">
                                          {cab.cabName}
                                        </h5>
                                        <p className="text-sm text-gray-500">
                                          {cab.cabType}
                                        </p>
                                      </div>

                                      {/* Features */}
                                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                          <span className="p-1.5 bg-gray-100 rounded-lg">
                                            👥
                                          </span>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Seating
                                            </p>
                                            <p className="text-sm font-medium text-[rgb(45,45,68)]">
                                              {cab.seatingCapacity} Persons
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="p-1.5 bg-gray-100 rounded-lg">
                                            🧳
                                          </span>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Luggage
                                            </p>
                                            <p className="text-sm font-medium text-[rgb(45,45,68)]">
                                              {cab.luggage}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Additional Features */}
                                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                        {cab.AC && (
                                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                            AC
                                          </span>
                                        )}
                                        {cab.musicSystem && (
                                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                                            Music System
                                          </span>
                                        )}
                                        {cab.pushbackSeats && (
                                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                                            Pushback Seats
                                          </span>
                                        )}
                                      </div>

                                      {/* Pricing Details */}
                                      <div className="pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-sm">
                                          <span className="text-gray-500">
                                            Off Season
                                          </span>
                                          <span className="font-medium text-[rgb(45,45,68)]">
                                            ₹{cab.prices.offSeasonPrice}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-1">
                                          <span className="text-gray-500">
                                            Peak Season
                                          </span>
                                          <span className="font-medium text-[rgb(45,45,68)]">
                                            ₹{cab.prices.peakSeasonPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* No Cabs Message */}
                      {(!selectedPackage?.cabs?.travelPrices?.selectedCabs ||
                        Object.keys(
                          selectedPackage?.cabs?.travelPrices?.selectedCabs
                        ).length === 0) && (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">🚗</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Vehicles Selected
                          </h3>
                          <p className="text-gray-500">
                            No vehicles have been added to this package yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "hotel" && (
                    <div className="space-y-8">
                      {/* Hotel Summary Header */}
                      <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold">Hotel Details</h3>
                          <div className="flex gap-4">
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Total Nights:{" "}
                              </span>
                              <span className="font-mono">
                                {selectedPackage?.hotels?.totalNights || "0"}
                              </span>
                            </div>
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Total Hotels:{" "}
                              </span>
                              <span className="font-mono">
                                {Object.keys(selectedPackage?.hotels || {})
                                  .length - 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hotels List */}
                      <div className="grid grid-cols-1 gap-8">
                        {Object.entries(selectedPackage?.hotels || {}).map(
                          ([key, hotel], index) =>
                            key !== "totalNights" && (
                              <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
                                onClick={() => handleHotelClick(hotel)}
                              >
                                {/* Hotel Header */}
                                <div className="bg-[rgb(45,45,68)] p-4 text-white">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <span className="p-2 bg-white/10 rounded-lg text-xl">
                                        🏨
                                      </span>
                                      <h4 className="text-lg font-semibold">
                                        {hotel.name || "Hotel Name"}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                        {hotel.category || "0"} Star
                                      </span>
                                      <span className="px-3 py-1 bg-green-500/20 rounded-full text-sm">
                                        {hotel.meal || "No Meal"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                                  {/* Image Gallery */}
                                  <div className="md:col-span-1 space-y-4">
                                    {/* Main Image */}
                                    <div className="aspect-video rounded-lg overflow-hidden relative group">
                                      {hotel.imageUrl ? (
                                        <img
                                          src={hotel.imageUrl}
                                          alt={hotel.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-4xl">🏨</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Location Details */}
                                    <div className="space-y-2">
                                      <h6 className="font-medium text-[rgb(45,45,68)]">
                                        Location
                                      </h6>
                                      <p className="text-sm text-gray-600">
                                        {typeof hotel.location === "object"
                                          ? `${hotel.location.address || ""}, ${
                                              hotel.location.city || ""
                                            }, ${hotel.location.state || ""}, ${
                                              hotel.location.country || ""
                                            }`
                                          : hotel.location ||
                                            "Location not specified"}
                                      </p>
                                      {hotel.location?.pincode && (
                                        <p className="text-sm text-gray-600">
                                          Pincode: {hotel.location.pincode}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Hotel Details */}
                                  <div className="md:col-span-2 space-y-6">
                                    {/* Room Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-gray-50 rounded-xl p-4">
                                        <h6 className="text-sm text-gray-500 mb-2">
                                          Room Type
                                        </h6>
                                        <p className="font-medium text-[rgb(45,45,68)]">
                                          {hotel.details?.roomType ||
                                            "Standard"}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 rounded-xl p-4">
                                        <h6 className="text-sm text-gray-500 mb-2">
                                          Room Size
                                        </h6>
                                        <p className="font-medium text-[rgb(45,45,68)]">
                                          {hotel.details?.roomSize || "N/A"} sq
                                          ft
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 rounded-xl p-4">
                                        <h6 className="text-sm text-gray-500 mb-2">
                                          Bed Type
                                        </h6>
                                        <p className="font-medium text-[rgb(45,45,68)]">
                                          {hotel.details?.bedType || "N/A"}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 rounded-xl p-4">
                                        <h6 className="text-sm text-gray-500 mb-2">
                                          View
                                        </h6>
                                        <p className="font-medium text-[rgb(45,45,68)]">
                                          {hotel.details?.roomView ||
                                            "City View"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Amenities */}
                                    <div>
                                      <h6 className="font-medium text-[rgb(45,45,68)] mb-4">
                                        Room Amenities
                                      </h6>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(
                                          hotel.details?.amenities || {}
                                        ).map(
                                          ([amenity, value]) =>
                                            value === "Yes" && (
                                              <div
                                                key={amenity}
                                                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                                              >
                                                <span className="text-green-500">
                                                  ✓
                                                </span>
                                                <span className="text-sm">
                                                  {amenity.replace(/_/g, " ")}
                                                </span>
                                              </div>
                                            )
                                        )}
                                      </div>
                                    </div>

                                    {/* Price and Booking Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                      <div>
                                        <div className="text-sm text-gray-500 mb-1">
                                          Price per night
                                        </div>
                                        <div className="text-2xl font-bold text-[rgb(45,45,68)]">
                                          ₹{hotel.price}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {hotel.meal} included
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">
                                            Check-in
                                          </span>
                                          <span className="font-medium text-[rgb(45,45,68)]">
                                            {hotel.checkIn || "2:00 PM"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">
                                            Check-out
                                          </span>
                                          <span className="font-medium text-[rgb(45,45,68)]">
                                            {hotel.checkOut || "11:00 AM"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">
                                            Cancellation
                                          </span>
                                          <span className="font-medium text-green-600">
                                            Free cancellation
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Hotel Location & Policies */}
                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <h6 className="font-medium text-[rgb(45,45,68)] mb-3">
                                        Location Highlights
                                      </h6>
                                      <div className="space-y-2">
                                        <p className="text-sm flex items-center gap-2">
                                          <span>📍</span>
                                          <span>
                                            {hotel.location || "City Center"}
                                          </span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                          <span>🚗</span>
                                          <span>
                                            Distance from airport:{" "}
                                            {hotel.distanceFromAirport || "N/A"}
                                          </span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                          <span>🏛️</span>
                                          <span>
                                            Nearby landmarks available
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="font-medium text-[rgb(45,45,68)] mb-3">
                                        Hotel Policies
                                      </h6>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          • Passport, Government ID or Driver's
                                          license required
                                        </p>
                                        <p>• No pets allowed</p>
                                        <p>• Children policy applies</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "costing" && (
                    <div className="space-y-8">
                      {/* Price Summary Card */}
                      <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold">Price Summary</h3>
                          <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <span className="text-sm font-medium">
                              Package ID:{" "}
                            </span>
                            <span className="font-mono">
                              {selectedPackage?._id?.slice(-6)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-white/60 mb-2">B2B Price</div>
                            <div className="text-2xl font-bold">
                              ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.b2b || "0"}
                            </div>
                            <div className="text-white/40 text-sm">
                              Per person
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-white/60 mb-2">
                              Internal Price
                            </div>
                            <div className="text-2xl font-bold">
                              ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.internal || "0"}
                            </div>
                            <div className="text-white/40 text-sm">
                              Per person
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-white/60 mb-2">
                              Website Price
                            </div>
                            <div className="text-3xl font-bold">
                              ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.website || "0"}
                            </div>
                            <div className="text-white/40 text-sm">
                              Per person
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Costs */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-[rgb(45,45,68)] p-4 text-white">
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-white/10 rounded-lg text-xl">
                                💰
                              </span>
                              <h4 className="text-lg font-semibold">
                                Base Costs
                              </h4>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            {[
                              {
                                label: "Hotel Cost",
                                value:
                                  selectedPackage?.finalCosting?.breakdown
                                    ?.hotelCost,
                                icon: "🏨",
                              },
                              {
                                label: "Transport Cost",
                                value:
                                  selectedPackage?.finalCosting?.breakdown
                                    ?.transportCost,
                                icon: "🚗",
                              },
                              {
                                label: "Activities Cost",
                                value:
                                  selectedPackage?.finalCosting?.breakdown
                                    ?.activitiesTotalCost,
                                icon: "🎯",
                              },
                              {
                                label: "Additional Cost",
                                value:
                                  selectedPackage?.finalCosting?.breakdown
                                    ?.additionalCost,
                                icon: "➕",
                              },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">{item.icon}</span>
                                  <span className="text-gray-600">
                                    {item.label}
                                  </span>
                                </div>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  ₹{item.value || "0"}
                                </span>
                              </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-medium text-[rgb(45,45,68)]">
                                  Total Base Cost
                                </span>
                                <span className="text-xl font-bold text-[rgb(45,45,68)]">
                                  ₹
                                  {selectedPackage?.finalCosting?.baseTotal ||
                                    "0"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Markup & Taxes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-[rgb(45,45,68)] p-4 text-white">
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-white/10 rounded-lg text-xl">
                                📊
                              </span>
                              <h4 className="text-lg font-semibold">
                                Markup & Taxes
                              </h4>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            {/* Markup Details */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  Markup Percentage
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  {selectedPackage?.finalCosting?.markup || "0"}
                                  %
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  Markup Amount
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  ₹
                                  {selectedPackage?.finalCosting
                                    ?.markupAmount || "0"}
                                </span>
                              </div>
                            </div>

                            {/* Tax Details */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  GST Percentage
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  {selectedPackage?.finalCosting?.gst || "0"}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  GST Amount
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  ₹
                                  {selectedPackage?.finalCosting?.gstAmount ||
                                    "0"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Terms */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-[rgb(45,45,68)] p-4 text-white">
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-white/10 rounded-lg text-xl">
                              📝
                            </span>
                            <h4 className="text-lg font-semibold">
                              Payment Terms
                            </h4>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">
                                Advance Payment
                              </div>
                              <div className="text-lg font-semibold text-[rgb(45,45,68)]">
                                50%
                              </div>
                              <div className="text-sm text-gray-500">
                                Due at booking
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">
                                Second Payment
                              </div>
                              <div className="text-lg font-semibold text-[rgb(45,45,68)]">
                                30%
                              </div>
                              <div className="text-sm text-gray-500">
                                Due before travel
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-600 mb-1">
                                Final Payment
                              </div>
                              <div className="text-lg font-semibold text-[rgb(45,45,68)]">
                                20%
                              </div>
                              <div className="text-sm text-gray-500">
                                Due on arrival
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sightseeing" && (
                    <div className="space-y-8">
                      {/* Sightseeing Header */}
                      <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold">
                            Sightseeing Places
                          </h3>
                          <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <span className="text-sm font-medium">
                              Total Places:{" "}
                            </span>
                            <span className="font-mono">
                              {selectedPackage?.sightseeing?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sightseeing List */}
                      <div className="space-y-4">
                        {/* Group places by day */}
                        {Object.entries(
                          selectedPackage?.sightseeing?.reduce(
                            (groups, place) => {
                              const day = place.dayNumber || 1;
                              if (!groups[day]) groups[day] = [];
                              groups[day].push(place);
                              return groups;
                            },
                            {}
                          ) || {}
                        ).map(([day, places]) => (
                          <div
                            key={day}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                          >
                            {/* Day Header */}
                            <div className="bg-[rgb(45,45,68)] p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 bg-white/10 rounded-lg text-xl">
                                    📅
                                  </span>
                                  <h4 className="text-lg font-semibold">
                                    Day {day}
                                  </h4>
                                </div>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                  {places.length} Places
                                </span>
                              </div>
                            </div>

                            {/* Places List */}
                            <div className="divide-y divide-gray-100">
                              {places.map((place) => (
                                <div
                                  key={place._id}
                                  className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-lg font-medium text-[rgb(45,45,68)]">
                                          {place.placeName}
                                        </h5>
                                        {place.paid && (
                                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                                            Paid
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <span>📍</span> {place.city},{" "}
                                        {place.stateName}
                                      </p>
                                    </div>
                                    {place.price > 0 && (
                                      <div className="text-right">
                                        <span className="font-semibold text-[rgb(45,45,68)]">
                                          ₹{place.price}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                          per person
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Place Details */}
                                  <div className="mt-3 space-y-3">
                                    <p className="text-sm text-gray-600">
                                      {place.description}
                                    </p>

                                    {/* Travel Info */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                      {place.distance && (
                                        <span className="flex items-center gap-1">
                                          <span>🚗</span> {place.distance} km
                                        </span>
                                      )}
                                      {place.time && (
                                        <span className="flex items-center gap-1">
                                          <span>⏱️</span> {place.time}
                                        </span>
                                      )}
                                    </div>

                                    {/* Transport Costs */}
                                    {Object.entries(place.cost || {}).some(
                                      ([_, value]) => value
                                    ) && (
                                      <div className="flex flex-wrap gap-4 pt-2">
                                        <span className="text-sm text-gray-500">
                                          Transport:
                                        </span>
                                        {Object.entries(place.cost).map(
                                          ([vehicle, cost]) =>
                                            cost && (
                                              <span
                                                key={vehicle}
                                                className="text-sm bg-gray-50 px-3 py-1 rounded-full"
                                              >
                                                {vehicle}: ₹{cost}
                                              </span>
                                            )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* No Places Message */}
                        {(!selectedPackage?.sightseeing ||
                          selectedPackage.sightseeing.length === 0) && (
                          <div className="text-center py-12">
                            <div className="text-4xl mb-4">🏖️</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No Sightseeing Places
                            </h3>
                            <p className="text-gray-500">
                              No sightseeing places have been added to this
                              package yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Room Details Modal */}
          {selectedRoom && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="bg-[rgb(45,45,68)] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">
                      {selectedRoom.name}
                    </h4>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Image */}
                    <div className="aspect-video rounded-lg overflow-hidden">
                      {selectedRoom.imageUrl ? (
                        <img
                          src={selectedRoom.imageUrl}
                          alt={selectedRoom.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-4xl">🛏️</span>
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-lg font-semibold text-[rgb(45,45,68)]">
                          {selectedRoom.name}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Room ID: {selectedRoom.id}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Price per night</span>
                          <span className="font-semibold text-[rgb(45,45,68)]">
                            ₹{selectedRoom.price}
                          </span>
                        </div>

                        {/* Add more room details here based on your data structure */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Room Size</span>
                          <span className="font-medium text-[rgb(45,45,68)]">
                            {selectedRoom.size || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Bed Type</span>
                          <span className="font-medium text-[rgb(45,45,68)]">
                            {selectedRoom.bedType || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">View</span>
                          <span className="font-medium text-[rgb(45,45,68)]">
                            {selectedRoom.view || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Room Amenities */}
                      <div>
                        <h6 className="font-medium text-[rgb(45,45,68)] mb-3">
                          Room Amenities
                        </h6>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedRoom.amenities?.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-green-500">✓</span>
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedHotel && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-[rgb(45,45,68)] p-4 text-white sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">
                      {selectedHotel.name}
                    </h4>
                    <button
                      onClick={() => setSelectedHotel(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hotel Image */}
                    <div className="aspect-video rounded-lg overflow-hidden">
                      {selectedHotel.imageUrl ? (
                        <img
                          src={selectedHotel.imageUrl}
                          alt={selectedHotel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-4xl">🏨</span>
                        </div>
                      )}
                    </div>

                    {/* Hotel Details */}
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div>
                        <h5 className="text-xl font-semibold text-[rgb(45,45,68)]">
                          {selectedHotel.name}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedHotel.category} Star Hotel
                        </p>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-[rgb(45,45,68)]">
                          Location
                        </h6>
                        <p className="text-sm text-gray-600">
                          {typeof selectedHotel.location === "object"
                            ? `${selectedHotel.location.address || ""}, ${
                                selectedHotel.location.city || ""
                              }, ${selectedHotel.location.state || ""}, ${
                                selectedHotel.location.country || ""
                              }`
                            : selectedHotel.location ||
                              "Location not specified"}
                        </p>
                        {selectedHotel.location?.pincode && (
                          <p className="text-sm text-gray-600">
                            Pincode: {selectedHotel.location.pincode}
                          </p>
                        )}
                      </div>

                      {/* Room Details */}
                      <div className="space-y-2">
                        <h6 className="font-medium text-[rgb(45,45,68)]">
                          Room Details
                        </h6>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500">Room Type</p>
                            <p className="font-medium text-[rgb(45,45,68)]">
                              {selectedHotel.details?.roomType || "Standard"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500">Bed Type</p>
                            <p className="font-medium text-[rgb(45,45,68)]">
                              {selectedHotel.details?.bedType ||
                                "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Price per night</p>
                        <p className="text-2xl font-bold text-[rgb(45,45,68)]">
                          ₹{selectedHotel.price || "0"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedHotel.meal} included
                        </p>
                      </div>

                      {/* Amenities */}
                      {selectedHotel.details?.amenities && (
                        <div className="space-y-2">
                          <h6 className="font-medium text-[rgb(45,45,68)]">
                            Amenities
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(
                              selectedHotel.details.amenities
                            ).map(
                              ([amenity, value]) =>
                                value === "Yes" && (
                                  <div
                                    key={amenity}
                                    className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg"
                                  >
                                    <span className="text-green-500">✓</span>
                                    <span>{amenity.replace(/_/g, " ")}</span>
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Modal */}
          {showEditModal && editPackageData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="border-b border-gray-700 bg-[rgb(45,45,68)]">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-2xl font-semibold text-white">
                      Edit Package: {editPackageData.package?.packageName}
                    </h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
                    >
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex w-full">
                    {[
                      { id: "package", label: "Package Info", icon: "📦" },
                      { id: "cab", label: "Cab Info", icon: "🚗" },
                      { id: "hotel", label: "Hotel", icon: "🏨" },
                      { id: "sightseeing", label: "Sightseeing", icon: "🗺️" },
                      { id: "costing", label: "Final Costing", icon: "💰" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all flex-1
                ${
                  activeTab === tab.id
                    ? "bg-white text-[rgb(45,45,68)] shadow-[0_0_10px_rgba(0,0,0,0.1)] relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[rgb(45,45,68)]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }
              `}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div
                  className="p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 150px)" }}
                >
                  {/* Package Info Tab */}
                  {activeTab === "package" && (
                    <div className="space-y-6">
                      {/* Basic Package Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Name *
                          </label>
                          <input
                            type="text"
                            value={editPackageData.package?.packageName || ""}
                            onChange={(e) =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  packageName: e.target.value,
                                },
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Type *
                          </label>
                          <select
                            value={editPackageData.package?.packageType || ""}
                            onChange={(e) =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  packageType: e.target.value,
                                },
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select Type</option>
                            {packageTypes.map((type) => (
                              <option key={type._id} value={type.name}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration *
                          </label>
                          <input
                            type="text"
                            value={editPackageData.package?.duration || ""}
                            onChange={(e) =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  duration: e.target.value,
                                },
                              })
                            }
                            placeholder="e.g., 3D/2N"
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location *
                          </label>
                          <input
                            type="text"
                            value={
                              editPackageData.package?.pickupLocation || ""
                            }
                            onChange={(e) =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  pickupLocation: e.target.value,
                                },
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop Location *
                          </label>
                          <input
                            type="text"
                            value={editPackageData.package?.dropLocation || ""}
                            onChange={(e) =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  dropLocation: e.target.value,
                                },
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          />
                        </div>
                      </div>

                      {/* Package Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Description
                        </label>
                        <textarea
                          value={editPackageData.package?.description || ""}
                          onChange={(e) =>
                            setEditPackageData({
                              ...editPackageData,
                              package: {
                                ...editPackageData.package,
                                description: e.target.value,
                              },
                            })
                          }
                          rows={4}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      {/* Package Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Package Images
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {editPackageData.package?.packageImages?.map(
                            (image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Package ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => {
                                    const newImages =
                                      editPackageData.package.packageImages.filter(
                                        (_, i) => i !== index
                                      );
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        packageImages: newImages,
                                      },
                                    });
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            // Handle image upload logic here
                            const files = Array.from(e.target.files);
                            // You'll need to implement image upload to your server
                          }}
                          className="mt-2"
                        />
                      </div>

                      {/* Places Covered */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Places Covered
                        </label>
                        <div className="space-y-2">
                          {editPackageData.package?.placesCovered?.map(
                            (place, index) => (
                              <div key={index} className="flex gap-2">
                                <select
                                  value={place}
                                  onChange={(e) => {
                                    const newPlaces = [
                                      ...editPackageData.package.placesCovered,
                                    ];
                                    newPlaces[index] = e.target.value;
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        placesCovered: newPlaces,
                                      },
                                    });
                                  }}
                                  className="flex-1 p-2 border rounded-md"
                                >
                                  <option value="">Select Place</option>
                                  {placesList.map((placeItem) => (
                                    <option
                                      key={placeItem._id}
                                      value={placeItem.placeName}
                                    >
                                      {placeItem.placeName}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => {
                                    const newPlaces =
                                      editPackageData.package.placesCovered.filter(
                                        (_, i) => i !== index
                                      );
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        placesCovered: newPlaces,
                                      },
                                    });
                                  }}
                                  className="px-3 py-2 text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  placesCovered: [
                                    ...(editPackageData.package.placesCovered ||
                                      []),
                                    "",
                                  ],
                                },
                              });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            <span>+</span> Add Place
                          </button>
                        </div>
                      </div>

                      {/* Themes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Themes
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {editPackageData.package?.themes?.map(
                            (theme, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                              >
                                <span>{theme}</span>
                                <button
                                  onClick={() => {
                                    const newThemes =
                                      editPackageData.package.themes.filter(
                                        (_, i) => i !== index
                                      );
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        themes: newThemes,
                                      },
                                    });
                                  }}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          )}
                          <input
                            type="text"
                            placeholder="Add theme..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.target.value.trim()) {
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    themes: [
                                      ...(editPackageData.package.themes || []),
                                      e.target.value.trim(),
                                    ],
                                  },
                                });
                                e.target.value = "";
                              }
                            }}
                            className="border rounded-md p-2"
                          />
                        </div>
                      </div>

                      {/* Overview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Overview
                        </label>
                        <textarea
                          value={editPackageData.package?.overview || ""}
                          onChange={(e) =>
                            setEditPackageData({
                              ...editPackageData,
                              package: {
                                ...editPackageData.package,
                                overview: e.target.value,
                              },
                            })
                          }
                          rows={4}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cab Info Tab */}
                  {activeTab === "cab" && (
                    <div className="space-y-6">{/* Add cab fields */}</div>
                  )}

                  {/* Hotel Tab */}
                  {activeTab === "hotel" && (
                    <div className="space-y-6">{/* Add hotel fields */}</div>
                  )}

                  {/* Sightseeing Tab */}
                  {activeTab === "sightseeing" && (
                    <div className="space-y-6">
                      {/* Add sightseeing fields */}
                    </div>
                  )}

                  {/* Costing Tab */}
                  {activeTab === "costing" && (
                    <div className="space-y-6">{/* Add costing fields */}</div>
                  )}
                </div>

                {/* Save Button */}
                <div className="sticky bottom-0 bg-white border-t mt-6 p-4 flex justify-end">
                  <button
                    onClick={handleUpdatePackage}
                    disabled={isLoading}
                    className="bg-[rgb(45,45,68)] text-white px-6 py-2 rounded-md hover:bg-opacity-90 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Update Package"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Packages;
