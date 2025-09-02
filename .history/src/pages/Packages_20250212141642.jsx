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
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPackageData, setEditPackageData] = useState(null);
  const [editCabData, setEditCabData] = useState(null);
  const [isEditCabLoading, setIsEditCabLoading] = useState(false);
  const navigate = useNavigate();
  const [hotelEditMode, setHotelEditMode] = useState("prices");
  const [editCostingData, setEditCostingData] = useState(null);

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

  // Update handleEditClick function to fetch cab data
  const handleEditClick = async (pkg) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_HOST}/api/add/get/${pkg._id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch package details");
      }
      const data = await response.json();
      setEditPackageData(data);
      setEditCabData(data.cabs);
      setEditCostingData(data.finalCosting); // Store costing data separately
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching package details:", error);
      toast.error("Failed to load package details");
    } finally {
      setIsLoading(false);
    }
  };

  // Move handleSaveChanges function before the JSX
  const handleSaveChanges = async () => {
    try {
      // Combine all the updated data
      const updatedData = {
        ...editPackageData,
        cabs: editCabData,
        finalCosting: editCostingData
      };

      const response = await fetch(
        `${config.API_HOST}/api/add/update/${editPackageData._id}`,
        {
                                              hotels: updatedHotels,
                                            });
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(45,45,68)]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Room Category
                                        </label>
                                        <select
                                          value={hotel.category}
                                          onChange={(e) => {
                                            const updatedHotels = {
                                              ...editPackageData.hotels,
                                            };
                                            updatedHotels[key].category =
                                              e.target.value;
                                            setEditPackageData({
                                              ...editPackageData,
                                              hotels: updatedHotels,
                                            });
                                          }}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(45,45,68)]"
                                        >
                                          <option value="3">3 Star</option>
                                          <option value="4">4 Star</option>
                                          <option value="5">5 Star</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {hotelEditMode === "images" && (
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                              <h3 className="text-xl font-semibold text-[rgb(45,45,68)] mb-6">
                                Hotel Images
                              </h3>
                              {Object.entries(
                                editPackageData?.hotels || {}
                              ).map(([key, hotel]) => {
                                if (key === "totalNights") return null;
                                return (
                                  <div
                                    key={key}
                                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                                  >
                                    <h4 className="font-medium text-[rgb(45,45,68)] mb-4">
                                      {hotel.name}
                                    </h4>
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-4">
                                        {hotel.imageUrl && (
                                          <div className="relative w-24 h-24">
                                            <img
                                              src={hotel.imageUrl}
                                              alt={hotel.name}
                                              className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                              onClick={() => {
                                                const updatedHotels = {
                                                  ...editPackageData.hotels,
                                                };
                                                updatedHotels[key].imageUrl =
                                                  "";
                                                setEditPackageData({
                                                  ...editPackageData,
                                                  hotels: updatedHotels,
                                                });
                                              }}
                                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
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
                                                  d="M6 18L18 6M6 6l12 12"
                                                />
                                              </svg>
                                            </button>
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                              // Handle image upload logic here
                                              const file = e.target.files[0];
                                              if (file) {
                                                // You'll need to implement the image upload functionality
                                                // and update the imageUrl in the state
                                              }
                                            }}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgb(45,45,68)] file:text-white hover:file:bg-[rgb(55,55,88)]"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {hotelEditMode === "amenities" && (
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                              <h3 className="text-xl font-semibold text-[rgb(45,45,68)] mb-6">
                                Hotel Amenities
                              </h3>
                              {/* Add amenities editing UI here */}
                            </div>
                          </div>
                        )}

                        {hotelEditMode === "details" && (
                          <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                              <h3 className="text-xl font-semibold text-[rgb(45,45,68)] mb-6">
                                Basic Details
                              </h3>
                              {/* Add basic details editing UI here */}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "costing" && editCostingData && (
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
                              {editPackageData?._id?.slice(-6)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* B2B Price */}
                          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-white/60 mb-2">B2B Price</div>
                            <input
                              type="number"
                              value={editCostingData?.finalPrices?.b2b || "0"}
                              onChange={(e) => {
                                setEditCostingData({
                                  ...editCostingData,
                                  finalPrices: {
                                    ...editCostingData.finalPrices,
                                    b2b: e.target.value,
                                  },
                                });
                              }}
                              className="w-full bg-transparent text-2xl font-bold border border-white/20 rounded px-2 py-1"
                            />
                            <div className="text-white/40 text-sm">
                              Per person
                            </div>
                          </div>

                          {/* Internal Price */}
                          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-white/60 mb-2">
                              Internal Price
                            </div>
                            <input
                              type="number"
                              value={
                                editCostingData?.finalPrices?.internal || "0"
                              }
                              onChange={(e) => {
                                setEditCostingData({
                                  ...editCostingData,
                                  finalPrices: {
                                    ...editCostingData.finalPrices,
                                    internal: e.target.value,
                                  },
                                });
                              }}
                              className="w-full bg-transparent text-2xl font-bold border border-white/20 rounded px-2 py-1"
                            />
                            <div className="text-white/40 text-sm">
                              Per person
                            </div>
                          </div>

                          {/* Website Price */}
                          <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-white/60 mb-2">
                              Website Price
                            </div>
                            <input
                              type="number"
                              value={
                                editCostingData?.finalPrices?.website || "0"
                              }
                              onChange={(e) => {
                                setEditCostingData({
                                  ...editCostingData,
                                  finalPrices: {
                                    ...editCostingData.finalPrices,
                                    website: e.target.value,
                                  },
                                });
                              }}
                              className="w-full bg-transparent text-3xl font-bold border border-white/20 rounded px-2 py-1"
                            />
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
                                key: "hotelCost",
                                icon: "🏨",
                              },
                              {
                                label: "Transport Cost",
                                key: "transportCost",
                                icon: "🚗",
                              },
                              {
                                label: "Activities Cost",
                                key: "activitiesTotalCost",
                                icon: "🎯",
                              },
                              {
                                label: "Additional Cost",
                                key: "additionalCost",
                                icon: "➕",
                              },
                            ].map((item) => (
                              <div
                                key={item.key}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">{item.icon}</span>
                                  <span className="text-gray-600">
                                    {item.label}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={
                                    editCostingData?.breakdown?.[item.key] ||
                                    "0"
                                  }
                                  onChange={(e) => {
                                    setEditCostingData({
                                      ...editCostingData,
                                      breakdown: {
                                        ...editCostingData.breakdown,
                                        [item.key]: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                />
                              </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-medium text-[rgb(45,45,68)]">
                                  Total Base Cost
                                </span>
                                <span className="text-xl font-bold text-[rgb(45,45,68)]">
                                  ₹{editCostingData?.baseTotal || "0"}
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
                                <input
                                  type="number"
                                  value={editCostingData?.markup || "0"}
                                  onChange={(e) => {
                                    setEditCostingData({
                                      ...editCostingData,
                                      markup: e.target.value,
                                    });
                                  }}
                                  className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                />
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  Markup Amount
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  ₹{editCostingData?.markupAmount || "0"}
                                </span>
                              </div>
                            </div>

                            {/* Tax Details */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  GST Percentage
                                </span>
                                <input
                                  type="number"
                                  value={editCostingData?.gst || "0"}
                                  onChange={(e) => {
                                    setEditCostingData({
                                      ...editCostingData,
                                      gst: e.target.value,
                                    });
                                  }}
                                  className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                />
                              </div>
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">
                                  GST Amount
                                </span>
                                <span className="font-semibold text-[rgb(45,45,68)]">
                                  ₹{editCostingData?.gstAmount || "0"}
                                </span>
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
                      Edit Package: {editPackageData?.package?.packageName}
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
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(90vh - 200px)" }}
                >
                  <div className="p-6">
                    {activeTab === "package" && (
                      <div className="space-y-6">
                        {/* Basic Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Basic Details
                            </h4>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Package Name
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editPackageData?.package?.packageName || ""
                                  }
                                  onChange={(e) => {
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        packageName: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Package Type
                                </label>
                                <select
                                  value={
                                    editPackageData?.package?.packageType || ""
                                  }
                                  onChange={(e) => {
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        packageType: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select Type</option>
                                  <option value="Honeymoon">Honeymoon</option>
                                  <option value="Family">Family</option>
                                  <option value="Adventure">Adventure</option>
                                  <option value="Cultural">Cultural</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Location Details
                            </h4>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Pickup Location
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editPackageData?.package?.pickupLocation ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        pickupLocation: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Drop Location
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editPackageData?.package?.dropLocation || ""
                                  }
                                  onChange={(e) => {
                                    setEditPackageData({
                                      ...editPackageData,
                                      package: {
                                        ...editPackageData.package,
                                        dropLocation: e.target.value,
                                      },
                                    });
                                  }}
                                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Places Covered */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Places Covered
                            </h4>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              {editPackageData?.package?.packagePlaces?.map(
                                (place, index) => (
                                  <div
                                    key={index}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Place Name
                                        </label>
                                        <input
                                          type="text"
                                          value={place.placeCover}
                                          onChange={(e) => {
                                            const updatedPlaces = [
                                              ...editPackageData.package
                                                .packagePlaces,
                                            ];
                                            updatedPlaces[index].placeCover =
                                              e.target.value;
                                            setEditPackageData({
                                              ...editPackageData,
                                              package: {
                                                ...editPackageData.package,
                                                packagePlaces: updatedPlaces,
                                              },
                                            });
                                          }}
                                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Nights
                                        </label>
                                        <input
                                          type="number"
                                          value={place.nights}
                                          onChange={(e) => {
                                            const updatedPlaces = [
                                              ...editPackageData.package
                                                .packagePlaces,
                                            ];
                                            updatedPlaces[index].nights =
                                              e.target.value;
                                            setEditPackageData({
                                              ...editPackageData,
                                              package: {
                                                ...editPackageData.package,
                                                packagePlaces: updatedPlaces,
                                              },
                                            });
                                          }}
                                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      </div>
                                      <div className="flex items-center">
                                        <label className="inline-flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={place.transfer}
                                            onChange={(e) => {
                                              const updatedPlaces = [
                                                ...editPackageData.package
                                                  .packagePlaces,
                                              ];
                                              updatedPlaces[index].transfer =
                                                e.target.checked;
                                              setEditPackageData({
                                                ...editPackageData,
                                                package: {
                                                  ...editPackageData.package,
                                                  packagePlaces: updatedPlaces,
                                                },
                                              });
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                          />
                                          <span className="ml-2 text-sm text-gray-700">
                                            Include Transfer
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                              <button
                                onClick={() => {
                                  setEditPackageData({
                                    ...editPackageData,
                                    package: {
                                      ...editPackageData.package,
                                      packagePlaces: [
                                        ...(editPackageData.package
                                          .packagePlaces || []),
                                        {
                                          placeCover: "",
                                          nights: 0,
                                          transfer: false,
                                        },
                                      ],
                                    },
                                  });
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Add Place
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "cab" && editCabData && (
                      <div className="space-y-8">
                        {/* Cab Summary Header */}
                        <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-2xl font-bold mb-2">
                                Transport Details
                              </h3>
                              <p className="text-white/80">
                                Edit vehicle information
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cab Categories */}
                        <div className="space-y-6">
                          {Object.entries(
                            editCabData?.travelPrices?.selectedCabs || {}
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
                                      className="bg-white rounded-xl p-4 border border-gray-200"
                                    >
                                      <div className="space-y-4">
                                        {/* Cab Name */}
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Vehicle Name
                                          </label>
                                          <input
                                            type="text"
                                            value={cab.cabName}
                                            onChange={(e) => {
                                              const updatedCabs = {
                                                ...editCabData,
                                              };
                                              updatedCabs.travelPrices.selectedCabs[
                                                cabType
                                              ][index].cabName = e.target.value;
                                              setEditCabData(updatedCabs);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(45,45,68)]"
                                          />
                                        </div>

                                        {/* Prices */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              On Season Price
                                            </label>
                                            <input
                                              type="number"
                                              value={cab.prices.onSeasonPrice}
                                              onChange={(e) => {
                                                const updatedCabs = {
                                                  ...editCabData,
                                                };
                                                updatedCabs.travelPrices.selectedCabs[
                                                  cabType
                                                ][index].prices.onSeasonPrice =
                                                  e.target.value;
                                                setEditCabData(updatedCabs);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(45,45,68)]"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Off Season Price
                                            </label>
                                            <input
                                              type="number"
                                              value={cab.prices.offSeasonPrice}
                                              onChange={(e) => {
                                                const updatedCabs = {
                                                  ...editCabData,
                                                };
                                                updatedCabs.travelPrices.selectedCabs[
                                                  cabType
                                                ][index].prices.offSeasonPrice =
                                                  e.target.value;
                                                setEditCabData(updatedCabs);
                                              }}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(45,45,68)]"
                                            />
                                          </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                          <label className="block text-sm font-medium text-gray-700">
                                            Features
                                          </label>
                                          <div className="flex flex-wrap gap-4">
                                            {[
                                              "AC",
                                              "musicSystem",
                                              "pushbackSeats",
                                            ].map((feature) => (
                                              <label
                                                key={feature}
                                                className="flex items-center gap-2"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={cab[feature]}
                                                  onChange={(e) => {
                                                    const updatedCabs = {
                                                      ...editCabData,
                                                    };
                                                    updatedCabs.travelPrices.selectedCabs[
                                                      cabType
                                                    ][index][feature] =
                                                      e.target.checked;
                                                    setEditCabData(updatedCabs);
                                                  }}
                                                  className="rounded border-gray-300 text-[rgb(45,45,68)] focus:ring-[rgb(45,45,68)]"
                                                />
                                                <span className="text-sm text-gray-600">
                                                  {feature
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    feature.slice(1)}
                                                </span>
                                              </label>
                                            ))}
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
                      </div>
                    )}

                    {activeTab === "hotel" && (
                      <div className="space-y-8">
                        {/* Hotel Summary Header */}
                        <div className="bg-gradient-to-br from-[rgb(45,45,68)] to-[rgb(55,55,88)] rounded-xl p-8 text-white shadow-xl">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">
                              Hotel Details
                            </h3>
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
                                            ? `${
                                                hotel.location.address || ""
                                              }, ${
                                                hotel.location.city || ""
                                              }, ${
                                                hotel.location.state || ""
                                              }, ${
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
                                            {hotel.details?.roomSize || "N/A"}{" "}
                                            sq ft
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
                                              {hotel.distanceFromAirport ||
                                                "N/A"}
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
                                            • Passport, Government ID or
                                            Driver's license required
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
                            <h3 className="text-2xl font-bold">
                              Price Summary
                            </h3>
                            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                              <span className="text-sm font-medium">
                                Package ID:{" "}
                              </span>
                              <span className="font-mono">
                                {editPackageData?._id?.slice(-6)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* B2B Price */}
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                              <div className="text-white/60 mb-2">
                                B2B Price
                              </div>
                              <input
                                type="number"
                                value={editCostingData?.finalPrices?.b2b || "0"}
                                onChange={(e) => {
                                  setEditCostingData({
                                    ...editCostingData,
                                    finalPrices: {
                                      ...editCostingData.finalPrices,
                                      b2b: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full bg-transparent text-2xl font-bold border border-white/20 rounded px-2 py-1"
                              />
                              <div className="text-white/40 text-sm">
                                Per person
                              </div>
                            </div>

                            {/* Internal Price */}
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                              <div className="text-white/60 mb-2">
                                Internal Price
                              </div>
                              <input
                                type="number"
                                value={
                                  editCostingData?.finalPrices?.internal || "0"
                                }
                                onChange={(e) => {
                                  setEditCostingData({
                                    ...editCostingData,
                                    finalPrices: {
                                      ...editCostingData.finalPrices,
                                      internal: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full bg-transparent text-2xl font-bold border border-white/20 rounded px-2 py-1"
                              />
                              <div className="text-white/40 text-sm">
                                Per person
                              </div>
                            </div>

                            {/* Website Price */}
                            <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                              <div className="text-white/60 mb-2">
                                Website Price
                              </div>
                              <input
                                type="number"
                                value={
                                  editCostingData?.finalPrices?.website || "0"
                                }
                                onChange={(e) => {
                                  setEditCostingData({
                                    ...editCostingData,
                                    finalPrices: {
                                      ...editCostingData.finalPrices,
                                      website: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full bg-transparent text-3xl font-bold border border-white/20 rounded px-2 py-1"
                              />
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
                                  key: "hotelCost",
                                  icon: "🏨",
                                },
                                {
                                  label: "Transport Cost",
                                  key: "transportCost",
                                  icon: "🚗",
                                },
                                {
                                  label: "Activities Cost",
                                  key: "activitiesTotalCost",
                                  icon: "🎯",
                                },
                                {
                                  label: "Additional Cost",
                                  key: "additionalCost",
                                  icon: "➕",
                                },
                              ].map((item) => (
                                <div
                                  key={item.key}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-gray-600">
                                      {item.label}
                                    </span>
                                  </div>
                                  <input
                                    type="number"
                                    value={
                                      editCostingData?.breakdown?.[item.key] ||
                                      "0"
                                    }
                                    onChange={(e) => {
                                      setEditCostingData({
                                        ...editCostingData,
                                        breakdown: {
                                          ...editCostingData.breakdown,
                                          [item.key]: e.target.value,
                                        },
                                      });
                                    }}
                                    className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                  />
                                </div>
                              ))}
                              <div className="pt-4 mt-4 border-t border-dashed border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-medium text-[rgb(45,45,68)]">
                                    Total Base Cost
                                  </span>
                                  <span className="text-xl font-bold text-[rgb(45,45,68)]">
                                    ₹{editCostingData?.baseTotal || "0"}
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
                                  <input
                                    type="number"
                                    value={editCostingData?.markup || "0"}
                                    onChange={(e) => {
                                      setEditCostingData({
                                        ...editCostingData,
                                        markup: e.target.value,
                                      });
                                    }}
                                    className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                  />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">
                                    Markup Amount
                                  </span>
                                  <span className="font-semibold text-[rgb(45,45,68)]">
                                    ₹{editCostingData?.markupAmount || "0"}
                                  </span>
                                </div>
                              </div>

                              {/* Tax Details */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">
                                    GST Percentage
                                  </span>
                                  <input
                                    type="number"
                                    value={editCostingData?.gst || "0"}
                                    onChange={(e) => {
                                      setEditCostingData({
                                        ...editCostingData,
                                        gst: e.target.value,
                                      });
                                    }}
                                    className="w-32 px-3 py-1 border border-gray-300 rounded text-right font-semibold text-[rgb(45,45,68)]"
                                  />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="text-gray-600">
                                    GST Amount
                                  </span>
                                  <span className="font-semibold text-[rgb(45,45,68)]">
                                    ₹{editCostingData?.gstAmount || "0"}
                                  </span>
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

                {/* Footer with actions */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
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
