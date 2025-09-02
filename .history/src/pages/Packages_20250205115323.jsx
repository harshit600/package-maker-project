import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Button from "../components/ui-kit/atoms/Button";
import config from "../../config";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const handleEditClick = (e, id) => {
    e.stopPropagation(); // This is no longer needed since we removed the row click
    navigate(`/create-package?edit=${id}`);
    window.location.reload();
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

  return (
    <>
      <ToastContainer />
      {/* Search Section - Updated to match reference design */}
      <div className="max-w-full p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Inputs */}
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />

          {/* Dropdown Filters */}
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>Select Activity</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>Select Transfer</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>Select Meal</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>Select Extra</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>SIC/PVT</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[150px] focus:outline-none focus:border-blue-500">
            <option>Select Guide</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by QueryId"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />

          {/* Action Buttons */}
          <button className="bg-[#4CAF50] text-white px-4 py-1.5 rounded text-sm hover:bg-[#45a049]">
            Search
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300">
            All
          </button>
          <button className="bg-[#2196F3] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1976D2]">
            Export
          </button>
          <button className="bg-[#2196F3] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1976D2]">
            Send
          </button>
        </div>

        {/* Packages Table */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2c3e50] text-white">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
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
              {filteredPackages.map((pkg, index) => (
                <tr
                  key={pkg._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 border-t">{pkg._id.slice(-6)}</td>
                  <td className="px-4 py-3 border-t font-medium">
                    {pkg.packageName}
                  </td>
                  <td className="px-4 py-3 border-t">{pkg.duration}</td>
                  <td className="px-4 py-3 border-t">{pkg.pickupLocation}</td>
                  <td className="px-4 py-3 border-t">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {pkg.packageType}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-t font-medium">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(pkg.initialAmount)}
                  </td>
                  <td className="px-4 py-3 border-t">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleEditClick(e, pkg._id)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
