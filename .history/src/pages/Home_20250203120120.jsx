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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use config.API_HOST
        const packagesResponse = await fetch(
          `${config.API_HOST}/api/packages/getpackages`
        );
        const packagesData = await packagesResponse.json();
        setPackages(packagesData);
        const packagesCount = packagesData.length;

        console.log("Fetching destinations..."); // Debug log
        const destinationsSnapshot = await getDocs(
          collection(db, "destinations")
        );
        const destinationsCount = destinationsSnapshot.size;
        console.log("Destinations count:", destinationsCount); // Debug log

        console.log("Fetching users..."); // Debug log
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;
        console.log("Users count:", usersCount); // Debug log

        setStats((prevStats) => ({ ...prevStats, packagesCount }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">
                Total Packages
              </p>
              <p className="text-3xl font-bold text-gray-700 mt-2">
                {stats.packagesCount}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <Packages className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">
                Total Destinations
              </p>
              <p className="text-3xl font-bold text-gray-700 mt-2">
                {stats.destinationsCount}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <Destinations className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-700 mt-2">
                {stats.usersCount}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <Users className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Available Packages
        </h2>
        {loading ? (
          <p>Loading packages...</p>
        ) : error ? (
          <p className="text-red-500">Error loading packages: {error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 px-4">Package Name</th>
                  <th className="pb-3 px-4">Price</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Operation</th>
                  <th className="pb-3 px-4">Action</th>
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
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          pkg.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pkg.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button className="p-1 hover:text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
