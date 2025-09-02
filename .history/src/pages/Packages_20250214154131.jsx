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
  const [packageTypes, setPackageTypes] = useState([]);
  const [placesList, setPlacesList] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, placesRes] = await Promise.all([
          fetch(`${config.API_HOST}/api/packagetype/get`),
          fetch(`${config.API_HOST}/api/places/get`),
        ]);

        const types = await typesRes.json();
        const places = await placesRes.json();

        setPackageTypes(types.filter((type) => type.Type === "package type"));
        setPlacesList(places);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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

  // Function to fetch packages
  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_HOST}/api/add/get`);
      if (!response.ok) {
        throw new Error("Failed to fetch packages");
      }
      const data = await response.json();

      console.log("Fetched Packages Data:", data);

      // Format the data to match the display requirements
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

  // Function to fetch single package for editing
  const handleEditClick = async (packageId) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${config.API_HOST}/api/add/get/${packageId}`
      );
      const data = await response.json();
      console.log("Single Package Data:", data);

      // Initialize the edit data with all fields from the API response
      const initializedData = {
        _id: data._id,
        package: {
          packageName: data.package?.packageName || "",
          packageType: data.package?.packageType || "",
          packageCategory: data.package?.packageCategory || "",
          duration: data.package?.duration || "",
          pickupLocation: data.package?.pickupLocation || "",
          dropLocation: data.package?.dropLocation || "",
          pickupTransfer: data.package?.pickupTransfer || false,
          packagePlaces: Array.isArray(data.package?.packagePlaces)
            ? data.package.packagePlaces
            : [],
          themes: Array.isArray(data.package?.themes)
            ? data.package.themes
            : [],
          tags: Array.isArray(data.package?.tags) ? data.package.tags : [],
          packageImages: Array.isArray(data.package?.packageImages)
            ? data.package.packageImages
            : [],
          itineraryDays: Array.isArray(data.package?.itineraryDays)
            ? data.package.itineraryDays
            : [],
        },
        cabs: data.cabs || {
          travelPrices: {
            selectedCabs: {},
          },
        },
        hotels: data.hotels || {},
        sightseeing: data.sightseeing || {},
        finalCosting: data.finalCosting || {
          baseTotal: 0,
          taxPercentage: 0,
          taxAmount: 0,
          grandTotal: 0,
        },
      };

      setEditPackageData(initializedData);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching package:", error);
      toast.error("Failed to load package details");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function at the top of your component
  const calculateFinalPrices = (baseTotal, margins) => {
    const b2bPrice = baseTotal + (baseTotal * (margins?.b2b || 0)) / 100;
    const internalPrice =
      baseTotal + (baseTotal * (margins?.internal || 0)) / 100;
    const websitePrice =
      baseTotal + (baseTotal * (margins?.website || 0)) / 100;
    return { b2b: b2bPrice, internal: internalPrice, website: websitePrice };
  };

  const handleCostChange = (field, value) => {
    const updatedBreakdown = {
      ...editPackageData.finalCosting?.breakdown,
      [field]: parseFloat(value) || 0,
    };

    // Calculate new base total
    const newBaseTotal =
      parseFloat(updatedBreakdown.hotelCost || 0) +
      parseFloat(updatedBreakdown.transportCost || 0) +
      parseFloat(updatedBreakdown.activitiesTotalCost || 0);

    // Calculate new final prices based on existing margins
    const newFinalPrices = calculateFinalPrices(
      newBaseTotal,
      editPackageData.finalCosting?.margins
    );

    setEditPackageData({
      ...editPackageData,
      finalCosting: {
        ...editPackageData.finalCosting,
        breakdown: updatedBreakdown,
        baseTotal: newBaseTotal,
        finalPrices: newFinalPrices,
      },
    });
  };

  const handleMarginChange = (field, value) => {
    const updatedMargins = {
      ...editPackageData.finalCosting?.margins,
      [field]: parseFloat(value) || 0,
    };

    const newFinalPrices = calculateFinalPrices(
      editPackageData.finalCosting?.baseTotal || 0,
      updatedMargins
    );

    setEditPackageData({
      ...editPackageData,
      finalCosting: {
        ...editPackageData.finalCosting,
        margins: updatedMargins,
        finalPrices: newFinalPrices,
      },
    });
  };

  // Function to update package
  const handleUpdatePackage = async () => {
    try {
      setIsLoading(true);

      // Log the data being sent
      console.log("Updating package with data:", editPackageData);

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

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Raw API Response:", responseText);

      // Try to parse it as JSON only if it's valid
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Invalid JSON response:", e);
        throw new Error("Server returned invalid JSON");
      }

      if (response.ok) {
        toast.success("Package updated successfully");
        setShowEditModal(false);
        // Refresh packages list
        fetchPackages();
      } else {
        throw new Error(data.message || "Failed to update package");
      }
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
                Filter by:
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
                    <th className="px-4 py-3 text-left">
                      <span className="flex items-center">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                        </svg>
                        Package Name
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Location</th>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Location Details
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Pickup Location
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
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Drop Location
                            </label>
                            <input
                              type="text"
                              value={
                                editPackageData.package?.dropLocation || ""
                              }
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    dropLocation: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                editPackageData.package?.pickupTransfer || false
                              }
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    pickupTransfer: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="text-sm text-gray-600">
                              Include Pickup Transfer
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Places Covered */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            🗺️
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Places Covered
                          </h4>
                        </div>
                        <div className="space-y-4">
                          {editPackageData.package?.packagePlaces?.map(
                            (place, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg"
                              >
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Place Name
                                  </label>
                                  <input
                                    type="text"
                                    value={place.placeCover || ""}
                                    onChange={(e) => {
                                      const updatedPlaces = [
                                        ...(editPackageData.package
                                          ?.packagePlaces || []),
                                      ];
                                      updatedPlaces[index] = {
                                        ...updatedPlaces[index],
                                        placeCover: e.target.value,
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          packagePlaces: updatedPlaces,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Nights
                                  </label>
                                  <input
                                    type="number"
                                    value={place.nights || 0}
                                    onChange={(e) => {
                                      const updatedPlaces = [
                                        ...(editPackageData.package
                                          ?.packagePlaces || []),
                                      ];
                                      updatedPlaces[index] = {
                                        ...updatedPlaces[index],
                                        nights: parseInt(e.target.value),
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          packagePlaces: updatedPlaces,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            )
                          )}
                          <button
                            onClick={() =>
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  packagePlaces: [
                                    ...(editPackageData.package
                                      ?.packagePlaces || []),
                                    { placeCover: "", nights: 0 },
                                  ],
                                },
                              })
                            }
                            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            + Add Place
                          </button>
                        </div>
                      </div>

                      {/* Themes and Tags */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            🎨
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Themes & Tags
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Themes (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={(
                                editPackageData.package?.themes || []
                              ).join(", ")}
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    themes: e.target.value
                                      .split(",")
                                      .map((theme) => theme.trim()),
                                  },
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Tags (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={(editPackageData.package?.tags || []).join(
                                ", "
                              )}
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    tags: e.target.value
                                      .split(",")
                                      .map((tag) => tag.trim()),
                                  },
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cab Info Tab */}
                  {activeTab === "cab" && (
                    <div className="space-y-8">
                      {/* Cab Details Card */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            🚗
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Cab Details
                          </h4>
                        </div>

                        {/* Travel Prices Section */}
                        <div className="space-y-6">
                          {Object.entries(
                            editPackageData.cabs?.travelPrices?.selectedCabs ||
                              {}
                          ).map(([cabType, cabs]) => (
                            <div key={cabType} className="space-y-4">
                              <h5 className="font-semibold text-lg text-gray-800">
                                {cabType}
                              </h5>
                              {cabs.map((cab, index) => (
                                <div
                                  key={index}
                                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                                >
                                  <div className="flex justify-between items-center">
                                    <h6 className="font-medium text-gray-700">
                                      {cab.cabName || `${cabType} ${index + 1}`}
                                    </h6>
                                    <button
                                      onClick={() => {
                                        const updatedCabs = {
                                          ...editPackageData.cabs,
                                        };
                                        updatedCabs.travelPrices.selectedCabs[
                                          cabType
                                        ] = cabs.filter((_, i) => i !== index);
                                        setEditPackageData({
                                          ...editPackageData,
                                          cabs: updatedCabs,
                                        });
                                      }}
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
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        Cab Name
                                      </label>
                                      <input
                                        type="text"
                                        value={cab.cabName || ""}
                                        onChange={(e) => {
                                          const updatedCabs = {
                                            ...editPackageData.cabs,
                                          };
                                          updatedCabs.travelPrices.selectedCabs[
                                            cabType
                                          ][index] = {
                                            ...cab,
                                            cabName: e.target.value,
                                          };
                                          setEditPackageData({
                                            ...editPackageData,
                                            cabs: updatedCabs,
                                          });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        Seating Capacity
                                      </label>
                                      <input
                                        type="text"
                                        value={cab.seatingCapacity || ""}
                                        onChange={(e) => {
                                          const updatedCabs = {
                                            ...editPackageData.cabs,
                                          };
                                          updatedCabs.travelPrices.selectedCabs[
                                            cabType
                                          ][index] = {
                                            ...cab,
                                            seatingCapacity: e.target.value,
                                          };
                                          setEditPackageData({
                                            ...editPackageData,
                                            cabs: updatedCabs,
                                          });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        On Season Price
                                      </label>
                                      <input
                                        type="number"
                                        value={cab.prices?.onSeasonPrice || 0}
                                        onChange={(e) => {
                                          const updatedCabs = {
                                            ...editPackageData.cabs,
                                          };
                                          updatedCabs.travelPrices.selectedCabs[
                                            cabType
                                          ][index] = {
                                            ...cab,
                                            prices: {
                                              ...cab.prices,
                                              onSeasonPrice: e.target.value,
                                            },
                                          };
                                          setEditPackageData({
                                            ...editPackageData,
                                            cabs: updatedCabs,
                                          });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        Off Season Price
                                      </label>
                                      <input
                                        type="number"
                                        value={cab.prices?.offSeasonPrice || 0}
                                        onChange={(e) => {
                                          const updatedCabs = {
                                            ...editPackageData.cabs,
                                          };
                                          updatedCabs.travelPrices.selectedCabs[
                                            cabType
                                          ][index] = {
                                            ...cab,
                                            prices: {
                                              ...cab.prices,
                                              offSeasonPrice: e.target.value,
                                            },
                                          };
                                          setEditPackageData({
                                            ...editPackageData,
                                            cabs: updatedCabs,
                                          });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        Luggage Capacity
                                      </label>
                                      <input
                                        type="text"
                                        value={cab.luggage || ""}
                                        onChange={(e) => {
                                          const updatedCabs = {
                                            ...editPackageData.cabs,
                                          };
                                          updatedCabs.travelPrices.selectedCabs[
                                            cabType
                                          ][index] = {
                                            ...cab,
                                            luggage: e.target.value,
                                          };
                                          setEditPackageData({
                                            ...editPackageData,
                                            cabs: updatedCabs,
                                          });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}

                          {/* Add New Cab Button */}
                          <button
                            onClick={() => {
                              const updatedCabs = { ...editPackageData.cabs };
                              if (!updatedCabs.travelPrices) {
                                updatedCabs.travelPrices = { selectedCabs: {} };
                              }
                              if (
                                !updatedCabs.travelPrices.selectedCabs.Hatchback
                              ) {
                                updatedCabs.travelPrices.selectedCabs.Hatchback =
                                  [];
                              }
                              updatedCabs.travelPrices.selectedCabs.Hatchback.push(
                                {
                                  cabName: "",
                                  cabType: "Hatchback",
                                  seatingCapacity: "",
                                  luggage: "",
                                  prices: {
                                    onSeasonPrice: 0,
                                    offSeasonPrice: 0,
                                  },
                                }
                              );
                              setEditPackageData({
                                ...editPackageData,
                                cabs: updatedCabs,
                              });
                            }}
                            className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                          >
                            + Add New Cab
                          </button>
                        </div>
                      </div>
                    </div>
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
                    <div className="space-y-8">
                      {/* Final Costing Tab */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            💰
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Final Costing Details
                          </h4>
                        </div>

                        <div className="space-y-6">
                          {/* Cost Breakdown Section */}
                          <div className="border-b pb-6">
                            <h5 className="font-medium text-gray-700 mb-4">
                              Cost Breakdown
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Hotel Cost
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.breakdown
                                        ?.hotelCost || 0
                                    }
                                    onChange={(e) => {
                                      const hotelCost = Number(e.target.value);
                                      const transportCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.transportCost || 0;
                                      const activitiesCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.activitiesTotalCost || 0;
                                      const baseTotal =
                                        hotelCost +
                                        transportCost +
                                        activitiesCost;
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        editPackageData?.finalCosting?.margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          breakdown: {
                                            ...editPackageData.finalCosting
                                              ?.breakdown,
                                            hotelCost,
                                          },
                                          baseTotal,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    ₹
                                    {selectedPackage?.finalCosting?.breakdown
                                      ?.hotelCost || 0}
                                  </div>
                                )}
                              </div>

                              {/* Add similar conditional rendering for other fields */}
                              {/* Transport Cost */}
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Transport Cost
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.breakdown
                                        ?.transportCost || 0
                                    }
                                    onChange={(e) => {
                                      const transportCost = Number(
                                        e.target.value
                                      );
                                      const hotelCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.hotelCost || 0;
                                      const activitiesCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.activitiesTotalCost || 0;
                                      const baseTotal =
                                        hotelCost +
                                        transportCost +
                                        activitiesCost;
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        editPackageData?.finalCosting?.margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          breakdown: {
                                            ...editPackageData.finalCosting
                                              ?.breakdown,
                                            transportCost,
                                          },
                                          baseTotal,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    ₹
                                    {selectedPackage?.finalCosting?.breakdown
                                      ?.transportCost || 0}
                                  </div>
                                )}
                              </div>

                              {/* Activities Cost */}
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Activities Total Cost
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.breakdown
                                        ?.activitiesTotalCost || 0
                                    }
                                    onChange={(e) => {
                                      const activitiesCost = Number(
                                        e.target.value
                                      );
                                      const hotelCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.hotelCost || 0;
                                      const transportCost =
                                        editPackageData?.finalCosting?.breakdown
                                          ?.transportCost || 0;
                                      const baseTotal =
                                        hotelCost +
                                        transportCost +
                                        activitiesCost;
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        editPackageData?.finalCosting?.margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          breakdown: {
                                            ...editPackageData.finalCosting
                                              ?.breakdown,
                                            activitiesTotalCost,
                                          },
                                          baseTotal,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    ₹
                                    {selectedPackage?.finalCosting?.breakdown
                                      ?.activitiesTotalCost || 0}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Base Total */}
                          <div className="border-b pb-6">
                            <h5 className="font-medium text-gray-700 mb-4">
                              Base Total
                            </h5>
                            <div className="w-full md:w-1/3">
                              <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                ₹{selectedPackage?.finalCosting?.baseTotal || 0}
                              </div>
                            </div>
                          </div>

                          {/* Margins Section */}
                          <div className="border-b pb-6">
                            <h5 className="font-medium text-gray-700 mb-4">
                              Margins (%)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  B2B Margin
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.margins
                                        ?.b2b || 0
                                    }
                                    onChange={(e) => {
                                      const b2bMargin = Number(e.target.value);
                                      const baseTotal =
                                        editPackageData?.finalCosting
                                          ?.baseTotal || 0;
                                      const margins = {
                                        ...editPackageData?.finalCosting
                                          ?.margins,
                                        b2b: b2bMargin,
                                      };
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          margins,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    {selectedPackage?.finalCosting?.margins
                                      ?.b2b || 0}
                                    %
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Internal Margin
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.margins
                                        ?.internal || 0
                                    }
                                    onChange={(e) => {
                                      const internalMargin = Number(
                                        e.target.value
                                      );
                                      const baseTotal =
                                        editPackageData?.finalCosting
                                          ?.baseTotal || 0;
                                      const margins = {
                                        ...editPackageData?.finalCosting
                                          ?.margins,
                                        internal: internalMargin,
                                      };
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          margins,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    {selectedPackage?.finalCosting?.margins
                                      ?.internal || 0}
                                    %
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Website Margin
                                </label>
                                {showEditModal ? (
                                  <input
                                    type="number"
                                    value={
                                      editPackageData?.finalCosting?.margins
                                        ?.website || 0
                                    }
                                    onChange={(e) => {
                                      const websiteMargin = Number(
                                        e.target.value
                                      );
                                      const baseTotal =
                                        editPackageData?.finalCosting
                                          ?.baseTotal || 0;
                                      const margins = {
                                        ...editPackageData?.finalCosting
                                          ?.margins,
                                        website: websiteMargin,
                                      };
                                      const finalPrices = calculateFinalPrices(
                                        baseTotal,
                                        margins
                                      );

                                      setEditPackageData({
                                        ...editPackageData,
                                        finalCosting: {
                                          ...editPackageData.finalCosting,
                                          margins,
                                          finalPrices,
                                        },
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                ) : (
                                  <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                    {selectedPackage?.finalCosting?.margins
                                      ?.website || 0}
                                    %
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Final Prices Section */}
                          <div>
                            <h5 className="font-medium text-gray-700 mb-4">
                              Final Prices
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  B2B Price
                                </label>
                                <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                  ₹
                                  {showEditModal
                                    ? editPackageData?.finalCosting?.finalPrices?.b2b?.toFixed(
                                        2
                                      ) || 0
                                    : selectedPackage?.finalCosting?.finalPrices
                                        ?.b2b || 0}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Internal Price
                                </label>
                                <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                  ₹
                                  {showEditModal
                                    ? editPackageData?.finalCosting?.finalPrices?.internal?.toFixed(
                                        2
                                      ) || 0
                                    : selectedPackage?.finalCosting?.finalPrices
                                        ?.internal || 0}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Website Price
                                </label>
                                <div className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                                  ₹
                                  {showEditModal
                                    ? editPackageData?.finalCosting?.finalPrices?.website?.toFixed(
                                        2
                                      ) || 0
                                    : selectedPackage?.finalCosting?.finalPrices
                                        ?.website || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Button */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePackage}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Update Package
                    </button>
                  </div>
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
