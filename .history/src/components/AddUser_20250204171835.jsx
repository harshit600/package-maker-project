import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};
const AddUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    userType: "",
    gender: "",
    email: "",
    password: "",

    contactNo: "",
    address: "",
    publish: "Yes",
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if all required fields are present
      const requiredFields = [
        "firstName",
        "lastName",
        "dateOfBirth",
        "userType",
        "gender",
        "email",
        "password",
        "contactNo",
        "address",
      ];

      const missingFields = requiredFields.filter((field) => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
      }

      // Create a new object that matches the schema
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(), // Convert to ISO date string
        userType: formData.userType,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        contactNo: formData.contactNo,
        address: formData.address,
        publish: formData.publish,
      };

      // Log the data being sent for debugging
      console.log("Sending user data:", userData);

      const response = await fetch(`${config.API_HOST}/api/maker/post-maker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      console.log(response);
      if (response.status === 503) {
        throw new Error(
          "Server is currently unavailable. Please try again later."
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message || `Server error (${response.status})`
        );
      }

      const data = await response.json();
      console.log("User created successfully:", data);

      // Login the user after successful creation
      const loginResponse = await fetch(`${config.API_HOST}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("token", loginData.token);

        toast.success("User created and logged in successfully!", {
          position: "top-right",
          autoClose: 3000,
          onClose: () => {
            // Redirect after the toast message is closed
            window.location.href = "/userlist";
          },
        });
      }

      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        userType: "",
        gender: "",
        email: "",
        password: "",
        contactNo: "",
        address: "",
        publish: "No", // Changed to match schema default
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating user:", error);
      // Replace alert with toast
      toast.error(error.message || "Failed to create user. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Add New User
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Create a new user account with detailed information
          </p>
        </div>

        {/* Main Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-blue-100">
              Please fill in all the required fields
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* First Name */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>

              {/* User Type */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="form-select block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  required
                >
                  <option value="">Select User Type</option>
                  <option value="For B2B Sale">For B2B Sale</option>
                  <option value="For Internal sale">For Internal sale</option>
                  <option value="For Website package">
                    For Website package
                  </option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              {/* Gender - Dropdown */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Profile Image */}
              <div className="form-group col-span-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="mt-2 h-32 w-32 object-cover mx-auto"
                      />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload file</span>
                        <input
                          id="file-upload"
                          name="image"
                          type="file"
                          className="sr-only"
                          onChange={handleChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="form-input block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              {/* Publish Status */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Publish Status
                </label>
                <div className="relative">
                  <select
                    name="publish"
                    value={formData.publish}
                    onChange={handleChange}
                    className="form-select block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 appearance-none"
                    required
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-group col-span-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="form-textarea block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter your full address"
                  required
                ></textarea>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-white text-gray-700 rounded-lg border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Create User
              </button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddUser;
