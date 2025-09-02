import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Button from "../components/ui-kit/atoms/Button";
import config from "../../config";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { ToastContainer, toast } from "react-toastify";
import { useFinalcosting } from "../context/FinalcostingContext";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
const themeColor = "bg-blue-200 text-blue-800"; // Uniform color for all theme tags

const ITEMS_PER_PAGE = 10;

const SkeletonLoader = () => {
  return (
    <div className="p-2 sm:p-4 animate-pulse">
      {/* Filters Skeleton */}
      <div className="w-full bg-white rounded-lg shadow p-3">
        <div className="mb-3">
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded"
            />
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table Skeleton */}
        <div className="hidden lg:block">
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
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="lg:hidden">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 w-6 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 sm:w-48 bg-gray-200 rounded" />
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
  const {loadingss, addData, refreshData, deletePackage, loadings, error, setAddData } = useFinalcosting();
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [filters, setFilters] = useState({
    packageName: "",
    duration: "",
    location: "",
    packageType: "",
    startDate: "",
    endDate: "",
    state:"",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Use context loading instead
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showSelectAllModal, setShowSelectAllModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  console.log(selectedPackage)
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("package");
  const [packageDetails, setPackageDetails] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPackageData, setEditPackageData] = useState(null);
  console.log(editPackageData)
  const [packageTypes, setPackageTypes] = useState([]);
  const [placesList, setPlacesList] = useState([]);
  const navigate = useNavigate();

  // Add new state for copy mode
  const [isCopyMode, setIsCopyMode] = useState(false);

  // Add these state variables at the beginning of your component
  const [itinerarySearchResults, setItinerarySearchResults] = useState({});
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCabType, setSelectedCabType] = useState("");
  const [showSeasonCalendar, setShowSeasonCalendar] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [seasonDates, setSeasonDates] = useState({});

  // Use context data instead of separate API call
  useEffect(() => {
    if (addData && addData.length > 0) {
      console.log('Context addData updated, length:', addData.length);
      const formattedData = addData.map((pkg) => ({
        _id: pkg._id,
        packageName: pkg.package.packageName,
        duration: pkg.package.duration,
        pickupLocation: pkg.package.pickupLocation,
        packageType: pkg.package.packageType,
        packageImages: pkg.package.packageImages,
        baseTotal: pkg.finalCosting.baseTotal,
        state: pkg.package.state
      }));

      setFilteredPackages(formattedData);
      console.log('Filtered packages updated, length:', formattedData.length);
    } else {
      console.log('No addData available or empty array');
      setFilteredPackages([]);
    }
  }, [addData]);

  // Set loading state based on context
  useEffect(() => {
    setIsLoading(loadings);
  }, [loadings]);

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

  // Get unique durations from context data
  const getUniqueDurations = () => {
    if (!addData || addData.length === 0) return [];
    const durations = addData.map((pkg) => pkg.package?.duration || "0D/0N");
    const uniqueDurations = [...new Set(durations)].sort();
    return uniqueDurations;
  };

  // Get unique locations from context data
  const getUniqueLocations = () => {
    if (!addData || addData.length === 0) return [];
    const locations = addData.map(
      (pkg) => pkg.package?.pickupLocation || "Unknown Location"
    );
    const uniqueLocations = [...new Set(locations)].sort();
    return uniqueLocations;
  };

  // Get unique package types from context data
  const getUniquePackageTypes = () => {
    if (!addData || addData.length === 0) return [];
    const types = addData.map((pkg) => pkg.package?.packageType);
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes;
  };

  // Add Indian states list
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
    "Sri Lanka"
  ];

  // Updated filter handler to work with context data
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);

    // Apply filters to the formatted context data
    const formattedData = addData.map((pkg) => ({
      _id: pkg._id,
      packageName: pkg.package.packageName,
      duration: pkg.package.duration,
      pickupLocation: pkg.package.pickupLocation,
      packageType: pkg.package.packageType,
      packageImages: pkg.package.packageImages,
      baseTotal: pkg.finalCosting.baseTotal,
      state: pkg.package.state
    }));

    const filtered = formattedData.filter(pkg => {
      const matchesPackageName = !newFilters.packageName || 
        pkg.packageName.toLowerCase().includes(newFilters.packageName.toLowerCase());

      const matchesDuration = !newFilters.duration || 
        pkg.duration === newFilters.duration;

      const matchesLocation = !newFilters.location || 
        pkg.state?.toLowerCase() === newFilters.location?.toLowerCase();

      const matchesType = !newFilters.packageType || 
        pkg.packageType === newFilters.packageType;

      return matchesPackageName && matchesDuration && matchesLocation && matchesType;
    });

    setFilteredPackages(filtered);
    setCurrentPage(1);
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
      state: "",
    });
    
    // Reset to show all formatted packages from context
    if (addData && addData.length > 0) {
      const formattedData = addData.map((pkg) => ({
        _id: pkg._id,
        packageName: pkg.package.packageName,
        duration: pkg.package.duration,
        pickupLocation: pkg.package.pickupLocation,
        packageType: pkg.package.packageType,
        packageImages: pkg.package.packageImages,
        baseTotal: pkg.finalCosting.baseTotal,
        state: pkg.package.state
      }));
      setFilteredPackages(formattedData);
    }
    setCurrentPage(1);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent card click event from firing
    setPackageToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePackage(packageToDelete);
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
      // No need to call refreshData() as deletePackage already updates the context state
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

  // Updated bulk delete handler with context
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

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const textData = await response.text();
        console.error("Raw response:", textData);
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(errorData.message || "Failed to delete packages");
      }

      // Update context state directly instead of full refresh
      setAddData(prev => prev.filter(pkg => !selectedPackages.includes(pkg._id)));

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

  // Function to handle viewing a package - use context data
  const handleViewClick = async (pkg) => {
    try {
      setIsLoading(true);
      // Find the package from context data instead of making API call
      const packageData = addData.find(p => p._id === pkg._id);
      if (packageData) {
        setPackageDetails(packageData);
        setSelectedPackage(packageData);
        setShowPackageModal(true);
      } else {
        // Fallback to API call if not found in context
        const response = await fetch(`${config.API_HOST}/api/add/get/${pkg._id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch package details");
        }
        const data = await response.json();
        setPackageDetails(data);
        setSelectedPackage(data);
        setShowPackageModal(true);
      }
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
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-3 sm:px-6">
        {/* Mobile Pagination */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        
        {/* Desktop Pagination */}
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

              {/* Show limited page numbers on smaller screens */}
              {totalPages <= 7 ? (
                // Show all pages if total is small
                [...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                      currentPage === index + 1
                        ? "z-10 bg-[rgb(45,45,68)] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(45,45,68)]"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))
              ) : (
                // Show limited pages with ellipsis for larger totals
                <>
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                      currentPage === 1
                        ? "z-10 bg-[rgb(45,45,68)] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(45,45,68)]"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                  >
                    1
                  </button>
                  
                  {/* Ellipsis if needed */}
                  {currentPage > 3 && (
                    <span className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}
                  
                  {/* Current page and neighbors */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (pageNum > 1 && pageNum < totalPages && 
                        (pageNum === currentPage || 
                         pageNum === currentPage - 1 || 
                         pageNum === currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? "z-10 bg-[rgb(45,45,68)] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(45,45,68)]"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Ellipsis if needed */}
                  {currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}
                  
                  {/* Last page */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold ${
                        currentPage === totalPages
                          ? "z-10 bg-[rgb(45,45,68)] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(45,45,68)]"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}

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

  // Function to fetch single package for editing - use context data first
  const handleEditOrCopy = async (packageId, isCopy = false) => {
    try {
      setIsLoading(true);
      
      // Try to find package in context data first
      let packageData = addData.find(p => p._id === packageId);
      
      if (!packageData) {
        // Fallback to API call if not found in context
        const response = await fetch(`${config.API_HOST}/api/add/get/${packageId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch package details");
        }
        packageData = await response.json();
      }

      console.log("Package Data:", packageData);

      // Initialize data, removing _id if copying
      const initializedData = {
        ...packageData,
        _id: isCopy ? undefined : packageData._id,
        package: {
          ...packageData.package,
          packageName: isCopy ? `Copy of ${packageData.package.packageName}` : packageData.package.packageName
        }
      };

      setEditPackageData(initializedData);
      setIsCopyMode(isCopy);
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
      
      const url = isCopyMode 
        ? `${config.API_HOST}/api/add/create`
        : `${config.API_HOST}/api/add/update/${editPackageData._id}`;
      
      const method = isCopyMode ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editPackageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isCopyMode ? 'create' : 'update'} package`);
      }

      const result = await response.json();
      console.log('Update/Create result:', result);

      // Update context state directly instead of full refresh
      if (isCopyMode) {
        // For create, add the new package to the context
        setAddData(prev => [...prev, result]);
      } else {
        // For update, replace the existing package in the context
        setAddData(prev => prev.map(pkg => 
          pkg._id === editPackageData._id ? result : pkg
        ));
      }

      toast.success(isCopyMode ? "Package created successfully" : "Package updated successfully");
      setShowEditModal(false);
      setIsCopyMode(false);
      setEditPackageData(null);
      
    } catch (error) {
      console.error(`Error ${isCopyMode ? 'creating' : 'updating'} package:`, error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the actions column to include the copy button
  const renderActionButtons = (pkg) => (
    <div className="flex gap-1 sm:gap-2">
      <button
        onClick={(e) => handleDeleteClick(e, pkg._id)}
        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
        title="Delete"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
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
        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
        title="View"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </button>
      <button
        onClick={() => handleEditOrCopy(pkg._id, false)}
        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
        title="Edit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        onClick={() => handleEditOrCopy(pkg._id, true)}
        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50"
        title="Copy Package"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
        </svg>
      </button>
    </div>
  );

  // Add this function to handle itinerary search
  const handleItinerarySearch = async (index, query, dayInfo) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/itinerary/searchitineraries?search=${encodeURIComponent(
          query
        )}&type=${dayInfo.type}&from=${encodeURIComponent(
          dayInfo.from || ""
        )}&to=${encodeURIComponent(
          dayInfo.to || ""
        )}&location=${encodeURIComponent(dayInfo.location || "")}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItinerarySearchResults(prev => ({
        ...prev,
        [index]: data
      }));
    } catch (error) {
      console.error("Error in handleItinerarySearch:", error);
    }
  };

  // Add this function to handle itinerary selection
  const handleItinerarySelection = (dayIndex, selectedItinerary) => {
    const updatedDays = [...editPackageData.package.itineraryDays];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      selectedItinerary: {
        ...selectedItinerary,
        itineraryTitle: selectedItinerary.itineraryTitle,
        itineraryDescription: selectedItinerary.itineraryDescription,
        cityName: selectedItinerary.cityName,
        totalHours: selectedItinerary.totalHours,
        distance: selectedItinerary.distance,
        activities: selectedItinerary.activities || [],
        sightseeing: selectedItinerary.sightseeing || [],
        inclusions: selectedItinerary.inclusions || [],
        exclusions: selectedItinerary.exclusions || [],
        cityArea: selectedItinerary.cityArea || [],
      }
    };
    
    setEditPackageData({
      ...editPackageData,
      package: {
        ...editPackageData.package,
        itineraryDays: updatedDays
      }
    });
    
    // Clear search results after selection
    setItinerarySearchResults(prev => ({
      ...prev,
      [dayIndex]: []
    }));
  };

  // Modify the "Add Itinerary" button click handler
  const handleAddItineraryClick = (index, dayInfo) => {
    setSearchInput('');
    handleItinerarySearch(index, '', dayInfo);
  };

  // Add this function to generate day info based on package places
  const generateDayInfo = (index) => {
    if (!editPackageData?.package?.packagePlaces) return null;

    let currentLocation = editPackageData.package.pickupLocation;
    let dayCounter = 0;
    let dayInfo = null;

    // Loop through package places to find the current day's info
    for (const place of editPackageData.package.packagePlaces) {
      // Travel day
      dayCounter++;
      if (dayCounter - 1 === index) {
        return {
          type: "travel",
          from: currentLocation,
          to: place.placeCover,
          isNightTravel: place.transfer || false
        };
      }

      // Local days if nights > 1
      const nights = parseInt(place.nights) || 0;
      for (let i = 1; i < nights; i++) {
        dayCounter++;
        if (dayCounter - 1 === index) {
          return {
            type: "local",
            location: place.placeCover
          };
        }
      }

      currentLocation = place.placeCover;
    }

    // Handle return journey
    if (dayCounter === index && editPackageData.package.dropLocation) {
      return {
        type: "travel",
        from: currentLocation,
        to: editPackageData.package.dropLocation,
        isNightTravel: false
      };
    }

    return null;
  };

  // Update this useEffect to handle duration changes safely
  useEffect(() => {
    if (editPackageData?.package?.duration) {
      try {
        const durationParts = editPackageData.package.duration.split('/');
        if (durationParts.length !== 2) return; // Invalid format, skip processing
        
        const days = parseInt(durationParts[0].split('D')[0]) || 0;
        const nights = parseInt(durationParts[1].split('N')[0]) || 0;
        
        if (isNaN(days) || isNaN(nights)) return; // Invalid numbers, skip processing

        // Initialize or update itinerary days based on new duration
        const updatedItineraryDays = Array.from({ length: days }, (_, index) => {
          const existingDay = editPackageData.package.itineraryDays?.[index];
          return {
            day: index + 1,
            selectedItinerary: existingDay?.selectedItinerary || null
          };
        });

        setEditPackageData(prev => ({
          ...prev,
          package: {
            ...prev.package,
            itineraryDays: updatedItineraryDays
          }
        }));
      } catch (error) {
        console.warn('Invalid duration format:', error);
        // Don't update itinerary days if duration format is invalid
      }
    }
  }, [editPackageData?.package?.duration]);

  // Update the itinerary search section to use generateDayInfo
  {editPackageData?.package?.itineraryDays?.map((day, index) => {
    const dayInfo = generateDayInfo(index);
    
    return (
      <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
              📍
            </span>
            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
              Day {day.day}
              {dayInfo && (
                <span className="ml-2 text-sm text-gray-500">
                  {dayInfo.type === "travel" 
                    ? `(${dayInfo.from} to ${dayInfo.to}${dayInfo.isNightTravel ? " - Night Travel" : ""})`
                    : `(Local activities in ${dayInfo.location})`
                  }
                </span>
              )}
            </h4>
          </div>
          {day.selectedItinerary && (
            <button
              onClick={() => {
                const updatedDays = [...editPackageData.package.itineraryDays];
                updatedDays[index] = { ...updatedDays[index], selectedItinerary: null };
                setEditPackageData({
                  ...editPackageData,
                  package: {
                    ...editPackageData.package,
                    itineraryDays: updatedDays
                  }
                });
              }}
              className="text-red-600 hover:text-red-800"
            >
              Remove Itinerary
            </button>
          )}
        </div>

        {day.selectedItinerary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Itinerary Title</label>
              <input
                type="text"
                value={day.selectedItinerary.itineraryTitle || ""}
                onChange={(e) => {
                  const updatedDays = [...editPackageData.package.itineraryDays];
                  updatedDays[index] = {
                    ...updatedDays[index],
                    selectedItinerary: {
                      ...updatedDays[index].selectedItinerary,
                      itineraryTitle: e.target.value
                    }
                  };
                  setEditPackageData({
                    ...editPackageData,
                    package: {
                      ...editPackageData.package,
                      itineraryDays: updatedDays
                    }
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">City Name</label>
              <input
                type="text"
                value={day.selectedItinerary.cityName || ""}
                readOnly
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Total Hours</label>
              <input
                type="number"
                value={day.selectedItinerary.totalHours || 0}
                onChange={(e) => {
                  const updatedDays = [...editPackageData.package.itineraryDays];
                  updatedDays[index] = {
                    ...updatedDays[index],
                    selectedItinerary: {
                      ...updatedDays[index].selectedItinerary,
                      totalHours: Number(e.target.value)
                    }
                  };
                  setEditPackageData({
                    ...editPackageData,
                    package: {
                      ...editPackageData.package,
                      itineraryDays: updatedDays
                    }
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Distance (km)</label>
              <input
                type="number"
                value={day.selectedItinerary.distance || 0}
                onChange={(e) => {
                  const updatedDays = [...editPackageData.package.itineraryDays];
                  updatedDays[index] = {
                    ...updatedDays[index],
                    selectedItinerary: {
                      ...updatedDays[index].selectedItinerary,
                      distance: Number(e.target.value)
                    }
                  };
                  setEditPackageData({
                    ...editPackageData,
                    package: {
                      ...editPackageData.package,
                      itineraryDays: updatedDays
                    }
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={day.selectedItinerary.itineraryDescription || ""}
                onChange={(e) => {
                  const updatedDays = [...editPackageData.package.itineraryDays];
                  updatedDays[index] = {
                    ...updatedDays[index],
                    selectedItinerary: {
                      ...updatedDays[index].selectedItinerary,
                      itineraryDescription: e.target.value
                    }
                  };
                  setEditPackageData({
                    ...editPackageData,
                    package: {
                      ...editPackageData.package,
                      itineraryDays: updatedDays
                    }
                  });
                }}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Places to Visit Section */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-600">Places to Visit</label>
             
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {day.selectedItinerary.cityArea?.map((place, placeIndex) => (
                  <div key={placeIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm">{place.placeName || place}</span>
                    <button
                      onClick={() => {
                        const updatedDays = [...editPackageData.package.itineraryDays];
                        updatedDays[index].selectedItinerary.cityArea = 
                          updatedDays[index].selectedItinerary.cityArea.filter((_, i) => i !== placeIndex);
                        setEditPackageData({
                          ...editPackageData,
                          package: {
                            ...editPackageData.package,
                            itineraryDays: updatedDays
                          }
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dayInfo ? (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  dayInfo.type === "travel"
                    ? `Search travel itinerary from ${dayInfo.from} to ${dayInfo.to}`
                    : `Search local activities in ${dayInfo.location}`
                }
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  handleItinerarySearch(index, e.target.value, dayInfo);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Results Dropdown */}
              {itinerarySearchResults[index]?.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {itinerarySearchResults[index].map((result, resultIndex) => (
                    <div
                      key={resultIndex}
                      onClick={() => handleItinerarySelection(index, result)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium">{result.itineraryTitle}</div>
                      <div className="text-sm text-gray-600">{result.cityName}</div>
                      <div className="text-xs text-gray-500 flex gap-2 mt-1">
                        <span>{result.totalHours} hours</span>
                        <span>{result.distance} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleAddItineraryClick(index, dayInfo)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Browse Itineraries
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">
            Please configure package places to set up this day's itinerary
          </div>
        )}
      </div>
    );
  })}

  // Add this function to handle hotel search
  const handleHotelSearch = async (query, key) => {
    try {
      setIsSearching(true);
      const response = await axios.get(`${config.API_HOST}/api/packagemaker/get-packagemaker`);
      if (response.data.success) {
        const filteredHotels = response.data.data.filter(hotel => 
          hotel.basicInfo?.propertyName?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredHotels);
      }
    } catch (error) {
      console.error("Error searching hotels:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleDateRangeSelect = (value) => {
    if (!selectedSeason) return;

    setDateRange(value);

    if (value.length === 2 && value[0] && value[1]) {
      const [startDate, endDate] = value;
      const dateList = getDatesInRange(startDate, endDate);

      const updatedSeasonDates = { ...seasonDates };
      const updatedCabs = { ...editPackageData.cabs };

      // Apply dates to all cabs in the package
      Object.entries(updatedCabs.travelPrices.selectedCabs).forEach(([cabType, cabs]) => {
        cabs.forEach(cab => {
          // Initialize or get existing season dates
          if (!updatedSeasonDates[cab.cabName]) {
            updatedSeasonDates[cab.cabName] = {
              onSeason: [],
              offSeason: []
            };
          }

          // Create new season dates object while preserving the other season
          const newSeasonDates = {
            onSeason: selectedSeason === "on" ? dateList : (updatedSeasonDates[cab.cabName].onSeason || []),
            offSeason: selectedSeason === "off" ? dateList : (updatedSeasonDates[cab.cabName].offSeason || [])
          };

          // Update the cab's seasonDates
          updatedSeasonDates[cab.cabName] = newSeasonDates;
          cab.seasonDates = newSeasonDates;
        });
      });

      setSeasonDates(updatedSeasonDates);
      setEditPackageData({
        ...editPackageData,
        cabs: updatedCabs
      });

      setTimeout(() => {
        setDateRange([null, null]);
        setShowSeasonCalendar(false);
      }, 500);
    }
  };

  const getTileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    let isOnSeason = false;
    let isOffSeason = false;

    // Check if the date is in any cab's season dates
    Object.values(seasonDates).forEach(cabDates => {
      if (cabDates.onSeason.includes(dateStr)) {
        isOnSeason = true;
      }
      if (cabDates.offSeason.includes(dateStr)) {
        isOffSeason = true;
      }
    });

    if (isOnSeason) {
      return "bg-yellow-200 hover:bg-yellow-300";
    }
    if (isOffSeason) {
      return "bg-blue-200 hover:bg-blue-300";
    }
    return "";
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
            <div className="bg-white shadow-sm rounded-lg mb-4 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {selectedPackages.length} package
                    {selectedPackages.length > 1 ? "s" : ""} selected
                  </span>
                </div>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
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
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">Delete</span>
                </button>
              </div>
            </div>
          )}
          {/* Updated Search Section to be full width */}
          <div className="p-2 sm:p-4">
            <div className="w-full bg-white rounded-lg shadow p-3">
              {/* Filter Label */}
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Duration Filter */}
                <select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                >
                  <option value="">Select Duration</option>
                  {getUniqueDurations().map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>

                {/* Location Filter - Updated with Indian states */}
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                >
                  <option value="">Select Location</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>

                {/* Package Type Filter */}
                <select
                  name="packageType"
                  value={filters.packageType}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
                >
                  <option value="">Select Package Type</option>
                  {getUniquePackageTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Reset Button */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Packages Table */}
            <div className="mt-4 bg-white rounded-lg shadow overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-[#2c3e50] text-white">
                    <tr>
                      <th className="px-2 py-3 text-left w-[40px]">
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
                      <th className="px-3 py-3 text-left w-[100px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">🖼️</span>
                          <span className="hidden sm:inline">Image</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[200px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">📦</span>
                          <span className="hidden sm:inline">Package Name</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[120px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">⏱️</span>
                          <span className="hidden sm:inline">Duration</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[150px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">📍</span>
                          <span className="hidden sm:inline">Location</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[120px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">🏷️</span>
                          <span className="hidden sm:inline">Type</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[120px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">💰</span>
                          <span className="hidden sm:inline">Price</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[100px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">🔵</span>
                          <span className="hidden sm:inline">Status</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left w-[100px]">
                        <div className="flex items-center gap-1">
                          <span className="text-base">⚡</span>
                          <span className="hidden sm:inline">Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPackages.map((pkg, index) => (
                      <tr
                        key={pkg._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-2 py-3 border-t">
                          <input
                            type="checkbox"
                            checked={selectedPackages.includes(pkg._id)}
                            onChange={() => handleSelectPackage(pkg._id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-3 py-3 border-t">
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
                        <td className="px-3 py-3 border-t font-medium">
                          <div
                            className="max-h-12 overflow-hidden overflow-ellipsis whitespace-nowrap"
                            title={pkg.packageName}
                          >
                            {pkg.packageName.split(" ").slice(0, 6).join(" ") +
                              (pkg.packageName.split(" ").length > 6
                                ? "..."
                                : "")}
                          </div>
                        </td>
                        <td className="px-3 py-3 border-t">{pkg.duration}</td>
                        <td className="px-3 py-3 border-t">
                          {pkg.pickupLocation}
                        </td>
                        <td className="px-3 py-3 border-t">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {pkg.packageType}
                          </span>
                        </td>
                        <td className="px-3 py-3 border-t font-medium">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(pkg.baseTotal)}
                        </td>
                        <td className="px-3 py-3 border-t">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            Active
                          </span>
                        </td>
                        <td className="px-3 py-3 border-t">
                          {renderActionButtons(pkg)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {currentPackages.map((pkg, index) => (
                  <div
                    key={pkg._id}
                    className={`p-4 border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg._id)}
                          onChange={() => handleSelectPackage(pkg._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
                        />
                        <div className="w-16 h-16 relative overflow-hidden rounded-lg flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {pkg.packageName}
                          </h3>
                          <p className="text-sm text-gray-500">{pkg.duration}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {renderActionButtons(pkg)}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">📍 Location:</span>
                        <p className="font-medium">{pkg.pickupLocation}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">🏷️ Type:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {pkg.packageType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">💰 Price:</span>
                        <p className="font-medium">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(pkg.baseTotal)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">🔵 Status:</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Pagination */}
              <Pagination />
            </div>
          </div>
          {/* Select All Confirmation Modal */}
          {showSelectAllModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Select All
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to select all {currentPackages.length}{" "}
                  packages on this page?
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setShowSelectAllModal(false);
                      // Uncheck the select all checkbox
                      const selectAllCheckbox = document.querySelector(
                        'thead input[type="checkbox"]'
                      );
                      if (selectAllCheckbox) selectAllCheckbox.checked = false;
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSelectAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors order-1 sm:order-2"
                  >
                    Select All
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Add Bulk Delete Confirmation Modal */}
          {showBulkDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Bulk Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedPackages.length}{" "}
                  selected package{selectedPackages.length > 1 ? "s" : ""}? This
                  action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors order-1 sm:order-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this package? This action
                  cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors order-1 sm:order-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Package Info Modal */}
          {showPackageModal && selectedPackage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
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
                  <div className="flex w-full overflow-x-auto">
                    {[
                      { id: "package", label: "Package Info", icon: "📦" },
                      { id: "cab", label: "Cab Info", icon: "🚗" },
                      { id: "hotel", label: "Hotel & Sightseeing", icon: "🏨" },
                     
                      { id: "costing", label: "Final Costing", icon: "💰" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-all flex-1 min-w-0
                          ${
                            activeTab === tab.id
                              ? "bg-white text-[rgb(45,45,68)] shadow-[0_0_10px_rgba(0,0,0,0.1)] relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[rgb(45,45,68)]"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <span className="text-base sm:text-lg">{tab.icon}</span>
                        <span className="whitespace-nowrap text-xs sm:text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div
                  className="p-3 sm:p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 200px)" }} // Adjusted height since we removed the button
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

                      {/* Package Description */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            📝
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Package Description
                          </h4>
                        </div>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: selectedPackage?.package?.packageDescription || 'No description available' 
                          }} 
                        />
                      </div>

                      {/* Inclusions & Exclusions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inclusions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              ✅
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Inclusions
                            </h4>
                          </div>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: selectedPackage?.package?.packageInclusions || 'No inclusions specified' 
                            }} 
                          />
                        </div>

                        {/* Exclusions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              ❌
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Exclusions
                            </h4>
                          </div>
                          <div 
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: selectedPackage?.package?.packageExclusions || 'No exclusions specified' 
                            }} 
                          />
                        </div>
                      </div>

                      {/* Custom Exclusions */}
                      {selectedPackage?.package?.customExclusions?.length > 0 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              📋
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Custom Policies
                            </h4>
                          </div>
                          <div className="space-y-6">
                            {selectedPackage.package.customExclusions.map((policy, index) => (
                              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <h5 className="font-medium text-[rgb(45,45,68)] mb-2">
                                  {policy.name}
                                </h5>
                                <div 
                                  className="prose max-w-none"
                                  dangerouslySetInnerHTML={{ 
                                    __html: policy.description || 'No description available' 
                                  }} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                          <div>
                            <h3 className="text-2xl font-bold">Hotel Details</h3>
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

                      {/* Hotels List */}
                      <div className="grid grid-cols-1 gap-8">
                        {Object.entries(selectedPackage?.hotels || {}).map(
                          ([key, hotelData]) => {
                            if (key === "totalNights") return null;

                            const hotel = hotelData.hotelInfo;
                            const room = hotelData.roomInfo;

                            return (
                              <div
                                key={key}
                                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                              >
                                {/* Hotel Header */}
                                <div className="bg-[rgb(45,45,68)] p-4 text-white">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <span className="p-2 bg-white/10 rounded-lg text-xl">
                                        🏨
                                      </span>
                                      <h4 className="text-lg font-semibold">
                                        {hotel?.name || "Hotel Name"}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                        {hotel?.category || "N/A"} Star
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="font-medium text-gray-700 mb-2">
                                          Location
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                          {hotel?.city}, {hotel?.state}
                                        </p>
                                      </div>

                                      <div>
                                        <h5 className="font-medium text-gray-700 mb-2">
                                          Contact
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                          {hotel?.email || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {hotel?.phone || "N/A"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Room Details */}
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="font-medium text-gray-700 mb-2">
                                          Room Information
                                        </h5>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-500">
                                              Room Type
                                            </p>
                                            <p className="font-medium text-[rgb(45,45,68)]">
                                              {room?.roomType || "Standard"}
                                            </p>
                                          </div>
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-500">
                                              Bed Type
                                            </p>
                                            <p className="font-medium text-[rgb(45,45,68)]">
                                              {room?.bedType || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Price */}
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">
                                          Price per night
                                        </p>
                                        <p className="text-2xl font-bold text-[rgb(45,45,68)]">
                                          ₹{room?.price || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Amenities */}
                                  <div className="mt-6">
                                    <h5 className="font-medium text-gray-700 mb-4">
                                      Amenities
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {hotel?.amenities?.basicFacilities &&
                                        Object.entries(
                                          hotel.amenities.basicFacilities
                                        ).map(
                                          ([amenity, value]) =>
                                            value === "Yes" && (
                                              <div
                                                key={amenity}
                                                className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg"
                                              >
                                                <span className="text-green-500">
                                                  ✓
                                                </span>
                                                <span className="text-sm">
                                                  {amenity}
                                                </span>
                                              </div>
                                            )
                                        )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="border-b border-gray-700 bg-[rgb(45,45,68)]">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-2xl font-semibold text-white">
                      {isCopyMode ? "Create New Package" : "Edit Package"}
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
                  <div className="flex w-full overflow-x-auto">
                    {[
                      { id: "package", label: "Package Info", icon: "📦" },
                      { id: "cab", label: "Cab Info", icon: "🚗" },
                      { id: "hotel", label: "Hotel", icon: "🏨" },
                      { id: "sightseeing", label: "Sightseeing", icon: "🗺️" },
                      { id: "activities", label: "Activities", icon: "🗺️" },

                      { id: "costing", label: "Final Costing", icon: "💰" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 font-medium transition-all flex-1 min-w-0
                ${
                  activeTab === tab.id
                    ? "bg-white text-[rgb(45,45,68)] shadow-[0_0_10px_rgba(0,0,0,0.1)] relative before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-[rgb(45,45,68)]"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }
              `}
                      >
                        <span className="text-base sm:text-lg">{tab.icon}</span>
                        <span className="whitespace-nowrap text-xs sm:text-sm">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Content */}
                <div
                  className="p-3 sm:p-6 overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 250px)" }}
                >
                  {/* Package Info Tab */}
                  {activeTab === "package" && (
                    <div className="space-y-8">
                      {/* Basic Info Card */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            📋
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Basic Details
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Package Name
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
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Package Type
                            </label>
                            <input
                              type="text"
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
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Package Category
                            </label>
                            <input
                              type="text"
                              value={
                                editPackageData.package?.packageCategory || ""
                              }
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    packageCategory: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              State
                            </label>
                            <select
                              value={editPackageData.package?.state || ""}
                              onChange={(e) =>
                                setEditPackageData({
                                  ...editPackageData,
                                  package: {
                                    ...editPackageData.package,
                                    state: e.target.value,
                                  },
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select State</option>
                              {indianStates.map((state) => (
                                <option key={state} value={state.toLowerCase()}>
                                  {state}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Duration
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
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            📍
                          </span>
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

                      {/* Package Description */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                            📝
                          </span>
                          <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                            Package Description
                          </h4>
                        </div>
                        <textarea
                          value={editPackageData?.package?.packageDescription || ''}
                          onChange={(e) => {
                            setEditPackageData({
                              ...editPackageData,
                              package: {
                                ...editPackageData.package,
                                packageDescription: e.target.value
                              }
                            });
                          }}
                          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter package description..."
                        />
                      </div>

                      {/* Inclusions & Exclusions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inclusions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              ✅
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Inclusions
                            </h4>
                          </div>
                          <textarea
                            value={editPackageData?.package?.packageInclusions || ''}
                            onChange={(e) => {
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  packageInclusions: e.target.value
                                }
                              });
                            }}
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter package inclusions..."
                          />
                        </div>

                        {/* Exclusions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              ❌
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Exclusions
                            </h4>
                          </div>
                          <textarea
                            value={editPackageData?.package?.packageExclusions || ''}
                            onChange={(e) => {
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  packageExclusions: e.target.value
                                }
                              });
                            }}
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter package exclusions..."
                          />
                        </div>
                      </div>

                      {/* Custom Policies */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                              📋
                            </span>
                            <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                              Custom Policies
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              setEditPackageData({
                                ...editPackageData,
                                package: {
                                  ...editPackageData.package,
                                  customExclusions: [
                                    ...(editPackageData?.package?.customExclusions || []),
                                    { name: '', description: '' }
                                  ]
                                }
                              });
                            }}
                            className="px-4 py-2 bg-[rgb(45,45,68)] text-white rounded-lg hover:bg-[rgb(55,55,88)] transition-colors"
                          >
                            Add Policy
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editPackageData?.package?.customExclusions?.map((policy, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <input
                                  value={policy.name}
                                  onChange={(e) => {
                                    const newCustomExclusions = [...(editPackageData?.package?.customExclusions || [])];
                                    newCustomExclusions[index] = {
                                      ...newCustomExclusions[index],
                                      name: e.target.value
                                    };
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        customExclusions: newCustomExclusions
                                      }
                                    });
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Policy Name"
                                />
                                <button
                                  onClick={() => {
                                    const newCustomExclusions = editPackageData?.package?.customExclusions?.filter((_, i) => i !== index);
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        customExclusions: newCustomExclusions
                                      }
                                    });
                                  }}
                                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                              <textarea
                                value={policy.description}
                                onChange={(e) => {
                                  const newCustomExclusions = [...(editPackageData?.package?.customExclusions || [])];
                                  newCustomExclusions[index] = {
                                    ...newCustomExclusions[index],
                                    description: e.target.value
                                  };
                                  setEditPackageData({
                                    ...editPackageData,
                                    package: {
                                      ...editPackageData.package,
                                      customExclusions: newCustomExclusions
                                    }
                                  });
                                }}
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Policy Description"
                              />
                            </div>
                          ))}
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
                          <button
                            onClick={() => {
                              // Initialize seasonDates from existing cab data
                              const initialSeasonDates = {};
                              Object.entries(editPackageData.cabs?.travelPrices?.selectedCabs || {}).forEach(([cabType, cabs]) => {
                                cabs.forEach(cab => {
                                  if (cab.seasonDates) {
                                    initialSeasonDates[cab.cabName] = cab.seasonDates;
                                  }
                                });
                              });
                              setSeasonDates(initialSeasonDates);
                              setShowSeasonCalendar(true);
                            }}
                            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Edit Season Dates
                          </button>
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

                          {/* Add New Cab Section */}
                          <div className="border-t pt-6">
                            <div className="flex flex-col gap-4">
                              <h6 className="font-medium text-gray-700">Add New Cab</h6>
                              
                              {/* Cab Type Selection */}
                              <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Select Cab Type
                                  </label>
                                  <select
                                    value={selectedCabType || ""}
                                    onChange={(e) => setSelectedCabType(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Choose Cab Type</option>
                                    <option value="Hatchback">Hatchback</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Traveller">Traveller</option>
                                  </select>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    if (!selectedCabType) {
                                      alert("Please select a cab type first");
                                      return;
                                    }
                                    
                                    const updatedCabs = { ...editPackageData.cabs };
                                    if (!updatedCabs.travelPrices) {
                                      updatedCabs.travelPrices = { selectedCabs: {} };
                                    }
                                    if (!updatedCabs.travelPrices.selectedCabs[selectedCabType]) {
                                      updatedCabs.travelPrices.selectedCabs[selectedCabType] = [];
                                    }
                                    
                                    updatedCabs.travelPrices.selectedCabs[selectedCabType].push({
                                      cabName: "",
                                      cabType: selectedCabType,
                                      seatingCapacity: "",
                                      luggage: "",
                                      prices: {
                                        onSeasonPrice: 0,
                                        offSeasonPrice: 0,
                                      },
                                    });
                                    
                                    setEditPackageData({
                                      ...editPackageData,
                                      cabs: updatedCabs,
                                    });
                                    
                                    // Reset selection after adding
                                    setSelectedCabType("");
                                  }}
                                  disabled={!selectedCabType}
                                  className={`px-6 py-2 rounded-lg transition-colors ${
                                    selectedCabType
                                      ? "bg-blue-600 text-white hover:bg-blue-700"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  Add Cab
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hotel Tab */}
                  {activeTab === "hotel" && (
                    <div className="space-y-8">
                      {/* Hotels List */}
                      {Object.entries(editPackageData?.hotels || {}).map(([key, hotelData]) => {
                        if (key === "totalNights") return null;
                        {console.log(hotelData)}
                        return (
                          <div key={key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                                  🏨
                                </span>
                                <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                                  Hotel {parseInt(key)}
                                </h4>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedHotels = { ...editPackageData.hotels };
                                  delete updatedHotels[key];
                                  setEditPackageData({
                                    ...editPackageData,
                                    hotels: updatedHotels
                                  });
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove Hotel
                              </button>
                            </div>

                            {/* Hotel Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Hotel Name</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={hotelData.hotelInfo?.name || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Update the hotel name
                                      const updatedHotels = { ...editPackageData.hotels };
                                      updatedHotels[key] = {
                                        ...hotelData,
                                        hotelInfo: {
                                          ...hotelData.hotelInfo,
                                          name: value
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        hotels: updatedHotels
                                      });
                                      // Trigger search if input length > 2
                                      if (value.length > 2) {
                                        handleHotelSearch(value, key);
                                      } else {
                                        setSearchResults([]);
                                      }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  
                                  {/* Search Results Dropdown */}
                                  {searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                      {searchResults.map((hotel) => {
                                        const defaultRoom = hotel.rooms?.data?.[0] || {};
                                        return (
                                          <div
                                            key={hotel._id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                            onClick={() => {
                                              const updatedHotels = { ...editPackageData.hotels };
                                              updatedHotels[key] = {
                                                hotelInfo: {
                                                  id: hotel._id,
                                                  name: hotel.basicInfo.propertyName,
                                                  basicInfo: hotel.basicInfo,
                                                  photosAndVideos: hotel.photosAndVideos
                                                },
                                                roomInfo: {
                                                  id: defaultRoom._id,
                                                  name: defaultRoom.roomName,
                                                  price: parseInt(defaultRoom.baseRate),
                                                  meal: defaultRoom.mealOption,
                                                  imageUrl: defaultRoom.imageUrl,
                                                  details: {
                                                    roomSize: defaultRoom.roomsizeinnumber,
                                                    bedType: defaultRoom.bedType,
                                                    roomView: defaultRoom.roomView,
                                                    maxOccupancy: defaultRoom.maxOccupancy,
                                                    roomType: defaultRoom.roomType
                                                  }
                                                }
                                              };
                                              
                                              setEditPackageData({
                                                ...editPackageData,
                                                hotels: updatedHotels
                                              });
                                              setSearchResults([]);
                                            }}
                                          >
                                            <div className="flex items-start gap-3">
                                              {/* Hotel Image */}
                                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {hotel.rooms?.data[0]?.imageUrl ? (
                                                  <img 
                                                    src={hotel.rooms.data[0].imageUrl} 
                                                    alt={hotel.basicInfo.propertyName}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    🏨
                                                  </div>
                                                )}
                                              </div>

                                              {/* Hotel Details */}
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                  {hotel.basicInfo.propertyName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                  ID: {hotel._id}
                                                </div>
                                                {hotel.rooms?.data[0] && (
                                                  <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-700">
                                                        {hotel.rooms.data[0].roomName}
                                                      </span>
                                                      <span className="text-sm font-semibold text-green-600">
                                                        ₹{hotel.rooms.data[0].baseRate}
                                                      </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                      {hotel.rooms.data[0].mealOption} • {hotel.rooms.data[0].roomType}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      {hotel.rooms.data[0].roomView} • Max: {hotel.rooms.data[0].maxOccupancy} persons
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Star Rating</label>
                                <select
                                  value={hotelData.hotelInfo?.basicInfo?.hotelStarRating || ""}
                                  onChange={(e) => {
                                    const updatedHotels = { ...editPackageData.hotels };
                                    updatedHotels[key] = {
                                      ...hotelData,
                                      hotelInfo: {
                                        ...hotelData.hotelInfo,
                                        basicInfo: {
                                          ...hotelData.hotelInfo.basicInfo,
                                          hotelStarRating: e.target.value
                                        }
                                      }
                                    };
                                    setEditPackageData({
                                      ...editPackageData,
                                      hotels: updatedHotels
                                    });
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select Rating</option>
                                  {["1 Star", "2 Star", "3 Star", "4 Star", "5 Star"].map((rating) => (
                                    <option key={rating} value={rating}>{rating}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Room Info */}
                            <div className="border-t pt-6">
                              <h5 className="font-medium text-gray-700 mb-4">Room Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">Room Type</label>
                                  <input
                                    type="text"
                                    value={hotelData.roomInfo?.name || ""}
                                    onChange={(e) => {
                                      const updatedHotels = { ...editPackageData.hotels };
                                      updatedHotels[key] = {
                                        ...hotelData,
                                        roomInfo: {
                                          ...hotelData.roomInfo,
                                          name: e.target.value
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        hotels: updatedHotels
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">Price per Night</label>
                                  <input
                                    type="number"
                                    value={hotelData.roomInfo?.price || 0}
                                    onChange={(e) => {
                                      const updatedHotels = { ...editPackageData.hotels };
                                      updatedHotels[key] = {
                                        ...hotelData,
                                        roomInfo: {
                                          ...hotelData.roomInfo,
                                          price: Number(e.target.value)
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        hotels: updatedHotels
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add New Hotel Button */}
                      <button
                        onClick={() => {
                          const newKey = Object.keys(editPackageData?.hotels || {}).length + 1;
                          setEditPackageData({
                            ...editPackageData,
                            hotels: {
                              ...editPackageData.hotels,
                              [newKey]: {
                                hotelInfo: {
                                  name: "",
                                  basicInfo: {
                                    hotelStarRating: ""
                                  }
                                },
                                roomInfo: {
                                  name: "",
                                  price: 0
                                }
                              }
                            }
                          });
                        }}
                        className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        + Add New Hotel
                      </button>
                    </div>
                  )}

                  {/* Sightseeing Tab */}
                  {activeTab === "sightseeing" && (
                    <div className="space-y-8">
                      {/* Sightseeing Places */}
                      {editPackageData?.package.itineraryDays.map((day, index) => {
                        const dayInfo = generateDayInfo(index);
                        
                        return (
                          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-gray-100 rounded-lg text-[rgb(45,45,68)] text-xl">
                                  📍
                                </span>
                                <h4 className="text-lg font-semibold text-[rgb(45,45,68)]">
                                  Day {day.day}
                                  {dayInfo && (
                                    <span className="ml-2 text-sm text-gray-500">
                                      {dayInfo.type === "travel" 
                                        ? `(${dayInfo.from} to ${dayInfo.to}${dayInfo.isNightTravel ? " - Night Travel" : ""})`
                                        : `(Local activities in ${dayInfo.location})`
                                      }
                                    </span>
                                  )}
                                </h4>
                              </div>
                              {day.selectedItinerary && (
                                <button
                                  onClick={() => {
                                    const updatedDays = [...editPackageData.package.itineraryDays];
                                    updatedDays[index] = { ...updatedDays[index], selectedItinerary: null };
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        itineraryDays: updatedDays
                                      }
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove Itinerary
                                </button>
                              )}
                            </div>

                            {day.selectedItinerary ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">Itinerary Title</label>
                                  <input
                                    type="text"
                                    value={day.selectedItinerary.itineraryTitle || ""}
                                    onChange={(e) => {
                                      const updatedDays = [...editPackageData.package.itineraryDays];
                                      updatedDays[index] = {
                                        ...updatedDays[index],
                                        selectedItinerary: {
                                          ...updatedDays[index].selectedItinerary,
                                          itineraryTitle: e.target.value
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          itineraryDays: updatedDays
                                        }
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">City Name</label>
                                  <input
                                    type="text"
                                    value={day.selectedItinerary.cityName || ""}
                                    readOnly
                                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">Total Hours</label>
                                  <input
                                    type="number"
                                    value={day.selectedItinerary.totalHours || 0}
                                    onChange={(e) => {
                                      const updatedDays = [...editPackageData.package.itineraryDays];
                                      updatedDays[index] = {
                                        ...updatedDays[index],
                                        selectedItinerary: {
                                          ...updatedDays[index].selectedItinerary,
                                          totalHours: Number(e.target.value)
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          itineraryDays: updatedDays
                                        }
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">Distance (km)</label>
                                  <input
                                    type="number"
                                    value={day.selectedItinerary.distance || 0}
                                    onChange={(e) => {
                                      const updatedDays = [...editPackageData.package.itineraryDays];
                                      updatedDays[index] = {
                                        ...updatedDays[index],
                                        selectedItinerary: {
                                          ...updatedDays[index].selectedItinerary,
                                          distance: Number(e.target.value)
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          itineraryDays: updatedDays
                                        }
                                      });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                                  <textarea
                                    value={day.selectedItinerary.itineraryDescription || ""}
                                    onChange={(e) => {
                                      const updatedDays = [...editPackageData.package.itineraryDays];
                                      updatedDays[index] = {
                                        ...updatedDays[index],
                                        selectedItinerary: {
                                          ...updatedDays[index].selectedItinerary,
                                          itineraryDescription: e.target.value
                                        }
                                      };
                                      setEditPackageData({
                                        ...editPackageData,
                                        package: {
                                          ...editPackageData.package,
                                          itineraryDays: updatedDays
                                        }
                                      });
                                    }}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* Places to Visit Section */}
                                <div className="md:col-span-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm text-gray-600">Places to Visit</label>
                                  
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {day.selectedItinerary.cityArea?.map((place, placeIndex) => (
                                      <div key={placeIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <span className="text-sm">{place.placeName || place}</span>
                                        <button
                                          onClick={() => {
                                            const updatedDays = [...editPackageData.package.itineraryDays];
                                            updatedDays[index].selectedItinerary.cityArea = 
                                              updatedDays[index].selectedItinerary.cityArea.filter((_, i) => i !== placeIndex);
                                            setEditPackageData({
                                              ...editPackageData,
                                              package: {
                                                ...editPackageData.package,
                                                itineraryDays: updatedDays
                                              }
                                            });
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : dayInfo ? (
                              <div className="space-y-4">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder={
                                      dayInfo.type === "travel"
                                        ? `Search travel itinerary from ${dayInfo.from} to ${dayInfo.to}`
                                        : `Search local activities in ${dayInfo.location}`
                                    }
                                    value={searchInput}
                                    onChange={(e) => {
                                      setSearchInput(e.target.value);
                                      handleItinerarySearch(index, e.target.value, dayInfo);
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                                  
                                  {/* Search Results Dropdown */}
                                  {itinerarySearchResults[index]?.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                      {itinerarySearchResults[index].map((result, resultIndex) => (
                                        <div
                                          key={resultIndex}
                                          onClick={() => handleItinerarySelection(index, result)}
                                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        >
                                          <div className="font-medium">{result.itineraryTitle}</div>
                                          <div className="text-sm text-gray-600">{result.cityName}</div>
                                          <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                            <span>{result.totalHours} hours</span>
                                            <span>{result.distance} km</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleAddItineraryClick(index, dayInfo)}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Browse Itineraries
                                </button>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-4">
                                Please configure package places to set up this day's itinerary
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
{activeTab === "activities" && (
  <div className="space-y-8">
    {/* Activities Header */}
    <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Activities</h3>
          <p className="text-white/80">Manage package activities</p>
        </div>
        <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <span className="text-sm font-medium">Total Activities: </span>
          <span className="font-mono">{editPackageData?.activities?.length || 0}</span>
        </div>
      </div>
    </div>

    {/* Activities List */}
    <div className="space-y-6">
      {editPackageData?.activities?.map((activity, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Activity Header */}
          <div className="bg-[rgb(45,45,68)] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-white/10 rounded-lg text-xl">🎯</span>
                <h4 className="text-lg font-semibold">{activity.title}</h4>
              </div>
              <button
                onClick={() => {
                  const updatedActivities = editPackageData.activities.filter((_, i) => i !== index);
                  setEditPackageData({
                    ...editPackageData,
                    activities: updatedActivities
                  });
                }}
                className="text-white/80 hover:text-white"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>

          {/* Activity Content */}
          <div className="p-6 space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Activity Name</label>
                <input
                  type="text"
                  value={activity.title || ""}
                  onChange={(e) => {
                    const updatedActivities = [...editPackageData.activities];
                    updatedActivities[index] = {
                      ...activity,
                      title: e.target.value
                    };
                    setEditPackageData({
                      ...editPackageData,
                      activities: updatedActivities
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <input
                  type="text"
                  value={activity.category_id || ""}
                  readOnly
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Price</label>
                <input
                  type="number"
                  value={activity.price || 0}
                  onChange={(e) => {
                    const updatedActivities = [...editPackageData.activities];
                    updatedActivities[index] = {
                      ...activity,
                      price: e.target.value
                    };
                    setEditPackageData({
                      ...editPackageData,
                      activities: updatedActivities
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  value={`${activity.city}, ${activity.state}`}
                  readOnly
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={activity.short_description || ""}
                onChange={(e) => {
                  const updatedActivities = [...editPackageData.activities];
                  updatedActivities[index] = {
                    ...activity,
                    short_description: e.target.value
                  };
                  setEditPackageData({
                    ...editPackageData,
                    activities: updatedActivities
                  });
                }}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {activity.tags?.split(',').map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Activity Button */}
      <button
        onClick={() => {
          // Add logic to add new activity
        }}
        className="w-full p-4 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-xl">+</span>
          Add New Activity
        </span>
      </button>
    </div>
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
                <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePackage}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors order-1 sm:order-2"
                    >
                      {isCopyMode ? "Create Package" : "Update Package"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Season Calendar Modal */}
      {showSeasonCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-2xl w-full">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  Set Season Dates for All Cabs
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Selected dates will be applied to all cabs in the package
                </p>
              </div>
              <button
                onClick={() => setShowSeasonCalendar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
              <button
                onClick={() => {
                  setSelectedSeason("on");
                  setDateRange([null, null]);
                }}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm ${
                  selectedSeason === "on"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                On Season
              </button>
              <button
                onClick={() => {
                  setSelectedSeason("off");
                  setDateRange([null, null]);
                }}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm ${
                  selectedSeason === "off"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Off Season
              </button>
            </div>

            <div className="mb-4 overflow-x-auto">
              <Calendar
                onChange={handleDateRangeSelect}
                value={dateRange}
                selectRange={true}
                tileClassName={getTileClassName}
                className="rounded-lg border custom-calendar"
              />
            </div>

            <div className="mt-4">
              <div className="mb-4 text-sm text-gray-600">
                <div>
                  Selected Range:{" "}
                  {dateRange[0] && dateRange[1]
                    ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                    : "No dates selected"}
                </div>
              </div>
              <button
                onClick={() => setShowSeasonCalendar(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Packages;
