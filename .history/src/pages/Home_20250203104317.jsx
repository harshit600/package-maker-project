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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch packages count
        const packagesSnapshot = await getDocs(collection(db, "packages"));
        const packagesCount = packagesSnapshot.size;

        // Fetch destinations count
        const destinationsSnapshot = await getDocs(
          collection(db, "destinations")
        );
        const destinationsCount = destinationsSnapshot.size;

        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersCount = usersSnapshot.size;

        setStats({ packagesCount, destinationsCount, usersCount });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 flex items-center">
        <span className="bg-blue-500 w-2 h-8 mr-3 rounded-full"></span>
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  );
}
