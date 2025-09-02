import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Icons } from "../icons";
import config from "../../config";

const { Destinations, Packages, Users } = Icons;

export default function Home() {
  const [stats, setStats] = useState({
    packagesCount: 0,
    destinationsCount: 0,
    usersCount: 0,
  });
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch packages
        const packagesResponse = await fetch(
          `${config.API_HOST}/api/packages/getpackages`
        );
        const packagesData = await packagesResponse.json();
        setPackages(packagesData);

        // Fetch users
        const usersResponse = await fetch(
          `${config.API_HOST}/api/maker/get-maker`
        );
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        setStats((prevStats) => ({
          ...prevStats,
          packagesCount: packagesData.length,
          usersCount: usersData.length,
        }));
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error loading data: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center">
        <span className="bg-blue-500 w-2 h-8 mr-3 rounded-full"></span>
        Dashboard Overview
      </h1>

      <div className="flex">
        {/* Packages Section */}
        <div className="w-1/2 pr-4">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Available Packages
            </h2>
            {loading ? (
              <p>Loading packages...</p>
            ) : error ? (
              <p className="text-red-500">Error loading packages: {error}</p>
            ) : (
              <div className="overflow-y-auto" style={{ height: "300px" }}>
                <table className="w-full min-w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left border-b">
                      <th className="pb-3 px-4">Package Name</th>
                      <th className="pb-3 px-4">Price</th>
                      <th className="pb-3 px-4">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{pkg.packageName}</div>
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(pkg.initialAmount)}
                        </td>
                        <td className="py-3 px-4">{pkg.pickupLocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Users Section */}
        <div className="w-1/2 pl-4">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Users List
            </h2>
            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="text-red-500">Error loading users: {error}</p>
            ) : (
              <div className="overflow-y-auto" style={{ height: "300px" }}>
                <table className="w-full min-w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left border-b">
                      <th className="pb-3 px-4">Name</th>
                      <th className="pb-3 px-4">User Type</th>
                      <th className="pb-3 px-4">Contact No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.userType}</td>
                        <td className="py-3 px-4">{user.contactNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
