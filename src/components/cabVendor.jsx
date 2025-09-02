import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCar, FaIdCard, FaMapMarkedAlt, FaFilter } from 'react-icons/fa';

const config = {
    API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
  };
  
const CabVendorDetails = () => {
const [cabVendors, setCabVendors] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedState, setSelectedState] = useState('');
const [selectedCabType, setSelectedCabType] = useState('');
const [allStates, setAllStates] = useState([]);
const [allCabTypes, setAllCabTypes] = useState([]);
const [selectedImage, setSelectedImage] = useState(null);

useEffect(() => {
    fetchCabVendors();
}, []);

const fetchCabVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_HOST}/api/cabuser/`);
      const data = await response.json();
      console.log('Raw data:', data); // Debug log
      // Ensure we're setting an array
      const vendors = Array.isArray(data?.data?.users) ? data?.data?.users : Object.values(data?.data?.users);
      setCabVendors(vendors);
      
      // Extract unique states and cab types from all vendors
      const states = new Set();
      const cabTypes = new Set();
      vendors.forEach(vendor => {
        if (vendor.states && Array.isArray(vendor.states)) {
          vendor.states.forEach(state => {
            if (state && state !== 'default') {
              states.add(state);
            }
          });
        }
        if (vendor.vehicles && Array.isArray(vendor.vehicles)) {
          vendor.vehicles.forEach(vehicle => {
            if (vehicle.cabType && vehicle.cabType !== 'default') {
              cabTypes.add(vehicle.cabType);
            }
          });
        }
      });
      setAllStates(Array.from(states).sort());
      setAllCabTypes(Array.from(cabTypes).sort());
    } catch (error) {
      console.error('Error fetching cab vendors:', error);
      setCabVendors([]);
    } finally {
      setLoading(false);
    }
};

// Filter vendors based on selected state and cab type
const filteredVendors = cabVendors.filter(vendor => {
  // Filter by state
  const stateMatch = !selectedState || (
    vendor.states && 
    Array.isArray(vendor.states) && 
    vendor.states.includes(selectedState)
  );
  
  // Filter by cab type
  const cabTypeMatch = !selectedCabType || (
    vendor.vehicles && 
    Array.isArray(vendor.vehicles) && 
    vendor.vehicles.some(vehicle => vehicle.cabType === selectedCabType)
  );
  
  return stateMatch && cabTypeMatch;
});

if (loading) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p>Loading...</p>
    </div>
  );
}

if (!cabVendors.length) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p>No cab vendors found.</p>
    </div>
  );
}

return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Cab Vendor Details</h1>
      
      {/* Filters */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-3">
            <FaFilter className="text-gray-600" />
            <label htmlFor="stateFilter" className="text-gray-700 font-medium">
              State:
            </label>
            <select
              id="stateFilter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {allStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <FaCar className="text-gray-600" />
            <label htmlFor="cabTypeFilter" className="text-gray-700 font-medium">
              Cab Type:
            </label>
            <select
              id="cabTypeFilter"
              value={selectedCabType}
              onChange={(e) => setSelectedCabType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cab Types</option>
              {allCabTypes.map((cabType) => (
                <option key={cabType} value={cabType}>
                  {cabType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-center">
        <p className="text-gray-600">
          {selectedState || selectedCabType 
            ? `Showing ${filteredVendors.length} vendor(s)${
                selectedState ? ` in ${selectedState}` : ''
              }${
                selectedCabType ? ` with ${selectedCabType} vehicles` : ''
              }`
            : `Showing all ${filteredVendors.length} vendor(s)`
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-800">{vendor.name}</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <FaEnvelope className="text-gray-500 w-5 h-5" />
                <span className="ml-3 text-gray-600">{vendor.email}</span>
              </div>

              <div className="flex items-center">
                <FaPhone className="text-gray-500 w-5 h-5" />
                <span className="ml-3 text-gray-600">{vendor.mobile}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <FaIdCard className="text-purple-500 w-5 h-5 flex-shrink-0" />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">License:</span> {vendor.drivingLicense || 'N/A'}
                  </span>
                </div>
                {vendor.drivingLicenseImage && (
                  <img 
                    className="w-16 h-16 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" 
                    src={vendor.drivingLicenseImage} 
                    alt="Driving License"
                    onError={(e) => e.target.style.display = 'none'}
                    onClick={() => setSelectedImage({ src: vendor.drivingLicenseImage, alt: `Driving License for ${vendor.name}` })}
                  />
                )}
              </div>

              {vendor.vehicles && vendor.vehicles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <FaCar className="text-gray-500 w-5 h-5" />
                    <span className="ml-3 font-semibold text-gray-700">Vehicles:</span>
                  </div>
                  <div className="ml-8 space-y-3">
                    {vendor.vehicles.map((vehicle) => (
                      <div key={vehicle._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2">{vehicle.vehicleName}</h4>
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold text-gray-800 mb-2">RC: {vehicle.RC || 'N/A'}</div>
                              <div className="font-semibold text-gray-800 mb-2">Type: {vehicle.cabType || 'N/A'}</div>
                            </div>
                          </div>
                          {vehicle.RCImage && (
                            <img 
                              className="w-16 h-16 object-cover rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity" 
                              src={vehicle.RCImage} 
                              alt={`RC for ${vehicle.vehicleName}`}
                              onError={(e) => e.target.style.display = 'none'}
                              onClick={() => setSelectedImage({ src: vehicle.RCImage, alt: `RC for ${vehicle.vehicleName}` })}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vendor.states && vendor.states.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <FaMapMarkedAlt className="text-gray-500 w-5 h-5" />
                    <span className="ml-3 font-semibold text-gray-700">Operating States:</span>
                  </div>
                  <div className="ml-8 flex flex-wrap gap-2">
                    {vendor.states.map((state, index) => (
                      state !== 'default' && (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                          {state}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CabVendorDetails;
          
                          