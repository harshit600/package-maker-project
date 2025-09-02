import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaVenusMars,
} from "react-icons/fa";
import { toast } from "react-toastify";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Add better error handling for localStorage
        let localUser;
        try {
          const userStr = localStorage.getItem("user");
          console.log(userStr);
          if (!userStr) {
            throw new Error("No user data found in localStorage");
          }
          const parsedData = JSON.parse(userStr);
          // Extract user data from the data property
          localUser = parsedData.data || parsedData;
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          throw new Error("Invalid user data in localStorage");
        }

        if (!localUser?._id) {
          throw new Error("No user ID found");
        }

        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`, {
          headers: {
            Authorization: `Bearer ${localUser.token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const users = await response.json();
        console.log(users);
        // Find the current user in the users list
        const currentUser = users.find((user) => user._id === localUser._id);

        if (!currentUser) {
          throw new Error("User not found");
        }

        setUserData(currentUser);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">
          Error loading profile: {error || "No user data found"}
        </p>
      </div>
    );
  }

  const profileFields = [
    {
      icon: <FaUser className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Full Name",
      value:
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        "Not provided",
    },
    {
      icon: (
        <FaEnvelope className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />
      ),
      label: "Email",
      value: userData.email || "Not provided",
    },
    {
      icon: <FaPhone className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Contact Number",
      value: userData.contactNo || userData.phone || "Not provided",
    },
    {
      icon: (
        <FaUserTag className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />
      ),
      label: "User Type",
      value:
        userData.userType === "B2B sale"
          ? "B2B Sales Representative"
          : userData.userType || userData.role || "Regular User",
    },
    {
      icon: (
        <FaVenusMars className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />
      ),
      label: "Gender",
      value: userData.gender || "Not specified",
    },
    {
      icon: (
        <FaMapMarkerAlt className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />
      ),
      label: "Address",
      value: userData.address || "Not provided",
    },
  ];

  // Get the first letter for the avatar
  const getInitial = () => {
    if (userData.firstName) return userData.firstName.charAt(0);
    if (userData.email) return userData.email.charAt(0);
    return "U";
  };

  return (
    <div className="min-h-screen bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] rounded-t-2xl shadow-sm p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-[rgb(45,45,68)] flex items-center justify-center">
              <span className="text-3xl text-[rgb(45,45,68/var(--tw-bg-opacity,1))] font-bold">
                {getInitial()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {`${userData.firstName || ""} ${
                  userData.lastName || ""
                }`.trim() || "User"}
              </h1>
              <p className="text-gray-500">{userData.email}</p>
              {userData.userType === "B2B sale" && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-[rgb(45,45,68/var(--tw-bg-opacity,1))] bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] rounded-full">
                  B2B Sales Representative
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] rounded-b-2xl shadow-sm p-6">
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
                Date of Birth:{" "}
                {userData.dateOfBirth
                  ? new Date(userData.dateOfBirth).toLocaleDateString()
                  : "Not available"}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Status:{" "}
                <span
                  className={
                    userData.publish === "Yes"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {userData.publish || "Not available"}
                </span>
              </p>
              {userData.userType === "B2B sale" && (
                <p className="text-sm text-blue-800 mt-2">
                  Primary Role: Lead Management
                </p>
              )}
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
