import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
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
    if (userTypeFilter === "All") return true;
    return (user.userType || "User") === userTypeFilter;
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
    setIsModalOpen(true);
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
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Add new
          </Link>
          <button className="text-gray-700 bg-white border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 font-medium">
            Import members
          </button>
          <button className="text-gray-700 bg-white border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 font-medium">
            Export members (Excel)
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
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

        {userTypeFilter !== "All" && (
          <button
            onClick={() => setUserTypeFilter("All")}
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
            Clear filter
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
              <th className="py-4 px-6 rounded-tl-xl">Photo</th>
              <th className="py-4 px-6">Member name</th>
              <th className="py-4 px-6">Mobile</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">User Type</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Operation</th>
              <th className="py-4 px-6 rounded-tr-xl">Action</th>
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
                <td className="py-4 px-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
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
                <td className="py-4 px-6 font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-4 px-6 text-gray-600">{user.contactNo}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (user.userType || "User") === "Admin"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20"
                        : (user.userType || "User") === "Manager"
                        ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                        : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                    }`}
                  >
                    {user.userType || "User"}
                  </span>
                </td>
                <td className="py-4 px-6">
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
                <td className="py-4 px-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewProfile(user)}
                      className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      View
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
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="bg-[rgb(45,45,68)] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[rgb(35,35,58)] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Delete
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
              onClick={() => setUserTypeFilter("All")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                User Profile Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900">
                    Personal Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium">{selectedUser.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium">{selectedUser.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium">{selectedUser.contactNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User Type</p>
                      <p className="font-medium">
                        {selectedUser.userType || "User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900">
                    Additional Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{selectedUser.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedUser.address && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{selectedUser.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description if available */}
              {selectedUser.description && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900">Description</h5>
                  <p className="text-gray-700">{selectedUser.description}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Link
                to={`/edit-maker/${selectedUser._id}`}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Close
              </button>
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
    </div>
  );
};

export default UserList;
