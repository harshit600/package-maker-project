import React, { useEffect, useState } from "react";

const themeColor = "bg-blue-200 text-blue-800"; // Uniform color for all theme tags

const Packages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/packages/getpackages"
        );
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-8 p-8 ">
      {packages.map((pkg) => (
        <div
          key={pkg._id}
          className="bg-white cursor-pointer shadow-md rounded-lg w-[330px] overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-gray-200"
        >
          <ImageSlider
            images={pkg.packageImages}
            packageName={pkg.packageName}
          />
          <div className="p-4 pt-0"> {/* Adjusted padding for smaller cards */}
            <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
              {pkg.packageName}
            </h2>
            <div className="flex justify-between mb-3 text-sm text-gray-600">
              <p className="bg-blue-100 text-blue-800 font-semibold rounded px-2 py-1">
                Duration: {pkg.duration}
              </p>
              <p className="text-lg font-bold text-gray-900">₹{pkg.initialAmount}</p>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Pickup: <span className="font-semibold text-gray-800">{pkg.pickupLocation}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {pkg.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center text-xs font-medium"
                >
                  <i className="fa-solid fa-wifi mr-1"></i> {amenity}
                </span>
              ))}
              {pkg.themes.slice(0, 3).map((theme, index) => (
                <span
                  key={index}
                  className={`${themeColor} px-2 py-1 rounded-full flex items-center text-xs font-medium`}
                >
                  <i className="fa-solid fa-palette mr-1"></i> {theme}
                </span>
              ))}
            </div>
           
          </div>
        </div>
      ))}
    </div>
  );
};

const ImageSlider = ({ images, packageName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative">
      {images.length > 0 && (
        <img
          className="w-full h-48 object-cover transition-transform duration-300 rounded-t-lg" // Reduced height
          src={images[currentIndex]}
          alt={packageName}
        />
      )}
      <div className="absolute inset-0 flex justify-between items-center p-2">
        <button
          className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          onClick={prevImage}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          onClick={nextImage}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex justify-center mt-2 relative -top-8">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 mx-1 rounded-full transition duration-200 ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Packages;
