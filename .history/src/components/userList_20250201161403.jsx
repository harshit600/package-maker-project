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

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/maker/delete-maker/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Remove the deleted user from the state
      setUsers(users.filter((user) => user._id !== userId));
      // Show success toast
      toast.success("User deleted successfully!");
    } catch (err) {
      setError(err.message);
      // Show error toast
      toast.error(err.message);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-500 border-b bg-gray-50/50">
              <th className="py-4 px-6 rounded-tl-xl">Photo</th>
              <th className="py-4 px-6">Member name</th>
              <th className="py-4 px-6">Mobile</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Operation</th>
              <th className="py-4 px-6 rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200"
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
                      user.publish === "Yes"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                    }`}
                  >
                    {user.publish}
                  </span>
                </td>
                <td className="py-4 px-6">
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
                    <button className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      selectedUser.publish === "Yes"
                        ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                    }`}
                  >
                    {selectedUser.publish === "Yes" ? "Active" : "Inactive"}
                  </span>
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
                      <p className="font-medium">{selectedUser.publish}</p>
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
    </div>
  );
};

export default UserList;
