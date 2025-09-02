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
    cabName: "",
  });
  const [filteredCabs, setFilteredCabs] = useState([]);

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

  const closeModal = () => setModalOpen(false);

  const handleAddCab = () => {
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
    // Create the payload from formData
    const payload = {
      cabType: formData.cabType,
      cabName: formData.cabName,
      cabImages: formData.cabImages, // Ensure this is in the correct format, e.g., an array of URLs or file paths
      cabSeatingCapacity: formData.cabSeatingCapacity,
      cabLuggage: formData.cabLuggage,
    };

    try {
      const response = await fetch(`${config.API_HOST}/api/cabs/createcab`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      window.location.reload();
      const data = await response.json();

      // Handle success response
      // You can add logic here to close the modal or reset form fields
    } catch (error) {
      console.error("Error creating cab:", error);
      // Handle error (e.g., show an error message to the user)
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

    if (filters.cabName) {
      filtered = filtered.filter((cab) => cab.cabName === filters.cabName);
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

  return (
    <div className="shadow-md min-h-full p-2 m-2">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">Add Transport</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="relative group">
              <SimpleDropdown
                options={[
                  { label: "All Types", value: "" },
                  ...cabTypeOptions.slice(1)
                ]}
                label=""
                onSelect={(selectedOption) => 
                  handleFilterChange("cabType", selectedOption.value)
                }
                value={filters.cabType}
                className="min-w-[180px] bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-100"
              />
              <div className="absolute left-3 -top-2.5 bg-white px-2 text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                Filter by Type
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          <Button 
            text={
              <div className="flex items-center gap-2">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Car</span>
              </div>
            }
            variant="primary"
            className="rounded-full px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
          />
        </div>
      </div>

      <Modal show={isModalOpen} closeModal={closeModal} title="Add Cab Type">
        <div className="flex gap-2 mb-4">
          <SimpleDropdown
            options={cabTypeOptions}
            label="Select Cab Type"
            onSelect={
              (selectedOption) =>
                handleDropDownChange("cabType", selectedOption.value) // Use selectedOption.value
            }
            value={formData.cabType}
          />
          <SimpleDropdown
            options={cabNameOptions}
            label="Select Cab Name"
            onSelect={
              (selectedOption) =>
                handleDropDownChange("cabName", selectedOption.value) // Use selectedOption.value
            }
            value={formData.cabName}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <Form.Group
            style={{ width: "50%", padding: "0" }}
            as={Col}
            id="cabImages"
          >
            <Form.Label>Package Images</Form.Label>
            <div className="flex flex-col gap-3">
              <Form.Control
                type="file"
                name="cabImages"
                onChange={handleImageChange}
                size="sm"
                id="image"
                multiple
              />

              <Button
                text="upload"
                onClick={handleImageUpload}
                variant="shade"
              />
            </div>
          </Form.Group>
        </div>
        <div className="flex gap-2 mb-4">
          <SimpleDropdown
            options={seatingOptions}
            label="Select Seating Capacity"
            onSelect={
              (selectedOption) =>
                handleDropDownChange("cabSeatingCapacity", selectedOption.value) // Use selectedOption.value
            }
            value={formData.cabSeatingCapacity}
          />
          <SimpleDropdown
            options={luggageOptions}
            label="Select Luggage Capacity"
            onSelect={
              (selectedOption) =>
                handleDropDownChange("cabLuggage", selectedOption.value) // Use selectedOption.value
            }
            value={formData.cabLuggage}
          />
        </div>
        <div className="flex justify-end">
          <Button text="Save" onClick={handleSubmit} variant="primary" />
        </div>
      </Modal>
      <div className="flex flex-wrap justify-center mt-5">
        {filteredCabs.length > 0 ? (
          filteredCabs.map((cab, index) => <CabCard key={index} cab={cab} />)
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
