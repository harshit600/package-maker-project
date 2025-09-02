import React, { useEffect, useState } from "react";
import Button from "../components/ui-kit/atoms/Button";
import Modal from "../components/ui-kit/atoms/Modal";
import SimpleDropdown from "../components/ui-kit/atoms/SimpleDropdown";
import { app } from "../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Form, Col } from "react-bootstrap";
import config from "../../config";
import CabCard from "../components/CabCard"; // Import the CabCard component

function CabManager() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [files, setFiles] = useState([]); // Added files state
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [cabs, setCabs] = useState([]); // State to store cabs
  const [formData, setFormData] = useState({
    cabType: "",
    cabName: "",
    cabImages: [],
    cabSeatingCapacity: 0,
    cabLuggage: "",
  });

  const [cabNameOptions, setCabNameOptions] = useState([]);
  const [filters, setFilters] = useState({
    cabType: "",
  });
  const [filteredCabs, setFilteredCabs] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCabId, setSelectedCabId] = useState(null);

  const [loading, setLoading] = useState(true); // Add loading state

  const cabTypeOptions = [
    { label: "Select Cab Type", value: "" },
    { label: "Hatchback", value: "Hatchback" },
    { label: "Sedan", value: "Sedan" },
    { label: "SUV", value: "SUV" },
    { label: "Traveller", value: "Traveller" },
    { label: "AC Bus", value: "ACBus" },
  ];

  const luggageOptions = [
    { label: "Small Trunk (2 bags)", value: "Small Trunk" },
    { label: "Medium Trunk (3-4 bags)", value: "Medium Trunk" },
    { label: "Large Trunk (5-6 bags)", value: "Large Trunk" },
    { label: "Extra-Large Trunk (7-8 bags)", value: "Extra-Large Trunk" },
    { label: "Roof Rack", value: "Roof Rack" },
    { label: "No Luggage Space", value: "No Luggage Space" },
    {
      label: "Special Luggage Compartment (10+ bags)",
      value: "Special Compartment",
    },
  ];

  const seatingOptions = Array.from({ length: 47 }, (_, index) => {
    const seats = index + 4;
    return { label: `${seats} Seater`, value: `${seats} Seater` };
  });

  const carOptions = {
    Hatchback: [
      { label: "Maruti Alto", value: "Maruti Alto" },
      { label: "Hyundai i10", value: "Hyundai i10" },
      { label: "Tata Tiago", value: "Tata Tiago" },
      { label: "Swift Dzyre", value: "Swift Dzyre" },
    ],
    Sedan: [
      { label: "Honda City", value: "Honda City" },
      { label: "Hyundai Verna", value: "Hyundai Verna" },
      { label: "Maruti Ciaz", value: "Maruti Ciaz" },
    ],
    SUV: [
      { label: "Toyota Fortuner", value: "Toyota Fortuner" },
      { label: "Ford Endeavour", value: "Ford Endeavour" },
      { label: "Mahindra XUV500", value: "Mahindra XUV500" },
    ],
    Traveller: [
      { label: "Tempo Traveller", value: "Tempo Traveller" },
      { label: "Force Urbania", value: "Force Urbania" },
      { label: "Mercedes V-Class", value: "Mercedes V-Class" },
    ],
    ACBus: [
      { label: "Volvo B7R", value: "Volvo B7R" },
      { label: "Scania Metrolink", value: "Scania Metrolink" },
      { label: "Ashok Leyland Lynx", value: "Ashok Leyland Lynx" },
    ],
  };

  const handleEditCab = (cab) => {
    console.log("Received cab data:", cab);

    if (!cab || !cab._id) {
      console.error("Invalid cab data:", cab);
      alert("Cannot edit cab: Invalid cab data");
      return;
    }

    setIsEditing(true);
    setSelectedCabId(cab._id);

    // Extract just the number from cabSeatingCapacity
    const seatingCapacity = parseInt(cab.cabSeatingCapacity.split(" ")[0]);

    setFormData({
      cabType: cab.cabType || "",
      cabName: cab.cabName || "",
      cabImages: cab.cabImages || [],
      cabSeatingCapacity: seatingCapacity, // Store just the number
      cabLuggage: cab.cabLuggage || "",
    });

    if (cab.cabType) {
      setCabNameOptions(carOptions[cab.cabType] || []);
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSelectedCabId(null);
    setImageUploadError(null);
    // Reset form data
    setFormData({
      cabType: "",
      cabName: "",
      cabImages: [],
      cabSeatingCapacity: 0,
      cabLuggage: "",
    });
  };

  const handleAddCab = () => {
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleDropDownChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update cabName options based on cabType selection
    if (field === "cabType") {
      setCabNameOptions(carOptions[value] || []); // Update cabName options
      setFormData((prev) => ({ ...prev, cabName: "" })); // Reset cabName
    }
  };

  const handleImageChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleImageUpload = async () => {
    try {
      if (!files || files.length === 0) {
        setImageUploadError("Please select files to upload");
        return;
      }

      if (files.length + formData.cabImages.length > 6) {
        setImageUploadError("You can only upload 6 images per listing");
        return;
      }

      setUploading(true);
      setImageUploadError(null);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          setImageUploadError(`File ${file.name} exceeds 2MB limit`);
          setUploading(false);
          return;
        }
        promises.push(storeImage(file));
      }

      const urls = await Promise.all(promises);
      console.log("Uploaded URLs:", urls); // Debug log

      setFormData((prev) => ({
        ...prev,
        cabImages: [...prev.cabImages, ...urls],
      }));

      // Clear the file input after successful upload
      setFiles([]);
      document.getElementById("image").value = "";
      setImageUploadError(null);
    } catch (err) {
      console.error("Upload error:", err); // Debug log
      setImageUploadError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    try {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, `cabs/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress}%`); // Debug log
          },
          (error) => {
            console.error("Upload error:", error); // Debug log
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("File uploaded successfully:", downloadURL); // Debug log
              resolve(downloadURL);
            } catch (err) {
              console.error("Get download URL error:", err); // Debug log
              reject(err);
            }
          }
        );
      });
    } catch (err) {
      console.error("Store image error:", err); // Debug log
      throw err;
    }
  };

  const handleSubmit = async () => {
    console.log("Is Editing:", isEditing);
    console.log("Selected Cab ID:", selectedCabId);
    console.log("Current Form Data:", formData);

    if (isEditing && !selectedCabId) {
      console.error("No cab ID found for editing");
      alert("Cannot update cab: Missing cab ID");
      return;
    }

    // Validate required fields
    if (
      !formData.cabType ||
      !formData.cabName ||
      !formData.cabSeatingCapacity ||
      !formData.cabLuggage
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Format seating capacity only if it's not already formatted
    const formattedSeatingCapacity =
      typeof formData.cabSeatingCapacity === "number"
        ? `${formData.cabSeatingCapacity} Seater`
        : formData.cabSeatingCapacity;

    const payload = {
      _id: selectedCabId, // Include the ID in the payload
      cabType: formData.cabType,
      cabName: formData.cabName,
      cabImages: formData.cabImages,
      cabSeatingCapacity: formattedSeatingCapacity,
      cabLuggage: formData.cabLuggage,
    };

    try {
      const url = isEditing
        ? `${config.API_HOST}/api/cabs/editcab/${selectedCabId}`
        : `${config.API_HOST}/api/cabs/createcab`;

      // Add these detailed logs
      console.log("API Request Details:", {
        url,
        method: isEditing ? "PUT" : "POST",
        payload: JSON.stringify(payload, null, 2),
      });

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        mode: "cors",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Complete server response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "create"} cab`
        );
      }

      await fetchCabs();
      closeModal();
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        selectedCabId,
        isEditing,
        url: `${config.API_HOST}/api/cabs/editcab/${selectedCabId}`,
        formData: JSON.stringify(formData, null, 2),
      });
      alert(
        `Failed to ${isEditing ? "update" : "create"} cab: ${error.message}`
      );
    }
  };

  const fetchCabs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        mode: "cors",
      });
      const data = await response.json();
      console.log("Fetched cabs:", data.result); // Log the fetched data
      setCabs(data.result);
    } catch (error) {
      console.error("Error fetching cabs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabs();
  }, []);

  useEffect(() => {
    let filtered = [...cabs];

    if (filters.cabType) {
      filtered = filtered.filter((cab) => cab.cabType === filters.cabType);
    }

    setFilteredCabs(filtered);
  }, [cabs, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };

      // Reset cabName if cabType changes
      if (field === "cabType") {
        newFilters.cabName = "";
      }

      return newFilters;
    });
  };

  const handleDeleteCab = async (cabId) => {
    if (window.confirm("Are you sure you want to delete this cab?")) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/cabs/deletecab/${cabId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        await fetchCabs(); // Refresh the cabs list
      } catch (error) {
        console.error("Error deleting cab:", error);
      }
    }
  };

  // Add SkeletonCard component
  const SkeletonCard = () => (
    <div className="w-72 m-4 p-4 border rounded-lg shadow-md animate-pulse">
      <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  // Add this function to handle image deletion
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      cabImages: prev.cabImages.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="shadow-md min-h-full p-2 m-2">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Cab Manager</div>
          <div className="flex items-center gap-3">
            {loading ? (
              <>
                <div className="w-32 h-9 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-20 h-9 bg-gray-200 rounded-md animate-pulse"></div>
              </>
            ) : (
              <>
                <SimpleDropdown
                  options={[
                    { label: "All Types", value: "" },
                    ...cabTypeOptions.slice(1),
                  ]}
                  className="border border-black rounded-md px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 text-sm"
                  buttonClassName="flex items-center gap-2"
                  menuClassName="mt-1 bg-white border rounded-md shadow-lg"
                  onSelect={(selectedOption) =>
                    handleFilterChange("cabType", selectedOption.value)
                  }
                  value={filters.cabType}
                />
                <Button
                  text="+ Cab"
                  className="bg-[rgb(45,45,68)] text-white px-3 py-1.5 rounded-md"
                  onClick={handleAddCab}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={isModalOpen}
        closeModal={closeModal}
        title={isEditing ? "Edit Cab" : "Add Cab"}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Cab Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.cabType}
            onChange={(e) => handleDropDownChange("cabType", e.target.value)}
          >
            {cabTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cab Name
            </label>
            <input
              type="text"
              value={formData.cabName}
              onChange={(e) => handleDropDownChange("cabName", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter cab name"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Form.Group
            style={{ width: "50%", padding: "0" }}
            as={Col}
            id="cabImages"
          >
            <Form.Label>Cab Images</Form.Label>
            <div className="flex flex-col gap-3">
              <Form.Control
                type="file"
                name="cabImages"
                onChange={handleImageChange}
                size="sm"
                id="image"
                multiple
                className="border-solid border-[1px] border-gray-300 rounded-md"
              />
              <Button
                text={uploading ? "Uploading..." : "Upload"}
                onClick={handleImageUpload}
                disabled={uploading}
                variant="shade"
              />
            </div>
            {imageUploadError && (
              <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>
            )}

            {/* Display uploaded images */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.cabImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Cab image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </Form.Group>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Seating Capacity
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.cabSeatingCapacity}
              onChange={(e) =>
                handleDropDownChange("cabSeatingCapacity", e.target.value)
              }
            >
              {seatingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Luggage Capacity
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.cabLuggage}
              onChange={(e) =>
                handleDropDownChange("cabLuggage", e.target.value)
              }
            >
              {luggageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button text="Save" onClick={handleSubmit} variant="primary" />
        </div>
      </Modal>
      <div className="flex flex-wrap justify-center mt-5">
        {loading ? (
          // Show skeleton cards while loading
          Array(6)
            .fill(null)
            .map((_, index) => <SkeletonCard key={index} />)
        ) : filteredCabs.length > 0 ? (
          filteredCabs.map((cab, index) => (
            <CabCard
              key={index}
              cab={cab}
              onEdit={handleEditCab}
              onDelete={handleDeleteCab}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-8">
            No cabs found matching the selected filters
          </div>
        )}
      </div>
    </div>
  );
}

export default CabManager;
