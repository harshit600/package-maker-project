import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">My Profile</h2>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 gap-y-6">
              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">Name:</div>
                <div>
                  {user.firstName} {user.lastName}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">Email:</div>
                <div>{user.email}</div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">User Type:</div>
                <div>{user.userType}</div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">Contact:</div>
                <div>{user.contactNo}</div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">Gender:</div>
                <div>{user.gender}</div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="font-semibold w-32">Address:</div>
                <div>{user.address}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
