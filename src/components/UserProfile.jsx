import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserTag,
  FaVenusMars,
  FaBuilding,
  FaIdBadge,
  FaUsers,
  FaUserTie,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
        setEditFormData(currentUser);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log("Fetched users data:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users list");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter managers based on selected company
  const getManagersByCompany = (companyName) => {
    if (!companyName || !users.length) return [];
    
    const managers = users.filter(user => 
      user.companyName === companyName && 
      user.designation === "manager" &&
      user.status !== "Blocked"
    );
    
    console.log(`Managers for ${companyName}:`, managers);
    return managers;
  };

  // Filter team leaders based on selected company
  const getTeamLeadersByCompany = (companyName) => {
    if (!companyName || !users.length) return [];
    
    const teamLeaders = users.filter(user => 
      user.companyName === companyName && 
      user.designation === "team leader" &&
      user.status !== "Blocked"
    );
    
    console.log(`Team Leaders for ${companyName}:`, teamLeaders);
    return teamLeaders;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData(userData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(userData);
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => {
      const updatedFormData = {
        ...prev,
        [field]: value
      };

      // Clear team leader and manager names when company or designation changes
      if (field === "companyName" || field === "designation") {
        updatedFormData.teamLeaderName = "";
        updatedFormData.managerName = "";
      }

      return updatedFormData;
    });
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      
      // Get user token from localStorage
      const userStr = localStorage.getItem("user");
      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;
      
      if (!localUser?.token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${config.API_HOST}/api/maker/update-maker/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localUser.token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const validatePassword = () => {
    if (!newPassword) {
      toast.error("New password is required");
      return false;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    try {
      setChangingPassword(true);
      
      // Get user token from localStorage
      const userStr = localStorage.getItem("user");
      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;
      
      if (!localUser?.token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${config.API_HOST}/api/maker/update-maker/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localUser.token}`,
        },
        body: JSON.stringify({
          ...userData,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setNewPassword("");
    setShowPassword(false);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword("");
  };

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
      label: "First Name",
      field: "firstName",
      value: userData.firstName || "Not provided",
    },
    {
      icon: <FaUser className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Last Name",
      field: "lastName",
      value: userData.lastName || "Not provided",
    },
    {
      icon: <FaEnvelope className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Email",
      field: "email",
      value: userData.email || "Not provided",
    },
    {
      icon: <FaPhone className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Contact Number",
      field: "contactNo",
      value: userData.contactNo || userData.phone || "Not provided",
    },
    {
      icon: <FaUserTag className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "User Type",
      field: "userType",
      value: userData.userType || userData.role || "Regular User",
    },
    {
      icon: <FaVenusMars className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Gender",
      field: "gender",
      value: userData.gender || "Not specified",
    },
    {
      icon: <FaMapMarkerAlt className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Address",
      field: "address",
      value: userData.address || "Not provided",
    },
    {
      icon: <FaBuilding className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Company Name",
      field: "companyName",
      value: userData.companyName || "Not provided",
    },
    {
      icon: <FaIdBadge className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Designation",
      field: "designation",
      value: userData.designation || "Not provided",
    },
    {
      icon: <FaCalendarAlt className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Date of Birth",
      field: "dateOfBirth",
      value: userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toLocaleDateString()
        : "Not available",
      type: "date",
    },
  ];

  // Conditional fields based on designation
  const conditionalFields = [];

  // Show Team Leader Name only if designation is executive
  if (userData.designation === "executive") {
    conditionalFields.push({
      icon: <FaUsers className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Team Leader Name",
      field: "teamLeaderName",
      value: userData.teamLeaderName || "Not provided",
    });
  }

  // Show Manager Name if designation is executive or team leader
  if (userData.designation === "executive" || userData.designation === "team leader") {
    conditionalFields.push({
      icon: <FaUserTie className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
      label: "Manager Name",
      field: "managerName",
      value: userData.managerName || "Not provided",
    });
  }

  // Dynamic conditional fields for editing mode
  const getDynamicConditionalFields = () => {
    const fields = [];

    // Show Team Leader Name only if designation is executive and company is selected
    if (editFormData.designation === "executive" && editFormData.companyName) {
      fields.push({
        icon: <FaUsers className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
        label: "Team Leader Name",
        field: "teamLeaderName",
        value: editFormData.teamLeaderName || "Not provided",
        type: "teamLeaderSelect"
      });
    }

    // Show Manager Name if designation is executive or team leader and company is selected
    if ((editFormData.designation === "executive" || editFormData.designation === "team leader") && editFormData.companyName) {
      fields.push({
        icon: <FaUserTie className="text-[rgb(45,45,68/var(--tw-bg-opacity,1))]" />,
        label: "Manager Name",
        field: "managerName",
        value: editFormData.managerName || "Not provided",
        type: "managerSelect"
      });
    }

    return fields;
  };

  // Combine regular fields with conditional fields
  const allProfileFields = isEditing 
    ? [...profileFields, ...getDynamicConditionalFields()]
    : [...profileFields, ...conditionalFields];

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-[rgb(45,45,68)] flex items-center justify-center">
                <span className="text-3xl text-[rgb(255,255,255)] font-bold">
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
                {userData.userType && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-[rgb(45,45,68/var(--tw-bg-opacity,1))] bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] rounded-full">
                    {userData.userType}
                  </span>
                )}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-[rgb(45,45,68/var(--tw-bg-opacity,1))] rounded-b-2xl shadow-sm p-6">
          {loadingUsers && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Loading user data for manager selection...
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Details
            </h2>
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <FaSave />
                  <span>{updating ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProfileFields.map((field, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="mt-1">{field.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    {field.label}
                  </p>
                  {isEditing ? (
                    field.field === "designation" ? (
                      <select
                        value={editFormData[field.field] || ""}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Designation</option>
                        <option value="executive">Executive</option>
                        <option value="manager">Manager</option>
                        <option value="team leader">Team Leader</option>
                      </select>
                    ) : field.field === "companyName" ? (
                      <select
                        value={editFormData[field.field] || ""}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Company</option>
                        <option value="PTW">PTW</option>
                        <option value="Demand Setu">Demand Setu</option>
                      </select>
                    ) : field.field === "userType" ? (
                      <select
                        value={editFormData[field.field] || ""}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select User Type</option>
                        <option value="For B2B Sale">For B2B Sale</option>
                        <option value="For Internal sale">For Internal sale</option>
                        <option value="For Website package">For Website package</option>
                        <option value="Manager">Manager</option>
                      </select>
                    ) : field.field === "gender" ? (
                      <select
                        value={editFormData[field.field] || ""}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : field.type === "teamLeaderSelect" ? (
                      <div>
                        <select
                          value={editFormData[field.field] || ""}
                          onChange={(e) => handleInputChange(field.field, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Team Leader</option>
                          {getTeamLeadersByCompany(editFormData.companyName).map((teamLeader) => (
                            <option key={teamLeader._id} value={teamLeader.firstName + " " + teamLeader.lastName}>
                              {teamLeader.firstName} {teamLeader.lastName}
                            </option>
                          ))}
                        </select>
                        {getTeamLeadersByCompany(editFormData.companyName).length === 0 ? (
                          <p className="mt-1 text-sm text-orange-600">
                            No team leaders found for {editFormData.companyName}. Please add a team leader first.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-green-600">
                            {getTeamLeadersByCompany(editFormData.companyName).length} team leader(s) available
                          </p>
                        )}
                      </div>
                    ) : field.type === "managerSelect" ? (
                      <div>
                        <select
                          value={editFormData[field.field] || ""}
                          onChange={(e) => handleInputChange(field.field, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Manager</option>
                          {getManagersByCompany(editFormData.companyName).map((manager) => (
                            <option key={manager._id} value={manager.firstName + " " + manager.lastName}>
                              {manager.firstName} {manager.lastName}
                            </option>
                          ))}
                        </select>
                        {getManagersByCompany(editFormData.companyName).length === 0 ? (
                          <p className="mt-1 text-sm text-orange-600">
                            No managers found for {editFormData.companyName}. Please add a manager first.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-green-600">
                            {getManagersByCompany(editFormData.companyName).length} manager(s) available
                          </p>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={editFormData[field.field] || ""}
                        onChange={(e) => handleInputChange(field.field, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )
                  ) : (
                    <p className="text-base font-medium text-gray-900">
                      {field.value}
                    </p>
                  )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Status:</strong>{" "}
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
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Created:</strong>{" "}
                    {userData.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Last Updated:</strong>{" "}
                    {userData.updatedAt
                      ? new Date(userData.updatedAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>User ID:</strong> {userData._id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          {!isEditing && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={openPasswordModal}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                <FaLock />
                <span>Change Password</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="space-y-1">
                  <li>• Minimum 6 characters</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                <FaLock />
                <span>{changingPassword ? "Changing..." : "Change Password"}</span>
              </button>
              <button
                onClick={closePasswordModal}
                disabled={changingPassword}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
