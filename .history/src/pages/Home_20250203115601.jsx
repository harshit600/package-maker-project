import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Icons } from "../icons";

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
    const fetchStats = async () => {
      console.log("Starting to fetch stats..."); // Debug log
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching packages..."); // Debug log
        const packagesSnapshot = await getDocs(collection(db, "packages"));
        const packagesData = packagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPackages(packagesData);
        const packagesCount = packagesSnapshot.size;
        console.log("Packages count:", packagesCount); // Debug log

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

        setStats({ packagesCount, destinationsCount, usersCount });
        console.log("Stats updated successfully"); // Debug log
      } catch (error) {
        console.error("Detailed error:", error); // Detailed error log
        setError(error.message);
      } finally {
        setLoading(false);
        console.log("Loading state set to false"); // Debug log
      }
    };

    fetchStats();
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
        <div className="grid gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="text-gray-600">{pkg.description}</p>
              <p className="text-blue-600 font-medium mt-2">${pkg.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
