import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Button from "../components/ui-kit/atoms/Button";
import config from "../../config";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const navigate = useNavigate();

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
        `${config.API_HOST}/api/packages/bulk-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // Added Accept header
          },
          body: JSON.stringify({ ids: selectedPackages }), // Changed to match API expectation
        }
      );

      // First check if the response is ok
      if (response.ok) {
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          // If response cannot be parsed as JSON, still proceed with UI update
          console.log(
            "Response could not be parsed as JSON, but operation was successful"
          );
        }

        // Update UI
        const updatedPackages = packages.filter(
          (pkg) => !selectedPackages.includes(pkg._id)
        );
        setPackages(updatedPackages);
        setFilteredPackages(updatedPackages);
        setSelectedPackages([]);
        setShowBulkDeleteModal(false);

        toast.success("Selected packages deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Try to get error message from response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Failed to delete packages";
        } catch (e) {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting packages:", error);
      toast.error(`Failed to delete packages: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setShowBulkDeleteModal(false); // Close modal on error
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
        throw new Error('Failed to fetch package details');
      }
      const data = await response.json();
      setPackageDetails(data);
      setSelectedPackage(data);
      setShowPackageModal(true);
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast.error('Failed to load package details');
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
                      ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-gray-200">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Package Details
                    </h3>
                    <button
                      onClick={() => setShowPackageModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-6 w-6"
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
                  <div className="flex border-b">
                    <button
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "package"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("package")}
                    >
                      Package Info
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "cab"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("cab")}
                    >
                      Cab Info
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "hotel"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("hotel")}
                    >
                      Hotel & Sightseeing
                    </button>
                    <button
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === "costing"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("costing")}
                    >
                      Final Costing
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div
                  className="p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 150px)" }}
                >
                  {activeTab === "package" && (
                    <div className="space-y-6">
                      {/* Package Basic Info */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Name:</span> {selectedPackage?.package?.packageName || 'N/A'}</p>
                            <p><span className="font-medium">Type:</span> {selectedPackage?.package?.packageType || 'N/A'}</p>
                            <p><span className="font-medium">Category:</span> {selectedPackage?.package?.packageCategory || 'N/A'}</p>
                            <p><span className="font-medium">Duration:</span> {selectedPackage?.package?.duration || 'N/A'}</p>
                            <p><span className="font-medium">Status:</span> {selectedPackage?.package?.status || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Locations</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Pickup:</span> {selectedPackage?.package?.pickupLocation || 'N/A'}</p>
                            <p><span className="font-medium">Drop:</span> {selectedPackage?.package?.dropLocation || 'N/A'}</p>
                            <p><span className="font-medium">Transfer:</span> {selectedPackage?.package?.pickupTransfer ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Package Places */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Places Covered</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedPackage?.package?.packagePlaces?.map((place, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h5 className="font-medium">{place.placeCover}</h5>
                              <p>Nights: {place.nights}</p>
                              <p>Transfer: {place.transfer ? 'Yes' : 'No'}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package Description */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <div className="prose max-w-none" 
                             dangerouslySetInnerHTML={{ __html: selectedPackage?.package?.packageDescription || 'No description available' }}>
                        </div>
                      </div>

                      {/* Inclusions & Exclusions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Inclusions</h4>
                          <div className="prose max-w-none" 
                               dangerouslySetInnerHTML={{ __html: selectedPackage?.package?.packageInclusions || 'No inclusions specified' }}>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Exclusions</h4>
                          <div className="prose max-w-none" 
                               dangerouslySetInnerHTML={{ __html: selectedPackage?.package?.packageExclusions || 'No exclusions specified' }}>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPackage?.package?.amenities?.map((amenity, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Themes & Tags */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Themes</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPackage?.package?.themes?.map((theme, index) => (
                              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPackage?.package?.tags?.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Package Images */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Package Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedPackage?.package?.packageImages?.map((image, index) => (
                            <div key={index} className="relative aspect-square">
                              <img 
                                src={image} 
                                alt={`Package image ${index + 1}`}
                                className="object-cover w-full h-full rounded-lg"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Itinerary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Itinerary</h4>
                        <div className="space-y-4">
                          {selectedPackage?.package?.itineraryDays?.map((day, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h5 className="font-medium mb-2">Day {day.day}: {day.selectedItinerary?.itineraryTitle}</h5>
                              <p className="text-gray-600 mb-2">City: {day.selectedItinerary?.cityName}</p>
                              <div className="prose max-w-none">
                                {day.selectedItinerary?.itineraryDescription}
                              </div>
                              {day.selectedItinerary?.distance && (
                                <p className="text-sm text-gray-500 mt-2">Distance: {day.selectedItinerary.distance} km</p>
                              )}
                              {day.selectedItinerary?.totalHours && (
                                <p className="text-sm text-gray-500">Duration: {day.selectedItinerary.totalHours} hours</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "cab" && (
                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Cab Information
                      </h4>
                      {Object.entries(
                        selectedPackage?.cabs?.travelPrices?.selectedCabs || {}
                      ).map(([type, cabs]) => (
                        <div key={type} className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">{type}</h5>
                          {cabs.map((cab, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4">
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {cab.cabName || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Seating:</span>{" "}
                                {cab.seatingCapacity || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">On Season:</span>{" "}
                                ₹{cab.prices?.onSeasonPrice || "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Off Season:</span>{" "}
                                ₹{cab.prices?.offSeasonPrice || "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "hotel" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">
                          Hotel Information
                        </h4>
                        {Object.entries(selectedPackage?.hotels || {}).map(
                          ([key, hotel]) => (
                            <div key={key} className="border rounded-lg p-4">
                              <h5 className="font-medium mb-2">
                                {hotel.name || "N/A"}
                              </h5>
                              <div className="grid grid-cols-2 gap-4">
                                <p>
                                  <span className="font-medium">
                                    Room Type:
                                  </span>{" "}
                                  {hotel.details?.roomType || "N/A"}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Room Size:
                                  </span>{" "}
                                  {hotel.details?.roomSize || "N/A"}
                                </p>
                                <p>
                                  <span className="font-medium">Bed Type:</span>{" "}
                                  {hotel.details?.bedType || "N/A"}
                                </p>
                                <p>
                                  <span className="font-medium">View:</span>{" "}
                                  {hotel.details?.roomView || "N/A"}
                                </p>
                                <p>
                                  <span className="font-medium">Price:</span> ₹
                                  {hotel.price || "N/A"}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Meal Plan:
                                  </span>{" "}
                                  {hotel.meal || "N/A"}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">
                          Sightseeing
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(selectedPackage?.sightseeing || []).map(
                            (sight, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4"
                              >
                                <h5 className="font-medium mb-2">
                                  {sight.placeName || "N/A"}
                                </h5>
                                <p className="text-gray-600 mb-2">
                                  {sight.description ||
                                    "No description available"}
                                </p>
                                <div className="flex justify-between text-sm">
                                  <span>Day {sight.dayNumber || "N/A"}</span>
                                  {sight.time && (
                                    <span>Duration: {sight.time} hours</span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "costing" && (
                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Cost Breakdown
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">Base Costs</h5>
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium">Hotel Cost:</span> ₹
                              {selectedPackage?.finalCosting?.breakdown
                                ?.hotelCost || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Transport Cost:
                              </span>{" "}
                              ₹
                              {selectedPackage?.finalCosting?.breakdown
                                ?.transportCost || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Activities Cost:
                              </span>{" "}
                              ₹
                              {selectedPackage?.finalCosting?.breakdown
                                ?.activitiesTotalCost || "N/A"}
                            </p>
                            <p className="text-lg font-medium mt-4">
                              Total Base Cost: ₹
                              {selectedPackage?.finalCosting?.baseTotal ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">Final Prices</h5>
                          <div className="space-y-2">
                            <p>
                              <span className="font-medium">B2B Price:</span> ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.b2b || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Internal Price:
                              </span>{" "}
                              ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.internal || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Website Price:
                              </span>{" "}
                              ₹
                              {selectedPackage?.finalCosting?.finalPrices
                                ?.website || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
