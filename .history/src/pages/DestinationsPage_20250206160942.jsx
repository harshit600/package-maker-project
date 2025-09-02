import React, { useState, useEffect } from "react";
import Card from "../components/Card";

function DestinationsPage() {
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        // Your fetch logic here
        const data = await getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative py-16 mb-12 bg-blue-600 bg-opacity-90">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('/travel-pattern.png')] bg-repeat"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Discover Amazing Destinations
          </h1>
          <p className="text-xl text-blue-100 text-center max-w-2xl mx-auto">
            Explore the world's most beautiful places and create unforgettable
            memories
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array(6)
                .fill(null)
                .map((_, index) => (
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <Card key={`skeleton-${index}`} loading={true} />
                  </div>
                ))
            : destinations.map((destination) => (
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <Card
                    key={destination.id}
                    loading={false}
                    data={destination}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export default DestinationsPage;
