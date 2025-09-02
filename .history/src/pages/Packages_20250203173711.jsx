import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Button from "../components/ui-kit/atoms/Button";
import config from "../../config";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const themeColor = "bg-blue-200 text-blue-800"; // Uniform color for all theme tags

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${config.API_HOST}/api/packages/getpackages`
        );
        const data = await response.json();
        setPackages(data);
        setFilteredPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Simplified search handler that only matches package titles
  const handleSearch = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(
        packages.filter((pkg) =>
          pkg.packageName.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // Function to handle package card click
  const handlePackageClick = (id) => {
    navigate(`/create-package?edit=${id}`);
    window.location.reload(); // Add page refresh
  };

  const handleEditClick = (e, id) => {
    e.stopPropagation(); // Prevent card click event from firing
    navigate(`/create-package?edit=${id}`);
    window.location.reload(); // Add page refresh
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent card click event from firing
    setPackageToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/packages/packagedelete/${packageToDelete}`,
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
        toast.success('Package deleted successfully', {
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

  return (
    <>
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Find Your Perfect Package
            </h2>
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ex. Delhi, Manali, Shimla"
              className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-300 ease-in-out"
              onClick={() => handleSearch(searchTerm)}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 p-6 bg-gray-50">
        {isLoading ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">Loading packages...</h3>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">
              No packages found for the selected city.
            </h3>
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <motion.div
              key={pkg._id}
              className="bg-white rounded-2xl w-[380px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_5px_20px_rgba(0,0,0,0.15)] transition-all duration-300 relative"
              whileHover={{ scale: 1.02 }}
            >
              {/* Admin Controls */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={(e) => handleEditClick(e, pkg._id)}
                  className="bg-white/90 backdrop-blur-sm text-blue-600 p-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg"
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
                <button
                  onClick={(e) => handleDeleteClick(e, pkg._id)}
                  className="bg-white/90 backdrop-blur-sm text-red-600 p-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 shadow-lg"
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

              {/* Image Section with price overlay */}
              <div className="relative h-[220px]">
                <img
                  src={pkg.packageImages[0]}
                  alt={pkg.packageName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Tour Type Tags */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-[#FF6B00] text-white px-3 py-1 rounded-full text-[13px] font-medium shadow-lg">
                    GROUP TOUR
                  </span>
                  <span className="bg-[#E91E63] text-white px-3 py-1 rounded-full text-[13px] font-medium shadow-lg">
                    {pkg.packageType}
                  </span>
                </div>

                {/* Redesigned Price Overlay with Flexbox */}
                <div className="absolute bottom-3 right-3 bg-white rounded-lg p-3 shadow-lg flex items-center">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-gray-600">
                      Starting from
                    </span>
                    <div className="flex items-baseline">
                      <span className="text-[22px] font-bold text-gray-800">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(pkg.initialAmount)}
                      </span>
                      <span className="text-[11px] text-gray-500 ml-1">
                        per person
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4">
                <h3 className="text-[22px] font-bold text-gray-800 leading-tight mb-3">
                  {pkg.packageName}
                </h3>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-50 p-1 rounded-xl">
                  <div className="border-r border-gray-200 flex items-center gap-2">
                    <span className="text-blue-600">🕒</span>
                    <div>
                      <div className="text-gray-500 text-[13px]">Duration</div>
                      <div className="font-bold text-[15px] text-gray-800">
                        {pkg.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📍</span>
                    <div>
                      <div className="text-gray-500 text-[13px]">
                        Pickup Point
                      </div>
                      <div className="font-bold text-[15px] text-gray-800">
                        {pkg.pickupLocation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Category and Themes */}
                <div>
                  {/* Package Category */}
                  <div className="mb-2">
                    <div className="text-gray-500 text-[13px] mb-1.5">
                      Package Category
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[13px] font-medium">
                        {pkg.packageCategory}
                      </span>
                    </div>
                  </div>

                  {/* Themes as Words */}
                  <div>
                    <div className="text-gray-500 text-[13px] mb-1.5">
                      Themes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.themes?.map((theme, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[13px] font-medium"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this package? This action cannot
              be undone.
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
    </>
  );
};

const ImageSlider = ({ images, packageName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative">
      {images.length > 0 && (
        <img
          className="w-full h-48 object-cover transition-transform duration-300 rounded-t-lg" // Reduced height
          src={images[currentIndex]}
          alt={packageName}
        />
      )}
      <div className="absolute inset-0 flex justify-between items-center p-2">
        <button
          className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          onClick={prevImage}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          onClick={nextImage}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex justify-center mt-2 relative -top-8">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 mx-1 rounded-full transition duration-200 ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Packages;
