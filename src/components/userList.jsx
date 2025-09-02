import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
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

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [mobileFilter, setMobileFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Get unique user types from the data
  const userTypes = [
    "All",
    ...new Set(users.map((user) => user.userType || "User")),
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/maker/get-maker`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log(data);
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on selected type
  const filteredUsers = users.filter((user) => {
    const matchesType =
      userTypeFilter === "All" || (user.userType || "User") === userTypeFilter;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesName = fullName.includes(nameFilter.toLowerCase());
    const matchesMobile = user.contactNo
      ?.toLowerCase()
      .includes(mobileFilter.toLowerCase());

    return matchesType && matchesName && matchesMobile;
  });

  // Log to check available user types
  useEffect(() => {
    console.log("Available user types:", userTypes);
  }, [users]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/maker/delete-maker/${userToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user._id !== userToDelete._id));
      toast.success("User deleted successfully!");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setEditFormData(user);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData(selectedUser);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(selectedUser);
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
      
      const response = await fetch(`${config.API_HOST}/api/maker/update-maker/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedUser,
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

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`${config.API_HOST}/api/maker/update-maker/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const updatedUser = await response.json();
      
      // Update the users list
      setUsers(users.map(user => 
        user._id === selectedUser._id ? updatedUser : user
      ));
      
      setSelectedUser(updatedUser);
      setIsEditing(false);
      toast.success("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      setIsUpdating(true);
      const newStatus = currentStatus === "Blocked" ? "Active" : "Blocked";

      const response = await fetch(
        `${config.API_HOST}/api/maker/update-status/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast.success(
        `User ${newStatus === "Blocked" ? "blocked" : "unblocked"} successfully`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Members
        </h2>
        <div className="flex gap-3">
          <Link
            to="/add-user"
            className="bg-[rgb(45,45,68)] hover:bg-[rgb(35,35,58)] text-white px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Add new
          </Link>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Filter by Type:
          </span>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          >
            {userTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All" ? "All Users" : type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Name:</span>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filter by name..."
            className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Mobile:</span>
          <input
            type="text"
            value={mobileFilter}
            onChange={(e) => setMobileFilter(e.target.value)}
            placeholder="Filter by mobile..."
            className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>

        {(userTypeFilter !== "All" || nameFilter || mobileFilter) && (
          <button
            onClick={() => {
              setUserTypeFilter("All");
              setNameFilter("");
              setMobileFilter("");
            }}
            className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Clear all filters
          </button>
        )}

        <div className="ml-auto text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} members
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-500 border-b bg-gray-50/50">
              <th className="py-2.5 px-4 rounded-tl-xl">Photo</th>
              <th className="py-2.5 px-4">Member name</th>
              <th className="py-2.5 px-4">Mobile</th>
              <th className="py-2.5 px-4">Email</th>
              <th className="py-2.5 px-4">User Type</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Operation</th>
              <th className="py-2.5 px-4 rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user._id}
                className={`border-b last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200 ${
                  index % 2 === 1 ? "" : ""
                }`}
              >
                <td className="py-2.5 px-4">
                  <div className="w-10 h-10 rounded-full bg-[rgb(45,45,68)] overflow-hidden ring-2 ring-white shadow-sm">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-4 font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-2.5 px-4 text-gray-600">{user.contactNo}</td>
                <td className="py-2.5 px-4 text-gray-600">{user.email}</td>
                <td className="py-2.5 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (user.userType || "User") === "Admin"
                        ? "bg-[rgb(45,45,68)]/10 text-[rgb(45,45,68)] ring-1 ring-[rgb(45,45,68)]/20"
                        : (user.userType || "User") === "Manager"
                        ? "bg-[rgb(45,45,68)]/10 text-[rgb(45,45,68)] ring-1 ring-[rgb(45,45,68)]/20"
                        : "bg-[rgb(45,45,68)]/10 text-[rgb(45,45,68)] ring-1 ring-[rgb(45,45,68)]/20"
                    }`}
                  >
                    {user.userType || "User"}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "Blocked"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                        : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                    }`}
                  >
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewProfile(user)}
                      className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleBlockUser(user._id, user.status)}
                      disabled={isUpdating}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        user.status === "Blocked"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isUpdating
                        ? "Updating..."
                        : user.status === "Blocked"
                        ? "Activate"
                        : "Deactivate"}
                    </button>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="text-gray-600 hover:text-red-600 transition-colors duration-200"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">
              No users found for the selected filter
            </p>
            <button
              onClick={() => {
                setUserTypeFilter("All");
                setNameFilter("");
                setMobileFilter("");
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                User Profile Details
              </h3>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditClick}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={openPasswordModal}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      <FaLock />
                      <span>Change Password</span>
                    </button>
                  </div>
                )}
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateUser}
                      disabled={isUpdating}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <FaSave />
                      <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
            </div>

            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden ring-4 ring-white shadow-md">
                  {selectedUser.profileImage ? (
                    <img
                      src={selectedUser.profileImage}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-14 w-14"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600 mb-3">{selectedUser.email}</p>
                  <div className="flex gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        selectedUser.userType === "Admin"
                          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20"
                          : selectedUser.userType === "Manager"
                          ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                          : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                      }`}
                    >
                      {selectedUser.userType || "User"}
                    </span>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        selectedUser.status === "Blocked"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                          : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                      }`}
                    >
                      {selectedUser.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full User Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaUser />
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaUser className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.firstName || ""}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">{selectedUser.firstName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaUser className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.lastName || ""}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">{selectedUser.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaEnvelope className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email || ""}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">{selectedUser.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaPhone className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Contact Number</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editFormData.contactNo || ""}
                            onChange={(e) => handleInputChange("contactNo", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">{selectedUser.contactNo}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaVenusMars className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        {isEditing ? (
                          <select
                            value={editFormData.gender || ""}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="font-medium">{selectedUser.gender || "Not specified"}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString().split('T')[0] : ""}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">
                            {selectedUser.dateOfBirth
                              ? new Date(selectedUser.dateOfBirth).toLocaleDateString()
                              : "Not available"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaBuilding />
                    Professional Information
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaUserTag className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">User Type</p>
                        {isEditing ? (
                          <select
                            value={editFormData.userType || ""}
                            onChange={(e) => handleInputChange("userType", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select User Type</option>
                            <option value="For B2B Sale">For B2B Sale</option>
                            <option value="For Internal sale">For Internal sale</option>
                            <option value="For Website package">For Website package</option>
                            <option value="Manager">Manager</option>
                          </select>
                        ) : (
                          <p className="font-medium">{selectedUser.userType || "User"}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaBuilding className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        {isEditing ? (
                          <select
                            value={editFormData.companyName || ""}
                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Company</option>
                            <option value="PTW">PTW</option>
                            <option value="Demand Setu">Demand Setu</option>
                          </select>
                        ) : (
                          <p className="font-medium">{selectedUser.companyName || "Not provided"}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaIdBadge className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Designation</p>
                        {isEditing ? (
                          <select
                            value={editFormData.designation || ""}
                            onChange={(e) => handleInputChange("designation", e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Designation</option>
                            <option value="executive">Executive</option>
                            <option value="manager">Manager</option>
                            <option value="team leader">Team Leader</option>
                          </select>
                        ) : (
                          <p className="font-medium">{selectedUser.designation || "Not provided"}</p>
                        )}
                      </div>
                    </div>

                    {/* Conditional Team Leader Field */}
                    {selectedUser.designation === "executive" && (
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <FaUsers className="mt-1 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Team Leader Name</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.teamLeaderName || ""}
                              onChange={(e) => handleInputChange("teamLeaderName", e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="font-medium">{selectedUser.teamLeaderName || "Not provided"}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Conditional Manager Field */}
                    {(selectedUser.designation === "executive" || selectedUser.designation === "team leader") && (
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <FaUserTie className="mt-1 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Manager Name</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.managerName || ""}
                              onChange={(e) => handleInputChange("managerName", e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="font-medium">{selectedUser.managerName || "Not provided"}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="mt-1 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        {isEditing ? (
                          <textarea
                            value={editFormData.address || ""}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            rows="3"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium">{selectedUser.address || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h5 className="font-semibold text-gray-900 mb-4">System Information</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedUser.status || "Active"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Publish</p>
                    <p className="font-medium">{selectedUser.publish || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {selectedUser.updatedAt
                        ? new Date(selectedUser.updatedAt).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete User
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete user "{userToDelete.firstName}{" "}
                {userToDelete.lastName}"? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default UserList;
