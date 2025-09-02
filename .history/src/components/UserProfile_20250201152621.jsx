import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaVenusMars,
} from "react-icons/fa";

const UserProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const profileFields = [
    {
      icon: <FaUser className="text-blue-600" />,
      label: "Full Name",
      value: `${currentUser.firstName} ${currentUser.lastName}`,
    },
    {
      icon: <FaEnvelope className="text-blue-600" />,
      label: "Email",
      value: currentUser.email,
    },
    {
      icon: <FaPhone className="text-blue-600" />,
      label: "Contact Number",
      value: currentUser.contactNo || "Not provided",
    },
    {
      icon: <FaUserTag className="text-blue-600" />,
      label: "User Type",
      value: currentUser.userType || "Regular User",
    },
    {
      icon: <FaVenusMars className="text-blue-600" />,
      label: "Gender",
      value: currentUser.gender || "Not specified",
    },
    {
      icon: <FaMapMarkerAlt className="text-blue-600" />,
      label: "Address",
      value: currentUser.address || "Not provided",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-t-2xl shadow-sm p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {currentUser.firstName?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h1>
              <p className="text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-b-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            Profile Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((field, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="mt-1">{field.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {field.label}
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Additional Information
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Account Created:{" "}
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Last Updated:{" "}
                {new Date(currentUser.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              onClick={() => {
                /* Add edit profile functionality */
              }}
            >
              Edit Profile
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              onClick={() => {
                /* Add change password functionality */
              }}
            >
              Change Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
