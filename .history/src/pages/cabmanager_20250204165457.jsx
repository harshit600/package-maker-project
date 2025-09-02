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

  const seatingOptions = [
    { label: "Select Seating Capacity", value: "" },
    ...Array.from({ length: 47 }, (_, index) => {
      const seats = index + 4;
      return { label: `${seats} Seater`, value: `${seats} Seater` };
    }),
  ];

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
    setIsEditing(true);
    setSelectedCabId(cab._id);
    setFormData({
      cabType: cab.cabType,
      cabName: cab.cabName,
      cabImages: cab.cabImages || [],
      cabSeatingCapacity: cab.cabSeatingCapacity,
      cabLuggage: cab.cabLuggage,
    });
    // Update cabNameOptions based on selected cabType
    setCabNameOptions(carOptions[cab.cabType] || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSelectedCabId(null);
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

  const handleImageUpload = () => {
    if (files.length > 0 && files.length + formData.cabImages.length < 7) {
      setUploading(true);
      setImageUploadError(null);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            cabImages: formData.cabImages.concat(urls),
          });
          setImageUploadError(null);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 MB max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSubmit = async () => {
    const payload = {
      cabType: formData.cabType,
      cabName: formData.cabName,
      cabImages: formData.cabImages,
      cabSeatingCapacity: formData.cabSeatingCapacity,
      cabLuggage: formData.cabLuggage,
    };

    try {
      const url = isEditing
        ? `${config.API_HOST}/api/cabs/editcab/${selectedCabId}`
        : `${config.API_HOST}/api/cabs/createcab`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if required
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: "include", // Include cookies if using sessions
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save cab");
      }

      const data = await response.json();
      console.log("Success:", data);

      await fetchCabs(); // Refresh the cabs list
      closeModal();
    } catch (error) {
      console.error("Error details:", error);
      // You might want to show this error to the user through a toast or alert
      alert(error.message || "Failed to save cab. Please try again.");
    }
  };

  const fetchCabs = async () => {
    try {
      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`);
      const data = await response.json();
      setCabs(data.result); // Assuming the result contains an array of cabs
    } catch (error) {
      console.error("Error fetching cabs:", error);
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
            },
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

  return (
    <div className="shadow-md min-h-full p-2 m-2">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Cab Manager</div>
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      <Modal
        show={isModalOpen}
        closeModal={closeModal}
        title={isEditing ? "Edit Cab" : "Add Cab"}
      >
        <div className="bg-white p-8 rounded-lg">
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Cab Type
                </label>
                <SimpleDropdown
                  options={[
                    { label: "Select Cab Type", value: "" },
                    { label: "Hatchback", value: "Hatchback" },
                    { label: "Sedan", value: "Sedan" },
                    { label: "SUV", value: "SUV" },
                    { label: "Traveller", value: "Traveller" },
                    { label: "AC Bus", value: "ACBus" },
                  ]}
                  placeholder="Select cab type"
                  className="w-full border border-gray-200 rounded-lg bg-white text-left"
                  menuClassName="text-left"
                  buttonClassName="text-left"
                  onSelect={(selectedOption) =>
                    handleDropDownChange("cabType", selectedOption.value)
                  }
                  value={formData.cabType}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Cab Name
                </label>
                <SimpleDropdown
                  options={
                    carOptions[formData.cabType] || [
                      { label: "Select Cab Type First", value: "" },
                    ]
                  }
                  placeholder="Select cab name"
                  className="w-full border border-gray-200 rounded-lg bg-white text-left"
                  menuClassName="text-left"
                  buttonClassName="text-left"
                  onSelect={(selectedOption) =>
                    handleDropDownChange("cabName", selectedOption.value)
                  }
                  value={formData.cabName}
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Seating Capacity
                </label>
                <SimpleDropdown
                  options={seatingOptions}
                  placeholder="Select seating capacity"
                  className="w-full border border-gray-200 rounded-lg bg-white text-left"
                  menuClassName="text-left"
                  buttonClassName="text-left"
                  onSelect={(selectedOption) =>
                    handleDropDownChange(
                      "cabSeatingCapacity",
                      selectedOption.value
                    )
                  }
                  value={formData.cabSeatingCapacity}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Luggage Capacity
                </label>
                <SimpleDropdown
                  options={luggageOptions}
                  placeholder="Select luggage capacity"
                  className="w-full border border-gray-200 rounded-lg bg-white text-left"
                  menuClassName="text-left"
                  buttonClassName="text-left"
                  onSelect={(selectedOption) =>
                    handleDropDownChange("cabLuggage", selectedOption.value)
                  }
                  value={formData.cabLuggage}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <Form.Group as={Col} id="cabImages" className="p-0">
                <Form.Label className="block text-sm text-gray-600 mb-2">
                  Cab Images
                </Form.Label>
                <div className="space-y-3">
                  <Form.Control
                    type="file"
                    name="cabImages"
                    onChange={handleImageChange}
                    className="w-full border border-gray-200 rounded-lg text-sm file:mr-4 
                             file:py-2 file:px-4 file:border-0 file:bg-blue-50 
                             file:text-blue-600 hover:file:bg-blue-100"
                    size="sm"
                    id="image"
                    multiple
                    placeholder="Upload cab images"
                  />
                  {imageUploadError && (
                    <p className="text-red-500 text-sm">{imageUploadError}</p>
                  )}
                  {uploading && (
                    <p className="text-blue-600 text-sm">Uploading...</p>
                  )}
                </div>
              </Form.Group>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                text="Cancel"
                onClick={closeModal}
                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 
                         hover:bg-gray-50 text-sm font-medium"
              />
              <Button
                text={isEditing ? "Update Information" : "Save Information"}
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-600 text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </Modal>
      <div className="flex flex-wrap justify-center mt-5">
        {filteredCabs.length > 0 ? (
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
